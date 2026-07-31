-- ============================================================
-- GẮN TÀI KHOẢN MỒ CÔI VÀO TRƯỜNG
-- ------------------------------------------------------------
-- Dùng khi một tài khoản đã đăng nhập được nhưng chưa thuộc trường nào,
-- nên phần mềm báo: "chưa được nhà trường cấp quyền vào phần mềm".
--
-- Thường xảy ra khi ai đó bấm nhầm "Đăng ký trường mới" rồi bỏ dở giữa
-- chừng: tài khoản đã tạo nhưng trường thì chưa.
--
-- Sửa hai chỗ có dấu >>> rồi dán cả file vào SQL Editor, bấm Run.
-- Chạy lại nhiều lần không sao.
-- ============================================================

-- ---------- 1. Gắn tài khoản vào trường, cấp vai trò ----------
insert into nguoi_dung (id, truong_id, ho_ten, email, vai_tro)
select u.id, t.id,
       'Trần Thanh Chung',              -- >>> họ tên hiện trên phần mềm
       u.email,
       'giao_vien'                      -- >>> quan_tri | hieu_truong | pho_hieu_truong | giao_vien
from auth.users u
join truong t on t.ma_truong = 'THDL'
where u.email = 'chungsongthinh@gmail.com'   -- >>> email của tài khoản mồ côi
on conflict (id) do nothing;

-- ---------- 2. Nối vào bản ghi giáo viên ----------
-- Nhờ bước này, đăng nhập vào là mở thẳng "Thời khóa biểu của tôi"
-- với đúng lịch dạy của người đó. Bỏ qua nếu tài khoản không phải giáo viên.
update giao_vien g
set nguoi_dung_id = u.id
from auth.users u, truong t
where u.email = 'chungsongthinh@gmail.com'   -- >>> đúng email ở trên
  and t.ma_truong = 'THDL'
  and g.truong_id = t.id
  and g.ma_gv = 'gv_tran_thanh_chung';        -- >>> mã giáo viên trong bảng giao_vien

-- ---------- 3. Kiểm tra ----------
-- Phải ra đúng MỘT dòng, cột noi_voi_giao_vien có tên giáo viên.
select n.ho_ten, n.email, n.vai_tro,
       t.ten as truong,
       (select g.ho_ten from giao_vien g where g.nguoi_dung_id = n.id) as noi_voi_giao_vien,
       (select count(*) from phan_cong p
        join giao_vien g on g.id = p.giao_vien_id
        where g.nguoi_dung_id = n.id) as so_dong_phan_cong
from nguoi_dung n
join truong t on t.id = n.truong_id
where n.email = 'chungsongthinh@gmail.com';   -- >>> đúng email ở trên

-- ============================================================
-- MUỐN XOÁ HẲN THAY VÌ GẮN VÀO TRƯỜNG
-- ------------------------------------------------------------
-- Vào Authentication → Users, tìm dòng email đó, bấm xoá.
-- Xoá xong có thể cấp lại đàng hoàng bằng nút "Tài khoản đăng nhập"
-- trong phần mềm — cách đó không cần xác nhận email.
-- ============================================================
