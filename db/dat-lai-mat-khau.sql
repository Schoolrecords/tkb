-- ============================================================
-- ĐẶT LẠI MẬT KHẨU ĐĂNG NHẬP
-- ------------------------------------------------------------
-- Dùng khi quên mật khẩu và không muốn chờ thư khôi phục.
-- Đặt thẳng mật khẩu mới, dùng được ngay, không cần mở hộp thư.
--
-- Sửa HAI chỗ có dấu >>> rồi dán cả file vào SQL Editor, bấm Run.
-- ============================================================

update auth.users
set encrypted_password = extensions.crypt(
      'Diênliên2026',                      -- >>> MẬT KHẨU MỚI, tự đặt
      extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
where email = 'xebatcheotrt@gmail.com';    -- >>> email cần đặt lại

-- ---------- Kiểm tra ----------
-- Phải ra đúng MỘT dòng. Cột da_xac_minh phải có thời điểm, không được trống —
-- chưa xác minh thì đăng nhập vẫn bị chặn.
select email,
       email_confirmed_at as da_xac_minh,
       updated_at        as vua_doi_luc
from auth.users
where email = 'xebatcheotrt@gmail.com';    -- >>> đúng email ở trên

-- ============================================================
-- LƯU Ý
-- ------------------------------------------------------------
-- · Mật khẩu ghi thẳng trong câu lệnh này. Chạy xong nên xoá nội dung
--   trong ô soạn thảo, đừng để nguyên trên màn hình.
-- · Với GIÁO VIÊN thì không cần dùng file này: vào phần mềm, mục
--   Giáo viên → Tài khoản đăng nhập → nút "Đổi mật khẩu" ở dòng
--   người đó. Nhanh hơn và không phải mở Supabase.
-- · File này chỉ để cứu tài khoản quản trị khi không vào được phần mềm.
-- ============================================================
