/* ==================================================================
   KIỂM THỬ THUẬT TOÁN XẾP THỜI KHÓA BIỂU
   Chạy: npm test
   ------------------------------------------------------------------
   Tách vùng /*#region LOGIC*​/ trong src/index.html rồi chạy trên
   dữ liệu thật của Trường TH Diễn Liên (25 lớp · 35 GV · 710 tiết).
   Giữ được single-file cho index.html mà vẫn kiểm thử được.
   ================================================================== */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const goc = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(goc, 'src/index.html'), 'utf8');

/* Cắt lấy hai vùng mã thuần: LOGIC (thuật toán) và DULIEU (tầng truy cập).
   Cả hai đều không đụng tới DOM nên chạy được ngoài trình duyệt. */
function vung(ten) {
  const d1 = html.indexOf(`/*#region ${ten}*/`);
  const d2 = html.indexOf(`/*#endregion ${ten}*/`);
  if (d1 < 0 || d2 < 0) {
    console.error(`Không tìm thấy mốc ${ten} trong src/index.html`);
    process.exit(1);
  }
  return html.slice(d1, d2);
}

/* Truyền vào một document giả để logic chạy được ngoài trình duyệt.
   Không sửa chuỗi mã nguồn — như vậy kiểm thử không vỡ khi index.html đổi. */
const oGia = () => ({
  textContent: '', className: '', value: '', style: {},
  classList: { add() {}, remove() {}, toggle() {} },
  appendChild() {}, onclick: null, onchange: null
});
const documentGia = { querySelector: oGia, querySelectorAll: () => [], addEventListener() {} };

const NGUON_MA = `${vung('LOGIC')}\n${vung('DULIEU')}\n${vung('QUYEN')}\n${vung('XUAT')}\n; return {
  S, xepTuDong, kiemTra, buoiBat, KHO, NGUON, khungGioMacDinh,
  taiDuLieu, luuTKB, lichSuPhienBan, dangNhap, taiPhienBan, dangXuat, taiNhatKy,
  tuMayChu, napVaoS, dongGoiTKB, docTKB, taiCauHinh,
  diaChiDangNhapGoogle, donVeOAuth, dungMaMoi, sinhMaMoi, taoMaMoi, dsMaMoi,
  tietVangCua, goiYDayThay, luuDayThay, xoaDayThay,
  quyen, phamViKhoa, duocXep, duocSuaNguon, duocSuaLop, duocLuu,
  apDungQuyen, dtTrongPV, gvTrongPV, canDangNhap, thayDuocMuc, thieuHoSoGV,
  dongGio, lichGV, luoiTheoLop, luoiTheoGV, bangXuatPC, bangXuatDT,
  khongDau, tenTepXuat, tenDangNhapGV, matKhauNgauNhien, taoICS, gapDongICS,
  oTuan, soTietBuoi, sucChuaKhoi, chuanKhungGio, tenLopDay, cnCuaLop, tenCN,
  diemToanCuc, toiUuHoanDoi, laGhim, lichTraGV,
  duLieuTuBang, ghiDuLieuNguon, congBoTKB, luuBuoiBan,
  tienDo, sinhLop, coPhong, dongBoPhongTin, dsMonMacDinh, dsMonDung,
  chuanMon, laMonNang, laMonNhe, monCanPhong,
  coBangPhong, soPhong, dangChiemPhong, chiSo, datDuoc, doiChoDuoc,
  taoDuLieuThu, chiaLopTheoKhoi, tenGVSinh,
  xepDai, xepDaiTung, nhomDocLap, diemNhom, taoNgauNhien, bangMauNhap,
  duLieuTuMaTran, bangMauMaTran,
  luoiToanTruong, luoiTheoKhoiHoc, lopTheoKhoi, khoiDangCo, xepTheoKhoi };`;

/* Mỗi lần gọi là một bản ứng dụng độc lập — dựng được cả bản chạy ngoại tuyến
   lẫn bản nối vào máy chủ giả mà hai bên không đụng trạng thái của nhau. */
const taoUngDung = (doc, win, layMang) =>
  new Function('document', 'window', 'fetch', NGUON_MA)(doc, win, layMang);

const { S, xepTuDong, kiemTra, KHO, NGUON, buoiBat,
        taiDuLieu, luuTKB, lichSuPhienBan, dangNhap, taiNhatKy, sinhMaMoi,
        tietVangCua, goiYDayThay, luuDayThay,
        tuMayChu, napVaoS, dongGoiTKB, docTKB,
        quyen, phamViKhoa, duocXep, duocSuaNguon, duocSuaLop, duocLuu,
        apDungQuyen, dtTrongPV, gvTrongPV, canDangNhap, thayDuocMuc, thieuHoSoGV,
        dongGio, luoiTheoLop, luoiTheoGV, bangXuatPC, bangXuatDT,
        khongDau, tenTepXuat, tenDangNhapGV, matKhauNgauNhien, taoICS, gapDongICS,
        oTuan, soTietBuoi, sucChuaKhoi, chuanKhungGio, tenLopDay,
        diemToanCuc, toiUuHoanDoi, laGhim, lichTraGV,
        duLieuTuBang, ghiDuLieuNguon, luuBuoiBan,
        tienDo, sinhLop, coPhong, dongBoPhongTin, dsMonMacDinh, dsMonDung,
        chuanMon, laMonNang, laMonNhe, monCanPhong,
        coBangPhong, soPhong, dangChiemPhong, chiSo, datDuoc, doiChoDuoc,
        taoDuLieuThu, chiaLopTheoKhoi, tenGVSinh,
        xepDai, xepDaiTung, nhomDocLap, diemNhom, taoNgauNhien, bangMauNhap,
  duLieuTuMaTran, bangMauMaTran,
        luoiToanTruong, luoiTheoKhoiHoc, lopTheoKhoi, khoiDangCo, xepTheoKhoi } = taoUngDung(documentGia);

/* ---------- khung kiểm thử tối giản ---------- */
let dat = 0, hong = 0;
const kt = (ten, dieuKien, ghiChu = '') => {
  if (dieuKien) { dat++; console.log(`  \x1b[32m✓\x1b[0m ${ten}${ghiChu ? ' — ' + ghiChu : ''}`); }
  else { hong++; console.log(`  \x1b[31m✗\x1b[0m ${ten}${ghiChu ? ' — ' + ghiChu : ''}`); }
};

/* Soát lưới sau khi xếp: có xung đột nào lọt qua không */
function soatLuoi() {
  const oGV = new Map(), buoiGV = new Map();
  let trungTiet = 0, saiDiemTruong = 0;
  for (const [lopId, o] of Object.entries(S.tkb)) {
    for (const [khoa, t] of Object.entries(o)) {
      const k1 = `${t.gvId}@${khoa}`;
      if (oGV.has(k1)) trungTiet++;
      oGV.set(k1, lopId);
      const kB = `${t.gvId}@${khoa.split('-').slice(0, 2).join('-')}`;
      const dt = S.lopDT[lopId];
      if (buoiGV.has(kB) && buoiGV.get(kB) !== dt) saiDiemTruong++;
      buoiGV.set(kB, dt);
    }
  }
  return { trungTiet, saiDiemTruong };
}

console.log('\n\x1b[1mKIỂM THỬ THUẬT TOÁN XẾP THỜI KHÓA BIỂU\x1b[0m');

/* ---------- 1. Dữ liệu nguồn ---------- */
console.log('\n1. Dữ liệu nguồn');
kt('Đủ 25 lớp', S.lop.length === 25, `${S.lop.length} lớp`);
kt('Đủ 35 giáo viên', S.giaoVien.length === 35, `${S.giaoVien.length} người`);
const tongTiet = S.phanCong.reduce((s, p) => s + p.soTiet, 0);
kt('Tổng 710 tiết/tuần', tongTiet === 710, `${tongTiet} tiết`);

const CHUAN = { 1: 27, 2: 27, 3: 28, 4: 30, 5: 30 };
const lechChuan = S.lop.filter(l =>
  S.phanCong.filter(p => p.lopId === l.id).reduce((s, p) => s + p.soTiet, 0) !== CHUAN[l.khoi]);
kt('Mọi lớp khớp số tiết chuẩn CT GDPT 2018', lechChuan.length === 0,
   lechChuan.length ? lechChuan.map(l => l.ten).join(', ') : '25/25 lớp');

/* Khung giờ khác nhau theo khối — khối nhỏ tan sớm hơn, đúng thực tế trường */
const suc = sucChuaKhoi();
kt('Khung giờ từng khối khớp đúng chuẩn, không thừa không thiếu ô',
   [1, 2, 3, 4, 5].every(k => suc[k] === CHUAN[k]),
   [1, 2, 3, 4, 5].map(k => `K${k}:${suc[k]}/${CHUAN[k]}`).join(' · '));
kt('Khối nhỏ có ít tiết hơn khối lớn', suc[1] < suc[3] && suc[3] < suc[4],
   `${suc[1]} < ${suc[3]} < ${suc[4]}`);

/* ---------- 2. Một điểm trường ---------- */
console.log('\n2. Một điểm trường — phải xếp trọn vẹn');
let r = xepTuDong();
let s = soatLuoi();
kt('Xếp đủ 710/710 tiết', r.daXep === 710, `${r.daXep}/${r.tongCan} tiết`);
kt('Không tiết nào bị bỏ lại', r.chuaXep.length === 0, `${r.chuaXep.length} trường hợp`);
kt('Không giáo viên nào trùng tiết', s.trungTiet === 0, `${s.trungTiet} xung đột`);
kt('Chạy dưới 3 giây', +r.giay < 3, `${r.giay} giây`);

/* Tiết ghim: chào cờ và sinh hoạt lớp */
const coChaoCo = S.lop.every(l => S.tkb[l.id]['2-S-0']?.mon === 'HDTN');
kt('Mọi lớp có chào cờ sáng thứ Hai tiết 1', coChaoCo);

/* Sinh hoạt lớp là tiết CUỐI CỦA KHỐI ĐÓ, không phải tiết cuối của lưới:
   khối 1–3 tan sau tiết 4, khối 4–5 sau tiết 5 sáng thứ Sáu. */
const s6 = buoiBat().find(k => k.thu === 6 && k.buoi === 'S');
kt('Sinh hoạt lớp đúng tiết cuối của từng khối',
   S.lop.every(l => S.tkb[l.id][`6-S-${soTietBuoi(s6, l.khoi) - 1}`]?.mon === 'HDTN'),
   `khối 1–3 tiết ${soTietBuoi(s6, 1)} · khối 4–5 tiết ${soTietBuoi(s6, 4)}`);

/* Không lớp nào bị xếp vào ô nằm ngoài lưới giờ của khối mình */
const oSaiCho = S.lop.reduce((s, l) => {
  const hop = new Set(oTuan(l.khoi).map(x => x.khoa));
  return s + Object.keys(S.tkb[l.id]).filter(k => !hop.has(k)).length;
}, 0);
kt('Không lớp nào học ngoài khung giờ của khối mình', oSaiCho === 0, `${oSaiCho} ô sai chỗ`);

/* ---------- 3. Ba điểm trường ---------- */
console.log('\n3. Ba điểm trường — ràng buộc một buổi một điểm trường');
S.diemTruong = [
  { id: 'dt1', ten: 'Điểm trường Diễn Liên', phongTin: true },
  { id: 'dt2', ten: 'Điểm trường Diễn Thái', phongTin: true },
  { id: 'dt3', ten: 'Điểm trường Diễn Đoài', phongTin: false }
];
S.lop.forEach(l => S.lopDT[l.id] =
  l.khoi >= 4 ? 'dt1' : (l.khoi === 3 || ['2A', '2B', '2C'].includes(l.ten)) ? 'dt2' : 'dt3');

r = xepTuDong();
s = soatLuoi();
kt('Không giáo viên nào trùng tiết', s.trungTiet === 0, `${s.trungTiet} xung đột`);
kt('Không ai ở hai điểm trường trong một buổi', s.saiDiemTruong === 0,
   `${s.saiDiemTruong} vi phạm`);
kt('Xếp được ít nhất 690 tiết', r.daXep >= 690, `${r.daXep}/${r.tongCan} tiết`);
kt('Có báo rõ tiết chưa xếp được', r.chuaXep.length === 0 || r.chuaXep.every(c => c.con > 0),
   r.chuaXep.length ? `${r.chuaXep.length} trường hợp cần bổ sung giáo viên` : 'xếp trọn');

/* ---------- 4. Bộ quy tắc kiểm tra khả thi ---------- */
console.log('\n4. Kiểm tra khả thi');
const k = kiemTra();
kt('Phát hiện giáo viên vượt định mức', k.vm.some(v => v.ma === 'R01'),
   `${k.vm.filter(v => v.ma === 'R01').length} người`);
kt('Phát hiện trùng tên gọi giáo viên', k.vm.some(v => v.ma === 'R09'),
   `${k.vm.filter(v => v.ma === 'R09').length} cặp`);
kt('Mọi vướng mắc đều có hướng xử lý', k.vm.every(v => v.g && v.g.length > 10));

/* ---------- 5. Tầng truy cập dữ liệu ---------- */
console.log('\n5. Tầng truy cập dữ liệu');

/* Một trường giả lập, cố ý có hai giáo viên trùng tên gọi "Dung" để
   chứng minh việc dò chủ nhiệm đi bằng id chứ không bằng tên. */
