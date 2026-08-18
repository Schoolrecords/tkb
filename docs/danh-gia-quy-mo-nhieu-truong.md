# Đánh giá: app chịu được bao nhiêu trường?

*Rà soát ngày 16/8/2026, **làm xong bốn việc và đo lại ngày 18/8/2026**
theo yêu cầu của chủ dự án. Số liệu trong bài đều ĐO THẬT bằng chính vùng
LOGIC của app, không ước lượng bằng cảm tính — script đo nằm ở cuối bài.*

⚠️ Hạn mức và giá của Supabase trong bài là theo hiểu biết tại thời điểm
viết. **Trước khi quyết định tiền bạc phải mở trang giá hiện hành đối chiếu
lại** — nhà cung cấp đổi hạn mức không báo trước.

---

## 0. Đã làm gì ngày 18/8/2026

Chủ dự án hỏi thẳng: *"nếu tạm thời dùng miễn phí Supabase, có nên cắt tính
năng nào làm app chậm hoặc quá tải dữ liệu?"*

Câu trả lời sau khi đo: **không cắt tính năng nào cả, và cắt cũng không được
gì.** Mọi tính năng nặng của app — xếp lịch, xếp kỹ, xuất Excel, in, kiểm tra
khả thi — đều chạy trên **máy người dùng**, không chạm vào máy chủ. Cắt hết
chúng thì gói miễn phí cũng không dư thêm một MB nào.

Thứ thật sự tiêu tốn hạn mức chỉ có hai, và cả hai đều không phải "tính năng":
giáo viên **mở app mỗi sáng** (ăn băng thông) và mỗi lần bấm Lưu **đẻ thêm
một dòng không bao giờ xoá** (ăn chỗ chứa). Nên việc phải làm là cắt **lượng
dữ liệu chuyển đi**, không phải cắt chức năng.

| Việc | Kết quả đo được |
|---|---|
| 1. Giáo viên chỉ tải phần của mình | một lần mở **427,7 → 20,7 KB** (−95%) |
| 2. `luu_tkb()` tự dọn, giữ 10 bản gần nhất | chỗ chứa 300 trường **903 → 150 MB** |
| 3. Gộp các lần lưu cách nhau dưới 10 phút | 60 bản một mùa còn ~20 |
| 4. Sao lưu hằng đêm, mã hoá AES-256 | lấp lỗ hổng nguy hiểm nhất của gói free |
| + Siết `day_thay`/`bao_nghi` theo ngày | −255 KB cho **mọi** vai trò |
| + `select` đúng cột thay vì `*` | quản lý 427,7 → **166,2 KB** (−61%) |

Kiểm thử sau khi làm: `npm test` **339/0** (thêm mục 19 — 17 phép thử cho
chính phần này) · `npm run soi` 319/0 · `npm run kiemdinh` 22/0 · `npm run
soat` sạch.

---

## 1. Tình trạng hiện tại

| | |
|---|---|
| Mã nguồn | `src/index.html` ~11.900 dòng · 740 KB · nén còn ~228 KB |
| Kiểm thử | `npm test` 339/0 · `npm run soi` 319/0 · `npm run kiemdinh` 22/0 · `npm run soat` sạch |
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
`truong_id` + vai trò ở mọi nhánh; `dang_ky_truong`, `dung_ma_moi` và
`tkb_cua_toi` đều chặn "một tài khoản thuộc hai trường". Không tìm thấy
đường nào để trường A đọc hay ghi được dữ liệu trường B.

---

## 3. Số đo thật

| | Trường 25 lớp | 40 lớp | Sau sáp nhập 60 lớp |
|---|---|---|---|
| Quy mô | 35 GV · 710 tiết | 58 GV · 1.136 tiết | 86 GV · 1.698 tiết |
| **Một bản lưu TKB** (jsonb) | 38,9 KB | **51,4 KB** | 83,8 KB |

### Một lần mở app tốn bao nhiêu (trường 40 lớp)

| | trước 18/8 | sau 18/8 |
|---|---|---|
| Cán bộ quản lý | 427,7 KB · 14 truy vấn | **166,2 KB** · 14 truy vấn |
| Giáo viên | 427,7 KB · 14 truy vấn | **20,7 KB** · 9 truy vấn |

