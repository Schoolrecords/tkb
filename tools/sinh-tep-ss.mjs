/* ==================================================================
   SINH BỘ TỆP EXCEL ĐỂ NHẬP VÀO SMARTSCHEDULER
   Chạy: node tools/sinh-tep-ss.mjs <đường-dẫn-truong.json>
   ------------------------------------------------------------------
   Đọc MỘT tệp khai báo của nhà trường, xuất ra năm tệp .xlsx đúng
   khuôn SmartScheduler đòi, và kiểm chéo trước khi ghi.

   Vì sao cần: nhập tay vào SmartScheduler là chín bước, mỗi bước một
   hộp thoại; và phần mềm BỎ QUA âm thầm mọi thứ nó không nhận ra —
   sai một tên môn là mất mấy tiết mỗi lớp mà bảng vẫn trông bình
   thường. Mọi phép kiểm ở đây sinh ra từ đúng những chỗ đã trả giá
   ngày 1/9/2026 (Trường TH Thần Lĩnh 1).
   ================================================================== */
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const goc = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const XLSX = createRequire(join(goc, 'x.js'))('xlsx');

/* ---------- Tên môn: nhà trường quen gọi → tên CHUẨN của SmartScheduler ----------
   ⚠️ Đây là chỗ nguy hiểm nhất. Phần mềm chỉ nhận môn có trong danh mục;
   môn lạ bị bỏ KHÔNG BÁO LỖI. Bảng này là bộ 17 môn dựng sẵn của nó. */
const TEN_CHUAN = {
  'Tiếng Việt': 'Tiếng Việt',
  'Toán': 'Toán',
  'Tiếng Anh': 'Ngoại ngữ',            // ⚠️ phần mềm gọi là "Ngoại ngữ"
  'Ngoại ngữ': 'Ngoại ngữ',
  'Đạo đức': 'Đạo đức', 'Đạo Đức': 'Đạo đức',
  'TNXH': 'Tự nhiên và Xã hội', 'Tự nhiên và Xã hội': 'Tự nhiên và Xã hội',
  'Lịch sử': 'Lịch sử và Địa lý', 'Địa lí': 'Lịch sử và Địa lý',
  'Địa lý': 'Lịch sử và Địa lý', 'LS&ĐL': 'Lịch sử và Địa lý',
  'Lịch sử và Địa lý': 'Lịch sử và Địa lý',
  'Khoa học': 'Khoa học',
  'GDTC': 'Giáo dục thể chất', 'Giáo dục thể chất': 'Giáo dục thể chất',
  'Mĩ thuật': 'Mĩ thuật', 'Mỹ thuật': 'Mĩ thuật',
  'Âm nhạc': 'Âm nhạc', 'Nhạc': 'Âm nhạc',
  'HĐTN': 'Hoạt động trải nghiệm', 'HDTN': 'Hoạt động trải nghiệm',
  'Hoạt động trải nghiệm': 'Hoạt động trải nghiệm',
  'Tiếng dân tộc': 'Tiếng dân tộc',
  'Hoạt động củng cố, tăng cường': 'Hoạt động củng cố, tăng cường',
  'Tin học và Công nghệ': 'Tin học và Công nghệ',
};
/* 17 môn phần mềm dựng sẵn — KHÔNG khai lại, chỉ khai thêm môn ngoài danh sách */
const MON_CO_SAN = [
  ['Chào cờ', 'ChCờ', ''], ['Sinh hoạt lớp', 'SHL', ''], ['Ngoài giờ lên lớp', 'NGLL', ''],
  ['Tiếng Việt', 'TViệt', 'x'], ['Toán', 'Toán', 'x'], ['Ngoại ngữ', 'NNgữ', 'x'],
  ['Đạo đức', 'ĐĐức', 'x'], ['Tự nhiên và Xã hội', 'TNXH', 'x'],
  ['Lịch sử và Địa lý', 'LSĐL', 'x'], ['Khoa học', 'KH', 'x'],
  ['Tin học và Công nghệ', 'THCN', 'x'], ['Giáo dục thể chất', 'GDTC', 'x'],
  ['Mĩ thuật', 'MT', 'x'], ['Âm nhạc', 'Nhạc', 'x'], ['Tiếng dân tộc', 'TDT', 'x'],
  ['Hoạt động củng cố, tăng cường', 'HĐTC', 'x'], ['Hoạt động trải nghiệm', 'HĐTN', 'x'],
];
/* Mã gợi ý cho môn nhà trường tự thêm; không có thì lấy 5 chữ đầu */
const MA_THEM = {
  'Tin học': 'THọc', 'Công nghệ': 'CNghệ',
  'KN Công dân số': 'KNCDS', 'Hướng dẫn tự học': 'HDTH',
};

