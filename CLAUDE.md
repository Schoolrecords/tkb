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

### Sáp nhập ba trường — trạng thái hiện tại

Theo kế hoạch, **Tiểu học Diễn Liên + Diễn Đồng + Diễn Thái** nhập thành một
đơn vị, thành ba điểm trường.

⚠️ **Tên đơn vị mới CHƯA có quyết định.** Phần mềm ghi `Trường Tiểu học mới`,
kể cả trong bộ dữ liệu mẫu — *Diễn Liên* nay chỉ còn là tên một **điểm trường**,
không phải tên đơn vị. Đừng bịa tên chính thức; có quyết định thì sửa ở mục
*Bước 1 · Thông tin trường*.

⚠️ **Danh sách cán bộ giáo viên của cả ba trường CHƯA chốt.** Tệp Excel đang có
là bản của năm học trước, dùng làm ví dụ. 25 lớp và 35 giáo viên trong bộ mẫu
đều là của Diễn Liên.

Để chạy thử ở đúng quy mô, dùng nút **Tạo dữ liệu thử** ở mục *Điểm trường*:
`taoDuLieuThu(tên, tiền tố, số lớp, có phòng Tin)` dựng đủ lớp · chủ nhiệm ·
giáo viên bộ môn · bảng phân công **khớp số tiết chuẩn CT GDPT 2018**. Kịch bản
đã kiểm: Diễn Liên 25 + **Diễn Đồng 17** + **Diễn Thái 18** = **60 lớp · 86
giáo viên · 1.698 tiết/tuần**, xếp trọn **1698/1698**, 0 xung đột, ~3,7 giây.

Ba điều bắt buộc của bộ sinh này:
- **Không dùng `Math.random`** — sinh theo chỉ số, chạy hai lần ra y hệt, nhờ
  vậy kiểm thử được và người dùng không thấy số liệu nhảy loạn.
- Giáo viên bộ môn được cắt cho vừa **định mức 23 tiết**, nên dữ liệu thử không
  tự sinh ra lỗi R01.
- Kho họ tên cố ý có những tên dễ trùng (*Dung*, *Linh*, *Hương*, *Oanh*) — đó
  là chuyện có thật ở trường và R09 phải bắt được.

Có số liệu thật thì xoá đi rồi nhập lại bằng **Nhập từ Excel** — cột
`Diem_truong` ghi đúng tên là tự gán.

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
| Đọc Excel | SheetJS qua CDN | nhập PCGD — nhẹ, đủ việc |
| Ghi Excel | **ExcelJS** qua CDN | SheetJS bản cộng đồng KHÔNG tô màu, kẻ viền hay đặt khổ giấy được |
| Logo | PNG 96px nhúng base64 trong trang | giữ được single-file, ~21 KB |
| Font | Be Vietnam Pro (Google Fonts) | hỗ trợ dấu tiếng Việt tốt |

**Không dùng Google Sheets làm CSDL** — không cô lập được dữ liệu giữa các
trường, và hai phó hiệu trưởng lưu cùng lúc sẽ ghi đè nhau.

**Không dùng localStorage/sessionStorage để lưu DỮ LIỆU nhà trường** — dữ liệu
nằm ở Supabase. Ngoại lệ duy nhất: **vé đăng nhập** (`tkb_phien`), để giáo viên
mở trang lên là thấy lịch, không phải gõ lại email mỗi sáng. Không lưu mật khẩu,
chỉ lưu vé làm mới — đúng cách thư viện chính thức của Supabase vẫn làm. Bấm
Đăng xuất là xoá hẳn.

---

## 3. Mô hình dữ liệu

```
truong        id, ten, ma_truong, tinh, xa, nam_hoc
diem_truong   id, truong_id, ten, co_phong_tin
khung_gio     id, truong_id, thu(2..6), buoi('S'|'C'), so_tiet, so_tiet_khoi(jsonb), bat
lop           id, truong_id, diem_truong_id, ma_lop, ten, khoi(1..5), gvcn_id
giao_vien     id, truong_id, ho_ten, ma_gv, dinh_muc(=23), nguoi_dung_id
mon_hoc       id, truong_id, ten, mau, nang, nhe, phong, tiet_chuan(jsonb), thu_tu
phong         id, truong_id, diem_truong_id, ten, mon
phan_cong     id, truong_id, giao_vien_id, lop_id, mon, so_tiet   ← NGUỒN QUAN TRỌNG NHẤT
gv_nghi       id, truong_id, giao_vien_id, thu, buoi
tkb_phien_ban id, truong_id, version, nguoi_sua, du_lieu(jsonb), tao_luc
nguoi_dung    id, truong_id, ho_ten, email, vai_tro, diem_truong_id
nhat_ky       id, truong_id, nguoi_dung_id, hanh_dong, thoi_diem, du_lieu_cu
day_thay      id, truong_id, ngay(date), buoi, tiet, lop_id, mon,
              gv_vang_id, gv_thay_id(null=lớp tự quản), ghi_chu, nguoi_tao
```

