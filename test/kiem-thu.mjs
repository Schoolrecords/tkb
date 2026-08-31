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
  taiChoGiaoVien, taiChoQuanLy, taiLuoiDayDu, taiThemNgayNghi, coThayDoiChuaLuu, vanTayNguon,
  tuMayChu, napVaoS, dongGoiTKB, docTKB, taiCauHinh,
  diaChiDangNhapGoogle, donVeOAuth, dungMaMoi, sinhMaMoi, taoMaMoi, dsMaMoi,
  tietVangCua, luuDayThay, xoaDayThay,
  tietCanThay, ungVienThay, phuongAnThay, xungDotDayThay, vieccanXuLy,
  thongBaoCuaGV, buoiCuaNghi, ngayISO, ngayCong, ngayDayDu, thuTuISO,
  LY_DO_NGHI, TEN_BUOI_NGHI, chiSoPhuongAn, guiBaoNghi, huyBaoNghi, danhDauXuLy,
  tongHopNgayCong, soCong, thieuMonLop, chuThieuMon,
  quyen, phamViKhoa, duocXep, duocSuaNguon, duocSuaLop, duocLuu,
  apDungQuyen, dtTrongPV, gvTrongPV, canDangNhap, thayDuocMuc, thieuHoSoGV, phamViLuu,
  dongGio, lichGV, luoiTheoLop, luoiTheoGV, bangXuatPC, bangXuatDT,
  khongDau, tenTepXuat,
  oTuan, soTietBuoi, sucChuaKhoi, chuanKhungGio, tenLopDay, cnCuaLop, tenCN, tenDiemNgan,
  diemToanCuc, toiUuHoanDoi, laGhim, lichTraGV,
  duLieuTuBang, ghiDuLieuNguon, congBoTKB, luuBuoiBan, datTaiKhoanGV,
  tienDo, sinhLop, coPhong, dongBoPhongTin, dsMonMacDinh, dsMonDung, tietCanTu, tietCanKhoi,
  chuanMon, laMonNang, laMonNhe, monCanPhong,
  coBangPhong, soPhong, dangChiemPhong, chiSo, themChiSo, datDuoc, doiChoDuoc,
  taoDuLieuThu, chiaLopTheoKhoi, tenGVSinh, maXauXi, tienToDT, datLaiMaLop,
  maGVTu, maGVXau, datLaiMaGV, chuanMaGV, maXauChuoi,
  xepDai, xepDaiTung, nhomDocLap, diemNhom, taoNgauNhien,
  duLieuTuMaTran, bangMauMaTran,
  bangMauTronGoi, duLieuTuTronGoi, docTrang, CHUAN_KHOI,
  MUC_NHAP, duLieuTuMuc, napMucVaoS, chepKhoNguon, thieuMucTruoc,
  locDongDaDien, dienGiaiLoiNhap, canhDongBo, truongTrang, tomTatMau,
  luoiToanTruong, luoiTheoKhoiHoc, lopTheoKhoi, khoiDangCo, xepTheoKhoi,
  viSaoChuaXep, viecGoBiXep, NHOM_CHAN, oTuanLop, tinhTrangGV, aiRanh, nhomCungRanh,
  laGVLienLop, chamGVKhac, datCoDinh, gomLyDoCoDinh, timLopNhap, dienGiaiLoi,
  choLienTiet, goiYLienTiet, MON_LIEN_TIET, chonBuoiNghi, khoaB, khoiDangCo,
  thuTuHangGV, lopCN, bangMauMaTran, gvId, lopId,
  soTietLop, sucChuaLop, coGioRieng, nhomGioRieng, datGioLop, tietRaNgoai };`;

/* Mỗi lần gọi là một bản ứng dụng độc lập — dựng được cả bản chạy ngoại tuyến
   lẫn bản nối vào máy chủ giả mà hai bên không đụng trạng thái của nhau. */
const taoUngDung = (doc, win, layMang) =>
  new Function('document', 'window', 'fetch', NGUON_MA)(doc, win, layMang);

const { S, xepTuDong, kiemTra, KHO, NGUON, buoiBat,
        taiDuLieu, luuTKB, lichSuPhienBan, dangNhap, taiNhatKy, sinhMaMoi,
        tietVangCua, luuDayThay,
        tietCanThay, ungVienThay, phuongAnThay, xungDotDayThay, vieccanXuLy,
        thongBaoCuaGV, buoiCuaNghi, ngayISO, ngayCong, ngayDayDu,
        chiSoPhuongAn, guiBaoNghi,
        tuMayChu, napVaoS, dongGoiTKB, docTKB,
        quyen, phamViKhoa, duocXep, duocSuaNguon, duocSuaLop, duocLuu,
        apDungQuyen, dtTrongPV, gvTrongPV, canDangNhap, thayDuocMuc, thieuHoSoGV,
        dongGio, luoiTheoLop, luoiTheoGV, bangXuatPC, bangXuatDT,
        khongDau, tenTepXuat,
        oTuan, soTietBuoi, sucChuaKhoi, chuanKhungGio, tenLopDay, tenDiemNgan,
        diemToanCuc, toiUuHoanDoi, laGhim, lichTraGV,
        duLieuTuBang, ghiDuLieuNguon, luuBuoiBan,
        tienDo, sinhLop, coPhong, dongBoPhongTin, dsMonMacDinh, dsMonDung, tietCanTu, tietCanKhoi,
        chuanMon, laMonNang, laMonNhe, monCanPhong,
        coBangPhong, soPhong, dangChiemPhong, chiSo, themChiSo, datDuoc, doiChoDuoc,
        taoDuLieuThu, chiaLopTheoKhoi, tenGVSinh, maXauXi, tienToDT, datLaiMaLop,
        maGVTu, maGVXau, datLaiMaGV, maXauChuoi,
        xepDai, xepDaiTung, nhomDocLap, diemNhom, taoNgauNhien,
  duLieuTuMaTran, bangMauMaTran,
  bangMauTronGoi, duLieuTuTronGoi, docTrang, CHUAN_KHOI,
        MUC_NHAP, duLieuTuMuc, napMucVaoS, chepKhoNguon, thieuMucTruoc,
        locDongDaDien, dienGiaiLoiNhap, truongTrang,
        luoiToanTruong, luoiTheoKhoiHoc, lopTheoKhoi, khoiDangCo, xepTheoKhoi,
        datCoDinh, gomLyDoCoDinh, oTuanLop, timLopNhap, dienGiaiLoi,
        thuTuHangGV, lopCN,
        soTietLop, sucChuaLop, coGioRieng, nhomGioRieng, datGioLop, tietRaNgoai
        } = taoUngDung(documentGia);

/* ---------- khung kiểm thử tối giản ---------- */
let dat = 0, hong = 0;
  /* ⚠️ CHỐT CHẶN CỦA CHÍNH BỘ SOI (29/8/2026). Nhiều phép thử trả về
     `[đúng/sai, ghi chú]`, và quy ước cũ là nơi gọi phải thêm toán tử `...`
     để rải thành hai đối số. Quên dấu ấy thì đối số thứ hai là một MẢNG — mảng
     nào cũng truthy, nên phép thử XANH VĨNH VIỄN dù sản phẩm hỏng. Đã dính
     thật và dính 17 lần trong cùng một ngày: phép thử thứ tự hàng bảng ma trận
     vẫn xanh cả khi đã gỡ bỏ đoạn mã nó canh.

     Cách chữa gốc là để CHÍNH HÀM NÀY tự rải, thay vì bắt mỗi nơi gọi nhớ ba
     dấu chấm. Một quy ước mà người viết phải nhớ thì sớm muộn có người quên —
     mà quên ở đây thì không ai thấy, vì hậu quả là màu xanh. */
const kt = (ten, dieuKien, ghiChu = '') => {
  if (Array.isArray(dieuKien)) [dieuKien, ghiChu] = [dieuKien[0], dieuKien[1] ?? ghiChu];
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

/* ---------- 2. Một phân hiệu ---------- */
console.log('\n2. Một phân hiệu — phải xếp trọn vẹn');
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

/* ---------- 3. Ba phân hiệu ---------- */
console.log('\n3. Ba phân hiệu — ràng buộc một buổi một phân hiệu');
S.diemTruong = [
  { id: 'dt1', ten: 'Phân hiệu Diễn Liên', phongTin: true },
  { id: 'dt2', ten: 'Phân hiệu Diễn Thái', phongTin: true },
  { id: 'dt3', ten: 'Phân hiệu Diễn Đoài', phongTin: false }
];
S.lop.forEach(l => S.lopDT[l.id] =
  l.khoi >= 4 ? 'dt1' : (l.khoi === 3 || ['2A', '2B', '2C'].includes(l.ten)) ? 'dt2' : 'dt3');

r = xepTuDong();
s = soatLuoi();
kt('Không giáo viên nào trùng tiết', s.trungTiet === 0, `${s.trungTiet} xung đột`);
kt('Không ai ở hai phân hiệu trong một buổi', s.saiDiemTruong === 0,
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

/* --- R13: trần cấu trúc của vùng vàng — bài toán nhân sự, báo trước ---
   Dùng bản ứng dụng RIÊNG: trạng thái chung ở đây đã bị mục 3 đổi thành
   ba phân hiệu, đo trên đó là đo nhầm kịch bản. */
{
  const uR = taoUngDung(documentGia);
  const vR = uR.kiemTra().vm.find(x => x.ma === 'R13');
  kt('R13 báo trước phần Toán/TV phải học ngoài tiết 1–3 sáng, kèm tên người kín lịch',
     !!vR && vR.muc === 'goi' && /kín lịch/.test(vR.m) && /thêm người dạy/.test(vR.g),
     (vR?.t || '').slice(0, 64));
  kt('Ước lượng của R13 là CẬN DƯỚI trung thực của thực đo sau khi xếp', (() => {
    const thieu = +((vR?.t || '').match(/\d+/) || [0])[0];
    uR.xepTuDong();
    let ngoai = 0;
    Object.values(uR.S.tkb).forEach(o => Object.entries(o).forEach(([kh, t]) => {
      const p = kh.split('-');
      if (['Toán', 'Tiếng Việt'].includes(t.mon) && (p[1] === 'C' || +p[2] >= 3)) ngoai++;
    }));
    /* Báo trước không được PHÓNG ĐẠI (thiếu ≤ thực đo) nhưng cũng phải sát
       (ít nhất một nửa) — báo 5 mà thực tế 40 thì lời cảnh báo vô dụng. */
    return thieu > 0 && thieu <= ngoai && thieu >= ngoai / 2;
  })());
  kt('Giáo viên bộ môn hết kín lịch thì R13 im lặng, không báo oan', (() => {
    const u13 = taoUngDung(documentGia);
    /* Chỉ giữ phân công của môn nặng và của chủ nhiệm — không còn ai kín */
    u13.S.phanCong = u13.S.phanCong.filter(p => {
      const g = u13.S.giaoVien.find(x => x.id === p.gvId);
      return ['Toán', 'Tiếng Việt'].includes(p.mon) || (g && g.cn);
    });
    return !u13.kiemTra().vm.some(x => x.ma === 'R13');
  })());
}

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
kt('Đọc đúng phân hiệu, khung giờ, buổi nghỉ',
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
/* ⚠️ Id máy chủ giả phải ĐÚNG DẠNG UUID. Bản đầu đặt 'gv-uuid-0' cho gọn
   mắt, nhưng ứng dụng phân nhánh bằng `laUUID()` — "đã có trên máy chủ" hay
   "mới khai trong app" — nên với id sai dạng thì mọi nhánh ấy đi nhầm đường
   và phép thử không kiểm được gì. Lộ ra ngày 30/8/2026 khi viết phép thử
   xoá giáo viên: hàm bỏ qua đúng cái hồ sơ đáng lẽ phải xoá. */
const UUID_GV  = i => 'a1a1a1a1-0000-4000-8000-' + String(i).padStart(12, '0');
const UUID_LOP = i => 'b2b2b2b2-0000-4000-8000-' + String(i).padStart(12, '0');

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
  if (opt.method === 'POST' && co('/giao_vien')) {
    GHI.giaoVien = than;
    /* Nhớ cả KHOÁ upsert: ghi theo `id` hay theo `truong_id,ma_gv` là hai
       chuyện khác hẳn nhau — ghi nhầm khoá thì máy chủ THÊM lứa giáo viên
       mới thay vì sửa lứa cũ. Đúng lỗi đã nhân 35 hồ sơ thành 105. */
    GHI.gvTheoKhoa = (GHI.gvTheoKhoa || []).concat(
      than.map(h => ({ khoa: (url.match(/on_conflict=([^&]*)/) || [])[1] || '', hang: h })));
    return dap(null, 201);
  }
  if (opt.method === 'POST' && co('/lop?')) {
    GHI.lop = (GHI.lop || []).concat(than);
    GHI.lopTheoKhoa = (GHI.lopTheoKhoa || []).concat(
      than.map(h => ({ khoa: (url.match(/on_conflict=([^&]*)/) || [])[1] || '', hang: h })));
    return dap(null, 201);
  }
  if (opt.method === 'DELETE' && co('/giao_vien')) {
    const id = (url.match(/id=eq\.([^&]*)/) || [])[1] || '';
    GHI.xoaGV = (GHI.xoaGV || []).concat(id);
    return dap(null, 204);
  }
  if (opt.method === 'DELETE' && co('/diem_truong')) {
    const id = (url.match(/id=eq\.([^&]*)/) || [])[1] || '';
    GHI.xoaDT = (GHI.xoaDT || []).concat(id);
    GHI.diemTruong = GHI.diemTruong.filter(d => d.id !== id);
    return dap(null, 204);
  }
  if (opt.method === 'DELETE' && co('/phan_cong')) { GHI.xoaPhanCong++; return dap(null, 204); }
  if (opt.method === 'POST' && co('/phan_cong')) { GHI.phanCong = than; return dap(null, 201); }
  /* Đọc lại sau khi ghi, để tầng dữ liệu lấy mã UUID mà nối phân công */
  if (co('/diem_truong?') && co('select=id,ten')) return dap(GHI.diemTruong);
  if (co('/giao_vien?') && co('select=id,ma_gv'))
    return dap((GHI.giaoVien || []).map((g, i) => ({ id: UUID_GV(i), ma_gv: g.ma_gv,
      /* Ai đang có tài khoản đăng nhập — hồ sơ ấy không được xoá */
      nguoi_dung_id: (GHI.gvCoTaiKhoan || []).includes(UUID_GV(i)) ? 'u-' + i : null })));
  if (co('/lop?') && co('select=id,ma_lop'))
    return dap((GHI.lop || []).map((l, i) => ({ id: UUID_LOP(i), ma_lop: l.ma_lop, ten: l.ten })));

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
  /* Nối / gỡ tài khoản khỏi hồ sơ giáo viên. Trả về đúng những dòng đã đổi,
     y như PostgREST kèm Prefer: return=representation. */
  if (co('/giao_vien?') && opt.method === 'PATCH') {
    GHI.noiHoSo = (GHI.noiHoSo || []).concat({ url, than });
    /* Bước gỡ (lọc theo nguoi_dung_id) không khớp dòng nào là chuyện thường */
    return dap(co('nguoi_dung_id=eq.') ? [] : [{ id: 'gv-vua-doi', ...than }]);
  }
  if (co('/giao_vien?nguoi_dung_id=')) return dap([{ id: 'g2', ho_ten: 'Đặng Thị Dung' }]);
  if (co('/truong?id=')) {
    /* Sửa thông tin trường. Bảng `truong` từng KHÔNG có quy tắc UPDATE nào,
       nên lệnh sửa đổi 0 dòng mà vẫn báo thành công — tên trường mới không
       bao giờ lưu được. GHI.chanSuaTruong dựng lại đúng tình huống ấy. */
    if (opt.method === 'PATCH') {
      GHI.suaTruong = than;
      if (GHI.chanSuaTruong) return dap([]);
      Object.assign(HANG.truong, than);
      return dap([HANG.truong]);
    }
    return dap([HANG.truong]);
  }
  /* GHI.truongTrong mô phỏng trường VỪA ĐƯỢC DUYỆT: có thông tin trường,
     phân hiệu và khung giờ mặc định, nhưng chưa có lớp · giáo viên ·
     phân công nào — đúng trạng thái Tiểu học Châu Đình 25/8/2026. */
  if (GHI.truongTrong && (!opt.method || opt.method === 'GET')
      && (co('/lop?') || co('/giao_vien?') || co('/phan_cong?') || co('/gv_nghi?')))
    return dap([]);
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
      /* PostgREST kèm `Prefer: return=representation` trả về CHÍNH những dòng
         vừa đổi. Đổi 0 dòng — vì quy tắc RLS không cho ghi — cũng là 200 với
         mảng rỗng, KHÔNG phải lỗi. Máy giả phải giống hệt chỗ này, vì đó là
         cách duy nhất phần mềm nhận ra lệnh ghi bị chặn. */
      let doi = [];
      if (co('cong_bo=eq.true')) {
        doi = Object.values(BAN_LUU).filter(v => v.cong_bo);
        doi.forEach(v => v.cong_bo = false);
      } else {
        const v = (url.match(/version=eq\.(\d+)/) || [])[1];
        /* GHI.chanCongBo mô phỏng cơ sở dữ liệu THIẾU quy tắc p_tkb_sua */
        if (v && BAN_LUU[v] && !GHI.chanCongBo) {
          BAN_LUU[v].cong_bo = !!than.cong_bo; doi = [BAN_LUU[v]];
        }
      }
      GHI.congBo = Object.values(BAN_LUU).filter(v => v.cong_bo).map(v => v.version);
      return dap(doi);
    }
    if (co('cong_bo=eq.true')) return dap(Object.values(BAN_LUU).filter(v => v.cong_bo));
    if (co('version=eq.2')) return dap([BAN_LUU[2]]);
    if (co('limit=1')) return dap([BAN_LUU[3]]);
    return dap([BAN_LUU[3], BAN_LUU[2]]);
  }
  return dap({ message: 'Đường dẫn lạ: ' + url }, 404);
}

/* Kho nhớ đăng nhập giả. Mã ứng dụng gọi thẳng `localStorage` (biến toàn cục
   của trình duyệt) và bọc trong try/catch, nên chạy trong Node thì mọi lời gọi
   rơi vào im lặng — vé đăng nhập không được ghi mà cũng chẳng ai hay.
   Dựng bản giả để kiểm được đúng phần đó. */
const KHO_MAY = new Map();
globalThis.localStorage = {
  getItem: k => (KHO_MAY.has(k) ? KHO_MAY.get(k) : null),
  setItem: (k, v) => KHO_MAY.set(k, String(v)),
  removeItem: k => KHO_MAY.delete(k)
};
const vePhienNho = () => { try { return JSON.parse(KHO_MAY.get('tkb_phien') || 'null'); }
                           catch (e) { return null; } };

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

kt('Trường MỚI trống trơn: tải máy chủ vẫn OK, KHÔNG rơi về dữ liệu mẫu', await (async () => {
  /* Lỗi thật 25/8/2026: Tiểu học Châu Đình vừa được duyệt, 0 lớp — nhánh
     tải coi trường trống là LỖI và ném ra, taiDuLieu() bắt được rồi rơi về
     bộ mẫu: trường mới mở app thấy nguyên thời khóa biểu 25 lớp của trường
     lạ, tưởng bị đưa nhầm dữ liệu. Quyển vở mới phải là vở trắng — trống
     không phải lỗi. */
  GHI.truongTrong = true;
  const kq = await MC.taiDuLieu();
  const dat = kq.ok === true && kq.nguon === 'may-chu' && MC.KHO.nguon === 'may-chu' &&
    MC.S.lop.length === 0 && MC.S.giaoVien.length === 0 &&
    MC.S.tenTruong === HANG.truong.ten;
  GHI.truongTrong = false;
  await MC.taiDuLieu();          /* trả lại dữ liệu đầy đủ cho các phép thử sau */
  return dat;
})());

kt('Chọn ghi nhớ thì vé làm mới nằm lại trên máy, kèm email để điền sẵn',
   vePhienNho()?.lamMoi === 'RF1' && vePhienNho()?.email === 'c@t.vn',
   JSON.stringify(vePhienNho()));

const luuMC = await MC.luuTKB(MC.dongGoiTKB(), MC.KHO.version, 'kiểm thử');
kt('Vé hết hạn giữa chừng thì tự xin vé mới rồi lưu tiếp',
   daLamMoiVe === true && luuMC.ok === true && luuMC.version === 4 && MC.KHO.version === 4,
   luuMC.thongBao);

/* Supabase XOAY VÒNG vé làm mới: xin vé mới xong là vé cũ hỏng. Bản trước chỉ
   đổi vé trong bộ nhớ, để nguyên vé đã tiêu dưới máy — nên hôm sau thầy cô mở
   app lên là bị hỏi mật khẩu, đúng thứ mà cả cơ chế ghi nhớ sinh ra để tránh. */
kt('Xin vé mới giữa chừng thì vé DƯỚI MÁY cũng phải đổi theo',
   vePhienNho()?.lamMoi === 'RF2',
   'vé đang nhớ: ' + (vePhienNho()?.lamMoi || '(không có)'));
kt('Không chọn ghi nhớ thì đừng tự nhớ hộ — kể cả sau khi xoay vé',
   await (async () => {
     KHO_MAY.clear();
     await MC.dangNhap('c@t.vn', 'dung', false);
     const truoc = KHO_MAY.size;
     soLanRPC = 0;                       /* buộc lần gọi sau lại hết hạn vé */
     await MC.luuTKB(MC.dongGoiTKB(), MC.KHO.version, 'không nhớ');
     return truoc === 0 && KHO_MAY.size === 0;
   })());
await MC.dangNhap('c@t.vn', 'dung');    /* trả lại trạng thái có ghi nhớ */

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

/* ⚠️ LỚP LỖI NGUY HIỂM NHẤT của cả tầng dữ liệu: PostgREST trả 204 "thành
   công" cho lệnh PATCH sửa được 0 dòng. Quy tắc RLS chặn ghi trông y hệt ghi
   trót lọt, nên phần mềm khoe "Đã công bố" trong khi máy chủ không đổi gì —
   và cả trường ngồi chờ một thời khóa biểu không bao giờ tới tay ai.
   Đã cắn hai lần (bảng tkb_phien_ban, rồi bảng truong). Phép thử này canh. */
GHI.chanCongBo = true;
const cbChan = await MC.congBoTKB(3, true);
GHI.chanCongBo = false;
kt('Máy chủ chặn ghi thì KHÔNG được báo đã công bố',
   cbChan.ok === false && /cai-dat\.sql/.test(cbChan.thongBao), cbChan.thongBao);
kt('Chặn ghi thì cũng không tự nhận là đang có bản công bố',
   MC.KHO.banCongBo === 0 && GHI.congBo.length === 0);

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
const UUID_DT2 = '2f1c8a44-9b3e-4d17-8c05-6a7b0e5d1234';
kt('Mã mời quản lý mang được phân hiệu — PHT phụ trách điểm nhận đúng phạm vi khi vào', await (async () => {
  /* dung_ma_moi phía máy chủ chép diem_truong_id của mã vào nguoi_dung,
     nên gán sai ở đây là PHT một điểm vào app với quyền toàn trường. */
  const t = await G.taoMaMoi({ vaiTro: 'pho_hieu_truong', diemTruongId: UUID_DT2 });
  const dong = GHI.maMoi[GHI.maMoi.length - 1];
  return t.ok === true && dong.vai_tro === 'pho_hieu_truong' &&
    dong.diem_truong_id === UUID_DT2 && !dong.giao_vien_id;
})());
kt('Phân hiệu chưa lưu lên máy chủ thì mã mời BỊ CHẶN, không lặng lẽ thành mã toàn trường',
   await (async () => {
  /* id trong app (`dt1787992176500`) không phải uuid — bỏ trống cột ấy cho
     qua nghĩa là phát ra một mã PHT TOÀN TRƯỜNG. */
  const truoc = GHI.maMoi.length;
  const t = await G.taoMaMoi({ vaiTro: 'pho_hieu_truong', diemTruongId: 'dt1787992176500' });
  return t.ok === false && /chưa lưu/.test(t.loi) && GHI.maMoi.length === truoc;
})());
GHI.oauthUser = 'u1';

/* ---------- 7. Phân quyền theo phân hiệu ---------- */
console.log('\n7. Phân quyền theo phân hiệu');

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
kt('PHT chuyên môn (bỏ trống phân hiệu): vẫn thấy toàn trường',
   quyen().toanTruong && quyen().boHep === false && duocXep() && S.phamVi === '');

/* Phó hiệu trưởng phụ trách điểm B */
vao('pht', 'd2');
kt('PHT phụ trách phân hiệu: phạm vi bị khoá đúng điểm của mình',
   quyen().boHep === true && phamViKhoa() === 'd2' && S.phamVi === 'd2');
kt('PHT phụ trách phân hiệu: không xếp tự động, không sửa dữ liệu nguồn',
   duocXep() === false && duocSuaNguon() === false);
kt('PHT phụ trách phân hiệu: chỉnh được lớp mình, không chạm lớp nơi khác',
   duocSuaLop('l2') === true && duocSuaLop('l1') === false && duocLuu() === true);
kt('PHT phụ trách phân hiệu: danh sách lọc đúng theo phân hiệu',
   dtTrongPV().length === 1 && dtTrongPV()[0].id === 'd2' &&
   gvTrongPV().length === 1 && gvTrongPV()[0].id === 'g2');

/* Tự đổi phạm vi sang phân hiệu khác cũng bị ép về chỗ của mình */
S.phamVi = 'd1'; apDungQuyen();
kt('PHT phụ trách phân hiệu: đổi phạm vi tay cũng bị ép về chỗ của mình',
   S.phamVi === 'd2');

/* Phân hiệu bị xoá thì không được khoá người dùng vào chỗ trống */
vao('pht', 'd-da-xoa');
S.phamVi = ''; apDungQuyen();      /* phải đổi lại được phạm vi, không bị ép về chỗ cũ */
kt('Phân hiệu phụ trách đã bị xoá thì mở khoá, không kẹt vào chỗ trống',
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
   in ra mà chỉ ghi tên gọi thì hai người cùng tên không phân biệt được.
   Cặp đem ra soi SUY TỪ dữ liệu, không ghi cứng: đổi bộ dữ liệu mẫu mà phép
   thử vẫn xanh nhờ tên cũ tình cờ còn đó thì nó không kiểm được gì. */
const oCoTen = aLop.slice(4).flatMap(h => h.slice(3)).filter(x => String(x).includes(' — '));
const goiCua = g => g.hoTen.trim().split(/\s+/).pop().toLowerCase();
const nhomGoi = {};
S.giaoVien.forEach(g => (nhomGoi[goiCua(g)] = nhomGoi[goiCua(g)] || []).push(g));
const capTrung = Object.values(nhomGoi).filter(d => d.length > 1)
  .find(d => d.every(g => oCoTen.some(x => x.includes(g.hoTen)))) || [];
/* Mọi ô đều phải kết thúc bằng HỌ TÊN ĐẦY ĐỦ của một giáo viên có thật —
   tên gọi rút gọn ("Cô Nhài", "Cô NhàiB") không được lọt ra bản xuất. */
kt('Bản xuất ghi họ tên đầy đủ, không dùng tên gọi rút gọn',
   oCoTen.length > 0 && capTrung.length > 1 &&
   oCoTen.every(x => S.giaoVien.some(g => String(x).endsWith(' — ' + g.hoTen))),
   capTrung.length > 1
     ? `${capTrung.length} giáo viên cùng tên gọi ghi rõ họ tên: ${capTrung.map(g => g.hoTen).join(' · ')}`
     : 'không tìm được cặp trùng tên gọi nào trong lưới');

const aPC = bangXuatPC(S.lop);
const dongTong = aPC[aPC.length - 1];
kt('Bảng phân công: đủ 265 dòng và cộng đúng 710 tiết',
   aPC.length === 4 + S.phanCong.length + 2 && dongTong[6] === 710,
   `${aPC.length - 6} dòng · ${dongTong[6]} tiết`);

const aDT = bangXuatDT();
kt('Bảng tổng hợp phân hiệu có đủ số liệu',
   aDT.length === 5 && aDT[4][1] === 25 && aDT[4][3] === 710);

/* ---------- Rút gọn tên phân hiệu ----------
   Tên chính thức đều là "Phân hiệu Diễn ...", nhưng trên màn hình phải
   hiện gọn và ĐỒNG NHẤT — nơi ghi "Diễn Liên", nơi ghi "Phân hiệu Diễn
   Đồng" thì dải nút dài ngắn lệch nhau, trên điện thoại tràn hàng.

   Bản trước dò bằng biểu thức trên nguyên chữ CÓ DẤU nên trượt đúng một
   phân hiệu, mà nhìn màn hình thì hai chuỗi giống hệt nhau — không ai
   đoán ra. Nay cắt theo TỪ đã bỏ dấu, nên mọi cách gõ đều ra một kết quả. */
kt('Cắt tiền tố "Phân hiệu" dù gõ kiểu nào', [
     ['Phân hiệu Diễn Đồng', 'Diễn Đồng'],
     ['Phân hiệu Diễn Đồng'.normalize('NFD'), 'Diễn Đồng'],   /* dấu ở dạng rời */
     ['điểm  trường   Diễn Đồng', 'Diễn Đồng'],                 /* thường + thừa dấu cách */
     ['Ðiểm trường Diễn Đồng', 'Diễn Đồng'],                    /* chữ Ð khác mã */
   ].every(([vao, ra]) => tenDiemNgan(vao).normalize('NFC') === ra),
   [['Phân hiệu Diễn Đồng'.normalize('NFD'), 'Ðiểm trường Diễn Đồng']
     .map(x => tenDiemNgan(x))].join(' · '));
kt('Tên không có tiền tố thì giữ nguyên, không cắt bừa',
   tenDiemNgan('Diễn Liên') === 'Diễn Liên' && tenDiemNgan('Điểm A') === 'Điểm A');
kt('Tên chỉ có đúng chữ "Phân hiệu" thì giữ nguyên, không trả về ô rỗng',
   tenDiemNgan('Phân hiệu') === 'Phân hiệu');

kt('Bỏ dấu tiếng Việt để đặt tên tệp',
   khongDau('Trường Tiểu học Diễn Liên') === 'Truong-Tieu-hoc-Dien-Lien',
   khongDau('Trường Tiểu học Diễn Liên'));
kt('Tên tệp không dấu, không khoảng trắng, đúng đuôi',
   /^TKB-[A-Za-z0-9-]+-\d{8}\.xlsx$/.test(tenTepXuat('xlsx')), tenTepXuat('xlsx'));

/* Chức năng xuất .ics đã GỠ BỎ 2/8/2026 — thầy cô mở thẳng app trên điện
   thoại được rồi (đã có PWA), nên một đường xuất lịch nữa chỉ là thứ phải
   nuôi mà không ai dùng. Mã cũ tra lại trong lịch sử git nếu cần. */

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
const uvChaoCo = ungVienThay(chaoCo, gvCN1A.id, '2026-09-07');
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
  const sau = ungVienThay(chaoCo, gvCN1A.id, '2026-09-07');
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
/* ⚠️ BA PHÉP THỬ NGAY DƯỚI ĐÂY CHẬP CHỜN — và biết rõ vì sao (16/8/2026).
   `toiUuHoanDoi` dừng theo ĐỒNG HỒ. Máy đang bận thì trong 1200ms nó làm
   được ít việc hơn, kết quả kém hơn, và ba ngưỡng dưới đây không đạt —
   khoảng một phần ba số lần chạy. Đo được: cho chạy tới khi hội tụ thì
   điểm phạt còn giảm thêm 12% (25 lớp) đến 35% (60 lớp), nghĩa là mốc
   1200ms đang cắt ngang giữa chừng chứ không phải đã xong việc.
   Cách chữa là dừng theo SỐ PHÉP THỬ thay vì theo giây; chủ dự án chốt để
   sau khai giảng mới đụng vào thuật toán. Xem mục 9 của CLAUDE.md.
   Trong lúc chờ: thấy ba dòng này đỏ thì chạy lại `npm test` trước đã. */
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
/* ⚠️ Khối này CỐ Ý giữ tên cột CŨ `Diem_truong`. Từ 28/8/2026 mẫu ghi
   `Phan_hieu`, nhưng trường nào đã tải mẫu về điền dở thì không được bỗng
   mất công — `chuanTenCot()` đổi tên cột cũ về tên mới ngay đầu đường đọc.
   Để nguyên tên cũ ở đây là giữ luôn một phép thử cho đường lui ấy. */
kt('Tự dựng phân hiệu từ cột Diem_truong (tên cũ) và gán lớp về đúng nơi',
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
kt('Bắt được tên lớp lặp trong CÙNG một phân hiệu', co('Ten_lop "1A"'));
kt('Bắt được khối ngoài 1–5, thiếu mã, thiếu môn, số tiết bằng 0',
   co('Khoi phải là số từ 1 đến 5') && co('thiếu Ma_GV') && co('thiếu tên môn') && co('So_tiet'));
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
  [{ Ma_lop: 'DL-1A', Ten_lop: '1A', Khoi: 1, Diem_truong: 'Phân hiệu Diễn Liên' },
   { Ma_lop: 'DD-1A', Ten_lop: '1A', Khoi: 1, Diem_truong: 'Phân hiệu Diễn Đồng' },
   { Ma_lop: 'DT-1A', Ten_lop: '1A', Khoi: 1, Diem_truong: 'Phân hiệu Diễn Thái' }],
  [{ Ma_GV: 'DL01', Ma_lop: 'DL-1A', Mon: 'Toán', So_tiet: 5 },
   { Ma_GV: 'DD01', Ma_lop: 'DD-1A', Mon: 'Toán', So_tiet: 5 },
   { Ma_GV: 'DT01', Ma_lop: 'DT-1A', Mon: 'Toán', So_tiet: 5 }]);

kt('Ba phân hiệu cùng có lớp "1A" là hợp lệ, không phải đổi tên lớp',
   BA_TRUONG.soLoi === 0 && BA_TRUONG.lop.length === 3,
   BA_TRUONG.loi.join(' | ') || '3 lớp cùng tên, 3 phân hiệu');
kt('Mỗi lớp "1A" nối đúng cô chủ nhiệm của mình',
   BA_TRUONG.giaoVien.find(g => g.id === 'DL01').cn === 'DL-1A' &&
   BA_TRUONG.giaoVien.find(g => g.id === 'DD01').cn === 'DD-1A' &&
   BA_TRUONG.giaoVien.find(g => g.id === 'DT01').cn === 'DT-1A',
   'chủ nhiệm đi bằng Ma_lop, không bằng tên');
kt('Ba lớp về đúng ba phân hiệu khác nhau',
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
/* ---------- 10a. Đặt lại mã lớp xấu ----------
   Cơ sở dữ liệu dựng trước khi có cột ma_lop để trống ô đó, nên bảng Lớp học
   bày ra mã UUID 36 ký tự của máy chủ — thứ người dùng phải gõ vào Excel. */
console.log('\n10a. Đặt lại mã lớp do máy chủ tự sinh');
{
  const u = taoUngDung(documentGia);
  u.S.diemTruong = [{ id: 'dt1', ten: 'Phân hiệu Diễn Liên', phongTin: true },
                    { id: 'dt2', ten: 'Phân hiệu Diễn Đồng', phongTin: false }];
  u.S.lop = [{ id: 'u1', ten: '2A', khoi: 2, maLop: '' },
             { id: 'u2', ten: '2B', khoi: 2, maLop: '9ef6de95-589a-4a9f-86a9-3e56c1dc4a5c' },
             { id: 'u3', ten: '2A', khoi: 2, maLop: '2A_DĐ' }];
  u.S.lopDT = { u1: 'dt1', u2: 'dt1', u3: 'dt2' };

  kt('Nhận ra mã xấu: bỏ trống hoặc UUID của máy chủ',
     u.maXauXi(u.S.lop[0]) && u.maXauXi(u.S.lop[1]) && !u.maXauXi(u.S.lop[2]));
  /* Giữ dấu tiếng Việt trong viết tắt: bỏ dấu thì Diễn Đồng và Diễn Đông
     đều thành DD, hai phân hiệu lẫn nhau ngay từ mã lớp. */
  kt('Viết tắt phân hiệu giữ nguyên dấu tiếng Việt',
     u.tienToDT('Phân hiệu Diễn Liên') === 'DL' &&
     u.tienToDT('Phân hiệu Diễn Đồng') === 'DĐ' &&
     u.tienToDT('Phân hiệu Diễn Thái') === 'DT',
     'Diễn Liên → DL · Diễn Đồng → DĐ · Diễn Thái → DT');

  const doi = u.datLaiMaLop();
  kt('Đặt lại đúng số lớp, mã đọc được ngay: tên lớp trước, phân hiệu sau',
     doi === 2 && u.S.lop[0].maLop === '2A_DL' && u.S.lop[1].maLop === '2B_DL',
     `${doi} lớp · ${u.S.lop.map(l => l.maLop).join(' · ')}`);
  kt('Mã đang đẹp thì không đụng tới', u.S.lop[2].maLop === '2A_DĐ');
  /* Máy chủ cũ có thể giữ mã kiểu "2A" — không xấu, nhưng không nói được
     lớp đó ở phân hiệu nào. Nút bấm tay đưa TOÀN BỘ về dạng chuẩn. */
  kt('Đặt lại toàn bộ: mã cũ kiểu "2A" cũng được đưa về dạng có phân hiệu', (() => {
    u.S.lop.forEach(l => { l.maLop = l.ten; });          /* giống sau khi chạy ma-lop.sql */
    const n = u.datLaiMaLop(true);
    return n === 3 && u.S.lop.map(l => l.maLop).join(',') === '2A_DL,2B_DL,2A_DĐ';
  })(), 'hai lớp cùng tên 2A vẫn ra hai mã khác nhau');
  kt('Chạy lại lần nữa thì không còn gì để đổi', u.datLaiMaLop(true) === 0);
  kt('Mã mới không trùng nhau — hai phân hiệu cùng có lớp 2A vẫn phân biệt được',
     new Set(u.S.lop.map(l => l.maLop)).size === 3);

  /* ⚠️ TRƯỜNG MỘT PHÂN HIỆU THÌ MÃ TRẦN, KHÔNG HẬU TỐ (30/8/2026).
     Vinh Hưng 1 có mã lệch tên (lớp mã `1F` mang tên `1G`…) nên phải bấm
     *Đặt lại mã lớp*. Nhưng hàm cũ luôn gắn hậu tố phân hiệu, mà phân hiệu
     duy nhất của họ tên "Điểm trường chính" → mã thành `1A_C`: đổi cả 40
     lớp, kể cả 25 lớp đang đúng, để lấy về một hậu tố vô nghĩa. Hậu tố sinh
     ra để phân biệt ba phân hiệu cùng có lớp "1A" — một phân hiệu thì không
     có gì để phân biệt. `sinhLop()` vốn đã làm đúng, hàm này thì chưa. */
  {
    const v = taoUngDung(documentGia);
    v.S.diemTruong = [{ id: 'd1', ten: 'Điểm trường chính', phongTin: true }];
    v.S.lop = [{ id: 'a', maLop: '1E', ten: '1E', khoi: 1 },
               { id: 'b', maLop: '1F', ten: '1G', khoi: 1 },
               { id: 'c', maLop: '1G', ten: '1H', khoi: 1 },
               { id: 'd', maLop: '1H', ten: '1I', khoi: 1 }];
    v.S.lopDT = { a: 'd1', b: 'd1', c: 'd1', d: 'd1' };
    const n = v.datLaiMaLop(true);
    kt('Trường một phân hiệu: đặt lại mã KHÔNG gắn hậu tố vô nghĩa',
       [v.S.lop.map(l => l.maLop).join(' ') === '1E 1G 1H 1I',
        `${n} lớp đổi · ${v.S.lop.map(l => l.maLop).join(' ')}`]);
    kt('Lớp đang đúng thì không bị đụng tới',
       [n === 3, `chỉ 3 lớp lệch được sửa, không phải cả 4`]);
    kt('Mã sau khi đặt lại khớp đúng tên lớp — hết cảnh mã lệch tên',
       v.S.lop.every(l => l.maLop === l.ten));
  }
}

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

/* ⚠️ Dòng đọc từ tệp THẬT mang thêm khoá kỹ thuật `__dong` (số dòng Excel, do
   bangTuMaTran gắn để câu lỗi chỉ đúng chỗ). Trình đọc ma trận coi mọi khoá lạ
   là TÊN MÔN, nên nó báo 'cột "__dong" không có trong danh mục môn' và chặn cả
   tệp — Tiểu học Thần Lĩnh 1 gặp đúng thế ngày 29/8/2026. Phép thử cũ dùng
   doiObj() tự dựng nên không có khoá ấy, và không thấy gì. */
{
  const coDong = doiObj(mMT.mt).map((r, i) => ({ ...r, __dong: i + 4 }));
  const r = duLieuTuMaTran(coDong, doiObj(mMT.lop));
  kt('Khoá kỹ thuật __dong KHÔNG bị nhận nhầm là một cột môn',
     r.soLoi === 0 && r.phanCong.length === 265,
     r.soLoi ? String(r.loi[0]).slice(0, 70) : `${r.phanCong.length} dòng`);
}

/* Tệp Excel tham chiếu lớp bằng MÃ LỚP và giáo viên bằng MÃ GIÁO VIÊN, còn
   S.phanCong dùng id nội bộ — ánh xạ ngược CẢ HAI trước khi so, không thì so
   mã với id.

   ⚠️ Trước 3/8/2026 phép thử này chỉ ánh xạ lớp mà bỏ qua giáo viên, và vẫn
   xanh — vì `maGV` khi ấy còn trống nên `bangMauMaTran()` rơi về `g.id`, hai
   thứ tình cờ trùng nhau. Đặt mã giáo viên đọc được là lộ ngay chỗ thiếu. */
kt('Từng dòng phân công khớp nguyên bản — đúng người, đúng lớp, đúng môn, đúng tiết', (() => {
  const idLop = {}; S.lop.forEach(l => { idLop[l.maLop || l.id] = l.id; });
  const idGV = {}; S.giaoVien.forEach(g => { idGV[g.maGV || g.id] = g.id; });
  const bo = new Set(rtDL.phanCong.map(p =>
    `${idGV[p.gvId] || p.gvId}|${idLop[p.lopId] || p.lopId}|${p.mon}|${p.soTiet}`));
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
kt('Có trang lớp mà ghi tên trùng giữa hai phân hiệu thì bắt ghi mã', (() => {
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
kt('Tạo đủ phân hiệu lấy từ cột Diem_truong',
   GHI.diemTruong.length === 2 && GHI.diemTruong.some(d => d.ten === 'Điểm A'));
kt('Ghi khung giờ kèm số tiết riêng từng khối',
   GHI.khungGio.length === 10 && GHI.khungGio.some(k => k.so_tiet_khoi && k.so_tiet_khoi[4] === 5));
kt('Giáo viên ghi bằng ma_gv — khoá tự nhiên giữ nguyên mã UUID khi nhập lại',
   GHI.giaoVien.length === 3 && GHI.giaoVien[0].ma_gv === 'GV01' &&
   GHI.giaoVien[1].dinh_muc === 20);
kt('Lớp nối đúng chủ nhiệm và đúng phân hiệu',
   GHI.lop.length === 2 &&
   GHI.lop.find(l => l.ten === '1A').gvcn_id === UUID_GV(0) &&
   GHI.lop.find(l => l.ten === '1A').diem_truong_id !== GHI.lop.find(l => l.ten === '2B').diem_truong_id);
kt('Phân công xoá sạch rồi ghi lại, mọi dòng nối đúng mã',
   GHI.xoaPhanCong === 1 && GHI.phanCong.length === 3 &&
   GHI.phanCong.every(p => /^a1a1a1a1-/.test(p.giao_vien_id) && /^b2b2b2b2-/.test(p.lop_id)),
   `xoá ${GHI.xoaPhanCong} lần · ghi ${GHI.phanCong.length} dòng`);
kt('Tổng số tiết ghi lên đúng bằng tệp Excel',
   GHI.phanCong.reduce((s, p) => s + p.so_tiet, 0) === tep.tongTiet,
   `${tep.tongTiet} tiết`);

/* ⚠️ LỖI "invalid input syntax for type uuid: dt1787992176500" — 29/8/2026,
   Tiểu học Quảng Châu 1 bấm Lưu ở mục Môn học và MẤT NGUYÊN lần lưu.

   Gốc: hộp Thêm phân hiệu đặt id `dt`+thời điểm, và hồ sơ giáo viên giữ
   thẳng id ấy ở `dtChinh`. Bảng lớp và bảng phòng đều đi qua TÊN phân hiệu
   để lấy id máy chủ, riêng bảng giáo viên đẩy id app lên cột uuid — Postgres
   từ chối CẢ lệnh, nên hỏng luôn cả họ tên lẫn định mức. */
kt('Phân hiệu vừa khai trong app: id giáo viên ghi lên là id MÁY CHỦ, không phải id app',
   await (async () => {
     /* Đúng dạng hộp Thêm phân hiệu đặt ra, và cố ý KHÁC HẲN mọi id máy chủ
        giả lập — hai thứ tình cờ bằng nhau thì phép thử không kiểm được gì. */
     const dtApp = 'dt1787992176500';
     await MC.ghiDuLieuNguon({ ...tep, phanCong: [],
       diemTruong: [...tep.diemTruong, { id: dtApp, ten: 'Phân hiệu Mới', phongTin: true }],
       giaoVien: [{ id: 'gv_moi', maGV: 'GV_PH', hoTen: 'Cô Phân Hiệu', cn: '',
                    dinhMuc: 23, dtChinh: dtApp }] });
     const hang = (GHI.giaoVien || []).find(g => g.ma_gv === 'GV_PH');
     const idSv = GHI.diemTruong.find(d => d.ten === 'Phân hiệu Mới')?.id;
     return !!hang && !!idSv && hang.diem_truong_id === idSv && hang.diem_truong_id !== dtApp;
   })());
kt('Phân hiệu chưa khai bao giờ thì để TRỐNG, không đẩy chữ lạ lên cột uuid',
   await (async () => {
     await MC.ghiDuLieuNguon({ ...tep, phanCong: [],
       giaoVien: [{ id: 'gv_la', maGV: 'GV_LA', hoTen: 'Cô Lạ', cn: '',
                    dinhMuc: 23, dtChinh: 'dt_khong_ton_tai' }] });
     const hang = (GHI.giaoVien || []).find(g => g.ma_gv === 'GV_LA');
     return !!hang && hang.diem_truong_id === null;
   })());

/* ---------- PHÂN HIỆU: XOÁ CHỈ KHI NGƯỜI DÙNG THẬT SỰ BẤM XOÁ ----------
   ⚠️ ĐÃ MẤT THẬT (30/8/2026): chủ dự án thêm đủ ba phân hiệu, vào lại thì
   Diễn Thái biến mất. Bước "xoá phân hiệu thừa" (28/8) xoá MỌI dòng trên máy
   chủ mà danh sách gửi lên không nhắc tới — nên một phiên có dữ liệu cũ hơn
   (tab khác, tài khoản khác, tệp Excel không có cột phân hiệu) cũng xoá sạch
   phân hiệu người khác vừa thêm, im lặng và không hoàn tác được.

   Phân hiệu vừa thêm thường CHƯA CÓ LỚP NÀO, nên van an toàn "còn lớp thì
   không xoá" không cứu được nó — đó đúng là trường hợp đã mất. */
kt('Máy chủ có phân hiệu mà máy này chưa thấy: KHÔNG xoá, chỉ nói ra',
   await (async () => {
     GHI.xoaDT = [];
     GHI.diemTruong.push({ id: 'dt-cua-nguoi-khac', ten: 'Phân hiệu Diễn Thái' });
     const r = await MC.ghiDuLieuNguon({ ...tep, phanCong: [] });
     return [r.ok && GHI.xoaDT.length === 0
             && (r.dtLa || []).includes('Phân hiệu Diễn Thái')
             && /Diễn Thái/.test(r.thongBao),
             `xoá ${GHI.xoaDT.length} dòng · ${(r.dtLa || []).join(', ') || 'không nêu tên nào'}`];
   })());

/* Nhưng người dùng bấm × thì vẫn phải xoá thật — tính năng 28/8 còn nguyên. */
kt('Bấm xoá thật thì máy chủ xoá thật',
   await (async () => {
     GHI.xoaDT = [];
     const r = await MC.ghiDuLieuNguon({ ...tep, phanCong: [],
       dtDaXoa: [{ id: 'dt-cua-nguoi-khac', ten: 'Phân hiệu Diễn Thái' }] });
     return [r.ok && GHI.xoaDT.includes('dt-cua-nguoi-khac')
             && !GHI.diemTruong.some(d => d.id === 'dt-cua-nguoi-khac')
             && !(r.dtLa || []).includes('Phân hiệu Diễn Thái'),
             `xoá ${GHI.xoaDT.length} dòng`];
   })());

/* Phân hiệu khai trong app rồi xoá ngay thì `dtDaXoa` mang id app
   (`dt`+thời điểm), còn dòng trên máy chủ mang UUID — hai id không bao giờ
   khớp nhau. Phải dò thêm bằng TÊN, không thì bấm xoá mà máy chủ vẫn giữ. */
kt('Xoá được cả khi trong tay chỉ có id app, không có UUID máy chủ',
   await (async () => {
     GHI.xoaDT = [];
     GHI.diemTruong.push({ id: 'uuid-may-chu-9', ten: 'Phân hiệu Tạm' });
     const r = await MC.ghiDuLieuNguon({ ...tep, phanCong: [],
       dtDaXoa: [{ id: 'dt1787992176500', ten: 'Phân hiệu Tạm' }] });
     return [r.ok && GHI.xoaDT.includes('uuid-may-chu-9')
             && !GHI.diemTruong.some(d => d.ten === 'Phân hiệu Tạm'),
             `xoá ${GHI.xoaDT.length} dòng`];
   })());

/* ---------- GIÁO VIÊN ĐÃ XOÁ THÌ XOÁ THẬT (30/8/2026) ----------
   ⚠️ Vinh Hưng 1 xoá mấy hồ sơ thừa, bấm Lưu, "một lúc sau lại mọc lại".
   Gốc y hệt lỗi phân hiệu cùng ngày: hàm ghi chỉ biết THÊM và CẬP NHẬT,
   `gvThua` chỉ đếm rồi báo — xoá trong app sống tới lần tải lại kế tiếp.

   Nhưng KHÔNG được quay sang xoá mọi hồ sơ tệp không nhắc tới: đó đúng là
   cái bẫy vừa làm mất phân hiệu Diễn Thái. Chỉ xoá người ĐÃ BẤM XOÁ. */
kt('Không bấm xoá thì KHÔNG xoá hồ sơ giáo viên nào',
   await (async () => {
     GHI.xoaGV = [];
     const r = await MC.ghiDuLieuNguon({ ...tep, phanCong: [] });
     return [r.ok && GHI.xoaGV.length === 0, `xoá ${GHI.xoaGV.length} hồ sơ`];
   })());

kt('Bấm xoá thì máy chủ xoá thật',
   await (async () => {
     GHI.xoaGV = [];
     const g = (GHI.giaoVien || [])[0];
     const r = await MC.ghiDuLieuNguon({ ...tep, phanCong: [],
       gvDaXoa: [{ id: UUID_GV(0), maGV: g?.ma_gv || '', hoTen: 'Cô Thừa' }] });
     return [r.ok && GHI.xoaGV.includes(UUID_GV(0)), `xoá ${GHI.xoaGV.length} hồ sơ`];
   })());

/* ⚠️ `phan_cong`, `gv_nghi`, `bao_nghi`, `day_thay` đều `on delete cascade`
   theo giáo viên — xoá một hồ sơ đang có người dùng là cắt đường vào phần
   mềm của họ VÀ xoá cả lịch dạy thay, hồ sơ báo nghỉ. Giữ lại và báo ra. */
kt('Thầy cô đang có tài khoản thì GIỮ LẠI, và nói ra',
   await (async () => {
     GHI.xoaGV = [];
     GHI.gvCoTaiKhoan = [UUID_GV(1)];
     const r = await MC.ghiDuLieuNguon({ ...tep, phanCong: [],
       gvDaXoa: [{ id: UUID_GV(1), maGV: '', hoTen: 'Cô Đang Dùng' }] });
     GHI.gvCoTaiKhoan = [];
     return [r.ok && GHI.xoaGV.length === 0
             && (r.gvChuaXoa || []).includes('Cô Đang Dùng')
             && /Cô Đang Dùng/.test(r.thongBao),
             (r.gvChuaXoa || []).join(', ') || 'không giữ lại ai'];
   })());

/* Hồ sơ khai trong app mà chưa bấm Lưu bao giờ thì trên máy chủ chưa có gì
   để xoá — id còn là id app, gửi lên là Postgres từ chối cả lệnh. */
kt('Hồ sơ chưa từng lên máy chủ thì bỏ qua, không gửi lệnh xoá nào',
   await (async () => {
     GHI.xoaGV = [];
     const r = await MC.ghiDuLieuNguon({ ...tep, phanCong: [],
       gvDaXoa: [{ id: 'gv_moi_khai', maGV: 'GVX', hoTen: 'Cô Chưa Lưu' }] });
     return [r.ok && GHI.xoaGV.length === 0, `xoá ${GHI.xoaGV.length} hồ sơ`];
   })());

/* ---------- DÃY CHỮ CÁI ĐẶT TÊN LỚP ----------
   ⚠️ Vinh Hưng 1 đặt lớp A B C D E **G** H I — không dùng chữ F, mà máy cứ
   sinh 1F. Sửa tay từng lớp thì tên đổi mà `maLop` giữ nguyên `1F_VH`: tên
   và mã lệch nhau ngay từ lúc khai. */
kt('Không truyền dãy chữ thì hành vi Y HỆT như cũ', (() => {
  const a = sinhLop(1, 4, 'VH', 'dt1').map(l => l.ten).join(' ');
  return [a === '1A 1B 1C 1D', a];
})());

kt('Khai dãy bỏ chữ F thì lớp thứ sáu là 1G, không phải 1F', (() => {
  const ds = sinhLop(1, 8, 'VH', 'dt1', 'ABCDEGHI');
  return [ds.map(l => l.ten).join(' ') === '1A 1B 1C 1D 1E 1G 1H 1I',
          ds.map(l => l.ten).join(' ')];
})());

/* Mã lớp phải đi theo tên, không thì bảng Lớp học bày "1G" mà tệp Excel
   nhận "1F_VH" — đúng cái lệch mà bản vá này sinh ra để chặn. */
kt('Mã lớp đi theo tên mới, không lệch', (() => {
  const l = sinhLop(1, 6, 'VH', 'dt1', 'ABCDEGHI')[5];
  return [l.ten === '1G' && l.maLop === '1G_VH', `${l.ten} → ${l.maLop}`];
})());

kt('Dãy gõ lộn xộn thì tự chuẩn hoá: hoa hết, bỏ trùng, bỏ ký tự lạ', (() => {
  const ds = sinhLop(2, 4, '', 'dt1', ' a,b b-C d! ');
  return [ds.map(l => l.ten).join(' ') === '2A 2B 2C 2D', ds.map(l => l.ten).join(' ')];
})());

kt('Xoá sạch dãy thì lùi về bảng chữ cái đủ, không sinh ra lớp không tên', (() => {
  const ds = sinhLop(3, 3, '', 'dt1', '   ');
  return [ds.map(l => l.ten).join(' ') === '3A 3B 3C', ds.map(l => l.ten).join(' ')];
})());

/* Khai 8 lớp mà dãy chỉ có 3 chữ thì sinh được 3 — màn hình phải nói ra,
   đừng lặng lẽ tạo thiếu rồi để người dùng tự đếm mới biết. */
kt('Dãy ngắn hơn số lớp thì sinh đúng số chữ có, không lặp lại chữ', (() => {
  const ds = sinhLop(4, 8, '', 'dt1', 'ABC');
  return [ds.length === 3 && new Set(ds.map(l => l.ten)).size === 3,
          `${ds.length} lớp: ${ds.map(l => l.ten).join(' ')}`];
})());

/* ---------- TIẾN ĐỘ KHI GHI LÊN MÁY CHỦ (30/8/2026) ----------
   Nút "Đang lưu…" đứng im 8–10 giây thì người dùng tưởng máy treo — đường
   ghi gọi máy chủ 16–19 lần nối đuôi nhau, trong khi đường TẢI gọi 14 truy
   vấn cùng lúc nên chỉ tốn một vòng. Gộp song song để sau khai giảng; trước
   mắt cho thấy máy đang chạy tới đâu. */
kt('Báo đủ chín bước, đúng thứ tự, không nhảy cóc',
   await (async () => {
     const buoc = [];
     await MC.ghiDuLieuNguon({ ...tep, phanCong: [] },
       (i, tong, ten) => buoc.push({ i, tong, ten }));
     const dungThuTu = buoc.every((b, k) => b.i === k + 1 && b.tong === buoc.length);
     return [buoc.length === 9 && dungThuTu && buoc[0].ten === 'Phân hiệu'
             && buoc[8].ten === 'Dọn dẹp',
             `${buoc.length} bước: ${buoc.map(b => b.ten).join(' → ')}`];
   })());

/* ⚠️ Vùng DULIEU không đụng DOM — nó chỉ gọi hàm được truyền vào. Hàm ấy nổ
   thì cũng KHÔNG được làm hỏng lần ghi: người dùng mất dữ liệu vì một cái
   nhãn là đổi ngang giá quá đắt. */
kt('Hàm báo bước nổ thì lần ghi vẫn trót lọt',
   await (async () => {
     const r = await MC.ghiDuLieuNguon({ ...tep, phanCong: [] },
       () => { throw new Error('nhãn hỏng'); });
     return [r.ok === true, r.thongBao];
   })());

kt('Không truyền hàm báo bước thì chạy y như cũ',
   await (async () => {
     const r = await MC.ghiDuLieuNguon({ ...tep, phanCong: [] });
     return [r.ok === true, r.thongBao];
   })());

/* ---------- Thông tin trường: tên, năm học, địa bàn ----------
   Bảng `truong` bật RLS nhưng suốt từ đầu chỉ có quy tắc SELECT. Lệnh sửa vì
   thế đổi 0 dòng rồi trả 204 — phần mềm báo "đã lưu", người dùng tải lại trang
   thì tên cũ quay về. Việc sắp cần tới ngay: đổi tên đơn vị khi có quyết định
   sáp nhập. Vá bằng db/sua-thong-tin-truong.sql. */
const ghiTruong = await MC.ghiDuLieuNguon({ ...tep,
  tenTruong: 'Trường Tiểu học Quảng Châu', xa: 'Quảng Châu', tinh: 'Nghệ An', namHoc: '2026-2027' });
kt('Tên trường, năm học và địa bàn ghi thật lên máy chủ',
   ghiTruong.ok === true && !ghiTruong.loiTruong &&
   GHI.suaTruong.ten === 'Trường Tiểu học Quảng Châu' &&
   GHI.suaTruong.nam_hoc === '2026-2027' && GHI.suaTruong.xa === 'Quảng Châu',
   JSON.stringify(GHI.suaTruong));
kt('Bỏ trống năm học thì KHÔNG đẩy null vào cột NOT NULL — cả lệnh sẽ đổ',
   await (async () => {
     await MC.ghiDuLieuNguon({ ...tep, tenTruong: 'Trường Tiểu học mới', namHoc: '' });
     return !('nam_hoc' in GHI.suaTruong);
   })(), JSON.stringify(GHI.suaTruong));
kt('Máy chủ thiếu quy tắc sửa trường thì BÁO RA, không im lặng nhận là xong',
   await (async () => {
     GHI.chanSuaTruong = true;
     const r = await MC.ghiDuLieuNguon({ ...tep, tenTruong: 'Tên mới không lưu được' });
     GHI.chanSuaTruong = false;
     /* Lớp và giáo viên vẫn lưu được nên ok vẫn true — nhưng phải mang lời
        cảnh báo về, và câu thông báo chung phải nhắc tới nó. */
     return r.ok === true && /sua|cai-dat\.sql/i.test(r.loiTruong || '') &&
            /⚠️/.test(r.thongBao);
   })());

/* ⚠️ LỖI NHÂN BẢN GIÁO VIÊN — sự cố thật 2/8/2026, trường 35 giáo viên có
   105 hồ sơ trên máy chủ, mỗi người đúng ba bản.

   Cơ chế: bản cũ ghi `ma_gv: g.id`. Lần lưu ĐẦU thì g.id là mã app tự đặt
   (`gv_...`) nên máy chủ lưu đúng mã. Nhưng TẢI VỀ rồi thì g.id thành UUID
   của máy chủ, nên lần lưu SAU ghi ma_gv = UUID, không khớp dòng nào →
   thêm nguyên một lứa mới. Cứ mỗi lần Lưu sau khi tải lại là thêm 35 hồ sơ.

   Đây đúng là cái bẫy đã vá cho bảng LỚP mà quên vá cho bảng giáo viên. */
kt('Lưu lần hai sau khi tải về KHÔNG nhân đôi danh sách giáo viên',
   await (async () => {
     const truoc = (GHI.gvTheoKhoa || []).length;
     const uuid = 'a1b2c3d4-1111-4222-8333-444455556666';
     await MC.ghiDuLieuNguon({ ...tep,
       /* Đúng hình dạng sau khi tải về: id là UUID máy chủ, maGV là mã cũ */
       giaoVien: [{ id: uuid, maGV: 'GV01', hoTen: 'Nguyễn Thị Trinh', cn: '', dinhMuc: 23 },
                  { id: 'gv_moi_khai', maGV: 'gv_moi_khai', hoTen: 'Người mới', cn: '', dinhMuc: 23 }],
       phanCong: [] });
     const moi = (GHI.gvTheoKhoa || []).slice(truoc);
     const theoId = moi.filter(x => x.khoa === 'id');
     const theoMa = moi.filter(x => x.khoa === 'truong_id,ma_gv');
     return theoId.length === 1 && theoId[0].hang.id === uuid &&
            /* mã giữ NGUYÊN, không bị thay bằng UUID */
            theoId[0].hang.ma_gv === 'GV01' &&
            theoMa.length === 1 && theoMa[0].hang.ma_gv === 'gv_moi_khai';
   })(),
   'người đã có trên máy chủ ghi theo id · người mới khai ghi theo mã');

/* ⚠️ LỖI XOÁ GMAIL KHI NHẬP MA TRẬN — tìm ra 30/8/2026 khi rà soát, chưa kịp
   cắn thật. Mẫu ma trận không có cột Gmail · Dien_thoai · Dinh_muc, nên tệp
   đọc về dựng giáo viên với các ô ấy rỗng; upsert theo mã lại KHỚP đúng dòng
   cũ trên máy chủ — gửi null là xoá sạch Gmail cả trường (sáng hôm sau không
   ai đăng nhập bằng Google được nữa) và định mức riêng của giáo viên kiêm
   nhiệm bị đè về 23. Ô để trống nghĩa là "tôi không khai", không phải "xoá". */
kt('Nhập tệp không có cột Gmail thì GIỮ NGUYÊN Gmail · điện thoại · ghi chú · định mức riêng',
   await (async () => {
     const nguonCu = MC.KHO.nguon, sCu = MC.S.giaoVien;
     MC.KHO.nguon = 'may-chu';
     MC.S.giaoVien = [{id:'gv-uuid-0', maGV:'GV01', hoTen:'Nguyễn Thị Trinh', cn:'',
       dinhMuc:18, email:'trinh@nghean.edu.vn', dienThoai:'0912345678', ghiChu:'Kiêm nhiệm'}];
     const truoc = (GHI.gvTheoKhoa || []).length;
     await MC.ghiDuLieuNguon({...tep, phanCong:[], maTran:true,
       giaoVien:[{id:'GV01', maGV:'GV01', hoTen:'Nguyễn Thị Trinh', cn:'',
                  dinhMuc:23, dinhMucKhai:0, email:'', ghiChu:''}]});
     MC.KHO.nguon = nguonCu; MC.S.giaoVien = sCu;
     const hang = (GHI.gvTheoKhoa || []).slice(truoc).find(x => x.hang.ma_gv === 'GV01')?.hang;
     return !!hang && hang.email === 'trinh@nghean.edu.vn'
       && hang.dien_thoai === '0912345678' && hang.ghi_chu === 'Kiêm nhiệm'
       && hang.dinh_muc === 18;
   })());
kt('duLieuTuBang: ô Dinh_muc bỏ trống thì dinhMucKhai = 0 — dấu hiệu cho đường ghi giữ định mức cũ',
   (() => {
     const r = duLieuTuBang([{Ma_GV:'G1', Ho_ten:'Cô A', Dinh_muc:''},
                             {Ma_GV:'G2', Ho_ten:'Cô B', Dinh_muc:'18'}], [], []);
     const [a, b] = r.giaoVien;
     return a.dinhMucKhai === 0 && a.dinhMuc === 23 && b.dinhMucKhai === 18 && b.dinhMuc === 18;
   })());

kt('Mã giáo viên không bao giờ bị ghi đè bằng UUID của máy chủ',
   (GHI.giaoVien || []).every(h => !/^[0-9a-f-]{36}$/i.test(h.ma_gv)),
   JSON.stringify((GHI.giaoVien || []).map(h => h.ma_gv)));

/* ---------- Nối lại tài khoản vào đúng hồ sơ giáo viên ----------
   Sự cố 2/8/2026: mã mời nối tài khoản cô Oanh vào hồ sơ "Nguyễn Thị Oanh"
   0 tiết thay vì hồ sơ cùng tên 22 tiết — và phần mềm KHÔNG có đường nào sửa. */
{
  const nguonCu = MC.KHO.nguon;
  MC.KHO.nguon = 'may-chu';        /* chốt chặn "đang chạy dữ liệu mẫu" */
  const gvCu = MC.S.giaoVien[0], gvMoi = MC.S.giaoVien[1];
  gvCu.nguoiDungId = 'u-co-oanh';
  const doi = await MC.datTaiKhoanGV(gvMoi.id, 'u-co-oanh');
  kt('Chuyển được tài khoản sang hồ sơ khác, không phải cấp lại mã mời',
     doi.ok === true, doi.thongBao);
  kt('Hồ sơ cũ nhả tài khoản ra — một tài khoản chỉ giữ MỘT hồ sơ',
     !gvCu.nguoiDungId && gvMoi.nguoiDungId === 'u-co-oanh');
  kt('Chuyển tài khoản của CHÍNH mình thì màn hình lịch cá nhân đổi theo ngay',
     await (async () => {
       const idCu = MC.KHO.nguoiDung.id;
       await MC.datTaiKhoanGV(gvCu.id, idCu);
       return MC.KHO.nguoiDung.gvId === gvCu.id && MC.S.nguoiDung.gvId === gvCu.id;
     })());
  kt('Đang chạy dữ liệu mẫu thì KHÔNG cho đổi — mã giáo viên không phải của trường',
     await (async () => {
       MC.KHO.nguon = 'tep-mau';
       const r = await MC.datTaiKhoanGV(gvMoi.id, 'u-co-oanh');
       MC.KHO.nguon = 'may-chu';
       return r.ok === false && /dữ liệu mẫu/.test(r.thongBao);
     })());
  gvCu.nguoiDungId = null; gvMoi.nguoiDungId = null;
  MC.KHO.nguoiDung.gvId = 'g2'; MC.KHO.nguon = nguonCu;
}

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
   GHI.gvNghi.every(n => n.giao_vien_id === UUID_GV(0)) &&
   GHI.gvNghi.some(n => n.thu === 2 && n.buoi === 'S'));
kt('Tệp 3 trang không có buổi bận thì không đụng gì tới bảng gv_nghi', await (async () => {
  const truoc = GHI.xoaNghi;
  await MC.ghiDuLieuNguon(tep);            /* gvNghi rỗng */
  return GHI.xoaNghi === truoc;
})());

/* ⚠️ Bẫy chết người khi ĐỔI MÃ LỚP. Lớp đã nằm trên máy chủ (id là UUID
   thật) phải ghi theo khoá `id`; ghi theo mã thì mã MỚI không khớp dòng cũ,
   máy chủ thêm dòng mới và nhân đôi cả danh sách lớp. */
kt('Đổi mã lớp rồi lưu: lớp cũ ghi theo id, lớp mới ghi theo mã — không nhân đôi',
   await (async () => {
     const truoc = (GHI.lopTheoKhoa || []).length;
     const uuid = 'e0258f1f-0a3b-4fe4-80fd-284c9fd56941';
     await MC.ghiDuLieuNguon({ ...tep,
       lop: [{ id: uuid, ten: '1A', khoi: 1, maLop: '1A_DL' },
             { id: 'lop_1B_DL', ten: '1B', khoi: 1, maLop: '1B_DL' }],
       lopDT: { [uuid]: tep.diemTruong[0].id, lop_1B_DL: tep.diemTruong[0].id } });
     const moi = (GHI.lopTheoKhoa || []).slice(truoc);
     const theoId = moi.filter(x => x.khoa === 'id');
     const theoMa = moi.filter(x => x.khoa === 'truong_id,ma_lop');
     return theoId.length === 1 && theoId[0].hang.id === uuid &&
            theoId[0].hang.ma_lop === '1A_DL' &&
            theoMa.length === 1 && theoMa[0].hang.ma_lop === '1B_DL' &&
            !('id' in theoMa[0].hang);
   })(), 'lớp cũ sửa đúng dòng, lớp mới thêm bình thường');

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

/* Mục 12 cũ — cấp tài khoản hàng loạt bằng mật khẩu — GỠ BỎ 2/8/2026
   cùng với tenDangNhapGV() và matKhauNgauNhien(). Quyền nay cấp bằng mã
   mời (mục 6b), thầy cô đăng nhập bằng Gmail của chính mình. */

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
kt('Mã lớp: tên lớp trước, viết tắt phân hiệu sau',
   sinh.every(l => l.maLop.endsWith('_DD')) && sinh[0].maLop === '1A_DD');
kt('Ba phân hiệu cùng khai "1A" vẫn ra ba mã khác nhau', (() => {
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
kt('Chưa khai phòng thì vẫn xét bằng cờ phòng Tin của phân hiệu',
   S.phong.length === 0 && coPhong(S.diemTruong[0].id, 'Tin học') === !!S.diemTruong[0].phongTin);
kt('Môn không cần phòng thì luôn hợp lệ', coPhong('bất kỳ', '') === true);
kt('Khai bảng phòng rồi thì xét đúng theo bảng đó', (() => {
  S.phong = [{ id: 'p1', ten: 'Phòng máy', dtId: S.diemTruong[0].id, mon: 'Tin học' }];
  const co = coPhong(S.diemTruong[0].id, 'Tin học');
  const khong = coPhong('dt-khong-co', 'Tin học');
  S.phong = [];
  return co && !khong;
})());
kt('Cờ phòng Tin của phân hiệu suy ra từ bảng phòng, một nguồn sự thật', (() => {
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
   "Một phòng, một tiết, một lớp — và phòng phải ở đúng phân hiệu của lớp."
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

/* --- Phòng ở phân hiệu khác thì không tính --- */
kt('Phòng ở phân hiệu khác không dùng được cho lớp bên này', (() => {
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
})(), 'ràng buộc "phòng phải cùng phân hiệu với lớp"');

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

/* --- Bảng tra cập nhật tăng dần: phải KHỚP TUYỆT ĐỐI với bản dựng lại ---
   Đây là lưới an toàn của phép tối ưu 2/8/2026. Sai một ly ở đây là thuật
   toán đặt hai giáo viên vào cùng một ô mà không ai biết. */
const sapKhoa = v => (v && typeof v === 'object' && !Array.isArray(v))
  ? Object.keys(v).sort().reduce((r, k) => (r[k] = sapKhoa(v[k]), r), {}) : v;
const nhuNhau = (a, b) => JSON.stringify(sapKhoa(a)) === JSON.stringify(sapKhoa(b));

kt('Bảng tra cộng dồn khớp tuyệt đối với bản dựng lại từ đầu', (() => {
  const u = taoUngDung(documentGia);
  u.S.phong = [{ id: 'p1', ten: 'Phòng Tin học', dtId: u.S.diemTruong[0].id, mon: 'Tin học' }];
  u.xepTuDong(0);                                  /* lưới đầy 710 tiết, có xét phòng */
  const dungLai = u.chiSo();                       /* đường A: quét cả lưới một lượt */

  const luu = JSON.parse(JSON.stringify(u.S.tkb)); /* đường B: rỗng lưới rồi cộng dồn */
  u.S.lop.forEach(l => { u.S.tkb[l.id] = {}; });
  const congDon = u.chiSo();
  Object.entries(luu).forEach(([lp, o]) => Object.entries(o).forEach(([k, t]) => {
    u.S.tkb[lp][k] = t;
    u.themChiSo(congDon, lp, k, t.gvId, t.mon);
  }));

  return nhuNhau(congDon.gvBan, dungLai.gvBan) &&
         nhuNhau(congDon.gvBuoiDT, dungLai.gvBuoiDT) &&
         nhuNhau(congDon.phongBan, dungLai.phongBan) &&
         Object.keys(dungLai.gvBan).length > 0 &&
         Object.keys(dungLai.phongBan).length > 0;
})(), 'ba bảng: giáo viên bận · buổi ở phân hiệu nào · phòng đang chiếm');

kt('Xếp xong không có ô nào hai giáo viên, không ai vướng hai phân hiệu một buổi', (() => {
  const u = taoUngDung(documentGia);
  u.xepTuDong(0);
  const oGV = new Map(), buoiGV = new Map();
  let trung = 0, saiDT = 0;
  Object.entries(u.S.tkb).forEach(([lp, o]) => Object.entries(o).forEach(([k, t]) => {
    const kGV = t.gvId + '|' + k;
    if (oGV.has(kGV)) trung++; else oGV.set(kGV, lp);
    const kB = t.gvId + '|' + k.slice(0, k.lastIndexOf('-'));
    const dt = u.S.lopDT[lp];
    if (buoiGV.has(kB)) { if (buoiGV.get(kB) !== dt) saiDT++; } else buoiGV.set(kB, dt);
  }));
  return trung === 0 && saiDT === 0;
})(), 'ràng buộc cứng vẫn nguyên sau khi đổi cách dựng bảng tra');

/* ================================================================
   15. SINH DỮ LIỆU THỬ VÀ QUY MÔ SAU SÁP NHẬP
   ---------------------------------------------------------------
   Danh sách cán bộ giáo viên của các trường sáp nhập chưa chốt, mà không có
   giáo viên thì không xếp thử được gì. `taoDuLieuThu()` dựng một phân hiệu
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
uS.S.diemTruong[0].ten = 'Phân hiệu Diễn Liên';
const dD = uS.taoDuLieuThu('Phân hiệu Diễn Đồng', 'DD', 17, false);
const dT = uS.taoDuLieuThu('Phân hiệu Diễn Thái', 'DT', 18, false);

kt('Tạo đủ số lớp đã khai cho từng phân hiệu',
   dD.soLop === 17 && dT.soLop === 18, `${dD.soLop} + ${dT.soLop} lớp`);
kt('Ba phân hiệu, 60 lớp — đúng quy mô sau sáp nhập',
   uS.S.diemTruong.length === 3 && uS.S.lop.length === 60,
   `${uS.S.lop.length} lớp · ${uS.S.giaoVien.length} giáo viên`);
kt('Mọi lớp mới đều có mã riêng, không lớp nào trùng mã',
   new Set(uS.S.lop.map(l => l.maLop || l.id)).size === 60);
kt('Lớp trùng tên giữa ba phân hiệu vẫn phân biệt được bằng mã', (() => {
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
kt('Không giáo viên nào phải ở hai phân hiệu trong cùng một buổi', (() => {
  const buoiDT = {}; let pham = 0;
  Object.entries(uS.S.tkb).forEach(([lp, o]) => Object.entries(o).forEach(([k, t]) => {
    const kB = t.gvId + '@' + k.split('-').slice(0, 2).join('-');
    const dt = uS.S.lopDT[lp];
    if (buoiDT[kB] && buoiDT[kB] !== dt) pham++;
    buoiDT[kB] = dt;
  }));
  return pham === 0;
})(), 'ràng buộc lõi của bài toán sau sáp nhập');

/* --- Phân hiệu mới chưa có phòng máy thì R10 phải nói --- */
kt('Phân hiệu mới chưa có phòng Tin học thì R10 báo đúng tên nơi đó', (() => {
  const v = uS.kiemTra().vm.filter(x => x.ma === 'R10');
  return v.length === 2 && v.some(x => /Diễn Đồng/.test(x.t)) && v.some(x => /Diễn Thái/.test(x.t));
})());
kt('Khai phân hiệu CÓ phòng Tin học thì không báo R10', (() => {
  const u5 = taoUngDung(documentGia);
  u5.taoDuLieuThu('Phân hiệu Thử', 'TH', 10, true);
  return !u5.kiemTra().vm.some(x => x.ma === 'R10' && /Phân hiệu Thử/.test(x.t));
})());

/* ================================================================
   16. XẾP KỸ — TÁCH NHÓM ĐỘC LẬP, TÌM NHIỀU PHƯƠNG ÁN
   ---------------------------------------------------------------
   Học sinh chỉ học tại phân hiệu của mình và giáo viên về cơ bản dạy một
   phân hiệu, nên thời khóa biểu toàn trường gần như là mấy bài toán nhỏ
   rời nhau. Tách ra giải riêng thì chạy nhanh hơn và số phương án nhân lên.
   ================================================================ */
console.log('\n16. Xếp kỹ — tách nhóm độc lập, tìm nhiều phương án');

kt('Cùng hạt giống ra cùng dãy số — phương án dựng lại được y hệt', (() => {
  const a = taoNgauNhien(42), b = taoNgauNhien(42), c = taoNgauNhien(43);
  const da = [a(), a(), a()], db = [b(), b(), b()], dc = [c(), c(), c()];
  return da.join() === db.join() && da.join() !== dc.join() && da.every(x => x >= 0 && x < 1);
})());

const uK = taoUngDung(documentGia);
kt('Một phân hiệu thì cả trường là một nhóm',
   uK.nhomDocLap().length === 1 && uK.nhomDocLap()[0].length === 25);

uK.S.diemTruong[0].ten = 'Phân hiệu Diễn Liên';
uK.taoDuLieuThu('Phân hiệu Diễn Đồng', 'DD', 17, true);
uK.taoDuLieuThu('Phân hiệu Diễn Thái', 'DT', 18, true);
const nhomK = uK.nhomDocLap();
kt('Ba phân hiệu tách đúng thành ba nhóm rời nhau',
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

/* ⚠️ Khối phép thử của MẪU BA TRANG (`bangMauNhap`) đã bỏ cùng với chính hàm
   ấy ngày 28/8/2026 — chủ dự án chốt chỉ còn nhập TỪNG MỤC. Trình ĐỌC định
   dạng ba trang (`duLieuTuBang`) thì vẫn phải sống, vì trường nào đã điền dở
   tệp cũ không được bỗng mất công; nó có phép thử riêng ở mục 16 và mục 22. */

/* ---------- 17b. Mẫu điền sẵn theo TỪNG BẢNG (28/8/2026) ----------
   Cả ba mẫu trước đây hỏi đúng một câu "trường đã khai ĐỦ chưa?" rồi hoặc đổ
   hết dữ liệu thật, hoặc đổ hết dòng ví dụ bịa. Trường mới gõ tay được hai
   giáo viên, hay đã khai 25 lớp mà chưa có dòng phân công nào, tải mẫu về
   nhận một tệp toàn tên người không có thật — đúng phần việc vừa làm xong
   thì mất. Nay mỗi bảng tự quyết. */
console.log('\n17b. Mẫu Excel điền sẵn theo từng bảng');

/* Dựng một bản ứng dụng ở đúng trạng thái trường mới khai dở */
const truongKhaiDo = (soLop, soGV) => {
  const u = taoUngDung(documentGia);
  u.S.diemTruong = [{ id: 'dt1', ten: 'Phân hiệu Trung tâm' }];
  u.S.lop = Array.from({ length: soLop }, (_, i) =>
    ({ id: 'L' + i, maLop: (i + 1) + 'A', ten: (i + 1) + 'A', khoi: (i % 5) + 1 }));
  u.S.lopDT = Object.fromEntries(u.S.lop.map(l => [l.id, 'dt1']));
  u.S.giaoVien = Array.from({ length: soGV }, (_, i) =>
    ({ id: 'G' + i, maGV: 'GV' + i, hoTen: 'Cô Giáo Số ' + i, cn: null }));
  u.S.phanCong = []; u.S.gvNghi = {}; u.S.phong = [];
  return u;
};

/* Kịch bản đúng ảnh chụp chủ dự án gửi: 25 lớp đã khai, mới gõ tay 2 giáo viên,
   chưa có dòng phân công nào. */
{
  const u = truongKhaiDo(25, 2);
  const tg = u.bangMauTronGoi();
  const hang = t => tg.trang.find(x => x.ten === t).hang;
  kt('Trọn gói: 25 lớp và 2 giáo viên đã gõ tay đều có mặt trong mẫu',
     hang('4_LOP').length === 25 && hang('5_GIAO_VIEN').length === 2,
     `${hang('4_LOP').length} lớp · ${hang('5_GIAO_VIEN').length} giáo viên`);
  kt('Trọn gói: bảng phân công CHƯA khai thì để TRỐNG, không chèn dòng bịa',
     hang('6_PHAN_CONG').length === 0);
  kt('Trọn gói: không một cái tên ví dụ nào lọt vào tệp của trường thật',
     !JSON.stringify(tg.trang).includes('Nguyễn Thị An') &&
     !JSON.stringify(tg.trang).includes('Phân hiệu chính'));
  kt('Trọn gói: ô xổ xuống Ma_lop lấy đúng 25 mã lớp thật',
     tg.danhMuc.DM_Ma_lop.length === 25 && tg.danhMuc.DM_Ma_lop[0] === '1A');
  kt('Trọn gói: chưa có giáo viên nào thì danh mục Ma_GV không bịa ba cái tên',
     truongKhaiDo(25, 0).bangMauTronGoi().danhMuc.DM_Ma_GV.length === 0);


  /* Đây là chỗ hỏng nặng nhất của bản cũ: mẫu ma trận đòi CẢ BA bảng, nên
     chưa có phân công là 25 lớp và 2 giáo viên biến mất sạch. */
  const mt = u.bangMauMaTran();
  kt('Ma trận: chưa có phân công vẫn liệt kê đủ 2 giáo viên để đánh dấu x',
     mt.mt.length - 1 === 2 && mt.mt[1][2] === 'Cô Giáo Số 0',
     `${mt.mt.length - 1} dòng · ${mt.mt[1] && mt.mt[1][2]}`);
  kt('Ma trận: trang lớp cũng mang đúng 25 lớp thật, không phải 3 lớp ví dụ',
     mt.lop.length - 1 === 25);
}

/* Mới gõ tay vài giáo viên, chưa khai lớp nào — chiều ngược lại của cùng lỗi */
{
  const u = truongKhaiDo(0, 3);
  const tg = u.bangMauTronGoi();
  const hang = t => tg.trang.find(x => x.ten === t).hang;
  kt('Mới khai giáo viên, chưa có lớp: ba giáo viên ấy vẫn vào mẫu',
     hang('5_GIAO_VIEN').length === 3 && hang('4_LOP').length === 0);
}

/* Trường TRẮNG thì vẫn phải có ví dụ — đó là lúc dòng ví dụ có ích, và các
   tên trong ví dụ có thật ở chính những trang khác của tệp. */
{
  const u = taoUngDung(documentGia);
  u.S.lop = []; u.S.giaoVien = []; u.S.phanCong = []; u.S.phong = []; u.S.gvNghi = {};
  const tg = u.bangMauTronGoi();
  const hang = t => tg.trang.find(x => x.ten === t).hang;
  kt('Trường trắng: cả ba mẫu vẫn kèm dòng ví dụ để thấy cách ghi',
     !tg.coThat && hang('4_LOP').length > 0 && hang('5_GIAO_VIEN').length > 0 &&
     hang('6_PHAN_CONG').length > 0 && u.bangMauMaTran().mt.length > 1);
}

/* ==================================================================
   18. BÁO NGHỈ VÀ PHƯƠNG ÁN DẠY THAY
   ------------------------------------------------------------------
   Mười bảy kịch bản của §23 trong bản giao việc. Chạy trên lưới THẬT của
   Trường TH Diễn Liên đã xếp xong, không phải dữ liệu bịa — vì cái cần
   chứng minh chính là "trên dữ liệu thật thì máy không đề xuất bậy".
   ================================================================== */
console.log('\n18. Báo nghỉ và phương án dạy thay');
{
  const u = taoUngDung(documentGia);
  u.S.tkb = {}; u.S.lop.forEach(l => u.S.tkb[l.id] = {});
  u.xepTuDong(0);
  const T2 = '2026-09-07';                       /* thứ Hai */
  const T3 = '2026-09-08';                       /* thứ Ba */
  const CN = '2026-09-13';                       /* Chủ nhật */

  kt('Ngày 7/9/2026 đúng là thứ Hai, 13/9 là Chủ nhật',
     u.thuTuISO(T2) === 2 && u.thuTuISO(CN) === 1);
  kt('Nghỉ cả ngày quy ra đúng hai buổi sáng và chiều',
     u.buoiCuaNghi('CN').join() === 'S,C'
     && u.buoiCuaNghi('S').join() === 'S');
  kt('Đúng năm lý do nghỉ, không thêm thủ tục hành chính nào',
     u.LY_DO_NGHI.length === 5 && u.LY_DO_NGHI.includes('Nghỉ ốm')
     && u.LY_DO_NGHI.includes('Đi công tác'));

  /* Chọn một giáo viên có tiết cả sáng lẫn chiều thứ Hai */
  const lich = u.lichTraGV();
  const gvCoTiet = u.S.giaoVien.find(g => {
    const o = lich[g.id] || {};
    return Object.keys(o).some(k => k.startsWith('2-S-'))
        && Object.keys(o).some(k => k.startsWith('2-C-'));
  }) || u.S.giaoVien.find(g => Object.keys(lich[g.id] || {}).length);

  /* ----- 1 · 2 · 3: nghỉ sáng, nghỉ chiều, nghỉ cả ngày ----- */
  const sang = u.tietCanThay({gvId: gvCoTiet.id, ngay: T2, buoi: 'S'});
  const chieu = u.tietCanThay({gvId: gvCoTiet.id, ngay: T2, buoi: 'C'});
  const caNgay = u.tietCanThay({gvId: gvCoTiet.id, ngay: T2, buoi: 'CN'});
  kt('Nghỉ buổi SÁNG: máy tự đọc ra đúng các tiết sáng, không phải nhập tay',
     sang.length > 0 && sang.every(o => o.buoi === 'S'),
     `${sang.length} tiết`);
  kt('Nghỉ buổi CHIỀU: chỉ ra tiết chiều', chieu.every(o => o.buoi === 'C'),
     `${chieu.length} tiết`);
  kt('Nghỉ CẢ NGÀY: đúng bằng sáng cộng chiều, không sót không thừa',
     caNgay.length === sang.length + chieu.length, `${caNgay.length} tiết`);
  kt('Mỗi tiết nói đủ lớp, môn, phân hiệu — bảng của §10 dựng được ngay',
     sang.every(o => o.lopId && o.mon && o.dtId));
  kt('Nghỉ ngày Chủ nhật thì không có tiết nào để bố trí',
     u.tietCanThay({gvId: gvCoTiet.id, ngay: CN, buoi: 'CN'}).length === 0);

  /* ----- 6 · 7 · 9: lọc người không hợp lệ ----- */
  const o1 = sang[0];
  const uv = u.ungVienThay(o1, gvCoTiet.id, T2);
  kt('Có ứng viên dạy thay cho tiết đầu tiên', uv.length > 0, `${uv.length} người`);
  kt('KHÔNG ai trong danh sách đang có tiết đúng ô giờ ấy', (() => {
    const l = u.lichTraGV();
    return uv.every(x => !(l[x.gv.id] || {})[o1.khoa]);
  })());
  kt('KHÔNG ai đang đứng lớp ở phân hiệu KHÁC trong buổi đó', (() => {
    const l = u.lichTraGV();
    const dtLop = u.S.lopDT[o1.lopId];
    return uv.every(x => {
      const o = l[x.gv.id] || {};
      const dt = new Set(Object.keys(o).filter(k => k.startsWith(`2-${o1.buoi}-`))
        .map(k => u.S.lopDT[o[k]]));
      return dt.size === 0 || dt.has(dtLop);
    });
  })());
  kt('KHÔNG ai đã đăng ký buổi bận cố định vào buổi đó',
     uv.every(x => !(u.S.gvNghi[x.gv.id] || []).includes(`2-${o1.buoi}`)));
  kt('Chính người đang nghỉ không bao giờ tự dạy thay mình',
     !uv.some(x => x.gv.id === gvCoTiet.id));
  kt('Mỗi ứng viên đều kèm LÝ DO bằng chữ, không phải con số',
     uv.every(x => Array.isArray(x.lyDo) && x.lyDo.length > 0
       && typeof x.lyDo[0] === 'string'));

  /* Người thứ hai cũng báo nghỉ đúng buổi ấy → phải biến mất khỏi gợi ý */
  const nan = uv[0].gv.id;
  u.S.baoNghi = [{id: 'x1', gvId: nan, ngay: T2, buoi: o1.buoi,
    lyDo: 'Nghỉ ốm', ghiChu: '', trangThai: 'cho'}];
  kt('Người CŨNG đang báo nghỉ thì biến mất khỏi gợi ý, không phải xuống cuối',
     !u.ungVienThay(o1, gvCoTiet.id, T2).some(x => x.gv.id === nan));
  kt('Nhưng nghỉ buổi SÁNG thì buổi chiều vẫn dùng được — không loại oan cả ngày', (() => {
    if (!chieu.length) return true;
    /* So sánh đúng một điều: có mặt trong danh sách buổi chiều KHI báo nghỉ
       sáng, giống hệt khi chưa báo nghỉ gì. Nếu họ vốn không đủ điều kiện
       cho buổi chiều vì lý do khác thì hai lần đều vắng — vẫn là bằng nhau. */
    const co = () => u.ungVienThay(chieu[0], gvCoTiet.id, T2).some(x => x.gv.id === nan);
    const khiNghiSang = co();
    const luu = u.S.baoNghi; u.S.baoNghi = [];
    const khiKhongNghi = co();
    u.S.baoNghi = luu;
    return khiNghiSang === khiKhongNghi;
  })());
  u.S.baoNghi = [];

  /* ----- 8: người đã được phân dạy thay lớp khác cùng tiết ----- */
  const lopKhac = u.S.lop.find(l => l.id !== o1.lopId
    && u.S.lopDT[l.id] === u.S.lopDT[o1.lopId]);
  u.S.dayThay = [{id: 'd1', ngay: T2, buoi: o1.buoi, tiet: o1.i, lopId: lopKhac.id,
    mon: 'Toán', gvVangId: gvCoTiet.id, gvThayId: nan, ghiChu: '', daXem: false}];
  kt('Người đã nhận dạy thay lớp khác đúng tiết ấy thì không được gợi ý nữa',
     !u.ungVienThay(o1, gvCoTiet.id, T2).some(x => x.gv.id === nan));
  kt('Nhưng bỏ chính dòng ấy ra (khi ĐỔI phương án) thì họ lại hợp lệ',
     u.ungVienThay(o1, gvCoTiet.id, T2, null, ['d1']).some(x => x.gv.id === nan));
  u.S.dayThay = [];

  /* ----- 10 · 11: một người cả buổi, hoặc nhiều người từng tiết ----- */
  const bn = {id: 'bn1', gvId: gvCoTiet.id, ngay: T2, buoi: 'S',
    lyDo: 'Nghỉ ốm', ghiChu: '', trangThai: 'cho'};
  const pa = u.phuongAnThay(bn);
  kt('Đề xuất tối đa BA phương án, không nhiều hơn', pa.pa.length <= 3
     && pa.pa.length > 0, `${pa.pa.length} phương án`);
  kt('Mỗi phương án bố trí đủ MỌI tiết, không bỏ sót tiết nào',
     pa.pa.every(p => p.phan.length === pa.tiet.length));
  kt('Ba phương án khác nhau thật sự, không phải ba bản sao', (() => {
    const van = pa.pa.map(p => p.phan.map(x => x.gvId || '-').join('|'));
    return new Set(van).size === van.length;
  })());
  kt('Phương án "một người cả buổi" thì đúng một người gánh mọi tiết', (() => {
    const p = pa.pa.find(x => x.kieu === 'ca-buoi');
    return !p || new Set(p.phan.map(x => x.gvId)).size === 1;
  })());
  kt('Không phương án nào đề xuất người vướng ràng buộc cứng', (() => {
    const l = u.lichTraGV();
    return pa.pa.every(p => p.phan.every(x =>
      !x.gvId || !(l[x.gvId] || {})[x.o.khoa]));
  })());
  kt('Cán bộ quản lý chỉ vào phương án dự phòng, không đứng đầu bảng', (() => {
    /* gán một người làm cán bộ quản lý rồi xem họ tụt hạng */
    const id = uv[uv.length > 2 ? 1 : 0].gv.id;
    const truoc = u.ungVienThay(o1, gvCoTiet.id, T2).findIndex(x => x.gv.id === id);
    u.S.giaoVienQL = [id];
    const sau = u.ungVienThay(o1, gvCoTiet.id, T2).findIndex(x => x.gv.id === id);
    u.S.giaoVienQL = [];
    return sau > truoc;
  })());

  /* ----- 14 · chốt chặn xung đột ----- */
  kt('Lưới đang xếp không có xung đột nào — nền để đo mọi phép thử sau',
     u.chiSoPhuongAn().xungDot === 0);
  kt('Ép một người dạy hai lớp cùng một tiết thì BẮT ĐƯỢC, không lọt', (() => {
    const loi = u.xungDotDayThay([
      {ngay: T2, buoi: o1.buoi, tiet: o1.i, lopId: o1.lopId, mon: o1.mon,
       gvVangId: gvCoTiet.id, gvThayId: nan},
      {ngay: T2, buoi: o1.buoi, tiet: o1.i, lopId: lopKhac.id, mon: o1.mon,
       gvVangId: gvCoTiet.id, gvThayId: nan}]);
    return loi.length > 0;
  })());
  kt('Phương án do chính máy đề xuất thì KHÔNG BAO GIỜ có xung đột', (() => {
    return pa.pa.every(p => u.xungDotDayThay(p.phan.map(x => ({
      ngay: T2, buoi: x.o.buoi, tiet: x.o.i, lopId: x.o.lopId, mon: x.o.mon,
      gvVangId: gvCoTiet.id, gvThayId: x.gvId}))).length === 0);
  })());
  kt('Lớp tự quản (không chọn ai) không sinh xung đột',
     u.xungDotDayThay([{ngay: T2, buoi: o1.buoi, tiet: o1.i, lopId: o1.lopId,
       mon: o1.mon, gvVangId: gvCoTiet.id, gvThayId: null}]).length === 0);
  kt('Cùng buổi, KHÁC tiết, hai phân hiệu — chốt cuối phải bắt, kể cả hai dòng cùng mẻ', (() => {
    /* Kịch bản hai quản lý ở hai máy: mỗi bên chọn cùng một người trống cả
       buổi cho một phân hiệu — từng dòng đều "sạch", chỉ nhìn CẢ BUỔI mới
       thấy người ấy phải có mặt ở hai nơi. Ràng buộc lõi sau sáp nhập. */
    const l = u.lichTraGV();
    const trong = u.S.giaoVien.find(g => !Object.keys(l[g.id] || {}).some(k => k.startsWith('2-S-')));
    if (!trong) return [false, 'không tìm được ai trống buổi sáng thứ Hai — dữ liệu thử đổi rồi?'];
    const dtCu = u.S.lopDT[lopKhac.id];
    u.S.lopDT[lopKhac.id] = 'dt-ao-phan-hieu-khac';
    const loi = u.xungDotDayThay([
      {ngay: T2, buoi: 'S', tiet: 0, lopId: o1.lopId, mon: o1.mon,
       gvVangId: gvCoTiet.id, gvThayId: trong.id},
      {ngay: T2, buoi: 'S', tiet: 1, lopId: lopKhac.id, mon: o1.mon,
       gvVangId: gvCoTiet.id, gvThayId: trong.id}]);
    u.S.lopDT[lopKhac.id] = dtCu;
    return loi.length > 0;
  })());
  kt('Câu báo xung đột nói rõ AI, KHI NÀO và VÌ SAO — đủ để sửa ngay', (() => {
    const l = u.lichTraGV();
    for (const x of uv) {
      const cua = l[x.gv.id] || {};
      const k = Object.keys(cua).find(y => y.startsWith('2-') && cua[y] !== o1.lopId);
      if (!k) continue;
      const [, b, i] = k.split('-');
      const loi = u.xungDotDayThay([{ngay: T2, buoi: b, tiet: +i, lopId: o1.lopId,
        mon: o1.mon, gvVangId: gvCoTiet.id, gvThayId: x.gv.id}]);
      if (loi.length) return !!(loi[0].gv && loi[0].noi && loi[0].vi);
    }
    return false;
  })());

  /* ----- 4 · 5: hai giáo viên nghỉ cùng buổi, có tiết trùng nhau ----- */
  const gv2 = u.S.giaoVien.find(g => g.id !== gvCoTiet.id
    && Object.keys(u.lichTraGV()[g.id] || {}).some(k => k.startsWith('2-S-')));
  u.S.baoNghi = [
    {id: 'a', gvId: gvCoTiet.id, ngay: T2, buoi: 'S', lyDo: 'Nghỉ ốm', ghiChu: '', trangThai: 'cho'},
    {id: 'b', gvId: gv2.id, ngay: T2, buoi: 'S', lyDo: 'Đi công tác', ghiChu: '', trangThai: 'cho'}];
  const vc = u.vieccanXuLy();
  kt('Hai giáo viên nghỉ cùng buổi thì đếm đủ cả hai, cộng đúng tổng số tiết',
     vc.soNghi === 2
     && vc.soTiet === u.tietCanThay(u.S.baoNghi[0]).length
                    + u.tietCanThay(u.S.baoNghi[1]).length,
     `${vc.soNghi} người · ${vc.soTiet} tiết`);
  kt('Người thứ hai đang nghỉ thì không được gợi ý dạy thay cho người thứ nhất',
     !u.ungVienThay(o1, gvCoTiet.id, T2).some(x => x.gv.id === gv2.id));
  kt('Đánh dấu đã xử lý một trường hợp thì số việc còn tồn giảm đúng một', (() => {
    u.S.baoNghi[0].trangThai = 'xong';
    const r = u.vieccanXuLy();
    u.S.baoNghi[0].trangThai = 'cho';
    return r.soNghi === 1 && r.daXuLy.length === 1;
  })());
  kt('Thông báo nghỉ của NGÀY ĐÃ QUA không còn tính là việc phải làm', (() => {
    const cu = u.S.baoNghi.map(b => ({...b}));
    u.S.baoNghi.forEach(b => b.ngay = '2020-01-06');
    const r = u.vieccanXuLy();
    u.S.baoNghi = cu;
    return r.soNghi === 0;
  })());

  /* ----- 13 · huỷ báo nghỉ · 17 · huy hiệu giảm ----- */
  kt('Giáo viên huỷ thông báo khi chưa xử lý thì việc cần làm biến mất', (() => {
    u.S.baoNghi = u.S.baoNghi.filter(b => b.id !== 'b');
    return u.vieccanXuLy().soNghi === 1;
  })());

  /* ----- 16 · 17: thông báo của giáo viên và huy hiệu ----- */
  u.S.dayThay = pa.tiet.map((o, i) => ({id: 'n' + i, ngay: T2, buoi: o.buoi,
    tiet: o.i, lopId: o.lopId, mon: o.mon, gvVangId: gvCoTiet.id,
    gvThayId: nan, ghiChu: '', daXem: false}));
  kt('Người được phân dạy thay thấy đủ số tiết trong thông báo của mình',
     u.thongBaoCuaGV(nan).length === pa.tiet.length);
  kt('Huy hiệu chưa xem giảm về 0 sau khi bấm Đã xem', (() => {
    const truoc = u.thongBaoCuaGV(nan).filter(x => !x.daXem).length;
    u.S.dayThay.forEach(x => x.daXem = true);
    const sau = u.thongBaoCuaGV(nan).filter(x => !x.daXem).length;
    return truoc === pa.tiet.length && sau === 0;
  })());
  kt('Thông báo sắp xếp theo ngày rồi tới buổi rồi tới tiết — đọc là hiểu', (() => {
    const ds = u.thongBaoCuaGV(nan);
    for (let i = 1; i < ds.length; i++) {
      const a = ds[i - 1], b = ds[i];
      const ka = `${a.ngay}|${a.buoi === 'S' ? 0 : 1}|${String(a.tiet).padStart(2, '0')}`;
      const kb = `${b.ngay}|${b.buoi === 'S' ? 0 : 1}|${String(b.tiet).padStart(2, '0')}`;
      if (ka > kb) return false;
    }
    return true;
  })());

  /* ----- Câu chữ xác nhận của §8 ----- */
  kt('Câu xác nhận ghi đủ thứ, ngày, tháng, năm — "Thứ Ba, ngày 08/09/2026"',
     u.ngayDayDu(T3) === 'Thứ Ba, ngày 08/09/2026', u.ngayDayDu(T3));
  kt('Tên buổi nghỉ đọc thành lời, không phải mã S · C · CN',
     u.TEN_BUOI_NGHI.S === 'buổi sáng' && u.TEN_BUOI_NGHI.CN === 'cả ngày');
  kt('Cộng ngày không nhảy sai qua đầu tháng', u.ngayCong('2026-08-31', 1) === '2026-09-01');

  /* ----- 19: thuật toán xếp không hề suy suyển ----- */
  kt('Cả bộ báo nghỉ không đụng gì tới lưới thời khóa biểu — vẫn 710/710 tiết',
     ...((() => {
       const xep = u.S.lop.reduce((s, l) => s + Object.keys(u.S.tkb[l.id] || {}).length, 0);
       return [xep === 710, `${xep}/710 tiết`];
     })()));
  kt('Năm chỉ số so sánh phương án đều tính ra số hợp lệ', (() => {
    const c = u.chiSoPhuongAn();
    return ['daXep', 'thieu', 'xungDot', 'trong', 'diChuyen']
      .every(k => Number.isFinite(c[k]) && c[k] >= 0);
  })());

  /* ----- Chưa nối máy chủ thì mọi đường ghi đều báo rõ ----- */
  kt('Máy chủ từ chối vì trùng giáo viên một tiết thì dịch thành câu người đọc được',
     await (async () => {
    /* Chốt chặn cuối của §14 nằm ở chỉ số ux_day_thay_gv_mot_tiet trên máy
       chủ — nó chỉ nổ khi hai người phân công cùng lúc, tình huống mà phép
       kiểm phía app không thể thấy trước. Ở đây kiểm phần app PHẢI làm được:
       dịch mã lỗi Postgres thành câu nói rõ chuyện gì và làm gì tiếp. */
    const u2 = taoUngDung(documentGia, undefined, async () => {
      const e = new Error('duplicate key value violates unique constraint "ux_day_thay_gv_mot_tiet"');
      throw e;
    });
    u2.KHO.phien = {token: 'x', lamMoi: 'y'};
    u2.KHO.nguoiDung = {id: 'nd1', truongId: 't1'};
    u2.KHO.nguon = 'may-chu';
    u2.KHO.cauHinh = {url: 'https://x', khoa: 'k'};
    const r = await u2.luuDayThay([{ngay: '2026-09-07', buoi: 'S', tiet: 0,
      lopId: 'l1', mon: 'Toán', gvVangId: 'g1', gvThayId: 'g2'}]);
    return r.ok === false
      && /vừa được người khác phân công/.test(r.thongBao)
      && !/ux_day_thay_gv_mot_tiet/.test(r.thongBao);
  })());
  kt('Chưa nối máy chủ: gửi báo nghỉ báo rõ, không văng lỗi', await (async () => {
    const r = await u.guiBaoNghi({gvId: gvCoTiet.id, ngay: T2, buoi: 'S', lyDo: 'Nghỉ ốm'});
    return r.ok === false && /máy chủ/i.test(r.thongBao);
  })());
}

/* ==================================================================
   19. MÃ GIÁO VIÊN PHẢI LÀ MÃ NGƯỜI ĐỌC ĐƯỢC
   ------------------------------------------------------------------
   Cùng câu chuyện với mã lớp, cùng gốc: lỗi upsert `ma_gv: g.id` ngày
   2/8/2026 ghi UUID của máy chủ vào cột ma_gv. Lỗi đã vá, dữ liệu để
   lại thì chưa. Bộ này canh cả hình dạng mã lẫn CHỐT AN TOÀN quan
   trọng nhất: đổi mã không được đụng vào bất cứ tham chiếu nào.
   ================================================================== */
console.log('\n18b. Tổng hợp ngày công theo tháng');
{
  /* Bảng nộp báo cáo hằng tháng, suy hết từ bao_nghi. Một buổi = 0,5 công,
     cả ngày = 1 công; thông báo đã huỷ không tính, 'cho' lẫn 'xong' đều
     tính — nghỉ là chuyện đã xảy ra, không phụ thuộc dạy thay xong chưa. */
  const u = taoUngDung(documentGia);
  const [g1, g2] = u.S.giaoVien;
  u.S.baoNghi = [
    {id:'a', gvId:g1.id, ngay:'2026-09-07', buoi:'S',  lyDo:'Nghỉ ốm',          trangThai:'cho'},
    {id:'b', gvId:g1.id, ngay:'2026-09-10', buoi:'CN', lyDo:'Có việc gia đình', trangThai:'xong'},
    {id:'c', gvId:g2.id, ngay:'2026-09-08', buoi:'C',  lyDo:'Việc cá nhân',     trangThai:'huy'},
    {id:'d', gvId:g2.id, ngay:'2026-10-01', buoi:'S',  lyDo:'Nghỉ ốm',          trangThai:'cho'},
    {id:'e', gvId:'khong-ton-tai', ngay:'2026-09-09', buoi:'S', lyDo:'Nghỉ ốm', trangThai:'cho'}
  ];
  const kq = u.tongHopNgayCong('2026-09');
  kt('Chỉ gộp đúng tháng đang xem, tháng khác để dành cho trang khác',
     kq.dong.length === 1 && u.tongHopNgayCong('2026-10').dong.length === 1);
  kt('Một buổi 0,5 công, cả ngày 1 công — cộng ra đúng',
     kq.dong[0].cong === 1.5 && kq.tongCong === 1.5, `${kq.dong[0].cong} công`);
  kt('Thông báo đã HUỶ không tính vào ngày công',
     !kq.dong.some(r => r.gv.id === g2.id));
  kt("Trạng thái 'cho' lẫn 'xong' đều tính — nghỉ là chuyện đã xảy ra",
     kq.dong[0].dem.S === 1 && kq.dong[0].dem.CN === 1);
  kt('Hồ sơ trỏ về giáo viên không còn tồn tại thì bỏ qua, không văng lỗi',
     kq.dong.every(r => r.gv));
  kt('Đếm được người đủ công để ghi chú cuối bảng',
     kq.duCong === u.S.giaoVien.length - 1, `${kq.duCong} người đủ công`);
  kt('Số công viết kiểu Việt — 0,5 chứ không 0.5',
     u.soCong(0.5) === '0,5' && u.soCong(2) === '2' && u.soCong(1.5) === '1,5');
  kt('Sắp theo họ tên như danh sách nhà trường, không theo số công', (() => {
    u.S.baoNghi.push({id:'f', gvId:g2.id, ngay:'2026-09-14', buoi:'S',
      lyDo:'Nghỉ ốm', trangThai:'cho'});
    const hai = u.tongHopNgayCong('2026-09');
    const ten = hai.dong.map(r => r.gv.hoTen);
    return ten.join('|') === [...ten].sort((a,b)=>a.localeCompare(b,'vi')).join('|');
  })());
  kt('Tháng không ai nghỉ thì bảng rỗng và cả trường đủ công', (() => {
    const trong = u.tongHopNgayCong('2026-11');
    return trong.dong.length === 0 && trong.duCong === u.S.giaoVien.length;
  })());
  kt('Đơn chồng lấn — buổi sáng rồi CẢ NGÀY cùng một ngày — vẫn 1 công, không phải 1,5', (() => {
    /* Sáng gửi "nghỉ buổi sáng", trưa thấy chưa đỡ gửi tiếp "nghỉ cả ngày":
       máy chủ có HAI dòng cho cùng một ngày. Đếm từng dòng độc lập là bảng
       báo cáo nộp hằng tháng ghi 1,5 công cho một ngày nghỉ thật sự 1 công. */
    const u2 = taoUngDung(documentGia);
    const g = u2.S.giaoVien[0];
    u2.S.baoNghi = [
      {id:'a', gvId:g.id, ngay:'2026-09-15', buoi:'S',  lyDo:'Nghỉ ốm', trangThai:'cho'},
      {id:'b', gvId:g.id, ngay:'2026-09-15', buoi:'CN', lyDo:'Nghỉ ốm', trangThai:'xong'}];
    const r = u2.tongHopNgayCong('2026-09');
    return r.dong[0].cong === 1 && r.dong[0].dem.CN === 1 && r.dong[0].dem.S === 0;
  })());
}

console.log('\n18b2. Vân tay dữ liệu nguồn phủ các cột thêm sau');
{
  /* Sự cố 2/8/2026 tái phát trên cột mới: sửa Gmail, khung giờ hay số tiết
     chuẩn của môn mà vân tay không đổi thì dải đỏ "chưa lưu" không hiện,
     beforeunload không chặn, tải lại trang là mất ÂM THẦM. */
  const u = taoUngDung(documentGia);
  const doi = lam => { const truoc = u.vanTayNguon(); lam(); return u.vanTayNguon() !== truoc; };
  kt('Bật tắt cho-xếp-liền của một môn là vân tay ĐỔI', doi(() => {
  u.S.monHoc[0].lienTiet = u.S.monHoc[0].lienTiet === false;
}), 'cột thêm 31/8/2026 — bỏ sót là tích xong tải lại trang mất âm thầm');
kt('Sửa Gmail giáo viên là vân tay đổi', doi(() => { u.S.giaoVien[0].email = 'a@b.vn'; }));
  kt('Sửa điện thoại · ghi chú · phân hiệu chính · mã GV là vân tay đổi',
     doi(() => { u.S.giaoVien[0].dienThoai = '0987'; })
     && doi(() => { u.S.giaoVien[0].ghiChu = 'ghi chú thử'; })
     && doi(() => { u.S.giaoVien[0].dtChinh = 'dt-thu'; })
     && doi(() => { u.S.giaoVien[0].maGV = 'Ma_Thu'; }));
  kt('Sửa số tiết một buổi trong khung giờ là vân tay đổi',
     doi(() => { u.S.khungGio[0].tiet = 9; }));
  kt('Bật tắt một buổi là vân tay đổi',
     doi(() => { u.S.khungGio[1].bat = u.S.khungGio[1].bat === false; }));
  kt('Sửa số tiết chuẩn hay màu của một môn là vân tay đổi',
     doi(() => { (u.S.monHoc[0].chuan ||= {})[1] = 99; })
     && doi(() => { u.S.monHoc[0].mau = '#123456'; }));
}

console.log('\n18c. Lớp còn thiếu tiết MÔN NÀO');
{
  /* "24/27 tiết" cho biết CÓ thiếu; cái tên môn mới cho biết phải đi tìm ai. */
  const u = taoUngDung(documentGia);
  u.xepTuDong(0);
  const lp = u.S.lop[0].id;
  kt('Xếp đủ thì không báo thiếu gì', u.thieuMonLop(lp).length === 0);
  kt('Bỏ hai tiết của một môn thì báo đúng môn ấy, đúng số tiết', ...((() => {
    const o = u.S.tkb[lp];
    const khoa = Object.keys(o);
    const mon = o[khoa[0]].mon;
    /* Bỏ tối đa hai tiết CÙNG MỘT MÔN để số tiết thiếu đếm được chắc chắn */
    const bo = khoa.filter(k => o[k].mon === mon).slice(0, 2);
    bo.forEach(k => delete o[k]);
    const ds = u.thieuMonLop(lp);
    return [ds.length === 1 && ds[0].mon === mon && ds[0].thieu === bo.length,
      u.chuThieuMon(ds)];
  })()));
  kt('Nhiều môn thiếu thì môn thiếu NHIỀU NHẤT đứng trước', ...((() => {
    const o = u.S.tkb[lp];
    const con = Object.keys(o);
    /* Bỏ thêm đúng một tiết của một môn khác */
    const monKhac = con.map(k => o[k].mon).find(m => !u.thieuMonLop(lp).some(x => x.mon === m));
    delete o[con.find(k => o[k].mon === monKhac)];
    const ds = u.thieuMonLop(lp);
    return [ds.length === 2 && ds[0].thieu >= ds[1].thieu, u.chuThieuMon(ds)];
  })()));
  kt('Lớp không có dòng phân công nào thì không báo bừa',
     u.thieuMonLop('khong-ton-tai').length === 0);
  kt('Câu chữ đọc được ngay: "Tiếng Anh 1, Âm nhạc 1"',
     u.chuThieuMon([{mon:'Tiếng Anh',thieu:1},{mon:'Âm nhạc',thieu:1}])
       === 'Tiếng Anh 1, Âm nhạc 1');
}

console.log('\n18d. Vì sao còn tiết chưa xếp — và phải làm gì');
{
  /* ⚠️ Trường thật xếp trọn 710/710 nên `chuaXep` LUÔN RỖNG — mã chẩn đoán
     không chạy lần nào nếu chỉ dựa vào bộ dữ liệu vàng. Phải dựng đúng từng
     cảnh thiếu tiết, mỗi cảnh một nguyên nhân khác nhau. */

  /* Cảnh 1: giáo viên bộ môn đăng ký bận gần hết tuần */
  kt('Vướng BUỔI BẬN thì chỉ đúng mục Buổi bận, và nói gỡ ra được mấy ô',
     ...((() => {
    const u = taoUngDung(documentGia);
    /* Cô Mỹ thuật dạy cả 25 lớp — bận gần hết tuần là chắc chắn thiếu chỗ */
    const mt = u.S.phanCong.find(p => p.mon === 'Mỹ thuật');
    u.S.gvNghi[mt.gvId] = u.buoiBat().slice(0, 7).map(k => `${k.thu}-${k.buoi}`);
    const k = u.xepTuDong(0);
    if (!k.chuaXep.length) return [false, 'dựng cảnh hỏng: vẫn xếp đủ'];
    const v = u.viecGoBiXep(k.chuaXep);
    const bn = v.find(x => x.ma === 'gvNghi');
    return [!!bn && bn.di === 'buoiban' && bn.so > 0 && /Buổi bận/.test(bn.lam),
            bn ? `${bn.viec} → ${bn.lam}`.slice(0, 110) : 'không nhận ra buổi bận'];
  })()));

  /* Cảnh 2: khung giờ bị bóp nhỏ hơn số tiết phải xếp */
  kt('Lưới lớp không đủ ô thì chỉ sang Khối và khung giờ', ...((() => {
    const u = taoUngDung(documentGia);
    /* Cắt mỗi buổi còn 2 tiết — tổng ô tụt hẳn dưới số tiết cần */
    u.S.khungGio.forEach(k => { [1,2,3,4,5].forEach(x => k.tietKhoi[x] = 2); });
    u.chuanKhungGio();
    const k = u.xepTuDong(0);
    if (!k.chuaXep.length) return [false, 'dựng cảnh hỏng: vẫn xếp đủ'];
    const v = u.viecGoBiXep(k.chuaXep);
    return [v.some(x => x.di === 'khunggio' || x.ma === 'lopKin'),
            v[0] ? `${v[0].viec}`.slice(0, 100) : 'không có việc nào'];
  })()));

  /* ⚠️ Phép thử QUAN TRỌNG NHẤT của mục này. Bảng NHOM_CHAN gom câu chữ
     của `datDuoc()` về nhóm — đó là chỗ DUY NHẤT phụ thuộc vào lời văn của
     hàm ấy. Sửa một chữ trong `datDuoc()` mà quên sửa bảng thì mọi lý do
     lặng lẽ rơi vào "khác", và người dùng nhận một câu vô nghĩa thay vì
     đường đi. Phép thử này đi hết mọi cảnh chặn và đòi không câu nào lọt. */
  kt('MỌI câu lý do của datDuoc() đều rơi vào một nhóm, không câu nào lọt',
     ...((() => {
    const u = taoUngDung(documentGia);
    /* ⚠️ Bản đầu của phép thử này quét trên lưới ĐÃ XẾP ĐẦY, nên `datDuoc()`
       dừng ngay ở dòng đầu — "Lớp đã có tiết khác" — và 5832 câu nó soi được
       thật ra chỉ là một câu lặp lại. Đổi câu chữ của bốn nhánh dưới mà phép
       thử vẫn xanh. Nay dựng lưới TRỐNG để mọi nhánh lộ ra, và đòi ĐỦ SÁU
       nhóm cùng xuất hiện — không nhóm nào được im lặng. */
    u.S.diemTruong.push({ id:'dt2', ten:'Phân hiệu Thử', phongTin:false });
    u.S.lop.slice(0, 5).forEach(l => { u.S.lopDT[l.id] = 'dt2'; });
    u.S.phong = [{ id:'p1', dtId:u.S.diemTruong[0].id, ten:'Phòng máy', mon:'Tin học' }];
    u.xepTuDong(0);
    /* Chụp bảng tra của lưới ĐÃ xếp (để còn "giáo viên đang dạy lớp…" và
       "đang dạy ở phân hiệu khác"), rồi mới dọn lưới đi để nhánh "lớp đã có
       tiết" thôi che mất năm nhánh sau. */
    const cs = u.chiSo();
    u.S.lop.forEach(l => { u.S.tkb[l.id] = {}; });
    const gvBan = u.S.giaoVien.find(g => cs.gvBan[g.id]);
    u.S.gvNghi[u.S.giaoVien[0].id] = u.buoiBat().map(k => `${k.thu}-${k.buoi}`);

    const cauLa = new Set(), thay = new Set();
    let tong = 0;
    u.S.lop.forEach(l => {
      u.oTuanLop(l.id).forEach(o => {
        u.S.giaoVien.forEach(g => {
          ['Toán', 'Tin học'].forEach(m => {
            const ly = u.datDuoc(o, l.id, g.id, cs, m);
            if (!ly) return;
            tong++;
            const n = u.NHOM_CHAN.find(x => x.hop(ly));
            if (n) thay.add(n.ma); else cauLa.add(ly.slice(0, 60));
          });
        });
      });
    });
    /* Nhánh "lớp đã có tiết" chỉ lộ khi lưới còn nguyên — soi riêng một ô */
    u.xepTuDong(0);
    const oCo = u.oTuanLop(u.S.lop[0].id).find(o => u.S.tkb[u.S.lop[0].id][o.khoa]);
    const lyLop = oCo ? u.datDuoc(oCo, u.S.lop[0].id, u.S.giaoVien[1].id, u.chiSo(), 'Toán') : '';
    const nLop = u.NHOM_CHAN.find(x => x.hop(lyLop || ''));
    if (nLop) thay.add(nLop.ma); else if (lyLop) cauLa.add(lyLop.slice(0, 60));

    const thieu = u.NHOM_CHAN.map(n => n.ma).filter(m => !thay.has(m));
    return [cauLa.size === 0 && thieu.length === 0 && tong > 100,
            `soi ${tong} câu · gặp đủ ${thay.size}/${u.NHOM_CHAN.length} nhóm`
            + (thieu.length ? ` — CHƯA KIỂM: ${thieu.join(', ')}` : '')
            + (cauLa.size ? ` — LỌT: ${[...cauLa].join(' | ')}` : '')];
  })()));

  /* Gom theo CÁCH GỠ: ba người cùng vướng một kiểu là MỘT việc, không phải ba */
  kt('Nhiều trường hợp cùng cách gỡ thì gom làm MỘT việc', ...((() => {
    const u = taoUngDung(documentGia);
    u.S.khungGio.forEach(k => { [1,2,3,4,5].forEach(x => k.tietKhoi[x] = 2); });
    u.chuanKhungGio();
    const k = u.xepTuDong(0);
    const v = u.viecGoBiXep(k.chuaXep);
    const tongTH = v.reduce((s, x) => s + x.soTruongHop, 0);
    return [v.length > 0 && v.length < k.chuaXep.length && tongTH === k.chuaXep.length,
            `${k.chuaXep.length} trường hợp gom còn ${v.length} việc`];
  })()));

  /* Sắp theo số tiết gỡ được — việc gỡ được nhiều tiết nhất đứng trước.
     ⚠️ Bản đầu dựng cảnh chỉ ra MỘT việc, mà một phần tử thì thứ tự nào
     cũng đúng: đảo chiều `sort` phép thử vẫn xanh. Nay ép ra ÍT NHẤT HAI
     việc khác nhau (vừa bóp khung giờ vừa cho một cô bận cả tuần) và đòi
     đúng thứ tự giảm dần. */
  kt('Việc gỡ được NHIỀU TIẾT nhất đứng trước', ...((() => {
    const u = taoUngDung(documentGia);
    /* ⚠️ Bóp khung giờ làm MỌI lớp kín, nên mọi trường hợp đều rơi vào một
       nhóm "lớp đã kín lưới" — vẫn chỉ một việc. Phải dựng hai nguyên nhân
       THUỘC HAI NHÓM khác nhau mà lớp vẫn còn ô trống: một cô bận cả tuần
       (gvNghi) và một cô phải chạy hai phân hiệu (khacDT). */
    u.S.diemTruong.push({ id:'dt2', ten:'Phân hiệu Thử', phongTin:false });
    u.S.lop.slice(0, 8).forEach(l => { u.S.lopDT[l.id] = 'dt2'; });
    const mt = u.S.phanCong.find(p => p.mon === 'Mỹ thuật');
    const dd = u.S.phanCong.find(p => p.mon === 'Đạo Đức' && p.gvId !== mt.gvId);
    u.S.gvNghi[mt.gvId] = u.buoiBat().slice(0, 6).map(k => `${k.thu}-${k.buoi}`);
    if (dd) u.S.gvNghi[dd.gvId] = u.buoiBat().slice(0, 3).map(k => `${k.thu}-${k.buoi}`);
    const v = u.viecGoBiXep(u.xepTuDong(0).chuaXep);
    const dungThuTu = v.every((x, i) => i === 0 || v[i-1].tiet >= x.tiet);
    return [v.length >= 2 && dungThuTu,
            v.map(x => `${x.nhomTen}:${x.tiet}t`).join(' · ').slice(0, 110)];
  })()));

  kt('Xếp đủ thì KHÔNG bày việc nào — đừng báo tin về thứ chưa xảy ra',
     ...((() => {
    const u = taoUngDung(documentGia);
    const k = u.xepTuDong(0);
    return [k.chuaXep.length === 0 && u.viecGoBiXep(k.chuaXep).length === 0,
            `${k.daXep}/${k.tongCan} tiết`];
  })()));

  kt('Danh sách rỗng hay hỏng dữ liệu thì trả rỗng, không nổ', ...((() => {
    const u = taoUngDung(documentGia);
    return [u.viecGoBiXep([]).length === 0 && u.viecGoBiXep(null).length === 0
      && u.viSaoChuaXep({ gvId:'khong-co', lopId:'khong-co', mon:'Toán', con:1 }) === null];
  })()));
}

console.log('\n18e. Mức tín hiệu thứ ba khi chỉnh tay — chạm giáo viên liên lớp');
{
  const u = taoUngDung(documentGia);
  u.xepTuDong(0);

  kt('Chủ nhiệm dạy đúng một lớp thì KHÔNG phải giáo viên liên lớp',
     ...((() => {
    const lop = u.S.lop[0];
    const cn = u.cnCuaLop(lop.id);
    const soLop = new Set(u.S.phanCong.filter(p => p.gvId === cn.id).map(p => p.lopId)).size;
    return [soLop === 1 && u.laGVLienLop(cn.id) === false,
            `${cn.hoTen} dạy ${soLop} lớp`];
  })()));

  kt('Giáo viên bộ môn dạy nhiều lớp thì LÀ liên lớp', ...((() => {
    const mt = u.S.phanCong.find(p => p.mon === 'Mỹ thuật');
    const soLop = new Set(u.S.phanCong.filter(p => p.gvId === mt.gvId).map(p => p.lopId)).size;
    return [soLop > 1 && u.laGVLienLop(mt.gvId) === true,
            `${u.gvId(mt.gvId).hoTen} dạy ${soLop} lớp`];
  })()));

  /* ⚠️ `chamGVKhac()` cố ý KHÔNG tự kiểm ràng buộc cứng — đó là việc của
     `kiemTraChuyen()`, và màn hình gọi hai hàm theo đúng thứ tự: vướng
     cứng thì tô MỜ, qua được rồi mới xét có chạm ai không. Phép thử cho
     phần giao diện ấy nằm ở `npm run soi` mục 17u, vì `kiemTraChuyen()`
     nằm ngoài bốn vùng mã thuần. Ở đây chỉ canh phần dữ liệu. */
  kt('Có ô chạm giáo viên liên lớp thật trên lưới đã xếp', ...((() => {
    const lop = u.S.lop.find(l => Object.keys(u.S.tkb[l.id] || {}).length > 5);
    let vang = 0, tong = 0;
    Object.keys(u.S.tkb[lop.id]).forEach(k => {
      tong++;
      if (u.chamGVKhac(lop.id, k)) vang++;
    });
    /* Lớp tiểu học: chủ nhiệm dạy phần lớn tiết, bộ môn chỉ vài tiết —
       nên phải CÓ ô vàng, nhưng không được vàng cả lớp. */
    return [vang > 0 && vang < tong,
            `lớp ${lop.ten}: ${vang}/${tong} tiết là của giáo viên liên lớp`];
  })()));

  /* Đổi hai tiết mà cả hai đều của chính chủ nhiệm — đúng cảnh chủ dự án
     nêu: "cô A đưa Toán lên tiết 1, đẩy GDTC xuống tiết 4" */
  kt('Đổi hai tiết cùng của chủ nhiệm thì KHÔNG chạm ai — ô xanh', ...((() => {
    const lop = u.S.lop[0];
    const cn = u.cnCuaLop(lop.id);
    const o = u.S.tkb[lop.id];
    const cuaCN = Object.keys(o).filter(k => o[k].gvId === cn.id);
    if (cuaCN.length < 2) return [false, 'chủ nhiệm không có đủ hai tiết'];
    return [u.chamGVKhac(lop.id, cuaCN[1]) === null,
            `${o[cuaCN[0]].mon} ↔ ${o[cuaCN[1]].mon}, cùng ${cn.hoTen}`];
  })()));

  kt('Chạm tiết của giáo viên bộ môn thì nói rõ TÊN và số lớp', ...((() => {
    const mt = u.S.phanCong.find(p => p.mon === 'Mỹ thuật');
    let thay = null;
    for (const l of u.S.lop) {
      const o = u.S.tkb[l.id] || {};
      const k = Object.keys(o).find(x => o[x].gvId === mt.gvId);
      if (k) { thay = u.chamGVKhac(l.id, k); break; }
    }
    return [!!thay && thay.hoTen === u.gvId(mt.gvId).hoTen && thay.soLop > 1 && !!thay.mon,
            thay ? `${thay.hoTen} · ${thay.mon} · ${thay.soLop} lớp` : 'không tìm thấy'];
  })()));

  kt('Ô trống không chạm ai', ...((() => {
    const lop = u.S.lop[0];
    const trong = u.oTuan(lop.khoi).find(x => !u.S.tkb[lop.id][x.khoa]);
    return [!trong || u.chamGVKhac(lop.id, trong.khoa) === null,
            trong ? 'có ô trống để soi' : 'lớp kín, bỏ qua'];
  })()));
}

console.log('\n18f. Cố định môn vào giờ trước khi xếp');
{
  /* Chủ dự án: "Có môn cần được cố định TRƯỚC khi xếp tự động … HĐTN phải
     luôn đầu tuần thứ Hai tiết 1. Tiếng Anh tăng cường do trường phối hợp
     trung tâm phải dạy cố định chiều thứ Năm." Quy trình ông vẫn làm: cố
     định vài môn → Xếp → ưng chỗ nào thì ghim → Xếp lại cho tối ưu. */
  const sach = () => { S.lop.forEach(l => S.tkb[l.id] = {}); };

  sach();
  const dsHDTN = S.lop.filter(l => S.phanCong.some(p => p.lopId === l.id && p.mon === 'HDTN'))
                      .map(l => l.id);
  const r1 = datCoDinh(dsHDTN, 'HDTN', '2-S-0');
  kt('Cố định HĐTN thứ Hai tiết 1 cho mọi lớp có môn ấy',
     [r1.dat.length === dsHDTN.length && r1.bo.length === 0,
      `${r1.dat.length}/${dsHDTN.length} lớp`]);

  kt('Tiết cố định mang dấu ghim — chính là thứ xepTuDong() giữ nguyên',
     dsHDTN.every(id => S.tkb[id]['2-S-0']?.ghim === true
                     && S.tkb[id]['2-S-0'].mon === 'HDTN'));

  /* ⚠️ Đây là điều quan trọng nhất: "không có môn khác chen vào khi xếp
     tự động". Xếp xong phải còn nguyên từng ô, cả môn lẫn người dạy. */
  const truoc = Object.fromEntries(dsHDTN.map(id => [id, { ...S.tkb[id]['2-S-0'] }]));
  const kq = xepTuDong();
  kt('Xếp tự động KHÔNG đè lên ô đã cố định',
     [dsHDTN.every(id => {
        const o = S.tkb[id]['2-S-0'];
        return o && o.mon === truoc[id].mon && o.gvId === truoc[id].gvId && o.ghim;
      }), `${kq.daXep}/${kq.tongCan} tiết`]);

  kt('Cố định xong vẫn xếp trọn vẹn, không mất tiết nào',
     [kq.daXep === kq.tongCan, `${kq.daXep}/${kq.tongCan}`]);

  /* Lớp không học môn ấy thì bỏ qua và NÓI RÕ — đừng lặng lẽ tạo ra một
     tiết mà bảng phân công không hề có. */
  sach();
  const monHiem = 'Tin học';
  const dsTat = S.lop.map(l => l.id);
  const r2 = datCoDinh(dsTat, monHiem, '3-S-1');
  kt('Lớp không học môn ấy thì bỏ qua, kèm lý do đọc được',
     [r2.bo.some(x => /không học môn/.test(x.vi))
      && r2.dat.every(id => S.phanCong.some(p => p.mon === monHiem)),
      `${r2.dat.length} đặt · ${r2.bo.length} bỏ`]);

  /* ⚠️ Ràng buộc cứng số 1 vẫn nguyên hiệu lực: một giáo viên không dạy hai
     lớp cùng giờ. Cô Mỹ thuật dạy hàng chục lớp — cố định cả loạt vào MỘT ô
     thì chỉ một lớp đặt được, phần còn lại phải bị từ chối chứ không được
     đặt bừa rồi để lưới sai. */
  sach();
  const gvNhieu = S.giaoVien
    .map(g => ({ g, ds: S.phanCong.filter(p => p.gvId === g.id && p.mon === 'Mỹ thuật') }))
    .sort((a, b) => b.ds.length - a.ds.length)[0];
  if (gvNhieu && gvNhieu.ds.length > 2) {
    const r3 = datCoDinh(gvNhieu.ds.map(p => p.lopId), 'Mỹ thuật', '3-S-2');
    kt('Một giáo viên không bị cố định vào hai lớp cùng một ô',
       [r3.dat.length === 1 && r3.bo.every(x => /Giáo viên đang dạy/.test(x.vi)),
        `${r3.dat.length} đặt · ${r3.bo.length} bỏ vì trùng giờ giáo viên`]);
  }

  /* Môn hai tiết mà cố định ba ô là tự tay tạo ra tiết thừa. */
  sach();
  const lopH = dsHDTN[0];
  const soTietH = S.phanCong.find(p => p.lopId === lopH && p.mon === 'HDTN').soTiet;
  const oTrong = oTuanLop(lopH).map(o => o.khoa);
  let datDuocBaoNhieu = 0;
  for (const k of oTrong.slice(0, soTietH + 3))
    datDuocBaoNhieu += datCoDinh([lopH], 'HDTN', k).dat.length;
  kt('Không cố định quá số tiết đã phân công',
     [datDuocBaoNhieu === soTietH, `${datDuocBaoNhieu} tiết / phân công ${soTietH}`]);

  /* Gom lý do: mười lớp cùng vướng một chuyện là MỘT dòng, không phải mười. */
  const gom = gomLyDoCoDinh([{ lop: '1A', vi: 'không học môn này' },
                             { lop: '1B', vi: 'không học môn này' },
                             { lop: '2A', vi: 'khối 2 không học giờ này' }]);
  kt('Gom lý do bỏ qua, nhiều lớp cùng một chuyện gộp thành một dòng',
     [gom.length === 2 && gom[0].n === 2 && gom[0].vi === 'không học môn này',
      gom.map(x => `${x.n} lớp ${x.vi}`).join(' · ')]);

  sach();

  /* ---------- LỖI DO AGENT KIỂM THỬ TÌM RA (31/8/2026) ----------
     (Ba phép thử về tiền tố phân hiệu nằm ở `npm run soi` — `goiYTienTo()`
     thuộc vùng giao diện, bộ soi này không nạp tới.) */

  /* ⚠️ LỖI 2: dòng xem trước của hộp *Cố định môn vào giờ* chỉ soi ba điều
     kiện dễ, bỏ qua ràng buộc cứng "một giáo viên không dạy hai lớp cùng
     giờ" — mà đó chính là thứ `datCoDinh()` dùng để từ chối. Đo được: hộp
     hứa 12 lớp, đặt được 1. Nay xem trước chạy thử thật rồi hoàn lại lưới,
     nên con số phải TRÙNG KHÍT. */
  kt('Xem trước và kết quả thật của Cố định môn phải trùng khít', (() => {
    const v = taoUngDung(documentGia);
    v.S.lop.forEach(l => v.S.tkb[l.id] = {});
    /* Chọn môn mà MỘT giáo viên dạy nhiều lớp — đó là cảnh gây lệch. */
    const gv = v.S.giaoVien
      .map(g => ({ g, ds: v.S.phanCong.filter(p => p.gvId === g.id) }))
      .sort((a, b) => b.ds.length - a.ds.length)[0];
    const mon = gv.ds[0].mon, khoa = '3-S-2';
    const dsId = v.S.lop.map(l => l.id);

    /* "Xem trước" = chạy thử trên bản sao rồi hoàn lại, đúng như hộp làm */
    const luu = JSON.parse(JSON.stringify(v.S.tkb));
    const thu = v.datCoDinh(dsId, mon, khoa);
    v.S.tkb = luu;
    /* Rồi đặt thật */
    const that = v.datCoDinh(dsId, mon, khoa);
    return [thu.dat.length === that.dat.length && thu.bo.length === that.bo.length,
            `xem trước ${thu.dat.length} · thật ${that.dat.length} (môn ${mon})`];
  })());

  kt('Chạy thử trên bản sao KHÔNG để lại dấu vết trên lưới', (() => {
    const v = taoUngDung(documentGia);
    v.S.lop.forEach(l => v.S.tkb[l.id] = {});
    const truoc = JSON.stringify(v.S.tkb);
    const luu = JSON.parse(truoc);
    v.datCoDinh(v.S.lop.map(l => l.id), 'HDTN', '2-S-0');
    v.S.tkb = luu;
    return [JSON.stringify(v.S.tkb) === truoc, 'lưới nguyên vẹn'];
  })());

  kt('datCoDinh trả kèm id lớp đặt được — xem trước cần id, không phải tên', (() => {
    const v = taoUngDung(documentGia);
    v.S.lop.forEach(l => v.S.tkb[l.id] = {});
    const r = v.datCoDinh(v.S.lop.map(l => l.id), 'HDTN', '2-S-0');
    return [Array.isArray(r.datId) && r.datId.length === r.dat.length
            && r.datId.every(id => !!v.lopId(id))
            && r.bo.every(x => !!x.id),
            `${r.datId.length} id`];
  })());

  /* Câu báo: một nhóm lý do thì đừng nhắc con số hai lần. */
  kt('Lý do bỏ qua hạ chữ đầu, không lạc chữ hoa giữa câu', (() => {
    const g = gomLyDoCoDinh([{ lop: '1A', vi: 'Giáo viên đang dạy lớp 2B' },
                             { lop: '1B', vi: 'Giáo viên đang dạy lớp 2B' }]);
    return [g[0].vi === 'giáo viên đang dạy lớp 2B' && g[0].n === 2, g[0].vi];
  })());

}

console.log('\n18g. Mã lớp lệch tên lớp — không đoán bừa');
{
  /* ⚠️ ĐÃ ĂN THẬT ở Vinh Hưng 1 ngày 30/8/2026. Trường tạo lớp bằng dãy chữ
     cái mặc định (A…H, có F) rồi SỬA TÊN tay thành A B C D E G H I, nên mã
     và tên lệch nhau đúng một bậc: lớp mã `1G` mang tên `1H`, lớp mã `1H`
     mang tên `1I`.

     Tệp Excel ghi "1H" → tra theo MÃ thì trúng lớp mã 1H, mà lớp ấy tên là
     1I. Tệp ghi "1I" → không mã nào khớp, tra theo TÊN cũng ra đúng lớp ấy.
     Hai giáo viên khác nhau cùng đổ vào một lớp, còn lớp tên 1G không ai
     dạy. Màn hình chỉ thấy "mấy lần lớp I" — không ai đoán ra vì sao. */
  const khoLech = { lop: [
    { id: 'x1', maLop: '1F', ten: '1G', khoi: 1 },
    { id: 'x2', maLop: '1G', ten: '1H', khoi: 1 },
    { id: 'x3', maLop: '1H', ten: '1I', khoi: 1 },
  ]};

  kt('Chuỗi vừa là mã lớp này vừa là tên lớp kia thì DỪNG, không đoán', (() => {
    const r = timLopNhap(khoLech, '1H');
    return [!r.lop && /lệch/.test(r.loi || ''), r.loi || `đã gán vào lớp tên ${r.lop?.ten}`];
  })());

  kt('Câu lỗi chỉ đúng đường chữa, không bắt người dùng tự mò', (() => {
    const r = timLopNhap(khoLech, '1G');
    return [/Đặt lại mã lớp/.test(r.loi || ''), (r.loi || '').slice(0, 90)];
  })());

  /* Chuỗi chỉ khớp TÊN, không trùng mã của ai — vẫn phải nhận bình thường.
     Nhà trường quen gọi "1A" hơn "1A_ND", đó là cả lý do có mức tra theo tên. */
  kt('Chỉ khớp tên, không đụng mã ai thì vẫn nhận', (() => {
    const r = timLopNhap(khoLech, '1I');
    return [r.lop?.maLop === '1H', r.lop ? `→ lớp mã ${r.lop.maLop}` : r.loi];
  })());

  /* Trường bình thường — mã và tên trùng nhau — phải chạy y như cũ. */
  kt('Mã trùng tên như mọi trường bình thường thì không báo gì', (() => {
    const kho = { lop: [{ id: 'a', maLop: '1A', ten: '1A', khoi: 1 },
                        { id: 'b', maLop: '1B', ten: '1B', khoi: 1 }] };
    const r = timLopNhap(kho, '1A');
    return [r.lop?.id === 'a' && !r.loi, r.lop ? 'nhận đúng 1A' : r.loi];
  })());

  /* ⚠️ BẢN VÁ ĐẦU BẮT OAN ở đúng cảnh này, và bộ soi nhập liệu bắt được
     ngay: lớp mã `1A` mang tên `1A` thì tra theo mã là CHÍNH XÁC NHẤT, kể
     cả khi một lớp khác cũng tên `1A`. Mâu thuẫn chỉ có khi lớp trúng theo
     mã lại mang tên khác. Thêm hàng rào thì phải soi cả chiều bắt oan. */
  kt('Mã trùng tên chính nó thì nhận, dù lớp khác cũng mang tên ấy', (() => {
    const kho = { lop: [{ id: 'p', maLop: '1A', ten: '1A', khoi: 1 },
                        { id: 'q', maLop: '1A_TT', ten: '1A', khoi: 1 }] };
    const r = timLopNhap(kho, '1A');
    return [r.lop?.id === 'p' && !r.loi, r.lop ? `→ lớp mã ${r.lop.maLop}` : r.loi];
  })());

  /* Hai phân hiệu cùng có lớp tên 1A là chuyện thường sau sáp nhập — mã khác
     nhau nên không mâu thuẫn, và tra theo mã vẫn phải trúng. */
  kt('Hai phân hiệu cùng tên lớp nhưng khác mã thì không nhầm là lệch', (() => {
    const kho = { lop: [{ id: 'a', maLop: '1A_DL', ten: '1A', khoi: 1 },
                        { id: 'b', maLop: '1A_DD', ten: '1A', khoi: 1 }] };
    const r = timLopNhap(kho, '1A_DD');
    return [r.lop?.id === 'b' && !r.loi, r.lop ? 'nhận đúng 1A_DD' : r.loi];
  })());
}

console.log('\n18h. Dịch lỗi máy chủ — đừng gộp ba chuyện làm một');
{
  /* ⚠️ ĐÃ TRẢ GIÁ THẬT 31/8/2026. Vinh Hưng 1 bấm Lưu và nhận "Tài khoản
     không có quyền làm việc này" — cả buổi đi soi quy tắc RLS, thêm hẳn một
     tệp SQL mở quyền ghi cho chủ hệ thống, chạy đủ bộ kiểm quy tắc... trong
     khi lỗi thật là TRÙNG MÃ LỚP. Gốc: một regex bắt luôn chữ `violates`,
     mà Postgres dùng đúng chữ ấy cho ba chuyện khác hẳn nhau.

     Câu báo sai hướng còn tốn thời gian hơn không có câu báo nào. */

  kt('Trùng mã KHÔNG bị dịch thành lỗi quyền', (() => {
    const t = dienGiaiLoi(new Error(
      'duplicate key value violates unique constraint "ux_lop_truong_ma"'));
    return [/[Tt]rùng mã/.test(t) && !/không có quyền/.test(t), t.slice(0, 80)];
  })());

  kt('Câu báo trùng mã chỉ rõ giá trị nào đang đụng', (() => {
    const t = dienGiaiLoi(new Error(
      'duplicate key value violates unique constraint "ux_lop_truong_ma" '
      + 'DETAIL: Key (truong_id, ma_lop)=(a7d83f20-20f3-4863-8fee-041aa558d718, 2G) already exists.'));
    return [/2G/.test(t), t.slice(0, 110)];
  })());

  kt('Trỏ vào dòng đã xoá KHÔNG bị dịch thành lỗi quyền', (() => {
    const t = dienGiaiLoi(new Error(
      'insert or update on table "lop" violates foreign key constraint "lop_gvcn_id_fkey"'));
    return [/đã bị xoá/.test(t) && !/không có quyền/.test(t), t.slice(0, 80)];
  })());

  kt('Ô bắt buộc bỏ trống KHÔNG bị dịch thành lỗi quyền', (() => {
    const t = dienGiaiLoi(new Error(
      'null value in column "ten" violates not-null constraint'));
    return [!/không có quyền/.test(t) && /bắt buộc/.test(t), t.slice(0, 80)];
  })());

  /* Nhưng lỗi quyền THẬT thì vẫn phải nói đúng là lỗi quyền. */
  kt('Lỗi quyền thật vẫn được gọi đúng tên', (() => {
    const a = dienGiaiLoi(new Error('permission denied for table lop'));
    const b = dienGiaiLoi(new Error(
      'new row violates row-level security policy for table "lop"'));
    return [/không có quyền/.test(a) && /không có quyền/.test(b), a.slice(0, 60)];
  })());
}

console.log('\n18i. Thứ tự đọc danh sách giáo viên');
{
  /* Chủ dự án đề xuất 31/8/2026: "danh sách giáo viên nên sắp xếp theo lớp
     chủ nhiệm trước, sau đó đến giáo viên bộ môn giống như phân công, và
     mẫu tải về cũng xếp theo thứ tự này."

     Trước đó bảng Giáo viên sắp theo số tiết giảm dần, còn bảng Phân công
     sắp theo lớp chủ nhiệm — hai bảng bày CÙNG một danh sách theo hai thứ
     tự khác nhau, và tệp Excel tải về lại theo thứ tự thứ ba. */
  const xep = thuTuHangGV();
  const ds = [...S.giaoVien].sort(xep);

  kt('Chủ nhiệm đứng trước, bộ môn đứng sau — không xen kẽ', (() => {
    const laCN = ds.map(g => !!lopCN(g));
    const cat = laCN.indexOf(false);
    return [cat < 0 || !laCN.slice(cat).includes(true),
            `${laCN.filter(Boolean).length} chủ nhiệm rồi tới ${laCN.length - laCN.filter(Boolean).length} bộ môn`];
  })());

  kt('Chủ nhiệm xếp theo thứ tự lớp: 1A 1B 1C… rồi mới sang khối 2', (() => {
    const lop = ds.map(g => lopCN(g)).filter(Boolean).map(l => l.ten);
    const dung = xepTheoKhoi(S.lop.filter(l => S.giaoVien.some(g => lopCN(g)?.id === l.id)))
                   .map(l => l.ten);
    return [String(lop) === String(dung), lop.slice(0, 8).join(' ') + '…'];
  })());

  kt('Giáo viên bộ môn xếp theo họ tên', (() => {
    const bm = ds.filter(g => !lopCN(g)).map(g => g.hoTen);
    const sap = [...bm].sort((x, y) => x.localeCompare(y, 'vi'));
    return [String(bm) === String(sap), bm.slice(0, 3).join(' · ') || '(không có ai)'];
  })());

  /* ⚠️ Mẫu Excel phải theo ĐÚNG thứ tự ấy — tệp tải về xếp khác thứ tự người
     dùng vừa nhìn trên màn hình là bắt họ dò lại từ đầu. */
  kt('Mẫu Excel giáo viên xếp cùng thứ tự với bảng trên màn hình', (() => {
    const hang = MUC_NHAP.giaovien.hang();
    const ten = hang.map(h => h[2]);
    return [String(ten) === String(ds.map(g => g.hoTen)), ten.slice(0, 3).join(' · ')];
  })());

  kt('Mẫu ma trận cũng xếp cùng thứ tự ấy', (() => {
    /* bangMauMaTran() trả {mt, lop, dsMon, …}; `mt` là mảng dòng, dòng đầu
       là tên cột, cột thứ ba là họ tên. */
    const { mt } = bangMauMaTran();
    const ten = mt.slice(1).map(r => r[2]).filter(Boolean);
    return [ten.length > 0 && String(ten) === String(ds.map(g => g.hoTen)),
            ten.slice(0, 3).join(' · ')];
  })());
}

console.log('\n19. Mã giáo viên đọc được');
{
  const u = taoUngDung(documentGia);

  kt('Dạng mã là "tên gọi _ viết tắt họ và đệm"', ...((() => {
    const m = u.maGVTu('Nguyễn Thị Oanh');
    return [m === 'Oanh_NT', m];
  })()));
  kt('Họ đệm dài thì lấy tối đa ba chữ cái đầu', ...((() => {
    const m = u.maGVTu('Nguyễn Thị Kim Oanh');
    return [m === 'Oanh_NTK', m];
  })()));
  kt('GIỮ NGUYÊN DẤU — Thùy và Thủy phải ra hai mã khác nhau', ...((() => {
    const a = u.maGVTu('Nguyễn Thị Thùy'), b = u.maGVTu('Nguyễn Thị Hồng Thủy');
    return [a !== b && /ù/.test(a) && /ủ/.test(b), `${a} ≠ ${b}`];
  })()));
  kt('Tên gõ ở dạng dấu RỜI vẫn ra cùng mã với dạng dựng sẵn', ...((() => {
    const a = u.maGVTu('Nguyễn Thị Oanh');
    const b = u.maGVTu('Nguyễn Thị Oanh'.normalize('NFD'));
    return [a === b, `${a} = ${b}`];
  })()));
  kt('Tên chỉ một từ thì không có hậu tố thừa',
     u.maGVTu('Oanh') === 'Oanh' && u.maGVTu('') === 'GV');

  kt('Mã UUID bị nhận là XẤU, mã tử tế thì không', (() => {
    return u.maGVXau({maGV: '1cc77cb6-df3d-469e-ac36-e4bc2171590f'})
      && u.maGVXau({maGV: ''})
      && !u.maGVXau({maGV: 'Oanh_NT'})
      && !u.maGVXau({maGV: 'GV01'});
  })());
  kt('Mã do chính hàm sinh ra KHÔNG BAO GIỜ tự bị coi là xấu', (() => {
    /* Nếu sai thì mỗi lần nạp dữ liệu app lại báo "vừa đặt lại mã" */
    return u.S.giaoVien.every(g => !u.maGVXau({maGV: u.maGVTu(g.hoTen)}));
  })());

  kt('Đặt lại toàn bộ 35 giáo viên thì mã nào cũng đọc được', ...((() => {
    const n = u.datLaiMaGV(true);
    const xau = u.S.giaoVien.filter(g => u.maGVXau(g));
    return [n > 0 && xau.length === 0, `đổi ${n} mã, còn ${xau.length} mã xấu`];
  })()));
  /* Mã phải ĐÚNG NGAY LÚC KHAI, không phải chữa sau (29/8/2026). Trường mới
     dựng dữ liệu bằng taoDuLieuThu() mà mã vẫn xấu thì việc đầu tiên người
     dùng gặp là một hộp thoại rủ đi đặt lại mã — thứ lẽ ra không bao giờ cần. */
  kt('Bộ sinh dữ liệu thử đặt mã chuẩn ngay, không ai phải đặt lại', ...((() => {
    const v = taoUngDung(documentGia);
    const cu = new Set(v.S.giaoVien.map(g => g.id));   /* 35 hồ sơ của bộ mẫu, không xét */
    v.taoDuLieuThu('Phân hiệu Thử Mã', 'TM', 12, true);
    const moi = v.S.giaoVien.filter(g => !cu.has(g.id));
    const xau = moi.filter(g => v.maGVXau(g));
    const lech = moi.filter(g =>
      g.maGV !== v.maGVTu(g.hoTen) && !new RegExp('^' + v.maGVTu(g.hoTen) + '_\d+$').test(g.maGV));
    return [moi.length > 0 && xau.length === 0 && lech.length === 0,
            `${moi.length} mã mới, ví dụ ${moi[0]?.maGV}`];
  })()));
  kt('Không hai giáo viên nào trùng mã — mã là khoá tự nhiên', ...((() => {
    const ma = u.S.giaoVien.map(g => g.maGV);
    return [new Set(ma).size === ma.length, `${new Set(ma).size}/${ma.length} mã riêng biệt`];
  })()));
  kt('Trùng hệt cả họ tên thì người sau mang hậu tố _2', ...((() => {
    const v = taoUngDung(documentGia);
    v.S.giaoVien = [
      {id: 'a', maGV: '', hoTen: 'Nguyễn Thị Dung', cn: '', dinhMuc: 23},
      {id: 'b', maGV: '', hoTen: 'Nguyễn Thị Dung', cn: '', dinhMuc: 23}];
    v.datLaiMaGV(true);
    const m = v.S.giaoVien.map(g => g.maGV);
    return [m[0] === 'Dung_NT' && m[1] === 'Dung_NT_2', m.join(' · ')];
  })()));
  kt('Bốn cặp trùng TÊN GỌI nằm sát nhau khi sắp theo mã', ...((() => {
    /* Đây là lợi ích chính của việc xếp tên gọi lên trước: nhìn danh sách
       sắp theo mã là thấy ngay các cặp dễ nhầm — đúng thứ R09 cảnh báo. */
    const ma = u.S.giaoVien.map(g => g.maGV).sort((a, b) => a.localeCompare(b, 'vi'));
    const cap = [];
    for (let i = 1; i < ma.length; i++)
      if (ma[i].split('_')[0] === ma[i - 1].split('_')[0]) cap.push(ma[i].split('_')[0]);
    return [cap.length >= 3, cap.join(' · ') || 'không cặp nào'];
  })()));

  kt('CHỐT AN TOÀN: đổi mã KHÔNG đụng phân công, chủ nhiệm hay lưới', ...((() => {
    const v = taoUngDung(documentGia);
    v.xepTuDong(0);
    const truoc = {
      pc: JSON.stringify(v.S.phanCong),
      cn: JSON.stringify(v.S.giaoVien.map(g => [g.id, g.cn])),
      id: JSON.stringify(v.S.giaoVien.map(g => g.id)),
      tiet: v.S.lop.reduce((s, l) => s + Object.keys(v.S.tkb[l.id] || {}).length, 0),
      ten: JSON.stringify(v.S.giaoVien.map(g => g.hoTen))
    };
    v.datLaiMaGV(true);
    const sau = {
      pc: JSON.stringify(v.S.phanCong),
      cn: JSON.stringify(v.S.giaoVien.map(g => [g.id, g.cn])),
      id: JSON.stringify(v.S.giaoVien.map(g => g.id)),
      tiet: v.S.lop.reduce((s, l) => s + Object.keys(v.S.tkb[l.id] || {}).length, 0),
      ten: JSON.stringify(v.S.giaoVien.map(g => g.hoTen))
    };
    const giong = Object.keys(truoc).every(k => truoc[k] === sau[k]);
    return [giong && sau.tiet === 710, `${sau.tiet}/710 tiết, mọi tham chiếu nguyên vẹn`];
  })()));
  kt('Tài khoản đăng nhập đã nối cũng không bị xê dịch', (() => {
    const v = taoUngDung(documentGia);
    v.S.giaoVien[0].nguoiDungId = 'nd-abc';
    v.datLaiMaGV(true);
    return v.S.giaoVien[0].nguoiDungId === 'nd-abc';
  })());

  kt('Chạy tự động lúc nạp CHỈ chữa mã xấu, không đụng mã tử tế sẵn có',
     ...((() => {
       const v = taoUngDung(documentGia);
       v.S.giaoVien[0].maGV = 'GV01';                       /* trường tự đặt, đẹp */
       v.S.giaoVien[1].maGV = '1cc77cb6-df3d-469e-ac36-e4bc2171590f';  /* UUID */
       const n = v.datLaiMaGV();                            /* không truyền tatCa */
       return [v.S.giaoVien[0].maGV === 'GV01'
         && !v.maGVXau(v.S.giaoVien[1]) && n >= 1,
         `giữ GV01, chữa ${n} mã xấu`];
     })()));
  kt('Chạy hai lần liên tiếp thì lần sau không đổi gì nữa — đã hội tụ',
     ...((() => {
       const v = taoUngDung(documentGia);
       v.datLaiMaGV(true);
       const lai = v.datLaiMaGV(true);
       return [lai === 0, `lần hai đổi ${lai} mã`];
     })()));

  kt('Mã lớp vẫn đúng như cũ sau khi tách hàm maXauChuoi dùng chung', (() => {
    const v = taoUngDung(documentGia);
    return v.maXauXi({maLop: '', id: 'lop_1A'}) === true
      && v.maXauXi({maLop: '1A_DL', id: 'x'}) === false
      && v.maXauXi({maLop: '1cc77cb6-df3d-469e-ac36-e4bc2171590f', id: 'x'}) === true;
  })());
  kt('Tệp Excel xuất ra mang mã mới, không còn UUID nào', ...((() => {
    const v = taoUngDung(documentGia);
    v.S.giaoVien[0].maGV = '1cc77cb6-df3d-469e-ac36-e4bc2171590f';
    v.datLaiMaGV(true);
    const hang = v.MUC_NHAP.giaovien.hang();          /* cột 1 là Ma_GV */
    const uuid = hang.filter(h => /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(String(h[1])));
    return [uuid.length === 0, `${hang.length} dòng, 0 mã UUID`];
  })()));
}


/* ==================================================================
   19. TẢI NHẸ CHO GIÁO VIÊN
   ------------------------------------------------------------------
   Giáo viên là nhóm đông nhất và mở app mỗi sáng. Trước 18/8/2026 mọi
   vai trò đều đi qua đúng một đường tải 14 truy vấn `select=*`, đo trên
   trường 40 lớp là 428 KB — trong đó bảng phân công, bảng phòng, buổi
   bận và danh sách tài khoản tải về chỉ để nằm im.

   Bốn điều phải giữ, và đây là chỗ dễ hỏng ngầm nhất: tải thiếu thì
   màn hình vẫn vẽ ra được, chỉ là thiếu dữ liệu — không có lỗi nào nổ.
   ================================================================== */
{
  console.log('\n\x1b[1m19. Tải nhẹ cho giáo viên\x1b[0m');

  /* Máy chủ giả riêng cho mục này: ghi lại MỌI đường dẫn được gọi, để
     đếm được cái gì đã tải và cái gì đã bỏ qua. */
  const dungMayChuGV = ({ coHamNhe = true, gvId = 'g5' } = {}) => {
    const GOI = [];
    const dap = (d, ma = 200) => Promise.resolve({
      ok: ma < 400, status: ma, text: () => Promise.resolve(JSON.stringify(d)) });
    const lop = [{ id: 'L1', ten: '1A', khoi: 1, ma_lop: '1A_DL', gvcn_id: 'g5', diem_truong_id: 'dt1' },
                 { id: 'L2', ten: '2A', khoi: 2, ma_lop: '2A_DL', gvcn_id: 'g6', diem_truong_id: 'dt1' }];
    const gv = [{ id: 'g5', ho_ten: 'Nguyễn Thị Hương', ma_gv: 'Hương_NT', dinh_muc: 23, nguoi_dung_id: 'u5' },
                { id: 'g6', ho_ten: 'Trần Thị Dung', ma_gv: 'Dung_TT', dinh_muc: 23, nguoi_dung_id: 'u6' }];
    /* Lưới cả trường: 4 ô, trong đó 2 ô của g5 */
    const luoiDayDu = { v: 1, tkb: {
      L1: { '2-S-1': { gvId: 'g5', mon: 'Toán' }, '2-S-2': { gvId: 'g6', mon: 'Tiếng Việt' } },
      L2: { '3-S-1': { gvId: 'g5', mon: 'Toán' }, '3-S-2': { gvId: 'g6', mon: 'Tiếng Việt' } } } };

    const mang = (url, opt = {}) => {
      GOI.push(url);
      const co = s => url.includes(s);
      const than = opt.body ? JSON.parse(opt.body) : null;
      if (co('/auth/v1/token')) return dap({ access_token: 'V', refresh_token: 'R',
        user: { id: 'u5', email: 'huong@t.vn' } });
      if (co('/nguoi_dung?')) return dap([{ id: 'u5', ho_ten: 'Nguyễn Thị Hương', email: 'huong@t.vn',
        vai_tro: 'giao_vien', truong_id: 't1', diem_truong_id: null, truong: { ten: 'Trường Tiểu học mới' } }]);
      if (co('/giao_vien?nguoi_dung_id=')) return dap([{ id: gvId, ho_ten: 'Nguyễn Thị Hương' }]);
      if (co('/rpc/tkb_cua_toi')) {
        if (!coHamNhe) return dap({ message: 'Could not find the function public.tkb_cua_toi' }, 404);
        const tkb = {};
        Object.entries(luoiDayDu.tkb).forEach(([lp, o]) => {
          const giu = Object.fromEntries(Object.entries(o).filter(([, v]) => v.gvId === gvId));
          if (Object.keys(giu).length) tkb[lp] = giu;
        });
        return dap({ version: 7, tkb });
      }
      if (co('/truong?id=')) return dap([{ id: 't1', ten: 'Trường Tiểu học mới', nam_hoc: '2026-2027' }]);
      if (co('/diem_truong?')) return dap([{ id: 'dt1', ten: 'Phân hiệu Diễn Liên', co_phong_tin: true }]);
      if (co('/khung_gio?')) return dap([{ thu: 2, buoi: 'S', so_tiet: 4, bat: true },
                                         { thu: 3, buoi: 'S', so_tiet: 4, bat: true }]);
      if (co('/giao_vien?')) return dap(gv);
      if (co('/lop?')) return dap(lop);
      if (co('/mon_hoc?')) return dap([]);
      if (co('/day_thay')) return dap([{ id: 'dt-1', ngay: '2026-09-15', buoi: 'S', tiet: 1,
        lop_id: 'L1', mon: 'Toán', gv_vang_id: 'g6', gv_thay_id: gvId, da_xem: false }]);
      if (co('/bao_nghi')) return dap([{ id: 'bn-1', giao_vien_id: gvId, ngay: '2026-09-10',
        buoi_nghi: 'S', ly_do: 'om', trang_thai: 'xong' }]);
      if (co('/tkb_phien_ban?')) return dap([{ version: 7, du_lieu: luoiDayDu }]);
      return dap({ message: 'Đường dẫn lạ: ' + url }, 404);
    };
    const app = taoUngDung(documentGia,
      { CAU_HINH: { SUPABASE_URL: 'https://gia.supabase.co/', SUPABASE_ANON: 'k' },
        location: { protocol: 'https:' } }, mang);
    return { app, GOI, luoiDayDu };
  };

  /* ---------- a) Nhánh giáo viên bỏ hẳn bốn bảng không dùng ---------- */
  const A = dungMayChuGV();
  await A.app.dangNhap('huong@t.vn', 'x');
  const mocA = A.GOI.length;              /* mốc: chỉ đếm phần TẢI DỮ LIỆU */
  const taiGV = await A.app.taiDuLieu();
  const duong = A.GOI.slice(mocA).join(' | ');

  kt('Giáo viên đăng nhập thì tải bằng nhánh nhẹ, không phải nhánh quản lý',
     taiGV.ok === true && taiGV.nguon === 'may-chu');

  kt('KHÔNG tải bảng phân công — bảng đông dòng nhất, giáo viên không dùng tới',
     !/\/phan_cong\?/.test(duong));
  kt('KHÔNG tải bảng phòng, buổi bận, danh sách tài khoản',
     !/\/phong\?/.test(duong) && !/\/gv_nghi\?/.test(duong) && !/\/nguoi_dung\?truong_id/.test(duong));

  kt('Lấy lịch riêng qua hàm tkb_cua_toi(), không kéo cả khối TKB toàn trường',
     /\/rpc\/tkb_cua_toi/.test(duong) && !/\/tkb_phien_ban\?/.test(duong));

  kt('Chỉ nạp đúng tiết của mình vào lưới', ...((() => {
    const o = A.app.S.tkb;
    const tong = Object.values(o).reduce((s, x) => s + Object.keys(x).length, 0);
    const cuaNguoiKhac = Object.values(o).flatMap(x => Object.values(x))
      .filter(v => v.gvId !== 'g5').length;
    return [tong === 2 && cuaNguoiKhac === 0, `${tong} tiết, 0 tiết của người khác`];
  })()));

  kt('Dạy thay lọc theo chính mình VÀ từ hôm nay trở đi', (() => {
    const u = A.GOI.slice(mocA).find(x => x.includes('/day_thay')) || '';
    return /gv_thay_id\.eq\.g5/.test(u) && /gv_vang_id\.eq\.g5/.test(u) && /ngay=gte\.\d{4}-/.test(u);
  })());
  kt('Báo nghỉ chỉ lấy hồ sơ của chính mình', (() => {
    const u = A.GOI.slice(mocA).find(x => x.includes('/bao_nghi')) || '';
    return /giao_vien_id=eq\.g5/.test(u);
  })());

  kt('Số truy vấn giảm hẳn so với nhánh quản lý', ...((() => {
    const n = A.GOI.slice(mocA).filter(x => /\/rest\/v1\//.test(x)).length;
    return [n <= 10, `${n} truy vấn (nhánh quản lý là 14)`];
  })()));

  /* ---------- b) Cờ luoiDayDu và việc tải theo nhu cầu ---------- */
  kt('Cờ luoiDayDu = false: phần mềm biết mình mới có lịch của một người',
     A.app.KHO.luoiDayDu === false);

  const kqDayDu = await A.app.taiLuoiDayDu();
  kt('Bấm sang màn xem theo lớp thì tải bổ sung lưới cả trường', ...((() => {
    const tong = Object.values(A.app.S.tkb).reduce((s, x) => s + Object.keys(x).length, 0);
    return [kqDayDu.ok === true && tong === 4 && A.app.KHO.luoiDayDu === true,
            `${tong} tiết sau khi tải bổ sung`];
  })()));

  const soGoi = A.GOI.length;
  await A.app.taiLuoiDayDu();
  kt('Đã tải rồi thì lần sau không gọi máy chủ nữa', A.GOI.length === soGoi);

  kt('Tải bổ sung KHÔNG bị coi là việc chưa lưu', A.app.coThayDoiChuaLuu?.() !== true);

  /* ---------- c) Máy chủ chưa chạy db/tai-nhe.sql vẫn mở được app ---------- */
  const B = dungMayChuGV({ coHamNhe: false });
  await B.app.dangNhap('huong@t.vn', 'x');
  const taiCu = await B.app.taiDuLieu();
  kt('Máy chủ chưa có hàm tkb_cua_toi thì tự lùi về cách cũ, không báo lỗi',
     taiCu.ok === true && B.app.KHO.thieuHamNhe === true);
  kt('Đường lui vẫn ra đủ lưới, thầy cô vẫn thấy lịch', ...((() => {
    const tong = Object.values(B.app.S.tkb).reduce((s, x) => s + Object.keys(x).length, 0);
    return [tong === 4 && B.app.KHO.version === 7, `${tong} tiết, phiên bản ${B.app.KHO.version}`];
  })()));

  /* ---------- d) Chưa nối hồ sơ giáo viên thì KHÔNG lấy dòng của ai cả ----------
     Đây là chỗ nguy hiểm nhất của việc lọc theo người: lọc hỏng thì thầy cô
     xem nhầm lịch của đồng nghiệp mà không hay biết. */
  const C = dungMayChuGV({ gvId: null });
  await C.app.dangNhap('huong@t.vn', 'x');
  await C.app.taiDuLieu();
  kt('Tài khoản chưa nối hồ sơ giáo viên thì không kéo dòng dạy thay của người khác', (() => {
    const u = C.GOI.find(x => x.includes('/day_thay')) || '';
    return /ngay=gte\.9999/.test(u) && !/gv_thay_id\.eq\.null/.test(u);
  })());

  /* ---------- e) Ngày công: tháng cũ hơn thì tải bổ sung ---------- */
  const D = dungMayChuGV();
  await D.app.dangNhap('huong@t.vn', 'x');
  await D.app.taiDuLieu();
  D.app.KHO.tuNgayNghi = '2026-08-01';
  const soBN = D.app.S.baoNghi.length;
  await D.app.taiThemNgayNghi('2026-05-01');
  kt('Xem tháng cũ hơn thì tải bổ sung đúng khoảng còn thiếu', (() => {
    const u = D.GOI.filter(x => x.includes('/bao_nghi')).pop() || '';
    return /ngay=gte\.2026-05-01/.test(u) && /ngay=lt\.2026-08-01/.test(u);
  })());
  kt('Gộp vào không đẻ dòng trùng', ...((() => {
    const id = D.app.S.baoNghi.map(b => b.id);
    return [new Set(id).size === id.length, `${id.length} dòng, ${new Set(id).size} mã khác nhau`];
  })()));
  kt('Đã tải tới tháng nào rồi thì không tải lại tháng ấy', (() => {
    const truoc = D.GOI.length;
    return D.app.taiThemNgayNghi('2026-06-01'), D.GOI.length === truoc;
  })());
}

/* ==================================================================
   20. BA PHÓ HIỆU TRƯỞNG CÙNG XẾP MỘT BUỔI TỐI
   ------------------------------------------------------------------
   Một trường ba phân hiệu thì ba phó hiệu trưởng cùng sửa thời khóa
   biểu cùng một buổi tối — sau sáp nhập đó là mặc định, không phải
   trường hợp hiếm.

   Trước 23/8/2026 tình huống này MẤT DỮ LIỆU theo hai đường, cả hai
   đều im lặng. Máy chủ giả dưới đây chép đúng logic luu_tkb() trong
   db/luu-pham-vi.sql, kể cả cửa sổ gộp 10 phút và phép ép phạm vi.
   ================================================================== */
{
  console.log('\n\x1b[1m20. Ba phó hiệu trưởng cùng xếp một buổi tối\x1b[0m');

  const LOP = [
    { id: 'L-DL1', dt: 'dt-DL' }, { id: 'L-DL2', dt: 'dt-DL' },
    { id: 'L-DD1', dt: 'dt-DD' }, { id: 'L-DD2', dt: 'dt-DD' },
    { id: 'L-DT1', dt: 'dt-DT' }];

  /* ---------- Máy chủ giả: bản dịch từng dòng của luu_tkb() ---------- */
  const dungMayChu = ({ coThamSoPhamVi = true } = {}) => {
    const MC = { hang: [], dongHo: 0, goi: [] };
    const CUA_SO = 600;                     /* c_giay = 600 giây */

    MC.luuTKB = (than, uid, diemTruongPhuTrach) => {
      MC.goi.push(than);
      const vHien = MC.hang.length ? Math.max(...MC.hang.map(h => h.version)) : 0;
      /* 1. Phạm vi ĐƯỢC PHÉP, suy từ tài khoản — không tin tham số gửi lên */
      let pv = than.p_pham_vi ?? null;
      if (diemTruongPhuTrach) {
        pv = LOP.filter(l => l.dt === diemTruongPhuTrach)
               .filter(l => pv === null || pv.includes(l.id)).map(l => l.id);
      }
      let moi, khac = 0;
      if (pv === null) {
        /* 2. Không phạm vi = nguyên khối, khoá lạc quan giữ chặt */
        if (than.p_version < vHien)
          return { ok: false, version_moi: vHien,
                   thong_bao: `Đã có người lưu phiên bản ${vHien}. Mời tải lại rồi lưu tiếp.` };
        moi = than.p_du_lieu;
      } else {
        /* 3. Có phạm vi = gộp vào bản MỚI NHẤT */
        const nen = MC.hang.find(h => h.version === vHien)?.du_lieu ?? than.p_du_lieu;
        const tkb = {};
        Object.entries(nen.tkb || {}).forEach(([k, v]) => { if (!pv.includes(k)) tkb[k] = v; });
        Object.entries(than.p_du_lieu.tkb || {}).forEach(([k, v]) => { if (pv.includes(k)) tkb[k] = v; });
        if (than.p_version < vHien)
          khac = Object.entries(nen.tkb || {})
            .filter(([k, v]) => !pv.includes(k) && v && Object.keys(v).length).length;
        moi = { ...than.p_du_lieu, tkb,
                tongTiet: Object.values(tkb).reduce((s, o) => s + Object.keys(o).length, 0) };
      }
      /* 4. Cửa sổ gộp — và VẪN tăng số phiên bản */
      const gop = MC.hang.find(h => h.version === vHien && !h.cong_bo
        && h.nguoi_sua === uid && h.tao_luc > MC.dongHo - CUA_SO);
      if (gop) { gop.du_lieu = moi; gop.version = vHien + 1; gop.tao_luc = MC.dongHo; }
      else MC.hang.push({ version: vHien + 1, du_lieu: moi, nguoi_sua: uid,
                          cong_bo: false, tao_luc: MC.dongHo });
      return { ok: true, version_moi: vHien + 1,
               thong_bao: khac > 0
                 ? `Đã lưu phần của bạn, giữ nguyên ${khac} lớp đồng nghiệp vừa sửa.` : 'Đã lưu' };
    };

    /* Một "máy tính" của một cán bộ quản lý */
    MC.may = (uid, diemTruongPhuTrach) => {
      const mang = async (url, opt) => {
        const dap = (d, ma = 200) => ({ ok: ma < 400, status: ma,
          text: async () => JSON.stringify(d) });
        const than = opt?.body ? JSON.parse(opt.body) : {};
        if (url.includes('/rpc/luu_tkb')) {
          /* Máy chủ CHƯA chạy db/luu-pham-vi.sql: hàm còn 4 tham số nên
             PostgREST không khớp nổi lời gọi có p_pham_vi → 404. */
          if (!coThamSoPhamVi && than.p_pham_vi !== undefined)
            return dap({ message: 'Could not find the function public.luu_tkb(p_du_lieu, p_ghi_chu, p_pham_vi, p_truong, p_version)' }, 404);
          return dap([MC.luuTKB(than, uid, coThamSoPhamVi ? diemTruongPhuTrach : null)]);
        }
        return dap({ message: 'Đường dẫn lạ: ' + url }, 404);
      };
      const u = taoUngDung(documentGia, {}, mang);
      u.KHO.cauHinh = { url: 'https://gia.supabase.co', khoa: 'k' };
      u.KHO.phien = { token: 't' };
      u.KHO.nguoiDung = { truongId: 'T1', id: uid };
      u.KHO.nguon = 'may-chu';
      u.KHO.version = 0;
      u.S.lop = LOP.map(l => ({ id: l.id, ten: l.id, khoi: 1 }));
      u.S.lopDT = Object.fromEntries(LOP.map(l => [l.id, l.dt]));
      u.S.nguoiDung = { vaiTro: diemTruongPhuTrach ? 'pht' : 'qt',
                        diemTruongId: diemTruongPhuTrach || null };
      u.S.diemTruong = [{ id: 'dt-DL' }, { id: 'dt-DD' }, { id: 'dt-DT' }];
      return u;
    };
    MC.taiLai = u => {
      const v = MC.hang.length ? Math.max(...MC.hang.map(h => h.version)) : 0;
      u.S.tkb = JSON.parse(JSON.stringify(MC.hang.find(h => h.version === v)?.du_lieu.tkb ?? {}));
      u.KHO.version = v;
    };
    MC.moiNhat = () => MC.hang.find(h =>
      h.version === Math.max(...MC.hang.map(x => x.version))).du_lieu.tkb;
    return MC;
  };

  const xep = (u, lop, o) => { (u.S.tkb[lop] ||= {})[o] = { gvId: 'g1', mon: 'Toán' }; };
  const goi = u => ({ tkb: u.S.tkb, lopDT: { ...u.S.lopDT } });
  const dem = (tkb, lop) => Object.keys(tkb[lop] || {}).length;

  /* ---------- a) Ba phân hiệu lưu song song, không ai mất việc ---------- */
  {
    const MC = dungMayChu();
    const A = MC.may('uid-A', 'dt-DL'), B = MC.may('uid-B', 'dt-DD'), C = MC.may('uid-C', 'dt-DT');
    [A, B, C].forEach(MC.taiLai);
    xep(A, 'L-DL1', '2-S-1'); xep(B, 'L-DD1', '2-S-1'); xep(C, 'L-DT1', '2-S-1');
    const rA = await A.luuTKB(goi(A), A.KHO.version, '', A.phamViLuu());
    const rB = await B.luuTKB(goi(B), B.KHO.version, '', B.phamViLuu());
    const rC = await C.luuTKB(goi(C), C.KHO.version, '', C.phamViLuu());
    const sau = MC.moiNhat();
    kt('Ba phó hiệu trưởng lưu song song thì cả ba phần đều còn',
       rA.ok && rB.ok && rC.ok &&
       dem(sau, 'L-DL1') === 1 && dem(sau, 'L-DD1') === 1 && dem(sau, 'L-DT1') === 1,
       `DL ${dem(sau, 'L-DL1')} · DĐ ${dem(sau, 'L-DD1')} · DT ${dem(sau, 'L-DT1')} tiết`);
    kt('Không ai bị bắt tải lại giữa chừng',
       [rA, rB, rC].every(r => !r.xungDot));
    kt('Người lưu sau được báo là đã gộp với việc của đồng nghiệp',
       /giữ nguyên/.test(rC.thongBao), rC.thongBao);
  }

  /* ---------- b) Bị từ chối thì KHÔNG được nhận số phiên bản của máy chủ ---------- */
  {
    const MC = dungMayChu();
    const A = MC.may('uid-A', null), B = MC.may('uid-B', null);   /* cả hai toàn trường */
    [A, B].forEach(MC.taiLai);
    xep(A, 'L-DL1', '2-S-1');
    await A.luuTKB(goi(A), A.KHO.version, '', A.phamViLuu());
    xep(B, 'L-DD1', '2-S-1');
    const r1 = await B.luuTKB(goi(B), B.KHO.version, '', B.phamViLuu());
    kt('Lưu nguyên khối trên bản cũ thì máy chủ từ chối',
       r1.ok === false && r1.xungDot === true, r1.thongBao);
    kt('Bị từ chối thì máy mình GIỮ NGUYÊN số phiên bản cũ',
       B.KHO.version === 0, `đang giữ phiên bản ${B.KHO.version}`);
    const r2 = await B.luuTKB(goi(B), B.KHO.version, '', B.phamViLuu());
    kt('Bấm Lưu lần nữa mà không tải lại thì VẪN bị từ chối', r2.ok === false);
    kt('Phần của người lưu trước còn nguyên', dem(MC.moiNhat(), 'L-DL1') === 1);
  }

  /* ---------- c) Cửa sổ gộp 10 phút không được làm thủng khoá lạc quan ---------- */
  {
    const MC = dungMayChu();
    const D = MC.may('uid-D', null), E = MC.may('uid-E', null);
    MC.taiLai(D);
    xep(D, 'L-DL1', '2-S-1');
    await D.luuTKB(goi(D), D.KHO.version, '', D.phamViLuu());
    MC.dongHo = 60; MC.taiLai(E);                 /* E tải lại đúng quy trình */
    MC.dongHo = 120;
    xep(D, 'L-DL2', '3-S-1');
    const rD2 = await D.luuTKB(goi(D), D.KHO.version, '', D.phamViLuu());
    kt('Gộp lần lưu liên tiếp thì KHÔNG đẻ dòng mới', MC.hang.length === 1,
       `${MC.hang.length} dòng trên máy chủ`);
    /* Soi thẳng DÒNG trên máy chủ, không soi con số máy chủ trả về: con số
       ấy tăng dù có gộp hay không, nên khẳng định theo nó là xanh nhờ trùng
       hợp — đúng thứ bẫy đã ghi ở §8 của CLAUDE.md. */
    kt('...nhưng số phiên bản của DÒNG ấy VẪN tăng — nội dung đổi thì số phải đổi',
       MC.hang[0].version === 2 && rD2.version === 2, `dòng đang ở phiên bản ${MC.hang[0].version}`);
    MC.dongHo = 180;
    xep(E, 'L-DD1', '2-S-1');
    const rE = await E.luuTKB(goi(E), E.KHO.version, '', E.phamViLuu());
    kt('Người tải lại đúng quy trình không xoá mất việc đồng nghiệp vừa gộp',
       rE.ok === false && dem(MC.moiNhat(), 'L-DL2') === 1,
       rE.ok ? 'đã ghi đè — HỎNG' : rE.thongBao);
  }

  /* ---------- d) Phạm vi ép từ tài khoản, không tin máy gửi lên ---------- */
  {
    const MC = dungMayChu();
    const A = MC.may('uid-A', null);
    MC.taiLai(A);
    xep(A, 'L-DD1', '2-S-1'); xep(A, 'L-DT1', '2-S-1');
    await A.luuTKB(goi(A), A.KHO.version, '', null);
    const B = MC.may('uid-B', 'dt-DL');           /* PHT chỉ phụ trách Diễn Liên */
    MC.taiLai(B);
    B.S.tkb['L-DD1'] = {};                        /* cố tình xoá lớp của điểm khác */
    B.S.tkb['L-DT1'] = {};
    xep(B, 'L-DL1', '2-S-1');
    /* Gửi lên phạm vi RỘNG hơn quyền của mình — máy chủ phải bó lại */
    const r = await B.luuTKB(goi(B), B.KHO.version, '', LOP.map(l => l.id));
    const sau = MC.moiNhat();
    kt('PHT một phân hiệu không xoá được lớp của phân hiệu khác',
       r.ok === true && dem(sau, 'L-DD1') === 1 && dem(sau, 'L-DT1') === 1,
       `DĐ ${dem(sau, 'L-DD1')} · DT ${dem(sau, 'L-DT1')} tiết`);
    kt('...mà phần của chính mình vẫn lưu được', dem(sau, 'L-DL1') === 1);
  }

  /* ---------- e) phamViLuu(): ai được ghi những lớp nào ---------- */
  {
    const MC = dungMayChu();
    kt('Người phụ trách toàn trường thì phạm vi là null — lưu nguyên khối',
       MC.may('uid-A', null).phamViLuu() === null);
    const pv = MC.may('uid-B', 'dt-DD').phamViLuu();
    kt('PHT một phân hiệu chỉ nhận đúng lớp của điểm ấy',
       Array.isArray(pv) && pv.length === 2 && pv.every(id => id.startsWith('L-DD')),
       (pv || []).join(', '));
  }

  /* ---------- f) Đường lui: máy chủ chưa chạy db/luu-pham-vi.sql ---------- */
  {
    const MC = dungMayChu({ coThamSoPhamVi: false });
    const B = MC.may('uid-B', 'dt-DL');
    MC.taiLai(B);
    xep(B, 'L-DL1', '2-S-1');
    const r = await B.luuTKB(goi(B), B.KHO.version, '', B.phamViLuu());
    kt('Máy chủ chưa có tham số p_pham_vi thì tự lùi về lời gọi cũ, vẫn lưu được',
       r.ok === true && B.KHO.thieuHamPhamVi === true, r.thongBao);
    kt('Lần lùi ấy gọi lại đúng một lần, không kèm p_pham_vi',
       MC.goi.length === 1 && MC.goi[0].p_pham_vi === undefined,
       `${MC.goi.length} lần tới được luu_tkb`);
  }

  /* ---------- g) don_du_lieu_cu giữ 10 DÒNG, không phải 10 SỐ ---------- */
  {
    const sql = readFileSync(join(goc, 'db/luu-pham-vi.sql'), 'utf8');
    kt('don_du_lieu_cu cắt theo thứ hạng, không theo hiệu số phiên bản',
       /order by version desc\s*\n?\s*limit c_giu/.test(sql) && !/max\(version\)\s*-\s*c_giu/.test(sql));
    kt('Bản luu_tkb 4 tham số cũ bị drop — không để PostgREST phải chọn giữa hai bản',
       /drop function if exists luu_tkb\(uuid, integer, jsonb, text\)/.test(sql));
  }
}

/* ---------- 21. Mẫu Excel trọn gói (tách tệp riêng cho gọn) ---------- */
{
  const muc21 = (await import('./muc21-mau-tron-goi.mjs')).default;
  muc21({ kt, S, bangMauTronGoi, duLieuTuTronGoi, docTrang, CHUAN_KHOI, chuanMon,
          tietCanTu, dsMonMacDinh });

console.log('\n22. Nhập TỪNG MỤC — mỗi màn hình một trang tính');
const { default: muc22 } = await import('./muc22-nhap-tung-muc.mjs');
muc22({ kt, S, MUC_NHAP, duLieuTuMuc, napMucVaoS, chepKhoNguon, thieuMucTruoc,
        locDongDaDien, dienGiaiLoiNhap, taoUngDung, documentGia });
}

console.log('\n23. Hai tiết cùng môn LIỀN NHAU — cho phép theo từng môn');
/* Chủ dự án 31/8/2026: *"Tiếng Việt, Tiếng Anh có thể có 2 tiết xếp liền nhau,
   nhưng Toán, Khoa học, Lịch sử và Địa lý thì không"*.
   ⚠️ Luật phải nằm ở CẢ diemO lẫn diemLop. Nguyên mẫu chỉ đặt ở diemO thì
   bước hoán đổi (chấm bằng diemLop) ghép lại y như cũ — đo được 17 cặp Toán
   trước và sau, phạt 160 cũng không nhúc nhích. */
{
  const DLT = JSON.parse(readFileSync(join(goc, 'data/truong-dien-lien.json'), 'utf8'));

  /* Đếm cặp tiết cùng môn đứng SÁT NHAU trong một buổi, theo từng môn */
  const demCap = (app) => {
    const cap = {};
    app.S.lop.forEach(l => {
      const buoi = {};
      Object.entries(app.S.tkb[l.id] || {}).forEach(([k, v]) => {
        const q = k.split('-');
        (buoi[`${q[0]}-${q[1]}`] ||= []).push({ i: +q[2], mon: v.mon });
      });
      Object.values(buoi).forEach(ds => {
        ds.sort((x, y) => x.i - y.i);
        for (let n = 1; n < ds.length; n++)
          if (ds[n].mon === ds[n - 1].mon && ds[n].i === ds[n - 1].i + 1)
            cap[ds[n].mon] = (cap[ds[n].mon] || 0) + 1;
      });
    });
    return cap;
  };
  const anhChup = app => JSON.stringify(app.S.lop.map(l =>
    Object.entries(app.S.tkb[l.id] || {}).sort().map(([k, v]) => `${k}|${v.mon}|${v.gvId}`)));

  const mo = (sua) => {
    const app = taoUngDung(documentGia, {}, async () => { throw new Error('không mạng'); });
    app.napVaoS(JSON.parse(JSON.stringify(DLT)));
    app.S.monHoc = app.dsMonMacDinh();
    if (sua) sua(app);
    app.xepTuDong(1200);
    return app;
  };

  /* ⚠️ `dsMonMacDinh()` KHÔNG được tự gieo `lienTiet` — trường nào chưa từng
     bấm Lưu ở mục Môn học thì `taiDuLieu()` rơi về danh mục này, gieo sẵn là
     lưới của họ đổi thật mà không ai yêu cầu. Agent rà soát bắt được. */
  kt('Danh mục mặc định KHÔNG tự quyết hộ nhà trường', (() => {
    const daKhai = dsMonMacDinh().filter(m => m.lienTiet !== undefined).map(m => m.ten);
    return [daKhai.length === 0, daKhai.join(' · ') || 'không môn nào bị gieo sẵn'];
  })());
  kt('Nút Gợi ý mới là thứ đặt cột ấy, và đặt đúng', (() => {
    const app = taoUngDung(documentGia, {}, async () => { throw new Error('không mạng'); });
    app.S.monHoc = app.dsMonMacDinh();
    const n = app.goiYLienTiet();
    const co = t => app.S.monHoc.find(m => m.ten === t)?.lienTiet;
    return [n === app.S.monHoc.length && co('Tiếng Việt') === true
            && co('Tiếng Anh') === true && co('Toán') === false
            && co('Khoa học') === false && co('LS&ĐL') === false,
            `đặt ${n} môn · TV ${co('Tiếng Việt')} · Toán ${co('Toán')}`];
  })());
  kt('Bấm lần nữa thì không đổi gì thêm', (() => {
    const app = taoUngDung(documentGia, {}, async () => { throw new Error('không mạng'); });
    app.S.monHoc = app.dsMonMacDinh();
    app.goiYLienTiet();
    return [app.goiYLienTiet() === 0, 'lần hai đổi 0 môn'];
  })());

  const chuan = mo(a => a.goiYLienTiet());
  const cap = demCap(chuan);
  kt('Xếp với danh mục mặc định: KHÔNG còn cặp Toán liền nhau',
     (cap['Toán'] || 0) === 0, `Toán ${cap['Toán'] || 0} cặp`);
  kt('Nhưng Tiếng Việt VẪN được xếp liền — đó là thứ nhà trường cần',
     (cap['Tiếng Việt'] || 0) > 0, `Tiếng Việt ${cap['Tiếng Việt'] || 0} cặp`);
  kt('Không môn nào bị cấm mà vẫn còn cặp liền nhau', (() => {
    const hong = Object.keys(cap).filter(m =>
      dsMonMacDinh().find(x => x.ten === m)?.lienTiet === false);
    return [hong.length === 0, hong.join(' · ') || 'sạch'];
  })());
  kt('Và vẫn xếp trọn 710/710 tiết — luật mới không làm mất tiết nào', (() => {
    const n = chuan.S.lop.reduce((s, l) => s + Object.keys(chuan.S.tkb[l.id] || {}).length, 0);
    return [n === 710, `${n}/710`];
  })());

  /* --- Đường lui: chưa khai thì ĐƯỢC PHÉP, y hệt hành vi trước 31/8/2026 --- */
  const chuaKhai = mo(a => a.S.monHoc.forEach(m => { delete m.lienTiet; }));
  const khaiCo   = mo(a => a.S.monHoc.forEach(m => { m.lienTiet = true; }));
  kt('Chưa khai cột này = ĐƯỢC PHÉP xếp liền, không phải cấm',
     anhChup(chuaKhai) === anhChup(khaiCo), 'hai lưới giống hệt từng ô');
  kt('Và lúc ấy Toán lại có cặp liền như trước — chứng tỏ luật thật sự tắt',
     (demCap(chuaKhai)['Toán'] || 0) > 0, `Toán ${demCap(chuaKhai)['Toán'] || 0} cặp`);

  /* --- Bật riêng một môn --- */
  /* ⚠️ Đòi về ĐÚNG 0 là sai bản chất, và phép thử đầu tiên đã đỏ vì thế.
     Đây là điểm phạt MỀM, không phải ràng buộc cứng — mà Tiếng Việt khối 1 có
     12 tiết/tuần trên 8 buổi, nên đôi khi không còn cách nào khác ngoài xếp
     liền. Thứ phải canh là luật CÓ TÁC DỤNG (74 cặp → 1), không phải con số 0.
     Đòi 0 ở một khoản phạt mềm là phép thử chập chờn cài sẵn. */
  const camTV = mo(a => a.S.monHoc.forEach(m => { m.lienTiet = m.ten !== 'Tiếng Việt'; }));
  const truocTV = demCap(khaiCo)['Tiếng Việt'] || 0;
  const sauTV = demCap(camTV)['Tiếng Việt'] || 0;
  kt('Cấm riêng Tiếng Việt thì số cặp liền giảm gần hết',
     truocTV > 10 && sauTV <= truocTV / 10, `${truocTV} → ${sauTV} cặp`);

  /* --- Mẫu Excel: ô để trống thì GIỮ NGUYÊN, không ép về "Không" --- */
  kt('Cột Lien_tiet để trống thì giữ nguyên lựa chọn cũ', (() => {
    const kho = { monHoc: [{ ten: 'Toán', lienTiet: false, chuan: {} }] };
    const loi = [];
    MUC_NHAP.monhoc.doc([{ Ten_mon: 'Toán', __dong: 4 }], kho, loi, []);
    return [kho.monHoc[0].lienTiet === false, `còn ${kho.monHoc[0].lienTiet}`];
  })());
  kt('Điền "Không" thì cấm, điền "Có" thì cho', (() => {
    const kho = { monHoc: [{ ten: 'Toán', chuan: {} }, { ten: 'Tiếng Việt', chuan: {} }] };
    MUC_NHAP.monhoc.doc([{ Ten_mon: 'Toán', Lien_tiet: 'Không', __dong: 4 },
                         { Ten_mon: 'Tiếng Việt', Lien_tiet: 'Có', __dong: 5 }], kho, [], []);
    return [kho.monHoc[0].lienTiet === false && kho.monHoc[1].lienTiet === true,
            `Toán ${kho.monHoc[0].lienTiet} · TV ${kho.monHoc[1].lienTiet}`];
  })());
}

console.log('\n24. Trần số buổi dạy — pha 0 chọn buổi nghỉ TRƯỚC khi xếp');
/* Chủ dự án: *"số buổi dạy của từng giáo viên được cố định trước khi xếp …
   đồng loạt giáo viên cả trường chỉ phải dạy trong 7 hoặc 8 buổi / 9 buổi"*.

   ⚠️ ĐIỀU QUYẾT ĐỊNH KHÔNG PHẢI THUẬT TOÁN, LÀ PHÉP TÍNH SỐ Ô. Lưới Diễn Liên
   có đúng 27/28/30 ô cho 27/28/30 tiết — dư 0 ô. Bỏ một buổi đi là lớp thiếu
   chỗ, nên cho ai nghỉ cũng là mất tiết. Ba cách rẻ đã đo và đều hỏng; xem
   chú thích ở `chonBuoiNghi()`. */
{
  const DLB = JSON.parse(readFileSync(join(goc, 'data/truong-dien-lien.json'), 'utf8'));
  const mo = (sua) => {
    const app = taoUngDung(documentGia, {}, async () => { throw new Error('không mạng'); });
    app.napVaoS(JSON.parse(JSON.stringify(DLB)));
    if (sua) sua(app);
    return app;
  };
  const anh = app => JSON.stringify(app.S.lop.map(l =>
    Object.entries(app.S.tkb[l.id] || {}).sort().map(([k, v]) => `${k}|${v.mon}|${v.gvId}`)));
  const demXep = app => app.S.lop.reduce((n, l) => n + Object.keys(app.S.tkb[l.id] || {}).length, 0);
  const buoiCua = app => {
    const c = {};
    app.S.lop.forEach(l => Object.entries(app.S.tkb[l.id] || {}).forEach(([k, v]) => {
      const q = k.split('-'); (c[v.gvId] ||= new Set()).add(`${q[0]}-${q[1]}`);
    }));
    return c;
  };
  /* Mở thêm chiều thứ Tư ba tiết -> mỗi lớp dư 3 ô */
  const themO = app => {
    const k = app.S.khungGio.find(x => +x.thu === 4 && x.buoi === 'C');
    if (k) { k.bat = true; k.tiet = 3; k.tietKhoi = null; }
    else app.S.khungGio.push({ thu: 4, buoi: 'C', tiet: 3, bat: true, tietKhoi: null });
  };

  /* --- a) LƯỚI KÍN (dư 0 ô): phải KHÔNG đổi gì --- */
  const kinA = mo(); kinA.xepTuDong(1200);
  const kinB = mo(); const kqB = kinB.xepTuDong(1200, { nghiToiThieu: 1 });
  kt('Lưới dư 0 ô: pha 0 KHÔNG cho ai nghỉ — đúng phép tính, không phải bỏ cuộc',
     kqB.pha0 && kqB.pha0.datDu === 0, `${kqB.pha0?.datDu}/${kqB.pha0?.tong} người`);
  kt('Và lưới ra GIỐNG HỆT từng ô như khi không ép gì', anh(kinA) === anh(kinB),
     `${demXep(kinA)} và ${demXep(kinB)} tiết`);
  kt('Vẫn xếp trọn 710 tiết — ép trần không được làm mất tiết nào',
     demXep(kinB) === 710, `${demXep(kinB)}/710`);
  kt('Và nói ra lớp nào hết ô, để hiệu trưởng biết đường xử lý',
     (kqB.pha0.hetO || []).length === kinB.S.lop.length,
     `${(kqB.pha0.hetO || []).length}/${kinB.S.lop.length} lớp hết ô`);

  /* --- b) LƯỚI DƯ 3 Ô: nghỉ được, và vẫn không mất tiết --- */
  const duA = mo(themO); duA.xepTuDong(1200);
  const duB = mo(themO); const kqD = duB.xepTuDong(1200, { nghiToiThieu: 1 });
  kt('Lưới dư 3 ô: MỌI thầy cô được nghỉ một buổi',
     kqD.pha0.datDu === kqD.pha0.tong, `${kqD.pha0.datDu}/${kqD.pha0.tong} người`);
  kt('Và vẫn xếp trọn 710 tiết — không đánh đổi tiết lấy buổi nghỉ',
     demXep(duB) === 710, `${demXep(duB)}/710`);
  kt('Lưới dư ô thì KHÔNG lớp nào bị kể là hết ô — tên nói sao thì nghĩa vậy',
     (kqD.pha0.hetO || []).length === 0, `${(kqD.pha0.hetO || []).length} lớp`);
  kt('Không còn ai phải đến trường cả tuần', (() => {
    const soBuoi = duB.buoiBat().length;
    const kin = Object.values(buoiCua(duB)).filter(x => x.size >= soBuoi).length;
    const kinTruoc = Object.values(buoiCua(duA)).filter(x => x.size >= soBuoi).length;
    return [kin === 0, `${kinTruoc} → ${kin} người kín tuần`];
  })());

  /* --- c) Không được làm bẩn buổi bận THẬT của nhà trường --- */
  kt('Xếp xong thì S.gvNghi trở lại nguyên trạng, không giữ buổi pha 0 đặt', (() => {
    const app = mo(themO);
    const truoc = JSON.stringify(app.S.gvNghi);
    app.xepTuDong(1200, { nghiToiThieu: 1 });
    return [JSON.stringify(app.S.gvNghi) === truoc, 'buổi bận của trường không đổi'];
  })());

  /* --- d) Nghỉ 2 buổi mà lưới chỉ dư 3 ô thì phải TỪ CHỐI, không mất tiết --- */
  kt('Đòi nghỉ 2 buổi khi chỉ dư 3 ô: từ chối, và tiết vẫn trọn', (() => {
    const app = mo(themO);
    const kq = app.xepTuDong(1200, { nghiToiThieu: 2 });
    return [kq.pha0.datDu === 0 && demXep(app) === 710,
            `${kq.pha0.datDu} người nghỉ đủ 2 buổi · ${demXep(app)}/710 tiết`];
  })());

  /* --- e) Hàm thuần gọi thẳng được --- */
  kt('chonBuoiNghi(0) không đụng gì — cửa tắt là tắt hẳn', (() => {
    const app = mo(themO);
    const r = app.chonBuoiNghi(0);
    return [r.datDu === 0 && Object.keys(r.nghi).length === 0, 'không sinh buổi nghỉ nào'];
  })());
}

console.log('\n25. Lớp học khác giờ khối — bài toán TH Hưng Vinh 1');
/* Chủ dự án 31/8/2026: "Lớp 1A, 1B, 1C khung chương trình 35 tiết mà các lớp 1
   còn lại 32 tiết… bố trí cứng khung giờ này thì bài toán Hưng Vinh 1 không
   giải được." Khung giờ vốn khai theo KHỐI nên trong một khối không có chỗ nào
   nói hai con số. Nay mỗi lớp ghi đè được số tiết của từng buổi. */
{
  const DL2 = JSON.parse(readFileSync(join(goc, 'data/truong-dien-lien.json'), 'utf8'));
  const BA = ['lop_1A', 'lop_1B', 'lop_1C'];

  /* Dựng một bản app sạch; `sua` chạy TRƯỚC khi xếp. */
  const mo2 = (sua) => {
    const app = taoUngDung(documentGia, {}, async () => { throw new Error('không mạng'); });
    app.napVaoS(JSON.parse(JSON.stringify(DL2)));
    app.S.monHoc = app.dsMonMacDinh();
    if (sua) sua(app);
    app.xepTuDong(1200);
    return app;
  };
  /* Ba buổi sáng đầu tuần nâng từ 4 lên 5 tiết — đúng cách nhà trường mở thêm
     giờ cho lớp học đủ hai buổi, và cũng là cách SmartScheduler bày lưới. */
  const gioRieng = (app) => {
    const m = {};
    app.buoiBat().forEach(k => { m[app.khoaB(k)] = app.soTietBuoi(k, 1); });
    m['2-S'] = 5; m['3-S'] = 5; m['4-S'] = 5;
    app.datGioLop(BA, m);
    /* Ba tiết thêm phải có người dạy, không thì phân công vẫn là 27 */
    BA.forEach(id => {
      const pc = app.S.phanCong.find(p => p.lopId === id && p.mon === 'Tiếng Việt');
      if (pc) pc.soTiet += 3;
    });
  };
  const tongCan = app => app.S.phanCong.reduce((s, p) => s + p.soTiet, 0);
  const tongXep = app => app.S.lop.reduce((s, l) => s + Object.keys(app.S.tkb[l.id] || {}).length, 0);

  /* --- a) Chốt an toàn: không khai gì thì mọi thứ y như trước --- */
  kt('Không lớp nào khai riêng thì lưới ra GIỐNG HỆT từng ô', (() => {
    const a = mo2(), b = mo2();
    const cot = app => app.S.lop.map(l => l.id + ':' +
      Object.entries(app.S.tkb[l.id] || {}).sort()
        .map(([k, v]) => `${k}=${v.mon}/${v.gvId}`).join(',')).join('|');
    return [cot(a) === cot(b) && tongXep(a) === 710, `${tongXep(a)}/710 tiết`];
  })());
  kt('Chưa khai thì soTietLop trả đúng con số của KHỐI, không lệch ô nào', (() => {
    const app = mo2();
    const lech = [];
    app.S.lop.forEach(l => app.buoiBat().forEach(k => {
      if (app.soTietLop(k, l) !== app.soTietBuoi(k, l.khoi)) lech.push(l.ten + ' ' + app.khoaB(k));
    }));
    return [lech.length === 0 && !app.coGioRieng('lop_1A'), lech.join(' · ') || 'khớp cả 25 lớp'];
  })());

  /* --- b) Khai giờ riêng: hai con số trong CÙNG một khối --- */
  const hv = mo2(gioRieng);
  kt('Cùng khối 1 mà 1A học 30 ô còn 1D vẫn 27 — thứ khung theo khối không nói được',
     [hv.sucChuaLop('lop_1A') === 30 && hv.sucChuaLop('lop_1D') === 27,
      `1A ${hv.sucChuaLop('lop_1A')} · 1D ${hv.sucChuaLop('lop_1D')} ô`]);
  kt('Bản đồ chỉ giữ phần LỆCH, ba buổi chứ không phải cả tám',
     [Object.keys(hv.S.lopTiet['lop_1A']).sort().join(',') === '2-S,3-S,4-S',
      Object.keys(hv.S.lopTiet['lop_1A']).sort().join(',')]);
  kt('Lớp không khai thì tuyệt đối không bị đụng tới',
     [!hv.coGioRieng('lop_1D') && !hv.coGioRieng('lop_2A') && hv.sucChuaLop('lop_2A') === 27,
      `2A ${hv.sucChuaLop('lop_2A')} ô`]);

  /* --- c) Xếp được, và không tiết nào rơi ra ngoài giờ của lớp --- */
  kt('Xếp trọn số tiết đã phân công, kể cả 9 tiết thêm của ba lớp',
     [tongXep(hv) === tongCan(hv) && tongCan(hv) === 719, `${tongXep(hv)}/${tongCan(hv)} tiết`]);
  /* ⚠️ Đây là phép thử NẶNG nhất của mục: tiết nằm ngoài lưới của lớp thì xếp
     vẫn thấy đủ mà bản in thiếu — không ai phát hiện ra cho tới lúc phát tờ. */
  kt('Mọi tiết đều nằm trong giờ học của chính lớp ấy', (() => {
    const ra = [];
    hv.S.lop.forEach(l => {
      const hopLe = new Set(hv.oTuanLop(l.id).map(x => x.khoa));
      Object.keys(hv.S.tkb[l.id] || {}).forEach(k => { if (!hopLe.has(k)) ra.push(l.ten + ' ' + k); });
    });
    return [ra.length === 0, ra.slice(0, 3).join(' · ') || 'sạch cả 25 lớp'];
  })());
  kt('1D KHÔNG bị xếp vào tiết 5 sáng — ô ấy chỉ mở cho ba lớp kia', (() => {
    const co = k => Object.keys(hv.S.tkb[k] || {}).filter(x => /-S-4$/.test(x)).length;
    return [co('lop_1D') === 0 && co('lop_1E') === 0 && co('lop_1A') === 3,
            `1A ${co('lop_1A')} tiết · 1D ${co('lop_1D')}`];
  })());

  /* --- c2) Bản lưu đọc lại phải GIỮ tiết ở ô chỉ lớp ấy mới có ---
     `docTKB()` bỏ những ô không còn tồn tại trong lưới. Xét theo KHỐI thì
     tiết 5 sáng của 1A là "ô không tồn tại" — tải bản đã lưu về là mất
     trắng 9 tiết, mà lời báo chỉ nói "bỏ qua mấy ô", không nói vì sao. */
  kt('Tải bản đã lưu về không mất tiết nào của lớp khai giờ riêng', (() => {
    const goi = JSON.parse(JSON.stringify(hv.dongGoiTKB()));
    const truoc = tongXep(hv);
    const r = hv.docTKB(goi);
    return [tongXep(hv) === truoc && r.boQua === 0, `${truoc} → ${tongXep(hv)} tiết · bỏ qua ${r.boQua}`];
  })());

  /* --- d) Hai tiết theo quy định vẫn đúng chỗ --- */
  kt('Chào cờ vẫn ở tiết 1 sáng thứ Hai của cả năm lớp khối 1',
     [['lop_1A', 'lop_1B', 'lop_1C', 'lop_1D', 'lop_1E']
        .every(id => hv.S.tkb[id]['2-S-0']?.mon === 'HDTN'), 'đủ 5 lớp']);
  kt('Sinh hoạt lớp vẫn là tiết CUỐI của lớp — thứ Sáu sáng khối 1 vẫn 4 tiết',
     [hv.S.tkb['lop_1A']['6-S-3']?.mon === 'HDTN' && !hv.S.tkb['lop_1A']['6-S-4'],
      '1A: 6-S-3']);

  /* --- e) Thu giờ lại thì phải GỠ tiết rơi ra ngoài, không được giữ ngầm --- */
  kt('tietRaNgoai đếm đúng số tiết sẽ rơi ra khi trở lại giờ của khối', (() => {
    const ra = hv.tietRaNgoai(BA, null);
    return [ra.length === 9 && ra.every(x => /-S-4$/.test(x.khoa)), `${ra.length} tiết`];
  })());
  kt('Bỏ giờ riêng thì ba lớp trở lại đúng khung khối', (() => {
    const ra = hv.tietRaNgoai(BA, null);
    hv.datGioLop(BA, null);
    ra.forEach(x => { delete hv.S.tkb[x.id][x.khoa]; });
    return [!hv.coGioRieng('lop_1A') && hv.sucChuaLop('lop_1A') === 27
            && Object.keys(hv.S.lopTiet).length === 0,
            `1A ${hv.sucChuaLop('lop_1A')} ô · còn ${Object.keys(hv.S.lopTiet).length} lớp khai riêng`];
  })());
  kt('Và lưới không còn tiết nào nằm ngoài giờ mới', (() => {
    const hopLe = new Set(hv.oTuanLop('lop_1A').map(x => x.khoa));
    return [Object.keys(hv.S.tkb['lop_1A']).every(k => hopLe.has(k)), 'sạch'];
  })());

  /* --- f) Khai đúng bằng khối = KHÔNG phải giờ riêng --- */
  kt('Khai trùng đúng con số của khối thì không lưu gì cả', (() => {
    const app = mo2();
    const m = {};
    app.buoiBat().forEach(k => { m[app.khoaB(k)] = app.soTietBuoi(k, 1); });
    app.datGioLop(['lop_1A'], m);
    return [!app.coGioRieng('lop_1A') && Object.keys(app.S.lopTiet).length === 0,
            'bản đồ rỗng'];
  })());

  /* --- g) Chiều cao lưới phải trùm cả giờ riêng --- */
  kt('Chiều cao lưới nâng theo lớp khai nhiều tiết nhất', (() => {
    const app = mo2(gioRieng);
    const k = app.buoiBat().find(x => x.thu === 2 && x.buoi === 'S');
    return [k.tiet === 5 && app.soTietBuoi(k, 1) === 4,
            `lưới ${k.tiet} · khối 1 vẫn ${app.soTietBuoi(k, 1)}`];
  })());

  /* --- h) Nhóm lớp khai giống nhau gom một dòng --- */
  kt('Ba lớp khai giống nhau gom thành MỘT nhóm, sắp theo lớp', (() => {
    const app = mo2(gioRieng);
    const n = app.nhomGioRieng();
    return [n.length === 1 && n[0].ids.join(',') === BA.join(','),
            n.map(x => x.ids.length + ' lớp').join(' · ')];
  })());

  /* --- i1) Nhập Excel KHÔNG được lặng lẽ xoá giờ riêng ---
     Bộ dữ liệu đọc từ tệp Excel không mang trường này; hiểu "không có"
     thành "hãy xoá đi" là nhà trường nhập một tệp phân công xong mất luôn
     giờ học riêng của mấy lớp, mà không câu nào báo. */
  kt('Nạp bộ dữ liệu không mang trường ấy thì GIỮ NGUYÊN giờ riêng', (() => {
    const app = mo2(gioRieng);
    const truoc = app.sucChuaLop('lop_1A');
    app.napVaoS(JSON.parse(JSON.stringify(DL2)));      /* bộ mẫu, không có lopTiet */
    return [app.sucChuaLop('lop_1A') === truoc && app.coGioRieng('lop_1A'),
            `${truoc} → ${app.sucChuaLop('lop_1A')} ô`];
  })());
  kt('Bản sao để soát tệp nhập cũng mang theo, không làm rơi giữa đường', (() => {
    const app = mo2(gioRieng);
    const kho = app.chepKhoNguon();
    app.napMucVaoS({ kho });
    return [app.coGioRieng('lop_1A') && app.sucChuaLop('lop_1A') === 30,
            `${app.sucChuaLop('lop_1A')} ô`];
  })());
  kt('Lớp bị thay mất thì giờ riêng của nó cũng dọn theo, không để rác', (() => {
    const app = mo2(gioRieng);
    const kho = app.chepKhoNguon();
    kho.lop = kho.lop.filter(l => l.id !== 'lop_1A');
    app.napMucVaoS({ kho });
    return [!app.S.lopTiet['lop_1A'] && Object.keys(app.S.lopTiet).length === 2,
            `còn ${Object.keys(app.S.lopTiet).length} lớp khai riêng`];
  })());

  /* --- i2) Phép tính SỐ Ô của pha 0 cũng phải đếm theo lớp ---
     ⚠️ Phép thử đầu tiên của mục này bỏ sót đúng chỗ ấy: bẻ ngược
     `chiSo`/`chonBuoiNghi` về đếm theo khối mà cả 17 phép thử vẫn xanh, vì
     pha 0 mặc định TẮT nên không lần chạy nào đi qua. Cảnh dưới đây khai
     rộng giờ mà KHÔNG thêm tiết — đếm theo khối thì lớp dư 0 ô và không ai
     được nghỉ, đếm theo lớp thì dư 9 ô và có người nghỉ. */
  kt('Pha 0 đếm ô dôi ra theo GIỜ CỦA LỚP, không theo khung khối', (() => {
    const app = taoUngDung(documentGia, {}, async () => { throw new Error('không mạng'); });
    app.napVaoS(JSON.parse(JSON.stringify(DL2)));
    app.S.monHoc = app.dsMonMacDinh();
    const m = {};
    app.buoiBat().forEach(k => { m[app.khoaB(k)] = app.soTietBuoi(k, 1); });
    m['2-S'] = 5; m['3-S'] = 5; m['4-S'] = 5;
    app.datGioLop(BA, m);            /* rộng thêm 9 ô, phân công giữ nguyên */
    const r = app.chonBuoiNghi(1);
    return [r.datDu > 0 && r.hetO.length < app.S.lop.length,
            `${r.datDu} người được nghỉ · ${r.hetO.length} lớp hết ô`];
  })());

  /* --- i) R05 đo sức chứa theo LỚP, không theo khối --- */
  kt('R05 im lặng khi lớp đủ chỗ nhờ giờ riêng — trước đây nó báo oan', (() => {
    const app = mo2(gioRieng);
    const kq = app.kiemTra();
    return [!kq.vm.some(v => v.ma === 'R05'),
            kq.vm.filter(v => v.ma === 'R05').map(v => v.t).join(' · ') || 'không có R05'];
  })());
  kt('Nhưng vẫn nổ đúng khi phân công vượt quá giờ của chính lớp ấy', (() => {
    const app = mo2(gioRieng);
    const pc = app.S.phanCong.find(p => p.lopId === 'lop_1A' && p.mon === 'Tiếng Việt');
    pc.soTiet += 4;
    const kq = app.kiemTra();
    const v = kq.vm.find(x => x.ma === 'R05');
    return [!!v && /1A/.test(v.m), v ? v.t : 'không nổ'];
  })());
}

/* ---------- Tổng kết ---------- */
console.log(`\n\x1b[1mKết quả: ${dat} đạt, ${hong} hỏng\x1b[0m\n`);
process.exit(hong ? 1 : 0);

