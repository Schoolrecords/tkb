-- ============================================================
--  CHỦ HỆ THỐNG XEM ĐƯỢC DỮ LIỆU CỦA MỌI TRƯỜNG — CHỈ ĐỌC
--  (29/8/2026)
--
--  Chủ dự án hỏi: "tài khoản chungtrt@gmail.com vào App thì sẽ có chức
--  năng gì? … muốn vào được tất cả các trường đăng ký sử dụng App, nhưng
--  khi vào thì lại chỉ hiển thị trường TH Diễn Liên."
--
--  Trước tệp này, vai chủ hệ thống chỉ thấy DANH SÁCH trường (tên, mã,
--  quy mô) qua ds_truong_he_thong(). Ruột của từng trường — lớp, giáo
--  viên, phân công, thời khóa biểu — vẫn bó theo truong_cua_toi(), nên
--  muốn giúp một trường đang mắc thì phải bảo họ chụp màn hình gửi.
--
--  Tệp này mở đúng MỘT chiều: ĐỌC. Không một quy tắc ghi nào được thêm.
--
--  ⚠️ VÌ SAO THÊM QUY TẮC MỚI CHỨ KHÔNG SỬA QUY TẮC CŨ.
--  Năm trường đang chạy thật và mọi lần mở app của họ đều đi qua đúng
--  những quy tắc đọc ấy. Viết lại chúng nghĩa là đặt cược cả năm trường
--  vào một lần chạy SQL. RLS của Postgres gộp các quy tắc permissive
--  cùng lệnh bằng phép HOẶC, nên thêm một quy tắc riêng cho vai chủ hệ
--  thống là đủ — quy tắc cũ không bị đụng tới một chữ.
--
--  ⚠️ HÀNG RÀO GHI VẪN NGUYÊN. Mọi quy tắc INSERT · UPDATE · DELETE vẫn
--  đòi truong_id = truong_cua_toi(), nên chủ hệ thống mở dữ liệu trường
--  khác thì máy chủ TỪ CHỐI mọi lệnh ghi. Cờ chỉ-xem bên ứng dụng chỉ
--  làm phần giao diện cho đỡ khó hiểu; hàng rào thật nằm ở đây.
--
--  Chạy MỘT LẦN trong SQL Editor. Chạy lại nhiều lần cũng không sao.
--  Cần chạy db/duyet-truong.sql trước (tệp ấy tạo la_chu_he_thong()).
-- ============================================================

-- ------------------------------------------------------------
-- 0. Chưa có vai chủ hệ thống thì dừng ngay, đừng chạy nửa vời
-- ------------------------------------------------------------
do $$
begin
  if to_regprocedure('la_chu_he_thong()') is null then
    raise exception
      'Chưa có hàm la_chu_he_thong(). Chạy db/duyet-truong.sql trước rồi quay lại tệp này.';
  end if;
end $$;

-- ------------------------------------------------------------
-- 1. Tám bảng khai báo — cùng một khuôn nên gộp một vòng
--
--    ⚠️ Danh sách này CỐ Ý không đủ mọi bảng. Ba bảng bị bỏ ra ngoài,
--    mỗi bảng một lý do riêng, ghi rõ ở mục 4 phía dưới.
-- ------------------------------------------------------------
do $$
declare b text;
begin
  foreach b in array array['diem_truong','khung_gio','lop','giao_vien',
                           'mon_hoc','phong','phan_cong','gv_nghi']
  loop
    -- mon_hoc và phong là hai bảng thêm sau (db/mon-hoc-phong.sql). Cơ sở
    -- dữ liệu chưa chạy tệp ấy thì bỏ qua, chứ không làm đổ cả lệnh.
    if to_regclass(b) is null then
      raise notice 'Bỏ qua bảng % — chưa có trên máy chủ này', b;
      continue;
    end if;
    execute format('drop policy if exists p_%1$s_doc_cht on %1$I', b);
    execute format(
      'create policy p_%1$s_doc_cht on %1$I for select using (la_chu_he_thong())', b);
  end loop;
end $$;

-- ------------------------------------------------------------
-- 2. Thời khóa biểu đã lưu
--
--    Quy tắc p_tkb_doc cũ chỉ cho giáo viên đọc bản ĐÃ CÔNG BỐ. Vai chủ
--    hệ thống đọc được cả bản nháp — vì việc cần giúp thường rơi đúng
--    vào lúc trường xếp dở, chưa công bố được.
-- ------------------------------------------------------------
drop policy if exists p_tkb_doc_cht on tkb_phien_ban;
create policy p_tkb_doc_cht on tkb_phien_ban for select using (la_chu_he_thong());

-- ------------------------------------------------------------
-- 3. Nhật ký thao tác
--
--    Đây là thứ trả lời được câu "ai vừa làm gì mà hỏng" — công cụ chẩn
--    đoán chính khi một trường báo mất dữ liệu. Không có nó thì mở được
--    dữ liệu cũng chỉ thấy hiện trạng, không thấy chuyện đã xảy ra.
-- ------------------------------------------------------------
drop policy if exists p_nk_doc_cht on nhat_ky;
create policy p_nk_doc_cht on nhat_ky for select using (la_chu_he_thong());

-- ------------------------------------------------------------
-- 4. BA BẢNG CỐ Ý KHÔNG MỞ — đọc kỹ trước khi thêm vào
--
--    ma_moi   — mã mời là chìa khoá vào một trường. Đọc được mã của
--               trường khác nghĩa là tự vào được trường ấy với vai mã
--               đó mang, tức đi vòng qua chính hàng rào ghi mà tệp này
--               giữ nguyên. Muốn giúp thì không cần biết mã của ai.
--
--    bao_nghi — chứa LÝ DO NGHỈ của từng thầy cô (ốm, việc riêng, tang
--               chế). Đó là dữ liệu cá nhân nhạy cảm theo Nghị định
--               13/2023/NĐ-CP, và không giúp gì cho việc khai báo hay
--               xếp lịch. Quyền tối thiểu: không cần thì không mở.
--
--    day_thay — đi liền bao_nghi, suy ngược ra được ai nghỉ ngày nào.
--
--    Ứng dụng đọc hai bảng cuối bằng .catch(() => []) nên thiếu chúng
--    thì màn hình vẫn mở bình thường, chỉ là không có dòng nào.
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- 5. Kiểm lại — phải ra 10 dòng, tất cả đều là SELECT
-- ------------------------------------------------------------
select tablename as bang, policyname as quy_tac, cmd as lenh
from pg_policies
where schemaname = 'public' and policyname like '%\_cht'
order by tablename;

-- Soi cho chắc: không một quy tắc ghi nào lọt vào tệp này.
-- Câu dưới phải trả về 0 dòng.
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public' and policyname like '%\_cht' and cmd <> 'SELECT';

-- Ai đang là chủ hệ thống — phải đúng người, không thừa một ai:
select ho_ten, email from nguoi_dung where la_chu_he_thong;
