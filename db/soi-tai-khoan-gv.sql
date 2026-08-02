-- ============================================================
-- SOI TÀI KHOẢN GIÁO VIÊN: VÌ SAO MỞ APP RA KHÔNG THẤY LỊCH
-- ------------------------------------------------------------
-- Dán cả tệp vào Supabase → SQL Editor rồi Run. Chỉ ĐỌC, không sửa gì.
--
-- VÌ SAO CẦN
--   2/8/2026: một cô giáo nhập mã mời xong, vào được phần mềm, thấy
--   đúng tên mình — nhưng màn hình *Thời khóa biểu của tôi* trắng trơn
--   và ghi "Nhà trường chưa xếp xong", trong khi trường đã xếp
--   710/710 tiết. Câu thông báo ấy nói sai, và nhìn màn hình thì
--   không có cách nào biết hỏng ở đâu.
--
--   Màn hình trắng của thầy cô có ĐÚNG NĂM nguyên nhân, cách sửa khác
--   hẳn nhau. Tệp này chỉ ra nguyên nhân nào:
--
--     1. Chưa công bố bản nào   → bấm nút "Công bố cho giáo viên"
--     2. Bản công bố đã cũ      → xếp lại rồi công bố lại
--     3. Tài khoản chưa nối hồ sơ giáo viên → mục Giáo viên · Tài khoản
--     4. Nối NHẦM người trùng tên → thu hồi rồi cấp lại mã mời
--        (trường có hai cô Dung, hai cô Linh, hai cô Hương, hai cô Oanh)
--     5. Tài khoản nằm ở trường khác → xem db/sua-tai-khoan-mo-coi.sql
--
--   Cột `ket_luan` nói thẳng phải làm gì. Dòng nào ✅ là không phải lo.
-- ============================================================

with ban as (
  -- Bản duy nhất thầy cô đọc được: quy tắc p_tkb_doc chỉ cho xem bản đã công bố
  select version, tao_luc, du_lieu
  from tkb_phien_ban
  where cong_bo
  order by version desc
  limit 1),
o_ban as (
  -- Từng ô trong bản ấy: lớp nào, ai dạy. Khoá ngoài là lop.id, khoá trong
  -- là ô giờ ("2-S-0"), giá trị là {gvId, mon, ghim}.
  select x.key as lop_id, t.value ->> 'gvId' as gv_id
  from ban, lateral jsonb_each(ban.du_lieu -> 'tkb') x,
            lateral jsonb_each(x.value) t),
tiet_gv as (
  -- Mỗi giáo viên có bao nhiêu tiết trong bản ĐANG CÔNG BỐ
  select gv_id, count(*) as so_tiet from o_ban group by gv_id),
pc_gv as (
  -- ... và bao nhiêu tiết theo bảng phân công hiện tại
  select giao_vien_id, sum(so_tiet) as so_tiet from phan_cong group by giao_vien_id),
truong_lop as (
  -- Trường nào đang thật sự có lớp — dùng để bắt tài khoản lạc trường
  select truong_id, count(*) as so_lop from lop group by truong_id)

