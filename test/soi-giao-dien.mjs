/* ==================================================================
   SOI GIAO DIỆN THẬT — chạy: npm run soi
   ------------------------------------------------------------------
   `npm test` cắt bốn vùng mã thuần ra chạy trong Node, nên không nhìn
   thấy màn hình. Phép thử này mở nguyên src/index.html trong một trình
   duyệt giả (jsdom), vẽ từng màn hình rồi bấm thật vào các nút — đúng
   thứ đã bắt được lỗi tiết chào cờ đè lên buổi giáo viên báo bận.

   Cần cài một lần:  npm install --no-save jsdom
   Chưa cài thì phép thử tự bỏ qua, `npm test` vẫn chạy độc lập như cũ.
   ================================================================== */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

let JSDOM;
try { ({ JSDOM } = await import('jsdom')); }
catch (e) {
  console.log('\nChưa có jsdom nên bỏ qua phần soi giao diện.');
  console.log('Muốn chạy thì cài một lần:  npm install --no-save jsdom\n');
  process.exit(0);
}

const goc = join(dirname(fileURLToPath(import.meta.url)), '..');
const duong = join(goc, 'src/index.html');
const html = readFileSync(duong, 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true,
                              url: 'http://localhost/src/index.html' });
const w = dom.window;
w.fetch = async () => { throw new Error('không có mạng trong phép thử'); };

let dat = 0, hong = 0;
const kt = (ten, dk, ghi = '') => {
  if (dk) { dat++; console.log(`  \x1b[32m✓\x1b[0m ${ten}${ghi ? ' — ' + ghi : ''}`); }
  else { hong++; console.log(`  \x1b[31m✗\x1b[0m ${ten}${ghi ? ' — ' + ghi : ''}`); }
};

/* Bắt mọi lỗi chạy để không bỏ sót lỗi thầm lặng */
const loiChay = [];
w.addEventListener('error', e => loiChay.push(e.message));
w.console.error = (...a) => loiChay.push(a.join(' '));

await new Promise(r => setTimeout(r, 900));      /* chờ khoiDong() chạy xong */

/* `let S` không nằm trên window — lấy qua eval trong chính khung trang */
const S = w.eval('S');
const coLui = () => w.eval('coLui()');
const gvTen = id => w.eval(`gvId(${JSON.stringify(id)})?.hoTen`) || id;
console.log('\n\x1b[1mSOI GIAO DIỆN THẬT (jsdom)\x1b[0m\n');
console.log('1. Vẽ được mọi màn hình');

const TRANG = ['dieuhanh',
               /* Bước 1 — khai báo */
               'thongtin','diemtruong','khunggio','lop','giaovien','monhoc','phonghoc',
               'phancong','buoiban',
               /* Bước 2 — xếp */
               'kiemtra','xep',
               /* Bước 3 — sản phẩm */
               'toantruong','tkbkhoi','tkblop','tkbgv','cuatoi','xuatin',
               'huongdan'];
for (const t of TRANG) {
  const truoc = loiChay.length;
  let ok = true, dai = 0;
  try { w.chuyen(t); dai = w.document.querySelector('#noiDung').innerHTML.length; }
  catch (e) { ok = false; loiChay.push(t + ': ' + e.message); }
  kt(`Màn hình ${t}`, ok && dai > 200 && loiChay.length === truoc, `${dai} ký tự`);
}

console.log('\n2. Chạm chọn — chạm đặt (lối dùng trên điện thoại)');
w.chuyen('tkblop');
const lop = S.lopXem;
/* Chọn tiết của giáo viên BỘ MÔN: chủ nhiệm dạy gần hết lớp mình nên đổi đi
   đâu cũng hợp lệ, không lộ ra ô nào bị chặn. */
const maCN = w.eval(`cnCuaLop(${JSON.stringify(lop)})?.id`);
const oCo = Object.keys(S.tkb[lop]).filter(k => !S.tkb[lop][k].ghim);
const nguon = oCo.find(k => k !== '2-S-0' && S.tkb[lop][k].gvId !== maCN) || oCo[1];
const monNguon = S.tkb[lop][nguon].mon;

/* Chạm ô có tiết: phải sáng lên và lưới phải vẽ lại kèm gợi ý ô đặt được */
w.document.querySelector(`[data-cham="${nguon}"]`).dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Chạm một tiết thì nó được chọn', S.oChon === nguon, `ô ${nguon} · ${monNguon}`);
kt('Ô đang chọn hiện rõ trên lưới',
   !!w.document.querySelector('.o-tiet.chon'));
const soHop = w.document.querySelectorAll('.o-hop').length;
const soCam = w.document.querySelectorAll('.o-cam').length;
kt('Máy soi trước chỗ đặt được và chỗ vướng', soHop > 0 && soCam > 0,
   `${soHop} ô xanh · ${soCam} ô mờ`);

/* Chạm ô xanh: tiết phải chuyển sang đó và được ghim */
const oXanh = [...w.document.querySelectorAll('.o-hop')][0].dataset.cham;
const daCoO = !!S.tkb[lop][oXanh];
w.document.querySelector(`[data-cham="${oXanh}"]`).dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Chạm ô xanh thì tiết chuyển sang đó',
   S.tkb[lop][oXanh]?.mon === monNguon, `${nguon} → ${oXanh}`);
kt('Tiết vừa chỉnh tay được ghim ngay', S.tkb[lop][oXanh]?.ghim === true);
kt('Ô nguồn xử lý đúng: trống đi hoặc nhận tiết đổi về',
   daCoO ? !!S.tkb[lop][nguon] : !S.tkb[lop][nguon]);
kt('Chọn xong thì bỏ chọn, không kẹt trạng thái', S.oChon === null);

console.log('\n3. Hoàn tác');
const truocHoan = JSON.stringify(S.tkb[lop]);
w.hoanTac();
kt('Hoàn tác trả lưới về đúng như trước khi chuyển',
   JSON.stringify(S.tkb[lop]) !== truocHoan &&
   S.tkb[lop][nguon]?.mon === monNguon);
kt('Hết bước lui thì báo, không văng lỗi', (() => {
  try { while (coLui()) w.hoanTac(); w.hoanTac(); return true; } catch (e) { return false; }
})());

console.log('\n4. Ghim giữ được chỉnh tay qua lần xếp lại');
w.chuyen('tkblop');
const k1 = Object.keys(S.tkb[lop])[3];
S.tkb[lop][k1].ghim = true;
const monGhim = S.tkb[lop][k1].mon, gvGhim = S.tkb[lop][k1].gvId;
w.eval('KQ_XEP = xepTuDong(0)');
kt('Xếp lại vẫn giữ nguyên tiết đã ghim',
   S.tkb[lop][k1]?.mon === monGhim && S.tkb[lop][k1]?.gvId === gvGhim,
   `${monGhim} đứng yên ở ${k1}`);
w.ve();
kt('Lưới hiện dấu ghim cho người dùng thấy',
   w.document.querySelectorAll('[data-boghim]').length > 0);

/* Bấm vào dấu ghim để bỏ ghim */
w.document.querySelector(`[data-boghim="${k1}"]`)?.dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Bấm dấu ghim là bỏ ghim tiết đó', !S.tkb[lop][k1]?.ghim);

console.log('\n5. Buổi bận');
w.chuyen('buoiban');
const oBan = w.document.querySelector('[data-ban]');
const [maGV, kb] = oBan.dataset.ban.split('|');
oBan.checked = true;
oBan.dispatchEvent(new w.Event('change', { bubbles: true }));
kt('Đánh dấu một buổi bận thì ghi vào dữ liệu', (S.gvNghi[maGV] || []).includes(kb),
   `${gvTen(maGV)} bận ${kb}`);
kt('Badge trên thanh bên đếm đúng số buổi bận',
   w.document.querySelector('#nBan').textContent === '1');

/* Xếp lại: không tiết nào được rơi vào buổi đã báo bận */
w.xepTuDong(0);
const lot = Object.entries(S.tkb).flatMap(([lp, o]) =>
  Object.entries(o).filter(([k, t]) => t.gvId === maGV && k.startsWith(kb + '-')));
kt('Xếp tự động tránh hẳn buổi đã báo bận', lot.length === 0, `${lot.length} tiết lọt`);

const oBan2 = w.document.querySelector(`[data-ban="${maGV}|${kb}"]`);
if (oBan2) { oBan2.checked = false; oBan2.dispatchEvent(new w.Event('change', { bubbles: true })); }
kt('Bỏ đánh dấu cũng nhận ngay', !(S.gvNghi[maGV] || []).includes(kb));

console.log('\n6. Thanh tiến trình ba bước');
w.chuyen('dieuhanh');
/* Ba thẻ bước chỉ bày khi CÒN VIỆC PHẢI LÀM. Xếp xong rồi mà vẫn hiện
   "Xong · Xong · Xong" thì chỉ đẩy nội dung thật xuống dưới. */
kt('Chưa xếp gì thì Bảng điều hành bày đủ ba bước hướng dẫn', (() => {
  const luu = JSON.parse(JSON.stringify(S.tkb));
  w.eval('S.lop.forEach(l=>S.tkb[l.id]={}); KQ_XEP=null; ve()');
  const co = w.document.querySelectorAll('.bbuoc .bb').length === 3;
  w.eval(`S.tkb = ${JSON.stringify(luu)}; ve()`);
  return co;
})());
/* Từ 16/8/2026 lưới mở sẵn có thể là lưới RỘNG toàn trường (`table.tt`) hoặc
   lưới TUẦN của một lớp (`table.tkb`), tuỳ quy mô trường — xem `xemMacDinh()`.
   Các phép thử về thứ tự khối trên trang vì thế nhận cả hai. */
const coLuoiTKB = () => !!w.document.querySelector('#noiDung .tt, #noiDung table.tkb');
const viTriLuoi = html => {
  const v = [html.indexOf('class="tt'), html.indexOf('class="tkb"')].filter(i => i >= 0);
  return v.length ? Math.min(...v) : -1;
};
kt('Xếp xong rồi thì thôi bày ba thẻ "Xong", nhường chỗ cho thời khóa biểu',
   w.document.querySelectorAll('.bbuoc .bb').length === 0 && coLuoiTKB());
kt('Mỗi màn hình khai báo có dải điều hướng, ghi tên NHÓM chứ không phải "Bước N"', (() => {
  w.chuyen('lop');
  const d = w.document.querySelector('.dhb');
  /* Từ 3/8/2026 màn hình và thanh menu dùng CHUNG một bộ tên. Chữ "Bước 1"
     là bộ đánh số thứ hai song song, đã bỏ hẳn. */
  return !!d && /Dữ liệu nhà trường/.test(d.textContent)
    && !/Bước/.test(d.textContent) && !/Việc \d+ trong/.test(d.textContent);
})());
kt('Không còn chữ "Bước N" nào lọt ra màn hình, ở bất kỳ trang nào', ...((() => {
  const bay = [];
  for (const t of ['dieuhanh','thongtin','lop','giaovien','phancong','kiemtra',
                   'xep','toantruong','tkblop','xuatin','huongdan','daythay']) {
    w.chuyen(t);
    const m = w.document.querySelector('#noiDung').textContent.match(/Bước\s*\d/);
    if (m) bay.push(`${t}: ${m[0]}`);
  }
  w.chuyen('dieuhanh');
  return [bay.length === 0, bay.join(' · ') || 'sạch cả 12 màn hình'];
})()));
kt('Nút “tiếp theo” đi đúng màn hình kế trong chuỗi', (() => {
  w.chuyen('lop');
  const nut = [...w.document.querySelectorAll('.dhb [data-di]')].find(b => /Giáo viên/.test(b.textContent));
  if (!nut) return false;
  nut.dispatchEvent(new w.Event('click', { bubbles: true }));
  return S.trangHienTai === 'giaovien';
})());

console.log('\n7. Khai báo lớp học từ giao diện');
/* Dựng thêm một điểm trường để thử đúng tình huống sau sáp nhập: điểm mới
   cũng có lớp mang tên "1A", và phần mềm phải phân biệt được bằng mã lớp. */
