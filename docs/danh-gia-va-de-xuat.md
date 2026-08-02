# Đánh giá phần mềm và đề xuất phát triển

Rà soát: 31/7/2026 · Thi công: 1/8/2026
Bản mã: `src/index.html` · `npm test`: **192 đạt / 0 hỏng** · `npm run soi`: **95 đạt / 0 hỏng**
Mốc thuật toán giữ nguyên: **710/710 tiết**, 0 xung đột.

---

## Phần 0 — Dựng lại quy trình theo trình tự làm việc (1/8/2026)

Đối chiếu với **SmartScheduler 7.2** mà Trường TH Diễn Liên đang dùng
(<https://help.tinhochoanggia.com/smartscheduler/>). Phần mềm đó bắt người dùng
đi tuần tự **chín bước nhập dữ liệu** → ràng buộc → soạn thảo → thống kê → in.
Nhìn vào là biết mình đang ở đâu.

### Bốn chỗ lệch đã tìm ra

**1. Thứ tự ngược hẳn.** Thanh bên đang là *Điều hành → Thời khóa biểu →
Trợ giúp → **Dữ liệu nguồn***. Việc phải làm **đầu tiên** nằm ở **nhóm cuối
cùng**, sau cả mục Trợ giúp. Trường mới mở app lên rơi vào *Bảng điều hành*
toàn số 0, không một dòng chỉ dẫn.

**2. Thiếu năm màn hình khai báo.** Không có Thông tin trường, **không có màn
hình Lớp học nào cả**, không có Môn học, không có Phòng học; Giáo viên chỉ là
bảng thống kê không sửa được; Phân công chỉ sửa được số tiết, không thêm/xoá
dòng. Hệ quả nặng nhất: **mọi con đường vào dữ liệu đều phải qua tệp Excel.**
Trường Diễn Liên thì ổn vì có sẵn tệp kết xuất SmartScheduler — nhưng một
trường mới đăng ký, không có tệp đó, thì *không có cách nào khai báo*.

**3. Thiếu hai sản phẩm.** Có theo lớp, theo giáo viên; **không có toàn trường**
(tờ dán bảng tin ngày khai giảng) và **không có theo khối**.

**4. Danh mục môn nằm cứng trong mã.** `MON_LOP`, `MON_NANG`, `MON_NHE`,
`CHUAN_KHOI` đều là hằng số. Trường muốn thêm một môn tự chọn là phải sửa mã.

### Đã làm

| Việc | Kết quả |
|---|---|
| Thanh bên xếp theo trình tự | `TỔNG QUAN → BƯỚC 1 (9 mục) → BƯỚC 2 → BƯỚC 3 → TRỢ GIÚP` |
| Thanh tiến trình ba bước | ở Bảng điều hành; mỗi việc thiếu bấm được để tới thẳng chỗ làm |
| Dải điều hướng từng màn hình | `dieuHuongBuoc()` — *‹ trước* / *tiếp theo ›*, `CHUOI_BUOC` là nguồn sự thật |
| Năm màn hình khai báo mới | Thông tin trường · Lớp học · Môn học · Phòng học *(Khối gộp vào Khung giờ)* |
| Tạo lớp hàng loạt | khai "khối 1 có 5 lớp" → 1A–1E, mã tự mang tiền tố điểm trường |
| Phân công nhanh | chọn giáo viên → tích các lớp; số tiết lấy đúng chuẩn từng khối |
| Thêm/sửa/xoá | lớp · giáo viên · môn · phòng · dòng phân công, ngay trong app |
| Hai bảng dữ liệu mới | `mon_hoc`, `phong` — `db/mon-hoc-phong.sql` |
| Định mức theo từng người | `dinhMucCua(g)`; R01 · R08 tôn trọng con số riêng |
| Hai sản phẩm mới | TKB toàn trường · TKB theo khối, kèm bản in A3 và trang tính Excel riêng mỗi khối |

**Điều quan trọng nhất:** trường mới không có tệp Excel nay khai báo được từ
đầu tới cuối. Nút *Nhập dữ liệu Excel* vẫn còn, nhưng thành **đường tắt** cho
trường đã có sẵn dữ liệu, không còn là con đường duy nhất.

### Ba chỗ cố ý giữ nguyên

- **Không bê nguyên bố cục ba bảng cùng lúc của SmartScheduler** (TKB lớp +
  TKB giáo viên + TKB phòng ở đáy màn hình). Đẹp trên màn hình 24 inch, không
  dùng được trên điện thoại — mà phó hiệu trưởng phụ trách điểm trường gần như
  chỉ dùng điện thoại. Lối thay thế đã có sẵn: chạm một tiết thì mọi ô đặt được
  sáng xanh, ô vướng ràng buộc mờ đi.
- **Phòng chức năng vẫn chỉ là cảnh báo R10**, chưa thành ràng buộc cứng trong
  `datDuoc()`. Nay đã có bảng `phong` và hàm `coPhong()` nên việc đó rẻ đi
  nhiều, nhưng nó đụng vào thuật toán đang đạt 710/710 nên để riêng một lần.
- **Không thêm bước "Ràng buộc TKB" riêng** như SmartScheduler. Sáu ràng buộc
  mềm hiện tại đã đúng và đủ; bày ra một màn hình chỉnh trọng số là mở đường
  cho người dùng tự làm hỏng kết quả.

---

## Phần I — Đã làm xong ngày 1/8/2026

Sáu việc thuộc Mốc 1 (điều kiện để chạy thật ngày khai giảng). Mỗi việc đều
kèm phép thử; không việc nào làm tụt các mốc cũ (vẫn 710/710 tiết, 0 xung đột).

### 1. Ba điểm trường được phép cùng có lớp "1A"

**Vấn đề:** bảng `lop` khoá duy nhất theo `(truong_id, ten)`, và khi ghi lên
máy chủ phần mềm dò lớp bằng **tên**, dò chủ nhiệm cũng bằng tên lớp. Cột
`Ma_lop` trong tệp Excel bị bỏ đi sau khi soát lỗi. Gộp ba trường vào một tệp
là bộ soát báo `Ten_lop "1A" xuất hiện 3 lần` — không nhập được, phải đổi tên
lớp thủ công ngay trong Excel và sửa kéo theo cả cột `Chu_nhiem`.

**Đã sửa:**
- Bảng `lop` thêm cột `ma_lop`, khoá duy nhất chuyển sang `(truong_id, ma_lop)`.
  Cơ sở dữ liệu cũ nâng cấp bằng **`db/ma-lop.sql`** (chạy một lần).
- `giaoVien.cn` nay giữ **mã lớp** chứ không phải tên lớp. Mọi nơi dò chủ nhiệm
  đi qua ba hàm: `cnCuaLop(idLop)`, `lopCN(gv)`, `tenCN(gv)`.
- Tên lớp chỉ còn là nhãn hiển thị. Trùng tên thì `tenLopDay()` tự ghi kèm nơi
  học — *“1A · Diễn Đồng”* — trên màn hình, trong ô chọn, trong thông báo lỗi
  và trong bản xuất Excel.
- Tệp Excel: `Ten_lop` chỉ cần duy nhất **trong một điểm trường**. Cột
  `Chu_nhiem` nhận `Ma_lop`, vẫn nhận `Ten_lop` nếu tên đó chỉ trỏ một lớp;
  trùng tên thì báo đúng dòng và bảo ghi `Ma_lop`.
- Dữ liệu cũ ghi chủ nhiệm bằng tên lớp vẫn đọc được: `chuanCN()` tự đổi sang
  mã khi tên chỉ trỏ tới một lớp.

**Phép thử mới:** ba lớp cùng tên "1A" ở ba điểm trường nhập sạch lỗi, mỗi lớp
nối đúng cô chủ nhiệm của mình, xếp được đủ tiết.

### 2. Chỉnh tay dùng được trên điện thoại

**Vấn đề:** lưới chỉ có kéo thả HTML5, trong toàn bộ mã không một sự kiện cảm
ứng nào. Trên điện thoại thao tác kéo tiết **không chạy** — trong khi phó hiệu
trưởng phụ trách điểm trường chủ yếu dùng điện thoại, và việc duy nhất họ được
phép làm chính là chỉnh tiết.

**Đã làm — chạm chọn, chạm đặt:**
- Chạm vào một tiết là nó sáng lên; **mọi ô đặt được lập tức sáng xanh**, ô
  vướng ràng buộc mờ đi. Người dùng thấy trước chỗ đặt thay vì thử rồi bị từ
  chối. Chạm ô xanh là chuyển xong; chạm lại chính nó để bỏ chọn; `Esc` cũng bỏ.
- Kéo thả giữ nguyên cho người quen dùng chuột. Cả hai lối đi chung một hàm
  `chuyenTiet()` nên chỉ có một chỗ kiểm ràng buộc, một chỗ ghi bước lui.

### 3. Ghim tiết và hoàn tác

**Vấn đề:** `xepTuDong()` mở đầu bằng xoá sạch lưới. Chỉnh tay hai buổi rồi
bấm *Bắt đầu xếp* lần nữa là mất hết, không lùi lại được.

**Đã làm:**
- Mỗi tiết chỉnh tay tự mang cờ **ghim 📌**. Lần xếp lại giữ nguyên chúng, trừ
  đúng vào số tiết phải xếp, và bước hoán đổi cục bộ cũng không đụng tới.
- Bấm vào dấu 📌 là bỏ ghim một tiết; nút *Bỏ ghim cả lớp* gỡ hết.
- Cờ ghim đi theo bản lưu lên máy chủ, tải về vẫn còn.
- **Hoàn tác 20 bước** — nút trên thanh công cụ và `Ctrl+Z`, phủ cả những cú
  bấm nguy hiểm nhất: *Xoá kết quả* và *Bắt đầu xếp*.

### 4. Tài khoản giáo viên chưa nối hồ sơ

**Vấn đề:** `mCuaToi()` viết `S.nguoiDung.gvId || S.giaoVien[0]?.id`. Cấp tài
khoản hàng loạt cho 35 người mà sót một lần nối tên là thầy cô đó **xem nhầm
lịch của giáo viên đầu danh sách** mà không hay biết.

**Đã sửa:** hàm `thieuHoSoGV()` chặn thẳng, hiện màn hình nói rõ tài khoản nào
chưa nối và người quản trị sửa ở đâu. Không bao giờ đoán bừa.

### 5. Màn hình *Buổi bận*

**Vấn đề:** ràng buộc cứng số 7 đã có trong thuật toán và trong cơ sở dữ liệu
(bảng `gv_nghi`) từ đầu, nhưng **không màn hình nào ghi vào được** — muốn dùng
phải vào thẳng SQL. Đây lại là nhu cầu thường xuyên nhất của thầy cô: nuôi con
nhỏ, kiêm nhiệm, học nâng chuẩn, dạy liên trường sau sáp nhập.

**Đã làm:** mục **Buổi bận** trên thanh bên — bảng giáo viên × các buổi trong
tuần, tích ô là xong, cột *Còn lại* đỏ lên khi ai đó bận quá nửa số buổi. Nút
*Lưu lên máy chủ* ghi vào `gv_nghi` (xoá cũ, ghi mới — nên bỏ đánh dấu cũng
được ghi nhận). Badge trên thanh bên đếm số buổi bận trong phạm vi đang xem.

### 6. Phép thử giao diện thật — và một lỗi nó bắt được

`npm test` chỉ cắt phần mã thuần ra chạy nên không nhìn thấy màn hình. Nay có
thêm **`npm run soi`**: mở nguyên `src/index.html` trong trình duyệt giả, vẽ đủ
13 màn hình rồi **bấm thật** vào các nút.

Ngay lần chạy đầu nó bắt được một lỗi thật, loại mà đọc mã rất khó thấy:

> Tiết **chào cờ** vẫn bị ghim vào sáng thứ Hai cho cô chủ nhiệm **đã báo bận
> buổi đó**. Ràng buộc cứng bị chính tiết ghim theo quy định phá vỡ.

Đã sửa: buổi báo bận thì không ghim, tiết HDTN được xếp sang ô khác, và thêm
**quy tắc R11** trong bộ kiểm tra khả thi để nhà trường biết lớp nào đang thiếu
người chào cờ mà còn cắt cử.

Bộ quy tắc nay là **12** *(R11 ngày 1/8 sáng, R12 ngày 1/8 chiều)*.

---

## Phần II — Ba việc chỉ anh làm được

Ba việc này cần đăng nhập quản trị thật hoặc là quyết định nghiệp vụ, phần mềm
không tự làm thay được.

### 1. Bấm nút *Công bố cho giáo viên* — 5 phút, đang chặn cả 35 thầy cô

Cả 5 phiên bản trên máy chủ đang `cong_bo = false`, mà quy tắc đọc chỉ cho
giáo viên xem bản đã công bố. Mã, nút bấm, quy tắc UPDATE và phép thử đều xong
từ trước — chỉ thiếu một cú bấm.

1. Nếu chưa chạy lần nào: mở Supabase → **SQL Editor** → dán `db/cong-bo.sql` → Run.
2. Vào phần mềm, đăng nhập quản trị → **Xếp thời khóa biểu** → nút
   **Công bố cho giáo viên**.
3. Thử bằng một tài khoản giáo viên bất kỳ: phải thấy ngay lịch cá nhân.

### 2. Chạy `db/ma-lop.sql` trước khi nhập ba trường

Một lần, trong SQL Editor. Nó thêm cột `ma_lop`, điền mã cho 25 lớp hiện có
(lấy luôn tên lớp làm mã), rồi chuyển ràng buộc duy nhất sang mã. Có sẵn hai
câu kiểm tra ở cuối tệp.

### 3. Quyết cách đặt mã lớp cho ba trường

Đây là quyết định nghiệp vụ. Đề xuất của em — đơn giản và không phải bàn lại:

| Điểm trường | `Ma_lop` | `Ten_lop` |
|---|---|---|
| Diễn Liên | `DL-1A`, `DL-1B`… | `1A`, `1B`… |
| Diễn Đồng | `DD-1A`, `DD-1B`… | `1A`, `1B`… |
| Diễn Thái | `DT-1A`, `DT-1B`… | `1A`, `1B`… |

Nhà trường **giữ nguyên tên lớp quen thuộc**, phần mềm phân biệt bằng mã. Cột
`Chu_nhiem` trong trang `DANH_SACH_GV` ghi theo `Ma_lop`. Nếu sau này nhà
trường đánh lại tên lớp toàn đơn vị (1A–1O) thì cách này vẫn chạy nguyên vẹn,
không phải sửa gì.

---

## Phần III — Đối chiếu với các hệ thống uy tín

### Nên học tiếp

| Chức năng | Nơi làm tốt | Tình trạng |
|---|---|---|
| Khoá tiết (lock/pin) | aSc, FET, Untis | ✅ đã có (1/8/2026) |
| Buổi bận của giáo viên | Untis, FET *(teacher not available)* | ✅ đã có (1/8/2026) |
| Ứng dụng cho giáo viên | Untis Mobile | ✅ đã có · còn thiếu xuất `.ics` |
| **Dạy thay, phân công bù** | **Untis** *(module dùng nhiều nhất thế giới)*, aSc Substitutions | ⬜ **khoảng trống lớn nhất** |
| Ràng buộc phòng học | tất cả | ⬜ mới có cảnh báo R10, chưa thành ràng buộc cứng |
| Nhiều phương án để so | aSc, FET | ⬜ mới có phiên bản tuyến tính |

### Không nên đua

- **Tính thời gian di chuyển từng tiết** (aSc có *buildings & travel time*).
  Ràng buộc “một buổi một điểm trường” đơn giản hơn và đúng hơn với cách nhà
  trường điều hành.
- **Thời khóa biểu nhiều tuần luân phiên**, ghép lớp, phân ban, tín chỉ —
  chuyện của trung học và đại học.
- **Bộ ràng buộc mềm khổng lồ kiểu FET** (hàng trăm loại). Mạnh, nhưng khó tới
  mức phần lớn nhà trường bỏ cuộc. Sáu ràng buộc mềm hiện tại đúng và đủ.
- **Quản lý học sinh, điểm, sổ liên lạc** — vnEdu và SMAS đã chiếm chỗ, và việc
  không giữ dữ liệu học sinh đang là lợi thế pháp lý lớn của dự án.

### Vị trí sản phẩm

Không phần mềm nào trong danh sách trên giải bài toán **nhiều điểm trường cách
nhau vài cây số của trường tiểu học Việt Nam sau sáp nhập**. Đó là khoảng trống
thật, và phần mềm này đang đứng đúng chỗ đó.

---

## Phần IV — Lộ trình còn lại

### Mốc 2 — tháng 9 đến 11/2026 (dùng được cả năm học)

**1. Dạy thay / dạy bù — làm trước tất cả.**
Hiện phần mềm chỉ phục vụ *một tuần trong năm*: tuần xếp thời khóa biểu. Sau
khai giảng, người xếp không còn lý do mở lại. Trong khi việc tuần nào cũng có
là *“cô A ốm sáng thứ Ba, ai dạy thay”*.

Đề xuất module nhỏ, giá trị lớn:
- Chọn giáo viên + ngày vắng → liệt kê các tiết cần bù.
- Gợi ý người thay theo thứ tự: đang trống tiết đó → **đang có mặt đúng điểm
  trường buổi đó** → chưa kịch định mức → đã từng dạy khối đó.
- Chốt xong ghi `nhat_ky`, đếm số tiết dạy thay theo tháng — dùng thẳng cho hồ
  sơ thanh toán thừa giờ.
- Giáo viên mở app thấy dòng đỏ *“Hôm nay thầy/cô dạy thay lớp 3B tiết 2 sáng”*.

Ràng buộc điểm trường vốn đã là lõi khiến gợi ý này chính xác hơn hẳn làm tay:
người quản lý rất dễ quên cô B tuy trống tiết nhưng buổi đó đang ở điểm trường
cách 4 km.

**2.** Phòng chức năng thành ràng buộc cứng thật — bảng `phong`, thêm một dòng
kiểm tra trong `datDuoc()`. Trường một phòng máy mà mười lớp học Tin thì lưới
hiện nay vẫn xếp hai lớp cùng một tiết.

**3.** Màn hình nhật ký thao tác — hiện `ghiNhatKy()` đã ghi nhưng chưa ai xem
được.

**4.** In tổng hợp toàn trường một tờ A3 (thứ đầu tiên dán lên bảng tin ngày
khai giảng) · xuất `.ics` cho lịch điện thoại.

**5.** Thêm/sửa/xoá dòng phân công ngay trong app — giữa năm có biến động nhân
sự thì hiện phải quay lại Excel.

### Mốc 3 — từ 2027 (Pha 2, mở cho nhiều trường)

- Bảng tra cập nhật **tăng dần** trong `xepTuDong()` (hiện dựng lại toàn bộ cho
  mỗi tiết) — làm việc này **trước** Web Worker, rẻ hơn và giữ mã dễ đọc.
- ~~Ô tìm kiếm cho danh sách ~100 giáo viên sau sáp nhập.~~ **Xong 2/8/2026** —
  làm sớm hơn dự kiến vì nó chặn ngay việc nhập dữ liệu thật của ba trường.
  Mười màn hình có ô tìm kiếm, tìm không dấu, lọc tại chỗ; xem `tkb-app/CLAUDE.md`
  mục 3 · *Ô tìm kiếm trong danh sách dài*.
- Nhiều phương án phân bổ lớp về điểm trường, đặt cạnh nhau để so — đây mới là
  quyết định đắt nhất của hiệu trưởng sau sáp nhập.
- Gói dịch vụ, thanh toán — **sau** khi có ý kiến pháp lý như đã ghi trong mục
  *Việc KHÔNG làm*.
