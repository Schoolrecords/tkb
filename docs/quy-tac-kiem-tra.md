# Mười quy tắc kiểm tra khả thi

Chạy **trước** khi xếp thời khóa biểu.

Đây là tính năng có giá trị cao nhất với hiệu trưởng: nó cho biết vấn đề nhân
sự ngay từ tháng 8, lúc còn kịp xin thêm biên chế hoặc điều chỉnh phân công —
chứ không phải tuần đầu tháng 9.

| Mã | Nội dung | Mức | Cách phát hiện |
|---|---|---|---|
| R01 | Giáo viên vượt định mức 23 tiết | canh ≤2 · do >2 | tổng tiết theo giáo viên |
| R02 | Không đủ buổi để có mặt ở các điểm trường | **do** | xếp tham lam buổi × điểm trường |
| R03 | Kín ≥ 85% số buổi, không còn dự phòng | canh | buổi cần / buổi khả dụng |
| R04 | Lớp lệch số tiết chuẩn CT GDPT 2018 | canh | so với bảng chuẩn theo khối |
| R05 | Lớp vượt sức chứa khung giờ | do | tổng tiết lớp > tổng ô trong tuần |
| R06 | Lớp chưa có chủ nhiệm | canh | dò `lop.gvcn_id` |
| R07 | Chủ nhiệm bị phân công ở điểm trường khác | do | so điểm trường lớp CN với các lớp khác |
| R08 | Toàn trường thiếu năng lực giảng dạy | do | tổng tiết cần vs số GV × định mức |
| R09 | Trùng tên gọi giữa các giáo viên | goi | nhóm theo chữ cuối của họ tên |
| R10 | Xếp Tin học ở điểm trường chưa có phòng máy | do | dò `diem_truong.co_phong_tin` |

## R02 — quy tắc lõi

Với mỗi giáo viên:

1. Gom số tiết theo từng điểm trường
2. Sắp các buổi khả dụng theo số tiết giảm dần
3. Với mỗi điểm trường (nhiều tiết trước), lấy dần các buổi lớn nhất còn lại
   cho tới khi đủ tiết
4. Nếu hết buổi mà vẫn còn tiết → **thiếu buổi**

Vì một giáo viên không thể ở hai điểm trường trong cùng một buổi, việc phục vụ
3 điểm trường tốn ít nhất 3 buổi — kể cả khi tổng số tiết không nhiều.

## R09 — vì sao quan trọng

Dữ liệu thật của Trường TH Diễn Liên có bốn cặp trùng tên gọi: hai cô *Dung*,
hai cô *Linh*, hai cô *Hương*, hai cô *Oanh*. Thêm một cặp chỉ khác dấu là
*Thùy* / *Thủy*.

Phần mềm cũ xử lý bằng cách chắp vá thủ công, mỗi ca một kiểu (`Cô DungB`,
`Cô K.Oanh`, `Cô P.Hương`, `Cô Hòa HT`) nên máy không đọc ngược được.

Sau sáp nhập, ba trường gộp lại là khoảng 100 giáo viên — số cặp trùng tên
tăng theo cấp số nhân, và hai điểm trường hoàn toàn có thể có hai cô cùng
tên đầy đủ.

**Kết luận:** mọi bản ghi tham chiếu bằng `id`. Tên rút gọn chỉ là nhãn hiển
thị, sinh tự động, khi trùng thì tự thêm định danh theo quy tắc cố định
(`Cô Dung (1C)` / `Cô Dung (3A)`).
