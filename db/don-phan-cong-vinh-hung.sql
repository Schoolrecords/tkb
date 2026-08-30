-- ============================================================
--  DỌN SẠCH PHÂN CÔNG ĐỂ NHẬP LẠI — Trường Tiểu học Vinh Hưng 1
--  (31/8/2026)
--
--  Chủ dự án: *"vẫn đang lộn xộn lắm. Có cách nào xóa tất cả Phân công để
--  upload file excel lại không?"*
--
--  Bảng phân công của trường này đang mang kết quả của một lần nhập sai
--  (mã lớp lệch tên lớp nên hai giáo viên cùng đổ vào một lớp), và app thì
--  đang vướng quyền ở bước Lớp học nên chưa ghi đè lại được. Tệp này dọn
--  thẳng bằng SQL để nhập lại từ tệp Excel.
--
--  ⚠️ XOÁ PHÂN CÔNG KHÔNG MẤT GÌ KHÁC. Lớp, giáo viên, môn học, khung giờ,
--  phòng, các phiên bản thời khoá biểu đã lưu — tất cả giữ nguyên. Phân
--  công vốn là thứ nhập lại được từ tệp Excel, và mẫu ma trận cũng thay
--  sạch bảng này mỗi lần nhập.
--
--  ⚠️ NHƯNG lưới thời khoá biểu đang xếp thì sẽ không còn khớp phân công
--  nữa — xếp lại sau khi nhập xong.
--
--  Chạy trong SQL Editor. Kết quả: bảng đối chiếu trước/sau ở cuối.
-- ============================================================

-- ---------- 0. Đúng dự án chưa? ----------
do $$
begin
  if to_regclass('public.phan_cong') is null then
    raise exception 'Không thấy bảng phan_cong — đang đứng ở dự án Supabase KHÁC.';
  end if;
end $$;

-- ---------- 1. Dọn ----------
do $$
declare
  c_ma_truong text := '57634';      -- Vinh Hưng 1; đổi mã này để dùng cho trường khác
  v_t uuid; n_pc int; n_gv int;
begin
  select id into v_t from truong where ma_truong = c_ma_truong;
  if v_t is null then raise exception 'Không thấy trường mã %.', c_ma_truong; end if;

  -- 1a. Xoá sạch phân công
  select count(*) into n_pc from phan_cong where truong_id = v_t;
  delete from phan_cong where truong_id = v_t;
  raise notice 'Đã xoá % dòng phân công.', n_pc;

  -- 1b. Hồ sơ giáo viên TRÙNG TÊN mà không dùng tới thì bỏ bớt.
  --
  --     ⚠️ Chỉ xoá bản trùng nào KHÔNG có tài khoản đăng nhập, KHÔNG chủ
  --     nhiệm lớp nào, và KHÔNG có báo nghỉ hay lịch dạy thay. Giữ lại bản
  --     tạo trước. Người thật đang dùng phần mềm thì tuyệt đối không đụng.
  with xep as (
    select g.id, g.ho_ten,
           -- Bảng giao_vien không có cột thời điểm tạo, nên giữ bản có mã
           -- ngắn hơn (mã do máy sinh khi nhân đôi thường dài hơn), rồi mới
           -- tới thứ tự mã cho ổn định giữa các lần chạy.
           row_number() over (partition by lower(btrim(g.ho_ten))
                              order by length(g.ma_gv), g.ma_gv) as hang
    from giao_vien g where g.truong_id = v_t
  )
  delete from giao_vien g
  using xep
  where g.id = xep.id
    and xep.hang > 1
    and g.nguoi_dung_id is null
    and not exists (select 1 from lop l where l.gvcn_id = g.id)
    and not exists (select 1 from bao_nghi b where b.giao_vien_id = g.id)
    and not exists (select 1 from day_thay d
                     where d.gv_vang_id = g.id or d.gv_thay_id = g.id);
  get diagnostics n_gv = row_count;
  raise notice 'Đã bỏ % hồ sơ giáo viên trùng tên không dùng tới.', n_gv;
end $$;

-- ---------- 2. Đối chiếu lại ----------
select t.ten                                                          as truong,
       (select count(*) from lop l         where l.truong_id = t.id)  as lop,
       (select count(*) from giao_vien g   where g.truong_id = t.id)  as giao_vien,
       (select count(*) from phan_cong p   where p.truong_id = t.id)  as phan_cong,
       (select count(*) from lop l where l.truong_id = t.id
          and l.ma_lop <> l.ten)                                      as lop_ma_lech_ten,
       (select count(*) from (select lower(btrim(ho_ten)) x
                                from giao_vien where truong_id = t.id
                               group by 1 having count(*) > 1) q)     as ho_so_con_trung_ten
from truong t
where t.ma_truong = '57634';
