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
              gv_vang_id, gv_thay_id(null=lớp tự quản), ghi_chu, nguoi_tao,
              da_xem, bao_nghi_id
bao_nghi      id, truong_id, giao_vien_id, ngay(date), buoi_nghi('S'|'C'|'CN'),
              ly_do, ghi_chu, trang_thai('cho'|'xong'|'huy'), gui_luc,
              nguoi_gui, nguoi_xu_ly, xu_ly_luc
```

**`day_thay` là bảng theo NGÀY, không phải theo tuần** *(2/8/2026 —
`db/day-thay.sql`)*: cô A ốm sáng thứ Ba 15/9 là chuyện của một ngày, tuyệt
đối không sửa vào khuôn TKB tuần. Cả trường đọc được (giáo viên phải thấy
tiết mình dạy thay), chỉ quản lý ghi; trùng khoá (ngày·buổi·tiết·lớp) thì
`luuDayThay()` ghi đè qua `on_conflict` + `resolution=merge-duplicates`.

**`bao_nghi` là bảng DUY NHẤT giáo viên được ghi vào** *(3/8/2026 —
`db/bao-nghi.sql`)*. Đừng nhầm nó với `gv_nghi`: `gv_nghi` là buổi bận **lặp
lại hằng tuần**, dữ liệu nguồn để XẾP lịch; `bao_nghi` là việc của **một ngày**
— cô A ốm sáng thứ Ba 15/9. Nhét chung một bảng thì một lần ốm làm hỏng cả
khuôn tuần. Quy tắc RLS cho giáo viên tự gửi và tự huỷ hồ sơ của **chính mình**
(nối qua `giao_vien.nguoi_dung_id = auth.uid()`), chỉ khi còn `trang_thai='cho'`;
quản lý đọc hết và chuyển trạng thái. Đọc bằng `.catch(() => [])` như hai bảng
dưới — cơ sở dữ liệu chưa chạy tệp SQL vẫn mở app bình thường.

⚠️ Cột tên là **`buoi_nghi`**, không phải `buoi`. Lý do rất cụ thể: enum
`buoi_t` chỉ có `S` và `C`, còn báo nghỉ có thêm `CN` (cả ngày). Đặt tên cột
trùng với một enum khác nghĩa là bẫy đọc nhầm cho người sửa sau — `npm run soat`
bắt đúng chuyện này ngay lần chạy đầu, trước khi kịp dán vào SQL Editor.

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

**Upsert theo khoá tự nhiên: mã phải GIỮ NGUYÊN, và ai đã có trên máy chủ thì
ghi theo `id`.** Áp cho **cả `lop` lẫn `giao_vien`** trong `ghiDuLieuNguon()`.
Bảng lớp đã vá 1/8/2026; bảng giáo viên bị bỏ sót và ăn đòn thật 2/8/2026:
`ma_gv: g.id` — sau khi tải về thì `g.id` là UUID máy chủ, nên lần lưu sau
không khớp dòng cũ và máy chủ **thêm nguyên một lứa 35 hồ sơ**. Trường 35 giáo
viên thành **105 hồ sơ, mỗi người ba bản**; hai lứa cũ mất sạch phân công nên
thành hồ sơ trùng tên 0 tiết, và mã mời nối nhầm một cô giáo vào đó. Vá một
lỗi upsert thì phải rà **mọi** bảng dùng cùng khuôn trong cùng hàm.

**Mọi lệnh SỬA (PATCH) phải đi qua `suaHang()` và ĐẾM số dòng đổi được.**
PostgREST trả "thành công" cho lệnh sửa 0 dòng, nên quy tắc RLS chặn ghi trông
y hệt ghi trót lọt. Đã cắn hai lần — nút *Công bố* (thiếu `p_tkb_sua`) và lưu
tên trường (thiếu `p_truong_sua`, tìm ra 2/8/2026) — mỗi lần đều mất nhiều ngày
vì phần mềm vẫn báo "đã lưu". `npm run soat` nay đối chiếu "app ghi vào bảng
nào" với "bảng nào có quy tắc cho ghi"; thêm một đường ghi mới mà quên quy tắc
là CI đỏ ngay.

**Phiên đăng nhập LƯU xuống máy** — vé làm mới trong `localStorage`, xem mục 2
và mục 11. Không lưu mật khẩu, và bỏ tích *Ghi nhớ tôi trên máy này* thì không
lưu gì cả. Supabase **xoay vòng** vé làm mới, nên `lamMoiPhien()` xin vé mới
xong phải ghi lại vé ấy xuống máy; quên bước đó thì hôm sau thầy cô mở app lên
vẫn bị hỏi mật khẩu, có phép thử canh.

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

#### Nay là NĂM NHÓM MỞ ĐƯỢC, không phải ba bước phẳng *(3/8/2026)*

Quy trình ba bước ở trên đúng cho người **đang xếp lần đầu**, nhưng sau đó
thanh bên còn phải chứa cả việc **trong năm học** — dạy thay, thông báo,
phiên bản, nhật ký, tài khoản. Hai mươi tám mục bày phẳng một mạch thì thanh
bên dài gấp đôi màn hình điện thoại và mắt không có mốc nào để bám.

```
ĐIỀU HÀNH               Bảng điều hành · Xếp thời khóa biểu · Dạy thay ●
                        · Thông báo ● · Báo nghỉ
TRA CỨU THỜI KHÓA BIỂU  Toàn trường · Theo khối · Theo lớp · Theo giáo viên
                        · Thời khóa biểu của tôi
