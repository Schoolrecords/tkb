-- ============================================================
-- SIẾT QUYỀN GHI THEO CỘT — chặn tự nâng quyền và tự duyệt
-- ------------------------------------------------------------
-- Chạy SAU db/duyet-truong.sql (cần cột la_chu_he_thong và
-- trang_thai_duyet). Dán cả tệp vào SQL Editor, bấm Run.
-- Chạy lại nhiều lần cũng không sao.
--
-- VÌ SAO CÓ TỆP NÀY (rà soát 28/8/2026)
--   Quy tắc p_nd_sua trong db/schema.sql cho cán bộ quản lý ghi vào
--   nguoi_dung của trường mình:
--
--     create policy p_nd_sua on nguoi_dung for all
--       using (truong_id = truong_cua_toi() and la_quan_ly())
--
--   Đúng ở thời điểm viết. Nhưng RLS của Postgres cấp quyền theo DÒNG,
--   không theo CỘT — nên mỗi lần bảng nguoi_dung mọc thêm một cột
--   QUYẾT ĐỊNH QUYỀN thì quy tắc ấy lặng lẽ rộng ra: không ai sửa gì
--   mà hàng rào vẫn tụt. Nay bảng ấy có ba cột như vậy:
--
--     la_chu_he_thong  → đứng ngoài mọi trường, duyệt đơn đăng ký
--     vai_tro          → la_quan_ly() đọc thẳng cột này
--     diem_truong_id   → luu_tkb() đọc để ép phạm vi ghi của PHT
--
--   Ba đường khai thác, mỗi đường chỉ cần một lệnh PATCH:
--
--   1. LEO LÊN CHỦ HỆ THỐNG — nặng nhất. Cửa đăng ký trường cố ý để
--      mở nên ai cũng đi được: đăng ký một trường → thành quan_tri →
--      PATCH nguoi_dung {la_chu_he_thong:true} → đọc được danh sách
--      MỌI trường và họ tên · email người dùng của mọi trường
--      (p_truong_doc và p_nd_doc_he_thong đều mở cho chủ hệ thống),
--      duyệt hoặc chặn trường của người khác.
--
--   2. PHT MỘT ĐIỂM TRƯỜNG THÀNH TOÀN TRƯỜNG. luu_tkb() cố ý không
--      tin p_pham_vi client gửi lên mà tự đọc nguoi_dung.diem_truong_id
--      — nhưng chính người ấy sửa được cột ấy. Đặt về null là ghi đè
--      được lưới của cả ba điểm trường, đúng thứ ranh giới ấy sinh ra
--      để ngăn. Tự nâng vai_tro cũng cùng một kiểu.
--
--   3. TỰ DUYỆT TRƯỜNG. p_truong_sua cho quản lý update trường mình,
--      mà trang_thai_duyet và ma_truong nằm ngay trên bảng ấy. Một
--      trường đang chờ duyệt tự đặt 'dang_dung' là bỏ qua hẳn khâu
--      duyệt — truong_duoc_dung() chỉ đọc đúng cột đó.
--
-- VÌ SAO LÀ TRIGGER, KHÔNG PHẢI RLS
--   Postgres không có RLS theo cột. Viết thêm bao nhiêu policy cũng
--   không nói được câu "sửa dòng này thì được, nhưng đừng đụng cột
--   kia". Trigger BEFORE là chỗ duy nhất nói được câu ấy.
--
--   Trigger cũng CHẶN THẲNG bằng exception thay vì lặng lẽ bỏ qua.
--   Đúng bài học của suaHang(): một lệnh ghi bị chặn mà vẫn báo thành
--   công là thứ đắt nhất trong hệ này — đã trả giá hai lần (nút Công
--   bố, lưu tên trường), mỗi lần mất nhiều ngày.
--
-- KHÔNG PHÁ LUỒNG NÀO ĐANG CHẠY
--   src/index.html chỉ ĐỌC bảng nguoi_dung; mọi việc tạo · sửa · xoá
--   tài khoản đều đi qua Edge Function `tai-khoan`, mà hàm ấy dùng
--   khoá service_role nên auth.uid() là null và trigger bỏ qua. Nói
--   cách khác: bản vá này đóng đường PATCH thẳng — đường mà ứng dụng
--   thật chưa bao giờ dùng, chỉ kẻ tấn công mới cần.
--
--   Thêm màn hình đổi vai trò sau này thì cho đi qua Edge Function ấy,
--   đúng chỗ đã có sẵn chốt "chỉ quan_tri và hieu_truong" và chốt
--   cungTruong().
--
-- CÒN ĐƯỜNG NÀO CHO QUẢN TRỊ THẬT
--   Cả hai trigger bỏ qua khi auth.uid() is null — tức khi lệnh chạy
--   từ SQL Editor, từ khoá service_role, hoặc lúc khôi phục bản sao
--   lưu. Chủ dự án vẫn tự phong mình làm chủ hệ thống bằng đúng câu
--   lệnh cũ:
--
--     update nguoi_dung set la_chu_he_thong = true where email = '…';
--
--   Không lo cửa này bị lợi dụng: người dùng thường luôn đi qua
--   PostgREST và luôn mang một auth.uid(); còn ai cầm được khoá
--   service_role thì đã sở hữu cả cơ sở dữ liệu, một trigger không cản.
--
-- KHAI BÁO CHO BỘ SOÁT (npm run soat đọc đúng hai khuôn dưới đây)
--   CANH-COT: nguoi_dung.la_chu_he_thong
--   CANH-COT: nguoi_dung.vai_tro
--   CANH-COT: nguoi_dung.diem_truong_id
--   CANH-COT: truong.trang_thai_duyet
--   CANH-COT: truong.ma_truong
--   KHONG-CANH: nguoi_dung.truong_id — with check của p_nd_sua đã ép
--     về đúng trường của người gọi, không đẩy ai sang trường khác được.
-- ============================================================

