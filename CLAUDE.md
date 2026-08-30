# Hệ thống Thời khóa biểu — trường tiểu học nhiều phân hiệu

Luôn trả lời và viết comment bằng **tiếng Việt**.

---

## 1. Bối cảnh

Các trường tiểu học đang sáp nhập theo **Công văn 777/TTg-TCCV ngày 10/7/2026**
của Thủ tướng Chính phủ, hạn hoàn thành **trước 30/8/2026**. Sau sáp nhập,
một trường có nhiều **phân hiệu** cách nhau vài cây số. Việc xếp thời khóa
biểu vì thế đổi hẳn về bản chất: xuất hiện chiều thứ ba là **không gian**.

Người dùng: cán bộ quản lý nhà trường (hiệu trưởng, phó hiệu trưởng phụ trách
phân hiệu, người xếp TKB) và toàn thể giáo viên. Đa số ở tuổi 35–55, quen
Excel, không quen phần mềm phức tạp.

**Chủ dự án:** Phó Hiệu trưởng Trường Tiểu học Diễn Liên, xã Quảng Châu,
tỉnh Nghệ An. Vừa là người dùng thật, vừa là người phát triển.

### Sáp nhập ba trường — trạng thái hiện tại

Theo kế hoạch, **Tiểu học Diễn Liên + Diễn Đồng + Diễn Thái** nhập thành một
đơn vị, thành ba phân hiệu.

⚠️ **Tên đơn vị mới CHƯA có quyết định.** Phần mềm ghi `Trường Tiểu học mới`,
kể cả trong bộ dữ liệu mẫu — *Diễn Liên* nay chỉ còn là tên một **phân hiệu**,
không phải tên đơn vị. Đừng bịa tên chính thức; có quyết định thì sửa ở mục
*Bước 1 · Thông tin trường*.

⚠️ **Danh sách cán bộ giáo viên của cả ba trường CHƯA chốt.** Tệp Excel đang có
là bản của năm học trước, dùng làm ví dụ. 25 lớp và 35 giáo viên trong bộ mẫu
đều là của Diễn Liên.

Để chạy thử ở đúng quy mô, dùng nút **Tạo dữ liệu thử** ở mục *Phân hiệu*:
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
| Đọc Excel | SheetJS qua CDN, **nạp khi cần** | nhập PCGD — nhẹ, đủ việc |
| Ghi Excel | **ExcelJS** qua CDN, **nạp khi cần** | SheetJS bản cộng đồng KHÔNG tô màu, kẻ viền hay đặt khổ giấy được |
| Logo | PNG 96px nhúng base64 trong trang | giữ được single-file, ~21 KB |
| Font | Be Vietnam Pro (Google Fonts) | hỗ trợ dấu tiếng Việt tốt |

**Hai thư viện Excel KHÔNG nằm trong `<head>`** *(16/8/2026)*. Chúng nặng
507 KB và trước đây tải ở **mọi** lần mở app, trong khi giáo viên — nhóm
đông nhất, mở app mỗi sáng — không bao giờ nhập hay xuất Excel. Nay
`napThuVien(url)` nạp khi thật sự cần; mọi nơi dùng đi qua
`await sanSangExcelJS()` / `await sanSangXLSX()`. Đo được: **736 KB → 229 KB
mỗi lần mở**, giảm 69%.

⚠️ Thẻ script nạp động **phải khai `crossOrigin='anonymous'`**. Thiếu nó thì
trình duyệt tải ở chế độ no-cors, phản hồi "mờ" không vào được kho Service
Worker, và lần bấm sau vẫn tải lại 240 KB — sửa xong mà không được gì. Có
phép thử ở `soi-pwa` canh. `sw.js` cũng lấy **kho trước** cho địa chỉ CDN có
ghim phiên bản và phông chữ (chúng không bao giờ đổi nội dung); trang chính
thì giữ **mạng trước** để không ai kẹt lại ở bản cũ.

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
Dữ liệu thật của Trường TH Diễn Liên có 4 cặp trùng tên gọi, và một cặp chỉ
khác nhau ở DẤU. Phần mềm cũ chắp vá thủ công (thêm chữ cái vào sau tên gọi,
thêm chức danh) nên không đọc ngược được. Sau sáp nhập ~100 giáo viên thì số
cặp trùng tăng theo cấp số nhân.

Bộ demo giữ **đúng khuôn ấy** bằng tên hư cấu *(28/8/2026)*: bốn cặp trùng
tên gọi *Nhài · Mận · Sen · Nhã*, cặp chỉ khác dấu *Hạnh / Hanh*, và các tên
gọi rút gọn có hậu tố phân biệt (`Cô NhàiB`, `Cô K.Sen`). Đổi bộ dữ liệu ấy
thì phải giữ nguyên khuôn — R09 và `maGVTu()` có phép thử canh.

**Điều này áp dụng cho cả LỚP, không riêng giáo viên** *(sửa 1/8/2026)*. Bảng
`lop` từng khoá theo `(truong_id, ten)` và phần mềm dò lớp bằng tên — nghĩa là
ba trường sáp nhập, cả ba đều có lớp *1A*, thì không nhập nổi. Nay khoá tự
nhiên là **`ma_lop`** (đúng cách đã làm với `ma_gv`), `giaoVien.cn` giữ **mã
lớp** chứ không phải tên lớp, và tên lớp chỉ còn là nhãn hiển thị — trùng nhau
thì `tenLopDay()` tự ghi kèm phân hiệu. Ba hàm phải đi qua: `cnCuaLop(idLop)`,
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

#### Mỗi vai trò một đường tải — giáo viên chỉ tải phần của mình *(18/8/2026)*

`taiDuLieu()` nay rẽ hai nhánh theo `KHO.nguoiDung.vaiTro`. Lý do là số đo:
một lần mở app ở trường 40 lớp tốn **427,7 KB**, và cùng một khối ấy được
tải cho **mọi** vai trò — kể cả thầy cô chỉ vào xem 23 ô của mình rồi tắt.
Giáo viên đông gấp hàng chục lần cán bộ quản lý và mở app mỗi sáng, nên đây
là khoản băng thông lớn nhất của cả hệ thống.

| | trước | sau |
|---|---|---|
| Cán bộ quản lý | 427,7 KB · 14 truy vấn | **166,2 KB** · 14 truy vấn |
| Giáo viên | 427,7 KB · 14 truy vấn | **20,7 KB** · 9 truy vấn |

| Hàm | Việc |
|---|---|
| `taiChoQuanLy(t, bang)` | đủ dữ liệu để xếp lịch — đúng đường cũ, chỉ siết lại |
| `taiChoGiaoVien(t, bang)` | bỏ hẳn phân công · phòng · buổi bận · danh sách tài khoản |
| `luoiCuaToi()` | gọi RPC `tkb_cua_toi()`, tự lùi về đường cũ nếu máy chủ chưa có |
| `taiLuoiDayDu()` | tải lưới cả trường **lúc giáo viên bấm sang màn xem theo lớp** |
| `taiThemNgayNghi(tuNgay)` | Ngày công xem tháng cũ thì tải bổ sung đúng khoảng thiếu |

Năm điều bắt buộc, cả năm đều có phép thử (`npm test` mục 19):

- **Lọc theo người phải lọc ở MÁY CHỦ.** `tkb_cua_toi()` trong
  `db/tai-nhe.sql` cố ý để `security invoker` — quy tắc `p_tkb_doc` vẫn
  nguyên hiệu lực nên giáo viên chỉ đọc được bản **đã công bố** của đúng
  trường mình. Hàm ấy chỉ lọc bớt, không mở thêm cửa nào.
- **Chưa nối hồ sơ giáo viên thì KHÔNG lấy dòng nào**, chứ tuyệt đối không
  rơi về dòng của người đầu danh sách — thầy cô sẽ xem nhầm lịch đồng
  nghiệp mà không hay. Bộ lọc dùng `ngay=gte.9999-12-31` cho chắc.
- **Luôn có đường lui.** Máy chủ chưa chạy `db/tai-nhe.sql` thì `luoiCuaToi()`
  bắt lỗi 404 và tải nguyên khối như cũ. Nâng cấp phần mềm không bao giờ
  được làm một trường đang chạy tốt bỗng hỏng.
- **`KHO.luoiDayDu` là cờ nói S.tkb đang giữ gì.** Giáo viên mở app thì
  `false` (mới có lịch một người); `chuyen()` thấy màn cần lưới cả trường
  thì gọi `taiLuoiDayDu()` rồi vẽ lại. Quản lý luôn `true`.
- **Tải bổ sung không phải là việc chưa lưu** — `taiLuoiDayDu()` gọi
  `chotVanTay()` sau khi nạp, không thì dải đỏ *"Có thay đổi chưa lưu"*
  hiện lên trong khi người dùng chưa sửa gì.

⚠️ Hai bảng `day_thay` và `bao_nghi` trước đây lấy `limit=300` dòng mới nhất
cho mọi vai trò — **255 KB, tức 60% toàn bộ một lần mở**, nặng hơn cả khối
thời khóa biểu. Tệ hơn: một năm học sinh ra chừng 1.400 dòng dạy thay, nên
`limit=300` **âm thầm cắt mất** dữ liệu các tháng trước và bảng Ngày công
thiếu dòng mà không ai biết. Nay lọc theo **ngày** (từ đầu tháng trước), và
`taiThemNgayNghi()` tải bổ sung khi xem tháng cũ hơn.

#### Chỗ chứa không phình vô hạn — `luu_tkb()` tự dọn *(18/8/2026)*

Mỗi lần bấm Lưu là thêm một dòng, không ghi đè — chủ ý, để có lịch sử phiên
bản miễn phí. Nhưng một mùa xếp bấm Lưu chừng 60 lần mà **59 bản không ai
xem lại bao giờ**: 300 trường là 903 MB ngay mùa đầu, vượt gấp đôi hạn
500 MB của gói miễn phí.

Hai việc, cả hai nằm gọn trong `luu_tkb()` nên không cần tiến trình nền:

- **Gộp các lần lưu liên tiếp.** Bản mới nhất nếu là **của chính mình**,
  **chưa công bố**, và **cách đây dưới 10 phút** thì ghi đè lên chính nó.
  Ba điều kiện đều bắt buộc: bản của đồng nghiệp thì không đụng, bản thầy
  cô đang xem thì không được đổi ruột, cách nhau nửa buổi là hai lần làm
  việc khác nhau.
- **`don_du_lieu_cu(p_truong)`** giữ **10 bản gần nhất + mọi bản đã công
  bố**, và xoá nhật ký cũ hơn 18 tháng.

⚠️ Hàm dọn cố ý là `security definer` **và tự kiểm quyền ở dòng đầu**. Mở
hẳn một quy tắc `DELETE` trên `tkb_phien_ban` nghĩa là bất kỳ cán bộ quản lý
nào cũng xoá được phiên bản bất kỳ — kể cả bản đã công bố mà thầy cô đang
xem. Xoá bản cũ là việc của **hệ thống**, không phải quyền của người dùng.

Đo lại sau khi làm: **903 MB → 150 MB**, băng thông **40,4 GB → 2,0 GB**
mỗi tháng ở quy mô 300 trường. Cả hai đều vừa gói miễn phí.

#### Sao lưu hằng đêm — `.github/workflows/sao-luu.yml` *(18/8/2026, CHẠY THẬT từ 25/8/2026)*

Gói miễn phí của Supabase **không có sao lưu tự động**. Đây là rủi ro nặng
hơn cả chuyện vượt hạn dung lượng: vượt hạn thì còn biết trước mà xử lý,
mất dữ liệu thì không. Lịch chạy 1 giờ sáng, `pg_dump` schema `public` →
gzip → **mã hoá AES-256** → cất làm tệp đính kèm, giữ 90 ngày. Bản đầu
tiên (25/8/2026) đã tải về và mở thử bằng `npm run soi-sao-luu`: đủ 15
bảng, 386 dòng — khớp dữ liệu thật của Diễn Liên.

⚠️ Ba bẫy đã trả giá khi khai `DB_URL` lần đầu (25/8/2026), cả ba đều
làm workflow đỏ mà tệp SQL không có lỗi nào:
- **`DB_URL` phải là Session pooler** (`aws-0-ap-southeast-1.pooler.supabase.com`,
  user `postgres.<ref>`, cổng 5432), KHÔNG phải đường nối thẳng
  `db.<ref>.supabase.co` — địa chỉ ấy trên gói miễn phí **chỉ có IPv6**,
  mà máy chạy GitHub Actions chỉ nói IPv4: nối là hỏng từ bước quay số.
- **Mật khẩu chứa ký tự đặc biệt phải mã hoá URL** — `@` viết thành `%40`,
  không thì dấu `@` trong mật khẩu bị đọc thành dấu ngăn với tên máy chủ.
- **`pg_dump` bản 16 cài sẵn của máy chạy THẮNG trên PATH** dù đã cài
  `postgresql-client-17` — lỗi `server version mismatch` (máy chủ 17.6).
  Bước kết xuất phải `export PATH=/usr/lib/postgresql/17/bin:$PATH` và in
  `pg_dump --version` vào log để lần sau nhìn ra ngay.

⚠️ **Bắt buộc mã hoá.** Bản dump chứa họ tên và email toàn bộ giáo viên —
dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP — mà tệp đính kèm của một kho
mã công khai thì ai có đường dẫn cũng tải được. Cần hai secret: `DB_URL`
và `BACKUP_KEY`; **mất khoá là không giải mã được**.

⚠️ Có bước kiểm bản dump **không rỗng và lớn hơn 10 KB**. `pg_dump` từng
đổ giữa chừng mà vẫn thoát mã 0 khi chuỗi kết nối sai cổng — sao lưu hỏng
mà báo thành công là thứ nguy hiểm nhất: yên tâm suốt nhiều tháng rồi mới
biết.


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

**Mọi id do APP tự đặt phải ánh xạ trước khi ghi vào cột `uuid`** *(29/8/2026)*.
Tiểu học Quảng Châu 1 bấm Lưu ở mục Môn học và nhận
*"invalid input syntax for type uuid: dt1787992176500"* — mất nguyên lần lưu,
kể cả họ tên và định mức, vì Postgres từ chối CẢ lệnh chứ không riêng một ô.
Chuỗi ấy là id phân hiệu **trong app** (`hopThemDT()` đặt `dt`+thời điểm);
`ghiDuLieuNguon()` ánh xạ nó qua TÊN phân hiệu cho bảng `lop` và bảng `phong`
nhưng **bỏ sót `giao_vien.diem_truong_id`** — đúng khuôn lỗi upsert 2/8. Nay
có `idDTSv()` và `laUUID()` khai chung ở đầu vùng DULIEU. `taoMaMoi()` cũng
chặn id chưa lưu và **báo ra**, tuyệt đối không bỏ trống cho qua: cột ấy trống
nghĩa là PHT **toàn trường**, tức âm thầm phát rộng quyền hơn người tạo mã
định phát. Vá một chỗ ghi id thì rà **mọi** bảng nhận id của cùng thứ ấy.

⚠️ Phép thử đầu tiên viết ra **xanh oan**: bộ giả lập đặt id máy chủ là `dt1`,
trùng đúng id app trong bộ dữ liệu mẫu. Lại là cái bẫy "hai thứ tình cờ bằng
nhau" ở mục 3 — id app trong phép thử phải khác hẳn mọi id máy chủ.

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

### Duyệt đăng ký trường — vai CHỦ HỆ THỐNG *(24/8/2026 — `db/duyet-truong.sql`)*

Chủ dự án hỏi *"các trường đăng ký thầy có nhận được không?"*. Không —
và có **ba** lý do tách bạch, cả ba đều phải sửa:

1. `dang_ky_truong()` chỉ ghi vào cơ sở dữ liệu rồi dừng. Không gửi thư,
   không ghi `nhat_ky`, không webhook. Cả kho mã không có một dòng `smtp`.
2. Quy tắc `p_truong_doc` chỉ cho đọc trường của **chính mình** — đúng
   thiết kế cô lập dữ liệu, nhưng cũng nghĩa là không màn hình nào bày ra
   danh sách toàn hệ thống.
3. Chưa có vai nào đứng **ngoài** một trường. Vai cao nhất là `quan_tri`
   — quản trị của *một* trường.

Nay: đăng ký là **gửi đơn**; phải được duyệt và **cấp mã trường 5 chữ số**
mới dùng được. Cửa vẫn mở cho ai cũng gửi được đơn — chủ dự án chốt thế.

| Hàm | Việc |
|---|---|
| `la_chu_he_thong()` | SQL — vai đứng ngoài mọi trường |
| `dang_ky_truong()` | nhận thêm **điện thoại + Gmail**, đặt `cho_duyet`, mã để trống |
| `duyet_truong(id, đồng ý, ghi chú)` | cấp mã 5 chữ số; **tự kiểm quyền ở dòng đầu** |
| `sinh_ma_truong()` | 10000–99999, chống trùng, van 200 lần |
| `ds_truong_he_thong()` | một lời gọi ra đủ danh sách + số lớp · GV · tiết |
| `truong_duoc_dung()` | chốt thật ở `p_tkb_ghi` — chưa duyệt thì không lưu được |
| `laChuHeThong()` · `truongDungDuoc()` | app — vùng QUYEN |
| `mChoDuyet()` · `mChuHeThong()` | hai màn hình mới |

Bảy điều bắt buộc, cả bảy đều có phép thử (`npm run soi` mục 17d · 17e):

- ⚠️ **Cột `trang_thai_duyet` mặc định `'dang_dung'`, KHÔNG phải
  `'cho_duyet'`.** Diễn Liên đang chạy thật — 25 lớp, 710 tiết, phiên bản
  9 đã công bố. Đặt nhầm là sáng mai cả trường mở app lên không vào được.
  Tệp SQL vì thế `update` mọi dòng cũ về `dang_dung` **trước** khi thêm
  ràng buộc, không thì lệnh còn hỏng ngay tại chỗ.
- ⚠️ **Máy chủ chưa chạy tệp SQL thì phải hiểu là "đang dùng", không phải
  "chờ duyệt".** `napHoSo()` xin thêm cột mới trong một `try`; hỏng thì
  lùi về lời gọi cũ và `trangThaiTruong` rơi về `'dang_dung'`. Hiểu ngược
  chiều là mọi trường đang chạy bỗng bị khoá cửa.
- **Tên cột là `trang_thai_duyet`, không phải `trang_thai`.** `npm run soat`
  bắt ngay lần chạy đầu: đã có enum `trang_thai_nghi_t` của bảng `bao_nghi`.
  Đúng khuôn bài học cột `buoi_nghi` — đặt tên trùng một enum khác nghĩa là
  bẫy đọc nhầm cho người sửa sau.
- **Vai chủ hệ thống KHÔNG nhét vào enum `vai_tro_t`.** Vai trò trong enum
  ấy là vai trò *trong một trường*; gộp chung thì mọi câu so vai trò đều
  phải nhớ loại trừ nó, sớm muộn có chỗ quên. Là một cột `boolean` riêng.
- **`duyet_truong()` là `security definer` và tự kiểm quyền ở dòng đầu.**
  Thiếu dòng ấy là bất kỳ ai đăng nhập cũng tự duyệt được trường của mình —
  đúng thứ tính năng này sinh ra để ngăn. Cùng khuôn `don_du_lieu_cu()`.