**`day_thay` là bảng theo NGÀY, không phải theo tuần** *(2/8/2026 —
`db/day-thay.sql`)*: cô A ốm sáng thứ Ba 15/9 là chuyện của một ngày, tuyệt
đối không sửa vào khuôn TKB tuần. Cả trường đọc được (giáo viên phải thấy
tiết mình dạy thay), chỉ quản lý ghi; trùng khoá (ngày·buổi·tiết·lớp) thì
`luuDayThay()` ghi đè qua `on_conflict` + `resolution=merge-duplicates`.

**`mon_hoc` và `phong` là hai bảng thêm sau** *(1/8/2026 — `db/mon-hoc-phong.sql`)*.
Trước đó danh mục môn nằm cứng trong mã (`MON_LOP`, `MON_NANG`, `MON_NHE`) nên
trường muốn thêm một môn tự chọn là phải sửa mã. Hai bảng này **đọc bằng
`.catch(() => [])`** — cơ sở dữ liệu chưa chạy tệp SQL vẫn mở app bình thường,
chỉ là chưa lưu thay đổi lên máy chủ được. Đừng gỡ đường lui đó.

**Định mức xét theo từng người**, qua `dinhMucCua(g)` chứ không dùng thẳng hằng
`DINH_MUC`. Giáo viên kiêm nhiệm khai thấp hơn 23 được, và R01 · R08 phải tôn
trọng con số riêng ấy — có phép thử canh.

### Hai nguyên tắc bắt buộc

**a) Luôn tham chiếu bằng `id`, không bao giờ bằng tên rút gọn.**
Dữ liệu thật của Trường TH Diễn Liên có 4 cặp trùng tên gọi: hai cô *Dung*,
hai cô *Linh*, hai cô *Hương*, hai cô *Oanh* — và một cặp chỉ khác dấu là
*Thùy* / *Thủy*. Phần mềm cũ chắp vá thủ công (`Cô DungB`, `Cô K.Oanh`,
`Cô Hòa HT`) nên không đọc ngược được. Sau sáp nhập ~100 giáo viên thì số cặp
trùng tăng theo cấp số nhân.

**Điều này áp dụng cho cả LỚP, không riêng giáo viên** *(sửa 1/8/2026)*. Bảng
`lop` từng khoá theo `(truong_id, ten)` và phần mềm dò lớp bằng tên — nghĩa là
ba trường sáp nhập, cả ba đều có lớp *1A*, thì không nhập nổi. Nay khoá tự
nhiên là **`ma_lop`** (đúng cách đã làm với `ma_gv`), `giaoVien.cn` giữ **mã
lớp** chứ không phải tên lớp, và tên lớp chỉ còn là nhãn hiển thị — trùng nhau
thì `tenLopDay()` tự ghi kèm điểm trường. Ba hàm phải đi qua: `cnCuaLop(idLop)`,
`lopCN(gv)`, `tenCN(gv)`. Cơ sở dữ liệu cũ nâng cấp bằng `db/ma-lop.sql`.

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

### Quy trình ba bước — đã dựng *(1/8/2026)*

Thanh bên **xếp theo đúng trình tự làm việc**, không phải theo nhóm chức năng.
Đây là thay đổi lớn nhất về trải nghiệm và có lý do rất cụ thể: trước đó nhóm
*Dữ liệu nguồn* nằm ở **cuối** thanh bên, sau cả mục Trợ giúp — việc phải làm
đầu tiên lại ở chỗ cuối cùng. Và nhóm đó chỉ có bốn màn hình, thiếu hẳn Lớp,
Môn học, Phòng học, Thông tin trường, nên **trường nào không có sẵn tệp kết
xuất Excel thì không khai báo được gì**. Đối chiếu với SmartScheduler 7.2 mà
nhà trường đang dùng: phần mềm đó bắt đi tuần tự chín bước nhập dữ liệu.

```
TỔNG QUAN     Bảng điều hành          ← thanh tiến trình ba bước ở đây
BƯỚC 1        1 Thông tin trường  2 Điểm trường  3 Khối và khung giờ
              4 Lớp học  5 Giáo viên  6 Môn học  7 Phòng học
              8 Phân công  9 Buổi bận
BƯỚC 2        Kiểm tra khả thi → Xếp thời khóa biểu
BƯỚC 3        Toàn trường · Theo khối · Theo lớp · Theo giáo viên
              · Của tôi · Xuất và in
TRỢ GIÚP      Hướng dẫn sử dụng
─────────────────────────────────── dán cứng đáy
              Thẻ tài khoản + chấm báo tình trạng máy chủ
```

**Đáy thanh bên chỉ còn thẻ tài khoản** *(1/8/2026)*. Ba nút cũ đã chuyển tới
nơi thực sự dùng chúng — thanh bên là chỗ điều hướng, không phải chỗ chứa mọi
việc lặt vặt:

