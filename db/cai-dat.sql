-- ============================================================
-- BỘ CÀI ĐẶT TRỌN GÓI — dán MỘT LẦN cho một dự án Supabase mới
-- ------------------------------------------------------------
-- TỆP SINH TỰ ĐỘNG từ bốn tệp nguồn, sinh lại bằng:
--     node db/gop-cai-dat.mjs
-- Đừng sửa tay tệp này; sửa tệp nguồn tương ứng rồi sinh lại.
--
-- Cách dùng: Supabase → SQL Editor → dán toàn bộ tệp → Run.
-- Chạy lại lần nữa cũng không sao — mọi lệnh đều tự bỏ qua phần
-- đã có (create if not exists / or replace / drop policy if exists).
--
-- Gồm, theo thứ tự:
--   1. db/schema.sql
--   2. db/mon-hoc-phong.sql
--   3. db/cong-bo.sql
--   4. db/day-thay.sql
--   5. db/dang-ky-truong.sql
--
-- KHÔNG gồm các tệp tiện ích tình huống (chạy riêng khi cần):
--   db/khoi-tao.sql            tạo trường bằng tay, không qua giao diện
--   db/ma-lop.sql              nâng cấp CSDL dựng trước 1/8/2026
--   db/du-lieu-dien-lien.sql   nạp dữ liệu mẫu Diễn Liên
--   db/cong-bo-ngay.sql · soi-loi-cong-bo.sql · sua-tai-khoan-mo-coi.sql
--   · dat-lai-mat-khau.sql     công cụ xử lý sự cố
--   db/edge-function-tai-khoan.ts  cấp tài khoản hàng loạt (Edge Function,
--                              triển khai riêng theo README)
-- ============================================================


-- ############################################################
-- ###  schema.sql
-- ############################################################

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


-- ############################################################
-- ###  mon-hoc-phong.sql
-- ############################################################

-- ============================================================
-- NÂNG CẤP: DANH MỤC MÔN HỌC VÀ BẢNG PHÒNG CHỨC NĂNG
-- Chạy MỘT LẦN trong Supabase SQL Editor.
--
-- Vì sao cần: trước đây danh mục môn và cờ "có phòng Tin học" nằm cứng
-- trong mã nguồn. Trường muốn thêm một môn tự chọn, hay khai hai phòng máy
-- ở hai điểm trường, là phải sửa mã. Hai bảng dưới đưa chúng thành dữ liệu.
--
-- An toàn với cơ sở dữ liệu đang chạy: phần mềm đọc hai bảng này bằng
-- `.catch(() => [])`, chưa chạy tệp này thì vẫn chạy bình thường bằng bộ
-- mặc định — chỉ là chưa lưu được thay đổi lên máy chủ.
--
-- Cần chạy `db/schema.sql` trước (tệp này dùng lại truong_cua_toi(),
-- la_quan_ly() đã khai ở đó).
-- ============================================================

-- ---------- 1. Danh mục môn học ----------
-- tiet_chuan: số tiết mỗi tuần theo khối, dạng {"1":12,"2":10,"3":7,"4":7,"5":7}
--             Khối nào không học môn đó thì bỏ khoá ấy đi, không ghi 0.
-- nang       : ưu tiên xếp tiết 1–3 buổi sáng (Toán, Tiếng Việt)
-- nhe        : tránh tiết cuối sáng và tiết 1 chiều (GDTC, Mỹ thuật, Âm nhạc)
-- phong      : tên loại phòng chức năng cần dùng; rỗng = học tại lớp
create table if not exists mon_hoc (
  id          uuid primary key default gen_random_uuid(),
  truong_id   uuid not null references truong(id) on delete cascade,
  ten         text not null,
  mau         text,
  nang        boolean not null default false,
  nhe         boolean not null default false,
  phong       text,
  tiet_chuan  jsonb,
  thu_tu      smallint not null default 0,
  unique (truong_id, ten)
);

-- ---------- 2. Phòng chức năng ----------
-- Chỉ khai phòng DÙNG CHUNG: phòng máy, phòng nghệ thuật, nhà đa năng.
-- Lớp học thường không cần khai — mỗi lớp mặc định có phòng của mình.
create table if not exists phong (
  id              uuid primary key default gen_random_uuid(),
  truong_id       uuid not null references truong(id) on delete cascade,
  diem_truong_id  uuid references diem_truong(id) on delete cascade,
  ten             text not null,
  mon             text,
  thu_tu          smallint not null default 0
);

create index if not exists ix_phong_diem on phong (diem_truong_id);
create index if not exists ix_mon_truong on mon_hoc (truong_id);

-- ---------- 3. Bật RLS, đúng khuôn của các bảng nguồn khác ----------
-- Cả trường đọc được, chỉ cán bộ quản lý sửa được.
alter table mon_hoc enable row level security;
alter table phong   enable row level security;

