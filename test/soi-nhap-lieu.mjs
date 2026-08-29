/* ==================================================================
   SOI CÔNG ĐOẠN NHẬP LIỆU BAN ĐẦU — chạy: npm run soi-nhap
   ------------------------------------------------------------------
   Ba bộ soi cũ mỗi bộ nhìn một mảnh: `npm test` chạy hàm thuần, `npm run
   soi` vẽ màn hình của một trường ĐÃ CÓ 25 lớp, `npm run soi-mau` sinh
   tệp .xlsx rồi đọc lại. Không bộ nào đi hết đường của một trường MỚI
   TINH — đúng đường Tiểu học Quảng Châu 1 đang đi, và cũng đúng chỗ vừa
   lộ ra hai lỗi thật trong một buổi (mã giáo viên slug, tệp mẫu không đọc
   lại được).

   Tệp này dựng một trường TRẮNG rồi đi trọn hai lối khai báo:
     · Phần 1 — gõ tay: bấm thật vào từng hộp thoại của chín mục.
     · Phần 2 — Excel: tải mẫu về, đẩy ngược đúng tệp ấy qua `#tep.onchange`,
       tức là đúng đường người dùng chọn tệp, không gọi tắt hàm nào.

   Cần cài một lần:  npm install --no-save jsdom xlsx exceljs
   ================================================================== */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

let JSDOM, XLSX, ExcelJS;
try {
  ({ JSDOM } = await import('jsdom'));
  XLSX = (await import('xlsx')).default;
  ExcelJS = (await import('exceljs')).default;
} catch (e) {
  console.log('\nThiếu thư viện nên bỏ qua phần soi nhập liệu.');
  console.log('Cài một lần:  npm install --no-save jsdom xlsx exceljs\n');
  process.exit(0);
}

const goc = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(goc, 'src/index.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true,
                              url: 'http://localhost/src/index.html' });
const w = dom.window;
w.fetch = async () => { throw new Error('không có mạng trong phép thử'); };

let dat = 0, hong = 0;
const kt = (ten, dk, ghi = '') => {
  if (dk) { dat++; console.log(`  \x1b[32m✓\x1b[0m ${ten}${ghi ? ' — ' + ghi : ''}`); }
  else { hong++; console.log(`  \x1b[31m✗\x1b[0m ${ten}${ghi ? ' — ' + ghi : ''}`); }
};
const loiChay = [];
w.addEventListener('error', e => loiChay.push(e.message));
w.console.error = (...a) => loiChay.push(a.join(' '));

await new Promise(r => setTimeout(r, 900));      /* chờ khoiDong() chạy xong */

/* Hai thư viện Excel app nạp từ CDN khi cần — trong jsdom không có mạng nên
   gắn thẳng bản trong node_modules (ghim đúng phiên bản app dùng). */
w.XLSX = XLSX;
w.ExcelJS = ExcelJS;
w.eval('sanSangXLSX = async () => true; sanSangExcelJS = async () => true;');

/* Chặn khâu tải tệp xuống, giữ workbook lại trong bộ nhớ để đọc ngược */
let TEP = null;
w.eval('ghiTepXL = async (wb, ten) => { globalThis.__giuTep(wb, ten); };');
w.__giuTep = (wb, ten) => { TEP = { wb, ten }; };

const S = w.eval('S');
const bao = [];                                   /* mọi câu app nói ra */
w.eval('__baoGoc = bao; bao = (chu, loi) => { globalThis.__ghiBao(String(chu), !!loi); };');
w.__ghiBao = (chu, loi) => bao.push({ chu, loi });
const baoCuoi = () => bao[bao.length - 1] || { chu: '', loi: false };
const nut = ten => [...w.document.querySelectorAll('#hopC button')]
  .find(b => b.textContent.trim() === ten);
const bam = ten => { const n = nut(ten); if (!n) throw new Error(`Không có nút "${ten}"`); n.click(); };
const dat$ = (sel, gt) => { const o = w.document.querySelector(sel);
  if (!o) throw new Error(`Không có ô ${sel}`); o.value = gt; return o; };

console.log('\n\x1b[1mSOI CÔNG ĐOẠN NHẬP LIỆU BAN ĐẦU\x1b[0m');

/* ==================================================================
   1. TRƯỜNG TRẮNG — khai bằng tay, từ đầu đến khi xếp được lịch
   ================================================================== */
