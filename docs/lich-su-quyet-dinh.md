# Lịch sử quyết định — những việc đã xong

Tách khỏi **mục 9 · Việc cần làm tiếp** của `CLAUDE.md` ngày 2/8/2026, vì
mục ấy đã phình tới gần hai trăm dòng và phần lớn là việc ĐÃ XONG — người
(và AI) mở ra phải lội qua toàn chuyện cũ mới thấy việc còn phải làm.

**Nội dung dưới đây là nguyên văn**, không tóm tắt, không viết lại. Giữ đủ
ngày tháng, tên hàm, số đo và các “bẫy” đã trả giá — đó mới là thứ đáng giữ:
sửa lại vùng mã cũ mà không biết bẫy nằm ở đâu là dẫm lại đúng vết cũ.

Mục 9 trong `CLAUDE.md` nay chỉ còn việc **chưa** làm.

Mục 9 vốn có ba phần; các tiêu đề phần được giữ lại nguyên vẹn bên dưới để
biết mỗi việc vốn nằm ở đâu — riêng *Lộ trình đã duyệt* còn mang thông tin
về **thứ tự chủ dự án chốt**, mất tiêu đề ấy là mất luôn ý nghĩa đó.

---

## Nền móng — các mục không ghi ngày trong bản gốc

Những việc dựng nền, làm xong trước khi nhật ký bắt đầu ghi ngày tháng.

- [x] Tầng truy cập dữ liệu: `taiDuLieu()`, `luuTKB(tkb, version)`, `lichSuPhienBan()`, `dangNhap()`
- [x] Đăng nhập giáo viên bằng email + mật khẩu, dò về `giao_vien.nguoi_dung_id`
- [x] Phân quyền: quản trị (toàn trường) → PHT (điểm trường phụ trách) → giáo viên (chỉ xem)
- [x] Nhập PCGD từ Excel, **ghi thẳng lên máy chủ** (`ghiDuLieuNguon`)
- [x] Xuất TKB ra Excel/PDF theo lớp, theo giáo viên, theo điểm trường
- [x] Khung giờ theo khối — `khung_gio.so_tiet_khoi`, khối nhỏ tan sớm hơn
- [x] Tối ưu ràng buộc mềm bằng hoán đổi cục bộ sau bước xếp tham lam
- [x] Màn hình tự đăng ký trường mới — `db/dang-ky-truong.sql`
- [x] Mời thành viên qua giao diện — `db/edge-function-tai-khoan.ts`
- [x] Hướng dẫn sử dụng theo vai trò trong app
- [x] Phép thử giao diện thật `npm run soi` (jsdom)
- [x] Danh mục môn và bảng phòng thành dữ liệu — `db/mon-hoc-phong.sql`
- [x] Định mức theo từng giáo viên (`dinhMucCua`), R01 · R08 tôn trọng
- [x] **CẦN NGƯỜI THẬT BẤM — không tự động hoá được:** vào phần mềm bấm
      **"Công bố cho giáo viên"** (hoặc chạy `db/cong-bo.sql` rồi
      `db/cong-bo-ngay.sql`). Cả 5 phiên bản trên máy chủ đang `cong_bo=false`,
      mà `p_tkb_doc` chỉ cho giáo viên đọc bản đã công bố. Mã, nút bấm và quy
      tắc UPDATE đều đã xong và đã có phép thử — chỉ thiếu một cú bấm có đăng
      nhập quản trị.
      ✅ **Xong 2/8/2026.** Chủ dự án đã bấm. Nay là 8 phiên bản (con số 5 ở
      trên là trạng thái lúc viết), **phiên bản 7 đang công bố** — lưu 15:15
      ngày 31/7/2026, 710 tiết. Soi bằng `db/soi-du-lieu.sql`: **25/25 lớp
      trong bản còn khớp bảng `lop`**, nghĩa là bản công bố lành, không phải
      bản rác dựng trên dữ liệu mẫu.
      ⚠️ Công bố xong **vẫn chưa ai xem được**, vì một lý do khác hẳn: cả cơ
      sở dữ liệu mới có MỘT tài khoản vai trò `quan_tri`, chưa có tài khoản
      giáo viên nào. Hai chuyện này dễ lẫn — công bố là mở CỬA, cấp tài khoản
      là đưa CHÌA. Thiếu cái nào cũng không vào được.

### Từ phần *Lộ trình đã duyệt 2/8/2026 (thứ tự chủ dự án chốt)*

- [x] Tên đơn vị mặc định là `Trường Tiểu học mới`, Diễn Liên thành điểm trường

## 31/7/2026

- [x] Dựng schema Supabase từ `db/schema.sql`, bật RLS, tạo tài khoản thử
      *(xong 31/7/2026 — dự án `tkb-dien-lien` ở Singapore, đã nạp 25 lớp ·
      35 GV · 265 dòng phân công, xếp 710/710 và lưu được phiên bản)*

## 1/8/2026

- [x] Lớp tham chiếu bằng `ma_lop`, cho phép trùng tên lớp giữa các điểm trường
      *(1/8/2026 — `db/ma-lop.sql`, xem nguyên tắc a mục 3)*
- [x] Chặn tài khoản giáo viên chưa nối hồ sơ, không rơi về người đầu danh sách
      *(1/8/2026 — `thieuHoSoGV()`; trước đây thầy cô xem nhầm lịch người khác)*
- [x] Chỉnh tay bằng chạm — dùng được trên điện thoại *(1/8/2026)*
- [x] Ghim tiết chỉnh tay + hoàn tác 20 bước *(1/8/2026)*
- [x] Màn hình **Buổi bận** — ràng buộc cứng số 7 nay nhập được từ giao diện
      *(1/8/2026 — `mBuoiBan()`, `luuBuoiBan()`, ghi thẳng vào `gv_nghi`)*
- [x] **Quy trình ba bước** — thanh bên xếp theo trình tự làm việc, thanh tiến
      trình ở Bảng điều hành, dải điều hướng trên từng màn hình *(1/8/2026)*
- [x] Năm màn hình khai báo còn thiếu: Thông tin trường · Lớp học · Môn học ·
      Phòng học · (Khối gộp vào Khung giờ). Trường mới không có tệp Excel nay
      vẫn khai báo được từ đầu tới cuối *(1/8/2026)*
- [x] Thêm/sửa/xoá lớp, giáo viên, môn, phòng và dòng phân công ngay trong app
      *(1/8/2026 — trước đây phải quay lại Excel)*
- [x] Hai sản phẩm còn thiếu: **TKB toàn trường** và **TKB theo khối**, kèm
      bản in A3 và trang tính Excel riêng cho mỗi khối *(1/8/2026)*
- [x] Chạy thử được ở quy mô thật khi chưa có danh sách CBGV — nút **Tạo dữ
      liệu thử** *(1/8/2026)*. Kịch bản 25+17+18 = 60 lớp xếp trọn 1698/1698.

### Từ phần *Lộ trình đã duyệt 2/8/2026 (thứ tự chủ dự án chốt)*

- [x] Thanh bên gọn lại: bỏ ba nút ở đáy, chuyển vào đúng chỗ dùng *(1/8/2026)*

### Từ phần *Đề xuất tiếp theo — xem `docs/danh-gia-va-de-xuat.md`*

- [x] Phòng chức năng thành **ràng buộc cứng thật** *(1/8/2026)* — `datDuoc()`,
      `doiChoDuoc()`, `kiemTraChuyen()` đều chặn; thêm quy tắc R12 báo thiếu
      chỗ. Chưa khai bảng phòng thì không siết, xem mục 4.

## 2/8/2026

- [x] Nhật ký thao tác và khôi phục phiên bản *(hoàn tất 2/8/2026)*.
      `taiNhatKy()` trong vùng DULIEU (trả dữ liệu thuần, PostgREST nhúng
      `nguoi_dung(ho_ten)` lấy tên người làm); hộp **Nhật ký thao tác** cạnh
      *Lịch sử phiên bản* trên màn hình Xếp, mã hành động dịch thành câu qua
      `MO_TA_HANH_DONG`. Chỉ quản lý đọc được (quy tắc `p_nk_doc` có sẵn).
- [x] Xếp kỹ chạy trong **Web Worker** *(2/8/2026)*. Giữ quy ước một tệp:
      Worker dựng từ Blob, mã lấy bằng `maVungLogic()` cắt vùng
      `/*#region LOGIC*/` từ chính trang + document giả — đúng khuôn
      `test/kiem-thu.mjs`. Không tạo được Worker (jsdom, trình duyệt cổ)
      thì `chayXepKy()` tự chạy tại chỗ như cũ. Nút *Xếp nhanh* (<1 giây)
      vẫn ở luồng chính, không đáng tách.
      Kiểm bằng `node test/soi-worker.mjs` (Chrome thật — jsdom không có
      Worker nên `npm run soi` chỉ kiểm được đường lui).
      ⚠️ Bẫy khi viết phép thử: `PA_TIM`, `WK_XEP`, `DANG_XEP_KY` là `let`
      mức trang, KHÔNG phải thuộc tính `window` — trong `p.evaluate()`
      phải đọc bằng tên trần, đọc `window.PA_TIM` là ra biến khác.
