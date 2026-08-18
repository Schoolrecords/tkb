-- ============================================================
-- TẢI NHẸ CHO GIÁO VIÊN — hàm tkb_cua_toi()
-- ------------------------------------------------------------
-- Chạy MỘT LẦN trong SQL Editor (đã nằm trong db/cai-dat.sql).
--
-- VÌ SAO CẦN
--   Giáo viên là nhóm đông nhất và mở app mỗi sáng, nhưng họ chỉ cần
--   đúng ~23 ô của mình. Trước đây phần mềm tải cả khối thời khóa biểu
--   của toàn trường về rồi mới lọc ở trình duyệt — đo trên trường 40 lớp
--   là 51 KB, trong khi phần thật sự cần chỉ 1 KB.
--
--   Nhân lên quy mô nhiều trường thì đây là khoản băng thông lớn nhất
--   của cả hệ thống: giáo viên đông gấp hàng chục lần cán bộ quản lý.
--
-- CÔ LẬP DỮ LIỆU
--   Cố ý để `security invoker` chứ không phải definer: quy tắc p_tkb_doc
--   vẫn nguyên hiệu lực, nên giáo viên chỉ đọc được bản ĐÃ CÔNG BỐ của
--   ĐÚNG trường mình. Hàm này chỉ lọc bớt, không mở thêm cửa nào.
-- ============================================================
create or replace function tkb_cua_toi()
returns jsonb
language plpgsql stable security invoker
set search_path = public as $$
declare
  v_gv      uuid;
  v_version integer;
  v_du      jsonb;
  v_tkb     jsonb;
begin
  -- Hồ sơ giáo viên nối với tài khoản đang đăng nhập. Chưa nối thì trả
  -- null để phần mềm hiện đúng câu "tài khoản chưa nối hồ sơ giáo viên",
  -- không được rơi về lịch của người khác.
  select id into v_gv from giao_vien
   where truong_id = truong_cua_toi() and nguoi_dung_id = auth.uid()
   limit 1;
  if v_gv is null then return null; end if;

  select version, du_lieu into v_version, v_du
    from tkb_phien_ban
   where truong_id = truong_cua_toi()
   order by version desc limit 1;
  if v_version is null then return null; end if;

  -- Giữ nguyên hình dạng {mã lớp: {ô: tiết}} của blob gốc, chỉ bỏ đi
  -- những ô không phải của mình — nhờ vậy docTKB() bên phần mềm không
  -- phải biết là dữ liệu đã được lọc.
  select coalesce(jsonb_object_agg(x.lp, x.o), '{}'::jsonb) into v_tkb
    from (
      select l.key as lp,
             (select jsonb_object_agg(t.key, t.value)
                from jsonb_each(l.value) t
               where t.value->>'gvId' = v_gv::text) as o
        from jsonb_each(coalesce(v_du->'tkb', '{}'::jsonb)) l
    ) x
   where x.o is not null;

  return jsonb_build_object('version', v_version, 'tkb', v_tkb);
end $$;