/* ---------- Đọc khai báo ---------- */
const tepKhai = process.argv[2];
if (!tepKhai) {
  console.error('Thiếu tham số. Cách dùng:\n  node tools/sinh-tep-ss.mjs <truong.json>');
  console.error('Xem mẫu khai báo ở docs/nhap-lieu-smartscheduler.md');
  process.exit(1);
}
if (!existsSync(tepKhai)) { console.error('Không thấy tệp: ' + tepKhai); process.exit(1); }
const T = JSON.parse(readFileSync(tepKhai, 'utf8'));

const OUT = T.thuMuc || dirname(resolve(tepKhai));
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

/* ---------- Khung giờ ---------- */
const KG = T.khungGio || {};
const sangThu  = KG.sangThu  || [2, 3, 4, 5, 6];
const chieuThu = KG.chieuThu || [2, 3, 4, 5];
const sangTiet = KG.sangTiet ?? 4;
const chieuTiet = KG.chieuTiet ?? 3;
const luoiTiet = KG.luoiTiet ?? 5;      // số hàng tiết mỗi buổi trong lưới phần mềm
const sucChua = sangThu.length * sangTiet + chieuThu.length * chieuTiet;

/* ---------- Chuẩn hoá phân công ---------- */
const chuaDich = new Set();
const pcGop = {}, thuTuPC = [];
for (const p of T.phanCong) {
  const mon = TEN_CHUAN[p.mon] || p.mon;
  if (!TEN_CHUAN[p.mon] && !MA_THEM[p.mon] && !(T.monThem || []).includes(p.mon))
    chuaDich.add(p.mon);
  const k = `${p.lop}|${mon}|${p.gv}`;
  if (!pcGop[k]) { pcGop[k] = { lop: p.lop, mon, gv: p.gv, soTiet: 0, gioiHan: p.gioiHan }; thuTuPC.push(k); }
  pcGop[k].soTiet += Number(p.soTiet) || 0;   // Lịch sử + Địa lí gộp lại thành một môn
}
const PC = thuTuPC.map(k => pcGop[k]);

/* Môn phải khai thêm = môn đang dùng nhưng không có trong 17 môn dựng sẵn */
const tenCoSan = new Set(MON_CO_SAN.map(m => m[0]));
const monThem = [...new Set(PC.map(p => p.mon))].filter(m => !tenCoSan.has(m));

/* ---------- KIỂM TRA (chạy trước khi ghi bất cứ tệp nào) ---------- */
let loi = 0;
const bao = (ok, c) => { console.log((ok ? '  \x1b[32m✓\x1b[0m ' : '  \x1b[31m✗\x1b[0m ') + c); if (!ok) loi++; };

console.log(`\n\x1b[1m═══ ${T.tenTruong} ═══\x1b[0m`);
console.log(`  ${T.lop.length} lớp · ${T.giaoVien.length} giáo viên · ${PC.length} dòng phân công`);
console.log(`  Khung giờ: sáng ${sangThu.length} buổi × ${sangTiet} tiết + chiều ${chieuThu.length} buổi × ${chieuTiet} tiết = ${sucChua} ô\n`);

console.log('\x1b[1m── Kiểm dữ liệu ──\x1b[0m');
bao(chuaDich.size === 0,
  'Mọi tên môn đều dịch được: ' + (chuaDich.size ? [...chuaDich].join(', ') + ' — thêm vào "monThem" hoặc sửa tên' : 'đạt'));

/* Khung giờ phải nằm lọt trong lưới của phần mềm, kiểm TRƯỚC khi ghi tệp nào */
bao(sangTiet <= luoiTiet && chieuTiet <= luoiTiet,
  `Số tiết mỗi buổi (sáng ${sangTiet} · chiều ${chieuTiet}) không vượt lưới ${luoiTiet} tiết của phần mềm`);
bao(sangThu.every(t => t >= 2 && t <= 7) && chieuThu.every(t => t >= 2 && t <= 7),
  'Các thứ khai báo đều nằm trong khoảng thứ 2 đến thứ 7');

const maGV = T.giaoVien.map(g => g.ma);
bao(new Set(maGV).size === maGV.length,
  'Mã giáo viên không trùng: ' + (maGV.filter((m, i) => maGV.indexOf(m) !== i).join(', ') || 'đạt'));

