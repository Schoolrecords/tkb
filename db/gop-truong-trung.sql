-- ============================================================
--  GỘP HAI KHO "QUẢNG CHÂU 1"  (30/8/2026)
--
--  Cơ sở dữ liệu đang có HAI bản ghi trường tên gần như y hệt, khác nhau
--  đúng một chữ hoa — mỗi bên một kho dữ liệu, mỗi bên một tài khoản:
--
--    KHO A · mã THDL  · tạo 31/7 · chungtrt@gmail.com
--            25 lớp · 35 GV · 265 dòng phân công · 9 phiên bản · đã công bố
--    KHO B · mã 45407 · tạo 28/8 · chungtrt@nghean.edu.vn
--            25 lớp · 32 GV · 2 dòng phân công · 1 phiên bản
--
--  Chủ dự án thao tác lúc ở kho này lúc ở kho kia, nên thêm phân hiệu ở bên
--  này rồi đăng nhập bên kia là thấy thiếu — nhìn ra y như dữ liệu bị mất.
--
--  Chủ dự án chốt 30/8/2026: giữ KHO A, chuyển Gmail nhà trường về kho A,
--  XOÁ HẲN kho B.
--
--  ⚠️ BƯỚC 3 KHÔNG HOÀN TÁC ĐƯỢC. Mọi bảng đều khai `on delete cascade`
--  theo `truong_id`, nên xoá một dòng `truong` là xoá sạch lớp · giáo viên ·
--  phân công · phiên bản · nhật ký của trường ấy. Bản sao lưu hằng đêm
--  (.github/workflows/sao-luu.yml, giữ 90 ngày) là đường lui duy nhất.
-- ============================================================

-- ---------- 0. Đúng dự án chưa? ----------
do $$
begin
  if to_regclass('public.truong') is null then
    raise exception 'Không thấy bảng truong — đang đứng ở dự án Supabase KHÁC. Mở đúng dự án của phần mềm thời khoá biểu rồi chạy lại.';
  end if;
end $$;

-- ---------- 1. Chuyển Gmail nhà trường về kho A ----------
--  ⚠️ Phải đặt `diem_truong_id = null`: nó đang trỏ vào một phân hiệu của
--  kho B, mà sang kho A thì id ấy không tồn tại. Để nguyên là tài khoản
--  thành "PHT phụ trách một phân hiệu không còn" — bấm Lưu được máy chủ
--  báo ok với phạm vi RỖNG, không ghi được ô nào và không một lỗi nào hiện
--  ra. Đúng thứ câu số 5 của db/soi-phan-hieu.sql sinh ra để bắt.
do $$
declare v_a uuid; v_b uuid; n int;
begin
  select id into v_a from truong where ma_truong = 'THDL';
  select id into v_b from truong where ma_truong = '45407';
  if v_a is null then raise exception 'Không thấy kho A (mã THDL) — dừng, không đụng gì.'; end if;
  if v_b is null then raise notice 'Không còn kho B (mã 45407) — có lẽ đã chạy tệp này rồi.'; return; end if;

  update nguoi_dung
     set truong_id = v_a, diem_truong_id = null
   where truong_id = v_b;
  get diagnostics n = row_count;
  raise notice 'Đã chuyển % tài khoản từ kho B sang kho A.', n;
end $$;

-- ---------- 2. Xoá hẳn kho B ----------
--  Ba chốt an toàn, sai một cái là dừng và KHÔNG xoá gì:
--    a) kho A phải còn nguyên và có nhiều phân công — chắc chắn nó là kho thật
--    b) kho B không được còn tài khoản nào (bước 1 phải chạy trước)
--    c) chỉ xoá đúng dòng mang mã 45407, không dò theo tên
do $$
declare v_a uuid; v_b uuid; pc_a int; nd_b int;
        lop_b int; gv_b int; pc_b int; tkb_b int;
begin
  select id into v_a from truong where ma_truong = 'THDL';
  select id into v_b from truong where ma_truong = '45407';
  if v_b is null then raise notice 'Kho B đã không còn — không có gì để xoá.'; return; end if;
  if v_a is null then raise exception 'Không thấy kho A — DỪNG, không xoá gì.'; end if;

  select count(*) into pc_a from phan_cong where truong_id = v_a;
  if pc_a < 200 then
    raise exception 'Kho A chỉ có % dòng phân công — chờ đợi ≥200. DỪNG, không xoá gì.', pc_a;
  end if;

  select count(*) into nd_b from nguoi_dung where truong_id = v_b;
  if nd_b > 0 then
    raise exception 'Kho B còn % tài khoản — chạy bước 1 trước đã. DỪNG, không xoá gì.', nd_b;
  end if;

  select count(*) into lop_b from lop         where truong_id = v_b;
  select count(*) into gv_b  from giao_vien   where truong_id = v_b;
  select count(*) into pc_b  from phan_cong   where truong_id = v_b;
  select count(*) into tkb_b from tkb_phien_ban where truong_id = v_b;
  raise notice 'Xoá kho B: % lớp · % giáo viên · % dòng phân công · % phiên bản.',
               lop_b, gv_b, pc_b, tkb_b;

  delete from truong where id = v_b;
  raise notice 'Đã xoá kho B (mã 45407).';
end $$;

-- ---------- 3. Soi lại: phải còn 4 trường, kho A giữ cả hai tài khoản ----------
select t.ten,
       t.ma_truong,
       (select count(*) from diem_truong d where d.truong_id = t.id) as phan_hieu,
       (select count(*) from lop l         where l.truong_id = t.id) as lop,
       (select count(*) from giao_vien g   where g.truong_id = t.id) as giao_vien,
       (select count(*) from phan_cong p   where p.truong_id = t.id) as phan_cong,
       (select string_agg(n.email || ' (' || n.vai_tro
                          || case when n.diem_truong_id is null then '' else ' · 1 phân hiệu' end
                          || ')', ' · ' order by n.email)
          from nguoi_dung n where n.truong_id = t.id)                 as tai_khoan
from truong t
order by lower(t.ten);
