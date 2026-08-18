/* ==================================================================
   SOI MỘT BẢN SAO LƯU — GIẢI MÃ VÀ XEM BÊN TRONG CÓ GÌ THẬT KHÔNG
   ------------------------------------------------------------------
   Chạy:  npm run soi-sao-luu -- <tệp .sql.gz.enc>

   Khoá giải mã lấy theo thứ tự: --khoa=<chuỗi>, rồi --khoa-tep=<tệp>,
   rồi biến môi trường BACKUP_KEY. Khoá đang cất ở
   `J:\Chung_Drive\App HoSoSo Truong hoc\KHOA-SAO-LUU.txt` — NGOÀI thư
   mục dự án, đừng chép vào đây.

   VÌ SAO CÓ TỆP NÀY
     "Sao lưu chưa từng thử khôi phục thì chưa phải là sao lưu." Workflow
     `.github/workflows/sao-luu.yml` đã tự chặn hai kiểu hỏng thô: tệp
     rỗng và tệp dưới 10KB. Nhưng cả hai đều không thấy được ba kiểu hỏng
     nguy hiểm hơn, vì chúng nằm BÊN TRONG lớp mã hoá:
       1. Khoá cất trong sổ không mở được tệp (chép sót một ký tự).
       2. pg_dump đứt giữa chừng — tệp vẫn to, vẫn mã hoá đẹp, mở ra
          thì cụt nửa bảng `phan_cong`.
       3. Dump đúng cú pháp nhưng RỖNG RUỘT — nối nhầm cơ sở dữ liệu,
          hoặc RLS chặn nên bảng nào cũng 0 dòng.
     Ba thứ ấy chỉ lộ ra khi thật sự mở bản sao lưu ra xem. Đó là việc
     của tệp này.

   KHÔNG GHI BẢN RÕ RA ĐĨA
     Bản dump chứa họ tên, email, nơi công tác của toàn bộ giáo viên —
     dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP. Nên nó được giải mã
     và bung nén trong bộ nhớ rồi thôi. Muốn lấy tệp .sql thật để khôi
     phục thì phải nói rõ: `--ghi=<tệp>`.

   DANH SÁCH BẢNG KHÔNG CHÉP TAY
     Lấy từ chính `db/*.sql` (mọi `create table if not exists`). Thêm
     bảng mới vào schema là tệp này biết ngay, không phải sửa hai chỗ.
   ================================================================== */

import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs'
import { pbkdf2Sync, createDecipheriv } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const THU_MUC_DB = dirname(fileURLToPath(import.meta.url))

// Bảng nào rỗng là hỏng thật, không phải "chưa dùng tới". Trường không
// có lớp, hoặc lớp không có dòng phân công nào, thì bản sao lưu ấy có
// khôi phục cũng chỉ ra một hệ thống trống rỗng.
const BANG_PHAI_CO_DU_LIEU = ['truong', 'giao_vien', 'lop', 'phan_cong']

// ------------------------------------------------------------------
// Đọc tham số
// ------------------------------------------------------------------
const thamSo = process.argv.slice(2)
const tepEnc = thamSo.find(t => !t.startsWith('--'))
const lay = ten => {
  const t = thamSo.find(x => x.startsWith(`--${ten}=`))
  return t ? t.slice(ten.length + 3) : null
}

if (!tepEnc) {
  console.error(`
Thiếu tệp cần soi.

  npm run soi-sao-luu -- sao-luu-2026-08-18.sql.gz.enc

Tệp lấy ở: GitHub → tab Actions → chọn lần chạy → mục Artifacts.
Tải về là một tệp .zip, giải nén ra mới thấy tệp .sql.gz.enc bên trong.

Khoá giải mã, chọn một trong ba cách:
  --khoa=CHUỖI-KHOÁ
  --khoa-tep="J:\\Chung_Drive\\App HoSoSo Truong hoc\\KHOA-SAO-LUU.txt"
  đặt biến môi trường BACKUP_KEY
`)
  process.exit(2)
}