console.log('\n1. Trường mới tinh, khai bằng tay');

const lamTrang = () => w.eval(`
  S.tenTruong='Trường Tiểu học Thử Nghiệm'; S.namHoc='2026-2027';
  S.diemTruong=[]; S.lop=[]; S.lopDT={}; S.giaoVien=[]; S.phanCong=[];
  S.phong=[]; S.gvNghi={}; S.tkb={}; S.monHoc=dsMonMacDinh(); S.khungGio=[];
  S.lopXem=null; S.gvXem=null; S.dtLuoi=''; 1`);
lamTrang();
kt('Dựng được trạng thái trường trắng', S.lop.length === 0 && S.giaoVien.length === 0
   && S.diemTruong.length === 0);

/* --- Mọi màn hình khai báo phải vẽ được khi CHƯA CÓ GÌ ---
   Trường mới mở app ra là gặp đúng cảnh này; vỡ ở đây thì người dùng
   không còn đường nào đi tiếp. */
for (const t of ['thongtin', 'diemtruong', 'khunggio', 'lop', 'giaovien',
                 'monhoc', 'phancong', 'phonghoc', 'buoiban']) {
  const truoc = loiChay.length;
  let dai = 0, ok = true;
  try { w.chuyen(t); dai = w.document.querySelector('#noiDung').innerHTML.length; }
  catch (e) { ok = false; loiChay.push(t + ': ' + e.message); }
  kt(`Màn hình ${t} vẽ được khi trường chưa có dữ liệu`,
     ok && dai > 200 && loiChay.length === truoc, `${dai} ký tự`);
}

/* --- Phân hiệu --- */
w.chuyen('diemtruong');
w.eval('hopThemDT()');
dat$('#dtTen', 'Phân hiệu Trung tâm');
bam('Thêm');
w.eval('hopThemDT()');
dat$('#dtTen', 'Phân hiệu Bến Thuỷ');
bam('Thêm');
kt('Thêm hai phân hiệu bằng hộp thoại', S.diemTruong.length === 2,
   S.diemTruong.map(d => d.ten).join(' · '));

/* --- Lớp: tạo hàng loạt --- */
w.chuyen('lop');
w.eval('hopSinhLop()');
const tienTo = w.document.querySelector('#slTien').value;
const viDuMa = w.document.querySelector('#slVD').textContent;
dat$('[data-sl="1"]', '2');
dat$('[data-sl="2"]', '2');
bam('Tạo lớp');
kt('Tạo lớp hàng loạt sinh đúng số lớp', S.lop.length === 4,
   S.lop.map(l => l.ten).join(' · '));
const maThat = S.lop[0]?.maLop || '';
kt('Mã lớp đúng dạng đã chốt: tên lớp trước, viết tắt phân hiệu sau',
   /^1A_/.test(maThat), maThat);
kt('Ô xem trước mã lớp nói ĐÚNG mã máy sẽ đặt',
   viDuMa === maThat.replace(/^1A/, '1A'), `xem trước "${viDuMa}" · thật "${maThat}"`);

/* --- Lớp: thêm lẻ một lớp, phải cùng dạng mã --- */
w.eval('hopThemLop()');
dat$('#tlTen', '1C');
bam('Thêm');
const maLe = S.lop.find(l => l.ten === '1C')?.maLop || '';
kt('Thêm lẻ một lớp thì mã cùng dạng với tạo hàng loạt',
   maLe.split(/[-_]/)[0] === '1C' && maLe.includes(tienTo || '1C'),
   `hàng loạt "${maThat}" · lẻ "${maLe}"`);

/* --- Giáo viên --- */
w.chuyen('giaovien');
const themGV = (ten, mail, lop) => {
  w.eval('hopThemGV()');
  dat$('#tgTen', ten);
  if (mail) dat$('#tgMail', mail);
  if (lop) dat$('#tgCN', lop);
  bam('Thêm');
};
themGV('Nguyễn Thị Hương', 'huong.gv@gmail.com', S.lop[0].id);
themGV('Trần Văn Bình', '', S.lop[1].id);
themGV('Lê Thị Hương', 'huong2.gv@gmail.com', '');
kt('Thêm ba giáo viên bằng hộp thoại', S.giaoVien.length === 3,
   S.giaoVien.map(g => g.maGV).join(' · '));
