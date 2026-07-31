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
  taiDuLieu, luuTKB, lichSuPhienBan, dangNhap, taiPhienBan, dangXuat,
  tuMayChu, napVaoS, dongGoiTKB, docTKB,
  quyen, phamViKhoa, duocXep, duocSuaNguon, duocSuaLop, duocLuu,
  apDungQuyen, dtTrongPV, gvTrongPV, canDangNhap, thayDuocMuc,
  dongGio, lichGV, luoiTheoLop, luoiTheoGV, bangXuatPC, bangXuatDT,
  khongDau, tenTepXuat, tenDangNhapGV, matKhauNgauNhien,
  oTuan, soTietBuoi, sucChuaKhoi, chuanKhungGio,
  diemToanCuc, toiUuHoanDoi, laGhim, lichTraGV,
  duLieuTuBang, ghiDuLieuNguon, congBoTKB };`;

/* Mỗi lần gọi là một bản ứng dụng độc lập — dựng được cả bản chạy ngoại tuyến
   lẫn bản nối vào máy chủ giả mà hai bên không đụng trạng thái của nhau. */
const taoUngDung = (doc, win, layMang) =>
  new Function('document', 'window', 'fetch', NGUON_MA)(doc, win, layMang);

const { S, xepTuDong, kiemTra, KHO, NGUON, buoiBat,
        taiDuLieu, luuTKB, lichSuPhienBan, dangNhap,
        tuMayChu, napVaoS, dongGoiTKB, docTKB,
        quyen, phamViKhoa, duocXep, duocSuaNguon, duocSuaLop, duocLuu,
        apDungQuyen, dtTrongPV, gvTrongPV, canDangNhap, thayDuocMuc,
        dongGio, luoiTheoLop, luoiTheoGV, bangXuatPC, bangXuatDT,
        khongDau, tenTepXuat, tenDangNhapGV, matKhauNgauNhien,
        oTuan, soTietBuoi, sucChuaKhoi, chuanKhungGio,
        diemToanCuc, toiUuHoanDoi, laGhim,
        duLieuTuBang, ghiDuLieuNguon } = taoUngDung(documentGia);

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
   DL.giaoVien.find(g => g.id === 'g1').cn === '1A' &&
   DL.giaoVien.find(g => g.id === 'g2').cn === '2B',
   'hai cô cùng tên "Dung" vẫn ra đúng lớp');
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
              xoaPhanCong: 0, congBo: [] };
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
  if (co('/lop?') && co('select=id,ten'))
    return dap((GHI.lop || []).map((l, i) => ({ id: 'lop-uuid-' + i, ten: l.ten })));

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
  if (co('/nhat_ky')) return dap(null, 201);

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
kt('Bắt được tên lớp lặp', co('Ten_lop "1A"'));
kt('Bắt được khối ngoài 1–5, thiếu mã, thiếu môn, số tiết bằng 0',
   co('Khoi phải từ 1 đến 5') && co('thiếu Ma_GV') && co('thiếu tên môn') && co('So_tiet'));
kt('Bắt được chủ nhiệm trỏ tới lớp không có thật', co('chủ nhiệm lớp "9Z"'));
kt('Bắt được phân công trỏ tới giáo viên và lớp không có thật',
   co('giáo viên mã "GVXX"') && co('lớp mã "L9"'));
kt('Mọi lỗi đều chỉ rõ số dòng trong Excel',
   xau.loi.filter(x => /dòng \d+/.test(x)).length >= 4,
   xau.loi.find(x => /dòng \d+/.test(x)));

/* Ghi lên máy chủ: chưa đăng nhập thì phải từ chối tử tế */
const ghiKhi = await ghiDuLieuNguon(tep);
kt('Chưa nối máy chủ thì không ghi được, báo rõ',
   ghiKhi.ok === false && ghiKhi.thongBao.length > 20, ghiKhi.thongBao);

/* Ghi thật lên máy chủ giả — đây mới là đường mở cho trường thứ hai */
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

/* ---------- Tổng kết ---------- */
console.log(`\n\x1b[1mKết quả: ${dat} đạt, ${hong} hỏng\x1b[0m\n`);
process.exit(hong ? 1 : 0);