const tenLop = T.lop.map(l => l.ten);
bao(new Set(tenLop).size === tenLop.length, 'Tên lớp không trùng');

const laLop = new Set(tenLop), laGV = new Set(maGV);
const lacLop = [...new Set(PC.filter(p => !laLop.has(p.lop)).map(p => p.lop))];
const lacGV  = [...new Set(PC.filter(p => !laGV.has(p.gv)).map(p => p.gv))];
bao(!lacLop.length, 'Phân công không nhắc lớp lạ: ' + (lacLop.join(', ') || 'đạt'));
bao(!lacGV.length,  'Phân công không nhắc giáo viên lạ: ' + (lacGV.join(', ') || 'đạt'));

/* ⚠️ Phép kiểm quan trọng nhất: tổng tiết mỗi lớp phải KHỚP sức chứa lưới.
   Thiếu thì lớp có giờ trống; thừa thì xếp không hết mà phần mềm không nói gì. */
const lechLop = [];
for (const l of T.lop) {
  const n = PC.filter(p => p.lop === l.ten).reduce((a, p) => a + p.soTiet, 0);
  if (n !== sucChua) lechLop.push(`${l.ten}=${n}`);
}
bao(!lechLop.length, `Mọi lớp đúng ${sucChua} tiết: ` + (lechLop.join(' · ') || `cả ${T.lop.length} lớp`));

/* Số tiết từng người phải khớp con số nhà trường khai — bắt lỗi chia nhầm lớp */
const lechGV = [];
for (const g of T.giaoVien) {
  if (g.tiet == null) continue;
  const n = PC.filter(p => p.gv === g.ma).reduce((a, p) => a + p.soTiet, 0);
  if (n !== g.tiet) lechGV.push(`${g.ma} ${n}≠${g.tiet}`);
}
bao(!lechGV.length, 'Mọi thầy cô đúng số tiết đã khai: ' + (lechGV.join(' · ') || 'đạt'));

const vuot = T.giaoVien.filter(g => {
  const n = PC.filter(p => p.gv === g.ma).reduce((a, p) => a + p.soTiet, 0);
  return n > (T.dinhMuc ?? 23);
}).map(g => g.ma);
bao(!vuot.length, `Không ai vượt định mức ${T.dinhMuc ?? 23} tiết: ` + (vuot.join(', ') || 'đạt'));

if (loi) { console.log(`\n\x1b[31m*** CÒN ${loi} CHỖ SAI — chưa ghi tệp nào ***\x1b[0m\n`); process.exit(1); }

/* ---------- GHI NĂM TỆP ---------- */
const ghi = (ten, hang, cols, phu) => {
  const ws = XLSX.utils.aoa_to_sheet(hang);
  if (cols) ws['!cols'] = cols;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, phu?.tenTrang || '###');
  if (phu?.dm) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(phu.dm), 'DM');
  XLSX.writeFile(wb, join(OUT, ten));
  return ten;
};
const daGhi = [];

/* 1. Giáo viên — Họ đệm và Tên là HAI cột riêng */
const tachTen = ht => { const p = String(ht).trim().split(/\s+/); return [p.slice(0, -1).join(' '), p.at(-1)]; };
daGhi.push(ghi('1 - Danh sach GV.xlsx', [
  ['TT', 'Họ đệm', 'Tên', 'Mã GV', 'Mã GV 2', 'Điện thoại di động', 'Email', 'Zalo UID', 'Ghi chú'],
  ...T.giaoVien.map((g, i) => {
    const [hd, t] = tachTen(g.hoTen);
    /* Ghi kèm lớp chủ nhiệm cho dễ đọc. Phần mềm tự suy chủ nhiệm từ bảng phân
       công nên đây chỉ là nhãn, nhưng thiếu nó thì bảng khó soát bằng mắt. */
    const gc = [g.ghiChu, g.cn ? 'chủ nhiệm ' + g.cn : ''].filter(Boolean).join(' · ');
    return [i + 1, hd, t, g.ma, '', g.dienThoai || '', g.email || '', '', gc];
  }),
], [{wch:5},{wch:18},{wch:10},{wch:11},{wch:9},{wch:16},{wch:32},{wch:10},{wch:30}]));