- **Duyệt lại trường đã có mã thì GIỮ NGUYÊN mã cũ.** Cấp mã mới nghĩa là
  mọi giấy tờ nhà trường đã in ra thành sai.
- **Chủ hệ thống không bị màn hình chờ nhốt lại.** Nếu trường của chính họ
  đang `cho_duyet` mà vẫn bị đẩy về màn chờ thì không ai duyệt nổi cho ai.

⚠️ **Chủ dự án phải tự đặt mình làm chủ hệ thống bằng tay, một lần:**
`update nguoi_dung set la_chu_he_thong = true where email = '…';`
Cố ý **không** viết sẵn Gmail vào tệp SQL — kho mã là kho công khai. Có
phép thử canh không cho địa chỉ thật lọt vào đó.

⚠️ **Mã trường (5 chữ số) và mã mời giáo viên (6 chữ cái) là HAI THỨ KHÁC
NHAU ở hai tầng.** Mã trường đưa một *trường* vào hệ thống; mã mời đưa một
*giáo viên* vào một trường đã có. Chọn hai dạng khác hẳn nhau chính là để
nhìn phát biết đang cầm mã gì.

#### Màn hình chờ duyệt — vá bốn chỗ *(28/8/2026)*

Chủ dự án gửi ảnh chụp chính màn hình này. Bốn chỗ hỏng, cả bốn đều có
phép thử ở mục **17f** của `npm run soi`:

- ⚠️ **`.the` cố ý KHÔNG mang padding** — mọi màn hình khác bọc nội dung
  trong `.the-t`. `mChoDuyet()` đặt thẳng `.hang` làm con của `.the` nên
  giá trị căn phải dính sát vạch viền trên máy tính và **tràn hẳn ra ngoài
  thẻ** trên điện thoại: `chungtrt@nghean.edu.vn` bị cắt cụt. Dựng thẻ mới
  thì nhớ lớp bọc ấy.
- **Thanh đầu trang bày tên TRƯỜNG MẪU.** Trường chờ duyệt chưa tải được
  dữ liệu của mình nên `S` đang giữ bộ mẫu — người dùng thấy *TRƯỜNG TIỂU
  HỌC MỚI* ngay phía trên tấm thẻ ghi tên trường thật trong đơn của họ.
  Nay lấy từ `KHO.nguoiDung.tenTruong`, dòng dưới ghi trạng thái đơn.
- **Chuông và kính lúp im hẳn.** Huy hiệu đỏ *4* là số cảnh báo của bộ dữ
  liệu mẫu — con số vô nghĩa với trường chưa có dữ liệu nào của mình.
- **Nhóm menu duy nhất còn hiện phải TỰ BUNG.** `dungMenu()` chỉ mở
  `NHOM_MAC_DINH` (ĐIỀU HÀNH), mà vai này bị giấu hết mục — thanh bên còn
  mỗi nhãn *HỆ THỐNG* đóng im, bấm mãi không ra gì. Nay không nhóm mở nào
  còn mục thì bung nhóm đầu tiên còn thấy được.

**`diaBan('Xã', S.xa)` thay cho `'Xã '+S.xa`.** Trường tự khai nên ô Xã hay
được gõ sẵn cả chữ *Xã Quảng Châu*; dán thêm tiền tố là thanh đầu trang đọc
ra *Xã Xã Quảng Châu*.

### Chủ hệ thống xem được mọi trường — CHỈ ĐỌC *(29/8/2026 — `db/chu-he-thong-xem.sql`, ĐÃ CHẠY trên máy chủ thật cùng ngày)*

Chủ dự án: *"muốn vào được tất cả các trường đăng ký sử dụng App, nhưng khi
vào thì lại chỉ hiển thị trường TH Diễn Liên"* — và nói thêm *"có thể sửa
luôn chứ xem cũng không cần lắm"*.

**Chốt là CHỈ ĐỌC.** Lý do không phải kỹ thuật thuần: mã trường ở tầng ghi
được **suy ra từ tài khoản** (`luu_tkb` · `ghiDuLieuNguon` · `phamViLuu`), mà
năm trường đang lưu dữ liệu thật qua đúng đường ấy — mở nó ra là sửa xương
sống giữa tháng khai giảng, đúng vùng CLAUDE.md dặn để nguyên cho Pha 2. Cần
sửa tận tay một trường thì xin nhà trường **một tài khoản trong trường ấy**:
không tốn dòng mã nào, và nhật ký ghi đúng tên người sửa.

| Hàm | Việc |
|---|---|
| `truongDangXem()` | trường màn hình đang bày; mọi lời gọi tải đi qua đây |
| `moTruongDeXem(id, ten)` · `thoatTruongXem()` | vùng DULIEU, không đụng DOM |
| `veTheXemTruong()` | thẻ nổi ĐỎ, đúng khuôn `veTheDemo()` |

Năm điều bắt buộc, cả năm đều có phép thử (`npm run soi` mục 17k):

- **MỘT cờ khoá đồng loạt.** `quyen()` thêm `chiXem` → `laQuanLy` và
  `toanTruong` cùng false. `duocXep()` · `duocSuaNguon()` chỉ hỏi hàm ấy, và
  56 nơi khác đều đi qua nó. Đi khoá từng nút thì sớm muộn sót một cái — mà
  cái sót ấy lại là cái ghi đè dữ liệu của một nhà trường khác.
- ⚠️ **Phép thử quét CẢ 12 màn hình** đòi không còn nút ghi nào. Nó bắt được
  ngay lần chạy đầu: nút *Lưu lên máy chủ* ở màn Xếp hiện **vô điều kiện** —
  `luuDuoc` chỉ hỏi "có máy chủ không", không hỏi quyền.
- **Thêm quy tắc đọc MỚI, không sửa quy tắc cũ.** Năm trường đang chạy đều đi
  qua các quy tắc đọc hiện có; viết lại chúng là đặt cược cả năm trường vào
  một lần chạy SQL. RLS gộp quy tắc permissive bằng phép HOẶC nên thêm là đủ.
- ⚠️ **Ba bảng cố ý KHÔNG mở**: `ma_moi` (mã mời là chìa khoá vào trường — đọc
  được là đi vòng qua chính hàng rào ghi), `bao_nghi` (chứa **lý do nghỉ** —
  dữ liệu cá nhân nhạy cảm theo Nghị định 13/2023, không giúp gì cho việc xếp
  lịch), `day_thay` (suy ngược ra được ai nghỉ ngày nào).
- **Máy chủ chưa chạy tệp SQL thì nói ĐÚNG chuyện ấy.** Quy tắc đọc chưa có
  thì PostgREST vẫn trả 200 nhưng lọc sạch mọi dòng — nhìn ra y như trường
  chưa khai gì. `moTruongDeXem()` thấy trường rỗng trơn thì lùi về trường cũ
  và nhắc chạy `db/chu-he-thong-xem.sql`.

### Ba việc bảo mật — đã xong *(29/8/2026)*

**Thẻ Content-Security-Policy.** Vé làm mới nằm ở `localStorage` nên một lỗ
XSS là mất phiên đăng nhập của thầy cô; `esc()` phủ mọi chỗ đã soi, thẻ này là
lớp thứ hai. Đã gỡ hết `onclick` viết thẳng trong HTML (còn 0).

⚠️ **`script-src` VẪN mang `'unsafe-inline'` — trái với dự tính ban đầu.** Toàn
bộ mã app nằm inline trong `index.html` (quy ước một-tệp), nên siết bằng hash
thì hash đổi mỗi lần sửa một chữ, mà không có build tool để sinh lại: quên một
lần là **TRẮNG TRANG** với mọi trường đang chạy. Đổi lấy an toàn vận hành; nâng
lên hash được ngay khi mã tách ra tệp riêng ở Pha 2. Giá trị thật của thẻ nằm ở
`connect-src` và `img-src` — mã lạ có chạy được cũng không gửi vé đăng nhập về
máy chủ của ai — cộng `object-src 'none'` và `base-uri 'self'`.

⚠️ **Vi phạm CSP KHÔNG phải lỗi JavaScript** — nó chỉ hiện ở console, nên
`npm run soi` và `npm test` xanh trong khi thư viện Excel bị chặn mất. Nay
`docs/anh-giao-dien/chup.mjs` bắt cả `console`, và có một phép thử riêng chạy
Chrome thật gọi `sanSangExcelJS()` · `sanSangXLSX()` để chắc CDN vẫn nạp được.

⚠️ `connect-src` **đối chiếu với `SUPABASE_URL` trong `src/cauhinh.js`**, không
ghi cứng — cùng khuôn phép thử ba-chỗ-khai-màu-chủ-đề. Ghi cứng thì đổi dự án
Supabase là phép thử vẫn xanh trong khi app mất hẳn đường gọi máy chủ.

⚠️ **`worker-src` PHẢI có `blob:`** *(vá 29/8/2026, ngay trong ngày thêm CSP)*.
`taoWorkerXep()` dựng Worker từ một **Blob URL** — cách duy nhất chạy vùng
LOGIC trong luồng riêng mà vẫn giữ quy ước một tệp. Khai `worker-src 'self'`
trơn thì trình duyệt chặn, nút *Xếp kỹ* **lặng lẽ rơi về luồng chính** và treo
giao diện mấy phút. Không một lỗi nào hiện ra, và `npm test` · `npm run soi` ·
`npm run soi-nhap` · `npm run soi-mau` đều xanh — chúng gọi thẳng hàm thuần.
Chỉ `node test/soi-worker.mjs` bắt được, mà bộ ấy **không nằm trong danh sách
chạy thường**. Bài học: thêm một hàng rào (CSP) thì phải chạy **cả tám** bộ
soi, không chỉ bốn bộ quen tay.

**`db/siet-dang-ky-va-nhat-ky.sql`** *(ĐÃ CHẠY trên máy chủ thật 29/8/2026)* —
hai việc còn lại:

- **Đơn đăng ký rác.** ⚠️ `dang_ky_truong()` **đã** chặn "một tài khoản một
  trường" và "trùng tên trường trong cùng xã" — đừng làm lại. Chỗ hở thật là
  một người mở **nhiều Gmail**. Đếm theo `dien_thoai` (đã bắt buộc, đã chuẩn
  hoá về chữ số): quá **3** đơn `cho_duyet` cùng số thì từ chối, kèm câu nói rõ
  phải liên hệ ai. Chỉ đếm đơn CHỜ DUYỆT nên người dùng thật không chạm trần.
- **`p_nk_ghi` siết thêm `nguoi_dung_id = auth.uid()`.** Nhật ký là thứ đem ra
  đối chiếu khi có tranh cãi *"ai xoá mất dữ liệu"*; một bảng ai cũng viết hộ
  được thì không còn giá trị làm chứng. `ghiNhatKy()` vốn đã gửi đúng id của
  chính người đang đăng nhập nên không phá luồng nào.

⚠️ **Ranh giới ĐỌC / GHI của chế độ xem trường khác** — chỗ dễ sai nhất, có
phép thử canh cả hai chiều: năm đường **đọc** (`luoiDayDuTuMayChu` ·
`taiThemNgayNghi` · `lichSuPhienBan` · `taiPhienBan` · `nhatKy`) đi theo
`truongDangXem()`, còn bốn đường **ghi** (`congBoTKB` · `taoMaMoi` ·
`ghiNhatKy` · `datTaiKhoanGV`) giữ nguyên `KHO.nguoiDung.truongId`. An toàn
kép: kể cả cờ chỉ-xem có lỗi thì cũng không ghi nhầm sang trường khác.

### Siết quyền theo CỘT — `db/siet-quyen.sql` *(28/8/2026)*

RLS của Postgres cấp quyền theo **dòng**, không theo **cột**. Nên một quy
tắc đúng lúc viết tự rộng ra mỗi lần bảng ấy mọc thêm một cột quyết định
quyền — không ai sửa gì mà hàng rào vẫn tụt. `p_nd_sua` cho quản lý ghi
vào `nguoi_dung` của trường mình từ đầu; nay bảng ấy có **ba** cột quyết
định quyền, và cả ba đều nằm trong vùng cho ghi:

| Cột | Ai đọc nó để quyết định | Khai thác được gì |
|---|---|---|
| `la_chu_he_thong` | `la_chu_he_thong()` | đăng ký một trường → tự phong chủ hệ thống → đọc **mọi trường** và họ tên · email người dùng **mọi trường**, duyệt hoặc chặn trường của người khác |
| `vai_tro` | `la_quan_ly()` | PHT tự nâng thành hiệu trưởng |
| `diem_truong_id` | `luu_tkb()` | PHT một phân hiệu đặt về `null` → ghi đè lưới **cả ba** phân hiệu |
| `truong.trang_thai_duyet` · `ma_truong` | `truong_duoc_dung()` | trường chờ duyệt tự đặt `dang_dung`, bỏ qua khâu duyệt |

Hai trigger `before` là chỗ **duy nhất** nói được câu "sửa dòng này thì
được, nhưng đừng đụng cột kia". Chúng **chặn thẳng bằng exception**, không
lặng lẽ bỏ qua — đúng bài học `suaHang()`.

Hai mức nghiêm khác nhau, cố ý: `la_chu_he_thong` **chỉ chủ hệ thống trao
được** cho bất kỳ ai (vai ấy đứng ngoài mọi trường nên không cán bộ nhà
trường nào có tư cách trao); `vai_tro` và `diem_truong_id` thì **không ai
tự sửa của chính mình** — sửa cho người khác vẫn theo quyền cũ, vì đó là
việc quản trị bình thường còn tự nâng cho mình thì không bao giờ là.

⚠️ **Cả hai trigger bỏ qua khi `auth.uid()` là null** — SQL Editor, khoá
`service_role`, lúc khôi phục sao lưu. Nhờ vậy chủ dự án vẫn tự phong mình
làm chủ hệ thống bằng đúng câu `update` cũ, và Edge Function `tai-khoan`
(vốn là đường DUY NHẤT app tạo · sửa · xoá tài khoản) không bị chặn. Bản vá
này chỉ đóng đường PATCH thẳng — đường mà ứng dụng thật chưa bao giờ dùng.

**`npm run soat` nay canh chuyện này thành luật**, không phải bằng danh
sách chép tay: nó suy cột quyết định quyền từ **chính các hàm quyền** (hàm
`language sql stable` đọc hồ sơ người đang đăng nhập), rồi đòi mỗi cột ấy
hoặc có trigger canh — khai `-- CANH-COT: bảng.cột` — hoặc được khai
`-- KHONG-CANH: bảng.cột — <lý do>`. Thêm cột quyền mới mà quên canh là CI
đỏ ngay. Đã thử ngược cả hai chiều: bỏ dòng khai thì đỏ, giữ dòng khai mà
trigger không đụng tới cột cũng đỏ.

⚠️ Đừng nới luật ấy ra cho **mọi** hàm có `auth.uid()`. Bản đầu làm vậy và
vơ luôn hàm nghiệp vụ plpgsql, nhặt ra những "cột" tên là `false`, `null`,
`format` và cả biến cục bộ `v_tt` — tám lỗi giả. Bộ soát kêu oan tám lần
thì lần thứ chín kêu đúng cũng không ai đọc nữa.

### "Phân hiệu" thay cho "điểm trường" *(28/8/2026)*

Chủ dự án: *"em đổi tên phân hiệu thành **Phân hiệu** đúng với quy định của
Sở GD&ĐT"*. Đổi **CHỮ**, không đổi mô hình — tầng "trong phân hiệu có thêm
các điểm trường" để làm sau, và nó đụng ràng buộc lõi nên phải bàn riêng.

**Tên biến · tên hàm · tên bảng · tên cột GIỮ NGUYÊN** (`diemTruong`, `dtId`,
`lopDT`, `diem_truong`, `diem_truong_id`). Đúng bài học đổi bảng màu ngày
24/8: tên nói **vai trò**, đổi tên là sửa hàng trăm chỗ mà chẳng được thêm
gì. Chúng viết tiếng Việt không dấu nên phép thay 300 chỗ không chạm tới.

Ba chỗ phải vá tay vì chúng ĐỌC dữ liệu cũ:

- **`tenDiemNgan()` và `tienToDT()` nhận CẢ HAI tiền tố.** Trường đang chạy
  có sẵn tên *"Điểm trường Diễn Liên"* trên máy chủ; chỉ nhận tiền tố mới là
  cắt hụt, dải nút lại dài ngắn lệch nhau đúng như lỗi đã vá ngày 2/8.
- **`chuanTenCot()` đổi tên cột Excel cũ về mới ngay đầu đường đọc** —
  `Diem_truong` → `Phan_hieu`, `Ten_diem_truong` → `Ten_phan_hieu`. Trường
  nào đã tải mẫu về điền dở không được bỗng mất công. Một chỗ duy nhất biết
  chuyện này, không rải `r.A || r.B` khắp nơi rồi sót một chỗ.
- **Tên trang tính** `DIEM_TRUONG` → `PHAN_HIEU`, đọc lùi qua `trangCu`.

⚠️ Vài phép thử ở `npm test` **cố ý giữ tên cột cũ** — chúng chính là phép
thử cho đường lui ấy. Đừng "dọn" cho nhất quán.

### Gmail của giáo viên — vào trường KHÔNG cần mã mời *(28/8/2026 — `db/gmail-giao-vien.sql`, ĐÃ CHẠY trên máy chủ thật cùng ngày)*

Đề xuất của chủ dự án: *"tại nút Giáo viên cần có thêm cột gmail để khỏi phải
mời nữa"*. Phát quyền cho 35 thầy cô trước đây là **bốn bước mỗi người** —
tạo mã 6 chữ cái → gửi Zalo → thầy cô đăng nhập Google → gõ mã — và mã thì
hết hạn. Nay nhà trường khai sẵn Gmail ngay trong bảng Giáo viên; thầy cô bấm
*Đăng nhập bằng Google* bằng đúng địa chỉ ấy là vào thẳng lịch của mình.

⚠️ **VÌ SAO PHẢI LÀ RPC, KHÔNG PHẢI TẠO SẴN `nguoi_dung`.** `nguoi_dung.id`
**chính là** `auth.uid()` do GoTrue cấp lúc đăng nhập lần đầu. Một Gmail chưa
từng đăng nhập thì chưa có uid nào, nên không thể tạo sẵn dòng cho nó. Cách
duy nhất là để người ấy đăng nhập trước (lúc đó có uid), rồi một hàm
`security definer` đối chiếu địa chỉ trong **vé đăng nhập** với danh sách nhà
trường đã khai.

| Hàm | Việc |
|---|---|
| `giao_vien.email` · `ghi_chu` | hai cột mới; `email` là địa chỉ nhà trường khai TRƯỚC |
| `vao_bang_gmail()` | SQL — tự nhận mình bằng Gmail, `security definer`, tự kiểm quyền |
| `vaoBangGmail()` | app — gọi RPC ấy, có đường lui khi máy chủ chưa nâng cấp |
| `dayGiCua(idGV)` | vùng LOGIC — gom phân công thành `1A, 1B, 1C +22 · Mỹ thuật` |

Sáu điều bắt buộc, cả sáu đều có phép thử (`npm test` mục 22h, `npm run soi`
mục 17h · 17i):

- **Địa chỉ lấy từ VÉ ĐĂNG NHẬP (`auth.jwt()`), hàm KHÔNG nhận tham số.**
  Nhận tham số là ai cũng tự khai mình là người khác.