DỮ LIỆU NHÀ TRƯỜNG      Thông tin trường · Điểm trường · Khối và khung giờ
                        · Lớp học · Giáo viên · Môn học · Phân công chuyên môn
                        · Phòng học · Buổi bận và tiết cố định
QUẢN LÝ VÀ KẾT QUẢ      Kiểm tra khả thi · Các phương án đã lưu
                        · Phiên bản và công bố · Xuất và in · Nhật ký
HỆ THỐNG                Người dùng và phân quyền · Sao lưu dữ liệu
                        · Hướng dẫn sử dụng
```

**Thông tin trường thuộc DỮ LIỆU NHÀ TRƯỜNG, không phải HỆ THỐNG** *(3/8/2026)*.
Tên đơn vị, năm học, địa bàn là **dữ liệu của nhà trường**, không phải thiết
lập kỹ thuật — và nó là việc khai đầu tiên nên đứng đầu nhóm. Đặt nhầm sang
HỆ THỐNG thì người dùng đi tìm ở nhóm mình đang khai dở mà không thấy.

**KHÔNG còn "Bước 1/2/3" ở bất cứ đâu trên màn hình** *(3/8/2026)*. Thanh bên
chia theo năm nhóm chức năng, mà màn hình lại vẫn ghi *"Bước 1 · Khai báo dữ
liệu — Việc 4 trong 16"*: **hai cách đánh số song song cho cùng một thứ**,
người dùng phải tự dịch qua lại, và con số "16" đếm theo một chuỗi mà thanh
menu không hề bày ra. Nay `TEN_BUOC` dùng đúng tên nhóm của thanh bên
(*Dữ liệu nhà trường · Xếp thời khóa biểu · Tra cứu và xuất*), `dieuHuongBuoc()`
chỉ còn nhãn nhóm + tên màn hình + hai nút ‹ trước / tiếp theo ›. Có phép thử
quét cả 12 màn hình, không cho chữ `Bước <số>` nào lọt ra.

**Nhãn nhóm phải ĐẬM HƠN tên mục nằm dưới nó.** Bản đầu để 10px màu `--nav-mo`
nhạt — đúng kiểu nhãn phụ của bản menu phẳng cũ, nhưng nay nhãn nhóm là **mốc
điều hướng chính**. Chữ mờ hơn cả mục con là thứ bậc lộn ngược, và chủ dự án
nhận xét ngay: *"các mục lớn thì bị nuốt"*. Nay 11.5px, `font-weight:800`,
màu `#B9C4E4`, kèm vạch ngăn phía trên để năm khối tách bạch cả khi cùng đóng.

Bốn quy tắc, cả bốn đều có phép thử:

- **Mở app thì chỉ nhóm ĐIỀU HÀNH bung sẵn.** Trạng thái nằm ở `S.nhomMo`
  chứ không phải ở DOM — vẽ lại màn hình mà nhóm sập xuống là lỗi khó chịu
  nhất của kiểu menu này.
- **Chọn một trang thì nhóm chứa trang ấy TỰ bung** (`dungMenu()`). Người
  dùng tự bấm đóng/mở nhóm khác thì tôn trọng lựa chọn ấy.
- **Nhóm đang đóng mà bên trong có việc gấp thì gắn huy hiệu đỏ lên nhãn
  nhóm** — không thì huy hiệu nằm khuất, đúng thứ nó sinh ra để tránh.
- **Nhãn nhóm đọc theo VAI TRÒ.** Với giáo viên, "ĐIỀU HÀNH" là chữ sai —
  họ không điều hành gì cả. `capNhatDem()` đổi thành *CỦA TÔI* và
  *THỜI KHÓA BIỂU*.

⚠️ Mỗi `.mi` mang sẵn `data-nh` ghi mình thuộc nhóm nào. Đừng quay lại lối
dò `nextElementSibling` như bản phẳng cũ — thêm một mục là lệch hết.

Ba mức hiện mục, gộp trong `thayDuocMuc(t)`:
`MUC_GIAO_VIEN` (5 mục) · `MUC_TOAN_TRUONG` (người dùng · sao lưu · phiên bản,
chỉ hiệu trưởng và PHT chuyên môn) · còn lại mọi quản lý đều thấy.

**Đáy thanh bên chỉ còn thẻ tài khoản** *(1/8/2026)*. Ba nút cũ đã chuyển tới
nơi thực sự dùng chúng — thanh bên là chỗ điều hướng, không phải chỗ chứa mọi
việc lặt vặt:

| Nút cũ | Chỗ ở mới | Vì sao |
|---|---|---|
| Nhập dữ liệu Excel | thanh công cụ của **từng màn hình Bước 1** | đang ở màn hình Lớp học mà muốn nhập lớp thì bấm luôn tại đó |
| Máy chủ dữ liệu | Bước 1 · Thông tin trường, thẻ *Công cụ quản trị* | việc cài đặt, làm vài lần |
| Đổi vai trò xem thử | **bỏ hẳn** *(1/8/2026)* | đăng nhập vai nào là vai đó; muốn xem vai khác thì đăng xuất rồi đăng nhập lại. Một lối vào, không có cửa sau |
| — | chấm xanh trên thẻ tài khoản | vẫn báo tình trạng máy chủ, không tốn một dòng nào |

#### Trên điện thoại: NGĂN KÉO, không phải dải ngang *(sửa 2/8/2026)*

