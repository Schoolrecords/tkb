# Một buổi tối trên máy chủ — ba việc trước khai giảng

> Soạn 3/8/2026. Ba việc dưới đây làm **theo đúng thứ tự**, tổng cộng
> khoảng 30–45 phút. Việc 1 và 2 làm trong **Supabase → SQL Editor**;
> việc 3 làm ngay trong phần mềm.
>
> Nguyên tắc chung: mọi tệp SQL của dự án đều **chạy lại nhiều lần không
> sao** (trừ tệp dọn điểm trường thử — có ba chốt an toàn riêng, xem 2.4),
> và tệp *soi* thì **chỉ đọc, không sửa gì**. Cứ bình tĩnh làm từng bước.

---

## Việc 0 · Sao lưu trước đã (2 phút)

Mở phần mềm, đăng nhập quản trị → nhóm **HỆ THỐNG → Sao lưu dữ liệu**
→ **Tải bản sao lưu**. Một tệp `.json` về máy — có nó thì mọi bước sau
đều có đường lui.

---

## Việc 1 · Chạy `db/cai-dat.sql` (5 phút)

**Vì sao:** máy chủ đang thiếu bảng `bao_nghi` và hai cột mới của
`day_thay`. Ba tính năng vừa làm ngày 3/8 — **Báo nghỉ**, **Báo nghỉ hộ**,
**bảng Ngày công** — đều đọc ghi bảng đó. Chưa chạy thì app vẫn mở bình
thường, nhưng bấm gửi báo nghỉ là nhận câu *"máy chủ chưa có bảng báo
nghỉ"*. Tệp này cũng vá luôn quy tắc `p_truong_sua` — không có nó thì đổi
tên trường (việc sắp phải làm khi có quyết định sáp nhập) lưu bao nhiêu
lần cũng không ăn.

**Cách làm:**

