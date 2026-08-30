# Học gì từ SmartScheduler — đối chiếu và đề xuất

*30/8/2026 — đọc toàn bộ tài liệu tại `help.tinhochoanggia.com/smartscheduler/`:
mục lục đầy đủ, 3 nhóm ràng buộc, xếp · tối ưu · tinh chỉnh tự động, xếp tay,
thống kê, FAQ, blog kinh nghiệm.*

SmartScheduler là phần mềm Trường TH Diễn Liên đang dùng, và `data/truong-dien-lien.json`
chính là bản kết xuất của nó. Nó chạy offline trên máy tính, cho THCS/THPT là chủ
yếu, tiểu học là một nhánh hướng dẫn riêng. Tài liệu của họ dày và thật — viết bởi
người đã đi hỗ trợ hàng trăm trường.

---

## 1. Kết luận quan trọng nhất — ĐỪNG bê bộ ràng buộc của họ về

SmartScheduler có khoảng **30 loại ràng buộc** khai báo tay, chia ba nhóm (giáo
viên 10 · môn học 11 · nhóm môn học 8). Và chính tài liệu của họ phải nhắc đi
nhắc lại ở **cả ba trang**:

> *"Thêm quá nhiều ràng buộc sẽ giảm khả năng xếp được 100% TKB."*
> *"Nhập ràng buộc vừa đủ: thiếu thì TKB xấu, thừa thì xếp không ra."*

Đó là dấu hiệu của một thiết kế **đẩy việc cân bằng sang người dùng**. Người xếp
TKB phải tự đoán khai bao nhiêu là "vừa đủ", và khi xếp không ra thì phải tự đi
tìm ràng buộc nào mâu thuẫn — họ có hẳn một chức năng *Tinh chỉnh tự động* và
**9 câu hỏi FAQ** chỉ để gỡ chuyện đó.

App của mình đi hướng ngược lại và **nên giữ nguyên hướng ấy**: ít ràng buộc khai
tay, nhiều điểm phạt mềm tự cân, cộng 13 quy tắc kiểm khả thi chạy *trước* khi
xếp. Cán bộ quản lý tuổi 35–55 dùng điện thoại không phải là người ngồi tinh
chỉnh 30 thông số.

**Nguyên tắc chọn lọc cho toàn bộ đề xuất dưới đây:** chỉ lấy thứ nào (a) máy tự
suy được, không bắt khai thêm; hoặc (b) khai một lần rất rẻ mà giá trị lớn.

---

## 2. Bảng đối chiếu

| Việc | SmartScheduler | App mình |
|---|---|---|
| Nhập dữ liệu Excel | có, nhiều bảng | có, nhập **từng mục** (tốt hơn) |
| Kiểm khả thi TRƯỚC khi xếp | **không có** | **13 quy tắc R01–R13** ✅ hơn hẳn |
| Xếp tự động | có, ~99–100% | có, 710/710 · 1698/1698 |
| Nhiều phương án | 20 phương án lưu tay | *Xếp kỹ* GRASP tự sinh ✅ |
| Tối ưu sau khi xếp | **5 bước người dùng tự chọn** | một cục 1200ms tự chạy |
| Tinh chỉnh — gỡ ràng buộc mâu thuẫn | **có** | ❌ chưa |
| Xếp tay có gợi ý ô hợp lệ | có | có (`.o-hop` · `.o-cam`) ✅ |
| Hoàn tác | có | có (20 bước, Ctrl+Z) ✅ |
| Đa địa điểm | ràng buộc **khai tay** cho từng GV | **ràng buộc lõi**, máy tự lo ✅ |
| Lọc GV theo *tình trạng lịch* | **có** | ❌ chỉ lọc theo tên |
| Thống kê ai rảnh tại 1 thời điểm | **có** | ❌ chưa |
| Thống kê số tiết dạy (tính công) | **có** | ❌ mới có Ngày công (nghỉ) |
| Tô màu theo GV / lớp / nhóm | **có** | ❌ chỉ tô theo môn |
| Cố định tiết nghỉ cho **phòng** | **có** | ❌ chưa |
| Ràng buộc *tiết xếp liền* | có | ❌ chưa |
| Giới hạn *số môn / 1 buổi* | **có** (nhóm môn) | ❌ chưa |
| Giáo viên tự xem lịch trên điện thoại | ❌ không | **có** ✅ |
| Báo nghỉ · dạy thay trong năm học | ❌ không | **có** ✅ |
| Nhiều phân hiệu là mô hình dữ liệu | ❌ chỉ là thuộc tính | **có** ✅ |
| Kết xuất sang Website | có | không cần — mình *là* web |
| Gửi Email / Zalo OA hàng loạt | có | mới có sao chép gửi Zalo tay |