Bản trước thu thanh bên thành **dải cuộn ngang dán đỉnh màn hình**. Sai từ
gốc, và chủ dự án nói đúng một câu là ra: *"dải điều hướng có ai sắp xếp
chạy ngang phía trên bao giờ đâu"*. Ba cái sai:
- Bắt người dùng **vuốt ngang** mới tìm được mục — không phần mềm nào làm vậy.
- Nhãn nhóm phải **xoay dọc** mới vừa chỗ, đọc rất khó.
- Dải ấy ăn mất một khoảng cao ở **mọi** màn hình, kể cả khi không dùng tới.

Nay là **ngăn kéo trượt từ trái** (`body.mo-menu`), mở bằng nút ☰ ở thanh
trên: giữ nguyên menu dọc y như máy tính, kể cả logo và thẻ tài khoản, nhãn
nhóm nằm ngang đọc bình thường. Đóng khi chọn mục (`chuyen()` gọi
`dongMenu()`), chạm nền mờ, hoặc bấm Escape. Không mục nào hiện thì giấu
luôn nút ☰ — bấm ra khoảng navy trống là trải nghiệm tệ nhất.

⚠️ **Nhắm phần tử trong `.thanh` bằng TÊN LỚP, đừng `nth-child`.** Thêm nút
☰ vào đầu làm `.thanh>div:nth-child(2)` trượt từ ô tên trường sang ô logo,
logo co về 0 và biến mất. Nay là `.thanh-ten`.

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

#### Lưới rộng — GƯƠNG MẶT của sản phẩm *(trang điểm 2/8/2026)*

`luoiRongHTML(ds, ghiKhoi, cao)` là thứ khách hàng nhìn đầu tiên. Bốn điều
làm nó đọc được ở quy mô 25–60 cột × 30 dòng, cả bốn là chuyện ĐỌC chứ
không phải trang trí:

1. **Tiêu đề dính hai chiều** — hàng tên lớp dính đỉnh, cột giờ dính trái.
   ⚠️ Khung cuộn PHẢI là `.tt-boc`. Bọc thêm một khung cuộn nữa bên ngoài
   là tiêu đề trôi mất — đã dính thật khi nhúng lưới vào Bảng điều hành.
   Cần giới hạn chiều cao thì truyền tham số `cao`, đừng bọc div.
2. **Dải KHỐI gộp ô** phía trên tên lớp (nền navy). 25 cột liền nhau không
   mốc thì mắt lạc; dải khối chia bảng thành năm mảng nhìn ra ngay. Hai
   hàng tiêu đề cùng dính nên hàng dưới chốt cứng `top:26px`.
   Truyền `ds` đã sắp theo khối (`xepTheoKhoi`), không thì dải vỡ vụn.
3. **Vạch đậm giữa các NGÀY** (`tr.het-ngay`), vạch nhạt giữa hai buổi.
4. **Ô "nghỉ" kẻ sọc mờ** — mắt nhận ra ngay là "khối này tan rồi". Vẫn
   giữ chữ *nghỉ*: bỏ trống thì lẫn với tiết chưa xếp.

Bố cục cột trái theo đúng bảng thời khóa biểu in trên giấy: **cột Thứ gộp ô
cả ngày** (`rowspan`) rồi tới **cột Tiết** (`S1…S4`, `C1…C3`, ô chiều tô vàng
nhạt). Hai cột đều dính trái — cột thứ hai phải khai `left:44px` khớp đúng bề
ngang cột thứ nhất, lệch một pixel là chồng lên nhau.

**Kẻ dọc liền, kẻ ngang nét đứt xanh nhạt** *(chốt 2/8/2026 theo mẫu chủ dự
án gửi)*. Thứ tự đậm nhạt là có chủ ý: ranh giới giữa hai **LỚP** quan trọng
hơn ranh giới giữa hai **TIẾT** — nhầm cột là đọc nhầm cả lớp, còn nhầm dòng
thì đã có cột Tiết dính bên trái đỡ. Hết buổi và hết ngày mới kẻ liền đậm dần
(1.5px → 2.5px), đó là hai mốc thật sự cần thấy.

#### Lưới trên MÀN HÌNH bày từng điểm trường, bản gộp để IN *(2/8/2026)*

Ba điểm trường gộp một bảng là **60 cột** — chủ dự án nhận xét *"quá dày và
rối"*, và đúng: người phụ trách một điểm trường chỉ quan tâm điểm của mình.
Nay `lopChoLuoi()` lọc theo `S.dtLuoi`, `daiDiemLuoi()` dựng dải nút chuyển
(chỉ hiện khi có nhiều hơn một điểm trường, kèm số lớp mỗi nơi). Bảng điều
hành và màn *Toàn trường* đều dùng nó.

Bản **gộp cả trường vẫn còn nguyên** nhưng chỉ ở đường **Xuất và in** — nơi
nó đúng vai: tờ A3 dán bảng tin. Có phép thử canh việc này (`luoiToanTruong`
phải luôn đủ cột cho mọi lớp, không bị dải nút cắt bớt).

#### Không bao giờ để mất việc chưa lưu *(2/8/2026)*

Chủ dự án khai xong lớp cho hai điểm trường mới, chưa bấm Lưu, trang tải lại
— **mất sạch**. Dữ liệu nguồn nằm trong bộ nhớ trình duyệt cho tới khi ghi
lên máy chủ, mà trang thì tải lại vì đủ thứ lý do.