do $$
declare b text;
begin
  foreach b in array array['mon_hoc','phong']
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

-- ---------- 4. Nạp danh mục môn chuẩn CT GDPT 2018 cho mọi trường ----------
-- Trường nào đã tự khai môn rồi thì bỏ qua (on conflict do nothing).
-- Số tiết dưới đây đối chiếu từ bản kết xuất thật của Trường TH Diễn Liên
-- ngày 31/7/2026: cộng theo khối ra đúng 27 · 27 · 28 · 30 · 30.
insert into mon_hoc (truong_id, ten, mau, nang, nhe, phong, tiet_chuan, thu_tu)
select t.id, m.ten, m.mau, m.nang, m.nhe, nullif(m.phong,''), m.tiet_chuan::jsonb, m.thu_tu
from truong t
cross join (values
  ('Tiếng Việt','m-tv',   true,  false, '', '{"1":12,"2":10,"3":7,"4":7,"5":7}',  0),
  ('Toán',      'm-toan', true,  false, '', '{"1":3,"2":5,"3":5,"4":5,"5":5}',    1),
  ('Tiếng Anh', 'm-ta',   false, false, '', '{"1":2,"2":2,"3":4,"4":4,"5":4}',    2),
  ('HDTN',      'm-hdtn', false, true,  '', '{"1":3,"2":3,"3":3,"4":3,"5":3}',    3),
  ('GDTC',      'm-gdtc', false, true,  '', '{"1":2,"2":2,"3":2,"4":2,"5":2}',    4),
  ('TNXH',      'm-tnxh', false, false, '', '{"1":2,"2":2,"3":2}',                5),
  ('Đạo Đức',   'm-dd',   false, false, '', '{"1":1,"2":1,"3":1,"4":1,"5":1}',    6),
  ('Âm nhạc',   'm-an',   false, true,  '', '{"1":1,"2":1,"3":1,"4":1,"5":1}',    7),
  ('Mỹ thuật',  'm-mt',   false, true,  '', '{"1":1,"2":1,"3":1,"4":1,"5":1}',    8),
  ('LS&ĐL',     'm-ls',   false, false, '', '{"4":2,"5":2}',                      9),
  ('Khoa học',  'm-kh',   false, false, '', '{"4":2,"5":2}',                     10),
  ('Tin học',   'm-th',   false, false, 'Tin học', '{"3":1,"4":1,"5":1}',        11),
  ('CN',        'm-cn',   false, false, '', '{"3":1,"4":1,"5":1}',               12)
) as m(ten, mau, nang, nhe, phong, tiet_chuan, thu_tu)
on conflict (truong_id, ten) do nothing;

-- ---------- 5. Dựng phòng Tin học từ cờ co_phong_tin đang có ----------
-- Giữ nguyên hiện trạng: điểm trường nào đang đánh dấu có phòng máy thì
-- sinh đúng một phòng cho nó. Chạy lại tệp này không sinh thêm bản trùng.
insert into phong (truong_id, diem_truong_id, ten, mon)
select d.truong_id, d.id,
       'Phòng Tin học · ' || replace(d.ten, 'Điểm trường ', ''), 'Tin học'
from diem_truong d
where d.co_phong_tin
  and not exists (
    select 1 from phong p where p.diem_truong_id = d.id and p.mon = 'Tin học');

-- ---------- 6. Kiểm tra sau khi chạy ----------
-- Cả hai câu dưới phải ra số > 0. Chạy xong thì vào phần mềm,
-- mục Bước 1 · Môn học và Bước 1 · Phòng học phải thấy đủ dữ liệu.
select 'mon_hoc' as bang, count(*) from mon_hoc
union all
select 'phong', count(*) from phong;

-- Đối chiếu tổng tiết chuẩn từng khối — phải ra 27 · 27 · 28 · 30 · 30
select k.khoi,
       sum(coalesce((m.tiet_chuan ->> k.khoi::text)::int, 0)) as tong_tiet
from mon_hoc m
cross join (select generate_series(1,5) as khoi) k
group by k.khoi
order by k.khoi;


-- ############################################################
-- ###  cong-bo.sql
-- ############################################################