- [x] **PWA** — giáo viên cài app lên màn hình chính, mất mạng vẫn mở được
      trang *(2/8/2026)*. Ba tệp thêm vào `src/`: `manifest.webmanifest`,
      `sw.js`, `bieu-tuong-192/512.png` — ngoại lệ có chủ đích của quy ước
      một tệp, vì chuẩn web bắt buộc service worker là tệp riêng cùng nguồn.
      `sw.js` chạy **mạng trước, kho sau** (không bao giờ kẹt bản cũ) và
      **tuyệt đối không cache Supabase** (dữ liệu trường phải luôn tươi).
      Đăng ký chỉ khi chạy qua http/https — mở `file://` hay jsdom thì bỏ
      qua êm. Kiểm bằng `node test/soi-pwa.mjs` (Chrome thật: đăng ký,
      ngắt mạng tải lại vẫn mở, kho không dính Supabase).
- [x] **Ô tìm kiếm cho danh sách dài** *(2/8/2026)* — 10 màn hình, tìm không
      dấu, lọc tại chỗ không cướp con trỏ. Xem mục 3.
- [x] CI trên GitHub Actions: mỗi lần đẩy mã chạy đủ `npm test` (233) +
      `npm run soi` (159) *(2/8/2026 — `.github/workflows/kiem-thu.yml`;
      kiểm thử đỏ thì đừng triển khai)*
      ⚠️ Thư mục dự án nằm trong vùng đồng bộ đám mây: dịch vụ đồng bộ từng
      chèn 117 tệp `desktop.ini` vào `.git/` làm git báo `bad object
      refs/desktop.ini`, không fetch/push được. Cách chữa: xoá hết
      `desktop.ini` trong `.git/` (an toàn, chỉ là tệp hiển thị của Windows).
      Gặp lại lỗi ấy thì làm đúng vậy, đừng `git init` lại.
- [x] Bộ cài trọn gói `db/cai-dat.sql` — dựng CSDL cho trường mới chỉ còn
      MỘT lần dán *(2/8/2026)*. Tệp sinh tự động từ năm tệp nguồn
      (schema · mon-hoc-phong · cong-bo · day-thay · dang-ky-truong) bằng
      `node db/gop-cai-dat.mjs`; CI chạy `--kiem` nên sửa tệp nguồn mà quên
      sinh lại là đỏ ngay. Đừng sửa tay `cai-dat.sql`.

### Từ phần *Lộ trình đã duyệt 2/8/2026 (thứ tự chủ dự án chốt)*

- [x] 1. Module dạy thay / dạy bù *(xong 2/8/2026 — xem trên)*
- [x] 2. **Mẫu Excel một trang kiểu ma trận** *(2/8/2026)*. Trang `PHAN_CONG`:
      TT · Ma_GV · Ho_ten · Chu_nhiem · Lop_day · Buoi_ban · mỗi môn một cột.
      Quy ước ô: trống = không dạy; `x` = dạy ở mọi lớp trong Lop_day (trống
      thì lấy lớp chủ nhiệm); ghi danh sách lớp = dạy đúng các lớp ấy. **Số
      tiết không phải ghi** — lấy tiết chuẩn theo khối từ `S.monHoc` (danh mục
      hiện hành của trường, không phải hằng cứng). Ma_GV bỏ trống thì tự đặt
      GV01…, họ tên lặp thì bắt ghi mã; một người được nhiều dòng khi các môn
      khác bộ lớp. Trang DANH_SACH_LOP tùy chọn (bắt buộc khi nhiều điểm
      trường); không có thì lớp tự dựng, khối theo chữ số trong tên. Cột
      Buoi_ban (T2-S, T5-C) đổ vào `gv_nghi`, `ghiDuLieuNguon()` nay đẩy cả
      buổi bận lên máy chủ khi tệp có. `duLieuTuMaTran()` bung ma trận thành
      ba bảng rồi đi CHUNG đường `duLieuTuBang()` — một đường soát lỗi duy
      nhất. Phép thử vàng: xuất ma trận từ dữ liệu thật rồi nhập lại ra đúng
      265 dòng · 710 tiết, khớp từng dòng. Lệch chuẩn thì sửa trong app sau
      nhập hoặc dùng mẫu 3 trang (bỏ ý ghi đè `Toán:3` — thêm cú pháp là thêm
      chỗ gõ sai).
- [x] 3. **Đăng nhập Google + phễu demo + mã mời** *(2/8/2026)*. THÊM chứ
      không thay email/mật khẩu.
      · **OAuth thuần GoTrue**: `dangNhapGoogle()` chuyển hướng sang
        `/auth/v1/authorize`, `donVeOAuth()` đón vé trong `#hash` lúc mở
        trang — không thư viện ngoài, không khoá bí mật ở trình duyệt.
      · **Trạng thái KHÁCH** (`KHO.khach`): đăng nhập rồi nhưng chưa thuộc
        trường nào → màn chào bày ba lối: *Khám phá bản demo* · *Nhập mã
        mời* · *Đăng ký trường mới*. Giữ phiên, không đá ra — chống lặp
        sự cố tài khoản mồ côi. Đăng nhập mật khẩu mồ côi cũng thành khách.
      · **Bản demo** (`KHO.xemDemo`): mở toàn bộ giao diện với dữ liệu mẫu,
        dải nổi nhắc + lối thoát; mọi đường ghi máy chủ vẫn bị chặn sẵn vì
        `KHO.nguon !== 'may-chu'`. Ai chưa đăng nhập cũng xem demo được.
      · **Mã mời** (`db/ma-moi.sql`): quản trị tạo mã 6 ký tự cho từng thầy
        cô (nút *Mã mời Google* trong hộp Tài khoản), gửi Zalo; thầy cô đăng
        nhập Google gõ mã là RPC `dung_ma_moi` (SECURITY DEFINER) nối vào
        đúng hồ sơ `giao_vien` — không mật khẩu, không xác minh thư, mã dùng
        một lần, hạn 30 ngày. Bảng mã chỉ quản lý đọc được.
      ⚠️ **Việc tay để Google chạy thật** (ghi ở đầu `db/ma-moi.sql`):
      tạo OAuth client trên console.cloud.google.com (redirect URI
      `https://<dự-án>.supabase.co/auth/v1/callback`), dán Client ID/Secret
      vào Supabase → Authentication → Providers → Google, thêm địa chỉ
      trang vào Redirect URLs, và chạy lại `db/cai-dat.sql`.
      ✅ *Đã cấu hình xong và chạy thật 2/8/2026* — OAuth client nằm ở Google
      Cloud project `chungtran-51ccc` (App name: EduTech CT), Supabase vào
      bằng GitHub `Schoolrecords`.
- [x] **Quyết định 2/8/2026: Google là đường đăng nhập DUY NHẤT.** Chủ dự án
      chốt: mỗi CBGV đều có Gmail cá nhân (như số điện thoại), cấp quyền đi
      qua mã mời. **Toàn bộ giao diện mật khẩu đã GỠ BỎ** — không còn một ô
      `input[type=password]` nào trong trang (có phép thử canh):
      · Màn chào và hộp đăng nhập: chỉ một nút Google.
      · Hộp *Tài khoản*: bỏ ô cấp tài khoản, bỏ nút *Đổi mật khẩu* và *Cấp
        hàng loạt*; còn LIỆT KÊ · XOÁ · nút **Mã mời Google**.
      · *Đăng ký trường mới*: bắt đăng nhập Google trước, không tạo mật khẩu.
      · Đã xoá hẳn: `hopCapHangLoat`, `hopKetQuaHangLoat`, `trangInPhieu`,
        `hopXacMinh`, `hopDoiMatKhau`, `dangKyTaiKhoan`, `themThanhVien`,
        `datLaiMatKhau`, `tenDangNhapGV`, `matKhauNgauNhien` + mục 12 của
        bộ kiểm thử. Edge Function còn `tao`/`doi_mat_khau` nhưng app không
        gọi nữa.
      · **GIỮ `dangNhap()` trong vùng DULIEU** làm chốt khẩn cấp (gọi được
        từ console khi Google trục trặc) — không nút nào trỏ tới. Đừng xoá.
      · 37 tài khoản thử `@tkb.local` dọn bằng `db/don-tai-khoan-thu.sql`.
      Ứng xử Gmail: trường quản QUYỀN chứ không quản Gmail — thu quyền bằng
      nút xoá tài khoản, Gmail người dùng không bị đụng.

### Từ phần *Đề xuất tiếp theo — xem `docs/danh-gia-va-de-xuat.md`*

- [x] **Dạy thay / dạy bù** *(2/8/2026)* — tính năng giữ người dùng quay lại
      hằng tuần. Màn hình **Dạy thay** (nhóm TRONG NĂM HỌC, chỉ quản lý thấy):
      chọn ngày + người vắng + buổi → `tietVangCua()` liệt kê tiết trống →
      `goiYDayThay()` gợi ý người dạy thế, **lọc cứng đúng ràng buộc lõi**
      (trống tiết · không có tiết ở điểm trường khác cùng buổi · không đăng ký
      bận), chấm điểm mềm (đang có mặt tại điểm trường +50 · đã dạy lớp +30 ·
      đúng môn +20 · chủ nhiệm +15 · trừ theo số tiết trong ngày) và trả kèm
      lý do — máy gợi ý, người quyết. Lối thoát "Lớp tự quản" khi không bố trí
      được. Giáo viên được phân thấy dải báo ngay đầu màn *Của tôi*. Phép thử
      tất định đáng nhớ: giờ chào cờ cả 25 chủ nhiệm đều bận → gợi ý chỉ còn
      giáo viên bộ môn rảnh.
