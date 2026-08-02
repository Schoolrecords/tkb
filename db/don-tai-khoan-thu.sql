-- ============================================================
-- DỌN CÁC TÀI KHOẢN THỬ ĐUÔI @tkb.local
-- Chạy MỘT LẦN trong Supabase SQL Editor. KHÔNG nằm trong db/cai-dat.sql
-- (đây là việc dọn dẹp một lần, không phải phần của bộ cài).
--
-- BỐI CẢNH
--   Trước 2/8/2026 quản trị cấp tài khoản hàng loạt cho giáo viên bằng
--   tên đăng nhập tự sinh @tkb.local kèm mật khẩu. Nay thầy cô đăng nhập
--   bằng Gmail của chính mình và nhận quyền qua MÃ MỜI, nên các tài khoản
--   ấy chỉ còn là rác.
--
-- AN TOÀN — đọc kỹ ba dòng này trước khi chạy:
--   · Chỉ xoá TÀI KHOẢN ĐĂNG NHẬP. Bản ghi giáo viên, bảng phân công và
--     mọi phiên bản thời khóa biểu GIỮ NGUYÊN.
--   · Cột giao_vien.nguoi_dung_id tự về null (khai báo on delete set null),
--     nên chỉ là "hồ sơ giáo viên tạm thời chưa nối tài khoản nào".
--   · KHÔNG đụng tới tài khoản Gmail thật — điều kiện lọc là đuôi
--     '@tkb.local', và có chốt chặn không cho xoá chính mình.
-- ============================================================

-- ---------- 1. Xem trước sẽ xoá những ai ----------
-- Bôi đen riêng đoạn này, bấm Run để xem danh sách trước khi xoá thật.
select u.email, n.ho_ten, n.vai_tro
from auth.users u
left join public.nguoi_dung n on n.id = u.id
where u.email like '%@tkb.local'
order by u.email;

-- ---------- 2. Xoá ----------
-- Xoá ở auth.users là bản ghi trong public.nguoi_dung tự đi theo
-- (nguoi_dung.id references auth.users on delete cascade).
--
-- ⚠️ BẪY ĐÃ DÍNH (2/8/2026): viết `and id <> auth.uid()` thì chạy trong SQL
--    Editor KHÔNG XOÁ ĐƯỢC DÒNG NÀO. SQL Editor chạy bằng quyền `postgres`
--    nên auth.uid() trả NULL, mà `id <> NULL` cho ra *unknown* chứ không
--    phải TRUE — mọi dòng đều rớt khỏi điều kiện. Phải bọc coalesce.
delete from auth.users
where email like '%@tkb.local'
  and coalesce(id <> auth.uid(), true);   -- SQL Editor: xoá hết; gọi qua API: chừa chính mình

-- ---------- 3. Kiểm tra sau khi chạy ----------
-- Dòng đầu phải ra 0. Ba dòng sau phải giữ nguyên số cũ
-- (Diễn Liên: 35 giáo viên · 25 lớp · 265 dòng phân công).
select 'tai khoan @tkb.local con lai' as muc, count(*)::text as so
from auth.users where email like '%@tkb.local'
union all select 'giao vien', count(*)::text from public.giao_vien
union all select 'lop',       count(*)::text from public.lop
union all select 'phan cong', count(*)::text from public.phan_cong
union all select 'phien ban TKB', count(*)::text from public.tkb_phien_ban;

-- ============================================================
-- SAU KHI CHẠY
-- ------------------------------------------------------------
-- Vào phần mềm → hộp Tài khoản: danh sách chỉ còn tài khoản Gmail thật.
-- Cấp quyền cho thầy cô: nút "Mã mời Google" → chọn tên → tạo mã → gửi Zalo.
-- ============================================================
