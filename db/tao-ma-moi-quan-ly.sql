-- ============================================================
--  TẠO MÃ MỜI CHO CÁN BỘ QUẢN LÝ  (30/8/2026)
--
--  Hộp *Mã mời* trong app chỉ tạo được hai loại: giáo viên, hoặc phó hiệu
--  trưởng KHÔNG gắn hồ sơ giáo viên. Hai thứ nhà trường cần mà nó chưa làm
--  được: vai **hiệu trưởng**, và một cán bộ quản lý **vừa có hồ sơ giáo
--  viên** (PHT phụ trách phân hiệu gần như luôn còn đứng lớp).
--
--  Máy chủ thì đã sẵn sàng từ đầu: `dung_ma_moi()` nhận cả ba thứ cùng lúc
--  — `vai_tro`, `diem_truong_id`, `giao_vien_id`. Tệp này đi thẳng vào bảng
--  `ma_moi` trong khi giao diện chưa theo kịp.
--
--  ⚠️ ĐỪNG ĐIỀN GMAIL CỦA HAI NGƯỜI NÀY VÀO CỘT GMAIL Ở BẢNG GIÁO VIÊN cho
--  tới khi họ dùng xong mã. Hai đường vào cạnh tranh nhau: nếu Gmail đã khai
--  ở đó thì lúc họ bấm *Đăng nhập bằng Google*, `vao_bang_gmail()` nối họ
--  làm **giáo viên** trước, và mã mời quản lý thành vô dụng —
--  `dung_ma_moi()` từ chối: *"Tài khoản này đã thuộc một trường rồi."*
--  Tệp này KIỂM và dừng nếu thấy Gmail đã khai.
--
--  Sửa bốn dòng KHAI BÁO bên dưới rồi chạy. Kết quả: bảng mã ở cuối.
-- ============================================================

-- ---------- 0. Đúng dự án chưa? ----------
do $$
begin
  if to_regclass('public.ma_moi') is null then
    raise exception 'Không thấy bảng ma_moi — sai dự án Supabase, hoặc chưa chạy db/ma-moi.sql.';
  end if;
end $$;

-- ---------- Hàm phụ: gợi ý tên gần giống ----------
--  ⚠️ "Hòa" và "Hoà" là hai cách bỏ dấu khác nhau của cùng một tên, nên so
--  khớp đủ họ tên rất dễ trượt. Khi trượt thì đừng chỉ báo "không thấy" —
--  bày ra những người có cùng TÊN GỌI (từ cuối) để người dùng chép lại đúng.
create or replace function ten_gan(p_truong uuid, p_ten text)
returns text language sql stable as $ff$
  select string_agg(ho_ten, ' · ' order by ho_ten)
  from giao_vien
  where truong_id = p_truong
    and ho_ten ilike '%' || split_part(btrim(p_ten), ' ',
          array_length(string_to_array(btrim(p_ten), ' '), 1)) || '%'
$ff$;

do $$
declare
  -- ============ KHAI BÁO — sửa ở đây ============
  c_ma_truong  text := 'THDL';                    -- trường nào
  c_ht_ten     text := 'Trần Thị Liên';           -- hiệu trưởng: họ tên ĐỦ, đúng như trong bảng Giáo viên
  c_ht_gmail   text := 'Tranthilien.dc@gmail.com';-- chỉ để KIỂM xung đột, không ghi vào đâu cả
  c_pht_ten    text := 'Nguyễn Thị Hòa';          -- phó hiệu trưởng
  c_pht_gmail  text := null;                      -- chưa biết thì để null
  c_pht_dt     text := 'Diễn Thái';               -- phân hiệu vị PHT ấy phụ trách
  -- ==============================================
  v_t uuid; v_dt uuid; v_ht uuid; v_pht uuid; n int; v_tao uuid;
  v_ma_ht text; v_ma_pht text; v_goi_y text;
  -- Cùng bộ ký tự với `sinhMaMoi()` bên app: bỏ 0·O và 1·I·L cho khỏi đọc nhầm.
  BO text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