const HANG = {
  truong: { id: 't1', ten: 'Trường TH Thử Nghiệm' },
  diem_truong: [{ id: 'd1', ten: 'Điểm A', co_phong_tin: true },
                { id: 'd2', ten: 'Điểm B', co_phong_tin: false }],
  khung_gio: [{ thu: 2, buoi: 'S', so_tiet: 4, bat: true },
              { thu: 3, buoi: 'S', so_tiet: 4, bat: true },
              { thu: 4, buoi: 'S', so_tiet: 2, bat: false }],
  giao_vien: [{ id: 'g1', ho_ten: 'Nguyễn Thị Dung', ma_gv: 'GV01', dinh_muc: 23 },
              { id: 'g2', ho_ten: 'Đặng Thị Dung', ma_gv: 'GV02', dinh_muc: 20, nguoi_dung_id: 'u2' }],
  lop: [{ id: 'l1', ten: '1A', khoi: 1, diem_truong_id: 'd1', gvcn_id: 'g1' },
        { id: 'l2', ten: '2B', khoi: 2, diem_truong_id: 'd2', gvcn_id: 'g2' }],
  phan_cong: [{ giao_vien_id: 'g1', lop_id: 'l1', mon: 'Toán', so_tiet: 3 },
              { giao_vien_id: 'g2', lop_id: 'l2', mon: 'Tiếng Việt', so_tiet: 2 }],
  gv_nghi: [{ giao_vien_id: 'g2', thu: 3, buoi: 'S' }]
};
const DL = tuMayChu(HANG);
kt('Dò chủ nhiệm bằng id, không bằng tên trùng',
   DL.giaoVien.find(g => g.id === 'g1').cn === 'l1' &&
   DL.giaoVien.find(g => g.id === 'g2').cn === 'l2',
   'hai cô cùng tên "Dung" vẫn ra đúng mã lớp');
kt('Đọc đúng điểm trường, khung giờ, buổi nghỉ',
   DL.lopDT.l1 === 'd1' && DL.lopDT.l2 === 'd2' &&
   DL.diemTruong[1].phongTin === false &&
   DL.khungGio.filter(k => k.bat).length === 2 &&
   JSON.stringify(DL.gvNghi) === '{"g2":["3-S"]}');
kt('Đọc đúng phân công và định mức riêng',
   DL.phanCong[0].soTiet === 3 && DL.phanCong[1].lopId === 'l2' &&
   DL.giaoVien.find(g => g.id === 'g2').dinhMuc === 20);

napVaoS(DL);
kt('Nạp vào trạng thái S không sót lớp nào',
   S.lop.length === 2 && S.giaoVien.length === 2 &&
   Object.keys(S.tkb).length === 2 && S.tenTruong === 'Trường TH Thử Nghiệm');

/* Nạp một bản lưu cũ: giữ ô hợp lệ, loại ô đã mất chỗ đứng */
const d = docTKB({ v: 1, tkb: {
  l1: { '2-S-0': { gvId: 'g1', mon: 'Toán' },      /* hợp lệ */
        '4-S-0': { gvId: 'g1', mon: 'Toán' },      /* buổi đã tắt */
        '3-S-0': { gvId: 'gXX', mon: 'Toán' } },   /* giáo viên đã nghỉ việc */
  lXX: { '2-S-1': { gvId: 'g1', mon: 'Toán' } }    /* lớp đã xoá */
} });
kt('Nạp bản lưu cũ, loại ô không còn hợp lệ', d.nap === 1 && d.boQua === 3,
   `giữ ${d.nap}, bỏ ${d.boQua}`);
kt('Đóng gói lại đủ lưới và ảnh chụp cấu hình', (() => {
  const b = dongGoiTKB();
  return b.v === 1 && b.tongTiet === 1 && b.lopDT.l1 === 'd1' &&
         b.khungGio.length === 3 && b.diemTruong.length === 2;
})());

/* Chưa nối máy chủ thì phải từ chối tử tế, không được ném lỗi ra màn hình */
const luu = await luuTKB(dongGoiTKB(), 0, 'thử');
const ls = await lichSuPhienBan();
const dn = await dangNhap('a@b.c', 'x');
kt('Chưa nối máy chủ: lưu báo rõ, không văng lỗi',
   luu.ok === false && luu.thongBao.length > 20, luu.thongBao);
kt('Chưa nối máy chủ: lịch sử và đăng nhập cũng báo rõ',
   ls.ok === false && ls.ds.length === 0 && dn.ok === false && dn.loi.length > 20);

/* Không có cấu hình máy chủ → tự lấy dữ liệu mẫu, ứng dụng vẫn chạy đủ */
const tai = await taiDuLieu();
kt('Không có máy chủ thì tự chạy bằng dữ liệu mẫu',
   tai.ok === true && tai.nguon === 'nhung' && KHO.version === 0, tai.thongBao);
kt('Dữ liệu mẫu về đúng quy mô trường',
   S.lop.length === 25 && S.giaoVien.length === 35 &&
   S.phanCong.reduce((s, p) => s + p.soTiet, 0) === 710 &&
   S.diemTruong.length === 1);

const rSau = xepTuDong();
kt('Xếp lại sau khi qua tầng dữ liệu vẫn trọn 710 tiết',
   rSau.daXep === 710 && soatLuoi().trungTiet === 0, `${rSau.daXep}/${rSau.tongCan} tiết`);

/* ---------- 6. Nói chuyện với máy chủ Supabase ---------- */
console.log('\n6. Nói chuyện với máy chủ (máy chủ giả)');

/* Máy chủ giả: đủ để kiểm chứng đường đi của bốn hàm, không cần mạng.
   Trên máy chủ đang có phiên bản 3. */
let veHienHanh = 'VE1', soLanRPC = 0, daLamMoiVe = false;
/* Ghi lại mọi thứ máy chủ giả nhận được, để phép thử soi lại đúng sai */
const GHI = { diemTruong: [], khungGio: null, giaoVien: null, lop: null, phanCong: null,
              xoaPhanCong: 0, congBo: [], gvNghi: null, xoaNghi: 0, nhatKy: [],
              dayThay: [], xoaDayThay: 0,
              oauthUser: 'u1', daDungMa: false, maMoi: [], xoaMaMoi: 0 };
const dap = (du, ma = 200) => ({ ok: ma < 400, status: ma, text: async () => JSON.stringify(du) });
const BAN_LUU = {
  3: { version: 3, ghi_chu: '5/5 tiết', tao_luc: '2026-07-30T02:15:00Z',
       du_lieu: { v: 1, tkb: { l1: { '2-S-0': { gvId: 'g1', mon: 'Toán' } } } } },
  2: { version: 2, ghi_chu: 'bản nháp', tao_luc: '2026-07-29T09:00:00Z',
       du_lieu: { v: 1, tkb: { l2: { '3-S-1': { gvId: 'g2', mon: 'Tiếng Việt' } } } } }
};

async function mangGia(url, opt = {}) {
  const than = opt.body ? JSON.parse(opt.body) : null;
  const co = s => url.includes(s);

  if (co('grant_type=password'))
    return than.password === 'dung'
      ? dap({ access_token: 'VE1', refresh_token: 'RF1', user: { id: 'u1', email: than.email } })
      : dap({ message: 'Invalid login credentials' }, 400);
  if (co('grant_type=refresh_token')) {
    daLamMoiVe = true; veHienHanh = 'VE2';
    return dap({ access_token: 'VE2', refresh_token: 'RF2' });
  }
  /* Mọi lời gọi dữ liệu phải mang đúng vé đang hiệu lực */
  if ((opt.headers?.Authorization || '') !== 'Bearer ' + veHienHanh)
    return dap({ message: 'JWT expired' }, 401);

  /* --- Đường GHI, dùng cho phép thử nhập dữ liệu nguồn --- */
  if (opt.method === 'POST' && co('/diem_truong')) {
    than.forEach((d, i) => GHI.diemTruong.push({ id: 'dt' + (GHI.diemTruong.length + i + 1), ten: d.ten }));
    return dap(GHI.diemTruong.slice(-than.length), 201);
  }
  if (opt.method === 'POST' && co('/khung_gio')) { GHI.khungGio = than; return dap(null, 201); }
  if (opt.method === 'POST' && co('/giao_vien')) { GHI.giaoVien = than; return dap(null, 201); }
  if (opt.method === 'POST' && co('/lop?')) { GHI.lop = than; return dap(null, 201); }
  if (opt.method === 'DELETE' && co('/phan_cong')) { GHI.xoaPhanCong++; return dap(null, 204); }
  if (opt.method === 'POST' && co('/phan_cong')) { GHI.phanCong = than; return dap(null, 201); }
  /* Đọc lại sau khi ghi, để tầng dữ liệu lấy mã UUID mà nối phân công */
  if (co('/diem_truong?') && co('select=id,ten')) return dap(GHI.diemTruong);
  if (co('/giao_vien?') && co('select=id,ma_gv'))
    return dap((GHI.giaoVien || []).map((g, i) => ({ id: 'gv-uuid-' + i, ma_gv: g.ma_gv })));
  if (co('/lop?') && co('select=id,ma_lop'))
    return dap((GHI.lop || []).map((l, i) => ({ id: 'lop-uuid-' + i, ma_lop: l.ma_lop, ten: l.ten })));

  if (opt.method === 'DELETE' && co('/gv_nghi')) { GHI.xoaNghi++; return dap(null, 204); }
  if (opt.method === 'POST' && co('/gv_nghi')) { GHI.gvNghi = than; return dap(null, 201); }

  if (co('/day_thay')) {
    if (opt.method === 'POST') {
      const moi = than.map((h, i) => ({ id: 'dt-uuid-' + (GHI.dayThay.length + i), ...h }));
      GHI.dayThay.push(...moi);
      return dap(moi, 201);
    }
    if (opt.method === 'DELETE') { GHI.xoaDayThay++; return dap(null, 204); }
    return dap(GHI.dayThay);
  }

  if (co('/auth/v1/user')) return dap(GHI.oauthUser === 'u9'
    ? { id: 'u9', email: 'khach@gmail.com' } : { id: 'u1', email: 'c@t.vn' });
  if (co('/rpc/dung_ma_moi')) {
    if (than?.p_ma === 'GOODMA') { GHI.daDungMa = true;
      return dap([{ ok: true, thong_bao: 'Đã vào trường. Mở lại trang là thấy lịch của mình.' }]); }
    return dap([{ ok: false, thong_bao: 'Mã không đúng, đã dùng, hoặc đã hết hạn. Hỏi lại người quản trị của trường.' }]);
  }
  if (co('/ma_moi')) {
    if (opt.method === 'POST') { GHI.maMoi.push(than); return dap([{ id: 'mm-' + GHI.maMoi.length, ...than }], 201); }
    if (opt.method === 'DELETE') { GHI.xoaMaMoi++; return dap(null, 204); }
    return dap(GHI.maMoi.map((m, i) => ({ id: 'mm-' + (i + 1), ...m, het_han: '2026-09-01T00:00:00Z',
      dung_luc: null, giao_vien: null })));
  }
  if (co('/nguoi_dung?') && co('id=eq.u9')) return dap(GHI.daDungMa
    ? [{ id: 'u9', ho_ten: 'Khách Google', email: 'khach@gmail.com', vai_tro: 'giao_vien',
         truong_id: 't1', diem_truong_id: null, truong: { ten: HANG.truong.ten } }]
    : []);
  if (co('/nguoi_dung?')) return dap([{ id: 'u1', ho_ten: 'Trần Thanh Chung', email: 'c@t.vn',
    vai_tro: 'pho_hieu_truong', truong_id: 't1', diem_truong_id: null, truong: { ten: HANG.truong.ten } }]);
  if (co('/giao_vien?nguoi_dung_id=')) return dap([{ id: 'g2', ho_ten: 'Đặng Thị Dung' }]);
  if (co('/truong?id=')) return dap([HANG.truong]);
  if (co('/diem_truong?')) return dap(HANG.diem_truong);
  if (co('/khung_gio?')) return dap(HANG.khung_gio);
  if (co('/giao_vien?')) return dap(HANG.giao_vien);
  if (co('/lop?')) return dap(HANG.lop);
  if (co('/phan_cong?')) return dap(HANG.phan_cong);
  if (co('/gv_nghi?')) return dap(HANG.gv_nghi);
  if (co('/nhat_ky')) {
    if (opt.method === 'POST') { GHI.nhatKy.push(than); return dap(null, 201); }
    /* Đọc: mới nhất ở trên, kèm họ tên người làm như PostgREST nhúng bảng nguoi_dung */
    return dap(GHI.nhatKy.slice().reverse().map(h => ({
      hanh_dong: h.hanh_dong, du_lieu_cu: h.du_lieu_cu, thoi_diem: '2026-08-02T03:00:00Z',
      nguoi_dung: { ho_ten: 'Trần Thanh Chung' } })));
  }

  if (co('/rpc/luu_tkb')) {
    /* Lần gọi đầu cố tình để vé hết hạn — buộc tầng dữ liệu tự xin vé mới */
    if (++soLanRPC === 1) { veHienHanh = 'VE2'; return dap({ message: 'JWT expired' }, 401); }
    return dap(than.p_version < 3
      ? [{ ok: false, version_moi: 3, thong_bao: 'Đã có người lưu phiên bản 3. Mời tải lại rồi lưu tiếp.' }]
      : [{ ok: true, version_moi: 4, thong_bao: 'Đã lưu' }]);
  }
  if (co('/tkb_phien_ban?')) {
    /* Công bố: bật cong_bo cho một bản, tắt các bản khác */
    if (opt.method === 'PATCH') {
      if (co('cong_bo=eq.true')) { Object.values(BAN_LUU).forEach(v => v.cong_bo = false); }
      else {
        const v = (url.match(/version=eq\.(\d+)/) || [])[1];
        if (v && BAN_LUU[v]) BAN_LUU[v].cong_bo = !!than.cong_bo;
      }
      GHI.congBo = Object.values(BAN_LUU).filter(v => v.cong_bo).map(v => v.version);
      return dap(null, 204);
    }
    if (co('cong_bo=eq.true')) return dap(Object.values(BAN_LUU).filter(v => v.cong_bo));
    if (co('version=eq.2')) return dap([BAN_LUU[2]]);
    if (co('limit=1')) return dap([BAN_LUU[3]]);
    return dap([BAN_LUU[3], BAN_LUU[2]]);
  }
  return dap({ message: 'Đường dẫn lạ: ' + url }, 404);
}

const MC = taoUngDung(
  documentGia,
  { CAU_HINH: { SUPABASE_URL: 'https://gia.supabase.co/', SUPABASE_ANON: 'khoa-anon' },
    location: { protocol: 'https:' } },
  mangGia);

const dnSai = await MC.dangNhap('c@t.vn', 'bay-bien');
kt('Sai mật khẩu thì nói thẳng, không đưa mã lỗi kỹ thuật',
   dnSai.ok === false && dnSai.loi === 'Sai email hoặc mật khẩu.');

