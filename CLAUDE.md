# Hệ thống Thời khóa biểu — trường tiểu học nhiều điểm trường

Luôn trả lời và viết comment bằng **tiếng Việt**.

---

## 1. Bối cảnh

Các trường tiểu học đang sáp nhập theo **Công văn 777/TTg-TCCV ngày 10/7/2026**
của Thủ tướng Chính phủ, hạn hoàn thành **trước 30/8/2026**. Sau sáp nhập,
một trường có nhiều **điểm trường** cách nhau vài cây số. Việc xếp thời khóa
biểu vì thế đổi hẳn về bản chất: xuất hiện chiều thứ ba là **không gian**.

Người dùng: cán bộ quản lý nhà trường (hiệu trưởng, phó hiệu trưởng phụ trách
điểm trường, người xếp TKB) và toàn thể giáo viên. Đa số ở tuổi 35–55, quen
Excel, không quen phần mềm phức tạp.

**Chủ dự án:** Phó Hiệu trưởng Trường Tiểu học Diễn Liên, xã Quảng Châu,
tỉnh Nghệ An. Vừa là người dùng thật, vừa là người phát triển.

### Mục tiêu sản phẩm
1. Cán bộ quản lý xếp xong thời khóa biểu **nhanh, gọn**.
2. Giáo viên đăng nhập tài khoản cá nhân là **thấy ngay lịch dạy trực quan**.

### Lộ trình hai pha (không gộp)
- **Pha 1 — đến 30/8/2026:** chạy thật cho một trường. Một cơ sở dữ liệu,
  chưa cần thanh toán. Mục tiêu duy nhất: có TKB dùng được ngày khai giảng.
- **Pha 2 — từ 9/2026:** thương mại hoá đa trường. Multi-tenant, đăng nhập,
  phân quyền, gói dịch vụ.

Ngay từ Pha 1 phải: đặt cột `truong_id` vào **mọi** bảng, và bọc toàn bộ truy
cập dữ liệu qua một tầng 4–6 hàm để Pha 2 chỉ cần viết lại tầng đó.

---

## 2. Stack

| Hạng mục | Lựa chọn | Ghi chú |
|---|---|---|
| Giao diện | HTML/CSS/JS thuần, một file, **không build tool** | quy ước sẵn có của chủ dự án |
| Thuật toán | Chạy **client-side**, trong Web Worker khi cần | tránh giới hạn thời gian của backend |
| Cơ sở dữ liệu | **Supabase (PostgreSQL) + Row Level Security** | xem `db/schema.sql` |
| Hosting | GitHub Pages (tĩnh) | SPA gọi thẳng REST API của Supabase |
| Đọc/ghi Excel | SheetJS qua CDN | nhập PCGD, xuất báo cáo |
| Font | Be Vietnam Pro (Google Fonts) | hỗ trợ dấu tiếng Việt tốt |

**Không dùng Google Sheets làm CSDL** — không cô lập được dữ liệu giữa các
trường, và hai phó hiệu trưởng lưu cùng lúc sẽ ghi đè nhau.

**Không dùng localStorage/sessionStorage** trong bản demo chạy trong khung
artifact. Bản thật lưu ở Supabase.

---

## 3. Mô hình dữ liệu

```
truong        id, ten, ma_truong, tinh, xa, nam_hoc
diem_truong   id, truong_id, ten, co_phong_tin
khung_gio     id, truong_id, thu(2..6), buoi('S'|'C'), so_tiet, so_tiet_khoi(jsonb), bat
lop           id, truong_id, diem_truong_id, ten, khoi(1..5), gvcn_id
giao_vien     id, truong_id, ho_ten, ma_gv, dinh_muc(=23), nguoi_dung_id
phan_cong     id, truong_id, giao_vien_id, lop_id, mon, so_tiet   ← NGUỒN QUAN TRỌNG NHẤT
gv_nghi       id, truong_id, giao_vien_id, thu, buoi
tkb_phien_ban id, truong_id, version, nguoi_sua, du_lieu(jsonb), tao_luc
nguoi_dung    id, truong_id, ho_ten, email, vai_tro, diem_truong_id
nhat_ky       id, truong_id, nguoi_dung_id, hanh_dong, thoi_diem, du_lieu_cu
```