| Nút cũ | Chỗ ở mới | Vì sao |
|---|---|---|
| Nhập dữ liệu Excel | thanh công cụ của **từng màn hình Bước 1** | đang ở màn hình Lớp học mà muốn nhập lớp thì bấm luôn tại đó |
| Máy chủ dữ liệu | Bước 1 · Thông tin trường, thẻ *Công cụ quản trị* | việc cài đặt, làm vài lần |
| Đổi vai trò xem thử | **bỏ hẳn** *(1/8/2026)* | đăng nhập vai nào là vai đó; muốn xem vai khác thì đăng xuất rồi đăng nhập lại. Một lối vào, không có cửa sau |
| — | chấm xanh trên thẻ tài khoản | vẫn báo tình trạng máy chủ, không tốn một dòng nào |

**Ba tầng như bộ nhận diện AVATAR** *(1/8/2026)*: `aside` không cuộn nữa
(`overflow:hidden`); đầu trang và thẻ tài khoản đứng yên, chỉ `<nav class="dsmuc">`
ở giữa cuộn (`flex:1;overflow-y:auto`). Trước đây cả thanh bên cuộn nên tên
trường và thẻ tài khoản trôi mất khi kéo tới mục cuối.

**Nút bấm nẩy LÊN**, không lún xuống: `.mi:active{transform:translateY(-2px)}` —
lấy đúng từ `.nav button:active` của AVATAR. Nhấn xuống là phản xạ quen của web;
nẩy lên khiến nút như bật khỏi mặt phẳng, và trên cảm ứng thì ngón tay không
che mất phản hồi.

**Chữ trên nút không được bắt người dùng nghĩ.** *"Lưu lên máy chủ"* → **"Lưu"**:
nơi lưu là chuyện của phần mềm, không phải chuyện người dùng phải quyết mỗi lần bấm.

**Một việc, một nút** *(1/8/2026)*. Từng có **hai** nút *Đăng nhập*: một ở thanh
trên cùng, một trong thẻ *Công cụ quản trị*. Thanh trên cùng thắng vì nó theo
người dùng qua mọi màn hình; thẻ kia bỏ hẳn, hai dòng thông tin *Nơi lưu dữ
liệu* · *Người đang dùng* gộp xuống cuối thẻ **Đã khai báo**. Có phép thử đếm:
trong `#noiDung` không được còn nút đăng nhập nào.

**Logo** nhúng base64 ngay trong trang (`.hieu-bt img`, `.thanh-bt img`) và làm
luôn favicon. Ảnh gốc 1254px/1,3 MB thu về **96px/16 KB** trước khi mã hoá — nhét
nguyên ảnh gốc là tệp HTML phình thêm 1,8 MB cho một hình 52px.

`thanhKhaiBao(nut, coNhap)` dựng thanh công cụ dùng chung. Truyền `coNhap=false`
cho **Thông tin trường · Môn học · Phòng học** — tệp Excel không chứa ba thứ đó,
bày nút nhập ở đấy là hứa hão.

Ba hàm giữ quy trình này:

| Hàm | Việc |
|---|---|
| `tienDo(kt)` | thuần dữ liệu — mỗi bước còn thiếu gì, mỗi việc thiếu trỏ tới màn hình nào |
| `thanhBuoc(n)` | ba thẻ lớn, **chỉ dùng ở Bảng điều hành** |
| `dieuHuongBuoc(t)` | dải gọn trên từng màn hình + hai nút *‹ trước* / *tiếp theo ›* |

- `CHUOI_BUOC` là **nguồn sự thật duy nhất** về thứ tự. Thêm màn hình mới thì
  thêm vào đó, đừng đi sửa từng nút.
- Việc có cờ `nhe` chỉ nhắc, không chặn bước đó thành *xong* — ví dụ "3 lớp
  chưa có chủ nhiệm".
- `dieuHuongBuoc()` **trả rỗng cho vai trò giáo viên**. Họ chỉ vào xem lịch,
  bày lối đi sang màn hình khác là làm khó họ.

Ảnh chụp 13 màn hình: **`docs/anh-giao-dien/`**, chụp lại bằng
`node docs/anh-giao-dien/chup.mjs` (Chrome thật, không tải thêm trình duyệt).
Khác `npm run soi` ở chỗ đó chạy trình duyệt giả để **kiểm** lỗi, còn tệp này
chạy trình duyệt thật để **nhìn** — và nó đã bắt được hai lỗi bố cục trên điện
thoại mà `npm run soi` không thấy: nhãn nhóm bị giấu mất và nút điều hướng gãy
làm ba dòng.

**Trường mới không có tệp Excel vẫn khai báo được**, đây mới là điểm cốt lõi:
- *Tạo lớp hàng loạt* — khai "khối 1 có 5 lớp" ra 1A–1E, mã lớp tự mang tiền
  tố điểm trường (`DL-1A`). Tên lớp trùng nhau giữa các điểm trường thì vẫn
  tạo được; trùng trong **cùng** một điểm trường thì bỏ qua, vì đó là nhầm lẫn.
