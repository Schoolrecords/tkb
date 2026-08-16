# Đánh giá: app chịu được bao nhiêu trường?

*Rà soát ngày 16/8/2026 theo yêu cầu của chủ dự án. Số liệu trong bài đều
ĐO THẬT bằng chính vùng LOGIC của app, không ước lượng bằng cảm tính —
script đo nằm ở cuối bài.*

⚠️ Hạn mức và giá của Supabase trong bài là theo hiểu biết tại thời điểm
viết. **Trước khi quyết định tiền bạc phải mở trang giá hiện hành đối chiếu
lại** — nhà cung cấp đổi hạn mức không báo trước.

---

## 1. Tình trạng hiện tại

| | |
|---|---|
| Mã nguồn | `src/index.html` 11.417 dòng · 736 KB · nén còn **225 KB** |
| Kiểm thử | `npm test` 321/0 · `npm run soi` 318/0 · `npm run kiemdinh` 22/0 · `npm run soat` sạch |
| Cơ sở dữ liệu | 15 bảng, RLS bật ở mọi bảng nghiệp vụ, khoá theo `truong_id` |
| Đã chạy thật | 1 trường (Diễn Liên, 25 lớp) |

Kết luận ngắn: **phần kỹ thuật đã sẵn sàng cho nhiều trường; phần vận hành
và thương mại thì chưa.** Chi tiết dưới đây.

---

## 2. Bốn thứ khiến app này scale tốt hơn phần mềm cùng loại

**a) Thuật toán chạy trên máy người dùng, không chạy trên máy chủ.**
Đây là quyết định đắt giá nhất của dự án. Xếp 60 lớp mất ~3,7 giây CPU —
nếu chạy ở máy chủ thì 100 trường cùng xếp vào tuần cuối tháng 8 là sập,
hoặc phải trả tiền cho hàng chục nhân CPU. Ở đây máy chủ **không tốn một
giây CPU nào** cho việc nặng nhất của sản phẩm. Thêm trường gần như chỉ
tốn thêm chỗ chứa.

**b) Một schema chung, cô lập bằng RLS.** Mọi bảng đều có `truong_id`,
mọi quy tắc đều đi qua `truong_cua_toi()`. Nâng cấp cơ sở dữ liệu là chạy
`db/cai-dat.sql` **một lần cho toàn hệ thống**, không phải làm lại cho từng
trường. Đây là khác biệt lớn so với kiểu "mỗi trường một cơ sở dữ liệu".

**c) Trường tự đăng ký được.** `dang_ky_truong()` dựng trường + hồ sơ quản
trị + khung giờ chuẩn CT GDPT 2018 + một điểm trường mặc định, trong một
giao dịch. Chủ dự án không phải làm gì cho trường mới. `dung_ma_moi()` lo
nốt việc phát quyền cho giáo viên.

**d) Cô lập dữ liệu đã kiểm được.** Edge Function tạo tài khoản có kiểm
`truong_id` + vai trò ở mọi nhánh; `dang_ky_truong` và `dung_ma_moi` đều
chặn "một tài khoản thuộc hai trường". Không tìm thấy đường nào để trường A
đọc hay ghi được dữ liệu trường B.

---

## 3. Số đo thật

| | Trường 25 lớp | Sau sáp nhập 60 lớp |
|---|---|---|
| Quy mô | 35 GV · 265 dòng phân công · 710 tiết | 86 GV · 630 dòng · 1.698 tiết |
| **Một bản lưu TKB** (jsonb) | **38,9 KB** | **83,8 KB** |
| Dữ liệu nguồn (7 bảng) | 25,8 KB | 57,8 KB |
| 60 lần bấm Lưu trong mùa xếp | 2,3 MB | **4,9 MB** |

Mỗi lần bấm *Lưu* là **thêm một dòng mới**, không ghi đè — đó là chủ ý
(lịch sử phiên bản miễn phí, quay lui được). Nhưng nó cũng có nghĩa dung
lượng tăng tuyến tính theo số lần bấm, và **hiện không có gì dọn bớt**.