---

## 3. Bảy thứ đáng lấy, xếp theo giá trị

### ★★★ 1. Bảng "ai rảnh tiết này" — dùng suốt năm học

*Nguồn: `thong-ke/tkb/1-thoi-diem/` — thống kê số lớp · giáo viên · phòng tại
1 thời điểm, kèm **danh sách chi tiết ai có / ai không có tiết**. Tài liệu ghi rõ
hai mục đích: **tìm tiết dự giờ hợp lý cho tổ chuyên môn** và **bố trí dạy thay**.*

Đây là thứ Ban Giám hiệu cần mỗi tuần, quanh năm — đúng nhóm tính năng app mình
đã chọn làm thế mạnh (báo nghỉ · dạy thay · ngày công), mà lại đang thiếu.

**Ba câu hỏi có thật mà app hiện chưa trả lời được:**
- Họp tổ chuyên môn khối 3 vào giờ nào thì cả 5 cô cùng rảnh?
- Sáng thứ Năm tiết 2 dự giờ được lớp nào, ai đang dạy?
- Phòng Tin sáng thứ Ba tiết 3 có trống không để cho mượn?

**Làm thế nào:** lưới 8 buổi × số tiết, mỗi ô ghi `số lớp học / số GV dạy /
số phòng dùng`, bấm vào ô ra ba danh sách (đang dạy · đang rảnh · phòng trống),
lọc theo phân hiệu. **Toàn bộ suy từ `S.tkb` đã có — không thêm bảng máy chủ, không
khai thêm gì.** `ungVienThay()` đã có sẵn phần lớn logic lọc.

Công sức: **vừa** (một màn hình mới + một hàm thuần trong vùng LOGIC). Rủi ro: thấp,
không đụng thuật toán.

### ★★★ 2. Lọc giáo viên theo TÌNH TRẠNG lịch, không chỉ theo tên

*Nguồn: `tim-kiem/tim-kiem-giao-vien/` — lọc theo ca dạy, theo **dạy nhiều địa
điểm**, theo **chưa xếp xong**, theo **lịch "xấu"**, theo chủ nhiệm / kiêm nhiệm.
Và FAQ Q4: bấm phải danh sách → *"lớp/giáo viên chưa xếp xong TKB"*.*

App mình có ô tìm kiếm gõ chữ (rất tốt), nhưng câu hỏi thật của người xếp không
phải *"cô Hương đâu"* mà là ***"còn ai chưa xếp xong"*** và ***"ai đang có lịch
xấu"***. Sau sáp nhập 86 giáo viên thì cuộn tay không ra.

**Làm thế nào:** thêm dải nút lọc nhanh ở màn *Giáo viên* và *Theo giáo viên* —
`Chưa xếp đủ tiết` · `Dạy từ 2 phân hiệu` · `Có tiết trống kẹp` · `Vượt định mức` ·
`Chưa có tài khoản`. Mỗi nút là một hàm thuần đọc `S.tkb`, và **số đếm hiện ngay
trên nút** (0 thì không tô đỏ — theo luật đã có).

