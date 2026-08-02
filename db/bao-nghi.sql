-- ============================================================
-- GIÁO VIÊN BÁO NGHỈ — thông báo theo NGÀY cụ thể
-- Chạy MỘT LẦN trong Supabase SQL Editor (đã gộp trong db/cai-dat.sql).
--
-- Vì sao KHÔNG dùng lại bảng gv_nghi:
--   gv_nghi là "buổi bận LẶP LẠI hằng tuần" — cô A không dạy được
--   chiều thứ Ba của mọi tuần. Đó là dữ liệu nguồn để XẾP thời khóa
--   biểu. Còn báo nghỉ là việc của MỘT NGÀY — cô A ốm sáng thứ Ba
--   15/9. Nhét chung một bảng thì một lần ốm làm hỏng cả khuôn tuần.
--   Đúng cặp đôi của nó là day_thay: báo nghỉ sinh ra việc, day_thay
--   là kết quả xử lý việc ấy.
--
-- Quyền: giáo viên TỰ gửi và TỰ huỷ thông báo của chính mình, nhưng
--   chỉ khi Ban Giám hiệu chưa xử lý. Quản lý đọc hết và chuyển trạng
--   thái. Đây là bảng DUY NHẤT giáo viên được ghi — mọi bảng nguồn
--   khác vẫn khoá kín.
--
-- Cần chạy db/schema.sql trước (dùng lại truong_cua_toi, la_quan_ly).
-- ============================================================

-- Trạng thái chỉ ba giá trị. Cố ý KHÔNG có "đang duyệt", "chờ ký",
-- "đã phê duyệt" — đây là tiện ích điều hành, không phải quy trình
-- hành chính. Bản giao việc nói rõ: không phê duyệt nhiều bước.
do $$ begin
  create type trang_thai_nghi_t as enum ('cho', 'xong', 'huy');
exception when duplicate_object then null; end $$;

create table if not exists bao_nghi (
  id            uuid primary key default gen_random_uuid(),
  truong_id     uuid not null references truong(id) on delete cascade,
  giao_vien_id  uuid not null references giao_vien(id) on delete cascade,
  ngay          date not null,
  -- Cố ý KHÔNG đặt tên cột là `buoi` và KHÔNG dùng kiểu buoi_t: enum ấy
  -- chỉ có S và C, còn báo nghỉ có thêm CN (cả ngày). Trùng tên cột với
  -- một enum khác nghĩa là bẫy đọc nhầm cho người sửa sau — bộ soát
  -- db/soat-sql.mjs bắt đúng chuyện này ngay lần chạy đầu.
  buoi_nghi     text not null check (buoi_nghi in ('S', 'C', 'CN')),  -- CN = cả ngày
  ly_do         text not null default 'Việc khác',
  ghi_chu       text,
  trang_thai    trang_thai_nghi_t not null default 'cho',
  gui_luc       timestamptz not null default now(),
  nguoi_gui     uuid references nguoi_dung(id) on delete set null,
  nguoi_xu_ly   uuid references nguoi_dung(id) on delete set null,
  xu_ly_luc     timestamptz,
  unique (truong_id, giao_vien_id, ngay, buoi_nghi)
);

create index if not exists ix_bn_truong_ngay on bao_nghi(truong_id, ngay desc);
create index if not exists ix_bn_trang_thai  on bao_nghi(truong_id, trang_thai);

alter table bao_nghi enable row level security;

-- Cả trường đọc được: giáo viên phải thấy thông báo mình đã gửi, và
-- người được phân dạy thay cần biết mình thay ai.
drop policy if exists p_bao_nghi_doc on bao_nghi;
create policy p_bao_nghi_doc on bao_nghi for select
  using (truong_id = truong_cua_toi());

-- Giáo viên TỰ gửi thông báo cho chính mình. Điều kiện giao_vien_id
-- phải trỏ về đúng hồ sơ nối với tài khoản đang đăng nhập — không thì
-- một người báo nghỉ hộ người khác được.
drop policy if exists p_bao_nghi_gui on bao_nghi;
create policy p_bao_nghi_gui on bao_nghi for insert
  with check (
    truong_id = truong_cua_toi()
    and (
      la_quan_ly()
      or giao_vien_id in (
        select gv.id from giao_vien gv where gv.nguoi_dung_id = auth.uid()
      )
    )
  );

-- Huỷ: chỉ thông báo của chính mình và chỉ khi còn 'cho'.
-- Quản lý xoá được mọi dòng (dọn dẹp).
drop policy if exists p_bao_nghi_huy on bao_nghi;
create policy p_bao_nghi_huy on bao_nghi for delete
  using (
    truong_id = truong_cua_toi()
    and (
      la_quan_ly()
      or (
        trang_thai = 'cho'
        and giao_vien_id in (
          select gv.id from giao_vien gv where gv.nguoi_dung_id = auth.uid()
        )
      )
    )
  );

-- Chuyển trạng thái 'cho' → 'xong' là việc của Ban Giám hiệu.
drop policy if exists p_bao_nghi_sua on bao_nghi;
create policy p_bao_nghi_sua on bao_nghi for update
  using      (truong_id = truong_cua_toi() and la_quan_ly())
  with check (truong_id = truong_cua_toi() and la_quan_ly());

-- ---------- Nâng cấp bảng day_thay ----------
-- Giáo viên được phân dạy thay cần một nút "Đã xem", và huy hiệu thông
-- báo phải giảm sau khi bấm. Cột này là chỗ nhớ việc đó.
-- `add column if not exists` để chạy lại lần nữa không sao.
alter table day_thay add column if not exists da_xem boolean not null default false;
-- Nối ngược về thông báo nghỉ đã sinh ra tiết dạy thay này — để màn
-- hình Dạy thay gom đúng nhóm, và huỷ thông báo thì biết gỡ tiết nào.
alter table day_thay add column if not exists bao_nghi_id uuid references bao_nghi(id) on delete set null;

-- Giáo viên phải TỰ bấm "Đã xem" được, nên cần một quy tắc UPDATE hẹp
-- dành riêng cho họ. Quy tắc p_day_thay_sua của quản lý vẫn giữ nguyên.
drop policy if exists p_day_thay_daxem on day_thay;
create policy p_day_thay_daxem on day_thay for update
  using (
    truong_id = truong_cua_toi()
    and gv_thay_id in (
      select gv.id from giao_vien gv where gv.nguoi_dung_id = auth.uid()
    )
  )
  with check (truong_id = truong_cua_toi());

-- ---------- Kiểm tra ----------
-- Phải ra 4 dòng quy tắc của bao_nghi:
--   p_bao_nghi_doc (SELECT) · p_bao_nghi_gui (INSERT)
--   p_bao_nghi_huy (DELETE) · p_bao_nghi_sua (UPDATE)
select policyname as ten_quy_tac, cmd as ap_dung_cho
from pg_policies where tablename = 'bao_nghi' order by cmd;
