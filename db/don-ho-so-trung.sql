-- ============================================================
-- DỌN HỒ SƠ GIÁO VIÊN BỊ NHÂN BẢN
-- Dán vào Supabase → SQL Editor → Run. Chạy lại nhiều lần cũng không sao.
--
-- CHUYỆN GÌ ĐÃ XẢY RA (2/8/2026)
--   Trường nhập 35 giáo viên, nhưng trên máy chủ có 105 hồ sơ — mỗi thầy cô
--   đúng BA bản. Không phải nhập nhầm: phần mềm tự sinh ra.
--
--   Bản cũ của ghiDuLieuNguon() ghi `ma_gv = id-trong-app`. Lần lưu ĐẦU thì
--   id ấy là mã do app đặt (`gv_nguyen_thi_trinh`) nên máy chủ lưu đúng mã.
--   Nhưng TẢI VỀ rồi thì id trong app trở thành UUID của máy chủ, nên lần
--   lưu SAU ghi `ma_gv = <UUID>` — không khớp dòng cũ nào, và lệnh upsert
--   theo (truong_id, ma_gv) bèn THÊM nguyên một lứa 35 hồ sơ mới.
--   Bấm Lưu ba lần sau ba lần tải là 105 hồ sơ.
--
--   Tệ hơn: mỗi lần lưu, bảng phân công bị xoá sạch rồi ghi lại theo lứa MỚI
--   NHẤT. Nên hai lứa cũ thành hồ sơ trùng tên KHÔNG CÓ TIẾT NÀO — chính là
--   thứ đã làm mã mời nối nhầm cô Oanh vào một hồ sơ rỗng.
--
--   Lỗi trong mã đã vá (src/index.html, bước 3 của ghiDuLieuNguon, có phép
--   thử canh). Tệp này dọn hậu quả còn nằm lại trên máy chủ.
--
-- LÀM THEO ĐÚNG THỨ TỰ NÀY
--   1. db/sua-noi-nham-ho-so.sql   nối tài khoản về hồ sơ thật TRƯỚC
--   2. tệp này                     xoá các bản thừa
--   3. trong phần mềm: tải lại dữ liệu → xếp lại → Công bố cho giáo viên
--      (bản đã công bố trỏ theo id hồ sơ cũ, nên phải xếp và công bố lại)
--
-- CHỈ XOÁ HỒ SƠ KHÔNG CÒN DÍNH GÌ
--   không dòng phân công nào · không chủ nhiệm lớp nào · không giữ tài khoản
--   nào · và phải còn ít nhất một hồ sơ cùng tên được giữ lại.
--   Hồ sơ nào còn dính một trong ba thứ đó thì tệp này KHÔNG đụng tới.
-- ============================================================

-- ---------- 1. SOI TRƯỚC: sẽ xoá bao nhiêu, giữ lại ai ----------
with diem as (
  select g.id, g.ho_ten, g.ma_gv,
         (select count(*) from phan_cong p where p.giao_vien_id = g.id) as so_pc,
         (select count(*) from lop l where l.gvcn_id = g.id)            as so_cn,
         case when g.nguoi_dung_id is not null then 1 else 0 end        as co_tk
  from giao_vien g),
xep as (
  -- Giữ lại bản "thật" nhất: nhiều phân công nhất → có chủ nhiệm → có tài khoản
  select *, row_number() over (
           partition by ho_ten
           order by so_pc desc, so_cn desc, co_tk desc, ma_gv) as hang
  from diem)

select 'Tổng số hồ sơ giáo viên'  as hang_muc,
       (select count(*) from giao_vien)::text as so_luong,
       'ℹ️ để biết' as ket_luan
union all
select 'Số họ tên khác nhau',
       (select count(distinct ho_ten) from giao_vien)::text,
       'ℹ️ đây mới là số giáo viên THẬT của trường'
union all
select 'Sẽ xoá (bản thừa, không dính gì)',
       (select count(*) from xep where hang > 1 and so_pc = 0 and so_cn = 0 and co_tk = 0)::text,
       '✅ xoá xong là hết cảnh chọn nhầm người trùng tên'
union all
select 'Bản thừa nhưng CÒN DÍNH — không xoá',
       (select count(*) from xep where hang > 1 and (so_pc > 0 or so_cn > 0 or co_tk > 0))::text,
       case when (select count(*) from xep where hang > 1 and (so_pc > 0 or so_cn > 0 or co_tk > 0)) = 0
              then '✅ không có bản nào vướng'
            else '⚠️ còn phân công/chủ nhiệm/tài khoản — xem lại tay trước khi xoá'
       end;

-- ---------- 2. XOÁ ----------
with diem as (
  select g.id, g.ho_ten, g.ma_gv,
         (select count(*) from phan_cong p where p.giao_vien_id = g.id) as so_pc,
         (select count(*) from lop l where l.gvcn_id = g.id)            as so_cn,
         case when g.nguoi_dung_id is not null then 1 else 0 end        as co_tk
  from giao_vien g),
xep as (
  select *, row_number() over (
           partition by ho_ten
           order by so_pc desc, so_cn desc, co_tk desc, ma_gv) as hang
  from diem)
delete from giao_vien
where id in (select id from xep
             where hang > 1 and so_pc = 0 and so_cn = 0 and co_tk = 0)
returning ho_ten as da_xoa_ban_thua, ma_gv;

-- ---------- 3. KIỂM TRA ----------
select 'Hồ sơ giáo viên còn lại' as hang_muc,
       count(*)::text as so_luong,
       case when count(*) = count(distinct ho_ten)
              then '✅ mỗi thầy cô đúng một hồ sơ — không còn trùng tên do nhân bản'
            else '⚠️ còn ' || (count(*) - count(distinct ho_ten))::text ||
                 ' bản trùng tên. Có thể là trùng tên THẬT (trường vốn có hai cô Dung, ' ||
                 'hai cô Linh, hai cô Hương, hai cô Oanh) — kiểm bằng db/soi-tai-khoan-gv.sql'
       end as ket_luan
from giao_vien;