Cách làm: **không gắn cờ ở từng chỗ sửa** (hàng chục chỗ, sót một chỗ là hỏng
cả cơ chế). Thay vào đó lấy **vân tay** dữ liệu nguồn — `vanTayNguon()` gộp
lớp · giáo viên · phân công · điểm trường · môn · phòng · buổi bận thành một
chuỗi. `chotVanTay()` chụp lúc tải xong và lúc ghi xong; `coThayDoiChuaLuu()`
so lại. Khác nhau nghĩa là có sửa chưa lưu, bất kể sửa ở đâu. Hai lối báo:
dải đỏ *"● Có thay đổi chưa lưu"* cạnh nút Lưu (nút đổi sang đỏ, chữ
*"Lưu ngay"*), và `beforeunload` chặn khi rời trang.

#### Mã lớp phải là mã NGƯỜI đọc được *(2/8/2026)*

Cơ sở dữ liệu dựng trước khi có cột `ma_lop` để trống ô đó, nên bảng Lớp học
bày ra mã UUID 36 ký tự của máy chủ — mà mã lớp chính là thứ người dùng phải
gõ vào tệp Excel. Nút **Đặt lại mã lớp** (chỉ hiện khi có mã xấu).

Dạng mã do chủ dự án chốt: **`<tên lớp>_<viết tắt điểm trường>`** — `1A_DL`,
`1A_DĐ`, `1A_DT`. Tên lớp đứng trước vì đó là thứ người dùng tìm, và sắp theo
mã cũng ra đúng thứ tự lớp. Viết tắt **giữ nguyên dấu tiếng Việt**: bỏ dấu
thì *Diễn Đồng* và *Diễn Đông* đều thành `DD`, lẫn nhau ngay từ mã lớp.
Bốn hàm: `maXauXi()` nhận diện, `tienToDT()` lấy chữ đầu, `maLopTu()` ghép,
`datLaiMaLop()` đổi và chống trùng. Chỉ đụng `maLop` — mọi tham chiếu khác đi
bằng `id`. `sinhLop()` và `taoDuLieuThu()` dùng cùng dạng.

#### Mã GIÁO VIÊN cũng phải là mã NGƯỜI đọc được *(3/8/2026)*

Y hệt chuyện mã lớp hôm 2/8, và cùng một gốc: lỗi upsert `ma_gv: g.id` đã ghi
UUID 36 ký tự của máy chủ vào cột `ma_gv`. Lỗi đã vá nên không đẻ thêm hồ sơ
trùng, nhưng **dữ liệu để lại thì vẫn xấu** — mà `ma_gv` chính là thứ người
dùng đọc trong bảng Giáo viên và gõ vào cột `Ma_GV` của tệp Excel.

Dạng mã do đó chốt là **`<tên gọi>_<viết tắt họ và đệm>`** — `Oanh_NT`,
`Hương_PT`, `Chung_TT`. Tên gọi đứng trước vì ba lý do: đó là thứ nhà trường
dùng để gọi nhau; sắp theo mã thì **các cặp trùng tên gọi nằm sát nhau**, nhìn
ra ngay đúng bốn cặp mà R09 vẫn cảnh báo; và gõ vào Excel thì gõ phần mình nhớ
trước. **Giữ nguyên dấu** — *Thùy* và *Thủy* bỏ dấu đều thành `Thuy`.

| Hàm | Việc |
|---|---|
| `maXauChuoi(m, toiDa)` | phép thử chung "mã thế nào là xấu" — mã lớp và mã giáo viên dùng chung một định nghĩa |
| `maGVTu(hoTen)` | sinh mã từ họ tên |
| `maGVXau(g)` | nhận diện mã cần chữa (ngưỡng 20, không phải 14) |
| `datLaiMaGV(tatCa)` | đổi và chống trùng |
| `chuanMaGV()` | chạy tự động lúc nạp, **chỉ chữa mã xấu** |

Ba điều bắt buộc:

- **Chỉ đụng `maGV`.** Mọi tham chiếu khác đi bằng `id`. Có phép thử chụp lại
  toàn bộ phân công · chủ nhiệm · lưới · tài khoản trước và sau, đòi giống hệt.
- **Đổi mã KHÔNG đẻ dòng mới trên máy chủ** vì `ghiDuLieuNguon()` đã tách hai
  nhánh: ai có trên máy chủ thì upsert theo `id`. Đừng bao giờ gộp hai nhánh ấy —
  đó đúng là chỗ đã đẻ ra 105 hồ sơ ngày 2/8.
- **Ngưỡng "xấu" của mã giáo viên là 20 ký tự, không phải 14 như mã lớp.** Đặt
  bằng 14 thì chính mã do `maGVTu()` sinh ra lại bị coi là xấu, và mỗi lần nạp
  dữ liệu app lại báo "vừa đặt lại mã" — phiền mà không sửa được gì.

⚠️ Bẫy đã lộ ra khi làm việc này: phép thử *"Từng dòng phân công khớp nguyên
bản"* của vòng xuất–nhập ma trận **vẫn xanh dù thiếu một phép ánh xạ**. Nó đối
chiếu `gvId` nội bộ với mã trong tệp Excel, và hai thứ ấy **tình cờ trùng nhau**
suốt vì `maGV` còn trống nên rơi về `g.id`. Đặt mã đọc được là lộ ngay. Bài học:
phép thử so hai thứ *tình cờ bằng nhau* thì không kiểm được gì cả.

#### Thứ tự Bảng điều hành — sắp lại *(3/8/2026)*

