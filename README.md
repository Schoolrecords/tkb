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
| Ghim tiết | xếp lại vẫn đủ 710 tiết và tiết ghim đứng yên |
| Ba lớp cùng tên "1A" | nhập được, mỗi lớp nối đúng chủ nhiệm của mình |

Bộ kiểm thử còn dựng một **máy chủ giả** để chạy thử tầng truy cập dữ liệu —
đăng nhập, tải, lưu, khóa lạc quan, khôi phục bản cũ — nên không cần mạng và
không cần tài khoản Supabase.

### Soi giao diện thật

```bash
npm install --no-save jsdom     # một lần
npm run soi
```

`npm test` chỉ cắt phần mã thuần ra chạy nên không nhìn thấy màn hình. Lệnh
`npm run soi` mở nguyên `src/index.html` trong một trình duyệt giả, vẽ đủ 13
màn hình rồi **bấm thật** vào các nút: chạm chọn tiết, chuyển tiết, bỏ ghim,
hoàn tác, đánh dấu buổi bận. Chính nó đã bắt được lỗi tiết chào cờ vẫn bị ghim
vào buổi giáo viên đã báo bận.

Chưa cài `jsdom` thì lệnh tự bỏ qua, `npm test` không phụ thuộc gì cả.

Sửa thuật toán hoặc tầng dữ liệu xong thì chạy lại cả hai lệnh trước khi commit.

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
src/manifest.webmanifest      khai báo PWA — cài app lên màn hình chính điện thoại
src/sw.js                     service worker: mạng trước kho sau, mất mạng vẫn mở
                              được trang; không bao giờ cache Supabase
src/bieu-tuong-192.png        biểu tượng app khi cài lên máy (192 và 512 px)
src/bieu-tuong-512.png

data/truong-dien-lien.json    dữ liệu thật: 25 lớp · 35 GV · 265 dòng · 710 tiết
data/mau-nhap-pcgd.xlsx       mẫu Excel đúng định dạng nhập liệu
data/ketxuat-smartscheduler-*.xlsx
                              bản kết xuất gốc của SmartScheduler, dùng đối chiếu

db/cai-dat.sql                BỘ CÀI TRỌN GÓI — dán một lần cho dự án Supabase
                              mới. Sinh tự động, đừng sửa tay (xem dòng dưới)
db/gop-cai-dat.mjs            sinh lại cai-dat.sql từ bốn tệp nguồn; CI canh khớp
db/schema.sql                 PostgreSQL cho Supabase, đa trường, có RLS
db/khoi-tao.sql               tạo trường + nối tài khoản đăng nhập, chạy một lần
db/du-lieu-dien-lien.sql      nạp 25 lớp · 35 GV · 265 dòng lên máy chủ
                              (sinh từ data/truong-dien-lien.json, đừng sửa tay)
db/ma-lop.sql                 thêm cột ma_lop — cho phép ba điểm trường cùng có
                              lớp "1A". Chạy một lần trên CSDL dựng trước 1/8/2026
db/cong-bo.sql                mở quy tắc UPDATE để bấm được nút Công bố

test/kiem-thu.mjs             bộ kiểm thử thuật toán và tầng dữ liệu
test/soi-giao-dien.mjs        bấm thử giao diện trong trình duyệt giả (npm run soi)
test/soi-worker.mjs           kiểm Web Worker xếp kỹ trong Chrome thật, chạy tay
                              (jsdom không có Worker nên npm run soi không kiểm được)
test/soi-pwa.mjs              kiểm PWA trong Chrome thật: đăng ký service worker,
                              ngắt mạng tải lại vẫn mở, không cache Supabase

docs/thuat-toan.md            cách thuật toán xếp hoạt động
docs/quy-tac-kiem-tra.md      10 quy tắc kiểm tra khả thi
```

---

## Dựng cơ sở dữ liệu

1. Tạo project mới trên Supabase, chọn vùng Singapore.
2. Vào **SQL Editor**, dán toàn bộ `db/cai-dat.sql`, chạy. Một tệp này gộp
   đủ bốn phần: schema + RLS, danh mục môn và bảng phòng, quy tắc Công bố,
   hàm đăng ký trường mới. Chạy lại lần nữa cũng không hỏng gì.
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

`src/cauhinh.js` cố ý **không** nằm trong `.gitignore` — khoá trong đó là
khoá công khai, và GitHub Pages thiếu tệp này thì trang không đăng nhập được
(xem ghi chú trong `.gitignore`).

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
| Sửa điểm trường · phân công · khung giờ · buổi bận | được | không | không |
| Chỉnh tiết (chạm hoặc kéo thả) | mọi lớp | chỉ lớp trong điểm của mình | không |
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

**Tên lớp thì được phép trùng nhau** giữa các điểm trường. Sau sáp nhập, cả ba
nơi đều có lớp *1A* và đó là ba lớp khác nhau — bắt nhà trường đổi tên lớp chỉ
để chiều phần mềm là làm ngược. Chỉ cần mã riêng: `DL-1A`, `DD-1A`, `DT-1A`.
Trên màn hình và trong bản xuất, lớp trùng tên tự hiện kèm điểm trường
(*“1A · Diễn Đồng”*).

Cột `Chu_nhiem` nên ghi **`Ma_lop`**. Vẫn nhận `Ten_lop` nếu tên đó chỉ trỏ tới
một lớp; trùng tên thì máy báo rõ dòng nào và bảo ghi `Ma_lop`.

Cơ sở dữ liệu dựng trước ngày 1/8/2026 cần chạy một lần `db/ma-lop.sql`.

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

---

## Đưa lên GitHub Pages

Đưa lên mạng để **thầy cô mở được bằng điện thoại**, và để có bản sao ngoài ổ
cứng. Kho mã đã tạo sẵn và lưu bản đầu tiên.

```bash
git branch -M main
git remote add origin https://github.com/<tài-khoản>/tkb-app.git
git push -u origin main
```

GitHub Pages kiểu *Deploy from a branch* **chỉ lấy được thư mục gốc hoặc
`/docs`** — không lấy được `/src`. Nên dự án dùng `.github/workflows/pages.yml`:
mỗi lần đẩy lên nhánh `main`, GitHub Actions tự đưa nội dung `src/` lên làm gốc
trang. Không phải chỉnh gì trong Settings, cũng không phải xáo cấu trúc dự án.

Trang chạy tại `https://<tài-khoản>.github.io/tkb/`.

