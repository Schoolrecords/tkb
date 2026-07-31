# Thời khóa biểu — Trường tiểu học nhiều điểm trường

Năm học 2026–2027 · Nghệ An

Giúp cán bộ quản lý xếp thời khóa biểu nhanh gọn, và giáo viên đăng nhập là
thấy ngay lịch dạy của mình.

---

## Chạy thử

```bash
npm start          # mở http://localhost:5173
```

Hoặc mở thẳng `src/index.html` bằng trình duyệt — file chạy độc lập, không cần
máy chủ.

## Kiểm thử

```bash
npm test
```

Chạy thuật toán trên dữ liệu thật của Trường TH Diễn Liên và đối chiếu với
mốc đã kiểm chứng:

| Kịch bản | Mốc phải giữ |
|---|---|
| 1 điểm trường | 710/710 tiết · 0 xung đột · dưới 3 giây |
| 3 điểm trường | ≥ 690/710 tiết · 0 xung đột · 0 vi phạm ràng buộc điểm trường |
| Hoán đổi cục bộ | không mất tiết · không sinh xung đột · điểm phạt giảm ≥ 20% |

Bộ kiểm thử còn dựng một **máy chủ giả** để chạy thử tầng truy cập dữ liệu —
đăng nhập, tải, lưu, khóa lạc quan, khôi phục bản cũ — nên không cần mạng và
không cần tài khoản Supabase.

Sửa thuật toán hoặc tầng dữ liệu xong thì chạy lại lệnh này trước khi commit.

---

## Cấu trúc

```
CLAUDE.md                     bản giao việc — đọc trước tiên
README.md                     file này
package.json                  lệnh start / test

src/index.html                toàn bộ ứng dụng, một file, không cần build
                              vùng /*#region LOGIC*/  là phần thuật toán thuần
                              vùng /*#region DULIEU*/ là tầng truy cập dữ liệu
                              vùng /*#region QUYEN*/  là phân quyền giao diện
                              vùng /*#region XUAT*/   là dựng bảng để xuất
src/cauhinh.mau.js            mẫu cấu hình máy chủ — chép thành src/cauhinh.js

data/truong-dien-lien.json    dữ liệu thật: 25 lớp · 35 GV · 265 dòng · 710 tiết
data/mau-nhap-pcgd.xlsx       mẫu Excel đúng định dạng nhập liệu
data/ketxuat-smartscheduler-*.xlsx
                              bản kết xuất gốc của SmartScheduler, dùng đối chiếu

db/schema.sql                 PostgreSQL cho Supabase, đa trường, có RLS
db/khoi-tao.sql               tạo trường + nối tài khoản đăng nhập, chạy một lần
db/du-lieu-dien-lien.sql      nạp 25 lớp · 35 GV · 265 dòng lên máy chủ
                              (sinh từ data/truong-dien-lien.json, đừng sửa tay)

test/kiem-thu.mjs             bộ kiểm thử thuật toán

docs/thuat-toan.md            cách thuật toán xếp hoạt động
docs/quy-tac-kiem-tra.md      10 quy tắc kiểm tra khả thi
```

---

## Dựng cơ sở dữ liệu

1. Tạo project mới trên Supabase, chọn vùng Singapore.
2. Vào **SQL Editor**, dán toàn bộ `db/schema.sql`, chạy.
3. Vào **Settings → API Keys**, lấy `Project URL` và **khoá công khai**:
   dự án mới là khung **Publishable key** (`sb_publishable_...`), dự án cũ là
   khung **anon public** (`eyJhbGciOi...`). Phần mềm nhận cả hai đời khoá.
   Không bao giờ lấy `sb_secret_...` hay `service_role`.
4. Chép `src/cauhinh.mau.js` thành `src/cauhinh.js`, điền hai giá trị vừa lấy:

```js
// Khoá này là khoá công khai — an toàn khi để ở frontend,
// vì Row Level Security mới là thứ chặn truy cập dữ liệu.
export const SUPABASE_URL  = 'https://xxxxx.supabase.co';
export const SUPABASE_ANON = 'sb_publishable_...';
```

`src/cauhinh.js` đã nằm trong `.gitignore`.

5. Vào **Authentication → Users**, bấm **Add user → Create new user**
   (không phải *Send invitation*, dòng đó tạo tài khoản chưa có mật khẩu).
   Nhớ bật **Auto confirm user**.
6. Mở `db/khoi-tao.sql`, sửa ba chỗ có dấu `>>>`, rồi chạy trong SQL Editor.
   Nó tạo bản ghi trường và nối tài khoản vừa tạo vào đó với quyền quản trị —
   dò theo email nên không phải chép tay mã UUID. Kết quả phải ra đúng 1 dòng.