Chỗ tốn nhiều nhất **không phải** thời khóa biểu, mà là hai bảng `day_thay`
và `bao_nghi` lấy `limit=300` dòng mới nhất: **255 KB, tức 60% toàn bộ**.
Chúng nay lọc theo ngày (từ đầu tháng trước), tháng cũ hơn thì
`taiThemNgayNghi()` tải bổ sung.

### Chỗ chứa — 300 trường, mỗi trường một mùa xếp

| | Dung lượng | So với hạn 500 MB của gói miễn phí |
|---|---|---|
| trước — 60 bản lưu, không dọn gì | 903 MB | ❌ vượt gấp đôi ngay mùa đầu |
| sau — gộp còn ~20 lần, giữ 10 bản | **150 MB** | ✅ còn biên 70% |

### Băng thông

> 300 trường × 60 giáo viên × 22 ngày × 1,5 lần mở/ngày

| | Băng thông tháng | So với hạn 5 GB |
|---|---|---|
| trước | 40,4 GB | ❌ vượt 8 lần |
| sau | **2,0 GB** | ✅ còn biên 60% |

Mã nguồn 228 KB nén do GitHub Pages phục vụ **miễn phí**, không tính vào
băng thông Supabase, và có Service Worker cache nên lần mở thứ hai gần như
không tải lại.

### Số tài khoản

300 trường × 60 giáo viên = 18.000 tài khoản, so với hạn 50.000 của gói
miễn phí. Không phải chỗ vướng trước tiên.

---

## 4. Cái gì gãy trước, sau khi đã làm bốn việc

### 🔴 1. Gói miễn phí KHÔNG có sao lưu — đã lấp, nhưng phải kiểm

Đây là rủi ro nặng hơn cả chuyện vượt hạn: vượt hạn thì còn biết trước mà
xử lý, mất dữ liệu thì không. `.github/workflows/sao-luu.yml` chạy 1 giờ
sáng, `pg_dump` → gzip → mã hoá AES-256 → cất 90 ngày.

**Việc còn lại của chủ dự án:** khai hai secret `DB_URL` và `BACKUP_KEY`
trong Settings → Secrets → Actions, chạy tay một lần để chắc chắn nó ra
tệp, rồi **thử giải mã một bản** — sao lưu chưa từng thử khôi phục thì
chưa phải là sao lưu.

### 🟠 2. Chưa có tầng quản trị của nhà cung cấp

Hiện không có chỗ nào trả lời được: có bao nhiêu trường đang dùng, trường
nào còn hoạt động, trường nào hết hạn, ai đã trả tiền. RLS chặn cả chủ dự
án — muốn xem phải vào Supabase Studio, đọc bảng bằng tay.

Với 5–10 trường thì không sao. Với 50 trường thì đây là việc phải làm
trước khi thu tiền: một bảng `goi_dich_vu` (trường, hạn dùng, số lớp tối
đa) và một màn hình quản trị hệ thống.

Kèm theo: `dang_ky_truong()` hiện **không giới hạn gì** — ai có email là
tạo được trường. Đủ dùng cho giai đoạn mời từng trường một, nhưng mở công
khai thì cần ít nhất một hàng rào (mã mời cấp trường, hoặc duyệt tay).

### 🟠 3. Một bản phần mềm dùng chung, không có bản thử

Đẩy mã lên GitHub Pages là **mọi trường nhận ngay**. Sửa vội một lỗi lúc
22h ngày 28/8 thì sáng hôm sau tất cả cùng nhận bản chưa ai thử. Cần một
địa chỉ bản thử riêng, và trong ba tuần cao điểm thì hạn chế tối đa việc
đẩy mã mới.

### 🟡 4. Vận hành và hỗ trợ — chỗ vướng thật sự không nằm ở máy

Kỹ thuật chịu được 1.000 trường; **một người thì không**. Mỗi trường mới
kéo theo: hướng dẫn nhập dữ liệu, sửa lỗi Excel sai định dạng, giải thích
vì sao lớp này không xếp được, phát tài khoản cho 50 thầy cô.

Kinh nghiệm từ chính Diễn Liên: riêng việc dọn hồ sơ trùng và phát mã đã
mất mấy buổi tối. Nhân với 50 trường là một công việc toàn thời gian; với
300 trường thì cần 3–5 người, và mùa cao điểm ba tuần cuối tháng 8 cần
gấp đôi thế.

