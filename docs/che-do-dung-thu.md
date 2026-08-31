# Chế độ dùng thử cho trường mới — báo cáo và đề xuất

*31/8/2026. Chủ dự án hỏi: muốn giới thiệu App cho nhiều trường, chỉ cho họ
dùng thử, dữ liệu lưu trong máy họ — "sợ quá tải Supabase". Cho họ nhập phân
hiệu, lớp, giáo viên, phân công, chạy các ràng buộc và xếp thử, không có chức
năng in.*

---

## Kết luận trước

1. **Nỗi lo quá tải không có cơ sở** — đo được, xem bảng dưới. 500 trường dùng
   thử chiếm **6,2%** hạn mức miễn phí.
2. **Nhưng vẫn nên cho chạy trong máy họ** — vì ba lý do khác, mạnh hơn nhiều,
   mà lý do đứng đầu là **pháp lý**, không phải dung lượng.
3. **Đề nghị xem lại một điểm:** đừng chặn chức năng in. Đóng **dấu chìm** thì
   vừa giữ được giá trị bản thương mại, vừa không cắt mất đúng thứ làm nhà
   trường gật đầu.

---

## 1. Quá tải: đã đo, không phải vấn đề

Đo bằng chính bộ dữ liệu thật, JSON thuần chưa nén:

| Quy mô trường | Dữ liệu nguồn | Lưới TKB | **Tổng** |
|---|---|---|---|
| 25 lớp · 35 GV · 710 tiết | 26 KB | 38 KB | **64 KB** |
| 60 lớp · 86 GV · 1.698 tiết | 58 KB | 83 KB | **141 KB** |

Nếu để trên máy chủ, gói miễn phí Supabase 500 MB:

| Số trường dùng thử | Chỗ chiếm | Tỉ lệ hạn mức |
|---|---|---|
| 50 | 3 MB | 0,6% |
| 100 | 6 MB | 1,2% |
| 300 | 19 MB | 3,7% |
| **500** | **31 MB** | **6,2%** |

Băng thông cũng không phải nút thắt: một lần mở app của cán bộ quản lý tốn
**166 KB** (đã siết ngày 18/8), nên 500 trường × 20 lần mở/tháng ≈ **1,7 GB**,
trong khi hạn là 5 GB. Và `don_du_lieu_cu()` đã giữ 10 phiên bản gần nhất nên
số bản lưu không nhân lên vô hạn.

**Vậy nếu chỉ vì sợ chật thì không cần chế độ dùng thử.** Lý do thật nằm ở chỗ
khác.

---

## 2. Ba lý do thật — và lý do đầu là pháp lý

### a) Dữ liệu cá nhân của người ngoài (quan trọng nhất)

Một trường dùng thử nhập **80 họ tên và Gmail giáo viên thật** vào cơ sở dữ
liệu của chủ dự án. Từ giây đó, chủ dự án nắm dữ liệu cá nhân của 80 người mà
mình **chưa có thoả thuận nào** với đơn vị chủ quản của họ — trong khi Nghị
định **13/2023/NĐ-CP** đã là căn cứ khiến chính dự án này phải mã hoá bản sao
lưu và thay họ tên thật trong bộ dữ liệu mẫu.

Nặng hơn: trường thử xong bỏ đi thì dữ liệu vẫn nằm lại, và **bản sao lưu hằng
đêm giữ 90 ngày cũng mang theo**. Xoá một trường khỏi cơ sở dữ liệu thì dễ,
gỡ khỏi 90 bản dump thì không.

**Dữ liệu chạy trong máy nhà trường thì rủi ro này bằng không** — chủ dự án
không bao giờ chạm vào nó.

### b) Khâu duyệt là nút cổ chai, không phải máy chủ