kt('Hai người TRÙNG TÊN GỌI vẫn ra hai mã khác nhau',
   new Set(S.giaoVien.map(g => g.maGV)).size === 3,
   S.giaoVien.filter(g => /Hương/.test(g.hoTen)).map(g => g.maGV).join(' · '));
kt('Chủ nhiệm khai trong hộp Thêm được ghi vào lớp',
   w.eval(`cnCuaLop(${JSON.stringify(S.lop[0].id)})?.hoTen`) === 'Nguyễn Thị Hương');
kt('Gmail khai trong hộp Thêm được giữ lại',
   S.giaoVien[0].email === 'huong.gv@gmail.com', S.giaoVien[0].email);

/* --- Môn học --- */
w.chuyen('monhoc');
const soMon = S.monHoc.length;
w.eval('hopThemMon()');
dat$('#tmTen', 'Tiếng dân tộc');
dat$('[data-tmc="1"]', '2');
bam('Thêm');
kt('Thêm một môn tự chọn vào danh mục', S.monHoc.length === soMon + 1,
   `${soMon} → ${S.monHoc.length} môn`);
kt('Môn mới mang đúng số tiết chuẩn đã khai',
   S.monHoc.find(m => m.ten === 'Tiếng dân tộc')?.chuan[1] === 2);

/* --- Phân công: một lớp, nhiều môn --- */
w.chuyen('phancong');
w.eval('hopThemPC()');
dat$('#pcGV', S.giaoVien[0].id);
dat$('#pcLop', S.lop[0].id);
w.document.querySelectorAll('#pcMon input').forEach((o, i) => { if (i < 4) o.checked = true; });
bam('Thêm');
kt('Một lớp tích bốn môn thì ra bốn dòng phân công',
   S.phanCong.length === 4, `${S.phanCong.length} dòng`);
kt('Số tiết lấy sẵn theo chuẩn CT GDPT 2018, không phải 1 tiết cho tất cả',
   S.phanCong.some(p => p.soTiet > 1),
   S.phanCong.map(p => `${p.mon} ${p.soTiet}`).join(' · '));

/* --- Phân công nhanh: một môn, nhiều lớp --- */
w.eval('hopPCTheoGV()');
dat$('#nqGV', S.giaoVien[2].id);
dat$('#nqMon', 'Mỹ thuật');
w.document.querySelectorAll('[data-nq]').forEach(o => { o.checked = true; });
const nutXong = [...w.document.querySelectorAll('#hopC button')]
  .find(b => /Phân công|Xong|Lưu/.test(b.textContent));
if (nutXong) nutXong.click();
kt('Phân công nhanh gán một môn cho nhiều lớp trong một lần bấm',
   S.phanCong.filter(p => p.mon === 'Mỹ thuật').length >= 4,
   `${S.phanCong.filter(p => p.mon === 'Mỹ thuật').length} lớp`);

/* --- Phòng học --- */
w.chuyen('phonghoc');
w.eval('hopThemPhong()');
dat$('#tpTen', 'Phòng Tin học số 1');
dat$('#tpMon', 'Tin học');
bam('Thêm');
kt('Thêm được phòng chức năng', (S.phong || []).length === 1,
   S.phong?.[0]?.ten);

/* --- Kiểm tra khả thi chạy được trên dữ liệu vừa khai --- */
{
  const truoc = loiChay.length;
  let ok = true;
  try { w.chuyen('kiemtra'); } catch (e) { ok = false; loiChay.push('kiemtra: ' + e.message); }
  kt('Kiểm tra khả thi chạy được trên dữ liệu vừa khai tay',
     ok && loiChay.length === truoc);
}


/* ==================================================================
   2. TRƯỜNG TRẮNG — nhập từ Excel, đúng đường người dùng đi
   ------------------------------------------------------------------
   Tải mẫu của từng mục về, GÕ dữ liệu vào tệp ấy như người dùng vẫn làm,
   rồi đẩy ngược qua `#tep.onchange` — đúng đường chọn tệp, không gọi tắt
   `duLieuTuMuc()`. Khâu đã hỏng sáng 29/8 nằm ở đoạn giữa (đọc trang tính
   ra mảng object) nên phải đi qua đúng đoạn ấy.
   ================================================================== */
console.log('\n2. Trường mới tinh, nhập từ Excel — điền vào mẫu rồi nhập lên');