S.diemTruong.push({ id: 'dtThu', ten: 'Điểm trường Thử', phongTin: false });
w.chuyen('lop');
const soLopTruoc = S.lop.length;
w.hopSinhLop();
w.document.querySelector('#slDT').value = 'dtThu';
w.document.querySelector('[data-sl="1"]').value = '3';
w.document.querySelector('#slTien').value = 'THU';
/* Bấm đúng nút “Tạo lớp” trong hộp thoại */
[...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Tạo lớp').click();
const moi = S.lop.filter(l => (l.maLop || '').endsWith('_THU'));
kt('Tạo lớp hàng loạt sinh đúng số lớp và đúng tên',
   moi.length === 3 && moi.map(l => l.ten).join(',') === '1A,1B,1C',
   `${soLopTruoc} → ${S.lop.length} lớp`);
kt('Lớp trùng tên ở điểm trường khác vẫn tạo được, phân biệt bằng mã',
   S.lop.filter(l => l.ten === '1A').length === 2 &&
   moi[0].maLop === '1A_THU', `hai lớp "1A": ${S.lop.filter(l => l.ten === '1A').map(l => l.maLop || l.id).join(' · ')}`);
kt('Tạo lại lần nữa không sinh trùng trong cùng điểm trường', (() => {
  w.hopSinhLop();
  w.document.querySelector('#slDT').value = 'dtThu';
  w.document.querySelector('[data-sl="1"]').value = '3';
  w.document.querySelector('#slTien').value = 'THU';
  [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Tạo lớp').click();
  return S.lop.filter(l => (l.maLop || '').endsWith('_THU')).length === 3;
})());
kt('Mỗi lớp mới có mã riêng, không lớp nào trùng mã',
   new Set(S.lop.map(l => l.maLop || l.id)).size === S.lop.length);
kt('Lớp mới được gán điểm trường và có ô lưới riêng',
   moi.every(l => !!S.lopDT[l.id] && !!S.tkb[l.id]));

/* Đặt chủ nhiệm cho lớp mới, rồi kiểm tra không ai chủ nhiệm hai lớp */
const gvThu = S.giaoVien[0].id, lopThu = moi[0].id;
w.datCN(lopThu, gvThu);
kt('Đặt chủ nhiệm thì gỡ luôn lớp chủ nhiệm cũ của người đó',
   S.giaoVien.filter(g => g.cn === gvThu).length === 0 &&
   S.giaoVien.filter(g => g.cn).length === new Set(S.giaoVien.filter(g => g.cn).map(g => g.cn)).size,
   `${gvTen(gvThu)} → ${w.eval(`lopId(${JSON.stringify(lopThu)})?.ten`)}`);

/* Xoá lớp vừa tạo: phải sạch cả phân công lẫn con trỏ chủ nhiệm */
w.hopXoaLop(lopThu);
[...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Xoá lớp').click();
kt('Xoá lớp thì gỡ sạch phân công, lưới và con trỏ chủ nhiệm',
   !S.lop.some(l => l.id === lopThu) && !S.phanCong.some(p => p.lopId === lopThu) &&
   !S.tkb[lopThu] && !S.giaoVien.some(g => g.cn === lopThu));

/* Dọn sạch điểm trường thử để các phép thử sau chạy trên đúng dữ liệu vàng */
S.lop.filter(l => S.lopDT[l.id] === 'dtThu').forEach(l => {
  S.lop = S.lop.filter(x => x.id !== l.id);
  delete S.lopDT[l.id]; delete S.tkb[l.id];
});
S.diemTruong = S.diemTruong.filter(d => d.id !== 'dtThu');
kt('Dọn xong thì trở lại đúng 25 lớp của bộ kiểm thử vàng',
   S.lop.length === soLopTruoc, `${S.lop.length} lớp`);

console.log('\n8. Thêm và xoá dòng phân công');
w.chuyen('phancong');
const pcTruoc = S.phanCong.length;
w.hopThemPC();
const lopPC = w.document.querySelector('#pcLop').value;
const monPC = w.document.querySelector('#pcMon').value;
w.document.querySelector('#pcTiet').value = '2';
[...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Thêm').click();
kt('Thêm được một dòng phân công ngay trong app',
   S.phanCong.length === pcTruoc + 1, `${pcTruoc} → ${S.phanCong.length} dòng`);
const iMoi = S.phanCong.findIndex(p => p.lopId === lopPC && p.mon === monPC && p.soTiet === 2);
kt('Dòng mới ghi đúng lớp, môn và số tiết', iMoi >= 0);
w.document.querySelector(`[data-xoapc="${iMoi}"]`)?.dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Xoá dòng phân công ngay trên bảng', S.phanCong.length === pcTruoc);

console.log('\n9. Danh mục môn học và phòng chức năng');
w.chuyen('monhoc');
kt('Danh mục môn hiện đủ số dòng', S.monHoc.length > 0 &&
   w.document.querySelectorAll('[data-monten]').length === S.monHoc.length,
   `${S.monHoc.length} môn`);
const iTin = S.monHoc.findIndex(m => m.ten === 'Tin học');
kt('Môn Tin học được đánh dấu cần phòng chức năng',
   iTin >= 0 && S.monHoc[iTin].phong === 'Tin học');
/* Đổi số tiết chuẩn của một môn rồi kiểm tra máy đọc lại đúng */
const oChuan = w.document.querySelector('[data-monchuan="0|1"]');
oChuan.value = '9';
oChuan.dispatchEvent(new w.Event('change', { bubbles: true }));
kt('Sửa số tiết chuẩn ghi thẳng vào danh mục',
   w.eval(`chuanMon(${JSON.stringify(S.monHoc[0].ten)},1)`) === 9,
   `${S.monHoc[0].ten} khối 1 → 9 tiết`);

w.chuyen('phonghoc');
w.document.querySelector('#btPhongTuDT')?.dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Tạo phòng Tin học từ các điểm trường có sẵn', S.phong.length > 0,
   `${S.phong.length} phòng`);
kt('Máy nhận ra điểm trường nào có phòng Tin học',
   S.phong.every(p => w.eval(`coPhong(${JSON.stringify(p.dtId)},'Tin học')`)));

console.log('\n10. Sản phẩm toàn trường và theo khối');
w.eval('KQ_XEP = xepTuDong(0)');
w.chuyen('toantruong');
const cotTT = w.document.querySelectorAll('.tt thead tr:last-child th').length - 2;
kt('Bảng toàn trường đủ một cột cho mỗi lớp',
   cotTT === w.eval('lopTrongPV().length'), `${cotTT} cột lớp`);
kt('Bảng toàn trường có ô tiết thật, không rỗng',
   w.document.querySelectorAll('.tt tbody td b').length > 100,
   `${w.document.querySelectorAll('.tt tbody td b').length} ô có tiết`);
w.chuyen('tkbkhoi');
kt('Màn hình theo khối tự chọn sẵn một khối', S.khoiXem != null, `khối ${S.khoiXem}`);
const cotK = w.document.querySelectorAll('.tt thead tr:last-child th').length - 2;
kt('Bảng theo khối chỉ hiện lớp của khối đó',
   cotK === w.eval(`lopTheoKhoi(${S.khoiXem}).length`), `${cotK} lớp`);
kt('Bản in toàn trường dựng được và dùng khổ rộng', (() => {
  const h = w.trangInToanTruong();
  return h.includes('tr-in rong') && h.includes('in-r');
})());
kt('Bản in theo khối dựng đủ mọi khối', (() => {
  const h = w.trangInKhoi(null);
  return w.eval('khoiDangCo()').every(k => h.includes('khối ' + k));
})());

console.log('\n11. Thanh bên mới không làm khó giáo viên');
const vaiCu = { ...S.nguoiDung };
S.nguoiDung = { vaiTro: 'gv', gvId: S.giaoVien[0].id, diemTruongId: null };
w.chuyen('lop');                                   /* gõ tay vào màn hình khai báo */
kt('Giáo viên bị đẩy về lịch cá nhân, không lạc vào màn hình khai báo',
   S.trangHienTai === 'cuatoi');
const hien = [...w.document.querySelectorAll('.mi')].filter(m => m.style.display !== 'none');
/* Từ 2/8/2026 là NĂM mục: thêm Báo nghỉ và Thông báo. Hai việc này là
   của chính thầy cô — giấu đi thì tính năng báo nghỉ thành vô dụng. */
kt('Thanh bên chỉ còn năm mục dành cho giáo viên',
   hien.length === 5, hien.map(m => m.dataset.t).join(' · '));
kt('Trong đó có đủ Báo nghỉ và Thông báo — hai việc của chính thầy cô', (() => {
  const t = hien.map(m => m.dataset.t);
  return t.includes('baonghi') && t.includes('thongbao') && t.includes('cuatoi');
})());
kt('Nhưng tuyệt đối không thấy mục nào của người xếp lịch', (() => {
  const t = hien.map(m => m.dataset.t);
  return !['xep','phancong','daythay','giaovien','nguoidung','saoluu'].some(x => t.includes(x));
})());
kt('Nhãn nhóm đổi theo vai: giáo viên không "điều hành" gì cả', (() => {
  const nh = [...w.document.querySelectorAll('.nhom')]
    .find(b => b.dataset.monh === 'dh');
  return /CỦA TÔI/.test(nh.textContent);
})());
kt('Không bày dải điều hướng bước cho giáo viên',
   !w.document.querySelector('.dhb'));
S.nguoiDung = vaiCu;
w.chuyen('dieuhanh');
kt('Trở lại vai trò quản lý thì thanh bên đủ mục',
   [...w.document.querySelectorAll('.mi')].filter(m => m.style.display !== 'none').length > 15);

console.log('\n12. Thanh bên gọn lại, ba nút cũ chuyển đi đúng chỗ');
w.chuyen('dieuhanh');
kt('Đáy thanh bên chỉ còn thẻ tài khoản, không còn nút nào',
   w.document.querySelectorAll('#duoiTB .nut-duoi').length === 0 &&
   !!w.document.querySelector('#duoiTB .tk'));
kt('Chấm báo tình trạng máy chủ nằm ngay trên thẻ tài khoản',
   !!w.document.querySelector('#duoiTB #chamMC'));

/* Nhập Excel: chỉ bày ở màn hình mà tệp Excel thực sự có dữ liệu */
const coNhap = t => { w.chuyen(t); return !!w.document.querySelector('#btNhapExcel'); };
kt('Nút Nhập từ Excel có mặt ở Lớp học · Giáo viên · Phân công · Điểm trường',
   ['lop', 'giaovien', 'phancong', 'diemtruong'].every(coNhap));
kt('Không bày nút đó ở Môn học và Phòng học — tệp Excel không chứa hai thứ này',
   !coNhap('monhoc') && !coNhap('phonghoc'));

w.chuyen('thongtin');
kt('Chỉ có ĐÚNG MỘT nút đăng nhập trong cả trang', (() => {
  /* Từng có hai: một ở thanh trên cùng, một trong thẻ Công cụ quản trị.
     Thanh trên cùng thắng vì nó theo người dùng qua mọi màn hình. */
  const trong = [...w.document.querySelectorAll('#noiDung button')]
    .filter(b => /Đăng nhập|Đăng xuất/.test(b.textContent));
  return trong.length === 0 && !!w.document.querySelector('#btDangNhapTren');
})());
kt('Thông tin nơi lưu dữ liệu vẫn còn, chỉ bỏ nút trùng',
   /Nơi lưu dữ liệu/.test(w.document.querySelector('#noiDung').textContent));
kt('Không còn lối "đổi vai trò xem thử" ở bất cứ đâu — đăng nhập vai nào là vai đó',
   !w.document.querySelector('#btVaiTroTT') && typeof w.hopVaiTro === 'undefined');
kt('Nút lưu chỉ ghi "Lưu", không bắt người dùng nghĩ về máy chủ', (() => {
  w.chuyen('lop');
  const b = w.document.querySelector('#btLuuNguon');
  return !!b && b.textContent.trim() === 'Lưu';
})());

console.log('\n13. Tạo dữ liệu thử cho một điểm trường');
w.chuyen('diemtruong');
kt('Màn hình Điểm trường có nút Tạo dữ liệu thử', !!w.document.querySelector('#btTaoThu'));
const truocDT = { dt: S.diemTruong.length, lop: S.lop.length, gv: S.giaoVien.length };
w.document.querySelector('#btTaoThu').dispatchEvent(new w.Event('click', { bubbles: true }));
w.document.querySelector('#ttTenDiem').value = 'Điểm trường Diễn Đồng';
w.document.querySelector('#ttTien').value = 'DD';
w.document.querySelector('#ttSoLop').value = '17';
[...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Tạo').click();
kt('Tạo xong có thêm một điểm trường với đủ 17 lớp',
   S.diemTruong.length === truocDT.dt + 1 && S.lop.length === truocDT.lop + 17,
   `${truocDT.lop} → ${S.lop.length} lớp`);
kt('Sinh kèm giáo viên, không để lớp nào trống chủ nhiệm', (() => {
  const moi = S.lop.filter(l => (l.maLop || '').endsWith('_DD'));
  return S.giaoVien.length > truocDT.gv && moi.every(l => S.giaoVien.some(g => g.cn === l.id));
})(), `${truocDT.gv} → ${S.giaoVien.length} giáo viên`);
/* Điểm trường mới tạo KHÔNG tích ô "có phòng Tin học", mà mục 9 ở trên đã khai
   bảng phòng — nên ràng buộc cứng số 4 bật, và mọi tiết Tin học của Diễn Đồng
   phải bị chặn lại chứ không được xếp bừa vào phòng ở điểm trường khác. */
const soLopTin = S.lop.filter(l => (l.maLop || '').endsWith('_DD') && l.khoi >= 3).length;
const r13 = w.eval('KQ_XEP = xepTuDong()');
const tinChuaXep = r13.chuaXep.filter(x => x.mon === 'Tin học').reduce((s, x) => s + x.con, 0);
kt('Điểm trường chưa có phòng máy thì tiết Tin học bị chặn, không xếp bừa',
   tinChuaXep === soLopTin && r13.tongCan - r13.daXep === tinChuaXep,
   `${r13.daXep}/${r13.tongCan} tiết — đúng ${tinChuaXep} tiết Tin học của ${soLopTin} lớp bị giữ lại`);
kt('Quy tắc R10 nói rõ điểm trường nào đang thiếu phòng',
   w.eval('kiemTra()').vm.some(v => v.ma === 'R10' && /Diễn Đồng/.test(v.t)));

/* Khai thêm một phòng máy cho nơi đó thì phải xếp trọn ngay */
kt('Khai thêm phòng Tin học cho điểm trường đó là xếp trọn vẹn', (() => {
  const dtDD = S.diemTruong.find(d => d.ten === 'Điểm trường Diễn Đồng');
  S.phong.push({ id: 'p_dd', ten: 'Phòng Tin học · Diễn Đồng', dtId: dtDD.id, mon: 'Tin học' });
  const r = w.eval('KQ_XEP = xepTuDong()');
  return r.daXep === r.tongCan && r.chuaXep.length === 0;
})(), (() => { const r = w.eval('KQ_XEP'); return `${r.daXep}/${r.tongCan} tiết · ${r.giay} giây`; })());
/* Nhiều điểm trường thì lưới KHÔNG gộp hết vào một bảng — 60 cột đọc không
   nổi. Mặc định bày một điểm trường, có dải nút chuyển. Bản gộp cả trường
   chỉ còn ở đường Xuất và in. */
kt('Nhiều điểm trường thì lưới bày MỘT điểm, có dải nút chuyển', (() => {
  w.chuyen('toantruong');
  const nut = w.document.querySelectorAll('[data-dtluoi]');
  const cot = w.document.querySelectorAll('.tt thead tr:last-child th').length - 2;
  const dang = w.eval('S.dtLuoi');
  const lopCuaDiem = S.lop.filter(l => S.lopDT[l.id] === dang).length;
  return nut.length === S.diemTruong.length && cot === lopCuaDiem && cot < S.lop.length;
})(), `${S.diemTruong.length} điểm trường`);
kt('Bấm sang điểm trường khác thì lưới đổi theo', (() => {
  const nut = [...w.document.querySelectorAll('[data-dtluoi]')];
  const khac = nut.find(b => b.dataset.dtluoi !== w.eval('S.dtLuoi'));
  khac.dispatchEvent(new w.Event('click', { bubbles: true }));
  const cot = w.document.querySelectorAll('.tt thead tr:last-child th').length - 2;
  return w.eval('S.dtLuoi') === khac.dataset.dtluoi &&
    cot === S.lop.filter(l => S.lopDT[l.id] === khac.dataset.dtluoi).length;
})());
kt('Xuất và in vẫn gộp TOÀN BỘ lớp của trường, không bị dải nút cắt bớt',
   w.eval('luoiToanTruong(xepTheoKhoi(lopTrongPV()))')[3].length - 3 === S.lop.length,
   `${S.lop.length} lớp trong tệp xuất`);

console.log('\n14. Bản in đúng khổ giấy và đủ thể thức');
const KHO_TEN = { doc: 'A4 dọc', ngang: 'A4 ngang', rong: 'A3 ngang' };
const khoCua = h => (h.match(/class="tr-in ([a-z]+)"/) || [])[1];
const lop0 = S.lop[0].id, gv0 = S.giaoVien[0].id;
kt('Bản in một lớp và một giáo viên dùng khổ A4 dọc',
   khoCua(w.trangInLop(lop0)) === 'doc' && khoCua(w.trangInGV(gv0)) === 'doc',
   'một lớp vừa một trang dọc, không phí giấy');
kt('Bản in theo khối dùng A4 ngang, toàn trường dùng A3 ngang',
   khoCua(w.trangInKhoi(1)) === 'ngang' && khoCua(w.trangInToanTruong()) === 'rong',
   `khối → ${KHO_TEN[khoCua(w.trangInKhoi(1))]} · toàn trường → ${KHO_TEN[khoCua(w.trangInToanTruong())]}`);
kt('Mọi bản in đủ thể thức: tên đơn vị, tiêu đề, ngày tháng, hai chỗ ký',
   [w.trangInLop(lop0), w.trangInGV(gv0), w.trangInKhoi(1), w.trangInToanTruong()]
     .every(h => /in-dv/.test(h) && /in-d2/.test(h) && /in-ngay/.test(h) &&
                 /NGƯỜI LẬP BIỂU/.test(h) && /HIỆU TRƯỞNG/.test(h)));
kt('Bản in không ghi cơ quan chủ quản',
   !/Phòng GD|Sở GD|UBND|chủ quản/i.test(w.trangInLop(lop0) + w.trangInToanTruong()));
kt('Đầu bản in ghi đúng tên đơn vị đang khai',
   w.trangInLop(lop0).includes(S.tenTruong.toUpperCase()), S.tenTruong);
kt('Khổ giấy khai bằng trang có tên, đủ cả ba khổ', (() => {
  const css = w.document.documentElement.innerHTML;
  return /@page doc/.test(css) && /@page ngang/.test(css) && /@page rong/.test(css);
})());
kt('Tệp Word mang theo đúng kiểu chữ của bản in — một nguồn duy nhất',
   /Times New Roman/.test(w.eval('CSS_BAN_IN')) && /in-ky/.test(w.eval('CSS_BAN_IN')));

console.log('\n14b. Bản in theo TỪNG ĐIỂM TRƯỜNG — khổ A4 ngang');
/* Ba điểm trường gộp một tờ là 60 cột, không ai đọc nổi — bản in hằng ngày
   là mỗi điểm trường một bộ tờ A4 ngang, điểm đông lớp tự chia theo cụm khối.
   Bản gộp A3 vẫn giữ nguyên cho tờ dán bảng tin (phép thử ở mục 14). */
const hDT = w.trangInDiemTruong();
kt('Bản in từng điểm trường dùng khổ A4 ngang, không lẫn khổ A3',
   hDT.length > 0 && /tr-in ngang/.test(hDT) && !/tr-in rong/.test(hDT));
kt('Tên từng điểm trường ghi rõ trên tiêu đề tờ của nó, không ghép trùng chữ',
   S.diemTruong.every(d => {
     const nhan = /^điểm trường/i.test(d.ten) ? d.ten : `Điểm trường ${d.ten}`;
     return hDT.includes(nhan);
   }) && !/Điểm trường Điểm trường/.test(hDT));
kt('Không tờ nào vượt ngưỡng cột đọc được của A4 ngang', (() => {
  const to = hDT.split('class="tr-in').slice(1);
  const NGUONG = w.eval('NGUONG_COT_A4');
  return to.length > 0 && to.every(t => {
    const cot = (t.match(/<th>/g) || []).length - 1;   /* trừ cột Giờ */
    /* Cụm gộp NHIỀU khối ("Khối 1 đến khối 2") phải nằm trong ngưỡng;
       chỉ khối đơn lẻ đông hơn ngưỡng mới được phép đứng nguyên một tờ. */
    return cot <= NGUONG || !/đến khối/.test(t);
  });
})());
kt('Cộng mọi tờ lại thì đủ từng lớp của trường, không lớp nào rơi mất', (() => {
  const soCot = (hDT.match(/<th>/g) || []).length
    - hDT.split('class="tr-in').slice(1).length;      /* mỗi tờ một cột Giờ */
  return soCot === S.lop.length;
})(), `${S.lop.length} lớp`);
kt('In riêng một điểm trường thì chỉ ra lớp của đúng điểm ấy', (() => {
  const d = S.diemTruong[0];
  const h1 = w.trangInDiemTruong(d.id);
  const soCot = (h1.match(/<th>/g) || []).length - h1.split('class="tr-in').slice(1).length;
  return soCot === S.lop.filter(l => S.lopDT[l.id] === d.id).length;
})());
kt('Màn hình Xuất và in bày bản A4 điểm trường lên ĐẦU danh sách chọn', (() => {
  w.chuyen('xuatin');
  const chon = w.document.querySelector('#inChonRong');
  return !!chon && (chon.querySelector('option')?.value || '') === 'dt';
})());

console.log('\n14c. Xem trước bản in ngay trên màn hình');
/* Ô chọn bản in trước đây "mù" — bấm In mới biết tờ giấy ra hình gì.
   Khung xem trước bày đúng HTML bản in, cùng một nguồn CSS_BAN_IN. */
kt('Mở màn Xuất và in là khung xem trước bày sẵn các tờ giấy thật', (() => {
  const to = w.document.querySelectorAll('#xtBoc .tr-in');
  return !!w.document.querySelector('#xtBoc') && to.length > 0;
})());
kt('Kiểu chữ bản in nạp cho màn hình từ đúng một nguồn CSS_BAN_IN',
   !!w.document.querySelector('#kieuXemTruoc'));
kt('Mặc định xem bản A4 từng điểm trường — đúng bản in hằng ngày',
   /từng điểm trường/.test(w.document.querySelector('#xtMeta').textContent)
   && /A4 ngang/.test(w.document.querySelector('#xtMeta').textContent));
kt('Đổi ô chọn giáo viên là khung đổi sang bản của đúng người ấy', (() => {
  const sel = w.document.querySelector('#inChonGV');
  const g = S.giaoVien[0];
  sel.value = g.id;
  sel.dispatchEvent(new w.Event('change', {bubbles:true}));
  return w.eval('S.xtNguon') === 'gv'
    && w.document.querySelector('#xtBoc').textContent.includes(g.hoTen)
    && /A4 dọc/.test(w.document.querySelector('#xtMeta').textContent);
})());
kt('Bản dài chỉ bày mấy tờ đầu, nói rõ còn bao nhiêu tờ nữa', (() => {
  /* "Tất cả giáo viên" là mấy chục tờ — xem trước để biết hình hài,
     không phải để đọc trọn, nên chặn ở TOI_DA_TO_XEM. */
  const sel = w.document.querySelector('#inChonGV');
  sel.value = '';
  sel.dispatchEvent(new w.Event('change', {bubbles:true}));
  const to = w.document.querySelectorAll('#xtBoc .tr-in').length;
  const max = w.eval('TOI_DA_TO_XEM');
  return to === max && /tờ nữa/.test(w.document.querySelector('#xtBoc').textContent);
})());
w.eval('S.xtNguon = null');

console.log('\n15. Xếp kỹ và mẫu Excel trên giao diện');
w.chuyen('xep');
kt('Màn hình Xếp có cả nút xếp nhanh và nút xếp kỹ',
   !!w.document.querySelector('#btXep') && !!w.document.querySelector('#btXepKy'));
kt('Chạy xếp kỹ xong thì bày bảng so phương án', (() => {
  w.eval('PA_TIM = xepDai({giay:5, soPhuongAn:3})');
  w.chuyen('xep');
  const n = w.document.querySelectorAll('[data-dungpa]').length;
  return n >= 2 && /Phương án tìm được/.test(w.document.querySelector('#noiDung').textContent);
})(), `${w.document.querySelectorAll('[data-dungpa]').length} phương án bấm chọn được`);
kt('Bấm "Dùng bản này" thì lưới đổi sang đúng phương án đó', (() => {
  const pa = w.eval('PA_TIM.phuongAn');
  if (pa.length < 2) return true;
  w.document.querySelector('[data-dungpa="1"]').dispatchEvent(new w.Event('click', { bubbles: true }));
  return w.eval('diemToanCuc()') === pa[1].diem;
})());
kt('Cắt được vùng LOGIC từ chính trang để nạp vào Worker', (() => {
  const ma = w.eval('maVungLogic()');
  return typeof ma === 'string' && ma.includes('function* xepDaiTung')
    && ma.includes('const NGUON') && !ma.includes('chayXepKy');
})());
kt('Vùng LOGIC cắt ra tự chạy được với document giả — đúng thứ Worker nạp',
   w.eval(`new Function('document', maVungLogic() + '; return typeof xepDaiTung + "-" + typeof xepTuDong + "-" + typeof napNhom')(
     {querySelector:()=>({textContent:'',className:'',style:{}}), querySelectorAll:()=>[], addEventListener(){}})`)
   === 'function-function-function');
kt('Trình duyệt không có Worker thì taoWorkerXep trả null, xếp kỹ vẫn chạy tại chỗ',
   w.eval('typeof Worker') === 'undefined' && w.eval('taoWorkerXep()') === null);

console.log('\n15b. Nhật ký thao tác');
kt('Màn hình Xếp có nút Nhật ký thao tác cạnh Lịch sử phiên bản',
   !!w.document.querySelector('#btNhatKy') && !!w.document.querySelector('#btLichSu'));
await w.eval('hopNhatKy()');
kt('Chưa nối máy chủ thì hộp nhật ký nói rõ vì sao và bao giờ có',
   /Chưa xem được nhật ký/.test(w.document.querySelector('#hopN')?.textContent || '') &&
   /Chưa nối máy chủ/.test(w.document.querySelector('#hopN')?.textContent || ''));
kt('Mã hành động dịch thành câu tiếng Việt đọc được', (() => {
  const d = w.eval('MO_TA_HANH_DONG');
  return d.luu_tkb({version: 4}) === 'Lưu thời khóa biểu thành phiên bản 4'
    && d.nhap_du_lieu_nguon({lop: 25, giaoVien: 35, phanCong: 265}).includes('25 lớp')
    && d.cong_bo({version: 2}).includes('giáo viên');
})());
w.eval('dong()');

console.log('\n15c. Chức năng xuất .ics đã gỡ bỏ');
/* Gỡ 2/8/2026 theo yêu cầu chủ dự án: thầy cô mở thẳng app trên điện thoại
   được rồi (đã có PWA cài lên màn hình chính), nên một đường xuất lịch nữa
   chỉ là thứ phải nuôi mà không ai dùng. Phép thử canh để không ai vô tình
   dựng lại nửa vời — nút mà không còn hàm là bấm vào văng lỗi. */
w.chuyen('tkbgv');
kt('Màn hình Theo giáo viên không còn nút Đưa vào lịch điện thoại',
   !w.document.querySelector('#btICSGV'));
w.chuyen('cuatoi');
kt('Màn hình Của tôi cũng vậy', !w.document.querySelector('#btICSToi'));
kt('Không còn sót hàm dựng .ics nào trong trang',
   w.eval("typeof taoICS + typeof taiICS") === 'undefinedundefined');

console.log('\n15d. Dạy thay — ba khu vực');
w.chuyen('daythay');
kt('Trang Dạy thay có đủ ba khu vực của bản giao việc', (() => {
  const t = w.document.querySelector('#noiDung').textContent;
  return /Giáo viên báo nghỉ/.test(t) && /Lịch đã phân công/.test(t);
})());
kt('Không ai báo nghỉ thì nói thẳng câu ấy, không để trống',
   /Hôm nay không có giáo viên báo nghỉ/.test(w.document.querySelector('#noiDung').textContent));
kt('Vẫn còn đường phân công tay khi thầy cô báo miệng',
   !!w.document.querySelector('#btThayTay'));

/* BÁO NGHỈ HỘ (3/8/2026): thầy cô ốm nặng không tự gửi được thì Ban Giám
   hiệu ghi thay — vẫn ra một dòng bao_nghi thật nên hồ sơ ngày công đầy đủ,
   khác nút Phân công không qua báo nghỉ (không ghi gì lên máy chủ). */
kt('Có nút Báo nghỉ hộ giáo viên ngay cạnh đường phân công tay',
   !!w.document.querySelector('#btBaoNghiHo2'));
kt('Bấm vào là hộp đủ năm ô: người · ngày · buổi · lý do · ghi chú', (() => {
  w.document.querySelector('#btBaoNghiHo2').dispatchEvent(new w.Event('click', {bubbles:true}));
  const du = ['#bhGV', '#bhNgay', '#bhBuoi', '#bhLyDo', '#bhGhiChu']
    .every(id => !!w.document.querySelector(id));
  const buoi = [...(w.document.querySelector('#bhBuoi')?.options || [])].map(o => o.value);
  return du && buoi.join(',') === 'S,C,CN';
})());
kt('Bấm Huỷ thì hộp đóng, không ghi gì', (() => {
  [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Huỷ').click();
  /* dong() chỉ ẩn màn che — tiêu chí đóng là #man mất lớp "on" */
  return !w.document.querySelector('#man').classList.contains('on')
    && !(S.baoNghi || []).length;
})());
kt('Màn Theo giáo viên cũng có nút Báo nghỉ hộ, điền sẵn đúng người đang xem', (() => {
  w.chuyen('tkbgv');
  const nut = w.document.querySelector('#btBaoNghiHo');
  if (!nut) return false;
  nut.dispatchEvent(new w.Event('click', {bubbles:true}));
  const dung = w.document.querySelector('#bhGV')?.value === w.eval('S.gvXem');
  [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Huỷ').click();
  w.chuyen('daythay');
  return dung;
})());

/* Dựng một thông báo nghỉ thật: chọn một giáo viên đang có tiết sáng thứ Hai */
w.eval(`(() => {
  const lop = Object.keys(S.tkb).find(l => S.tkb[l]['2-S-0']);
  const co = S.tkb[lop]['2-S-0'];
  S.baoNghi = [{id:'bn1', gvId:co.gvId, ngay:'2026-09-07', buoi:'S',
    lyDo:'Nghỉ ốm', ghiChu:'', trangThai:'cho'}];
})()`);
w.chuyen('daythay');
kt('Có người báo nghỉ thì hiện thẻ kèm số tiết cần bố trí', (() => {
  const t = w.document.querySelector('#noiDung').textContent;
  return /Nghỉ buổi sáng/.test(t) && /tiết cần bố trí/.test(t) && /Nghỉ ốm/.test(t);
})());
kt('Thẻ có nút Xem phương án', !!w.document.querySelector('[data-xemphuongan]'));

w.document.querySelector('[data-xemphuongan]').dispatchEvent(new w.Event('click', {bubbles:true}));
kt('Bấm Xem phương án thì hiện bảng các tiết cần dạy thay', (() => {
  const t = w.document.querySelector('#noiDung').textContent;
  return /Phương án dạy thay/.test(t) && /Điểm trường/.test(t);
})());
kt('Đề xuất đúng BA phương án, không nhiều không ít', ...((() => {
  const n = w.document.querySelectorAll('.pa-the').length;
  return [n === 3, `${n} thẻ phương án`];
})()));
kt('Thẻ phương án nói LÝ DO bằng chữ, tuyệt đối không bày điểm số', (() => {
  const t = w.document.querySelector('.pa-luoi').textContent;
  return /cùng điểm trường|trống cả buổi|đã từng dạy lớp này|chuyên môn phù hợp|Ghép/.test(t)
    && !/\bđiểm:\s*\d/.test(t);
})());
kt('Phương án 1 ghi rõ là ưu tiên cao nhất, phương án 3 là dự phòng', (() => {
  const t = w.document.querySelectorAll('.pa-the');
  return /ưu tiên cao nhất/.test(t[0].textContent) && /dự phòng/.test(t[2].textContent);
})());
kt('Thẻ đang chọn có dấu tích, không chỉ dựa vào màu viền', (() => {
  const on = w.document.querySelector('.pa-the.on');
  return !!on && on.querySelector('.pa-tick').textContent.trim() === '✓';
})());
kt('Chọn phương án 2 thì dấu tích chuyển sang thẻ đó', (() => {
  [...w.document.querySelectorAll('[data-pachon]')]
    .find(b => b.tagName === 'BUTTON' && b.dataset.pachon === '1')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  const the = w.document.querySelectorAll('.pa-the');
  return the[1].classList.contains('on') && !the[0].classList.contains('on');
})());
kt('Chuyển sang bố trí riêng từng tiết thì mỗi tiết một ô chọn', (() => {
  w.document.querySelector('#btPaRieng').dispatchEvent(new w.Event('click', {bubbles:true}));
  const sel = w.document.querySelectorAll('[data-patiet]');
  return sel.length > 0 && /Lớp tự quản/.test(sel[0].innerHTML);
})());
kt('Ô chọn từng tiết chỉ liệt kê người THẬT SỰ trống tiết đó', (() => {
  const sel = w.document.querySelector('[data-patiet]');
  const khoa = sel.dataset.patiet;
  const hopLe = w.eval(`(() => {
    const bn = S.baoNghi[0];
    const o = tietCanThay(bn).find(x => x.khoa === '${khoa}');
    return ungVienThay(o, bn.gvId, bn.ngay).map(u => u.gv.id);
  })()`);
  const bay = [...sel.options].map(o => o.value).filter(Boolean);
  return bay.length > 0 && bay.every(id => hopLe.includes(id));
})());
kt('Người đang nghỉ không bao giờ nằm trong danh sách gợi ý', (() => {
  const vang = w.eval('S.baoNghi[0].gvId');
  return ![...w.document.querySelectorAll('[data-patiet]')]
    .some(s => [...s.options].some(o => o.value === vang));
})());
w.document.querySelector('#btPaRieng').dispatchEvent(new w.Event('click', {bubbles:true}));

console.log('\n15d2. Chốt chặn xung đột trước khi lưu');
kt('Người đang có tiết chính khoá đúng giờ ấy thì bị bắt là xung đột', ...((() => {
  /* Duyệt cả danh sách ứng viên để tìm người CÓ tiết vào thứ Hai ở một lớp
     khác, rồi ép họ dạy thay đúng ô giờ ấy — §14 nói tuyệt đối không được. */
  const r = w.eval(`(() => {
    const bn = S.baoNghi[0];
    const o = tietCanThay(bn)[0];
    const lich = lichTraGV();
    for (const uv of ungVienThay(o, bn.gvId, bn.ngay)) {
      const cua = lich[uv.gv.id] || {};
      const khoa = Object.keys(cua).find(k => k.startsWith('2-') && cua[k] !== o.lopId);
      if (!khoa) continue;
      const [t, b, i] = khoa.split('-');
      return {ten: uv.gv.hoTen, loi: xungDotDayThay([{ngay:'2026-09-07', buoi:b,
        tiet:+i, lopId:o.lopId, mon:o.mon, gvVangId:bn.gvId, gvThayId:uv.gv.id}])};
    }
    return null;
  })()`);
  if (!r) return [false, 'không tìm được ứng viên nào có tiết thứ Hai'];
  return [r.loi.length > 0 && /đang có tiết dạy lớp/.test(r.loi[0].vi),
    r.loi[0] ? r.loi[0].vi : 'không bắt được'];
})()));
kt('Người cũng đang báo nghỉ thì bị bắt là xung đột', (() => {
  const loi = w.eval(`(() => {
    const bn = S.baoNghi[0];
    const o = tietCanThay(bn)[0];
    const uv = ungVienThay(o, bn.gvId, bn.ngay)[0];
    S.baoNghi.push({id:'bn2', gvId:uv.gv.id, ngay:'2026-09-07', buoi:'S',
      lyDo:'Nghỉ ốm', ghiChu:'', trangThai:'cho'});
    const r = xungDotDayThay([{ngay:'2026-09-07', buoi:o.buoi, tiet:o.i,
      lopId:o.lopId, mon:o.mon, gvVangId:bn.gvId, gvThayId:uv.gv.id}]);
    S.baoNghi = S.baoNghi.filter(x => x.id !== 'bn2');
    return r;
  })()`);
  return loi.some(x => /cũng đang báo nghỉ/.test(x.vi));
})());
kt('Người đã đăng ký buổi bận cố định cũng bị bắt', (() => {
  const loi = w.eval(`(() => {
    const bn = S.baoNghi[0];
    const o = tietCanThay(bn)[0];
    const uv = ungVienThay(o, bn.gvId, bn.ngay)[0];
    const cu = S.gvNghi[uv.gv.id];
    S.gvNghi[uv.gv.id] = ['2-S'];
    const r = xungDotDayThay([{ngay:'2026-09-07', buoi:'S', tiet:o.i,
      lopId:o.lopId, mon:o.mon, gvVangId:bn.gvId, gvThayId:uv.gv.id}]);
    if (cu) S.gvNghi[uv.gv.id] = cu; else delete S.gvNghi[uv.gv.id];
    return r;
  })()`);
  return loi.some(x => /đã đăng ký bận/.test(x.vi));
})());
kt('Hai lớp khác nhau cùng một tiết mà chọn cùng một người thì chặn ngay trong mẻ', (() => {
  const loi = w.eval(`(() => {
    const bn = S.baoNghi[0];
    const o = tietCanThay(bn)[0];
    const uv = ungVienThay(o, bn.gvId, bn.ngay).find(u => {
      const l = lichTraGV()[u.gv.id] || {};
      return !l[o.khoa];
    });
    const lopKhac = S.lop.find(l => l.id !== o.lopId).id;
    return xungDotDayThay([
      {ngay:'2026-09-07', buoi:o.buoi, tiet:o.i, lopId:o.lopId, mon:o.mon,
       gvVangId:bn.gvId, gvThayId:uv.gv.id},
      {ngay:'2026-09-07', buoi:o.buoi, tiet:o.i, lopId:lopKhac, mon:o.mon,
       gvVangId:bn.gvId, gvThayId:uv.gv.id}]);
  })()`);
  return loi.some(x => /đã được phân dạy thay lớp/.test(x.vi));
})());
kt('Lớp tự quản (không chọn ai) thì không có xung đột nào', (() => {
  const loi = w.eval(`(() => {
    const bn = S.baoNghi[0];
    const o = tietCanThay(bn)[0];
    return xungDotDayThay([{ngay:'2026-09-07', buoi:o.buoi, tiet:o.i,
      lopId:o.lopId, mon:o.mon, gvVangId:bn.gvId, gvThayId:null}]);
  })()`);
  return loi.length === 0;
})());
kt('Chưa nối máy chủ mà bấm Xác nhận thì báo rõ, không im lặng', await (async () => {
  w.chuyen('daythay');
  w.document.querySelector('[data-xemphuongan]').dispatchEvent(new w.Event('click', {bubbles:true}));
  const n = w.document.querySelector('#btXacNhanPA');
  n.dispatchEvent(new w.Event('click', {bubbles:true}));
  await new Promise(r => setTimeout(r, 60));
  return /Chưa nối máy chủ/.test(w.document.querySelector('#bao').textContent);
})());

console.log('\n15d3. Bản in và bản gửi Zalo');
w.eval(`(() => {
  const bn = S.baoNghi[0];
  const ds = tietCanThay(bn);
  S.dayThay = ds.map(o => ({id:'dt'+o.i, ngay:bn.ngay, buoi:o.buoi, tiet:o.i,
    lopId:o.lopId, mon:o.mon, gvVangId:bn.gvId,
    gvThayId:ungVienThay(o, bn.gvId, bn.ngay)[0].gv.id, ghiChu:'', daXem:false}));
  S.dtLoc = 'het';
})()`);
w.chuyen('daythay');
kt('Bản in có đủ tiêu đề, ngày áp dụng và hai chỗ ký', (() => {
  const t = w.eval('trangInDayThay()');
  return /LỊCH PHÂN CÔNG DẠY THAY/.test(t) && /Ngày áp dụng/.test(t)
    && /NGƯỜI LẬP BIỂU/.test(t) && /HIỆU TRƯỞNG/.test(t);
})());
kt('Bản in ghi HỌ TÊN ĐẦY ĐỦ, không rút gọn — hai cô Dung phải phân biệt được', (() => {
  const t = w.eval('trangInDayThay()');
  const ten = w.eval('gvId(S.dayThay[0].gvThayId).hoTen');
  return t.includes(ten) && ten.split(' ').length >= 2;
})());
kt('Bản in có đủ cột của mẫu §17', (() => {
  const t = w.eval('trangInDayThay()');
  return ['TT','Giáo viên nghỉ','Tiết','Lớp','Môn','Giáo viên dạy thay','Ghi chú']
    .every(c => t.includes(c));
})());
kt('Bản gửi Zalo là chữ thuần, gom theo ngày, đọc được trên điện thoại', (() => {
  const t = w.eval('vanBanDayThay()');
  return /LỊCH DẠY THAY/.test(t) && /dạy thay/.test(t) && !/</.test(t);
})());
kt('Ba nút In · Word · Zalo đều có mặt khi đã có lịch', (() => {
  return !!w.document.querySelector('#btInDayThay')
    && !!w.document.querySelector('#btWordDayThay')
    && !!w.document.querySelector('#btChepDayThay');
})());
kt('Cột Tình trạng nói rõ đã xem hay chưa, bằng CHỮ',
   /Chưa xem/.test(w.document.querySelector('#noiDung').textContent));

console.log('\n15d4. Bảng ngày công theo tháng');
/* Bảng nộp báo cáo hằng tháng, suy hết từ bao_nghi (logic thuần có phép thử
   riêng ở npm test — mục 18b). Ở đây chỉ soi phần màn hình và bản in. */
w.eval('S.ncThang = "2026-09"');
w.chuyen('ngaycong');
kt('Mục Ngày công có mặt trên thanh bên, trong nhóm Quản lý và kết quả', (() => {
  const mi = w.document.querySelector('.mi[data-t="ngaycong"]');
  return !!mi && mi.dataset.nh === 'qk';
})());
kt('Bảng ghi họ tên đầy đủ người nghỉ, 0,5 công một buổi, có dòng tổng', (() => {
  const t = w.document.querySelector('#noiDung').textContent;
  const ten = w.eval('gvId(S.baoNghi[0].gvId).hoTen');
  return t.includes(ten) && /0,5/.test(t) && /Tổng cộng/.test(t);
})());
kt('Ba lối ra In · Word · Excel đều có mặt khi có dòng',
   !!w.document.querySelector('#btInNC') && !!w.document.querySelector('#btWordNC')
   && !!w.document.querySelector('#btExcelNC'));
kt('Bản in ngày công khổ A4 dọc, đủ thể thức và chỗ ký', (() => {
  const h = w.eval('trangInNgayCong()');
  return /tr-in doc/.test(h) && /NGÀY CÔNG THÁNG 9\/2026/.test(h)
    && /NGƯỜI LẬP BIỂU/.test(h) && /HIỆU TRƯỞNG/.test(h);
})());
kt('Tháng không ai nghỉ thì nói "cả trường đủ công", không bày bảng trống', (() => {
  w.eval('S.ncThang = "2026-11"'); w.chuyen('ngaycong');
  const t = w.document.querySelector('#noiDung').textContent;
  return /chưa có ai báo nghỉ/.test(t) && /đủ công/.test(t)
    && !w.document.querySelector('#btInNC');
})());
w.eval('S.ncThang = null');
w.chuyen('daythay');
w.eval('S.dayThay = []; S.baoNghi = []; S.dtLoc = "moi"; S.bnXem = null');
console.log('\n15e. Mẫu Excel ma trận');
w.chuyen('lop');
w.eval('hopNhapExcel()');
kt('Hộp nhập Excel giới thiệu hai kiểu tệp, có đủ hai nút tải mẫu', (() => {
  const nut = [...w.document.querySelectorAll('#hopC button')].map(b => b.textContent);
  return /Ma trận một trang/.test(w.document.querySelector('#hopN').textContent) &&
    nut.includes('Mẫu ma trận') && nut.includes('Mẫu 3 trang');
})());
w.eval('dong()');
kt('Bảng ma trận lấy số tiết theo danh mục môn HIỆN HÀNH của trường', ...((() => {
  /* mục 9 ở trên đã cố ý sửa tiết chuẩn Tiếng Việt khối 1 thành 9 —
     ma trận phải theo danh mục của trường, không theo hằng số cứng */
  const mong = w.eval(`chuanMon('Tiếng Việt',1) + chuanMon('Toán',1)`);
  const r = w.eval(`duLieuTuMaTran([
    {Ho_ten:'Cô Thử', Chu_nhiem:'9X-1A', 'Tiếng Việt':'x', 'Toán':'x'}
  ], null)`);
  return [r.soLoi === 0 && r.giaoVien[0].cn === '9X-1A' &&
    r.phanCong.length === 2 && r.tongTiet === mong,
    `${r.tongTiet} tiết = chuẩn đang khai (${mong})`];
})()));

console.log('\n15h. Sản phẩm lên đầu Bảng điều hành');
w.eval('KQ_XEP = xepTuDong(0)');
w.chuyen('dieuhanh');
/* Thứ tự mới (2/8/2026): VIỆC CẦN XỬ LÝ đứng trước cả thời khóa biểu.
   Đó là thứ duy nhất có hạn giờ trong ngày — cô A ốm sáng nay, tám giờ vào
   tiết. Tiến độ xếp lịch thì tuần sau xem cũng được. Nhưng thời khóa biểu
   vẫn phải đứng TRƯỚC ba thẻ bước, đúng nguyên tắc "sản phẩm lên trước". */
/* Sắp lại lần cuối 3/8/2026: BỎ HẲN băng rôn navy. Tên trường đã có ở
   thanh trên cùng, số lớp và phiên bản đã có ở dải chỉ số và khối Việc cần
   xử lý — băng rôn chỉ lặp lại thứ đã nói mà ăn mất 96px ngay trên lưới.
   Mục tiêu chủ dự án: "tạo cho TKB không gian rộng hơn". */
kt('Bỏ hẳn băng rôn navy — không còn khối nào lặp lại tên trường trên lưới',
   !w.document.querySelector('#noiDung .bang-ron'));
kt('Không có việc gấp thì THỜI KHÓA BIỂU là khối đầu tiên của trang', (() => {
  const nd = w.document.querySelector('#noiDung');
  return nd.firstElementChild.classList.contains('the-luoi')
    && !!nd.firstElementChild.querySelector('table');
})());
kt('Thẻ lưới KHÔNG còn dòng tiêu đề — nhường chiều cao cho bảng', (() => {
  const the = w.document.querySelector('#noiDung .the-luoi');
  return !the.querySelector('.the-d');
})());
kt('Nút "Xuất và in" nằm NGANG HÀNG với bốn thẻ chuyển', (() => {
  const dai = w.document.querySelector('#noiDung .dai-xem');
  const nut = dai && dai.querySelector('[data-di="xuatin"]');
  return !!nut && dai.querySelectorAll('[data-dhxem]').length === 4;
})());
kt('Thời khóa biểu đứng TRƯỚC khối việc cần xử lý', ...((() => {
  const html = w.document.querySelector('#noiDung').innerHTML;
  const iLuoi = viTriLuoi(html);
  const iViec = html.indexOf('class="viec');
  return [iLuoi > 0 && iViec > 0 && iLuoi < iViec, `lưới ${iLuoi} · việc ${iViec}`];
})()));
kt('Không có ai báo nghỉ thì KHÔNG bày dải đỏ — không tốn một pixel nào',
   !w.document.querySelector('.br-gap'));
kt('Có người báo nghỉ thì hiện dải đỏ một dòng ở ĐẦU trang, bấm được', ...((() => {
  /* Đây là cái giá của việc đẩy khối việc cần xử lý xuống dưới lưới —
     việc gấp vẫn phải đập vào mắt ngay đầu trang. */
  w.eval(`(() => {
    const lop = Object.keys(S.tkb).find(l => S.tkb[l]['2-S-0']);
    S.baoNghi = [{id:'bnX', gvId:S.tkb[lop]['2-S-0'].gvId, ngay:'2026-09-07',
      buoi:'S', lyDo:'Nghỉ ốm', ghiChu:'', trangThai:'cho'}];
    ve();
  })()`);
  const dai = w.document.querySelector('.br-gap');
  const ok = !!dai && dai.dataset.di === 'daythay'
    && /giáo viên báo nghỉ chưa xử lý/.test(dai.textContent)
    && /tiết cần bố trí/.test(dai.textContent)
    && w.document.querySelector('#noiDung').firstElementChild === dai;
  w.eval('S.baoNghi = []; ve()');
  return [ok, dai ? dai.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) : 'không có dải'];
})()));
kt('Không ai báo nghỉ thì khối ấy nói thẳng ra, không để trống', (() => {
  const v = w.document.querySelector('#noiDung .viec');
  return /Hôm nay không có giáo viên báo nghỉ/.test(v.textContent)
    && !v.classList.contains('gap');
})());
kt('Xếp xong thì Bảng điều hành vẫn bày chính thời khóa biểu', (() => {
  /* Canh CÁI LƯỚI chứ không canh dòng chữ "Thời khóa biểu": dòng tiêu đề
     thẻ đã xoá 3/8/2026 để nhường chiều cao cho bảng. Lưới nào cũng được —
     toàn trường hay một lớp — miễn là nó có mặt cùng bốn thẻ chuyển. */
  const the = [...w.document.querySelectorAll('#noiDung .the')]
    .find(x => x.querySelector('.tt, table.tkb'));
  return !!the && the.querySelectorAll('[data-dhxem]').length === 4
    && the.querySelectorAll('.tt th, table.tkb th').length >= 7;
})());
kt('Thời khóa biểu vẫn đứng TRƯỚC ba thẻ bước — sản phẩm lên trước', (() => {
  const html = w.document.querySelector('#noiDung').innerHTML;
  const iLuoi = viTriLuoi(html);
  const iBuoc = html.indexOf('Khai báo dữ liệu');
  return iLuoi > 0 && (iBuoc < 0 || iLuoi < iBuoc);
})());
/* Cụm thao tác nhanh chuyển sang màn hình XẾP 3/8/2026 — Bảng điều hành
   phải là chỗ NHÌN thời khóa biểu, không phải một bảng nút bấm. */
kt('Bảng điều hành KHÔNG còn cụm sáu nút thao tác nhanh', (() => {
  /* Không đòi vắng mặt MỌI data-di — thẻ Cảnh báo vẫn có lối sang Kiểm tra
     khả thi, đó là lối đi đúng chỗ. Chỉ đòi không còn CỤM sáu nút: dấu hiệu
     là nút "Công bố phiên bản", vốn chỉ có trong cụm ấy. */
  const di = [...w.document.querySelectorAll('#noiDung [data-di]')].map(b => b.dataset.di);
  return !di.includes('phienban');
})());
kt('Cụm ấy nay nằm ở màn hình Xếp thời khóa biểu, đủ sáu nút', (() => {
  w.chuyen('xep');
  const di = [...w.document.querySelectorAll('#noiDung [data-di]')].map(b => b.dataset.di);
  const ok = ['kiemtra','xep','toantruong','daythay','xuatin','phienban']
    .every(x => di.includes(x));
  w.chuyen('dieuhanh');
  return ok;
})());
kt('Chỉ MỘT nút hành động chính nổi bật trong dải thao tác nhanh', ...((() => {
  w.chuyen('xep');
  const dai = [...w.document.querySelectorAll('#noiDung .the')]
    .find(t => [...t.querySelectorAll('[data-di]')].length >= 5);
  const ch = dai ? [...dai.querySelectorAll('button')].filter(b => b.className.includes('b-ch')) : [];
  w.chuyen('dieuhanh');
  return [!!dai && ch.length === 1, `${ch.length} nút chính`];
})()));
kt('Bảng điều hành bỏ hẳn tiêu đề + ô tìm kiếm chung, vào thẳng thời khóa biểu', (() => {
  return !w.document.querySelector('#noiDung .dau-trang')
    && !w.document.querySelector('#noiDung #timChung');
})());
kt('Ô tìm kiếm chung nay nằm TĨNH trên thanh đầu trang, không trong màn nào', (() => {
  /* 3/8/2026: dời từ màn Giáo viên lên nút kính lúp #btTim — hai ô tìm
     giống hệt nhau nằm cạnh nhau trong một màn là bẫy gõ nhầm. */
  w.chuyen('giaovien');
  const khongTrong = !w.document.querySelector('#noiDung #timChung');
  const trenThanh = !!w.document.querySelector('.thanh #timChung')
    && !!w.document.querySelector('#btTim');
  w.chuyen('dieuhanh');
  return khongTrong && trenThanh;
})());
kt('Chỉ số nay xếp DỌC theo ưu tiên, nằm trong thẻ Tiến độ xếp', ...((() => {
  /* 3/8/2026: dải ngang bốn ô chiếm một dòng riêng cạnh lưới, nay dồn vào
     khoảng trống sẵn có dưới vòng tròn tiến độ. */
  const cot = w.document.querySelector('#noiDung .cot-so');
  const trong = cot && cot.closest('.the');
  const dong = cot ? [...cot.querySelectorAll('.cs-d span')].map(x => x.textContent) : [];
  return [!!cot && !!trong && /Tiến độ xếp/.test(trong.textContent) && dong.length === 7,
    dong.slice(0, 3).join(' · ')];
})()));
kt('Thứ tự là ƯU TIÊN THẬT: việc gấp trước, quy mô trường sau', (() => {
  const d = [...w.document.querySelectorAll('#noiDung .cot-so .cs-d span')]
    .map(x => x.textContent);
  return /báo nghỉ/.test(d[0]) && /dạy thay/.test(d[1]) && /cảnh báo/.test(d[2])
    && /đã xếp/.test(d[3]) && /điểm trường/.test(d[6]);
})());
kt('Số 0 KHÔNG bị tô đỏ — báo động giả còn tệ hơn không báo', (() => {
  const d = [...w.document.querySelectorAll('#noiDung .cot-so .cs-d')];
  return d.every(x => x.querySelector('b').textContent.trim() !== '0'
    || !x.classList.contains('do'));
})());
kt('Không còn dải chỉ số nào khác lặp lại cùng mấy con số ấy', (() => {
  const nd = w.document.querySelector('#noiDung');
  return !nd.querySelector('.dai-so') && !nd.querySelector('.the-so')
    && !nd.querySelector('.viec-so');
})());

console.log('\n15h2. Bốn cách xem, chuyển TẠI CHỖ trên Bảng điều hành');
kt('Thẻ chuyển và nút điểm trường cùng một hệ màu, không có nút nào nền trắng trơn', (() => {
  /* Bảng màu đổi sang xanh lá 16/8/2026 và đảo chiều sáng tối: chưa chọn
     nay là NỀN SÁNG CHỮ XANH có viền, đang chọn là nền xanh đậm chữ trắng.
     Nguyên tắc gốc của ngày 3/8 vẫn giữ — "nhìn màu trắng không rõ" nên nút
     chưa chọn phải có nền và viền riêng, không được trắng trơn như nền thẻ. */
  const css = w.document.documentElement.innerHTML;
  const xem = css.slice(css.indexOf('.xem-nut{'), css.indexOf('.xem-nut{') + 340);
  const dt  = css.slice(css.indexOf('.dt-nut{'),  css.indexOf('.dt-nut{')  + 340);
  return /background:var\(--nav-nhat\)/.test(xem) && /color:var\(--nav\)/.test(xem)
    && /border:1px solid var\(--nav-vien\)/.test(xem)
    && /background:var\(--nav-nhat\)/.test(dt)  && /color:var\(--nav\)/.test(dt)
    && /--nav-nhat:#/.test(css);
})());
kt('Nhưng thẻ ĐANG CHỌN vẫn đậm hơn hẳn — hai tín hiệu, không chỉ một', (() => {
  const css = w.document.documentElement.innerHTML;
  return /\.xem-nut\.on\{background:var\(--nav\);color:#fff/.test(css)
    && /\.dt-nut\.on\{background:var\(--nav\);color:#fff/.test(css);
})());
kt('Bảng màu là hệ XANH LÁ, không còn navy ở bất kỳ biến gốc nào', ...((() => {
  const css = w.document.documentElement.innerHTML;
  const lay = ten => (css.match(new RegExp('--' + ten + ':(#[0-9A-Fa-f]{6})')) || [])[1];
  /* Xanh lá: thành phần lục phải trội hơn hẳn lam. Navy cũ thì ngược lại. */
  const laLuc = h => { const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16),
                             b = parseInt(h.slice(5,7),16); return g > b && g > r; };
  const nav = lay('nav'), nav3 = lay('nav-3'), xanh = lay('xanh');
  return [!!nav && laLuc(nav) && laLuc(nav3) && laLuc(xanh), `--nav ${nav} · --nav-3 ${nav3}`];
})()));
kt('Có đủ bốn thẻ chuyển cách xem', ...((() => {
  const v = [...w.document.querySelectorAll('[data-dhxem]')].map(b => b.dataset.dhxem);
  return [v.join() === 'toantruong,tkbkhoi,tkblop,tkbgv', v.join(' · ')];
})()));
kt('Chúng là THẺ CHUYỂN, không phải nút rời trang — không mang data-di', (() => {
  return [...w.document.querySelectorAll('[data-dhxem]')].every(b => !b.dataset.di);
})());
kt('Bấm "Theo lớp" thì lưới đổi ngay mà VẪN Ở Bảng điều hành', (() => {
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'tkblop')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  return w.eval('S.trangHienTai') === 'dieuhanh'
    && !!w.document.querySelector('#dhCotLop .cl-n')
    && !!w.document.querySelector('#noiDung table.tkb');
})());
kt('Và thẻ vừa bấm được đánh dấu đang chọn, các thẻ kia vẫn còn để bấm tiếp', (() => {
  const on = [...w.document.querySelectorAll('.xem-nut.on')];
  return on.length === 1 && on[0].dataset.dhxem === 'tkblop'
    && w.document.querySelectorAll('[data-dhxem]').length === 4;
})());
kt('Bấm tiếp "Theo giáo viên" thì đổi sang lịch của giáo viên', (() => {
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'tkbgv')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  return w.eval('S.trangHienTai') === 'dieuhanh' && !!w.document.querySelector('#dhGV');
})());
kt('Quay lại "Toàn trường" thì có dải điểm trường và lưới rộng', (() => {
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'toantruong')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  return !!w.document.querySelector('#noiDung table.tt');
})());
kt('Lưới trong Bảng điều hành CHỈ ĐỌC — không kéo thả, không chạm sửa', (() => {
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'tkblop')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  const nd = w.document.querySelector('#noiDung');
  const ok = !nd.querySelector('[data-keo]') && !nd.querySelector('[data-cham]');
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'toantruong')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  return ok;
})());
kt('Thẻ số liệu nay là nền TRẮNG, không còn navy phủ kín đầu trang', (() => {
  const css = w.document.documentElement.innerHTML;
  const i = css.indexOf('.ts{background:var(--the)');
  return i > 0 && /\.ts::after\{display:none\}/.test(css);
})());
kt('Bốn cách xem nay là THẺ CHUYỂN tại chỗ, chỉ Xuất/in mới rời trang', (() => {
  const xem = [...w.document.querySelectorAll('#noiDung [data-dhxem]')].map(b => b.dataset.dhxem);
  const di = [...w.document.querySelectorAll('#noiDung [data-di]')].map(b => b.dataset.di);
  return ['toantruong','tkblop','tkbgv','tkbkhoi'].every(x => xem.includes(x))
    && di.includes('xuatin');
})());

console.log('\n15h3. Cột danh sách lớp và cách xem mặc định (16/8/2026)');
kt('Trường nhiều lớp thì mở app là thấy MỘT LỚP, không phải lưới 25 cột', ...((() => {
  /* Chủ dự án 16/8/2026: "điều chỉnh để xem từng lớp thay vì hiển thị cả
     trường". Lưới toàn trường là tờ dán bảng tin A3, không phải màn hình
     điện thoại. */
  w.eval(`S.dhXem=''; ve()`);
  const xem = w.eval('S.dhXem');
  return [xem === 'tkblop' && !!w.document.querySelector('#dhCotLop'),
    `${w.eval('S.lop.length')} lớp → ${xem}`];
})()));
kt('Trường ít lớp thì vẫn mở lưới toàn trường như cũ', ...((() => {
  const it = w.eval(`xemMacDinh(new Array(6))`);
  const nhieu = w.eval(`xemMacDinh(new Array(25))`);
  return [it === 'toantruong' && nhieu === 'tkblop', `6 lớp → ${it} · 25 lớp → ${nhieu}`];
})()));
kt('Nhưng đó chỉ là MẶC ĐỊNH — bấm thẻ khác thì giữ lựa chọn của người dùng', (() => {
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'toantruong')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  const giu = w.eval('S.dhXem') === 'toantruong';
  w.eval('ve()');
  return giu && w.eval('S.dhXem') === 'toantruong'
    && !!w.document.querySelector('#noiDung table.tt');
})());
kt('Cột lớp bày đủ mọi lớp, nhóm theo khối, đánh dấu đúng lớp đang mở', ...((() => {
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'tkblop')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  const nut = [...w.document.querySelectorAll('#dhCotLop .cl-n')];
  const khoi = [...w.document.querySelectorAll('#dhCotLop .cl-khoi')];
  const on = w.document.querySelectorAll('#dhCotLop .cl-n.on');
  return [nut.length === w.eval('lopTrongPV().length') && khoi.length === 5 && on.length === 1,
    `${nut.length} nút · ${khoi.length} nhãn khối`];
})()));
kt('Lớp mở sẵn là lớp ĐẦU theo thứ tự nhà trường đọc quen, không phải lớp đầu mảng', (() => {
  return w.eval('lopId(S.lopXem)?.ten') === w.eval('xepTheoKhoi(lopTrongPV())[0].ten');
})());
kt('Bấm một lớp khác thì lưới đổi ngay, vẫn ở Bảng điều hành', ...((() => {
  const nut = [...w.document.querySelectorAll('#dhCotLop .cl-n')].filter(b => !b.classList.contains('on'));
  const dich = nut[3] || nut[0];
  const ten = dich.querySelector('b').textContent;
  dich.dispatchEvent(new w.Event('click', {bubbles:true}));
  return [w.eval('S.trangHienTai') === 'dieuhanh' && w.eval('lopId(S.lopXem)?.ten') === ten
    && w.document.querySelector('#dhCotLop .cl-n.on')?.querySelector('b').textContent === ten,
    `đổi sang ${ten}`];
})()));
kt('Ô tìm trong cột lọc tại chỗ, và KHÔNG đếm nhãn khối vào số lớp', ...((() => {
  /* Trường mẫu lúc này đã có nhiều điểm trường nên "1a" khớp lớp 1A của
     TỪNG điểm — số lớp khớp lấy từ dữ liệu, đừng đoán bằng 1. */
  const mong = w.eval(`lopTrongPV().filter(l => chuTim(l.ten + ' ' + (l.maLop||'')).includes('1a')).length`);
  const tong = w.eval('lopTrongPV().length');
  const o = w.document.querySelector('[data-loc="dhCotLop"]');
  o.value = '1a';
  o.dispatchEvent(new w.Event('input', {bubbles:true}));
  const hien = [...w.document.querySelectorAll('#dhCotLop .cl-n')]
    .filter(n => n.style.display !== 'none');
  const dem = w.document.querySelector('[data-locdem="dhCotLop"]').textContent.trim();
  o.value = '';
  o.dispatchEvent(new w.Event('input', {bubbles:true}));
  /* Mẫu số phải đúng bằng SỐ LỚP — nhãn khối cũng mang data-loctu nhưng
     không phải một dòng dữ liệu, đếm vào là ra "42 lớp" ở trường 37 lớp. */
  return [hien.length === mong && dem === `${mong}/${tong} lớp`, dem];
})()));
kt('Màn hình Theo lớp cũng dùng chính cột ấy, không còn ô chọn xổ xuống', (() => {
  w.chuyen('tkblop');
  return !!w.document.querySelector('#clTKBLop .cl-n')
    && !w.document.querySelector('#selLop')
    && w.document.querySelectorAll('#clTKBLop .cl-n').length === w.eval('lopTrongPV().length');
})());
kt('Bấm lớp trong cột ấy thì lưới chỉnh tay đổi theo, bỏ luôn ô đang chọn', ...((() => {
  w.eval(`S.oChon = Object.keys(S.tkb[S.lopXem])[0]; ve()`);
  const nut = [...w.document.querySelectorAll('#clTKBLop .cl-n')].filter(b => !b.classList.contains('on'));
  const ten = nut[1].querySelector('b').textContent;
  nut[1].dispatchEvent(new w.Event('click', {bubbles:true}));
  return [w.eval('lopId(S.lopXem)?.ten') === ten && w.eval('S.oChon') === null, `sang ${ten}`];
})()));
kt('Lớp chưa xếp đủ tiết thì nút mang dấu riêng và nói rõ THIẾU MÔN GÌ', ...((() => {
  /* Không chỉ "24/27 tiết": con số cho biết CÓ thiếu, cái tên mới cho biết
     phải đi tìm ai. */
  const luu = JSON.parse(JSON.stringify(w.eval('S.tkb')));
  const bo = w.eval(`(() => {
    const o = S.tkb[S.lopXem], k = Object.keys(o).find(x => !o[x].ghim);
    const mon = o[k].mon; delete o[k]; ve(); return mon;
  })()`);
  const nut = w.document.querySelector('#clTKBLop .cl-n.on');
  const tag = [...w.document.querySelectorAll('#noiDung .tag')].map(x => x.textContent).join(' | ');
  const ok = nut.classList.contains('thieu') && new RegExp(`Thiếu[^|]*${bo}`).test(tag)
    && new RegExp(bo).test(nut.getAttribute('title'));
  const ghi = tag.split('|').find(x => /Thiếu/.test(x))?.trim();
  w.eval(`S.tkb = ${JSON.stringify(luu)}`);   /* trả lưới về nguyên trạng */
  w.chuyen('dieuhanh');                       /* và trả màn hình về chỗ cũ */
  return [ok, `bỏ 1 tiết ${bo} → ${ghi}`];
})()));