const dnDung = await MC.dangNhap('c@t.vn', 'dung');
kt('Đăng nhập xong dò được vai trò, trường và bản ghi giáo viên',
   dnDung.ok === true && dnDung.nguoiDung.vaiTro === 'pho_hieu_truong' &&
   dnDung.nguoiDung.truongId === 't1' && dnDung.nguoiDung.gvId === 'g2' &&
   MC.S.nguoiDung.vaiTro === 'pht');

const taiMC = await MC.taiDuLieu();
kt('Tải về đủ dữ liệu trường kèm phiên bản mới nhất',
   taiMC.nguon === 'may-chu' && taiMC.version === 3 && MC.KHO.version === 3 &&
   MC.S.lop.length === 2 && MC.S.tenTruong === HANG.truong.ten &&
   Object.keys(MC.S.tkb.l1).length === 1, taiMC.thongBao);

const luuMC = await MC.luuTKB(MC.dongGoiTKB(), MC.KHO.version, 'kiểm thử');
kt('Vé hết hạn giữa chừng thì tự xin vé mới rồi lưu tiếp',
   daLamMoiVe === true && luuMC.ok === true && luuMC.version === 4 && MC.KHO.version === 4,
   luuMC.thongBao);

const luuCu = await MC.luuTKB(MC.dongGoiTKB(), 1, 'bản cũ');
kt('Khóa lạc quan: giữ bản cũ thì máy chủ từ chối, không ghi đè',
   luuCu.ok === false && /phiên bản/i.test(luuCu.thongBao), luuCu.thongBao);

const lsMC = await MC.lichSuPhienBan();
kt('Đọc được lịch sử phiên bản kèm thời điểm dễ đọc',
   lsMC.ok === true && lsMC.ds.length === 2 && lsMC.ds[0].version === 3 &&
   /^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/.test(lsMC.ds[0].luc), lsMC.ds[0].luc);

const banCu = await MC.taiPhienBan(2);
const napCu = MC.docTKB(banCu.duLieu);
kt('Khôi phục được bản cũ vào lưới đang xem',
   banCu.ok === true && napCu.nap === 1 && Object.keys(MC.S.tkb.l2).length === 1);

/* Lỗi thật đã gặp: xếp xong, lưu xong, mà giáo viên đăng nhập vẫn thấy trống.
   Nguyên nhân: quy tắc đọc chỉ cho giáo viên xem bản ĐÃ CÔNG BỐ, mà phần mềm
   chưa có nút công bố nào — hàng rào dựng xong mà quên làm cửa. */
kt('Trước khi công bố thì chưa bản nào tới tay giáo viên',
   GHI.congBo.length === 0 && MC.KHO.banCongBo === 0);
const cb1 = await MC.congBoTKB(3, true);
kt('Công bố được một phiên bản', cb1.ok === true && MC.KHO.banCongBo === 3, cb1.thongBao);
kt('Máy chủ ghi nhận đúng một bản đang công bố',
   GHI.congBo.length === 1 && GHI.congBo[0] === 3, 'bản '+GHI.congBo.join(','));
await MC.congBoTKB(2, true);
kt('Công bố bản khác thì bản cũ tự tắt — mỗi lúc chỉ một thời khóa biểu hiệu lực',
   GHI.congBo.length === 1 && GHI.congBo[0] === 2, 'bản '+GHI.congBo.join(','));
const cb0 = await MC.congBoTKB(2, false);
kt('Rút công bố được khi cần sửa giữa năm',
   cb0.ok === true && GHI.congBo.length === 0, cb0.thongBao);

/* Nhật ký: các thao tác vừa làm ở trên phải để lại vết đọc lại được */
const nkMC = await MC.taiNhatKy();
kt('Nhật ký đọc được — lưu và công bố đều để lại vết, kèm người và thời điểm',
   nkMC.ok === true && nkMC.ds.length >= 3 &&
   nkMC.ds.some(h => h.hanhDong === 'luu_tkb' && h.duLieu.version === 4) &&
   nkMC.ds.some(h => h.hanhDong === 'cong_bo') &&
   nkMC.ds.some(h => h.hanhDong === 'rut_cong_bo') &&
   nkMC.ds.every(h => h.hoTen === 'Trần Thanh Chung' &&
                      /^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/.test(h.luc)),
   `${nkMC.ds.length} dòng, mới nhất: ${nkMC.ds[0]?.hanhDong}`);
kt('Chưa nối máy chủ thì nhật ký nói rõ cách có nó, không đổ lỗi',
   await taiNhatKy().then(r => r.ok === false && /Chưa nối máy chủ/.test(r.thongBao)));

/* ---------- Dạy thay: ghi và xoá trên máy chủ ---------- */
const dtLuu = await MC.luuDayThay([
  { ngay: '2026-09-08', buoi: 'S', tiet: 1, lopId: 'l1', mon: 'Toán', gvVangId: 'g1', gvThayId: 'g2' },
  { ngay: '2026-09-08', buoi: 'S', tiet: 2, lopId: 'l1', mon: 'Tiếng Việt', gvVangId: 'g1', gvThayId: null }
]);
kt('Lưu dạy thay: máy chủ nhận đủ dòng, trả về bản ghi có id, ghi cả nhật ký',
   dtLuu.ok === true && GHI.dayThay.length === 2 &&
   GHI.dayThay[0].gv_thay_id === 'g2' && GHI.dayThay[1].gv_thay_id === null &&
   dtLuu.ds.every(d => d.id) &&
   GHI.nhatKy.some(h => h.hanh_dong === 'day_thay' && h.du_lieu_cu?.so === 2),
   dtLuu.thongBao);
const dtXoa = await MC.xoaDayThay('dt-uuid-0');
kt('Xoá được một phân công dạy thay', dtXoa.ok === true && GHI.xoaDayThay === 1);
kt('Đang chạy dữ liệu mẫu thì chặn lưu dạy thay — không ghi mã lớp mẫu lên máy chủ', await (async () => {
  const nguon = MC.KHO.nguon; MC.KHO.nguon = 'nhung';
  const kq = await MC.luuDayThay([{ ngay: '2026-09-08', buoi: 'S', tiet: 1, lopId: 'l1', mon: 'Toán', gvVangId: 'g1' }]);
  MC.KHO.nguon = nguon;
  return kq.ok === false && /dữ liệu mẫu/.test(kq.thongBao);
})());
kt('Chưa nối máy chủ thì dạy thay báo rõ, không văng lỗi',
   await luuDayThay([]).then(r => r.ok === false && /Chưa nối máy chủ/.test(r.thongBao)));

/* Tình huống thật đã gặp: đăng nhập được nhưng trường trên máy chủ chưa có lớp
   nên phần mềm quay về dữ liệu mẫu. Lưới lúc đó dựng trên mã lớp và mã giáo
   viên của bộ mẫu — ghi lên máy chủ sẽ thành phiên bản rác, tải về không khớp
   ô nào. Phải chặn ngay chỗ này, đừng để người dùng phát hiện sau khi đã lưu. */
const nguonThat = MC.KHO.nguon;
MC.KHO.nguon = 'nhung';
const luuMau = await MC.luuTKB(MC.dongGoiTKB(), MC.KHO.version, 'từ dữ liệu mẫu');
MC.KHO.nguon = nguonThat;
kt('Đang chạy dữ liệu mẫu thì chặn lưu, không ghi rác lên máy chủ',
   luuMau.ok === false && /dữ liệu mẫu/i.test(luuMau.thongBao), luuMau.thongBao);

MC.dangXuat();
const sauThoat = await MC.luuTKB(MC.dongGoiTKB(), 4);
kt('Đăng xuất rồi thì không lưu được nữa', sauThoat.ok === false);

/* ---------- 6b. Đăng nhập Google, khách và mã mời ---------- */
console.log('\n6b. Đăng nhập Google, khách và mã mời');

/* Bản ứng dụng có cửa sổ giả đầy đủ — kiểm được cả địa chỉ chuyển hướng */
const G = taoUngDung(
  documentGia,
  { CAU_HINH: { SUPABASE_URL: 'https://gia.supabase.co/', SUPABASE_ANON: 'khoa-anon' },
    location: { protocol: 'https:', origin: 'https://truong.example', pathname: '/tkb/', hash: '' },
    history: { replaceState() {} } },
  mangGia);
await G.taiCauHinh();

kt('Địa chỉ đăng nhập Google trỏ đúng /authorize của GoTrue, mang theo đường về',
   G.diaChiDangNhapGoogle() ===
   'https://gia.supabase.co/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Ftruong.example%2Ftkb%2F');
kt('Địa chỉ không mang vé thì đón vé trả về null, không làm gì cả',
   await G.donVeOAuth('') === null && await G.donVeOAuth('#chi-la-neo') === null);
kt('Google từ chối thì nói rõ lý do, không văng lỗi', await (async () => {
  const v = await G.donVeOAuth('#error=access_denied&error_description=Nguoi+dung+tu+choi');
  return v.ok === false && /Nguoi dung tu choi/.test(v.loi);
})());

/* Vé thật nhưng tài khoản chưa thuộc trường nào → thành KHÁCH, giữ phiên */
veHienHanh = 'VE1';
GHI.oauthUser = 'u9';
const veKhach = await G.donVeOAuth('#access_token=VE1&refresh_token=RF1&token_type=bearer');
kt('Đăng nhập Google mà chưa thuộc trường nào thì thành khách, phiên vẫn giữ',
   veKhach?.ok === true && veKhach.khach === true &&
   G.KHO.khach?.email === 'khach@gmail.com' && G.KHO.phien?.uid === 'u9' && !G.KHO.nguoiDung);

kt('Mã mời sai thì máy chủ từ chối, có hướng xử lý', await (async () => {
  const v = await G.dungMaMoi('SAIMA');
  return v.ok === false && /quản trị/.test(v.loi);
})());
kt('Mã mời đúng (gõ thường cũng được) — vào trường, hết là khách', await (async () => {
  const v = await G.dungMaMoi('  goodma ');
  return v.ok === true && G.KHO.nguoiDung?.truongId === 't1' &&
    G.KHO.nguoiDung.vaiTro === 'giao_vien' && G.KHO.khach === null;
})());

kt('Sinh mã mời: 6 ký tự, không có 0·O·1·I·L dễ đọc nhầm', (() => {
  let i = 0; const day = [0.01, 0.2, 0.4, 0.6, 0.8, 0.99];
  const ma = sinhMaMoi(() => day[i++ % day.length]);
  return /^[A-HJ-KM-NP-Z2-9]{6}$/.test(ma) && sinhMaMoi(() => 0.9999) === '999999';
})());
kt('Tạo mã mời ghi lên máy chủ, nối đúng trường và giáo viên', await (async () => {
  const t = await G.taoMaMoi({ gvId: 'g2', vaiTro: 'giao_vien' });
  return t.ok === true && /^[A-HJ-KM-NP-Z2-9]{6}$/.test(t.ma) &&
    GHI.maMoi[0].truong_id === 't1' && GHI.maMoi[0].giao_vien_id === 'g2';
})());
GHI.oauthUser = 'u1';

/* ---------- 7. Phân quyền theo điểm trường ---------- */
console.log('\n7. Phân quyền theo điểm trường');

/* Về lại trường giả lập: l1 ở điểm A (d1), l2 ở điểm B (d2) */
napVaoS(tuMayChu(HANG));
const vao = (vaiTro, diemTruongId = null, gvId = null) => {
  S.nguoiDung = { vaiTro, diemTruongId, gvId };
  return apDungQuyen();
};

vao('qt');
kt('Quản trị: toàn trường, xếp và sửa nguồn đều được',
   quyen().toanTruong && duocXep() && duocSuaNguon() &&
   duocSuaLop('l1') && duocSuaLop('l2') && phamViKhoa() === '');

/* Phó hiệu trưởng chuyên môn — diem_truong_id bỏ trống */
vao('pht', null);
kt('PHT chuyên môn (bỏ trống điểm trường): vẫn thấy toàn trường',
   quyen().toanTruong && quyen().boHep === false && duocXep() && S.phamVi === '');

/* Phó hiệu trưởng phụ trách điểm B */
vao('pht', 'd2');
kt('PHT phụ trách điểm trường: phạm vi bị khoá đúng điểm của mình',
   quyen().boHep === true && phamViKhoa() === 'd2' && S.phamVi === 'd2');
kt('PHT phụ trách điểm trường: không xếp tự động, không sửa dữ liệu nguồn',
   duocXep() === false && duocSuaNguon() === false);
kt('PHT phụ trách điểm trường: chỉnh được lớp mình, không chạm lớp nơi khác',
   duocSuaLop('l2') === true && duocSuaLop('l1') === false && duocLuu() === true);
kt('PHT phụ trách điểm trường: danh sách lọc đúng theo điểm trường',
   dtTrongPV().length === 1 && dtTrongPV()[0].id === 'd2' &&
   gvTrongPV().length === 1 && gvTrongPV()[0].id === 'g2');

/* Tự đổi phạm vi sang điểm trường khác cũng bị ép về chỗ của mình */
S.phamVi = 'd1'; apDungQuyen();
kt('PHT phụ trách điểm trường: đổi phạm vi tay cũng bị ép về chỗ của mình',
   S.phamVi === 'd2');

/* Điểm trường bị xoá thì không được khoá người dùng vào chỗ trống */
vao('pht', 'd-da-xoa');
S.phamVi = ''; apDungQuyen();      /* phải đổi lại được phạm vi, không bị ép về chỗ cũ */
kt('Điểm trường phụ trách đã bị xoá thì mở khoá, không kẹt vào chỗ trống',
   quyen().boHep === false && quyen().toanTruong && duocXep() === true && S.phamVi === '');

vao('gv', null, 'g1');
kt('Giáo viên: chỉ xem, không sửa lớp nào và không lưu được',
   quyen().laGV && duocSuaLop('l1') === false && duocSuaLop('l2') === false &&
   duocLuu() === false && duocXep() === false);
kt('Giáo viên đã nối hồ sơ thì xem được lịch của chính mình',
   thieuHoSoGV() === false);

