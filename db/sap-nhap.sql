-- ============================================================
-- SÁP NHẬP BA TRƯỜNG
--   Tiểu học Diễn Liên · Tiểu học Diễn Đồng · Tiểu học Diễn Thái
-- ------------------------------------------------------------
-- Đổi tên đơn vị và dựng ba điểm trường trên máy chủ.
-- Dán cả file vào SQL Editor, bấm Run. Chạy lại nhiều lần không sao.
--
-- ⚠️ TÊN TRƯỜNG MỚI CÒN CHỜ QUYẾT ĐỊNH
--    File này tạm ghi 'Trường Tiểu học mới'. Khi có quyết định sáp nhập,
--    sửa dòng có dấu >>> ở mục 1 rồi chạy lại — chỉ một dòng.
--
-- ⚠️ CHƯA CÓ LỚP VÀ GIÁO VIÊN CỦA DIỄN ĐỒNG, DIỄN THÁI
--    File này chỉ dựng khung: tên đơn vị và ba điểm trường. 25 lớp và
--    35 giáo viên hiện có đều là của Diễn Liên. Muốn đủ thì lấy bảng
--    phân công của hai trường kia, gộp vào một tệp Excel đúng mẫu, rồi
--    nhập qua nút "Nhập dữ liệu Excel" trong phần mềm.
-- ============================================================

-- ---------- 1. Đổi tên đơn vị ----------
update truong
set ten = 'Trường Tiểu học mới',   -- >>> sửa thành tên chính thức khi có quyết định
    xa  = 'Quảng Châu',
    tinh = 'Nghệ An'
where ma_truong = 'THDL';

-- ---------- 2. Dựng ba điểm trường ----------
-- Diễn Liên đã có sẵn, chỉ thêm hai điểm mới nếu chưa có.
insert into diem_truong (truong_id, ten, co_phong_tin, thu_tu)
select t.id, v.ten, v.phong_tin, v.thu_tu
from (values
  ('Điểm trường Diễn Liên', true,  0),
  ('Điểm trường Diễn Đồng', false, 1),
  ('Điểm trường Diễn Thái', false, 2)
) as v(ten, phong_tin, thu_tu)
join truong t on t.ma_truong = 'THDL'
where not exists (
  select 1 from diem_truong d where d.truong_id = t.id and d.ten = v.ten
);

-- Điểm trường cũ tên khác thì đổi về đúng tên Diễn Liên,
-- để lớp đang gắn vào đó không bị mồ côi.
update diem_truong d
set ten = 'Điểm trường Diễn Liên', co_phong_tin = true, thu_tu = 0
from truong t
where t.ma_truong = 'THDL' and d.truong_id = t.id
  and d.ten not in ('Điểm trường Diễn Liên','Điểm trường Diễn Đồng','Điểm trường Diễn Thái');

-- ---------- 3. Kiểm tra ----------
-- Phải ra 3 dòng: Diễn Liên (có lớp), Diễn Đồng và Diễn Thái (chưa có lớp).
select d.ten as diem_truong,
       d.co_phong_tin as co_phong_tin_hoc,
       (select count(*) from lop l where l.diem_truong_id = d.id) as so_lop,
       t.ten as ten_don_vi
from diem_truong d
join truong t on t.id = d.truong_id
where t.ma_truong = 'THDL'
order by d.thu_tu;

-- ============================================================
-- SAU KHI CHẠY FILE NÀY
-- ------------------------------------------------------------
-- 1. Vào phần mềm → Điểm trường → Phân bổ lớp: kéo từng lớp về
--    đúng điểm trường của nó.
-- 2. Có bảng phân công của Diễn Đồng và Diễn Thái thì gộp chung vào
--    một tệp Excel ba trang tính, nhập qua nút "Nhập dữ liệu Excel".
--    Cột Diem_truong trong trang DANH_SACH_LOP ghi đúng tên điểm trường
--    thì phần mềm tự gán, không phải kéo tay.
-- 3. Xếp lại thời khóa biểu và lưu thành phiên bản mới.
-- ============================================================
