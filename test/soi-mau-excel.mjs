/* ==================================================================
   SOI TỆP MẪU EXCEL THẬT  —  chạy: node test/soi-mau-excel.mjs
   ------------------------------------------------------------------
   `npm test` mục 21 kiểm BỘ KHAI mẫu (dữ liệu thuần). Tệp này kiểm nốt
   khâu còn lại: chuỗi lệnh ExcelJS có sinh ra một tệp .xlsx MỞ ĐƯỢC
   không, và các ô xổ xuống có thật sự nằm trong tệp không.

   Tách khỏi `npm test` vì đây là bộ duy nhất cần ExcelJS thật. Phiên bản
   trong devDependencies GHIM ĐÚNG 4.4.0 — khớp bản app nạp từ CDN, nên nó
   soi đúng thư viện người dùng thật chạy, không phải một bản gần giống.

   Chuỗi lệnh ExcelJS là mã KHAI BÁO mỏng, đổi rất ít; nhưng nó đã sai thật
   ngay lần chạy đầu: `formulae:['=DM_Ma_lop']` thừa dấu `=`, và hậu quả là
   loại không nhìn ra bằng mắt — tệp vẫn mở, vẫn đủ dữ liệu, chỉ là bấm vào
   ô không có danh sách nào bung ra. Đụng vào `taiMauTronGoi()` hay
   `apKhoaXL()` thì chạy lại tệp này: `npm run soi-mau`.
   ================================================================== */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import ExcelJS from 'exceljs';

const goc = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(goc, 'src/index.html'), 'utf8');

const vung = t => {
  const a = html.indexOf(`/*#region ${t}*/`), b = html.indexOf(`/*#endregion ${t}*/`);
  if (a < 0 || b < 0) { console.error(`Không tìm thấy mốc ${t}`); process.exit(1); }
  return html.slice(a, b);
};

/* Cắt riêng khối Excel ngoài vùng region — nó không đụng DOM ngoài ghiTepXL,
   thứ ta thay bằng bản ghi vào bộ nhớ ở dưới. */
const catHam = ten => {
  const d = html.indexOf(`\nfunction ${ten}(`) >= 0
    ? html.indexOf(`\nfunction ${ten}(`) : html.indexOf(`\nasync function ${ten}(`);
  if (d < 0) { console.error(`Không tìm thấy hàm ${ten}`); process.exit(1); }
  /* Cắt tới dòng `\n}` đầu tiên ở cột 0 sau đó */
  const h = html.indexOf('\n}\n', d);
  return html.slice(d, h + 3);
};

const oGia = () => ({ textContent: '', className: '', value: '', style: {},
  classList: { add() {}, remove() {}, toggle() {} }, appendChild() {}, click() {} });
const documentGia = { querySelector: oGia, querySelectorAll: () => [],
  createElement: oGia, body: { appendChild() {} }, addEventListener() {} };

let TEP = null;
const NGUON = `${vung('LOGIC')}\n${vung('DULIEU')}\n${vung('QUYEN')}\n${vung('XUAT')}
${catHam('trangXL')}${catHam('tieuDeXL')}${catHam('dauCotXL')}${catHam('thanBangXL')}
${catHam('apKhoaXL')}${catHam('taiMauTronGoi')}
async function ghiTepXL(wb, ten){ ghiRa(wb, ten); }
async function sanSangExcelJS(){ return true; }
function bao(){}
; return { taiMauTronGoi, bangMauTronGoi, duLieuTuTronGoi,
           S, napVaoS, NGUON, maGVTu };`;