### Hai nguyên tắc bắt buộc

**a) Luôn tham chiếu bằng `id`, không bao giờ bằng tên rút gọn.**
Dữ liệu thật của Trường TH Diễn Liên có 4 cặp trùng tên gọi: hai cô *Dung*,
hai cô *Linh*, hai cô *Hương*, hai cô *Oanh* — và một cặp chỉ khác dấu là
*Thùy* / *Thủy*. Phần mềm cũ chắp vá thủ công (`Cô DungB`, `Cô K.Oanh`,
`Cô Hòa HT`) nên không đọc ngược được. Sau sáp nhập ~100 giáo viên thì số cặp
trùng tăng theo cấp số nhân.

**b) Lưu kết quả TKB dạng JSON blob một dòng + số phiên bản**, không tách
1.400 dòng. Ghi nguyên tử, nhanh, và có lịch sử phiên bản miễn phí. Chống ghi
đè bằng **khóa lạc quan**: client gửi kèm version đang giữ, server từ chối nếu
version trên máy chủ đã cao hơn.

### Tầng truy cập dữ liệu — đã dựng

Nằm trong `src/index.html`, vùng `/*#region DULIEU*/`. Toàn bộ ứng dụng chỉ
chạm cơ sở dữ liệu qua **bốn hàm**, Pha 2 chỉ cần viết lại đúng vùng này:

| Hàm | Việc |
|---|---|
| `dangNhap(email, matKhau)` | GoTrue → đọc `nguoi_dung` → nối tiếp về `giao_vien.nguoi_dung_id` |
| `taiDuLieu()` | tải 7 bảng + phiên bản TKB mới nhất, nạp thẳng vào `S` |
| `luuTKB(tkb, version)` | gọi RPC `luu_tkb`, khóa lạc quan, ghi `nhat_ky` |
| `lichSuPhienBan(gioiHan)` | liệt kê các bản đã lưu |

Ba hàm phụ trợ: `taiPhienBan(v)` (khôi phục), `dangXuat()`, `ghiNhatKy()`.

Ba thứ cần nhớ khi sửa vùng này:

- **Luôn có đường lui.** Không có `src/cauhinh.js`, chưa đăng nhập, hoặc mất
  mạng → tự chạy bằng `data/truong-dien-lien.json`, và nếu mở bằng `file://`
  thì dùng bản nhúng trong trang. `src/index.html` phải luôn chạy độc lập được.
- **Nhưng đường lui thì KHÔNG được ghi lên máy chủ.** `luuTKB()` từ chối khi
  `KHO.nguon !== 'may-chu'`. Đã dính thật: đăng nhập được nhưng trường chưa
  nhập lớp → chạy dữ liệu mẫu → lưu → phiên bản chứa mã lớp của bộ mẫu, tải
  về không khớp ô nào. Mất một buổi mới lần ra. Đừng gỡ chốt chặn này.
- **Đổi tên bảng ↔ tên trong ứng dụng nằm gọn ở `tuMayChu()`.** Trường `cn`
  (lớp chủ nhiệm) suy ra từ `lop.gvcn_id`, không bao giờ dò theo tên gọi.
- **Vùng DULIEU không được đụng DOM.** Không gọi `bao()`, không `$()`; chỉ trả
  về `{ok, thongBao}` để màn hình tự hiển thị. Nhờ vậy `npm test` cắt vùng này
  ra chạy thẳng trong Node được (mục 5 và 6 của bộ kiểm thử).

Phiên đăng nhập **không lưu xuống máy** (đúng quy ước không dùng
localStorage), tải lại trang là phải đăng nhập lại.

### Phân quyền trên giao diện — đã dựng

