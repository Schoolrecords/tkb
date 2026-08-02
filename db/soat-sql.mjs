/* ==================================================================
   SOÁT TỆP SQL TRƯỚC KHI ĐƯA NGƯỜI KHÁC DÁN VÀO SQL EDITOR
   ------------------------------------------------------------------
   Chạy:  node db/soat-sql.mjs

   VÌ SAO CÓ TỆP NÀY
     2/8/2026: db/soi-cai-dat.sql viết `vai_tro = 'gv'` trong khi enum
     vai_tro_t chỉ nhận 'giao_vien'. Cú pháp hoàn toàn hợp lệ nên bộ
     phân tích của Postgres không hé một lời — chủ dự án dán vào, bấm
     Run, và nhận lỗi 22P02. Tệ hơn: một giá trị sai làm HỎNG CẢ CÂU,
     chín dòng kiểm tra kia cũng không ra được dòng nào.

     Bài học: soát cú pháp là chưa đủ. Thứ hay sai nhất trong SQL viết
     tay không phải dấu phẩy, mà là ĐOÁN tên — tên bảng, tên cột, tên
     giá trị enum. Ba thứ đó đều tra được từ chính schema.

   SOÁT BA VIỆC
     1. Giá trị enum  — mọi `<cột> = '<chữ>'` với cột kiểu enum
     2. Tên bảng      — mọi `from`/`join`/`update`/`insert into`
     3. Cú pháp       — nếu máy có libpg-query (không có thì bỏ qua êm,
                        để CI không phải dựng addon biên dịch)

   Nguồn sự thật là db/schema.sql và các tệp `create table` khác trong
   cùng thư mục — không chép tay danh sách nào vào đây.
   ================================================================== */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DB = dirname(fileURLToPath(import.meta.url));
const doc = t => readFileSync(join(DB, t), 'utf8');
const dsTep = readdirSync(DB).filter(t => t.endsWith('.sql')).sort();

/* HAI bộ lọc, dùng cho hai việc khác nhau — đừng gộp làm một:

   `boChuThich` chỉ bỏ chú thích, GIỮ chuỗi ký tự. Dùng khi cần đọc
   chính nội dung chuỗi: giá trị enum, giá trị đem ra so sánh.

   `chiMa` bỏ cả chuỗi. Dùng khi dò TÊN: chú thích tiếng Việt của dự án
   đầy chữ "from", "join", và chuỗi ký tự cũng có thể chứa chúng.

   Đã dính thật: gộp làm một thì `create type … as enum ('quan_tri', …)`
   bị nuốt sạch giá trị, bảng tra enum thành rỗng, và bộ soát quay ra
   báo lỗi cho MỌI giá trị — kể cả giá trị đúng. */
const boChuThich = s => s
  .replace(/--[^\n]*/g, ' ')
  .replace(/\/\*[\s\S]*?\*\//g, ' ');
const chiMa = s => boChuThich(s).replace(/'(?:[^']|'')*'/g, "''");

/* ---------- 1. Đọc enum và bảng từ schema ---------- */
const ENUM = {};        /* tên kiểu   → [giá trị hợp lệ] */
const COT_ENUM = {};    /* tên cột    → tên kiểu */
const BANG = new Set();

for (const t of dsTep) {
  /* Bỏ chú thích: chú thích của dự án có trích dẫn `create table if not
     exists` để giải thích, đọc cả chú thích thì bắt nhầm chữ "if" thành
     một cái tên bảng. Nhưng GIỮ chuỗi — giá trị enum nằm trong chuỗi. */
  const ma = boChuThich(doc(t));
  for (const m of ma.matchAll(/create type\s+(\w+)\s+as enum\s*\(([^)]*)\)/gi))
    ENUM[m[1]] = [...m[2].matchAll(/'([^']*)'/g)].map(x => x[1]);
  /* `temp`/`temporary` cũng là bảng thật trong phiên làm việc — bỏ sót thì
     tệp nào dùng bảng tạm cũng bị kêu oan là "bảng lạ". */
  for (const m of ma.matchAll(/create\s+(?:temp(?:orary)?\s+|unlogged\s+)?table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?(\w+)/gi))
    BANG.add(m[1].toLowerCase());
}
/* Cột nào khai kiểu enum thì nhớ lại — đây là chỗ dò ngược khi thấy so sánh */
for (const t of dsTep)
  for (const m of chiMa(doc(t)).matchAll(/^\s*(\w+)\s+(\w+)\s*(?:not null|default|,|$)/gim))
    if (ENUM[m[2]]) COT_ENUM[m[1]] = m[2];