/* File giả đủ dùng cho onchange: chỉ cần .arrayBuffer() */
const tepGia = buf => ({ name: 'mau.xlsx', arrayBuffer: async () => buf });

/* Gõ mấy dòng vào mẫu vừa tải, theo TÊN CỘT đọc từ chính tệp — không viết
   cứng thứ tự cột, để đổi bố cục mẫu là bộ soi vẫn đúng. */
const dienVaoMau = async (buf, trang, ds) => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  const ws = wb.getWorksheet(trang);
  let dCot = 0, cot = [];
  for (let r = 1; r <= Math.min(8, ws.rowCount); r++) {
    const v = ws.getRow(r).values.slice(1).map(x => String(x ?? '').trim().replace(/\s*\*$/, ''));
    if (v.filter(x => /^[A-Za-z][A-Za-z0-9_]*$/.test(x)).length >= 2) { dCot = r; cot = v; break; }
  }
  if (!dCot) throw new Error(`Không tìm ra dòng tên cột của trang ${trang}`);
  let r = dCot + 1;
  while (r <= ws.rowCount && ws.getRow(r).values.slice(1).some(x => String(x ?? '').trim())) r++;
  ds.forEach(o => {
    const hang = ws.getRow(r++);
    Object.entries(o).forEach(([k, v]) => {
      const i = cot.indexOf(k);
      if (i < 0) throw new Error(`Trang ${trang} không có cột ${k}`);
      hang.getCell(i + 1).value = v;
    });
    hang.commit?.();
  });
  return wb.xlsx.writeBuffer();
};

const taiMau = async ma => {
  w.eval(`S.trangHienTai=${JSON.stringify(ma)}`);
  TEP = null;
  await w.eval(`taiMauMuc(${JSON.stringify(ma)})`);
  if (!TEP) throw new Error('không tải được mẫu ' + ma);
  return TEP.wb.xlsx.writeBuffer();
};

/* Xoá SẠCH một cột khỏi tệp — đúng hình dạng tệp Tiểu học Thần Lĩnh 1 gửi
   lên: cột `Ma_GV` có tên cột nhưng không dòng nào điền. Không tái hiện được
   chuyện đó thì phép thử xanh trong khi app hỏng. */
const xoaCotTrongMau = async (buf, trang, ten) => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  const ws = wb.getWorksheet(trang);
  let dCot = 0, cot = [];
  for (let r = 1; r <= Math.min(8, ws.rowCount); r++) {
    const v = ws.getRow(r).values.slice(1).map(x => String(x ?? '').trim().replace(/\s*\*$/, ''));
    if (v.filter(x => /^[A-Za-z][A-Za-z0-9_]*$/.test(x)).length >= 2) { dCot = r; cot = v; break; }
  }
  const i = cot.indexOf(ten);
  if (i < 0) throw new Error(`Trang ${trang} không có cột ${ten}`);
  for (let r = dCot + 1; r <= ws.rowCount; r++) ws.getRow(r).getCell(i + 1).value = null;
  return wb.xlsx.writeBuffer();
};

/* Đẩy tệp vào đúng ô chọn tệp rồi bấm nút xác nhận của hộp thoại */
const nhapTep = async (ma, buf) => {
  w.eval(`S.trangHienTai=${JSON.stringify(ma)}`);
  bao.length = 0;
  w.eval('dong()');
  await w.document.querySelector('#tep').onchange({ target: { files: [tepGia(buf)], value: '' } });
  const c = baoCuoi();
  const nhan = [...w.document.querySelectorAll('#hopC button')]
    .find(b => /Nhập|Đồng ý|Xác nhận/.test(b.textContent));
  if (nhan) nhan.click();
  return { loi: c.loi, chu: c.chu, daNhan: !!nhan };
};

lamTrang();