- *Phân công nhanh cho một giáo viên* — chọn người, chọn môn, tích các lớp.
  "Cô Hương dạy Mỹ thuật cả 25 lớp" là một thao tác chứ không phải 25, và số
  tiết lấy đúng chuẩn của từng khối.
- Thêm/sửa/xoá được lớp, giáo viên, môn, phòng, dòng phân công ngay trong app.
- Xoá thì **dọn sạch mọi tham chiếu**: xoá lớp là gỡ cả phân công, lưới đã xếp
  và con trỏ chủ nhiệm. Có phép thử canh việc này.
- `datCN(idLop, idGV)` gỡ ràng buộc ở **cả hai đầu** — không ai chủ nhiệm hai
  lớp, không lớp nào có hai chủ nhiệm.

Nút *Nhập dữ liệu Excel* giữ nguyên, nay là **đường tắt** cho trường đã có sẵn
dữ liệu, không còn là con đường duy nhất.

#### Tệp Excel phải đọc được bằng mắt *(1/8/2026)*

SheetJS bản cộng đồng **không tô màu, không kẻ viền, không đặt khổ giấy** — nên
mọi tệp xuất ra trước đây chỉ là bảng chữ đen trên nền trắng, mở lên không nhìn
ra đâu là tiêu đề, đâu là dữ liệu. Nay **đọc tệp vẫn dùng SheetJS** (nhẹ, đủ
việc), **ghi tệp dùng ExcelJS**.

Bốn hàm dựng dùng chung cho mọi tệp: `trangXL` (khổ giấy) · `tieuDeXL` (dải tiêu
đề gộp ô, căn giữa, nền navy) · `dauCotXL` (dòng tên cột nền xanh chữ trắng) ·
`thanBangXL` (viền mọi ô, nền xen kẽ).

Mọi trang tính đặt sẵn **A4, canh vừa bề ngang, chân trang có tên trường và số
trang** — in ra dùng được ngay, không phải mở Page Setup. Lưới thời khóa biểu
**luôn nằm ngang**: ba cột giờ cộng mỗi lớp một cột thì khổ dọc không bao giờ đủ,
kể cả khối chỉ có ba lớp. Bảng danh sách và thống kê thì khổ dọc.

Một bẫy đã dính: `luoiToanTruong()` có **thêm một dòng ghi khối** phía trên tên
lớp, nên cắt `a.slice(3)` là lấy nhầm dòng ấy làm dòng tên cột. Nhận ra nó bằng
ba ô đầu để trống rồi vẽ thành dải phụ.

**Mẫu Excel tải về được** *(1/8/2026)* — `bangMauNhap()` + nút *Tải mẫu Excel*
trong hộp nhập. Trước đây phần mềm bảo *"tệp cần có ba trang tính, tên cột viết
đúng như bảng"* rồi để người dùng tự dựng lấy; gõ sai một chữ trong tên cột là
nhập hỏng. Mẫu dựng từ **chính dữ liệu đang có** nếu trường đã khai — người dùng
thấy ngay cách ghi, sửa trên Excel rồi nhập ngược lại được. Trường trắng thì
sinh vài dòng ví dụ. Có trang `HUONG_DAN` kèm bảng số tiết chuẩn từng khối. Nút *Lưu lên máy chủ* trên các màn
hình khai báo đi qua đúng `ghiDuLieuNguon()` mà nút Excel vẫn dùng — một đường
ghi duy nhất, không có hai lối vào lệch nhau.

### Xuất Excel và in — đã dựng

Vùng `/*#region XUAT*/` chỉ dựng **bảng hai chiều thuần dữ liệu**
(`luoiToanTruong`, `luoiTheoKhoiHoc`, `luoiTheoLop`, `luoiTheoGV`, `bangXuatPC`,
`bangXuatDT`). Việc ghi `.xlsx` bằng SheetJS và việc in nằm ở mục 4. Tách vậy
để `npm test` đếm được số ô mà không cần trình duyệt.

**Bốn sản phẩm, đúng bốn thứ nhà trường cần** *(toàn trường và theo khối thêm
1/8/2026)*:

| Bản | Dùng làm gì | Khổ in |
|---|---|---|
| Toàn trường | tờ dán bảng tin ngày khai giảng | A3 ngang |
| Theo khối | khối trưởng cầm; nhìn ra ngay lớp nào lệch tiết | A3 ngang |
| Theo lớp | phát cho lớp, cũng là chỗ chỉnh tay | A4 ngang |
| Theo giáo viên | in cả tập rồi phát | A4 ngang |

- Bảng rộng thì **cuộn ngang trong khung của chính nó** (`.tt-boc`), thân trang
  không bao giờ cuộn ngang — người dùng chủ yếu dùng điện thoại.
- Ô của khối tan sớm ghi rõ **"Nghỉ"**, không để trống. Trống lẫn với tiết chưa
  xếp là đọc sai ngay.
- Bản in rộng dùng `khungIn(..., rong=true)` → lớp `.rong` → `@page rong`.
- Tệp Excel nay có `TOAN_TRUONG`, `KHOI_1…KHOI_5`, `TKB_LOP`, `TKB_GV`, `PCGD`,
  `DIEM_TRUONG`.