/* Lỗi thật chờ sẵn: cấp tài khoản hàng loạt mà sót một người chưa nối tên,
   màn hình lịch cá nhân trước đây rơi về giáo viên ĐẦU DANH SÁCH — thầy cô
   tưởng đó là lịch của mình. Phải chặn, không được đoán bừa. */
vao('gv', null, null);
kt('Tài khoản giáo viên chưa nối hồ sơ thì chặn, không lấy đại người đầu danh sách',
   thieuHoSoGV() === true && quyen().gvId === null);

/* Lỗi logic thật đã gặp: khách chưa đăng nhập xem được cả trường bằng dữ liệu
   mẫu — cả 25 lớp và họ tên 35 giáo viên — trong khi giáo viên đăng nhập vào
   chỉ thấy lịch của mình. Đăng nhập xong lại thấy ÍT HƠN, như bị bịt mắt.
   Nguyên tắc: đăng nhập luôn cho thấy NHIỀU HƠN, không bao giờ ít hơn. */
vao('qt');
kt('Chưa cấu hình máy chủ thì vẫn chạy được bằng dữ liệu mẫu',
   canDangNhap() === false && thayDuocMuc('dieuhanh') === true,
   'mở tệp trực tiếp lúc phát triển vẫn dùng được');

KHO.cauHinh = {url:'https://gia.supabase.co', khoa:'k'};   /* giả bộ đã cấu hình */
kt('Có máy chủ mà chưa đăng nhập thì phải đăng nhập đã',
   canDangNhap() === true);
kt('Chưa đăng nhập thì không mục nào mở được',
   ['dieuhanh','xep','tkblop','tkbgv','cuatoi','giaovien','phancong','huongdan']
     .every(t => thayDuocMuc(t) === false));
S.trangHienTai = 'dieuhanh';
apDungQuyen();
kt('Gõ tay sang trang khác cũng bị đưa về màn hình chào',
   S.trangHienTai === 'chao');
KHO.cauHinh = null;                                        /* trả lại như cũ */

vao('qt');   /* trả lại trạng thái sạch */

/* ---------- 8. Xuất Excel và in ---------- */
console.log('\n8. Bảng xuất Excel và bản in');

/* Về lại dữ liệu thật rồi xếp trọn, để đếm được số ô trong bảng xuất */
await taiDuLieu();
const rX = xepTuDong();

kt('Lưới giờ đủ 30 ô mỗi tuần', dongGio().length === 30, `${dongGio().length} ô`);

const oCoChu = (a, tuCot) => a.slice(4).reduce((s, h) =>
  s + h.slice(tuCot).filter(x => String(x).trim()).length, 0);

const aLop = luoiTheoLop(S.lop);
kt('Bảng theo lớp: đủ cột và không sót tiết nào',
   aLop[3].length === 3 + S.lop.length && oCoChu(aLop, 3) === rX.daXep,
   `${aLop[3].length - 3} cột lớp · ${oCoChu(aLop, 3)}/${rX.daXep} tiết`);

const aGV = luoiTheoGV(S.giaoVien);
kt('Bảng theo giáo viên: cùng số tiết, không mất mát khi xoay bảng',
   aGV[3].length === 3 + S.giaoVien.length && oCoChu(aGV, 3) === rX.daXep,
   `${oCoChu(aGV, 3)}/${rX.daXep} tiết`);

/* Trường có bốn cặp trùng tên gọi — bản xuất phải ghi họ tên đầy đủ,
   in ra mà chỉ ghi "Cô Dung" thì hai cô Dung không phân biệt được. */
const oCoTen = aLop.slice(4).flatMap(h => h.slice(3)).filter(x => String(x).includes(' — '));
kt('Bản xuất ghi họ tên đầy đủ, không dùng tên gọi rút gọn',
   oCoTen.length > 0 &&
   oCoTen.some(x => x.includes('Bùi Thị Dung')) &&
   oCoTen.some(x => x.includes('Đặng Thị Dung')) &&
   !oCoTen.some(x => x.includes('DungB')),
   'hai cô Dung ghi rõ họ tên');

const aPC = bangXuatPC(S.lop);
const dongTong = aPC[aPC.length - 1];
kt('Bảng phân công: đủ 265 dòng và cộng đúng 710 tiết',
   aPC.length === 4 + S.phanCong.length + 2 && dongTong[6] === 710,
   `${aPC.length - 6} dòng · ${dongTong[6]} tiết`);

const aDT = bangXuatDT();
kt('Bảng tổng hợp điểm trường có đủ số liệu',
   aDT.length === 5 && aDT[4][1] === 25 && aDT[4][3] === 710);

kt('Bỏ dấu tiếng Việt để đặt tên tệp',
   khongDau('Trường Tiểu học Diễn Liên') === 'Truong-Tieu-hoc-Dien-Lien',
   khongDau('Trường Tiểu học Diễn Liên'));
kt('Tên tệp không dấu, không khoảng trắng, đúng đuôi',
   /^TKB-[A-Za-z0-9-]+-\d{8}\.xlsx$/.test(tenTepXuat('xlsx')), tenTepXuat('xlsx'));

/* ---------- Xuất .ics cho lịch điện thoại ----------
   Cô Đạo Đức dạy 23 lớp, mỗi lớp 1 tiết → đúng 23 sự kiện. 7/9/2026 là
   thứ Hai, truyền tuNgay cố định để phép thử tất định. */
const ics = taoICS('gv_phan_thi_thuong', { tuNgay: '2026-09-07' });
kt('Tệp .ics đúng khung: lịch + múi giờ Việt Nam + đủ 23 sự kiện',
   ics.startsWith('BEGIN:VCALENDAR') && ics.trimEnd().endsWith('END:VCALENDAR') &&
   ics.includes('TZID:Asia/Ho_Chi_Minh') &&
   (ics.match(/BEGIN:VEVENT/g) || []).length === 23,
   `${(ics.match(/BEGIN:VEVENT/g) || []).length} sự kiện`);
kt('Mỗi tiết lặp hằng tuần tới hết năm học 2026-2027',
   (ics.match(/RRULE:FREQ=WEEKLY;UNTIL=20270531T165959Z/g) || []).length === 23);
kt('Ngày bắt đầu rơi đúng tuần được chọn, không lệch thứ',
   ics.includes(';TZID=Asia/Ho_Chi_Minh:202609') &&
   !/DTSTART;TZID=Asia\/Ho_Chi_Minh:(?!2026090[7-9]|2026091[01])/.test(ics));
kt('Giờ tiết 1 buổi sáng là 7:30, tiết dài 35 phút',
   /DTSTART;TZID=Asia\/Ho_Chi_Minh:\d{8}T073000/.test(ics) &&
   /DTEND;TZID=Asia\/Ho_Chi_Minh:\d{8}T080500/.test(ics));
kt('Không dòng nào vượt 75 byte — đúng chuẩn RFC 5545', (() => {
  const byte = s => encodeURIComponent(s).replace(/%[0-9A-F]{2}/gi, 'x').length;
  return ics.split('\r\n').every(d => byte(d) <= 75);
})());
kt('Gấp dòng dài rồi mở lại ra đúng chuỗi ban đầu', (() => {
  const dai = 'SUMMARY:' + 'Tiếng Việt, Toán; Đạo Đức '.repeat(8);
  const gap = gapDongICS(dai);
  return gap.includes('\r\n ') && gap.split('\r\n ').join('') === dai;
})());
kt('Giáo viên không có tiết thì trả chuỗi rỗng, không tạo tệp rác',
   taoICS('khong-ai-ca') === '' && taoICS(S.giaoVien[0].id, { tuNgay: '2026-09-07' }).length > 0);

/* ---------- Dạy thay: gợi ý người dạy thế ----------
   Chạy trên lưới thật vừa xếp trọn 710/710 ở trên. */
const gvCN1A = S.giaoVien.find(g => g.cn === 'lop_1A');
const vangT2 = tietVangCua(gvCN1A.id, 2, ['S', 'C']);
kt('Liệt kê đúng các tiết của giáo viên vắng trong ngày, sáng trước chiều sau',
   vangT2.length > 0 &&
   vangT2.every(o => S.tkb[o.lopId][o.khoa]?.gvId === gvCN1A.id) &&
   vangT2.every((o, i) => i === 0 ||
     (vangT2[i - 1].buoi === 'S' && o.buoi === 'C') ||
     (o.buoi === vangT2[i - 1].buoi && o.i >= vangT2[i - 1].i)),
   `${vangT2.length} tiết trong thứ Hai`);

/* Tiết chào cờ (thứ Hai sáng tiết 1): CẢ 25 giáo viên chủ nhiệm đều đang
   đứng lớp mình — ứng viên dạy thay chỉ có thể là giáo viên bộ môn rảnh. */
const chaoCo = vangT2.find(o => o.buoi === 'S' && o.i === 0);
const uvChaoCo = goiYDayThay(chaoCo, chaoCo.lopId, gvCN1A.id);
kt('Giờ chào cờ mọi chủ nhiệm đều bận — gợi ý chỉ còn giáo viên bộ môn rảnh', (() => {
  const lich = lichTraGV();
  return uvChaoCo.length > 0 &&
    uvChaoCo.every(u => u.gv.id !== gvCN1A.id) &&
    uvChaoCo.every(u => !lich[u.gv.id]?.[chaoCo.khoa]) &&        /* trống tiết đó */
    uvChaoCo.every(u => !u.gv.cn);                               /* không ai là chủ nhiệm */
})(), `${uvChaoCo.length} ứng viên, đầu bảng: ${uvChaoCo[0]?.gv.hoTen}`);
kt('Ứng viên xếp hạng giảm dần theo điểm, kèm lý do đọc được',
   uvChaoCo.every((u, i) => i === 0 || u.diem <= uvChaoCo[i - 1].diem) &&
   uvChaoCo.every(u => u.lyDo.length > 0));
kt('Người đăng ký bận buổi đó không bao giờ được gợi ý', (() => {
  const dau = uvChaoCo[0]?.gv.id; if (!dau) return false;
  S.gvNghi[dau] = ['2-S'];
  const sau = goiYDayThay(chaoCo, chaoCo.lopId, gvCN1A.id);
  delete S.gvNghi[dau];
  return !sau.some(u => u.gv.id === dau);
})());

/* ---------- 9. Tối ưu bằng hoán đổi cục bộ ---------- */
console.log('\n9. Tối ưu bằng hoán đổi cục bộ');

/* Đếm những thứ người thật nhìn ra được, không phải điểm phạt trừu tượng */
function doDac() {
  let nangChieu = 0, trongKep = 0;
  const bb = buoiBat();
  const lich = {};
  Object.entries(S.tkb).forEach(([lp, o]) => Object.entries(o).forEach(([k, t]) => {
    (lich[t.gvId] = lich[t.gvId] || {})[k] = lp;
    if (['Toán', 'Tiếng Việt'].includes(t.mon) && k.split('-')[1] === 'C') nangChieu++;
  }));
  Object.values(lich).forEach(o => bb.forEach(k => {
    const kB = `${k.thu}-${k.buoi}`;
    let dau = -1, cuoi = -1, co = 0;
    for (let i = 0; i < k.tiet; i++) if (o[`${kB}-${i}`]) { if (dau < 0) dau = i; cuoi = i; co++; }
    if (co > 1) trongKep += cuoi - dau + 1 - co;
  }));
  return { nangChieu, trongKep };
}
const soTietMoiLop = () => S.lop.map(l => Object.keys(S.tkb[l.id]).length).join(',');

await taiDuLieu();
const rTham = xepTuDong(0);              /* 0 mili giây → chỉ xếp tham lam, bỏ tối ưu */
const dTruoc = diemToanCuc(), doTruoc = doDac(), tietTruoc = soTietMoiLop();
const tu = toiUuHoanDoi(1200);
const doSau = doDac();

kt('Tối ưu không làm mất tiết nào của lớp nào', soTietMoiLop() === tietTruoc,
   `${rTham.daXep} tiết trước và sau`);
kt('Tối ưu không sinh xung đột mới', (() => {
  const s = soatLuoi();
  return s.trungTiet === 0 && s.saiDiemTruong === 0;
})());
kt('Tiết chào cờ và sinh hoạt lớp không bị đụng vào',
   S.lop.every(l => S.tkb[l.id]['2-S-0']?.mon === 'HDTN'
     && S.tkb[l.id][`6-S-${soTietBuoi(buoiBat().find(k => k.thu === 6 && k.buoi === 'S'), l.khoi) - 1}`]?.mon === 'HDTN'));
kt('Điểm phạt giảm rõ rệt', tu.sau < dTruoc * 0.8,
   `${dTruoc} → ${tu.sau} (giảm ${tu.caiThien}%) sau ${tu.doi} lần đổi chỗ`);
kt('Bớt hẳn Toán và Tiếng Việt bị đẩy xuống buổi chiều',
   doSau.nangChieu < doTruoc.nangChieu / 2,
   `${doTruoc.nangChieu} → ${doSau.nangChieu} tiết`);
kt('Bớt hẳn tiết trống kẹp giữa buổi của giáo viên',
   doSau.trongKep < doTruoc.trongKep / 2,
   `${doTruoc.trongKep} → ${doSau.trongKep} tiết trống`);
kt('Chạy trong hạn thời gian đã đặt', +tu.giay <= 1.5, `${tu.giay} giây · ${tu.vong} lượt rà`);

/* ---------- 9b. Ghim tiết ----------
   Trước đây bấm "Bắt đầu xếp" lần nữa là xoá sạch mọi chỉnh tay. Người xếp
   chỉnh cả buổi rồi mất trắng thì không dám bấm nút đó lần thứ hai. */
console.log('\n9b. Ghim tiết khi xếp lại');

await taiDuLieu();
xepTuDong(0);
/* Ghim tay ba tiết ở ba lớp khác nhau, nhớ lại chúng là tiết gì */
const daGhim = S.lop.slice(0, 3).map(l => {
  const khoa = Object.keys(S.tkb[l.id]).find(k => k !== '2-S-0' && S.tkb[l.id][k].mon !== 'HDTN');
  S.tkb[l.id][khoa].ghim = true;
  return { lop: l.id, khoa, mon: S.tkb[l.id][khoa].mon, gv: S.tkb[l.id][khoa].gvId };
});

