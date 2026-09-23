/* ==================================================================
   SOI CÚ PHÁP TOÀN TRANG
   ------------------------------------------------------------------
   Chạy:  npm run cu-phap
   ------------------------------------------------------------------
   Vì sao có tệp này (23/9/2026):

   `npm test` và `npm run soi` đều chỉ TRÍCH một vùng mã trong
   src/index.html ra chạy — vùng tính toán và vùng dựng màn hình. Một
   lỗi cú pháp NGOÀI hai vùng ấy lọt qua cả hai bộ: hôm nay là khai
   trùng `const oTim` trong `noiSuKien()`, và hậu quả không phải một
   phép thử đỏ mà là TRANG TRẮNG — toàn bộ script không chạy, người
   dùng mở phần mềm lên thấy màn hình trống trơn.

   Tệp này parse NGUYÊN KHỐI script chính. Nó không chạy mã, chỉ hỏi
   engine JavaScript một câu: "đọc được không?". Rẻ, nhanh, và bắt
   đúng loại lỗi mà hai bộ kia mù.
   ================================================================== */
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const goc = join(dirname(fileURLToPath(import.meta.url)), '..');
const tep = join(goc, 'src', 'index.html');
const chu = readFileSync(tep, 'utf8');

/* Mốc cắt: script chính là khối <script> ngay sau ô chọn tệp Excel ở
   cuối <body>. Dò theo mốc ấy chứ không theo "khối script cuối cùng" —
   trong trang có những chuỗi chứa chữ `<script>` nằm giữa mã. */
const moc = chu.indexOf('<input type="file" id="tep"');
if(moc < 0){
  console.error('✗ Không tìm thấy mốc cắt trong src/index.html — sửa lại test/soi-cu-phap.mjs');
  process.exit(1);
}
const dau = chu.indexOf('<script>', moc);
const cuoi = chu.lastIndexOf('</script>');
if(dau < 0 || cuoi < dau){
  console.error('✗ Không tách được khối script chính');
  process.exit(1);
}

const ma = chu.slice(dau + '<script>'.length, cuoi);
const dongDau = chu.slice(0, dau).split('\n').length;
const soDong = ma.split('\n').length;

try{
  new vm.Script(ma, {filename: 'index.html'});
  console.log(`✓ Cú pháp toàn khối script hợp lệ — ${soDong.toLocaleString('vi')} dòng`
    + ` (từ dòng ${dongDau} của src/index.html)`);
}catch(e){
  const khop = String(e.stack || '').match(/index\.html:(\d+)/);
  const dong = khop ? dongDau + (+khop[1]) - 1 : null;
  console.error('✗ LỖI CÚ PHÁP — trang sẽ TRẮNG, không phải chỉ hỏng một màn');
  console.error(`  ${e.message}`);
  if(dong){
    console.error(`  src/index.html dòng ${dong}`);
    const quanh = ma.split('\n').slice(Math.max(0, +khop[1] - 4), +khop[1] + 1);
    quanh.forEach((d, i) => console.error(`  ${dongDau + (+khop[1]) - 4 + i} | ${d}`));
  }
  process.exit(1);
}
