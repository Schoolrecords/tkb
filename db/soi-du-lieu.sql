-- ============================================================
-- SOI DỮ LIỆU: BẢN ĐÃ CÔNG BỐ CÓ KHỚP DỮ LIỆU HIỆN TẠI KHÔNG
-- ------------------------------------------------------------
-- Dán cả tệp vào SQL Editor rồi Run. Chỉ ĐỌC, không sửa gì cả.
--
-- VÌ SAO CẦN
--   db/soi-cai-dat.sql chỉ nói "đã công bố 1 bản" — nhưng công bố một
--   bản CŨ thì còn tệ hơn chưa công bố: thầy cô mở app ra, thấy một
--   thời khóa biểu, tin là thật, và dạy sai.
--
--   Bẫy đã dính một lần (xem tkb-app/CLAUDE.md mục 3): xếp trên dữ liệu
--   MẪU rồi lưu lên máy chủ, phiên bản ấy chứa mã lớp của bộ mẫu nên
--   tải về không khớp ô nào. Nay `luuTKB()` đã chặn, nhưng những phiên
--   bản lưu TRƯỚC lúc có chốt chặn thì vẫn nằm đó.
--
--   Tệp này đối chiếu bản đang công bố với bảng `lop` hiện tại, và soi
--   luôn những chỗ dữ liệu nguồn còn khuyết.
-- ============================================================

with ban as (
  -- Bản thầy cô đang nhìn thấy. Chỉ một bản được công bố tại một lúc.
  select version, tao_luc, du_lieu
  from tkb_phien_ban
  where cong_bo
  order by version desc
  limit 1),
o_ban as (
  -- Mỗi lớp trong bản ấy có bao nhiêu ô đã xếp.
  -- Khoá của `du_lieu->'tkb'` là lop.id (uuid), không phải ma_lop.
  select x.key as lop_id, count(*) as so_tiet
  from ban, lateral jsonb_each(ban.du_lieu -> 'tkb') x,
            lateral jsonb_object_keys(x.value) t
  group by x.key)

select * from (

  -- ---------- 1. Bản nào đang được thầy cô nhìn thấy ----------
  select 1 as tt, 'Bản đang công bố' as hang_muc,
         coalesce('phiên bản ' || max(version)::text
                  || ' — lưu lúc ' || to_char(max(tao_luc), 'HH24:MI ngày DD/MM/YYYY'),
                  'chưa công bố bản nào') as ket_qua,
         case when count(*) = 0 then '⚠️ thầy cô đang thấy màn hình trống'
              else 'ℹ️ để biết' end as ket_luan
  from ban

  union all
  -- ---------- 2. Bản ấy có còn khớp bảng lớp hiện tại không ----------
  -- Đây là câu quan trọng nhất của cả tệp.
  select 2, 'Lớp trong bản đã công bố',
         count(*)::text || ' lớp, ' ||
         (count(*) filter (where l.id is not null))::text || ' còn khớp bảng lop',
         case when count(*) = 0 then '⚠️ bản công bố không chứa lớp nào'
              when count(*) filter (where l.id is null) = 0 then '✅ khớp hết'
              else '❌ ' || (count(*) filter (where l.id is null))::text ||
                   ' lớp trong bản KHÔNG còn tồn tại — bản này cũ, xếp lại rồi công bố lại'
         end
  from o_ban o left join lop l on l.id::text = o.lop_id

  union all
  -- ---------- 3. Số tiết trong bản đã công bố ----------
  select 3, 'Số tiết trong bản đã công bố',
         coalesce(sum(so_tiet), 0)::text || ' tiết',
         case when coalesce(sum(so_tiet), 0) = 0 then '⚠️ bản rỗng'
              else 'ℹ️ đối chiếu với tổng tiết phân công ở dòng 6' end
  from o_ban

  union all
  -- ---------- 4. Lớp hiện có mà bản công bố chưa có ----------
  -- Thầy cô của những lớp này mở app ra sẽ không thấy tiết nào.
  select 4, 'Lớp hiện có nhưng KHÔNG có trong bản đã công bố',
         (select count(*) from lop l
           where not exists (select 1 from o_ban o where o.lop_id = l.id::text))::text
         || '/' || (select count(*) from lop)::text,
         case when (select count(*) from o_ban) = 0 then 'ℹ️ chưa công bố bản nào'
              when (select count(*) from lop l
                     where not exists (select 1 from o_ban o where o.lop_id = l.id::text)) = 0
                then '✅ bản công bố phủ hết mọi lớp'
              else '❌ lớp này mở app ra không thấy tiết nào — xếp lại rồi công bố lại'
         end

  union all
  -- ---------- 5. Lớp chưa có dòng phân công nào ----------
  -- Lớp không có phân công thì thuật toán không có gì để xếp.
  select 5, 'Lớp chưa có dòng phân công nào',
         (select count(*) from lop l
           where not exists (select 1 from phan_cong p where p.lop_id = l.id))::text
         || '/' || (select count(*) from lop)::text,
         case when (select count(*) from lop l
                     where not exists (select 1 from phan_cong p where p.lop_id = l.id)) = 0
                then '✅ lớp nào cũng có phân công'
              else '❌ thiếu ở: ' || coalesce((
                     select string_agg(coalesce(d.ten, '(chưa gán điểm trường)')
                                       || ' (' || c.so::text || ' lớp)', ' · ' order by c.so desc)
                     from (select l.diem_truong_id as dt, count(*) as so
                           from lop l
                           where not exists (select 1 from phan_cong p where p.lop_id = l.id)
                           group by l.diem_truong_id) c
                     left join diem_truong d on d.id = c.dt), '?')
         end

  union all
  -- ---------- 6. Tổng tiết phân công, đối chiếu với dòng 3 ----------
  select 6, 'Tổng số tiết theo bảng phân công',
         coalesce((select sum(so_tiet) from phan_cong), 0)::text || ' tiết/tuần',
         'ℹ️ dòng 3 phải bằng con số này thì bản công bố mới xếp trọn'

  union all
  -- ---------- 7. Giáo viên chưa có việc ----------
  select 7, 'Giáo viên chưa có dòng phân công nào',
         (select count(*) from giao_vien g
           where not exists (select 1 from phan_cong p where p.giao_vien_id = g.id))::text
         || '/' || (select count(*) from giao_vien)::text,
         case when (select count(*) from giao_vien g
                     where not exists (select 1 from phan_cong p where p.giao_vien_id = g.id)) = 0
                then '✅ ai cũng có việc'
              else '⚠️ có tên trong danh sách nhưng chưa được phân công tiết nào'
         end

  union all
  -- ---------- 8. Bức tranh theo điểm trường ----------
  select 8, 'Lớp và tiết theo điểm trường',
         coalesce((select string_agg(x.ten || ': ' || x.so_lop::text || ' lớp · '
                                     || x.so_tiet::text || ' tiết', '   ' order by x.ten)
                   from (select coalesce(d.ten, '(chưa gán)') as ten,
                                count(distinct l.id) as so_lop,
                                coalesce(sum(p.so_tiet), 0) as so_tiet
                         from lop l
                         left join diem_truong d on d.id = l.diem_truong_id
                         left join phan_cong p on p.lop_id = l.id
                         group by coalesce(d.ten, '(chưa gán)')) x), 'chưa có lớp nào'),
         'ℹ️ để biết'

) k order by tt;
