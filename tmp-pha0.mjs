/* NGUYÊN MẪU PHA 0 — chọn buổi nghỉ cho từng giáo viên TRƯỚC khi xếp.
   Thuật toán đã tôn trọng `S.gvNghi` như ràng buộc cứng, nên pha này chỉ cần
   nạp thêm buổi nghỉ vào đó rồi gọi xepTuDong() y như cũ — không sửa một dòng
   nào của bước tham lam hay bước hoán đổi. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const goc = join(dirname(fileURLToPath(import.meta.url)), '.');
const html = readFileSync(join(goc, 'src/index.html'), 'utf8');
const vung = t => {
  const a = html.indexOf(`/*#region ${t}*/`), b = html.indexOf(`/*#endregion ${t}*/`);
  return html.slice(a, b);
};
const oGia = () => ({ textContent: '', className: '', value: '', style: {},
  classList: { add() {}, remove() {}, toggle() {} }, appendChild() {}, onclick: null, onchange: null });
const doc = { querySelector: oGia, querySelectorAll: () => [], addEventListener() {} };
const MA = `${vung('LOGIC')}\n${vung('DULIEU')}\n; return { S, xepTuDong, napVaoS, buoiBat,
  soTietBuoi, khoaB, taoDuLieuThu, diemToanCuc, lopId, gvId, GIOI_HAN_TIET_BUOI, viecGoBiXep, khungGioMacDinh };`;
const moApp = () => new Function('document', 'window', 'fetch', MA)(doc, {}, async () => { throw 0; });

/* ================== PHA 0 ==================
   Mục tiêu: mỗi giáo viên nghỉ ít nhất `soNghi` buổi, mà lưới vẫn xếp đủ.

   Hai điều kiện phải giữ, cả hai đều là điều kiện CẦN:
   a) Bản thân giáo viên còn đủ chỗ: số buổi còn lại × tiết dài nhất ≥ tiết của họ.
   b) Mỗi LỚP họ dạy vẫn còn người phủ buổi ấy: tổng tiết của những giáo viên
      CÒN LẠI ở lớp đó phải đủ cho số ô của lớp trong buổi ấy — cộng dồn qua
      các buổi, vì một người dạy được nhiều buổi. */
function chonBuoiNghi(A, soNghi, BIEN) {
  const S = A.S, bb = A.buoiBat();
  const kB = k => A.khoaB(k);
  /* tiết của từng giáo viên, và theo lớp */
  const tietGV = {}, tietGVLop = {}, tietLop = {};
  S.phanCong.forEach(p => {
    tietGV[p.gvId] = (tietGV[p.gvId] || 0) + p.soTiet;
    ((tietGVLop[p.gvId] ||= {})[p.lopId] = (tietGVLop[p.gvId]?.[p.lopId] || 0) + p.soTiet);
    tietLop[p.lopId] = (tietLop[p.lopId] || 0) + p.soTiet;
  });
  /* số ô của mỗi lớp trong mỗi buổi */
  const oLopBuoi = {};
  S.lop.forEach(l => { oLopBuoi[l.id] = {};
    bb.forEach(k => { oLopBuoi[l.id][kB(k)] = A.soTietBuoi(k, l.khoi); }); });

  /* Sức phủ hiện có của mỗi (lớp, buổi): tổng tiết của giáo viên còn dạy buổi ấy.
     Ban đầu mọi người đều dạy được mọi buổi (trừ buổi đã đăng ký bận). */
  const nghi = {};                       /* gvId -> Set(khoá buổi) */
  const banSan = g => new Set(S.gvNghi[g] || []);
  S.giaoVien.forEach(g => { nghi[g.id] = banSan(g.id); });

  /* Ai còn dạy được lớp nào ở buổi nào */
  const gvCuaLop = {};
  S.phanCong.forEach(p => (gvCuaLop[p.lopId] ||= []).push(p.gvId));

  /* ⚠️ SỨC PHỦ CỦA MỘT BUỔI KHÔNG PHẢI TỔNG TIẾT. Một cô 12 tiết Tiếng Việt
     ở lớp 1A chỉ phủ được nhiều nhất 4 ô trong một buổi 4 tiết, chứ không
     phải 12. Bản đầu cộng tổng nên tưởng lớp nào cũng thừa người, cho nghỉ
     thoải mái, rồi mất 54 tiết lúc xếp thật. */
  const sucPhu = (lp, k, boGV) => {
    const o = oLopBuoi[lp][kB(k)];
    return (gvCuaLop[lp] || []).reduce((s, gv) => {
      if (gv === boGV || nghi[gv].has(kB(k))) return s;
      return s + Math.min(tietGVLop[gv]?.[lp] || 0, o);
    }, 0);
  };
  /* Và chiều ngược lại: chính giáo viên ấy còn đủ chỗ trong lớp ấy không */
  const chocuaGV = (gv, lp, boBuoi) => bb.reduce((s, k) => {
    if (kB(k) === kB(boBuoi) || nghi[gv].has(kB(k))) return s;
    return s + Math.min(tietGVLop[gv]?.[lp] || 0, oLopBuoi[lp][kB(k)]);
  }, 0);

  /* ⚠️ ĐIỀU KIỆN TOÀN TRƯỜNG — thứ mà phép kiểm theo từng lớp KHÔNG thấy.
     Cô Mỹ thuật còn dạy được lớp 1A ở chiều thứ Hai, nên xét riêng lớp 1A thì
     buổi ấy "vẫn đủ người". Nhưng cô chỉ ở được MỘT lớp một tiết, mà cả 25
     lớp đều trông vào cô. Bản đầu thiếu phép kiểm này nên 20/35 thầy cô cùng
     chọn nghỉ chiều thứ Hai — buổi ấy cả trường vắng, 54 tiết không ai dạy.
     Sức của một buổi = tổng (tiết của mỗi người, chặn trên bởi số tiết buổi);
     nhu cầu = tổng ô của mọi lớp trong buổi ấy. */
  const cauBuoi = {};
  bb.forEach(k => { cauBuoi[kB(k)] = S.lop.reduce((s, l) => s + oLopBuoi[l.id][kB(k)], 0); });
  const cungBuoi = (k, boGV) => S.giaoVien.reduce((s, gv) => {
    if (gv.id === boGV || nghi[gv.id].has(kB(k))) return s;
    return s + Math.min(tietGV[gv.id] || 0, k.tiet);
  }, 0);

  /* Đếm để RẢI ĐỀU — không thì ai cũng chọn đúng buổi rẻ nhất */
  const demNghi = {};
  bb.forEach(k => { demNghi[kB(k)] = 0; });
  S.giaoVien.forEach(g => nghi[g.id].forEach(k => { demNghi[k] = (demNghi[k] || 0) + 1; }));

  /* Xử người KHÓ trước — ít chỗ xoay nhất thì phải được chọn trước.
     Độ khó = tiết nhiều, và số buổi còn dùng được ít. */
  const dai = Math.max(...bb.map(k => k.tiet));
  const ds = S.giaoVien.filter(g => tietGV[g.id] > 0)
    .sort((a, b) => (tietGV[b.id] - tietGV[a.id]));

  let datDu = 0;
  for (const g of ds) {
    const T = tietGV[g.id];
    for (let lan = 0; lan < soNghi; lan++) {
      const con = bb.filter(k => !nghi[g.id].has(kB(k)));
      /* (a) bỏ thêm một buổi thì bản thân họ còn đủ chỗ không */
      const ungVien = con.filter(k => {
        const conLai = con.filter(x => x !== k);
        const sucChua = conLai.reduce((s, x) => s + Math.min(x.tiet, dai), 0);
        if (sucChua < T) return false;
        /* (b) mỗi lớp họ dạy: buổi ấy còn ai phủ nổi, VÀ chính họ còn chỗ
           để dồn số tiết của lớp ấy vào các buổi còn lại */
        /* (c) toàn trường: buổi ấy còn đủ sức dạy cho MỌI lớp */
        if (cungBuoi(k, g.id) < cauBuoi[kB(k)]) return false;
        /* (d) ⚠️ PHÉP TÍNH QUYẾT ĐỊNH, không phải thuật toán.
           Lớp có O ô cho `tietCan` tiết. Bỏ buổi k đi thì còn O − O_k ô. Nếu
           chỗ ấy không đủ cho toàn bộ tiết của lớp thì cho ai nghỉ cũng là
           mất tiết — không có cách xếp nào cứu được.
           Lưới Diễn Liên có ĐÚNG 27/28/30 ô cho 27/28/30 tiết, dư 0 ô, nên
           điều kiện này chặn sạch: không ai nghỉ được, và 710/710 giữ nguyên.
           Mở thêm một buổi chiều (dư 3 ô) là 35/35 thầy cô nghỉ được mà vẫn
           710/710. Đo được cả hai chiều. */
        if (Object.keys(tietGVLop[g.id] || {}).some(lp => {
          /* CỘNG DỒN mọi buổi người này đã nghỉ, không xét riêng buổi mới —
             nghỉ hai buổi 3 ô rồi 2 ô là mất 5 ô, kiểm rời từng cái thì cái
             nào cũng lọt. Đo được: kiểm rời thì nghỉ 2 buổi mất 14 tiết. */
          const conO = bb.reduce((s2, x) =>
            (nghi[g.id].has(kB(x)) || kB(x) === kB(k)) ? s2 : s2 + oLopBuoi[lp][kB(x)], 0);
          return conO < tietLop[lp];
        })) return false;
        return Object.keys(tietGVLop[g.id] || {}).every(lp =>
          sucPhu(lp, k, g.id) >= oLopBuoi[lp][kB(k)]
          && chocuaGV(g.id, lp, k) >= tietGVLop[g.id][lp]);
      });
      if (!ungVien.length) break;
      /* Chọn buổi ít gây hại nhất: buổi ngắn thì rẻ, nhưng buổi đã đông người
         nghỉ thì đắt — cả trường dồn vào một buổi là buổi ấy vỡ. */
      const hai = k => k.tiet
        + 3 * Object.keys(tietGVLop[g.id] || {}).reduce((s, lp) => s
            + (gvCuaLop[lp] || []).filter(gv => gv !== g.id && nghi[gv].has(kB(k))).length, 0)
        + 0.5 * demNghi[kB(k)];
      ungVien.sort((a, b) => hai(a) - hai(b));
      const chon = ungVien[0];
      nghi[g.id].add(kB(chon));
      demNghi[kB(chon)]++;
    }
    if (nghi[g.id].size - banSan(g.id).size >= soNghi) datDu++;
  }
  return { nghi, datDu, tong: ds.length };
}

function soi(A, banDau) {
  const bb = A.buoiBat(), soBuoi = bb.length;
  const chiem = {}; let daXep = 0;
  A.S.lop.forEach(l => Object.entries(A.S.tkb[l.id] || {}).forEach(([k, v]) => {
    daXep++; const p = k.split('-');
    (chiem[v.gvId] ||= new Set()).add(`${p[0]}-${p[1]}`);
  }));
  const thuc = Object.values(chiem).map(s => s.size), n = thuc.length;
  return { daXep, n, soBuoi,
    kin: thuc.filter(x => x >= soBuoi).length,
    tr1: thuc.filter(x => x <= soBuoi - 1).length,
    tr2: thuc.filter(x => x <= soBuoi - 2).length,
    diem: Math.round(A.diemToanCuc()) };
}

const DL = JSON.parse(readFileSync(join(goc, 'data/truong-dien-lien.json'), 'utf8'));

const chay = (ten, can, dung) => {
  console.log(`\n${ten}`);
  console.log('nghỉ/biên  pha0 đạt   xếp được    kín tuần  trống≥1  trống≥2  điểm phạt');
  for (const [soNghi, BIEN] of [[0,0],[1,0],[2,0]]) {
    const A = moApp(); dung(A);
    let p0 = { datDu: '—', tong: '' };
    if (soNghi > 0) {
      p0 = chonBuoiNghi(A, soNghi, BIEN);
      A.S.gvNghi = Object.fromEntries(Object.entries(p0.nghi).map(([k, v]) => [k, [...v]]));
    }
    const kq = A.xepTuDong(1200);
    const r = soi(A);
    if (false) {
      const pb = {};
      Object.values(p0.nghi).forEach(v => [...v].forEach(k => { pb[k] = (pb[k]||0)+1; }));
      console.log('   phân bố buổi nghỉ:', JSON.stringify(pb));
      const go = A.viecGoBiXep(kq.chuaXep || []);
      (go||[]).slice(0,5).forEach(x => console.log('   kẹt:', String(x.tieu||x.t||JSON.stringify(x)).slice(0,110)));
    }
    console.log((String(soNghi)+'/b'+BIEN).padStart(6)
      + String(soNghi ? `${p0.datDu}/${p0.tong}` : '—').padStart(10)
      + String(`${r.daXep}/${can}`).padStart(12)
      + String(`${r.kin}/${r.n}`).padStart(11)
      + String(`${r.tr1}/${r.n}`).padStart(9)
      + String(`${r.tr2}/${r.n}`).padStart(9)
      + String(r.diem).padStart(11));
  }
};

chay('DIỄN LIÊN THẬT — 25 lớp · 8 buổi/tuần · khung giờ KÍN, dư 0 ô', 710, A => A.napVaoS(DL));

/* GIẢ THUYẾT CUỐI: nút thắt không phải thuật toán mà là SỐ Ô. Lưới Diễn Liên
   có đúng 27/28/30 ô cho 27/28/30 tiết — dư 0. Mở thêm một buổi chiều là lớp
   dư ô, và lúc ấy cho nghỉ mới có chỗ mà dồn. */
chay('DIỄN LIÊN + MỞ THÊM CHIỀU THỨ TƯ (3 tiết) — lớp dư 3 ô', 710, A => {
  A.napVaoS(DL);
  const k = A.S.khungGio.find(x => +x.thu === 4 && x.buoi === 'C');
  if (k) { k.bat = true; k.tiet = 3; k.tietKhoi = null; }
  else A.S.khungGio.push({ thu: 4, buoi: 'C', tiet: 3, bat: true, tietKhoi: null });
});
chay('BA PHÂN HIỆU — 60 lớp · 8 buổi/tuần', 1698, A => {
  A.napVaoS(DL);
  A.taoDuLieuThu('Diễn Đồng', 'DĐ', 17, true);
  A.taoDuLieuThu('Diễn Thái', 'DT', 18, false);
});
