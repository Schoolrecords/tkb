-- ============================================================
-- SOI BỘ CÀI: db/cai-dat.sql ĐÃ CHẠY ĐỦ CHƯA
-- ------------------------------------------------------------
-- Dán cả tệp vào SQL Editor rồi Run. Chỉ ĐỌC, không sửa gì cả.
--
-- Supabase chỉ hiện kết quả của câu lệnh CUỐI CÙNG, mà bộ cài có
-- tới 803 dòng — chạy xong nhìn một dòng kết quả thì không biết
-- phần trước có sót gì không. Tệp này gom mọi thứ cần kiểm vào
-- ĐÚNG MỘT BẢNG: mỗi hàng một việc, cột cuối nói đạt hay chưa.
--
-- Đọc kết quả: mọi hàng ✅ là xong. Hàng ❌ thì chạy lại
-- db/cai-dat.sql. Hàng ⚠️ là việc cần làm trong phần mềm.
-- ============================================================

with bang_can(ten) as (values
  ('truong'),('nguoi_dung'),('diem_truong'),('khung_gio'),('giao_vien'),
  ('lop'),('phan_cong'),('gv_nghi'),('tkb_phien_ban'),('nhat_ky'),
  ('mon_hoc'),('phong'),('day_thay'),('ma_moi')),
ham_can(ten) as (values
  ('truong_cua_toi'),('vai_tro_cua_toi'),('la_quan_ly'),
  ('luu_tkb'),('dung_ma_moi'),('dang_ky_truong')),
