-- ============================================================
--  SỐ HIỆU VÀ NGÀY THỰC HIỆN CỦA THỜI KHOÁ BIỂU  (29/8/2026)
--
--  Chủ dự án: *"Các bản in Thời khóa biểu … khi ký và ban hành có tính
--  pháp lý, có thể trong 1 học kỳ nhiều Phiên bản … Đánh số liên tiếp
--  theo cả năm học, từ 01 đến hết, chứ không theo học kỳ. Vẫn phải để
--  ngày thực hiện, vì đó là tính pháp lý của văn bản!"*
--
--  Trước tệp này, `tkb_phien_ban` chỉ có `version` — con số kỹ thuật nhảy
--  mỗi lần bấm Lưu (một mùa xếp lên tới sáu chục). Nó KHÔNG phải số hiệu
--  văn bản: nhà trường ban hành vài bản một năm, đánh 01, 02, 03.
--
--  Bốn cột dưới đây gắn vào ĐÚNG bản được công bố, nên mọi bản in — lớp,
--  giáo viên, khối, toàn trường — đọc cùng một nguồn và không thể lệch.
--
--  Chạy MỘT LẦN trong SQL Editor. Chạy lại nhiều lần vẫn an toàn.
-- ============================================================

-- ------------------------------------------------------------
--  0. ĐÚNG DỰ ÁN CHƯA?
--
--  Chủ dự án có nhiều dự án Supabase và đã dán nhầm một lần (30/8/2026).
--  Postgres khi ấy báo `relation "tkb_phien_ban" does not exist` — đúng
--  nhưng khó đoán, dễ tưởng tệp SQL viết sai. Hỏi trước bằng tiếng Việt.
-- ------------------------------------------------------------
do $$
begin
  if to_regclass('public.tkb_phien_ban') is null then
    raise exception
      'Cơ sở dữ liệu này không có bảng của phần mềm Thời khóa biểu. Nhiều khả năng SQL Editor đang mở NHẦM DỰ ÁN — thoát ra, chọn đúng dự án của trường rồi chạy lại.';
  end if;
end $$;

alter table tkb_phien_ban add column if not exists so_hieu       integer;
alter table tkb_phien_ban add column if not exists ngay_thuc_hien date;
alter table tkb_phien_ban add column if not exists hoc_ky         text;
alter table tkb_phien_ban add column if not exists ban_hanh_luc   timestamptz;

-- ⚠️ SỐ HIỆU KHÔNG ĐƯỢC TRÙNG trong một trường. Hai phó hiệu trưởng cùng
--    bấm Công bố một tối thì cả hai đều đọc "số lớn nhất là 2" rồi cùng
--    ghi số 3 — hai văn bản khác nhau mang cùng một số hiệu là hỏng hẳn
--    về mặt hành chính, mà lại không ai thấy. Chỉ số *partial* vì bản
--    chưa công bố thì so_hieu để trống.
create unique index if not exists ux_tkb_so_hieu
  on tkb_phien_ban (truong_id, so_hieu) where so_hieu is not null;

-- ⚠️ `ban_hanh_luc` là NGÀY KÝ, khoá lại lúc bấm Công bố — khác hẳn
--    `ngay_thuc_hien` (mốc bắt đầu có hiệu lực) và khác ngày bấm nút In.
--    Bản in cũ ghi ngày hôm nay, nên in lại tháng sau là ra một ngày
--    khác: hai bản của cùng một thời khóa biểu mang hai ngày ban hành,
--    không dùng làm căn cứ được nữa.

-- ------------------------------------------------------------
--  Bản ĐANG công bố coi như số 01 nếu chưa có số hiệu — để trường đang
--  chạy không mất số. Ngày thực hiện thì KHÔNG đoán hộ: nhà trường tự
--  ghi, vì đó là mốc pháp lý chứ không phải dữ liệu kỹ thuật.
-- ------------------------------------------------------------
update tkb_phien_ban v
   set so_hieu = 1,
       ban_hanh_luc = coalesce(ban_hanh_luc, tao_luc)
 where cong_bo
   and so_hieu is null
   and not exists (select 1 from tkb_phien_ban x
                    where x.truong_id = v.truong_id and x.so_hieu is not null);

-- ------------------------------------------------------------
--  Kiểm lại
-- ------------------------------------------------------------
-- Bốn cột mới phải có mặt:
select column_name, data_type
from information_schema.columns
where table_name = 'tkb_phien_ban'
  and column_name in ('so_hieu','ngay_thuc_hien','hoc_ky','ban_hanh_luc')
order by column_name;

-- Các bản đã công bố của từng trường — số hiệu không được trùng nhau:
select t.ten as truong, v.so_hieu, v.version, v.hoc_ky,
       v.ngay_thuc_hien, v.ban_hanh_luc, v.cong_bo
from tkb_phien_ban v join truong t on t.id = v.truong_id
where v.so_hieu is not null
order by t.ten, v.so_hieu;