### Ước tính chỗ chứa (lấy trường 60 lớp làm chuẩn, 60 lần lưu mỗi mùa)

| Số trường | Phiên bản TKB | Cộng dữ liệu nguồn và các bảng khác | So với hạn 500 MB (gói miễn phí) |
|---|---|---|---|
| 10 | 49 MB | ~55 MB | thoải mái |
| 50 | 246 MB | ~275 MB | **sát trần** |
| 200 | 982 MB | ~1,1 GB | vượt, phải lên gói trả tiền |
| 1.000 | 4,9 GB | ~5,5 GB | vừa gói Pro (8 GB) |

### Băng thông

Mỗi lần mở app tải **toàn bộ dữ liệu trường** — với trường 60 lớp là
~150 KB thô, trình duyệt nhận bản nén nên thực tế ~30 KB. Ước tính:

> 100 trường × 60 giáo viên × 22 ngày × 2 lần mở/ngày × 30 KB ≈ **8 GB/tháng**

Vượt hạn 5 GB của gói miễn phí, nhưng gói Pro cho 250 GB nên còn rất xa.
Cộng thêm mã nguồn 225 KB nén — thứ này do GitHub Pages phục vụ **miễn
phí**, không tính vào băng thông Supabase, và có Service Worker cache nên
lần mở thứ hai gần như không tải lại.

### Số tài khoản

1.000 trường × 50 giáo viên = 50.000 tài khoản, đúng bằng hạn miễn phí và
bằng nửa hạn gói Pro. Không phải chỗ vướng trước tiên.

---

## 4. Bốn điểm nghẽn, xếp theo mức chặn

### 🔴 1. Phiên bản TKB không bao giờ được dọn

Chỗ chứa hết trước mọi thứ khác, và hết vì lý do lãng phí: 59 trong 60 bản
lưu của một trường **không ai xem lại bao giờ**.

**Cách chữa (nửa ngày):** thêm vào `luu_tkb()` một câu xoá các bản cũ, giữ
lại **20 bản gần nhất + mọi bản đã công bố**. Làm ngay trong cùng hàm nên
không cần tiến trình nền, không cần lịch chạy. Sau đó bảng chuyện dung
lượng ở mục 3 giảm khoảng ba lần: 1.000 trường còn ~1,8 GB.

Không làm việc này thì mọi con số ở trên phải nhân với số mùa xếp — năm
thứ ba là gấp ba.

### 🟠 2. Giáo viên tải cả kho dữ liệu trường chỉ để xem lịch của mình

`taiTuMayChu()` tải 14 truy vấn như nhau cho mọi vai trò. Giáo viên chỉ
cần: bản TKB đã công bố, danh sách lớp, danh sách môn, tên đồng nghiệp —
không cần bảng phân công 630 dòng, không cần `nhat_ky`, không cần
`bao_nghi` của cả trường.

Đây là ~80% băng thông của hệ thống, vì giáo viên đông gấp 20 lần cán bộ
quản lý và mở app mỗi ngày.

**Cách chữa (một ngày):** tách một nhánh `taiChoGiaoVien()` trong vùng
DULIEU. Vùng ấy vốn đã gói gọn bốn hàm nên không lan ra chỗ khác.

### 🟡 3. Chưa có tầng quản trị của nhà cung cấp

Hiện không có chỗ nào trả lời được: có bao nhiêu trường đang dùng, trường
nào còn hoạt động, trường nào hết hạn, ai đã trả tiền. RLS chặn cả chủ dự
án — muốn xem phải vào Supabase Studio, đọc bảng bằng tay.

Với 5–10 trường thì không sao. Với 50 trường thì đây là việc phải làm
trước khi thu tiền: một bảng `goi_dich_vu` (trường, hạn dùng, số lớp tối
đa) và một màn hình quản trị hệ thống.