- **Chỉ nhận hồ sơ CHƯA nối tài khoản nào** (`nguoi_dung_id is null`), và
  trường phải đang `dang_dung`. Không cướp được quyền của ai, và người của
  một trường chờ duyệt không lọt vào trước cả hiệu trưởng của họ.
- **Một Gmail chỉ trỏ về MỘT hồ sơ trong một trường** — chỉ số unique
  *partial* trên `(truong_id, lower(email))`. Hai hồ sơ cùng địa chỉ thì lúc
  đăng nhập máy không biết mở lịch của ai; đúng bài học sự cố 2/8/2026.
- **Ô Gmail để TRỐNG thì GIỮ NGUYÊN địa chỉ cũ, không xoá.** Bỏ trống một ô
  là *"tôi không khai"*, không phải *"hãy thu quyền của thầy cô này"* — mà
  xoá email ở đây chính là thu quyền đăng nhập.
- **Hai lối vào soát GIỐNG HỆT nhau** — gõ tay trong bảng và nhập từ Excel
  dùng cùng hai phép soát (đúng dạng thư · không trùng người). Một lối lỏng
  hơn lối kia là hàng rào coi như không có. Gõ sai thì **trả ô về giá trị
  cũ**, đừng chỉ báo rồi để chữ hỏng nằm lại — người dùng tưởng đã lưu.
- **Luôn có đường lui.** Máy chủ chưa chạy `db/gmail-giao-vien.sql` thì
  `vao_bang_gmail()` trả 404 (im lặng lùi về đường mã mời), và `ghiDuLieuNguon()`
  bắt lỗi *"Could not find the 'email' column"* rồi ghi lại **không kèm hai
  cột** — không thì mất luôn cả lần lưu, kể cả họ tên và định mức.

**Bảng Giáo viên nay đủ thông tin chủ dự án nêu**: TT · Họ và tên (kèm mã) ·
Gmail · Chủ nhiệm · **Dạy** · Phân hiệu · Tiết / định mức · Buổi cần · Tình
trạng · Ghi chú.

⚠️ **Cột *Dạy* CHỈ ĐỌC.** Chủ dự án đề xuất một cột `1A (Toán, Tiếng Việt,
TNXH…)` và chốt để **máy tự sinh** từ bảng phân công. Không ai gõ vào được
nên nó không bao giờ lệch với phân công thật; bấm vào là sang màn *Phân công*
đã lọc sẵn người ấy. Hai nơi cùng sửa một thứ thì sớm muộn lệch hành vi —
đúng luật đã đặt cho lưới ở Bảng điều hành.

⚠️ Cột ấy **gom các lớp cùng bộ môn**: cô Mỹ thuật dạy 25 lớp mà kể ra 25
dòng thì cột này dài hơn cả bảng.

⚠️ **Nhãn *Bình thường* đã bỏ.** Dán lên 32/35 dòng là ba mươi hai lần nói
*không có gì xảy ra* — đúng thứ làm mắt bỏ qua cả ba dòng cần nhìn. Cùng luật
"số 0 không tô đỏ" của dải chỉ số Bảng điều hành.

### Hồ sơ giáo viên đủ ô, và phân công NHIỀU MÔN một lần *(28/8/2026)*

Ba việc chủ dự án nêu cùng lúc, cả ba đều có phép thử (`npm run soi` mục 8 · 17h):

- **Hộp Thêm giáo viên thiếu ô.** Chỉ hỏi họ tên · định mức · chủ nhiệm, nên
  khai xong vẫn phải mở bảng sửa tiếp. Nay đủ bảy ô, thêm **Gmail · Điện
  thoại · Phân hiệu · Ghi chú**. `oKhaiGV()` và `docKhaiGV()` dùng chung cho
  **cả Thêm lẫn Sửa** — viết hai bản thì sớm muộn một bên thiếu ô, đúng
  chuyện vừa xảy ra. Hai cột mới ở `db/them-cot-giao-vien.sql`
  *(ĐÃ CHẠY trên máy chủ thật 29/8/2026)*.

  ⚠️ Chạy tệp ấy xong phải **tải lại trang**. `KHO.coCotGV` là cờ nhớ trong
  phiên: lần ghi đầu mà máy chủ báo thiếu cột thì nó giữ `false` tới hết
  phiên và lặng lẽ ghi không kèm hai cột — đường lui để không mất cả lần
  lưu, nhưng cũng nghĩa là khai xong vẫn không lên được mà app vẫn báo
  "đã lưu".
- **Dấu `×` đỏ trần → cụm nút Sửa / Xoá.** Dấu × là lối DUY NHẤT nên muốn đổi
  một chữ cũng phải sửa ngay trên bảng, mà bảng không chứa nổi bảy ô. ⚠️ Nút
  Xoá **không tô đỏ sẵn**, chỉ đỏ khi rê chuột — hai nút cạnh nhau mà một cái
  đỏ rực thì mắt bị kéo về đúng cái nguy hiểm hơn.
- ⚠️ **Phân công: một lớp, NHIỀU môn.** *"chỉ có 1 lựa chọn dạy môn Tiếng
  việt hoặc môn học khác (phải có đủ môn để tích vào)"*. Ô xổ xuống cũ chọn
  đúng một môn, mà chủ nhiệm tiểu học dạy năm sáu môn của chính lớp mình —
  khai một lớp là mở hộp năm lần, 25 lớp là 125 lần. Nay tích bao nhiêu môn
  cũng được, mỗi môn một dòng, số tiết lấy sẵn chuẩn CT GDPT 2018 theo khối.

⚠️ **Môn ngoài chương trình của khối thì KHOÁ ô tích** *(29/8/2026)*. Chủ dự
án: *"sửa riêng cho nút chưa khai thì nút không thể tích được, chứ lỡ giáo
viên tích nhầm cũng không nên"*. Trước đó tích TNXH cho lớp 5 vẫn được và app
lặng lẽ ghi 1 tiết — sai chương trình mà không ai thấy. Bốn điều của bộ này:

- **Đổi lớp là đổi KHỐI**, nên `goi()` phải **bỏ tích** môn vừa thành ngoài
  chương trình; để nguyên thì ô khoá mà vẫn tích, và nút Thêm vẫn nhận nó.
- **Hàng rào thật nằm ở nút Thêm**, không ở thuộc tính `disabled` — nút lọc
  lại `chuanMon(m,k)>0` ngay trước khi ghi. Cùng khuôn "kiểm xung đột chạy
  hai lần" của dạy thay.
- **Vẫn còn hai đường cho môn tự chọn**: khai số tiết cho khối ấy ở mục *Môn
  học*, hoặc dùng *Phân công nhanh* (ô số tiết tự ghi). Khoá mà bịt hết đường
  thì thành chặn nhu cầu thật — câu gợi ý cuối hộp chỉ rõ cả hai lối.
- **Hai tín hiệu cho ô khoá**: mờ đi và đổi con trỏ. Chỉ mờ thôi thì vẫn có
  người bấm rồi tưởng máy hỏng.

⚠️ Phép thử cũ *"Một lần bấm ra ĐỦ ba dòng"* ghi cứng `TNXH` cho một lớp
**khối 5** — tức nó đang dựa vào chính hành vi vừa bỏ. Nay chọn môn có chuẩn ở
đúng khối của lớp. Và bản đầu của phép thử mới lấy "môn đầu tiên không bị
khoá" nên trúng một môn hợp lệ ở cả hai khối — **xanh mà không kiểm được gì**,
đúng bẫy đã ghi ở mục 3; nay tìm đúng môn lệch khối (TNXH) và báo rõ khi không
tìm ra.

### Bảng phân công dạng MA TRẬN *(29/8/2026)*

Chủ dự án gửi ảnh tờ phân công trường vẫn kẻ tay: **hàng là giáo viên, cột là
môn**. Bảng từng dòng của app đúng về dữ liệu nhưng sai về **hình dạng công
việc** — cô Mỹ thuật dạy 25 lớp thành 25 dòng giống hệt nhau, trong khi câu hỏi
thật của người xếp là *"ai dạy môn gì"* và *"còn ô nào trống"*.

**Ma trận là bảng DUY NHẤT** — bảng từng dòng và hai thẻ chuyển đã **bỏ hẳn**
cùng ngày, chủ dự án chốt: *"bỏ phân công theo dòng"*. Giữ cả hai thì thành hai
nơi làm cùng một việc, mà ma trận cộng hộp *Phân công nhanh* phủ hết:

| Việc của bảng cũ | Nay làm ở đâu |
|---|---|
| thêm một dòng | bấm ô trống → hộp, tích lớp |
| xoá một dòng | bấm ô → **bỏ tích** lớp ấy |
| sửa số tiết | ô *Số tiết mỗi lớp* trong hộp; mặc định lấy chuẩn theo từng khối |
| lọc theo người | ô tìm kiếm, lọc tại chỗ |

⚠️ **Điểm hụt duy nhất, nói trước để đừng ai đi tìm:** không còn cách xem *"lớp
1A có những ai dạy môn gì"*. Câu ấy hiện trả lời gián tiếp qua cột lệch tiết ở
bảng *Lớp học* và quy tắc R04. Cần xem trực tiếp thì làm sau, đừng dựng lại
bảng cũ.

⚠️ Bỏ bảng cũ kéo theo mất ô chọn `#fGV` — lối *"bấm cột Dạy ở bảng Giáo viên
để xem người ấy dạy gì"* phải chuyển sang **lọc bằng chính ô tìm kiếm** (điền
họ tên rồi `locBang`). Phép thử bắt được ngay; không có nó thì bấm cột Dạy sang
một bảng 35 hàng không lọc gì cả.

| Hàm | Việc |
|---|---|
| `bangMaTran()` | dựng bảng; hàng = giáo viên, cột = môn |
| `oMaTran(g, mon)` | nội dung một ô: tên lớp (≤2) hoặc `n lớp`, kèm tổng tiết |
| `hopPCTheoGV(gvSan, monSan)` | hộp cũ, nay nhận sẵn người và môn |

Năm điều bắt buộc, cả năm đều có phép thử (`npm run soi` mục 17p):

- **Ba cột trái DÍNH** (`.mt-dinh`). Cuộn sang môn thứ mười mà không còn biết
  đang ở hàng của ai thì bảng vô dụng — đúng bài học lưới rộng ngày 2/8.
- **Ô gom lớp**: cô Mỹ thuật hiện `25 lớp · 25t`, không kể ra 25 tên lớp. Cùng
  luật đã đặt cho cột *Dạy* của bảng Giáo viên.
- **Bấm ô mở đúng hộp Phân công nhanh**, điền sẵn người và môn, và **tích sẵn
  những lớp đang dạy** — người dùng thấy hiện trạng rồi sửa, không phải nhớ lại
  mình đã phân công những đâu. Một hộp dùng chung, không viết bản thứ hai.
- **Hàng cuối đếm độ phủ từng môn** (`41/42` lớp): chỗ duy nhất nhìn ra môn nào
  còn lớp chưa có người dạy.
- ⚠️ **Lớp chủ nhiệm ở CỘT RIÊNG**, không xếp dưới họ tên *(29/8/2026)*. Bản
  đầu để nó thành dòng phụ, nên hàng có chủ nhiệm cao gấp rưỡi hàng không có —
  cả bảng gợn sóng, đọc theo hàng ngang rất mệt và một màn hình chỉ chứa 10
  người thay vì 13. Thứ tự cột lấy đúng tờ phân công nhà trường vẫn kẻ:
  **TT · Họ tên · Tổng số tiết · Chủ nhiệm · các môn**. Cột *Tiết* cũng phải
  `nowrap`, không thì `/23` rơi xuống dòng và hỏng lại đúng như thế.
- ⚠️ **Mỗi ô môn có đường kẻ dọc** (`.mt-o{border-left}`). Bảng chỉ kẻ ngang
  thì 15 cột trông như một mảng trắng, không ai đoán được ô nào bấm được.
- **Thanh công cụ chỉ còn MỘT nút** — *Phân công nhanh cho một giáo viên*.
- ⚠️ **Nút "Lưu ngay" thôi màu ĐỎ** *(29/8/2026)*. Trong cả app đỏ nghĩa là
  nguy hiểm hoặc hỏng (nút Xoá, cảnh báo mức `do`), mà Lưu là việc **tốt** đang
  cần làm gấp — dùng đỏ ở đây là sai màu ngữ nghĩa. Nay là **cam**, giữ được sự
  khẩn trương mà không doạ người dùng.

⚠️ **Thứ tự hàng: CHỦ NHIỆM TRƯỚC, theo đúng 1A → lớp cuối**, rồi mới tới giáo
viên bộ môn xếp theo họ tên (`thuTuHangGV()`). Xếp A–Z thì cô chủ nhiệm 1A nằm
giữa bảng, không ai dò được lớp nào đã đủ người — mà đó chính là thứ tự người
xếp rà soát, và cũng là thứ tự tờ phân công nhà trường vẫn kẻ.

### ⚠️ `kt()` TỰ RẢI mảng — bài học đắt nhất ngày 29/8/2026

Nhiều phép thử trả `[đúng/sai, ghi chú]`, và quy ước cũ là **nơi gọi** phải
thêm toán tử `...`. Quên dấu ấy thì đối số thứ hai là một MẢNG — mảng nào cũng
truthy, nên phép thử **xanh vĩnh viễn dù sản phẩm hỏng**.

Phát hiện ra vì thử ngược một đoạn vá mà phép thử vẫn xanh. Rà lại thì **17
phép thử** đang ở tình trạng ấy, phần lớn viết trong chính ngày hôm đó — nghĩa
là gần như mọi tính năng làm hôm ấy chỉ được canh bởi phép thử vô giá trị.

Cách chữa **không phải** đi sửa 17 chỗ gọi, mà là để chính `kt()` tự rải:

```js
if (Array.isArray(dk)) [dk, ghi] = [dk[0], dk[1] ?? ghi];
```

Đã gắn vào cả **bảy** bộ soi. Một quy ước mà người viết phải nhớ thì sớm muộn
có người quên — mà quên ở đây thì không ai thấy, vì hậu quả là màu xanh.

⚠️ Lần vá đầu chọn cách "báo lỗi khi thấy mảng" rồi đi thêm `...` bằng script:
script bọc nhầm cả những IIFE trả **boolean** (`return ['a','b'].every(…)`),
làm cả bộ soi đổ. Bỏ luôn cách ấy — sửa ở một chỗ vẫn hơn sửa ở mười bảy chỗ.

⚠️ `locBang()` nhận **chính ô nhập** và đọc `data-loc` của nó, không nhận id
bảng. Gọi `locBang('bMT')` là lỗi `Cannot read properties of undefined`.

`hopThemPC()` và `hopPCTheoGV()` **bù nhau, cố ý không gộp**:

| Hộp | Một giáo viên · … |
|---|---|
| Thêm phân công | **một lớp** · nhiều môn — dành cho chủ nhiệm |
| Phân công nhanh | một môn · **nhiều lớp** — dành cho bộ môn |

### Bảng Môn học: chỉ nút XOÁ, và hiện đủ 13 môn *(29/8/2026)*

Chủ dự án: *"nút dấu x (màu đỏ) cần thay bằng nút sửa/xoá. Và cả trang này vẫn
bị lấp các môn còn lại, cho hàng sát lên, cho đủ 13 + môn"*.

- **Dấu `×` đỏ trần → nút Xoá có chữ**, nút **không tô đỏ sẵn**, chỉ đỏ khi
  rê chuột.
- ⚠️ **KHÔNG có nút Sửa** — chủ dự án chốt: *"nút sửa thì có lẽ không cần, vì
  có thể sửa trực tiếp và lưu lại tổng thể được"*. Đúng: mọi ô trên hàng đều
  sửa tại chỗ, và `[data-monten]` đã đồng bộ tên môn sang phân công. Hộp
  `hopSuaMon()` viết ra rồi **xoá hẳn** — hai lối vào cùng một thứ là thừa.
  Nhưng nút **Xoá thì phải giữ**: môn nhà trường tự thêm (*HD Tự học*, *Kĩ
  năng CDS*) có ngày được thay bằng môn khác.
- **`oKhaiMon()` · `docKhaiMon()` vẫn giữ** cho hộp Thêm — nó từng thiếu đúng
  hai ô *Ưu tiên sáng sớm* và *Tránh đầu cuối buổi* mà bảng vẫn có.
- ⚠️ **Đổi TÊN môn thì phải đổi theo ở `phanCong` và `S.tkb`** — hai nơi ấy
  tham chiếu môn bằng chính chuỗi tên. Bỏ bước này là dòng phân công thành môn
  lạ và ô trên lưới mất màu. Có phép thử canh.

⚠️ **Khung cuộn `max-height:66vh` đã BỎ.** Nó chỉ chứa 10 hàng, mà danh mục
chuẩn đã 13 môn — nghĩa là **mọi** trường đều mất bốn môn cuối, không riêng ai.
Bảng nay cao tự nhiên, trang cuộn như mọi trang; `.bang` vẫn giữ `overflow`
cho cuộn NGANG 13 cột.

⚠️ **Thứ thật sự làm hàng cao gấp đôi là `white-space` chứ không phải padding.**
Cột đầu hẹp lại thì ô nhập tên rơi xuống **dưới** chấm màu, hàng thành 59px.
Thêm `nowrap` cho ô ấy và lớp `.dl.gon` (padding 5px) đưa hàng về 41px — 13 môn
vừa một màn hình. Bảng 13 cột thì cột nào cũng bị ép, nên chỗ nào không được
xuống dòng phải nói rõ.

⚠️ **Bảng Giáo viên trần ở MƯỜI cột.** Thêm cụm Sửa/Xoá làm nó tràn khỏi màn
hình 1500px, người dùng phải cuộn ngang mới bấm được. Hai cột bị gộp vào chỗ
chúng vốn thuộc về — phân hiệu xuống dưới cột *Dạy* (nó chính là nơi những
lớp ấy nằm), số buổi cần xuống dưới *Tình trạng*. Không mất thông tin nào.
Có phép thử đếm số cột.

⚠️ `giao_vien.diem_truong_id` là **nhãn**, không phải thứ thuật toán đọc.
Ràng buộc lõi *"một giáo viên, một buổi, một phân hiệu"* vẫn suy từ phân công
→ lớp → phân hiệu của lớp, tức là từ nơi thầy cô THẬT SỰ có tiết. Nhét cột
này vào thuật toán là tạo hai nguồn sự thật cho cùng một câu hỏi.

### Phân quyền trên giao diện — đã dựng

Vùng `/*#region QUYEN*/`, ngay sau vùng DULIEU. Hàng rào thật là RLS trong
`db/schema.sql`; vùng này chỉ lo phần giao diện.

**Hai loại phó hiệu trưởng phân biệt bằng `nguoi_dung.diem_truong_id`** —
bỏ trống là phụ trách chuyên môn toàn trường, có giá trị là phụ trách riêng
phân hiệu đó. Đây là điểm dễ hiểu sai nhất khi sửa vùng này.

| | toàn trường | PHT một phân hiệu | giáo viên |
|---|---|---|---|
| Đổi phạm vi xem | có | **khoá cứng vào điểm của mình** | — |
| Xếp tự động, xoá kết quả | có | **không** | không |
| Sửa phân hiệu · phân công · khung giờ | có | **không** | không |
| Kéo thả chỉnh tiết | mọi lớp | **chỉ lớp trong điểm của mình** | không |
| Lưu lên máy chủ | có | có | không |

