# Nhập dữ liệu và xếp thời khóa biểu trên SmartScheduler

*Viết 1/9/2026, sau khi làm trọn cho **Trường TH Thần Lĩnh 1** (điểm chính Nghi
Đồng): 15 lớp · 24 giáo viên đứng lớp · 480 tiết, xếp **100%**.*

Tệp này để **lần sau làm cho trường khác không phải mò lại**. Lần đầu mất gần
hai tiếng, phần lớn là mò những thứ đáng ra chỉ cần biết trước; làm theo đây thì
còn chừng **mười lăm phút**.

> Đây là việc phụ trợ khi kèm các trường còn dùng SmartScheduler. Không liên
> quan tới thuật toán của app mình, và **không đụng** cơ sở dữ liệu `.sdb` của họ
> (mục 10 CLAUDE.md) — mọi thứ đi qua đường nhập Excel chính thức của phần mềm.

---

## 1. Ba bước

```
① Khai một tệp truong.json      ← việc duy nhất phải làm tay
② node tools/sinh-tep-ss.mjs    → ra 5 tệp Excel, kiểm chéo sẵn
③ Nhập 1→5 vào phần mềm rồi bấm xếp
```

Bước ② là chỗ tiết kiệm nhất: nó **chặn trước** những lỗi mà phần mềm nuốt
lặng lẽ, và tự dựng lưới tiết nghỉ (420 ô cho 15 lớp — không ai gõ tay nổi).

---

## 2. Khai báo — `truong.json`

```jsonc
{
  "tenTruong": "Trường Tiểu học ...",
  "thuMuc": "D:/.../Tên trường",        // nơi ghi 5 tệp Excel
  "namHoc": "2026-2027",
  "dinhMuc": 23,

  "khungGio": {                          // lưới thật của nhà trường
    "sangThu":  [2,3,4,5,6], "sangTiet":  4,
    "chieuThu": [2,3,4,5],   "chieuTiet": 3,
    "luoiTiet": 5                        // số hàng tiết/buổi trong phần mềm
  },

  "monThem": ["Tin học","Công nghệ","KN Công dân số","Hướng dẫn tự học"],

  "lop": [{ "ten": "1A", "khoi": 1 }],
  "giaoVien": [
    { "hoTen":"Nguyễn Văn A", "ma":"Thầy A", "cn":"1A", "tiet":17, "ghiChu":"TTCM" }
  ],
  "phanCong": [
    { "lop":"1A", "mon":"Tiếng Việt", "gv":"Thầy A", "soTiet":12, "gioiHan":2 }
  ]
}
```

- `ma` là **mã giáo viên** — thứ hiện trên lưới. Trùng tên gọi thì phải tách:
  `Cô Vân` / `Cô K.Vân`, `Cô Nga` / `Cô T.Nga`. Cùng bài học mã lớp và mã giáo
  viên của app mình.
- `cn` giữ **tên lớp**; để trống với giáo viên bộ môn.
- `tiet` là số tiết nhà trường khai — bộ soi lấy nó đối chiếu, sai là báo ngay.
- `gioiHan` = số tiết tối đa của môn đó trong **một buổi** (Tiếng Việt thường 2).

### Suy phân công bộ môn khi nhà trường chỉ khai tổng tiết

Bảng "số tiết và môn dạy" của nhà trường thường **chỉ ghi chi tiết môn cho giáo
viên chủ nhiệm**; bộ môn chỉ có tổng số tiết. Cách suy, đã dùng cho Thần Lĩnh 1:

```
tiết bộ môn mỗi lớp = tổng tiết/tuần − phần chủ nhiệm dạy
tổng bộ môn         = số đó × số lớp + tiết dạy bù cho người được giảm
```

Thần Lĩnh 1: (32 − 20) × 15 = 180, cộng 6 tiết dạy bù (TTCM 3 · TKHĐ 2 · TPCM 1)
ra **186** — đúng bằng tổng tiết 9 thầy cô bộ môn. Khớp tuyệt đối nên gần như
chỉ còn một cách chia hợp lý.

⚠️ **Phần chia lớp cho từng người vẫn là quyết định của nhà trường.** Suy ra
được tổng, không suy ra được ý. Cứ chia cho cân rồi **gửi bảng cho hiệu trưởng
duyệt**, đừng nhập thẳng như thể đó là số liệu của họ.

---

## 3. Sinh tệp

```bash
node tools/sinh-tep-ss.mjs "D:/.../Tên trường/truong.json"
```

Ra năm tệp đánh số sẵn theo thứ tự nhập. **Có bất kỳ lỗi nào thì không ghi tệp
nào** — không để nửa vời.

Chín phép kiểm, mỗi phép sinh ra từ một chỗ đã trả giá:

