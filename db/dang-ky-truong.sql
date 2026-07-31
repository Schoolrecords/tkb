-- ============================================================
-- HÀM ĐĂNG KÝ TRƯỜNG MỚI
-- ------------------------------------------------------------
-- Chạy MỘT LẦN trong SQL Editor. Sau đó trường mới tự đăng ký được
-- qua giao diện, không phải vào SQL nữa.
--
-- VÌ SAO PHẢI CÓ HÀM RIÊNG
--   Row Level Security khoá chặt: muốn thêm dòng vào `nguoi_dung` thì
--   phải ĐÃ là quản trị của trường đó. Nhưng người đầu tiên của một
--   trường mới thì chưa là gì cả. Bảng `truong` cũng không có chính
--   sách cho phép thêm dòng từ phần mềm.
--   Vòng luẩn quẩn đó phải phá đúng một chỗ, có kiểm soát — chính là
--   hàm này. Nó chạy với quyền của người tạo hàm (security definer),
--   làm đúng hai việc rồi trả quyền về mức bình thường.
-- ============================================================

create or replace function dang_ky_truong(
  p_ten       text,
  p_ma_truong text,
  p_ho_ten    text,
  p_tinh      text default null,
  p_xa        text default null,
  p_nam_hoc   text default '2026-2027'
)
returns table (ok boolean, truong_id uuid, thong_bao text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_truong uuid;
  v_ma     text := upper(regexp_replace(coalesce(p_ma_truong,''), '[^A-Za-z0-9]', '', 'g'));
begin
  -- 1. Phải đăng nhập rồi mới đăng ký được
  if v_uid is null then
    return query select false, null::uuid, 'Chưa đăng nhập.'::text; return;
  end if;

  -- 2. Một tài khoản chỉ thuộc một trường
  if exists (select 1 from nguoi_dung where id = v_uid) then
    return query select false, null::uuid,
      'Tài khoản này đã thuộc một trường rồi. Mỗi tài khoản chỉ vào được một trường.'::text;
    return;
  end if;

  -- 3. Soát dữ liệu vào
  if length(coalesce(trim(p_ten),'')) < 6 then
    return query select false, null::uuid, 'Tên trường quá ngắn.'::text; return;
  end if;
  if length(v_ma) < 3 then
    return query select false, null::uuid,
      'Mã trường cần ít nhất 3 chữ cái hoặc số, viết liền không dấu.'::text; return;
  end if;
  if length(coalesce(trim(p_ho_ten),'')) < 3 then
    return query select false, null::uuid, 'Thiếu họ tên người đăng ký.'::text; return;
  end if;
  if exists (select 1 from truong where ma_truong = v_ma) then
    return query select false, null::uuid,
      format('Mã trường "%s" đã có người dùng. Chọn mã khác.', v_ma); return;
  end if;

  -- 4. Tạo trường và hồ sơ quản trị trong CÙNG một giao dịch.
  --    Lỗi giữa chừng thì cả hai cùng bị huỷ, không để lại trường mồ côi.
  insert into truong (ten, ma_truong, tinh, xa, nam_hoc)
  values (trim(p_ten), v_ma, nullif(trim(coalesce(p_tinh,'')),''),
          nullif(trim(coalesce(p_xa,'')),''), coalesce(nullif(trim(p_nam_hoc),''),'2026-2027'))
  returning id into v_truong;

  insert into nguoi_dung (id, truong_id, ho_ten, email, vai_tro)
  select v_uid, v_truong, trim(p_ho_ten), u.email, 'quan_tri'
  from auth.users u where u.id = v_uid;

  -- 5. Khung giờ mặc định: 8 buổi/tuần, số tiết riêng từng khối
  --    đúng chuẩn Chương trình GDPT 2018 (27·27·28·30·30).
  insert into khung_gio (truong_id, thu, buoi, so_tiet, so_tiet_khoi, bat)
  select v_truong, v.thu::smallint, v.buoi::buoi_t, v.so_tiet::smallint,
         v.so_tiet_khoi::jsonb, v.bat
  from (values
    (2,'S',4,'{"1":4,"2":4,"3":4,"4":4,"5":4}',true),
    (2,'C',3,'{"1":3,"2":3,"3":3,"4":3,"5":3}',true),
    (3,'S',4,'{"1":4,"2":4,"3":4,"4":4,"5":4}',true),
    (3,'C',3,'{"1":2,"2":2,"3":3,"4":3,"5":3}',true),
    (4,'S',4,'{"1":4,"2":4,"3":4,"4":4,"5":4}',true),
    (4,'C',3,'{"1":3,"2":3,"3":3,"4":3,"5":3}',false),
    (5,'S',4,'{"1":4,"2":4,"3":4,"4":4,"5":4}',true),
    (5,'C',3,'{"1":2,"2":2,"3":2,"4":3,"5":3}',true),
    (6,'S',5,'{"1":4,"2":4,"3":4,"4":5,"5":5}',true),
    (6,'C',3,'{"1":3,"2":3,"3":3,"4":3,"5":3}',false)
  ) as v(thu, buoi, so_tiet, so_tiet_khoi, bat);

  -- 6. Một điểm trường mặc định để có chỗ gắn lớp ngay
  insert into diem_truong (truong_id, ten, co_phong_tin, thu_tu)
  values (v_truong, 'Điểm trường chính', true, 0);

  return query select true, v_truong,
    format('Đã tạo %s. Bước tiếp theo: nhập bảng phân công từ Excel.', trim(p_ten));
end $$;

-- Chỉ tài khoản đã đăng nhập mới gọi được. Khách vãng lai thì không.
revoke all on function dang_ky_truong(text,text,text,text,text,text) from public, anon;
grant execute on function dang_ky_truong(text,text,text,text,text,text) to authenticated;

-- ---------- Kiểm tra ----------
-- Phải ra một dòng, cột security_definer = true.
select p.proname as ten_ham, p.prosecdef as security_definer
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'dang_ky_truong';