const rGhim = xepTuDong(0);
kt('Xếp lại vẫn giữ nguyên tiết đã ghim', rGhim.soGhim === 3 &&
   daGhim.every(x => S.tkb[x.lop][x.khoa]?.mon === x.mon && S.tkb[x.lop][x.khoa]?.gvId === x.gv),
   `${rGhim.soGhim} tiết ghim đứng yên`);
kt('Ghim rồi vẫn xếp đủ tiết, không đếm thừa đếm thiếu',
   rGhim.daXep === 710 && rGhim.chuaXep.length === 0, `${rGhim.daXep}/${rGhim.tongCan} tiết`);
kt('Bước tối ưu không đổi chỗ tiết đã ghim',
   daGhim.every(x => laGhim(S.lop.find(l => l.id === x.lop), x.khoa) === true));

/* Bản lưu phải mang theo cờ ghim, nếu không thì tải về là mất công chỉnh tay */
const goiGhim = docTKB(dongGoiTKB());
kt('Lưu rồi tải lại vẫn còn dấu ghim',
   daGhim.every(x => S.tkb[x.lop][x.khoa]?.ghim === true), `${goiGhim.nap} tiết nạp lại`);

/* ---------- 10. Nhập dữ liệu từ Excel ---------- */
console.log('\n10. Đọc và soát tệp Excel');

const T_GV = [
  { Ma_GV: 'GV01', Ho_ten: 'Nguyễn Thị Dung', Chu_nhiem: '1A' },
  { Ma_GV: 'GV02', Ho_ten: 'Đặng Thị Dung', Chu_nhiem: '2B', Dinh_muc: 20 },
  { Ma_GV: 'GV03', Ho_ten: 'Phan Thị Hương' }
];
const T_LOP = [
  { Ma_lop: 'L1', Ten_lop: '1A', Khoi: 1, Diem_truong: 'Điểm A' },
  { Ma_lop: 'L2', Ten_lop: '2B', Khoi: 2, Diem_truong: 'Điểm B' }
];
const T_PC = [
  { Ma_GV: 'GV01', Ma_lop: 'L1', Mon: 'Toán', So_tiet: 5 },
  { Ma_GV: 'GV02', Ma_lop: 'L2', Mon: 'Tiếng Việt', So_tiet: 7 },
  { Ma_GV: 'GV03', Ma_lop: 'L1', Mon: 'Mỹ thuật', So_tiet: 1 }
];

const tep = duLieuTuBang(T_GV, T_LOP, T_PC);
kt('Tệp đúng thì không báo lỗi nào', tep.soLoi === 0, tep.loi.join(' | ') || 'sạch');
kt('Đọc đúng giáo viên, lớp, phân công và tổng tiết',
   tep.giaoVien.length === 3 && tep.lop.length === 2 &&
   tep.phanCong.length === 3 && tep.tongTiet === 13);
kt('Tự dựng điểm trường từ cột Diem_truong và gán lớp về đúng nơi',
   tep.diemTruong.length === 2 &&
   tep.diemTruong.find(d => d.id === tep.lopDT.L1).ten === 'Điểm A' &&
   tep.diemTruong.find(d => d.id === tep.lopDT.L2).ten === 'Điểm B');
kt('Định mức riêng đọc được, bỏ trống thì lấy 23',
   tep.giaoVien[1].dinhMuc === 20 && tep.giaoVien[2].dinhMuc === 23);

/* Nạp thẳng vào S rồi xếp — chứng minh tệp Excel dùng được ngay */
napVaoS(tep);
const rTep = xepTuDong(0);
kt('Nhập xong xếp được ngay, không cần sửa gì thêm',
   rTep.daXep === 13 && rTep.chuaXep.length === 0, `${rTep.daXep}/13 tiết`);

/* Soát lỗi: mỗi lỗi phải chỉ đúng dòng, vì người nhập cầm tệp Excel trong tay */
const xau = duLieuTuBang(
  [{ Ma_GV: 'GV01', Ho_ten: 'A', Chu_nhiem: '9Z' }, { Ma_GV: 'GV01', Ho_ten: 'B' }, { Ma_GV: '', Ho_ten: 'C' }],
  [{ Ma_lop: 'L1', Ten_lop: '1A', Khoi: 9 }, { Ma_lop: 'L2', Ten_lop: '1A', Khoi: 1 }],
  [{ Ma_GV: 'GVXX', Ma_lop: 'L1', Mon: 'Toán', So_tiet: 5 },
   { Ma_GV: 'GV01', Ma_lop: 'L9', Mon: '', So_tiet: 0 }]);
const co = t => xau.loi.some(x => x.includes(t));
kt('Bắt được mã giáo viên lặp — thứ khiến không dò ngược được', co('Ma_GV "GV01"'));
kt('Bắt được tên lớp lặp trong CÙNG một điểm trường', co('Ten_lop "1A"'));
kt('Bắt được khối ngoài 1–5, thiếu mã, thiếu môn, số tiết bằng 0',
   co('Khoi phải từ 1 đến 5') && co('thiếu Ma_GV') && co('thiếu tên môn') && co('So_tiet'));
kt('Bắt được chủ nhiệm trỏ tới lớp không có thật', co('chủ nhiệm lớp "9Z"'));
kt('Bắt được phân công trỏ tới giáo viên và lớp không có thật',
   co('giáo viên mã "GVXX"') && co('lớp mã "L9"'));
kt('Mọi lỗi đều chỉ rõ số dòng trong Excel',
   xau.loi.filter(x => /dòng \d+/.test(x)).length >= 4,
   xau.loi.find(x => /dòng \d+/.test(x)));

/* ---------- Sáp nhập ba trường: ba lớp cùng tên "1A" ----------
   Đây là tệp Excel thật của ngày gộp ba trường. Trước đây bộ soát chặn thẳng
   vì trùng Ten_lop, buộc nhà trường đổi tên lớp chỉ để chiều phần mềm. */
const BA_TRUONG = duLieuTuBang(
  [{ Ma_GV: 'DL01', Ho_ten: 'Nguyễn Thị Trinh', Chu_nhiem: 'DL-1A' },
   { Ma_GV: 'DD01', Ho_ten: 'Trần Thị Hoa',     Chu_nhiem: 'DD-1A' },
   { Ma_GV: 'DT01', Ho_ten: 'Lê Thị Mai',       Chu_nhiem: 'DT-1A' }],
  [{ Ma_lop: 'DL-1A', Ten_lop: '1A', Khoi: 1, Diem_truong: 'Điểm trường Diễn Liên' },
   { Ma_lop: 'DD-1A', Ten_lop: '1A', Khoi: 1, Diem_truong: 'Điểm trường Diễn Đồng' },
   { Ma_lop: 'DT-1A', Ten_lop: '1A', Khoi: 1, Diem_truong: 'Điểm trường Diễn Thái' }],
  [{ Ma_GV: 'DL01', Ma_lop: 'DL-1A', Mon: 'Toán', So_tiet: 5 },
   { Ma_GV: 'DD01', Ma_lop: 'DD-1A', Mon: 'Toán', So_tiet: 5 },
   { Ma_GV: 'DT01', Ma_lop: 'DT-1A', Mon: 'Toán', So_tiet: 5 }]);

kt('Ba điểm trường cùng có lớp "1A" là hợp lệ, không phải đổi tên lớp',
   BA_TRUONG.soLoi === 0 && BA_TRUONG.lop.length === 3,
   BA_TRUONG.loi.join(' | ') || '3 lớp cùng tên, 3 điểm trường');
kt('Mỗi lớp "1A" nối đúng cô chủ nhiệm của mình',
   BA_TRUONG.giaoVien.find(g => g.id === 'DL01').cn === 'DL-1A' &&
   BA_TRUONG.giaoVien.find(g => g.id === 'DD01').cn === 'DD-1A' &&
   BA_TRUONG.giaoVien.find(g => g.id === 'DT01').cn === 'DT-1A',
   'chủ nhiệm đi bằng Ma_lop, không bằng tên');
kt('Ba lớp về đúng ba điểm trường khác nhau',
   new Set(Object.values(BA_TRUONG.lopDT)).size === 3);

/* Trùng tên mà cột Chu_nhiem lại ghi tên lớp thì phải nói rõ phải làm gì */
const mapMo = duLieuTuBang(
  [{ Ma_GV: 'GV1', Ho_ten: 'Cô A', Chu_nhiem: '1A' }],
  [{ Ma_lop: 'X1', Ten_lop: '1A', Khoi: 1, Diem_truong: 'Điểm A' },
   { Ma_lop: 'X2', Ten_lop: '1A', Khoi: 1, Diem_truong: 'Điểm B' }],
  [{ Ma_GV: 'GV1', Ma_lop: 'X1', Mon: 'Toán', So_tiet: 5 }]);
kt('Chủ nhiệm ghi tên lớp trùng thì báo rõ phải ghi Ma_lop',
   mapMo.soLoi === 1 && /ghi Ma_lop/.test(mapMo.loi[0]),
   mapMo.loi[0]);

/* Nạp vào S rồi xếp — tên lớp trùng nhau không được làm lẫn chủ nhiệm */
napVaoS(BA_TRUONG);
const rBa = xepTuDong(0);
kt('Xếp được cho ba lớp trùng tên, mỗi lớp đủ tiết',
   rBa.daXep === 15 && rBa.chuaXep.length === 0 &&
   S.lop.every(l => Object.keys(S.tkb[l.id]).length === 5),
   `${rBa.daXep}/15 tiết`);

/* Ghi lên máy chủ: chưa đăng nhập thì phải từ chối tử tế */
const ghiKhi = await ghiDuLieuNguon(tep);
kt('Chưa nối máy chủ thì không ghi được, báo rõ',
   ghiKhi.ok === false && ghiKhi.thongBao.length > 20, ghiKhi.thongBao);

/* Ghi thật lên máy chủ giả — đây mới là đường mở cho trường thứ hai */
/* ---------- 10b. Mẫu ma trận một trang ---------- */
console.log('\n10b. Mẫu Excel ma trận một trang');

/* Mục 10 vừa nạp bộ dữ liệu nhỏ để thử đọc tệp — về lại dữ liệu thật đã */
await taiDuLieu();

/* Đổi mảng hai chiều của bangMauMaTran thành dạng sheet_to_json trả về:
   mỗi dòng một object, ô trống bị bỏ qua — đúng như đọc tệp thật. */
const doiObj = a => { const dau = a[0]; return a.slice(1).map(h => {
  const o = {}; dau.forEach((c, i) => { const v = h[i]; if (v !== '' && v != null) o[c] = v; }); return o; }); };

const mMT = bangMauMaTran();
kt('Mẫu dựng từ dữ liệu thật: 35 dòng giáo viên, mỗi môn một cột',
   mMT.coThat && mMT.mt.length === 36 && mMT.mt[0].length === 6 + mMT.dsMon.length,
   `${mMT.mt.length - 1} dòng · ${mMT.dsMon.length} cột môn`);

const rtDL = duLieuTuMaTran(doiObj(mMT.mt), doiObj(mMT.lop));
kt('Vòng khép kín: xuất ma trận rồi nhập lại — 0 lỗi, đủ 35 GV · 25 lớp · 265 dòng · 710 tiết',
   rtDL.soLoi === 0 && rtDL.giaoVien.length === 35 && rtDL.lop.length === 25 &&
   rtDL.phanCong.length === 265 && rtDL.tongTiet === 710,
   `${rtDL.soLoi} lỗi · ${rtDL.phanCong.length} dòng · ${rtDL.tongTiet} tiết`);
kt('Từng dòng phân công khớp nguyên bản — đúng người, đúng lớp, đúng môn, đúng tiết', (() => {
  const bo = new Set(rtDL.phanCong.map(p => `${p.gvId}|${p.lopId}|${p.mon}|${p.soTiet}`));
  return S.phanCong.every(p => bo.has(`${p.gvId}|${p.lopId}|${p.mon}|${p.soTiet}`));
})());
kt('Chủ nhiệm giữ nguyên qua vòng xuất nhập',
   rtDL.giaoVien.filter(g => g.cn).length === S.giaoVien.filter(g => g.cn).length);

/* Các quy ước ghi — thử trên bảng nhỏ tự dựng, KHÔNG kèm trang lớp */
const mtThu = [
  { TT: 1, Ho_ten: 'Cô Mơ', Chu_nhiem: 'DL-1A', 'Tiếng Việt': 'x', 'Toán': 'x' },
  { TT: 2, Ma_GV: 'MT', Ho_ten: 'Cô Mai', Lop_day: 'DL-3B, DL-4C', Buoi_ban: 'T2-S, t5c',
    'Tin học': 'x', 'CN': 'DL-4C' }
];
const rt2 = duLieuTuMaTran(mtThu, null);
kt('Không có trang lớp thì tự dựng lớp, khối lấy theo chữ số trong tên (DL-3B → khối 3)',
   rt2.soLoi === 0 && rt2.lop.length === 3 &&
   rt2.lop.find(l => l.id === 'DL-3B')?.khoi === 3 && rt2.lop.find(l => l.id === 'DL-4C')?.khoi === 4);
kt('Thiếu Ma_GV thì tự đặt GV01; đánh x không có Lop_day thì lấy lớp chủ nhiệm',
   rt2.giaoVien[0].id === 'GV01' && rt2.giaoVien[0].cn === 'DL-1A' &&
   rt2.phanCong.some(p => p.gvId === 'GV01' && p.lopId === 'DL-1A' && p.mon === 'Tiếng Việt' && p.soTiet === 12) &&
   rt2.phanCong.some(p => p.gvId === 'GV01' && p.mon === 'Toán' && p.soTiet === 3));
kt('Ô ghi danh sách lớp thì chỉ dạy đúng các lớp ấy, không theo Lop_day',
   rt2.phanCong.filter(p => p.gvId === 'MT' && p.mon === 'Tin học').length === 2 &&
   rt2.phanCong.filter(p => p.gvId === 'MT' && p.mon === 'CN').length === 1 &&
   rt2.phanCong.find(p => p.gvId === 'MT' && p.mon === 'CN')?.lopId === 'DL-4C');
