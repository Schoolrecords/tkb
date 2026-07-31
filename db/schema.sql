-- ============================================================
-- HỆ THỐNG THỜI KHÓA BIỂU — Schema PostgreSQL cho Supabase
-- Thiết kế sẵn cho nhiều trường (multi-tenant) ngay từ Pha 1.
-- Chạy toàn bộ file này trong Supabase SQL Editor.
-- ============================================================

-- ---------- Kiểu dữ liệu ----------
do $$ begin
  create type vai_tro_t as enum ('quan_tri','hieu_truong','pho_hieu_truong','giao_vien');
exception when duplicate_object then null; end $$;

do $$ begin
  create type buoi_t as enum ('S','C');
exception when duplicate_object then null; end $$;

-- ---------- Bảng gốc ----------
create table if not exists truong (
  id          uuid primary key default gen_random_uuid(),
  ten         text not null,
  ma_truong   text unique,
  tinh        text,
  xa          text,
  nam_hoc     text not null default '2026-2027',
  tao_luc     timestamptz not null default now()
);

create table if not exists nguoi_dung (
  id                uuid primary key references auth.users(id) on delete cascade,
  truong_id         uuid not null references truong(id) on delete cascade,
  ho_ten            text not null,
  email             text,
  vai_tro           vai_tro_t not null default 'giao_vien',
  diem_truong_id    uuid,                       -- PHT phụ trách điểm trường nào
  tao_luc           timestamptz not null default now()
);

create table if not exists diem_truong (
  id            uuid primary key default gen_random_uuid(),
  truong_id     uuid not null references truong(id) on delete cascade,
  ten           text not null,
  co_phong_tin  boolean not null default true,
  thu_tu        smallint not null default 0
);

-- so_tiet     = số tiết lớn nhất của buổi, tức chiều cao lưới hiển thị
-- so_tiet_khoi= số tiết RIÊNG từng khối, dạng {"1":4,"2":4,"3":4,"4":5,"5":5}
--               Khối nhỏ tan sớm hơn: lớp 1 không ở lại tiết 5 sáng thứ Sáu.
--               Bỏ trống thì mọi khối học như nhau, bằng so_tiet.
create table if not exists khung_gio (
  id            uuid primary key default gen_random_uuid(),
  truong_id     uuid not null references truong(id) on delete cascade,
  thu           smallint not null check (thu between 2 and 7),
  buoi          buoi_t   not null,
  so_tiet       smallint not null default 4 check (so_tiet between 1 and 8),
  so_tiet_khoi  jsonb,
  bat           boolean  not null default true,
  unique (truong_id, thu, buoi)
);
-- Nâng cấp cho cơ sở dữ liệu đã dựng trước khi có cột này
alter table khung_gio add column if not exists so_tiet_khoi jsonb;

create table if not exists giao_vien (
  id             uuid primary key default gen_random_uuid(),
  truong_id      uuid not null references truong(id) on delete cascade,
  ma_gv          text not null,                 -- mã nội bộ, KHÔNG dùng tên rút gọn
  ho_ten         text not null,
  dinh_muc       smallint not null default 23,
  nguoi_dung_id  uuid references nguoi_dung(id) on delete set null,
  unique (truong_id, ma_gv)
);

create table if not exists lop (
  id               uuid primary key default gen_random_uuid(),
  truong_id        uuid not null references truong(id) on delete cascade,
  diem_truong_id   uuid not null references diem_truong(id) on delete restrict,
  ten              text not null,
  khoi             smallint not null check (khoi between 1 and 5),
  gvcn_id          uuid references giao_vien(id) on delete set null,
  unique (truong_id, ten)
);

create table if not exists phan_cong (
  id             uuid primary key default gen_random_uuid(),
  truong_id      uuid not null references truong(id) on delete cascade,
  giao_vien_id   uuid not null references giao_vien(id) on delete cascade,
  lop_id         uuid not null references lop(id) on delete cascade,
  mon            text not null,
  so_tiet        smallint not null check (so_tiet >= 0),
  unique (truong_id, giao_vien_id, lop_id, mon)
);

create table if not exists gv_nghi (
  id             uuid primary key default gen_random_uuid(),
  truong_id      uuid not null references truong(id) on delete cascade,
  giao_vien_id   uuid not null references giao_vien(id) on delete cascade,
  thu            smallint not null check (thu between 2 and 7),
  buoi           buoi_t not null,
  ly_do          text,
  unique (truong_id, giao_vien_id, thu, buoi)
);

-- Kết quả xếp: mỗi phiên bản là MỘT dòng, toàn bộ TKB nén trong jsonb.
-- Ghi nguyên tử, quay lui chỉ là đọc dòng cũ.
create table if not exists tkb_phien_ban (
  id          uuid primary key default gen_random_uuid(),
  truong_id   uuid not null references truong(id) on delete cascade,
  version     integer not null,
  du_lieu     jsonb not null,
  ghi_chu     text,
  nguoi_sua   uuid references nguoi_dung(id) on delete set null,
  cong_bo     boolean not null default false,
  tao_luc     timestamptz not null default now(),
  unique (truong_id, version)
);

create table if not exists nhat_ky (
  id             uuid primary key default gen_random_uuid(),
  truong_id      uuid not null references truong(id) on delete cascade,
  nguoi_dung_id  uuid references nguoi_dung(id) on delete set null,
  hanh_dong      text not null,
  du_lieu_cu     jsonb,
  thoi_diem      timestamptz not null default now()
);