- [x] Màn hình nhật ký thao tác *(2/8/2026 — xem mục 9 ở trên)*
- [x] In tổng hợp toàn trường một tờ *(1/8/2026)* · [x] xuất `.ics` cho lịch
      điện thoại *(2/8/2026 — `taoICS()` trong vùng XUAT, RFC 5545 chuẩn:
      gấp dòng 75 byte, múi giờ Asia/Ho_Chi_Minh, mỗi tiết lặp hằng tuần tới
      31/5 của năm học. Giờ tiết là GIỜ GẦN ĐÚNG theo hằng `GIO_ICS` — sáng
      7:30, chiều 14:00, tiết 35′ nghỉ 5′ — vì mô hình dữ liệu không có giờ
      đồng hồ. Nút "Đưa vào lịch điện thoại" ở màn Của tôi và Theo giáo viên)*
- [x] **Bảng tra cập nhật tăng dần trong `xepTuDong()`** *(2/8/2026)* — nút
      thắt tốc độ cuối cùng. Trước đây gọi lại `chiSo()` cho **mỗi tiết**, mỗi
      lần quét toàn lưới: O(n²), ở 60 lớp là gần ba triệu lượt duyệt thừa. Nay
      dựng `chiSo()` **một lần** rồi `themChiSo()` cộng dồn sau mỗi tiết đặt
      xong. Đúng được vì bước tham lam **chỉ thêm, không bao giờ gỡ** tiết.
      Đo thật (bước tham lam, `xepTuDong(0)`):
      | Quy mô | Trước | Sau |
      |---|---|---|
      | 25 lớp · 710 tiết | 210 ms | **38 ms** |
      | 60 lớp · 1698 tiết | 1060 ms | **75 ms** |
      Vẫn xếp trọn 710/710 và 1698/1698. Hai phép thử canh: bảng tra cộng dồn
      phải **khớp tuyệt đối** với bản dựng lại (so cả ba bảng, đã sắp khoá),
      và lưới xếp xong không có ô nào hai giáo viên / ai vướng hai điểm trường
      một buổi. Sai một ly ở đây là hai giáo viên chung một ô mà không ai biết.

- [x] **Chạy `db/mon-hoc-phong.sql`** một lần trong Supabase SQL Editor. Chưa
      chạy thì app vẫn chạy bằng danh mục mặc định, chỉ là màn hình Môn học và
      Phòng học chưa lưu được lên máy chủ.
      ✅ **Xong 2/8/2026.** Không phải chạy riêng: `db/mon-hoc-phong.sql` đã
      nằm trong bộ cài gộp `db/cai-dat.sql` mà chủ dự án dán một lần. Soi
      bằng `db/soi-cai-dat.sql`: đủ **14/14 bảng** (có `mon_hoc` và `phong`),
      RLS bật hết. Từ nay màn hình Môn học và Phòng học lưu được lên máy chủ.
---

## 2/8/2026 chiều — rà soát hệ thống: bốn lỗi và một sự cố người dùng thật

Rà lại toàn hệ thống theo yêu cầu của chủ dự án. Bộ kiểm thử lúc bắt đầu đã
sạch (233 + 159 + 6 + 9 = 407 phép thử, 0 hỏng), nên bốn lỗi dưới đây đều nằm
ở chỗ mà kiểm thử không nhìn tới: **ranh giới giữa app và máy chủ Supabase**.

### Sự cố mở màn: cô giáo nhập mã mời xong, màn hình trắng

Một cô giáo dùng mã mời vào được phần mềm, thấy đúng tên mình, nhưng màn hình
*Thời khóa biểu của tôi* trắng trơn kèm dòng chữ **"Nhà trường chưa xếp
xong"** — trong khi trường đã xếp trọn **710/710 tiết**. Trên máy quản trị,
màn hình *Theo giáo viên* cũng trống với vài thầy cô khác.

Câu thông báo ấy **nói sai chuyện**, và tệ hơn: nó **giấu mất lỗi thật**. Màn
hình lịch cá nhân trống có **năm** nguyên nhân, cách sửa khác hẳn nhau:

| | Nguyên nhân | Cách sửa |
|---|---|---|
| 1 | chưa công bố bản nào | bấm *Công bố cho giáo viên* |
| 2 | bản công bố đã cũ | xếp lại rồi công bố lại |
| 3 | tài khoản chưa nối hồ sơ giáo viên | mục *Giáo viên · Tài khoản* |
| 4 | **nối NHẦM hồ sơ trùng tên** | thu hồi rồi cấp lại mã mời |
| 5 | tài khoản nằm ở trường khác | `db/sua-tai-khoan-mo-coi.sql` |

Nguyên nhân 4 là thứ dự án tự chuốc lấy: trường có **hai cô Dung, hai cô Linh,
hai cô Hương, hai cô Oanh**, và bộ sinh dữ liệu thử lại **cố ý** dùng đúng kho
tên ấy. Trên máy chủ thật còn sót hồ sơ giáo viên và lớp của bộ thử, nên ô chọn
trong hộp Mã mời bày ra nhiều người trùng tên mà không hề nói ai có tiết, ai
không.

**Đã làm ba việc:**

- `db/soi-tai-khoan-gv.sql` — soi từng tài khoản trên máy chủ: ở trường nào,
  nối hồ sơ nào, hồ sơ ấy có bao nhiêu tiết phân công, và có bao nhiêu tiết
  **trong bản đang công bố**. Cột `ket_luan` gọi thẳng tên nguyên nhân 1–5.
- `lyDoTrongLich(idGV, laToi)` — màn hình tự nói đúng nguyên nhân, nêu cả
  **mã giáo viên** đang nối để quản trị dò được ngay. Dùng ở cả *Của tôi* lẫn
  *Theo giáo viên* (chỗ chủ dự án nhìn thấy lưới trống mà không hiểu vì sao).
- Nút **Tạo N mã** trong hộp Mã mời: phát cả mẻ trong một cú bấm, kèm nút chép
  và tải Excel. **Bỏ qua có chủ đích** người đã có tài khoản và hồ sơ không có
  dòng phân công nào — phát mã vào hồ sơ rỗng là cầm chắc thêm một màn hình
  trắng nữa.

### Lỗi 1 — bảng `truong` không có quy tắc UPDATE nào

Bảng `truong` bật RLS nhưng từ đầu tới giờ **chỉ có `p_truong_doc` (SELECT)**.
Màn hình *Thông tin trường* vẫn PATCH thẳng vào bảng ấy. RLS bật mà thiếu quy
tắc thì PostgREST **không báo lỗi** — nó sửa 0 dòng rồi trả 204, y hệt ghi
thành công. Cộng thêm `.catch(()=>{})` nuốt nốt phần còn lại: sửa tên trường,
bấm Lưu, thấy báo đã lưu, tải lại trang thì tên cũ quay về.

Việc sắp cần tới ngay chính là đổi tên đơn vị khi có quyết định sáp nhập.
Vá bằng `db/sua-thong-tin-truong.sql` (đã gộp vào `db/cai-dat.sql`). Kèm một
lỗi nữa nằm sau lưng nó: lệnh cũ đẩy `nam_hoc: null` vào cột `not null`, bỏ
trống ô năm học là cả lệnh đổ — nay bỏ hẳn cột đó khỏi lệnh khi không có giá trị.

### Lỗi 2 — cùng cái bẫy ấy ở nút *Công bố cho giáo viên*

`congBoTKB()` cũng coi 204 là thành công. Đây đúng là sự cố đã trả giá một lần
(thiếu `p_tkb_sua`, vá bằng `db/cong-bo.sql`) — nhưng lần ấy chỉ vá **quy tắc**,
không vá **cách báo lỗi**. Trường nào cài từ bộ SQL cũ vẫn thấy dòng chữ xanh
*"Đã công bố phiên bản 7"* trong khi máy chủ không đổi gì.

Vá gốc: mọi lệnh sửa đi qua **`suaHang()`**, xin máy chủ trả lại chính những
dòng đã đổi (`Prefer: return=representation`) rồi **đếm**. 0 dòng là hỏng.

**Và để không có lần thứ ba:** `npm run soat` nay đối chiếu *"app ghi vào bảng
nào"* (đọc `src/index.html`) với *"bảng nào có quy tắc cho ghi"* (đọc `db/*.sql`,
hiểu cả quy tắc dựng trong vòng lặp `format()`). Đã kiểm chứng bộ soát này thật
sự đỏ khi bỏ quy tắc `p_truong_sua` đi. CI chạy nó trước cả `npm test`.

### Lỗi 3 — thầy cô vẫn bị hỏi mật khẩu mỗi sáng

`lamMoiPhien()` xin vé mới rồi chỉ đổi vé **trong bộ nhớ**, không ghi xuống
máy. Supabase **xoay vòng** vé làm mới: xin vé mới xong là vé cũ hỏng. Nên hôm
sau thầy cô mở app lên là vé dưới máy đã tiêu → đăng nhập lại. Đúng thứ mà cả
cơ chế "ghi nhớ đăng nhập" sinh ra để tránh.

Sửa một dòng: `if(docPhienNho()) nhoPhien();` — chỉ ghi khi người dùng đã chọn
ghi nhớ, bỏ tích thì không nhớ hộ. Ba phép thử canh, kèm một kho `localStorage`
giả trong `test/kiem-thu.mjs` (trước đó chạy trong Node là mọi lời gọi rơi vào
im lặng, nên vùng này chưa từng được kiểm).

### Lỗi 4 — mã mời sinh bằng `Math.random`

Mã mời là chìa khoá vào dữ liệu cả trường, mà dãy của `Math.random` đoán được
khi biết vài giá trị trước đó. Nay lấy `crypto.getRandomValues`, chia hết vòng
2³² rồi mới lấy dư để 31 chữ cái có cơ hội ngang nhau. Thêm một lần bốc lại khi
trùng mã — phát 35 mã một lượt thì đừng để một lần đen đủi làm hỏng cả mẻ.

