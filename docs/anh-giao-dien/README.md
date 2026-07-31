# Ảnh chụp giao diện — quy trình ba bước

Chụp ngày **1/8/2026** bằng Chrome thật trên bản mã `src/index.html` hiện tại.
Chạy bằng dữ liệu mẫu của Trường TH Diễn Liên (25 lớp · 35 giáo viên · 710 tiết),
không có `src/cauhinh.js` nên không lộ số liệu máy chủ thật.

Máy tính chụp ở 1400×900 (riêng bản toàn trường 1600×1000), điện thoại ở 412×900.
Tỷ lệ 1× cho nhẹ — cả thư mục khoảng 3,4 MB.

## Máy tính

| Tệp | Màn hình | Xem điểm gì |
|---|---|---|
| `01-bang-dieu-hanh.png` | Bảng điều hành | Ba thẻ bước trên cùng, cả ba ✓ Xong vì dữ liệu đã đủ |
| `02-lop-hoc.png` | Bước 1 · Lớp học | Bảng sửa được tại chỗ; dải *Bước 1 — việc 4/16* và hai nút đi tiếp |
| `03-tao-lop-hang-loat.png` | Hộp thoại | Khai số lớp mỗi khối; dòng ví dụ mã lớp đổi theo tiền tố đang gõ |
| `04-mon-hoc.png` | Bước 1 · Môn học | Màu từng môn, cờ *ưu tiên sáng sớm* / *tránh đầu cuối buổi*, tiết chuẩn K1–K5 |
| `05-phan-cong.png` | Bước 1 · Phân công | Cột *Chuẩn* đối chiếu với số tiết đang khai; nút xoá từng dòng |
| `06-phan-cong-nhanh.png` | Hộp thoại | Chọn giáo viên → tích lớp; mỗi lớp hiện sẵn tiết chuẩn của khối đó |
| `07-toan-truong.png` | Bước 3 · Toàn trường | 25 cột lớp, cột *Giờ* đứng yên khi cuộn ngang, ô khối tan sớm ghi *nghỉ* |
| `08-theo-khoi.png` | Bước 3 · Theo khối | Các lớp cùng khối đặt cạnh nhau |
| `09-xuat-in.png` | Bước 3 · Xuất và in | Bốn thẻ: Excel · toàn trường và khối · theo lớp · theo giáo viên |
| `13-truong-moi-chua-co-gi.png` | Bảng điều hành | **Ảnh quan trọng nhất** — trường chưa khai gì, thanh tiến trình chỉ rõ từng việc thiếu, bấm được để tới thẳng |
| `14-thong-tin-truong.png` | Bước 1 · Thông tin trường | Logo trong ô tròn; nút **Lưu**; chỉ còn MỘT nút đăng nhập, ở góc trên phải |
| `15-diem-truong.png` | Bước 1 · Điểm trường | Nút **Tạo dữ liệu thử** thay cho *Mô phỏng sáp nhập 3 điểm trường* cũ |
| `16-tao-du-lieu-thu.png` | Hộp thoại | Khai tên điểm trường + số lớp; máy xem trước cách chia lớp cho từng khối |

## Điện thoại

| Tệp | Xem điểm gì |
|---|---|
| `10-dt-bang-dieu-hanh.png` | Ba thẻ bước xếp dọc; nhãn *BƯỚC 1 · KHAI BÁO* xoay dọc trên dải thanh bên |
| `11-dt-lop-hoc.png` | Hai nút điều hướng mỗi nút một dòng trọn chiều ngang, không gãy chữ |
| `12-dt-toan-truong.png` | Lưới rộng cuộn ngang trong khung của chính nó, thân trang không cuộn ngang |

## Chụp lại

Ảnh sẽ cũ đi mỗi lần sửa giao diện. Chụp lại bằng:

```bash
npm install --no-save jsdom playwright-core exceljs   # một lần, dùng Chrome sẵn có trên máy
node docs/anh-giao-dien/chup.mjs
```

Phải cài **cả ba gói trong cùng một lệnh**. Chạy riêng `npm install --no-save jsdom`
là npm gỡ mất hai gói kia — `npm run soi` sẽ chết.

## Khi nào cần chụp lại

**Cần** khi sửa thứ người dùng nhìn thấy: CSS, bố cục, thanh bên, thứ tự màn
hình, câu chữ trên giao diện, hoặc đổi dữ liệu mẫu.

**Không cần** khi sửa thuật toán, tầng dữ liệu, tệp SQL, hay thêm một quy tắc
chỉ hiện trong điều kiện đặc biệt. Ví dụ: thêm ràng buộc phòng chức năng và quy
tắc R12 không đổi một điểm ảnh nào — đã kiểm bằng cách chụp ra chỗ khác rồi so.

Cách kiểm rẻ nhất, trước khi thay 3,4 MB ảnh trong kho mã:

```bash
mkdir -p /tmp/anh-cu && cp docs/anh-giao-dien/*.png /tmp/anh-cu/
node docs/anh-giao-dien/chup.mjs
for f in docs/anh-giao-dien/*.png; do
  cmp -s "$f" "/tmp/anh-cu/$(basename $f)" || echo "ĐÃ KHÁC: $(basename $f)"
done
```

⚠️ **Ba tấm không tin `cmp` được:** `01`, `10`, `13` đều là Bảng điều hành, mà
màn hình này **in ngày hôm nay** lên góc phải. Chụp vào ngày khác là ba tấm ấy
khác dù giao diện không đổi gì — phải nhìn mắt.

## Vì sao giữ bộ ảnh này

Không chỉ để làm tài liệu. **Chụp ảnh là một phép thử, và nó bắt được thứ
`npm run soi` mù**: soi chạy jsdom, mà jsdom **không tính bố cục** — không biết
chữ có gãy dòng, nút có tràn, nhãn có bị `display:none` che mất hay không.

Ba lỗi đã bắt được đúng theo cách đó, cả ba đều lọt qua bộ phép thử jsdom:

- Trên điện thoại nhãn *BƯỚC 1 · KHAI BÁO* bị CSS cũ giấu mất.
- Nút *"‹ Khối và khung giờ"* gãy làm ba dòng trên màn hình hẹp.
- Hộp *Tạo lớp hàng loạt* ghi ví dụ `DL-1A` khi ô tiền tố đang trống.
