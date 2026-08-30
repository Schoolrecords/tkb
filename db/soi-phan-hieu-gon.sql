-- ============================================================
--  SOI PHÂN HIỆU — bản MỘT CÂU  (30/8/2026)
--
--  Cùng nội dung `db/soi-phan-hieu.sql` nhưng gộp làm một câu select, vì
--  SQL Editor của Supabase chỉ bày kết quả của MỘT câu: chạy tệp nhiều câu
--  thì bốn bảng đầu không nhìn thấy được.
--
--  Chỉ đọc, không sửa gì. Đọc theo cột `muc`; `canh_bao` có chữ ⚠ thì mới
--  phải xử lý.
-- ============================================================

with dt as (
  select t.ten as truong, d.id, d.ten, d.thu_tu,
         (select count(*) from lop l         where l.diem_truong_id = d.id) as so_lop,
         (select count(*) from giao_vien g   where g.diem_truong_id = d.id) as so_gv,
         (select count(*) from nguoi_dung n  where n.diem_truong_id = d.id) as so_pht
  from diem_truong d join truong t on t.id = d.truong_id
)
select * from (
  -- 1. Phân hiệu đang có
  select 1 as stt, '1 · PHÂN HIỆU' as muc,
         truong || ' → ' || ten as noi_dung,
         so_lop || ' lớp · ' || so_gv || ' GV · ' || so_pht || ' PHT phụ trách' as chi_tiet,
         '' as canh_bao
  from dt

  -- 2. Trùng tên trong cùng một trường
  union all
  select 2, '2 · TRÙNG TÊN', truong || ' → ' || ten,
         count(*) || ' dòng cùng tên',
         '⚠ App dò theo TÊN lúc ghi — lớp bên này gán nhầm sang bên kia'
  from dt group by truong, ten having count(*) > 1

  -- 3. Lớp trỏ vào phân hiệu không còn
  union all
  select 3, '3 · LỚP MỒ CÔI', l.ma_lop || ' — ' || l.ten,
         'trỏ vào ' || l.diem_truong_id, '⚠ Phân hiệu đã bị xoá'
  from lop l
  where l.diem_truong_id is not null
    and not exists (select 1 from diem_truong d where d.id = l.diem_truong_id)

  -- 4. PHT trỏ vào phân hiệu không còn
  union all
  select 4, '4 · PHT TREO', n.ho_ten || ' (' || n.email || ')',
         n.vai_tro || ' → ' || n.diem_truong_id,
         '⚠ Bấm Lưu được báo ok nhưng KHÔNG ghi được ô nào — gán lại phân hiệu'
  from nguoi_dung n
  where n.diem_truong_id is not null
    and not exists (select 1 from diem_truong d where d.id = n.diem_truong_id)

  -- 5. Dòng chốt: không có gì bất thường thì cũng phải nói ra
  union all
  select 9, '9 · TỔNG', 'Tổng cộng',
         (select count(*) from diem_truong) || ' phân hiệu · '
         || (select count(*) from truong) || ' trường', ''
) k
order by stt, noi_dung;