### Một chỗ tài liệu nói sai, đã sửa

Chú thích đầu vùng `QUYEN` viết *"Hàng rào thật nằm ở Row Level Security"*.
Đúng với ranh giới **giáo viên ↔ quản lý**, nhưng **sai** với ranh giới
**PHT-một-điểm-trường**: `la_quan_ly()` gộp chung cả ba vai quản lý, nên xét
theo RLS thì PHT phụ trách điểm trường vẫn ghi được vào lớp của điểm khác.

Giữ nguyên như vậy là **có chủ đích** — thời khóa biểu lưu dạng một khối JSON
của cả trường, mà bảng quyền lại cho PHT được lưu, nên RLS không có cách nào
cắt theo điểm trường. Việc bó phạm vi ở giao diện là để người dùng khỏi giẫm
chân nhau, **không phải hàng rào an ninh**. Nay chú thích nói đúng như thế.

### Lỗi 5 — hồ sơ giáo viên tự nhân bản: 35 người thành 105 hồ sơ

Tìm ra cuối ngày 2/8/2026, khi chủ dự án hỏi một câu rất đúng chỗ: *"anh chỉ
mới nhập 35 giáo viên, tại sao hệ thống lại có 105?"* — kèm ảnh chụp ô chọn
giáo viên, **mỗi cái tên đúng ba bản**.

**Cơ chế.** Bước 3 của `ghiDuLieuNguon()` ghi `ma_gv: g.id`.

- Lần lưu **đầu**: `g.id` là mã app tự đặt (`gv_nguyen_thi_oanh`), máy chủ lưu
  đúng mã ấy và cấp cho dòng một UUID riêng.
- **Tải về**: `tuMayChu()` gán `id = <UUID máy chủ>`, `maGV = <ma_gv cũ>`.
- Lần lưu **sau**: ghi `ma_gv = <UUID>`. Upsert theo `(truong_id, ma_gv)` không
  khớp dòng nào → máy chủ **thêm nguyên một lứa 35 hồ sơ**. Ba lần lưu sau ba
  lần tải là **105**.

**Vì sao nó độc.** Bước 5 xoá sạch `phan_cong` rồi ghi lại theo lứa mới nhất,
nên hai lứa cũ thành hồ sơ **trùng tên, 0 tiết**. Đó chính là những hồ sơ rỗng
mà hộp Mã mời bày ra — và là thứ đã nối nhầm tài khoản cô Oanh. Một dòng mã
giải thích trọn cả ba triệu chứng của ngày hôm ấy.

**Điều đáng tiếc nhất:** đây **đúng là cái bẫy đã vá cho bảng LỚP**, và khối
chú thích *"⚠️ BẪY CHẾT NGƯỜI khi ĐỔI MÃ LỚP"* mô tả y hệt cơ chế này vẫn nằm
ngay bên dưới trong cùng một hàm. Lần ấy vá bảng lớp mà quên bảng giáo viên
nằm ngay bên trên. Vì thế 60 lớp vẫn đúng 60, còn giáo viên thì nhân ba.

**Bài học:** vá một lỗi upsert-theo-khoá-tự-nhiên thì phải rà **mọi** bảng
dùng cùng khuôn ấy trong cùng hàm, không chỉ bảng đang báo lỗi.

**Đã vá** y như bảng lớp: mã giữ **nguyên** (`g.maGV || g.id`), ai đã có trên
máy chủ (id là UUID) thì upsert theo `id`. Thêm bảng tra `idSv` (id-trong-app →
id-trên-máy-chủ) thay cho bảng `maGV` cũ — trước đây tra thẳng bằng ma_gv được
là vì hai thứ ấy *tình cờ* trùng nhau, đúng cái tình cờ đã sinh ra lỗi.

Hai phép thử canh: lưu lần hai sau khi tải về phải ghi theo `id` chứ không
theo mã, và mã giáo viên không bao giờ bị ghi đè bằng UUID.

**Dọn hậu quả trên máy chủ:** `db/don-ho-so-trung.sql` — soi trước rồi mới xoá,
và chỉ xoá hồ sơ **không dính gì cả** (không phân công, không chủ nhiệm lớp
nào, không giữ tài khoản nào), luôn giữ lại một bản cho mỗi họ tên. Chạy **sau**
`db/sua-noi-nham-ho-so.sql`, rồi xếp lại và công bố lại — bản đã công bố trỏ
theo id hồ sơ cũ.

### Bẫy `min(uuid)` — và bài học về cách đọc một con số không nhúc nhích

Trong lúc dọn hậu quả, tệp `sua-noi-nham-ho-so.sql` viết `min(g.id)` với `g.id`
kiểu `uuid`. Postgres **không có** `min(uuid)` — uuid không có toán tử so sánh
thứ tự. Cú pháp hợp lệ hoàn toàn nên `libpg-query` im lặng; lỗi chỉ nổ lúc chạy.

Hậu quả không phải là một thông báo lỗi rõ ràng, mà là **một con số đứng yên**:
bước nối lại tài khoản đổ ngay từ đầu, nên bước dọn phía sau không bao giờ có
gì để dọn, và số hồ sơ cứ ở nguyên 36 qua ba lần chạy. Chủ dự án phải nói
*"có mỗi việc này, làm mãi"* thì mới nhìn lại bước một.

**Bài học:** một con số không nhúc nhích sau khi đã "sửa" là dấu hiệu bước
TRƯỚC không chạy, không phải bước đang sửa chưa đủ mạnh. Nghi ngờ ngược lên
đầu chuỗi từ lần thứ hai, đừng lặp lại bước cuối.

**Bài học thứ hai, về thứ tự:** tệp dọn cố ý không đụng hồ sơ còn giữ tài
khoản. Đưa nó chạy TRƯỚC tệp nối lại thì nó không thể làm gì được — mà lại
không nói ra là vì sao. Nay `db/don-mot-lan.sql` gộp cả hai đúng thứ tự, và
báo cáo cuối nói rõ **chốt nào** đang giữ mỗi bản chưa xoá được, thay vì chỉ
trả ra một con số.

Đã thêm luật vào `db/soat-sql.mjs`: bắt `min()`/`max()` trên mọi cột khai kiểu
`uuid`, chỉ luôn cách viết đúng (`min(id::text)::uuid`). Có thử bằng một tệp
SQL cố tình sai — luật bắt được.

### Tinh chỉnh sau khi thầy cô dùng thật (2/8/2026, chiều muộn)

Bốn chỗ chủ dự án chỉ ra sau khi công bố thời khóa biểu và cô giáo đầu tiên
mở app lên xem.

**1. Thẻ tiết dính liền nhau.** Ngay lần tách SÁNG/CHIỀU đầu tiên: các thẻ
tiết chuyển vào trong `.bnhom`, mà `.bnhom` không khai `gap` — nên chúng thừa
hưởng khoảng cách của khối mới (không có) chứ không phải của `.ngay-t`. Hai
tiết cùng môn nằm cạnh nhau thì hai nền trùng màu dính thành một khối, nhìn
ra một tiết dài. Vá: `.bnhom{display:flex;flex-direction:column;gap:7px}` và
cho mỗi thẻ một **viền khép kín** — nền nhạt không thôi là chưa đủ để tách.

**2. Bỏ chức năng xuất `.ics`.** *"App các cô cũng mở được trên điện thoại,
không cần tính năng này nữa."* Đúng: PWA đã cho cài thẳng lên màn hình chính,
nên một đường xuất lịch nữa chỉ là thứ phải nuôi mà không ai dùng. Gỡ cả hai
nút, hàm `taoICS`/`taiICS`/`gapDongICS` và bảy phép thử. Còn một phép thử
canh chiều ngược lại: không ai được dựng lại nửa vời (nút mà thiếu hàm thì
bấm vào văng lỗi).

**3. Lưới rộng: bỏ HẲN vạch màu ở ô có tiết.** Hai lần chỉnh trước đều vấp:
3px thì cả bảng thành sọc, hạ xuống 2px vẫn là 25–60 vạch dọc chồng lên lưới.
Mẫu chủ dự án chốt chính là lưới RỖNG của Diễn Thái — chỉ còn kẻ ô thật mảnh.
Nay màu môn nhận diện **duy nhất bằng chữ tên môn**; vạch nào cũng thừa khi
tên môn đã mang màu.

**4. `tenDiemNgan()` — bỏ tiền tố "Điểm trường" ở MỌI chỗ hiển thị.** Trường
đặt tên không thống nhất: *Diễn Liên*, *Diễn Thái*, nhưng *Điểm trường Diễn
Đồng* — dải nút dài ngắn lệch nhau, trên điện thoại thì tràn hàng.

⚠️ Bẫy đáng nhớ: mã cũ đã có `.replace(/^Điểm trường\s*/i,'')` mà vẫn cắt hụt.
Nguyên nhân là **Unicode tổ hợp**: chữ "ể" dán từ Excel có thể là `e` + dấu
rời, nhìn y hệt nhưng không khớp chuỗi. Nay chuẩn hoá `normalize('NFC')` trước
khi cắt, và gộp chín chỗ `.replace` rải rác thành một hàm dùng chung.

**Vá tiếp `tenDiemNgan()` — và bài học về cách thay hàng loạt.** Bản đầu cắt
tiền tố bằng biểu thức trên nguyên chữ CÓ DẤU, nên trượt đúng tên gõ ở dạng
Unicode tổ hợp. Nay so khớp theo **TỪ đã bỏ dấu**: `Điểm trường`, `ĐIỂM TRƯỜNG`,
`điểm  trường` (thừa dấu cách), `Ðiểm trường` (chữ Ð khác mã), và cả dạng dấu
rời — tất cả ra cùng một kết quả. Chỉ cắt khi có ĐỦ hai từ và còn lại thứ gì
đó, nên tên đặt là *"Điểm A"* không bị xén oan.

