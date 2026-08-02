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

/* ==================================================================
   3. APP GHI VÀO BẢNG NÀO — BẢNG ẤY CÓ CHO GHI KHÔNG
   ------------------------------------------------------------------
   Lớp lỗi đắt nhất của cả dự án, đã cắn ĐÚNG HAI LẦN:

     · nút "Công bố cho giáo viên" bấm mãi không ăn — bảng tkb_phien_ban
       thiếu quy tắc UPDATE (vá bằng db/cong-bo.sql)
     · lưu tên trường không vào — bảng truong thiếu quy tắc UPDATE
       (tìm ra 2/8/2026, vá bằng db/sua-thong-tin-truong.sql)

   Vì sao khó thấy: RLS bật mà thiếu quy tắc thì PostgREST KHÔNG báo lỗi.
   Nó sửa 0 dòng rồi trả về thành công. Phần mềm khoe "đã lưu", người dùng
   tin, và chỉ phát hiện ra khi tải lại trang — có khi vài ngày sau.

   Không có cách nào bắt bằng cách đọc SQL không thôi, cũng không bắt được
   bằng cách đọc mã ứng dụng không thôi. Phải ĐỐI CHIẾU hai bên.
   ================================================================== */
const QUYEN = {};                    /* bảng → tập lệnh được phép (insert/update/…) */
const themQuyen = (b, c) => (QUYEN[b] = QUYEN[b] || new Set()).add(c.toLowerCase());

for (const t of dsTep) {
  const ma = boChuThich(doc(t));
  /* a) Quy tắc khai thẳng tên bảng */
  for (const m of ma.matchAll(/create\s+policy\s+\w+\s+on\s+(?:public\.)?(\w+)\s+for\s+(\w+)/gi))
    themQuyen(m[1].toLowerCase(), m[2]);
  /* b) Quy tắc dựng trong vòng lặp `foreach b in array[…]` bằng format() —
     tên bảng nằm ở mảng, tên lệnh nằm trong chuỗi format. */
  for (const kh of ma.matchAll(/array\s*\[([^\]]*)\]([\s\S]*?)end\s*\$\$/gi)) {
    const bang = [...kh[1].matchAll(/'([^']+)'/g)].map(x => x[1].toLowerCase());
    for (const p of kh[2].matchAll(/create\s+policy[^']*?\s+for\s+(\w+)/gi))
      bang.forEach(b => themQuyen(b, p[1]));
  }
}

/* Ứng dụng ghi vào đâu. Đọc thẳng src/index.html — nguồn sự thật duy nhất. */
const APP = readFileSync(join(DB, '..', 'src', 'index.html'), 'utf8');
const CAN = {};                      /* bảng → tập lệnh ứng dụng thật sự dùng */
const themCan = (b, c, vi) => {
  const o = CAN[b] = CAN[b] || {};
  (o[c] = o[c] || new Set()).add(vi);
};
for (const m of APP.matchAll(/\/rest\/v1\/(\w+)/g)) {
  const b = m[1].toLowerCase();
  if (!BANG.has(b)) continue;                       /* rpc/… và đường lạ thì bỏ */
  const truoc = APP.slice(Math.max(0, m.index - 90), m.index);
  const sau = APP.slice(m.index, m.index + 300);
  const dong = APP.slice(0, m.index).split('\n').length;
  /* suaHang() tự gắn PATCH nên tên lệnh không nằm cạnh đường dẫn */
  if (/suaHang\(\s*$|suaHang\(\s*`?$/.test(truoc)) themCan(b, 'update', dong);
  const pt = sau.match(/method\s*:\s*'(\w+)'/);
  if (pt) {
    if (pt[1] === 'PATCH') themCan(b, 'update', dong);
    if (pt[1] === 'DELETE') themCan(b, 'delete', dong);
    if (pt[1] === 'POST') {
      themCan(b, 'insert', dong);
      /* Upsert cần CẢ hai: thêm dòng mới và sửa dòng đã có */
      if (/merge-duplicates/.test(sau)) themCan(b, 'update', dong);
    }
  }
}
/* Hàm gộp dùng chung: `gop(bang, hàng, khoá)` luôn là upsert */
for (const m of APP.matchAll(/\bgop\(\s*'(\w+)'/g))
  if (BANG.has(m[1].toLowerCase())) {
    const dong = APP.slice(0, m.index).split('\n').length;
    themCan(m[1].toLowerCase(), 'insert', dong); themCan(m[1].toLowerCase(), 'update', dong);
  }

console.log('Đối chiếu quyền ghi: src/index.html ↔ quy tắc RLS trong db/\n');
let thieu = 0;
for (const [b, lenh] of Object.entries(CAN).sort()) {
  const cho = QUYEN[b] || new Set();
  for (const [c, dong] of Object.entries(lenh)) {
    if (cho.has(c) || cho.has('all')) continue;
    thieu++; loi++;
    console.log(`  ❌ bảng ${b}: ứng dụng có lệnh ${c.toUpperCase()} (dòng `
      + `${[...dong].sort((x, y) => x - y).join(', ')} của src/index.html) `
      + `nhưng không quy tắc RLS nào cho phép`);
    console.log(`     → PostgREST sẽ sửa 0 dòng và vẫn báo thành công. `
      + `Thêm quy tắc "for ${c}" cho bảng ${b} trong db/`);
  }
}
if (!thieu) console.log(`  ✅ ${Object.keys(CAN).length} bảng ứng dụng có ghi vào `
  + 'đều có quy tắc RLS tương ứng');
console.log('');

/* ---------- 4. Cú pháp, nếu máy có bộ phân tích ---------- */
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
