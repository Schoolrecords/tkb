/* ==================================================================
   KIỂM ĐỊNH ĐỘC LẬP THUẬT TOÁN XẾP THỜI KHÓA BIỂU — npm run kiemdinh
   ------------------------------------------------------------------
   Khác `npm test` ở một điều cốt lõi: mọi phép soát ràng buộc ở đây
   VIẾT LẠI TỪ ĐẦU trên dữ liệu thô (S.tkb, S.phanCong, S.lopDT…),
   không dùng lại một hàm kiểm tra nào của thuật toán chính. Thuật toán
   tự chấm bài mình thì lỗi chung giữa "người làm" và "người chấm" sẽ
   lọt lưới; trình soát độc lập bịt đúng lỗ đó.

   Sáu kịch bản:
     A. Trường thật 25 lớp — xếp nhanh, soát + đo chất lượng
     B. Tất định: chạy hai lần phải ra Y HỆT từng ô
     C. Sáp nhập 60 lớp (thêm Diễn Đồng 17, Diễn Thái 18) — soát + đo
     D. Sáu hạt GRASP — bất biến với MỌI hạt, đo độ ổn định điểm phạt
     E. Xếp kỹ 12 giây — không bao giờ tệ hơn xếp nhanh
     F. Gây khó: giáo viên bộ môn bận dày đặc — ràng buộc cứng phải giữ
        nguyên, phần thiếu phải được BÁO đủ, không im lặng nuốt tiết
   ================================================================== */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const goc = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(goc, 'src/index.html'), 'utf8');

function vung(ten) {
  const d1 = html.indexOf(`/*#region ${ten}*/`);
  const d2 = html.indexOf(`/*#endregion ${ten}*/`);
  if (d1 < 0 || d2 < 0) { console.error(`Không tìm thấy mốc ${ten}`); process.exit(1); }
  return html.slice(d1, d2);
}
const oGia = () => ({ textContent:'', className:'', value:'', style:{},
  classList:{add(){},remove(){},toggle(){}}, appendChild(){}, onclick:null, onchange:null });
const documentGia = { querySelector: oGia, querySelectorAll: () => [], addEventListener(){} };

const NGUON_MA = `${vung('LOGIC')}\n${vung('DULIEU')}\n${vung('QUYEN')}\n; return {
  S, xepTuDong, xepDai, nhomDocLap, diemToanCuc, buoiBat, soTietBuoi,
  taoDuLieuThu, kiemTra, monCanPhong };`;
const taoUngDung = () => new Function('document', 'window', 'fetch', NGUON_MA)(documentGia);

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
const kt = (ten, dk, ghi = '') => {
  if (Array.isArray(dk)) [dk, ghi] = [dk[0], dk[1] ?? ghi];
  if (dk) { dat++; console.log(`  \x1b[32m✓\x1b[0m ${ten}${ghi ? ' — ' + ghi : ''}`); }
  else { hong++; console.log(`  \x1b[31m✗\x1b[0m ${ten}${ghi ? ' — ' + ghi : ''}`); }
};
const so = x => typeof x === 'number' && x % 1 ? x.toFixed(2) : String(x);

/* ==================================================================
   TRÌNH SOÁT ĐỘC LẬP — bảy ràng buộc cứng, viết từ dữ liệu thô
   ================================================================== */