⚠️ Bẫy thứ hai, đắt hơn: lần gộp chín chỗ `.replace` rải rác về một hàm đã
**trượt đúng một chỗ** — `daiDiemLuoi()`, tức chính dải nút chủ dự án nhìn
thấy. Chín chỗ kia đổi, chỗ thứ mười giữ nguyên biểu thức cũ, nên nút *Diễn
Đồng* (dạng NFC) cắt đúng còn *Diễn Thái* (dạng tổ hợp) thì không — hai lỗi
khác nhau trông y như một. Thay hàng loạt xong phải **đếm lại**: số chỗ thay
được có khớp số mẫu đưa vào không. Từ nay có phép thử soi thẳng dải nút, dựng
sẵn cả hai kiểu tên.

---

## 3/8/2026 — Báo nghỉ, dạy thay, và thanh bên năm nhóm

Bản giao việc lớn nhất từ trước tới nay (25 mục). Trọng tâm: chuyển app từ
*công cụ xếp lịch dùng vài tuần tháng 8* thành *công cụ điều hành dùng suốt
năm học*. Ghi lại những chỗ có trả giá hoặc có lý do không hiển nhiên.

### Bảng `bao_nghi` — và một lỗi bộ soát bắt được TRƯỚC khi dán vào máy chủ

Cột buổi nghỉ ban đầu đặt tên `buoi`, kiểu `text` có `check in ('S','C','CN')`.
Cú pháp hoàn toàn hợp lệ. `npm run soat` vẫn báo đỏ: nó thấy một cột tên `buoi`
so sánh với `'CN'`, mà trong schema `buoi` là cột kiểu enum `buoi_t` chỉ nhận
`S` và `C`.

Thoạt nhìn là báo nhầm — cột này là `text` cơ mà. Nhưng bộ soát **đúng về
tinh thần**: đặt tên cột trùng với một enum đã có nghĩa khác là để lại bẫy cho
người sửa sau, người sẽ đọc `buoi` rồi giả định `buoi_t`. Nay là `buoi_nghi`.
Đây đúng là loại lỗi bộ soát sinh ra để bắt — sai vì **ĐOÁN TÊN**, không phải
sai dấu phẩy.

Bài học chung: bộ soát báo đỏ ở chỗ mình tin là đúng thì trước khi tắt nó đi,
hãy hỏi *"nó đang cảnh báo điều gì mà mình chưa nghĩ tới"*.

### Vì sao KHÔNG dùng lại `gv_nghi`

`gv_nghi` là buổi bận **lặp lại hằng tuần** — dữ liệu nguồn để xếp lịch.
`bao_nghi` là việc của **một ngày**. Nhét chung một bảng thì cô A ốm sáng thứ
Ba 15/9 sẽ thành "cô A không dạy được sáng thứ Ba của mọi tuần", và một lần
ốm làm hỏng cả khuôn thời khóa biểu. Đúng cặp đôi của `bao_nghi` là
`day_thay`: một bên sinh ra việc, một bên là kết quả xử lý việc ấy.

### Bảng DUY NHẤT giáo viên được ghi vào

Mọi bảng nguồn vẫn khoá kín với vai trò giáo viên. `bao_nghi` là ngoại lệ
được thiết kế: quy tắc INSERT nối qua `giao_vien.nguoi_dung_id = auth.uid()`
nên không ai báo nghỉ hộ người khác được; quy tắc DELETE thêm điều kiện
`trang_thai = 'cho'` nên huỷ được chừng nào Ban Giám hiệu chưa bố trí.

Thêm một quy tắc UPDATE **hẹp** trên `day_thay` (`p_day_thay_daxem`) để giáo
viên tự bấm "Đã xem" — quy tắc của quản lý giữ nguyên, không nới ra.

### LỌC trước, CHẤM ĐIỂM sau

Quyết định thiết kế quan trọng nhất của `ungVienThay()`. Cách làm sai mà rất
dễ rơi vào: cho mọi giáo viên vào danh sách rồi trừ điểm nặng người đang bận.
Kết quả là người đang dạy lớp khác **vẫn hiện ra**, chỉ nằm cuối — và sớm muộn
có người bấm nhầm. Người vướng ràng buộc cứng phải BIẾN MẤT.

Bảy điều kiện loại, mỗi cái một dòng `return` riêng, cố ý không gộp: sửa một
điều kiện thì không đụng vào sáu điều kiện kia.

### Kiểm tra xung đột chạy HAI lần

Một lần lúc vẽ màn hình (nút *Xác nhận phân công* khoá luôn nếu có xung đột,
người dùng thấy vấn đề trong khi đang chọn), một lần nữa **ngay trước khi ghi**.

Lý do cho lần thứ hai: danh sách gợi ý dựng lúc mở màn hình có thể đã cũ —
người quản lý bên tab kia vừa lưu một phân công khác, hoặc một giáo viên vừa
báo nghỉ. Cùng một tinh thần với khoá lạc quan của `luuTKB()`.

Có xung đột thì **không dòng nào được lưu**, và hộp thoại nói rõ ai · khi nào ·
vì sao. Không lưu một phần rồi báo lỗi phần còn lại.

### Tham số `boQua` — chỗ dễ sót nhất

Khi người quản lý ĐỔI phương án đã chọn, tiết cũ đang được dời đi nên không
được tính là "người này đã bận". Thiếu tham số này thì đổi phương án lần thứ
hai là app tự báo xung đột với chính nó. Đúng khuôn `dangChiemPhong(…, boLop)`
đã dùng cho phòng chức năng — cùng một bài toán, nên dùng cùng một lối giải.

### Ba phương án, không bày điểm số

Người dùng là hiệu trưởng. Họ cần biết *"vì sao người này"*, không cần biết
137 hơn 129. Điểm phạt là ngôn ngữ của thuật toán, không phải của người quyết.

Cùng lý do ấy, bảng so sánh phương án ở màn hình *Xếp kỹ* đã **bỏ cột "Điểm
phạt"** và thay bằng năm con số nói thẳng: tiết đã xếp · chưa xếp · xung đột ·
tiết trống giữa buổi · lượt đổi điểm trường (`chiSoPhuongAn()`).

### KHÔNG dựng bảng thông báo riêng

Mọi dòng thông báo đều suy ra được từ `bao_nghi` và `day_thay`. Thêm một bảng
nữa là thêm một chỗ để lệch dữ liệu mà không có thêm một thông tin nào — và
thêm một quy tắc RLS phải nuôi.

Ba chỗ hiện huy hiệu (chuông · mục Dạy thay · khối Việc cần xử lý) đều gọi
`vieccanXuLy()`. Ba chỗ đếm bằng ba đoạn mã riêng thì sớm muộn lệch nhau.

### ⚠️ CSS mới chèn SAU media query thì mọi quy tắc điện thoại thành vô hiệu

Bẫy đã dính thật. Khối CSS của các thành phần mới được chèn ngay trước
`</style>` — tức là **sau** các `@media(max-width:900px)` vốn nằm giữa tệp.
Cùng độ ưu tiên thì quy tắc đứng sau thắng, nên `.viec-so{grid-template-columns:
repeat(2,1fr)}` trong media query bị `.viec-so{...auto-fit...}` ở khối mới đè
lên. Toàn bộ phần tối ưu điện thoại nằm đó mà không chạy, và **không có lỗi
nào** — chỉ là bố cục không đúng ý.

Bắt được nhờ chụp ảnh thật ở 360px rồi so với ý định, không phải nhờ phép thử.
Nay khối mới nằm trước mọi media query. Quy tắc chung: **CSS đáp ứng luôn phải
là phần cuối cùng của bảng kiểu.**

### ⚠️ `dsMonDung()` trả mảng CHUỖI, không phải mảng đối tượng

Ô tìm kiếm chung viết `m.ten` trên kết quả của `dsMonDung()` — ra `undefined`,
nên mục *Môn học* lặng lẽ biến mất khỏi kết quả tìm. Không lỗi, không cảnh
báo, chỉ thiếu. Khác hẳn `S.monHoc` vốn là mảng đối tượng có `.ten`.

### ⚠️ Cắt danh sách kết quả tìm phải cắt theo TỪNG LOẠI

Gõ "Diễn" thì 24 lớp *… · Diễn Liên* chiếm hết chỗ, và điểm trường **Diễn
Liên** — đúng thứ người dùng đang tìm — bị `slice(0,24)` đẩy văng ra ngoài.
Nay mỗi loại tối đa `TIM_MOI_LOAI = 6`.

### Việc cần xử lý lên trước cả thời khóa biểu

Ngày 2/8 đã chốt "sản phẩm lên trước, quy trình lùi sau" — thời khóa biểu là
khối đầu Bảng điều hành. Nay có một thứ được xếp lên trước nó nữa: **Việc cần
xử lý**.

Không mâu thuẫn, vì tiêu chí vẫn là một: *thứ nào có hạn giờ hơn thì lên
trước*. Cô A ốm sáng nay, tám giờ vào tiết — đó là việc của hôm nay. Tiến độ
xếp thời khóa biểu thì tuần sau xem cũng được. Thời khóa biểu vẫn đứng **trước
ba thẻ bước**, phép thử canh cả hai thứ tự.

Không ai báo nghỉ thì khối ấy vẫn hiện, nói thẳng *"Hôm nay không có giáo viên
báo nghỉ."* — người dùng cần biết điều đó, không phải nhìn khoảng trống rồi tự
đoán là chưa tải xong.

