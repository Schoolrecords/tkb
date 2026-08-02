-- ============================================================
-- MÃ LỚP — cho phép ba điểm trường cùng có lớp tên "1A"
-- ------------------------------------------------------------
-- Chạy MỘT LẦN trong SQL Editor, trước khi nhập dữ liệu ba trường.
--
-- VÌ SAO CẦN
--   Bảng `lop` trước đây khoá duy nhất theo (truong_id, ten), và phần
--   mềm dò lớp bằng TÊN. Sau sáp nhập, Diễn Liên · Diễn Đồng · Diễn Thái
--   đều có lớp "1A" — ba lớp khác nhau, ba cô chủ nhiệm khác nhau.
--   Gộp vào một tệp Excel là bộ soát báo trùng tên và không nhập được.
--
--   Cách chữa đúng là cách đã dùng cho giáo viên: một MÃ do nhà trường
--   đặt (`ma_gv` ↔ `ma_lop`), tên chỉ còn là nhãn hiển thị.
-- ============================================================

-- ⚠️ TỆP NÀY LÀ BẢN NÂNG CẤP, NAY NẰM TRONG db/cai-dat.sql.
--    `create table if not exists` trong schema.sql KHÔNG thêm cột vào bảng
--    đã tồn tại — cơ sở dữ liệu dựng trước 1/8/2026 vì thế thiếu hẳn cột
--    `ma_lop`, và mọi lệnh ghi lớp đều đổ:
--        Could not find the 'ma_lop' column of 'lop' in the schema cache
--    Đã dính thật ngày 2/8/2026. Chạy lại db/cai-dat.sql là hết.

-- 1. Thêm cột
alter table lop add column if not exists ma_lop text;

-- 2. Điền mã cho dòng còn trống — lấy tên lớp làm mã. Tên trùng nhau giữa
--    các điểm trường thì thêm số thứ tự, không thì ràng buộc duy nhất ở
--    bước 3 đổ ngay. (Phần mềm sẽ tự đặt lại thành 1A_DL, 1A_DĐ… khi nạp.)
update lop l
set ma_lop = x.ma
from (
  select id, ten || case when rn = 1 then '' else '_' || rn end as ma
  from (
    select id, ten,
           row_number() over (partition by truong_id, ten order by id) as rn
    from lop
    where ma_lop is null or ma_lop = ''
  ) t
) x
where l.id = x.id;

-- 3. Bỏ ràng buộc duy nhất theo tên, dựng ràng buộc duy nhất theo mã
alter table lop drop constraint if exists lop_truong_id_ten_key;
create unique index if not exists ux_lop_truong_ma on lop(truong_id, ma_lop);
alter table lop alter column ma_lop set not null;

-- 4. Bảo PostgREST nạp lại sơ đồ bảng ngay, khỏi phải đợi
notify pgrst, 'reload schema';

-- ---------- Kiểm tra ----------
-- Cột ma_lop phải kín, không dòng nào trống.
select count(*) filter (where ma_lop is null or ma_lop = '') as thieu_ma,
       count(*)                                             as tong_lop
from lop;

-- Danh sách lớp trùng tên giữa các điểm trường — từ nay là hợp lệ.
select l.ten, count(*) as so_lop, string_agg(d.ten, ' · ') as cac_diem_truong
from lop l join diem_truong d on d.id = l.diem_truong_id
group by l.truong_id, l.ten having count(*) > 1
order by l.ten;

-- ============================================================
-- SAU KHI CHẠY
-- ------------------------------------------------------------
-- Tệp Excel nhập vào giữ nguyên ba trang tính như cũ. Chỉ hai điều đổi:
--   · Ma_lop phải duy nhất trong toàn trường (trước đây Ten_lop cũng phải).
--   · Ten_lop chỉ cần duy nhất TRONG MỘT điểm trường.
--   · Cột Chu_nhiem nên ghi Ma_lop. Vẫn nhận Ten_lop nếu tên đó chỉ trỏ
--     tới một lớp duy nhất; trùng tên thì phần mềm báo rõ dòng nào.
-- ============================================================