/* Dữ liệu người dùng gõ vào từng mẫu — đúng thứ tự phụ thuộc ở CLAUDE.md */
const GO = {
  diemtruong: [{ Ten_phan_hieu: 'Phân hiệu Trung tâm', Co_phong_tin: 'Có' },
               { Ten_phan_hieu: 'Phân hiệu Bến Thuỷ', Co_phong_tin: 'Không' }],
  khunggio: [],                                  /* mẫu ra sẵn đủ 10 buổi */
  lop: [{ Ma_lop: '1A_TT', Ten_lop: '1A', Khoi: 1, Phan_hieu: 'Phân hiệu Trung tâm' },
        { Ma_lop: '1B_TT', Ten_lop: '1B', Khoi: 1, Phan_hieu: 'Phân hiệu Trung tâm' },
        { Ma_lop: '2A_BT', Ten_lop: '2A', Khoi: 2, Phan_hieu: 'Phân hiệu Bến Thuỷ' }],
  giaovien: [{ Ma_GV: 'Hương_NT', Ho_ten: 'Nguyễn Thị Hương',
               Gmail: 'huong.nt@gmail.com', Chu_nhiem: '1A_TT', Dinh_muc: 23 },
             { Ma_GV: 'Bình_TV', Ho_ten: 'Trần Văn Bình', Chu_nhiem: '1B_TT', Dinh_muc: 23 },
             { Ma_GV: 'Hương_LT', Ho_ten: 'Lê Thị Hương', Chu_nhiem: '2A_BT', Dinh_muc: 23 }],
  monhoc: [],                                    /* mẫu ra sẵn 13 môn chuẩn */
  phancong: [{ Ma_GV: 'Hương_NT', Ma_lop: '1A_TT', Mon: 'Toán' },
             { Ma_GV: 'Hương_NT', Ma_lop: '1A_TT', Mon: 'Tiếng Việt' },
             { Ma_GV: 'Bình_TV', Ma_lop: '1B_TT', Mon: 'Toán' },
             { Ma_GV: 'Hương_LT', Ma_lop: '2A_BT', Mon: 'Toán' }],
  phonghoc: [{ Ten_phong: 'Phòng Tin học 1', Mon: 'Tin học', Phan_hieu: 'Phân hiệu Trung tâm' }],
  buoiban: [{ Ma_GV: 'Hương_LT', Thu: 3, Buoi: 'C' }]
};
const THU_TU = ['diemtruong', 'khunggio', 'lop', 'giaovien', 'monhoc',
                'phancong', 'phonghoc', 'buoiban'];

for (const ma of THU_TU) {
  const trang = w.eval(`MUC_NHAP[${JSON.stringify(ma)}].trang`);
  let kq;
  try {
    const goc = await taiMau(ma);
    const buf = GO[ma].length ? await dienVaoMau(goc, trang, GO[ma]) : goc;
    kq = await nhapTep(ma, buf);
  } catch (e) { kq = { loi: true, chu: e.message }; }
  kt(`${trang}: tải mẫu về, gõ dữ liệu vào rồi nhập lên — app nhận`,
     !kq.loi, kq.loi ? kq.chu.slice(0, 110) : (kq.daNhan ? 'đã bấm xác nhận' : 'không có nút xác nhận'));
}

/* Mẫu của trường TRẮNG mang sẵn vài dòng ví dụ, nên tổng = ví dụ + phần gõ
   thêm. Soi theo phần MÌNH GÕ chứ không theo tổng, không thì phép thử đỏ
   mỗi lần đổi dòng ví dụ. */
kt('Nhập trọn tám mẫu thì hai phân hiệu vừa gõ đều vào',
   ['Phân hiệu Trung tâm', 'Phân hiệu Bến Thuỷ']
     .every(t => S.diemTruong.some(d => d.ten === t)),
   S.diemTruong.map(d => d.ten).join(' · '));
kt('Nhập trọn tám mẫu thì ba lớp vừa gõ đều vào',
   ['1A_TT', '1B_TT', '2A_BT'].every(m => S.lop.some(l => l.maLop === m)),
   `${S.lop.length} lớp`);
kt('Nhập trọn tám mẫu thì có đủ giáo viên', S.giaoVien.length === 3,
   `${S.giaoVien.length} giáo viên`);
kt('Nhập trọn tám mẫu thì có bảng phân công', S.phanCong.length === 4,
   `${S.phanCong.length} dòng`);
kt('Chủ nhiệm khai trong tệp Giáo viên gắn đúng vào lớp',
   S.lop.some(l => w.eval(`cnCuaLop(${JSON.stringify(l.id)})?.hoTen`) === 'Nguyễn Thị Hương'));