Lý do PHT một phân hiệu **không** được xếp tự động: mỗi lần xếp là dựng lại
lưới của cả trường, sẽ đè lên phần của các phân hiệu khác. Họ chỉnh tay
phần mình rồi lưu.

#### Ba phó hiệu trưởng cùng lưu — GỘP theo phạm vi *(23/8/2026)*

Câu cũ ở đây là *"khóa lạc quan lo phần đụng độ"*. **Sai**, và sai theo hướng
mất dữ liệu: khoá lạc quan chỉ biết **từ chối** người đến sau, nó không biết
**gộp**. Ba phân hiệu là ba PHT cùng sửa một buổi tối — không phải trường
hợp hiếm mà là mặc định sau sáp nhập — nên trong ba người thì hai người phải
tải lại, và tải lại là mất sạch việc vừa làm.

Tệ hơn, hai lỗi làm thủng hẳn cái khoá ấy. Cả hai đã tái hiện được bằng phép
thử trước khi vá (`npm test` mục 20):

- **Bị từ chối xong bấm Lưu lần nữa là LỌT.** `luuTKB()` nhận `version_moi`
  **vô điều kiện**, mà máy chủ trả kèm số phiên bản hiện hành trong chính lời
  từ chối — nên lời từ chối tự nâng máy mình lên đúng số ấy. Lần bấm thứ hai
  khớp version và ghi đè phần đồng nghiệp. Người dùng không làm gì sai: họ chỉ
  bấm lại cái nút vừa báo lỗi.
- **Cửa sổ gộp 10 phút làm khoá lạc quan mất tác dụng.** Phép gộp thay **ruột**
  của dòng mà **không đổi số phiên bản**, nên số phiên bản thôi không còn là
  dấu vân tay của nội dung. Người làm **đúng** quy trình — tải lại rồi mới sửa
  — vẫn xoá mất việc của đồng nghiệp, và máy chủ vẫn báo *"Đã lưu"*. Tính năng
  tiết kiệm chỗ chứa ngày 18/8 vô tình mở ra lỗ này.

Cách chữa: `luu_tkb()` nhận thêm `p_pham_vi` — danh sách mã lớp người gọi được
ghi đè. Có phạm vi thì máy chủ lấy **bản mới nhất** làm nền rồi chỉ thay đúng
những lớp ấy, thay vì nuốt nguyên khối của máy gửi lên. Ba PHT xếp ba tập lớp
**rời nhau** nên không bao giờ đụng nhau: không ai phải tải lại, không ai mất
việc. Blob vốn đã có dạng `{mã lớp: {ô: tiết}}` nên gộp theo khoá lớp là việc
tự nhiên của `jsonb` — không phải đổi cách lưu.

| Hàm | Việc |
|---|---|
| `phamViLuu()` | lớp người này được ghi đè; `null` = toàn trường, lưu nguyên khối |
| `diem_truong_cua_toi()` | SQL — phân hiệu tài khoản đang phụ trách |
| `hopXungDotLuu(kq)` | hai đường ra khi bị từ chối, không có đường thứ ba |

Năm điều bắt buộc, cả năm đều có phép thử:

- **Chỉ nhận `version_moi` khi máy chủ ĐỒNG Ý ghi.** Đây là lỗi thứ nhất ở trên.
- **Gộp thì VẪN tăng số phiên bản.** Không đẻ dòng mới nên chỗ chứa vẫn tiết
  kiệm y như trước; chỉ con số là phải nhích. Kéo theo: `don_du_lieu_cu()` phải
  cắt theo **thứ hạng** (`order by version desc limit 10`) chứ không theo
  `max(version) - 10` — số phiên bản nay nhảy nhanh hơn số dòng, cắt theo hiệu
  số là xoá quá tay.
- **Phạm vi suy từ TÀI KHOẢN, không tin tham số gửi lên.** `luu_tkb()` đọc
  `nguoi_dung.diem_truong_id` rồi ép phạm vi về đúng lớp của điểm ấy. Nhờ vậy
  ranh giới PHT-một-điểm-trường — vốn ghi rõ trong `db/schema.sql` là *chỉ có ở
  giao diện* — nay là hàng rào thật ở đường lưu. `phamViLuu()` bên ứng dụng chỉ
  là gợi ý; đừng biến nó thành hàng rào an ninh.
- **Xếp tự động vẫn đi đường nguyên khối** (`p_pham_vi = null`) và vẫn giữ khoá
  lạc quan chặt: một lần xếp dựng lại lưới cả trường, gộp mù là hỏng.
- **Luôn có đường lui.** Máy chủ chưa chạy `db/luu-pham-vi.sql` thì hàm còn 4
  tham số, PostgREST trả 404 — `luuTKB()` bắt đúng mã ấy rồi gọi lại không kèm
  `p_pham_vi`. Nâng cấp phần mềm không được làm một trường đang chạy tốt mất
  hẳn nút Lưu.

⚠️ Bẫy đã lộ ra khi làm việc này: khẳng định *"số phiên bản vẫn tăng"* ban đầu
soi `kq.version` — con số **máy chủ trả về** — mà con số ấy tăng dù có gộp hay
không. Phép thử xanh mà không kiểm được gì. Phải soi thẳng **dòng** trên máy
chủ. Đúng khuôn cái bẫy đã ghi ở mục 3 (phép thử so hai thứ *tình cờ bằng nhau*).

Hai hàm phải nhớ gọi:
- `apDungQuyen()` — gọi ở đầu `ve()`, ép `S.phamVi` về đúng quyền.
- `duocSuaLop(id)` — chốt chặn cuối trong `kiemTraChuyen()`.

Phân hiệu phụ trách bị xoá thì `quyen()` **mở khoá** thay vì kẹt người dùng
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
BƯỚC 1        1 Thông tin trường  2 Phân hiệu  3 Khối và khung giờ
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
DỮ LIỆU NHÀ TRƯỜNG      Thông tin trường · Phân hiệu · Khối và khung giờ
                        · Lớp học · Giáo viên · Môn học · Phân công chuyên môn
                        · Phòng học · Buổi bận
QUẢN LÝ VÀ KẾT QUẢ      Kiểm tra khả thi · Các phương án đã lưu
                        · Phiên bản và công bố · Xuất và in · Ngày công
                        · Nhật ký
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

**Nhãn nhóm NỔI KHỐI — tấm nền + vạch vàng** *(chốt 23/8/2026 sau bốn lần
đổi)*. Chép lại cả đường đi để đừng ai quay vòng thêm lần nữa:

| Bản | Cách làm | Vì sao đổi |
|---|---|---|
| đầu | 10px màu `--nav-mo` nhạt | *"các mục lớn thì bị nuốt"* — thứ bậc lộn ngược |
| 3/8 | nhãn thành **tấm khối** có nền + vạch vàng, mục con bỏ nền | đạt, giữ suốt hai tuần |
| 23/8 sáng | nhãn **vàng kem** phẳng, theo ảnh mẫu | năm nhóm cùng đóng thì thanh bên chỉ còn năm dòng chữ mảnh trên một mảng xanh trống |
| 23/8 chốt | **quay lại tấm khối**, chủ dự án yêu cầu thẳng | |

⚠️ Điều quyết định là **TRẠNG THÁI ĐÓNG**. Bày mở sẵn thì nhãn phẳng trông
nhẹ nhõm — đó là dáng trong ảnh mẫu, và ảnh mẫu chụp đúng lúc nhóm đang mở
nên không lộ ra điều này. Nhưng năm nhóm cùng đóng mới là trạng thái thường
gặp, và lúc ấy nhãn nhóm là **toàn bộ** nội dung thanh bên: khối nền cho
chúng hình hài, chữ trơn thì không. Đánh giá một thành phần menu thì phải
xem nó ở **cả hai trạng thái**, đừng chỉ xem ở trạng thái ảnh mẫu chụp.

Phép thử canh **thứ bậc**, không canh con số: nhãn có nền khối + chữ trắng
`800`, mục con `500` và không nền.

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

**Logo** nhúng base64 ngay trong trang (`.hieu-bt img`) và làm luôn favicon.
Ảnh gốc 1254px/1,3 MB thu về **96px/16 KB** trước khi mã hoá — nhét nguyên ảnh
gốc là tệp HTML phình thêm 1,8 MB cho một hình 52px. **Nhúng đúng MỘT lần**
*(24/8/2026)*: thẻ `<link rel="icon">` không mang `href` tĩnh, một dòng đầu
script gán nó từ chính `.hieu-bt img`. Bản 64px nhúng riêng trước đó là 11 KB
base64 — thứ gzip không nén được — cho cùng một hình.

**Chỉ còn MỘT logo, ở đầu thanh bên** *(16/8/2026)*. Bản trước bày thêm một
cái nữa ở thanh đầu trang (`.thanh-bt`), tức là cùng một hình, hai lần, cách
nhau vài chục pixel trên cùng một màn hình. Nay thanh đầu trang mở đầu thẳng
bằng tên trường. Có phép thử canh không cho nó quay lại.

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

#### Lưới trên MÀN HÌNH bày từng phân hiệu, bản gộp để IN *(2/8/2026)*

Ba phân hiệu gộp một bảng là **60 cột** — chủ dự án nhận xét *"quá dày và
rối"*, và đúng: người phụ trách một phân hiệu chỉ quan tâm điểm của mình.
Nay `lopChoLuoi()` lọc theo `S.dtLuoi`, `daiDiemLuoi()` dựng dải nút chuyển
(chỉ hiện khi có nhiều hơn một phân hiệu, kèm số lớp mỗi nơi). Bảng điều
hành và màn *Toàn trường* đều dùng nó.

Bản **gộp cả trường vẫn còn nguyên** nhưng chỉ ở đường **Xuất và in** — nơi
nó đúng vai: tờ A3 dán bảng tin. Có phép thử canh việc này (`luoiToanTruong`
phải luôn đủ cột cho mọi lớp, không bị dải nút cắt bớt).

#### Không bao giờ để mất việc chưa lưu *(2/8/2026)*

Chủ dự án khai xong lớp cho hai phân hiệu mới, chưa bấm Lưu, trang tải lại
— **mất sạch**. Dữ liệu nguồn nằm trong bộ nhớ trình duyệt cho tới khi ghi
lên máy chủ, mà trang thì tải lại vì đủ thứ lý do.

Cách làm: **không gắn cờ ở từng chỗ sửa** (hàng chục chỗ, sót một chỗ là hỏng
cả cơ chế). Thay vào đó lấy **vân tay** dữ liệu nguồn — `vanTayNguon()` gộp
lớp · giáo viên · phân công · phân hiệu · môn · phòng · buổi bận thành một
chuỗi. `chotVanTay()` chụp lúc tải xong và lúc ghi xong; `coThayDoiChuaLuu()`
so lại. Khác nhau nghĩa là có sửa chưa lưu, bất kể sửa ở đâu. Hai lối báo:
dải đỏ *"● Có thay đổi chưa lưu"* cạnh nút Lưu (nút đổi sang đỏ, chữ
*"Lưu ngay"*), và `beforeunload` chặn khi rời trang.

#### Mã lớp phải là mã NGƯỜI đọc được *(2/8/2026)*

Cơ sở dữ liệu dựng trước khi có cột `ma_lop` để trống ô đó, nên bảng Lớp học
bày ra mã UUID 36 ký tự của máy chủ — mà mã lớp chính là thứ người dùng phải
gõ vào tệp Excel. Nút **Đặt lại mã lớp** (chỉ hiện khi có mã xấu).

Dạng mã do chủ dự án chốt: **`<tên lớp>_<viết tắt phân hiệu>`** — `1A_DL`,
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
| `maGVMoi(hoTen)` | mã cho hồ sơ VỪA KHAI — mọi đường tạo giáo viên mới đi qua đây |

⚠️ **Mã phải đúng NGAY LÚC KHAI, không phải chữa sau** *(29/8/2026)*. Chủ dự
án hỏi đúng chỗ: *"tại sao lại đổi như thế này mà không quy định mã GV mới
ngay từ đầu?"*. Hai đường tạo hồ sơ mới — hộp *Thêm giáo viên* và
`taoDuLieuThu()` — vẫn sinh mã slug `gv_cao_thi_minh_khue` rồi trông chờ nút
*Đặt lại mã giáo viên* dọn hộ, nên **trường mới tinh cũng gặp hộp thoại dọn
dẹp ấy** dù chẳng có dữ liệu cũ nào. Nay cả hai gọi `maGVMoi()`. Nút Đặt lại
giữ nguyên nhưng lui về đúng vai: chữa **dữ liệu cũ** (UUID máy chủ để lại
sau sự cố upsert 2/8, mã slug các bản trước sinh, mã trường tự gõ vào Excel).
Có phép thử canh cả hai đường (`npm test` mục 19 · `npm run soi` mục 8).

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
2. THỜI KHÓA BIỂU   bốn thẻ chuyển + nút Xuất và in cùng hàng, rồi lưới (72vh)
3. ba cột dưới      [tiến độ + chỉ số dọc + việc cần xử lý] · cảnh báo · phân hiệu
```

**Mọi con số dồn vào MỘT cột dọc trong thẻ Tiến độ xếp** *(3/8/2026)*. Trước
đó chúng nằm ở ba chỗ và **lặp nhau**: dải `.dai-so` ngang, dãy `.viec-so`
trong khối Việc cần xử lý, và `.the-so` cũ. Nay chỉ còn `.cot-so` — bảy dòng
xếp **theo thứ tự ưu tiên thật**: việc gấp trong ngày → cảnh báo → tiến độ →
quy mô trường. Nó nằm trong khoảng trống sẵn có dưới vòng tròn tiến độ nên
**không tốn thêm một dòng nào** của trang.

⚠️ **Số 0 không được tô đỏ.** Ba dòng đầu chỉ lên màu khi khác 0 — báo động
giả còn tệ hơn không báo. Có phép thử canh.

⚠️ **Bẫy đã dính: `hidden` bị `display:grid` đè.** Khi dồn các dải chỉ số về
một chỗ, khối `.the-so` cũ được vô hiệu bằng thuộc tính `hidden` cho nhanh —
nhưng quy tắc tác giả `.the-so{display:grid}` thắng `[hidden]{display:none}`
của trình duyệt, nên nó **vẫn hiện**, và Bảng điều hành bày hai dải số giống
hệt nhau. Chủ dự án phát hiện qua ảnh chụp, không phải phép thử. Bỏ một khối
thì **xoá hẳn mã**, đừng dùng `hidden`.

**Nút Xuất và in cùng màu với bốn thẻ chuyển**, phân biệt bằng **biểu tượng
máy in** chứ không bằng màu — màu vàng cũ hét to hơn cả bốn thẻ chính.

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
Thẻ chuyển và nút phân hiệu trước đây nền trắng viền mảnh — chủ dự án:
*"nhìn màu trắng không rõ"*. Nay chưa chọn là `--nav-nhat` nổi khối, đang
chọn là `--nav` đậm hơn. Hai tín hiệu (màu đậm nhạt + đổ bóng), không chỉ một.

**Thanh bên: nhãn nhóm nổi khối, mục con giảm nhẹ** *(sửa lần hai 3/8/2026)*.
Lần đầu mới làm chữ nhãn nhóm đậm và sáng hơn, nhưng **mục con vẫn là những
tấm thẻ có nền và viền** còn nhãn nhóm thì trong suốt — nhìn tổng thể vẫn
thấy cấp dưới nổi hơn cấp trên. Nay đảo hẳn: nhãn nhóm có nền + vạch vàng
bên trái; mục con bỏ nền, bỏ viền, chỉ còn chữ. Ngoại lệ duy nhất là mục
**đang mở** — vẫn nổi rõ.

#### Thẻ *Đã khai báo* — mỗi con số là một LỐI ĐI *(29/8/2026)*

Chủ dự án khai xong dữ liệu rồi hỏi thẳng: *"chỗ này đã khai báo xong, thì
nếu cần sửa vào đâu?"*. Tấm thẻ bày bảy con số — phân hiệu, lớp, giáo viên,
phân công… — mà không con nào dẫn tới nơi sửa được chúng, nên người dùng phải
tự dịch *"Dòng phân công"* ra mục nào trên thanh bên. Nay mỗi dòng mang
`data-di` (`hangDi()`), đi chung đường `$$('[data-di]')` sẵn có.

⚠️ **Ba dòng cuối cố ý KHÔNG bấm được** — tổng số tiết · nơi lưu dữ liệu ·
người đang dùng. Chúng là số suy ra và trạng thái, không màn hình nào khai
chúng cả; gắn lối đi cho chúng là hứa một chỗ sửa không tồn tại.

⚠️ **Hai tín hiệu, không phải một**: mũi tên `›` LUÔN hiện (hover thì đậm lên
và nền sáng). Chỉ dựa vào hover là trên điện thoại không có tín hiệu nào.

#### Mở app là thấy TỪNG LỚP, và cột lớp bên trái lưới *(16/8/2026)*

Chủ dự án đối chiếu với SmartScheduler 7.3 đang chạy ở trường: *"có thể điều
chỉnh để xem từng lớp thay vì cho hiển thị ra màn hình cả trường?"*

- **`xemMacDinh(ds)`** chọn cách xem cho lần vẽ đầu: trên `NGUONG_LOP_TOAN_TRUONG
  = 12` lớp thì mở thẳng thẻ *Theo lớp*, dưới ngưỡng giữ lưới toàn trường.
  `S.dhXem` vì thế khởi tạo **rỗng**, không phải `'toantruong'`. Chỉ là mặc
  định — bấm thẻ khác là giữ lựa chọn ấy. Lưới toàn trường vẫn là thẻ đầu và
  vẫn là bản in A3 dán bảng tin; chỗ của nó là tờ giấy khổ lớn.
- **`cotLopHTML(ds, idChon, id)`** dựng cột lớp dán bên trái lưới, dùng chung
  cho Bảng điều hành và màn *Theo lớp*. Ô chọn xổ xuống (`#selLop`, `#dhLop`)
  đã bỏ hẳn — một việc, một lối. Nút mang `dem/can` nên cột là luôn bảng tiến
  độ theo lớp: lớp thiếu tiết thì số đổi màu và nút mang lớp `.thieu`.
- ⚠️ **Phần trong cột phải thả nổi** (`.cl-trong{position:absolute;inset:0}`).
  Chỉ `align-items:stretch` là chưa đủ: danh sách 60 nút tự nó kéo dài cả hàng
  flex, cột thò xuống quá đáy lưới gần một màn hình. `npm run soi` không thấy
  lỗi này, `node docs/anh-giao-dien/chup.mjs` thấy ngay.
- Trên điện thoại cột nằm **ngang**, cuộn ngang trong khung của mình, và
  `cuonToiLopDangXem()` kéo lớp đang mở vào tầm nhìn (cuộn trong KHUNG, không
  dùng `scrollIntoView` — hàm ấy kéo cả trang theo).
- `locBang()` bỏ phần tử `data-locnhan` (nhãn nhóm "Khối 1") ra khỏi phép ĐẾM,
  vẫn ẩn/hiện bình thường. Không thì cột 37 lớp báo "42 lớp".
