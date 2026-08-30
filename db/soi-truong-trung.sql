-- ============================================================
--  SOI TRƯỜNG TRÙNG TÊN — một câu, chỉ đọc  (30/8/2026)
--
--  `db/soi-phan-hieu-gon.sql` lộ ra hai bản ghi trường tên gần như y hệt,
--  khác nhau đúng một chữ hoa: *"Trường Tiểu học Quảng Châu 1"* và
--  *"Trường tiểu học Quảng Châu 1"*. Mỗi bên giữ một bộ phân hiệu riêng —
--  đăng nhập bằng tài khoản này thì thấy kho này, tài khoản kia thấy kho
--  kia. Nhìn từ phía người dùng thì đúng là "dữ liệu tự nhiên biến mất".
--
--  Câu này trả lời ba việc: có mấy trường, mỗi trường có gì, và tài khoản
--  nào đang trỏ vào đâu. Không sửa gì.
-- ============================================================

select t.ten,
       t.ma_truong,
       t.trang_thai_duyet,
       t.xa,
       t.nam_hoc,
       t.tao_luc at time zone 'Asia/Bangkok'                             as tao_luc,
       (select count(*) from diem_truong d where d.truong_id = t.id)     as phan_hieu,
       (select count(*) from lop l         where l.truong_id = t.id)     as lop,
       (select count(*) from giao_vien g   where g.truong_id = t.id)     as giao_vien,
       (select count(*) from phan_cong p   where p.truong_id = t.id)     as phan_cong,
       (select count(*) from tkb_phien_ban v where v.truong_id = t.id)   as ban_tkb,
       (select max(v.version) from tkb_phien_ban v where v.truong_id = t.id) as ban_moi_nhat,
       (select count(*) from tkb_phien_ban v
         where v.truong_id = t.id and v.cong_bo)                         as ban_da_cong_bo,
       -- Ai đang đăng nhập vào trường này. Đây là cột quyết định: tài khoản
       -- nào trỏ vào đâu thì người ấy thấy kho ấy, không thấy kho kia.
       (select string_agg(n.email || ' (' || n.vai_tro || ')', ' · ' order by n.email)
          from nguoi_dung n where n.truong_id = t.id)                    as tai_khoan,
       t.id                                                              as truong_id
from truong t
order by lower(t.ten), t.tao_luc;
