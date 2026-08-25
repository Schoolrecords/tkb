-- ============================================================
-- DUYỆT ĐĂNG KÝ TRƯỜNG  ·  24/8/2026
-- ------------------------------------------------------------
-- Dán cả tệp vào Supabase → SQL Editor rồi Run. Chạy được nhiều lần.
--
-- VÌ SAO CẦN
--   Tới hôm nay, cửa đăng ký mở cho bất kỳ ai có tài khoản Google:
--   đăng ký xong là dùng được ngay, và chủ dự án KHÔNG hay biết —
--   `dang_ky_truong()` chỉ ghi vào cơ sở dữ liệu rồi dừng, không gửi
--   thư, không ghi nhật ký, không gọi webhook nào. Quy tắc RLS
--   `p_truong_doc` lại chỉ cho đọc trường của chính mình, nên kể cả
--   mở app lên cũng không có màn hình nào bày ra danh sách.
--
--   Chủ dự án chốt 24/8/2026: cửa vẫn MỞ cho ai cũng gửi được đơn,
--   nhưng phải **được duyệt** mới dùng được, và người duyệt phải
--   thấy được toàn bộ danh sách trong app.
--
-- BỐN THỨ TỆP NÀY DỰNG
--   1. Trạng thái `cho_duyet | dang_dung | tu_choi` trên bảng truong
--   2. Vai CHỦ HỆ THỐNG — đọc được mọi trường, và chỉ người đó duyệt
--   3. dang_ky_truong() ghi thêm điện thoại + email, để trạng thái chờ
--   4. duyet_truong() cấp MÃ TRƯỜNG 5 CHỮ SỐ khi đồng ý
--
-- ⚠️ ĐIỀU QUAN TRỌNG NHẤT CỦA TỆP NÀY
--   Cột `trang_thai_duyet` mặc định `'dang_dung'`, KHÔNG phải `'cho_duyet'`.
--   Trường đang chạy thật — Diễn Liên, 25 lớp, 710 tiết, phiên bản 9 đã
--   công bố — mà bị đặt về "chờ duyệt" thì sáng mai cả trường mở app
--   lên không vào được. Nâng cấp phần mềm không bao giờ được làm một
--   trường đang chạy tốt bỗng hỏng. Bước 1 vì thế đặt default trước,
--   rồi mới thêm ràng buộc.
-- ============================================================


-- ------------------------------------------------------------
-- 1. TRẠNG THÁI DUYỆT VÀ ĐẦU MỐI LIÊN HỆ CỦA TRƯỜNG
-- ------------------------------------------------------------
alter table truong add column if not exists trang_thai_duyet     text;
alter table truong add column if not exists dien_thoai     text;
alter table truong add column if not exists email_lien_he  text;
alter table truong add column if not exists duyet_luc      timestamptz;
alter table truong add column if not exists duyet_boi      uuid;
alter table truong add column if not exists ghi_chu_duyet  text;

-- Mọi trường ĐÃ CÓ đều là trường đang dùng thật. Chạy trước khi đặt
-- ràng buộc, không thì dòng cũ có trang_thai_duyet null làm hỏng lệnh.
update truong set trang_thai_duyet = 'dang_dung' where trang_thai_duyet is null;

alter table truong alter column trang_thai_duyet set default 'dang_dung';
alter table truong alter column trang_thai_duyet set not null;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'truong_trang_thai_duyet_ok') then
    alter table truong add constraint truong_trang_thai_duyet_ok
      check (trang_thai_duyet in ('cho_duyet','dang_dung','tu_choi'));
  end if;
end $$;

-- Mã trường được CẤP lúc duyệt nên lúc đăng ký còn trống. Cột vốn đã
-- unique; chỉ cần bỏ ràng buộc not null nếu có.
alter table truong alter column ma_truong drop not null;

create index if not exists ix_truong_trang_thai on truong(trang_thai_duyet, tao_luc desc);


-- ------------------------------------------------------------
-- 2. VAI CHỦ HỆ THỐNG
-- ------------------------------------------------------------
-- Không thêm giá trị vào enum `vai_tro_t`: vai trò trong enum ấy là vai
-- trò TRONG MỘT TRƯỜNG (quản trị, hiệu trưởng, PHT, giáo viên), còn đây
-- là vai đứng NGOÀI mọi trường. Nhét chung vào enum thì mọi câu lệnh so
-- vai trò đều phải nhớ loại trừ nó — sớm muộn có chỗ quên.
alter table nguoi_dung add column if not exists la_chu_he_thong boolean not null default false;

create or replace function la_chu_he_thong()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((select la_chu_he_thong from nguoi_dung where id = auth.uid()), false);
$$;