- **`thieuMonLop(idLop)`** (vùng LOGIC, `npm test` mục 18c) nói rõ lớp còn
  thiếu môn gì: "24/27 tiết" cho biết CÓ thiếu, cái tên môn mới cho biết phải
  đi tìm ai. Hiện ở thẻ cạnh nút *Mở để chỉnh tay*, thanh màn *Theo lớp*, và
  `title` từng nút trong cột lớp.

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
| Tiêu đề + phạm vi + ô tìm kiếm chung | ô tìm kiếm → nút kính lúp trên **thanh đầu trang** *(3/8/2026, trước đó ở mục Giáo viên)* | đặt trong mục Giáo viên thì nó nằm sát ô lọc bảng — hai ô giống hệt nhau về hình thức, khác hẳn hành vi, người dùng gõ nhầm ô là tưởng phần mềm hỏng. Tìm kiếm toàn cục thì chỗ của nó là thanh đầu trang, theo người dùng đi mọi màn. Giấu với vai giáo viên và khi chưa đăng nhập |
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

**BÁO NGHỈ HỘ** *(3/8/2026)*: thầy cô ốm nặng, không dùng được app thì Ban
Giám hiệu ghi thay — `hopBaoNghiHo(idGV)`, nút ở màn *Theo giáo viên* (điền
sẵn người đang xem) và ở đầu khu *Giáo viên báo nghỉ* của màn Dạy thay.
Khác *Phân công không qua báo nghỉ* ở đúng một điểm: có ghi **một dòng
`bao_nghi` thật** lên máy chủ (`nguoi_gui` là người quản lý) nên hồ sơ
**ngày công** đầy đủ và thầy cô mở app vẫn thấy buổi nghỉ của mình; đường
kia không ghi gì. Quy tắc `p_bao_nghi_gui` đã cho `la_quan_ly()` ghi hộ từ
đầu — không phải sửa SQL. Ghi xong nhảy thẳng sang màn hình phương án dạy
thay. Có phép thử canh ở mục 15d của `npm run soi`.