7. Chạy `npm start`, bấm **Máy chủ dữ liệu** ở góc dưới bên trái, đăng nhập.

Mở `src/index.html` bằng đường dẫn `file://` thì trình duyệt không nạp được
`cauhinh.js` — muốn nối máy chủ phải chạy qua `npm start`.

---

## Tầng truy cập dữ liệu

Cả ứng dụng chỉ chạm cơ sở dữ liệu qua bốn hàm trong vùng
`/*#region DULIEU*/` của `src/index.html`:

| Hàm | Việc |
|---|---|
| `dangNhap(email, matKhau)` | đăng nhập, dò về trường và bản ghi giáo viên |
| `taiDuLieu()` | tải dữ liệu nguồn và phiên bản thời khóa biểu mới nhất |
| `luuTKB(tkb, version)` | ghi một phiên bản mới, có chống ghi đè |
| `lichSuPhienBan(gioiHan)` | liệt kê các bản đã lưu để xem lại hoặc khôi phục |

**Chưa có máy chủ vẫn dùng được đầy đủ.** Không có `src/cauhinh.js`, chưa đăng
nhập, hay mất mạng thì ứng dụng tự chạy bằng dữ liệu mẫu trong `data/`; chỉ
riêng việc lưu lên máy chủ là tạm nghỉ, và màn hình nói rõ điều đó.

**Hai người lưu cùng lúc không ghi đè nhau.** Máy gửi kèm số phiên bản đang
giữ; nếu trên máy chủ đã có bản mới hơn thì máy chủ từ chối và báo *"Đã có
người lưu phiên bản N. Mời tải lại rồi lưu tiếp."*

**Khôi phục bản cũ không xoá bản mới.** Bấm *Khôi phục* chỉ nạp bản cũ lên màn
hình; muốn chốt thì bấm *Lưu lên máy chủ*, nó thành một phiên bản kế tiếp.

Phiên đăng nhập không lưu xuống máy, tải lại trang là phải đăng nhập lại.

---

## Ai làm được gì

| | Quản trị · Hiệu trưởng · PHT chuyên môn | PHT phụ trách một điểm trường | Giáo viên |
|---|---|---|---|
| Đổi phạm vi xem | được | khoá vào điểm của mình | — |
| Xếp tự động | được | không | không |
| Sửa điểm trường · phân công · khung giờ | được | không | không |
| Kéo thả chỉnh tiết | mọi lớp | chỉ lớp trong điểm của mình | không |
| Lưu lên máy chủ | được | được | không |
| Xem lịch cá nhân | mọi người | mọi người trong điểm mình | chỉ của mình |

Phân biệt hai loại phó hiệu trưởng bằng cột **`nguoi_dung.diem_truong_id`**:
để trống là phụ trách chuyên môn — thấy toàn trường; điền một điểm trường là
phụ trách riêng nơi đó.

**Vì sao PHT một điểm trường không được bấm xếp tự động:** mỗi lần xếp là dựng
lại lưới của cả trường, sẽ đè lên phần các điểm trường khác. Họ chỉnh tay phần
mình ở mục *Theo lớp* rồi bấm *Lưu lên máy chủ*.

Chưa dựng xong Supabase vẫn thử được: bấm **Đổi vai trò xem thử** ở thanh bên,
chọn *Phó hiệu trưởng* rồi chọn điểm trường phụ trách. Nhớ bấm *Mô phỏng sáp
nhập 3 điểm trường* trước, vì dữ liệu mẫu chỉ có một điểm.

---

## Đưa lên GitHub Pages

```bash
git init && git add -A && git commit -m "Khởi tạo hệ thống thời khóa biểu"
git branch -M main
git remote add origin https://github.com/<tài-khoản>/tkb-app.git
git push -u origin main
```

Vào **Settings → Pages**, chọn nhánh `main`, thư mục `/src`.

---

## Xuất và in

Mục **Xuất và in** ở thanh bên trái.

**Tệp Excel** — một tệp `.xlsx` gồm bốn trang tính: `TKB_LOP` (lưới theo lớp),
`TKB_GV` (lưới theo giáo viên), `PCGD` (bảng phân công), `DIEM_TRUONG` (tổng hợp).
Mở được bằng Excel, WPS hay Google Sheets.

**In / lưu PDF** — khổ A4 ngang, mỗi lớp hoặc mỗi giáo viên một trang, có tên
trường, năm học, giáo viên chủ nhiệm, điểm trường và chỗ ký. Trong hộp in của
trình duyệt chọn **Đích đến → Lưu dưới dạng PDF** là ra tệp PDF.