kt('Chưa xếp tiết nào thì không bày khối sản phẩm rỗng, ba bước lên trước', (() => {
  const luu = JSON.parse(JSON.stringify(w.eval('S.tkb')));
  w.eval('S.lop.forEach(l=>S.tkb[l.id]={}); KQ_XEP=null; ve()');
  const html = w.document.querySelector('#noiDung').innerHTML;
  const khong = !w.document.querySelector('#noiDung .the .tt');
  w.eval(`S.tkb = ${JSON.stringify(luu)}; ve()`);
  return khong && /Dữ liệu nhà trường/.test(html);
})());
kt('Vòng tròn phần trăm căn giữa bằng flex một cột, không phải lưới hai hàng', (() => {
  const css = w.document.documentElement.innerHTML;
  const i = css.indexOf('.donut{');
  const kh = css.slice(i, i + 220);
  return /flex-direction:column/.test(kh) && /justify-content:center/.test(kh)
    && !/display:grid/.test(kh);
})());

console.log('\n15g. Ngăn kéo điều hướng trên điện thoại');
kt('Có nút ☰ và nền mờ; mặc định ngăn kéo đóng',
   !!w.document.querySelector('#btMenu') && !!w.document.querySelector('#manMenu') &&
   !w.document.body.classList.contains('mo-menu'));