**BẢNG NGÀY CÔNG THEO THÁNG** *(3/8/2026)*: màn *Ngày công* (nhóm Quản lý
và kết quả) — bảng nhà trường nộp báo cáo hằng tháng, ba lối ra In (A4 dọc,
`khungIn` đủ chỗ ký) · Word · Excel. Logic thuần nằm ở `tongHopNgayCong(thang)`
trong vùng LOGIC, `npm test` mục 18b canh: một buổi = **0,5 công**, cả ngày
= 1; thông báo đã **huỷ không tính**, `cho` lẫn `xong` **đều tính** (nghỉ là
chuyện đã xảy ra, không phụ thuộc dạy thay bố trí xong chưa); sắp theo **họ
tên** như danh sách nhà trường, không theo số công; chỉ liệt kê người có
buổi nghỉ, người đủ công gom vào một dòng ghi chú. Số công viết kiểu Việt
qua `soCong()` — 0,5 chứ không 0.5. Đúng nguyên tắc "không dựng bảng riêng":
mọi số liệu suy từ `bao_nghi`, không thêm bảng nào trên máy chủ.

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
tiết · đang ở phân hiệu khác trong buổi ấy · đã kín `GIOI_HAN_TIET_BUOI`.

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
"vì sao người này" (*trống cả buổi · cùng phân hiệu · đã từng dạy lớp này ·
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

#### Ba việc học từ SmartScheduler — đợt 1 *(30/8/2026)*

Đọc trọn cụm tài liệu `help.tinhochoanggia.com/smartscheduler/` — chính phần
mềm Diễn Liên đang dùng, và là nguồn của `data/truong-dien-lien.json`. Bản
đối chiếu đầy đủ ở **`docs/hoc-tu-smartscheduler.md`**; đọc tệp ấy trước khi
định lấy thêm thứ gì của họ.

⚠️ **Kết luận quan trọng nhất là một điều KHÔNG làm.** SmartScheduler có
chừng **30 loại ràng buộc khai tay** (giáo viên 10 · môn 11 · nhóm môn 8), và
chính tài liệu của họ phải cảnh báo ở **cả ba trang**: *"thêm quá nhiều ràng
buộc sẽ giảm khả năng xếp được 100%"*. Họ còn phải làm hẳn chức năng *Tinh
chỉnh* và **9 câu FAQ** chỉ để gỡ hậu quả. Đó là thiết kế đẩy việc cân bằng
sang người dùng. App mình đi hướng ngược — ít khai tay, điểm phạt mềm tự cân,
cộng R01–R13 chạy **trước** khi xếp — và **giữ nguyên hướng ấy**. Chỉ lấy thứ
nào máy tự suy được, hoặc khai một lần rất rẻ mà giá trị lớn.

Ba việc đợt này đều **chỉ ĐỌC `S.tkb`**: không đụng thuật toán, không thêm
bảng máy chủ, không thêm đường ghi nào — nên năm trường đang chạy thật không
chịu rủi ro nào.

| Hàm | Việc |
|---|---|
| `tinhTrangGV(idGV)` | vùng LOGIC — tiết thiếu · trống kẹp · số phân hiệu · số ngày phải đến trường |
| `NHAN_GV` · `nhanGV()` · `demNhanGV()` | bộ nhãn tình trạng và phép đếm |
| `oLocNhanh(dich, ds)` · `chayLoc(dich)` | dải nút lọc, và một đường lọc chung |
| `tomTatSoiGV(idGV)` · `thanhSoiGV()` | soi một giáo viên trên lưới toàn trường |
| `aiRanh(khoa, dsGV, dsLop)` · `nhomCungRanh()` | vùng LOGIC — ai dạy · ai rảnh · phòng trống |
| `mAiRanh()` | màn hình *Ai rảnh tiết nào*, nhóm TRA CỨU |

Bảy điều bắt buộc, cả bảy có phép thử (`npm run soi` mục **17r · 17s · 17t**):

- **Nút lọc mang số 0 thì KHÔNG hiện.** `demNhanGV()` lọc sẵn, hết chuyện thì
  cả dải biến mất — chứ không nằm đó nói sáu lần rằng không có gì xảy ra.
  Cùng luật "số 0 không tô đỏ" của dải chỉ số Bảng điều hành.
- ⚠️ **Hai nhãn `canLuoi` chỉ hiện khi ĐÃ xếp.** Lưới còn trắng thì cả trường
  đều "chưa xếp đủ tiết" — con số 35 ấy không nói lên điều gì.
- **Lọc nhãn và gõ chữ CHỒNG nhau**, cùng đi qua `chayLoc()`. Hai đường riêng
  thì bên này bật lại xoá kết quả bên kia. `locBang(inp)` vẫn nhận **chính ô
  nhập** — 12 nơi đang gọi như thế.
- **Bấm nút lọc KHÔNG gọi `ve()`.** Vẽ lại cả màn hình chỉ để đổi một chữ trên
  nút là mất chỗ cuộn của bảng 86 dòng — người dùng bị ném về đầu bảng.
- **`luoiRongHTML()` nhận `soi` làm THAM SỐ**, không đọc thẳng `S.soiGV`: ba
  nơi khác cũng gọi hàm ấy (Bảng điều hành, Theo khối) và không được đổi hành
  vi vì một trạng thái của riêng màn Toàn trường. Có phép thử canh.
- ⚠️ **"Rảnh" KHÔNG có nghĩa là "dùng được".** `aiRanh()` tách **bốn nhóm**
  — đang rảnh · đang dạy · **đang ở phân hiệu khác** · đã đăng ký bận — chứ
  không trả một danh sách phẳng. Gộp lại là mời một cô giáo đang đứng lớp
  cách đó mấy cây số. Phép thử nặng nhất của mục đòi bốn nhóm **chia trọn**
  danh sách: không ai đếm hai lần, không ai rơi ra ngoài.
- **Phòng đếm theo TỪNG phân hiệu** — phòng Tin của Diễn Liên không dùng thay
  cho Diễn Đồng được (ràng buộc cứng số 4).

⚠️ **Hai phép thử đầu tiên viết ra XANH OAN**, lại đúng khuôn bẫy đã ghi ở
mục 3 — và lần này em tự bắt bằng cách đọc lại chính câu điều kiện:
- *"Người đang ở phân hiệu khác"* viết `soDT > 1 ? true : n === 0` — trường
  hai phân hiệu thì **xanh vô điều kiện**. Nay soi từng lượt: người bị xếp
  vào nhóm ấy phải thật sự có tiết ở phân hiệu khác trong chính buổi đó, và
  không có tiết nào ở phân hiệu đang xem.
- *"Tìm giờ họp tổ"* tích trúng một hồ sơ **chưa có tiết nào** nên ra 30/30
  ô — lọc có tác dụng hay không cũng cùng kết quả. Nay chọn người dạy nhiều
  nhất, đòi số ô **nhỏ hơn tổng**, và đòi thêm người thứ hai thì số giờ chung
  chỉ được **giảm**.

**Đã thử ngược cả sáu vá** (script tạm, phá từng đoạn rồi chạy `npm run soi`):
6/6 đều làm phép thử đỏ. Bài học ba lần trong một tuần nay thành thói quen —
vá xong thì phá thử, không thì không biết phép thử có canh gì không.

Ảnh chụp 13 màn hình: **`docs/anh-giao-dien/`**, chụp lại bằng
`node docs/anh-giao-dien/chup.mjs` (Chrome thật, không tải thêm trình duyệt).
Khác `npm run soi` ở chỗ đó chạy trình duyệt giả để **kiểm** lỗi, còn tệp này
chạy trình duyệt thật để **nhìn** — và nó đã bắt được hai lỗi bố cục trên điện
thoại mà `npm run soi` không thấy: nhãn nhóm bị giấu mất và nút điều hướng gãy
làm ba dòng.

**Trường mới không có tệp Excel vẫn khai báo được**, đây mới là điểm cốt lõi:
- *Tạo lớp hàng loạt* — khai "khối 1 có 5 lớp" ra 1A–1E, mã lớp tự mang tiền
  tố phân hiệu (`DL-1A`). Tên lớp trùng nhau giữa các phân hiệu thì vẫn
  tạo được; trùng trong **cùng** một phân hiệu thì bỏ qua, vì đó là nhầm lẫn.
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

#### Nhập TỪNG MỤC — mỗi màn hình một trang tính *(28/8/2026)*

Chủ dự án: *"ta nhập từng mục chứ 10 trang làm cho giáo viên rối quá!"* Ông
đã thử thật: điền hết mười trang, nhập lên, nhận về **"Tệp còn 199 chỗ chưa
đúng"** mà *"khó biết sai như thế nào"*.

Mẫu trọn gói sai ở chỗ nó bắt người dùng làm **xong toàn bộ** rồi mới được
biết mình đúng hay sai. Bảy thứ phụ thuộc nhau qua mã, nên một chỗ sai ở
trang 4 làm hỏng cả trang 6 — và tất cả cùng đổ ra một lúc.

Nay mỗi màn hình khai báo có mẫu **MỘT TRANG** của đúng mục ấy. Bộ khai nằm ở
`MUC_NHAP` (vùng DULIEU), tám mục khớp đúng tên màn hình:

| Mục | Trang tính | Phải khai trước |
|---|---|---|
| Phân hiệu | `DIEM_TRUONG` | — |
| Khối và khung giờ | `KHUNG_GIO` | — |
| Lớp học | `LOP` | Phân hiệu |
| Giáo viên | `GIAO_VIEN` | — |
| Môn học | `MON_HOC` | — |
| Phân công chuyên môn | `PHAN_CONG` | Lớp học · Giáo viên |
| Phòng học | `PHONG` | Phân hiệu |
| Buổi bận | `BUOI_BAN` | Giáo viên |

| Hàm | Việc |
|---|---|
| `MUC_NHAP` | bộ khai: cột · khoá kiểm tra · dòng điền sẵn · dòng ví dụ · `doc()` |
| `taiMauMuc(ma)` | dịch xuôi ra một tệp `.xlsx` một trang + `DANH_MUC` |
| `duLieuTuMuc(ma, hang)` | đọc ngược, soát trên dữ liệu ĐANG CÓ, trả bản sao đã trộn |
| `napMucVaoS(kq)` | đường DUY NHẤT ghi kết quả vào `S` |
| `chepKhoNguon()` | bản sao để soát — không đụng `S` trước khi người dùng xác nhận |
| `thieuMucTruoc(ma)` | chặn ngay từ hộp thoại, kèm việc phải làm trước |
| `danhMucCuaMuc(ma)` | chỉ dựng danh mục trang ấy thật sự dùng |

Bốn điều bắt buộc, cả bốn đều có phép thử (`npm test` mục 22, `npm run soi`
mục 15e, `npm run soi-mau`):

- **THÊM và CẬP NHẬT, không bao giờ XOÁ.** Nhập theo khoá tự nhiên (mã lớp ·
  mã giáo viên · tên phân hiệu…). Nhập lại đúng tệp ấy lần thứ hai ra kết
  quả y hệt — không nhân đôi. Dòng đang có mà tệp không nhắc tới thì giữ
  nguyên. Đây là khác biệt lớn nhất với mẫu trọn gói, thứ **thay sạch** bảng
  phân công mỗi lần nhập.
- **Soi trên dữ liệu ĐANG CÓ, không phải trên trang tính khác trong cùng tệp.**
  Vì thế mỗi mục khai `can`, và hộp thoại chặn ngay từ đầu — đừng để người
  dùng điền xong 400 dòng phân công rồi mới báo *"chưa có lớp nào"*.
- **`duLieuTuMuc()` KHÔNG đụng `S`.** Nó trả một bản sao đã trộn; hỏng nửa
  chừng mà đã sửa vào `S` thì màn hình sau lưng hộp thoại đã đổi, người dùng
  không còn đường lui.
- **Một bộ khai, hai đầu dùng.** Không có cách nào để mẫu và trình soát lệch
  nhau — cùng bài học đã ghi cho mẫu trọn gói.

⚠️ **Khoá kỹ thuật `__dong` không phải một cột môn** *(vá 29/8/2026)*. Tiểu học
Thần Lĩnh 1 tải mẫu ma trận về, điền dấu `x`, nhập lại và nhận
*'cột "__dong" không có trong danh mục môn — khai thêm ở mục Môn học'*. Cột ấy
người dùng chưa từng gõ: `bangTuMaTran()` gắn `__dong` vào mỗi dòng để câu lỗi
chỉ đúng số dòng Excel, còn `duLieuTuMaTran()` coi **mọi** khoá lạ là tên môn.
Nay bỏ qua mọi khoá bắt đầu bằng `__` — máy tự thêm khoá gì thì máy phải tự
biết mà bỏ qua, đừng bắt người dùng đi sửa một cột họ không tạo ra.

⚠️ Phép thử vòng tròn cũ **không thấy gì** vì nó tự dựng dòng bằng `doiObj()`,
không đi qua `bangTuMaTran()` — lại đúng khuôn *"phép thử tự làm hộ app"*. Nay
có phép thử gắn thêm `__dong` đúng như tệp thật.

⚠️ Cùng lúc sửa một câu lỗi **lỗi thời**: *"dùng mẫu 3 trang nếu cố ý ghi số
tiết riêng"* — mẫu ấy thôi được mời từ 28/8, nên lời khuyên dẫn tới một nút
không còn tồn tại. Nay chỉ đúng đường: *khai số tiết cho khối ấy ở mục Môn học*.

⚠️ **Mục Phân công nay CHỈ mời mẫu MA TRẬN** *(29/8/2026)*. Chủ dự án: *"chúng
ta chỉ có duy nhất mẫu theo ma trận, mà em vẫn còn để mẫu cũ"*. Màn hình đã là
bảng ma trận thì mẫu Excel phải cùng hình dạng — tải về một tờ giấy khác hẳn
thứ vừa nhìn là bắt người dùng dịch qua lại. Nút *Tải mẫu về điền* của mục ấy
gọi `taiMauMaTran()`, bảng mô tả cột viết lại theo ma trận, và **bỏ** dòng nhắc
"mỗi dòng là một môn…" cùng dòng mời mẫu ma trận phụ.

⚠️ **Nhưng hộp phải NÓI ĐÚNG hành vi:** mẫu ma trận đi đường `hopXacNhanNhap()`
— **thay sạch** lớp · giáo viên · phân công — khác hẳn nhập từng mục vốn
*thêm và cập nhật*. Câu xanh *"không xoá dòng nào đang có"* để nguyên ở đó là
nói sai về chính thứ nguy hiểm nhất, nên với mục này nó đổi thành dải cảnh báo
*"Tệp này THAY toàn bộ bảng phân công"*, kèm lối an toàn: tải mẫu về sửa trên
đó, vì mẫu đã điền sẵn mọi thứ đang có. Có phép thử canh cả hai chiều.

**Trình ĐỌC mẫu từng dòng vẫn giữ nguyên** — trường nào đã điền dở tệp cũ không
được bỗng mất công. Chỉ bỏ phần MỜI, đúng khuôn đã làm với mẫu trọn gói.

⚠️ **Mẫu ma trận vẫn giữ, và chỉ mời ở màn Phân công.** Nó là tờ phân công
nhiều trường vẫn kẻ tay (mỗi môn một cột đánh dấu `x`). Trang tính của nó
cũng tên `PHAN_CONG`, nên `hopTrangMuc()` phân biệt bằng **CỘT** chứ không
bằng tên trang: mẫu từng dòng có `Ma_lop`, mẫu ma trận thì không.

⚠️ **Mẫu trọn gói và mẫu ba trang đã BỎ HẲN** — `taiMauTronGoi()`,
`bangKiemMau()`, `taiMauExcel()`, `bangMauNhap()` xoá khỏi mã. Nhưng **ba
trình ĐỌC thì giữ nguyên** (`duLieuTuTronGoi` · `duLieuTuBang` ·
`duLieuTuMaTran`): trường nào đã điền dở tệp cũ không được bỗng mất công.
`bangMauTronGoi()` cũng giữ, làm dữ liệu cho phép thử vòng tròn của chính
trình đọc ấy — bỏ nó đi là đường lui còn đó mà không ai canh nữa.

#### Tệp mẫu tải về phải NHẬP LẠI ĐƯỢC *(29/8/2026)*

Chủ dự án tải mẫu *Giáo viên* về, chọn lại đúng tệp ấy, và nhận
**"Tệp này không có trang tính nào máy đọc được"** — trong khi trang tính
tên đúng là `GIAO_VIEN`. Hai thứ đánh nhau:

- Mẫu mở đầu bằng **dải tiêu đề gộp ô + một dòng nhắc việc**, nên tên cột
  nằm ở **dòng 3**; `sheet_to_json()` của SheetJS mặc định lấy **dòng đầu**
  làm tên cột, ra `{"GIÁO VIÊN": …}`.
- Cột bắt buộc mang **dấu sao** cho người điền dễ nhìn (`Ma_GV *`) — ngay
  cả khi bỏ đúng hai dòng thì khoá vẫn không khớp.

`bangTuMaTran(a)` (vùng DULIEU) nhận diện dòng tên cột bằng **chính dạng
của tên** — chữ không dấu kiểu `Ma_GV`, `Ho_ten`, tối thiểu hai ô khớp —
rồi bỏ dấu sao và gán `__dong` là **số dòng Excel thật**. Tệp mà dòng đầu
đã là tên cột (kết xuất SmartScheduler, tệp người dùng tự gõ) thì ra chỉ
số 0, hành vi y như cũ; không dò ra gì thì `doc()` lùi về `sheet_to_json`
như trước.

⚠️ **Phép thử tự làm hộ app đúng cái việc app không làm.** `npm run soi-mau`
đã có sẵn cụm *"VÒNG TRÒN QUA TỆP THẬT"* từ 28/8 — nó sinh tệp, đọc lại,
đổ ngược qua `duLieuTuMuc()` và **xanh suốt**. Vì hàm đọc của nó **chép tay**
`getRow(3)` và `replace(/ \*$/, '')`: nó biết cách bỏ dòng tiêu đề, còn app
thì không. Nay `docTepMuc()` gọi thẳng `bangTuMaTran()`, hàm thật của app —
đã thử ngược: bỏ phép dò thì **25 phép thử đỏ ngay**.

⚠️ Trang đúng tên mà **chưa điền dòng nào** thì báo đúng chuyện ấy, đừng để
rơi xuống câu *"không có trang tính nào máy đọc được"* — người dùng đang
cầm đúng tệp mẫu, chỉ là chưa gõ gì vào.

#### Cột khoá để TRỐNG cả cột vẫn phải nhận ra trang *(29/8/2026)*

Tiểu học Thần Lĩnh 1 gõ 24 thầy cô vào đúng mẫu `GIAO_VIEN`, đủ chín cột, và
nhận về **"Tệp này không có trang tính nào máy đọc được"**. Gốc: `bangTuMaTran()`
chỉ gán khoá cho ô **đã điền**, nên cột `Ma_GV` trống suốt biến mất khỏi dữ
liệu; `hopTrangMuc()` dò theo dữ liệu ấy rồi kết luận "không phải trang này".
Nay `bangTuMaTran()` nhớ luôn **danh sách tên cột** (`__cot`, không liệt kê) và
`hopTrangMuc()` dò theo tên cột. Tên cột mới là thứ nói trang này là trang gì.

⚠️ Kèm theo: nhánh chính phải đòi **có dòng** (`hMuc?.length`), không thì mẫu
tải về chưa điền gì cũng "hợp trang" và người dùng nhận hộp xác nhận nhập 0
dòng thay vì câu nói thẳng *"chưa có dòng nào đã điền"*.

**`Ma_GV` bỏ trống thì MÁY TỰ ĐẶT.** Mã giáo viên là thứ `maGVTu()` sinh được;
bắt nhà trường gõ tay 24 mã là bắt làm hộ việc của máy, và họ gõ thì mỗi người
một kiểu. ⚠️ Nhưng nhập **lại** đúng tệp ấy mà sinh mã mới là nhân đôi cả danh
sách — đúng sự cố 105 hồ sơ ngày 2/8. Nên dò người cũ theo **họ tên đủ**; hai
người trùng cả họ tên thì không đoán thay, bắt ghi `Ma_GV`.

**`timLopNhap()` — một chỗ duy nhất tra lớp** cho cả cột `Chu_nhiem` lẫn
`Ma_lop`. Ba mức chắc chắn giảm dần: đúng mã → đúng **tên lớp** khi tên ấy chỉ
một lớp mang (nhà trường quen gọi *1A* hơn *1A_ND*) → **gợi ý mã gần nhất**.
Thần Lĩnh gõ `1A_CN` trong khi mã thật là `1A_ND`: hai mươi mốt dòng cùng một
lỗi, mà câu cũ khuyên *"vào mục Lớp học thêm lớp này trước"* — đẩy người dùng
đi tạo thêm 15 lớp trùng, đúng hướng ngược với việc cần làm.

⚠️ **Phép thử đầu tiên xanh oan lần nữa**: bộ soi điền vào mẫu mà mẫu thì
**sinh sẵn** các giáo viên đang có kèm mã, nên cột `Ma_GV` không hề trống. Bỏ
vá đi vẫn xanh. Phải có `xoaCotTrongMau()` xoá sạch cột ấy mới tái hiện được
tệp thật. Cùng một bài học ba lần trong một tuần: **thử ngược mọi vá**.

#### `npm run soi-nhap` — bộ soi thứ năm, đi đường của TRƯỜNG MỚI *(29/8/2026)*

Ba bộ soi cũ mỗi bộ nhìn một mảnh: `npm test` chạy hàm thuần, `npm run soi`
vẽ màn hình của trường **đã có 25 lớp**, `npm run soi-mau` soi hình thức tệp
`.xlsx`. Không bộ nào đi hết đường một trường **mới tinh** — đúng đường Tiểu
học Quảng Châu 1 đang đi, và đúng chỗ ba lỗi ngày 29/8 nằm.

`test/soi-nhap-lieu.mjs` dựng trường TRẮNG rồi đi trọn hai lối: **gõ tay**
(bấm thật vào chín hộp thoại khai báo) và **Excel** (tải mẫu, gõ dữ liệu vào
chính tệp ấy, đẩy ngược qua `#tep.onchange`). Cần
`npm install --no-save jsdom xlsx exceljs`; thiếu thì tự bỏ qua.

⚠️ Ba chỗ dễ sai khi sửa bộ soi này:
- **`#hopN` là nội dung hộp thoại, `#hopC` chỉ là hàng nút.** Soi câu lỗi ở
  `#hopC` thì được chuỗi rỗng và phép thử đỏ oan.
- **Mẫu của trường TRẮNG mang sẵn dòng ví dụ** — tổng sau khi nhập = ví dụ +
  phần gõ thêm. Soi theo phần MÌNH GÕ, đừng soi tổng.
- Mọi thao tác đi qua đúng hộp thoại người dùng bấm; gọi tắt hàm là quay lại
  đúng cái bẫy "phép thử tự làm hộ app" ở trên.

⚠️ **Hai đường tạo lớp phải ra CÙNG một dạng mã** *(vá 29/8/2026)*.
`hopThemLop()` sinh `TT-1C` trong khi `sinhLop()` sinh `1A_TT`, và nhãn xem
trước trong hộp *Tạo lớp hàng loạt* ghi `DL-1A` — tức là **dạy người dùng gõ
sai ngay tại chỗ hướng dẫn**, mà mã lớp chính là thứ họ phải gõ vào cột
`Ma_lop`. Dạng đúng: **tên lớp trước, gạch DƯỚI, viết tắt phân hiệu sau**.

#### "199 chỗ chưa đúng" — dòng trống không phải lỗi *(28/8/2026)*

Soi lại danh sách chủ dự án gửi thì **phần lớn 199 chỗ ấy không phải lỗi của
người điền**. Hai gốc rễ:

- **Dòng chưa điền bị đếm là lỗi.** Mẫu đặt khoá dư ra vài trăm dòng để người
  dùng gõ thêm; chỉ cần chạm vào một ô rồi xoá là Excel giữ lại một dòng
  rỗng, và bộ soát cũ bắt luôn **bốn lỗi một dòng** — *thiếu Ma_GV* · *thiếu
  Ma_lop* · *thiếu tên môn* · *So_tiet phải lớn hơn 0*. Ảnh chụp có đúng dấu
  vết ấy: `6_PHAN_CONG dòng 2: … môn "" … khối ?`.
- **Cùng một vấn đề lặp lại N lần.** Năm dòng *thiếu Ten_diem_truong* là năm
  câu y hệt nhau; mắt phải tự gom lấy mới hiểu ra chuyện gì.

| Hàm | Việc |
|---|---|
| `locDongDaDien(hang, cotBatBuoc)` | tách dòng đã điền khỏi dòng trống, **giữ nguyên số dòng Excel** (`__dong`) |
| `dienGiaiLoiNhap(ds)` | gom `{t, d, v}` theo (trang · nội dung) rồi mới dựng câu |
| `canhDongBo(trang, bo)` | một dòng cảnh báo nói đã bỏ mấy dòng |

Ba điều bắt buộc:

- **Mọi ô bắt buộc đều trống = dòng CHƯA ĐIỀN, bỏ qua.** Đo trên đúng cảnh
  chủ dự án gặp: **~20 lỗi → 0 lỗi**.
- **Nhưng phải NÓI RA đã bỏ mấy dòng.** Im lặng là thiếu dữ liệu mà người
  dùng không hay — tệ hơn hẳn báo thừa.
- **GOM trước rồi mới CẮT xuống 12 dòng.** Cắt trước khi gom là bày ra 12 câu
  y hệt nhau, đúng thứ đã làm chủ dự án bó tay.

⚠️ Giá trị gõ sai phải nằm **trong** câu lỗi (`Khoi phải là số từ 1 đến 5
(đang là "7")`), không tách ra ngoài. Nhờ vậy hai dòng sai **khác nhau** thì
không bị gom nhầm thành một, còn hai dòng sai **giống nhau** thì gom đúng.

#### Ô lưới trong tệp .xlsx xuất ra: HAI DÒNG *(24/8/2026)*

Chủ dự án gửi ảnh chụp trang `TOAN_TRUONG`: chữ chồng đè lên nhau, cả bảng
không đọc nổi. Gốc là hai quy tắc đúng riêng lẻ nhưng đánh nhau khi gặp:
`thanBangXL()` khoá cứng `height:19` cho **mọi** bảng, còn `trangLuoi()` bật
`wrapText` cho ô có tiết. Chữ xuống hai dòng trong ô cao một dòng thì Excel
vẫn vẽ ra — tràn đè xuống hàng dưới.

Bốn thứ đã sửa, tất cả nằm trong `trangLuoi()`:

| | trước | sau |
|---|---|---|
| Nội dung ô | `HDTN — Nguyễn Thị Trinh` một dòng | ngắt `\n` ở ` — `: môn trên, người dưới |
| Chiều cao hàng | 19 (cắt cụt) | **32** |
| Bề ngang cột | số chết `20` | **đo từ chính dữ liệu**, `min(26, max(gốc, dài nhất+2))` |
| Dải khối | `Khối 1` lặp năm lần | **gộp ô** mỗi khối một vùng |

⚠️ **Không rút ngắn họ tên để chữa.** Bản xuất phải ghi họ tên đầy đủ — ghi
"Cô Dung" thì hai cô Dung không phân biệt được, ràng buộc này đã có phép thử
canh từ trước. Cách đúng là cho ô đủ chỗ, và ngắt dòng ở chỗ **có nghĩa**.

⚠️ **`dauCotXL()` GHI ĐÈ bề ngang mọi cột nó chạm tới.** Đặt bề ngang ở
`ws.columns` phía trên rồi mà quên truyền vào đây thì nó lặng lẽ kéo về số
cũ. Phép thử đầu tiên vẫn xanh vì `daiNhat <= rong` **tình cờ đúng bằng nhau**
(20 ≤ 20) — đúng khuôn cái bẫy ở mục 3; siết thành `<` là lộ ngay.

⚠️ Chỗ đáng lo hơn cả hai lỗi trên: **đường xuất Excel là thứ nhà trường
dùng nhiều nhất, mà tới 24/8/2026 chưa có một phép soi nào chạm vào tệp
`.xlsx` nó ghi ra.** `npm test` chỉ kiểm bảng hai chiều thuần dữ liệu — đếm
đúng số ô, đúng số cột — nên nó xanh suốt trong khi tệp mở lên là mớ chữ
chồng nhau. Nay `npm run soi-mau` sinh tệp thật rồi đọc lại bằng ExcelJS.

- Bảng rộng thì **cuộn ngang trong khung của chính nó** (`.tt-boc`), thân trang
  không bao giờ cuộn ngang — người dùng chủ yếu dùng điện thoại.
- Ô của khối tan sớm ghi rõ **"Nghỉ"**, không để trống. Trống lẫn với tiết chưa
  xếp là đọc sai ngay.
- Bản in rộng dùng `khungIn(..., rong=true)` → lớp `.rong` → `@page rong`.
- Tệp Excel nay có `TOAN_TRUONG`, `KHOI_1…KHOI_5`, `TKB_LOP`, `TKB_GV`, `PCGD`,
  `DIEM_TRUONG`.
- Bản thứ năm thêm 3/8/2026: **Lịch phân công dạy thay** (`trangInDayThay`),
  A4 ngang, in đúng khoảng đang lọc trên màn hình chứ không in cả năm học.

#### Bản in là VĂN BẢN: số hiệu · ngày thực hiện · ngày ký *(29/8/2026 — `db/so-hieu-tkb.sql`)*

Chủ dự án: *"khi ký và ban hành có tính pháp lý, có thể trong 1 học kỳ nhiều
Phiên bản … Vẫn phải để ngày thực hiện, vì đó là tính pháp lý của văn bản!"*

Công bố nay không còn là bật một cái cờ mà là **ban hành một văn bản**. Bốn cột
mới của `tkb_phien_ban` gắn vào đúng bản được công bố, nên cả bốn loại bản in
đọc chung một nguồn:

| Cột | Nghĩa |
|---|---|
| `so_hieu` | số văn bản, **liên tiếp cả năm học từ 01** — chủ dự án chốt, không đánh lại theo học kỳ |
| `ngay_thuc_hien` | mốc **pháp lý** bắt đầu áp dụng, nhà trường tự ghi |
| `hoc_ky` | một học kỳ có nhiều bản |
| `ban_hanh_luc` | **ngày ký**, khoá lại lúc bấm Ban hành |

⚠️ **`version` KHÔNG phải số hiệu.** Nó nhảy mỗi lần bấm Lưu — một mùa xếp lên
tới sáu chục — còn nhà trường ban hành vài bản một năm. Lẫn hai thứ là in ra
"Thời khóa biểu số 47".

⚠️ **Ngày ký ≠ ngày in.** Bản cũ ghi `new Date()` ngay lúc dựng khung, nên in
lại tháng sau là ra một ngày khác: hai bản của cùng một thời khóa biểu mang hai
ngày ban hành thì hết làm căn cứ được. Nay lấy `ban_hanh_luc` đã khoá; chưa ban
hành bản nào mới rơi về hôm nay, và đó đúng là bản nháp.

⚠️ **Chỉ số `ux_tkb_so_hieu` chống trùng số hiệu.** Hai phó hiệu trưởng cùng
bấm Ban hành một tối thì cả hai đều đọc *"số lớn nhất là 2"* rồi cùng ghi số 3
— hai văn bản khác nhau cùng một số hiệu là hỏng hẳn về hành chính mà không ai
thấy. Cùng khuôn chốt chặn `ux_day_thay_gv_mot_tiet`: hai trình duyệt chỉ biết
trạng thái của mình, hàng rào phải nằm ở cơ sở dữ liệu.

**Đã chạy trên máy chủ thật 30/8/2026**, cùng `db/dien-ngay-thuc-hien.sql` —
tệp sau điền ngày thực hiện 07/9/2026 và học kỳ cho bản số 01 của hai trường
đang công bố. Cố ý tách hai tệp: tệp đầu là **cấu trúc**, tệp sau là **dữ liệu
pháp lý của từng trường** — trộn chung thì lần cài cho trường thứ ba lại kéo
theo ngày tháng của trường thứ nhất.

⚠️ **Mọi tệp SQL từ nay mở đầu bằng khối kiểm "đúng dự án chưa?"** *(30/8/2026)*.
Chủ dự án có nhiều dự án Supabase và đã dán nhầm một lần: Postgres báo
`relation "tkb_phien_ban" does not exist` — đúng nhưng khó đoán, dễ tưởng tệp
SQL viết sai. Khối kiểm dừng ngay và nói bằng tiếng Việt; quan trọng hơn là
**không câu lệnh nào kịp chạy dở dang** ở một dự án lạ. `db/soi-dung-du-an.sql`
là câu kiểm chỉ đọc, dùng khi nghi ngờ đang đứng ở đâu.

**Luôn có đường lui:** máy chủ chưa chạy `db/so-hieu-tkb.sql` thì `congBoTKB()`
bắt đúng lỗi thiếu cột, công bố lại **không kèm bốn cột** và nói rõ trong câu
báo. Không bao giờ để một trường đang chạy mất nút Công bố vì một tệp SQL chưa
kịp chạy.

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
3. **Một giáo viên, một buổi, một phân hiệu.** ← ràng buộc lõi của bài toán
   sau sáp nhập. Thay cho việc tính thời gian di chuyển từng tiết; đơn giản
   hơn nhiều về thuật toán và cũng đúng thực tế quản lý hơn.
4. Phòng chức năng: một lớp/tiết, và phải cùng phân hiệu với lớp.
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
- **Tối thiểu hoá số lần giáo viên đổi phân hiệu trong tuần** (trọng số cao nhất).

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
- `chiSo()` đếm sẵn `phongBan[phân hiệu|loại][ô] = số lớp đang chiếm`.
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
Kéo thả HTML5 **không chạy trên cảm ứng**, mà PHT phụ trách phân hiệu gần như
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
      độ khó = (không phải GVCN ? 1000 : 0) + số phân hiệu × 200 + tổng tiết
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

Kết quả trên kịch bản 3 phân hiệu: đổi phân hiệu 29 → 24 lần, tiết trống
kẹp giữa buổi 45 → 11, Toán và Tiếng Việt bị đẩy xuống chiều 113 → 14 tiết.

Hai tiết ghim (chào cờ, sinh hoạt lớp) bị `laGhim()` loại khỏi danh sách hoán
đổi — có phép thử canh.

### Toán và Tiếng Việt vào tiết 1–3 sáng — 83% lên 88–91% *(3/8/2026)*

Bốn mảnh ghép, đo bằng `npm run kiemdinh` sau MỖI thay đổi (chỉnh mù trọng
số đã thử và thất bại hai lần trước khi chẩn đoán ra gốc rễ):

1. **Thang BẬC cho môn nặng** ở cả `diemO` lẫn `diemLop`: tiết 1–3 sáng gần
   miễn phí, tiết 4–5 sáng đắt hẳn, chiều đắt nhất. Thang tuyến tính cũ để
   tiết 4 sáng chỉ tốn 15 điểm — rẻ hơn phạt trùng môn trong ngày.
2. **Xoay VÒNG BA TIẾT** (`xoayBaDuoc` · `xoayO`) trong `toiUuHoanDoi`: phép
   đổi ĐÔI kẹt đúng thế "Tiếng Việt tiết 4, GDTC tiết 2" — đổi thẳng thì GDTC
   rơi vào tiết-cuối-sáng bị phạt, từng nửa nước đều lỗ. Vòng xoay khởi phát
   HẸP: chỉ từ tiết nặng ngoài vùng vàng, đích là ô vàng bị chiếm. Hoàn tác
   một vòng xoay = xoay ngược chiều `(a,c,b)`.
3. **Đặt chỗ vàng theo CẦU–CUNG từng lớp** trong `diemO`: môn thường chỉ bị
   phạt (+40) khi lấn vào tiết 1–3 sáng của lớp mà chỗ vàng còn lại không đủ
   cho số Toán/TV chưa xếp. ⚠️ Đã thử "kiêng đồng loạt +10" — phản tác dụng:
   bộ môn bị rải ra chiều, trống kẹp 12 → 22 mà chỉ nhích 1%.
4. **Miễn thuế cho giáo viên LIÊN phân hiệu** (`cs.gvDiDong`): ràng buộc
   một-buổi-một-điểm đã bó họ rất hẹp, bắt kiêng thêm là hết chỗ — kịch bản
   3 phân hiệu từng tụt 696 → 672 tiết vì thiếu đúng khoản miễn này.
   Kèm **thuế kẹt–lấn** trong `diemLop`: mỗi cặp (nặng kẹt ngoài · thường
   lấn vàng) cùng lớp +7, cho vòng xoay đủ lời để chấp nhận xáo trộn nhỏ.

Số đo chốt (`npm run kiemdinh` canh ≥87% / ≥89%): trường thật **88%** —
sát TRẦN CẤU TRÚC ~88,5% (hai cô Tiếng Anh kín 24/31 slot buộc phải chiếm
≥25 ô vàng; phần còn lại là bài toán nhân sự — quy tắc **R13** báo đúng
con số này từ tháng 8); 60 lớp **91%**.

### Pha đổi CHÉO HAI LỚP — trống kẹp 18 → 8 *(3/8/2026, cùng ngày)*

Nước đi thứ ba của `toiUuHoanDoi`, trên nền **chùm dời chỗ đồng thời**
(`chumHopLe` · `apChum` · `daoChum`): cô Tiếng Anh dạy lớp A tiết p và lớp
B tiết q thì tráo hai vị trí cho nhau, hai môn bị choán chỗ đổi ngược lại —
bốn tiết dời cùng lúc. Từng nửa nước đi đều "trùng giờ chính cô" nên phép
đổi đôi và xoay ba (bó trong một lớp) không bao giờ với tới; đây là nước
duy nhất xoay được lịch giáo viên bộ môn kín chỗ. Kết quả: tiết trống kẹp
trường thật **18 → 8** (tốt hơn cả mốc 12 trước khi tối ưu vùng vàng),
60 lớp 36 → 15; độ ổn định giữa các hạt GRASP 4,3% → **1,7%**; đoạn tham
lam → tối ưu trên dữ liệu thật: Toán/TV buổi chiều 42 → 1, trống kẹp 55 → 8.

⚠️ Bẫy đã trả giá ngay khi thêm pha này: `xepDaiTung` mặc định hạn hoán đổi
700ms < 1200ms của nút Xếp nhanh, nên lần thử tất định của Xếp kỹ KÉM hơn
Xếp nhanh — vỡ cam kết "không bao giờ tệ hơn" (`npm run kiemdinh` bắt được
trong một phút). Hạn mặc định nay là **1200ms, phải luôn bằng** hạn của nút
Xếp nhanh; pha mới càng cần giờ hội tụ thì điều này càng sống còn.

Lý do xếp GVCN sau cùng: ở tiểu học GVCN dạy ~20/25 tiết của chính lớp mình
nên cực kỳ linh hoạt, xếp vào đâu cũng được. Giáo viên bộ môn liên điểm
trường thì gần như chỉ có 1–2 phương án khả dĩ.

### Bảng phân công trống: 0/0 ra **NaN%** *(29/8/2026)*

Chủ dự án bấm *Xếp* ở trường chưa khai phân công và nhận **"NaN% hoàn tất"**.
Con số xấu chưa phải điều tệ nhất: nhánh dưới còn khoe **"Xếp trọn vẹn toàn bộ
tiết ✓ Không có xung đột"** — vì danh sách chưa-xếp rỗng. Trường mới bấm lần
đầu nhận một lời chúc mừng cho việc **không làm gì cả**, rồi đi tìm thời khóa
biểu không tồn tại. Cùng luật *"số 0 không tô đỏ"*: đừng báo tin về thứ chưa
xảy ra.

- `ketQuaXep()` có nhánh riêng cho `tongCan === 0`, nói thẳng *"Chưa có tiết
  nào để xếp"* kèm nút đi tới **Phân công chuyên môn**.
- Nút *Xếp* **chặn ngay từ lúc bấm** — đừng để máy chạy 0 giây rồi trả về một
  bảng rỗng, người dùng không đoán được mình còn thiếu bước nào.

⚠️ Bảng điều hành đã phòng đúng phép chia này từ trước (`tongCan?…:0`), chỉ
`ketQuaXep()` bị sót — **loại lỗi này hiếm khi đứng một mình**. Nay `npm run
soi-nhap` quét **17 màn hình** của một trường TRẮNG và đòi không màn nào bày
`NaN` · `undefined` · `Infinity`.

### Xếp kỹ — chạy lâu, tìm nhiều phương án *(1/8/2026)*

Một giây chỉ đủ dò một nhánh. Cho nó vài phút thì tìm được phương án đẹp hơn
hẳn, và quan trọng hơn: cho ra **vài phương án khác nhau** để người xếp tự chọn.

Điều làm việc này rẻ hẳn đi là một nhận xét về chính bài toán nhà trường:
**học sinh chỉ học tại phân hiệu của mình, và giáo viên về cơ bản dạy một
phân hiệu** — chỉ vài giáo viên bộ môn ít tiết mới dạy liên điểm. Vậy nên
thời khóa biểu toàn trường gần như là **mấy bài toán nhỏ rời nhau**.

`nhomDocLap()` tách bằng union-find: hai lớp cùng nhóm khi có chung ít nhất một
giáo viên. Ba phân hiệu thật tách đúng thành **25 · 18 · 17 lớp**. Giải riêng
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
Ba phân hiệu 60 lớp: **5296 → 5079** sau 45 giây, vẫn đủ 1698/1698 tiết.

**Không bao giờ quảng bá "xếp tự động 100%".** Định vị đúng và an toàn hơn:
*"Phát hiện vướng mắc trước khi xếp — xếp xong trong một phút — chỉ rõ chỗ
cần điều chỉnh."*

### Kết quả kiểm thử trên dữ liệu thật (bắt buộc giữ được)
| Kịch bản | Kết quả mong đợi |
|---|---|
| 1 phân hiệu | **710/710 tiết**, < 1 giây, 0 xung đột |
| 3 phân hiệu | ~696/710 tiết, 0 xung đột, phần thiếu rơi vào Tiếng Anh khối 5 |

Khi sửa thuật toán, chạy lại `npm test` để đảm bảo không tụt so với mốc trên,
và **`npm run kiemdinh`** *(3/8/2026)* — trình soát ĐỘC LẬP viết lại toàn bộ
phép kiểm ràng buộc cứng từ dữ liệu thô, không dùng lại hàm nào của thuật
toán chính (thuật toán tự chấm bài mình thì lỗi chung lọt lưới). Bảy kịch
bản: trường thật · tất định · 60 lớp · sáu hạt GRASP · xếp kỹ · bận dày đặc
· giáo viên liên phân hiệu. Kịch bản cuối là bắt buộc phải giữ: bộ dữ liệu
thử cắt giáo viên gọn theo phân hiệu nên ràng buộc lõi "một buổi một điểm
trường" được thoả một cách TẦM THƯỜNG nếu không ép tồn tại người dạy hai nơi.

---

## 6. Bộ quy tắc kiểm tra khả thi (13 quy tắc)

Chạy **trước** khi xếp. Đây là tính năng có giá trị bán hàng cao nhất — nó cho
hiệu trưởng biết vấn đề nhân sự từ tháng 8, lúc còn kịp xử lý.

| Mã | Nội dung | Mức |
|---|---|---|
| R01 | Giáo viên vượt định mức 23 tiết | canh (≤2) / do (>2) |
| R02 | Không đủ buổi để có mặt ở các phân hiệu | **do** |
| R03 | Kín ≥ 85% số buổi, không còn dự phòng | canh |
| R04 | Lớp lệch số tiết chuẩn CT GDPT 2018 | canh |
| R05 | Lớp vượt sức chứa khung giờ | do |
| R06 | Lớp chưa có chủ nhiệm | canh |
| R07 | Chủ nhiệm bị phân công ở phân hiệu khác | do |
| R08 | Toàn trường thiếu năng lực giảng dạy | do |
| R09 | Trùng tên gọi giữa các giáo viên | goi |
| R10 | Xếp Tin học ở phân hiệu chưa có phòng máy | do |
| R11 | Chủ nhiệm báo bận đúng buổi có tiết cố định | canh |
| R12 | Có phòng chức năng nhưng **không đủ chỗ** cho số tiết cần | do |
| R13 | Vùng vàng (tiết 1–3 sáng) không đủ chỗ cho Toán, Tiếng Việt | goi |

R12 là quy tắc chỉ lộ ra sau sáp nhập: ba trường gộp lại mà vẫn một phòng máy
thì số tiết Tin học vượt hẳn sức chứa (số phòng × số ô giờ). Nó phải báo từ
tháng 8, lúc còn kịp xin thêm phòng — chứ không phải để tới lúc xếp mới biết.
Chỉ chạy khi trường đã khai bảng phòng.

R13 *(3/8/2026)* sinh từ đợt kiểm định thuật toán: trần 88,5% của "Toán/TV
vào tiết 1–3 sáng" là **trần cấu trúc** — giáo viên bộ môn kín lịch (cô
Tiếng Anh 24 tiết chỉ có 15 chỗ ngoài vùng vàng) bắt buộc chiếm phần vùng
ấy, thuật toán giỏi mấy cũng không vượt được. R13 tính cầu–cung, trừ chào
cờ, trừ phần ép của từng người kín lịch, rồi báo **kèm tên người kín nhất**
— hiệu trưởng cầm con số đi xin biên chế hoặc chia lại tải. Ước lượng cố ý
hào phóng để là **CẬN DƯỚI trung thực** của thực đo (dữ liệu thật: báo 31,
thực đo ~40) — có phép thử canh cả ba chiều: nổ đúng, không phóng đại,
không báo oan khi hết người kín lịch.