Chủ dự án nhận xét *"giao diện rời rạc"*: trang là một chồng hộp trắng rời
nhau, mà **băng rôn mang tên trường** — thứ neo cả trang — lại nằm mãi dưới
đáy, sau cả lưới. Thứ tự nay:

```
1. dải đỏ việc gấp  CHỈ hiện khi có giáo viên báo nghỉ chưa xử lý
2. THỜI KHÓA BIỂU   bốn thẻ chuyển + nút Xuất và in cùng một hàng, rồi lưới
3. việc cần xử lý
4. dải bốn chỉ số   lớp · % đã xếp · giáo viên · điểm trường
5. tiến độ · cảnh báo · điểm trường
```

**Băng rôn navy đã BỎ HẲN, và thẻ lưới KHÔNG có dòng tiêu đề** *(3/8/2026)*.
Cả hai chỉ lặp lại thứ đã nói ở chỗ khác — tên trường có sẵn ở thanh trên
cùng, số lớp và phiên bản có ở dải chỉ số và khối Việc cần xử lý — mà ăn mất
gần 200px chiều cao **ngay trên lưới**. Mục tiêu chủ dự án nêu thẳng: *"tạo
cho TKB không gian rộng hơn"*.

Nút **Xuất và in** dời lên **ngang hàng với bốn thẻ chuyển** (`.xem-xuat`,
`flex:0 0 auto` để không giãn theo). Nhãn số liệu thu thành `.dai-phu .meta`
nằm cuối hàng dải chọn.

⚠️ **Dải đỏ việc gấp thì GIỮ.** Nó là chỗ duy nhất báo việc gấp ở đầu trang
sau khi khối *Việc cần xử lý* lùi xuống dưới lưới. Không có việc thì
`daiViecGap()` trả rỗng — không tốn một pixel nào. Đừng gỡ nó khi dọn giao
diện: gỡ là hiệu trưởng mở app lên không còn chỗ nào báo cô A đang nghỉ.

**Màu nút trên nền trắng: cùng một hệ navy, khác nhau độ đậm** *(3/8/2026)*.
Thẻ chuyển và nút điểm trường trước đây nền trắng viền mảnh — chủ dự án:
*"nhìn màu trắng không rõ"*. Nay chưa chọn là `--nav-nhat` nổi khối, đang
chọn là `--nav` đậm hơn. Hai tín hiệu (màu đậm nhạt + đổ bóng), không chỉ một.

**Thanh bên: nhãn nhóm nổi khối, mục con giảm nhẹ** *(sửa lần hai 3/8/2026)*.
Lần đầu mới làm chữ nhãn nhóm đậm và sáng hơn, nhưng **mục con vẫn là những
tấm thẻ có nền và viền** còn nhãn nhóm thì trong suốt — nhìn tổng thể vẫn
thấy cấp dưới nổi hơn cấp trên. Nay đảo hẳn: nhãn nhóm có nền + vạch vàng
bên trái; mục con bỏ nền, bỏ viền, chỉ còn chữ. Ngoại lệ duy nhất là mục
**đang mở** — vẫn nổi rõ.

**Bốn cách xem là THẺ CHUYỂN TẠI CHỖ, không phải nút rời trang** *(3/8/2026)*.
Trước đó chúng là `data-di`: bấm *Theo lớp* là rời Bảng điều hành, và **không
có đường quay lại để bấm thẻ thứ hai**. Chủ dự án nói đúng: *"bấm nút nào thì
hiển thị thời khóa biểu nút đó và không biến mất, muốn quay lại bấm nút khác
không có"*. Nay đổi `S.dhXem` rồi vẽ lại đúng khối ấy — xem `kheSanPhamHTML()`.

Lưới trong Bảng điều hành **CHỈ ĐỌC**: không kéo thả, không chạm sửa. Màn hình
*Theo lớp* mới là chỗ chỉnh tay; hai nơi cùng sửa một thứ thì sớm muộn lệch
hành vi. Hai hàm dựng lưới tuần dùng chung: `luoiTuanLop(id)` · `luoiTuanGV(id)`,
cùng khung `luoiTuanKhung(oNoi)`.

**Ba thứ đã chuyển khỏi Bảng điều hành:**

| Cái gì | Đi đâu | Vì sao |
|---|---|---|
| Tiêu đề + phạm vi + ô tìm kiếm chung | ô tìm kiếm → mục **Giáo viên** | tìm giáo viên là việc của mục Giáo viên; tiêu đề trùng với băng rôn ngay trên nó |
| Cụm sáu nút thao tác nhanh | màn hình **Xếp thời khóa biểu** | Bảng điều hành là chỗ NHÌN thời khóa biểu, không phải bảng nút bấm |
| Bốn thẻ số liệu `.ts` | thành dải `.dai-so` **trên** lưới | bốn hộp cao 102px rời nhau chiếm gần một màn hình để nói bốn con số |

**Việc cần xử lý lùi xuống SAU lưới.** Ngày 2/8 nó được đặt lên đầu vì "thứ
duy nhất có hạn giờ trong ngày". Đúng — nhưng phần lớn thời gian nó là một
hộp xanh *"Hôm nay không có giáo viên báo nghỉ"*, tức là chiếm chỗ đẹp nhất
để nói rằng **không có gì xảy ra**.