/* Lỗi thật trên iPhone: quên bật display cho nền mờ trong media query nên
   nó vẫn mang display:none của quy tắc gốc — mở ngăn kéo ra là kẹt cứng,
   bấm đâu cũng không đóng được. */
kt('Nền mờ được bật hiển thị trong khổ điện thoại — có lối đóng ngăn kéo', (() => {
  const css = w.document.documentElement.innerHTML;
  const i = css.indexOf('@media(max-width:900px)');
  const khoi = css.slice(i, i + 2600);
  return /\.man-menu\{display:block/.test(khoi);
})());
w.document.querySelector('#btMenu').dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Bấm ☰ là mở ngăn kéo', w.document.body.classList.contains('mo-menu'));
w.document.querySelector('#manMenu').dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Chạm nền mờ là đóng lại', !w.document.body.classList.contains('mo-menu'));
kt('Chọn một mục thì ngăn kéo tự đóng — không che mất màn hình vừa mở', (() => {
  w.document.querySelector('#btMenu').dispatchEvent(new w.Event('click', { bubbles: true }));
  w.chuyen('lop');
  return !w.document.body.classList.contains('mo-menu') && w.eval('S.trangHienTai') === 'lop';
})());
kt('Thanh trên đủ bộ: logo, tên trường tách riêng để co giãn được',
   !!w.document.querySelector('.thanh-bt img') && !!w.document.querySelector('.thanh-ten'));
kt('Không có cảnh báo nào thì badge chuông ẩn hẳn, không hiện số 0', (() => {
  const cu = w.eval('KT.vm');
  w.eval('KT.vm = []; capNhatDem()');
  const an = w.document.querySelector('#slChuong').style.display === 'none';
  w.eval('KT = kiemTra(); capNhatDem()');
  return an;
})());
kt('CHƯA đăng nhập thì badge chuông im lặng; đăng nhập rồi mới báo số', (() => {
  /* Người lạ mở trang mà thấy ngay huy hiệu đỏ "4" của dữ liệu mẫu thì
     chỉ tổ hoang mang — badge chỉ có nghĩa khi biết mình là ai. */
  w.eval('capNhatDem()');                                /* KHO.nguoiDung đang null */
  const im = w.document.querySelector('#slChuong').style.display === 'none';
  w.eval('KHO.nguoiDung={id:"t",hoTen:"Thử",vaiTro:"quan_tri"}; capNhatDem()');
  const bao = w.document.querySelector('#slChuong').style.display !== 'none'
    && +w.document.querySelector('#slChuong').textContent > 0;
  w.eval('KHO.nguoiDung=null; capNhatDem()');
  return im && bao;
})());

console.log('\n15f. Đăng nhập Google và phễu demo');
/* Giả có máy chủ nhưng chưa đăng nhập → màn chào */
w.eval(`KHO.cauHinh={url:'https://gia.supabase.co',khoa:'k'}; S.trangHienTai='chao'; ve()`);
kt('Màn chào chỉ còn MỘT cửa: Google — không còn lối đăng nhập mật khẩu nào',
   w.document.querySelector('#btChaoGoogle')?.tagName === 'BUTTON' &&
   !w.document.querySelector('#btChaoVao') &&
   !!w.document.querySelector('#btChaoDemo'));
/* Không còn Ô NHẬP mật khẩu ở bất kỳ đâu — câu trấn an "không cần mật khẩu"
   thì vẫn giữ, đó là điều người dùng cần nghe. */
kt('Không còn ô nhập mật khẩu nào trong toàn bộ trang', (() => {
  w.eval('hopMayChu()');
  const con = w.document.querySelectorAll('input[type="password"]').length;
  w.eval('dong()');
  return con === 0 && !w.document.querySelector('#dnMK') && !w.document.querySelector('#tkMK');
})());
/* Lỗi thật trên iPhone 2/8/2026: mở trang bằng địa chỉ thiếu dấu / cuối thì
   redirect_to lệch với Redirect URLs của Supabase, đăng nhập xong bị ném về
   Site URL và rơi vào trang 404 của GitHub. */
kt('Đường về sau đăng nhập Google luôn là thư mục có dấu / cuối', (() => {
  const th = w.eval('duongVeChuan');
  return th({ origin: 'https://a.github.io', pathname: '/tkb' }) === 'https://a.github.io/tkb/'
    && th({ origin: 'https://a.github.io', pathname: '/tkb/' }) === 'https://a.github.io/tkb/'
    && th({ origin: 'http://localhost:5173', pathname: '/src/index.html' }) === 'http://localhost:5173/src/'
    && th({ origin: 'https://a.github.io', pathname: '/' }) === 'https://a.github.io/';
})());
kt('Địa chỉ đăng nhập Google mang theo đúng đường về đã chuẩn hoá', (() => {
  const d = w.eval(`(()=>{KHO.cauHinh={url:'https://x.supabase.co',khoa:'k'};return diaChiDangNhapGoogle()})()`);
  return d.includes('provider=google') &&
    d.includes('redirect_to=' + encodeURIComponent(w.eval('duongVeChuan(location)')));
})());

kt('Hộp đăng nhập chỉ còn nút Google và lối đăng ký trường mới', (() => {
  w.eval('hopMayChu()');
  const co = !!w.document.querySelector('#dnGoogle') && !!w.document.querySelector('#dnTruongMoi')
    && !w.document.querySelector('#dnEmail');
  w.eval('dong()');
  return co;
})());
w.document.querySelector('#btChaoDemo').dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Bấm demo là vào thẳng bảng điều hành với dữ liệu mẫu, có dải nổi nhắc',
   w.eval('KHO.xemDemo') === true && w.eval('S.trangHienTai') === 'dieuhanh' &&
   w.eval('S.lop.length') > 0 && !!w.document.querySelector('#theDemo'));
