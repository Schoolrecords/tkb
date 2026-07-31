-- ============================================================
-- CHO PHÉP CÔNG BỐ THỜI KHÓA BIỂU
-- ------------------------------------------------------------
-- Chạy MỘT LẦN trong SQL Editor.
--
-- VÌ SAO CẦN
--   Quy tắc đọc trong db/schema.sql viết:
--       using (truong_id = truong_cua_toi() and (cong_bo or la_quan_ly()))
--   Giáo viên CHỈ đọc được phiên bản đã công bố. Cột cong_bo mặc định
--   là false, mà bảng tkb_phien_ban lại chỉ có quy tắc THÊM, không có
--   quy tắc SỬA — nên không ai bật cong_bo lên được.
--   Kết quả: quản trị xếp xong, lưu xong, mà giáo viên đăng nhập vào
--   vẫn thấy "Chưa có thời khóa biểu".
--
--   Ý tưởng ban đầu vẫn đúng: nhà trường chốt rồi mới cho thầy cô xem,
--   không để họ thấy bản đang xếp dở. Chỉ thiếu cái cửa để chốt.
-- ============================================================

drop policy if exists p_tkb_sua on tkb_phien_ban;
create policy p_tkb_sua on tkb_phien_ban for update
  using      (truong_id = truong_cua_toi() and la_quan_ly())
  with check (truong_id = truong_cua_toi() and la_quan_ly());

-- ---------- Kiểm tra ----------
-- Phải ra 3 dòng: p_tkb_doc (SELECT) · p_tkb_ghi (INSERT) · p_tkb_sua (UPDATE)
select policyname as ten_quy_tac, cmd as ap_dung_cho
from pg_policies
where tablename = 'tkb_phien_ban'
order by cmd;

-- ============================================================
-- SAU KHI CHẠY
-- ------------------------------------------------------------
-- Vào phần mềm → Xếp thời khóa biểu → nút "Công bố cho giáo viên".
-- Từ lúc đó thầy cô đăng nhập là thấy lịch của mình.
--
-- Muốn tạm rút lại (ví dụ đang sửa dở giữa năm) thì bấm lại nút đó
-- để bỏ công bố — giáo viên quay về màn hình "Chưa có thời khóa biểu",
-- còn quản trị vẫn xem và sửa bình thường.
-- ============================================================
