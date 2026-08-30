-- ============================================================
--  CHỦ HỆ THỐNG SỬA ĐƯỢC DỮ LIỆU CỦA TRƯỜNG KHÁC  (30/8/2026)
--
--  Chủ dự án: *"Thầy băn khoăn, tại sao Hệ thống của mình mà không thể quản
--  trị được? điều này nghe chưa chuyên nghiệp lắm! … nếu có thể vào từng
--  trường với chức năng như quản trị của trường đó thì vẫn tốt chứ sao?"*
--
--  ⚠️ LẬP LUẬN NGÀY 29/8 CÓ CHỖ HỤT, và đây là chỗ ấy: chủ hệ thống VỐN ĐÃ
--  có toàn quyền trên dữ liệu qua SQL Editor của Supabase — dự án là của
--  chính họ. Khoá quyền ghi trong app không bảo vệ dữ liệu khỏi ai cả; nó
--  chỉ đẩy người quản trị sang đường SQL tay, mà đường ấy NGUY HIỂM HƠN
--  HẲN: không kiểm ràng buộc, không ghi nhật ký, gõ nhầm một chữ là hỏng
--  cả bảng. Hàng rào đặt sai chỗ thì không phải hàng rào, chỉ là bất tiện.
--
--  RỦI RO THẬT KHÔNG PHẢI QUYỀN, MÀ LÀ GHI NHẦM TRƯỜNG — đang xem Vinh
--  Hưng mà bấm Lưu lại ghi vào Diễn Liên. Chỗ ấy chặn ở ứng dụng (mọi
--  đường ghi đi qua `truongDangXem()`, và phải bấm bật chế độ sửa có chủ
--  ý), còn tệp này chỉ mở cửa cho vai chủ hệ thống.
--
--  ⚠️ THÊM QUY TẮC MỚI, KHÔNG SỬA QUY TẮC CŨ — đúng khuôn
--  db/chu-he-thong-xem.sql. Năm trường đang chạy thật đều ghi qua các quy
--  tắc hiện có; viết lại chúng là đặt cược cả năm trường vào một lần chạy
--  SQL. RLS gộp quy tắc permissive bằng phép HOẶC nên thêm là đủ.
--
--  Chạy MỘT LẦN trong SQL Editor. Chạy lại nhiều lần cũng không sao.
--  Cần chạy db/duyet-truong.sql và db/chu-he-thong-xem.sql trước.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Đúng dự án, và đã có vai chủ hệ thống chưa?
-- ------------------------------------------------------------
do $$
begin
  if to_regclass('public.truong') is null then
    raise exception 'Không thấy bảng truong — đang đứng ở dự án Supabase KHÁC.';
  end if;
  if to_regprocedure('la_chu_he_thong()') is null then
    raise exception
      'Chưa có hàm la_chu_he_thong(). Chạy db/duyet-truong.sql trước rồi quay lại tệp này.';
  end if;
  if not exists (select 1 from pg_policies
                  where tablename = 'lop' and policyname = 'p_lop_doc_cht') then
    raise exception
      'Chưa mở quyền ĐỌC cho chủ hệ thống. Chạy db/chu-he-thong-xem.sql trước — sửa được mà không đọc được thì vô nghĩa.';
  end if;
end $$;

-- ------------------------------------------------------------
-- 1. Tám bảng dữ liệu nguồn
--
--    Đây là thứ nhà trường nhờ sửa nhiều nhất: lớp, giáo viên, phân công,
--    khung giờ. `for all` phủ cả INSERT · UPDATE · DELETE; `with check`
--    bắt buộc phải có, không thì UPDATE ghi được nhưng INSERT thì không.
-- ------------------------------------------------------------
do $$
declare b text;
begin
  foreach b in array array['diem_truong','khung_gio','lop','giao_vien',
                           'mon_hoc','phong','phan_cong','gv_nghi']
  loop
    if to_regclass(b) is null then
      raise notice 'Bỏ qua bảng % — chưa có trên máy chủ này', b;
      continue;
    end if;
    execute format('drop policy if exists p_%1$s_ghi_cht on %1$I', b);
    execute format(
      'create policy p_%1$s_ghi_cht on %1$I for all '
      || 'using (la_chu_he_thong()) with check (la_chu_he_thong())', b);
  end loop;
end $$;

-- ------------------------------------------------------------
-- 2. Thời khóa biểu đã lưu
--
--    `luu_tkb()` chạy security INVOKER và vốn đã nhận p_truong làm tham
--    số, nên chỉ cần quy tắc này là hàm ấy ghi được cho trường khác —
--    không phải sửa một dòng nào của hàm.
--
--    ⚠️ `diem_truong_cua_toi()` trả null cho chủ hệ thống (họ không thuộc
--    trường ấy), nên phạm vi lưu không bị bó vào phân hiệu nào — đúng ý:
--    người hỗ trợ sửa toàn trường, không phải một phân hiệu.
-- ------------------------------------------------------------
drop policy if exists p_tkb_ghi_cht on tkb_phien_ban;
create policy p_tkb_ghi_cht on tkb_phien_ban for all
  using (la_chu_he_thong()) with check (la_chu_he_thong());

-- ------------------------------------------------------------
-- 3. Thông tin trường
--
--    Đổi tên đơn vị, năm học, địa bàn. Không mở `delete` — xoá một dòng
--    `truong` là xoá SẠCH mọi bảng của trường ấy (`on delete cascade`),
--    việc ấy để SQL Editor có ý thức, đừng để lọt vào một cú bấm nhầm.
-- ------------------------------------------------------------
drop policy if exists p_truong_sua_cht on truong;
create policy p_truong_sua_cht on truong for update
  using (la_chu_he_thong()) with check (la_chu_he_thong());

-- ------------------------------------------------------------
-- 4. Nhật ký
--
--    Mọi thao tác hỗ trợ phải để lại dấu vết, không thì đúng một tháng
--    sau chính mình cũng không nhớ đã sửa gì cho ai.
--
--    ⚠️ p_nk_ghi (siết 29/8) đòi nguoi_dung_id = auth.uid(). Quy tắc mới
--    này giữ nguyên đòi hỏi ấy — chủ hệ thống ghi nhật ký dưới TÊN CỦA
--    CHÍNH MÌNH vào trường đang sửa, chứ không mạo danh ai.
-- ------------------------------------------------------------
drop policy if exists p_nk_ghi_cht on nhat_ky;
create policy p_nk_ghi_cht on nhat_ky for insert
  with check (la_chu_he_thong() and nguoi_dung_id = auth.uid());

-- ------------------------------------------------------------
-- 5. BA BẢNG VẪN CỐ Ý KHÔNG MỞ
--
--    ma_moi   — mã mời là chìa khoá vào một trường. Chủ hệ thống đã vào
--               được mọi trường rồi; đọc hay tạo mã của trường khác chỉ
--               thêm một đường vòng không ai cần.
--
--    bao_nghi — chứa LÝ DO NGHỈ (ốm, tang gia, việc riêng): dữ liệu cá
--               nhân nhạy cảm theo Nghị định 13/2023, và không giúp gì
--               cho việc sửa thời khóa biểu.
--
--    day_thay — suy ngược ra được ai nghỉ ngày nào, cùng lý do trên.
--
--    Trường nhờ xử lý đúng hai bảng này thì bảo họ thao tác, hoặc xin một
--    tài khoản trong trường — đó là việc trong-năm-học của nhà trường,
--    không phải việc kỹ thuật.
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- 6. Kiểm lại: phải thấy đủ 12 quy tắc mới
-- ------------------------------------------------------------
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public' and policyname like '%\_cht'
order by tablename, policyname;
