/* ==================================================================
   SOI PWA TRONG CHROME THẬT — chạy: node test/soi-pwa.mjs
   ------------------------------------------------------------------
   jsdom không có service worker nên `npm run soi` chỉ kiểm được phần
   khai báo. Tệp này mở Chrome thật để kiểm phần sống còn:
   1. sw.js đăng ký và nắm quyền điều khiển trang.
   2. Tải lại một lần cho kho đầy, NGẮT MẠNG, tải lại — trang vẫn mở.
   3. Yêu cầu về Supabase không bao giờ bị cache.

   Cần cài một lần:  npm install --no-save jsdom playwright-core
   Không nằm trong CI vì cần Chrome; chạy tay khi sửa sw.js hay manifest.
   ================================================================== */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const GOC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(
  pathToFileURL(path.join(GOC, 'node_modules', 'playwright-core', 'index.mjs')).href);

const KIEU = { '.html': 'text/html; charset=utf-8', '.json': 'application/json',
               '.js': 'text/javascript', '.webmanifest': 'application/manifest+json',
               '.png': 'image/png' };
const may = http.createServer((q, d) => {
  const duong = decodeURIComponent(q.url.split('?')[0]);
  if (duong.endsWith('cauhinh.js')) { d.writeHead(404); return d.end(); }
  fs.readFile(path.join(GOC, duong), (e, b) => {
    if (e) { d.writeHead(404); return d.end('khong co'); }
    d.writeHead(200, { 'content-type': KIEU[path.extname(duong)] || 'text/plain' });
    d.end(b);
  });
});
await new Promise(r => may.listen(8780, r));

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

const tr = await chromium.launch({ channel: 'chrome' });
const ctx = await tr.newContext({ viewport: { width: 1200, height: 800 } });
const p = await ctx.newPage();
const DIA_CHI = 'http://localhost:8780/src/index.html';

console.log('1. Đăng ký service worker');
await p.goto(DIA_CHI, { waitUntil: 'networkidle' });
await p.evaluate(() => navigator.serviceWorker.ready);
kt('sw.js đăng ký xong, trạng thái active', await p.evaluate(async () => {
  const r = await navigator.serviceWorker.getRegistration();
  return !!r && !!r.active;
}));
kt('Manifest nạp được và đúng tên app', await p.evaluate(async () => {
  const m = await (await fetch('manifest.webmanifest')).json();
  return m.short_name === 'TKB' && m.display === 'standalone';
}));

/* Tải lại lần nữa — lần này SW đã nắm quyền, mọi tệp đi qua nó và vào kho */
await p.reload({ waitUntil: 'networkidle' });
kt('Sau khi tải lại, service worker nắm quyền điều khiển trang',
   await p.evaluate(() => !!navigator.serviceWorker.controller));

console.log('2. Ngắt mạng — trang vẫn phải mở');
await ctx.setOffline(true);
await p.reload({ waitUntil: 'load' }).catch(() => {});
await p.waitForTimeout(800);
kt('Mất mạng mà trang vẫn mở từ kho', await p.evaluate(() =>
   document.title.includes('Thời khóa biểu') && typeof xepTuDong === 'function')
   .catch(() => false));
kt('Dữ liệu mẫu vẫn dựng được lưới khi ngoại tuyến', await p.evaluate(() => {
  KQ_XEP = xepTuDong();
  return S.lop.reduce((s, l) => s + Object.keys(S.tkb[l.id] || {}).length, 0) === 710;
}).catch(() => false));
await ctx.setOffline(false);

console.log('3. Thư viện Excel — nạp khi cần, và chỉ tải MỘT lần (16/8/2026)');
kt('Mở app KHÔNG kéo theo thư viện Excel nào', await p.evaluate(() =>
   typeof ExcelJS === 'undefined' && typeof XLSX === 'undefined'),
   '507 KB không tải ở mỗi lần mở');
kt('Bấm Xuất Excel thì thư viện tự về, tệp tải được', await p.evaluate(async () => {
  KQ_XEP = xepTuDong();
  await sanSangExcelJS();
  return typeof ExcelJS !== 'undefined';
}).catch(() => false));
kt('Lần thứ hai lấy trong kho, không gọi mạng nữa', await p.evaluate(async () => {
  /* Địa chỉ có ghim phiên bản nên `khoTruoc()` của sw.js phải giữ nó lại */
  for (const ten of await caches.keys())
    for (const q of await (await caches.open(ten)).keys())
      if (/cdn\.jsdelivr\.net\/npm\/exceljs@/.test(q.url)) return true;
  return false;
}));

console.log('4. Supabase không bao giờ bị cache');
kt('Kho cache không chứa một yêu cầu Supabase nào', await p.evaluate(async () => {
  for (const ten of await caches.keys())
    for (const q of await (await caches.open(ten)).keys())
      if (new URL(q.url).hostname.endsWith('.supabase.co')) return false;
  return true;
}));

await tr.close();
may.close();
console.log(`\nKết quả soi PWA: ${dat} đạt, ${hong} hỏng`);
process.exit(hong ? 1 : 0);