| Kiểm | Bắt được gì |
|---|---|
| Tên môn dịch được | môn lạ bị phần mềm nuốt lặng lẽ |
| Mã giáo viên không trùng | hai cô cùng tên gọi lẫn lịch nhau |
| Lớp / giáo viên lạ trong phân công | gõ nhầm tên |
| **Mọi lớp đúng N tiết** | thiếu tiết → lớp có giờ trống; thừa → xếp không hết |
| Mọi thầy cô đúng số tiết đã khai | chia nhầm lớp cho giáo viên bộ môn |
| Không ai vượt định mức | phân công quá tay |
| Khung giờ lọt trong lưới | khai sáng 6 tiết trong lưới 5 hàng |
| Lưới nghỉ chừa đúng N ô | lưới nghỉ lệch với số tiết |

Đã **thử ngược 6/6**: phá từng chỗ thì bộ soi đỏ đúng chỗ ấy.

---

## 4. Nhập vào phần mềm — đúng thứ tự

Mỗi màn: **nút Excel** trên thanh công cụ → *Nhập dữ liệu từ Excel* → chọn tệp →
**Có**.

| # | Menu | Tệp |
|---|---|---|
| 1 | Dữ liệu › Dữ liệu giáo viên › Danh sách giáo viên | `1 - Danh sach GV.xlsx` |
| 2 | Dữ liệu › Dữ liệu lớp học › Danh sách lớp học | `2 - Danh sach lop.xlsx` |
| 3 | Dữ liệu › Dữ liệu môn học › Danh sách môn học | `3 - Danh sach mon.xlsx` |
| 4 | Dữ liệu › Bảng phân công giảng dạy | `4 - Phan cong (Mau 1a).xlsx` — chọn **Mẫu 1a** |
| 5 | Ràng buộc TKB › Cố định tiết nghỉ › **Cố định tiết nghỉ lớp học** | `5 - Co dinh tiet nghi lop.xlsx` |

Rồi bấm **tia sét** (nút đầu trong ba nút) → *Chấp nhận* → chờ → **Có** để ghi.

Kiểm ngay sau khi xếp: chọn vài giáo viên, xem dòng *"Tổng số tiết … Đã xếp …
Chưa xếp 0"*, và nhìn cột **THỨ 7 phải trống**.

### ⚠️ Sai thứ tự là hỏng ngầm

**Danh mục môn phải vào TRƯỚC phân công.** Lần đầu em nhập phân công khi bảng
môn còn trống: phần mềm nhận 8 môn nó biết, **bỏ 4 môn còn lại không một lời
báo**. Mỗi lớp thành 25 tiết thay vì 32 — mất 105 tiết toàn trường mà bảng vẫn
trông bình thường. Chỉ lộ ra vì cộng thử tổng tiết một lớp.

Tương tự, **phân công phải sau lớp**: chưa có lớp thì không dòng nào khớp, nhập
xong bảng vẫn trắng.

---

## 4b. Ghim tiết cố định — chào cờ, sinh hoạt lớp

*(làm cho Thần Lĩnh 1 ngày 1/9/2026: HĐTN vào thứ Hai tiết 1 và thứ Sáu tiết 4)*

⚠️ **SmartScheduler KHÔNG có ràng buộc "cố định môn vào tiết X".** Mục *Ràng buộc
TKB › Yêu cầu của môn học* chỉ có ràng buộc **cấm**, nên đừng tìm ở đó.

Chỗ đúng là **Soạn thảo › Xếp môn học** — nó đặt một môn vào đúng thứ/tiết cho
**tất cả lớp trong một lần**, có ô tích *Cố định*. Không phải xếp tay 30 lần.

```
① Soạn thảo › Xóa TKB › Xóa TKB toàn trường     (giữ nguyên tiết đã cố định)
② Soạn thảo › Xếp môn học → HĐTN · Buổi sáng · Thứ 2 · Tiết 1 · ☑ Cố định
③ Soạn thảo › Xếp môn học → HĐTN · Buổi sáng · Thứ 6 · Tiết 4 · ☑ Cố định
④ Soạn thảo › Soạn thảo TKB tự động             → xếp nốt phần còn lại
⑤ Soạn thảo › Tối ưu TKB tự động                → bấm **Có** để GHI
```

Tiết cố định hiện **chữ xanh đậm** trên lưới, và hộp *Xóa TKB* mặc định chừa
chúng ra — nên xếp lại bao nhiêu lần cũng không mất.

Ba điều dễ vấp:

- ⚠️ **Mục trong các ô chọn KHÔNG mang tên trơn** mà là chuỗi kỹ thuật
  `Item { ID = 17, Code = HĐTN, Name = HĐTN }`. Khớp `Name -eq 'HĐTN'` là trượt;
  phải khớp `Code = HĐTN,`. Cẩn thận `HĐTN` · `HĐTC` · `HDTH` rất giống nhau.
- ⚠️ **Xếp xong CHƯA chắc đã ghi xuống tệp.** Phần mềm giữ lưới trong bộ nhớ và
  chỉ ghi khi hộp *"Bạn muốn ghi TKB đã được sắp xếp?"* được bấm **Có**. Ctrl+S
  không có tác dụng, và không có tệp `.wal`/`.journal` nào để cứu. Đã suýt mất
  một lần: lưới hiển thị đủ 32/32 mà `.sdb` vẫn giữ nội dung cũ mười phút trước.
  **Luôn so `LastWriteTime` của `.sdb` trước và sau.**