Vùng `/*#region QUYEN*/`, ngay sau vùng DULIEU. Hàng rào thật là RLS trong
`db/schema.sql`; vùng này chỉ lo phần giao diện.

**Hai loại phó hiệu trưởng phân biệt bằng `nguoi_dung.diem_truong_id`** —
bỏ trống là phụ trách chuyên môn toàn trường, có giá trị là phụ trách riêng
điểm trường đó. Đây là điểm dễ hiểu sai nhất khi sửa vùng này.

| | toàn trường | PHT một điểm trường | giáo viên |
|---|---|---|---|
| Đổi phạm vi xem | có | **khoá cứng vào điểm của mình** | — |
| Xếp tự động, xoá kết quả | có | **không** | không |
| Sửa điểm trường · phân công · khung giờ | có | **không** | không |
| Kéo thả chỉnh tiết | mọi lớp | **chỉ lớp trong điểm của mình** | không |
| Lưu lên máy chủ | có | có | không |

Lý do PHT một điểm trường **không** được xếp tự động: mỗi lần xếp là dựng lại
lưới của cả trường, sẽ đè lên phần của các điểm trường khác. Họ chỉnh tay
phần mình rồi lưu; khóa lạc quan lo phần đụng độ.

Hai hàm phải nhớ gọi:
- `apDungQuyen()` — gọi ở đầu `ve()`, ép `S.phamVi` về đúng quyền.
- `duocSuaLop(id)` — chốt chặn cuối trong `kiemTraChuyen()`.

Điểm trường phụ trách bị xoá thì `quyen()` **mở khoá** thay vì kẹt người dùng
vào chỗ trống.

### Xuất Excel và in — đã dựng

Vùng `/*#region XUAT*/` chỉ dựng **bảng hai chiều thuần dữ liệu** (`luoiTheoLop`,
`luoiTheoGV`, `bangXuatPC`, `bangXuatDT`). Việc ghi `.xlsx` bằng SheetJS và việc
in nằm ở mục 4. Tách vậy để `npm test` đếm được số ô mà không cần trình duyệt.

- **PDF làm bằng `window.print()`**, không dùng thư viện PDF. Trình duyệt in ra
  PDF sẵn và giữ đúng dấu tiếng Việt; jsPDF phải nhúng phông riêng mới có dấu,
  nặng và dễ vỡ. Bản in đổ vào `#inAn`, `@media print` giấu toàn bộ giao diện.
- **Bản xuất luôn ghi họ tên đầy đủ**, không dùng `tenNgan`. In ra mà ghi
  "Cô Dung" thì hai cô Dung không phân biệt được — có phép thử canh việc này.
- **Không ghi cơ quan chủ quản** trên đầu bản in. Sau sáp nhập, cơ cấu quản lý
  giáo dục đã đổi; ghi bừa "Phòng GD&ĐT huyện…" là sai thể thức văn bản.
  Chỉ ghi tên trường, năm học, và chỗ ký *Người lập biểu* / *Hiệu trưởng*.

---

## 4. Ràng buộc

### Cứng — vi phạm là TKB sai, phải chặn
1. Một giáo viên không dạy hai lớp trùng khung giờ thực.
2. Một lớp không học hai môn cùng lúc.
3. **Một giáo viên, một buổi, một điểm trường.** ← ràng buộc lõi của bài toán
   sau sáp nhập. Thay cho việc tính thời gian di chuyển từng tiết; đơn giản
   hơn nhiều về thuật toán và cũng đúng thực tế quản lý hơn.
4. Phòng chức năng: một lớp/tiết, và phải cùng điểm trường với lớp.
5. Đủ số tiết mỗi môn mỗi tuần theo phân công.
6. Không vượt định mức 23 tiết/tuần của giáo viên tiểu học.
7. Tôn trọng buổi nghỉ đã đăng ký của giáo viên.

