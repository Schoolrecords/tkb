/* ==================================================================
   MẪU CẤU HÌNH MÁY CHỦ
   ------------------------------------------------------------------
   Chép tệp này thành  src/cauhinh.js  rồi điền hai giá trị thật.
   Lấy chúng trong Supabase → Settings → API Keys.

   Supabase có hai đời khoá, phần mềm nhận cả hai:
     · Dự án mới  → khung "Publishable key", chuỗi  sb_publishable_...
     · Dự án cũ   → khung "anon public",     chuỗi  eyJhbGciOi...

   Đây là khoá CÔNG KHAI — để ở trình duyệt vẫn an toàn, vì Row Level
   Security trong db/schema.sql mới là thứ chặn truy cập dữ liệu.

   TUYỆT ĐỐI không dán khoá  sb_secret_...  hay  service_role  vào đây.
   Những khoá đó bỏ qua mọi hàng rào, lộ ra là mất sạch dữ liệu.

   src/cauhinh.js đã nằm trong .gitignore nên không bị đẩy lên GitHub.
   Không có tệp này thì ứng dụng tự chạy bằng dữ liệu mẫu trong data/.

   Lưu ý: mở index.html bằng đường dẫn file:// thì trình duyệt không nạp
   được tệp này. Chạy qua máy chủ web bằng lệnh  npm start.
   ================================================================== */
export const SUPABASE_URL  = 'https://xxxxx.supabase.co';
export const SUPABASE_ANON = 'sb_publishable_...';   // hoặc 'eyJhbGciOi...' nếu là dự án cũ