Kèm theo: `dang_ky_truong()` hiện **không giới hạn gì** — ai có email là
tạo được trường. Đủ dùng cho giai đoạn mời từng trường một, nhưng mở công
khai thì cần ít nhất một hàng rào (mã mời cấp trường, hoặc duyệt tay).

### 🟡 4. Vận hành và hỗ trợ — chỗ vướng thật sự không nằm ở máy

Kỹ thuật chịu được 1.000 trường; **một người thì không**. Mỗi trường mới
kéo theo: hướng dẫn nhập dữ liệu, sửa lỗi Excel sai định dạng, giải thích
vì sao lớp này không xếp được, phát tài khoản cho 50 thầy cô.

Kinh nghiệm từ chính Diễn Liên: riêng việc dọn hồ sơ trùng và phát mã đã
mất mấy buổi tối. Nhân với 50 trường là một công việc toàn thời gian.

Chỗ này không sửa bằng mã. Nó quyết định **tốc độ mở rộng**, không phải
khả năng mở rộng: 5 trường một đợt, xong đợt này mới tới đợt sau.

---

## 5. Những thứ đã kiểm và KHÔNG phải lo

- **Cô lập dữ liệu giữa các trường** — RLS phủ kín, ba hàm `security
  definer` đều kiểm quyền đầy đủ. Đây là thứ đáng lo nhất về pháp lý và nó
  đã chắc.
- **Không lưu dữ liệu học sinh** — lợi thế pháp lý lớn, giữ nguyên.
- **Nhật ký không phình** — chỉ ghi metadata nhỏ (`{version: 12}`), không
  ghi kèm bản TKB cũ.
- **Mọi truy vấn danh sách đều có `limit`** — không có chỗ nào lỡ tay kéo
  về cả bảng.
- **Tốc độ thuật toán** — 3,7 giây cho 60 lớp, và chạy ở máy người dùng
  nên không đội lên khi thêm trường.
- **Mã nguồn 225 KB nén, GitHub Pages phục vụ miễn phí** — thêm bao nhiêu
  trường cũng không tốn thêm tiền hosting.

---

## 6. Kết luận

| Quy mô | Kết luận | Việc phải làm trước |
|---|---|---|
| **1–10 trường** | Chạy được **ngay hôm nay**, gói miễn phí, không sửa gì | không |
| **10–50 trường** | Khả thi, vẫn có thể ở gói miễn phí | dọn phiên bản cũ (🔴 1) |
| **50–300 trường** | Khả thi về kỹ thuật, ~25 USD/tháng | thêm 🟠 2 và 🟡 3 |
| **trên 300 trường** | Kỹ thuật vẫn chịu được; chỗ vướng là **người**, không phải máy | cần thêm người hỗ trợ |

**Điều đáng nói nhất:** không có điểm nghẽn nào cần *viết lại kiến trúc*.
Bốn việc trên cộng lại chừng **ba đến bốn ngày công**, và ba trong bốn nằm
gọn trong vùng `DULIEU` — đúng chỗ mà từ đầu dự án đã cố ý bọc lại thành
bốn hàm để Pha 2 chỉ phải sửa một nơi. Quyết định ấy nay đã trả công.

Việc gần nhất vẫn là **ngày khai giảng của một trường**, không phải chuyện
nhiều trường. Bốn việc trên chưa cái nào chen vào đường đó.

---

## Phụ lục — script đo

Số liệu mục 3 đo bằng cách nạp thẳng vùng LOGIC của `src/index.html` vào
Node rồi xếp thật, đúng cách `npm test` vẫn làm:

```js
const tkb = JSON.stringify(dongGoiTKB());        // → 38,9 KB (25 lớp) · 83,8 KB (60 lớp)
const nguon = JSON.stringify({lop, giaoVien, phanCong, diemTruong, monHoc, phong, khungGio});
```

Bộ 60 lớp dựng bằng `taoDuLieuThu()` — không dùng `Math.random` nên chạy
lại lúc nào cũng ra đúng những con số này.