- ⚠️ Hộp MessageBox của phần mềm hay không tìm được bằng UI Automation — bấm
  theo tọa độ nút (nút *Có* ở khoảng `x=1001, y=637` trên màn 1920×1200).

**Kiểm kết quả bằng chính tệp phần mềm xuất ra**, đừng tin mắt nhìn một lớp:
*Hệ thống › Chuyển đổi dữ liệu sang Excel* → trang `TKB_LOP_S` / `TKB_LOP_C`,
mỗi thứ 5 dòng, cột từ thứ ba trở đi là từng lớp. Đọc bằng script rồi đếm.

---

## 5. Tên môn — bảng phải nhớ

SmartScheduler có **17 môn dựng sẵn** và chỉ nhận đúng tên của nó:

| Nhà trường quen gọi | Tên trong phần mềm |
|---|---|
| Tiếng Anh | **Ngoại ngữ** |
| TNXH | Tự nhiên và Xã hội |
| Lịch sử · Địa lí (tách) | **Lịch sử và Địa lý** (gộp, cộng tiết lại) |
| HĐTN | Hoạt động trải nghiệm |
| GDTC | Giáo dục thể chất |
| Mỹ thuật | Mĩ thuật |
| Đạo Đức | Đạo đức |

**Không có sẵn:** *Tin học* và *Công nghệ* tách riêng (nó chỉ có "Tin học và
Công nghệ"), *KN Công dân số*, *Hướng dẫn tự học* — khai thêm qua `monThem`.

`tools/sinh-tep-ss.mjs` dịch tự động và **báo đỏ** mọi tên nó không biết.

---

## 6. Điều khiển tự động — khi cần

Anh Chung nhập tay năm tệp cũng chỉ mất mấy phút. Nhưng nếu cần làm hộ từ xa:

`SS.exe` mang cờ `requireAdministrator` nên **luôn chạy quyền quản trị**, và
phiên PowerShell thường bị Windows chặn sạch (UI Automation trả **0 phần tử**).
Cách vào: chạy `tools/ss-cau-noi.ps1` bằng `Start-Process -Verb RunAs`, anh bấm
**Yes** ở UAC **một lần**, sau đó gửi việc qua tệp `lenh.ps1` → nhận `ketqua.txt`.

Phần mềm viết bằng **WPF** nên đọc menu bằng UI Automation rất tốt; nhưng **nút
thanh công cụ không có tên**, phải bấm theo toạ độ.

Bốn bẫy đã trả giá:

- **Hộp `Open`/`Save As` là cửa sổ Win32 (`#32770`) nằm BÊN TRONG cây cửa sổ
  chính**, không ở top-level. Tìm sai chỗ là tưởng hộp chưa mở.
- ⚠️ **Đừng dò ô nhập theo kiểu "ô nằm thấp nhất"** — một lần trúng ô đổi tên
  tệp và dán nguyên đường dẫn vào đó; Windows chặn vì có `\` và `:`, may mà
  không tệp nào bị đổi tên. Cách an toàn: **bấm đúp thẳng vào tên tệp trong
  danh sách**, hoặc gõ **tên tệp** (không phải đường dẫn đầy đủ).
- **Cửa sổ terminal hay che hộp thoại và cướp focus** → cú bấm theo toạ độ rơi
  ra ngoài, lệnh xếp không chạy mà không báo gì. Luôn `SetForegroundWindow`
  ngay trước khi bấm, và **chụp màn hình kiểm sau mỗi bước**.
- **Menu Excel là nút bật/tắt**: gọi lại lệnh mở menu khi menu đang mở thì
  **đóng** nó, cú bấm sau rơi vào bảng phía dưới.

Nút **X đỏ** trên thanh công cụ chính chỉ xóa lịch của **một giáo viên đang
chọn**, không phải cả trường — đọc kỹ câu hỏi trước khi bấm Có.

---

## 7. Đối chiếu với app mình

Cùng bộ dữ liệu Thần Lĩnh 1, chạy thuật toán của app cho ra bản riêng
(`test`-style script, xem `docs/lich-su-quyet-dinh.md` mục 1/9/2026):

| | SmartScheduler | App mình |
|---|---|---|
| Xếp được | 100% (480/480) | 100% (480/480) |
| Toán · Tiếng Việt vào tiết 1–3 sáng | **47%** | **95%** |
| Tiết trống kẹp giữa buổi | không đo được | **1** |
| Kiểm khả thi trước khi xếp | không có | R01–R14 |

⚠️ **Khoảng cách 47% so với 95% là thật và đáng kể.** SmartScheduler xếp *đủ*
nhưng không ưu tiên môn nặng vào đầu buổi sáng — nó không có khái niệm ấy.
Thuật toán của app mình phạt nặng việc đẩy Toán và Tiếng Việt ra khỏi tiết 1–3
sáng, nên gần gấp đôi. Đo bằng cùng một script trên tệp cả hai bên xuất ra.

Giữ cả hai bản: bản trong `.sdb` để nhà trường dùng tiếp bằng phần mềm họ quen,
bản Excel của app mình để đối chiếu chất lượng.
