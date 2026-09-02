-- ============================================================
--  NÂNG MỘT TÀI KHOẢN LÊN VAI QUẢN TRỊ  (2/9/2026)
--
--  Cô Hoàng Thị Mai (maiht.c3nth@nghean.edu.vn) vào Trường tiểu học
--  Quảng Châu 1 bằng đường Gmail nên mang vai giáo viên. Vai trò không
--  sửa được trong app — đổi ở đây, một lần.
--
--  Trigger tg_chan_tu_nang_quyen bỏ qua khi auth.uid() là null (SQL
--  Editor), nên câu update dưới đây chạy được; từ app thì bị chặn.
--
--  ⚠️ Muốn nâng người khác thì sửa ĐỊA CHỈ ở dòng `email` trong khối 1.
-- ============================================================

-- ------------------------------------------------------------
--  0. Đúng dự án chưa?
-- ------------------------------------------------------------
do $$
begin
  if to_regclass('public.nguoi_dung') is null then
    raise exception
      'Cơ sở dữ liệu này không có bảng của phần mềm Thời khóa biểu. Nhiều khả năng SQL Editor đang mở NHẦM DỰ ÁN — thoát ra, chọn đúng dự án của trường rồi chạy lại.';
  end if;
end $$;

-- ------------------------------------------------------------
--  1. Nâng vai trò. diem_truong_id đặt trống = phụ trách toàn trường
--     (có giá trị là bị bó vào một phân hiệu, không xếp tự động được).
-- ------------------------------------------------------------
do $$
declare
  v_email text := 'maiht.c3nth@nghean.edu.vn';
  v_truong text;
  v_so int;
begin
  select t.ten into v_truong
    from nguoi_dung nd join truong t on t.id = nd.truong_id
   where lower(nd.email) = lower(v_email);

  if v_truong is null then
    raise exception 'Không có tài khoản % trong bảng nguoi_dung. Cô phải đăng nhập bằng Google một lần trước, rồi chạy lại.', v_email;
  end if;
  if v_truong not ilike '%Quảng Châu 1%' then
    raise exception 'Tài khoản % đang thuộc "%", không phải Quảng Châu 1 — dừng lại, không sửa.', v_email, v_truong;
  end if;

  update nguoi_dung
     set vai_tro        = 'quan_tri',
         diem_truong_id = null
   where lower(email) = lower(v_email);
  get diagnostics v_so = row_count;
  raise notice 'Đã đổi % dòng — % nay là quản trị của "%".', v_so, v_email, v_truong;
end $$;

-- ------------------------------------------------------------
--  2. Đối chiếu: phải thấy vai_tro = quan_tri, diem_truong_id trống
-- ------------------------------------------------------------
select nd.ho_ten, nd.email, nd.vai_tro, nd.diem_truong_id,
       t.ten                              as truong,
       gv.ho_ten                          as ho_so_giao_vien
  from nguoi_dung nd
  join truong t on t.id = nd.truong_id
  left join giao_vien gv on gv.nguoi_dung_id = nd.id
 where lower(nd.email) = 'maiht.c3nth@nghean.edu.vn';