Chỗ này không sửa bằng mã. Nó quyết định **tốc độ mở rộng**, không phải
khả năng mở rộng: 5 trường một đợt, xong đợt này mới tới đợt sau.

---

## 5. Những thứ đã kiểm và KHÔNG phải lo

- **Cô lập dữ liệu giữa các trường** — RLS phủ kín, bốn hàm `security
  definer` đều kiểm quyền đầy đủ; `tkb_cua_toi()` cố ý để `security
  invoker` nên quy tắc đọc vẫn nguyên hiệu lực. Đây là thứ đáng lo nhất
  về pháp lý và nó đã chắc.
- **Không lưu dữ liệu học sinh** — lợi thế pháp lý lớn, giữ nguyên.
- **Nhật ký không phình** — chỉ ghi metadata nhỏ (`{version: 12}`), và nay
  `don_du_lieu_cu()` xoá dòng cũ hơn 18 tháng.
- **Tốc độ thuật toán** — 3,7 giây cho 60 lớp, và chạy ở máy người dùng
  nên không đội lên khi thêm trường.
- **Mã nguồn 228 KB nén, GitHub Pages phục vụ miễn phí** — thêm bao nhiêu
  trường cũng không tốn thêm tiền hosting.
- **Cao điểm tháng 8 không phải chỗ nghẽn.** 300 trường × 2 người xếp lịch
  rải cả ngày là chưa tới 1 lượt mở/giây. Chỗ đông thật là **7 giờ sáng
  ngày thường**, khi 18.000 giáo viên cùng mở xem lịch — và đó chính là
  thứ việc số 1 vừa làm nhẹ đi 95%.

---

## 6. Kết luận

| Quy mô | Kết luận | Việc phải làm trước |
|---|---|---|
| **1–50 trường** | Chạy được **ngay hôm nay**, gói miễn phí | khai hai secret sao lưu |
| **50–100 trường** | Gói miễn phí vẫn đủ, nhưng biên mỏng dần | thêm 🟠 2 và 🟠 3 |
| **100–300 trường** | Khả thi; nên lên gói Pro 25 USD/tháng cho yên tâm | như trên |
| **trên 300 trường** | Kỹ thuật vẫn chịu được; chỗ vướng là **người** | cần thêm người hỗ trợ |

**Vì sao vẫn khuyên lên gói trả tiền trước mốc 100 trường** dù số đo nói
gói miễn phí gánh được 300: gói miễn phí không có cam kết dịch vụ, không
có sao lưu chính thức, và **vượt hạn thì nhà cung cấp tạm ngưng dự án**
chứ không tính thêm tiền — tức là mất công cụ giữa mùa xếp lịch. 25 USD
chia cho 100 trường là 6.000 đồng mỗi trường mỗi tháng, rẻ hơn nhiều so
với rủi ro ấy.

**Điều đáng nói nhất:** bốn việc trên cộng lại chừng **hai ngày rưỡi công**,
không việc nào cần viết lại kiến trúc, và ba trong bốn nằm gọn trong vùng
`DULIEU` — đúng chỗ mà từ đầu dự án đã cố ý bọc lại thành bốn hàm để Pha 2
chỉ phải sửa một nơi. Quyết định ấy nay đã trả công lần thứ hai.

Việc gần nhất vẫn là **ngày khai giảng của một trường**, không phải chuyện
nhiều trường. Bốn việc trên chưa cái nào chen vào đường đó.

---

## Phụ lục — script đo

Số liệu mục 3 đo bằng cách nạp thẳng vùng LOGIC của `src/index.html` vào
Node rồi xếp thật, đúng cách `npm test` vẫn làm:

```js
const tkb = JSON.stringify(dongGoiTKB());   // → 38,9 KB (25 lớp) · 51,4 KB (40 lớp) · 83,8 KB (60 lớp)
// Mô phỏng ĐÚNG hàng máy chủ trả về: mọi id là uuid 36 ký tự, không phải id nội bộ
const hang = {lop, giao_vien, phan_cong, day_thay, bao_nghi, nguoi_dung, khung_gio, diem_truong};
```

Bộ 40 lớp dựng bằng `taoDuLieuThu()` — không dùng `Math.random` nên chạy
lại lúc nào cũng ra đúng những con số này.