function soatDocLap(u) {
  const { S } = u;
  const loi = [];
  const bb = u.buoiBat();                       /* chỉ đọc khung giờ, không phải logic xếp */
  const khungCua = (t, b) => bb.find(x => x.thu === t && x.buoi === b);

  /* Gom mọi ô thành danh sách phẳng {lopId, khoa, thu, buoi, tiet, gvId, mon} */
  const oTat = [];
  for (const [lopId, luoi] of Object.entries(S.tkb)) {
    for (const [khoa, v] of Object.entries(luoi)) {
      const [t, b, i] = khoa.split('-');
      oTat.push({ lopId, khoa, thu: +t, buoi: b, tiet: +i, gvId: v.gvId, mon: v.mon });
    }
  }

  /* V1 — ô phải nằm trong khung giờ của ĐÚNG khối lớp đó */
  for (const o of oTat) {
    const lop = S.lop.find(l => l.id === o.lopId);
    if (!lop) { loi.push(`V1: ô ${o.khoa} thuộc lớp không tồn tại ${o.lopId}`); continue; }
    const k = khungCua(o.thu, o.buoi);
    if (!k) { loi.push(`V1: lớp ${lop.ten} có tiết ở buổi ĐÃ TẮT ${o.thu}-${o.buoi}`); continue; }
    if (o.tiet >= u.soTietBuoi(k, lop.khoi))
      loi.push(`V1: lớp ${lop.ten} (khối ${lop.khoi}) có tiết ${o.khoa} vượt số tiết của khối`);
  }

  /* V2 — một giáo viên không dạy hai lớp cùng một ô giờ */
  const theoGVKhoa = {};
  for (const o of oTat) {
    const kh = `${o.gvId}|${o.khoa}`;
    if (theoGVKhoa[kh] && theoGVKhoa[kh] !== o.lopId)
      loi.push(`V2: giáo viên ${o.gvId} dạy HAI lớp cùng ô ${o.khoa}`);
    theoGVKhoa[kh] = o.lopId;
  }

  /* V3 — một giáo viên, một buổi, một phân hiệu */
  const dtBuoi = {};
  for (const o of oTat) {
    const kh = `${o.gvId}|${o.thu}-${o.buoi}`;
    (dtBuoi[kh] ||= new Set()).add(S.lopDT[o.lopId]);
  }
  for (const [kh, tap] of Object.entries(dtBuoi))
    if (tap.size > 1) loi.push(`V3: ${kh} có mặt ở ${tap.size} phân hiệu trong MỘT buổi`);

  /* V4 — phòng chức năng (chỉ khi trường đã khai bảng phòng):
     mỗi (phân hiệu · loại phòng · ô giờ) không quá số phòng hiện có,
     và không xếp môn cần phòng tại phân hiệu không có phòng loại đó */
  if ((S.phong || []).length) {
    const demPhong = {};
    (S.phong || []).forEach(p => { if (p.mon) demPhong[`${p.dtId}|${p.mon}`] = (demPhong[`${p.dtId}|${p.mon}`] || 0) + 1; });
    const chiem = {};
    for (const o of oTat) {
      const loai = u.monCanPhong(o.mon);
      if (!loai) continue;
      const dt = S.lopDT[o.lopId];
      const coPhong = demPhong[`${dt}|${loai}`] || 0;
      if (!coPhong) { loi.push(`V4: môn ${o.mon} xếp tại phân hiệu KHÔNG có phòng ${loai} (${o.khoa})`); continue; }
      const kh = `${dt}|${loai}|${o.khoa}`;
      chiem[kh] = (chiem[kh] || 0) + 1;
      if (chiem[kh] > coPhong) loi.push(`V4: ${kh} có ${chiem[kh]} lớp cùng dùng ${coPhong} phòng`);
    }
  }

  /* V5 — đúng bảng phân công: từng (lớp · môn) đúng SỐ TIẾT khi đã báo đủ,
     và MỖI Ô do đúng người được phân công dạy */
  const pcCua = {};
  S.phanCong.forEach(p => { pcCua[`${p.lopId}|${p.mon}`] = p; });
  const demO = {};
  for (const o of oTat) {
    const p = pcCua[`${o.lopId}|${o.mon}`];
    if (!p) { loi.push(`V5: ô ${o.khoa} dạy môn ${o.mon} KHÔNG có trong phân công của lớp`); continue; }
    if (p.gvId !== o.gvId) loi.push(`V5: ô ${o.khoa} môn ${o.mon} do NHẦM NGƯỜI dạy`);
    demO[`${o.lopId}|${o.mon}`] = (demO[`${o.lopId}|${o.mon}`] || 0) + 1;
  }

  /* V6 — buổi bận đã đăng ký là bất khả xâm phạm */
  for (const o of oTat)
    if ((S.gvNghi[o.gvId] || []).includes(`${o.thu}-${o.buoi}`))
      loi.push(`V6: giáo viên ${o.gvId} có tiết ${o.khoa} trong buổi ĐÃ BÁO BẬN`);

  /* V7 — tiết ghim theo quy định: chào cờ 2-S-0 và sinh hoạt lớp cuối sáng
     thứ Sáu là HDTN của giáo viên chủ nhiệm — trừ lớp mà chủ nhiệm bận
     đúng buổi đó (ngoại lệ hợp lệ, R11 sẽ cảnh báo riêng) */
  const canhBao = [];
  for (const l of S.lop) {
    const cn = S.giaoVien.find(g => g.cn === l.maLop);
    if (!cn) continue;
    const kiem = (khoa, ten) => {
      const v = (S.tkb[l.id] || {})[khoa];
      if (!v || v.mon !== 'HDTN' || v.gvId !== cn.id) canhBao.push(`V7: lớp ${l.ten} lệch tiết ${ten}`);
    };
    if (!(S.gvNghi[cn.id] || []).includes('2-S')) kiem('2-S-0', 'chào cờ');
    if (!(S.gvNghi[cn.id] || []).includes('6-S')) {
      const k6 = khungCua(6, 'S');
      if (k6) kiem(`6-S-${u.soTietBuoi(k6, l.khoi) - 1}`, 'sinh hoạt lớp');
    }
  }
  return { loi, canhBao, soO: oTat.length, demO, pcCua };
}