/* Bảng hệ thống của Postgres và Supabase — tra được, không phải của mình */
const BANG_NGOAI = /^(pg_\w+|information_schema\.\w+|auth\.\w+|storage\.\w+)$/i;

/* ---------- 2. Soát từng tệp ---------- */
let loi = 0, canh = 0;
console.log(`Soát ${dsTep.length} tệp SQL trong db/\n`);
console.log(`  Enum đọc được : ${Object.entries(ENUM).map(([k, v]) => `${k}(${v.join('|')})`).join('  ')}`);
console.log(`  Bảng đọc được : ${[...BANG].sort().join(', ')}\n`);

for (const t of dsTep) {
  const ma = chiMa(doc(t));
  const than = [];

  /* a) Giá trị enum — cả `cot = 'x'` lẫn `cot in ('x','y')` */
  for (const [cot, kieu] of Object.entries(COT_ENUM)) {
    const hop = ENUM[kieu];
    const dò = new RegExp(`\\b${cot}\\b(?:::text)?\\s*(?:=|in)\\s*\\(?((?:\\s*'[^']*'\\s*,?)+)\\)?`, 'gi');
    for (const m of boChuThich(doc(t)).matchAll(dò))
      for (const g of [...m[1].matchAll(/'([^']*)'/g)].map(x => x[1]))
        if (!hop.includes(g))
          than.push(`❌ ${cot} = '${g}' — kiểu ${kieu} chỉ nhận: ${hop.join(' · ')}`);
  }

  /* b) Tên bảng.
     Bảng tạm khai bằng WITH (CTE) chỉ sống trong đúng câu lệnh ấy, nên
     phải gom trước rồi mới dò — không thì câu nào có WITH cũng kêu oan. */
  const cte = new Set([...ma.matchAll(/(?:with|,)\s+(\w+)\s*(?:\([^)]*\))?\s+as\s*\(/gi)]
    .map(m => m[1].toLowerCase()));
  /* Từ khoá SQL đứng ngay sau from/join, không phải tên bảng */
  /* `public` ở đây là VAI TRÒ trong `revoke ... from public`, không phải bảng */
  const TU_KHOA = /^(select|lateral|values|only|unnest|set|using|row|table|public)$/;
  for (const m of ma.matchAll(/\b(?:from|join|update|insert\s+into|alter\s+table|delete\s+from)\s+(?:if\s+exists\s+)?([a-z_][\w.]*)/gi)) {
    const b = m[1].toLowerCase().replace(/^public\./, '');
    if (BANG.has(b) || BANG_NGOAI.test(b) || cte.has(b) || TU_KHOA.test(b)) continue;
    if (/^(jsonb_|json_|generate_)/.test(b) || b.includes('(')) continue;   /* hàm trả bảng */
    than.push(`⚠️  bảng lạ: ${m[1]} — không có trong lệnh create table nào`);
  }

  const nang = than.filter(x => x.startsWith('❌'));
  if (nang.length) loi += nang.length;
  canh += than.length - nang.length;
  if (than.length) {
    console.log(`${t}`);
    /* Cảnh báo bảng lạ hay lặp lại nhiều lần cho cùng một cái tên */
    [...new Set(than)].forEach(d => console.log(`  ${d}`));
    console.log('');
  }
}

/* ---------- 3. Cú pháp, nếu máy có bộ phân tích ---------- */
let cuPhap = 'bỏ qua (chưa cài libpg-query — cài bằng: npm i --no-save libpg-query)';
try {
  const { parse } = await import('libpg-query');
  let so = 0;
  for (const t of dsTep) {
    try { so += (await parse(doc(t))).stmts.length; }
    catch (e) { console.log(`${t}\n  ❌ cú pháp: ${e.message}\n`); loi++; }
  }
  cuPhap = `đạt — ${so} câu lệnh qua bộ phân tích của Postgres`;
} catch { /* không có thì thôi, phần soát tên vẫn chạy */ }

console.log(`Cú pháp : ${cuPhap}`);
console.log(loi ? `\n\x1b[1mHỏng: ${loi} lỗi, ${canh} cảnh báo\x1b[0m\n`
                : `\n\x1b[1mĐạt: 0 lỗi, ${canh} cảnh báo\x1b[0m\n`);
process.exit(loi ? 1 : 0);
