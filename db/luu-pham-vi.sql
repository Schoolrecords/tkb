-- ============================================================
-- LƯU THEO PHẠM VI — ba phó hiệu trưởng cùng xếp một buổi tối
-- ------------------------------------------------------------
-- Chạy MỘT LẦN trong SQL Editor (đã nằm trong db/cai-dat.sql).
--
-- VÌ SAO CẦN
--   Một trường ba điểm trường thì có ba phó hiệu trưởng cùng sửa thời
--   khóa biểu cùng một buổi tối. Đó không phải trường hợp hiếm — đó là
--   mặc định sau sáp nhập.
--
--   Bản cũ lưu NGUYÊN KHỐI: mỗi lần bấm Lưu là gửi lên toàn bộ lưới của
--   cả trường theo trí nhớ của MÁY MÌNH. Khoá lạc quan chỉ biết TỪ CHỐI
--   người đến sau, không biết GỘP — nên trong ba người thì hai người phải
--   tải lại, và tải lại là mất sạch việc vừa làm.
--
--   Hai lỗi đã tái hiện được bằng phép thử (npm test mục 20):
--
--   1. Bị từ chối xong bấm Lưu lần nữa là LỌT. Máy chủ trả kèm số phiên
--      bản hiện hành trong chính lời từ chối, phần mềm nuốt luôn con số
--      ấy, nên lần bấm thứ hai khớp version và ghi đè phần đồng nghiệp.
--
--   2. Cửa sổ gộp 10 phút làm khoá lạc quan mất tác dụng. Phép gộp thay
--      RUỘT của dòng mà KHÔNG đổi số phiên bản, nên số phiên bản thôi
--      không còn là dấu vân tay của nội dung. Người làm ĐÚNG quy trình —
--      tải lại rồi mới sửa — vẫn xoá mất việc của đồng nghiệp, và máy chủ
--      vẫn báo "Đã lưu".
--
-- CÁCH CHỮA
--   p_pham_vi là danh sách mã lớp người gọi được phép sửa. Có phạm vi thì
--   máy chủ lấy BẢN MỚI NHẤT làm nền rồi chỉ thay đúng những lớp ấy, thay
--   vì nuốt nguyên khối của máy gửi lên. Ba phó hiệu trưởng xếp ba tập lớp
--   RỜI NHAU nên không bao giờ đụng nhau: không ai phải tải lại, không ai
--   mất việc.
--
--   Blob vốn đã có dạng {mã lớp: {ô: tiết}} nên gộp theo khoá lớp là việc
--   tự nhiên của jsonb — không phải đổi cách lưu.
--
-- ⚠️ PHẠM VI SUY TỪ TÀI KHOẢN, KHÔNG TIN THAM SỐ GỬI LÊN
--   db/schema.sql vốn ghi rõ: ranh giới PHT-một-điểm-trường CHỈ có ở giao
--   diện, "đừng viết mã dựa vào giả định rằng máy chủ sẽ chặn hộ". Nay
--   máy chủ chặn được thật: phó hiệu trưởng có diem_truong_id thì phạm vi
--   bị ÉP về đúng lớp của điểm ấy, gửi lên gì cũng vậy. Một hàng rào chỉ
--   ở giao diện nay thành hàng rào thật.
-- ============================================================

-- Điểm trường mà tài khoản đang đăng nhập phụ trách.
-- NULL = phụ trách toàn trường (quản trị, hiệu trưởng, PHT chuyên môn).
-- security definer + stable, cùng khuôn với truong_cua_toi().
create or replace function diem_truong_cua_toi()
returns uuid language sql stable security definer set search_path = public as $$
  select diem_truong_id from nguoi_dung
   where id = auth.uid() and vai_tro = 'pho_hieu_truong'
$$;

