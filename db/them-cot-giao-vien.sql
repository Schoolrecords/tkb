-- ===================================================================
-- HAI CỘT NỮA CHO HỒ SƠ GIÁO VIÊN — điện thoại và phân hiệu (28/8/2026)
-- Chạy MỘT LẦN trong SQL Editor. Chạy lại nhiều lần vẫn an toàn.
-- -------------------------------------------------------------------
-- Chủ dự án: *"chỗ này em thêm các ô (trường) nhập gmail; điện thoại;
-- điểm trường"* — hộp Thêm giáo viên trước đây chỉ hỏi họ tên, định mức
-- và lớp chủ nhiệm, nên khai xong vẫn phải mở lại bảng sửa tiếp.
--
-- `email` đã có từ db/gmail-giao-vien.sql; tệp này thêm nốt hai cột.
-- ===================================================================

alter table giao_vien add column if not exists dien_thoai     text;
alter table giao_vien add column if not exists diem_truong_id uuid
  references diem_truong(id) on delete set null;

create index if not exists ix_gv_diem on giao_vien (diem_truong_id);

-- ⚠️ `diem_truong_id` ở đây là PHÂN HIỆU CHÍNH của thầy cô — một cái nhãn để
--    lọc danh sách và để biết người mới khai thuộc nơi nào khi CHƯA có dòng
--    phân công nào. Nó KHÔNG phải là thứ thuật toán đọc: ràng buộc lõi "một
--    giáo viên, một buổi, một phân hiệu" vẫn suy từ `phan_cong` → `lop` →
--    `lop.diem_truong_id`, tức là từ nơi thầy cô THẬT SỰ có tiết. Nhét cột
--    này vào thuật toán là tạo ra hai nguồn sự thật cho cùng một câu hỏi,
--    và sớm muộn hai bên lệch nhau.
--
-- ⚠️ `on delete set null` chứ KHÔNG phải `restrict` như `lop.diem_truong_id`.
--    Xoá một phân hiệu thì lớp phải được dời đi trước (mất lớp là mất cả thời
--    khóa biểu), còn hồ sơ giáo viên chỉ mất cái nhãn — giữ `restrict` ở đây
--    là chặn luôn việc xoá phân hiệu trống, đúng thứ vừa vá hôm nay.

-- Hai cột này chỉ quản lý cùng trường ghi được (quy tắc p_gv_sua có sẵn),
-- và không cột nào quyết định quyền, nên không cần trigger canh cột.
-- KHONG-CANH: giao_vien.dien_thoai — không quyết định quyền gì, chỉ là số liên lạc.
-- KHONG-CANH: giao_vien.diem_truong_id — nhãn hiển thị; quyền của PHT đọc ở
--   nguoi_dung.diem_truong_id, không phải ở đây.