**Cái giá phải trả, và cách trả:** việc gấp vẫn phải đập vào mắt ở đầu trang.
Nên khi có giáo viên báo nghỉ chưa xử lý, `bangRon()` gắn thêm **một dòng đỏ
dán liền dưới băng rôn** (`.br-gap`) — bấm được, nhảy thẳng tới Dạy thay. Một
dòng thay cho cả một khối, và **không thêm hộp rời nào** vì nó dính vào băng
rôn thành một khối (`.bang-ron.gap` bỏ bo góc dưới). Có phép thử canh cả hai
trạng thái.

#### Sản phẩm lên trước, quy trình lùi sau *(2/8/2026)*

Chủ dự án nêu đúng chỗ hổng của quy trình ba bước: *"sản phẩm đầu ra quan
trọng nhất là Thời khóa biểu nằm ẩn dưới thanh điều hướng… người dùng mới
vào chưa biết, nghĩ đây là trang web"*. Thanh bên xếp theo trình tự làm việc
là đúng cho người **đang xếp**, nhưng người mở phần mềm ra lần đầu — hay mở
lại sau khi đã xếp xong — chỉ muốn thấy **cái lưới**.

Nay `mDieuHanh()` **đổi vai theo trạng thái**:
- **Đã xếp được tiết nào** → mở đầu bằng chính thời khóa biểu (lưới toàn
  trường cuộn trong khung cao 46vh) + năm nút đi thẳng: Toàn trường · Theo
  lớp · Theo giáo viên · Theo khối · Xuất và in. Ba thẻ bước lùi xuống dưới.
  Có nhắc luôn *"Chưa công bố — thầy cô chưa xem được bản này"* khi cần.
- **Chưa xếp gì** → giữ nguyên ba bước lên trước, vì lúc đó người dùng thật
  sự cần được dẫn đường.

Nguyên tắc rút ra: **bảng điều hành phải trả lời "phần mềm này cho tôi cái
gì", không phải "tôi đã làm tới đâu"** — tiến độ chỉ có nghĩa với người đang
làm dở. Có phép thử canh cả hai trạng thái và canh thứ tự (khối sản phẩm
phải đứng trước ba thẻ bước).

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

#### BÁO NGHỈ VÀ DẠY THAY — tiện ích điều hành *(3/8/2026)*

Đây là tính năng dùng **suốt năm học**, khác hẳn phần xếp lịch chỉ dùng vài
tuần tháng 8. Định vị đúng của nó: *một tiện ích điều hành trong app thời
khóa biểu*, **không phải hệ thống quản lý nghỉ phép**. Mọi quyết định dưới
đây đều xuất phát từ câu ấy.

**Vòng đời một việc:** giáo viên gửi thông báo nghỉ → app tự đọc lưới TKB ra
các tiết cần bố trí → gợi ý ba phương án → Ban Giám hiệu chọn → lưu vào
`day_thay` → thông báo tới người dạy thay. Giáo viên **không phải nhập lại
tiết nào**; họ chỉ chọn ngày, buổi, lý do.

Ba tầng hàm trong vùng LOGIC, tách bạch cố ý — đều là hàm thuần, `npm test`
gọi thẳng:

| Hàm | Việc |
|---|---|
| `tietCanThay(bn)` | việc gì phải làm — đọc thẳng từ `S.tkb` |
| `ungVienThay(o, gvVang, ngay, lich, boQua)` | ai làm được — **LỌC CỨNG rồi mới chấm điểm** |
| `phuongAnThay(bn, boQua)` | ba phương án gói sẵn cho người quản lý chọn |
| `xungDotDayThay(ds, boQua)` | chốt chặn cuối, chạy lại **ngay trước khi lưu** |
| `vieccanXuLy()` | một nguồn sự thật cho cả ba chỗ hiện huy hiệu |

**LỌC trước, CHẤM ĐIỂM sau.** Người vướng ràng buộc cứng phải **BIẾN MẤT**
khỏi danh sách, không phải xuống cuối — xếp cuối thì vẫn có người bấm nhầm.
Bảy trường hợp bị loại, mỗi cái một dòng `return` riêng để sửa một điều kiện
không đụng vào sáu điều kiện kia: chính người đang nghỉ · cũng đang báo nghỉ ·
đang có tiết cùng giờ · đã đăng ký buổi bận · đã nhận dạy thay lớp khác cùng
tiết · đang ở điểm trường khác trong buổi ấy · đã kín `GIOI_HAN_TIET_BUOI`.

**`boQua` là tham số bắt buộc phải nhớ.** Khi người quản lý ĐỔI phương án đã
chọn, tiết cũ đang được dời đi nên không được tính là "người này đã bận" —
đúng khuôn `dangChiemPhong(…, boLop)` của phòng chức năng.

**Chốt chặn TUYỆT ĐỐI của §14 nằm ở CƠ SỞ DỮ LIỆU, không phải ở app**
*(3/8/2026)*. Chỉ số `ux_day_thay_gv_mot_tiet` — unique trên
`(truong_id, ngay, buoi, tiet, gv_thay_id) where gv_thay_id is not null`.

Lý do: `xungDotDayThay()` đọc `S.dayThay` của **chính trình duyệt ấy**. Hai
cán bộ quản lý phân công cùng lúc ở hai máy thì cả hai đều thấy "sạch" và cả
hai đều ghi được — **không phép thử nào ở phía app đóng được lỗ này**, vì mỗi
bên chỉ biết trạng thái của mình. Ràng buộc unique sẵn có
`(truong_id, ngay, buoi, tiet, lop_id)` chặn hai người ghi đè cùng một LỚP,
nhưng không chặn một GIÁO VIÊN bị gán vào hai lớp khác nhau cùng một tiết.