1. Vào [supabase.com](https://supabase.com) → mở dự án → **SQL Editor**
   → **New query**.
2. Mở tệp `db/cai-dat.sql` trong thư mục dự án, chép **toàn bộ** nội dung,
   dán vào ô lệnh.
3. Bấm **Run**. Chờ vài giây. Kết quả hiện ra là của câu lệnh cuối cùng
   (kiểm tra hàm `dang_ky_truong`) — **một dòng, cột
   `security_definer = true`** là tệp đã chạy hết.

**Đối chiếu cho chắc** — dán riêng khối này vào một query mới, bấm Run:

```sql
-- 1) Quy tắc RLS: bao_nghi phải đủ 4 dòng, truong phải có p_truong_sua
select tablename, policyname, cmd
from pg_policies
where tablename in ('bao_nghi', 'truong', 'tkb_phien_ban')
order by tablename, cmd;

-- 2) Hai cột mới của day_thay: phải ra đúng 2 dòng
select column_name from information_schema.columns
where table_name = 'day_thay' and column_name in ('da_xem', 'bao_nghi_id');

-- 3) Chốt chặn "một giáo viên một tiết": phải ra đúng 1 dòng
select indexname from pg_indexes
where tablename = 'day_thay' and indexname = 'ux_day_thay_gv_mot_tiet';
```

Đọc kết quả:

| Phải thấy | Nghĩa là |
|---|---|
| `bao_nghi` có 4 dòng: `p_bao_nghi_doc` (SELECT) · `p_bao_nghi_gui` (INSERT) · `p_bao_nghi_huy` (DELETE) · `p_bao_nghi_sua` (UPDATE) | báo nghỉ và báo nghỉ hộ hoạt động |
| `truong` có `p_truong_sua` (UPDATE) | đổi tên trường lưu được |
| `tkb_phien_ban` có `p_tkb_sua` (UPDATE) | nút Công bố hoạt động |
| 2 cột `da_xem`, `bao_nghi_id` | nút "Đã xem" của giáo viên hoạt động |
| chỉ số `ux_day_thay_gv_mot_tiet` | hai máy phân công cùng lúc không đè nhau |

**Thử trên app:** tải lại trang (F5), vào **Dạy thay → Báo nghỉ hộ giáo
viên**, ghi thử một báo nghỉ cho ngày mai → mở **Ngày công** xem có dòng
0,5 công → quay lại xoá (nút Huỷ ở màn Báo nghỉ của người đó, hoặc Đánh
dấu đã xử lý rồi thôi). Trơn tru là xong việc 1.

---

## Việc 2 · Soi rồi dọn hồ sơ thừa (15–20 phút)

**Vì sao:** bộ dữ liệu thử và lỗi upsert hôm 2/8 để lại trên máy chủ
những hồ sơ giáo viên trùng tên **0 tiết**. Phát mã mời mà còn chúng là
sớm muộn có thầy cô nối nhầm vào hồ sơ rỗng → đăng nhập xong màn hình
trắng (sự cố cô Oanh). **Dọn xong rồi mới phát mã** — đó là lý do việc 2
đứng trước việc 3.

### 2.1 · Soi trước — tệp này CHỈ ĐỌC

Dán toàn bộ `db/soi-tai-khoan-gv.sql` vào query mới → Run. Ra một bảng,
đọc **cột `ket_luan`** từ trên xuống:

| Hàng mục | Đọc thế nào |
|---|---|
| 1 · Số trường | Phải là **1 trường**. Nhiều hơn → có tài khoản có thể đang lạc trường. |
| 2 · Bản đang công bố | ❌ "CHƯA CÔNG BỐ" → ghi nhớ: trước khi phát mã (việc 3) phải bấm **Công bố cho giáo viên**, không thì thầy cô nào vào cũng trắng màn hình. |
| 3 · Bản mới nhất | ⚠️ "đang xem bản CŨ" → công bố lại bản mới nhất. |
| 4 · Từng tài khoản | Từng dòng nói thẳng tài khoản ấy vào app sẽ thấy gì. Dòng ❌ nào cũng kèm cách sửa. |
| 5 · Trùng tên | Bốn cặp Dung · Linh · Hương · Oanh (và Thùy/Thủy). ❌ "nối vào hồ sơ KHÔNG có tiết nào" → gần như chắc chắn nối nhầm. |
| 6 · Đã có tài khoản | Bao nhiêu / tổng số — số còn lại là số mã mời cần phát ở việc 3. |
| 7 · Mã mời đã phát | Để biết, không phải sửa. |

Chụp màn hình bảng này lại — lát nữa chạy lại để so.

### 2.2 · Hồ sơ trùng, hồ sơ 0 tiết, tài khoản nối nhầm → `db/don-mot-lan.sql`

Nếu mục 4/5 ở trên có ❌ về hồ sơ rỗng hoặc nối nhầm: dán toàn bộ
`db/don-mot-lan.sql` → Run. Nó tự làm ba bước **đúng thứ tự**: nối tài
khoản từ hồ sơ 0 tiết về hồ sơ cùng tên có tiết (chỉ khi có đúng một ứng
viên — không đoán bừa) → xoá bản thừa không còn dính gì → in báo cáo.
Chạy lại nhiều lần không sao; còn bản trùng nào giữ lại thì báo cáo nói
rõ chốt nào đang giữ.

### 2.3 · Tài khoản thử đuôi `@tkb.local` → `db/don-tai-khoan-thu.sql`

Chỉ cần nếu ngày trước từng cấp tài khoản hàng loạt kiểu cũ. Mở tệp,
**bôi đen riêng phần "Xem trước sẽ xoá những ai"** chạy trước, ưng rồi
mới chạy phần xoá. Chỉ xoá tài khoản đăng nhập — hồ sơ giáo viên, phân
công, thời khóa biểu giữ nguyên.

### 2.4 · Điểm trường thử còn trên máy chủ → `db/don-diem-truong-thu.sql`

⚠️ **Tệp duy nhất trong buổi này XOÁ DỮ LIỆU — đọc kỹ đầu tệp trước.**
Chỉ cần nếu đã bấm *Tạo dữ liệu thử* (Diễn Đồng, Diễn Thái giả) rồi **Lưu
lên máy chủ**. Phải **sửa dòng `v_don`** ghi đúng tên đầy đủ các điểm
trường cần dọn, khớp từng chữ kể cả dấu. Ba chốt an toàn: tên không khớp
→ dừng; lớp có phân công thật → dừng; lỗi giữa chừng → hoàn nguyên hết.

### 2.5 · Soi lại lần nữa

Chạy lại `db/soi-tai-khoan-gv.sql`. Mọi dòng phải là ✅ hoặc ℹ️ — còn ❌
nào thì đọc câu kết luận của chính dòng đó, nó nói thẳng bước tiếp.

### ⚠️ Bẫy quan trọng nhất của cả buổi

Dọn xong trên máy chủ thì **bấm F5 tải lại phần mềm TRƯỚC KHI bấm Lưu ở
bất kỳ màn khai báo nào**. Trang đang mở còn giữ danh sách cũ trong bộ
nhớ — bấm Lưu là ghi trả toàn bộ hồ sơ vừa xoá lên máy chủ lại.

---

## Việc 3 · Phát quyền cho 35 thầy cô (làm sau cùng)

Điều kiện đã đủ: bảng `bao_nghi` có (việc 1), hồ sơ sạch (việc 2). Còn
hai bước:

1. **Công bố trước** — Xếp thời khóa biểu → **Công bố cho giáo viên**.
   Giáo viên chỉ đọc được bản đã công bố; quên bước này là 35 người cùng
   thấy màn hình trắng.
2. **Mục Giáo viên → hộp Mã mời → Tạo N mã** — làm cả mẻ một cú bấm, có
   nút chép và tải Excel. Gửi Zalo **từng người một mã** (mã dùng một
   lần, hạn 30 ngày). Hai nhóm phần mềm cố ý bỏ qua: người đã có tài
   khoản, và hồ sơ không có dòng phân công nào.

Thầy cô nào báo "không thấy lịch": chạy lại `db/soi-tai-khoan-gv.sql`,
tìm dòng tài khoản của người đó — cột kết luận chỉ đúng một trong năm
nguyên nhân kèm cách sửa, không phải đoán.