let khoa = lay('khoa') || process.env.BACKUP_KEY || null
const tepKhoa = lay('khoa-tep')
if (!khoa && tepKhoa) {
  // Tệp khoá là ghi chú viết cho người đọc, không phải tệp cấu hình:
  // nó có vài dòng chữ rồi mới tới khoá. Lấy dòng dài nhất trông ra khoá.
  const dong = readFileSync(tepKhoa, 'utf8')
    .split(/\r?\n/).map(d => d.trim())
    .filter(d => /^[A-Za-z0-9+/=_-]{16,}$/.test(d))
  khoa = dong.sort((a, b) => b.length - a.length)[0] || null
  if (!khoa) {
    console.error(`Không tìm thấy dòng nào trông như khoá trong ${tepKhoa}`)
    process.exit(2)
  }
}
if (!khoa) {
  console.error('Chưa có khoá giải mã. Xem cách khai: chạy lại không kèm tệp.')
  process.exit(2)
}

// ------------------------------------------------------------------
// Giải mã — đúng định dạng `openssl enc -aes-256-cbc -pbkdf2 -salt`
// ------------------------------------------------------------------
//   [8 byte "Salted__"][8 byte muối][phần mã hoá]
// PBKDF2-SHA256, 10000 vòng, ra 48 byte: 32 byte khoá + 16 byte IV.
// Đây là mặc định của OpenSSL 1.1.1 trở lên — cùng bộ tham số workflow
// dùng lúc mã hoá, và cùng cái lệnh openssl ghi ở đầu tệp sao-luu.yml
// sẽ dùng lúc khôi phục thật.
function giaiMa(nhiPhan, matKhau) {
  if (nhiPhan.subarray(0, 8).toString('utf8') !== 'Salted__') {
    throw new Error(
      'Tệp không có dấu "Salted__" ở đầu — đây không phải tệp openssl mã hoá.\n' +
      '  Hay gặp nhất: tải về là tệp .zip của GitHub mà chưa giải nén.')
  }
  const muoi = nhiPhan.subarray(8, 16)
  const kdf = pbkdf2Sync(matKhau, muoi, 10000, 48, 'sha256')
  const d = createDecipheriv('aes-256-cbc', kdf.subarray(0, 32), kdf.subarray(32, 48))
  return Buffer.concat([d.update(nhiPhan.subarray(16)), d.final()])
}

const co = statSync(tepEnc).size
console.log(`\nTệp   ${tepEnc}`)
console.log(`Cỡ    ${(co / 1024).toFixed(1)} KB (đã mã hoá)\n`)

let nen
try {
  nen = giaiMa(readFileSync(tepEnc), khoa)
} catch (e) {
  const sai = /bad decrypt|wrong final block/i.test(e.message)
  console.error(sai
    ? '✗ GIẢI MÃ HỎNG — khoá không khớp.\n' +
      '  Khoá phải đúng từng ký tự với secret BACKUP_KEY trên GitHub.\n' +
      '  Chép tay dễ sót; thử lấy thẳng từ tệp khoá bằng --khoa-tep=...'
    : `✗ GIẢI MÃ HỎNG — ${e.message}`)
  process.exit(1)
}

let sql
try {
  sql = gunzipSync(nen).toString('utf8')
} catch {
  console.error('✗ Giải mã được nhưng BUNG NÉN hỏng — tệp đứt giữa chừng.\n' +
    '  Bản sao lưu này không dùng được; chạy lại workflow lấy bản mới.')
  process.exit(1)
}

console.log(`Giải mã và bung nén xong: ${(sql.length / 1024 / 1024).toFixed(2)} MB SQL\n`)

// ------------------------------------------------------------------
// Dump có trọn vẹn không
// ------------------------------------------------------------------
// pg_dump chỉ in dòng "PostgreSQL database dump complete" khi đã chạy
// hết. Đứt giữa chừng vì mạng hay vì hết giờ thì tệp vẫn to, vẫn mã hoá
// đẹp, vẫn qua được mọi phép kiểm ở workflow — chỉ thiếu đúng dòng này.
const tron = /PostgreSQL database dump complete/.test(sql)

