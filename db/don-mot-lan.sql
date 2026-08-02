-- ============================================================
-- DỌN MỘT LẦN CHO XONG: nối lại tài khoản + xoá hồ sơ nhân bản
-- Dán vào Supabase → SQL Editor → Run. Chạy lại nhiều lần cũng không sao.
--
-- Gộp hai tệp db/sua-noi-nham-ho-so.sql và db/don-ho-so-trung.sql vào một
-- lần chạy, VÀ ĐÚNG THỨ TỰ. Chạy tệp dọn trước tệp nối lại thì hồ sơ rỗng
-- vẫn còn giữ tài khoản nên chốt an toàn không cho xoá — chạy mãi vẫn thế.
--
-- BA BƯỚC, TỰ ĐỘNG:
--   1. Tài khoản đang nằm ở hồ sơ 0 tiết → chuyển sang hồ sơ CÙNG TÊN có
--      tiết (chỉ khi có đúng một ứng viên; nhiều hơn thì không đoán bừa).
--   2. Xoá mọi bản thừa không còn dính gì: không phân công, không chủ
--      nhiệm lớp nào, không giữ tài khoản nào. Luôn giữ lại một bản mỗi tên.
--   3. Báo cáo: còn bao nhiêu hồ sơ, tài khoản nào nối đâu, và nếu còn bản
--      trùng thì nói rõ CHỐT NÀO đang giữ nó lại.
--
-- SAU KHI CHẠY: bấm F5 tải lại phần mềm TRƯỚC KHI bấm Lưu. Trang đang mở
-- vẫn giữ danh sách cũ trong bộ nhớ; bấm Lưu là ghi trả lại hết.
-- ============================================================

-- ---------- BƯỚC 1: nối tài khoản về hồ sơ thật ----------
with tiet_gv as (
  select giao_vien_id, sum(so_tiet) as so_tiet from phan_cong group by giao_vien_id),
sai as (
  select g.id, g.ho_ten, g.nguoi_dung_id
  from giao_vien g
  left join tiet_gv t on t.giao_vien_id = g.id
  where g.nguoi_dung_id is not null and coalesce(t.so_tiet, 0) = 0),
chuyen as (
  -- min() không nhận kiểu uuid — phải so bằng text rồi đổi ngược lại
  select s.id as id_sai, s.nguoi_dung_id, min(g.id::text)::uuid as id_dung
  from sai s
  join giao_vien g
    on g.ho_ten = s.ho_ten and g.id <> s.id and g.nguoi_dung_id is null
  join tiet_gv t on t.giao_vien_id = g.id and t.so_tiet > 0
  group by s.id, s.nguoi_dung_id
  having count(*) = 1),
go_ra as (
  -- Gỡ ở hồ sơ rỗng TRƯỚC: một tài khoản chỉ được giữ một hồ sơ
  update giao_vien set nguoi_dung_id = null
  where id in (select id_sai from chuyen)
  returning id)
update giao_vien g
set nguoi_dung_id = c.nguoi_dung_id
from chuyen c
where g.id = c.id_dung
  and (select count(*) from go_ra) >= 0;

-- ---------- BƯỚC 2: xoá bản thừa ----------
with diem as (
  select g.id, g.ho_ten, g.ma_gv,
         (select count(*) from phan_cong p where p.giao_vien_id = g.id) as so_pc,
         (select count(*) from lop l where l.gvcn_id = g.id)            as so_cn,
         case when g.nguoi_dung_id is not null then 1 else 0 end        as co_tk
  from giao_vien g),
xep as (
  select *, row_number() over (
           partition by ho_ten
           order by so_pc desc, so_cn desc, co_tk desc, ma_gv) as hang
  from diem)
delete from giao_vien
where id in (select id from xep
             where hang > 1 and so_pc = 0 and so_cn = 0 and co_tk = 0);

-- ---------- BƯỚC 3: báo cáo ----------
with diem as (
  select g.id, g.ho_ten, g.ma_gv, g.nguoi_dung_id,
         (select count(*) from phan_cong p where p.giao_vien_id = g.id) as so_pc,
         (select coalesce(sum(p.so_tiet), 0) from phan_cong p where p.giao_vien_id = g.id) as so_tiet,
         (select count(*) from lop l where l.gvcn_id = g.id)            as so_cn,
         (select string_agg(l.ten, ', ') from lop l where l.gvcn_id = g.id) as lop_cn
  from giao_vien g),
xep as (
  select *, row_number() over (
           partition by ho_ten
           order by so_pc desc, so_cn desc,
                    (case when nguoi_dung_id is not null then 1 else 0 end) desc, ma_gv) as hang
  from diem)

select * from (

  select 1 as tt, '' as khoa_phu,
         'Tổng số hồ sơ giáo viên' as hang_muc,
         (select count(*) from giao_vien)::text as ket_qua,
         case when (select count(*) from giao_vien) = (select count(distinct ho_ten) from giao_vien)
                then '✅ mỗi thầy cô đúng một hồ sơ — xong, không còn gì phải dọn'
              else '⚠️ còn ' ||
                   ((select count(*) from giao_vien) - (select count(distinct ho_ten) from giao_vien))::text
                   || ' bản trùng tên — xem các dòng bên dưới để biết chốt nào đang giữ'
         end as ket_luan

  union all
  -- Từng tài khoản đăng nhập đang nối vào đâu
  select 2, coalesce(nd.email, ''), 'Tài khoản · ' || coalesce(nd.email, nd.ho_ten),
         g.ho_ten || ' — ' || d.so_tiet::text || ' tiết',
         case when d.so_tiet > 0 then '✅ mở app ra là thấy lịch'
              else '❌ hồ sơ này không có tiết — vào phần mềm: Giáo viên → Chuyển tài khoản'
         end
  from nguoi_dung nd
  join giao_vien g on g.nguoi_dung_id = nd.id
  join diem d on d.id = g.id

  union all
  -- Bản trùng tên còn sót, kèm lý do chưa xoá được
  select 3, ho_ten || ma_gv,
         'Trùng tên · ' || ho_ten,
         so_tiet::text || ' tiết'
           || case when so_cn > 0 then ' · CN ' || lop_cn else '' end
           || case when nguoi_dung_id is not null then ' · CÓ TÀI KHOẢN' else '' end,
         case
           when hang = 1 then 'ℹ️ bản thật, giữ nguyên'
           when nguoi_dung_id is not null then
             '❌ chưa xoá được: còn giữ tài khoản đăng nhập, mà không tìm ra hồ sơ cùng tên '
             || 'có tiết để chuyển sang. Vào phần mềm: Giáo viên → Chuyển tài khoản'
           when so_cn > 0 then
             '❌ chưa xoá được: đang là chủ nhiệm lớp ' || lop_cn
             || '. Vào mục Lớp học đặt lại chủ nhiệm cho lớp đó'
           when so_pc > 0 then
             '❌ chưa xoá được: còn ' || so_pc::text || ' dòng phân công. Vào mục Phân công chuyển đi'
           else '✅ sạch rồi'
         end
  from xep
  where ho_ten in (select ho_ten from giao_vien group by ho_ten having count(*) > 1)

) k order by tt, khoa_phu;