Công sức: **nhỏ**. Đây là thứ rẻ nhất trong cả danh sách mà dùng ngay được.

### ★★★ 3. Nói rõ VÌ SAO còn tiết chưa xếp, và gợi ý cách gỡ

*Nguồn: `soan-thao-tkb/tinh-chinh-tkb-tu-dong/` — phát hiện ràng buộc mâu thuẫn
và **gợi ý xoá**. FAQ Q8: tìm giáo viên chưa xếp xong → soi ràng buộc của người
đó → bỏ cái mâu thuẫn.*

App mình ghi danh sách "chưa xếp + lý do" nhưng dừng ở đó. Người dùng đọc *"không
còn ô hợp lệ"* thì không biết phải làm gì tiếp.

**Làm thế nào:** với mỗi tiết chưa xếp, chạy ngược ràng buộc để nói **câu hành
động**, ví dụ:
> *Cô Hương · Mỹ thuật · lớp 3B — còn 2 tiết chưa xếp.
> Cô đã kín 23/23 tiết. Bỏ 1 buổi bận (sáng thứ Tư) sẽ mở ra 4 ô.*
> *Lớp 5A — thiếu 1 tiết Tiếng Anh. Cả hai cô Tiếng Anh đều kín giờ này;
> mở thêm 1 ô chiều thứ Ba cho khối 5 sẽ đủ chỗ.*

Đây là **cùng một triết lý với R01–R13** — chỉ khác là chạy *sau* khi xếp thay vì
trước. Và nó là điểm bán hàng: *"chỉ rõ chỗ cần điều chỉnh"* đã ghi trong định vị
sản phẩm, hiện mới làm được một nửa.

Công sức: **vừa–lớn**. Nên làm **sau khai giảng**.

### ★★ 4. Cho người dùng chọn ƯU TIÊN khi tối ưu

*Nguồn: `soan-thao-tkb/toi-uu-tkb-tu-dong/` — 3 tiêu chí (**rải đều số tiết/buổi** ·
**dồn buổi dạy/tuần để giáo viên có thêm ngày nghỉ** · **dồn tiết dạy/buổi để bớt
tiết trống**), chạy theo 5 bước, và ghi rõ: *"bỏ qua bước 2–3 nếu muốn rải đều
toàn tuần mà không để giáo viên nghỉ quá 1 ngày/tuần"*.*

Điểm tinh hoa thật sự nằm ở câu lưu ý đó: **rải đều** và **dồn ngày nghỉ** là hai
mục tiêu **xung đột nhau**, và họ để nhà trường quyết chứ không tự quyết hộ. App
mình đang tự quyết: `diemGV()` cộng `số buổi × 4` — tức là *hơi* nghiêng về dồn
buổi, nhưng trọng số quá nhẹ so với đổi phân hiệu (60) nên gần như không có tác dụng.

Và mình đang **dồn theo BUỔI, không theo NGÀY** — nên một giáo viên dạy 6 buổi rải
khắp 5 ngày vẫn phải đến trường cả 5 ngày. Với giáo viên bộ môn ít tiết (Mỹ thuật,
Đạo đức, Tin, Tiếng Anh) dạy liên phân hiệu, **một ngày nghỉ trọn là phúc lợi rất
thật** — họ đỡ một lần đi xe mấy cây số.

**Làm thế nào:** thêm vào `diemGV()` một khoản phạt theo **số NGÀY phải đến trường**
(không phải số buổi), và một ô chọn ở màn *Xếp*:
`Rải đều cả tuần` · `Gom để giáo viên có ngày nghỉ` · `Bớt tiết trống` (mặc định
cân bằng như hiện nay).

⚠️ **Đụng thuật toán → theo đúng ghi chú trong CLAUDE.md, để SAU khai giảng**, và
phải đo bằng `npm run kiemdinh` trước/sau. Gộp chung một đợt với việc *"dừng theo
số phép thử thay vì theo đồng hồ"* đang nằm trong danh sách việc.

