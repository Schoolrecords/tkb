# Giao diện — chi tiết

> Tách khỏi `CLAUDE.md` ngày 30/8/2026 vì tệp ấy vượt ngưỡng 150.000 ký tự và
> được nạp vào **mọi** phiên làm việc. Nội dung ở đây **nguyên văn**, không cắt
> bớt — chỉ đổi chỗ ở.
>
> **Sắp sửa vào phần trình bày thì đọc tệp này trước.** Nó ghi cả những cách
> đã thử và đã bỏ, nên đọc trước là khỏi đi lại một vòng đã đi rồi.
>
> Luật hay bị vi phạm nhất vẫn nằm ở `CLAUDE.md` mục 3 và mục 8; ở đây là
> phần vì sao và làm thế nào.

**Mục lục**

- [Hồ sơ giáo viên đủ ô, và phân công NHIỀU MÔN một lần *(28/8/2026)*](#hồ-sơ-giáo-viên-đủ-ô-và-phân-công-nhiều-môn-một-lần-2882026)
- [Bảng phân công dạng MA TRẬN *(29/8/2026)*](#bảng-phân-công-dạng-ma-trận-2982026)
- [Bảng Môn học: chỉ nút XOÁ, và hiện đủ 13 môn *(29/8/2026)*](#bảng-môn-học-chỉ-nút-xoá-và-hiện-đủ-13-môn-2982026)
- [Trên điện thoại: NGĂN KÉO, không phải dải ngang *(sửa 2/8/2026)*](#trên-điện-thoại-ngăn-kéo-không-phải-dải-ngang-sửa-282026)
- [Lưới rộng — GƯƠNG MẶT của sản phẩm *(trang điểm 2/8/2026)*](#lưới-rộng--gương-mặt-của-sản-phẩm-trang-điểm-282026)
- [Lưới trên MÀN HÌNH bày từng phân hiệu, bản gộp để IN *(2/8/2026)*](#lưới-trên-màn-hình-bày-từng-phân-hiệu-bản-gộp-để-in-282026)
- [Thứ tự Bảng điều hành — sắp lại *(3/8/2026)*](#thứ-tự-bảng-điều-hành--sắp-lại-382026)
- [Thẻ *Đã khai báo* — mỗi con số là một LỐI ĐI *(29/8/2026)*](#thẻ-đã-khai-báo--mỗi-con-số-là-một-lối-đi-2982026)
- [Mở app là thấy TỪNG LỚP, và cột lớp bên trái lưới *(16/8/2026)*](#mở-app-là-thấy-từng-lớp-và-cột-lớp-bên-trái-lưới-1682026)
- [Sản phẩm lên trước, quy trình lùi sau *(2/8/2026)*](#sản-phẩm-lên-trước-quy-trình-lùi-sau-282026)
- [Ô tìm kiếm trong danh sách dài *(2/8/2026)*](#ô-tìm-kiếm-trong-danh-sách-dài-282026)
- [Chạm không làm màn hình xê dịch — `ve()` giữ chỗ cuộn *(1/9/2026)*](#chạm-không-làm-màn-hình-xê-dịch--ve-giữ-chỗ-cuộn-192026)
- [Mức tín hiệu thứ BA khi chỉnh tay *(30/8/2026)*](#mức-tín-hiệu-thứ-ba-khi-chỉnh-tay-3082026)
- [Tệp Excel phải đọc được bằng mắt *(1/8/2026)*](#tệp-excel-phải-đọc-được-bằng-mắt-182026)
- [Ô lưới trong tệp .xlsx xuất ra: HAI DÒNG *(24/8/2026)*](#ô-lưới-trong-tệp-xlsx-xuất-ra-hai-dòng-2482026)
- [Ngôn ngữ thiết kế — hệ XANH DƯƠNG *(đổi 24/8/2026 theo mẫu chủ dự án gửi)*](#ngôn-ngữ-thiết-kế--hệ-xanh-dương-đổi-2482026-theo-mẫu-chủ-dự-án-gửi)

---

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

---

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

#### Tiêu đề dính hai ĐẦU, cột hẹp, chữ thập soi cột *(1/9/2026)*

Chủ dự án, khi trường lên 86 giáo viên: *"trang dài, không thấy dòng tiêu đề
các môn học... cố gắng cố định hoặc làm hẹp cột để ít phải trượt ngang xem
những môn cuối"*. Ba việc, cả ba có phép thử ở cuối mục 17p của `npm run soi`:

- **Khung cuộn là CHÍNH `.mt-khung`** (`max-height:76vh`). ⚠️ `table.dl th`
  vốn khai sẵn `position:sticky;top:0` nhưng chưa bao giờ ăn ở bảng này:
  `.bang` không giới hạn chiều cao nên cả TRANG cuộn thay cho bảng — sticky
  chỉ dính trong khung cuộn của chính nó. Nay dòng tiêu đề môn dính ĐỈNH,
  hàng đếm độ phủ dính ĐÁY — kéo tới đâu cũng thấy môn nào còn lớp thiếu.
- **Cột môn 56px, tên môn ở tiêu đề được xuống dòng.** ⚠️ Phải khai lại
  `white-space:normal` cho `.mt-mon` vì `table.dl th` chung là `nowrap` —
  quên là cột không hẹp đi được dù đã hạ `min-width`.
- **Chữ thập soi cột** (`.cot-soi`, gắn ở `noiSuKien`): rê chuột tới ô nào
  thì cả cột môn ấy sáng lên, ô `.co` trong cột đậm hơn một nấc để vẫn phân
  biệt với ô trống. Chỉ đổi lớp CSS trên đúng một cột, không vẽ lại gì.

---

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
  ⚠️ **Bẫy này đã sập lần hai ngày 31/8/2026**: thêm cột *Cho xếp 2 tiết
  liền* vào bảng mà quên hộp, agent rà soát bắt được. Thêm cột vào bảng
  thì **mở `oKhaiMon()` ra ngay lúc ấy**, đừng để lần sau.

#### Cột *Cho xếp 2 tiết liền* *(31/8/2026)*

Ô tích = môn đó được xếp hai tiết sát nhau trong một buổi. Bảng nay **13 cột**.

- **Chưa khai (`lienTiet === undefined`) = ĐƯỢC PHÉP**, đúng hành vi trước
  31/8/2026. `dsMonMacDinh()` **cố ý không gieo sẵn** — trường nào chưa từng bấm
  Lưu ở mục Môn học thì rơi về danh mục mặc định, gieo sẵn là lưới của họ
  đổi thật vào lần bấm Xếp kế tiếp mà không ai yêu cầu.
- Gợi ý nằm sau **một cú bấm có ý thức**: nút *Gợi ý môn nên xếp liền*
  (`goiYLienTiet()`) — chỉ Tiếng Việt và Tiếng Anh được liền.
- ⚠️ **Vân tay `vanTayNguon()` phải phủ cột này.** Bản đầu bỏ sót: tích xong,
  tải lại trang là mất ÂM THẦM — không dải đỏ, không `beforeunload`. Agent rà
  soát bắt được. Thêm trường mới vào đường ghi thì phải thêm vào vân tay,
  **cùng một lần sửa**.
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

---

### Trên điện thoại: NGĂN KÉO, không phải dải ngang *(sửa 2/8/2026)*

⚠️ **Đừng quay lại dải cuộn ngang dán đỉnh màn hình.** Đã làm và đã bỏ: bắt
vuốt ngang mới tìm được mục, nhãn nhóm phải xoay dọc mới vừa chỗ, và dải ấy
ăn mất một khoảng cao ở **mọi** màn hình kể cả khi không dùng tới.

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

**Logo** nhúng base64 ngay trong trang (`.hieu-bt img`), ảnh gốc thu về
**96px/16 KB** trước khi mã hoá, và **nhúng đúng MỘT lần** *(24/8/2026)*: thẻ
`<link rel="icon">` không mang `href` tĩnh, một dòng đầu script gán nó từ
chính `.hieu-bt img`.

⚠️ **Chỉ còn MỘT logo, ở đầu thanh bên** *(16/8/2026)* — bản trước bày thêm
một cái nữa ở thanh đầu trang, cùng một hình hai lần cách nhau vài chục pixel.
Có phép thử canh không cho nó quay lại.

`thanhKhaiBao(nut, coNhap)` dựng thanh công cụ dùng chung. Truyền `coNhap=false`
cho **Thông tin trường · Môn học · Phòng học** — tệp Excel không chứa ba thứ đó,
bày nút nhập ở đấy là hứa hão.

---

### Lưới rộng — GƯƠNG MẶT của sản phẩm *(trang điểm 2/8/2026)*

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

---

### Lưới trên MÀN HÌNH bày từng phân hiệu, bản gộp để IN *(2/8/2026)*

Ba phân hiệu gộp một bảng là **60 cột** — chủ dự án nhận xét *"quá dày và
rối"*, và đúng: người phụ trách một phân hiệu chỉ quan tâm điểm của mình.
Nay `lopChoLuoi()` lọc theo `S.dtLuoi`, `daiDiemLuoi()` dựng dải nút chuyển
(chỉ hiện khi có nhiều hơn một phân hiệu, kèm số lớp mỗi nơi). Bảng điều
hành và màn *Toàn trường* đều dùng nó.

Bản **gộp cả trường vẫn còn nguyên** nhưng chỉ ở đường **Xuất và in** — nơi
nó đúng vai: tờ A3 dán bảng tin. Có phép thử canh việc này (`luoiToanTruong`
phải luôn đủ cột cho mọi lớp, không bị dải nút cắt bớt).

---

### Thứ tự Bảng điều hành — sắp lại *(3/8/2026)*

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

⚠️ **Băng rôn navy đã BỎ HẲN, và thẻ lưới KHÔNG có dòng tiêu đề** *(3/8/2026)*
— cả hai chỉ lặp lại thứ đã nói ở thanh trên cùng và dải chỉ số, mà ăn mất gần
200px chiều cao **ngay trên lưới**. Đừng dựng lại.

Nút **Xuất và in** nằm **ngang hàng với bốn thẻ chuyển** (`.xem-xuat`,
`flex:0 0 auto` để không giãn theo). Nhãn số liệu thu thành `.dai-phu .meta`
nằm cuối hàng dải chọn.

⚠️ **Dải đỏ việc gấp thì GIỮ.** Nó là chỗ duy nhất báo việc gấp ở đầu trang
sau khi khối *Việc cần xử lý* lùi xuống dưới lưới. Không có việc thì
`daiViecGap()` trả rỗng — không tốn một pixel nào. Đừng gỡ nó khi dọn giao
diện: gỡ là hiệu trưởng mở app lên không còn chỗ nào báo cô A đang nghỉ.

**Màu nút trên nền trắng: cùng một hệ, khác nhau độ đậm.** Chưa chọn là
`--nav-nhat` nổi khối, đang chọn là `--nav` đậm hơn — hai tín hiệu (màu đậm
nhạt + đổ bóng), không chỉ một. Nền trắng viền mảnh đã thử và bị chê
*"nhìn màu trắng không rõ"*.

---

### Thẻ *Đã khai báo* — mỗi con số là một LỐI ĐI *(29/8/2026)*

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

---

### Mở app là thấy TỪNG LỚP, và cột lớp bên trái lưới *(16/8/2026)*

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

⚠️ **Bốn cách xem là THẺ CHUYỂN TẠI CHỖ, không phải nút rời trang** *(3/8/2026)*.
Làm bằng `data-di` thì bấm *Theo lớp* là rời Bảng điều hành và **không có đường
quay lại để bấm thẻ thứ hai**. Nay đổi `S.dhXem` rồi vẽ lại đúng khối ấy — xem
`kheSanPhamHTML()`.

Lưới trong Bảng điều hành **CHỈ ĐỌC**: không kéo thả, không chạm sửa. Màn hình
*Theo lớp* mới là chỗ chỉnh tay; hai nơi cùng sửa một thứ thì sớm muộn lệch
hành vi. Hai hàm dựng lưới tuần dùng chung: `luoiTuanLop(id)` · `luoiTuanGV(id)`,
cùng khung `luoiTuanKhung(oNoi)`.

**Ba thứ đã chuyển khỏi Bảng điều hành** — nó là chỗ NHÌN thời khóa biểu,
không phải bảng nút bấm: cụm sáu nút thao tác nhanh về màn *Xếp thời khóa
biểu*, bốn thẻ số liệu `.ts` thu thành dải `.dai-so` trên lưới, ô tìm kiếm
chung thành nút kính lúp trên **thanh đầu trang**.

⚠️ **Ô tìm kiếm toàn cục KHÔNG được đặt trong mục Giáo viên** — ở đó nó nằm sát
ô lọc bảng, hai ô giống hệt nhau về hình thức mà khác hẳn hành vi, người dùng
gõ nhầm ô là tưởng phần mềm hỏng. Chỗ của nó là thanh đầu trang, theo người
dùng đi mọi màn; giấu với vai giáo viên và khi chưa đăng nhập.

**Việc cần xử lý lùi xuống SAU lưới** — phần lớn thời gian nó là một hộp xanh
*"Hôm nay không có giáo viên báo nghỉ"*, tức chiếm chỗ đẹp nhất để nói rằng
**không có gì xảy ra**. Cái giá phải trả: việc gấp vẫn phải đập vào mắt ở đầu
trang.
Nên khi có giáo viên báo nghỉ chưa xử lý, `bangRon()` gắn thêm **một dòng đỏ
dán liền dưới băng rôn** (`.br-gap`) — bấm được, nhảy thẳng tới Dạy thay. Một
dòng thay cho cả một khối, và **không thêm hộp rời nào** vì nó dính vào băng
rôn thành một khối (`.bang-ron.gap` bỏ bo góc dưới). Có phép thử canh cả hai
trạng thái.

---

### Sản phẩm lên trước, quy trình lùi sau *(2/8/2026)*

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

---

### Ô tìm kiếm trong danh sách dài *(2/8/2026)*

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

---

### Chạm không làm màn hình xê dịch — `ve()` giữ chỗ cuộn *(1/9/2026)*

Chủ dự án: *"khi chạm và chỉnh sửa, còn di chuyển cảm giác khó chịu"*. Hai gốc:

1. **`ve()` thay toàn bộ ruột `#noiDung`** nên mọi khung cuộn reset về 0 —
   chạm một tiết là cột lớp giật, sửa một ô phân công là mất chỗ đang xem
   trong bảng 86 hàng. Nay `luuViTriCuon()` / `traViTriCuon()` ghi vị trí
   (cửa sổ + `.bang` · `.tt-boc` · `.cl-ds`) trước khi thay ruột, trả lại sau.
   - ⚠️ **Chỉ trả khi VẪN Ở màn hình cũ.** Màn mà DOM đang bày ghi ở
     `#noiDung[data-trang]`, KHÔNG đọc `S.trangHienTai` — `chuyen()` đổi
     biến ấy TRƯỚC khi gọi `ve()`, đọc nó là trả nhầm vị trí màn cũ vào màn
     mới. Có phép thử canh cả hai chiều.
   - **Trả SAU `cuonToiLopDangXem()`** — lần vẽ đầu hàm ấy canh giữa lớp
     đang mở; các lần sau vị trí người dùng tự cuộn tới thắng.
   - ⚠️ Dựng khung cuộn MỚI thì nó chỉ được giữ khi mang một trong ba lớp
     trên hoặc có id — xem `dsKhungCuon()`.
2. **Dải hướng dẫn/chú giải màn chỉnh tay cao khác nhau giữa hai trạng thái**
   (chưa cầm tiết = đoạn hướng dẫn, đang cầm = chú giải ba màu) nên lưới bị
   đẩy lên xuống theo từng cú chạm — ô định chạm tiếp trượt khỏi chỗ ngón
   tay. Nay cả hai trạng thái nằm trong `.khu-chon{min-height:74px}`.

### Mức tín hiệu thứ BA khi chỉnh tay *(30/8/2026)*

Chủ dự án nói đúng ranh giới của việc tinh chỉnh sau khi xếp: *"Cô A muốn
đưa Toán lên tiết 1, đưa GDTC xuống tiết 4 để phù hợp, và muốn xếp 2 tiết
Tiếng Việt liền nhau để dạy một bài đọc liên thông… **miễn sao không chạm
với các môn chuyên** do GV Âm nhạc, Mỹ thuật, Tin học hay Tiếng Anh dạy vào
lớp đó."*

Đổi hai tiết mà **cả hai đều của chính chủ nhiệm** thì không ai ngoài lớp bị
ảnh hưởng. Đụng tiết của giáo viên dạy nhiều lớp thì kéo theo lịch của họ ở
những lớp khác — vẫn hợp lệ, vẫn làm được, chỉ là người chỉnh phải BIẾT trước.
Màn chỉnh tay vốn chỉ có hai mức (xanh = đặt được · mờ = vướng), nay ba:

| Mức | Nghĩa |
|---|---|
| mờ `.o-cam` | vướng ràng buộc cứng, không đổi được |
| **vàng `.o-cham`** | **đổi được NHƯNG chạm tiết của giáo viên dạy nhiều lớp** |
| xanh `.o-hop` | đổi tự do, không ai ngoài lớp bị ảnh hưởng |

| Hàm | Việc |
|---|---|
| `laGVLienLop(idGV)` | vùng LOGIC — người ấy có tiết ở từ hai lớp trở lên |
| `chamGVKhac(idLop, den)` | ô đích có tiết của ai; `null` = đổi tự do |

Sáu điều bắt buộc, cả sáu có phép thử (`npm test` mục **18e**, `npm run soi`
mục **17u**):

- ⚠️ **VÀNG LÀ NHẮC, TUYỆT ĐỐI KHÔNG PHẢI CẤM.** Chủ dự án dặn thẳng *"không
  phải vì vậy mà bắt buộc cứng"*. Phép thử đòi **mọi** ô vàng đều là ô
  `kiemTraChuyen()` cho qua — ai lỡ biến nó thành chốt chặn là đỏ ngay.
- **Suy từ DỮ LIỆU, không ghi cứng danh sách môn.** Trường tự khai môn tự
  chọn và tự phân công ai dạy gì; ghi cứng *"Âm nhạc · Mỹ thuật · Tin học ·
  Tiếng Anh"* là đúng cho đúng một nhà trường, đúng một năm học. Tiêu chí
  thật: **dạy từ hai lớp trở lên** — đó mới là thứ sinh hệ quả dây chuyền.
- **Chỉ xét ô ĐÍCH.** Nếu chính tiết đang cầm là của giáo viên liên lớp thì
  người dùng đã biết — họ vừa tự tay chọn đúng ô ấy; nhắc lại trên cả 30 ô
  còn lại là biến cả lưới thành vàng và tín hiệu mất hết ý nghĩa. Trường hợp
  ấy nhắc **một lần** ở dải trên.
- **Ô xanh tuyệt đối không được lẫn ô chạm ai** — có phép thử canh cả hai
  chiều. Lẫn thì người dùng tưởng đổi tự do mà thật ra đụng lịch một cô giáo
  ở lớp khác.
- **Nói rõ TÊN và số lớp**, không nói chung chung: *"chạm tiết Mỹ thuật của
  Đinh Thị Nhã (dạy 24 lớp)"*. Dải trên đếm sẵn *"21 ô đổi tự do · 5 ô chạm
  tiết của …"*.
- **Chưa chọn tiết nào thì KHÔNG bày dải ba màu** — đừng chiếm chỗ để nói về
  thứ người dùng chưa làm.

⚠️ **Chú giải ba màu KHÔNG được dùng flex cho phần chữ.** Mức giữa là một câu
dài có `<b>` ở giữa; để nó làm flex item thì trên điện thoại câu ấy bị **xé
thành ba cột chồng nhau**, đọc không ra. Ô màu là `inline-block` trôi cùng
dòng chữ, và dưới 900px mỗi mức xuống dòng riêng. `npm run soi` chỉ đọc
`textContent` nên xanh suốt — chỉ ảnh chụp Chrome thật bắt được.

⚠️ **`chuyen()` xoá `S.oChon` mỗi lần đổi màn hình.** Muốn dựng cảnh đang
cầm một tiết (ảnh chụp, phép thử) thì phải sang màn hình TRƯỚC rồi mới gán
`S.oChon` và gọi `ve()`.

⚠️ **Phép thử của mục 17u tự chọn lấy lớp, không tin `S.lopXem`** mà các mục
trước để lại: mục 17r từng dọn sạch `S.tkb`, mục 17t thêm hẳn một phân hiệu
và dời tám lớp sang đó. Bản đầu tin vào trạng thái sẵn có và đỏ năm phép thử
liền vì lớp đang mở không còn chủ nhiệm.

⚠️ **`KQ_XEP` khai bằng `let` nên KHÔNG nằm trên `window`** *(lộ ra 30/8/2026)*.
`docs/anh-giao-dien/chup.mjs` gán `window.KQ_XEP = xepTuDong()` — tức tạo một
biến KHÁC, còn màn hình Xếp vẫn đọc bản cũ mà `khoiDong()` đã tự xếp lúc vào
chế độ demo. Bấy lâu không lộ vì cả hai đều là 710/710; chỉ khi dựng cảnh
THIẾU tiết mới thấy ảnh chụp ghi *710 tiết · 0 chưa xếp* trong khi huy hiệu
thanh bên đã báo **18**. Nay gán thẳng `KQ_XEP = xepTuDong()`.

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

---

### Tệp Excel phải đọc được bằng mắt *(1/8/2026)*

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

---

### Ô lưới trong tệp .xlsx xuất ra: HAI DÒNG *(24/8/2026)*

Chữ chồng đè lên nhau, cả bảng không đọc nổi. Gốc là hai quy tắc đúng riêng lẻ
nhưng đánh nhau khi gặp: `thanBangXL()` khoá cứng `height:19` cho **mọi** bảng,
còn `trangLuoi()` bật `wrapText` cho ô có tiết. Chữ xuống hai dòng trong ô cao
một dòng thì Excel vẫn vẽ ra — tràn đè xuống hàng dưới.

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

---

### Ngôn ngữ thiết kế — hệ XANH DƯƠNG *(đổi 24/8/2026 theo mẫu chủ dự án gửi)*

Hệ màu đã đổi hai lần: navy → xanh lá (16/8) → **xanh dương (24/8)**. ⚠️ **Tên
biến giữ nguyên qua cả ba lần** (`--nav` nay là xanh dương đậm) vì chúng nói
đúng VAI TRÒ — màu của thanh điều hướng và của mọi hành động chính — chứ không
nói tên màu. Nhờ vậy đổi hệ màu chỉ là một bảng ánh xạ, không phải sửa hàng
trăm chỗ.

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
  ⚠️ **Cụm lá trang trí đã xoá hẳn 23/8, đừng vẽ lại** — trên màn hình thật
  nó là thứ bắt mắt nhất trong cả thanh bên, một hoạ tiết nền mà nặng hơn mọi
  mục điều hướng nằm trên nó. Đã thử nước lưng chừng là hạ `opacity`, bị nhận
  ra ngay: **bỏ một khối trang trí thì xoá hẳn mã của nó**.
  ⚠️ Đừng hạ bề ngang xuống nữa: 238px đã thử và làm gãy dòng cả ba chỗ chữ
  dài nhất — tên sản phẩm ở đầu thanh, nhãn nhóm *Tra cứu thời khóa biểu*,
  và vai trò trong thẻ tài khoản.
- Nền `#F4F9FC`, thẻ trắng bo `14px`, viền `#C9E2F0`, đổ bóng rất nhẹ.
  ⚠️ Nền nhạt thì **viền phải đậm và rõ** — việc phân tách dồn hết sang viền.
  Nền nhạt mà viền cũng nhạt thì cả trang thành một mảng phẳng, đã chê một lần.
- **Thanh đầu trang là THẺ TRẮNG có phong cảnh** (trời, mây, chim, đồi, cây,
  giữa tranh là **ngôi trường**) ở nửa phải, không còn là khối navy đậm. Chữ
  vì thế là chữ thường, không phải chữ trắng. ⚠️ Mép trái hình phải tan dần
  bằng một lớp gradient trắng phủ lên — thiếu nó là lộ một vạch dọc cắt ngang
  thanh. Ngôi trường đứng ở `x 140–310` của `viewBox` 600 đơn vị, chỗ duy nhất
  đặt được: lệch trái thì rơi vào vùng mặt nạ còn đang tan mờ (hết mờ ở 126),
  lệch phải thì cụm nút *Đăng nhập · tìm · chuông* che mất mái — canh theo nhãn
  **"Đăng nhập"**, nhãn dài nhất nút ấy từng mang.
  ⚠️ **To ra thì DÀI RA HAI BÊN, đừng cao thêm**: thanh đầu trang chỉ cao chừng
  76px và `viewBox` cắt theo mép **dưới** (`xMaxYMax slice`) nên cao thêm là cụt mái.
- **Ba nút góc phải thanh đầu cùng một dáng: tròn, nền trắng viền nhạt**
  *(23/8/2026)* — chúng là ba lối phụ, để hai khối xanh đặc thì nặng ngang cụm
  chữ tên trường và ba nút không đọc ra một cụm.
- ⚠️ **Nút chưa chọn phải NỔI KHỐI: nền xanh sáng + viền + đổ bóng** *(chốt
  23/8/2026)*. Đã thử nền trắng viền mảnh theo ảnh mẫu và phải quay lại — trên
  màn hình thật cả dải bốn nút chỉ còn bốn khung viền nhạt, không nhìn ra chỗ
  bấm được. **Ba tín hiệu** cho nút chưa chọn, nút đang chọn hơn nữa bằng nền
  đậm chữ trắng cộng bóng sâu hơn. Áp cho cả `.xem-nut`, `.dt-nut`, `.cl-n`.
  `.the-luoi` vẫn **trong suốt**: bên trong nó đã có khung trắng riêng của cột
  lớp + lưới, thêm một tấm trắng nữa là trắng lồng trắng.
- `.b-vang` nay là **xanh dương đậm** chứ không còn màu vàng. Vàng chỉ còn ở
  logo, vạch đánh dấu mục đang mở và ô biểu tượng *Cảnh báo*.
- Ba thẻ dưới Bảng điều hành mang **ô biểu tượng vuông bo tròn** (`.the-ic`)
  màu theo vai trò: xanh đậm = tiến độ, xanh lá = xong, đỏ = có việc gấp,
  vàng = cảnh báo.
- Mỗi môn học một màu riêng (nền pastel + viền trái đậm, suy từ `--mc` bằng
  `color-mix`), mỗi phân hiệu một màu riêng.
- **MỖI MÔN MỘT BIỂU TƯỢNG** *(23/8/2026 — `IC_MON` · `icMon()`)*. Ba điều
  của bộ này:
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
- ⚠️ **Màu môn là PASTEL NGẢ XÁM, không phải màu nguyên pha trắng**
  *(làm lại 23/8/2026)*. **Pha trắng chỉ hạ độ SÁNG, không hạ độ BÃO HOÀ**,
  nên ô nào cũng vẫn là một mảng màu tươi và ba mươi ô cạnh nhau thành một
  bảng bảy sắc. `--mc` phải là màu ĐẤT, bão hoà thấp (`#4A7FB5`, `#C77B45`,
  `#3E9A72`…); nền và viền suy ra bằng `color-mix` nên đổi màu gốc là cả lưới
  đổi theo. Thêm môn mới thì lấy màu cùng họ, và **kiểm bằng mắt ở cỡ ô thật**,
  không nhìn ô màu to trong bảng chọn.
- **Ô tiết** *(23/8/2026)*: nền `24%` màu môn, viền `40%`, tên môn 12.5px, ô
  cao 48px. Bản nhạt hơn nhoè hẳn khi chiếu máy chiếu phòng họp hội đồng — chỗ
  tấm thời khóa biểu hay bị đem ra soi nhất. ⚠️ Nền đậm lên thì **tên giáo viên
  cũng phải đổi** từ xám trung tính sang màu môn pha đen, không thì nó chìm vào
  chính cái nền ấy.
- Lịch cá nhân (`.tiet-ca`, màn *Thời khóa biểu của tôi*) đi **cùng một mức
  đậm và cùng bộ icon** với ô tiết của lưới. Hai chỗ vẽ cùng một thứ — một
  tiết học — mà để lệch thì thầy cô mở lịch mình lại thấy nhạt hơn lúc xem
  theo lớp, đúng cái màn hình nhóm đông nhất mở mỗi sáng, thường là ngoài
  sân dưới nắng.
- **Cột lớp và lưới là MỘT KHỐI LIỀN, không phải hai mảng rời** *(23/8/2026 —
  `.cl-boc`)*. Khung trắng bao cả hai, ngăn nhau bằng một vạch dọc mảnh — cột
  lớp đọc ra là **cột đầu của bảng**, không phải một cái hộp đứng cạnh bảng.
  ⚠️ `.luoi-boc` bên trong **phải bỏ viền, bo góc và đổ bóng của chính nó**:
  hai lớp viền chồng nhau là ra đường kẻ đôi mờ ở cả bốn cạnh.
  ⚠️ Trên điện thoại cột nằm NGANG nên vạch ngăn phải đổi sang cạnh **dưới**.
  Để nguyên `border-right` là một vạch dọc chạy giữa dải nút, không ngăn gì cả.
- `manifest.webmanifest` và thẻ `theme-color` phải đổi theo (nay là `#005391`),
  không thì thanh trạng thái điện thoại còn màu cũ trong khi app đã đổi.