kt('Lớp về đúng phân hiệu đã khai trong cột Phan_hieu', (() => {
  const lop = S.lop.find(l => l.maLop === '2A_BT');
  const dt = S.diemTruong.find(d => d.ten === 'Phân hiệu Bến Thuỷ');
  return lop && dt && S.lopDT[lop.id] === dt.id;
})(), '2A_BT → Phân hiệu Bến Thuỷ');
kt('Khung giờ nhập từ mẫu có buổi được bật',
   (S.khungGio || []).filter(k => k.bat !== false).length > 0,
   `${(S.khungGio || []).filter(k => k.bat !== false).length} buổi`);
kt('Phòng và buổi bận nhập được',
   (S.phong || []).length === 1 && Object.keys(S.gvNghi || {}).length > 0,
   `${(S.phong || []).length} phòng · ${Object.keys(S.gvNghi || {}).length} người có buổi bận`);

/* --- Nhập LẠI đúng tệp ấy lần thứ hai: THÊM và CẬP NHẬT, không nhân đôi --- */
{
  const truoc = { lop: S.lop.length, gv: S.giaoVien.length, pc: S.phanCong.length };
  for (const ma of THU_TU) {
    const trang = w.eval(`MUC_NHAP[${JSON.stringify(ma)}].trang`);
    try {
      const goc = await taiMau(ma);
      const buf = GO[ma].length ? await dienVaoMau(goc, trang, GO[ma]) : goc;
      await nhapTep(ma, buf);
    } catch (e) { loiChay.push('nhập lại ' + ma + ': ' + e.message); }
  }
  kt('Nhập lại lần hai KHÔNG nhân đôi lớp', S.lop.length === truoc.lop,
     `${truoc.lop} → ${S.lop.length}`);
  kt('Nhập lại lần hai KHÔNG nhân đôi giáo viên', S.giaoVien.length === truoc.gv,
     `${truoc.gv} → ${S.giaoVien.length}`);
  kt('Nhập lại lần hai KHÔNG nhân đôi phân công', S.phanCong.length === truoc.pc,
     `${truoc.pc} → ${S.phanCong.length}`);
}

/* --- Tệp lạ thì báo cho ra hồn, đừng đổ tại người dùng --- */
{
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('LINH_TINH');
  ws.addRow(['Cột một', 'Cột hai']); ws.addRow(['a', 'b']);
  const buf = await wb.xlsx.writeBuffer();
  const kq = await nhapTep('giaovien', buf);
  kt('Tệp không đúng mục thì báo rõ cần trang tính tên gì',
     kq.loi && /GIAO_VIEN/.test(kq.chu), kq.chu.slice(0, 90));
}

/* --- Mẫu tải về mà CHƯA ĐIỀN gì thì nói đúng chuyện ấy --- */
{
  w.eval('S.phong=[]');
  const buf = await taiMau('phonghoc');
  const kq = await nhapTep('phonghoc', buf);
  kt('Mẫu tải về chưa điền dòng nào thì nói đúng chuyện ấy, không đổ tại tệp',
     kq.loi && /chưa có dòng nào/.test(kq.chu), kq.chu.slice(0, 90));
}