-- ⚠️ CHỦ DỰ ÁN PHẢI TỰ ĐẶT MÌNH LÀM CHỦ HỆ THỐNG, một lần, bằng tay.
--    Không đặt sẵn trong tệp này vì mã nguồn là kho công khai — viết
--    thẳng địa chỉ Gmail vào đây là bày nó ra cho cả thiên hạ.
--    Chạy đúng một dòng dưới đây trong SQL Editor, thay bằng Gmail thật:
--
--      update nguoi_dung set la_chu_he_thong = true
--      where email = 'dia-chi-gmail-cua-thay@gmail.com';
--
--    Soi lại: select ho_ten, email from nguoi_dung where la_chu_he_thong;


-- ------------------------------------------------------------
-- 3. QUY TẮC ĐỌC VÀ GHI
-- ------------------------------------------------------------
-- Chủ hệ thống đọc được MỌI trường; ai khác vẫn chỉ thấy trường mình.
drop policy if exists p_truong_doc on truong;
create policy p_truong_doc on truong for select
  using (id = truong_cua_toi() or la_chu_he_thong());

-- Sửa thông tin trường: quản lý sửa trường mình, chủ hệ thống sửa mọi
-- trường (để duyệt). Giữ nguyên tinh thần bản cũ, chỉ mở thêm một cửa.
drop policy if exists p_truong_sua on truong;
create policy p_truong_sua on truong for update
  using      (la_chu_he_thong() or (id = truong_cua_toi() and la_quan_ly()))
  with check (la_chu_he_thong() or (id = truong_cua_toi() and la_quan_ly()));

-- Chủ hệ thống đọc được hồ sơ người dùng của mọi trường — cần để bày ra
-- ai là người đăng ký. KHÔNG mở đường GHI: duyệt là việc của hàm riêng.
drop policy if exists p_nd_doc_he_thong on nguoi_dung;
create policy p_nd_doc_he_thong on nguoi_dung for select using (la_chu_he_thong());


-- ------------------------------------------------------------
-- 4. SINH MÃ TRƯỜNG 5 CHỮ SỐ
-- ------------------------------------------------------------
-- Chủ dự án chốt: mã trường là 5 CHỮ SỐ. Khác hẳn mã mời giáo viên
-- (6 chữ cái) nên nhìn là biết ngay đang cầm mã gì — hai thứ ấy ở hai
-- tầng khác nhau và trước nay rất dễ lẫn.
--
-- 10000–99999 là 90.000 mã. Dò lại tối đa 200 lần rồi mới chịu thua,
-- chứ không lặp vô hạn: hết mã mà treo cả giao dịch là kiểu hỏng tệ nhất.
create or replace function sinh_ma_truong()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare v_ma text; i int := 0;
begin
  loop
    v_ma := lpad((10000 + floor(random() * 90000))::int::text, 5, '0');
    exit when not exists (select 1 from truong where ma_truong = v_ma);
    i := i + 1;
    if i > 200 then
      raise exception 'Không sinh được mã trường mới sau 200 lần thử.';
    end if;
  end loop;
  return v_ma;
end $$;


-- ------------------------------------------------------------
-- 5. ĐĂNG KÝ — nay là GỬI ĐƠN, chưa dùng được ngay
-- ------------------------------------------------------------
-- Bản cũ nhận p_ma_truong do người đăng ký tự đặt. Nay mã do hệ thống
-- CẤP lúc duyệt, nên tham số ấy bỏ hẳn và thay bằng điện thoại + email.
-- Bản cũ 6 tham số bị drop để PostgREST không phải chọn giữa hai bản.
drop function if exists dang_ky_truong(text,text,text,text,text,text);