#### Khổ giấy chọn theo số cột, không theo thói quen *(1/8/2026)*

| Bản | Khổ | Vì sao |
|---|---|---|
| Một lớp · một giáo viên | **A4 dọc** (`doc`) | 5 cột thứ + 2 cột giờ, vừa một trang dọc |
| Theo khối (3–6 lớp) | **A4 ngang** (`ngang`) | |
| Toàn trường (25–60 lớp) | **A3 ngang** (`rong`) | 60 cột không có cách nào vừa A4 |

Khai bằng **trang có tên** của CSS Paged Media: `@page doc{size:A4 portrait}`
rồi `.tr-in.doc{page:doc}`. `khungIn(tieu, phu, bang, huong)` nhận tham số thứ tư.

Thể thức: tên đơn vị góc trái viết hoa có gạch chân ngắn · tiêu đề giữa trang
viết hoa · địa danh và ngày tháng nghiêng góc phải · hai chỗ ký *NGƯỜI LẬP
BIỂU* và *HIỆU TRƯỞNG*. Phông **Times New Roman 13pt**, không phải phông màn hình.

**`CSS_BAN_IN` là MỘT nguồn duy nhất** cho cả hộp in của trình duyệt lẫn tệp
Word tải về. Chép tay sang hai chỗ thì sớm muộn hai bản lệch nhau.

**Tải Word** (`taiWord`) gói chính HTML bản in vào tệp `.doc` kèm khai báo khổ
giấy của Word (`mso-page-orientation`). Không dùng thư viện `.docx`: cách này
giữ nguyên dấu tiếng Việt, và **nhà trường sửa lại được** — thứ tệp PDF không cho.

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
   **Ràng buộc thật từ 1/8/2026** — trước đó chỉ có cảnh báo R10, lưới vẫn xếp
   hai lớp cùng học Tin học một tiết trong cùng một phòng máy mà không báo gì.
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

**Hai ngoại lệ khi ghim** *(1/8/2026)*: ô đã có tiết người xếp ghim tay thì để
yên, và **buổi giáo viên đã báo bận thì không ghim** — ràng buộc cứng số 7 phải
cứng với cả tiết theo quy định. Quy tắc R11 nêu rõ lớp nào đang thiếu người
chào cờ. Lỗi này do `npm run soi` bắt được, không phải `npm test`.

### Phòng chức năng — ràng buộc cứng số 4 *(1/8/2026)*

**Chốt an toàn quan trọng nhất: trường CHƯA khai bảng phòng thì phòng KHÔNG
phải ràng buộc cứng** (`coBangPhong()` trả `false` khi `S.phong` rỗng). Nâng
cấp phần mềm không được làm một trường đang xếp tốt bỗng xếp hỏng. Muốn siết
thì nhà trường tự khai ở mục *Bước 1 · Phòng học*.

Ba chỗ phải đi qua, cả ba đều có phép thử:
- `chiSo()` đếm sẵn `phongBan[điểm trường|loại][ô] = số lớp đang chiếm`.
- `datDuoc()` — bước xếp tự động. Nhận thêm tham số `mon` để biết môn đó cần
  phòng loại gì.
- `doiChoDuoc()` và `kiemTraChuyen()` — bước hoán đổi và chỉnh tay. Cả hai
  dùng `dangChiemPhong(dt, loai, ô, boLop)`, **bỏ chính lớp đang xét** ra khỏi
  phép đếm vì tiết của nó đang được dời đi.

Trong `doiChoDuoc()`, phép kiểm phòng đặt **trước** lối tắt *“cùng giáo viên
thì luôn đổi được”*: cô Mai dạy Tin cả hai ô thì đổi chỗ vẫn được, nhưng đẩy
một tiết Tin sang ô mà phòng máy đã kín thì không, dù người dạy vẫn là cô.

Đo trên dữ liệu thật: khai một phòng Tin học vẫn **710/710 tiết**, 15 tiết Tin
học rải trên 15 ô giờ khác nhau. Bước xếp tham lam **229ms**, khai phòng hay
không đều vậy — vòng đếm phòng dùng bảng tra dựng sẵn trong `chiSo()`, không
dò tuyến tính trong danh mục môn. Bước hoán đổi có hạn giờ 1200ms nên tổng
thời gian dao động 0,8–1,7 giây tuỳ lần chạy; đó là hạn giờ đã đặt, không phải
ràng buộc mới làm chậm.

### Ghim tay và hoàn tác — đã dựng *(1/8/2026)*
Mỗi tiết chỉnh tay mang cờ `ghim:true`; `xepTuDong()` giữ nguyên chúng và trừ
vào `conLai`, `laGhim()` loại chúng khỏi bước hoán đổi, `docTKB()` giữ cờ khi
tải bản lưu về. Ngăn xếp `LUI` nhớ 20 bước gần nhất (kéo thả, chạm chuyển, bỏ
ghim, xếp lại, xoá kết quả) — nút *Hoàn tác* và `Ctrl+Z`.

