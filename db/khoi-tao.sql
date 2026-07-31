-- ============================================================
-- KHỞI TẠO TRƯỜNG VÀ TÀI KHOẢN QUẢN TRỊ
-- ------------------------------------------------------------
-- Chạy file này SAU KHI đã làm xong hai việc:
--   1. Chạy toàn bộ db/schema.sql trong SQL Editor
--   2. Vào Authentication → Users, tạo tài khoản bằng email của mình
--
-- LƯU Ý — hai loại email khác nhau, đừng lẫn:
--   · Email đăng nhập trang supabase.com  → chỉ để quản trị dự án,
--     phần mềm thời khóa biểu KHÔNG dùng tới.
--   · Email tạo ở Authentication → Users  → đây mới là tài khoản
--     đăng nhập vào phần mềm. Chính là email điền ở mục 2 dưới đây.
--   Hai email này có thể trùng nhau, cũng có thể khác. Tuỳ mình.
--
-- Trước khi chạy, sửa BA chỗ có dấu >>> ở dưới cho đúng của mình.
-- Rồi dán cả file vào SQL Editor và bấm Run một lần duy nhất.
--
-- Chạy lại nhiều lần cũng không sao, không tạo trùng.
-- ============================================================

-- ---------- 1. Tạo trường ----------
insert into truong (ten, ma_truong, tinh, xa, nam_hoc)
values (
  'Trường Tiểu học Diễn Liên',   -- >>> tên trường
  'THDL',                        -- >>> mã trường, tự đặt, viết liền không dấu
  'Nghệ An',
  'Quảng Châu',
  '2026-2027'
)
on conflict (ma_truong) do nothing;

-- ---------- 2. Nối tài khoản đăng nhập vào trường, quyền quản trị ----------
-- Không phải chép tay mã UUID: câu lệnh tự dò theo email.
insert into nguoi_dung (id, truong_id, ho_ten, email, vai_tro)
select u.id, t.id,
       'Trần Thanh Chung',       -- >>> họ tên hiện trên phần mềm
       u.email,
       'quan_tri'
from auth.users u
join truong t on t.ma_truong = 'THDL'          -- >>> đúng mã trường ở trên
where u.email = 'xebatcheotrt@gmail.com'       -- >>> đúng email vừa tạo ở Authentication → Users
on conflict (id) do nothing;

-- ---------- 3. Kiểm tra ----------
-- Phải ra đúng MỘT dòng, có tên mình và tên trường mình.
-- Ra 0 dòng nghĩa là email ở bước 2 gõ sai, hoặc chưa tạo tài khoản ở Authentication.
select n.ho_ten, n.email, n.vai_tro, t.ten as truong, t.nam_hoc
from nguoi_dung n
join truong t on t.id = n.truong_id;

-- ============================================================
-- THÊM NGƯỜI DÙNG KHÁC (làm sau, khi cần)
-- ------------------------------------------------------------
-- Mỗi người: tạo tài khoản ở Authentication → Users trước,
-- rồi chạy lại đoạn dưới với email của họ.
--
-- vai_tro nhận một trong bốn giá trị:
--     'quan_tri'         toàn trường, làm được mọi thứ
--     'hieu_truong'      toàn trường
--     'pho_hieu_truong'  xem mục diem_truong_id ngay dưới
--     'giao_vien'        chỉ xem lịch của mình
--
-- diem_truong_id quyết định phó hiệu trưởng thấy tới đâu:
--     để NULL  → phụ trách chuyên môn, thấy và xếp được toàn trường
--     điền id  → chỉ thấy và chỉ chỉnh được các lớp tại điểm trường đó,
--                và không bấm xếp tự động được
-- ============================================================
-- insert into nguoi_dung (id, truong_id, ho_ten, email, vai_tro, diem_truong_id)
-- select u.id, t.id, 'Nguyễn Văn A', u.email, 'pho_hieu_truong',
--        (select id from diem_truong where ten = 'Điểm trường Diễn Thái')
-- from auth.users u
-- join truong t on t.ma_truong = 'THDL'
-- where u.email = 'nguyenvana@example.com'
-- on conflict (id) do nothing;
