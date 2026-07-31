-- ============================================================
-- SOI LỖI: GIÁO VIÊN ĐĂNG NHẬP MÀ KHÔNG THẤY THỜI KHÓA BIỂU
-- ------------------------------------------------------------
-- Dán cả file vào SQL Editor, bấm Run. Không sửa gì cả.
-- Supabase hiện kết quả của câu lệnh CUỐI CÙNG, nên muốn xem
-- từng bảng thì bôi đen riêng đoạn đó rồi bấm Run.
-- ============================================================

-- ---------- 1. Quy tắc bảng phiên bản đã đủ chưa ----------
-- Phải có 3 dòng: SELECT · INSERT · UPDATE.
-- Thiếu UPDATE thì không ai bật được cong_bo → chạy db/cong-bo.sql.
select 'QUY TAC' as muc, policyname as ten, cmd as ap_dung_cho
from pg_policies where tablename = 'tkb_phien_ban';

-- ---------- 2. Các phiên bản và trạng thái công bố ----------
-- Phải có ĐÚNG MỘT dòng cong_bo = true.
-- Toàn false nghĩa là chưa bấm nút "Công bố cho giáo viên".
select 'PHIEN BAN' as muc,
       version,
       cong_bo,
       to_char(tao_luc, 'HH24:MI DD/MM') as luu_luc,
       (select count(*) from jsonb_object_keys(du_lieu -> 'tkb')) as so_lop_trong_ban,
       ghi_chu
from tkb_phien_ban
where truong_id = (select id from truong where ma_truong = 'THDL')
order by version desc;

-- ---------- 3. Tài khoản đã nối vào bản ghi giáo viên chưa ----------
-- Cột ban_ghi_giao_vien phải có tên. Trống nghĩa là tài khoản chưa
-- nối vào giáo viên nào → đăng nhập vào sẽ không biết lấy lịch của ai.
select 'TAI KHOAN' as muc,
       n.ho_ten as tai_khoan,
       n.email,
       n.vai_tro,
       g.ho_ten as ban_ghi_giao_vien,
       g.ma_gv,
       (select count(*) from phan_cong p where p.giao_vien_id = g.id) as dong_phan_cong
from nguoi_dung n
left join giao_vien g on g.nguoi_dung_id = n.id
where n.truong_id = (select id from truong where ma_truong = 'THDL')
order by n.vai_tro, n.ho_ten;

-- ---------- 4. Bản đang công bố có tiết của cô Mỹ không ----------
-- Đây là câu quyết định. Nếu ra 0 thì bản đã công bố không chứa tiết
-- nào mang mã giáo viên của cô — tức là bản cũ, xếp trên dữ liệu khác.
select 'TIET CUA CO' as muc,
       v.version,
       v.cong_bo,
       count(*) as so_tiet_cua_co_my
from tkb_phien_ban v
cross join lateral jsonb_each(v.du_lieu -> 'tkb') as lop(ma_lop, luoi)
cross join lateral jsonb_each(lop.luoi)          as o(khoa, tiet)
join giao_vien g
  on g.id::text = (o.tiet ->> 'gvId')
where v.truong_id = (select id from truong where ma_truong = 'THDL')
  and g.ho_ten ilike '%Hoàn Mỹ%'
group by v.version, v.cong_bo
order by v.version desc;
