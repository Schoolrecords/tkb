-- ============================================================
-- SOI CÁC TRƯỜNG ĐÃ ĐĂNG KÝ VÀO HỆ THỐNG
-- ------------------------------------------------------------
-- Dán cả tệp vào Supabase → SQL Editor rồi Run. Chỉ ĐỌC, không sửa gì.
--
-- VÌ SAO CẦN
--   24/8/2026, chủ dự án hỏi: "các trường đăng ký thầy có nhận được
--   không?" Câu trả lời là KHÔNG, và có ba lý do tách bạch:
--
--     1. `dang_ky_truong()` chỉ GHI VÀO CƠ SỞ DỮ LIỆU. Nó tạo một dòng
--        `truong`, một dòng `nguoi_dung` vai trò quản trị, mười dòng
--        `khung_gio` và một `diem_truong` mặc định — rồi dừng. Không
--        gửi thư, không ghi `nhat_ky`, không gọi webhook nào.
--
--     2. Quy tắc RLS `p_truong_doc` cho đọc `truong` khi
--        `id = truong_cua_toi()`. Nghĩa là mở app lên cũng chỉ thấy
--        trường của CHÍNH MÌNH — đúng như thiết kế cô lập dữ liệu giữa
--        các trường, nhưng cũng có nghĩa là không có màn hình nào bày
--        ra danh sách toàn hệ thống.
--
--     3. Chưa có vai trò "chủ hệ thống". Vai trò cao nhất hiện nay là
--        `quan_tri` — quản trị của MỘT trường.
--
--   Nên tới lúc này, cách duy nhất để biết ai đã đăng ký là chạy tệp
--   này. Nó đi qua đường Dashboard nên không vướng RLS.
--
-- ⚠️ MỘT ĐIỀU PHẢI BIẾT: cửa đăng ký đang MỞ cho bất kỳ ai có tài
--   khoản Google. Không có bước duyệt, không có mã mời cấp hệ thống.
--   Người lạ đăng ký được, và chủ dự án sẽ không hay biết. Phần cuối
--   tệp đếm giúp những trường có dấu hiệu là đăng ký thử.
-- ============================================================


-- ------------------------------------------------------------
-- 1. DANH SÁCH TRƯỜNG, MỚI NHẤT TRƯỚC
-- ------------------------------------------------------------
select
  t.tao_luc                                     as "Đăng ký lúc",
  t.ten                                         as "Tên trường",
  t.ma_truong                                   as "Mã",
  coalesce(t.xa, '—') || ' · ' || coalesce(t.tinh, '—')  as "Địa bàn",
  t.nam_hoc                                     as "Năm học",
  qt.ho_ten                                     as "Người đăng ký",
  qt.email                                      as "Email",
  (select count(*) from nguoi_dung u where u.truong_id = t.id)  as "Tài khoản",
  (select count(*) from lop      l where l.truong_id = t.id)    as "Lớp",
  (select count(*) from giao_vien g where g.truong_id = t.id)   as "Giáo viên",
  (select count(*) from phan_cong p where p.truong_id = t.id)   as "Dòng phân công",
  (select max(v.version) from tkb_phien_ban v where v.truong_id = t.id) as "Phiên bản TKB"
from truong t
left join lateral (
  select n.ho_ten, n.email
  from nguoi_dung n
  where n.truong_id = t.id and n.vai_tro = 'quan_tri'
  order by n.tao_luc
  limit 1
) qt on true
order by t.tao_luc desc;


-- ------------------------------------------------------------
-- 2. TRƯỜNG NÀO ĐĂNG KÝ RỒI BỎ ĐÓ
-- ------------------------------------------------------------
-- Đăng ký xong mà không khai lớp nào thì gần như chắc là bấm thử.
-- Đây cũng là nhóm chiếm chỗ mà không dùng tới.
select
  t.tao_luc                                     as "Đăng ký lúc",
  now()::date - t.tao_luc::date                 as "Bỏ đó (ngày)",
  t.ten                                         as "Tên trường",
  t.ma_truong                                   as "Mã",
  qt.email                                      as "Email người đăng ký"
from truong t
left join lateral (
  select n.email from nguoi_dung n
  where n.truong_id = t.id and n.vai_tro = 'quan_tri'
  order by n.tao_luc limit 1
) qt on true
where not exists (select 1 from lop l where l.truong_id = t.id)
order by t.tao_luc desc;


-- ------------------------------------------------------------
-- 3. TỔNG QUAN MỘT DÒNG
-- ------------------------------------------------------------
select
  count(*)                                                          as "Tổng số trường",
  count(*) filter (where exists (select 1 from lop l where l.truong_id = t.id))
                                                                    as "Đã khai lớp",
  count(*) filter (where t.tao_luc > now() - interval '7 days')      as "Mới trong 7 ngày",
  count(*) filter (where t.tao_luc > now() - interval '30 days')     as "Mới trong 30 ngày",
  (select count(*) from nguoi_dung)                                 as "Tổng tài khoản",
  min(t.tao_luc)                                                    as "Trường đầu tiên",
  max(t.tao_luc)                                                    as "Trường gần nhất"
from truong t;


-- ------------------------------------------------------------
-- 4. CHỖ CHỨA TỪNG TRƯỜNG ĐANG ĂN
-- ------------------------------------------------------------
-- Gói miễn phí của Supabase có hạn 500 MB. `luu_tkb()` đã tự dọn (giữ
-- 10 bản gần nhất + mọi bản đã công bố), nhưng vẫn nên soi lại: một
-- trường xếp nhiều thì khối `tkb_phien_ban` là thứ nặng nhất.
select
  t.ten                                          as "Tên trường",
  count(v.id)                                    as "Số phiên bản",
  pg_size_pretty(coalesce(sum(pg_column_size(v.du_lieu)), 0))  as "Dung lượng TKB"
from truong t
left join tkb_phien_ban v on v.truong_id = t.id
group by t.id, t.ten
order by coalesce(sum(pg_column_size(v.du_lieu)), 0) desc;
