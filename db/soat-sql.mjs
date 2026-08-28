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
/* Cột nào khai kiểu enum thì nhớ lại — đây là chỗ dò ngược khi thấy so sánh.
   Cột kiểu uuid cũng nhớ: uuid không có min/max, xem mục (c) bên dưới. */
const COT_UUID = new Set();
for (const t of dsTep)
  for (const m of chiMa(doc(t)).matchAll(/^\s*(\w+)\s+(\w+)\s*(?:not null|default|,|primary|references|$)/gim)) {
    if (ENUM[m[2]]) COT_ENUM[m[1]] = m[2];
    if (m[2].toLowerCase() === 'uuid') COT_UUID.add(m[1].toLowerCase());
  }

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
  /* Hai chỗ chữ "from" · "update" KHÔNG dẫn tới tên bảng, bỏ qua kẻo kêu oan:
     "a is not distinct from b" (phép so sánh trong trigger) và
     "before update on t" (khai trigger — tên bảng đứng sau "on"). */
  for (const m of ma.matchAll(/\b(?:(?<!distinct\s)from|join|update(?!\s+on\b)|insert\s+into|alter\s+table|delete\s+from)\s+(?:if\s+exists\s+)?([a-z_][\w.]*)/gi)) {
    const b = m[1].toLowerCase().replace(/^public\./, '');
    if (BANG.has(b) || BANG_NGOAI.test(b) || cte.has(b) || TU_KHOA.test(b)) continue;
    if (/^(jsonb_|json_|generate_)/.test(b) || b.includes('(')) continue;   /* hàm trả bảng */
    than.push(`⚠️  bảng lạ: ${m[1]} — không có trong lệnh create table nào`);
  }

  /* c) min()/max() trên cột kiểu uuid.
     Postgres KHÔNG có min(uuid)/max(uuid) — không có toán tử so sánh thứ tự
     cho uuid. Cú pháp hoàn toàn hợp lệ nên bộ phân tích im lặng; lỗi chỉ nổ
     lúc chạy: "function min(uuid) does not exist".
     Đã cắn thật 2/8/2026, và cắn ở chỗ tệ nhất: câu lệnh nối lại tài khoản
     giáo viên đổ giữa chừng, nên bước dọn sau đó chạy mãi không ra kết quả
     mà chẳng ai hiểu vì sao. Cách viết đúng: min(g.id::text)::uuid */
  for (const m of ma.matchAll(/\b(min|max)\s*\(\s*(?:\w+\.)?(\w+)\s*\)/gi))
    if (COT_UUID.has(m[2].toLowerCase()))
      than.push(`❌ ${m[1]}(${m[2]}) — cột kiểu uuid không có min/max. `
        + `Viết ${m[1]}(${m[2]}::text)::uuid`);

  /* d) Cột trả về của hàm plpgsql trùng tên cột bảng — "ambiguous".
     RETURNS TABLE biến mỗi cột trả về thành một biến trong thân hàm. Gặp
     `select ma_truong … from truong` thì plpgsql KHÔNG chọn giúp mà nổ
     "column reference is ambiguous" — cú pháp hợp lệ nên bộ phân tích im
     lặng, lỗi chỉ nổ lúc chạy. Đã cắn thật 25/8/2026: duyet_truong() hỏng
     ngay ở đơn đăng ký trường đầu tiên. Cách viết đúng: mang bí danh bảng
     ở MỌI cột trong thân hàm — `select t.ma_truong from truong t`.
     Chỉ soát plpgsql: hàm `language sql` tự ưu tiên cột bảng, không nổ. */
  for (const f of ma.matchAll(
    /function\s+(\w+)\s*\([^)]*\)\s*returns\s+table\s*\(([^)]*)\)\s*language\s+plpgsql[\s\S]*?as\s*\$\$([\s\S]*?)\$\$/gi)) {
    const cotRa = [...f[2].matchAll(/(\w+)\s+\w/g)].map(m => m[1].toLowerCase());
    for (const s of f[3].matchAll(/\bselect\s+([^;]*?)\s+into\b/gi))
      for (const muc of s[1].split(','))
        if (cotRa.includes(muc.trim().toLowerCase()))
          than.push(`❌ hàm ${f[1]}(): "select ${muc.trim()} … into" — trùng tên cột trả về, `
            + `plpgsql nổ "ambiguous". Viết bí danh: select t.${muc.trim()} from … t`);
    for (const s of f[3].matchAll(/\b(?:where|and|or)\s+(\w+)\s*[=<>]/gi))
      if (cotRa.includes(s[1].toLowerCase()))
        than.push(`❌ hàm ${f[1]}(): "where ${s[1]} =" — trùng tên cột trả về, `
          + `plpgsql nổ "ambiguous". Viết bí danh: where t.${s[1]} = …`);
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
   2b. CỘT QUYẾT ĐỊNH QUYỀN PHẢI ĐƯỢC CANH THEO CỘT
   ------------------------------------------------------------------
   RLS của Postgres cấp quyền theo DÒNG, không theo CỘT. Nên một quy
   tắc đúng lúc viết — "quản lý sửa được hồ sơ người dùng trong trường
   mình" — tự rộng ra mỗi lần bảng ấy mọc thêm một cột quyết định
   quyền, mà không ai sửa một dòng nào.

   Đã xảy ra thật (rà soát 28/8/2026): cột la_chu_he_thong thêm vào
   nguoi_dung ngày 24/8 rơi thẳng vào vùng p_nd_sua cho ghi, nên bất
   kỳ quản trị trường nào cũng tự phong mình làm chủ hệ thống được chỉ
   bằng một lệnh PATCH. Cùng gốc: vai_tro và diem_truong_id của bảng
   ấy, trang_thai_duyet và ma_truong của bảng truong.

   Luật này suy danh sách cột từ CHÍNH các hàm quyền — hàm nào đọc một
   cột rồi đem ra quyết định ai được làm gì thì cột ấy là cột quyết
   định quyền. Mỗi cột như vậy phải được khai một trong hai khuôn sau,
   ở bất kỳ tệp .sql nào:

       -- CANH-COT: <bảng>.<cột>          có trigger chặn ghi trái phép
       -- KHONG-CANH: <bảng>.<cột> — <lý do>

   Khai CANH-COT thì phải có trigger THẬT: một hàm trigger nhắc tên
   cột ấy, và một lệnh create trigger trên đúng bảng ấy. Khai suông
   không tính — đó chính là kiểu "vá bằng lời" mà bộ soát sinh ra để
   ngăn.
   ================================================================== */
/* Bảng tra <bảng> → <cột>, dựng từ create table và alter table add column.
   Không chép tay danh sách nào — cùng nguyên tắc của cả tệp này. */
const COT_BANG = {};
for (const t of dsTep) {
  const ma = boChuThich(doc(t));
  for (const m of ma.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?(\w+)\s*\(([\s\S]*?)\n\s*\);/gi)) {
    const b = m[1].toLowerCase();
    const bo = COT_BANG[b] = COT_BANG[b] || new Set();
    for (const d of m[2].split('\n')) {
      const c = d.trim().match(/^([a-z_]\w*)\s+[a-z]/i);
      if (c && !/^(primary|unique|foreign|check|constraint)$/i.test(c[1])) bo.add(c[1].toLowerCase());
    }
  }
  for (const m of ma.matchAll(/alter\s+table\s+(?:public\.)?(\w+)\s+add\s+column\s+(?:if\s+not\s+exists\s+)?(\w+)/gi)) {
    const b = m[1].toLowerCase();
    (COT_BANG[b] = COT_BANG[b] || new Set()).add(m[2].toLowerCase());
  }
}