### Thẻ số liệu đổi từ navy sang nền trắng

Ngày 1/8 gộp bốn màu cam · lục · lam · tím thành một khối navy. Nay đổi tiếp
sang **nền trắng, chỉ giữ vạch màu 4px bên trái và ô biểu tượng có màu**. Lý
do: navy là màu của thanh điều hướng; dùng lại cho số liệu khiến hai thứ khác
hẳn nhau trông như cùng một loại, và một khối màu đậm chiếm hết đầu trang thì
mắt không còn chỗ nghỉ. Bốn con số ấy vốn đã có nhãn chữ ở dưới.

### Hỏi trước khi xoá kết quả xếp

Nút *Xoá kết quả* trước đây bấm một cái là bay sạch 710 tiết, chỉ còn dòng
thông báo nhỏ mách nước bấm Hoàn tác — mà nút Hoàn tác lại nằm ở màn hình
KHÁC. Nay hỏi trước, nói rõ **số tiết** và **số tiết đã ghim tay** (đó là công
sức chỉnh tay, xếp lại không dựng lại được).

### Nút Đặt lại mã giáo viên *(3/8/2026)*

Phát hiện khi soi máy chủ thật: `ma_gv` của cô Nguyễn Thị Oanh là
`1cc77cb6-df3d-469e-ac36-e4bc2171590f` — dư âm của lỗi upsert `ma_gv: g.id`.
Lỗi đã vá hôm 2/8 nên không đẻ thêm hồ sơ trùng, nhưng dữ liệu để lại thì chưa
ai dọn. Dựng bộ hàm y khuôn *Đặt lại mã lớp*.

**Kiểm chốt an toàn TRƯỚC khi viết một dòng nào.** Đổi `ma_gv` là chạm đúng
vào khoá tự nhiên đã gây ra thảm hoạ 105 hồ sơ. Đọc lại `ghiDuLieuNguon()`
thấy nó đã tách hai nhánh — ai có trên máy chủ thì upsert theo `id` — nên đổi
mã chỉ SỬA dòng cũ. An toàn. Nếu chưa có nhánh ấy thì việc này tuyệt đối không
được làm.

**Ngưỡng "xấu" phải nới từ 14 lên 20.** Mã giáo viên dài hơn mã lớp một cách
tự nhiên (tên gọi + ba chữ cái + hậu tố `_2`). Để nguyên 14 thì chính mã do
hàm sinh ra lại bị coi là xấu, `chuanMaGV()` chạy lại mỗi lần nạp và app báo
"vừa đặt lại mã" mãi không thôi. Có phép thử canh: *"Mã do chính hàm sinh ra
không bao giờ tự bị coi là xấu"* và *"chạy hai lần thì lần sau đổi 0 mã"*.

**⚠️ Một phép thử xanh mà không kiểm được gì.** Phép thử *"Từng dòng phân công
khớp nguyên bản"* của vòng xuất–nhập ma trận đối chiếu `gvId` nội bộ với mã
trong tệp Excel. Nó đã ánh xạ ngược cho LỚP (có chú thích hẳn hoi) nhưng bỏ qua
GIÁO VIÊN — và vẫn xanh suốt, vì `maGV` khi ấy còn trống nên `bangMauMaTran()`
rơi về `g.id`, hai thứ tình cờ bằng nhau.

Đặt mã đọc được là nó đỏ ngay. Bài học: **phép thử so hai giá trị tình cờ bằng
nhau thì không chứng minh được gì** — nó chỉ nằm đó cho yên tâm. Chỗ đáng ngờ
là những phép so mà hai vế lẽ ra phải đi qua một phép ánh xạ.

---

## 16/8/2026 — Cột danh sách lớp, và mở app là thấy TỪNG LỚP

Chủ dự án gửi ảnh chụp SmartScheduler 7.3 đang chạy trên máy trường và hỏi:
*"có thể điều chỉnh để xem từng lớp thay vì cho hiển thị ra màn hình cả
trường?"* Ba việc được chốt làm; việc thứ tư (màn xem lịch **phòng học**)
để lại, chưa đưa vào lộ trình.

### Cột danh sách lớp dán bên trái lưới — `cotLopHTML()`

Thứ SmartScheduler làm tốt hơn: cột `1A 1B 1C…` luôn hiện bên trái, bấm là
nhảy lớp. Ô chọn xổ xuống của app chỉ làm được vế "đổi lớp" — phải mở ra mới
thấy, đóng lại là quên, và với 60 lớp sau sáp nhập thì đó là một danh sách
dài không có mốc nào để bám.

Một hàm dùng cho **cả hai nơi** — thẻ *Theo lớp* của Bảng điều hành và màn
hình *Theo lớp* — vì hai bản dựng riêng thì sớm muộn lệch hành vi. Ô chọn
`#selLop` và `#dhLop` bỏ hẳn: một việc, một lối.

Nút mang luôn `dem/can` nên cột còn là **bảng tiến độ theo lớp**: lớp thiếu
tiết thì con số đổi sang vàng và nút mang lớp `.thieu`, liếc một cái là biết
còn lớp nào chưa xong, khỏi mở từng lớp ra dò.

**⚠️ Bẫy bố cục đã trả giá một vòng chụp ảnh:** để `align-items:stretch` thôi
thì chưa đủ. Danh sách 60 nút **tự nó kéo dài cả hàng flex**, nên cột thò
xuống quá đáy lưới gần một màn hình. Cách chữa: phần trong cột thả nổi
(`.cl-trong{position:absolute;inset:0}`) — nó không còn góp chiều cao vào
hàng nữa, chiều cao hàng do lưới quyết định, cột cuộn bên trong đúng khoảng
ấy. Lỗi này `npm run soi` không thấy; `node docs/anh-giao-dien/chup.mjs`
thấy ngay — lại đúng một lần nữa cái phân vai "soi để KIỂM, chụp để NHÌN".

**Trên điện thoại cột nằm NGANG** (media 900px), cuộn ngang trong khung của
mình. Đây không mâu thuẫn với quyết định 2/8/2026 bỏ dải cuộn ngang cho
**thanh điều hướng**: ở đây các mục cùng một loại, xếp theo thứ tự lớp ai
cũng thuộc, và `cuonToiLopDangXem()` luôn kéo lớp đang mở vào tầm nhìn nên
không phải vuốt đi tìm. Hàm ấy cuộn trong KHUNG của cột chứ không dùng
`scrollIntoView` — hàm kia kéo cả trang theo, người đang xem lưới bị giật
đi chỗ khác.

`locBang()` sửa một chỗ: phần tử mang `data-locnhan` (nhãn nhóm "Khối 1")
vẫn ẩn/hiện theo bộ lọc nhưng **không được đếm** — không thì cột 37 lớp báo
"42 lớp".

### Mở app là thấy từng lớp — `xemMacDinh()`

`S.dhXem` khởi tạo **rỗng**, lần vẽ đầu `xemMacDinh(ds)` chọn theo quy mô:
trên `NGUONG_LOP_TOAN_TRUONG = 12` lớp thì mở thẳng thẻ *Theo lớp*, dưới
ngưỡng thì giữ lưới toàn trường như cũ — trường một điểm 10 lớp thì lưới ấy
vẫn vừa màn hình. Chỉ là **mặc định**: bấm sang thẻ khác là giữ lựa chọn ấy.

Lưới toàn trường không mất đi đâu — nó vẫn là thẻ đầu tiên, và vẫn là bản in
A3 dán bảng tin ở *Xuất và in*. Chỗ của nó là tờ giấy khổ lớn, không phải
màn hình điện thoại.

Kèm theo: lớp mở sẵn nay là lớp đầu theo `xepTheoKhoi()` (1A) chứ không phải
phần tử đầu mảng `S.lop` — thứ tự mảng phụ thuộc lúc nhập, mở ra có khi rơi
vào lớp 4C.

### Nói rõ lớp còn thiếu MÔN GÌ — `thieuMonLop()`

"24/27 tiết" cho biết CÓ thiếu; cái tên môn mới cho biết phải đi tìm ai —
thiếu Tiếng Anh là chuyện của cô Tiếng Anh, thiếu Âm nhạc lại là chuyện khác
hẳn. SmartScheduler bày *"Tổng 27 · Đã xếp 27 · Chưa xếp 0"* cũng dừng ở con
số. Hàm thuần trong vùng LOGIC (`npm test` gọi thẳng, mục 18c), so bảng phân
công với lưới theo tên môn, sắp theo số tiết thiếu giảm dần. Hiện ở ba chỗ:
thẻ cạnh nút *Mở để chỉnh tay*, thanh công cụ màn *Theo lớp*, và `title` của
từng nút trong cột lớp.

### Việc để lại

Màn **xem lịch theo PHÒNG HỌC** (khung "TKB phòng học" của SmartScheduler).
Ba điểm trường dùng chung một phòng máy đúng là cảnh R12 cảnh báo, nên bảng
"phòng Tin học tuần này ai dùng giờ nào" có giá trị thật — nhưng chưa chốt
làm.

**Không bê nguyên bố cục bốn bảng chạy song song** của SmartScheduler (lớp ·
giáo viên · phòng cùng một màn). Đó là bố cục cho màn hình 24 inch, còn app
này mobile-first; và bài toán "đổi tiết này sang đâu được" đã giải bằng lối
khác, tốt hơn: chọn một tiết thì ô đặt được sáng xanh, ô vướng ràng buộc mờ
đi, không phải tự đối chiếu bằng mắt qua ba bảng.

---

