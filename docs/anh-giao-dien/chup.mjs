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
  /* Vi phạm CSP KHÔNG phải lỗi JavaScript — nó chỉ hiện ở console. Không bắt
     ở đây thì một chỉ thị quá chặt lặng lẽ chặn mất thư viện Excel hay phông
     chữ, mọi bộ soi vẫn xanh còn người dùng thì bấm nút không ra gì. */
  p.on('console', m => {
    const t = m.text();
    if (/Content Security Policy|Refused to (load|connect|execute)/i.test(t))
      loi.push(ten + ' [CSP]: ' + t.slice(0, 160));
  });
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
/* Màn chỉnh tay, có cột danh sách lớp bên trái (16/8/2026) — cột phải dừng
   đúng đáy lưới rồi cuộn bên trong, đây là chỗ bắt lỗi bố cục ấy */
await chup('31-theo-lop',            { cao: 1000, lam: async p => { await xep(p); await di('tkblop')(p); } });

/* Điện thoại — chủ dự án chủ yếu dùng máy này */
await chup('10-dt-bang-dieu-hanh',   { rong: 412, cao: 900, lam: di('dieuhanh') });
await chup('11-dt-lop-hoc',          { rong: 412, cao: 900, lam: di('lop') });
await chup('12-dt-toan-truong',      { rong: 412, cao: 900, lam: async p => { await xep(p); await di('toantruong')(p); } });
/* Ngăn kéo đang mở — lối điều hướng chính trên điện thoại từ 2/8/2026 */
await chup('17-dt-ngan-keo', { rong: 412, cao: 900, lam: async p => {
  await di('dieuhanh')(p); await p.click('#btMenu'); await p.waitForTimeout(350); } });

/* Hai màn hình giữ các việc chuyển ra khỏi thanh bên */
await chup('14-thong-tin-truong', { cao: 1000, lam: di('thongtin') });
await chup('15-diem-truong',      { lam: di('diemtruong') });
await chup('16-tao-du-lieu-thu',  { cao: 1000, lam: async p => {
  await di('diemtruong')(p); await p.click('#btTaoThu');
  await p.fill('#ttTenDiem', 'Phân hiệu Diễn Đồng');
  await p.fill('#ttTien', 'DD');
} });

/* ---------- Báo nghỉ và dạy thay (2/8/2026) ---------- */
/* Dựng sẵn một thông báo nghỉ để màn hình có nội dung thật, không phải
   ảnh của một màn hình trống. */
const baoNghi = p => p.evaluate(() => {
  const lop = Object.keys(S.tkb).find(l => S.tkb[l]['2-S-0']);
  const co = S.tkb[lop]['2-S-0'];
  const d = new Date(); d.setDate(d.getDate() + 1);
  const s = n => String(n).padStart(2, '0');
  let ngay = `${d.getFullYear()}-${s(d.getMonth() + 1)}-${s(d.getDate())}`;
  /* nhảy qua cuối tuần để có tiết thật */
  while ([0, 6].includes(new Date(ngay + 'T00:00:00').getDay())) {
    const x = new Date(ngay + 'T00:00:00'); x.setDate(x.getDate() + 1);
    ngay = `${x.getFullYear()}-${s(x.getMonth() + 1)}-${s(x.getDate())}`;
  }
  S.baoNghi = [{id: 'bn1', gvId: co.gvId, ngay, buoi: 'S',
    lyDo: 'Nghỉ ốm', ghiChu: '', trangThai: 'cho'}];
});
await chup('18-day-thay', { cao: 1050, lam: async p => {
  await xep(p); await baoNghi(p); await di('daythay')(p); } });
await chup('19-phuong-an-day-thay', { cao: 1100, lam: async p => {
  await xep(p); await baoNghi(p); await di('daythay')(p);
  await p.click('[data-xemphuongan]'); } });
await chup('20-bao-nghi', { cao: 1000, lam: async p => {
  await xep(p);
  await p.evaluate(() => { S.nguoiDung = {vaiTro:'gv', gvId:S.giaoVien[0].id, diemTruongId:null}; });
  await di('baonghi')(p); } });
await chup('21-thong-bao', { cao: 950, lam: async p => {
  await xep(p); await baoNghi(p); await di('thongbao')(p); } });
await chup('22-viec-can-xu-ly', { cao: 1050, lam: async p => {
  await xep(p); await baoNghi(p); await di('dieuhanh')(p); } });
await chup('23-dt-bao-nghi', { rong: 390, cao: 860, lam: async p => {
  await xep(p);
  await p.evaluate(() => { S.nguoiDung = {vaiTro:'gv', gvId:S.giaoVien[0].id, diemTruongId:null}; });
  await di('baonghi')(p); } });
await chup('24-dt-day-thay', { rong: 390, cao: 860, lam: async p => {
  await xep(p); await baoNghi(p); await di('daythay')(p); } });
await chup('25-dt-360-bang-dieu-hanh', { rong: 360, cao: 800, lam: async p => {
  await xep(p); await baoNghi(p); await di('dieuhanh')(p); } });
await chup('26-dt-430-bang-dieu-hanh', { rong: 430, cao: 900, lam: async p => {
  await xep(p); await baoNghi(p); await di('dieuhanh')(p); } });
/* Cột lớp trên điện thoại: nằm NGANG, cuộn ngang, lớp đang mở luôn trong tầm nhìn */
await chup('32-dt-theo-lop', { rong: 390, cao: 860, lam: async p => {
  await xep(p); await di('tkblop')(p); } });

/* ---------- Ba việc học từ SmartScheduler (30/8/2026) ----------
   Cả ba chỉ đọc S.tkb nên phải xếp lịch trước, không thì chụp ra màn
   hình trống — đúng thứ ảnh chụp sinh ra để tránh. */
await chup('33-ai-ranh', { cao: 1150, lam: async p => {
  await xep(p); await di('airanh')(p);
  /* Mở sẵn một ô để thấy cả phần chi tiết bốn nhóm */
  await p.click('[data-ranho]'); } });
await chup('34-soi-giao-vien', { rong: 1600, cao: 1000, lam: async p => {
  await xep(p); await di('toantruong')(p);
  await p.evaluate(() => {
    /* Soi người dạy nhiều nhất — đúng ca đáng soi, và lộ rõ ô mờ / ô nổi */
    const dem = {};
    lopChoLuoi().forEach(l => Object.values(S.tkb[l.id] || {})
      .forEach(v => dem[v.gvId] = (dem[v.gvId] || 0) + 1));
    S.soiGV = Object.entries(dem).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    ve();
  }); } });
await chup('35-loc-giao-vien', { cao: 1000, lam: async p => {
  await xep(p); await di('giaovien')(p); } });
/* Điện thoại: dải nút lọc và lưới ô giờ là hai chỗ dễ vỡ bố cục nhất */
await chup('36-dt-ai-ranh', { rong: 390, cao: 900, lam: async p => {
  await xep(p); await di('airanh')(p); } });
await chup('37-dt-loc-giao-vien', { rong: 390, cao: 900, lam: async p => {
  await xep(p); await di('giaovien')(p); } });

/* Trường CHƯA khai gì — thanh tiến trình phải chỉ rõ từng việc còn thiếu */
await chup('13-truong-moi-chua-co-gi', { lam: p => p.evaluate(() => {
  S.lop = []; S.giaoVien = []; S.phanCong = []; S.tkb = {};
  window.chuyen('dieuhanh');
}) });

await tr.close();
may.close();
console.log(loi.length ? '\nLỖI:\n' + loi.join('\n') : '\nKhông lỗi JavaScript nào.');