const app = new Function('document', 'window', 'fetch', 'ExcelJS',
  'MAU_XL', 'VIEN_MANH', 'ghiRa', 'TIET_CHUAN_X', NGUON)(
  documentGia, {}, () => {}, ExcelJS,
  { navy: 'FF0F5132', xanh: 'FF17794B', nhat: 'FFF3F8F5', vien: 'FFB9CFC2' },
  { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
  (wb, ten) => { TEP = { wb, ten }; }, null);

let dat = 0, hong = 0;
const kt = (ten, dk, ghi = '') => {
  if (dk) { dat++; console.log(`  \x1b[32m✓\x1b[0m ${ten}${ghi ? ' — ' + ghi : ''}`); }
  else { hong++; console.log(`  \x1b[31m✗\x1b[0m ${ten}${ghi ? ' — ' + ghi : ''}`); }
};

console.log('\n\x1b[1mSoi tệp mẫu Excel trọn gói\x1b[0m');

/* ⚠️ PHẢI đi qua napVaoS() y như app thật. Bản đầu của tệp này dùng thẳng `S`
   ở mức vùng mã — bộ mẫu nhúng tại đó CHƯA có cột `maGV`, nên mẫu rơi về
   `g.id` và bày ra `gv_nguyen_thi_trinh` (19 ký tự) thay vì `Trinh_NT` (8).
   Tệp sinh ra để chủ dự án xem vì thế KHÔNG phải thứ app thật sinh ra, và
   ông nhận ra ngay khi mở: "mã giáo viên quá dài". Bài học: phép soi mà bỏ
   qua một bước của đường thật thì nó soi một sản phẩm không tồn tại. */
app.napVaoS(JSON.parse(JSON.stringify(app.NGUON)));

await app.taiMauTronGoi();
kt('taiMauTronGoi() chạy trọn, không ném lỗi', !!TEP, TEP?.ten);

/* Ghi ra buffer rồi ĐỌC LẠI bằng ExcelJS — tệp hỏng thì đọc lại là vỡ ngay.
   Đây mới là phép thử thật: dựng được workbook trong bộ nhớ không có nghĩa
   là tệp .xlsx ghi ra hợp lệ. */
const buf = await TEP.wb.xlsx.writeBuffer();
kt('Ghi ra được tệp .xlsx', buf.byteLength > 0, `${(buf.byteLength / 1024).toFixed(0)} KB`);
kt('Tệp đủ nhẹ để gửi Zalo', buf.byteLength < 2 * 1024 * 1024,
   `${(buf.byteLength / 1024).toFixed(0)} KB`);

const lai = new ExcelJS.Workbook();
await lai.xlsx.load(buf);
const ten = lai.worksheets.map(w => w.name);
kt('Đọc lại được tệp vừa ghi', ten.length > 0, ten.join(' · '));
kt('Đủ mười trang tính', ten.length === 10, `${ten.length} trang`);
kt('Trang 0_BAT_DAU đứng đầu — đọc lúc đang điền', ten[0] === '0_BAT_DAU');
kt('Tám trang dữ liệu đánh số đúng thứ tự',
   ['1_TRUONG', '2_DIEM_TRUONG', '3_KHUNG_GIO', '4_LOP', '5_GIAO_VIEN',
    '6_PHAN_CONG', '7_PHONG', '8_BUOI_BAN'].every((t, i) => ten[i + 1] === t));

/* --- Ô xổ xuống có thật trong tệp không --- */
const pc = lai.getWorksheet('6_PHAN_CONG');
const dvMaLop = pc.getCell('B4').dataValidation;
kt('Ô Ma_lop ở trang Phân công có dataValidation kiểu list',
   dvMaLop?.type === 'list', JSON.stringify(dvMaLop?.formulae));
kt('Ô xổ xuống trỏ vào VÙNG ĐẶT TÊN, không có dấu = thừa',
   dvMaLop?.formulae?.[0] === 'DM_Ma_lop', String(dvMaLop?.formulae?.[0]));

const lop = lai.getWorksheet('4_LOP');
const dvKhoi = lop.getCell('C4').dataValidation;
kt('Ô Khoi khoá số nguyên 1–5',
   dvKhoi?.type === 'whole' && dvKhoi.operator === 'between' &&
   String(dvKhoi.formulae?.[0]) === '1' && String(dvKhoi.formulae?.[1]) === '5',
   `${dvKhoi?.type} ${dvKhoi?.formulae}`);

/* Khoá phải phủ RA NGOÀI phần đã điền — việc chính của người dùng là gõ thêm */
const cuoi = 4 + app.S.lop.length + 40;
kt('Khoá còn hiệu lực ở những dòng người dùng sẽ gõ thêm',
   lop.getCell(`C${cuoi}`).dataValidation?.type === 'whole', `tới dòng ${cuoi}`);

/* --- Vùng đặt tên --- */
const vungTen = lai.definedNames?.model?.map(x => x.name) || [];
kt('Có đủ vùng đặt tên cho mọi danh mục',
   ['DM_Ma_lop', 'DM_Ma_GV', 'DM_Mon', 'DM_Diem_truong', 'DM_Thu', 'DM_Buoi', 'DM_Co_khong']
     .every(n => vungTen.includes(n)), vungTen.join(' · '));

const dm = lai.getWorksheet('DANH_MUC');
kt('Trang DANH_MUC có dữ liệu nguồn', dm && dm.rowCount > 1, `${dm?.rowCount} dòng`);

/* --- Mã trong tệp phải là mã NGƯỜI đọc được ---------------------------
   Chốt chặn dựng sau khi chủ dự án mở tệp và nói "mã giáo viên quá dài".
   Mã là thứ ông đọc suốt trong Excel và là khoá nối các trang tính; để lọt
   một mã máy vào đây là cả tệp thành khó đọc. Canh cả hai chiều: không mang
   hình dạng máy đặt, và không dài quá mức. */
const cotMa = (trang, cot) => {
  const ws = lai.getWorksheet(trang);
  const j = ws.getRow(3).values.slice(1)
    .findIndex(v => String(v || '').replace(/ \*$/, '') === cot) + 1;
  const r = [];
  for (let i = 4; i <= ws.rowCount; i++) {
    const v = ws.getRow(i).getCell(j).value;
    if (v != null && v !== '') r.push(String(v));
  }
  return r;
};
const maMay = m => /^(gv|lop|dt|ph)_/i.test(m) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(m);

const maGV = cotMa('5_GIAO_VIEN', 'Ma_GV');
kt('Không một mã giáo viên nào mang hình dạng mã máy',
   maGV.length > 0 && !maGV.some(maMay),
   maGV.filter(maMay).slice(0, 3).join(', ') || `${maGV.length} mã, ví dụ ${maGV[0]}`);
kt('Mã giáo viên đủ gọn để đọc lướt trong Excel — không quá 14 ký tự',
   Math.max(...maGV.map(m => m.length)) <= 14,
   `dài nhất ${Math.max(...maGV.map(m => m.length))} · trung bình ` +
   (maGV.reduce((s, m) => s + m.length, 0) / maGV.length).toFixed(1));
kt('Mã giáo viên đọc ra được TÊN GỌI — dạng <tên>_<viết tắt họ đệm>',
   maGV.every(m => /_/.test(m)) &&
   maGV.filter((m, i) => m.split('_')[0] === app.maGVTu(cotMa('5_GIAO_VIEN', 'Ho_ten')[i]).split('_')[0]).length === maGV.length,
   maGV.slice(0, 4).join(' · '));

const maLop = cotMa('4_LOP', 'Ma_lop');
kt('Không một mã lớp nào mang hình dạng mã máy',
   maLop.length > 0 && !maLop.some(maMay),
   maLop.filter(maMay).slice(0, 3).join(', ') || maLop.slice(0, 4).join(' · '));
kt('Mã lớp đủ gọn — không quá 10 ký tự',
   Math.max(...maLop.map(m => m.length)) <= 10,
   `dài nhất ${Math.max(...maLop.map(m => m.length))}`);

/* Mã ở trang Phân công phải KHỚP danh mục — nối sai là cả bảng vô dụng */
const dsGV = new Set(maGV), dsLop = new Set(maLop);
const pcGV = cotMa('6_PHAN_CONG', 'Ma_GV'), pcLop = cotMa('6_PHAN_CONG', 'Ma_lop');
kt('Mọi Ma_GV ở trang Phân công đều có trong trang Giáo viên',
   pcGV.every(m => dsGV.has(m)), pcGV.filter(m => !dsGV.has(m)).slice(0, 3).join(', '));
kt('Mọi Ma_lop ở trang Phân công đều có trong trang Lớp',
   pcLop.every(m => dsLop.has(m)), pcLop.filter(m => !dsLop.has(m)).slice(0, 3).join(', '));

/* --- Đầu cột đánh dấu * cho ô bắt buộc --- */
kt('Cột bắt buộc mang dấu * ở tên cột',
   String(lop.getCell('A3').value).endsWith(' *') &&
   !String(lop.getCell('D3').value).endsWith(' *'),
   `${lop.getCell('A3').value} | ${lop.getCell('D3').value}`);

/* --- Khổ giấy đặt sẵn --- */
kt('Mọi trang dữ liệu đặt sẵn khổ A4, canh vừa bề ngang',
   lai.worksheets.filter(w => w.name !== 'DANH_MUC')
      .every(w => w.pageSetup?.paperSize === 9 && w.pageSetup?.fitToPage));

/* --- VÒNG TRÒN QUA TỆP THẬT: đọc lại các trang rồi nhập ngược --- */
const doc = n => {
  const ws = lai.getWorksheet(n); if (!ws) return null;
  const dauCot = ws.getRow(3).values.slice(1).map(v => String(v || '').replace(/ \*$/, ''));
  const hang = [];
  for (let r = 4; r <= ws.rowCount; r++) {
    const v = ws.getRow(r).values;
    if (!v.slice(1).some(x => x != null && x !== '')) continue;
    const o = {};
    dauCot.forEach((c, i) => { if (v[i + 1] != null && v[i + 1] !== '') o[c] = v[i + 1]; });
    hang.push(o);
  }
  return hang;
};
const dl = app.duLieuTuTronGoi(doc);
kt('TỆP THẬT đọc ngược lại được, không một lỗi nào',
   dl.soLoi === 0, dl.soLoi ? dl.loi.join(' | ') : `${dl.lop.length} lớp · ${dl.giaoVien.length} GV`);
kt('Vòng qua tệp thật giữ đúng tổng số tiết',
   dl.tongTiet === app.S.phanCong.reduce((s, p) => s + p.soTiet, 0), `${dl.tongTiet} tiết`);
kt('Vòng qua tệp thật giữ đúng khung giờ',
   dl.khungGio.filter(k => k.bat !== false).length === 8);

console.log(`\n\x1b[1mKết quả: ${dat} đạt, ${hong} hỏng\x1b[0m\n`);
/* --ghi <thư mục>: ghi tệp ra để xem bằng mắt. Cố ý KHÔNG ghi vào trong
   dự án — đây là tệp sinh ra, không phải mã nguồn. */
const iGhi = process.argv.indexOf('--ghi');
if (iGhi > 0) {
  const { writeFileSync } = await import('node:fs');
  const thuMuc = process.argv[iGhi + 1] || process.cwd();
  writeFileSync(join(thuMuc, TEP.ten), Buffer.from(buf));
  console.log('Đã ghi ' + join(thuMuc, TEP.ten));
}
process.exit(hong ? 1 : 0);