/* Đối chiếu "đủ tiết": daXep + phần báo thiếu phải đúng bằng tổng cần */
function soatDuTiet(u, kq, soat) {
  const loi = [];
  const thieuBao = (kq.chuaXep || []).reduce((s, x) => s + (x.con ?? x.soTiet ?? 0), 0);
  if (kq.daXep + thieuBao !== kq.tongCan)
    loi.push(`đã xếp ${kq.daXep} + báo thiếu ${thieuBao} ≠ tổng cần ${kq.tongCan}`);
  for (const p of u.S.phanCong) {
    const xep = soat.demO[`${p.lopId}|${p.mon}`] || 0;
    if (xep > p.soTiet) loi.push(`lớp ${p.lopId} môn ${p.mon} xếp ${xep} > phân công ${p.soTiet}`);
  }
  return loi;
}

/* ==================================================================
   ĐO CHẤT LƯỢNG PHƯƠNG ÁN — các ràng buộc mềm, đo từ dữ liệu thô
   ================================================================== */
function doChatLuong(u) {
  const { S } = u;
  const lichGV = {};
  for (const [lopId, luoi] of Object.entries(S.tkb))
    for (const [khoa, v] of Object.entries(luoi))
      (lichGV[v.gvId] ||= {})[khoa] = lopId;

  let trongKep = 0, doiDT = 0, nangSom = 0, nangTong = 0, chuoiDai = 0;
  for (const [gvId, o] of Object.entries(lichGV)) {
    const theoBuoi = {};
    for (const k of Object.keys(o)) {
      const [t, b, i] = k.split('-');
      (theoBuoi[`${t}-${b}`] ||= []).push(+i);
    }
    for (const ds of Object.values(theoBuoi)) {
      ds.sort((a, b) => a - b);
      trongKep += ds[ds.length - 1] - ds[0] + 1 - ds.length;
    }
    /* lượt đổi phân hiệu giữa hai buổi CÓ MẶT liên tiếp trong tuần */
    const tuan = [];
    for (let t = 2; t <= 6; t++) for (const b of ['S', 'C']) {
      const ky = theoBuoi[`${t}-${b}`];
      if (ky) tuan.push(S.lopDT[o[`${t}-${b}-${ky[0]}`]]);
    }
    for (let i = 1; i < tuan.length; i++) if (tuan[i] !== tuan[i - 1]) doiDT++;
  }
  for (const luoi of Object.values(S.tkb)) {
    const theoBuoi = {};
    for (const [k, v] of Object.entries(luoi)) {
      const [t, b, i] = k.split('-');
      (theoBuoi[`${t}-${b}`] ||= [])[+i] = v.mon;
      if (v.mon === 'Toán' || v.mon === 'Tiếng Việt') {
        nangTong++;
        if (b === 'S' && +i <= 2) nangSom++;
      }
    }
    for (const ds of Object.values(theoBuoi)) {
      let run = 1;
      for (let i = 1; i < ds.length; i++) {
        run = ds[i] && ds[i] === ds[i - 1] ? run + 1 : 1;
        if (run === 3) chuoiDai++;              /* đếm một lần cho mỗi chuỗi >2 */
      }
    }
  }
  return { trongKep, doiDT, nangSomPT: nangTong ? Math.round(100 * nangSom / nangTong) : 0, chuoiDai };
}

