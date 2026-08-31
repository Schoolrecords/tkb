-- ============================================================
--  GIỜ HỌC RIÊNG CỦA TỪNG LỚP  (31/8/2026)
--
--  Chủ dự án, từ Trường TH Hưng Vinh 1: *"Lớp 1A, 1B, 1C khung chương
--  trình 35 tiết mà các lớp 1 còn lại 32 tiết… hiện tại bố trí cứng
--  khung giờ này thì bài toán Hưng Vinh 1 không giải được."*
--
--  Khung giờ vốn khai theo KHỐI (`khung_gio.so_tiet_khoi`), nên trong
--  cùng một khối không có chỗ nào nói được hai con số. Cột dưới đây cho
--  từng LỚP ghi đè số tiết của từng buổi; lớp nào không khai thì kế thừa
--  đúng con số của khối như trước, nên trường đang chạy không đổi gì.
--
--  Cách bày ra màn hình là cách nhà trường vẫn quen (và là cách
--  SmartScheduler làm): khung mở rộng, phần lớp không học hiện thành ô
--  ghi "Nghỉ" ở cuối buổi.
--
--  Chạy MỘT LẦN trong SQL Editor. Chạy lại nhiều lần vẫn an toàn.
-- ============================================================

-- ------------------------------------------------------------
--  0. ĐÚNG DỰ ÁN CHƯA?
--
--  Chủ dự án có nhiều dự án Supabase và đã dán nhầm một lần (30/8/2026).
--  Hỏi trước bằng tiếng Việt, và dừng trước khi có câu lệnh nào chạy dở.
-- ------------------------------------------------------------
do $$
begin
  if to_regclass('public.lop') is null then
    raise exception
      'Cơ sở dữ liệu này không có bảng của phần mềm Thời khóa biểu. Nhiều khả năng SQL Editor đang mở NHẦM DỰ ÁN — thoát ra, chọn đúng dự án của trường rồi chạy lại.';
  end if;
end $$;

-- ------------------------------------------------------------
--  1. Cột giờ học riêng
--
--  Dạng: {"2-S": 5, "3-S": 5}  — khoá là <thứ>-<buổi>, giá trị là số
--  tiết buổi ấy của riêng lớp này.
--
--  ⚠️ CHỈ chứa buổi nào KHÁC khối, không chép cả tuần vào. Nhờ vậy nhà
--     trường sửa khung của khối thì các lớp ấy vẫn đi theo ở những buổi
--     dùng chung — chép đủ tám buổi là mỗi lần sửa khung phải nhớ sửa
--     tay từng lớp, sớm muộn quên một lớp.
--
--  ⚠️ Bỏ khai giờ riêng thì app ghi `null`, KHÔNG ghi `{}`. Để lại một
--     đối tượng rỗng thì lần tải sau vẫn coi là "có khai" và lớp còn
--     lệch khỏi khối mà không ai thấy lệch ở đâu.
-- ------------------------------------------------------------
alter table lop add column if not exists so_tiet_buoi jsonb;

comment on column lop.so_tiet_buoi is
  'Số tiết từng buổi của RIÊNG lớp này, chỉ ghi buổi khác với khối. VD {"2-S":5}. null = học đúng khung giờ của khối.';

-- ------------------------------------------------------------
--  2. Không cần quy tắc RLS mới
--
--  Cột nằm trên bảng `lop`, vốn đã có `p_lop_doc` (cả trường đọc) và
--  `p_lop_sua` (quản lý ghi). Thêm quy tắc ở đây là nhân đôi hàng rào
--  cho cùng một bảng — và mỗi hàng rào thừa là một chỗ để về sau sửa
--  lệch nhau.
--
--  Cũng KHÔNG cần trigger canh cột: `so_tiet_buoi` không quyết định
--  quyền của ai cả, nó chỉ nói lớp học mấy tiết. Khác hẳn `vai_tro`
--  hay `diem_truong_id` — hai cột `db/siet-quyen.sql` phải canh.
-- ------------------------------------------------------------

-- ------------------------------------------------------------
--  3. Kiểm lại
-- ------------------------------------------------------------
select ten, khoi, so_tiet_buoi
from lop
where so_tiet_buoi is not null
order by khoi, ten;
