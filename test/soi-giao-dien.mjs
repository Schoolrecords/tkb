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
kt('Bảng điều hành bày đủ ba bước',
   w.document.querySelectorAll('.bbuoc .bb').length === 3);
kt('Mỗi màn hình khai báo có dải điều hướng bước', (() => {
  w.chuyen('lop');
  const d = w.document.querySelector('.dhb');
  return !!d && /Bước 1/.test(d.textContent);
})());
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
const moi = S.lop.filter(l => (l.maLop || '').startsWith('THU-'));
kt('Tạo lớp hàng loạt sinh đúng số lớp và đúng tên',
   moi.length === 3 && moi.map(l => l.ten).join(',') === '1A,1B,1C',
   `${soLopTruoc} → ${S.lop.length} lớp`);
kt('Lớp trùng tên ở điểm trường khác vẫn tạo được, phân biệt bằng mã',
   S.lop.filter(l => l.ten === '1A').length === 2 &&
   moi[0].maLop === 'THU-1A', `hai lớp "1A": ${S.lop.filter(l => l.ten === '1A').map(l => l.maLop || l.id).join(' · ')}`);
kt('Tạo lại lần nữa không sinh trùng trong cùng điểm trường', (() => {
  w.hopSinhLop();
  w.document.querySelector('#slDT').value = 'dtThu';
  w.document.querySelector('[data-sl="1"]').value = '3';
  w.document.querySelector('#slTien').value = 'THU';
  [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Tạo lớp').click();
  return S.lop.filter(l => (l.maLop || '').startsWith('THU-')).length === 3;
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
const cotTT = w.document.querySelectorAll('.tt thead th').length - 1;
kt('Bảng toàn trường đủ một cột cho mỗi lớp',
   cotTT === w.eval('lopTrongPV().length'), `${cotTT} cột lớp`);
kt('Bảng toàn trường có ô tiết thật, không rỗng',
   w.document.querySelectorAll('.tt tbody td b').length > 100,
   `${w.document.querySelectorAll('.tt tbody td b').length} ô có tiết`);
w.chuyen('tkbkhoi');
kt('Màn hình theo khối tự chọn sẵn một khối', S.khoiXem != null, `khối ${S.khoiXem}`);
const cotK = w.document.querySelectorAll('.tt thead th').length - 1;
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
kt('Thanh bên chỉ còn ba mục dành cho giáo viên',
   hien.length === 3, hien.map(m => m.dataset.t).join(' · '));
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
  const moi = S.lop.filter(l => (l.maLop || '').startsWith('DD-'));
  return S.giaoVien.length > truocDT.gv && moi.every(l => S.giaoVien.some(g => g.cn === l.id));
})(), `${truocDT.gv} → ${S.giaoVien.length} giáo viên`);
/* Điểm trường mới tạo KHÔNG tích ô "có phòng Tin học", mà mục 9 ở trên đã khai
   bảng phòng — nên ràng buộc cứng số 4 bật, và mọi tiết Tin học của Diễn Đồng
   phải bị chặn lại chứ không được xếp bừa vào phòng ở điểm trường khác. */
const soLopTin = S.lop.filter(l => (l.maLop || '').startsWith('DD-') && l.khoi >= 3).length;
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
kt('Bảng toàn trường hiện đủ cột cho cả hai điểm trường', (() => {
  w.chuyen('toantruong');
  return w.document.querySelectorAll('.tt thead th').length - 1 === S.lop.length;
})(), `${S.lop.length} cột lớp`);

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

console.log('\n17. Không có lỗi chạy nào');
kt('Không lỗi JavaScript nào trong suốt phép thử', loiChay.length === 0,
   loiChay.slice(0, 3).join(' | ') || 'sạch');

console.log(`\n\x1b[1mKết quả soi giao diện: ${dat} đạt, ${hong} hỏng\x1b[0m\n`);
process.exit(hong ? 1 : 0);
