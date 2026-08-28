// ============================================================
// Gộp bốn tệp SQL lõi thành db/cai-dat.sql — bộ cài một lần dán
// ------------------------------------------------------------
// Vì sao cần: dựng cơ sở dữ liệu cho một trường mới từng phải dán
// tay nhiều tệp SQL theo đúng thứ tự — quên một tệp là app chạy
// được nhưng thiếu tính năng ngầm (màn hình Môn học không lưu,
// nút Công bố không bấm được...). Nút thắt số 1 khi nhân rộng.
//
// Cách dùng:
//   node db/gop-cai-dat.mjs          sinh lại db/cai-dat.sql
//   node db/gop-cai-dat.mjs --kiem   chỉ kiểm tra, lệch thì báo lỗi
//                                    (CI chạy chế độ này)
//
// Sửa SQL thì sửa ở BỐN TỆP NGUỒN rồi chạy lại tệp này.
// Đừng sửa thẳng db/cai-dat.sql — lần sinh sau sẽ đè mất.
// ============================================================
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const thuMuc = dirname(fileURLToPath(import.meta.url));

// Thứ tự QUAN TRỌNG: các tệp sau dùng hàm/bảng của tệp trước.
const NGUON = [
  'schema.sql',          // bảng + RLS + luu_tkb
  'ma-lop.sql',          // NÂNG CẤP: thêm cột ma_lop cho CSDL dựng trước 1/8/2026
                         // — `create table if not exists` không thêm cột vào
                         //   bảng đã có, thiếu nó là mọi lệnh ghi lớp đều đổ
  'mon-hoc-phong.sql',   // danh mục môn, bảng phòng (dùng truong_cua_toi)
  'cong-bo.sql',         // quy tắc UPDATE để bấm được nút Công bố
  'sua-thong-tin-truong.sql', // quy tắc UPDATE để lưu được tên trường, năm học
                         // — thiếu nó thì đổi tên đơn vị sau sáp nhập không lưu nổi
  'day-thay.sql',        // phân công dạy thay theo ngày
  'bao-nghi.sql',        // giáo viên báo nghỉ theo ngày — phải SAU day-thay.sql
                         //   vì có `alter table day_thay add column`
  'ma-moi.sql',          // vào trường bằng Google + mã mời
  'dang-ky-truong.sql',  // trường mới tự đăng ký qua giao diện
  'tai-nhe.sql',         // tkb_cua_toi() — giáo viên chỉ tải lịch của mình
                         //   thay vì cả khối TKB toàn trường
  'luu-pham-vi.sql',     // ba phó hiệu trưởng cùng xếp mà không giẫm lên nhau
                         // — phải đứng SAU schema.sql: nó drop rồi dựng lại
                         //   luu_tkb và don_du_lieu_cu của tệp ấy
  'duyet-truong.sql',    // đăng ký trường phải được CHỦ HỆ THỐNG duyệt, cấp mã
                         //   5 chữ số — phải đứng sau dang-ky-truong.sql (dựng
                         //   lại dang_ky_truong) và schema.sql (dựng lại p_tkb_ghi)
  'siet-quyen.sql',      // trigger canh theo CỘT: không ai tự phong chủ hệ thống,
                         //   tự nâng vai trò, tự bỏ giới hạn điểm trường hay tự
                         //   duyệt trường mình — phải đứng SAU duyet-truong.sql vì
                         //   cần cột la_chu_he_thong và trang_thai_duyet
];

const doc = t => readFileSync(join(thuMuc, t), 'utf8').replace(/\r\n/g, '\n');

const dau = `-- ============================================================
-- BỘ CÀI ĐẶT TRỌN GÓI — dán MỘT LẦN cho một dự án Supabase mới
-- ------------------------------------------------------------
-- TỆP SINH TỰ ĐỘNG từ bốn tệp nguồn, sinh lại bằng:
--     node db/gop-cai-dat.mjs
-- Đừng sửa tay tệp này; sửa tệp nguồn tương ứng rồi sinh lại.
--
-- Cách dùng: Supabase → SQL Editor → dán toàn bộ tệp → Run.
-- Chạy lại lần nữa cũng không sao — mọi lệnh đều tự bỏ qua phần
-- đã có (create if not exists / or replace / drop policy if exists).
--
-- Gồm, theo thứ tự:
${NGUON.map((t, i) => `--   ${i + 1}. db/${t}`).join('\n')}
--
-- KHÔNG gồm các tệp tiện ích tình huống (chạy riêng khi cần):
--   db/khoi-tao.sql            tạo trường bằng tay, không qua giao diện
--   db/du-lieu-dien-lien.sql   nạp dữ liệu mẫu Diễn Liên
--   db/cong-bo-ngay.sql · soi-loi-cong-bo.sql · sua-tai-khoan-mo-coi.sql
--   · dat-lai-mat-khau.sql     công cụ xử lý sự cố
--   db/xoa-truong.sql          xoá hẳn một trường đăng ký thử (hai bước: soi rồi xoá)
--   db/edge-function-tai-khoan.ts  cấp tài khoản hàng loạt (Edge Function,
--                              triển khai riêng theo README)
-- ============================================================
`;

const than = NGUON.map(t => `

-- ############################################################
-- ###  ${t}
-- ############################################################

${doc(t).trim()}
`).join('');

const ketQua = dau + than + '\n';
const dich = join(thuMuc, 'cai-dat.sql');

if (process.argv.includes('--kiem')) {
  const hienCo = existsSync(dich) ? readFileSync(dich, 'utf8').replace(/\r\n/g, '\n') : '';
  if (hienCo === ketQua) {
    console.log(`db/cai-dat.sql khớp với ${NGUON.length} tệp nguồn — đạt.`);
  } else {
    console.error('db/cai-dat.sql LỆCH so với tệp nguồn.');
    console.error('Cách sửa: chạy `node db/gop-cai-dat.mjs` rồi commit lại.');
    process.exit(1);
  }
} else {
  writeFileSync(dich, ketQua);
  console.log(`Đã sinh db/cai-dat.sql (${Math.round(ketQua.length / 1024)} KB) từ ${NGUON.length} tệp nguồn.`);
}
