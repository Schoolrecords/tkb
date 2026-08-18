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

-- ma_lop = khoá tự nhiên do nhà trường đặt (cột Ma_lop trong tệp Excel).
--          Tên lớp KHÔNG dùng làm khoá: sau sáp nhập, ba điểm trường đều có
--          lớp mang tên "1A" và đó là ba lớp khác nhau.
create table if not exists lop (
  id               uuid primary key default gen_random_uuid(),
  truong_id        uuid not null references truong(id) on delete cascade,
  diem_truong_id   uuid not null references diem_truong(id) on delete restrict,
  ma_lop           text not null,
  ten              text not null,
  khoi             smallint not null check (khoi between 1 and 5),
  gvcn_id          uuid references giao_vien(id) on delete set null,
  unique (truong_id, ma_lop)
);
-- Nâng cấp cơ sở dữ liệu đã dựng trước khi có cột này: chạy db/ma-lop.sql

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
-- DỌN DỮ LIỆU CŨ — giữ chỗ chứa không phình vô hạn
-- ------------------------------------------------------------
-- VÌ SAO CẦN
--   Mỗi lần bấm Lưu là THÊM một dòng, không ghi đè — chủ ý, để có
--   lịch sử phiên bản miễn phí. Nhưng một mùa xếp lịch bấm Lưu chừng
--   60 lần, mà 59 bản trong đó không ai xem lại bao giờ. Với một
--   trường 40 lớp thì mỗi bản ~57 KB, tức 3,4 MB mỗi trường mỗi mùa.
--   Nhân với 300 trường là 1 GB — vượt gấp đôi hạn 500 MB của gói
--   miễn phí, ngay mùa đầu tiên.
--
-- VÌ SAO LÀ security definer
--   Xoá bản cũ là việc của HỆ THỐNG, không phải quyền của người dùng.
--   Mở hẳn một quy tắc DELETE trên tkb_phien_ban nghĩa là bất kỳ cán bộ
--   quản lý nào cũng xoá được phiên bản bất kỳ — kể cả bản đã công bố
--   mà thầy cô đang xem. Hàm này chỉ làm đúng một việc hẹp, và vẫn tự
--   kiểm quyền ở dòng đầu chứ không tin người gọi.
-- ============================================================
create or replace function don_du_lieu_cu(p_truong uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  c_giu constant integer := 10;   -- số bản gần nhất luôn giữ lại
  v_moc integer;
begin
  -- Tự kiểm quyền: không tin tham số người gọi truyền vào
  if p_truong is null or p_truong <> truong_cua_toi() or not la_quan_ly() then
    return;
  end if;

  select max(version) - c_giu into v_moc
    from tkb_phien_ban where truong_id = p_truong;

  -- Bản ĐÃ CÔNG BỐ thì giữ mãi: đó là bản thầy cô đang xem, và là bản
  -- nhà trường chịu trách nhiệm. Chỉ dọn những bản nháp giữa chừng.
  if v_moc is not null then
    delete from tkb_phien_ban
     where truong_id = p_truong and cong_bo = false and version <= v_moc;
  end if;

  -- Nhật ký chỉ giữ metadata nhỏ nên phình chậm, nhưng để lâu vẫn dồn.
  -- 18 tháng đủ phủ trọn một năm học cộng phần đầu năm sau.
  delete from nhat_ky
   where truong_id = p_truong and thoi_diem < now() - interval '18 months';
end $$;

-- ============================================================
-- LƯU THỜI KHÓA BIỂU KÈM KHÓA LẠC QUAN
-- Client gửi version đang giữ. Nếu trên máy chủ đã cao hơn thì
-- từ chối, tránh hai phó hiệu trưởng ghi đè nhau.
-- ============================================================
create or replace function luu_tkb(
  p_truong uuid, p_version integer, p_du_lieu jsonb, p_ghi_chu text default null)
returns table (ok boolean, version_moi integer, thong_bao text)
language plpgsql security invoker as $$
declare
  c_giay constant integer := 600;  -- cửa sổ gộp: 10 phút
  v_hien integer;
  v_gop  uuid;
begin
  select coalesce(max(version), 0) into v_hien
    from tkb_phien_ban where truong_id = p_truong;

  if p_version < v_hien then
    return query select false, v_hien,
      format('Đã có người lưu phiên bản %s. Mời tải lại rồi lưu tiếp.', v_hien);
    return;
  end if;

  -- GỘP các lần lưu liên tiếp: người xếp lịch hay bấm Lưu vài phút một
  -- lần suốt buổi tối. Không ai cần quay lại bản của 5 phút trước, nên
  -- ghi đè lên chính bản vừa lưu thay vì đẻ thêm dòng.
  -- Ba điều kiện đều bắt buộc:
  --   cùng người   — bản của đồng nghiệp thì tuyệt đối không đụng
  --   chưa công bố — bản thầy cô đang xem thì không được đổi ruột
  --   còn trong cửa sổ — cách nhau nửa buổi là hai lần làm việc khác nhau
  select id into v_gop from tkb_phien_ban
   where truong_id = p_truong and version = v_hien
     and cong_bo = false and nguoi_sua = auth.uid()
     and tao_luc > now() - make_interval(secs => c_giay)
   limit 1;

  if v_gop is not null then
    update tkb_phien_ban
       set du_lieu = p_du_lieu,
           ghi_chu = coalesce(p_ghi_chu, ghi_chu),
           tao_luc = now()
     where id = v_gop;
    return query select true, v_hien, 'Đã lưu'::text;
    return;
  end if;

  insert into tkb_phien_ban (truong_id, version, du_lieu, ghi_chu, nguoi_sua)
  values (p_truong, v_hien + 1, p_du_lieu, p_ghi_chu, auth.uid());

  perform don_du_lieu_cu(p_truong);

  return query select true, v_hien + 1, 'Đã lưu'::text;
end $$;
