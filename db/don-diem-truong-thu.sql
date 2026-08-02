-- ============================================================
-- DỌN ĐIỂM TRƯỜNG THỬ, GIỮ NGUYÊN ĐIỂM TRƯỜNG THẬT
-- ------------------------------------------------------------
-- ⚠️ TỆP NÀY XOÁ DỮ LIỆU. Đọc hết phần này rồi hãy chạy.
--
-- DÙNG KHI NÀO
--   Đã bấm "Tạo dữ liệu thử" để chạy thử ở quy mô sáp nhập, nay muốn
--   máy chủ trở lại đúng dữ liệu thật trong khi chờ danh sách chính thức.
--
-- SỬA TRƯỚC KHI CHẠY
--   Dòng `v_don` ngay dưới — ghi TÊN ĐẦY ĐỦ của các điểm trường cần dọn,
--   khớp từng chữ kể cả dấu. Tên không khớp thì lệnh DỪNG, không xoá gì.
--
-- BA CHỐT AN TOÀN, sai một cái là DỪNG và không xoá gì cả:
--   1. Không có điểm trường nào khớp tên  → dừng (đề phòng gõ sai tên).
--   2. Lớp trong đó ĐANG CÓ dòng phân công → dừng. Dữ liệu thử thì không
--      có phân công; có phân công nghĩa là dữ liệu thật, tuyệt đối không xoá.
--   3. Cả khối nằm trong MỘT giao dịch — dừng giữa chừng là hoàn nguyên hết.
--
-- XOÁ NHỮNG GÌ
--   · Lớp của các điểm trường ấy (kéo theo phân công và lịch dạy thay).
--   · Phòng chức năng của các điểm trường ấy.
--   · Bản ghi điểm trường.
--   · Giáo viên MỒ CÔI: không có dòng phân công nào, không chủ nhiệm lớp
--     nào còn lại, và chưa nối tài khoản đăng nhập. Ba điều kiện cùng lúc.
--
-- KHÔNG ĐỤNG TỚI
--   Các phiên bản thời khóa biểu đã lưu (`tkb_phien_ban`). Bản đang công
--   bố chứa lớp của điểm trường thật nên vẫn nguyên vẹn sau khi dọn.
-- ============================================================

create temp table if not exists ket_don (tt int, viec text, so text);
delete from ket_don;

do $$
declare
  -- ↓↓↓ SỬA Ở ĐÂY ↓↓↓
  v_don text[] := array['Điểm trường Diễn Đồng', 'Điểm trường Diễn Thái'];
  -- ↑↑↑ SỬA Ở ĐÂY ↑↑↑
  n_dt int; n_vuong int; n_lop int; n_gv int;
  ten_gv text;