### Chỉnh tay trên điện thoại — đã dựng *(1/8/2026)*
Kéo thả HTML5 **không chạy trên cảm ứng**, mà PHT phụ trách điểm trường gần như
chỉ dùng điện thoại — việc duy nhất họ được phép làm lại là việc họ không làm
được. Nay lối chính là **chạm chọn → chạm đặt** (`S.oChon`, hàm `chamO`), có
soi trước: ô đặt được sáng xanh (`.o-hop`), ô vướng ràng buộc mờ (`.o-cam`).
Kéo thả vẫn giữ, cả hai đi chung qua `chuyenTiet()`.

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

### Xếp kỹ — chạy lâu, tìm nhiều phương án *(1/8/2026)*

Một giây chỉ đủ dò một nhánh. Cho nó vài phút thì tìm được phương án đẹp hơn
hẳn, và quan trọng hơn: cho ra **vài phương án khác nhau** để người xếp tự chọn.

Điều làm việc này rẻ hẳn đi là một nhận xét về chính bài toán nhà trường:
**học sinh chỉ học tại điểm trường của mình, và giáo viên về cơ bản dạy một
điểm trường** — chỉ vài giáo viên bộ môn ít tiết mới dạy liên điểm. Vậy nên
thời khóa biểu toàn trường gần như là **mấy bài toán nhỏ rời nhau**.

`nhomDocLap()` tách bằng union-find: hai lớp cùng nhóm khi có chung ít nhất một
giáo viên. Ba điểm trường thật tách đúng thành **25 · 18 · 17 lớp**. Giải riêng
từng nhóm thì mỗi phần nhỏ hơn hẳn, và **số phương án nhân lên theo cấp số
nhân** — ba nhóm mỗi nhóm 60 lần thử là 60×60×60 tổ hợp toàn trường, không phải 60.

| Hàm | Việc |
|---|---|
| `taoNgauNhien(hat)` | mulberry32 — cùng hạt ra cùng dãy, phương án dựng lại được y hệt |
| `xepTuDong(gioiHan, {lop, hat, nhieu})` | thêm phạm vi lớp và xáo trộn có hạt; **không truyền gì thì chạy y như cũ** |
| `xepDaiTung(tuyChon)` | generator, nhả nhịp sau mỗi lần thử |
| `xepDai(tuyChon)` | bản đồng bộ cho `npm test` |

Ba điều bắt buộc:
- **Lần thử đầu của mỗi nhóm luôn là bản tất định** — chính là kết quả nút *Xếp
  nhanh*. Nhờ vậy xếp kỹ **không bao giờ tệ hơn** xếp nhanh; có phép thử canh.
- Xáo trộn bằng **khoá phụ gán sẵn** (`xoc`), không cho hàm so sánh trả số ngẫu
  nhiên — comparator không nhất quán là hành vi không xác định.
- Nhiễu cộng vào điểm ô (`nhieu`, mặc định 10) là kiểu **GRASP**: tham lam
  nhưng có xáo, chạy nhiều lần rồi giữ lần tốt nhất.
- **Điểm phạt chỉ làm tròn MỘT lần**, lúc ghép phương án *(2/8/2026)*.
  `diemNhom()` trả điểm thô; mọi `Math.round` điểm đều cộng epsilon `1e-7`.
  Điểm có phần lẻ (`i*1.5`, độ lệch `×2`) nên làm tròn từng nhóm rồi cộng
  sẽ lệch ±1 so với `diemToanCuc()` sau khi nạp phương án — phép thử
  *Bấm "Dùng bản này"* vì thế chập chờn (hỏng ~1/3 số lần chạy), CI vừa
  dựng xong đã bắt được. Đừng đưa `Math.round` trở lại vào `diemNhom()`.

Màn hình gọi qua generator và chèn `await nghiMotNhip()` giữa các lần thử —
ba phút mà không nhả thì trình duyệt báo *"trang không phản hồi"*. Bấm **Dừng
lại** lúc nào cũng được, phương án tốt nhất tới lúc đó vẫn giữ.

Đo trên dữ liệu thật: điểm phạt **2249 → 2152** (giảm 4%) sau 20 giây, 25 lớp.
Ba điểm trường 60 lớp: **5296 → 5079** sau 45 giây, vẫn đủ 1698/1698 tiết.

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

## 6. Bộ quy tắc kiểm tra khả thi (12 quy tắc)

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
| R11 | Chủ nhiệm báo bận đúng buổi có tiết cố định | canh |
| R12 | Có phòng chức năng nhưng **không đủ chỗ** cho số tiết cần | do |

