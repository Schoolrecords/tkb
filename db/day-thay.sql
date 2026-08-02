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