### Mềm — chấm điểm để tối ưu
- Toán, Tiếng Việt ưu tiên tiết 1–3 buổi sáng.
- Không để giáo viên có tiết trống kẹp giữa buổi.
- Thể dục không xếp tiết cuối sáng hoặc tiết 1 chiều.
- Không quá 2 tiết cùng môn liên tiếp.
- Rải đều số tiết giữa các ngày.
- **Tối thiểu hoá số lần giáo viên đổi điểm trường trong tuần** (trọng số cao nhất).

### Tiết ghim sẵn
- Chào cờ: thứ Hai, sáng, tiết 1 — HDTN của giáo viên chủ nhiệm.
- Sinh hoạt lớp: thứ Sáu, sáng, tiết cuối — HDTN của giáo viên chủ nhiệm.

---

## 5. Thuật toán xếp

Nguyên tắc **"xếp ngược"**: xếp cái khó trước.

```
1. Ghim tiết cố định (chào cờ, sinh hoạt lớp)
2. Sắp thứ tự đơn vị phân công theo độ khó giảm dần:
      độ khó = (không phải GVCN ? 1000 : 0) + số điểm trường × 200 + tổng tiết
3. Với mỗi tiết: duyệt toàn bộ ô khả dụng, loại ô vi phạm ràng buộc cứng,
   chọn ô có điểm mềm thấp nhất (MRV + greedy)
4. Ô nào không còn chỗ hợp lệ → ghi vào danh sách "chưa xếp", báo rõ lý do
5. Hoán đổi cục bộ: đổi chỗ hai tiết trong CÙNG một lớp, nhận phép đổi nào
   giảm điểm phạt. Cùng lớp nên tổng tiết không đổi — không bao giờ mất tiết.
```

### Hoán đổi cục bộ — hai điều quyết định tốc độ

Bước tham lam lo **đủ tiết**, bước hoán đổi lo **đẹp**. Viết ngây thơ thì chạy
hết 1,3 giây mới xong một vòng; sau hai lần sửa còn 0,8 giây cho bốn vòng và
hội tụ hẳn. Hai chỗ đó là:

1. **Đừng dựng lại bảng tra cho từng cặp thử.** `doiChoDuoc()` nhận sẵn bảng
   lịch; dựng lại `chiSo()` mỗi lần là quét 710 ô vô ích.
2. **Đừng tính lại điểm toàn trường.** Một phép đổi trong lớp L chỉ ảnh hưởng
   L và hai giáo viên liên quan, nên chỉ tính `diemLop(L) + diemGV(×2)`.
   Rẻ hơn khoảng 20 lần.

Kết quả trên kịch bản 3 điểm trường: đổi điểm trường 29 → 24 lần, tiết trống
kẹp giữa buổi 45 → 11, Toán và Tiếng Việt bị đẩy xuống chiều 113 → 14 tiết.

Hai tiết ghim (chào cờ, sinh hoạt lớp) bị `laGhim()` loại khỏi danh sách hoán
đổi — có phép thử canh.

Lý do xếp GVCN sau cùng: ở tiểu học GVCN dạy ~20/25 tiết của chính lớp mình
nên cực kỳ linh hoạt, xếp vào đâu cũng được. Giáo viên bộ môn liên điểm
trường thì gần như chỉ có 1–2 phương án khả dĩ.

**Không bao giờ quảng bá "xếp tự động 100%".** Định vị đúng và an toàn hơn:
*"Phát hiện vướng mắc trước khi xếp — xếp xong trong một phút — chỉ rõ chỗ
cần điều chỉnh."*

### Kết quả kiểm thử trên dữ liệu thật (bắt buộc giữ được)
| Kịch bản | Kết quả mong đợi |
|---|---|
| 1 điểm trường | **710/710 tiết**, < 1 giây, 0 xung đột |
| 3 điểm trường | ~696/710 tiết, 0 xung đột, phần thiếu rơi vào Tiếng Anh khối 5 |

Khi sửa thuật toán, chạy lại `npm test` để đảm bảo không tụt so với mốc trên.

---

## 6. Bộ quy tắc kiểm tra khả thi

