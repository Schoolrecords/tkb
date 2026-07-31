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