const inChiSo = (m, diem) => console.log(
  `    · điểm phạt ${so(diem)} · tiết trống kẹp ${m.trongKep} · lượt đổi phân hiệu ${m.doiDT}`
  + ` · Toán/TV vào tiết 1–3 sáng ${m.nangSomPT}% · chuỗi >2 tiết cùng môn ${m.chuoiDai}`);

/* ================================================================== */
console.log('\n\x1b[1mKIỂM ĐỊNH ĐỘC LẬP THUẬT TOÁN XẾP\x1b[0m');

/* ---------- A. Trường thật 25 lớp ---------- */
console.log('\nA. Trường thật Diễn Liên — 25 lớp · 710 tiết');
{
  const u = taoUngDung();
  const t0 = performance.now();
  const kq = u.xepTuDong();
  const ms = Math.round(performance.now() - t0);
  const s = soatDocLap(u);
  kt('Xếp trọn vẹn 710/710 tiết', kq.daXep === 710 && kq.tongCan === 710, `${kq.daXep}/${kq.tongCan} · ${ms}ms`);
  kt('Trình soát độc lập: KHÔNG một vi phạm ràng buộc cứng nào', s.loi.length === 0,
     s.loi.length ? s.loi.slice(0, 3).join(' | ') : `soát ${s.soO} ô · 7 nhóm ràng buộc`);
  kt('Tiết chào cờ và sinh hoạt lớp đúng chỗ ở CẢ 25 lớp', s.canhBao.length === 0,
     s.canhBao.slice(0, 3).join(' | ') || 'đủ 50 tiết ghim');
  kt('Sổ sách khớp: đã xếp + báo thiếu = tổng cần, không lớp nào xếp THỪA',
     soatDuTiet(u, kq, s).length === 0);
  const m = doChatLuong(u);
  /* Trần cấu trúc của dữ liệu thật ≈ 88,5%: hai cô Tiếng Anh kín 24/31 slot
     buộc phải chiếm ≥25 ô vàng, cộng Mỹ thuật · Đạo Đức · chào cờ. Đạt 88%
     là sát trần — tụt dưới 87% nghĩa là có ai đó làm hỏng thang điểm. */
  kt('Toán/TV vào tiết 1–3 sáng ≥ 87% (trần cấu trúc ~88,5%)', m.nangSomPT >= 87,
     `${m.nangSomPT}%`);
  inChiSo(m, u.diemToanCuc());
}

/* ---------- B. Tất định ---------- */
console.log('\nB. Tất định — cùng dữ liệu, hai lần chạy phải ra y hệt');
{
  /* ⚠️ So bằng hạn tối ưu 0. Bước hoán đổi dừng THEO ĐỒNG HỒ, nên hai lượt
     1200ms bị máy bận cắt ở hai điểm khác nhau là từng ô lệch — đỏ oan
     ~1/3 lần chạy. Cùng bài học phép thử mục 23 và mục 25 của kiem-thu:
     phần tất định (tham lam + ghim + pha 0) mới là thứ phải y hệt. */
  const a = taoUngDung(); a.xepTuDong(0);
  const b = taoUngDung(); b.xepTuDong(0);
  kt('Từng ô của hai lần chạy giống nhau tuyệt đối',
     JSON.stringify(a.S.tkb) === JSON.stringify(b.S.tkb));
}

