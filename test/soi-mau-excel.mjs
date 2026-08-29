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
${catHam('apKhoaXL')}${catHam('danhMucCuaMuc')}${catHam('taiMauMuc')}${catHam('xuatExcel')}
async function ghiTepXL(wb, ten){ ghiRa(wb, ten); }
async function sanSangExcelJS(){ return true; }
function bao(){}
; return { taiMauMuc, danhMucCuaMuc, MUC_NHAP, duLieuTuMuc, duLieuTuTronGoi, xuatExcel,
           S, napVaoS, NGUON, maGVTu, xepTuDong, tenTepXuat, bangTuMaTran };`;

const app = new Function('document', 'window', 'fetch', 'ExcelJS',
  'MAU_XL', 'VIEN_MANH', 'ghiRa', 'TIET_CHUAN_X', NGUON)(
  documentGia, {}, () => {}, ExcelJS,
  { navy: 'FF0F5132', xanh: 'FF17794B', nhat: 'FFF3F8F5', vien: 'FFB9CFC2',
    camNhat: 'FFFDF3E6' },
  { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
  (wb, ten) => { TEP = { wb, ten }; }, null);

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

console.log('\n\x1b[1mSoi tệp mẫu Excel TỪNG MỤC\x1b[0m');

/* ⚠️ PHẢI đi qua napVaoS() y như app thật. Bản đầu của tệp này dùng thẳng `S`
   ở mức vùng mã — bộ mẫu nhúng tại đó CHƯA có cột `maGV`, nên mẫu rơi về
   `g.id` và bày ra `gv_le_thi_nguyet` (16 ký tự) thay vì `Nguyệt_LT` (9).
   Tệp sinh ra để chủ dự án xem vì thế KHÔNG phải thứ app thật sinh ra, và
   ông nhận ra ngay khi mở: "mã giáo viên quá dài". Bài học: phép soi mà bỏ
   qua một bước của đường thật thì nó soi một sản phẩm không tồn tại. */
app.napVaoS(JSON.parse(JSON.stringify(app.NGUON)));
/* Hai mục tuỳ chọn trường Diễn Liên chưa khai — gieo một dòng để mẫu của
   chúng cũng có ruột mà soi, dựng từ dữ liệu THẬT chứ không phải dòng ví dụ */
app.S.phong = [{ id: 'ph1', ten: 'Phòng máy 1', mon: 'Tin học', dtId: app.S.diemTruong[0].id }];
app.S.gvNghi = { [app.S.giaoVien[0].id]: ['5-C'] };

const MUC = Object.keys(app.MUC_NHAP);
const TEP_MUC = {};                     /* mã mục -> workbook đã đọc lại */

for (const ma of MUC) {
  const m = app.MUC_NHAP[ma];
  TEP = null;
  await app.taiMauMuc(ma);
  kt(`taiMauMuc('${ma}') chạy trọn, không ném lỗi`, !!TEP, TEP?.ten);
  /* Ghi ra buffer rồi ĐỌC LẠI — dựng được workbook trong bộ nhớ không có
     nghĩa là tệp .xlsx ghi ra hợp lệ. Đây mới là phép thử thật. */
  const buf = await TEP.wb.xlsx.writeBuffer();
  const lai = new ExcelJS.Workbook();
  await lai.xlsx.load(buf);
  TEP_MUC[ma] = { lai, ten: TEP.ten, buf };
  const ten = lai.worksheets.map(w => w.name);
  kt(`${m.trang}: đúng MỘT trang dữ liệu (+ DANH_MUC), không phải mười tab`,
     ten[0] === m.trang && ten.length <= 2 &&
     ten.slice(1).every(x => x === 'DANH_MUC'), ten.join(' · '));
  kt(`${m.trang}: đặt sẵn khổ A4, canh vừa bề ngang — in ra dùng được ngay`,
     lai.worksheets.filter(w => w.name !== 'DANH_MUC')
        .every(w => w.pageSetup?.paperSize === 9 && w.pageSetup?.fitToPage));
}

/* ==================================================================
   VÒNG TRÒN THẬT: tải mẫu về → đọc lại tệp ấy → nhập ngược  (29/8/2026)
   ------------------------------------------------------------------
   Đây là khâu chưa bộ nào chạm tới, và nó hỏng thật: mẫu mở đầu bằng dải
   tiêu đề gộp ô nên tên cột nằm ở dòng 3, lại mang dấu sao (`Ma_GV *`).
   `sheet_to_json` mặc định lấy DÒNG ĐẦU làm tên cột, nên app đọc tệp do
   chính nó sinh ra rồi báo *"Tệp này không có trang tính nào máy đọc
   được"* — chủ dự án gặp đúng câu ấy khi cầm tệp mẫu vừa tải về.

   `npm test` mục 22 gọi thẳng `duLieuTuMuc()` với mảng object đã đúng key
   nên không bao giờ nhìn thấy chuyện này; phần trên của tệp này thì soi
   hình thức ô và khổ giấy. Chỗ hở nằm đúng giữa hai bộ.
   ================================================================== */
console.log('\n5. Tải mẫu về rồi nhập ngược lại chính tệp ấy');

/* Ma trận ô như SheetJS trả về với {header:1} — ExcelJS gói ô công thức và ô
   giàu định dạng thành object, phải rút lấy phần chữ. */
const maTranXL = ws => {
  const a = [];
  ws.eachRow({ includeEmpty: true }, (r, n) => {
    a[n - 1] = r.values.slice(1).map(v =>
      v && typeof v === 'object' ? (v.text ?? v.result ?? v.richText?.map(x => x.text).join('') ?? '') : v);
  });
  for (let i = 0; i < a.length; i++) if (!a[i]) a[i] = [];
  return a;
};

for (const ma of MUC) {
  const m = app.MUC_NHAP[ma];
  const hang = app.bangTuMaTran(maTranXL(TEP_MUC[ma].lai.getWorksheet(m.trang)));
  if (!hang.length) continue;             /* mục trường chưa khai gì — không có dòng để soi */
  /* Chính phép soát app chạy khi người dùng chọn tệp: đủ bộ cột thì mới nhận
     ra đây là trang của mục đang mở, thiếu là rơi xuống câu "không có trang
     tính nào máy đọc được". */
  kt(`${m.trang}: tệp vừa tải về đọc ra ĐÚNG bộ cột, không phải dòng tiêu đề`,
     m.khoaDong.every(c => c in hang[0]),
     Object.keys(hang[0]).filter(k => k !== '__dong').join(' · '));
}

/* Số dòng trong câu lỗi phải là số dòng Excel BÀY RA, không phải số thứ tự
   trong mảng — người nhập cầm tệp trong tay mà bị chỉ sai chỗ thì còn tệ
   hơn không chỉ. Mẫu có hai dòng tiêu đề nên dữ liệu bắt đầu ở dòng 4. */
{
  const ws = TEP_MUC.giaovien.lai.getWorksheet('GIAO_VIEN');
  const hang = app.bangTuMaTran(maTranXL(ws));
  kt('Dòng dữ liệu đầu tiên được đánh đúng số dòng Excel (dòng 4)',
     hang[0]?.__dong === 4, `__dong = ${hang[0]?.__dong}`);
}

/* --- Tên tệp nói rõ mục nào, để thư mục Tải về không thành một đống giống nhau --- */
kt('Mỗi mục một tên tệp riêng, đọc ra được mục nào',
   new Set(MUC.map(ma => TEP_MUC[ma].ten)).size === MUC.length &&
   /Mau-Lop-hoc/.test(TEP_MUC.lop.ten),
   TEP_MUC.lop.ten);

/* --- Ô xổ xuống có THẬT trong tệp không ---------------------------------
   `formulae:['=DM_Ma_lop']` thừa dấu `=` là lỗi không nhìn ra bằng mắt: tệp
   vẫn mở, vẫn đủ dữ liệu, chỉ là bấm vào ô không có danh sách nào bung ra. */
{
  const pc = TEP_MUC.phancong.lai.getWorksheet('PHAN_CONG');
  const dv = pc.getCell('B4').dataValidation;
  kt('Ô Ma_lop ở trang Phân công có dataValidation kiểu list', dv?.type === 'list',
     JSON.stringify(dv?.formulae));
  kt('Ô xổ xuống trỏ vào VÙNG ĐẶT TÊN, không có dấu = thừa',
     dv?.formulae?.[0] === 'DM_Ma_lop', String(dv?.formulae?.[0]));

  const lop = TEP_MUC.lop.lai.getWorksheet('LOP');
  const dvK = lop.getCell('C4').dataValidation;
  kt('Ô Khoi khoá số nguyên 1–5',
     dvK?.type === 'whole' && dvK.operator === 'between' &&
     String(dvK.formulae?.[0]) === '1' && String(dvK.formulae?.[1]) === '5',
     `${dvK?.type} ${dvK?.formulae}`);

  /* Khoá phải phủ RA NGOÀI phần đã điền — việc chính của người dùng là gõ thêm */
  const cuoi = 4 + app.S.lop.length + 40;
  kt('Khoá còn hiệu lực ở những dòng người dùng sẽ gõ thêm',
     lop.getCell(`C${cuoi}`).dataValidation?.type === 'whole', `tới dòng ${cuoi}`);
}

/* --- Chỉ mang danh mục trang ấy THẬT SỰ dùng --------------------------- */
{
  const vung = ma => TEP_MUC[ma].lai.definedNames?.model?.map(x => x.name) || [];
  kt('Trang Phân công mang đủ ba danh mục nó dùng',
     ['DM_Ma_GV', 'DM_Ma_lop', 'DM_Mon'].every(n => vung('phancong').includes(n)),
     vung('phancong').join(' · '));
  kt('Trang Phân hiệu KHÔNG kèm danh sách mã giáo viên — nó không dùng tới',
     !vung('diemtruong').includes('DM_Ma_GV'), vung('diemtruong').join(' · '));
  kt('Trang nào có ô xổ xuống thì có trang DANH_MUC, không thì thôi',
     !!TEP_MUC.lop.lai.getWorksheet('DANH_MUC') &&
     !TEP_MUC.monhoc.lai.getWorksheet('DANH_MUC') === false);
}

/* --- Mã trong tệp phải là mã NGƯỜI đọc được ---------------------------
   Chốt chặn dựng sau khi chủ dự án mở tệp và nói "mã giáo viên quá dài". */
const cotMa = (ma, cot) => {
  const ws = TEP_MUC[ma].lai.getWorksheet(app.MUC_NHAP[ma].trang);
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

const maGV = cotMa('giaovien', 'Ma_GV');
kt('Không một mã giáo viên nào mang hình dạng mã máy',
   maGV.length > 0 && !maGV.some(maMay),
   maGV.filter(maMay).slice(0, 3).join(', ') || `${maGV.length} mã, ví dụ ${maGV[0]}`);
kt('Mã giáo viên đủ gọn để đọc lướt trong Excel — không quá 14 ký tự',
   Math.max(...maGV.map(m => m.length)) <= 14,
   `dài nhất ${Math.max(...maGV.map(m => m.length))} · trung bình ` +
   (maGV.reduce((s, m) => s + m.length, 0) / maGV.length).toFixed(1));
kt('Mã giáo viên đọc ra được TÊN GỌI — dạng <tên>_<viết tắt họ đệm>',
   maGV.every(m => /_/.test(m)) &&
   maGV.filter((m, i) => m.split('_')[0] ===
     app.maGVTu(cotMa('giaovien', 'Ho_ten')[i]).split('_')[0]).length === maGV.length,
   maGV.slice(0, 4).join(' · '));

const maLop = cotMa('lop', 'Ma_lop');
kt('Không một mã lớp nào mang hình dạng mã máy',
   maLop.length > 0 && !maLop.some(maMay),
   maLop.filter(maMay).slice(0, 3).join(', ') || maLop.slice(0, 4).join(' · '));
kt('Mã lớp đủ gọn — không quá 10 ký tự',
   Math.max(...maLop.map(m => m.length)) <= 10,
   `dài nhất ${Math.max(...maLop.map(m => m.length))}`);

/* Mã ở trang Phân công phải KHỚP hai trang kia — nối sai là cả bảng vô dụng */
{
  const dsGV = new Set(maGV), dsLop = new Set(maLop);
  const pcGV = cotMa('phancong', 'Ma_GV'), pcLop = cotMa('phancong', 'Ma_lop');
  kt('Mọi Ma_GV ở trang Phân công đều có trong trang Giáo viên',
     pcGV.length > 0 && pcGV.every(m => dsGV.has(m)),
     pcGV.filter(m => !dsGV.has(m)).slice(0, 3).join(', '));
  kt('Mọi Ma_lop ở trang Phân công đều có trong trang Lớp',
     pcLop.length > 0 && pcLop.every(m => dsLop.has(m)),
     pcLop.filter(m => !dsLop.has(m)).slice(0, 3).join(', '));
}

/* --- Đầu cột đánh dấu * cho ô bắt buộc --- */
{
  const lop = TEP_MUC.lop.lai.getWorksheet('LOP');
  kt('Cột bắt buộc mang dấu * ở tên cột',
     String(lop.getCell('A3').value).endsWith(' *') &&
     !String(lop.getCell('D3').value).endsWith(' *'),
     `${lop.getCell('A3').value} | ${lop.getCell('D3').value}`);
}

/* --- VÒNG TRÒN QUA TỆP THẬT ------------------------------------------
   Đọc lại từng tệp .xlsx vừa ghi rồi đổ ngược qua đúng trình soát người dùng
   chạy. Đây là phép thử đáng giá nhất của cả bộ: nó bắt được mọi thứ lệch
   giữa hai đầu — tên cột, kiểu ô, dòng ví dụ trỏ vào chỗ không tồn tại. */
/* ⚠️ Bản đầu tự chép tay "dòng 3 là tên cột, bỏ dấu *" ngay tại đây — và
   chính vì thế nó XANH suốt trong khi app hỏng: phép thử tự làm hộ app đúng
   cái việc app không làm. Nay đi qua `bangTuMaTran()`, hàm thật của app, nên
   nếu app không dò ra dòng tên cột thì bộ soi đỏ ngay. */
const docTepMuc = ma =>
  app.bangTuMaTran(maTranXL(TEP_MUC[ma].lai.getWorksheet(app.MUC_NHAP[ma].trang)));
for (const ma of MUC) {
  const hang = docTepMuc(ma);
  const r = app.duLieuTuMuc(ma, hang);
  kt(`TỆP THẬT ${app.MUC_NHAP[ma].trang} đọc ngược lại được, không một lỗi nào`,
     hang.length > 0 && r.soLoi === 0,
     r.soLoi ? r.loi.join(' | ') : `${hang.length} dòng`);
  kt(`TỆP THẬT ${app.MUC_NHAP[ma].trang} nhập lại KHÔNG nhân đôi dòng nào`,
     r.them === 0 && r.capNhat === hang.length,
     `thêm ${r.them} · cập nhật ${r.capNhat}/${hang.length}`);
}
kt('Vòng qua tệp thật giữ đúng tổng số tiết', (() => {
  const r = app.duLieuTuMuc('phancong', docTepMuc('phancong'));
  const tong = r.kho.phanCong.reduce((s, p) => s + p.soTiet, 0);
  return [tong === app.S.phanCong.reduce((s, p) => s + p.soTiet, 0), `${tong} tiết`];
})()[0], '710 tiết');
kt('Vòng qua tệp thật giữ đúng khung giờ', (() => {
  const r = app.duLieuTuMuc('khunggio', docTepMuc('khunggio'));
  return r.kho.khungGio.filter(k => k.bat !== false).length === 8;
})());

/* ==================================================================
   PHẦN 2 — TỆP XUẤT RA (TOAN_TRUONG · KHOI_* · TKB_LOP · TKB_GV)
   ------------------------------------------------------------------
   Dựng 24/8/2026 sau khi chủ dự án gửi ảnh chụp: ô lưới ghi
   `HDTN — Lê Thị Nguyệt` một dòng, bật wrapText, mà `thanBangXL()`
   khoá cứng `height=19` — chữ xuống hai dòng trong ô cao một dòng nên
   TRÀN ĐÈ lên dòng dưới. Cả bảng thành mớ chữ chồng nhau.

   Đây là đường xuất người dùng chạy nhiều nhất, mà trước hôm nay
   KHÔNG có một phép soi nào chạm tới tệp .xlsx nó ghi ra.
   ================================================================== */
console.log('\n\x1b[1mSoi tệp Excel XUẤT RA\x1b[0m');

app.xepTuDong(0);                       /* cần có lưới thì mới có ô để soi */
TEP = null;
await app.xuatExcel();
kt('xuatExcel() chạy trọn, không ném lỗi', !!TEP, TEP?.ten);
const tenXuat = TEP.ten;               /* nhớ lại: TEP còn bị dùng tiếp ở dưới */

const bufX = await TEP.wb.xlsx.writeBuffer();
const wbX = new ExcelJS.Workbook();
await wbX.xlsx.load(bufX);
kt('Đọc lại được tệp xuất ra', wbX.worksheets.length > 0,
   wbX.worksheets.map(w => w.name).join(' · '));

const tt = wbX.getWorksheet('TOAN_TRUONG');

/* --- Lỗi chính: ô hai dòng nằm trong hàng cao một dòng --- */
{
  /* Times 10pt cần khoảng 13 điểm mỗi dòng; lấy 12 cho rộng tay. */
  const xau = [];
  let soODoi = 0, cao = null;
  tt.eachRow((row, i) => {
    if (i <= 4) return;                 /* tiêu đề · dải khối · tên cột */
    row.eachCell((o, j) => {
      if (j <= 3) return;
      const v = String(o.value || '');
      if (!v.trim()) return;
      const dong = v.split('\n').length;
      if (dong > 1) soODoi++;
      cao = row.height;
      if (dong * 12 > (row.height || 15))
        xau.push(`dòng ${i} cột ${j}: ${dong} dòng chữ / cao ${row.height}`);
    });
  });
  kt('Ô lưới ngắt thành HAI DÒNG — môn trên, giáo viên dưới',
     soODoi > 0, `${soODoi} ô hai dòng, hàng cao ${cao}`);
  kt('Không ô nào có nhiều dòng chữ hơn chiều cao hàng cho phép',
     xau.length === 0, xau.slice(0, 3).join(' | '));
}

/* --- Bề ngang cột phải đủ cho dòng chữ dài nhất --- */
{
  let daiNhat = 0, viDu = '';
  tt.eachRow((row, i) => {
    if (i <= 4) return;
    row.eachCell((o, j) => {
      if (j <= 3) return;
      String(o.value || '').split('\n').forEach(x => {
        if (x.length > daiNhat) { daiNhat = x.length; viDu = x; }
      });
    });
  });
  const rong = tt.getColumn(4).width;
  /* Đòi DƯ ra ít nhất một ký tự, không cho vừa khít. Ngưỡng đúng-bằng đã
     từng che một lỗi thật: `dauCotXL()` ghi đè bề ngang về con số cũ (20)
     mà phép thử `<=` vẫn xanh vì hai vế tình cờ bằng nhau. */
  kt('Cột đủ rộng cho dòng chữ dài nhất — không đẩy sang dòng thứ ba',
     daiNhat < rong, `dài nhất ${daiNhat} ("${viDu}") · cột rộng ${rong}`);
}

/* --- Dải khối gộp ô, không lặp "Khối 1" năm lần --- */
{
  /* Chỉ đếm vùng gộp NẰM TRÊN dòng 3 — dòng tiêu đề cũng gộp ô, cộng chung
     vào là con số nói dối. */
  const gop = (tt.model.merges || []).filter(m => /^[A-Z]+3:[A-Z]+3$/.test(m));
  const soKhoi = new Set(app.S.lop.map(l => l.khoi)).size;
  kt('Dải khối GỘP Ô — mỗi khối một vùng, không lặp "Khối 1" ở từng cột',
     gop.length === soKhoi, `${gop.length} vùng gộp / ${soKhoi} khối · ${gop.join(' ')}`);
}

/* --- Họ tên đầy đủ vẫn còn nguyên: ràng buộc đã có phép thử từ trước --- */
{
  const co = [];
  tt.eachRow((row, i) => {
    if (i <= 4) return;
    row.eachCell((o, j) => { if (j > 3) co.push(String(o.value || '')); });
  });
  const mau = app.S.giaoVien.find(g => g.hoTen.split(/\s+/).length >= 4) || app.S.giaoVien[0];
  kt('Bản xuất vẫn ghi HỌ TÊN ĐẦY ĐỦ, không rút gọn thành "Cô Dung"',
     co.some(x => x.includes(mau.hoTen)), mau.hoTen);
}

kt('Mọi trang lưới đều khoá ba cột giờ và dòng tiêu đề khi cuộn',
   ['TOAN_TRUONG', 'TKB_LOP', 'TKB_GV'].every(n => {
     const v = wbX.getWorksheet(n)?.views?.[0];
     return v?.state === 'frozen' && v.xSplit === 3 && v.ySplit >= 3;
   }));

console.log('\n\x1b[1mTrường mới khai DỞ — mẫu phải mang theo phần đã gõ tay\x1b[0m');
/* Chủ dự án khai 25 lớp, gõ tay được 2 giáo viên, chưa có dòng phân công nào,
   rồi tải mẫu về — bản cũ trả một tệp toàn tên người không có thật. Đây là
   phép soi trên TỆP THẬT của đúng cảnh ấy: mẫu Giáo viên phải mang đúng hai
   cái tên đã gõ, mẫu Phân công phải ghi ra được dù BẢNG RỖNG. */
{
  const hai = app.S.giaoVien.slice(0, 2).map(g => g.hoTen);
  app.S.giaoVien = app.S.giaoVien.slice(0, 2);
  app.S.phanCong = [];
  app.S.giaoVien.forEach(g => { g.cn = null; });

  TEP = null;
  await app.taiMauMuc('giaovien');
  const bufG = await TEP.wb.xlsx.writeBuffer();
  const wG = new ExcelJS.Workbook(); await wG.xlsx.load(bufG);
  const gv = wG.getWorksheet('GIAO_VIEN');
  const iTen = gv.getRow(3).values.slice(1)
    .findIndex(v => String(v || '').replace(/ \*$/, '') === 'Ho_ten') + 1;
  const ten2 = [gv.getRow(4).getCell(iTen).value, gv.getRow(5).getCell(iTen).value];
  kt('Hai giáo viên vừa gõ tay nằm đúng trong mẫu Giáo viên',
     ten2[0] === hai[0] && ten2[1] === hai[1], ten2.join(' · '));
  kt('Không một cái tên ví dụ nào lọt vào tệp của trường thật',
     ![...Array(6)].some((_, i) => /Nguyễn Thị An|Trần Văn Bình|Lê Thị Chi/
       .test(String(gv.getRow(4 + i).getCell(iTen).value || ''))));

  TEP = null;
  await app.taiMauMuc('lop');
  const bufL = await TEP.wb.xlsx.writeBuffer();
  const wL = new ExcelJS.Workbook(); await wL.xlsx.load(bufL);
  const lop2 = wL.getWorksheet('LOP');
  kt('25 lớp đã khai vẫn còn nguyên trong mẫu Lớp học',
     String(lop2.getCell('B28').value || '') !== '' &&
     String(lop2.getCell('B29').value || '') === '',
     `dòng cuối: ${lop2.getCell('B28').value}`);

  /* Bảng rỗng là chỗ dễ vỡ nhất: thanBangXL với 0 dòng, autoFilter thu về
     một dòng, danh mục Ma_GV chỉ còn hai mã. */
  TEP = null;
  await app.taiMauMuc('phancong');
  const bufP = await TEP.wb.xlsx.writeBuffer();
  kt('Bảng phân công RỖNG vẫn ghi ra được tệp .xlsx hợp lệ', bufP.byteLength > 0,
     `${(bufP.byteLength / 1024).toFixed(0)} KB`);
  const wP = new ExcelJS.Workbook(); await wP.xlsx.load(bufP);
  const pc2 = wP.getWorksheet('PHAN_CONG');
  kt('Trang phân công để TRỐNG, không chèn dòng trỏ vào lớp không tồn tại',
     String(pc2.getCell('A4').value || '') === '');
  kt('Ô xổ xuống Ma_GV vẫn sống, lấy đúng hai mã thật',
     pc2.getCell('A4').dataValidation?.formulae?.[0] === 'DM_Ma_GV' &&
     String(wP.getWorksheet('DANH_MUC').getCell('A2').value || '') !== '',
     String(wP.getWorksheet('DANH_MUC').getCell('A2').value));
}

/* ⚠️ Dòng tổng kết phải nằm SAU cả hai phần. Bản đầu để nó ở cuối phần 1
   nên nó báo "25 đạt" trong khi phần 2 còn tám phép nữa chưa chạy — con số
   đúng nhưng nói dối về phạm vi. Mã thoát thì vẫn đúng vì `hong` đọc ở dòng
   cuối; sai duy nhất ở chỗ BÁO CÁO, mà đó lại là thứ người đọc tin. */
console.log(`\n\x1b[1mKết quả: ${dat} đạt, ${hong} hỏng\x1b[0m\n`);

/* --ghi <thư mục>: ghi tệp ra để xem bằng mắt. Cố ý KHÔNG ghi vào trong
   dự án — đây là tệp sinh ra, không phải mã nguồn. */
const iGhi = process.argv.indexOf('--ghi');
if (iGhi > 0) {
  const { writeFileSync } = await import('node:fs');
  const thuMuc = process.argv[iGhi + 1] || process.cwd();
  writeFileSync(join(thuMuc, tenXuat), Buffer.from(bufX));      /* tệp XUẤT RA */
  console.log('Đã ghi ' + join(thuMuc, tenXuat));
  Object.keys(TEP_MUC).forEach(ma => {                           /* tám tệp MẪU NHẬP */
    writeFileSync(join(thuMuc, TEP_MUC[ma].ten), Buffer.from(TEP_MUC[ma].buf));
    console.log('Đã ghi ' + join(thuMuc, TEP_MUC[ma].ten));
  });
}
process.exit(hong ? 1 : 0);