kt('Buổi bận đọc được cả T2-S lẫn t5c viết thường',
   (rt2.gvNghi.MT || []).sort().join() === '2-S,5-C');

/* Những chỗ phải chặn — lỗi nói rõ dòng nào, sửa gì */
const rt3 = duLieuTuMaTran([
  { Ho_ten: 'Cô An', Lop_day: '1A', 'Múa': 'x' },
  { Ho_ten: 'Cô Bình', 'Tiếng Việt': 'x' },
  { Ho_ten: 'Cô Bình', 'Toán': '1A' }
], null);
kt('Cột môn lạ và họ tên lặp không mã đều bị chặn, kèm hướng sửa',
   rt3.soLoi >= 3 &&
   rt3.loi.some(x => /không có trong danh mục môn/.test(x)) &&
   rt3.loi.some(x => /nhiều dòng không có mã/.test(x)));
kt('Đánh x mà không có Lop_day lẫn lớp chủ nhiệm thì báo đúng ô',
   duLieuTuMaTran([{ Ho_ten: 'Cô Ca', 'Toán': 'x' }], null)
     .loi.some(x => /Lop_day trống/.test(x)));
kt('Có trang lớp mà ghi tên trùng giữa hai điểm trường thì bắt ghi mã', (() => {
  const r = duLieuTuMaTran(
    [{ Ho_ten: 'Cô Dung', Lop_day: '1A', 'Tiếng Việt': 'x' }],
    [{ Ma_lop: 'DL-1A', Ten_lop: '1A', Khoi: 1, Diem_truong: 'Diễn Liên' },
     { Ma_lop: 'DD-1A', Ten_lop: '1A', Khoi: 1, Diem_truong: 'Diễn Đồng' }]);
  return r.loi.some(x => /nhiều lớp cùng tên "1A"/.test(x));
})());

console.log('\n11. Ghi dữ liệu nguồn lên máy chủ');
await MC.dangNhap('c@t.vn', 'dung');
const ghiMC = await MC.ghiDuLieuNguon(tep);
kt('Ghi lên máy chủ thành công', ghiMC.ok === true, ghiMC.thongBao);
kt('Tạo đủ điểm trường lấy từ cột Diem_truong',
   GHI.diemTruong.length === 2 && GHI.diemTruong.some(d => d.ten === 'Điểm A'));
kt('Ghi khung giờ kèm số tiết riêng từng khối',
   GHI.khungGio.length === 10 && GHI.khungGio.some(k => k.so_tiet_khoi && k.so_tiet_khoi[4] === 5));
kt('Giáo viên ghi bằng ma_gv — khoá tự nhiên giữ nguyên mã UUID khi nhập lại',
   GHI.giaoVien.length === 3 && GHI.giaoVien[0].ma_gv === 'GV01' &&
   GHI.giaoVien[1].dinh_muc === 20);
kt('Lớp nối đúng chủ nhiệm và đúng điểm trường',
   GHI.lop.length === 2 &&
   GHI.lop.find(l => l.ten === '1A').gvcn_id === 'gv-uuid-0' &&
   GHI.lop.find(l => l.ten === '1A').diem_truong_id !== GHI.lop.find(l => l.ten === '2B').diem_truong_id);
kt('Phân công xoá sạch rồi ghi lại, mọi dòng nối đúng mã',
   GHI.xoaPhanCong === 1 && GHI.phanCong.length === 3 &&
   GHI.phanCong.every(p => /^gv-uuid-/.test(p.giao_vien_id) && /^lop-uuid-/.test(p.lop_id)),
   `xoá ${GHI.xoaPhanCong} lần · ghi ${GHI.phanCong.length} dòng`);
kt('Tổng số tiết ghi lên đúng bằng tệp Excel',
   GHI.phanCong.reduce((s, p) => s + p.so_tiet, 0) === tep.tongTiet,
   `${tep.tongTiet} tiết`);

/* Buổi bận: ràng buộc cứng số 7. Có sẵn trong thuật toán và trong cơ sở dữ
   liệu từ đầu, nhưng trước đây không màn hình nào ghi vào được. */
const banKhi = await luuBuoiBan({ g2: ['3-S'] });
kt('Chưa nối máy chủ thì không lưu buổi bận, báo rõ',
   banKhi.ok === false && banKhi.thongBao.length > 20, banKhi.thongBao);

MC.KHO.nguon = 'may-chu';
const banMC = await MC.luuBuoiBan({ g2: ['3-S', '5-C'], g1: [] });
kt('Lưu buổi bận lên máy chủ: xoá bản cũ rồi ghi lại',
   banMC.ok === true && GHI.xoaNghi === 1 && GHI.gvNghi.length === 2, banMC.thongBao);
kt('Mỗi buổi bận ghi đúng thứ và buổi, nối đúng giáo viên',
   GHI.gvNghi.every(n => n.giao_vien_id === 'g2' && n.truong_id === 't1') &&
   GHI.gvNghi.some(n => n.thu === 3 && n.buoi === 'S') &&
   GHI.gvNghi.some(n => n.thu === 5 && n.buoi === 'C'));

const banHet = await MC.luuBuoiBan({});
kt('Bỏ hết đánh dấu cũng được ghi nhận, không sót dòng cũ trên máy chủ',
   banHet.ok === true && banHet.so === 0 && GHI.xoaNghi === 2, banHet.thongBao);

/* Mẫu ma trận mang theo buổi bận — ghiDuLieuNguon phải đẩy cả lên máy chủ,
   nối theo mã UUID chứ không phải mã trong tệp */
const ghiBan = await MC.ghiDuLieuNguon({ ...tep, gvNghi: { GV01: ['2-S', '5-C'] } });
kt('Nhập ma trận thì buổi bận trong tệp cũng lên máy chủ, nối đúng UUID',
   ghiBan.ok === true && GHI.xoaNghi === 3 && GHI.gvNghi.length === 2 &&
   GHI.gvNghi.every(n => n.giao_vien_id === 'gv-uuid-0') &&
   GHI.gvNghi.some(n => n.thu === 2 && n.buoi === 'S'));
kt('Tệp 3 trang không có buổi bận thì không đụng gì tới bảng gv_nghi', await (async () => {
  const truoc = GHI.xoaNghi;
  await MC.ghiDuLieuNguon(tep);            /* gvNghi rỗng */
  return GHI.xoaNghi === truoc;
})());

/* Buổi bận là ràng buộc CỨNG: máy không được xếp tiết nào vào đó */
napVaoS(tuMayChu(HANG));          /* g2 đã đăng ký bận sáng thứ Ba */
xepTuDong(0);
const loLich = Object.entries(S.tkb).flatMap(([lp, o]) =>
  Object.entries(o).filter(([k, t]) => t.gvId === 'g2' && k.startsWith('3-S-')));
kt('Không xếp tiết nào vào buổi giáo viên đã báo bận', loLich.length === 0,
   `${loLich.length} tiết lọt vào buổi bận`);

/* Lỗi thật do phép thử giao diện phát hiện: tiết chào cờ được ghim theo quy
   định nhà trường, nhưng lúc ghim lại quên hỏi giáo viên có bận buổi đó không.
   Ràng buộc cứng thì phải cứng với cả tiết ghim sẵn. */
await taiDuLieu();
const cnLop1 = S.giaoVien.find(g => g.cn);
S.gvNghi[cnLop1.id] = ['2-S'];            /* cô chủ nhiệm bận sáng thứ Hai */
xepTuDong(0);
const lotGhim = Object.entries(S.tkb).flatMap(([lp, o]) =>
  Object.entries(o).filter(([k, t]) => t.gvId === cnLop1.id && k.startsWith('2-S-')));
kt('Tiết chào cờ cũng không được đè lên buổi chủ nhiệm đã báo bận',
   lotGhim.length === 0, `${lotGhim.length} tiết lọt`);
const kR11 = kiemTra();
kt('Báo rõ lớp nào đang thiếu người chào cờ vì chủ nhiệm bận (R11)',
   kR11.vm.some(v => v.ma === 'R11' && v.t.includes(tenLopDay(cnLop1.cn))),
   kR11.vm.find(v => v.ma === 'R11')?.t);
delete S.gvNghi[cnLop1.id];

/* ---------- 12. Cấp tài khoản hàng loạt ---------- */
console.log('\n12. Cấp tài khoản hàng loạt cho giáo viên');

await taiDuLieu();          /* về lại 35 giáo viên thật */
const tk = tenDangNhapGV(S.giaoVien, 'tkb.local');

kt('Sinh đủ tên đăng nhập cho mọi giáo viên', tk.length === S.giaoVien.length,
   `${tk.length} tài khoản`);
kt('Không tên đăng nhập nào trùng nhau',
   new Set(tk.map(x => x.ten)).size === tk.length,
   `${new Set(tk.map(x => x.ten)).size} tên khác nhau`);
kt('Tên đăng nhập không dấu, không khoảng trắng',
   tk.every(x => /^[a-z][a-z0-9]*$/.test(x.ten)),
   tk.slice(0, 4).map(x => x.ten).join(', ') + '…');

/* Bốn cặp trùng tên gọi là chỗ dễ vỡ nhất — hai cô Dung phải ra hai tên khác nhau */
const dung = tk.filter(x => /Dung$/.test(x.gv.hoTen));
kt('Hai cô cùng tên "Dung" ra hai tên đăng nhập khác nhau',
   dung.length === 2 && dung[0].ten !== dung[1].ten,
   dung.map(x => `${x.gv.hoTen} → ${x.ten}`).join(' · '));

const trungTen = {};
S.giaoVien.forEach(g => {
  const cuoi = g.hoTen.trim().split(/\s+/).pop();
  (trungTen[cuoi] = trungTen[cuoi] || []).push(g.hoTen);
});
const soCapTrung = Object.values(trungTen).filter(a => a.length > 1).length;
kt('Cả bốn cặp trùng tên đều tách được',
   soCapTrung === 4 && new Set(tk.map(x => x.ten)).size === tk.length,
   `${soCapTrung} cặp trùng, vẫn ra ${tk.length} tên riêng biệt`);

const mk = Array.from({ length: 200 }, () => matKhauNgauNhien());
kt('Mật khẩu đủ dài và không có ký tự dễ nhìn nhầm',
   mk.every(x => x.length === 6 && !/[ilo01]/.test(x)),
   'bỏ i · l · o · 0 · 1');
kt('Mật khẩu không lặp lại nhau', new Set(mk).size > 190,
   `${new Set(mk).size}/200 khác nhau`);

/* ================================================================
   13. QUY TRÌNH BA BƯỚC, DANH MỤC MÔN, PHÒNG, SẢN PHẨM MỚI
   ---------------------------------------------------------------
   Quy trình cũ đặt phần khai báo dữ liệu ở cuối và thiếu năm màn hình,
   nên trường nào không có tệp kết xuất Excel thì không khai báo được gì.
   ================================================================ */
console.log('\n13. Quy trình ba bước và các màn hình khai báo');

/* Ứng dụng thứ hai, sạch trạng thái, để thử tiến độ lúc chưa có gì */
const ung2 = taoUngDung(documentGia);
ung2.S.lop = []; ung2.S.giaoVien = []; ung2.S.phanCong = []; ung2.S.tkb = {};
const td0 = ung2.tienDo(null);
kt('Trường mới mở lên: bước 1 chưa xong và nói rõ thiếu gì',
   !td0.b1.xong && td0.b1.thieu.some(x => /lớp/i.test(x.t)) &&
   td0.b1.thieu.some(x => /giáo viên/i.test(x.t)),
   td0.b1.thieu.map(x => x.t).join(' · '));
kt('Mỗi việc còn thiếu chỉ đúng màn hình phải tới',
   td0.b1.thieu.every(x => typeof x.di === 'string' && x.di.length > 1));
kt('Chưa xếp thì bước 3 chưa mở được',
   !td0.b3.xong && /Xếp xong/.test(td0.b3.thieu[0].t));

/* Dữ liệu thật đã xếp xong: cả ba bước phải sạch */
xepTuDong();
const td1 = tienDo(kiemTra());
kt('Dữ liệu thật đã xếp xong thì cả ba bước đều xong',
   td1.b1.xong && td1.b2.xong && td1.b3.xong,
   `${td1.xep}/${td1.can} tiết`);

kt('Quy tắc R01 xét định mức của TỪNG người, không dùng con số chung', (() => {
  /* Cô nào đang đúng 23 tiết: hạ định mức riêng xuống 20 thì R01 phải kêu */
  const x = kiemTra().gv.find(y => y.tong >= 20 && y.tong <= 23);
  if (!x) return false;
  const cu = x.g.dinhMuc;
  x.g.dinhMuc = 15;
  const keu = kiemTra().vm.some(v => v.ma === 'R01' && v.t.includes(x.g.hoTen) &&
                                     v.m.includes('định mức là 15 tiết'));
  x.g.dinhMuc = cu;
  return keu;
})(), 'người kiêm nhiệm khai định mức thấp hơn thì máy tôn trọng');

console.log('\n  Sinh lớp hàng loạt');
const sinh = sinhLop(1, 5, 'DD', 'dt2');
kt('Khai "khối 1 có 5 lớp" ra đúng 1A–1E',
   sinh.length === 5 && sinh.map(l => l.ten).join(',') === '1A,1B,1C,1D,1E');
kt('Mã lớp mang tiền tố điểm trường',
   sinh.every(l => l.maLop.startsWith('DD-')) && sinh[0].maLop === 'DD-1A');
kt('Ba điểm trường cùng khai "1A" vẫn ra ba mã khác nhau', (() => {
  const ma = ['DL', 'DD', 'DT'].map(t => sinhLop(1, 1, t, 'x')[0].maLop);
  return new Set(ma).size === 3;
})(), ['DL', 'DD', 'DT'].map(t => sinhLop(1, 1, t, 'x')[0].maLop).join(' · '));
kt('Không tiền tố thì mã chính là tên lớp', sinhLop(3, 1, '', 'dt1')[0].maLop === '3A');
kt('Số lớp âm hoặc quá 26 đều bị chặn',
   sinhLop(1, -3, '', 'x').length === 0 && sinhLop(1, 99, '', 'x').length === 26);