begin
  select id into v_t from truong where ma_truong = c_ma_truong;
  if v_t is null then raise exception 'Không thấy trường mã %.', c_ma_truong; end if;

  -- ---------- Phân hiệu của vị PHT ----------
  select count(*) into n from diem_truong where truong_id = v_t and ten ilike '%'||c_pht_dt||'%';
  if n <> 1 then
    raise exception 'Tìm "%" ra % phân hiệu — cần đúng 1. Ghi rõ hơn ở c_pht_dt.', c_pht_dt, n;
  end if;
  select id into v_dt from diem_truong where truong_id = v_t and ten ilike '%'||c_pht_dt||'%';

  -- ---------- Hồ sơ giáo viên: 0 thì thôi, >1 thì DỪNG ----------
  --  ⚠️ Trường này có bốn cặp trùng tên gọi; đoán bừa là gắn quyền hiệu
  --  trưởng vào nhầm người. Trùng thì dừng, để người biết việc chọn tay.
  select count(*) into n from giao_vien where truong_id = v_t and ho_ten = c_ht_ten;
  if n > 1 then raise exception 'Có % hồ sơ tên "%" — dừng, không đoán.', n, c_ht_ten; end if;
  select id into v_ht from giao_vien where truong_id = v_t and ho_ten = c_ht_ten;
  if v_ht is null then
    raise notice 'Không có hồ sơ giáo viên tên "%" — mã vẫn tạo, chỉ là tên hiển thị lấy từ địa chỉ thư. Tên gần giống: %',
      c_ht_ten, coalesce(ten_gan(v_t, c_ht_ten), '(không có)');
  end if;

  select count(*) into n from giao_vien where truong_id = v_t and ho_ten = c_pht_ten;
  if n > 1 then raise exception 'Có % hồ sơ tên "%" — dừng, không đoán.', n, c_pht_ten; end if;
  select id into v_pht from giao_vien where truong_id = v_t and ho_ten = c_pht_ten;
  if v_pht is null then
    raise exception 'Không thấy hồ sơ giáo viên tên "%" trong trường %. Tên gần giống trong bảng: % — chép đúng một cái vào c_pht_ten rồi chạy lại.',
      c_pht_ten, c_ma_truong, coalesce(ten_gan(v_t, c_pht_ten), '(không có tên nào gần giống)');
  end if;

  -- ---------- Chốt chặn: Gmail đã khai ở bảng Giáo viên thì DỪNG ----------
  if exists (select 1 from giao_vien where truong_id = v_t
               and lower(email) in (lower(coalesce(c_ht_gmail,'~')), lower(coalesce(c_pht_gmail,'~')))) then
    raise exception 'Gmail của một trong hai người đã khai ở bảng Giáo viên. Xoá ô Gmail ấy đi rồi chạy lại — không thì họ đăng nhập Google sẽ vào với vai GIÁO VIÊN và mã mời quản lý thành vô dụng.';
  end if;

  -- ---------- Đã có tài khoản rồi thì không phát mã nữa ----------
  if v_ht is not null and exists (select 1 from giao_vien where id = v_ht and nguoi_dung_id is not null) then
    raise exception '"%" đã nối tài khoản rồi — sửa vai trò trong mục Người dùng, đừng phát mã mới.', c_ht_ten;
  end if;
  if exists (select 1 from giao_vien where id = v_pht and nguoi_dung_id is not null) then
    raise exception '"%" đã nối tài khoản rồi — sửa vai trò trong mục Người dùng, đừng phát mã mới.', c_pht_ten;
  end if;

  select id into v_tao from nguoi_dung where truong_id = v_t and vai_tro = 'quan_tri' order by tao_luc limit 1;

  -- ---------- Sinh mã, chống trùng ----------
  loop
    select string_agg(substr(BO, 1 + floor(random()*length(BO))::int, 1), '')
      into v_ma_ht from generate_series(1,6);
    exit when not exists (select 1 from ma_moi where ma = v_ma_ht);
  end loop;
  loop
    select string_agg(substr(BO, 1 + floor(random()*length(BO))::int, 1), '')
      into v_ma_pht from generate_series(1,6);
    exit when v_ma_pht <> v_ma_ht and not exists (select 1 from ma_moi where ma = v_ma_pht);
  end loop;

  insert into ma_moi (truong_id, ma, vai_tro, giao_vien_id, diem_truong_id, nguoi_tao)
  values (v_t, v_ma_ht,  'hieu_truong',     v_ht,  null,  v_tao),
         (v_t, v_ma_pht, 'pho_hieu_truong', v_pht, v_dt,  v_tao);

  raise notice 'Đã tạo 2 mã. Hiệu trưởng: %  ·  Phó hiệu trưởng: %', v_ma_ht, v_ma_pht;
end $$;

-- ---------- Bảng mã để gửi đi ----------
select m.ma,
       case m.vai_tro when 'hieu_truong' then 'Hiệu trưởng'
                      when 'pho_hieu_truong' then 'Phó hiệu trưởng'
                      else m.vai_tro::text end          as vai_tro,
       coalesce(g.ho_ten, '(chưa gắn hồ sơ giáo viên)')  as cho_ai,
       coalesce(d.ten, 'Toàn trường')                    as phu_trach,
       to_char(m.het_han at time zone 'Asia/Bangkok', 'HH24:MI DD/MM/YYYY') as han_dung,
       case when m.dung_luc is null then 'Chưa dùng' else 'Đã dùng' end     as tinh_trang
from ma_moi m
join truong t          on t.id = m.truong_id
left join giao_vien g  on g.id = m.giao_vien_id
left join diem_truong d on d.id = m.diem_truong_id
where t.ma_truong = 'THDL' and m.vai_tro <> 'giao_vien'
order by m.tao_luc desc;

-- Hàm phụ chỉ phục vụ lần chạy này, dọn đi cho sạch lược đồ.
drop function if exists ten_gan(uuid, text);