w.document.querySelector('#btDemoThoat').dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Thoát demo là về màn chào, dải nổi biến mất',
   w.eval('KHO.xemDemo') === false && w.eval('S.trangHienTai') === 'chao' &&
   !w.document.querySelector('#theDemo'));
/* Khách: đã đăng nhập Google nhưng chưa thuộc trường nào */
w.eval(`KHO.khach={email:'khach@gmail.com'}; ve()`);
kt('Khách thấy ba lối đi: demo, mã mời, đăng ký trường — kèm email của mình',
   /khach@gmail\.com/.test(w.document.querySelector('#noiDung').textContent) &&
   !!w.document.querySelector('#btChaoMaMoi') && !!w.document.querySelector('#btChaoTruongMoi2'));
/* Lỗi thật trên iPhone 2/8/2026: đã đăng nhập Google mà nút vẫn ghi "Đăng
   nhập" — thầy cô tưởng chưa vào được, bấm đăng nhập lại lần nữa vô nghĩa. */
kt('Là khách thì nút trên thanh hiện tên tài khoản, không mời đăng nhập nữa', (() => {
  w.eval('capNhatTaiKhoan()');
  const chu = w.document.querySelector('#chuDangNhap').textContent;
  return chu !== 'Đăng nhập' && /khach/.test(chu);
})());
kt('Bấm nút đó khi là khách thì mở lối thoát, không mở lại hộp đăng nhập', (() => {
  w.eval('hopMayChu()');
  const nut = [...w.document.querySelectorAll('#hopC button')].map(b => b.textContent);
  const co = nut.includes('Đăng xuất') && nut.includes('Nhập mã mời')
    && !w.document.querySelector('#dnGoogle');
  w.eval('dong()');
  return co;
})());
kt('Email dài không tràn khung: tiêu đề chào bọc chữ và co theo bề ngang', (() => {
  const h = w.document.querySelector('#noiDung h2');
  return /overflow-wrap:\s*anywhere/.test(h.getAttribute('style') || '')
    && /clamp\(/.test(h.getAttribute('style') || '');
})());
w.document.querySelector('#btChaoMaMoi').dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Bấm "Nhập mã mời" là mở hộp gõ mã',
   /Nhập mã mời/.test(w.document.querySelector('#hopT').textContent) &&
   !!w.document.querySelector('#mmMa'));