Hiện mỗi trường đăng ký phải chờ chủ dự án **duyệt tay và cấp mã 5 chữ số**,
mà thông báo hai chiều thì vẫn đang nằm ở mục *việc cần làm* — cả hai đầu đều
phải tự mở app xem. Giới thiệu cho "nhiều trường" nghĩa là mỗi trường một lần
duyệt, và người duyệt là một người.

Chế độ dùng thử **không cần đăng ký, không cần duyệt** là bỏ hẳn nút cổ chai
ấy. Chỉ trường nào quyết dùng thật mới đi qua khâu duyệt.

### c) Dữ liệu rác lẫn với dữ liệu thật

`dang_ky_truong()` đã chặn quá 3 đơn chờ duyệt cùng một số điện thoại, nhưng
trường thử xong bỏ đi vẫn để lại một dòng `dang_dung` trong danh sách chủ hệ
thống, lẫn với các trường đang chạy thật. Sau vài chục lượt giới thiệu thì
danh sách ấy không còn đọc được nữa.

---

## 3. Đề xuất: chế độ **Dùng thử**

Phần lớn cơ chế **đã có sẵn**, không phải dựng từ đầu:

| Đã có | Dùng vào việc gì |
|---|---|
| `KHO.nguon` ba giá trị `'may-chu' / 'tep-mau' / 'nhung'` | thêm giá trị `'thu'` |
| `luuTKB()` từ chối khi `KHO.nguon !== 'may-chu'` | chốt chặn không cho ghi lên máy chủ — **đã có, không phải viết** |
| `veTheDemo()` — thẻ nổi "Đang xem bản demo" | khuôn sẵn cho dải "Bản dùng thử" |
| `localStorage` (đang giữ vé đăng nhập) | chỗ lưu |
| Xuất / nhập Excel cho dữ liệu nguồn | đường mang dữ liệu ra vào |

**Mở hết** phần khai báo, ràng buộc, kiểm tra khả thi và xếp lịch — đó chính là
thứ cần bán. Không cắt số lớp, không cắt số giáo viên.

⚠️ **Nút vào chế độ phải NHỎ HƠN nút Đăng nhập.** Bài học đã trả giá: nút
*Đăng ký trường mới* từng đặt ngang hàng, cùng cỡ với *Đăng nhập*, và chính
chủ dự án bấm nhầm, tạo ra một tài khoản mồ côi.

---

## 4. Ba điều phải làm đúng, không thì phản tác dụng

### a) ⚠️ Mất dữ liệu là mất khách

Một trường bỏ ba tiếng nhập 47 lớp rồi xoá cache trình duyệt là **mất sạch**.
Ấn tượng đầu tiên ấy tệ hơn hẳn việc không cho dùng thử.

Bắt buộc phải có:

- Nút **Tải bản sao về máy** (một tệp `.json`) và **Mở lại từ tệp**. Đây là
  thứ duy nhất cứu được người dùng, và app đã có sẵn đường xuất/nhập nên phần
  lớn công việc đã xong.
- Dải nhắc **thường trực**, không phải hộp thoại một lần: *"Bản dùng thử —
  dữ liệu chỉ nằm trên máy này. Tải bản sao về để khỏi mất."*
- `beforeunload` đã chặn khi rời trang — dùng lại nguyên.

Về chỗ chứa: một trường 60 lớp chiếm **141 KB**, tức **2,7%** của hạn 5 MB mà
`localStorage` cho. Rộng rãi, không cần tới IndexedDB.

### b) ⚠️ Đừng chặn in — đóng dấu chìm

Đây là chỗ em xin nói ngược lại ý chủ dự án.

Bản in **chính là thứ nhà trường dùng để đánh giá phần mềm**. Họ cần nhìn tờ
thời khóa biểu cuối cùng, cầm lên xem có dùng được không. Chặn in là chặn đúng
cái làm họ gật đầu — họ sẽ kết luận "chưa biết nó in ra thế nào" và bỏ.

