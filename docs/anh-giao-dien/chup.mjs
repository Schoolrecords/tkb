/* ==================================================================
   CHỤP LẠI ẢNH GIAO DIỆN — chạy: node docs/anh-giao-dien/chup.mjs
   ------------------------------------------------------------------
   Mở nguyên src/index.html bằng Chrome thật (Chrome sẵn có trên máy, không
   tải thêm trình duyệt nào), bấm qua từng màn hình rồi chụp vào chính thư
   mục này. Khác `npm run soi` ở chỗ đó chạy trình duyệt giả để KIỂM lỗi,
   còn tệp này chạy trình duyệt thật để NHÌN.

   Cần cài một lần:  npm install --no-save jsdom playwright-core
   (kèm jsdom trong cùng lệnh, không thì npm gỡ mất jsdom của `npm run soi`)

   Máy chủ nhỏ dưới đây CỐ Ý trả 404 cho src/cauhinh.js, để phần mềm rơi về
   dữ liệu mẫu của Trường TH Diễn Liên — ảnh chụp không lộ số liệu máy chủ thật.
   ================================================================== */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ANH = path.dirname(fileURLToPath(import.meta.url));
const GOC = path.join(ANH, '..', '..');            /* thư mục gốc dự án */
/* Nạp bằng file:// — trên Windows đường dẫn "D:\..." không phải URL hợp lệ */
const { chromium } = await import(
  pathToFileURL(path.join(GOC, 'node_modules', 'playwright-core', 'index.mjs')).href);

const KIEU = { '.html':'text/html; charset=utf-8', '.json':'application/json', '.js':'text/javascript' };
const may = http.createServer((q, d) => {
  const duong = decodeURIComponent(q.url.split('?')[0]);
  /* Chốt chặn: không bao giờ phục vụ cấu hình máy chủ thật */
  if (duong.endsWith('cauhinh.js')) { d.writeHead(404); return d.end(); }
  fs.readFile(path.join(GOC, duong), (e, b) => {
    if (e) { d.writeHead(404); return d.end('khong co'); }
    d.writeHead(200, { 'content-type': KIEU[path.extname(duong)] || 'text/plain' });
    d.end(b);
  });
});
await new Promise(r => may.listen(8777, r));

const tr = await chromium.launch({ channel: 'chrome' });
const loi = [];

async function chup(ten, { rong = 1400, cao = 900, lam }) {
  /* Tỷ lệ 1× chứ không phải 2×: vẫn rõ ở 1400–1600px mà nhẹ đi bốn lần */
  const ctx = await tr.newContext({ viewport: { width: rong, height: cao }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on('pageerror', e => loi.push(ten + ': ' + e.message));
  await p.goto('http://localhost:8777/src/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  if (lam) await lam(p);
  await p.waitForTimeout(400);
  /* Giấu dải thông báo "Đang chạy bằng tệp mẫu" — nó che phần dưới mọi ảnh */
  await p.addStyleTag({ content: '#bao{display:none!important}' });
  await p.screenshot({ path: path.join(ANH, ten + '.png') });
  console.log('  ✓', ten);
  await ctx.close();
}

const di  = t => p => p.evaluate(x => window.chuyen(x), t);
const xep = p => p.evaluate(() => { window.KQ_XEP = window.xepTuDong(); window.ve(); });

console.log('Đang chụp:');
await chup('01-bang-dieu-hanh',      { lam: di('dieuhanh') });
await chup('02-lop-hoc',             { lam: di('lop') });
await chup('03-tao-lop-hang-loat',   { lam: async p => { await di('lop')(p); await p.click('#btSinhLop'); } });
await chup('04-mon-hoc',             { cao: 1000, lam: di('monhoc') });
await chup('05-phan-cong',           { lam: di('phancong') });
await chup('06-phan-cong-nhanh',     { cao: 1000, lam: async p => { await di('phancong')(p); await p.click('#btPCTheoGV'); } });
await chup('07-toan-truong',         { rong: 1600, cao: 1000, lam: async p => { await xep(p); await di('toantruong')(p); } });
await chup('08-theo-khoi',           { rong: 1600, cao: 1000, lam: async p => { await xep(p); await di('tkbkhoi')(p); } });
await chup('09-xuat-in',             { cao: 1000, lam: async p => { await xep(p); await di('xuatin')(p); } });

/* Điện thoại — chủ dự án chủ yếu dùng máy này */
await chup('10-dt-bang-dieu-hanh',   { rong: 412, cao: 900, lam: di('dieuhanh') });
await chup('11-dt-lop-hoc',          { rong: 412, cao: 900, lam: di('lop') });
await chup('12-dt-toan-truong',      { rong: 412, cao: 900, lam: async p => { await xep(p); await di('toantruong')(p); } });

/* Hai màn hình giữ các việc chuyển ra khỏi thanh bên */
await chup('14-thong-tin-truong', { cao: 1000, lam: di('thongtin') });
await chup('15-diem-truong',      { lam: di('diemtruong') });
await chup('16-tao-du-lieu-thu',  { cao: 1000, lam: async p => {
  await di('diemtruong')(p); await p.click('#btTaoThu');
  await p.fill('#ttTenDiem', 'Điểm trường Diễn Đồng');
  await p.fill('#ttTien', 'DD');
} });

/* Trường CHƯA khai gì — thanh tiến trình phải chỉ rõ từng việc còn thiếu */
await chup('13-truong-moi-chua-co-gi', { lam: p => p.evaluate(() => {
  S.lop = []; S.giaoVien = []; S.phanCong = []; S.tkb = {};
  window.chuyen('dieuhanh');
}) });

await tr.close();
may.close();
console.log(loi.length ? '\nLỖI:\n' + loi.join('\n') : '\nKhông lỗi JavaScript nào.');