console.log('\n  Danh mục môn học');
kt('Danh mục mặc định phủ đủ 13 môn của chương trình',
   dsMonMacDinh().length === 13);
kt('Toán và Tiếng Việt được đánh dấu ưu tiên sáng sớm',
   laMonNang('Toán') && laMonNang('Tiếng Việt') && !laMonNang('Mỹ thuật'));
kt('GDTC, Mỹ thuật, Âm nhạc tránh đầu cuối buổi',
   laMonNhe('GDTC') && laMonNhe('Mỹ thuật') && !laMonNhe('Toán'));
kt('Số tiết chuẩn khớp CT GDPT 2018 theo từng khối',
   chuanMon('Tiếng Việt', 1) === 12 && chuanMon('Tiếng Việt', 3) === 7 &&
   chuanMon('Toán', 1) === 3 && chuanMon('Toán', 5) === 5,
   'TV K1=12 · TV K3=7 · Toán K1=3 · Toán K5=5');
kt('Khối không học môn đó thì trả 0, không đoán bừa',
   chuanMon('Khoa học', 1) === 0 && chuanMon('TNXH', 5) === 0);
kt('Tổng tiết chuẩn cả năm khối đúng bằng chuẩn chương trình', (() => {
  const tong = k => dsMonMacDinh().reduce((s, m) => s + (m.chuan[k] || 0), 0);
  return [1, 2, 3, 4, 5].every(k => tong(k) === ({ 1: 27, 2: 27, 3: 28, 4: 30, 5: 30 })[k]);
})(), [1, 2, 3, 4, 5].map(k =>
  'K' + k + '=' + dsMonMacDinh().reduce((s, m) => s + (m.chuan[k] || 0), 0)).join(' · '));
kt('Chỉ Tin học được đánh dấu cần phòng chức năng',
   monCanPhong('Tin học') === 'Tin học' && monCanPhong('Toán') === '');
kt('Môn lạ trong bảng phân công vẫn được kể vào danh sách đang dùng', (() => {
  const truoc = dsMonDung().length;
  S.phanCong.push({ gvId: S.giaoVien[0].id, lopId: S.lop[0].id, mon: 'Tiếng dân tộc', soTiet: 1 });
  const sau = dsMonDung().length;
  S.phanCong.pop();
  return sau === truoc + 1;
})());

console.log('\n  Phòng chức năng');
kt('Chưa khai phòng thì vẫn xét bằng cờ phòng Tin của điểm trường',
   S.phong.length === 0 && coPhong(S.diemTruong[0].id, 'Tin học') === !!S.diemTruong[0].phongTin);
kt('Môn không cần phòng thì luôn hợp lệ', coPhong('bất kỳ', '') === true);
kt('Khai bảng phòng rồi thì xét đúng theo bảng đó', (() => {
  S.phong = [{ id: 'p1', ten: 'Phòng máy', dtId: S.diemTruong[0].id, mon: 'Tin học' }];
  const co = coPhong(S.diemTruong[0].id, 'Tin học');
  const khong = coPhong('dt-khong-co', 'Tin học');
  S.phong = [];
  return co && !khong;
})());
kt('Cờ phòng Tin của điểm trường suy ra từ bảng phòng, một nguồn sự thật', (() => {
  const cu = S.diemTruong[0].phongTin;
  S.phong = [{ id: 'p1', ten: 'Phòng nhạc', dtId: S.diemTruong[0].id, mon: 'Âm nhạc' }];
  dongBoPhongTin();
  const tat = S.diemTruong[0].phongTin === false;
  S.phong = []; S.diemTruong[0].phongTin = cu;
  return tat;
})());

console.log('\n  Bản xuất toàn trường và theo khối');
const aTT = luoiToanTruong(S.lop);
kt('Lưới toàn trường đủ một cột cho mỗi lớp',
   aTT[4].length === S.lop.length + 3, `${aTT[4].length - 3} cột lớp`);
kt('Có dòng ghi khối ngay trên tên lớp',
   aTT[3][3] === 'Khối 1' && aTT[3][aTT[3].length - 1] === 'Khối 5');
kt('Cột xếp theo khối nhỏ trước, trong khối thì A→E',
   aTT[4].slice(3).join(',') === xepTheoKhoi(S.lop).map(l => l.ten).join(','));
kt('Ô của khối tan sớm ghi rõ "Nghỉ", không để trống lẫn với tiết chưa xếp',
   aTT.slice(5).some(h => h.includes('Nghỉ')));
kt('Bản xuất toàn trường ghi họ tên đầy đủ, không dùng tên gọi rút gọn',
   aTT.slice(5).flatMap(h => h.slice(3)).filter(x => String(x).includes(' — ')).length > 400 &&
   !aTT.slice(5).flatMap(h => h.slice(3)).some(x => /— Cô |— Thầy /.test(String(x))));

const soLopK1 = lopTheoKhoi(1, S.lop).length;
const aK1 = luoiTheoKhoiHoc(1, S.lop);
kt('Lưới theo khối chỉ lấy lớp của khối đó',
   aK1[3].length === soLopK1 + 3, `khối 1 có ${soLopK1} lớp`);
kt('Lưới theo khối bỏ hẳn các tiết khối đó không học', (() => {
  const soDongK1 = aK1.length - 4;
  const soDongTT = aTT.length - 5;
  return soDongK1 < soDongTT;                     /* khối 1 tan sớm nên ít dòng hơn */
})(), `${aK1.length - 4} dòng · toàn trường ${aTT.length - 5} dòng`);
kt('Số ô có tiết trong lưới khối 1 đúng bằng số tiết đã xếp của khối đó', (() => {
  const trongBang = aK1.slice(4).reduce((s, h) =>
    s + h.slice(3).filter(x => String(x).trim()).length, 0);
  const thucTe = lopTheoKhoi(1, S.lop)
    .reduce((s, l) => s + Object.keys(S.tkb[l.id] || {}).length, 0);
  return trongBang === thucTe;
})());
kt('Mọi khối đang có đều dựng được lưới riêng',
   khoiDangCo(S.lop).every(k => luoiTheoKhoiHoc(k, S.lop).length > 4),
   khoiDangCo(S.lop).join(' · '));

/* ================================================================
   14. PHÒNG CHỨC NĂNG — RÀNG BUỘC CỨNG SỐ 4
   ---------------------------------------------------------------
   "Một phòng, một tiết, một lớp — và phòng phải ở đúng điểm trường của lớp."
   Trước đây chỉ có cảnh báo R10: lưới vẫn xếp hai lớp cùng học Tin học một
   tiết trong cùng một phòng máy mà không báo gì.

   Chốt an toàn: trường CHƯA khai bảng phòng thì không siết. Nâng cấp phần
   mềm không được làm trường đang chạy tốt bỗng xếp hỏng.
   ================================================================ */
console.log('\n14. Phòng chức năng thành ràng buộc cứng');

/* Ứng dụng riêng để không làm bẩn trạng thái của các mục trước */
const uP = taoUngDung(documentGia);
const dtChinh = uP.S.diemTruong[0].id;
const soTietTin = uP.S.phanCong.filter(p => p.mon === 'Tin học').reduce((s, p) => s + p.soTiet, 0);

/* --- Chưa khai phòng: giữ nguyên hành vi cũ --- */
uP.S.phong = [];
kt('Chưa khai bảng phòng thì phòng không phải ràng buộc cứng',
   uP.coBangPhong() === false);
const truocKhai = uP.xepTuDong();
kt('Chưa khai phòng vẫn xếp trọn 710/710 như trước',
   truocKhai.daXep === 710, `${truocKhai.daXep}/${truocKhai.tongCan} tiết`);

/* --- Khai đúng một phòng Tin học: đây mới là phép thử thật --- */
uP.S.phong = [{ id: 'p1', ten: 'Phòng Tin học', dtId: dtChinh, mon: 'Tin học' }];
kt('Khai một phòng Tin học thì ràng buộc bật lên',
   uP.coBangPhong() && uP.soPhong(dtChinh, 'Tin học') === 1);

const coPhongKQ = uP.xepTuDong();
kt('Một phòng máy mà vẫn xếp trọn 710/710 tiết',
   coPhongKQ.daXep === 710,
   `${coPhongKQ.daXep}/${coPhongKQ.tongCan} tiết · ${coPhongKQ.giay} giây`);

/* Đếm thật trên lưới: không ô nào có hai lớp cùng dùng phòng máy */
const demPhong = (ung, loai, dt) => {
  const o = {};
  Object.entries(ung.S.tkb).forEach(([lp, luoi]) => {
    if (ung.S.lopDT[lp] !== dt) return;
    Object.entries(luoi).forEach(([k, t]) => {
      if (ung.monCanPhong(t.mon) === loai) o[k] = (o[k] || 0) + 1;
    });
  });
  return o;
};
const dungTin = demPhong(uP, 'Tin học', dtChinh);
const dungQua = Object.entries(dungTin).filter(([, n]) => n > 1);
kt('Không tiết nào có hai lớp cùng chiếm một phòng máy',
   dungQua.length === 0,
   dungQua.length ? dungQua.map(([k, n]) => `${k}: ${n} lớp`).join(' · ')
                  : `${soTietTin} tiết Tin học rải trên ${Object.keys(dungTin).length} ô giờ khác nhau`);
kt('Vẫn đủ số tiết Tin học theo phân công',
   Object.values(dungTin).reduce((s, n) => s + n, 0) === soTietTin,
   `${soTietTin} tiết`);

/* --- Bước hoán đổi cũng phải tôn trọng phòng --- */
kt('Hoán đổi cục bộ không đẩy hai tiết Tin vào cùng một ô', (() => {
  uP.toiUuHoanDoi(400);
  return Object.values(demPhong(uP, 'Tin học', dtChinh)).every(n => n <= 1);
})());

/* --- Hai phòng thì được phép hai lớp cùng tiết --- */
uP.S.phong.push({ id: 'p2', ten: 'Phòng Tin học 2', dtId: dtChinh, mon: 'Tin học' });
kt('Khai hai phòng thì sức chứa tăng gấp đôi',
   uP.soPhong(dtChinh, 'Tin học') === 2);
kt('Ô đang có một lớp dùng phòng vẫn nhận được lớp thứ hai', (() => {
  const oCoTin = Object.keys(demPhong(uP, 'Tin học', dtChinh))[0];
  if (!oCoTin) return false;
  /* Lớp nào chưa dùng ô đó, và ô đó phải nằm trong lưới của khối lớp ấy */
  const lopTrong = uP.S.lop.find(l =>
    uP.S.lopDT[l.id] === dtChinh && !uP.S.tkb[l.id][oCoTin] &&
    uP.oTuan(l.khoi).some(x => x.khoa === oCoTin));
  if (!lopTrong) return true;                    /* lưới kín, không thử được */
  const [thu, buoi, i] = oCoTin.split('-');
  const o = { khoa: oCoTin, kB: `${thu}-${buoi}`, thu: +thu, buoi, i: +i };
  const gvRanh = uP.S.giaoVien.find(g => !uP.chiSo().gvBan[g.id]?.[oCoTin]);
  return !gvRanh || uP.datDuoc(o, lopTrong.id, gvRanh.id, uP.chiSo(), 'Tin học') === null;
})());

/* --- Phòng ở điểm trường khác thì không tính --- */
kt('Phòng ở điểm trường khác không dùng được cho lớp bên này', (() => {
  /* Lưới trắng: nếu để lưới đã xếp thì datDuoc() dừng ngay ở "Lớp đã có tiết
     khác", không đi tới được phép kiểm phòng. */
  const u4 = taoUngDung(documentGia);
  const dt = u4.S.diemTruong[0].id;
  u4.S.phong = [{ id: 'p1', ten: 'Phòng Tin học', dtId: 'dt-noi-khac', mon: 'Tin học' }];
  const lop = u4.S.lop.find(l => u4.S.lopDT[l.id] === dt);
  const o = u4.oTuan(lop.khoi)[0];
  const loi = u4.datDuoc(o, lop.id, u4.S.giaoVien[0].id, u4.chiSo(), 'Tin học');
  /* Cùng ô đó, môn học tại lớp thì vẫn đặt được — chứng tỏ chặn đúng vì phòng */
  const okMonThuong = u4.datDuoc(o, lop.id, u4.S.giaoVien[0].id, u4.chiSo(), 'Toán');
  return typeof loi === 'string' && /không có phòng Tin học/.test(loi) && okMonThuong === null;
})(), 'ràng buộc "phòng phải cùng điểm trường với lớp"');

/* --- R12: có phòng nhưng không đủ chỗ, phải báo TRƯỚC khi xếp --- */
kt('Ba trường gộp lại mà vẫn một phòng máy thì R12 báo thiếu chỗ', (() => {
  const u2 = taoUngDung(documentGia);
  const dt = u2.S.diemTruong[0].id;
  u2.S.phong = [{ id: 'p1', ten: 'Phòng Tin học', dtId: dt, mon: 'Tin học' }];
  /* Nhân ba số tiết Tin học, như khi ba trường dồn về một điểm có phòng máy */
  u2.S.phanCong.filter(p => p.mon === 'Tin học').forEach(p => { p.soTiet = 3; });
  const v = u2.kiemTra().vm.find(x => x.ma === 'R12');
  return !!v && v.muc === 'do';
})(), 'nói trước tháng 8, lúc còn kịp xin thêm phòng');
kt('Đủ chỗ thì không báo R12 làm phiền', (() => {
  const u3 = taoUngDung(documentGia);
  u3.S.phong = [{ id: 'p1', ten: 'Phòng Tin học', dtId: u3.S.diemTruong[0].id, mon: 'Tin học' }];
  return !u3.kiemTra().vm.some(x => x.ma === 'R12');
})());