w.eval('dong()');
w.eval(`dangXuat(); KHO.cauHinh=null; S.trangHienTai='dieuhanh'; ve()`);
kt('Dọn xong trạng thái thử — app về bình thường',
   !w.eval('KHO.khach') && !w.document.querySelector('#theDemo'));

kt('Giáo viên được phân dạy thay thấy dải báo ngay trên màn hình Của tôi', (() => {
  w.eval(`(() => {
    const co = Object.values(S.tkb).flatMap(o => Object.values(o))[0];
    S.dayThay = [{id:'x1', ngay:'2099-01-05', buoi:'S', tiet:1, lopId:Object.keys(S.tkb)[0],
                  mon:'Toán', gvVangId:'ai-do', gvThayId:S.nguoiDung.gvId || S.giaoVien[0].id}];
  })()`);
  w.chuyen('cuatoi');
  const co = /tiết dạy thay sắp tới/.test(w.document.querySelector('#noiDung').textContent);
  w.eval('S.dayThay = []');
  return co;
})());
w.chuyen('xuatin');
kt('Mỗi thẻ in đều có nút Tải Word đi kèm',
   !!w.document.querySelector('#btWordRong') && !!w.document.querySelector('#btWordLop') &&
   !!w.document.querySelector('#btWordGV'));

console.log('\n16. Logo và tệp Excel');
kt('Logo hiện ở cả thanh bên và thanh trên cùng, nhúng thẳng trong trang',
   !!w.document.querySelector('.hieu-bt img') && !!w.document.querySelector('.thanh-bt img') &&
   /^data:image\/png;base64,/.test(w.document.querySelector('.hieu-bt img').getAttribute('src')));
kt('Trang có favicon riêng, không dùng biểu tượng mặc định của trình duyệt', (() => {
  const l = w.document.querySelector('link[rel="icon"]');
  return !!l && /^data:image\/png;base64,/.test(l.getAttribute('href'));
})());
kt('Nạp ExcelJS để ghi tệp có màu, có viền, có khổ giấy', (() => {
  const ma = w.document.documentElement.innerHTML;
  return /exceljs/.test(ma) && /xlsx@0\.18/.test(ma);
})(), 'SheetJS đọc tệp · ExcelJS ghi tệp');
kt('Bảng mẫu nhập vẫn đúng ba trang tính và tên cột',
   w.bangMauNhap().gv[0].join() === 'Ma_GV,Ho_ten,Chu_nhiem,Dinh_muc');

console.log('\n16b. Ô tìm kiếm trong danh sách dài');
/* Gõ vào ô tìm kiếm rồi phát sự kiện input đúng như trình duyệt thật */
const goTim = (inp, chu) => {
  inp.value = chu;
  inp.dispatchEvent(new w.Event('input', { bubbles: true }));
};
const hangHien = ma => [...w.document.querySelectorAll(`#${ma} [data-loctu]`)]
  .filter(h => h.style.display !== 'none');

kt('Danh sách ngắn KHÔNG bày ô tìm kiếm, danh sách dài thì có',
   w.oLoc('bX', 4, 'lớp', 'tìm…') === '' && w.oLoc('bX', 40, 'lớp', 'tìm…').includes('data-loc="bX"'));
kt('Tìm bỏ dấu, không phân biệt hoa thường; nhiều từ khoá là phép VÀ',
   w.khopLoc('Nguyễn Thị Hương', 'huong') && w.khopLoc('Nguyễn Thị Hương', 'NGUYEN huong')
   && !w.khopLoc('Nguyễn Thị Hương', 'huong lan') && w.khopLoc('Lớp 1A · Diễn Đồng', 'dien dong'));

w.chuyen('lop');
const oLop = w.document.querySelector('[data-loc="bLop"]');
kt('Màn hình Lớp học có ô tìm kiếm kèm số đếm',
   !!oLop && /^\d+ lớp$/.test(w.document.querySelector('[data-locdem="bLop"]').textContent));
const maMotLop = hangHien('bLop')[0].dataset.loctu.split(' ')[0];
goTim(oLop, maMotLop);
kt(`Gõ mã lớp "${maMotLop}" thì chỉ còn đúng dòng lớp ấy`, hangHien('bLop').length === 1);
kt('Số đếm đổi thành dạng "còn / tổng" và được tô đậm',
   /^1\/\d+ lớp$/.test(w.document.querySelector('[data-locdem="bLop"]').textContent)
   && w.document.querySelector('[data-locdem="bLop"]').classList.contains('hep'));
kt('LỌC TẠI CHỖ — không vẽ lại màn hình, ô tìm kiếm vẫn là chính nó',
   w.document.querySelector('[data-loc="bLop"]') === oLop && oLop.value === maMotLop);
goTim(oLop, 'khong-co-lop-nao-ten-the-nay');
kt('Không dòng nào khớp thì hiện dải nhắc, không để bảng trống trơn', (() => {
  const r = w.document.querySelector('[data-locrong="bLop"]');
  return hangHien('bLop').length === 0 && r.classList.contains('hien') && /Không có lớp nào khớp/.test(r.textContent);
})());
kt('Bấm nút × là trả lại đủ danh sách', (() => {
  w.document.querySelector('[data-locxoa="bLop"]').dispatchEvent(new w.Event('click', { bubbles: true }));
  const tong = w.document.querySelectorAll('#bLop [data-loctu]').length;
  return oLop.value === '' && hangHien('bLop').length === tong
    && !w.document.querySelector('[data-locrong="bLop"]').classList.contains('hien');
})());

w.chuyen('giaovien');
const oGV = w.document.querySelector('[data-loc="bGV"]');
/* Thầy cô gõ điện thoại rất ít khi bỏ dấu đúng — bỏ dấu vẫn phải ra người cần tìm */
const aiDo = w.eval('S.giaoVien')[0].hoTen;
const khongDauTen = aiDo.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();
goTim(oGV, khongDauTen);
kt(`Gõ không dấu "${khongDauTen}" vẫn tìm ra "${aiDo}"`,
   hangHien('bGV').some(h => h.dataset.loctu.includes(aiDo)));
goTim(oGV, '');

w.chuyen('phancong');
const fTim = w.document.querySelector('#fTim');
const monMotDong = w.eval('S.phanCong')[0].mon;
kt('Bảng phân công có ô tìm kiếm chung với hai ô lọc cũ', !!fTim);
/* Ô này dò cả tên giáo viên lẫn môn, nên gõ "Tiếng Anh" còn ra dòng của cô
   Ngọc Anh — đúng ý. Điều phải canh là KHÔNG SÓT: mọi dòng của môn ấy đều còn. */
kt(`Lọc theo môn "${monMotDong}" không sót dòng nào của môn ấy`, (() => {
  goTim(fTim, monMotDong);
  const con = [...w.document.querySelectorAll('#bPC tbody tr')].length;
  const can = w.eval('S.phanCong').filter(p => p.mon === monMotDong).length;
  return can > 0 && con >= can && con < w.eval('S.phanCong').length;
})());
/* Gõ mã lớp — thứ không bao giờ trùng với tên người — thì lọc phải sạch tuyệt đối */
kt(`Gõ mã lớp "${maMotLop}" thì mọi dòng còn lại đều của đúng lớp ấy`, (() => {
  goTim(fTim, maMotLop);
  const o = [...w.document.querySelectorAll('#bPC tbody tr')];
  const ten = w.eval('S.lop').find(l => l.maLop === maMotLop).ten;
  return o.length > 0 && o.every(tr => tr.children[1].textContent.trim() === ten);
})());
goTim(fTim, monMotDong);
kt('Ô tóm tắt đếm lại theo bộ lọc, không giữ số cũ',
   /^\d+ dòng · \d+ tiết$/.test(w.document.querySelector('#tomTat').textContent));
kt('Vẽ lại bảng phân công KHÔNG cướp con trỏ đang gõ — ô tìm kiếm nằm ngoài #bPC',
   w.document.querySelector('#fTim') === fTim && fTim.value === monMotDong);
goTim(fTim, '');

w.chuyen('tkbgv');
const oSel = w.document.querySelector('[data-locsel="selGV"]');
kt('Ô chọn giáo viên dài đi kèm ô tìm kiếm riêng', !!oSel);
kt('Lọc ô chọn thì mục đang xem KHÔNG BAO GIỜ bị giấu — không để ô chọn trống trơn', (() => {
  goTim(oSel, 'zzz-khong-co-ai');
  const sel = w.document.querySelector('#selGV');
  const dangChon = [...sel.options].find(o => o.value === sel.value);
  return !dangChon.hidden && [...sel.options].filter(o => !o.hidden).length === 1;
})());
goTim(oSel, '');

console.log('\n17. PWA — cài lên màn hình chính điện thoại');
kt('Trang khai manifest, màu chủ đề và biểu tượng cho iPhone',
   w.document.querySelector('link[rel="manifest"]')?.getAttribute('href') === 'manifest.webmanifest'
   && w.document.querySelector('meta[name="theme-color"]')?.getAttribute('content') === '#0F5132'
   && !!w.document.querySelector('link[rel="apple-touch-icon"]'));
kt('manifest.webmanifest hợp lệ, đủ tên + biểu tượng + chạy độc lập', (() => {
  const m = JSON.parse(readFileSync(join(goc, 'src/manifest.webmanifest'), 'utf8'));
  return m.name && m.short_name && m.display === 'standalone'
    && Array.isArray(m.icons) && m.icons.length >= 2
    && m.icons.every(i => { readFileSync(join(goc, 'src', i.src)); return true; });
})());
kt('sw.js đọc được, có xử lý fetch và KHÔNG BAO GIỜ cache Supabase', (() => {
  const sw = readFileSync(join(goc, 'src/sw.js'), 'utf8');
  new Function(sw);                       /* chỉ soát cú pháp, không chạy */
  return sw.includes("addEventListener('fetch'") && sw.includes('.supabase.co');
})());
kt('Trình duyệt giả không có serviceWorker mà trang vẫn chạy — đăng ký được rào đúng',
   !('serviceWorker' in w.navigator));