// ------------------------------------------------------------------
// Đếm dòng dữ liệu từng bảng
// ------------------------------------------------------------------
// pg_dump đổ dữ liệu bằng khối COPY: một dòng mở đầu, các dòng dữ liệu,
// rồi một dòng chỉ có dấu `\.`. Đi thẳng qua văn bản để đếm — không tách
// mảng cả tệp, cho đỡ tốn bộ nhớ khi dump lớn.
const soDong = new Map()
const reCopy = /^COPY (?:public\.)?"?(\w+)"?\s*\(/gm
let m
while ((m = reCopy.exec(sql)) !== null) {
  const bang = m[1]
  let i = sql.indexOf('\n', m.index) + 1
  let dem = 0
  while (i > 0 && i < sql.length) {
    const cuoi = sql.indexOf('\n', i)
    const dong = sql.slice(i, cuoi === -1 ? sql.length : cuoi)
    if (dong === '\\.') break
    dem++
    if (cuoi === -1) break
    i = cuoi + 1
  }
  soDong.set(bang, (soDong.get(bang) || 0) + dem)
  reCopy.lastIndex = i
}
// Dump chạy với --inserts thì không có khối COPY nào; đỡ lấy đường này.
if (soDong.size === 0) {
  for (const k of sql.matchAll(/^INSERT INTO (?:public\.)?"?(\w+)"?/gm)) {
    soDong.set(k[1], (soDong.get(k[1]) || 0) + 1)
  }
}

// ------------------------------------------------------------------
// Đối chiếu với danh sách bảng trong db/*.sql
// ------------------------------------------------------------------
const bangCuaSchema = new Set()
for (const t of readdirSync(THU_MUC_DB).filter(t => t.endsWith('.sql'))) {
  const noiDung = readFileSync(join(THU_MUC_DB, t), 'utf8')
  for (const k of noiDung.matchAll(/create table if not exists\s+"?(\w+)"?/gi)) {
    bangCuaSchema.add(k[1])
  }
}

const tenBang = [...new Set([...bangCuaSchema, ...soDong.keys()])].sort()
const coTrongDump = t => new RegExp(`CREATE TABLE (?:public\\.)?"?${t}"?\\b`).test(sql)

console.log('BẢNG'.padEnd(20) + 'SỐ DÒNG'.padStart(10) + '  TÌNH TRẠNG')
console.log('─'.repeat(60))
const thieuHan = [], rong = []
for (const t of tenBang) {
  const dong = soDong.get(t) ?? 0
  let trangThai = ''
  if (!coTrongDump(t)) {
    trangThai = 'CHƯA CÓ TRÊN MÁY CHỦ'
    thieuHan.push(t)
  } else if (dong === 0 && BANG_PHAI_CO_DU_LIEU.includes(t)) {
    trangThai = '← RỖNG, bảng này không được rỗng'
    rong.push(t)
  } else if (dong === 0) {
    trangThai = 'rỗng (có thể là bình thường)'
  }
  console.log(t.padEnd(20) + String(dong).padStart(10) + '  ' + trangThai)
}

// ------------------------------------------------------------------
// Kết luận
// ------------------------------------------------------------------
console.log()
const loi = []
if (!tron) loi.push('Dump KHÔNG trọn vẹn — thiếu dòng kết "dump complete", tệp bị cụt.')
if (rong.length) loi.push(`Bảng rỗng mà lẽ ra phải có dữ liệu: ${rong.join(', ')}.`)
if (soDong.size === 0) loi.push('Không tìm thấy dòng dữ liệu nào trong dump.')

if (loi.length) {
  for (const d of loi) console.log('✗ ' + d)
  console.log('\nBản sao lưu này KHÔNG dùng được. Xem lại secret DB_URL' +
    ' (đúng dự án, cổng 5432,\nmật khẩu thật) rồi chạy lại workflow.')
  process.exit(1)
}

const tongDong = [...soDong.values()].reduce((a, b) => a + b, 0)
console.log('✓ Giải mã được bằng khoá đang cất, dump trọn vẹn, ' +
  `${soDong.size} bảng có dữ liệu, tổng ${tongDong} dòng.`)
if (thieuHan.length) {
  console.log(`\n  Ghi chú: ${thieuHan.length} bảng có trong db/*.sql nhưng chưa có` +
    ` trên máy chủ\n  (${thieuHan.join(', ')}).` +
    '\n  Đó là dấu hiệu db/cai-dat.sql chưa chạy hết trên máy chủ thật —' +
    '\n  không phải lỗi của bản sao lưu.')
}

const tepGhi = lay('ghi')
if (tepGhi) {
  writeFileSync(tepGhi, sql)
  console.log(`\n⚠ Đã ghi bản RÕ ra ${tepGhi} — tệp này chứa dữ liệu cá nhân của` +
    '\n  toàn bộ giáo viên. Dùng xong xoá ngay, đừng để trong thư mục dự án.')
} else {
  console.log('\nBản rõ chỉ nằm trong bộ nhớ, không ghi ra đĩa.' +
    ' Cần tệp .sql để khôi phục\nthì thêm --ghi=<tệp>.')
}