-- Phòng khi tệp này chạy trên cơ sở dữ liệu dựng trước 24/8/2026:
-- thiếu cột thì trigger bên dưới không biên dịch nổi.
alter table nguoi_dung add column if not exists la_chu_he_thong boolean not null default false;


-- ------------------------------------------------------------
-- 1. nguoi_dung — ba cột quyết định quyền
-- ------------------------------------------------------------
-- security definer để đọc được hồ sơ người gọi mà không phụ thuộc quy
-- tắc đọc đang hiệu lực; auth.uid() bên trong vẫn là người gọi thật.
--
-- Hai mức nghiêm khác nhau, cố ý:
--   la_chu_he_thong  — CHỈ chủ hệ thống trao được, cho bất kỳ ai. Vai
--                      này đứng ngoài mọi trường nên không cán bộ nhà
--                      trường nào có tư cách trao nó.
--   vai_tro · diem_truong_id
--                    — không ai tự sửa của CHÍNH MÌNH. Sửa cho người
--                      khác thì vẫn theo quyền cũ: đó là việc quản trị
--                      bình thường, còn tự nâng cho mình thì không bao
--                      giờ là việc bình thường.
create or replace function chan_tu_nang_quyen()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_cu  boolean;
  v_la_chu boolean;
begin
  -- Không phải phiên người dùng cuối: SQL Editor, service_role, khôi phục
  if v_uid is null then return new; end if;

  -- a) Cột chủ hệ thống
  v_cu := case when tg_op = 'UPDATE' then coalesce(old.la_chu_he_thong, false)
               else false end;
  if coalesce(new.la_chu_he_thong, false) is distinct from v_cu then
    select coalesce(nd.la_chu_he_thong, false) into v_la_chu
      from nguoi_dung nd where nd.id = v_uid;
    if not coalesce(v_la_chu, false) then
      raise exception 'Chỉ chủ hệ thống mới đặt được quyền chủ hệ thống.'
        using errcode = '42501';
    end if;
  end if;

  -- b) Vai trò và điểm trường phụ trách — không tự sửa cho mình
  if tg_op = 'UPDATE' and new.id = v_uid then
    if new.vai_tro is distinct from old.vai_tro then
      raise exception
        'Không tự đổi vai trò của mình được. Nhờ người quản trị khác của trường đổi giúp.'
        using errcode = '42501';
    end if;
    if new.diem_truong_id is distinct from old.diem_truong_id then
      raise exception
        'Không tự đổi điểm trường phụ trách của mình được. Nhờ người quản trị khác đổi giúp.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end $$;

drop trigger if exists tg_chan_tu_nang_quyen on nguoi_dung;
create trigger tg_chan_tu_nang_quyen
  before insert or update on nguoi_dung
  for each row execute function chan_tu_nang_quyen();


-- ------------------------------------------------------------
-- 2. truong.trang_thai_duyet · truong.ma_truong — chỉ khâu duyệt
-- ------------------------------------------------------------
-- duyet_truong() là security definer nhưng auth.uid() bên trong nó vẫn
-- là chủ hệ thống đang bấm nút, nên nó đi qua trigger này bình thường.
-- Không cần cờ phiên, không cần ngoại lệ riêng.
--
-- CHỈ đặt trên UPDATE: bảng truong không có quy tắc INSERT nào, dòng
-- trường mới chỉ sinh ra từ dang_ky_truong() — và hàm ấy đã đặt sẵn
-- 'cho_duyet' với mã để trống.
--
-- Duyệt lại trường đã có mã thì GIỮ NGUYÊN mã cũ (quy tắc 24/8/2026),
-- nên trigger này không bao giờ cản việc duyệt lại.
create or replace function chan_tu_duyet_truong()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_la_chu boolean;
begin
  if v_uid is null then return new; end if;
  if new.trang_thai_duyet is not distinct from old.trang_thai_duyet
     and new.ma_truong is not distinct from old.ma_truong then
    return new;
  end if;

  select coalesce(nd.la_chu_he_thong, false) into v_la_chu
    from nguoi_dung nd where nd.id = v_uid;
  if not coalesce(v_la_chu, false) then
    raise exception
      'Trạng thái duyệt và mã trường do chủ hệ thống cấp, nhà trường không tự đổi được.'
      using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists tg_chan_tu_duyet_truong on truong;
create trigger tg_chan_tu_duyet_truong
  before update on truong
  for each row execute function chan_tu_duyet_truong();


-- ------------------------------------------------------------
-- 3. Soi lại — chạy xong dán tiếp đoạn này để xem đã gắn chưa
-- ------------------------------------------------------------
-- select c.relname as bang, t.tgname as trigger_canh
--   from pg_trigger t join pg_class c on c.oid = t.tgrelid
--  where not t.tgisinternal
--    and t.tgname in ('tg_chan_tu_nang_quyen','tg_chan_tu_duyet_truong')
--  order by 1;
--
-- Đúng thì ra HAI dòng: nguoi_dung và truong.
--
-- Muốn thử tay cho chắc: đăng nhập bằng một tài khoản quản trị trường
-- (KHÔNG phải chủ hệ thống) rồi gọi từ trình duyệt
--     PATCH /rest/v1/nguoi_dung?id=eq.<uid của mình>
--     {"la_chu_he_thong": true}
-- Phải nhận lỗi 42501 với câu tiếng Việt ở trên. Trước bản vá này lệnh
-- ấy trả về 204 và tài khoản thành chủ hệ thống.