/* ---------- C. Sáp nhập 60 lớp ---------- */
const dungThu = u => {
  u.taoDuLieuThu('Phân hiệu Diễn Đồng', 'DĐ', 17, true);
  u.taoDuLieuThu('Phân hiệu Diễn Thái', 'DT', 18, true);
};
console.log('\nC. Sáp nhập ba phân hiệu — 60 lớp');
let diemNhanh60 = 0;
{
  const u = taoUngDung();
  dungThu(u);
  const t0 = performance.now();
  const kq = u.xepTuDong();
  const giay = ((performance.now() - t0) / 1000).toFixed(1);
  const s = soatDocLap(u);
  diemNhanh60 = u.diemToanCuc();
  kt('Xếp trọn vẹn toàn bộ tiết ở quy mô 60 lớp', kq.daXep === kq.tongCan,
     `${kq.daXep}/${kq.tongCan} tiết · ${giay} giây`);
  kt('KHÔNG một vi phạm nào — kể cả "một buổi một phân hiệu" và phòng Tin',
     s.loi.length === 0, s.loi.slice(0, 3).join(' | ') || `soát ${s.soO} ô`);
  kt('Tách đúng các nhóm độc lập theo phân hiệu', (() => {
    const n = u.nhomDocLap().map(x => x.length).sort((a, b) => b - a);
    return n.length >= 3;
  })(), u.nhomDocLap().map(x => x.length).join(' · ') + ' lớp');
  const m = doChatLuong(u);
  kt('Toán/TV vào tiết 1–3 sáng ≥ 89% ở quy mô 60 lớp', m.nangSomPT >= 89, `${m.nangSomPT}%`);
  inChiSo(m, diemNhanh60);
}

/* ---------- D. Sáu hạt GRASP ---------- */
console.log('\nD. Sáu hạt ngẫu nhiên — bất biến phải giữ với MỌI hạt');
{
  const diemHat = [];
  let loiHat = 0, thieuHat = 0;
  for (const hat of [7, 42, 101, 555, 2026, 99991]) {
    const u = taoUngDung();
    dungThu(u);
    const kq = u.xepTuDong(700, { hat, nhieu: 10 });
    const s = soatDocLap(u);
    if (s.loi.length) loiHat++;
    if (kq.daXep !== kq.tongCan) thieuHat++;
    diemHat.push(u.diemToanCuc());
  }
  const min = Math.min(...diemHat), max = Math.max(...diemHat);
  kt('Cả 6 hạt đều 0 vi phạm ràng buộc cứng', loiHat === 0, `${6 - loiHat}/6 hạt sạch`);
  kt('Cả 6 hạt đều xếp trọn vẹn', thieuHat === 0);
  kt('Điểm phạt ổn định giữa các hạt (chênh dưới 15%)', (max - min) / min < 0.15,
     `từ ${so(min)} tới ${so(max)} (chênh ${so(100 * (max - min) / min)}%)`);
}

/* ---------- E. Xếp kỹ ---------- */
console.log('\nE. Xếp kỹ 12 giây — không bao giờ tệ hơn xếp nhanh');
{
  const u = taoUngDung();
  dungThu(u);
  const kq = u.xepDai({ giay: 12, soPhuongAn: 3 });
  const totNhat = kq.phuongAn?.[0];
  kt('Ra nhiều phương án để người xếp chọn', (kq.phuongAn || []).length >= 2,
     `${(kq.phuongAn || []).length} phương án · ${kq.lanThu} lần thử`);
  kt('Phương án tốt nhất không thiếu tiết nào', totNhat && totNhat.thieu === 0);
  kt('Điểm phương án tốt nhất ≤ điểm xếp nhanh', totNhat && totNhat.diem <= diemNhanh60 + 1e-6,
     `${so(totNhat?.diem)} so với ${so(diemNhanh60)}`);
}

