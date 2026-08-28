-- ===================================================================
-- GMAIL CỦA GIÁO VIÊN — vào trường KHÔNG cần mã mời   (28/8/2026)
-- Chạy MỘT LẦN trong SQL Editor. Chạy lại nhiều lần vẫn an toàn.
-- -------------------------------------------------------------------
-- Đề xuất của chủ dự án: *"tại nút Giáo viên cần có thêm cột gmail để
-- khỏi phải mời nữa"*. Hiện phát quyền cho 35 thầy cô là: tạo mã mời 6
-- chữ cái → gửi Zalo từng người → thầy cô đăng nhập Google → gõ mã. Bốn
-- bước, nhân 35 người, và mã thì hết hạn.
--
-- Nay nhà trường khai sẵn Gmail ngay trong bảng Giáo viên (gõ tay hoặc
-- nhập một trang Excel). Thầy cô bấm *Đăng nhập bằng Google* bằng đúng
-- địa chỉ ấy là vào thẳng lớp của mình — không mã, không chờ ai duyệt.
--
-- ⚠️ VÌ SAO PHẢI LÀ RPC, KHÔNG PHẢI TẠO SẴN `nguoi_dung`.
-- `nguoi_dung.id` CHÍNH LÀ `auth.uid()` do GoTrue cấp lúc đăng nhập lần
-- đầu. Một Gmail chưa từng đăng nhập thì chưa có uid nào, nên không thể
-- tạo sẵn dòng `nguoi_dung` cho nó. Cách duy nhất là để người ấy đăng
-- nhập trước (lúc đó có uid), rồi một hàm `security definer` đối chiếu
-- địa chỉ thư trong vé đăng nhập với danh sách nhà trường đã khai.
-- ===================================================================

-- 1) Hai cột mới. `email` là địa chỉ nhà trường khai TRƯỚC cho thầy cô;
--    đừng nhầm với `nguoi_dung.email`, thứ GoTrue ghi SAU khi đăng nhập.
alter table giao_vien add column if not exists email    text;
alter table giao_vien add column if not exists ghi_chu  text;

-- Một địa chỉ chỉ được trỏ về MỘT hồ sơ trong cùng một trường: hai hồ sơ
-- cùng Gmail thì lúc đăng nhập máy không biết mở lịch của ai. Đúng bài học
-- sự cố 2/8/2026 — cô giáo vào được app, thấy đúng tên mình, màn hình trắng,
-- vì mã mời nối nhầm vào hồ sơ trùng tên 0 tiết.
-- Chỉ số PARTIAL: hồ sơ chưa khai Gmail thì để null thoải mái.
create unique index if not exists ux_giao_vien_email
  on giao_vien (truong_id, lower(email))
  where email is not null and email <> '';

-- 2) Tự nhận mình bằng Gmail đã được nhà trường khai.
--    Gọi khi tài khoản đăng nhập xong mà chưa thuộc trường nào (`moCoi`).
--
-- ⚠️ `security definer` và TỰ KIỂM QUYỀN — cùng khuôn `duyet_truong()` và
--    `don_du_lieu_cu()`. Hàm này ghi vào `nguoi_dung`, bảng mà người gọi
--    (lúc ấy còn là tài khoản mồ côi) chưa có quyền ghi. Ba chốt chặn:
--      · địa chỉ lấy từ VÉ ĐĂNG NHẬP (`auth.jwt()`), KHÔNG nhận tham số —
--        nhận tham số là ai cũng tự khai mình là người khác;
--      · chỉ nhận hồ sơ CHƯA nối tài khoản nào (`nguoi_dung_id is null`);
--      · trường phải đang `dang_dung`, không thì người của một trường chờ
--        duyệt lại lọt vào trước cả hiệu trưởng của họ.
create or replace function vao_bang_gmail()
returns table (ok boolean, thong_bao text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_mail  text := lower(nullif(trim(auth.jwt() ->> 'email'), ''));
  v_gv    giao_vien%rowtype;
  v_ten   text;
begin
  if v_uid is null or v_mail is null then
    return query select false, 'Đăng nhập trước rồi mới nhận quyền được.'::text;
    return;
  end if;

  -- Đã thuộc một trường rồi thì không đụng vào nữa
  if exists (select 1 from nguoi_dung where id = v_uid) then
    return query select false, 'Tài khoản này đã thuộc một trường.'::text;
    return;
  end if;

  select g.* into v_gv
  from giao_vien g
  join truong t on t.id = g.truong_id
  where lower(g.email) = v_mail
    and g.nguoi_dung_id is null
    and coalesce(t.trang_thai_duyet, 'dang_dung') = 'dang_dung'
  limit 1;

  if not found then
    return query select false,
      ('Chưa có trường nào khai địa chỉ ' || v_mail ||
       ' trong danh sách giáo viên. Nhờ người quản trị thêm Gmail của thầy cô '
       || 'vào mục Giáo viên, hoặc xin một mã mời.')::text;
    return;
  end if;

  select ten into v_ten from truong where id = v_gv.truong_id;

  insert into nguoi_dung (id, truong_id, ho_ten, email, vai_tro)
  values (v_uid, v_gv.truong_id, v_gv.ho_ten, v_mail, 'giao_vien');

  update giao_vien set nguoi_dung_id = v_uid where id = v_gv.id;

  insert into nhat_ky (truong_id, nguoi_dung_id, hanh_dong, du_lieu_cu)
  values (v_gv.truong_id, v_uid, 'vao_bang_gmail',
          jsonb_build_object('email', v_mail, 'giao_vien_id', v_gv.id));

  return query select true, ('Đã vào ' || coalesce(v_ten, 'trường') || '.')::text;
end $$;

revoke all on function vao_bang_gmail() from public;
grant execute on function vao_bang_gmail() to authenticated;

-- 3) Cột `email` của giao_vien là cột QUYẾT ĐỊNH QUYỀN: ai sửa được nó thì
--    tự trỏ Gmail của mình vào một hồ sơ rồi đăng nhập vào trường người
--    khác. Quy tắc `p_gv_sua` vốn chỉ cho quản lý CÙNG TRƯỜNG ghi, nên
--    ranh giới giữa các trường vẫn kín; chỗ hở là *trong* một trường thì
--    một PHT đổi Gmail hồ sơ đồng nghiệp. Đó là việc quản trị bình thường
--    (nhà trường cấp quyền cho nhà trường), nên KHÔNG dựng trigger — chỉ
--    khai ra để `npm run soat` biết là đã cân nhắc.
-- KHONG-CANH: giao_vien.email — chỉ quản lý cùng trường sửa được (p_gv_sua),
--   và cấp quyền cho giáo viên trong trường mình vốn là việc của họ. Ranh
--   giới giữa các trường do truong_id giữ, không phải cột này.
