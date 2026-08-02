-- ============================================================
-- MÃ MỜI — vào trường bằng tài khoản Google, không mật khẩu
-- Chạy MỘT LẦN trong Supabase SQL Editor (đã gộp trong db/cai-dat.sql).
--
-- CÁCH BẬT ĐĂNG NHẬP GOOGLE (làm một lần, ngoài SQL):
--   1. console.cloud.google.com → APIs & Services → Credentials
--      → Create OAuth client ID (Web application).
--      Authorized redirect URI:  https://<du-an>.supabase.co/auth/v1/callback
--   2. Supabase → Authentication → Providers → Google:
--      dán Client ID + Client Secret, bật Enable.
--   3. Supabase → Authentication → URL Configuration:
--      thêm địa chỉ trang vào Redirect URLs, ví dụ
--      https://schoolrecords.github.io/tkb/  và  http://localhost:5173/
--
-- VÌ SAO CẦN MÃ MỜI
--   Mở cửa Google là BẤT KỲ AI cũng đăng nhập được — nhưng phần mềm phải
--   biết người đó thuộc trường nào, là giáo viên nào. Bài học tài khoản
--   mồ côi đã trả giá một lần. Mã mời là câu trả lời: quản trị tạo mã cho
--   từng thầy cô (gửi Zalo), thầy cô đăng nhập Google rồi gõ mã — hàm
--   dung_ma_moi dưới đây nối tài khoản vào đúng hồ sơ, dùng một lần là hết.
-- ============================================================

create table if not exists ma_moi (
  id              uuid primary key default gen_random_uuid(),
  truong_id       uuid not null references truong(id) on delete cascade,
  ma              text not null unique,
  vai_tro         vai_tro_t not null default 'giao_vien',
  giao_vien_id    uuid references giao_vien(id) on delete cascade,
  diem_truong_id  uuid,
  het_han         timestamptz not null default now() + interval '30 days',
  dung_boi        uuid,
  dung_luc        timestamptz,
  nguoi_tao       uuid references nguoi_dung(id) on delete set null,
  tao_luc         timestamptz not null default now()
);
create index if not exists ix_mm_truong on ma_moi(truong_id);

-- Chỉ quản lý của trường thấy và quản được mã; người ngoài KHÔNG đọc được
-- (khách dùng mã qua hàm dung_ma_moi, không đọc thẳng bảng).
alter table ma_moi enable row level security;
drop policy if exists p_mm_doc on ma_moi;
create policy p_mm_doc on ma_moi for select
  using (truong_id = truong_cua_toi() and la_quan_ly());
drop policy if exists p_mm_sua on ma_moi;
create policy p_mm_sua on ma_moi for all
  using      (truong_id = truong_cua_toi() and la_quan_ly())
  with check (truong_id = truong_cua_toi() and la_quan_ly());

-- Dùng mã: chạy với quyền định nghĩa (security definer) vì người gọi
-- chưa thuộc trường nào nên RLS chặn hết. Làm đúng ba việc rồi thôi.
create or replace function dung_ma_moi(p_ma text)
returns table (ok boolean, thong_bao text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_mm  ma_moi%rowtype;
  v_ten text;
  v_email text;
begin
  if v_uid is null then
    return query select false, 'Chưa đăng nhập.'::text; return;
  end if;
  if exists (select 1 from nguoi_dung where id = v_uid) then
    return query select false,
      'Tài khoản này đã thuộc một trường rồi. Mỗi tài khoản chỉ vào được một trường.'::text;
    return;
  end if;

  select * into v_mm from ma_moi
  where upper(ma) = upper(trim(p_ma)) and dung_boi is null and het_han > now()
  limit 1;
  if v_mm.id is null then
    return query select false,
      'Mã không đúng, đã dùng, hoặc đã hết hạn. Hỏi lại người quản trị của trường.'::text;
    return;
  end if;

  select u.email into v_email from auth.users u where u.id = v_uid;
  select g.ho_ten into v_ten from giao_vien g where g.id = v_mm.giao_vien_id;

  insert into nguoi_dung (id, truong_id, ho_ten, email, vai_tro, diem_truong_id)
  values (v_uid, v_mm.truong_id, coalesce(v_ten, split_part(coalesce(v_email,'thầy cô'),'@',1)),
          v_email, v_mm.vai_tro, v_mm.diem_truong_id);

  if v_mm.giao_vien_id is not null then
    update giao_vien set nguoi_dung_id = v_uid where id = v_mm.giao_vien_id;
  end if;

  update ma_moi set dung_boi = v_uid, dung_luc = now() where id = v_mm.id;

  return query select true, 'Đã vào trường. Mở lại trang là thấy lịch của mình.'::text;
end $$;

revoke all on function dung_ma_moi(text) from public, anon;
grant execute on function dung_ma_moi(text) to authenticated;

-- ---------- Kiểm tra ----------
-- Phải ra một dòng, security_definer = true.
select p.proname as ten_ham, p.prosecdef as security_definer
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'dung_ma_moi';