begin
  -- ---------- Chốt 1: tên phải khớp ----------
  select count(*) into n_dt from diem_truong where ten = any(v_don);
  if n_dt = 0 then
    raise exception 'DỪNG — không có điểm trường nào mang tên trong danh sách. Tên phải khớp từng chữ, kể cả dấu. Chưa xoá gì cả.';
  end if;

  -- ---------- Chốt 2: không được đụng vào dữ liệu thật ----------
  select count(*) into n_vuong
  from phan_cong p
  join lop l on l.id = p.lop_id
  join diem_truong d on d.id = l.diem_truong_id
  where d.ten = any(v_don);
  if n_vuong > 0 then
    raise exception 'DỪNG — % dòng phân công đang gắn vào các điểm trường định dọn. Đây có thể là dữ liệu THẬT, không phải dữ liệu thử. Chưa xoá gì cả.', n_vuong;
  end if;

  -- ---------- Ghi lại tên giáo viên sắp mất, để còn đối chiếu ----------
  select string_agg(x.ho_ten, ', ' order by x.ho_ten) into ten_gv
  from (select g.ho_ten from giao_vien g
        where not exists (select 1 from phan_cong p where p.giao_vien_id = g.id)
          and not exists (select 1 from lop l where l.gvcn_id = g.id)
          and g.nguoi_dung_id is null
        order by g.ho_ten limit 6) x;

  -- ---------- Xoá, đúng thứ tự ----------
  -- Lớp trước: `lop.diem_truong_id` khai `on delete restrict`, nên xoá điểm
  -- trường khi còn lớp là Postgres chặn. Xoá lớp thì phân công và lịch dạy
  -- thay tự đi theo (`on delete cascade`).
  delete from lop l using diem_truong d
   where d.id = l.diem_truong_id and d.ten = any(v_don);
  get diagnostics n_lop = row_count;

  delete from diem_truong where ten = any(v_don);
  get diagnostics n_dt = row_count;

  -- Giáo viên mồ côi. Ba điều kiện cùng lúc — thiếu một là giữ lại, vì thà
  -- để thừa một cái tên còn hơn xoá nhầm người thật.
  delete from giao_vien g
   where not exists (select 1 from phan_cong p where p.giao_vien_id = g.id)
     and not exists (select 1 from lop l where l.gvcn_id = g.id)
     and g.nguoi_dung_id is null;
  get diagnostics n_gv = row_count;

  -- `nguoi_dung.diem_truong_id` cố ý KHÔNG khai khoá ngoại (phó hiệu trưởng
  -- phụ trách điểm trường nào), nên nó không tự dọn theo. Bỏ trống thì đúng
  -- nghĩa "phụ trách toàn trường"; để trỏ vào điểm trường đã xoá thì người
  -- ấy đăng nhập vào sẽ bị bó phạm vi vào một chỗ không còn tồn tại.
  update nguoi_dung n set diem_truong_id = null
   where n.diem_truong_id is not null
     and not exists (select 1 from diem_truong d where d.id = n.diem_truong_id);

  insert into ket_don values
    (1, 'Điểm trường đã xoá',       n_dt::text),
    (2, 'Lớp đã xoá',               n_lop::text),
    (3, 'Giáo viên mồ côi đã xoá',  n_gv::text),
    (4, 'Vài tên giáo viên đã xoá', coalesce(ten_gv, '—'));
end $$;

-- ---------- Báo cáo sau khi dọn ----------
select * from (
  select 0 as tt, 'ĐÃ DỌN' as viec, '' as so
  union all select tt, viec, so from ket_don
  union all select 5, '— còn lại —', ''
  union all select 6, 'Điểm trường', (select count(*) from diem_truong)::text
  union all select 7, 'Lớp',         (select count(*) from lop)::text
  union all select 8, 'Giáo viên',   (select count(*) from giao_vien)::text
  union all select 9, 'Dòng phân công',
    (select count(*) from phan_cong)::text || ' · ' ||
    (select coalesce(sum(so_tiet), 0) from phan_cong)::text || ' tiết/tuần'
  union all select 10, 'Từng điểm trường',
    coalesce((select string_agg(x.ten || ': ' || x.so_lop::text || ' lớp · '
                                || x.so_tiet::text || ' tiết', '   ' order by x.ten)
              from (select d.ten,
                           count(distinct l.id) as so_lop,
                           coalesce(sum(p.so_tiet), 0) as so_tiet
                    from diem_truong d
                    left join lop l on l.diem_truong_id = d.id
                    left join phan_cong p on p.lop_id = l.id
                    group by d.ten) x), 'không còn điểm trường nào')
  union all select 11, 'Bản đang công bố còn khớp không',
    coalesce((select
        (select count(*) from jsonb_object_keys(v.du_lieu -> 'tkb') k
          where exists (select 1 from lop l where l.id::text = k))::text
        || '/' ||
        (select count(*) from jsonb_object_keys(v.du_lieu -> 'tkb'))::text
        || ' lớp còn khớp'
      from tkb_phien_ban v where v.cong_bo order by v.version desc limit 1),
      'chưa công bố bản nào')
) b order by tt;