R12 là quy tắc chỉ lộ ra sau sáp nhập: ba trường gộp lại mà vẫn một phòng máy
thì số tiết Tin học vượt hẳn sức chứa (số phòng × số ô giờ). Nó phải báo từ
tháng 8, lúc còn kịp xin thêm phòng — chứ không phải để tới lúc xếp mới biết.
Chỉ chạy khi trường đã khai bảng phòng.

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
- **Nói quy định hiện hành như một sự thật, không kể tiến trình** *(1/8/2026)*.
  Viết *"Bản in ghi tên trường, năm học và chỗ ký. Không ghi cơ quan chủ quản."*
  chứ đừng viết *"Sau sáp nhập, cơ cấu quản lý đã đổi nên bản in chỉ ghi…"* —
  người dùng cần biết phần mềm làm gì, không cần nghe giải thích bối cảnh.
- **Không viết cứng tên trường cụ thể vào giao diện.** Phần mềm dùng cho nhiều
  trường, có trường sáp nhập có trường không. Nút *Mô phỏng sáp nhập 3 điểm
  trường* từng viết cứng ba tên Diễn Liên · Diễn Đồng · Diễn Thái nên chỉ đúng
  cho đúng một nhà trường; nay là *Tạo dữ liệu thử*, hỏi tên và số lớp.

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
- [x] Nhật ký thao tác và khôi phục phiên bản *(hoàn tất 2/8/2026)*.
      `taiNhatKy()` trong vùng DULIEU (trả dữ liệu thuần, PostgREST nhúng
      `nguoi_dung(ho_ten)` lấy tên người làm); hộp **Nhật ký thao tác** cạnh
      *Lịch sử phiên bản* trên màn hình Xếp, mã hành động dịch thành câu qua
      `MO_TA_HANH_DONG`. Chỉ quản lý đọc được (quy tắc `p_nk_doc` có sẵn).
- [x] Nhập PCGD từ Excel, **ghi thẳng lên máy chủ** (`ghiDuLieuNguon`)
- [x] Xuất TKB ra Excel/PDF theo lớp, theo giáo viên, theo điểm trường
- [x] Khung giờ theo khối — `khung_gio.so_tiet_khoi`, khối nhỏ tan sớm hơn
- [x] Tối ưu ràng buộc mềm bằng hoán đổi cục bộ sau bước xếp tham lam
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
- [x] Màn hình tự đăng ký trường mới — `db/dang-ky-truong.sql`
- [x] Mời thành viên qua giao diện — `db/edge-function-tai-khoan.ts`
- [x] Hướng dẫn sử dụng theo vai trò trong app
- [x] Lớp tham chiếu bằng `ma_lop`, cho phép trùng tên lớp giữa các điểm trường
      *(1/8/2026 — `db/ma-lop.sql`, xem nguyên tắc a mục 3)*
- [x] Chặn tài khoản giáo viên chưa nối hồ sơ, không rơi về người đầu danh sách
      *(1/8/2026 — `thieuHoSoGV()`; trước đây thầy cô xem nhầm lịch người khác)*
- [x] Chỉnh tay bằng chạm — dùng được trên điện thoại *(1/8/2026)*
- [x] Ghim tiết chỉnh tay + hoàn tác 20 bước *(1/8/2026)*
- [x] Màn hình **Buổi bận** — ràng buộc cứng số 7 nay nhập được từ giao diện
      *(1/8/2026 — `mBuoiBan()`, `luuBuoiBan()`, ghi thẳng vào `gv_nghi`)*