/* 2. Lớp — khối ghi K1..K5, buổi học "2 buổi" */
daGhi.push(ghi('2 - Danh sach lop.xlsx', [
  ['TT', 'Tên lớp', 'Tên lớp 2', 'Khối học', 'Buổi học', 'Địa điểm', 'Điện thoại di động', 'Email', 'Zalo UID', 'Ghi chú'],
  ...T.lop.map((l, i) => [i + 1, l.ten, '', 'K' + l.khoi, l.buoi || '2 buổi', l.diaDiem || '', '', '', '', '']),
], [{wch:5},{wch:12},{wch:12},{wch:10},{wch:12},{wch:12},{wch:18},{wch:20},{wch:12},{wch:16}]));

/* 3. Môn — 17 môn dựng sẵn + môn nhà trường thêm */
daGhi.push(ghi('3 - Danh sach mon.xlsx', [
  ['TT', 'Tên môn học', 'Mã môn học', 'Mã môn học 2', 'Có giáo án', 'Ghi chú'],
  ...MON_CO_SAN.map((m, i) => [i + 1, m[0], m[1], '', m[2], '']),
  ...monThem.map((m, i) => [MON_CO_SAN.length + i + 1, m, MA_THEM[m] || m.slice(0, 5), '', 'x', '']),
], [{wch:5},{wch:30},{wch:14},{wch:14},{wch:11},{wch:16}]));

/* 4. Phân công — đúng khuôn "Mẫu 1a" */
daGhi.push(ghi('4 - Phan cong (Mau 1a).xlsx', [
  ['TT', 'Lớp học', 'Môn học', 'Giáo viên', 'Phòng học', 'Số tiết', 'Giới hạn'],
  ...PC.map((p, i) => [i + 1, p.lop, p.mon, p.gv, p.phong || '', p.soTiet, p.gioiHan ?? 1]),
], [{wch:5},{wch:9},{wch:24},{wch:12},{wch:10},{wch:8},{wch:8}], { tenTrang: 'M1a' }));

/* 5. Cố định tiết nghỉ của lớp — thu lưới phần mềm về đúng khung của trường.
   Không có bước này thì tiết rơi cả vào thứ Bảy và các tiết trường không học. */
const dauCot = ['THỨ', 'TIẾT'], dong2 = ['', ''];
T.lop.forEach(l => { dauCot.push(l.ten, ''); dong2.push('Sáng', 'Chiều'); });
const hangNghi = [dauCot, dong2];
const viTri = {};
for (let thu = 2; thu <= 7; thu++)
  for (let t = 1; t <= luoiTiet; t++) {
    viTri[`${thu}-${t}`] = hangNghi.length;
    hangNghi.push([t === 1 ? thu : '', t, ...Array(T.lop.length * 2).fill('')]);
  }
let demNghi = 0;
const datNghi = (thu, tiet, buoi) => {
  const h = hangNghi[viTri[`${thu}-${tiet}`]];
  T.lop.forEach((l, i) => { h[2 + i * 2 + buoi] = 'Nghỉ'; demNghi++; });
};
for (let thu = 2; thu <= 7; thu++)
  for (let t = 1; t <= luoiTiet; t++) {
    if (!sangThu.includes(thu)  || t > sangTiet)  datNghi(thu, t, 0);
    if (!chieuThu.includes(thu) || t > chieuTiet) datNghi(thu, t, 1);
  }
daGhi.push(ghi('5 - Co dinh tiet nghi lop.xlsx', hangNghi,
  [{wch:6},{wch:6}, ...Array(T.lop.length * 2).fill({wch:9})],
  { tenTrang: 'CO DINH TIET NGHI' }));

/* Kiểm lại lưới nghỉ: mỗi lớp phải còn đúng bằng số tiết của nó */
const conLai = T.lop.map((l, i) => {
  let n = 0;
  for (let thu = 2; thu <= 7; thu++) for (let t = 1; t <= luoiTiet; t++)
    for (const b of [0, 1]) if (hangNghi[viTri[`${thu}-${t}`]][2 + i * 2 + b] !== 'Nghỉ') n++;
  return n;
});
bao(conLai.every(n => n === sucChua),
  `Lưới nghỉ chừa đúng ${sucChua} ô cho mỗi lớp (đã đánh dấu ${demNghi} ô nghỉ)`);

console.log('\n\x1b[1m── Đã ghi vào ' + OUT + ' ──\x1b[0m');
daGhi.forEach(t => console.log('  · ' + t));
console.log('\n\x1b[1mNhập vào SmartScheduler ĐÚNG THỨ TỰ 1→5, rồi bấm xếp.\x1b[0m');
console.log('Chi tiết từng bước: docs/nhap-lieu-smartscheduler.md\n');
process.exit(loi ? 1 : 0);