-- ------------------------------------------------------------
-- DỌN DỮ LIỆU CŨ — giữ 10 DÒNG gần nhất, không phải 10 SỐ gần nhất
-- ------------------------------------------------------------
-- Bản cũ cắt theo `max(version) - 10`. Nay phép gộp có tăng số phiên bản
-- (xem dưới) nên số phiên bản nhảy nhanh hơn số dòng — cắt theo hiệu số
-- là xoá quá tay, có khi còn chưa tới 3 bản. Xếp hạng rồi giữ 10 dòng
-- đầu thì đúng ý định ban đầu trong mọi trường hợp.
-- ============================================================
create or replace function don_du_lieu_cu(p_truong uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  c_giu constant integer := 10;   -- số bản gần nhất luôn giữ lại
begin
  -- Tự kiểm quyền: không tin tham số người gọi truyền vào
  if p_truong is null or p_truong <> truong_cua_toi() or not la_quan_ly() then
    return;
  end if;

  -- Bản ĐÃ CÔNG BỐ thì giữ mãi: đó là bản thầy cô đang xem, và là bản
  -- nhà trường chịu trách nhiệm. Chỉ dọn những bản nháp giữa chừng.
  delete from tkb_phien_ban t
   where t.truong_id = p_truong
     and t.cong_bo = false
     and t.id not in (
       select id from tkb_phien_ban
        where truong_id = p_truong
        order by version desc
        limit c_giu);

  -- Nhật ký chỉ giữ metadata nhỏ nên phình chậm, nhưng để lâu vẫn dồn.
  -- 18 tháng đủ phủ trọn một năm học cộng phần đầu năm sau.
  delete from nhat_ky
   where truong_id = p_truong and thoi_diem < now() - interval '18 months';
end $$;

-- ------------------------------------------------------------
-- LƯU THỜI KHÓA BIỂU — thêm tham số phạm vi
-- ------------------------------------------------------------
-- Phải drop bản 4 tham số cũ: thêm tham số là sinh ra một hàm MỚI chứ
-- không thay hàm cũ, để cả hai thì PostgREST không biết chọn bản nào.
drop function if exists luu_tkb(uuid, integer, jsonb, text);

create or replace function luu_tkb(
  p_truong uuid, p_version integer, p_du_lieu jsonb, p_ghi_chu text default null,
  p_pham_vi text[] default null)
returns table (ok boolean, version_moi integer, thong_bao text)
language plpgsql security invoker as $$
declare
  c_giay constant integer := 600;  -- cửa sổ gộp: 10 phút
  v_hien integer;
  v_gop  uuid;
  v_dt   uuid;
  v_pv   text[];
  v_nen  jsonb;
  v_tkb  jsonb;
  v_moi  jsonb;
  v_tong integer;
  v_khac integer := 0;
begin
  select coalesce(max(version), 0) into v_hien
    from tkb_phien_ban where truong_id = p_truong;

  -- ---------- 1. Phạm vi ĐƯỢC PHÉP sửa, suy từ tài khoản ----------
  v_dt := diem_truong_cua_toi();
  v_pv := p_pham_vi;
  if v_dt is not null then
    -- Phó hiệu trưởng phụ trách một điểm trường: ép về đúng lớp của điểm ấy.
    -- Gửi lên phạm vi rộng hơn, hay không gửi gì, đều bị bó lại ở đây.
    select coalesce(array_agg(l.id::text), '{}') into v_pv
      from lop l
     where l.truong_id = p_truong and l.diem_truong_id = v_dt
       and (p_pham_vi is null or l.id::text = any(p_pham_vi));
  end if;

  -- ---------- 2. Không có phạm vi = lưu nguyên khối, như cũ ----------
  -- Xếp tự động dựng lại lưới của cả trường nên vẫn phải đi đường này,
  -- và vẫn phải giữ khoá lạc quan chặt: từ chối bản cũ, không gộp mù.
  if v_pv is null then
    if p_version < v_hien then
      return query select false, v_hien,
        format('Đã có người lưu phiên bản %s. Mời tải lại rồi lưu tiếp.', v_hien);
      return;
    end if;
    v_moi := p_du_lieu;

  -- ---------- 3. Có phạm vi = GỘP vào bản mới nhất ----------
  else
    select du_lieu into v_nen from tkb_phien_ban
     where truong_id = p_truong and version = v_hien;
    v_nen := coalesce(v_nen, p_du_lieu);

    -- Nền: bỏ hết các lớp thuộc phạm vi ra khỏi bản mới nhất...
    select coalesce(jsonb_object_agg(e.k, e.v), '{}'::jsonb) into v_tkb
      from jsonb_each(coalesce(v_nen->'tkb', '{}'::jsonb)) as e(k, v)
     where not (e.k = any(v_pv));

    -- ...rồi lắp lại đúng phần người này gửi lên, chỉ trong phạm vi.
    -- Lớp trong phạm vi mà máy gửi lên không còn ô nào thì đúng là đã bị
    -- xoá — không lắp lại, nên thao tác xoá vẫn lưu được bình thường.
    select v_tkb || coalesce(jsonb_object_agg(e.k, e.v), '{}'::jsonb) into v_tkb
      from jsonb_each(coalesce(p_du_lieu->'tkb', '{}'::jsonb)) as e(k, v)
     where e.k = any(v_pv);

    -- Đếm số lớp NGOÀI phạm vi mà bản nền đang giữ — để nói cho người dùng
    -- biết họ vừa lưu chung với việc của đồng nghiệp, chứ không im lặng.
    if p_version < v_hien then
      select count(*) into v_khac
        from jsonb_each(coalesce(v_nen->'tkb', '{}'::jsonb)) as e(k, v)
       where not (e.k = any(v_pv))
         and jsonb_typeof(e.v) = 'object' and e.v <> '{}'::jsonb;
    end if;

    -- Phần ngoài lưới (khung giờ, điểm trường, lopDT) lấy theo máy gửi lên;
    -- riêng tổng số tiết phải tính lại vì lưới vừa đổi.
    select coalesce(sum(o.n), 0) into v_tong
      from (select (select count(*) from jsonb_object_keys(l.value)) as n
              from jsonb_each(v_tkb) l) o;
    v_moi := (p_du_lieu - 'tkb')
             || jsonb_build_object('tkb', v_tkb, 'tongTiet', v_tong);
  end if;

  -- ---------- 4. Gộp các lần lưu liên tiếp ----------
  -- Người xếp lịch hay bấm Lưu vài phút một lần suốt buổi tối. Không ai
  -- cần quay lại bản của 5 phút trước, nên ghi đè lên chính bản vừa lưu
  -- thay vì đẻ thêm dòng. Ba điều kiện đều bắt buộc:
  --   cùng người   — bản của đồng nghiệp thì tuyệt đối không đụng
  --   chưa công bố — bản thầy cô đang xem thì không được đổi ruột
  --   còn trong cửa sổ — cách nhau nửa buổi là hai lần làm việc khác nhau
  select id into v_gop from tkb_phien_ban
   where truong_id = p_truong and version = v_hien
     and cong_bo = false and nguoi_sua = auth.uid()
     and tao_luc > now() - make_interval(secs => c_giay)
   limit 1;

  -- ⚠️ Gộp thì VẪN TĂNG số phiên bản. Đây là chỗ đã cắn: đổi ruột mà giữ
  -- nguyên số nghĩa là số phiên bản không còn nói lên nội dung, và mọi
  -- máy đang giữ con số ấy tưởng mình còn mới. Không đẻ dòng mới nên chỗ
  -- chứa vẫn tiết kiệm đúng như trước; chỉ con số là phải nhích.
  if v_gop is not null then
    update tkb_phien_ban
       set du_lieu = v_moi,
           version = v_hien + 1,
           ghi_chu = coalesce(p_ghi_chu, ghi_chu),
           tao_luc = now()
     where id = v_gop;
  else
    insert into tkb_phien_ban (truong_id, version, du_lieu, ghi_chu, nguoi_sua)
    values (p_truong, v_hien + 1, v_moi, p_ghi_chu, auth.uid());
    perform don_du_lieu_cu(p_truong);
  end if;

  return query select true, v_hien + 1,
    case when v_khac > 0
      then format('Đã lưu phần của bạn, giữ nguyên %s lớp đồng nghiệp vừa sửa.', v_khac)
      else 'Đã lưu'::text end;
end $$;

-- ---------- Kiểm tra ----------
-- Phải ra ĐÚNG MỘT dòng luu_tkb, cột tham số có p_pham_vi. Ra hai dòng
-- luu_tkb nghĩa là bản 4 tham số cũ chưa bị drop — PostgREST sẽ không
-- biết chọn bản nào và nút Lưu sẽ đổ lỗi 300.
select p.proname as ten_ham, pg_get_function_identity_arguments(p.oid) as tham_so
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('luu_tkb', 'diem_truong_cua_toi')
order by p.proname;