console.log('\n17a. Lịch cá nhân tách SÁNG · CHIỀU; lưới rộng nhẹ tay hơn');
{
  const vai = { ...S.nguoiDung };
  /* Chọn một giáo viên có dạy cả sáng lẫn chiều */
  const coCaHai = S.giaoVien.find(g => {
    const b = new Set();
    Object.values(S.tkb).forEach(o => Object.entries(o).forEach(([k, v]) => {
      if (v.gvId === g.id) b.add(k.split('-')[1]);
    }));
    return b.has('S') && b.has('C');
  });
  S.nguoiDung = { vaiTro: 'gv', gvId: coCaHai.id, diemTruongId: null };
  w.chuyen('cuatoi');
  const nhan = [...w.document.querySelectorAll('.bnhan')].map(x => x.textContent);
  kt('Mỗi ngày tách thành khối SÁNG và khối CHIỀU có nhãn riêng',
     nhan.some(x => /SÁNG/.test(x)) && nhan.some(x => /CHIỀU/.test(x)),
     `${nhan.length} nhãn buổi`);
  kt('Nhãn buổi đếm đúng số tiết của buổi đó', (() => {
    const nhom = w.document.querySelector('.bnhom');
    const so = +(nhom.querySelector('.bnhan span').textContent.match(/\d+/) || [0])[0];
    return so === nhom.querySelectorAll('.tiet-ca').length;
  })());
  kt('Thẻ tiết bỏ chữ SÁNG/CHIỀU thừa — nhãn nhóm đã nói rồi',
     [...w.document.querySelectorAll('.tiet-ca .st')]
       .every(x => /^Tiết \d+$/.test(x.textContent.trim())),
     w.document.querySelector('.tiet-ca .st')?.textContent);
  kt('Buổi sáng luôn đứng trước buổi chiều',
     !/CHIỀU/.test(nhan[0] || ''), nhan[0]);
  S.nguoiDung = vai;

  /* Dải nút điểm trường phải ghi tên GỌN và ĐỒNG NHẤT. Tên chính thức đều là
     "Điểm trường Diễn ...", nhưng nơi hiện đủ nơi hiện gọn thì nút dài ngắn
     lệch nhau, trên điện thoại tràn hàng. Dựng lại đúng cả hai kiểu tên. */
  if(S.diemTruong.length > 1){
    const tenCu = S.diemTruong.map(d => d.ten);
    /* Dải nút chỉ hiện khi người xem thấy được từ hai điểm trường trở lên —
       PHT bị bó vào một điểm thì không có dải nào để soi. */
    S.nguoiDung = { vaiTro: 'qt', gvId: null, diemTruongId: null };
    S.phamVi = '';
    S.diemTruong[0].ten = 'Điểm trường Diễn Đồng';
    S.diemTruong[1].ten = 'Điểm trường Diễn Thái'.normalize('NFD');  /* dấu rời */
    w.chuyen('toantruong');
    const nut = [...w.document.querySelectorAll('.dt-nut')].map(x => x.textContent);
    kt('Dải nút điểm trường không còn chữ "Điểm trường" thừa',
       nut.length > 1 && nut.every(x => !/Điểm\s*trường/i.test(x.normalize('NFC'))),
       nut.join(' | '));
    kt('Cắt được cả tên gõ ở dạng dấu rời — nhìn giống hệt nhau nên rất dễ sót',
       nut.some(x => /Diễn Thái/.test(x.normalize('NFC'))), nut.join(' | '));
    S.diemTruong.forEach((d, i) => { d.ten = tenCu[i]; });
  }

  /* Lưới rộng: ô có tiết không còn đeo thanh màu 3px. 25–60 cột mà ô nào cũng
     một thanh đậm thì cả bảng thành sọc — chủ dự án kêu "đường kẻ quá đậm". */
  w.chuyen('toantruong');
  const oCoTiet = [...w.document.querySelectorAll('table.tt td.o-mau')];
  kt('Ô có tiết dùng lớp màu chung, không nhét style thanh 3px vào từng ô',
     oCoTiet.length > 0 && oCoTiet.every(o => !/border-left:\s*3px/.test(o.getAttribute('style') || '')),
     `${oCoTiet.length} ô`);
  kt('Màu môn vẫn còn — nhận diện bằng chữ tên môn, không mất đi',
     oCoTiet.every(o => /\bm-[a-z]+\b/.test(o.className)));
}

console.log('\n17b. Lịch trống thì phải nói ĐÚNG vì sao trống');
/* Sự cố 2/8/2026: một cô giáo nhập mã mời xong, vào được phần mềm, thấy đúng
   tên mình, nhưng màn hình Của tôi trắng trơn kèm dòng "Nhà trường chưa xếp
   xong" — trong khi trường đã xếp trọn 710/710 tiết. Câu ấy nói sai chuyện và
   giấu mất lỗi thật. Ba nguyên nhân, ba cách sửa khác hẳn nhau. */
{
  const vaiCu = { ...S.nguoiDung }, tkbCu = S.tkb, gvCu = S.giaoVien.slice();
  const noiDung = () => w.document.querySelector('#noiDung').textContent;

  /* (a) Lưới rỗng hẳn + vai trò giáo viên → chưa CÔNG BỐ, không phải chưa xếp.
     Giáo viên chỉ đọc được bản đã công bố, nên đây gần như luôn là nguyên nhân. */
  S.nguoiDung = { vaiTro: 'gv', gvId: S.giaoVien[0].id, diemTruongId: null };
  S.tkb = {};
  w.chuyen('cuatoi');
  kt('Lưới rỗng: nói "chưa công bố", KHÔNG đổ cho "chưa xếp xong"',
     /chưa công bố/i.test(noiDung()) && !/chưa xếp xong/i.test(noiDung()));

  /* (b) Trường đã xếp mà hồ sơ đang nối lại không có dòng phân công nào —
     đúng tình huống mã mời nối nhầm một trong hai người trùng tên. */
  S.tkb = tkbCu;
  S.giaoVien.push({ id: 'gv-ma-trung', hoTen: 'Nguyễn Thị Oanh', maGV: 'GV-TRUNG',
                    tenNgan: 'GV-TRUNG', cn: '', dinhMuc: 23 });
  S.nguoiDung = { vaiTro: 'gv', gvId: 'gv-ma-trung', diemTruongId: null };
  w.chuyen('cuatoi');
  kt('Hồ sơ không có phân công: chỉ thẳng là nối nhầm, kèm MÃ để quản trị dò',
     /nối nhầm/i.test(noiDung()) && noiDung().includes('GV-TRUNG'));
  /* Lời nhắc phải trỏ tới một nút CÓ THẬT. Bản đầu chỉ thầy cô sang
     "Giáo viên → Tài khoản đăng nhập", mà màn hình ấy chỉ liệt kê và xoá,
     không nối lại được — chỉ đường tới một cái nút không tồn tại. */
  kt('Và nói rõ chỗ sửa, không bắt thầy cô tự đoán',
     /Chuyển tài khoản/i.test(noiDung()));
  kt('Chỗ ấy phải là một nút CÓ THẬT trên màn hình Giáo viên', (() => {
     S.giaoVien[0].nguoiDungId = 'u-nao-do';
     const vai = { ...S.nguoiDung };
     S.nguoiDung = { vaiTro: 'qt', gvId: null, diemTruongId: null };
     w.chuyen('giaovien');
     const co = !!w.document.querySelector('#btChuyenTK');
     S.nguoiDung = vai; delete S.giaoVien[0].nguoiDungId;
     return co;
  })());

  /* (c) Có phân công đàng hoàng nhưng bản đang xem không chứa tiết nào của
     người ấy → bản công bố cũ, xếp lại rồi công bố lại. */
  S.phanCong.push({ gvId: 'gv-ma-trung', lopId: S.lop[0].id, mon: 'Toán', soTiet: 4 });
  w.chuyen('cuatoi');
  kt('Có phân công mà bản đang xem không có tiết: nói bản cũ, bảo công bố lại',
     /bản/i.test(noiDung()) && /công bố lại/i.test(noiDung()) &&
     !/nối nhầm/i.test(noiDung()));

  /* Cùng lời giải thích ấy phải có ở màn hình Theo giáo viên của người xếp —
     đây chính là chỗ chủ dự án nhìn thấy lưới trống mà không hiểu vì sao. */
  S.nguoiDung = vaiCu;
  S.gvXem = 'gv-ma-trung';
  w.chuyen('tkbgv');
  kt('Màn hình Theo giáo viên cũng giải thích lưới trống, không để người xếp đoán',
     /không chứa tiết nào của giáo viên này/i.test(noiDung()));

  /* Phát mã hàng loạt: hai nhóm phải bị bỏ qua, cả hai đều rút từ sự cố trên */
  S.giaoVien[0].nguoiDungId = 'u-da-co';
  S.giaoVien.push({ id: 'gv-thua', hoTen: 'Hồ sơ thừa', maGV: 'GV-THUA',
                    tenNgan: 'GV-THUA', cn: '', dinhMuc: 23 });
  const canPhat = w.eval('canPhatMa([])');
  kt('Phát mã hàng loạt bỏ qua người đã có tài khoản',
     !canPhat.ds.some(g => g.id === S.giaoVien[0].id));
  kt('Bỏ qua luôn hồ sơ chưa được phân công tiết nào — phát vào đó là hứa hão',
     !canPhat.ds.some(g => g.id === 'gv-thua') && canPhat.boQua >= 1,
     `bỏ qua ${canPhat.boQua} hồ sơ`);
  kt('Người đã cầm mã còn hạn thì không phát chồng mã thứ hai',
     w.eval(`canPhatMa([{gvId:'${S.giaoVien[1].id}', daDung:false, conHan:true}])`)
       .ds.every(g => g.id !== S.giaoVien[1].id));
  kt('Mã đã dùng rồi hoặc đã hết hạn thì không tính là còn hiệu lực',
     w.eval(`canPhatMa([{gvId:'${S.giaoVien[1].id}', daDung:true, conHan:true}])`)
       .ds.some(g => g.id === S.giaoVien[1].id));

  /* Hộp Chuyển tài khoản: đường sửa khi mã mời nối nhầm hồ sơ trùng tên.
     Dựng lại đúng tình huống thật — tài khoản đang nằm ở hồ sơ 0 tiết. */
  S.giaoVien.push({ id: 'gv-nham', hoTen: 'Nguyễn Thị Oanh', maGV: 'GV-NHAM',
                    tenNgan: 'GV-NHAM', cn: '', dinhMuc: 23, nguoiDungId: 'u-co-oanh' });
  w.eval('hopChuyenTaiKhoan()');
  const hopCTK = w.document.querySelector('#hopN');
  kt('Hộp Chuyển tài khoản dựng được, có hồ sơ nguồn và hồ sơ đích',
     !!hopCTK?.querySelector('#ctkNguon') && !!hopCTK?.querySelector('#ctkDich'));
  kt('Ô chọn hồ sơ ghi rõ SỐ TIẾT — không bao giờ chỉ có họ tên',
     [...hopCTK.querySelectorAll('#ctkDich option')]
       .every(o => /tiết|CHƯA CÓ TIẾT NÀO/.test(o.textContent)));
  kt('Hồ sơ nguồn không có tiết nào thì cảnh báo đỏ ngay, không đợi bấm',
     /không có tiết nào/i.test(w.document.querySelector('#ctkCanh')?.textContent || ''),
     w.document.querySelector('#ctkCanh')?.textContent?.slice(0, 40) || '(không có)');
  kt('Hồ sơ 0 tiết được xếp lên ĐẦU ô chọn nguồn — đúng chỗ cần sửa',
     hopCTK.querySelector('#ctkNguon option')?.value === 'gv-nham');
  w.eval('dong()');
  S.giaoVien.splice(S.giaoVien.findIndex(g => g.id === 'gv-nham'), 1);

  /* Hộp Mã mời dựng được thật, có nút phát cả mẻ và nói rõ bỏ qua bao nhiêu */
  await w.eval('hopMaMoi()');
  const hopN = w.document.querySelector('#hopN');
  kt('Hộp Mã mời có nút phát cả mẻ, ghi rõ số người còn thiếu đường vào',
     /Tạo \d+ mã/.test(hopN?.querySelector('#btMaHangLoat')?.textContent || ''),
     hopN?.querySelector('#btMaHangLoat')?.textContent || '(không có nút)');
  kt('Và nói rõ đã bỏ qua hồ sơ chưa phân công — không lặng lẽ cắt bớt',
     /Bỏ qua \d+ hồ sơ/.test(hopN?.textContent || ''));
  w.eval('dong()');

  /* Trả lại nguyên trạng cho các phép thử sau */
  S.phanCong.pop();
  S.giaoVien.length = 0; gvCu.forEach(g => S.giaoVien.push(g));
  delete S.giaoVien[0].nguoiDungId;
  S.nguoiDung = vaiCu; S.tkb = tkbCu; S.gvXem = null;
  w.chuyen('dieuhanh');
}