ham_co as (
  select distinct p.proname::text as ten
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public')

select * from (

  -- ---------- 1. Đủ 14 bảng chưa ----------
  select 1 as tt, 'Bảng dữ liệu' as hang_muc,
         (count(*) filter (where t.tablename is not null))::text || '/' || count(*)::text as ket_qua,
         case when count(*) filter (where t.tablename is null) = 0 then '✅ đủ'
              else '❌ thiếu: ' || string_agg(b.ten, ', ') filter (where t.tablename is null)
         end as ket_luan
  from bang_can b
  left join pg_tables t on t.schemaname = 'public' and t.tablename::text = b.ten

  union all
  -- ---------- 2. Hàng rào RLS đã bật trên mọi bảng chưa ----------
  -- Đây là thứ cách ly dữ liệu giữa các trường. Tắt một bảng là hở.
  select 2, 'Hàng rào bảo mật RLS',
         (count(*) filter (where c.relrowsecurity))::text || '/' || count(*)::text,
         case when count(*) filter (where not c.relrowsecurity) = 0 then '✅ bật hết'
              else '❌ chưa bật: ' || string_agg(c.relname::text, ', ') filter (where not c.relrowsecurity)
         end
  from bang_can b
  join pg_class c on c.relname::text = b.ten
  join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'

  union all
  -- ---------- 3. Đủ 6 hàm chưa ----------
  select 3, 'Hàm trên máy chủ',
         (count(*) filter (where h2.ten is not null))::text || '/' || count(*)::text,
         case when count(*) filter (where h2.ten is null) = 0 then '✅ đủ'
              else '❌ thiếu: ' || string_agg(h.ten, ', ') filter (where h2.ten is null)
         end
  from ham_can h left join ham_co h2 on h2.ten = h.ten

  union all
  -- ---------- 4. Cột ma_lop ----------
  -- Thiếu cột này là không nhập nổi ba trường có cùng lớp "1A".
  select 4, 'Cột ma_lop của bảng lop',
         coalesce(max(case when is_nullable = 'NO' then 'có, bắt buộc'
                           else 'có, nhưng cho phép trống' end), 'KHÔNG CÓ'),
         case when count(*) filter (where is_nullable = 'NO') = 1 then '✅ đạt'
              when count(*) = 1 then '⚠️ có cột nhưng chưa khoá NOT NULL'
              else '❌ thiếu — chạy lại db/cai-dat.sql' end
  from information_schema.columns
  where table_schema = 'public' and table_name = 'lop' and column_name = 'ma_lop'

  union all
  -- ---------- 5. Quy tắc của bảng phiên bản ----------
  -- Phải đủ SELECT · INSERT · UPDATE. Thiếu UPDATE thì không ai bật
  -- được cong_bo, tức là nút "Công bố cho giáo viên" bấm sẽ báo lỗi.
  select 5, 'Quy tắc cho nút "Công bố cho giáo viên"',
         coalesce(string_agg(cmd::text, ' · ' order by cmd), 'chưa có quy tắc nào'),
         case when count(*) filter (where cmd = 'UPDATE') >= 1 then '✅ bấm Công bố được'
              else '❌ thiếu quy tắc UPDATE — giáo viên sẽ không bao giờ xem được' end
  from pg_policies where schemaname = 'public' and tablename = 'tkb_phien_ban'

  union all
  -- ---------- 6. Dữ liệu nguồn đang có ----------
  select 6, 'Dữ liệu nguồn đang có trên máy chủ',
         (select count(*) from lop)::text || ' lớp · ' ||
         (select count(*) from giao_vien)::text || ' giáo viên · ' ||
         (select count(*) from phan_cong)::text || ' dòng phân công',
         case when (select count(*) from phan_cong) > 0 then '✅ có dữ liệu'
              else '⚠️ trống — nhập từ Excel hoặc khai trong phần mềm' end

  union all
  -- ---------- 7. Mã lớp đã đọc được bằng mắt chưa ----------
  -- Mã UUID 36 ký tự là mã máy chủ tự sinh, người dùng không gõ nổi
  -- vào tệp Excel. Trong phần mềm có nút "Đặt lại mã lớp" để chữa.
  select 7, 'Mã lớp đọc được (dạng 1A_DL)',
         (count(*) filter (where ma_lop !~ '^[0-9a-f-]{30,}$'))::text || '/' || count(*)::text,
         case when count(*) = 0 then 'ℹ️ chưa có lớp nào'
              when count(*) filter (where ma_lop ~ '^[0-9a-f-]{30,}$') = 0 then '✅ đạt'
              else '⚠️ còn mã UUID — vào Bước 1 · Lớp học bấm "Đặt lại mã lớp"' end
  from lop

  union all
  -- ---------- 8. VIỆC 2: đã công bố cho giáo viên chưa ----------
  select 8, 'Thời khóa biểu đã công bố chưa',
         count(*)::text || ' phiên bản, ' ||
         (count(*) filter (where cong_bo))::text || ' đã công bố',
         case when count(*) = 0 then 'ℹ️ chưa lưu bản nào lên máy chủ'
              when count(*) filter (where cong_bo) = 0
                then '⚠️ VIỆC CÒN LẠI — vào phần mềm, mục Xếp thời khóa biểu, bấm "Công bố cho giáo viên"'
              else '✅ giáo viên xem được' end
  from tkb_phien_ban

  union all
  -- ---------- 9. Tài khoản đã nối vào hồ sơ giáo viên chưa ----------
  -- Tài khoản vai trò giáo viên mà chưa nối thì đăng nhập vào sẽ
  -- không biết lấy lịch của ai — phần mềm chặn, không cho xem nhầm.
  select 9, 'Tài khoản giáo viên đã nối hồ sơ',
         (select count(*) from nguoi_dung n
           where n.vai_tro = 'gv'
             and exists (select 1 from giao_vien g where g.nguoi_dung_id = n.id))::text
         || '/' || (select count(*) from nguoi_dung where vai_tro = 'gv')::text,
         case when (select count(*) from nguoi_dung where vai_tro = 'gv') = 0
                then 'ℹ️ chưa cấp tài khoản giáo viên nào'
              when (select count(*) from nguoi_dung n
                     where n.vai_tro = 'gv'
                       and not exists (select 1 from giao_vien g where g.nguoi_dung_id = n.id)) = 0
                then '✅ nối đủ'
              else '⚠️ có tài khoản chưa nối — thầy cô ấy đăng nhập sẽ không thấy lịch' end

) k order by tt;