---

## 7. Dữ liệu thật — dùng làm bộ kiểm thử vàng

`data/truong-dien-lien.json` — Trường TH Diễn Liên, năm học 2025–2026 HK1.
Trích từ file kết xuất của phần mềm SmartScheduler 7.2 mà trường đang dùng.

- 25 lớp (1A–5E, 5 lớp mỗi khối), 35 giáo viên, 265 dòng phân công, **710 tiết/tuần**
- TKB gốc **không có một xung đột nào** → dùng để đối chiếu kết quả thuật toán

⚠️ **HỌ TÊN trong tệp này là HƯ CẤU từ 28/8/2026.** Cấu trúc thì thật nguyên
vẹn — từng lớp, từng dòng phân công, từng con số tiết đều là của trường thật,
nên tệp vẫn là bộ kiểm thử vàng. Chỉ ba trường `id` · `hoTen` · `tenNgan` được
thay. Lý do: tệp này cũng là **bản demo phát cho bất kỳ ai đăng nhập** (chế độ
KHÁCH, nút *Khám phá bản demo*), mà kho mã thì công khai — họ tên kèm lịch dạy
của 35 thầy cô có thật là dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.
Đổi tên trong tệp này thì phải chụp lại `docs/anh-giao-dien/`.

### `CHUAN_KHOI` là SÀN, không phải TRẦN *(29/8/2026)*

Tiểu học Quảng Châu 1 thêm hai môn tự chọn — *HD Tự học* và *Kĩ năng CDS* —
rồi mở khung giờ lên **9 buổi/tuần, 32 ô**, khớp đúng 32 tiết đã khai. App bày
một dải vàng **"Khối 1 thừa 5 ô mỗi tuần · học sinh có tiết trống giữa buổi"**.
Báo động giả, ngay tại màn hình người dùng vừa khai xong — và nghe theo nó thì
nhà trường đi xoá bớt một buổi học có thật.

Gốc: mọi phép soát đều so với hằng số `CHUAN_KHOI = {27,27,28,30,30}`. Đó là
mốc **Chương trình GDPT 2018** — sàn pháp lý, không phải trần; trường được dạy
thêm môn tự chọn. Nay mốc so sánh là **tổng tiết chuẩn của danh mục môn nhà
trường đã khai**:

| Hàm | Việc |
|---|---|
| `tietCanTu(dsMon, k)` | tổng tiết chuẩn khối `k` của một danh mục môn |
| `tietCanKhoi(k)` | bản dùng `S.monHoc` — cho mọi màn hình |

Sáu chỗ đã đổi mốc: R04 · dòng tổng và khối cảnh báo màn *Khối và khung giờ* ·
cột lệch tiết bảng *Lớp học* · gợi ý trong hộp *Thêm phân công* · hai đường
soát tệp Excel. Chuẩn CT GDPT **vẫn bày ra bên cạnh** (`cần 32 · CT 27`) để đối
chiếu, chỉ thôi làm thước đo đúng–sai.

⚠️ **Nhãn phải nói HẬU QUẢ, không nói phép trừ** *(29/8/2026, lần thứ hai)*.
Sửa xong nhãn thành `thừa 2` thì chủ dự án vẫn hỏi lại *"chữ thừa 2 ý nghĩa gì
đây em"*. *Thừa* là nhận xét về cái bảng; thứ người dùng cần biết là hai ô ấy
sẽ **trống**, học sinh khối 1 ngồi chơi 2 tiết mỗi tuần. Nay ô ghi `2 ô trống`
· `thiếu 3 chỗ` · `vừa đủ`, và khối cảnh báo nói thẳng *"Học sinh khối 1 sẽ ngồi
chơi 2 tiết mỗi tuần"* kèm cách chữa đúng của bảng này — **hạ ô của riêng khối
ấy ở một buổi chiều** cho các em tan sớm. Nói bằng thứ người dùng nhìn thấy ở
lớp, đừng nói bằng con số chênh lệch.

⚠️ **Ô 78px không đủ chỗ cho một nhãn tự giải thích.** Bản đầu ghi
`cần 32 / CT 27` ngay dưới tổng; chủ dự án đọc và hỏi thẳng *"chữ cần 30, cần
32 là gì thầy chưa hiểu"*. Hai con số trần không tự nói ra chúng là gì. Nay ô
chỉ bày **kết luận** (*đủ · thừa 2 · thiếu 3*), còn ba con số nằm ở **bảng
dưới** có tên cột viết thành câu: *Khung giờ đang mở · Danh mục môn cộng lại ·
CT GDPT 2018 quy định*, khối 1–2 ghi kèm *(+2 tự chọn)*.

- **Chưa khai môn nào thì lùi về `CHUAN_KHOI`** — trường mới tinh vẫn được
  soát tử tế. Có phép thử canh.
- ⚠️ **Đường nhập Excel phải gọi `tietCanTu(kho.monHoc, k)`**, không gọi bản
  không tham số: nó soát trên BẢN SAO, không phải trên `S`. Cùng lý do
  `duLieuTuMuc()` không đụng `S`.
- **Bỏ mốc cứng không có nghĩa bỏ phép soát**: bớt một buổi thì vẫn báo thiếu
  đúng số ô còn hụt. Có phép thử canh cả hai chiều.

⚠️ Bài học rộng hơn: **một hằng số đúng lúc viết có thể sai khi trường làm khác
đi mà vẫn hợp lệ.** Trước khi lấy hằng số làm thước đo, hỏi xem người dùng có
quyền vượt nó không.

### Những con số đã kiểm chứng, không được đoán lại
- **Số tiết/tuần:** khối 1–2 = 27 (25 chính khoá + 2 Tiếng Anh tự chọn),
  khối 3 = 28, khối 4–5 = 30. Khớp chính xác CT GDPT 2018.
  ⚠️ **`CHUAN_KHOI` giữ đúng con số VĂN BẢN: khối 1–2 là 25**, không phải 27
  *(sửa 29/8/2026)*. Bản trước cộng sẵn 2 tiết Tiếng Anh — môn **tự chọn** ở
  lớp 1–2 — nên nhãn "CT 27" nói sai quy định. Phần tự chọn nhà trường thêm
  vào đã được `tietCanKhoi()` cộng từ danh mục môn thật, không cần nhét vào
  hằng số của Bộ.
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
- **Không để tên dịch vụ kỹ thuật lọt ra giao diện** *(28/8/2026)*. Đa số cán
  bộ giáo viên không biết *Supabase* là gì, nên mọi chuỗi hiển thị nói
  **"Hệ thống"** — *"dữ liệu sẽ ghi thẳng lên Hệ thống cho cả trường dùng
  chung"*, *"Máy chủ hệ thống"*. Comment trong mã thì **vẫn giữ tên thật**:
  người sửa mã cần biết mình đang gọi dịch vụ nào. Phép thử ở mục **17g** của
  `npm run soi` bỏ hết comment rồi mới soi, nên canh được đúng ranh giới ấy.
- **Không viết cứng tên trường cụ thể vào giao diện.** Phần mềm dùng cho nhiều
  trường, có trường sáp nhập có trường không. Nút *Mô phỏng sáp nhập 3 điểm
  trường* từng viết cứng ba tên Diễn Liên · Diễn Đồng · Diễn Thái nên chỉ đúng
  cho đúng một nhà trường; nay là *Tạo dữ liệu thử*, hỏi tên và số lớp.

### Ngôn ngữ thiết kế — hệ XANH DƯƠNG *(đổi 24/8/2026 theo mẫu chủ dự án gửi)*

Hệ màu đã đổi **hai lần**: navy (AVATAR) → xanh lá (16/8) → **xanh dương
(24/8)**. **Tên biến giữ nguyên qua cả ba lần** (`--nav` nay là xanh dương
đậm) vì chúng nói đúng VAI TRÒ — màu của thanh điều hướng và của mọi hành
động chính — chứ không nói tên màu. Đổi tên thì phải sửa hàng trăm chỗ mà
chẳng được thêm gì; giữ nguyên thì lần đổi thứ ba này chỉ là một bảng ánh xạ.

**Sáu mã gốc chủ dự án chốt** — mọi thứ khác suy ra từ đây:

| Vai trò | Mã | Biến |
|---|---|---|
| Màu chủ đạo | `#005391` | `--nav` |
| Xanh đậm | `#003B68` | đỉnh dải thanh bên |
| Nút / hover | `#0A659F` | `--nav-2` |
| Nền xanh nhạt | `#EAF5FB` | `--nav-nhat` |
| Nền tổng thể | `#F4F9FC` | `--nen` |
| Viền | `#C9E2F0` | `--nav-vien` · `--ke-2` |

**Đổi bằng bảng ánh xạ TƯỜNG MINH, không xoay màu mù.** 59 mã, mỗi mã một
dòng có ghi chú nó là gì. Ba nhóm **cố ý không đổi**, và có phép thử canh:

- **Màu ngữ nghĩa** — `--xanh #15803D` (báo *đạt*), `--do`, `--canh`. Đây là
  chỗ dễ quét nhầm nhất: đổi bảng màu giao diện mà kéo luôn màu báo trạng
  thái đi theo thì người dùng mất hẳn tín hiệu "việc này xong / việc này hỏng".
- **Màu môn học và màu phân hiệu** — sáu sắc phân biệt nhau, không phải màu
  giao diện. Trong đó có `.m-ta` · `.m-gdtc` · `.m-kh` xanh lá và `--luc`.
- **Cây cối trong tranh** đầu trang. Mẫu vẫn có cây xanh, chỉ **dịu hẳn** so
  với bản cũ (đo trên mẫu: `#74A990`, bản cũ là `#8CC65E` xanh nõn chuối).
  Mái nhà đổi từ cam đất sang xanh; **thân cây đổi sang NÂU** — trước nay nó
  ăn theo hệ xanh lá nên là xanh xám, mà thân cây xanh dương thì vô lý.

⚠️ **Hai chỗ phải sửa RIÊNG vì dùng chung mã với thứ khác.** Thanh tiến độ
dùng `#2E9E63` — mà đó cũng là `--luc`, màu phân hiệu thứ hai; và `#5FAE87`
— cũng là chấm báo *đã nối máy chủ*. Thay theo mã là hỏng cả hai thứ kia.
Phải thay nguyên cụm `linear-gradient` trước, rồi mới quét theo mã.