- [x] Phép thử giao diện thật `npm run soi` (jsdom)
- [x] CI trên GitHub Actions: mỗi lần đẩy mã chạy đủ `npm test` (192) +
      `npm run soi` (95) *(2/8/2026 — `.github/workflows/kiem-thu.yml`;
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
- [x] **Quy trình ba bước** — thanh bên xếp theo trình tự làm việc, thanh tiến
      trình ở Bảng điều hành, dải điều hướng trên từng màn hình *(1/8/2026)*
- [x] Năm màn hình khai báo còn thiếu: Thông tin trường · Lớp học · Môn học ·
      Phòng học · (Khối gộp vào Khung giờ). Trường mới không có tệp Excel nay
      vẫn khai báo được từ đầu tới cuối *(1/8/2026)*
- [x] Thêm/sửa/xoá lớp, giáo viên, môn, phòng và dòng phân công ngay trong app
      *(1/8/2026 — trước đây phải quay lại Excel)*
- [x] Danh mục môn và bảng phòng thành dữ liệu — `db/mon-hoc-phong.sql`
- [x] Định mức theo từng giáo viên (`dinhMucCua`), R01 · R08 tôn trọng
- [x] Hai sản phẩm còn thiếu: **TKB toàn trường** và **TKB theo khối**, kèm
      bản in A3 và trang tính Excel riêng cho mỗi khối *(1/8/2026)*
- [ ] **CẦN NGƯỜI THẬT BẤM — không tự động hoá được:** vào phần mềm bấm
      **"Công bố cho giáo viên"** (hoặc chạy `db/cong-bo.sql` rồi
      `db/cong-bo-ngay.sql`). Cả 5 phiên bản trên máy chủ đang `cong_bo=false`,
      mà `p_tkb_doc` chỉ cho giáo viên đọc bản đã công bố. Mã, nút bấm và quy
      tắc UPDATE đều đã xong và đã có phép thử — chỉ thiếu một cú bấm có đăng
      nhập quản trị.
- [x] Chạy thử được ở quy mô thật khi chưa có danh sách CBGV — nút **Tạo dữ
      liệu thử** *(1/8/2026)*. Kịch bản 25+17+18 = 60 lớp xếp trọn 1698/1698.
- [ ] Nhập lớp và giáo viên THẬT của Diễn Đồng, Diễn Thái khi danh sách chốt.
      Đường đã thông: gộp ba bảng phân công vào một tệp Excel, cột `Ma_lop` đặt
      tiền tố theo trường (`DL-1A`, `DD-1A`, `DT-1A`), `Ten_lop` giữ nguyên.

### Lộ trình đã duyệt 2/8/2026 (thứ tự chủ dự án chốt)
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
- [x] Thanh bên gọn lại: bỏ ba nút ở đáy, chuyển vào đúng chỗ dùng *(1/8/2026)*
- [x] Tên đơn vị mặc định là `Trường Tiểu học mới`, Diễn Liên thành điểm trường
- [ ] Sửa tên đơn vị khi có quyết định sáp nhập chính thức

### Đề xuất tiếp theo — xem `docs/danh-gia-va-de-xuat.md`
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
- [ ] **Chạy `db/mon-hoc-phong.sql`** một lần trong Supabase SQL Editor. Chưa
      chạy thì app vẫn chạy bằng danh mục mặc định, chỉ là màn hình Môn học và
      Phòng học chưa lưu được lên máy chủ.
- [x] Phòng chức năng thành **ràng buộc cứng thật** *(1/8/2026)* — `datDuoc()`,
      `doiChoDuoc()`, `kiemTraChuyen()` đều chặn; thêm quy tắc R12 báo thiếu
      chỗ. Chưa khai bảng phòng thì không siết, xem mục 4.

## 10. Việc KHÔNG làm

- Không đọc/giải mã cơ sở dữ liệu của SmartScheduler (SQLite mã hoá SQLCipher,
  phần mềm thương mại có bản quyền). Đường nhập liệu là **kết xuất Excel**
  của chính phần mềm đó.
- Không lưu bất kỳ dữ liệu học sinh nào. Hệ thống chỉ cần lớp, giáo viên, môn.
  Đây là lợi thế lớn về pháp lý, giữ nguyên nguyên tắc này.
- Chưa thu tiền của trường công cho tới khi có ý kiến pháp lý về việc cán bộ
  quản lý đơn vị sự nghiệp công lập kinh doanh trong lĩnh vực mình quản lý.

---

## 11. Ba nhóm người dùng — thiết kế cho ai

Đây là thứ quyết định nhiều lựa chọn kỹ thuật ở trên. Ba nhóm dùng phần mềm
theo ba cách hoàn toàn khác nhau.

### Giáo viên — "chỉ vào xem, không muốn làm gì hết"

Câu này là của chủ dự án, và nó là ràng buộc thiết kế chứ không phải mong muốn.

- **Không xác minh email.** Quản trị tạo tài khoản với `email_confirm: true`,
  đưa email và mật khẩu. Không mở hộp thư, không bấm liên kết. Nhiều thầy cô
  còn không nhớ mật khẩu gmail của mình.
- **Không đăng nhập lại mỗi lần.** Vé làm mới lưu ở `localStorage`; mở trang là
  vào thẳng màn hình *Thời khóa biểu của tôi*.
- **Thanh bên chỉ 3 mục** (`MUC_GIAO_VIEN`), giấu luôn chuông cảnh báo. Bày 12
  mục trước mặt người chỉ cần một mục là làm khó họ.
- Gõ tay địa chỉ trang khác cũng bị `apDungQuyen()` đẩy về lịch cá nhân.

### Hiệu trưởng, phó hiệu trưởng — người dựng thời khóa biểu

- **Bắt buộc xác minh email.** Quyền càng lớn thì cửa vào càng phải chắc.
  Edge Function dùng `generateLink({type:'signup'})` và **trả liên kết xác minh
  về cho quản trị** — gửi qua Zalo cũng được, nên không phụ thuộc việc dự án đã
  cấu hình máy chủ gửi thư hay chưa.
- PHT phụ trách điểm trường bị bó phạm vi, xem mục phân quyền ở trên.

### Quản trị — người cài đặt ban đầu

Chỉ làm vài lần: dựng cơ sở dữ liệu, nhập bảng phân công, cấp tài khoản.
Chấp nhận được vài bước phức tạp, miễn là có hướng dẫn từng bước.

**Bài học đã trả giá:** nút *Đăng ký trường mới* từng đặt ngang hàng với nút
*Đăng nhập*, cùng kích cỡ. Chủ dự án bấm nhầm, tạo ra một tài khoản mồ côi.
Việc cả đời một trường làm một lần thì đừng để cạnh việc làm hằng ngày.
