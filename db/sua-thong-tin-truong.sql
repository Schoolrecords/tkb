-- ============================================================
-- CHO PHÉP SỬA THÔNG TIN TRƯỜNG
-- Chạy MỘT LẦN trong Supabase SQL Editor (đã gộp trong db/cai-dat.sql).
--
-- LỖI ĐANG VÁ (tìm ra 2/8/2026)
--   Bảng `truong` bật RLS nhưng từ đầu tới giờ chỉ có ĐÚNG MỘT quy tắc:
--   p_truong_doc (SELECT). Không có quy tắc UPDATE nào.
--
--   Màn hình *Bước 1 · Thông tin trường* thì vẫn PATCH thẳng vào bảng ấy
--   để lưu tên trường, năm học, xã, tỉnh. RLS bật mà không có quy tắc
--   UPDATE thì PostgREST KHÔNG báo lỗi — nó sửa 0 dòng rồi trả 204, y hệt
--   ghi thành công. Người dùng sửa tên trường, bấm Lưu, thấy báo đã lưu,
--   tải lại trang thì tên cũ quay về.
--
--   Đây đúng là cái bẫy đã cắn một lần ở bảng tkb_phien_ban: nút "Công bố
--   cho giáo viên" bấm mãi không ăn, vì thiếu quy tắc UPDATE (db/cong-bo.sql).
--   Lần này là bảng truong. Từ nay `npm test` có phép thử đối chiếu
--   "app có ghi vào bảng nào" với "bảng nào cho phép ghi" để không có lần thứ ba.
--
--   VIỆC SẮP CẦN TỚI NGAY: có quyết định sáp nhập chính thức là phải đổi
--   tên đơn vị. Không có quy tắc này thì đổi bao nhiêu lần cũng không lưu được.
-- ============================================================

-- Cùng khuôn với mọi bảng dữ liệu nguồn khác: cả trường đọc được,
-- chỉ cán bộ quản lý sửa được.
drop policy if exists p_truong_sua on truong;
create policy p_truong_sua on truong for update
  using      (id = truong_cua_toi() and la_quan_ly())
  with check (id = truong_cua_toi() and la_quan_ly());

-- CỐ Ý không mở INSERT và DELETE:
--   · Tạo trường mới đi qua hàm dang_ky_truong() (security definer) — có
--     kiểm tra đầy đủ và tự đặt người đăng ký làm quản trị. Mở INSERT thẳng
--     là mở đường cho tài khoản mồ côi, thứ đã trả giá một lần.
--   · Xoá trường thì xoá theo dây chuyền toàn bộ dữ liệu của trường đó.
--     Việc ấy làm bằng tay trong SQL Editor, không bao giờ qua giao diện.

-- ---------- Kiểm tra ----------
-- Phải ra 2 dòng: p_truong_doc (SELECT) · p_truong_sua (UPDATE)
select policyname as ten_quy_tac, cmd as ap_dung_cho
from pg_policies
where tablename = 'truong'
order by cmd;
