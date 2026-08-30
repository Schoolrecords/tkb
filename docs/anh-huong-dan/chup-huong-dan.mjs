/* ==================================================================
   CHỤP ẢNH CHO TÀI LIỆU HƯỚNG DẪN XẾP THỜI KHOÁ BIỂU
   chạy: node docs/anh-huong-dan/chup-huong-dan.mjs
   ------------------------------------------------------------------
   Cùng cách làm với docs/anh-giao-dien/chup.mjs — mở src/index.html bằng
   Chrome thật rồi bấm qua từng bước. Khác ở chỗ ảnh ở đây đi theo TRÌNH TỰ
   LÀM VIỆC của người xếp, không phải theo danh sách màn hình.

   ⚠️ Chụp hẹp hơn (1200×760) vì ảnh sẽ nhúng thẳng vào tệp Word gửi qua
   Zalo — 1400×900 làm tệp nặng gấp rưỡi mà chữ không rõ thêm được bao nhiêu.

   Cần cài một lần:  npm install --no-save jsdom playwright-core
   ================================================================== */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TEP = path.dirname(fileURLToPath(import.meta.url));
const GOC = path.join(TEP, '..', '..');
/* ⚠️ Ảnh phải nằm TRONG src/. GitHub Pages chỉ đăng thư mục ấy (xem
   .github/workflows/pages.yml — `path: src`), nên ảnh để ở docs/ thì mục
   Hướng dẫn trong app hiện ô trắng trên web dù mở ở máy vẫn thấy. */
const ANH = path.join(GOC, 'src', 'anh-huong-dan');
const { chromium } = await import(
  pathToFileURL(path.join(GOC, 'node_modules', 'playwright-core', 'index.mjs')).href);

const KIEU = { '.html':'text/html; charset=utf-8', '.json':'application/json', '.js':'text/javascript' };
const may = http.createServer((q, d) => {
  const duong = decodeURIComponent(q.url.split('?')[0]);
  /* Không bao giờ phục vụ cấu hình máy chủ thật — ảnh hướng dẫn phải chạy
     trên dữ liệu mẫu, không lộ số liệu trường nào. */
  if (duong.endsWith('cauhinh.js')) { d.writeHead(404); return d.end(); }
  fs.readFile(path.join(GOC, duong), (e, b) => {
    if (e) { d.writeHead(404); return d.end('khong co'); }
    d.writeHead(200, { 'content-type': KIEU[path.extname(duong)] || 'text/plain' });
    d.end(b);
  });
});
await new Promise(r => may.listen(8778, r));

fs.mkdirSync(ANH, { recursive: true });
const tr = await chromium.launch({ channel: 'chrome' });
const loi = [];

async function chup(ten, { rong = 1200, cao = 760, lam } = {}) {
  const ctx = await tr.newContext({ viewport: { width: rong, height: cao }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on('pageerror', e => loi.push(ten + ': ' + e.message));
  await p.goto('http://localhost:8778/src/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  if (lam) await lam(p);
  await p.waitForTimeout(400);
  await p.addStyleTag({ content: '#bao{display:none!important}' });
  await p.screenshot({ path: path.join(ANH, ten + '.png') });
  console.log('  ✓', ten);
  await ctx.close();
}

const di  = t => p => p.evaluate(x => window.chuyen(x), t);
/* ⚠️ KQ_XEP khai bằng `let` nên KHÔNG nằm trên window — gán window.KQ_XEP là
   tạo một biến KHÁC. Gán thẳng vào biến thật. */
const xep = p => p.evaluate(() => { KQ_XEP = xepTuDong(); ve(); });

console.log('Đang chụp ảnh hướng dẫn:');

/* ---------- Bước 1 · Khai báo dữ liệu ---------- */
await chup('b1-1-thong-tin-truong', { lam: di('thongtin') });
await chup('b1-2-phan-hieu',        { lam: di('diemtruong') });
await chup('b1-3-khung-gio',        { cao: 900, lam: di('khunggio') });
await chup('b1-4-tao-lop',          { lam: async p => { await di('lop')(p); await p.click('#btSinhLop'); } });
await chup('b1-5-lop-hoc',          { lam: di('lop') });
await chup('b1-6-giao-vien',        { rong: 1400, lam: di('giaovien') });
await chup('b1-7-mon-hoc',          { cao: 900, lam: di('monhoc') });
await chup('b1-8-phan-cong',        { rong: 1400, lam: di('phancong') });
await chup('b1-9-phan-cong-nhanh',  { cao: 900, lam: async p => { await di('phancong')(p); await p.click('#btPCTheoGV'); } });
await chup('b1-10-buoi-ban',        { lam: di('buoiban') });

/* ---------- Bước 2 · Kiểm tra khả thi ---------- */
await chup('b2-kiem-tra-kha-thi',   { cao: 900, lam: di('kiemtra') });

/* ---------- Bước 3 · Cố định môn vào giờ ---------- */
await chup('b3-1-man-xep',          { lam: di('xep') });
await chup('b3-2-co-dinh-mon',      { cao: 900, lam: async p => {
  await di('xep')(p); await p.click('#btCoDinh'); await p.waitForTimeout(400); } });

/* ---------- Bước 4 · Xếp tự động ---------- */
await chup('b4-ket-qua-xep',        { cao: 900, lam: async p => { await xep(p); await di('xep')(p); } });

/* ---------- Bước 5 · Tinh chỉnh tay ---------- */
await chup('b5-1-theo-lop',         { rong: 1400, cao: 900, lam: async p => { await xep(p); await di('tkblop')(p); } });
/* Đang cầm một tiết: lưới hiện ba mức tín hiệu — xanh đổi tự do, vàng chạm
   giáo viên dạy nhiều lớp, mờ là vướng ràng buộc cứng. Đây là ảnh khó chụp
   nhất mà cũng đáng giá nhất của cả tài liệu. */
await chup('b5-2-ba-muc-tin-hieu',  { rong: 1400, cao: 900, lam: async p => {
  await xep(p); await di('tkblop')(p);
  await p.evaluate(() => {
    const lop = S.lop.find(l => Object.keys(S.tkb[l.id] || {}).length > 5);
    if (!lop) return;
    S.lopXem = lop.id; ve();
    const o = Object.keys(S.tkb[lop.id])[3];
    S.oChon = o; ve();
  });
  await p.waitForTimeout(300);
} });

/* ---------- Bước 6 · Lưu và công bố ---------- */
await chup('b6-phien-ban',          { cao: 900, lam: async p => { await xep(p); await di('phienban')(p); } });

/* ---------- Bước 7 · Xuất và in ---------- */
await chup('b7-1-toan-truong',      { rong: 1400, cao: 900, lam: async p => { await xep(p); await di('toantruong')(p); } });
await chup('b7-2-xuat-in',          { cao: 900, lam: async p => { await xep(p); await di('xuatin')(p); } });

/* ---------- Điện thoại ---------- */
await chup('dt-1-ngan-keo', { rong: 412, cao: 820, lam: async p => {
  await di('dieuhanh')(p); await p.click('#btMenu'); await p.waitForTimeout(350); } });
await chup('dt-2-theo-lop', { rong: 412, cao: 820, lam: async p => {
  await xep(p); await di('tkblop')(p); } });

await tr.close();
await new Promise(r => may.close(r));

if (loi.length) {
  console.log('\n⚠️ Có lỗi khi chụp:');
  loi.forEach(x => console.log('   ·', x));
  process.exit(1);
}
console.log('\nXong. Ảnh nằm ở docs/anh-huong-dan/');