Chạy **trước** khi xếp. Đây là tính năng có giá trị bán hàng cao nhất — nó cho
hiệu trưởng biết vấn đề nhân sự từ tháng 8, lúc còn kịp xử lý.

| Mã | Nội dung | Mức |
|---|---|---|
| R01 | Giáo viên vượt định mức 23 tiết | canh (≤2) / do (>2) |
| R02 | Không đủ buổi để có mặt ở các điểm trường | **do** |
| R03 | Kín ≥ 85% số buổi, không còn dự phòng | canh |
| R04 | Lớp lệch số tiết chuẩn CT GDPT 2018 | canh |
| R05 | Lớp vượt sức chứa khung giờ | do |
| R06 | Lớp chưa có chủ nhiệm | canh |
| R07 | Chủ nhiệm bị phân công ở điểm trường khác | do |
| R08 | Toàn trường thiếu năng lực giảng dạy | do |
| R09 | Trùng tên gọi giữa các giáo viên | goi |
| R10 | Xếp Tin học ở điểm trường chưa có phòng máy | do |

---

## 7. Dữ liệu thật — dùng làm bộ kiểm thử vàng

`data/truong-dien-lien.json` — Trường TH Diễn Liên, năm học 2025–2026 HK1.
Trích từ file kết xuất của phần mềm SmartScheduler 7.2 mà trường đang dùng.

- 25 lớp (1A–5E, 5 lớp mỗi khối), 35 giáo viên, 265 dòng phân công, **710 tiết/tuần**
- TKB gốc **không có một xung đột nào** → dùng để đối chiếu kết quả thuật toán

### Những con số đã kiểm chứng, không được đoán lại
- **Số tiết/tuần:** khối 1–2 = 27 (25 chính khoá + 2 Tiếng Anh tự chọn),
  khối 3 = 28, khối 4–5 = 30. Khớp chính xác CT GDPT 2018.
- **Lưới thời gian thực tế chỉ 8 buổi/tuần:** sáng 5 ngày, chiều 3 ngày.
  Nghỉ chiều thứ Tư, chiều thứ Sáu, cả ngày thứ Bảy.
- **Số tiết mỗi buổi KHÁC NHAU THEO KHỐI** — khối nhỏ tan sớm hơn. Đối chiếu
  từ bản kết xuất SmartScheduler ngày 31/7/2026 (`data/ketxuat-*.xlsx`):

  | Buổi | K1 | K2 | K3 | K4 | K5 |
  |---|---|---|---|---|---|
  | Sáng T2–T5 | 4 | 4 | 4 | 4 | 4 |
  | Sáng T6 | 4 | 4 | 4 | **5** | **5** |
  | Chiều T2 | 3 | 3 | 3 | 3 | 3 |
  | Chiều T3 | **2** | **2** | 3 | 3 | 3 |
  | Chiều T5 | **2** | **2** | **2** | 3 | 3 |
  | **Tổng** | **27** | **27** | **28** | **30** | **30** |

  Cộng ra đúng chuẩn CT GDPT 2018, **dư 0 ô** ở cả năm khối. Thuật toán phải
  xếp kín tuyệt đối mới đạt 710/710 — và nó đạt.
- **Sinh hoạt lớp là tiết cuối CỦA KHỐI ĐÓ**, không phải tiết cuối của lưới:
  khối 1–3 tan sau tiết 4 sáng thứ Sáu, khối 4–5 sau tiết 5.
- **GDTC do chính GVCN dạy** (không có giáo viên thể dục chuyên).
- **Đạo Đức tách riêng** cho một giáo viên chuyên phụ trách 23 lớp.
- Giáo viên bộ môn đã kịch trần **trước** khi sáp nhập: Mỹ thuật 25 tiết,
  hai giáo viên Tiếng Anh 24 tiết — đều vượt định mức 23.

---

## 8. Quy ước code

- Tên biến, hàm, comment: **tiếng Việt không dấu** (`xepTuDong`, `diemTruong`,
  `phanCong`, `khungGio`). Comment giải thích bằng tiếng Việt có dấu.