Điều kiện `where gv_thay_id is not null` là bắt buộc: lớp tự quản để trống
người dạy, và nhiều lớp cùng tự quản một tiết là chuyện bình thường.

`luuDayThay()` dịch lỗi 23505 của chỉ số này thành câu người đọc được, không
để lộ tên chỉ số ra màn hình.

**Kiểm tra xung đột chạy HAI lần**: một lần lúc vẽ màn hình (để người dùng
thấy vấn đề trong khi đang chọn, nút Xác nhận khoá luôn), một lần nữa ngay
trước khi ghi. Danh sách gợi ý dựng lúc mở màn hình có thể đã cũ: người quản
lý bên tab kia vừa lưu một phân công khác, hoặc một giáo viên vừa báo nghỉ.
Có xung đột thì **không dòng nào được lưu** và hộp thoại nói rõ ai · khi nào ·
vì sao.

**Ba phương án, KHÔNG bày điểm số.** Người dùng là hiệu trưởng — họ cần biết
"vì sao người này" (*trống cả buổi · cùng điểm trường · đã từng dạy lớp này ·
chuyên môn phù hợp · chỉ có 2 tiết trong ngày*), không cần biết 137 hơn 129.
Mỗi phương án ưu tiên để **một người dạy trọn cả buổi** vì đó là cách nhà
trường vẫn làm; không ai trống trọn buổi thì tự chuyển sang ghép nhiều người
theo từng tiết **và nói rõ ra**, chứ không im lặng.

**Cán bộ quản lý chỉ vào phương án dự phòng** — trừ 200 điểm. Biết ai là cán
bộ quản lý nhờ đọc thêm bảng `nguoi_dung` lúc tải (`S.giaoVienQL`).

**Ba chỗ hiện thông báo đều lấy từ `vieccanXuLy()`** — chuông trên thanh đầu
trang, huy hiệu mục *Dạy thay*, khối *Việc cần xử lý* ở Bảng điều hành. Ba
chỗ đếm bằng ba đoạn mã riêng thì sớm muộn lệch nhau.

**KHÔNG dựng bảng thông báo riêng.** Mọi dòng đều suy ra được từ `bao_nghi`
và `day_thay`: quản lý thấy thông báo nghỉ `trang_thai='cho'`, giáo viên thấy
tiết `day_thay` của mình chưa `da_xem`. Thêm một bảng nữa là thêm một chỗ để
lệch dữ liệu mà không có thêm thông tin nào.

**Chỉ đếm việc từ HÔM NAY trở đi.** Thông báo nghỉ của tuần trước không còn là
việc phải làm; để đấy chỉ tổ làm huy hiệu đỏ mãi không tắt.

**Biểu mẫu báo nghỉ đúng bốn ô** — ngày, buổi, lý do, ghi chú — và lọt gọn
một màn hình điện thoại. Cố ý **không có**: đơn dài, tệp minh chứng, chữ ký
điện tử, phê duyệt nhiều bước, trạng thái hành chính. Ba nút buổi và năm nút
lý do là **nút bấm to 44px**, không phải ô chọn xổ xuống: thầy cô thao tác
bằng ngón cái, và bày hết ra vẫn gọn hơn bắt mở danh sách. Biểu mẫu xem trước
luôn **số tiết sẽ phải bố trí**, để thầy cô biết mình để lại việc gì.

Bản in lịch dạy thay dùng lại `khungIn()` nên thể thức giống hệt mọi bản in
khác. Ba lối ra: **In · Xuất Word · Sao chép gửi Zalo** — bản Zalo là chữ
thuần gom theo ngày, vì Zalo không nhận bảng.

#### Ô tìm kiếm trong danh sách dài *(2/8/2026)*

Sau sáp nhập là ~60 lớp, ~86 giáo viên, ~600 dòng phân công. Việc thường
xuyên nhất trên các màn hình khai báo — *tìm cô Hương* — lại là việc phần
mềm chưa hề đỡ: chỉ có cuộn tay, bằng ngón cái, trên điện thoại.

Bốn quyết định của bộ này, cả bốn đều có phép thử:

1. **Lọc tại chỗ, không gọi `ve()`.** Vẽ lại màn hình sau mỗi phím là con trỏ
   nhảy ra ngoài và bàn phím điện thoại đóng sập ngay từ chữ cái đầu.
   `locBang()` chỉ bật/tắt `display` của từng dòng.
2. **Tìm không dấu, không phân biệt hoa thường** — `chuTim()`. Thầy cô gõ
   điện thoại rất ít khi bỏ dấu đúng; gõ `huong` phải ra *Nguyễn Thị Hương*.
3. **Nhiều từ khoá là phép VÀ** — `khopLoc()`. `1a dien dong` ra đúng một dòng.
4. **Danh sách ngắn thì KHÔNG bày ô tìm kiếm** (`NGUONG_LOC = 12`). Trường một
   điểm, 10 lớp thì ô tìm kiếm chỉ là thứ vướng mắt.

| Hàm | Việc |
|---|---|
| `oLoc(id, số, đơn vị, gợi ý)` | dựng ô tìm kiếm cho một **bảng**; trả rỗng khi danh sách còn ngắn |
| `locRong(id)` | dải *"Không có … nào khớp"* — không để bảng trống trơn |
| `tuLoc(...mảnh)` | gộp các mẩu thành `data-loctu` của mỗi dòng |
| `oLocChon(idSel, …)` · `locChon()` | bản dành cho **ô chọn** dài, lọc `<option>` |