⚠️ **Vòng tròn tiến độ viết cứng mã màu ngay trong `style=`**, không đi qua
biến — nên nó **sót lại xanh lá** sau khi cả trang đã xanh dương, và chỉ
`node docs/anh-giao-dien/chup.mjs` nhìn ra. Hai bộ soi kia đều xanh. Đổi hệ
màu thì phải soi cả những chỗ viết cứng trong thuộc tính `style`.

⚠️ **Sửa tệp bằng script thì mở ở chế độ nhị phân, hoặc `newline='\n'`.**
Đoạn Python đổi bảng màu ghi bằng `io.open(p,'w')`, mà trên Windows chế độ ấy
đổi mọi `\n` thành `\r\n` — **cả 12.707 dòng của `index.html` thành CRLF
trong một lần ghi**. Bản diff phình từ 981 dòng lên toàn bộ tệp nên không ai
soi được thay đổi thật, và `npm run soi-mau` vỡ vì nó cắt hàm bằng
`indexOf('\nfunction …')`. `npm test` và `npm run soi` **vẫn xanh** — chúng
cắt vùng bằng mốc `#region` nên không đụng tới ký tự xuống dòng. Nay mục
**17c** của `npm run soi` canh năm tệp gốc.

**Ba chỗ khai màu chủ đề phải bằng nhau**: biến `--nav`, thẻ
`<meta name="theme-color">`, và `theme_color` trong `manifest.webmanifest`.
Phép thử nay so **ba chỗ với nhau** thay vì ghi cứng một mã — bản trước ghi
cứng `#0F5132` nên đổi màu là nó đỏ mà không nói được chỗ nào lệch.

- Thanh bên xanh dương chuyển dần `#003B68 → #1580C4` (giữ độ mở rộng hai
  đầu đã chốt 23/8: bốn nấc quá gần nhau thì nhìn ra một mảng xanh bệt, rõ
  nhất lúc mọi nhóm cùng đóng), rộng **248px**,
  mục đang chọn `#0F74B0` kèm vạch vàng `#FFD93E`, **không có hoạ tiết nào ở đáy**.
  ⚠️ **Lưới chấm trắng phủ nền thanh bên thì GIỮ** — chủ dự án dặn thẳng
  *"nhớ là vẫn có chấm trắng nhé"*. Chấm 1px, cách nhau 18px, mờ 5,5%: đủ
  cho nền có chất liệu, không đủ để đọc ra hoa văn. Nó nằm chung khai báo
  `background` với dải chuyển màu chứ không phải một thuộc tính riêng, nên
  đổi dải màu là lúc dễ quét mất nó nhất. Có phép thử canh.
  ⚠️ Cụm lá vẽ ngày 16/8 đã **xoá hẳn 23/8**: đối chiếu ảnh mẫu thì ở đó
  không có gì, và trên màn hình thật nó là thứ bắt mắt nhất trong cả thanh
  bên — một hoạ tiết nền mà nặng hơn mọi mục điều hướng nằm trên nó. Đã
  thử nước lưng chừng là hạ `opacity` xuống .3, chủ dự án nhận ra ngay:
  *"lá này đâu có, em vẫn giữ?"*. **Bỏ một khối trang trí thì xoá hẳn mã
  của nó** — làm mờ chỉ là để lại đúng vấn đề ấy ở mức nhạt hơn.
  ⚠️ Đừng hạ bề ngang xuống nữa: 238px đã thử và làm gãy dòng cả ba chỗ chữ
  dài nhất — tên sản phẩm ở đầu thanh, nhãn nhóm *Tra cứu thời khóa biểu*,
  và vai trò trong thẻ tài khoản.
- Nền `#F4F9FC`, thẻ trắng bo `14px`, viền `#C9E2F0`, đổ bóng rất nhẹ.
  ⚠️ Đây là **đảo lại** quyết định ngày 16/8 ("nền gần trắng quá thì thẻ
  trắng không tách ra khỏi nó"). Đảo được vì mẫu mới chuyển việc phân tách
  sang **VIỀN**: nền nhạt hẳn nhưng viền thẻ đậm và rõ. Hai cách đều đúng,
  nhưng phải chọn một — nền nhạt mà viền cũng nhạt thì lại thành mảng phẳng
  y như bản 16/8 đã chê.
- **Thanh đầu trang là THẺ TRẮNG có phong cảnh** (trời, mây, chim, đồi,
  cây) ở nửa phải, không còn là khối navy đậm. Chữ vì thế là chữ thường,
  không phải chữ trắng. Mép trái hình phải tan dần bằng một lớp gradient
  trắng phủ lên — thiếu nó là lộ một vạch dọc cắt ngang thanh.
  **Giữa tranh là NGÔI TRƯỜNG** *(23/8/2026)* — hai cánh nhà, khối giữa có
  đồng hồ và cột cờ, thân kem mái cam đất. Nó đứng ở `x 140–310` của
  `viewBox` 600 đơn vị, và chỗ ấy là chỗ duy nhất đặt được: lệch trái thì
  rơi vào vùng mặt nạ còn đang tan mờ (hết mờ ở 126), lệch phải thì cụm nút
  *Đăng nhập · tìm · chuông* che mất mái. Canh chỗ theo nhãn **"Đăng nhập"**
  — nhãn dài nhất nút ấy từng mang, nên mọi trạng thái khác đều dư chỗ.
  ⚠️ **To ra thì DÀI RA HAI BÊN, đừng cao thêm.** Bản đầu vẽ rộng 130 đơn vị,
  đặt cạnh mấy tán cây thì đọc ra một cái nhà nhỏ ven đồi chứ không ra ngôi
  trường — chủ dự án nhận ra ngay khi đối chiếu với ảnh mẫu. Nay rộng 170 mà
  giữ nguyên chiều cao: thanh đầu trang chỉ cao chừng 76px, và `viewBox` cắt
  theo mép **dưới** (`xMaxYMax slice`) nên cao thêm là cụt mái.
- **Ba nút góc phải thanh đầu cùng một dáng: tròn, nền trắng viền nhạt**
  *(23/8/2026)*. Trước đó tìm kiếm và chuông là hai khối xanh đặc, nặng
  ngang cụm chữ tên trường trong khi việc của chúng chỉ là hai lối phụ — và
  nút tài khoản sáng kẹp giữa hai khối tối thì ba nút không đọc ra một cụm.
- **Nút chưa chọn NỔI KHỐI: nền xanh sáng + viền + đổ bóng** *(chốt
  23/8/2026)*. Đã thử cả hai chiều trong cùng một ngày: bản sáng để nút nền
  trắng viền mảnh cho đúng ảnh mẫu, nhưng trên màn hình thật cả dải bốn nút
  chỉ còn bốn khung viền nhạt — không nhìn ra chỗ bấm được. Chủ dự án yêu
  cầu thẳng là nút phải nổi khối như trước. Nay **ba tín hiệu** cho nút chưa
  chọn (nền riêng · viền · đổ bóng), và nút đang chọn hơn nữa bằng nền đậm
  chữ trắng cộng bóng sâu hơn. Áp cho cả `.xem-nut`, `.dt-nut`, `.cl-n`.
  `.the-luoi` vẫn **trong suốt**: bên trong nó đã có khung trắng riêng của
  cột lớp + lưới, thêm một tấm trắng nữa là trắng lồng trắng. Nút nổi được
  là nhờ **chính nó**, không nhờ tấm nền phía sau.
- `.b-vang` nay là **xanh dương đậm** chứ không còn màu vàng. Vàng chỉ còn ở
  logo, vạch đánh dấu mục đang mở và ô biểu tượng *Cảnh báo*.
- Ba thẻ dưới Bảng điều hành mang **ô biểu tượng vuông bo tròn** (`.the-ic`)
  màu theo vai trò: xanh đậm = tiến độ, xanh lá = xong, đỏ = có việc gấp,
  vàng = cảnh báo.
- Mỗi môn học một màu riêng (nền pastel + viền trái đậm, suy từ `--mc` bằng
  `color-mix`), mỗi phân hiệu một màu riêng.
- **MỖI MÔN MỘT BIỂU TƯỢNG** *(23/8/2026 — `IC_MON` · `icMon()`)*. Đảo lại
  quyết định "chốt bỏ icon" cũ: ảnh mẫu chủ dự án gửi có icon ở mọi ô, và khi
  hỏi lại thì chốt là thêm. Ba điều của bộ này:
  - **Tra theo LỚP MÀU** (`m-tv`, `m-toan`…), không theo tên môn. Trường tự
    khai thêm môn thì chỉ chọn màu, không ai đi khai một hình vẽ — môn mới vì
    thế mượn luôn hình của màu mình chọn.
  - **Nét mảnh, mờ 42%, nằm dưới chữ về thứ bậc.** Nó là mốc nhận diện nhanh
    cho mắt lướt 30 ô một lúc, không phải thông tin — thông tin vẫn nằm ở tên
    môn viết đủ chữ. Đậm bằng chữ là tranh chỗ với chính cái tên nó đi kèm.
  - **Ô đã ghim thì KHÔNG bày icon** (`.o-tiet.ghim .o-ic{display:none}`):
    dấu ghim 📌 ngồi đúng góc ấy, và giữa một thông tin thật với một mốc
    trang trí thì thông tin thắng.
  ⚠️ `.o-mon` phải có `padding-right` — thiếu là "Tiếng Việt" chạy thẳng vào
  dưới hình ở đúng những ô hẹp nhất.
- **Màu môn là PASTEL NGẢ XÁM, không phải màu nguyên pha trắng**
  *(làm lại 23/8/2026)*. Đây là chỗ đọc sai ảnh mẫu lâu nhất. Bảng cũ lấy
  màu nguyên rực của bộ màu web — xanh `#2563EB`, cam `#E08A16`, đỏ
  `#E0484F` — rồi pha trắng cho nhạt. **Pha trắng chỉ hạ độ SÁNG, không hạ
  độ BÃO HOÀ**, nên ô nào cũng vẫn là một mảng màu tươi; ba mươi ô cạnh
  nhau thành một bảng bảy sắc và chủ dự án nhận xét *"còn tệ hơn bản cũ"*.
  Ảnh mẫu thì dịu: đào, be, mint, hồng phấn, lavender — màu đã ngả xám sẵn
  từ gốc. Nay `--mc` là màu ĐẤT, bão hoà thấp (`#4A7FB5`, `#C77B45`,
  `#3E9A72`…); nền và viền vẫn suy ra bằng `color-mix` như cũ nên đổi màu
  gốc là cả lưới đổi theo. Thêm môn mới thì lấy màu cùng họ, và **kiểm bằng
  mắt ở cỡ ô thật**, không nhìn ô màu to trong bảng chọn.
- **Ô tiết** *(23/8/2026)*: nền `24%` màu môn, viền `40%`, tên môn 12.5px,
  ô cao 48px. Bản nhạt trước đó đọc được trên
  màn hình văn phòng nhưng nhoè hẳn khi chiếu máy chiếu phòng họp hội đồng —
  chỗ tấm thời khóa biểu hay bị đem ra soi nhất. Nền đậm lên thì **tên giáo
  viên cũng phải đổi** từ xám trung tính sang màu môn pha đen, không thì nó
  chìm vào chính cái nền ấy.
- Lịch cá nhân (`.tiet-ca`, màn *Thời khóa biểu của tôi*) đi **cùng một mức
  đậm và cùng bộ icon** với ô tiết của lưới. Hai chỗ vẽ cùng một thứ — một
  tiết học — mà để lệch thì thầy cô mở lịch mình lại thấy nhạt hơn lúc xem
  theo lớp, đúng cái màn hình nhóm đông nhất mở mỗi sáng, thường là ngoài
  sân dưới nắng.
- **Cột lớp và lưới là MỘT KHỐI LIỀN, không phải hai mảng rời** *(23/8/2026 —
  `.cl-boc`)*. Trước đó cột lớp nằm trần trên nền trang còn lưới là thẻ trắng
  có viền riêng: hai thứ luôn dùng cùng nhau mà nhìn ra hai vật thể, đúng kiểu
  "giao diện rời rạc" đã chê ngày 3/8. Nay khung trắng bao cả hai, ngăn nhau
  bằng một vạch dọc mảnh — cột lớp đọc ra là **cột đầu của bảng**, không phải
  một cái hộp đứng cạnh bảng. `.luoi-boc` bên trong **phải bỏ viền, bo góc và
  đổ bóng của chính nó**: hai lớp viền chồng nhau là ra đường kẻ đôi mờ ở cả
  bốn cạnh.
  ⚠️ Trên điện thoại cột nằm NGANG nên vạch ngăn phải đổi sang cạnh **dưới**.
  Để nguyên `border-right` là một vạch dọc chạy giữa dải nút, không ngăn gì cả.
- `manifest.webmanifest` và thẻ `theme-color` phải đổi theo (`#0F5132`),
  không thì thanh trạng thái điện thoại còn navy trong khi app đã xanh.

---

## 9. Việc cần làm tiếp

> **Việc đã xong chuyển sang `docs/lich-su-quyet-dinh.md`** *(2/8/2026)* —
> nguyên văn, đủ ngày tháng, ghi chú kỹ thuật và các “bẫy” đã trả giá.
> Sắp sửa vào một vùng mã cũ thì đọc tệp ấy trước.
> Đề xuất chưa đưa vào lộ trình: xem `docs/danh-gia-va-de-xuat.md`.
> Ba việc máy chủ đầu danh sách (cai-dat.sql · dọn hồ sơ thừa · phát mã)
> có hướng dẫn từng bước: **`docs/huong-dan-may-chu-truoc-khai-giang.md`**
> *(3/8/2026)* — làm theo đúng thứ tự trong đó, một buổi tối là xong.

- [ ] **Kèm Tiểu học Châu Đình khai báo dữ liệu** *(25/8/2026 — trường
      ngoài đầu tiên, mã 74334, quản trị `c1chaudinh.qh@nghean.edu.vn`)*.
      Đường nhanh nhất: tải *Mẫu trọn gói Excel* về điền rồi nhập một cửa.
      Nhật ký ngày vào hệ thống (bốn chỗ vấp, đã vá cả bốn) ở
      `docs/lich-su-quyet-dinh.md`. Quy tắc rút ra: **trường đăng ký bằng
      Gmail CỦA NHÀ TRƯỜNG**, không dùng Gmail cá nhân.
- [x] ~~**Ba việc bảo mật**~~ — xong 29/8/2026: thẻ CSP, chống đơn đăng ký
      rác, siết `p_nk_ghi`. Cả hai tệp SQL đã chạy trên máy chủ thật cùng
      ngày (`db/chu-he-thong-xem.sql` · `db/siet-dang-ky-va-nhat-ky.sql`).
      Chi tiết ở mục 3.
- [ ] **Thông báo hai chiều cho khâu duyệt trường** — đơn mới thì báo chủ
      hệ thống, duyệt xong thì báo trường (hiện cả hai đầu đều phải tự mở
      app xem). Chưa gấp ở quy mô vài trường quen; **bắt buộc trước khi
      quảng bá rộng**.
- [ ] **Phát quyền cho 35 thầy cô Diễn Liên.** Đường CHÍNH từ 28/8/2026 là
      **cột Gmail**: mục *Giáo viên* → *Nhập từ Excel* → *Tải mẫu về điền*
      (mẫu ra sẵn đủ 35 người, chỉ gõ thêm một cột) → nhập lại → Lưu. Thầy cô
      bấm *Đăng nhập bằng Google* là vào, không mã, không hạn dùng.
      Nút *Tạo N mã* trong hộp **Mã mời** vẫn giữ cho người không dùng Gmail. Hai nhóm bị **cố ý bỏ qua**: người đã có tài khoản,
      và hồ sơ không có dòng phân công nào (thường là hồ sơ thừa của bộ dữ liệu
      thử; phát mã vào đó là cầm chắc một thầy cô đăng nhập xong nhìn màn hình
      trắng — xem sự cố cô Oanh trong `docs/lich-su-quyet-dinh.md`).
      · **link mời cả trường** — một link dán nhóm Zalo, thầy cô bấm rồi tự
        nhận tên mình — vẫn để ngỏ cho Pha 2. Thiết kế đã bàn ngày 2/8 (chế độ
        *Nhẹ*), **chưa viết dòng mã nào**. Nó cần thêm bảng, thêm quy tắc RLS
        và một màn hình soi lại; không nên nằm trên đường tới ngày khai giảng.
- [ ] Dọn hồ sơ giáo viên và lớp thừa của bộ dữ liệu thử trên máy chủ thật
      *(2/8/2026)*. Chạy `db/soi-tai-khoan-gv.sql` để biết còn sót gì.
- [ ] **Bước tối ưu đang dừng theo ĐỒNG HỒ nên chất lượng phụ thuộc máy**
      *(đo 16/8/2026, chủ dự án chốt để SAU KHAI GIẢNG mới làm — không đụng
      thuật toán trong lúc đang chạy thật cho Diễn Liên)*. `toiUuHoanDoi()`
      cắt ở 1200ms, mà bước ấy **chưa hội tụ**: cho chạy tới cùng thì 60 lớp
      điểm phạt 7715 → **5006** (−35%), trống kẹp 114 → 14; 25 lớp 2544 →
      2243, trống kẹp 27 → 8. Hệ quả: cùng một dữ liệu, **máy chậm ra thời
      khóa biểu kém hơn máy nhanh** mà người dùng không biết. Cách chữa đã
      bàn: dừng theo **số phép thử** thay vì theo giây (kết quả tất định,
      máy nào cũng như nhau), kèm van an toàn chống treo, và nới hạn theo
      số lớp. ⚠️ Đây cũng chính là gốc của **ba phép thử chập chờn** trong
      `npm test` — *"Điểm phạt giảm rõ rệt"*, *"Bớt hẳn Toán và Tiếng Việt
      bị đẩy xuống buổi chiều"*, *"Bớt hẳn tiết trống kẹp giữa buổi"* — hỏng
      khoảng một phần ba số lần chạy khi máy đang bận. `npm run kiemdinh`
      thỉnh thoảng cũng đỏ một mục vì đúng lý do ấy. Thấy chúng đỏ thì chạy
      lại **một mình, lúc máy rảnh** trước khi đi tìm lỗi ở chỗ khác.
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
- [ ] Sửa tên đơn vị khi có quyết định sáp nhập chính thức — ở mục *Thông
      tin trường*. Máy chủ đã có quy tắc `p_truong_sua` (bộ cài chạy
      24/8/2026) nên lưu được ngay.

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
- PHT phụ trách phân hiệu bị bó phạm vi, xem mục phân quyền ở trên.

### Quản trị — người cài đặt ban đầu

Chỉ làm vài lần: dựng cơ sở dữ liệu, nhập bảng phân công, cấp tài khoản.
Chấp nhận được vài bước phức tạp, miễn là có hướng dẫn từng bước.

**Bài học đã trả giá:** nút *Đăng ký trường mới* từng đặt ngang hàng với nút
*Đăng nhập*, cùng kích cỡ. Chủ dự án bấm nhầm, tạo ra một tài khoản mồ côi.
Việc cả đời một trường làm một lần thì đừng để cạnh việc làm hằng ngày.