/* ================================================================
   15. SINH DỮ LIỆU THỬ VÀ QUY MÔ SAU SÁP NHẬP
   ---------------------------------------------------------------
   Danh sách cán bộ giáo viên của các trường sáp nhập chưa chốt, mà không có
   giáo viên thì không xếp thử được gì. `taoDuLieuThu()` dựng một điểm trường
   đủ chạy để kiểm chứng phần mềm ở đúng quy mô thật.
   ================================================================ */
console.log('\n15. Sinh dữ liệu thử và quy mô sau sáp nhập');

kt('Chia lớp cho năm khối, chênh nhau nhiều nhất một lớp', (() => {
  const a = chiaLopTheoKhoi(17), b = chiaLopTheoKhoi(18);
  const tong = o => [1, 2, 3, 4, 5].reduce((s, k) => s + o[k], 0);
  const deu = o => Math.max(...Object.values(o)) - Math.min(...Object.values(o)) <= 1;
  return tong(a) === 17 && tong(b) === 18 && deu(a) && deu(b);
})(), `17 lớp → ${[1, 2, 3, 4, 5].map(k => chiaLopTheoKhoi(17)[k]).join('·')} · ` +
      `18 lớp → ${[1, 2, 3, 4, 5].map(k => chiaLopTheoKhoi(18)[k]).join('·')}`);
kt('Số lớp bằng 0 hoặc âm không sinh ra khối nào',
   [1, 2, 3, 4, 5].every(k => chiaLopTheoKhoi(0)[k] === 0 && chiaLopTheoKhoi(-5)[k] === 0));
kt('Sinh họ tên theo chỉ số, chạy hai lần ra y hệt — không dùng Math.random',
   tenGVSinh(7) === tenGVSinh(7) && tenGVSinh(7) !== tenGVSinh(8), tenGVSinh(7));

/* --- Dựng đúng kịch bản anh Chung đề xuất: 25 + 17 + 18 = 60 lớp --- */
const uS = taoUngDung(documentGia);
uS.S.diemTruong[0].ten = 'Điểm trường Diễn Liên';
const dD = uS.taoDuLieuThu('Điểm trường Diễn Đồng', 'DD', 17, false);
const dT = uS.taoDuLieuThu('Điểm trường Diễn Thái', 'DT', 18, false);

kt('Tạo đủ số lớp đã khai cho từng điểm trường',
   dD.soLop === 17 && dT.soLop === 18, `${dD.soLop} + ${dT.soLop} lớp`);
kt('Ba điểm trường, 60 lớp — đúng quy mô sau sáp nhập',
   uS.S.diemTruong.length === 3 && uS.S.lop.length === 60,
   `${uS.S.lop.length} lớp · ${uS.S.giaoVien.length} giáo viên`);
kt('Mọi lớp mới đều có mã riêng, không lớp nào trùng mã',
   new Set(uS.S.lop.map(l => l.maLop || l.id)).size === 60);
kt('Lớp trùng tên giữa ba điểm trường vẫn phân biệt được bằng mã', (() => {
  const ten1A = uS.S.lop.filter(l => l.ten === '1A');
  return ten1A.length === 3 && new Set(ten1A.map(l => l.maLop || l.id)).size === 3;
})(), uS.S.lop.filter(l => l.ten === '1A').map(l => l.maLop || l.id).join(' · '));
kt('Mỗi lớp mới có đúng một giáo viên chủ nhiệm',
   [...uS.S.lop].every(l => !!uS.cnCuaLop?.(l.id) ||
     uS.S.giaoVien.filter(g => g.cn === l.id).length === 1));

/* Số tiết phải khớp CHUẨN CT GDPT 2018 cho từng lớp — sinh sai thì R04 kêu ngay */
const CHUAN_LOP_15 = { 1: 27, 2: 27, 3: 28, 4: 30, 5: 30 };
const lechChuan15 = uS.S.lop.filter(l => {
  const t = uS.S.phanCong.filter(p => p.lopId === l.id).reduce((s, p) => s + p.soTiet, 0);
  return t !== CHUAN_LOP_15[l.khoi];
});
kt('Mọi lớp sinh ra đều đúng số tiết chuẩn CT GDPT 2018',
   lechChuan15.length === 0,
   lechChuan15.length ? lechChuan15.slice(0, 3).map(l => l.ten).join(' · ')
                    : `tổng ${uS.S.phanCong.reduce((s, p) => s + p.soTiet, 0)} tiết/tuần`);
kt('Không giáo viên sinh ra nào vượt định mức 23 tiết', (() => {
  const tai = {};
  uS.S.phanCong.forEach(p => { tai[p.gvId] = (tai[p.gvId] || 0) + p.soTiet; });
  const vuot = Object.entries(tai).filter(([id, n]) => n > 23 && id.startsWith('gv_'));
  /* Bộ dữ liệu thật của Diễn Liên vốn đã có ba người vượt — chỉ xét người máy sinh */
  const vuotSinh = vuot.filter(([id]) => /_cn\d|_bm\d/.test(id));
  return vuotSinh.length === 0;
})());

const rS = uS.xepTuDong();
kt('Xếp trọn cả 60 lớp, không bỏ tiết nào',
   rS.daXep === rS.tongCan && rS.chuaXep.length === 0,
   `${rS.daXep}/${rS.tongCan} tiết · ${rS.giay} giây`);
kt('Không giáo viên nào trùng tiết ở quy mô 60 lớp', (() => {
  const ban = {}; let trung = 0;
  Object.entries(uS.S.tkb).forEach(([, o]) => Object.entries(o).forEach(([k, t]) => {
    const key = t.gvId + '@' + k;
    if (ban[key]) trung++; ban[key] = 1;
  }));
  return trung === 0;
})());
kt('Không giáo viên nào phải ở hai điểm trường trong cùng một buổi', (() => {
  const buoiDT = {}; let pham = 0;
  Object.entries(uS.S.tkb).forEach(([lp, o]) => Object.entries(o).forEach(([k, t]) => {
    const kB = t.gvId + '@' + k.split('-').slice(0, 2).join('-');
    const dt = uS.S.lopDT[lp];
    if (buoiDT[kB] && buoiDT[kB] !== dt) pham++;
    buoiDT[kB] = dt;
  }));
  return pham === 0;
})(), 'ràng buộc lõi của bài toán sau sáp nhập');

/* --- Điểm trường mới chưa có phòng máy thì R10 phải nói --- */
kt('Điểm trường mới chưa có phòng Tin học thì R10 báo đúng tên nơi đó', (() => {
  const v = uS.kiemTra().vm.filter(x => x.ma === 'R10');
  return v.length === 2 && v.some(x => /Diễn Đồng/.test(x.t)) && v.some(x => /Diễn Thái/.test(x.t));
})());
kt('Khai điểm trường CÓ phòng Tin học thì không báo R10', (() => {
  const u5 = taoUngDung(documentGia);
  u5.taoDuLieuThu('Điểm trường Thử', 'TH', 10, true);
  return !u5.kiemTra().vm.some(x => x.ma === 'R10' && /Điểm trường Thử/.test(x.t));
})());

/* ================================================================
   16. XẾP KỸ — TÁCH NHÓM ĐỘC LẬP, TÌM NHIỀU PHƯƠNG ÁN
   ---------------------------------------------------------------
   Học sinh chỉ học tại điểm trường của mình và giáo viên về cơ bản dạy một
   điểm trường, nên thời khóa biểu toàn trường gần như là mấy bài toán nhỏ
   rời nhau. Tách ra giải riêng thì chạy nhanh hơn và số phương án nhân lên.
   ================================================================ */
console.log('\n16. Xếp kỹ — tách nhóm độc lập, tìm nhiều phương án');

kt('Cùng hạt giống ra cùng dãy số — phương án dựng lại được y hệt', (() => {
  const a = taoNgauNhien(42), b = taoNgauNhien(42), c = taoNgauNhien(43);
  const da = [a(), a(), a()], db = [b(), b(), b()], dc = [c(), c(), c()];
  return da.join() === db.join() && da.join() !== dc.join() && da.every(x => x >= 0 && x < 1);
})());

const uK = taoUngDung(documentGia);
kt('Một điểm trường thì cả trường là một nhóm',
   uK.nhomDocLap().length === 1 && uK.nhomDocLap()[0].length === 25);

uK.S.diemTruong[0].ten = 'Điểm trường Diễn Liên';
uK.taoDuLieuThu('Điểm trường Diễn Đồng', 'DD', 17, true);
uK.taoDuLieuThu('Điểm trường Diễn Thái', 'DT', 18, true);
const nhomK = uK.nhomDocLap();
kt('Ba điểm trường tách đúng thành ba nhóm rời nhau',
   nhomK.length === 3 && nhomK.map(n => n.length).sort((a, b) => b - a).join() === '25,18,17',
   nhomK.map(n => n.length).join(' · ') + ' lớp');
kt('Không lớp nào lọt hai nhóm, không lớp nào bị bỏ sót',
   new Set(nhomK.flat()).size === uK.S.lop.length);

/* Xếp riêng một nhóm KHÔNG được đụng tới lưới của nhóm khác */
uK.xepTuDong();
const nhomA = nhomK[0], nhomB = nhomK[1];
const truocB = JSON.stringify(nhomB.map(id => uK.S.tkb[id]));
uK.xepTuDong(300, { lop: new Set(nhomA), hat: 7 });
kt('Xếp lại một nhóm thì nhóm khác đứng yên nguyên vẹn',
   JSON.stringify(nhomB.map(id => uK.S.tkb[id])) === truocB);

/* Bộ tìm phương án: phải đủ tiết và không tệ hơn bản xếp nhanh */
const uL = taoUngDung(documentGia);
const nhanh = uL.xepTuDong();
const diemNhanh = uL.diemToanCuc();
const dai = uL.xepDai({ giay: 12, soPhuongAn: 3 });
kt('Xếp kỹ trả về nhiều phương án khác nhau',
   dai.phuongAn.length >= 2 && new Set(dai.phuongAn.map(p => p.diem)).size === dai.phuongAn.length,
   `${dai.lanThu} lần thử · điểm ${dai.phuongAn.map(p => p.diem).join(' / ')}`);
kt('Phương án xếp theo thứ tự tốt dần — bản đầu là bản tốt nhất',
   dai.phuongAn.every((p, i) => i === 0 ||
     p.thieu > dai.phuongAn[i - 1].thieu ||
     (p.thieu === dai.phuongAn[i - 1].thieu && p.diem >= dai.phuongAn[i - 1].diem)));
kt('Xếp kỹ không bao giờ tệ hơn xếp nhanh',
   dai.phuongAn[0].diem <= diemNhanh,
   `nhanh ${diemNhanh} → kỹ ${dai.phuongAn[0].diem} (giảm ${Math.round((diemNhanh - dai.phuongAn[0].diem) / diemNhanh * 100)}%)`);
kt('Xếp kỹ vẫn xếp trọn 710/710 tiết',
   uL.S.lop.reduce((s, l) => s + Object.keys(uL.S.tkb[l.id] || {}).length, 0) === 710 &&
   dai.phuongAn[0].thieu === 0);
kt('Lưới sau khi chạy chính là phương án tốt nhất',
   uL.diemToanCuc() === dai.phuongAn[0].diem);

kt('Bấm dừng giữa chừng vẫn trả về phương án đã tìm được', (() => {
  const u = taoUngDung(documentGia);
  const g = u.xepDaiTung({ giay: 60, soPhuongAn: 3 });
  let b = g.next(), n = 0;
  while (!b.done && n < 3) { b = g.next(); n++; }
  b = g.next(false);                       /* người dùng bấm Dừng lại */
  while (!b.done) b = g.next(false);
  return b.value.phuongAn.length >= 1 && b.value.phuongAn[0].thieu === 0;
})(), 'không mất gì cả');

kt('Tiết đã ghim tay vẫn đứng yên qua lần xếp kỹ', (() => {
  const u = taoUngDung(documentGia);
  u.xepTuDong();
  const lp = u.S.lop[0].id, k = Object.keys(u.S.tkb[lp])[2];
  u.S.tkb[lp][k].ghim = true;
  const mon = u.S.tkb[lp][k].mon, gv = u.S.tkb[lp][k].gvId;
  u.xepDai({ giay: 6, soPhuongAn: 2 });
  return u.S.tkb[lp][k]?.mon === mon && u.S.tkb[lp][k]?.gvId === gv;
})());

console.log('\n17. Mẫu Excel tải về và mẫu bản in');

const mau = bangMauNhap();
kt('Mẫu có đủ ba trang tính bắt buộc, tên cột viết đúng',
   mau.gv[0].join() === 'Ma_GV,Ho_ten,Chu_nhiem,Dinh_muc' &&
   mau.lop[0].join() === 'Ma_lop,Ten_lop,Khoi,Diem_truong' &&
   mau.pc[0].join() === 'Ma_GV,Ma_lop,Mon,So_tiet');
kt('Trường đã có dữ liệu thì mẫu điền sẵn, không bắt gõ lại từ đầu',
   mau.coThat && mau.lop.length - 1 === S.lop.length && mau.pc.length - 1 === S.phanCong.length,
   `${mau.lop.length - 1} lớp · ${mau.pc.length - 1} dòng phân công`);
kt('Chu_nhiem trong mẫu ghi MÃ LỚP, không phải tên lớp', (() => {
  const maLop = new Set(S.lop.map(l => l.maLop || l.id));
  return mau.gv.slice(1).filter(h => h[2]).every(h => maLop.has(h[2]));
})());
kt('Trang HUONG_DAN có bảng số tiết chuẩn cộng đúng từng khối', (() => {
  const d = mau.huong.find(h => h[0] === 'Tổng');
  return d && d.slice(1).join() === '27,27,28,30,30';
})());
kt('Trường trắng thì mẫu vẫn có dòng ví dụ để hiểu cách ghi', (() => {
  const u = taoUngDung(documentGia);
  u.S.lop = []; u.S.giaoVien = []; u.S.phanCong = [];
  const m = u.bangMauNhap();
  return !m.coThat && m.gv.length > 1 && m.lop.length > 1 && m.pc.length > 1;
})());

/* ---------- Tổng kết ---------- */
console.log(`\n\x1b[1mKết quả: ${dat} đạt, ${hong} hỏng\x1b[0m\n`);
process.exit(hong ? 1 : 0);
