-- ============================================================
--  SỬA MÃ LỚP TRÊN MÁY CHỦ + SOI VÌ SAO GHI BỊ TỪ CHỐI
--  Trường Tiểu học Vinh Hưng 1  (31/8/2026)
--
--  Sau khi dọn phân công còn 15 lớp mã lệch tên: bản sửa mã trong app chưa
--  lưu lên được vì bấm Lưu báo *"Hỏng ở bước Lớp học. Tài khoản không có
--  quyền làm việc này."* Tệp này làm hai việc rời nhau:
--
--    PHẦN 1 — sửa mã lớp thẳng trên máy chủ, không cần app.
--    PHẦN 2 — soi vì sao đường ghi của app bị từ chối (chỉ đọc).
--
--  ⚠️ Đổi `ma_lop` KHÔNG đụng gì khác: mọi bảng tham chiếu lớp bằng `id`,
--  `ma_lop` chỉ là mã người đọc và là khoá khi nhập từ Excel. Các phiên bản
--  thời khoá biểu đã lưu vẫn đọc được.
-- ============================================================

do $$
begin
  if to_regclass('public.lop') is null then
    raise exception 'Không thấy bảng lop — đang đứng ở dự án Supabase KHÁC.';
  end if;
end $$;

-- ------------------------------------------------------------
-- PHẦN 1 — Đưa mã lớp về đúng tên lớp
-- ------------------------------------------------------------
do $$
declare
  c_ma_truong text := '57634';     -- Vinh Hưng 1
  v_t uuid; n_trung int; n int;
begin
  select id into v_t from truong where ma_truong = c_ma_truong;
  if v_t is null then raise exception 'Không thấy trường mã %.', c_ma_truong; end if;

  -- ⚠️ Chỉ làm được khi tên lớp là DUY NHẤT trong trường: `ma_lop` có ràng
  --    buộc unique, hai lớp cùng tên thì đặt mã theo tên sẽ đụng nhau. Trường
  --    một phân hiệu thì không có chuyện ấy, nhưng vẫn phải kiểm chứ không
  --    giả định.
  select count(*) into n_trung from (
    select ten from lop where truong_id = v_t group by ten having count(*) > 1) q;
  if n_trung > 0 then
    raise exception 'Có % tên lớp bị trùng — không đặt mã theo tên được. Sửa tên lớp trước.', n_trung;
  end if;

  -- ⚠️ PHẢI ĐI QUA MÃ TẠM. Mã đang lệch một bậc theo dây chuyền: lớp tên
  --    `2G` mang mã `2F`, lớp tên `2H` mang mã `2G`. Đổi thẳng thì dòng đầu
  --    `2F → 2G` đụng ngay cái `2G` chưa kịp đổi — ràng buộc unique kiểm
  --    TỪNG DÒNG, không đợi hết lệnh. Đã ăn thật lần chạy đầu:
  --    *duplicate key ... (truong_id, ma_lop)=(…, 2G) already exists*.
  update lop set ma_lop = '~' || id::text
   where truong_id = v_t and ma_lop is distinct from btrim(ten);
  get diagnostics n = row_count;
  update lop set ma_lop = btrim(ten)
   where truong_id = v_t and ma_lop like '~%';
  raise notice 'Đã sửa % mã lớp về đúng tên lớp.', n;
end $$;

-- ------------------------------------------------------------
-- PHẦN 2 — Vì sao app ghi vào bảng `lop` bị từ chối
--
--   Đọc cột `loai`: phải là PERMISSIVE ở MỌI dòng. Một quy tắc RESTRICTIVE
--   là đủ chặn tất cả — kiểu quy tắc ấy nhân với các quy tắc khác, nên thêm
--   bao nhiêu quy tắc mới cũng vô ích.
-- ------------------------------------------------------------
select 'A · QUY TẮC TRÊN BẢNG lop'      as muc,
       policyname                       as ten,
       cmd                              as lenh,
       permissive                       as loai,
       coalesce(qual, '—')              as dieu_kien_using,
       coalesce(with_check, '—')        as dieu_kien_check
from pg_policies
where schemaname = 'public' and tablename = 'lop'

union all
select 'B · BẢNG lop', c.relname,
       case when c.relrowsecurity then 'RLS bật' else 'RLS tắt' end,
       case when c.relforcerowsecurity then '⚠ FORCE bật' else 'force tắt' end,
       '—', '—'
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'lop'

union all
select 'C · HÀM la_chu_he_thong()', p.proname,
       case when p.prosecdef then 'security definer' else 'security invoker' end,
       '—',
       left(replace(replace(pg_get_functiondef(p.oid), chr(10), ' '), '  ', ' '), 300),
       '—'
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'la_chu_he_thong'

union all
select 'D · KẾT QUẢ PHẦN 1', 'Vinh Hưng 1',
       (select count(*)::text from lop l join truong t on t.id = l.truong_id
         where t.ma_truong = '57634') || ' lớp',
       (select count(*)::text from lop l join truong t on t.id = l.truong_id
         where t.ma_truong = '57634' and l.ma_lop <> l.ten) || ' lớp còn lệch',
       '—', '—'
order by muc, ten;