Hai chỗ dễ sai khi sửa vùng này:

- **Mục đang chọn không bao giờ bị giấu** trong `locChon()`. Giấu đi thì ô
  chọn hiện ra trống trơn và người dùng tưởng mất dữ liệu.
- **Bảng phân công đi đường khác.** 600 dòng thì vẽ lại rẻ hơn giữ hết trong
  trang rồi ẩn, nên `bangPC()` lọc thẳng trong dữ liệu. Ô `#fTim` vì thế phải
  nằm **ngoài** `#bPC` — để trong thì mỗi phím gõ là mất con trỏ.

Chỗ đã gắn: Lớp học · Giáo viên · Môn học · Phòng học · Buổi bận · Phân công ·
TKB theo lớp · TKB theo giáo viên · Dạy thay · Xuất và in.

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
- Bản thứ năm thêm 3/8/2026: **Lịch phân công dạy thay** (`trangInDayThay`),
  A4 ngang, in đúng khoảng đang lọc trên màn hình chứ không in cả năm học.

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
- **HTML tĩnh trong trang phải TRUNG TÍNH** *(2/8/2026)*. Trước khi
  `khoiDong()` chạy xong, người dùng nhìn thấy đúng những gì viết cứng trong
  `<body>` — trên điện thoại mạng chậm là vài giây. Bản cũ viết cứng
  `TRƯỜNG TIỂU HỌC DIỄN LIÊN` và badge chuông `0`, nên ai mở trang cũng thấy
  tên một trường thật hiện ra rồi mới biến mất — vừa lộ dữ liệu, vừa nhìn
  như phần mềm lỗi. Nay là `THỜI KHÓA BIỂU` / `Đang tải…` / badge rỗng.
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

> **Việc đã xong chuyển sang `docs/lich-su-quyet-dinh.md`** *(2/8/2026)* —
> nguyên văn, đủ ngày tháng, ghi chú kỹ thuật và các “bẫy” đã trả giá.
> Sắp sửa vào một vùng mã cũ thì đọc tệp ấy trước.
> Đề xuất chưa đưa vào lộ trình: xem `docs/danh-gia-va-de-xuat.md`.

- [ ] **Phát quyền cho 35 thầy cô Diễn Liên.** Nút *Tạo N mã* trong hộp **Mã
      mời** nay làm cả mẻ trong một cú bấm, kèm nút chép và tải Excel — việc
      còn lại là gửi Zalo. Hai nhóm bị **cố ý bỏ qua**: người đã có tài khoản,
      và hồ sơ không có dòng phân công nào (thường là hồ sơ thừa của bộ dữ liệu
      thử; phát mã vào đó là cầm chắc một thầy cô đăng nhập xong nhìn màn hình
      trắng — xem sự cố cô Oanh trong `docs/lich-su-quyet-dinh.md`).
      · **link mời cả trường** — một link dán nhóm Zalo, thầy cô bấm rồi tự
        nhận tên mình — vẫn để ngỏ cho Pha 2. Thiết kế đã bàn ngày 2/8 (chế độ
        *Nhẹ*), **chưa viết dòng mã nào**. Nó cần thêm bảng, thêm quy tắc RLS
        và một màn hình soi lại; không nên nằm trên đường tới ngày khai giảng.
- [ ] Dọn hồ sơ giáo viên và lớp thừa của bộ dữ liệu thử trên máy chủ thật
      *(2/8/2026)*. Chạy `db/soi-tai-khoan-gv.sql` để biết còn sót gì.
- [ ] **Chạy `db/cai-dat.sql` lại một lần trên máy chủ thật** để có bảng
      `bao_nghi` và hai cột mới của `day_thay` (`da_xem`, `bao_nghi_id`).
      Chưa chạy thì app vẫn mở bình thường — đọc bằng `.catch(() => [])` —
      nhưng gửi báo nghỉ sẽ báo đúng câu "máy chủ chưa có bảng báo nghỉ".
- [ ] **Âm báo nhẹ khi có thông báo mới** *(§9 bản giao việc 3/8/2026, ghi rõ
      là tuỳ chọn)*. Chưa làm: cần một nút bật/tắt và một chỗ nhớ lựa chọn ấy,
      mà chỗ nhớ duy nhất được phép dùng là `localStorage` — vốn đang chỉ giữ
      vé đăng nhập. Không nên chen vào trước ngày khai giảng.
- [ ] **Đẩy thông báo thời gian thực** (Supabase Realtime). Hiện thông báo chỉ
      cập nhật khi tải lại dữ liệu; đủ dùng cho quy mô một trường, nhưng cô A
      báo nghỉ lúc 6h sáng thì hiệu trưởng phải mở lại app mới thấy.
- [ ] Nhập lớp và giáo viên THẬT của Diễn Đồng, Diễn Thái khi danh sách chốt.
      Đường đã thông: gộp ba bảng phân công vào một tệp Excel, cột `Ma_lop` đặt
      tiền tố theo trường (`DL-1A`, `DD-1A`, `DT-1A`), `Ten_lop` giữ nguyên.
- [ ] Sửa tên đơn vị khi có quyết định sáp nhập chính thức. **Trước khi làm
      phải chạy `db/cai-dat.sql` một lần trên máy chủ đang chạy** — bản cũ
      thiếu quy tắc `p_truong_sua` nên đổi tên bao nhiêu lần cũng không lưu
      được, mà phần mềm vẫn báo đã lưu.

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