### ★★ 5. Giới hạn số MÔN trong một buổi — rất hợp tiểu học

*Nguồn: `rang-buoc-tkb/yeu-cau-cua-nhom-mon-hoc/` — *"giới hạn số môn học/1 buổi,
giúp học sinh tập trung và giảm tải"* và *"tránh trong 1 buổi học sinh phải học
tất cả 5 tiết là các môn nặng"*.*

Học sinh lớp 2 mà một buổi 4 tiết là 4 môn khác nhau thì phải mang 4 bộ sách vở.
Đây là ràng buộc **lấy học sinh làm trung tâm** — đúng tinh thần mà chính tài liệu
của họ nói là điểm khác biệt của tiểu học so với THCS.

App mình đã phạt *dồn cùng môn trong ngày* (`cungNgay × 55` với môn thường) — tức
đang đẩy theo **hướng ngược lại**, làm số môn mỗi buổi *tăng*. Cần cân lại: phạt
nhẹ khi một buổi có quá nhiều môn khác nhau.

**Làm thế nào:** một khoản trong `diemLop()`, không khai báo gì thêm. ⚠️ Nhưng nó
đánh nhau với khoản `cungNgay` sẵn có — **phải đo, không chỉnh mù** (CLAUDE.md đã
ghi: chỉnh mù trọng số từng thất bại hai lần). Để **sau khai giảng**.

### ★★ 6. Tô màu lưới theo GIÁO VIÊN hoặc PHÂN HIỆU, không chỉ theo môn

*Nguồn: `ho-tro-soan-thao-tkb/to-mau-tkb/` — tô theo lớp · giáo viên · môn · phòng,
hoặc theo **nhóm**.*

Lưới mình tô theo môn (đẹp, đã chốt bảng màu pastel). Nhưng khi soi *"cô Hương
tuần này chạy phân hiệu thế nào"* trên lưới 25 cột thì mắt không lần ra được.

**Làm thế nào:** một ô chọn nhỏ trên lưới — `Tô theo: Môn ▾ / Giáo viên / Phân hiệu`.
Chọn *Giáo viên* rồi gõ tên thì mọi ô của người đó **sáng lên, phần còn lại mờ đi**.
Rẻ, thuần CSS + một lớp `.o-mo`, không đụng dữ liệu.

Đặc biệt hợp bài toán đa phân hiệu: tô theo phân hiệu là **nhìn phát ra ngay** ai
đang phải nhảy điểm giữa buổi.

Công sức: **nhỏ**.

### ★ 7. Cố định tiết nghỉ cho PHÒNG, và ràng buộc *tiết xếp liền*

*Nguồn: `rang-buoc-tkb/co-dinh-tiet-nghi/` (áp cho **cả 4 đối tượng**: lớp · giáo
viên · môn · **phòng**) và `yeu-cau-cua-mon-hoc/` mục *tiết học xếp liền*.*

- **Phòng nghỉ:** phòng Tin bị mượn họp chiều thứ Sáu, phòng chức năng đang sửa.
  App có `S.gvNghi` cho giáo viên, chưa có tương đương cho phòng. Rẻ, cùng khuôn
  dữ liệu, không đụng thuật toán ngoài một dòng trong `datDuoc()`.
- **Tiết xếp liền:** Tiếng Việt lớp 1 nhiều trường xếp 2 tiết liền. App hiện *phạt*
  khi quá 2 tiết liên tiếp, nhưng không *thưởng* khi đúng 2 tiết liền. Cân nhắc,
  ưu tiên thấp vì tiểu học Diễn Liên chưa nêu nhu cầu này.

---

## 4. Năm thứ CỐ Ý KHÔNG lấy

