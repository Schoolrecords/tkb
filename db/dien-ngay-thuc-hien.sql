-- ============================================================
--  ĐIỀN NGÀY THỰC HIỆN CHO BẢN THỜI KHOÁ BIỂU SỐ 01  (30/8/2026)
--
--  db/so-hieu-tkb.sql đã gán số 01 cho bản đang công bố của mỗi trường,
--  nhưng CỐ Ý không đoán ngày thực hiện — đó là mốc pháp lý do nhà
--  trường quyết, không phải dữ liệu kỹ thuật.
--
--  Chủ dự án chọn giữ nguyên số 01 và điền ngày vào bản ấy (30/8/2026),
--  thay vì ban hành lại thành số 02.
--
--  ⚠️ SỬA HAI GIÁ TRỊ DƯỚI ĐÂY NẾU CẦN, rồi mới chạy. Mỗi trường một
--     dòng; trường nào không có tên trong bảng thì KHÔNG bị đụng tới.
-- ============================================================

-- ------------------------------------------------------------
--  0. Đúng dự án chưa?
-- ------------------------------------------------------------
do $$
begin
  if to_regclass('public.tkb_phien_ban') is null then
    raise exception
      'Cơ sở dữ liệu này không có bảng của phần mềm Thời khóa biểu. Nhiều khả năng SQL Editor đang mở NHẦM DỰ ÁN — thoát ra, chọn đúng dự án của trường rồi chạy lại.';
  end if;
  if not exists (select 1 from information_schema.columns
                  where table_name = 'tkb_phien_ban' and column_name = 'ngay_thuc_hien') then
    raise exception
      'Chưa có cột ngay_thuc_hien. Chạy db/so-hieu-tkb.sql trước rồi quay lại tệp này.';
  end if;
end $$;

-- ------------------------------------------------------------
--  1. Ngày thực hiện và học kỳ của từng trường
--
--     Ngày 07/9/2026 là THỨ HAI — tuần đầu của năm học 2026–2027.
--     Muốn ngày khác thì sửa ngay trong bảng values dưới đây.
-- ------------------------------------------------------------
with dat(ten_truong, ngay_thuc_hien, hoc_ky) as (
  values
    ('Trường Tiểu học mới',          date '2026-09-07', 'Học kỳ 1'),
    ('Trường tiểu học Quảng Châu 1', date '2026-09-07', 'Học kỳ 1')
)
update tkb_phien_ban v
   set ngay_thuc_hien = d.ngay_thuc_hien,
       hoc_ky         = d.hoc_ky
  from dat d, truong t
 where t.id = v.truong_id
   and lower(trim(t.ten)) = lower(trim(d.ten_truong))
   and v.cong_bo                      -- chỉ bản ĐANG có hiệu lực
   and v.so_hieu is not null          -- đã được cấp số hiệu
   and v.ngay_thuc_hien is null;      -- chưa ghi ngày thì mới ghi, không đè bản đã có

-- ------------------------------------------------------------
--  2. Kiểm lại — phải thấy ngày và học kỳ đã vào đúng chỗ
-- ------------------------------------------------------------
select t.ten as truong, v.so_hieu, v.hoc_ky,
       v.ngay_thuc_hien, v.ban_hanh_luc, v.cong_bo
from tkb_phien_ban v join truong t on t.id = v.truong_id
where v.so_hieu is not null
order by t.ten, v.so_hieu;
