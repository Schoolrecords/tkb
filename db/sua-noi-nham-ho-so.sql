-- ============================================================
-- NỐI LẠI TÀI KHOẢN VÀO ĐÚNG HỒ SƠ GIÁO VIÊN
-- Dán vào Supabase → SQL Editor → Run. Chạy lại nhiều lần cũng không sao.
--
-- SỰ CỐ THẬT 2/8/2026
--   Cô Nguyễn Thị Oanh nhập mã mời, vào được phần mềm, thấy đúng tên mình
--   — nhưng màn hình *Thời khóa biểu của tôi* trắng trơn.
--
--   Nguyên nhân: cơ sở dữ liệu có HAI hồ sơ cùng tên "Nguyễn Thị Oanh".
--   Một hồ sơ 22 tiết (người thật), một hồ sơ 0 tiết (sót lại từ bộ dữ liệu
--   thử). Ô chọn trong hộp Mã mời hồi đó chỉ bày họ tên, không nói ai có
--   tiết ai không — nên chọn nhầm là chuyện sớm muộn.
--
-- TỆP NÀY LÀM GÌ
--   Tìm mọi tài khoản đang nối vào hồ sơ KHÔNG có tiết nào, mà lại có ĐÚNG
--   MỘT hồ sơ khác cùng họ tên CÓ tiết và chưa ai nhận — rồi chuyển sang.
--
--   Điều kiện "đúng một" là cố ý: ba hồ sơ cùng tên cùng có tiết thì máy
--   không có cơ sở nào để chọn hộ, và đoán bừa còn tệ hơn không làm gì.
--   Trường hợp ấy tệp sẽ báo ra để nhà trường tự chọn trong phần mềm
--   (mục *Giáo viên → Chuyển tài khoản*).
-- ============================================================

-- ---------- 1. SOI TRƯỚC: sẽ chuyển những ai ----------
with tiet_gv as (
  select giao_vien_id, sum(so_tiet) as so_tiet from phan_cong group by giao_vien_id),
sai as (
  -- Hồ sơ đang giữ tài khoản mà không có tiết nào
  select g.id, g.ho_ten, g.nguoi_dung_id
  from giao_vien g
  left join tiet_gv t on t.giao_vien_id = g.id
  where g.nguoi_dung_id is not null and coalesce(t.so_tiet, 0) = 0),
dung as (
  -- Hồ sơ cùng tên, CÓ tiết, chưa ai nhận
  select s.id as id_sai, s.ho_ten, s.nguoi_dung_id,
         min(g.id) as id_dung, count(*) as so_ung_vien
  from sai s
  join giao_vien g
    on g.ho_ten = s.ho_ten and g.id <> s.id and g.nguoi_dung_id is null
  join tiet_gv t on t.giao_vien_id = g.id and t.so_tiet > 0
  group by s.id, s.ho_ten, s.nguoi_dung_id)

select ho_ten,
       case when so_ung_vien = 1 then '✅ sẽ chuyển sang hồ sơ có tiết'
            else '⚠️ có ' || so_ung_vien::text || ' hồ sơ cùng tên đều có tiết — '
                 || 'máy không đoán hộ, nhà trường tự chọn ở mục Giáo viên → Chuyển tài khoản'
       end as ket_luan
from dung
order by ho_ten;

-- ---------- 2. CHUYỂN ----------
-- Chỉ đụng cột nguoi_dung_id. Không xoá, không sửa gì khác.
with tiet_gv as (
  select giao_vien_id, sum(so_tiet) as so_tiet from phan_cong group by giao_vien_id),
sai as (
  select g.id, g.ho_ten, g.nguoi_dung_id
  from giao_vien g
  left join tiet_gv t on t.giao_vien_id = g.id
  where g.nguoi_dung_id is not null and coalesce(t.so_tiet, 0) = 0),
chuyen as (
  select s.id as id_sai, s.nguoi_dung_id, min(g.id) as id_dung
  from sai s
  join giao_vien g
    on g.ho_ten = s.ho_ten and g.id <> s.id and g.nguoi_dung_id is null
  join tiet_gv t on t.giao_vien_id = g.id and t.so_tiet > 0
  group by s.id, s.nguoi_dung_id
  having count(*) = 1),
go_ra as (
  -- Gỡ ở hồ sơ sai TRƯỚC: một tài khoản chỉ được giữ một hồ sơ
  update giao_vien set nguoi_dung_id = null
  where id in (select id_sai from chuyen)
  returning id)
update giao_vien g
set nguoi_dung_id = c.nguoi_dung_id
from chuyen c
where g.id = c.id_dung
  and (select count(*) from go_ra) >= 0      -- buộc go_ra chạy trước
returning g.ho_ten as da_noi_lai, g.ma_gv;

-- ---------- 3. KIỂM TRA ----------
-- Mọi tài khoản giáo viên giờ phải trỏ vào hồ sơ CÓ tiết.
select nd.email,
       g.ho_ten as ho_so_dang_noi,
       coalesce((select sum(so_tiet) from phan_cong p where p.giao_vien_id = g.id), 0) as so_tiet,
       case when coalesce((select sum(so_tiet) from phan_cong p where p.giao_vien_id = g.id), 0) > 0
              then '✅ mở app ra là thấy lịch'
            else '❌ vẫn chưa đúng — vào phần mềm, mục Giáo viên → Chuyển tài khoản'
       end as ket_luan
from nguoi_dung nd
join giao_vien g on g.nguoi_dung_id = nd.id
order by nd.email;