Bản in không dùng thư viện PDF ngoài — trình duyệt in sẵn và giữ đúng dấu tiếng
Việt. Bản xuất luôn ghi **họ tên đầy đủ** của giáo viên, vì trường có bốn cặp
trùng tên gọi.

Phó hiệu trưởng phụ trách một điểm trường chỉ xuất và in được các lớp tại điểm
trường của mình.

---

## Ba việc làm trước

Pha 1 đã xong: cơ sở dữ liệu Supabase chạy thật cho Trường TH Diễn Liên từ
31/7/2026, xếp 710/710 tiết, lưu có phiên bản, xuất Excel và in PDF.

Còn lại cho Pha 2 — mở cho nhiều trường:

1. **Màn hình tự đăng ký trường mới.** Cần thêm một hàm Postgres
   `dang_ky_truong()` kiểu `security definer`: tài khoản vừa tạo chưa có dòng
   `nguoi_dung` nên Row Level Security chặn cả việc tạo trường lẫn tạo hồ sơ.
   Phá vòng luẩn quẩn đó đúng một chỗ, có kiểm soát.
2. Mời thành viên (PHT, giáo viên) qua giao diện thay vì gõ tay trong
   Authentication.
3. Đưa thuật toán vào Web Worker khi số lớp vượt 60.

---

## Khung giờ theo khối

Số tiết mỗi buổi **khác nhau theo khối** — khối nhỏ tan sớm hơn. Chỉnh ở mục
**Khung giờ**: bảng có 10 dòng (8 buổi học + 2 buổi nghỉ) và 5 cột khối.

Mặc định lấy đúng lưới thật của Trường TH Diễn Liên:

| Buổi | K1 | K2 | K3 | K4 | K5 |
|---|---|---|---|---|---|
| Sáng T2–T5 | 4 | 4 | 4 | 4 | 4 |
| Sáng T6 | 4 | 4 | 4 | 5 | 5 |
| Chiều T2 | 3 | 3 | 3 | 3 | 3 |
| Chiều T3 | 2 | 2 | 3 | 3 | 3 |
| Chiều T5 | 2 | 2 | 2 | 3 | 3 |
| **Tổng/tuần** | **27** | **27** | **28** | **30** | **30** |

Dòng tổng dưới bảng tự đối chiếu với chuẩn CT GDPT 2018: xanh là khớp, đỏ là
thiếu chỗ, cam là thừa chỗ. Điền `0` nếu riêng một khối nghỉ buổi đó.

Sinh hoạt lớp tự ghim vào **tiết cuối của khối đó** — khối 1–3 tiết 4 sáng thứ
Sáu, khối 4–5 tiết 5. Lưới trên màn hình và bản in cũng ngắn lại theo khối, nên
thời khóa biểu lớp 1 in ra không có tiết 5 thứ Sáu.

---

## Nhập dữ liệu từ Excel

Nút **Nhập dữ liệu Excel** ở góc dưới thanh bên. Tệp cần ba trang tính:

| Trang tính | Các cột |
|---|---|
| `DANH_SACH_GV` | `Ma_GV` · `Ho_ten` · `Chu_nhiem` · *`Dinh_muc`* |
| `DANH_SACH_LOP` | `Ma_lop` · `Ten_lop` · `Khoi` · `Diem_truong` |
| `PCGD` | `Ma_GV` · `Ma_lop` · `Mon` · `So_tiet` |

`Ma_GV` và `Ma_lop` phải là **duy nhất** — đó là thứ nối ba trang tính với
nhau, và là lý do phần mềm không bao giờ nhầm hai giáo viên trùng tên.

**Máy soát tệp trước khi nhập** và chỉ rõ *sai ở dòng nào*: mã lặp, khối ngoài
1–5, thiếu môn, số tiết bằng 0, chủ nhiệm trỏ tới lớp không có, phân công trỏ
tới giáo viên không có. Người nhập cầm tệp Excel trong tay nên biết dòng là sửa
được ngay.

**Đã đăng nhập thì ghi thẳng lên Supabase** cho cả trường dùng chung. Giáo viên
và lớp dò theo khoá tự nhiên (`ma_gv`, `ten`) nên **giữ nguyên mã UUID** — các
phiên bản thời khóa biểu đã lưu vẫn đọc được sau khi nhập lại. Riêng bảng phân
công thì xoá sạch rồi ghi lại, vì đó mới là thứ thay đổi mỗi học kỳ.

Lớp hay giáo viên có trên máy chủ mà tệp không nhắc tới thì **không tự xoá**,
chỉ báo số lượng — xoá một lớp là kéo theo cả phân công và làm hỏng phiên bản
đã lưu.