const COT_QUYEN = {};                /* "bảng.cột" → hàm quyền phát hiện ra nó */
const CANH = new Map();              /* "bảng.cột" → tệp khai */
const KHONG_CANH = new Map();
const TRIGGER_BANG = {};             /* bảng → [tên hàm trigger] */
const THAN_TRIGGER = {};             /* tên hàm trigger → thân hàm */
const GHI_DUOC = {};                 /* bảng → tập lệnh ghi mà RLS cho phép */

for (const t of dsTep) {
  const ma = boChuThich(doc(t));

  /* a) HÀM QUYỀN — và chỉ hàm quyền: `language sql` + `stable`, thân là một
     câu select đọc hồ sơ người đang đăng nhập. Đó đúng là khuôn của
     truong_cua_toi() · vai_tro_cua_toi() · la_chu_he_thong() ·
     diem_truong_cua_toi() · truong_duoc_dung().

     Đừng nới ra cho mọi hàm có auth.uid(): bản đầu làm vậy và vơ luôn hàm
     nghiệp vụ plpgsql (duyet_truong, luu_tkb), nhặt ra những "cột" tên là
     false, null, format và cả biến cục bộ v_tt. Một bộ soát kêu oan tám
     lần thì lần thứ chín kêu đúng cũng không ai đọc nữa.

     Bỏ bí danh bảng và phần so sánh phía sau — thân hàm hay viết
     "select t.trang_thai_duyet = 'dang_dung' from truong t". */
  for (const f of ma.matchAll(
    /create\s+or\s+replace\s+function\s+(\w+)\s*\(\s*\)\s*returns\s+(?!trigger|table)[\w.]+\s+language\s+sql\s+stable([\s\S]*?)\$\$([\s\S]*?)\$\$/gi)) {
    const than = f[3];
    if (!/auth\.uid\(\)|truong_cua_toi\(\)/i.test(than)) continue;
    for (const s of than.matchAll(/\bselect\s+([\s\S]*?)\s+from\s+(?:public\.)?(\w+)\b/gi)) {
      const bang = s[2].toLowerCase();
      const cotCua = COT_BANG[bang];
      if (!cotCua) continue;
      /* Nhận MỌI định danh trong phần chọn, giữ lại cái nào là cột thật của
         bảng ấy. "coalesce((select la_chu_he_thong" và
         "t.trang_thai_duyet = 'dang_dung'" đều ra đúng một cột. */
      for (const d of s[1].matchAll(/[a-z_]\w*/gi)) {
        const cot = d[0].toLowerCase();
        if (cotCua.has(cot)) COT_QUYEN[bang + '.' + cot] = f[1];
      }
    }
  }

  /* b) Khai báo của người viết — đọc cả chú thích, vì đó là nơi khai */
  for (const m of doc(t).matchAll(/--\s*CANH-COT:\s*(\w+)\.(\w+)/gi))
    CANH.set(`${m[1].toLowerCase()}.${m[2].toLowerCase()}`, t);
  for (const m of doc(t).matchAll(/--\s*KHONG-CANH:\s*(\w+)\.(\w+)/gi))
    KHONG_CANH.set(`${m[1].toLowerCase()}.${m[2].toLowerCase()}`, t);

  /* c) Trigger có thật hay không */
  for (const m of ma.matchAll(
    /create\s+or\s+replace\s+function\s+(\w+)\s*\(\s*\)\s*returns\s+trigger([\s\S]*?)\$\$([\s\S]*?)\$\$/gi))
    THAN_TRIGGER[m[1].toLowerCase()] = m[3];
  for (const m of ma.matchAll(
    /create\s+trigger\s+\w+[\s\S]{0,160}?\bon\s+(?:public\.)?(\w+)[\s\S]{0,160}?execute\s+(?:function|procedure)\s+(\w+)/gi)) {
    const b = m[1].toLowerCase();
    (TRIGGER_BANG[b] = TRIGGER_BANG[b] || []).push(m[2].toLowerCase());
  }

  /* d) Bảng nào cho người dùng thường GHI — chỉ những bảng ấy mới cần canh */
  const themGhi = (b, c) => (GHI_DUOC[b] = GHI_DUOC[b] || new Set()).add(c.toLowerCase());
  for (const m of ma.matchAll(/create\s+policy\s+\w+\s+on\s+(?:public\.)?(\w+)\s+for\s+(\w+)/gi))
    themGhi(m[1].toLowerCase(), m[2]);
  for (const kh of ma.matchAll(/array\s*\[([^\]]*)\]([\s\S]*?)end\s*\$\$/gi)) {
    const bang = [...kh[1].matchAll(/'([^']+)'/g)].map(x => x[1].toLowerCase());
    for (const p of kh[2].matchAll(/create\s+policy[^']*?\s+for\s+(\w+)/gi))
      bang.forEach(b => themGhi(b, p[1]));
  }
}

console.log('Cột quyết định quyền: có được canh theo cột không\n');
console.log('  Cột tìm được  : ' + (Object.keys(COT_QUYEN).sort().join('  ') || '(không có — luật này đang mù, xem lại khuôn hàm quyền)'));
let hoCot = 0, daSoi = 0;
for (const [khoa, ham] of Object.entries(COT_QUYEN).sort()) {
  const [bang, cot] = khoa.split('.');
  const cho = GHI_DUOC[bang] || new Set();
  /* Bảng chỉ cho đọc thì cột nào cũng an toàn — không đòi trigger */
  if (!cho.has('all') && !cho.has('update') && !cho.has('insert')) continue;
  daSoi++;
  if (KHONG_CANH.has(khoa)) continue;

  if (!CANH.has(khoa)) {
    hoCot++; loi++;
    console.log(`  ❌ ${khoa} — ${ham}() đọc cột này để quyết định quyền, mà bảng `
      + `${bang} lại có quy tắc RLS cho người dùng thường ghi`);
    console.log(`     → viết trigger chặn rồi khai "-- CANH-COT: ${khoa}", hoặc khai `
      + `"-- KHONG-CANH: ${khoa} — <lý do>" nếu cột ấy thật sự vô hại`);
    continue;
  }
  const coCanh = (TRIGGER_BANG[bang] || []).some(h => (THAN_TRIGGER[h] || '').includes(cot));
  if (!coCanh) {
    hoCot++; loi++;
    console.log(`  ❌ ${khoa} — khai CANH-COT ở ${CANH.get(khoa)} nhưng không trigger `
      + `nào trên bảng ${bang} nhắc tới cột ấy`);
    console.log('     → khai suông không chặn được gì; viết trigger thật rồi chạy lại');
  }
}
if (!hoCot) console.log(`  ✅ ${daSoi} cột quyết định quyền trên các bảng cho ghi `
  + 'đều được canh, hoặc đã khai rõ lý do bỏ qua');
console.log('');

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