-- ============================================================
-- CHO PHÉP CÔNG BỐ THỜI KHÓA BIỂU
-- ------------------------------------------------------------
-- Chạy MỘT LẦN trong SQL Editor.
--
-- VÌ SAO CẦN
--   Quy tắc đọc trong db/schema.sql viết:
--       using (truong_id = truong_cua_toi() and (cong_bo or la_quan_ly()))
--   Giáo viên CHỈ đọc được phiên bản đã công bố. Cột cong_bo mặc định
--   là false, mà bảng tkb_phien_ban lại chỉ có quy tắc THÊM, không có
--   quy tắc SỬA — nên không ai bật cong_bo lên được.
--   Kết quả: quản trị xếp xong, lưu xong, mà giáo viên đăng nhập vào
--   vẫn thấy "Chưa có thời khóa biểu".
--
--   Ý tưởng ban đầu vẫn đúng: nhà trường chốt rồi mới cho thầy cô xem,
--   không để họ thấy bản đang xếp dở. Chỉ thiếu cái cửa để chốt.
-- ============================================================

drop policy if exists p_tkb_sua on tkb_phien_ban;
create policy p_tkb_sua on tkb_phien_ban for update
  using      (truong_id = truong_cua_toi() and la_quan_ly())
  with check (truong_id = truong_cua_toi() and la_quan_ly());

-- ---------- Kiểm tra ----------
-- Phải ra 3 dòng: p_tkb_doc (SELECT) · p_tkb_ghi (INSERT) · p_tkb_sua (UPDATE)
select policyname as ten_quy_tac, cmd as ap_dung_cho
from pg_policies
where tablename = 'tkb_phien_ban'
order by cmd;

-- ============================================================
-- SAU KHI CHẠY
-- ------------------------------------------------------------
-- Vào phần mềm → Xếp thời khóa biểu → nút "Công bố cho giáo viên".
-- Từ lúc đó thầy cô đăng nhập là thấy lịch của mình.
--
-- Muốn tạm rút lại (ví dụ đang sửa dở giữa năm) thì bấm lại nút đó
-- để bỏ công bố — giáo viên quay về màn hình "Chưa có thời khóa biểu",
-- còn quản trị vẫn xem và sửa bình thường.
-- ============================================================


-- ############################################################
-- ###  day-thay.sql
-- ############################################################

-- ============================================================
-- DẠY THAY / DẠY BÙ — phân công theo NGÀY cụ thể
-- Chạy MỘT LẦN trong Supabase SQL Editor (đã gộp trong db/cai-dat.sql).
--
-- Vì sao là bảng riêng, không nhét vào thời khóa biểu tuần:
--   TKB tuần là khuôn lặp lại, lưu blob một dòng theo phiên bản.
--   Dạy thay là việc ĐỘT XUẤT của một ngày cụ thể — cô A ốm sáng thứ
--   Ba 15/9 — không được phép sửa vào khuôn tuần. Mỗi dòng dưới đây
--   là một tiết của một ngày có người dạy thay (hoặc ghi nhận lớp
--   tự quản khi gv_thay_id để trống).
--
-- Cần chạy db/schema.sql trước (dùng lại truong_cua_toi, la_quan_ly).
-- ============================================================

create table if not exists day_thay (
  id            uuid primary key default gen_random_uuid(),
  truong_id     uuid not null references truong(id) on delete cascade,
  ngay          date not null,
  buoi          buoi_t not null,
  tiet          smallint not null check (tiet between 0 and 7),  -- chỉ số 0-based, khớp khoá ô "thu-buoi-tiet"
  lop_id        uuid not null references lop(id) on delete cascade,
  mon           text not null,
  gv_vang_id    uuid not null references giao_vien(id) on delete cascade,
  gv_thay_id    uuid references giao_vien(id) on delete set null, -- trống = lớp tự quản / nghỉ tiết
  ghi_chu       text,
  nguoi_tao     uuid references nguoi_dung(id) on delete set null,
  tao_luc       timestamptz not null default now(),
  unique (truong_id, ngay, buoi, tiet, lop_id)
);

create index if not exists ix_dt_truong_ngay on day_thay(truong_id, ngay desc);
create index if not exists ix_dt_gv_thay     on day_thay(gv_thay_id);

-- Cả trường đọc được (giáo viên phải thấy tiết mình dạy thay),
-- chỉ cán bộ quản lý thêm/sửa/xoá — đúng khuôn các bảng nguồn.
alter table day_thay enable row level security;
drop policy if exists p_day_thay_doc on day_thay;
create policy p_day_thay_doc on day_thay for select
  using (truong_id = truong_cua_toi());
drop policy if exists p_day_thay_sua on day_thay;
create policy p_day_thay_sua on day_thay for all
  using      (truong_id = truong_cua_toi() and la_quan_ly())
  with check (truong_id = truong_cua_toi() and la_quan_ly());

-- ---------- Kiểm tra ----------
-- Phải ra 2 dòng quy tắc: p_day_thay_doc (SELECT) · p_day_thay_sua (ALL)
select policyname as ten_quy_tac, cmd as ap_dung_cho
from pg_policies where tablename = 'day_thay' order by cmd;


-- ############################################################
-- ###  dang-ky-truong.sql
-- ############################################################

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