## 16/8/2026 (chiều) — Hai thư viện Excel rời khỏi đường mở app

Chủ dự án hỏi *"làm sao để app chạy mượt hơn?"*. Đo bằng Chrome thật trước
khi sửa bất cứ thứ gì — script đo dựng máy chủ nhỏ có gzip, giả lập máy cũ
bằng `Emulation.setCPUThrottlingRate`.

Kết quả đo bác bỏ chỗ đáng ngờ nhất: **việc vẽ màn hình không chậm**. `ve()`
mất 8–40 ms cho hầu hết màn hình, kể cả ở quy mô 60 lớp; nặng nhất là màn
Phân công 630 dòng (169 ms máy tính, 246 ms máy cũ) — vẫn dưới ngưỡng khó
chịu. Bấm đổi lớp 16–35 ms. Chạm một tiết để soi trước chỗ đặt được 53–135
ms. Không có gì đáng viết lại.

Chỗ chậm thật nằm ở **đường mở app**: `xlsx.full.min.js` 269 KB +
`exceljs.min.js` 238 KB, nằm ở thẻ `<script>` trong `<head>` nên tải ở MỌI
lần mở, đẩy mốc `load` từ 0,8 lên 2,3 giây (máy cũ 3,1 giây).

Điều khiến nó đáng sửa không phải con số mà là **ai phải trả**: giáo viên
là nhóm đông nhất, mở app mỗi sáng để xem lịch, và **không bao giờ** nhập
hay xuất Excel. Họ tải 507 KB mỗi ngày cho hai thư viện không dùng tới, bằng
tiền dữ liệu 4G của chính họ.

Nay `napThuVien(url)` chèn thẻ script khi cần, nhớ lời hứa nên bấm mười lần
vẫn một lần tải, và **xoá lời hứa khi hỏng** để lần sau thử lại — mạng chập
chờn ở trường là chuyện thường, giữ một lời hứa hỏng nghĩa là hỏng vĩnh
viễn. Sáu chỗ dùng đều đã nằm trong hàm `async` sẵn nên chỉ đổi
`if(!coExcelJS())` thành `if(!await sanSangExcelJS())`.

Đo lại: **736 KB → 229 KB mỗi lần mở app**, giảm 69%. Bấm Xuất Excel lần
đầu chờ thêm ~0,8 giây và có dòng *"Đang tải thư viện Excel…"*; lần sau
111 ms.

**Service Worker đổi sang KHO TRƯỚC cho tài nguyên ghim phiên bản.**
`xlsx@0.18.5` và `exceljs@4.4.0` là những địa chỉ không bao giờ đổi nội
dung — đổi phiên bản là đổi địa chỉ — nên "mạng trước" chỉ tổ tải lại 507 KB
mỗi lần bấm. Trang chính thì **giữ nguyên mạng-trước**: ở đó chính nó là thứ
bảo đảm không ai kẹt lại ở bản cũ.

**⚠️ Bẫy: thiếu `crossOrigin` thì kho không nhận.** Thẻ script trỏ sang tên
miền khác mà không khai `crossOrigin` thì trình duyệt tải ở chế độ no-cors
và trả về phản hồi "mờ" (`ok === false`), nên `cache.put` bỏ qua — lần bấm
thứ hai vẫn tải lại 240 KB, tức là sửa xong mà không được gì. Phép thử mới
ở `soi-pwa` bắt đúng chuyện này. Thêm `s.crossOrigin='anonymous'` là xong,
và tiện thể một lỗi 404 của CDN cũng lộ ra thay vì im lặng.

### Phát hiện kèm theo: chất lượng TKB phụ thuộc máy nhanh hay chậm

Truy từ ba phép thử chập chờn của `npm test` (hỏng ~1/3 số lần chạy):
*"Điểm phạt giảm rõ rệt"*, *"Bớt hẳn Toán và Tiếng Việt bị đẩy xuống buổi
chiều"*, *"Bớt hẳn tiết trống kẹp giữa buổi"*.

Gốc rễ: `toiUuHoanDoi()` dừng theo **đồng hồ** (1200 ms). Máy bận thì làm
được ít việc hơn → thời khóa biểu kém hơn, cùng một dữ liệu vào.

Đo bằng cách nới hạn:

| | hạn 1200 ms | tới khi hội tụ |
|---|---|---|
| 25 lớp — điểm phạt | 2544 | 2243 |
| 25 lớp — trống kẹp | 27 | 8 |
| 60 lớp — điểm phạt | 7715 | **5006** (−35%) |
| 60 lớp — trống kẹp | 114 | **14** |

Nghĩa là mốc 1200 ms **cắt ngang giữa chừng**, không phải đã xong việc — và
trường sáp nhập 60 lớp thiệt nhiều nhất.

Cách chữa đã bàn: dừng theo **số phép thử** thay vì theo giây (kết quả tất
định, máy nào cũng ra một bản), van an toàn chống treo, nới hạn theo số lớp.

**Chủ dự án chốt: để SAU KHAI GIẢNG.** Không đụng thuật toán trong lúc phần
mềm đang chạy thật cho Diễn Liên — đúng nguyên tắc, vì đây là thay đổi ảnh
hưởng thẳng tới bản thời khóa biểu nhà trường sắp dùng. Đã ghi vào mục 9 của
`CLAUDE.md` và chú thích ngay tại chỗ trong `test/kiem-thu.mjs`, để lần sau
thấy ba dòng ấy đỏ thì biết chạy lại trước khi đi tìm lỗi ở chỗ khác.

---

## 16/8/2026 (tối) — Đổi trọn bảng màu sang XANH LÁ

Chủ dự án gửi một ảnh thiết kế và yêu cầu làm theo, *"trừ các icon trong
từng môn, ta không đưa vào"*.

**Tên biến CSS giữ nguyên.** `--nav` nay là xanh lá `#0F5132` chứ không còn
là navy. Cái tên nói **vai trò** — màu của thanh điều hướng và của mọi hành
động chính — chứ không nói tên màu; đổi tên thì phải sửa hàng trăm chỗ dùng
mà không được thêm gì. Nhờ vậy việc đổi hệ màu gọn trong `:root` cộng vài
chục quy tắc riêng.

Những chỗ phải sửa tay ngoài `:root`:

- **Thanh đầu trang từ khối navy đậm thành THẺ TRẮNG có phong cảnh** — trời,
  mây, chim, đồi, cây; SVG nhúng thẳng trong CSS, giữ nếp một tệp. Chữ đổi
  từ trắng sang màu chữ thường. ⚠️ Mép trái hình phải tan dần bằng một lớp
  gradient trắng phủ **lên trên** ảnh; bản đầu thiếu nó nên lộ một vạch dọc
  cắt ngang thanh, ảnh chụp bắt được ngay.
- **Đảo chiều sáng tối của nút trên nền trắng.** Ngày 3/8 chủ dự án nói
  *"nhìn màu trắng không rõ"* nên nút chưa chọn được làm navy nhạt chữ
  trắng. Mẫu mới quay lại nền sáng — nhưng **không phải trắng trơn**: nền
  xanh rất nhạt `#EDF5F0` có viền riêng, chữ xanh đậm; nút đang chọn là nền
  xanh đậm chữ trắng cộng đổ bóng. Nguyên tắc "hai tín hiệu, không chỉ một"
  của hôm ấy vẫn nguyên vẹn, chỉ đảo chiều. Phép thử cũ được viết lại theo
  đúng tinh thần đó thay vì xoá đi.
- `.b-vang` (nút hành động chính: Xếp nhanh · Công bố · Xuất) đổi từ vàng
  sang xanh lá đậm. Giữ tên lớp.
- Cụm lá ở đáy thanh bên: `aside::after`, `pointer-events:none`, `z-index:0`
  và `aside>*{position:relative;z-index:1}` — hoạ tiết không được chắn mục
  nào, đây là chỗ dễ hỏng nhất của kiểu trang trí này.
- Ba thẻ dưới Bảng điều hành có ô biểu tượng vuông bo tròn `.the-ic`, màu
  theo **vai trò**: xanh đậm = tiến độ, xanh lá = xong, đỏ = có việc gấp,
  vàng = cảnh báo. Chấm nhỏ `.viec-cham` cũ bị nó thay nên **xoá hẳn mã**,
  không để lại quy tắc chết — đúng bài học ngày 3/8 về khối `.the-so`.
- `manifest.webmanifest` (`theme_color`, `background_color`) và thẻ
  `<meta name="theme-color">`. Quên chỗ này thì thanh trạng thái trên điện
  thoại vẫn navy trong khi cả app đã xanh; phép thử soi giao diện có canh.

**Không đưa biểu tượng từng môn vào** — chủ dự án chốt. Ô tiết vẫn phân biệt
bằng màu nền pastel và viền trái đậm suy từ `--mc`.

Thêm một phép thử canh cả hệ: đọc `--nav`, `--nav-3`, `--xanh` rồi đòi thành
phần lục phải trội hơn lam và đỏ — navy cũ quay lại là đỏ ngay.

### Vẽ lại bụi lá và phong cảnh *(cùng ngày, sau nhận xét của chủ dự án)*

Bản đầu của cả hai hoạ tiết đều nhét trong `background:url("data:image/svg+xml,…")`
đã mã hoá. Chủ dự án nhìn ảnh chụp là thấy ngay: bụi lá *"chưa đạt như ảnh
gốc"*, còn phong cảnh thì *"vị trí này ảnh gốc làm rất đẹp"*.