create or replace function dang_ky_truong(
  p_ten        text,
  p_ho_ten     text,
  p_dien_thoai text,
  p_email      text default null,
  p_tinh       text default null,
  p_xa         text default null,
  p_nam_hoc    text default '2026-2027'
)
returns table (ok boolean, truong_id uuid, thong_bao text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_truong uuid;
  v_dt     text := regexp_replace(coalesce(p_dien_thoai,''), '[^0-9]', '', 'g');
  v_mail   text := lower(trim(coalesce(p_email,'')));
begin
  if v_uid is null then
    return query select false, null::uuid, 'Chưa đăng nhập.'::text; return;
  end if;

  if exists (select 1 from nguoi_dung where id = v_uid) then
    return query select false, null::uuid,
      'Tài khoản này đã thuộc một trường rồi. Mỗi tài khoản chỉ vào được một trường.'::text;
    return;
  end if;

  if length(coalesce(trim(p_ten),'')) < 6 then
    return query select false, null::uuid, 'Tên trường quá ngắn.'::text; return;
  end if;
  if length(coalesce(trim(p_ho_ten),'')) < 3 then
    return query select false, null::uuid, 'Thiếu họ tên người đăng ký.'::text; return;
  end if;
  -- Số điện thoại là ĐẦU MỐI DUY NHẤT để gọi lại khi cần xác minh, nên
  -- bắt buộc. Việt Nam: 10 số, hoặc 11 số nếu ghi kèm mã quốc gia 84.
  if length(v_dt) < 9 or length(v_dt) > 12 then
    return query select false, null::uuid,
      'Số điện thoại chưa đúng — ghi 10 chữ số, ví dụ 0912345678.'::text; return;
  end if;
  if v_mail <> '' and v_mail !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    return query select false, null::uuid, 'Địa chỉ Gmail chưa đúng.'::text; return;
  end if;

  -- Trùng tên trường trong cùng một xã thì gần như chắc là gửi hai lần.
  if exists (
    select 1 from truong
    where lower(trim(ten)) = lower(trim(p_ten))
      and coalesce(lower(trim(xa)),'') = coalesce(lower(trim(p_xa)),'')
  ) then
    return query select false, null::uuid,
      'Trường này đã có đơn trong hệ thống. Nếu chưa thấy hồi âm, liên hệ người quản trị.'::text;
    return;
  end if;

  -- Trường và hồ sơ quản trị trong CÙNG một giao dịch. Lỗi giữa chừng thì
  -- cả hai cùng bị huỷ, không để lại trường mồ côi.
  insert into truong (ten, ma_truong, tinh, xa, nam_hoc,
                      trang_thai_duyet, dien_thoai, email_lien_he)
  values (trim(p_ten), null,
          nullif(trim(coalesce(p_tinh,'')),''), nullif(trim(coalesce(p_xa,'')),''),
          coalesce(nullif(trim(p_nam_hoc),''),'2026-2027'),
          'cho_duyet', v_dt, nullif(v_mail,''))
  returning id into v_truong;

  -- NGƯỜI ĐẦU TIÊN ĐĂNG KÝ LÀ QUẢN TRỊ của trường đó — chủ dự án chốt.
  insert into nguoi_dung (id, truong_id, ho_ten, email, vai_tro)
  select v_uid, v_truong, trim(p_ho_ten),
         coalesce(nullif(v_mail,''), u.email), 'quan_tri'
  from auth.users u where u.id = v_uid;

  -- Khung giờ và điểm trường mặc định dựng luôn, để lúc được duyệt là
  -- trường vào khai dữ liệu được ngay, không phải chờ thêm bước nào.
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

  insert into diem_truong (truong_id, ten, co_phong_tin, thu_tu)
  values (v_truong, 'Điểm trường chính', true, 0);

  return query select true, v_truong,
    format('Đã gửi đơn đăng ký cho %s. Chờ người quản trị hệ thống duyệt và cấp mã trường.',
           trim(p_ten));
end $$;

revoke all on function dang_ky_truong(text,text,text,text,text,text,text) from public, anon;
grant execute on function dang_ky_truong(text,text,text,text,text,text,text) to authenticated;


-- ------------------------------------------------------------
-- 6. DUYỆT — chỉ chủ hệ thống, và CẤP MÃ khi đồng ý
-- ------------------------------------------------------------
create or replace function duyet_truong(
  p_truong  uuid,
  p_dong_y  boolean,
  p_ghi_chu text default null
)
returns table (ok boolean, ma_truong text, thong_bao text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ma  text;
  v_ten text;
  v_tt  text;
begin
  -- ⚠️ security definer thì PHẢI tự kiểm quyền ở dòng đầu. Hàm này bỏ qua
  -- RLS, nên thiếu dòng dưới là bất kỳ ai đăng nhập cũng tự duyệt được
  -- trường của mình — đúng thứ tệp này sinh ra để ngăn.
  if not la_chu_he_thong() then
    return query select false, null::text,
      'Chỉ người quản trị hệ thống mới duyệt được đăng ký.'::text; return;
  end if;

  -- ⚠️ Mọi cột trong thân hàm đều phải mang bí danh bảng (t.…): hàm khai
  -- RETURNS TABLE có cột `ma_truong`, mà plpgsql gặp tên vừa là cột bảng
  -- vừa là cột trả về thì từ chối chạy — "column reference is ambiguous".
  -- Đã nổ thật ngay lần duyệt trường đầu tiên (25/8/2026).
  select t.ten, t.trang_thai_duyet into v_ten, v_tt from truong t where t.id = p_truong;
  if v_ten is null then
    return query select false, null::text, 'Không tìm thấy trường.'::text; return;
  end if;

  if not p_dong_y then
    update truong set trang_thai_duyet = 'tu_choi', duyet_luc = now(),
                      duyet_boi = auth.uid(), ghi_chu_duyet = p_ghi_chu
    where id = p_truong;
    return query select true, null::text,
      format('Đã từ chối %s.', v_ten); return;
  end if;

  -- Duyệt lại một trường đã duyệt thì GIỮ NGUYÊN mã cũ. Cấp mã mới nghĩa
  -- là mọi giấy tờ nhà trường đã in ra thành sai.
  select t.ma_truong into v_ma from truong t where t.id = p_truong;
  if v_ma is null or v_ma !~ '^[0-9]{5}$' then
    v_ma := sinh_ma_truong();
  end if;

  update truong set trang_thai_duyet = 'dang_dung', ma_truong = v_ma, duyet_luc = now(),
                    duyet_boi = auth.uid(), ghi_chu_duyet = p_ghi_chu
  where id = p_truong;

  return query select true, v_ma,
    format('Đã duyệt %s. Mã trường: %s', v_ten, v_ma);
end $$;

revoke all on function duyet_truong(uuid, boolean, text) from public, anon;
grant execute on function duyet_truong(uuid, boolean, text) to authenticated;


-- ------------------------------------------------------------
-- 7. DANH SÁCH CHO MÀN HÌNH CHỦ HỆ THỐNG
-- ------------------------------------------------------------
-- Gói sẵn thành một lời gọi: màn hình cần mỗi trường một dòng kèm số
-- lớp, số giáo viên, số tài khoản. Để app tự ghép thì phải bốn lượt gọi
-- và một vòng lặp — vừa chậm vừa dễ lệch.
create or replace function ds_truong_he_thong()
returns table (
  id uuid, ten text, ma_truong text, trang_thai_duyet text,
  tinh text, xa text, nam_hoc text,
  dien_thoai text, email_lien_he text,
  nguoi_dang_ky text, email_dang_ky text,
  tao_luc timestamptz, duyet_luc timestamptz, ghi_chu_duyet text,
  so_tai_khoan bigint, so_lop bigint, so_giao_vien bigint, so_tiet bigint,
  phien_ban integer
)
language sql stable security definer
set search_path = public
as $$
  select
    t.id, t.ten, t.ma_truong, t.trang_thai_duyet,
    t.tinh, t.xa, t.nam_hoc,
    t.dien_thoai, t.email_lien_he,
    qt.ho_ten, qt.email,
    t.tao_luc, t.duyet_luc, t.ghi_chu_duyet,
    (select count(*) from nguoi_dung u where u.truong_id = t.id),
    (select count(*) from lop       l where l.truong_id = t.id),
    (select count(*) from giao_vien g where g.truong_id = t.id),
    (select coalesce(sum(p.so_tiet), 0) from phan_cong p where p.truong_id = t.id),
    (select max(v.version) from tkb_phien_ban v where v.truong_id = t.id)
  from truong t
  left join lateral (
    select n.ho_ten, n.email from nguoi_dung n
    where n.truong_id = t.id and n.vai_tro = 'quan_tri'
    order by n.tao_luc limit 1
  ) qt on true
  where la_chu_he_thong()          -- ⚠️ không có dòng này là lộ mọi trường
  order by
    case t.trang_thai_duyet when 'cho_duyet' then 0 when 'dang_dung' then 1 else 2 end,
    t.tao_luc desc;
$$;

revoke all on function ds_truong_he_thong() from public, anon;
grant execute on function ds_truong_he_thong() to authenticated;


-- ------------------------------------------------------------
-- 8. CHẶN THẬT Ở ĐƯỜNG GHI
-- ------------------------------------------------------------
-- Giấu màn hình đi chỉ là giao diện. Trường chưa được duyệt mà vẫn gọi
-- thẳng API thì phải bị máy chủ từ chối — nên chốt ngay trong luu_tkb().
-- Đặt ở đây chứ không sửa db/luu-pham-vi.sql: một tính năng một tệp,
-- chạy lại tệp nào cũng không đụng tệp kia.
create or replace function truong_duoc_dung()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    (select t.trang_thai_duyet = 'dang_dung' from truong t where t.id = truong_cua_toi()),
    false);
$$;

drop policy if exists p_tkb_ghi on tkb_phien_ban;
create policy p_tkb_ghi on tkb_phien_ban for insert
  with check (truong_id = truong_cua_toi() and la_quan_ly() and truong_duoc_dung());

notify pgrst, 'reload schema';


-- ------------------------------------------------------------
-- SOI LẠI SAU KHI CHẠY
-- ------------------------------------------------------------
select ten, coalesce(ma_truong,'—') as ma, trang_thai_duyet, tao_luc
from truong order by tao_luc desc;
