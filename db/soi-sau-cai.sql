-- ============================================================
-- SOI NHANH SAU KHI CHẠY db/cai-dat.sql  (18/8/2026)
-- ------------------------------------------------------------
-- Chỉ ĐỌC, không sửa gì.
--
-- ⚠️ Tệp này có HAI câu lệnh, mà SQL Editor của Supabase chỉ hiện kết
--    quả của câu CUỐI CÙNG. Muốn xem bảng nào thì BÔI ĐEN đúng câu ấy
--    rồi bấm Run (hoặc Ctrl+Enter) — nó chỉ chạy phần đang bôi đen.
--
-- Mọi dòng phải ra "✅ có". Còn dòng "❌ THIẾU" nào thì dán lại
-- bộ cài db/cai-dat.sql một lần nữa và đọc kỹ thông báo lỗi.
-- ============================================================
with can_co(thu_tu, muc, co) as (

  -- Ba thứ mới của ngày 18/8/2026 --------------------------------
  select 1, 'Hàm tkb_cua_toi() — giáo viên chỉ tải lịch của mình',
         to_regprocedure('public.tkb_cua_toi()') is not null
  union all
  select 2, 'Hàm don_du_lieu_cu() — dọn phiên bản cũ, giữ 10 bản',
         to_regprocedure('public.don_du_lieu_cu(uuid)') is not null
  union all
  select 3, 'luu_tkb() bản mới — biết gộp lần lưu liên tiếp và tự dọn',
         exists (select 1 from pg_proc p
                   join pg_namespace n on n.oid = p.pronamespace
                  where n.nspname = 'public' and p.proname = 'luu_tkb'
                    and pg_get_functiondef(p.oid) like '%don_du_lieu_cu%')
  union all
  -- tkb_cua_toi PHẢI là security invoker: quy tắc p_tkb_doc mới còn
  -- hiệu lực, nhờ vậy giáo viên chỉ đọc được bản ĐÃ CÔNG BỐ của đúng
  -- trường mình. Thành definer là mở toang cửa mà không ai hay.
  select 4, 'tkb_cua_toi() chạy bằng quyền NGƯỜI GỌI (không phải definer)',
         exists (select 1 from pg_proc p
                   join pg_namespace n on n.oid = p.pronamespace
                  where n.nspname = 'public' and p.proname = 'tkb_cua_toi'
                    and p.prosecdef = false)

  -- Phần còn thiếu từ đợt 3/8/2026 -------------------------------
  union all
  select 5, 'Bảng bao_nghi — giáo viên gửi thông báo nghỉ',
         to_regclass('public.bao_nghi') is not null
  union all
  select 6, 'Cột day_thay.da_xem',
         exists (select 1 from information_schema.columns
                  where table_schema='public' and table_name='day_thay'
                    and column_name='da_xem')
  union all
  select 7, 'Cột day_thay.bao_nghi_id',
         exists (select 1 from information_schema.columns
                  where table_schema='public' and table_name='day_thay'
                    and column_name='bao_nghi_id')
  union all
  -- Chốt chặn TUYỆT ĐỐI của §14: hai cán bộ quản lý ở hai máy khác
  -- nhau không thể cùng gán một giáo viên vào hai lớp cùng một tiết.
  -- Phía app không đóng được lỗ này vì mỗi bên chỉ biết trạng thái
  -- của chính trình duyệt mình.
  select 8, 'Chỉ số chống một giáo viên dạy thay hai lớp cùng tiết',
         exists (select 1 from pg_indexes
                  where schemaname='public' and indexname='ux_day_thay_gv_mot_tiet')

  -- Ba quy tắc GHI mà thiếu là "báo đã lưu nhưng không lưu" -------
  union all
  select 9, 'Quy tắc p_tkb_sua — bấm được nút Công bố',
         exists (select 1 from pg_policies
                  where tablename='tkb_phien_ban' and policyname='p_tkb_sua')
  union all
  select 10, 'Quy tắc p_truong_sua — lưu được tên trường, năm học',
         exists (select 1 from pg_policies
                  where tablename='truong' and policyname='p_truong_sua')
  union all
  select 11, 'Quy tắc p_bao_nghi_gui — thầy cô tự gửi báo nghỉ',
         exists (select 1 from pg_policies
                  where tablename='bao_nghi' and policyname='p_bao_nghi_gui')
)
select case when co then '✅ có' else '❌ THIẾU' end as trang_thai, muc as hang_muc
  from can_co order by thu_tu;


-- ============================================================
-- Hiện đang giữ bao nhiêu phiên bản thời khóa biểu
-- ------------------------------------------------------------
-- Từ lần bấm Lưu tiếp theo, don_du_lieu_cu() sẽ tự dọn xuống còn
-- 10 bản gần nhất, cộng mọi bản đã công bố. Số hôm nay có thể còn
-- cao — đó là bình thường, nó chưa chạy lần nào.
-- ============================================================
select t.ten                                    as truong,
       count(*)                                 as so_ban_dang_giu,
       count(*) filter (where pb.cong_bo)       as trong_do_da_cong_bo,
       max(pb.version)                          as ban_moi_nhat,
       pg_size_pretty(sum(pg_column_size(pb.du_lieu))) as cho_chua
  from tkb_phien_ban pb
  join truong t on t.id = pb.truong_id
 group by t.ten
 order by count(*) desc;