**Cả hai chuyển sang SVG INLINE trong HTML.** Hình phức tạp — lá có gân,
tán cây nhiều cụm, thân chẻ nhánh, chuyển màu — mà viết trong chuỗi data-uri
thì không ai sửa lại được, kể cả người vừa viết ra nó. Inline thì đọc như mã
thường, sửa một toạ độ là xong. Cả hai đều `aria-hidden`, `pointer-events:none`
và nằm ở lớp dưới cùng; `aside>*` / `.thanh>*:not(.thanh-canh)` được đẩy lên
`z-index:1` — hoạ tiết mà chắn mất một mục bấm được là lỗi khó chịu nhất của
kiểu trang trí này.

Ba lần sửa của bức phong cảnh, ghi lại vì đều là bẫy chung của ảnh nền:

1. **Mép trái lộ một vạch dọc.** Ảnh có nền trời riêng nên cạnh trái của nó
   cắt ngang thanh. Chữa bằng mặt nạ chuyển màu (`mask-image`) cho hình tan
   dần về trái.
2. **Đồi và gốc cây bị cắt mất.** `preserveAspectRatio` canh giữa
   (`xMaxYMid`) nên khi thanh thấp hơn tỉ lệ tranh thì phần cắt rơi vào đáy —
   đúng chỗ có đồi. Đổi sang canh đáy (`xMaxYMax`) **và** vẽ lại toàn bộ toạ
   độ theo viewBox 600×86 cho khớp tỉ lệ thật của thanh, thay vì 600×120.
3. **Cây lớn nằm ngay dưới cụm nút bên phải.** Dịch cả cây lẫn đồi sang trái
   để tán cây rơi vào khoảng trống giữa thanh, đúng như mẫu.

**Bốn ảnh chụp cũ (27–30) đã xoá.** Chúng không nằm trong `chup.mjs` nên
không tự chụp lại được, và để lại thì thư mục ảnh có hai hệ màu lẫn lộn —
người xem sau không biết bản nào là bản đang chạy. Không tệp tài liệu nào
trỏ tới chúng.

### Bỏ logo ở thanh đầu trang *(cùng ngày)*

Cùng một hình logo hiện **hai lần** trên một màn hình: một ở đầu thanh bên,
một ở thanh đầu trang, cách nhau vài chục pixel. Chủ dự án gạch bỏ cái thứ
hai. Thanh đầu trang nay mở đầu thẳng bằng **tên trường** — thứ thật sự
khác nhau giữa các trường dùng phần mềm.

Dọn luôn hai quy tắc CSS `.thanh-bt` (bản thường và bản điện thoại) thay vì
để lại mã chết. Hai phép thử cũ canh *"logo hiện ở cả thanh bên và thanh
trên"* được viết lại thành canh chiều ngược: `.thanh-bt` **không được** tồn
tại, còn logo thanh bên vẫn phải là ảnh nhúng base64.

### Máy chủ thật đã chạy bộ cài trọn gói, gồm cả duyệt trường *(24/8/2026)*

- [x] **Chạy `db/cai-dat.sql` lại một lần trên máy chủ thật** — việc treo từ
      3/8/2026. Trước khi chạy, thêm `duyet-truong.sql` vào danh sách nguồn của
      `db/gop-cai-dat.mjs` (đứng cuối, sau `luu-pham-vi.sql`: nó dựng lại
      `dang_ky_truong()` và `p_tkb_ghi`, không đụng `luu_tkb`) rồi sinh lại —
      bộ cài nay gồm **12 tệp**, 352 câu lệnh, `npm run soat` 0 lỗi.
      Chạy trên Supabase dự án `tkb-dien-lien` một lần, không lỗi. Câu soi
      cuối tệp trả về hai trường, cả hai `dang_dung` và **giữ nguyên mã cũ**
      (`THDL`, `2323`) — đúng điều tệp `duyet-truong.sql` cam kết: nâng cấp
      không nhốt trường đang chạy vào màn chờ duyệt. Máy chủ từ đây có đủ
      `bao_nghi`, `tkb_cua_toi()`, `don_du_lieu_cu()`, `luu_tkb()` gộp lần lưu
      và nhận `p_pham_vi`, `p_truong_sua`, và bộ duyệt trường.
      Việc còn lại làm tay, không ghi vào tệp: `update nguoi_dung set
      la_chu_he_thong = true where email = '…'`.

### Dọn tài khoản trên máy chủ thật, đặt hai chủ hệ thống *(24/8/2026, cùng buổi)*

Câu soi cuối của `db/xoa-truong.sql` (viết để xoá trường đăng ký thử
*TH ABC*, mã 2323 — 0 lớp, 0 giáo viên, một người lạ vào thử ngày 16/8) lộ ra
**10 tài khoản đăng nhập không thuộc trường nào**, kể cả Gmail chính của chủ
dự án. Không phải lỗi: đó là trạng thái *khách* mà luồng mã mời cố ý tạo —
đăng nhập Google là có dòng `auth.users`, gõ mã mời mới có `nguoi_dung`.
Nhưng nó cũng cho thấy câu `update nguoi_dung … where email = '<Gmail>'`
ghi trong CLAUDE.md sẽ trả 0 dòng nếu Gmail ấy chưa từng vào trường —
**phải dò theo email ĐĂNG NHẬP ở `auth.users`**, và trước hết phải biết
tài khoản đang dùng hằng ngày là tài khoản nào.

Đã làm, một giao dịch, theo đúng thứ tự này:
1. Nối tài khoản Google thứ hai của chủ dự án vào Diễn Liên vai `quan_tri`
   (insert `nguoi_dung` với `id` lấy từ `auth.users`, không tạo tài khoản mới).
2. Bật `la_chu_he_thong` cho **hai** tài khoản của chủ dự án.
3. Xoá mọi `auth.users` không có `nguoi_dung` — 9 tài khoản khách.

⚠️ Thứ tự là có chủ ý: bước 3 chạy trước bước 1 là xoá mất chính tài khoản
định thêm. Và xoá trường thì phải xoá `auth.users` **trước** `truong` —
cascade chỉ đi từ `auth.users` xuống `nguoi_dung`, không đi ngược; xoá
`truong` trước là để lại tài khoản mồ côi, đúng sự cố 31/7.

Kết quả soi: 2 dòng chủ hệ thống, 0 tài khoản mồ côi, 1 trường. Địa chỉ
email cố ý không ghi vào tệp nào trong kho.

### Soi mã thừa trong `index.html` *(24/8/2026)*

Chủ dự án hỏi tệp có quá lớn, có rác không. Số đo trước khi dọn: **812 KB
thô · 258 KB gzip** (GitHub Pages nén gzip, con số thứ hai mới là thứ đi qua
mạng). Cấu tạo: JS 678 KB (bốn vùng LOGIC · DULIEU · QUYEN · XUAT = 268 KB,
giao diện ≈ 411 KB), CSS 80 KB, hai ảnh base64 32 KB, dữ liệu mẫu nhúng 23 KB.
Ghi chú chiếm ≈ 166 KB thô — **cố ý**, đó là tài liệu sống của dự án và nén
rất tốt.

Soi bằng script (314 hàm top-level, 72 hằng, 302 lớp CSS): **0 hàm trùng
tên, 0 hằng thừa, 0 `console.log`/`debugger`/`TODO`**. Rác tìm được và
đã dọn, tất cả là cặn của mấy lần đổi giao diện:

| Thứ | Vì sao chết |
|---|---|
| `luoiTKB()` | `luoiTuanKhung()` đã thay, không ai gọi |
| `goiYDayThay()` | `ungVienThay()` (3/8) thay hẳn; chỉ còn ba phép thử nuôi nó — **chuyển ba phép thử ấy sang `ungVienThay`** thay vì giữ hàm chết |
| CSS `.bang-ron`, `.br-eb/.br-t/.br-p/.br-ngay` | băng rôn bỏ 3/8, hàm `bangRon()` không còn; một ghi chú vẫn trỏ tới nó |
| CSS `.kg-n/.kg-h/.kg-b` | khung giờ dạng thẻ cột cũ |
| `.ts` khai hai lần | bản navy 2/8 rồi bản trắng đè lên — gộp một |
| `.nh.mo .nhom` · `.tiet-ca` · `.xem-xuat` | mỗi cái khai hai chỗ, gộp |
| favicon 64px riêng | cùng hình với logo — nay gán từ logo lúc khởi động |

Kết quả **812 → 797 KB thô, 258 → 248 KB gzip**. Khiêm tốn, và đó là kết
luận thật: tệp lớn vì **nó chứa cả ứng dụng**, không phải vì rác.

⚠️ Hai bẫy khi dọn:
- Cắt hàm bằng mốc `\n}\n\n` nuốt luôn **hai màn hình đang dùng**
  (`mTKBLop`, `mTKBGV`) vì `luoiTKB` kết thúc không có dòng trống. Phát
  hiện nhờ đếm ký tự cắt được (7.829 thay vì ~700) trước khi chạy phép thử.
  Mốc cuối phải là **dòng `return` của chính hàm ấy**.
- Phép thử *"thẻ số liệu nền trắng"* soi đúng chuỗi ghi đè `.ts::after
  {display:none}` — canh **cách vá**, nên gộp hai khối lại là nó đỏ dù kết
  quả y hệt. Viết lại để canh **kết quả**: khối `.ts` tự khai nền trắng,
  không chữ trắng, không vòng tròn trang trí.

Chưa đụng: `src/bieu-tuong-512.png` **344 KB** — biểu tượng PWA, chỉ tải
lúc cài app lên màn hình chính, nhưng 512px không có lý gì nặng thế; máy
không có pngquant/ImageMagick nên để lại. `docs/anh-giao-dien/` 6,6 MB là
tài liệu, không đi ra trang.
