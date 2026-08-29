/* ==================================================================
   SOI WEB WORKER TRONG CHROME THẬT — chạy: node test/soi-worker.mjs
   ------------------------------------------------------------------
   `npm run soi` chạy jsdom, mà jsdom KHÔNG có Worker — nó chỉ kiểm được
   đường lui (chạy tại chỗ). Tệp này mở Chrome thật để kiểm đường chính:
   xếp kỹ chạy trong Worker, trả kết quả đúng, huỷ được giữa chừng.

   Cần cài một lần:  npm install --no-save jsdom playwright-core
   (giống docs/anh-giao-dien/chup.mjs — dùng Chrome sẵn có trên máy)

   Không nằm trong CI vì cần Chrome; chạy tay khi sửa vùng Worker.
   ================================================================== */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const GOC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(
  pathToFileURL(path.join(GOC, 'node_modules', 'playwright-core', 'index.mjs')).href);

/* Máy chủ nhỏ, trả 404 cho cauhinh.js để app chạy bằng dữ liệu mẫu */
const KIEU = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript' };
const may = http.createServer((q, d) => {
  const duong = decodeURIComponent(q.url.split('?')[0]);
  if (duong.endsWith('cauhinh.js')) { d.writeHead(404); return d.end(); }
  fs.readFile(path.join(GOC, duong), (e, b) => {
    if (e) { d.writeHead(404); return d.end('khong co'); }
    d.writeHead(200, { 'content-type': KIEU[path.extname(duong)] || 'text/plain' });
    d.end(b);
  });
});
await new Promise(r => may.listen(8778, r));

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
const loiTrang = [];
p.on('pageerror', e => loiTrang.push(e.message));
await p.goto('http://localhost:8778/src/index.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(500);

console.log('1. Dựng Worker từ chính trang');
kt('Chrome thật tạo được Worker từ vùng LOGIC', await p.evaluate(() => {
  const w = taoWorkerXep();
  if (!w) return false;
  w.terminate(); if (w.__url) URL.revokeObjectURL(w.__url);
  return true;
}));

console.log('2. Xếp kỹ chạy qua Worker');
/* PA_TIM, WK_XEP, DANG_XEP_KY là `let` ở mức trang — KHÔNG phải thuộc tính
   của window. Phải đọc bằng tên trần qua chuỗi phạm vi, không qua window.* */
await p.evaluate(() => { PA_TIM = null; chayXepKy(6, 3); });
await p.waitForTimeout(600);
kt('Trong lúc chạy, WK_XEP là worker thật — không rơi về đường lui',
   await p.evaluate(() => !!WK_XEP));
kt('Luồng chính rảnh: giao diện trả lời ngay giữa lúc xếp',
   await p.evaluate(() => { const t = performance.now(); void document.body.offsetHeight; return performance.now() - t < 200; }));
await p.waitForFunction(() => PA_TIM && !DANG_XEP_KY, null, { timeout: 30000 });
const kq = await p.evaluate(() => ({
  soPA: PA_TIM.phuongAn.length,
  thieu: PA_TIM.phuongAn[0]?.thieu,
  diem: PA_TIM.phuongAn[0]?.diem,
  diemLuoi: diemToanCuc(),
  tongTiet: S.lop.reduce((s, l) => s + Object.keys(S.tkb[l.id] || {}).length, 0),
  donSach: WK_XEP === null
}));
kt('Trả về ít nhất 1 phương án, đủ 710/710 tiết',
   kq.soPA >= 1 && kq.thieu === 0 && kq.tongTiet === 710, `${kq.soPA} phương án`);
kt('Điểm phương án khớp đúng lưới đã nạp — bất biến làm tròn giữ qua ranh giới Worker',
   kq.diem === kq.diemLuoi, `${kq.diem} = ${kq.diemLuoi}`);
kt('Xong việc thì worker được dọn sạch', kq.donSach);

console.log('3. Nút Dừng lại');
await p.evaluate(() => { PA_TIM = null; chayXepKy(60, 3); });
await p.waitForTimeout(1500);
const t1 = Date.now();
await p.evaluate(() => {
  [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Dừng lại')?.click();
});
await p.waitForFunction(() => PA_TIM && !DANG_XEP_KY, null, { timeout: 15000 });
kt('Bấm Dừng là dừng trong vài giây, không đợi hết 60 giây', Date.now() - t1 < 10000,
   `${((Date.now() - t1) / 1000).toFixed(1)} giây`);
kt('Dừng giữa chừng vẫn giữ phương án tốt nhất, đủ tiết', await p.evaluate(() =>
   PA_TIM.phuongAn.length >= 1 && PA_TIM.phuongAn[0].thieu === 0));

kt('Không lỗi JavaScript nào trên trang', loiTrang.length === 0, loiTrang.join(' | '));

await tr.close();
may.close();
console.log(`\nKết quả soi Worker: ${dat} đạt, ${hong} hỏng`);
process.exit(hong ? 1 : 0);