### Vì sao `src/cauhinh.js` được đưa lên kho mã

Ban đầu tệp này nằm trong `.gitignore` theo thói quen. Với kiến trúc ở đây thì
đó là **cẩn thận nhầm chỗ**:

- Khoá trong tệp là **khoá công khai** — Supabase ghi rõ *"Publishable keys can
  be safely shared publicly"*. Nó nằm sẵn trong trình duyệt của mọi người truy
  cập, giấu trong kho mã không đổi được điều đó.
- Hàng rào thật là **Row Level Security** trong `db/schema.sql`, mặc định
  không ai đọc được gì.
- Thiếu tệp này thì trang trên GitHub Pages không biết địa chỉ máy chủ, không
  đăng nhập được.

**Thứ tuyệt đối không được đưa lên** là khoá `sb_secret_…` hoặc `service_role`.
Chúng bỏ qua mọi hàng rào. Trong dự án này chúng chỉ nằm ở Edge Function trên
máy chủ Supabase, không có trong tệp nào.

---

## Quản lý tài khoản

Mục **Giáo viên** → nút **Tài khoản đăng nhập**. Cấp tài khoản cho thầy cô,
đặt lại mật khẩu, xoá tài khoản. Chọn tên từ danh sách giáo viên là phần mềm
tự nối tài khoản với bản ghi giáo viên, đăng nhập vào thấy ngay lịch của mình.

Chức năng này cần **Edge Function** cài một lần:

1. Supabase → **Edge Functions** → *Deploy a new function*
2. Đặt tên đúng là **`tai-khoan`**
3. Dán toàn bộ `db/edge-function-tai-khoan.ts`, bấm Deploy

Tạo tài khoản cần khoá `service_role` — khoá bỏ qua mọi hàng rào. Khoá đó
**không bao giờ được nằm trong trình duyệt**, nên việc này chạy trên máy chủ
Supabase: trình duyệt gửi vé đăng nhập lên, hàm kiểm tra người gọi có phải quản
trị của trường đó không, rồi mới thao tác. Trường A không chạm được tài khoản
trường B.

---

## Đăng ký trường mới

Trường thứ hai trở đi tự đăng ký được, không phải vào SQL. Cần chạy một lần:

```
db/dang-ky-truong.sql   →   dán vào SQL Editor, bấm Run
```

Sau đó ở hộp đăng nhập có nút **Trường mới**: điền tên trường, mã trường, họ
tên người đăng ký là xong — người đó thành quản trị của trường mới, kèm khung
giờ mặc định đúng chuẩn CT GDPT 2018.

Hàm đó phải là `security definer` vì Row Level Security khoá chặt: muốn thêm
dòng vào `nguoi_dung` thì phải đã là quản trị của trường, nhưng người đầu tiên
của một trường mới thì chưa là gì cả. Vòng luẩn quẩn đó được phá đúng một chỗ,
có kiểm soát.

---

## Cấp tài khoản hàng loạt cho giáo viên

Gõ tay 35 lần thì không ai làm. Mục **Giáo viên** → **Tài khoản đăng nhập** →
**Cấp hàng loạt cho giáo viên**.

Máy sinh sẵn tên đăng nhập và mật khẩu cho những thầy cô chưa có tài khoản, tạo
một loạt, rồi **in phiếu cắt phát** — mỗi thầy cô một ô trên khổ A4, có địa chỉ
trang, tên đăng nhập và mật khẩu.

**Tên đăng nhập không cần hộp thư thật.** Dạng `trinh@tkb.local` — máy chủ không
gửi thư nào tới đó, nó chỉ là tên đăng nhập cho gọn. Thầy cô không phải mở Gmail,
không phải xác minh gì. Lấy chữ cuối của họ tên, bỏ dấu, viết thường; trùng thì
thêm số — trường có bốn cặp trùng tên gọi nên chuyện này chắc chắn xảy ra
(*Bùi Thị Dung* → `dung`, *Đặng Thị Dung* → `dung2`).

**Mật khẩu bỏ các ký tự `i l o 0 1`** vì in ra giấy hay nhìn nhầm.

⚠️ **In phiếu ngay sau khi cấp.** Mật khẩu chỉ hiện một lần; quên thì phải đặt
lại từng người, máy chủ không lưu mật khẩu dạng đọc được.