select * from (

  -- ---------- 1. Cơ sở dữ liệu này có mấy trường ----------
  select 1 as tt, ''::text as khoa_phu,
         'Số trường trong cơ sở dữ liệu' as hang_muc,
         (select count(*) from truong)::text || ' trường: ' ||
         coalesce((select string_agg(t.ten || ' (' || coalesce(tl.so_lop, 0)::text || ' lớp)',
                                     ' · ' order by t.ten)
                   from truong t left join truong_lop tl on tl.truong_id = t.id), '(chưa có)') as ket_qua,
         case when (select count(*) from truong) <= 1 then '✅ chỉ một trường, không lạc đi đâu được'
              else '⚠️ nhiều hơn một trường — tài khoản nào ở nhầm trường sẽ thấy dữ liệu khác hẳn'
         end as ket_luan

  union all
  -- ---------- 2. Thầy cô đang đọc được bản nào ----------
  select 2, '', 'Bản đang công bố cho giáo viên',
         coalesce('phiên bản ' || (select max(version) from ban)::text
                  || ' — lưu lúc ' || (select to_char(max(tao_luc), 'HH24:MI ngày DD/MM/YYYY') from ban)
                  || ', ' || (select count(*) from o_ban)::text || ' tiết',
                  'CHƯA CÔNG BỐ BẢN NÀO'),
         case when (select count(*) from ban) = 0
                then '❌ NGUYÊN NHÂN 1 — mọi thầy cô đều thấy màn hình trắng. '
                     || 'Đăng nhập quản trị → Xếp thời khóa biểu → nút "Công bố cho giáo viên"'
              when (select count(*) from o_ban) = 0
                then '❌ NGUYÊN NHÂN 2 — bản đã công bố rỗng. Xếp lại rồi công bố lại'
              else '✅ đã có bản công bố'
         end

  union all
  -- ---------- 3. Bản công bố có phải bản mới nhất không ----------
  select 3, '', 'Bản mới nhất đã lưu',
         coalesce('phiên bản ' || (select max(version) from tkb_phien_ban)::text, 'chưa lưu bản nào'),
         case when (select max(version) from tkb_phien_ban) is null then 'ℹ️ chưa lưu bản nào'
              when (select max(version) from ban) = (select max(version) from tkb_phien_ban)
                then '✅ bản đang công bố chính là bản mới nhất'
              else '⚠️ NGUYÊN NHÂN 2 — thầy cô đang xem bản CŨ. '
                   || 'Công bố lại bản mới nhất thì họ mới thấy đúng lịch đang xếp'
         end

  -- ---------- 4. Từng tài khoản một ----------
  -- Đây là phần trả lời câu hỏi "vì sao CÔ ẤY không thấy lịch".
  union all
  select 4, coalesce(nd.email, nd.ho_ten),
         'Tài khoản · ' || coalesce(nd.email, nd.ho_ten),
         nd.vai_tro::text
         || ' · trường: ' || coalesce(t.ten, '(không có)')
         || ' · hồ sơ giáo viên: ' || coalesce(g.ho_ten || ' [' || g.ma_gv || ']', 'CHƯA NỐI')
         || ' · phân công: ' || coalesce(pc.so_tiet, 0)::text || ' tiết'
         || ' · trong bản công bố: ' || coalesce(tg.so_tiet, 0)::text || ' tiết',
         case
           -- 5. lạc trường: tài khoản trỏ về một trường không có lớp nào
           when coalesce(tl.so_lop, 0) = 0 and (select count(*) from truong) > 1
             then '❌ NGUYÊN NHÂN 5 — tài khoản ở một trường KHÔNG có lớp nào. '
                  || 'Xem db/sua-tai-khoan-mo-coi.sql để chuyển về đúng trường'
           -- quản lý thì không cần hồ sơ giáo viên
           when nd.vai_tro <> 'giao_vien' and g.id is null
             then 'ℹ️ cán bộ quản lý — không cần nối hồ sơ giáo viên'
           -- 3. chưa nối hồ sơ
           when g.id is null
             then '❌ NGUYÊN NHÂN 3 — chưa nối hồ sơ giáo viên nên phần mềm không biết lấy lịch của ai. '
                  || 'Mục Giáo viên → Tài khoản đăng nhập → chọn đúng tên → Lưu'
           -- 4. nối nhầm người trùng tên: hồ sơ có tồn tại nhưng không được phân công gì
           when coalesce(pc.so_tiet, 0) = 0
             then '❌ NGUYÊN NHÂN 4 — hồ sơ "' || g.ho_ten || '" KHÔNG được phân công tiết nào. '
                  || 'Trường có nhiều người trùng tên: nhiều khả năng mã mời đã nối nhầm hồ sơ. '
                  || 'Xem dòng "Trùng tên" bên dưới, thu hồi mã rồi cấp lại cho đúng hồ sơ'
           -- 2. có phân công nhưng bản công bố không có tiết nào của người này
           when coalesce(tg.so_tiet, 0) = 0
             then '❌ NGUYÊN NHÂN 2 — có phân công nhưng bản ĐANG CÔNG BỐ không chứa tiết nào của người này. '
                  || 'Bản công bố đã cũ: xếp lại rồi công bố lại'
           else '✅ vào là thấy ' || tg.so_tiet::text || ' tiết'
         end
  from nguoi_dung nd
  left join truong t       on t.id = nd.truong_id
  left join truong_lop tl  on tl.truong_id = nd.truong_id
  left join giao_vien g    on g.nguoi_dung_id = nd.id
  left join pc_gv pc       on pc.giao_vien_id = g.id
  left join tiet_gv tg     on tg.gv_id = g.id::text

  -- ---------- 5. Những cái tên trùng nhau ----------
  -- Chỗ dễ nối nhầm nhất. Liệt kê đủ để chọn đúng hồ sơ khi cấp lại mã.
  union all
  select 5, g.ho_ten, 'Trùng tên · ' || g.ho_ten,
         string_agg('[' || g.ma_gv || '] ' || coalesce(pc.so_tiet, 0)::text || ' tiết phân công'
                    || case when g.nguoi_dung_id is not null then ' — ĐÃ nối tài khoản' else '' end,
                    '   |   ' order by coalesce(pc.so_tiet, 0) desc, g.ma_gv),
         case when count(*) filter (where g.nguoi_dung_id is not null) = 0
                then 'ℹ️ chưa ai trong nhóm này có tài khoản'
              when count(*) filter (where g.nguoi_dung_id is not null
                                      and coalesce(pc.so_tiet, 0) = 0) > 0
                then '❌ có tài khoản nối vào hồ sơ KHÔNG có tiết nào — gần như chắc chắn nối nhầm'
              else '✅ tài khoản đang nối vào hồ sơ có tiết'
         end
  from giao_vien g
  left join pc_gv pc on pc.giao_vien_id = g.id
  where g.ho_ten in (select ho_ten from giao_vien group by ho_ten having count(*) > 1)
  group by g.ho_ten

  -- ---------- 6. Hồ sơ giáo viên chưa ai nhận ----------
  union all
  select 6, '', 'Giáo viên đã có tài khoản đăng nhập',
         (select count(*) from giao_vien where nguoi_dung_id is not null)::text
         || '/' || (select count(*) from giao_vien)::text,
         case when (select count(*) from giao_vien where nguoi_dung_id is not null) = 0
                then '⚠️ chưa thầy cô nào có đường vào — dùng nút "Tạo mã cho tất cả" trong hộp Mã mời'
              else 'ℹ️ số còn lại chưa được phát mã mời'
         end

  -- ---------- 7. Mã mời đã phát ----------
  union all
  select 7, '', 'Mã mời đã phát',
         (select count(*) from ma_moi)::text || ' mã · '
         || (select count(*) from ma_moi where dung_luc is not null)::text || ' đã dùng · '
         || (select count(*) from ma_moi where dung_luc is null and het_han > now())::text || ' còn hạn',
         'ℹ️ để biết'

) k order by tt, khoa_phu;