console.log('\n19. Menu năm nhóm mở được');
w.chuyen('dieuhanh');
kt('Thông tin trường nằm trong DỮ LIỆU NHÀ TRƯỜNG, không phải HỆ THỐNG', ...((() => {
  /* Chủ dự án chỉ ra 3/8/2026: tên trường, năm học, địa bàn là DỮ LIỆU của
     nhà trường, không phải thiết lập hệ thống. Và nó là việc khai đầu tiên
     nên đứng đầu nhóm. */
  const m = w.document.querySelector('.mi[data-t="thongtin"]');
  const dl = [...w.document.querySelectorAll('.nh[data-nh="dl"] .mi')].map(x => x.dataset.t);
  return [m.dataset.nh === 'dl' && dl[0] === 'thongtin', dl.join(' · ')];
})()));
kt('Nhãn nhóm NỔI KHỐI, mục con giảm nhẹ — thứ bậc không bị lộn ngược', (() => {
  /* Canh THỨ BẬC chứ không canh con số cụ thể: nhãn nhóm phải có nền và
     chữ trắng đậm; mục con thì KHÔNG có nền riêng, để nhãn nhóm nổi hơn.
     Trước 3/8/2026 ngược lại — mục con là thẻ có nền và viền, nhãn nhóm
     trong suốt, nên nhìn tổng thể cấp dưới nổi hơn cấp trên. */
  const css = w.document.documentElement.innerHTML;
  const nhom = css.slice(css.indexOf('.nhom{display:flex'), css.indexOf('.nhom{display:flex') + 400);
  const mi = css.slice(css.indexOf('.mi{display:flex'), css.indexOf('.mi{display:flex') + 400);
  const nhomCoNen = /background:rgba\(255,255,255,\.1/.test(nhom) && /color:#fff/.test(nhom)
    && /font-weight:800/.test(nhom);
  const miNheDi = /background:none/.test(mi) && /border:0/.test(mi);
  return nhomCoNen && miNheDi;
})());
kt('Mục đang mở vẫn nổi rõ — ngoại lệ duy nhất của việc giảm nhẹ', (() => {
  const css = w.document.documentElement.innerHTML;
  return /\.mi\.on\{background:var\(--nav-3\)/.test(css)
    && /\.mi\.on::before\{[^}]*var\(--vang\)/.test(css);
})());
kt('Thanh bên gom đúng năm nhóm', ...((() => {
  const n = [...w.document.querySelectorAll('.nh')].map(x => x.dataset.nh);
  return [n.length === 5 && n.join() === 'dh,tc,dl,qk,ht', n.join(' · ')];
})()));
kt('Mở app thì nhóm Điều hành bung sẵn, bốn nhóm kia thu lại', (() => {
  /* Dựng lại đúng trạng thái lúc mới mở app: chưa ai bấm mở nhóm nào */
  w.eval('S.nhomMo = {}; S.trangHienTai = "dieuhanh"; ve()');
  const mo = [...w.document.querySelectorAll('.nh.mo')].map(x => x.dataset.nh);
  return mo.length === 1 && mo[0] === 'dh';
})());
kt('Chọn một trang thì nhóm chứa trang đó TỰ bung ra', (() => {
  w.chuyen('phancong');
  return w.document.querySelector('.nh[data-nh="dl"]').classList.contains('mo');
})());
kt('Bấm nhãn nhóm là mở ra được, và trạng thái ấy GIỮ qua lần vẽ lại', (() => {
  /* Dùng nhóm KHÔNG chứa trang đang mở: nhóm chứa trang đang mở thì
     dungMenu() luôn bung lại — đó là hành vi đúng, không phải lỗi. */
  w.chuyen('dieuhanh');
  const nut = [...w.document.querySelectorAll('.nhom')].find(b => b.dataset.monh === 'ht');
  nut.dispatchEvent(new w.Event('click', {bubbles:true}));
  const mo = w.document.querySelector('.nh[data-nh="ht"]').classList.contains('mo');
  w.eval('ve()');
  const giuMo = w.document.querySelector('.nh[data-nh="ht"]').classList.contains('mo');
  nut.dispatchEvent(new w.Event('click', {bubbles:true}));
  w.eval('ve()');
  const giuDong = !w.document.querySelector('.nh[data-nh="ht"]').classList.contains('mo');
  return mo && giuMo && giuDong;
})());
kt('Vạch vàng đánh dấu mục đang mở vẫn còn nguyên', (() => {
  const css = w.document.documentElement.innerHTML;
  return /\.mi\.on::before\{[^}]*var\(--vang\)/.test(css);
})());
kt('Mỗi mục nhớ mình thuộc nhóm nào — không dò bằng nth-child', (() => {
  return [...w.document.querySelectorAll('.mi')].every(m => !!m.dataset.nh);
})());
kt('Nhóm đang đóng mà bên trong có việc gấp thì bày huy hiệu tổng lên nhãn', (() => {
  const css = w.document.documentElement.innerHTML;
  return /\.nh:not\(\.mo\) \.nhom-n\.co\{display:inline-block\}/.test(css);
})());

console.log('\n19b. Năm màn hình mới của nhóm Quản lý và Hệ thống');
for (const [t, chu] of [['phuongan','So sánh phương án'], ['phienban','Bản đang sử dụng'],
                        ['nhatky','thao tác gần nhất'], ['nguoidung','Tài khoản đăng nhập'],
                        ['saoluu','Tải bản sao lưu']]) {
  w.chuyen(t);
  kt(`Màn hình "${t}" mở được và có nội dung thật`,
     w.eval('S.trangHienTai') === t
     && new RegExp(chu).test(w.document.querySelector('#noiDung').textContent));
}
kt('Phiên bản bày đủ ba trạng thái: bản nháp · đang sử dụng · đã lưu trữ', (() => {
  w.chuyen('phienban');
  const t = w.document.querySelector('#noiDung').textContent;
  return /BẢN NHÁP/.test(t) && /ĐANG SỬ DỤNG/.test(t) && /ĐÃ LƯU TRỮ/.test(t);
})());
kt('Sao lưu nói rõ nạp tệp sẽ THAY dữ liệu, và máy chủ chưa đổi gì', (() => {
  w.chuyen('saoluu');
  const t = w.document.querySelector('#noiDung').textContent;
  return /sẽ THAY toàn bộ dữ liệu/.test(t) && /máy chủ chưa đổi gì/i.test(t);
})());
kt('Bảng phân quyền nói đủ ba vai và ghi rõ ai KHÔNG làm được gì', (() => {
  w.chuyen('nguoidung');
  const t = w.document.querySelector('#noiDung').textContent;
  return /PHT một điểm trường/.test(t) && /không/.test(t) && /Báo nghỉ/.test(t);
})());

console.log('\n19c. Biểu mẫu Báo nghỉ');
const vaiGV = { ...S.nguoiDung };
S.nguoiDung = { vaiTro: 'gv', gvId: S.giaoVien[0].id, diemTruongId: null };
w.chuyen('baonghi');
kt('Biểu mẫu đúng bốn ô — ngày, buổi, lý do, ghi chú. Không thêm thủ tục nào', (() => {
  const nd = w.document.querySelector('#noiDung');
  return !!nd.querySelector('#bnNgay') && nd.querySelectorAll('[data-bnbuoi]').length === 3
    && nd.querySelectorAll('[data-bnlydo]').length === 5 && !!nd.querySelector('#bnGhiChu');
})());
kt('Tuyệt đối không có tệp minh chứng, chữ ký hay bước phê duyệt nào', (() => {
  const t = w.document.querySelector('#noiDung').textContent;
  return !/minh chứng|chữ ký|phê duyệt|trình ký/i.test(t)
    && !w.document.querySelector('#noiDung input[type=file]');
})());
kt('Ba lựa chọn buổi đúng như bản giao việc: sáng · chiều · cả ngày', (() => {
  const v = [...w.document.querySelectorAll('[data-bnbuoi]')].map(b => b.dataset.bnbuoi);
  return v.join() === 'S,C,CN';
})());
kt('Ghi chú KHÔNG bắt buộc, và nói rõ điều đó ra',
   /không bắt buộc/i.test(w.document.querySelector('#noiDung').textContent));
kt('Xem trước ngay số tiết sẽ phải bố trí — thầy cô biết mình để lại việc gì', (() => {
  const t = w.document.querySelector('#noiDung').textContent;
  return /tiết sẽ cần bố trí dạy thay/.test(t) || /không có tiết nào/.test(t);
})());
kt('Chọn "Cả ngày" thì số tiết xem trước tăng lên', (() => {
  const so = () => {
    const m = w.document.querySelector('#noiDung').textContent.match(/(\d+) tiết sẽ cần/);
    return m ? +m[1] : 0;
  };
  w.eval(`S.bnBuoi='S'; ve()`); const a = so();
  w.eval(`S.bnBuoi='CN'; ve()`); const b = so();
  return b >= a;
})());
kt('Ngày nghỉ mặc định là ngày làm việc, không rơi vào thứ Bảy hay Chủ nhật', (() => {
  const t = w.eval('thuTuISO(ngayMacDinhNghi())');
  return t >= 2 && t <= 6;
})());
kt('Chưa nối máy chủ mà bấm Gửi thì báo rõ, không im lặng', await (async () => {
  w.document.querySelector('#btGuiNghi').dispatchEvent(new w.Event('click', {bubbles:true}));
  await new Promise(r => setTimeout(r, 60));
  return /máy chủ/i.test(w.document.querySelector('#bao').textContent);
})());
kt('Màn hình Của tôi có nút Báo nghỉ và nút Thông báo ngay đầu trang', (() => {
  w.chuyen('cuatoi');
  const di = [...w.document.querySelectorAll('#noiDung [data-di]')].map(b => b.dataset.di);
  return di.includes('baonghi') && di.includes('thongbao');
})());
S.nguoiDung = vaiGV;
w.chuyen('dieuhanh');

console.log('\n19d. Ô tìm kiếm chung');
/* Ô tìm kiếm chung nằm tĩnh trên thanh đầu trang (3/8/2026) — nút kính
   lúp #btTim mở hộp thả xuống #timNoi, theo người dùng đi mọi màn hình. */
w.chuyen('giaovien');
kt('Nút kính lúp mở hộp tìm, bấm lần nữa hoặc Escape là đóng', (() => {
  w.document.querySelector('#btTim').dispatchEvent(new w.Event('click', {bubbles:true}));
  const mo = w.document.body.classList.contains('mo-tim');
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
  const dongLai = !w.document.body.classList.contains('mo-tim');
  return mo && dongLai;
})());
kt('Màn Giáo viên chỉ còn MỘT ô lọc bảng — hết cảnh hai ô tìm chồng nhau',
   w.document.querySelectorAll('#noiDung input[type="search"], #noiDung .loc-o input').length === 1);
kt('Gõ tên giáo viên thì ra đúng người, kèm số tiết và điểm trường', (() => {
  const g = S.giaoVien[0];
  const tu = g.hoTen.split(' ').pop();
  const kq = w.eval(`ketQuaTim(${JSON.stringify(tu)})`);
  return kq.some(x => x.loai === 'Giáo viên' && /tiết\/tuần/.test(x.phu));
})());
kt('Tìm KHÔNG DẤU vẫn ra — thầy cô gõ điện thoại ít khi bỏ dấu đúng', (() => {
  const g = S.giaoVien.find(x => /ươ|ơ|ê|ô|à|á/.test(x.hoTen)) || S.giaoVien[0];
  const tu = w.eval(`khongDau(${JSON.stringify(g.hoTen.split(' ').pop())})`).toLowerCase();
  return w.eval(`ketQuaTim(${JSON.stringify(tu)})`).some(x => x.ten === g.hoTen);
})());
kt('Gõ tên lớp thì ra lớp, kèm chủ nhiệm và điểm trường', (() => {
  const kq = w.eval(`ketQuaTim('1A')`);
  return kq.some(x => x.loai === 'Lớp' && /Chủ nhiệm/.test(x.phu));
})());
kt('Tìm được cả môn học và điểm trường, không chỉ người và lớp', (() => {
  const a = w.eval(`ketQuaTim('Toán')`);
  const b = w.eval(`ketQuaTim('Diễn')`);
  return a.some(x => x.loai === 'Môn học') && b.some(x => x.loai === 'Điểm trường');
})());
kt('Gõ một chữ cái thì chưa tìm — tránh đổ cả trường ra màn hình',
   w.eval(`ketQuaTim('a')`).length === 0);
kt('Từ khoá khớp hàng chục lớp vẫn KHÔNG đẩy điểm trường ra ngoài danh sách',
   ...((() => {
     const kq = w.eval(`ketQuaTim('Diễn')`);
     const loai = [...new Set(kq.map(x => x.loai))];
     return [loai.includes('Điểm trường') && kq.filter(x => x.loai === 'Lớp').length <= 6,
       loai.join(' · ')];
   })()));

console.log('\n19d2. Cảnh báo trước thao tác ảnh hưởng nhiều tiết');
kt('Bấm "Xoá kết quả" thì HỎI trước, không xoá ngay hàng trăm tiết', (() => {
  w.eval('KQ_XEP = xepTuDong(0)');
  w.chuyen('xep');
  const truoc = w.eval('soTietDaXep()');
  w.document.querySelector('#btXoaTKB').dispatchEvent(new w.Event('click', {bubbles:true}));
  const conNguyen = w.eval('soTietDaXep()') === truoc;
  const hoi = /sẽ bị xoá khỏi lưới/.test(w.document.querySelector('#hopN').textContent);
  return truoc > 0 && conNguyen && hoi;
})());
kt('Hộp hỏi nói rõ SỐ TIẾT, không nói chung chung', (() => {
  const t = w.document.querySelector('#hopN').textContent;
  const nut = [...w.document.querySelectorAll('#hopC button')].map(b => b.textContent);
  return /tiết của \d+ lớp/.test(t) && nut.some(x => /^Xoá \d+ tiết$/.test(x))
    && nut.includes('Không xoá');
})());
kt('Bấm "Không xoá" thì lưới còn nguyên vẹn', (() => {
  const truoc = w.eval('soTietDaXep()');
  [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Không xoá')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  return w.eval('soTietDaXep()') === truoc && truoc > 0;
})());
kt('Xác nhận rồi thì xoá thật, và Hoàn tác lấy lại được', (() => {
  w.document.querySelector('#btXoaTKB').dispatchEvent(new w.Event('click', {bubbles:true}));
  [...w.document.querySelectorAll('#hopC button')].find(b => /^Xoá \d+ tiết$/.test(b.textContent))
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  const sach = w.eval('soTietDaXep()') === 0;
  w.eval('hoanTac()');
  return sach && w.eval('soTietDaXep()') > 0;
})());

console.log('\n19e. Lưới: cỡ hiển thị và toàn màn hình');
w.chuyen('toantruong');
kt('Có đủ ba cỡ hiển thị gọn · tiêu chuẩn · rộng', (() => {
  const v = [...w.document.querySelectorAll('[data-coluoi]')].map(b => b.dataset.coluoi);
  return v.join() === 'gon,tc,rong';
})());
kt('Đổi cỡ thì lớp CSS của khung lưới đổi theo', (() => {
  w.eval(`S.coLuoi='gon'; ve()`);
  const gon = !!w.document.querySelector('#noiDung .luoi-gon');
  w.eval(`S.coLuoi='rong'; ve()`);
  const rong = !!w.document.querySelector('#noiDung .luoi-rong2');
  w.eval(`S.coLuoi='tc'; ve()`);
  return gon && rong;
})());
kt('Có nút toàn màn hình, và Esc thoát ra được', (() => {
  const nut = w.document.querySelector('[data-toanmh]');
  if (!nut) return false;
  nut.dispatchEvent(new w.Event('click', {bubbles:true}));
  const bat = w.document.body.classList.contains('toan-mh');
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
  return bat && !w.document.body.classList.contains('toan-mh');
})());
kt('Tiêu đề lưới vẫn dính hai chiều — khung cuộn vẫn đúng là .tt-boc', (() => {
  const boc = w.document.querySelector('#noiDung .tt-boc');
  return !!boc && !boc.parentElement.classList.contains('tt-boc');
})());
kt('Kéo thả sang ô ngoài khung giờ của khối thì nói rõ lý do', (() => {
  /* lớp khối 1 tan sớm hơn khối 4–5, nên có ô "không tồn tại" với khối 1 */
  const r = w.eval(`(() => {
    const l = S.lop.find(x => x.khoi === 1);
    S.lopXem = l.id;
    const co = Object.keys(S.tkb[l.id])[0];
    const ngoai = oTuan(5).map(x => x.khoa).find(k => !oTuan(1).some(y => y.khoa === k));
    if (!ngoai || !co) return null;
    return kiemTraChuyen(co, ngoai);
  })()`);
  return r === null || /đã tan trước tiết này/.test(r);
})());
w.chuyen('dieuhanh');

console.log('\n19f. Nút Đặt lại mã giáo viên');
w.chuyen('giaovien');
kt('Màn hình Giáo viên có nút Đặt lại mã giáo viên',
   !!w.document.querySelector('#btDatLaiMaGV'));
kt('Bảng Giáo viên không còn bày mã UUID nào ra màn hình', ...((() => {
  /* chuanMaGV() chạy sẵn lúc nạp nên tới đây phải sạch rồi */
  const xau = w.eval('S.giaoVien.filter(g => maGVXau(g)).length');
  return [xau === 0, `${xau} mã xấu`];
})()));
kt('Bấm nút thì HỎI trước và bày bảng xem trước mã cũ → mã mới', (() => {
  /* cố tình bôi bẩn một mã để hộp có việc phải làm */
  w.eval(`S.giaoVien[0].maGV = '1cc77cb6-df3d-469e-ac36-e4bc2171590f'; ve()`);
  w.document.querySelector('#btDatLaiMaGV').dispatchEvent(new w.Event('click', {bubbles:true}));
  const t = w.document.querySelector('#hopN').textContent;
  return /Mã hiện tại/.test(t) && /Mã mới/.test(t)
    && /1cc77cb6/.test(w.document.querySelector('#hopN').innerHTML);
})());
kt('Hộp nói rõ thứ gì KHÔNG đổi — họ tên, phân công, chủ nhiệm, tài khoản', (() => {
  const t = w.document.querySelector('#hopN').textContent;
  return /Họ tên, phân công, lớp chủ nhiệm, tài khoản đăng nhập/.test(t)
    && /giữ nguyên hoàn toàn/.test(t);
})());
kt('Bấm Huỷ thì mã giữ nguyên như cũ', (() => {
  [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Huỷ')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  return w.eval(`S.giaoVien[0].maGV`) === '1cc77cb6-df3d-469e-ac36-e4bc2171590f';
})());
kt('Xác nhận thì mã đổi, và họ tên với phân công không xê dịch', ...((() => {
  const truoc = w.eval('JSON.stringify([S.giaoVien.map(g=>g.hoTen), S.phanCong.length])');
  w.document.querySelector('#btDatLaiMaGV').dispatchEvent(new w.Event('click', {bubbles:true}));
  [...w.document.querySelectorAll('#hopC button')].find(b => /^Đặt lại \d+ mã$/.test(b.textContent))
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  const sau = w.eval('JSON.stringify([S.giaoVien.map(g=>g.hoTen), S.phanCong.length])');
  const ma = w.eval('S.giaoVien[0].maGV');
  return [truoc === sau && !/^[0-9a-f]{8}-/.test(ma), `mã mới: ${ma}`];
})()));
kt('Mọi mã đều đúng dạng rồi thì hộp nói thẳng, không bày nút đổi thừa', (() => {
  w.document.querySelector('#btDatLaiMaGV').dispatchEvent(new w.Event('click', {bubbles:true}));
  const t = w.document.querySelector('#hopN').textContent;
  const nut = [...w.document.querySelectorAll('#hopC button')].map(b => b.textContent);
  return /đều đã đúng dạng/.test(t) && nut.length === 1 && nut[0] === 'Đóng';
})());
w.eval('dong()');

console.log('\n18. Không có lỗi chạy nào');
kt('Không lỗi JavaScript nào trong suốt phép thử', loiChay.length === 0,
   loiChay.slice(0, 3).join(' | ') || 'sạch');

console.log(`\n\x1b[1mKết quả soi giao diện: ${dat} đạt, ${hong} hỏng\x1b[0m\n`);
process.exit(hong ? 1 : 0);




