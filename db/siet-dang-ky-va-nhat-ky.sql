-- ============================================================
--  HAI VIỆC BẢO MẬT CÒN LẠI  (29/8/2026)
--
--  1. Chặn một người mở nhiều Gmail để gửi hàng loạt đơn đăng ký rác.
--  2. Siết quyền ghi nhật ký: chỉ ghi được dòng mang tên CHÍNH MÌNH.
--
--  Hai việc độc lập nhau, gộp một tệp cho đỡ phải chạy hai lần.
--  Chạy MỘT LẦN trong SQL Editor. Chạy lại nhiều lần cũng không sao.
-- ============================================================


-- ------------------------------------------------------------
-- 1. ĐƠN ĐĂNG KÝ RÁC
--
--  ⚠️ ĐỪNG LÀM LẠI THỨ ĐÃ CÓ. dang_ky_truong() từ đầu đã chặn hai đường:
--     · một tài khoản chỉ vào được một trường;
--     · trùng tên trường trong cùng một xã.
--  Chỗ hở thật là MỘT NGƯỜI MỞ NHIỀU GMAIL — mỗi cái một trường rác, và
--  chủ hệ thống phải ngồi dọn tay từng đơn.
--
--  Đầu mối rẻ nhất để nhận ra cùng một người: SỐ ĐIỆN THOẠI. Nó đã bắt
--  buộc, đã được chuẩn hoá về chữ số trong v_dt, và người gửi đơn thật
--  thì không có lý do gì khai số giả — đó là đầu mối duy nhất để nhà
--  trường được gọi lại khi cần xác minh.
--
--  Ngưỡng 3: một xã sáp nhập có thể có vài trường cùng một người phụ
--  trách nộp đơn hộ, nên 1 là quá chặt. Nhưng chỉ đếm đơn CHỜ DUYỆT —
--  đơn đã duyệt rồi thì không tính, người dùng thật không bao giờ chạm
--  trần này. Kẻ gửi rác thì chạm ngay ở đơn thứ tư.
--
--  Không cần bảng mới, không cần tiến trình nền.
-- ------------------------------------------------------------
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
  v_cho    int;
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

  -- ⚠️ MỚI 29/8/2026 — quá nhiều đơn CHỜ DUYỆT cùng một số điện thoại.
  -- Câu từ chối cố ý nói rõ phải làm gì tiếp, chứ không chỉ đuổi về: người
  -- gửi đơn thật mà chạm trần này thì đang có việc cần người xử lý.
  select count(*) into v_cho
  from truong
  where trang_thai_duyet = 'cho_duyet'
    and regexp_replace(coalesce(dien_thoai,''), '[^0-9]', '', 'g') = v_dt;

  if v_cho >= 3 then
    return query select false, null::uuid,
      ('Số điện thoại này đang có ' || v_cho || ' đơn chờ duyệt. '
       || 'Chờ duyệt xong rồi gửi tiếp, hoặc liên hệ người quản trị hệ thống.')::text;
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
  values (v_truong, 'Phân hiệu chính', true, 0);

  return query select true, v_truong,
    'Đã nhận đơn. Người quản trị hệ thống sẽ duyệt và cấp mã trường.'::text;
end;
$$;

revoke all on function dang_ky_truong(text,text,text,text,text,text,text) from public, anon;
grant execute on function dang_ky_truong(text,text,text,text,text,text,text) to authenticated;


-- ------------------------------------------------------------
-- 2. NHẬT KÝ — chỉ ghi được dòng mang tên CHÍNH MÌNH
--
--  p_nk_ghi cũ chỉ đòi truong_id = truong_cua_toi(), nên một tài khoản
--  giáo viên bơm được vô số dòng, hoặc tệ hơn: ghi dòng mang tên người
--  khác. Mà nhật ký chính là thứ được đem ra đối chiếu khi có tranh cãi
--  "ai xoá mất dữ liệu" — một bảng ai cũng viết hộ được thì không còn
--  giá trị làm chứng nào.
--
--  ghiNhatKy() bên ứng dụng vốn đã gửi đúng id của chính người đang đăng
--  nhập, nên siết lại KHÔNG phá luồng nào.
--
--  ⚠️ Sau khi chạy, nhớ `npm run soat`: bảng nhat_ky phải CÒN quy tắc
--  INSERT. Mất nó thì mọi lệnh ghi nhật ký lặng lẽ sửa 0 dòng — đúng cái
--  bẫy "PostgREST trả thành công cho lệnh đổi 0 dòng" đã cắn hai lần.
-- ------------------------------------------------------------
drop policy if exists p_nk_ghi on nhat_ky;
create policy p_nk_ghi on nhat_ky for insert
  with check (truong_id = truong_cua_toi() and nguoi_dung_id = auth.uid());


-- ------------------------------------------------------------
-- 3. Kiểm lại
-- ------------------------------------------------------------
-- Phải ra đúng một dòng, cột with_check chứa cả truong_cua_toi() lẫn auth.uid()
select policyname, cmd, with_check
from pg_policies
where schemaname = 'public' and tablename = 'nhat_ky' and cmd = 'INSERT';

-- Số đơn chờ duyệt theo từng số điện thoại — số nào ≥ 3 là đáng nhìn kỹ:
select regexp_replace(coalesce(dien_thoai,''), '[^0-9]', '', 'g') as dien_thoai,
       count(*) as don_cho_duyet
from truong
where trang_thai_duyet = 'cho_duyet'
group by 1
order by 2 desc;