Cách vừa giữ được giá trị bản thương mại vừa không cắt mất giá trị dùng thử:
**đóng dấu chìm `BẢN DÙNG THỬ` chéo trang** trên mọi bản in, tệp Word và tệp
Excel xuất ra. Nhà trường thấy đủ mọi thứ, nhưng không mang bản ấy đi dán bảng
tin hay nộp báo cáo được.

Việc này rẻ: `CSS_BAN_IN` vốn đã là **một nguồn duy nhất** cho cả hộp in của
trình duyệt lẫn tệp Word, nên thêm dấu chìm là sửa một chỗ.

### c) ⚠️ Đường nâng cấp phải là MỘT cú bấm

Trường thử xong ưng ý thì bấm **Đăng ký trường** ngay trong app, và toàn bộ dữ
liệu đang có trong máy được đẩy lên máy chủ sau khi duyệt — **không phải nhập
lại từ đầu**.

Bắt nhập lại là toàn bộ công sức dùng thử thành vô ích, và gần như chắc chắn
họ bỏ ở đúng bước ấy. Đây là chỗ quyết định tỉ lệ chuyển đổi, và nó rẻ: đường
ghi `ghiDuLieuNguon()` đã có sẵn, chỉ cần gọi sau khi trường được duyệt.

---

## 5. Về quy ước "không dùng localStorage cho dữ liệu nhà trường"

`CLAUDE.md` mục 2 cấm điều này, ngoại lệ duy nhất là vé đăng nhập. Cần nói rõ
vì sao chế độ dùng thử **không phá** quy ước ấy.

Hai lý do của quy ước là: (1) không cô lập được dữ liệu giữa các trường, và
(2) hai phó hiệu trưởng lưu cùng lúc sẽ ghi đè nhau. **Cả hai đều không tồn
tại ở bản dùng thử**: một máy, một người, không có máy chủ để mà ghi đè, và
không có trường thứ hai để mà lẫn.

Đề nghị sửa câu ấy trong `CLAUDE.md` thành *"ngoại lệ: vé đăng nhập, và dữ
liệu của chế độ dùng thử"* — kèm lý do, để người sửa sau không tưởng là ai đó
đã phá luật.

---

## 6. Việc phải viết

| Việc | Cỡ | Ghi chú |
|---|---|---|
| `KHO.nguon='thu'` + đọc/ghi `localStorage` | nhỏ | chốt chặn ghi máy chủ đã có |
| Nút vào chế độ + dải nhắc thường trực | nhỏ | khuôn `veTheDemo()` |
| Tải bản sao `.json` / mở lại từ tệp | vừa | phần lớn dùng lại đường xuất nhập |
| Dấu chìm bản in | nhỏ | `CSS_BAN_IN` là một nguồn duy nhất |
| Đẩy dữ liệu lên khi đăng ký thật | vừa | gọi `ghiDuLieuNguon()` sau khi duyệt |
| Phép thử | vừa | thêm vào `npm run soi-nhap` — bộ soi của trường mới tinh |

Không đụng thuật toán, không đụng cơ sở dữ liệu, không thêm bảng nào.

---

## 7. Ba điều KHÔNG nên làm

- **Đừng cho bản dùng thử ghi lên Supabase "cho tiện rồi tính sau".** Dữ liệu
  cá nhân vào rồi thì gỡ ra là việc khó, và bản sao lưu 90 ngày đã mang theo.
- **Đừng giới hạn bằng thời gian** (kiểu 30 ngày) ở bản chạy trong máy. Không
  cưỡng chế được — người dùng chỉnh đồng hồ máy là xong — mà lại có ngày làm
  mất dữ liệu của người ta. Dấu chìm là hàng rào đúng.
- **Đừng cắt quy mô** (kiểu chỉ cho 5 lớp). Câu hỏi thật của nhà trường là
  *"app có xếp nổi 47 lớp của tôi không"*; cắt quy mô là không trả lời được
  đúng câu ấy, mà đó lại là lý do họ tìm tới phần mềm.