/* ---------- F. Gây khó ---------- */
console.log('\nF. Gây khó — giáo viên bộ môn bận dày đặc, thuật toán phải TRUNG THỰC');
{
  const u = taoUngDung();
  /* Mọi giáo viên KHÔNG chủ nhiệm bận 2 buổi cố định (tất định theo thứ tự) */
  const boMon = u.S.giaoVien.filter(g => !g.cn);
  const cacBuoi = ['2-S', '2-C', '3-S', '3-C', '5-S', '5-C', '6-S'];
  boMon.forEach((g, i) => {
    u.S.gvNghi[g.id] = [cacBuoi[i % cacBuoi.length], cacBuoi[(i + 3) % cacBuoi.length]];
  });
  const kq = u.xepTuDong();
  const s = soatDocLap(u);
  kt('Bận dày đặc vẫn KHÔNG vi phạm ràng buộc nào — kể cả buổi bận', s.loi.length === 0,
     s.loi.slice(0, 3).join(' | ') || `${boMon.length} giáo viên bộ môn bận 2 buổi/người`);
  kt('Phần xếp được vẫn cao, phần thiếu được BÁO đủ, sổ sách khớp',
     soatDuTiet(u, kq, s).length === 0 && kq.daXep >= kq.tongCan * 0.9,
     `${kq.daXep}/${kq.tongCan} tiết · báo thiếu ${kq.chuaXep.length} trường hợp`);
}

/* ---------- G. Giáo viên LIÊN PHÂN HIỆU ---------- */
console.log('\nG. Giáo viên liên phân hiệu — ràng buộc lõi phải bị thử thách THẬT');
{
  /* Bộ dữ liệu thử cắt giáo viên gọn theo từng phân hiệu, nên hai kịch
     bản trên thoả ràng buộc "một buổi một phân hiệu" một cách tầm thường.
     Ở đây ép cho nó hoạt động thật: chuyển 4 lớp môn Âm nhạc của Diễn Đồng
     sang cô Âm nhạc của Diễn Thái — một người dạy HAI phân hiệu. */
  const u = taoUngDung();
  dungThu(u);
  const { S } = u;
  const dtDD = S.diemTruong.find(d => /Diễn Đồng/.test(d.ten)).id;
  const dtDT = S.diemTruong.find(d => /Diễn Thái/.test(d.ten)).id;
  const gvDayMon = (dt, mon) => {
    const dem = {};
    S.phanCong.forEach(p => { if (p.mon === mon && S.lopDT[p.lopId] === dt) dem[p.gvId] = (dem[p.gvId] || 0) + 1; });
    return Object.entries(dem).sort((a, b) => b[1] - a[1])[0]?.[0];
  };
  const gvNhan = gvDayMon(dtDT, 'Âm nhạc');            /* cô Diễn Thái nhận thêm */
  const gvNhuong = gvDayMon(dtDD, 'Âm nhạc');
  const chuyen = S.phanCong.filter(p => p.mon === 'Âm nhạc' && p.gvId === gvNhuong).slice(0, 4);
  chuyen.forEach(p => { p.gvId = gvNhan; });

  const kq = u.xepTuDong();
  const s = soatDocLap(u);
  const m = doChatLuong(u);
  /* Cô nhận thêm giờ thật sự hiện diện ở HAI phân hiệu trong tuần */
  const dtCua = new Set();
  for (const luoi of Object.values(S.tkb))
    for (const v of Object.values(luoi))
      if (v.gvId === gvNhan) dtCua.add(S.lopDT[Object.keys(S.tkb).find(l => S.tkb[l] === luoi)]);
  kt('Xếp gần trọn dù một người gánh hai phân hiệu',
     kq.daXep >= kq.tongCan - 4, `${kq.daXep}/${kq.tongCan} tiết`);
  kt('KHÔNG vi phạm nào — mỗi buổi cô ấy chỉ ở đúng MỘT phân hiệu',
     s.loi.length === 0, s.loi.slice(0, 3).join(' | ') || 'soát cả 7 nhóm ràng buộc');
  kt('Cô ấy thật sự dạy ở HAI phân hiệu trong tuần — phép thử không còn tầm thường',
     dtCua.size === 2, `có mặt tại ${dtCua.size} phân hiệu`);
  kt('Sổ sách vẫn khớp tuyệt đối', soatDuTiet(u, kq, s).length === 0);
  console.log(`    · lượt đổi phân hiệu toàn trường: ${m.doiDT} (phải > 0 mới là thử thật)`);
}

console.log(`\nKết quả kiểm định: ${dat} đạt, ${hong} hỏng\n`);
process.exit(hong ? 1 : 0);