-- ---------- Chỉ mục ----------
create index if not exists ix_lop_truong        on lop(truong_id);
create index if not exists ix_lop_diem          on lop(diem_truong_id);
create index if not exists ix_pc_truong         on phan_cong(truong_id);
create index if not exists ix_pc_gv             on phan_cong(giao_vien_id);
create index if not exists ix_gv_truong         on giao_vien(truong_id);
create index if not exists ix_tkb_truong_ver    on tkb_phien_ban(truong_id, version desc);
create index if not exists ix_nk_truong_luc     on nhat_ky(truong_id, thoi_diem desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- Mặc định KHÔNG AI đọc được gì. Cô lập dữ liệu ở tầng CSDL,
-- không phụ thuộc frontend có lỗi hay không.
-- ============================================================

-- Lấy truong_id của người đang đăng nhập.
-- STABLE + security definer để tránh đệ quy RLS khi truy vấn nguoi_dung.
create or replace function truong_cua_toi()
returns uuid language sql stable security definer set search_path = public as $$
  select truong_id from nguoi_dung where id = auth.uid()
$$;

create or replace function vai_tro_cua_toi()
returns vai_tro_t language sql stable security definer set search_path = public as $$
  select vai_tro from nguoi_dung where id = auth.uid()
$$;

create or replace function la_quan_ly()
returns boolean language sql stable as $$
  select vai_tro_cua_toi() in ('quan_tri','hieu_truong','pho_hieu_truong')
$$;

-- Bật RLS cho mọi bảng nghiệp vụ
do $$
declare b text;
begin
  foreach b in array array['truong','nguoi_dung','diem_truong','khung_gio','giao_vien',
                           'lop','phan_cong','gv_nghi','tkb_phien_ban','nhat_ky']
  loop
    execute format('alter table %I enable row level security', b);
  end loop;
end $$;

-- Trường: chỉ thấy trường của mình
drop policy if exists p_truong_doc on truong;
create policy p_truong_doc on truong for select using (id = truong_cua_toi());

-- Người dùng: thấy đồng nghiệp cùng trường; chỉ quản lý mới sửa được
drop policy if exists p_nd_doc on nguoi_dung;
create policy p_nd_doc on nguoi_dung for select using (truong_id = truong_cua_toi());
drop policy if exists p_nd_sua on nguoi_dung;
create policy p_nd_sua on nguoi_dung for all
  using (truong_id = truong_cua_toi() and la_quan_ly())
  with check (truong_id = truong_cua_toi() and la_quan_ly());

-- Các bảng dữ liệu nguồn: cả trường đọc được, chỉ quản lý sửa được
do $$
declare b text;
begin
  foreach b in array array['diem_truong','khung_gio','giao_vien','lop','phan_cong','gv_nghi']
  loop
    execute format('drop policy if exists p_%1$s_doc on %1$I', b);
    execute format(
      'create policy p_%1$s_doc on %1$I for select using (truong_id = truong_cua_toi())', b);
    execute format('drop policy if exists p_%1$s_sua on %1$I', b);
    execute format(
      'create policy p_%1$s_sua on %1$I for all
         using (truong_id = truong_cua_toi() and la_quan_ly())
         with check (truong_id = truong_cua_toi() and la_quan_ly())', b);
  end loop;
end $$;

-- Thời khóa biểu: giáo viên chỉ đọc bản đã công bố
drop policy if exists p_tkb_doc on tkb_phien_ban;
create policy p_tkb_doc on tkb_phien_ban for select
  using (truong_id = truong_cua_toi() and (cong_bo or la_quan_ly()));
drop policy if exists p_tkb_ghi on tkb_phien_ban;
create policy p_tkb_ghi on tkb_phien_ban for insert
  with check (truong_id = truong_cua_toi() and la_quan_ly());

-- Nhật ký: chỉ quản lý đọc, ai cũng ghi được (để lưu vết thao tác của chính mình)
drop policy if exists p_nk_doc on nhat_ky;
create policy p_nk_doc on nhat_ky for select
  using (truong_id = truong_cua_toi() and la_quan_ly());
drop policy if exists p_nk_ghi on nhat_ky;
create policy p_nk_ghi on nhat_ky for insert
  with check (truong_id = truong_cua_toi());

-- ============================================================
-- LƯU THỜI KHÓA BIỂU KÈM KHÓA LẠC QUAN
-- Client gửi version đang giữ. Nếu trên máy chủ đã cao hơn thì
-- từ chối, tránh hai phó hiệu trưởng ghi đè nhau.
-- ============================================================
create or replace function luu_tkb(
  p_truong uuid, p_version integer, p_du_lieu jsonb, p_ghi_chu text default null)
returns table (ok boolean, version_moi integer, thong_bao text)
language plpgsql security invoker as $$
declare v_hien integer;
begin
  select coalesce(max(version), 0) into v_hien
    from tkb_phien_ban where truong_id = p_truong;

  if p_version < v_hien then
    return query select false, v_hien,
      format('Đã có người lưu phiên bản %s. Mời tải lại rồi lưu tiếp.', v_hien);
    return;
  end if;

  insert into tkb_phien_ban (truong_id, version, du_lieu, ghi_chu, nguoi_sua)
  values (p_truong, v_hien + 1, p_du_lieu, p_ghi_chu, auth.uid());

  return query select true, v_hien + 1, 'Đã lưu'::text;
end $$;
