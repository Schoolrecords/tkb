-- ============================================================================
-- CHO PHÉP / KHÔNG CHO PHÉP XẾP HAI TIẾT CÙNG MÔN LIỀN NHAU  (31/8/2026)
-- PHẠM VI: MỌI TRƯỜNG — đây là tệp CẤU TRÚC, chạy một lần là cả hệ thống có.
-- ----------------------------------------------------------------------------
-- Chủ dự án: *"Tiếng Việt, Tiếng Anh các lớp 1–5 có thể có 2 tiết xếp liền
-- nhau, nhưng Toán, Khoa học, Lịch sử và Địa lý… thì không được xếp liền nhau"*.
--
-- Đo trên dữ liệu thật Diễn Liên trước khi làm: sau khi xếp tự động có 24 cặp
-- tiết liền nhau thuộc nhóm "không nên liền" (Toán 17 · GDTC 7), còn Tiếng
-- Việt có 74 cặp — thứ nhà trường CẦN. Bật khoản phạt thì nhóm đầu về 0 mà
-- vẫn xếp trọn 710/710 tiết và tỉ lệ Toán·Tiếng Việt vào tiết 1–3 sáng giữ 88%.
--
-- ⚠️ CỘT NÀY MẶC ĐỊNH NULL, KHÔNG PHẢI false.
--    `null` = nhà trường chưa khai = **được phép** xếp liền, tức đúng hành vi
--    của phần mềm trước 31/8/2026. Đặt mặc định `false` là cấm xếp liền toàn
--    bộ danh mục môn của mọi trường đang chạy, và sáng hôm sau họ bấm Xếp ra
--    một thời khóa biểu khác hẳn mà không ai yêu cầu. Cùng bài học cột
--    `trang_thai_duyet` ngày 24/8: mặc định phải là "giữ nguyên như cũ".
--
-- Ứng dụng vẫn chạy được khi CHƯA có cột này: `ghiDuLieuNguon()` bắt đúng lỗi
-- *"Could not find the 'lien_tiet' column"* rồi ghi lại không kèm cột, và
-- `tuMayChu()` để trống trường ấy. Nên tệp này không gấp — chỉ là để lựa chọn
-- của nhà trường sống qua lần tải lại trang.
-- ============================================================================

-- ---------- 0. Đúng dự án chưa? ----------
do $$
begin
  if to_regclass('public.mon_hoc') is null then
    raise exception 'Không thấy bảng mon_hoc — sai dự án Supabase, hoặc chưa chạy db/mon-hoc-phong.sql.';
  end if;
end $$;

alter table mon_hoc add column if not exists lien_tiet boolean;

comment on column mon_hoc.lien_tiet is
  'Cho phép xếp hai tiết cùng môn liền nhau trong một buổi. null = chưa khai = được phép (hành vi trước 31/8/2026).';

-- ---------- Kiểm ----------
-- Phải ra một dòng, is_nullable = YES và column_default rỗng.
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'mon_hoc' and column_name = 'lien_tiet';

-- Danh mục môn của từng trường, xem trường nào đã khai
select t.ten as truong, m.ten as mon,
       case m.lien_tiet when true then 'Cho xếp liền'
                        when false then 'KHÔNG cho xếp liền'
                        else '(chưa khai — được phép)' end as lien_tiet
from mon_hoc m join truong t on t.id = m.truong_id
order by t.ten, m.thu_tu;
