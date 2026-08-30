-- ============================================================
--  SOI PHÂN HIỆU — câu CHỈ ĐỌC, không sửa gì  (30/8/2026)
--
--  Dùng khi một phân hiệu "tự nhiên biến mất": chủ dự án thêm đủ ba phân
--  hiệu, vào lại thì Diễn Thái không còn.
--
--  Gốc đã tìm ra và đã vá trong app cùng ngày: bước "xoá phân hiệu thừa"
--  (28/8/2026) xoá MỌI dòng trên máy chủ mà danh sách gửi lên không nhắc
--  tới. Nghĩa là bất cứ lần bấm Lưu nào từ một phiên có dữ liệu CŨ HƠN —
--  tab mở từ hôm qua, tài khoản thứ hai, một tệp Excel không có cột phân
--  hiệu — cũng xoá sạch phân hiệu người khác vừa thêm, im lặng.
--
--  Phân hiệu vừa thêm thường CHƯA CÓ LỚP NÀO, nên van an toàn "còn lớp
--  thì không xoá" không cứu được nó. Đó đúng là trường hợp đã mất.
--
--  Chạy trong SQL Editor của Supabase. Không câu nào sửa dữ liệu.
-- ============================================================

-- ---------- 0. Đúng dự án chưa? ----------
do $$
begin
  if to_regclass('public.diem_truong') is null then
    raise exception 'Không thấy bảng diem_truong — đang đứng ở dự án Supabase KHÁC. Mở đúng dự án của phần mềm thời khoá biểu rồi chạy lại.';
  end if;
end $$;

-- ---------- 1. Mỗi trường đang có mấy phân hiệu, mỗi nơi mấy lớp ----------
select t.ten                                  as truong,
       d.ten                                  as phan_hieu,
       d.thu_tu,
       d.co_phong_tin,
       (select count(*) from lop l where l.diem_truong_id = d.id)        as so_lop,
       (select count(*) from giao_vien g where g.diem_truong_id = d.id)  as so_gv_gan_nhan,
       (select count(*) from nguoi_dung n where n.diem_truong_id = d.id) as so_pht_phu_trach
from diem_truong d
join truong t on t.id = d.truong_id
order by t.ten, d.thu_tu, d.ten;

-- ---------- 2. Phân hiệu trùng tên trong cùng một trường ----------
--  Bảng này KHÔNG có ràng buộc duy nhất, mà app dò theo TÊN lúc ghi —
--  hai dòng cùng tên là lớp bên này gán nhầm sang bên kia.
select t.ten as truong, d.ten as phan_hieu_trung_ten, count(*) as so_dong
from diem_truong d
join truong t on t.id = d.truong_id
group by t.ten, d.ten
having count(*) > 1;

-- ---------- 3. Ai bấm Lưu dữ liệu nguồn, lúc nào, với bao nhiêu phân hiệu ----------
--  Cột `diemTruong` và `dtXoa` chỉ có ở các lần lưu TỪ 30/8/2026 trở đi —
--  lần lưu cũ hơn không ghi số phân hiệu nên hiện null.
select nk.thoi_diem at time zone 'Asia/Bangkok' as luc,
       coalesce(n.ho_ten, '(không rõ)')         as nguoi_luu,
       n.email,
       nk.du_lieu_cu ->> 'diemTruong'           as so_phan_hieu_gui_len,
       nk.du_lieu_cu ->> 'dtXoa'                as phan_hieu_bi_xoa,
       nk.du_lieu_cu ->> 'lop'                  as so_lop,
       nk.du_lieu_cu ->> 'giaoVien'             as so_gv
from nhat_ky nk
left join nguoi_dung n on n.id = nk.nguoi_dung_id
where nk.hanh_dong = 'nhap_du_lieu_nguon'
order by nk.thoi_diem desc
limit 40;

-- ---------- 4. Lớp mồ côi: trỏ vào phân hiệu không còn ----------
--  `lop.diem_truong_id` khai `on delete restrict` nên về nguyên tắc không
--  có dòng nào; nếu có thì cơ sở dữ liệu đã bị sửa tay ở đâu đó.
select l.ma_lop, l.ten, l.diem_truong_id
from lop l
where l.diem_truong_id is not null
  and not exists (select 1 from diem_truong d where d.id = l.diem_truong_id);

-- ---------- 5. PHT trỏ vào phân hiệu không còn ----------
--  ⚠️ `nguoi_dung.diem_truong_id` KHÔNG có khoá ngoại, nên xoá một phân
--  hiệu là để lại người phụ trách treo vào một id đã mất: họ bấm Lưu được
--  máy chủ báo *ok* với phạm vi rỗng — không ghi được lớp nào, không lỗi.
select n.ho_ten, n.email, n.vai_tro, n.diem_truong_id
from nguoi_dung n
where n.diem_truong_id is not null
  and not exists (select 1 from diem_truong d where d.id = n.diem_truong_id);