/* --- Gõ sai thì phải chặn, và câu lỗi phải chỉ đúng chỗ --- */
{
  const goc = await taiMau('lop');
  const buf = await dienVaoMau(goc, 'LOP',
    [{ Ma_lop: '9Z_TT', Ten_lop: '9Z', Khoi: 9, Phan_hieu: 'Phân hiệu Trung tâm' }]);
  const truoc = S.lop.length;
  await nhapTep('lop', buf);
  kt('Khối ngoài 1–5 thì BỊ CHẶN, không lọt vào dữ liệu',
     S.lop.length === truoc, `${truoc} → ${S.lop.length} lớp`);
  const hopLoi = w.document.querySelector('#hopN')?.textContent || '';
  kt('Câu lỗi nói rõ giá trị gõ sai và đúng dòng Excel',
     /9/.test(hopLoi) && /dòng/.test(hopLoi),
     (hopLoi.match(/[^.]*dòng[^.]*/) || [''])[0].trim().slice(0, 100));
  w.eval('dong()');
}
/* --- Tiểu học Thần Lĩnh 1 (29/8/2026): cột Ma_GV để TRỐNG cả cột ---------
   Nhà trường gõ danh sách 24 thầy cô vào đúng mẫu, bỏ trống cột mã vì mã là
   thứ máy tự đặt. App báo "Tệp này không có trang tính nào máy đọc được" —
   trang đúng tên, chín cột đúng, chỉ vì phép nhận diện dò theo DỮ LIỆU đã
   điền mà cột khoá thì trống. */
{
  const goc = await taiMau('giaovien');
  const buf = await xoaCotTrongMau(
    await dienVaoMau(goc, 'GIAO_VIEN',
      [{ Ho_ten: 'Thái Thị Mai Lan', Gmail: 'mailan@gmail.com', Chu_nhiem: '1A_TT' },
       { Ho_ten: 'Phạm Thị Trầm',    Gmail: 'tram@gmail.com' }]),
    'GIAO_VIEN', 'Ma_GV');
  const truoc = S.giaoVien.length;
  const kq = await nhapTep('giaovien', buf);
  kt('Cột Ma_GV trống cả cột vẫn NHẬN ĐÚNG trang, không đổ tại tệp',
     !/không có trang tính nào/.test(kq.chu || ''), (kq.chu || '').slice(0, 80));
  kt('Máy tự đặt mã từ họ tên, đúng dạng tên gọi đứng trước',
     S.giaoVien.length === truoc + 2 &&
     !!S.giaoVien.find(g => g.hoTen === 'Thái Thị Mai Lan' && g.maGV === 'Lan_TTM'),
     S.giaoVien.slice(-2).map(g => g.maGV).join(' · '));
  kt('Chủ nhiệm và Gmail vẫn vào đúng chỗ',
     S.giaoVien.find(g => g.hoTen === 'Thái Thị Mai Lan')?.email === 'mailan@gmail.com' &&
     !!S.giaoVien.find(g => g.hoTen === 'Thái Thị Mai Lan')?.cn);

  /* ⚠️ Nhập LẠI đúng tệp ấy không được đẻ thêm lứa mới — đúng sự cố 105 hồ sơ
     ngày 2/8, nay tái hiện được qua đường mã tự đặt. */
  const truoc2 = S.giaoVien.length;
  await nhapTep('giaovien', buf);
  kt('Nhập lại chính tệp ấy KHÔNG nhân đôi — dò người cũ theo họ tên đủ',
     S.giaoVien.length === truoc2, `${truoc2} → ${S.giaoVien.length} giáo viên`);
}

/* --- Gõ nhầm hậu tố mã lớp: chỉ đúng chỗ, đừng bảo đi tạo lớp mới ------
   Thần Lĩnh gõ `1A_CN` trong khi mã thật là `1A_ND` — 21 dòng cùng một lỗi,
   mà câu cũ khuyên "vào mục Lớp học thêm lớp này trước", tức đẩy người dùng
   đi tạo thêm 15 lớp trùng. */
{
  const buf = await dienVaoMau(await taiMau('giaovien'), 'GIAO_VIEN',
    [{ Ho_ten: 'Cô Gõ Nhầm', Chu_nhiem: '1A_CN' }]);
  await nhapTep('giaovien', buf);
  const chu = w.document.querySelector('#hopN')?.textContent || '';
  kt('Mã lớp sai hậu tố thì GỢI Ý mã đúng, không xui đi tạo lớp mới',
     /1A_TT/.test(chu) && !/thêm lớp này trước/.test(chu),
     (chu.match(/chưa khai lớp[^.]*/) || [''])[0].slice(0, 100));
  w.eval('dong()');

  /* Tên lớp trần cũng phải nhận — nhà trường quen gọi "1A" hơn là "1A_TT" */
  const buf2 = await dienVaoMau(await taiMau('giaovien'), 'GIAO_VIEN',
    [{ Ho_ten: 'Cô Tên Lớp', Chu_nhiem: '1A' }]);
  await nhapTep('giaovien', buf2);
  kt('Ghi TÊN LỚP thay cho mã cũng nhận, khi tên ấy chỉ một lớp mang',
     !!S.giaoVien.find(g => g.hoTen === 'Cô Tên Lớp')?.cn);
}


console.log('\n3. Không có lỗi chạy nào trong suốt hai lối khai báo');
kt('Không lỗi JavaScript nào', loiChay.length === 0,
   loiChay.slice(0, 3).join(' | ') || 'sạch');

console.log(`\n\x1b[1mKết quả soi nhập liệu: ${dat} đạt, ${hong} hỏng\x1b[0m\n`);
process.exit(hong ? 1 : 0);
