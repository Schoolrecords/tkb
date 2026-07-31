# Thuật toán xếp thời khóa biểu

## Nguyên tắc lõi: "xếp ngược"

Xếp cái khó trước, cái dễ sau.

Ở tiểu học, giáo viên chủ nhiệm dạy khoảng 20/25 tiết của chính lớp mình →
cực kỳ linh hoạt, xếp vào đâu cũng được. Ngược lại, một giáo viên Tiếng Anh
dạy 6 lớp nằm ở 3 điểm trường thì gần như chỉ có 1–2 phương án khả dĩ.

Nếu xếp lần lượt từ lớp 1 đến lớp 5 như cách làm quen thuộc, các tiết dễ sẽ
chiếm hết chỗ và chặn đường của tiết khó.

## Bốn bước

### 0. Giữ lại tiết người xếp đã ghim

Mỗi tiết chỉnh tay đều mang cờ `ghim`. Bước xếp lại **không xoá** những ô này:
chúng được giữ nguyên, trừ vào số tiết phải xếp, và bước hoán đổi cục bộ cũng
không đụng tới. Chỉnh tay cả buổi rồi bấm *Bắt đầu xếp* mà mất sạch thì không
ai dám bấm nút đó lần thứ hai.

### 1. Ghim tiết cố định
- Chào cờ: thứ Hai, sáng, tiết 1 — HDTN của giáo viên chủ nhiệm
- Sinh hoạt lớp: thứ Sáu, sáng, tiết cuối — HDTN của giáo viên chủ nhiệm

Hai tiết này có ở mọi trường tiểu học, ghim sẵn giúp thu hẹp không gian tìm kiếm.

Hai ngoại lệ: ô đã có tiết người xếp ghim tay thì để yên, và **buổi giáo viên
đã báo bận thì không ghim** — ràng buộc cứng phải cứng với cả tiết theo quy
định. Trường hợp sau được quy tắc R11 nêu rõ để nhà trường cắt cử người khác.

### 2. Sắp thứ tự theo độ khó

```
độ khó = (không phải GVCN ? 1000 : 0)
       + số điểm trường giáo viên phải đi × 200
       + tổng số tiết của giáo viên đó
```

Xếp giảm dần: giáo viên bộ môn liên điểm trường trước, chủ nhiệm sau cùng.

### 3. Đặt từng tiết theo MRV + tham lam

Với mỗi tiết cần đặt:
- Duyệt toàn bộ ô trong tuần
- Loại ô vi phạm ràng buộc cứng
- Trong số ô còn lại, chọn ô có **điểm mềm thấp nhất**

Ô nào không còn chỗ hợp lệ thì ghi vào danh sách "chưa xếp" kèm lý do,
không âm thầm bỏ trống.

### 4. Báo cáo

Trả về: số tiết đã xếp, thời gian chạy, và danh sách từng trường hợp chưa xếp
được (giáo viên nào, môn gì, lớp nào, còn bao nhiêu tiết).

---

## Ràng buộc cứng

| # | Nội dung |
|---|---|
| 1 | Một giáo viên không dạy hai lớp cùng một ô |
| 2 | Một lớp không học hai môn cùng một ô |
| 3 | **Một giáo viên, một buổi, một điểm trường** |
| 4 | **Một phòng chức năng, một tiết, một lớp** — và phòng phải cùng điểm trường với lớp |
| 5 | Tôn trọng buổi bận đã đăng ký của giáo viên — kể cả với tiết ghim sẵn |

Buổi bận nhập ở mục **Buổi bận** trên thanh bên, lưu xuống bảng `gv_nghi`.

Ràng buộc số 4 chỉ bật khi trường **đã khai bảng phòng** ở mục *Bước 1 · Phòng
học*. Bảng phòng rỗng thì phần mềm chỉ cảnh báo R10 như trước — nâng cấp không
được làm một trường đang xếp tốt bỗng xếp hỏng. Khai rồi thì `datDuoc()`,
`doiChoDuoc()` và `kiemTraChuyen()` đều chặn, và R12 báo trước nếu số tiết cần
phòng vượt sức chứa.

Đo trên dữ liệu thật: khai một phòng Tin học vẫn xếp **710/710 tiết**, 15 tiết
Tin học rải trên 15 ô giờ khác nhau. Bước tham lam 229ms, khai phòng hay không
đều vậy.

Ràng buộc số 3 là điểm khác biệt của bài toán sau sáp nhập. Nó thay cho việc
tính thời gian di chuyển giữa từng tiết — vừa đơn giản hơn nhiều về thuật toán,
vừa đúng thực tế quản lý hơn (không ai xếp giáo viên chạy giữa buổi).

## Cách chấm điểm mềm

Điểm càng thấp càng nên chọn.

```
Toán, Tiếng Việt:      + 45 nếu rơi vào buổi chiều
                       + 5 × chỉ số tiết   (ưu tiên đầu buổi sáng)

GDTC, Mỹ thuật,        + 22 nếu rơi vào hai tiết đầu buổi sáng
Âm nhạc, HDTN

Cùng môn trong ngày    + 10 mỗi lần (môn chính) hoặc + 55 (môn khác)
Số tiết đã có trong ngày  + 3 mỗi tiết   (rải đều tuần)
Giáo viên đã có mặt       − 20            (gom tiết, đỡ phải chạy)
tại buổi đó, cùng điểm trường
```

## Hiệu năng

Với 25 lớp · 35 giáo viên · 710 tiết: **dưới 0,3 giây** trên trình duyệt.

Khi số lớp vượt 60, chuyển phần này vào Web Worker để không treo giao diện.

## Nâng cấp còn để ngỏ

- **Tối ưu cục bộ sau bước tham lam:** hoán đổi ngẫu nhiên hai tiết, giữ lại
  nếu tổng điểm mềm giảm. Chạy vài chục nghìn vòng chỉ mất vài giây.
- **Quay lui có giới hạn:** khi một tiết bế tắc, gỡ 2–3 tiết đã đặt gần nhất
  rồi thử lại thay vì bỏ cuộc ngay.
