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