- Không dùng framework, không build step. Một file `index.html` chạy được ngay.
- CSS dùng biến trong `:root`, đặt tên tiếng Việt (`--nen`, `--chu`, `--ke`).
- Mọi chuỗi hiển thị đi qua hàm `esc()` trước khi chèn vào HTML.
- Ngôn ngữ giao diện: động từ chủ động, câu ngắn, không viết hoa toàn bộ trừ
  nhãn nhỏ. Lỗi phải nói rõ *chuyện gì xảy ra* và *cách sửa*, không xin lỗi.

### Ngôn ngữ thiết kế (theo bộ nhận diện AVATAR của chủ dự án)
- Sidebar xanh navy `#1B2559`, mục đang chọn `#2E3F86`, badge số bên phải.
- Nền `#F4F5F8`, thẻ trắng bo `14px`, viền `#E6E9F0`, đổ bóng rất nhẹ.
- Thẻ số liệu gradient: cam `#C4823A`, lục `#3D8C6C`, lam `#4A6FB5`, tím `#6E52BC`.
- Điểm nhấn vàng `#F5C542` cho logo và nút hành động chính.
- Mỗi môn học một màu riêng, mỗi điểm trường một màu riêng.

---

## 9. Việc cần làm tiếp

- [x] Dựng schema Supabase từ `db/schema.sql`, bật RLS, tạo tài khoản thử
      *(xong 31/7/2026 — dự án `tkb-dien-lien` ở Singapore, đã nạp 25 lớp ·
      35 GV · 265 dòng phân công, xếp 710/710 và lưu được phiên bản)*
- [x] Tầng truy cập dữ liệu: `taiDuLieu()`, `luuTKB(tkb, version)`, `lichSuPhienBan()`, `dangNhap()`
- [x] Đăng nhập giáo viên bằng email + mật khẩu, dò về `giao_vien.nguoi_dung_id`
- [x] Phân quyền: quản trị (toàn trường) → PHT (điểm trường phụ trách) → giáo viên (chỉ xem)
- [ ] Nhật ký thao tác và khôi phục phiên bản
      *(đã ghi `nhat_ky` lúc lưu và khôi phục được bản cũ — còn màn hình xem nhật ký)*
- [x] Nhập PCGD từ Excel, **ghi thẳng lên máy chủ** (`ghiDuLieuNguon`)
- [x] Xuất TKB ra Excel/PDF theo lớp, theo giáo viên, theo điểm trường
- [x] Khung giờ theo khối — `khung_gio.so_tiet_khoi`, khối nhỏ tan sớm hơn
- [x] Tối ưu ràng buộc mềm bằng hoán đổi cục bộ sau bước xếp tham lam
- [ ] Đưa thuật toán vào Web Worker khi số lớp > 60
- [ ] Màn hình tự đăng ký trường mới (Pha 2) — cần hàm Postgres
      `dang_ky_truong()` kiểu `security definer`, vì tài khoản mới chưa có
      dòng `nguoi_dung` nên RLS chặn cả việc tạo trường lẫn tạo hồ sơ.
      Nhập Excel lên máy chủ đã xong, đây là mảnh cuối còn thiếu.

## 10. Việc KHÔNG làm

- Không đọc/giải mã cơ sở dữ liệu của SmartScheduler (SQLite mã hoá SQLCipher,
  phần mềm thương mại có bản quyền). Đường nhập liệu là **kết xuất Excel**
  của chính phần mềm đó.
- Không lưu bất kỳ dữ liệu học sinh nào. Hệ thống chỉ cần lớp, giáo viên, môn.
  Đây là lợi thế lớn về pháp lý, giữ nguyên nguyên tắc này.
- Chưa thu tiền của trường công cho tới khi có ý kiến pháp lý về việc cán bộ
  quản lý đơn vị sự nghiệp công lập kinh doanh trong lĩnh vực mình quản lý.