| Của họ | Vì sao không lấy |
|---|---|
| **30 loại ràng buộc khai tay** | xem mục 1 — trái hẳn định vị sản phẩm |
| **Phân công giảng dạy ghép** (2 lớp học chung 1 tiết) | tiểu học Diễn Liên không có lớp ghép; chỉ cần nếu sau này có trường vùng cao. Ghi nhận, chưa làm |
| **Kết xuất TKB sang Website** | app mình *đã là* web — bước này của họ tồn tại vì họ chạy offline |
| **Gửi Zalo OA hàng loạt** | Zalo OA cần đăng ký doanh nghiệp và có phí; giáo viên mình mở app là thấy lịch, không cần đẩy tin |
| **20 phương án lưu tay** | *Xếp kỹ* của mình tự sinh nhiều phương án và tự giữ bản tốt nhất — tự động hơn. **Nhưng** một ý của họ đáng ghi nhận: khi lưu phương án họ lưu **kèm toàn bộ ràng buộc**, còn `tkb_phien_ban` của mình chỉ lưu lưới. Phục hồi bản cũ sau khi buổi bận đã đổi thì lưới không còn khớp dữ liệu nguồn. Chưa gấp, nhưng nên biết |

---

## 5. Đề xuất lộ trình

**Đợt 1 — làm được ngay, không đụng thuật toán** *(mỗi việc nửa buổi đến một buổi)*
1. Lọc giáo viên theo tình trạng lịch (★★★ mục 2)
2. Tô màu lưới theo giáo viên / phân hiệu (★★ mục 6)
3. Bảng "ai rảnh tiết này" (★★★ mục 1)

Cả ba đều **chỉ đọc `S.tkb`**, không thêm bảng máy chủ, không đụng `xepTuDong()`.
An toàn tuyệt đối với năm trường đang chạy thật.

**Đợt 2 — sau khai giảng, có đo đạc**
4. Chọn ưu tiên khi tối ưu + phạt theo số NGÀY đến trường (★★ mục 4)
5. Giới hạn số môn/buổi (★★ mục 5)
6. Cố định tiết nghỉ cho phòng (★ mục 7)
7. **Bớt buổi 4 tiết nặng liền một mạch** — xem chi tiết và số đo ở mục 9
   của `CLAUDE.md`. Tóm tắt: cấm Toán–TV kề nhau là bất khả thi (hai môn
   chiếm 46% số ô, lớp 1 là 56%); thứ đáng sửa là **24 buổi có 4 tiết nặng
   liền mạch**, giới hạn chuỗi ≤ 3. Phải là điểm phạt **mềm** và nằm sau
   một **cờ mặc định TẮT** — nhà trường còn chỉnh tay sau khi xếp.

Gộp chung đợt với việc *"dừng tối ưu theo số phép thử thay vì theo đồng hồ"* đã
nằm trong danh sách — cùng vùng mã, cùng cần `npm run kiemdinh` đo trước/sau.

**Đợt 3 — khi có thời gian**
7. Chẩn đoán "vì sao còn tiết chưa xếp" + gợi ý gỡ (★★★ mục 3)

Xếp cuối không phải vì ít giá trị — nó là mục **giá trị cao nhất về lâu dài** —
mà vì tốn công nhất và cần thuật toán đã ổn định.

---

## 6. Điều nên tự tin

Đọc hết tài liệu của họ thì thấy rõ: SmartScheduler mạnh ở **bề rộng ràng buộc**
và **thống kê**, yếu ở **chẩn đoán trước khi xếp**, và **không có gì** cho hai
nhóm người dùng đông nhất — giáo viên xem lịch, và Ban Giám hiệu điều hành trong
năm học.

Ba thứ app mình có mà họ không có, và không dễ có: **R01–R13 chạy trước khi xếp**,
**giáo viên tự xem lịch trên điện thoại**, **báo nghỉ · dạy thay · ngày công**.
Đó là chỗ nên tiếp tục đào sâu, chứ không phải đi đuổi theo 30 ràng buộc.
