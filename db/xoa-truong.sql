-- ============================================================
-- XOÁ HẲN MỘT TRƯỜNG KHỎI HỆ THỐNG  ·  24/8/2026
-- ------------------------------------------------------------
-- Dùng cho trường ĐĂNG KÝ THỬ hoặc đăng ký rác — không phải cho trường
-- đang chạy thật. Trường thật thì dùng `duyet_truong(id, false, …)` để
-- từ chối; dữ liệu còn nguyên, đổi ý duyệt lại được.
--
-- Chạy trong Supabase → SQL Editor, đường Dashboard nên không vướng RLS.
-- HAI BƯỚC, cố ý tách: bước 1 chỉ ĐỌC, xem trường kéo theo gì; đọc xong
-- thấy đúng là thứ cần bỏ thì mới chạy bước 2.
--
-- ⚠️ THỨ TỰ XOÁ LÀ ĐIỀU QUAN TRỌNG NHẤT
--   `nguoi_dung.id` trỏ về `auth.users` với on delete cascade — chiều
--   xuôi: xoá tài khoản đăng nhập là hồ sơ nguoi_dung tự đi theo. Nhưng
--   xoá `truong` trước thì cascade chỉ quét được public.nguoi_dung, còn
--   dòng ở auth.users vẫn ở lại — một TÀI KHOẢN MỒ CÔI đăng nhập được mà
--   không thuộc trường nào. Đã dính đúng sự cố này ngày 31/7/2026
--   (db/sua-tai-khoan-mo-coi.sql). Nên phải xoá auth.users TRƯỚC, rồi mới
--   xoá truong.
--
-- ⚠️ Lần đầu dùng (24/8/2026) là xoá "TH ABC", mã 2323, đăng ký 16/8 mà
--   chủ dự án không biết là ai.
-- ============================================================

-- Đổi mã trường ở đây. Đặt một chỗ, hai bước dùng chung.
create temp table if not exists _muc_tieu as select '2323'::text as ma_truong;


-- ------------------------------------------------------------
-- BƯỚC 1 · SOI — chỉ đọc
-- ------------------------------------------------------------

-- 1a. Trường ấy là ai — phải ra ĐÚNG MỘT dòng
select t.id, t.ten, t.ma_truong, t.trang_thai_duyet, t.tinh, t.xa,
       t.dien_thoai, t.email_lien_he, t.tao_luc
from truong t join _muc_tieu m on t.ma_truong = m.ma_truong;

-- 1b. Tài khoản đăng nhập thuộc trường ấy — ĐÂY là thứ sẽ bị xoá ở auth.users.
--     Nếu thấy email của CHÍNH MÌNH ở đây thì DỪNG: tài khoản ấy sẽ mất.
select u.id, u.email, u.created_at, u.last_sign_in_at,
       nd.ho_ten, nd.vai_tro, nd.la_chu_he_thong
from nguoi_dung nd
join truong t on t.id = nd.truong_id
join _muc_tieu m on t.ma_truong = m.ma_truong
join auth.users u on u.id = nd.id;

-- 1c. Trường ấy kéo theo bao nhiêu dữ liệu. Trường đăng ký thử thường là
--     1 điểm trường · 10 khung giờ · 0 lớp · 0 giáo viên · 0 phiên bản.
select
  (select count(*) from diem_truong   d where d.truong_id = t.id) as diem_truong,
  (select count(*) from khung_gio     k where k.truong_id = t.id) as khung_gio,
  (select count(*) from lop           l where l.truong_id = t.id) as lop,
  (select count(*) from giao_vien     g where g.truong_id = t.id) as giao_vien,
  (select count(*) from phan_cong     p where p.truong_id = t.id) as phan_cong,
  (select count(*) from tkb_phien_ban v where v.truong_id = t.id) as phien_ban,
  (select count(*) from bao_nghi      b where b.truong_id = t.id) as bao_nghi,
  (select count(*) from nhat_ky       n where n.truong_id = t.id) as nhat_ky
from truong t join _muc_tieu m on t.ma_truong = m.ma_truong;


-- ------------------------------------------------------------
-- BƯỚC 2 · XOÁ — chỉ chạy sau khi đọc kỹ bước 1
-- Bỏ dấu ghi chú ở khối dưới rồi Run. Một giao dịch: hỏng giữa chừng là
-- không xoá gì cả.
-- ------------------------------------------------------------
/*
begin;

-- Tài khoản đăng nhập trước (kéo theo nguoi_dung). Chốt an toàn: không bao
-- giờ đụng tài khoản chủ hệ thống, dù nó có đứng tên trường này.
delete from auth.users u
where u.id in (
  select nd.id from nguoi_dung nd
  join truong t on t.id = nd.truong_id
  join _muc_tieu m on t.ma_truong = m.ma_truong
  where coalesce(nd.la_chu_he_thong, false) = false
);

-- Rồi tới trường — mọi bảng còn lại cascade theo truong_id.
delete from truong t
using _muc_tieu m
where t.ma_truong = m.ma_truong;

commit;

-- Soi lại: trường phải biến mất, và không còn tài khoản nào không thuộc
-- trường nào (0 dòng).
select ten, ma_truong from truong order by tao_luc desc;
select u.id, u.email from auth.users u
left join nguoi_dung nd on nd.id = u.id
where nd.id is null;
*/
