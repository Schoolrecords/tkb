/* ==================================================================
   SINH TÀI LIỆU WORD "HƯỚNG DẪN XẾP THỜI KHOÁ BIỂU"
   chạy: node docs/anh-huong-dan/sinh-word.mjs
   ------------------------------------------------------------------
   Cùng cách `taiWord()` của app vẫn làm: HTML + khai báo khổ giấy của Word,
   ghi ra tệp `.doc`. Giữ nguyên dấu tiếng Việt, và nhà trường sửa lại được —
   thứ tệp PDF không cho.

   ⚠️ Ảnh nhúng thẳng dạng base64 để tệp đi một mình: gửi Zalo, chép USB, in
   ở tiệm đều không mất ảnh. Đổi lại tệp nặng ~6 MB, chấp nhận được vì đây là
   tài liệu phát một lần chứ không phải thứ tải mỗi ngày.

   Ảnh lấy từ src/anh-huong-dan/ — chụp bằng chup-huong-dan.mjs.
   ================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TEP = path.dirname(fileURLToPath(import.meta.url));
const GOC = path.join(TEP, '..', '..');
const ANH = path.join(GOC, 'src', 'anh-huong-dan');
const RA  = path.join(GOC, 'docs', 'Huong-dan-xep-Thoi-khoa-bieu.doc');

const thieu = [];
function anh(ten, chu) {
  const f = path.join(ANH, ten + '.png');
  if (!fs.existsSync(f)) { thieu.push(ten); return ''; }
  const b64 = fs.readFileSync(f).toString('base64');
  return `<div class="anh"><img src="data:image/png;base64,${b64}" alt="${chu}">
    <div class="chu">${chu}</div></div>`;
}

const HTML = `<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'>
<title>Hướng dẫn xếp Thời khoá biểu</title>
<style>
@page{size:A4 portrait;margin:2cm 2cm 2cm 2.5cm;mso-page-orientation:portrait}
body{font-family:'Times New Roman',serif;font-size:13pt;color:#000;line-height:1.45}
h1{font-size:16pt;text-align:center;text-transform:uppercase;margin:0 0 6pt}
h2{font-size:14pt;margin:20pt 0 8pt;color:#005391;border-bottom:1.5pt solid #005391;padding-bottom:3pt;
   page-break-after:avoid}
h3{font-size:13pt;margin:14pt 0 5pt;font-style:italic;page-break-after:avoid}
p{margin:0 0 7pt;text-align:justify}
ul{margin:0 0 8pt 20pt;padding:0}
li{margin-bottom:4pt;text-align:justify}
.anh{margin:10pt 0 12pt;text-align:center;page-break-inside:avoid}
.anh img{width:100%;border:1pt solid #B9C6D4}
.chu{font-size:11pt;font-style:italic;color:#444;margin-top:3pt}
.hop{border:1pt solid #B9C6D4;background:#F2F8FD;padding:8pt 11pt;margin:8pt 0}
.luuy{border-left:3pt solid #E8A33D;background:#FDF6EA;padding:8pt 11pt;margin:8pt 0}
.dau{text-align:center;margin-bottom:4pt}
.phu{font-size:11.5pt;font-style:italic;color:#333;text-align:center}
table.ml{width:100%;border-collapse:collapse;margin:8pt 0 14pt;font-size:12.5pt}
table.ml td{border:1pt solid #B9C6D4;padding:5pt 8pt}
table.ml td.b{width:22%;font-weight:700;background:#F2F8FD}
</style></head><body>

<p class='dau'><b>TRƯỜNG TIỂU HỌC ……………………………………</b></p>
<p class='phu'>Phần mềm Thời khoá biểu · Năm học 2026–2027</p>

<h1>Hướng dẫn xếp thời khoá biểu</h1>
<p class='phu'>Tài liệu dành cho cán bộ quản lý và người xếp thời khoá biểu</p>

<div class='hop'><b>Đọc trước một phút.</b> Cả việc gồm bảy bước. Bước 1 dài nhất nhưng
<b>chỉ làm một lần cho cả năm học</b>; sáu bước sau mỗi lần xếp lại chỉ mất vài phút.
Phần mềm mở bằng trình duyệt, không phải cài đặt gì.</div>

<table class='ml'>
<tr><td class='b'>Bước 1</td><td>Khai báo dữ liệu nhà trường</td></tr>
<tr><td class='b'>Bước 2</td><td>Kiểm tra khả thi trước khi xếp</td></tr>
<tr><td class='b'>Bước 3</td><td>Cố định môn vào giờ (nếu cần)</td></tr>
<tr><td class='b'>Bước 4</td><td>Xếp tự động</td></tr>
<tr><td class='b'>Bước 5</td><td>Tinh chỉnh bằng tay</td></tr>
<tr><td class='b'>Bước 6</td><td>Lưu, phiên bản và công bố</td></tr>
<tr><td class='b'>Bước 7</td><td>Xuất và in</td></tr>
</table>

<h2>Bước 1 · Khai báo dữ liệu nhà trường</h2>
<p>Mở nhóm <b>Dữ liệu nhà trường</b> ở thanh bên rồi đi lần lượt từ trên xuống. Mỗi màn hình
có nút <i>tiếp theo ›</i> đưa sang việc kế, không phải tự nhớ.</p>
<p><b>Nhanh hơn:</b> mỗi màn hình đều có nút <b>Nhập từ Excel</b> → <i>Tải mẫu về điền</i>.
Mẫu ra sẵn những gì đang có, chỉ việc gõ thêm rồi tải lên.</p>

<h3>1.1 · Thông tin trường</h3>
<p>Tên đơn vị, năm học, xã, tỉnh. Bốn thứ này in ở đầu mọi bản thời khoá biểu nên gõ cho đúng
ngay từ đầu.</p>
${anh('b1-1-thong-tin-truong', 'Mục Thông tin trường')}

<h3>1.2 · Phân hiệu</h3>
<p>Nhà trường có mấy nơi dạy học. Trường một điểm thì để nguyên một dòng. Sau sáp nhập thì thêm
từng phân hiệu, rồi bấm <i>Phân bổ lớp</i> để chia lớp về đúng nơi.</p>
${anh('b1-2-phan-hieu', 'Mục Phân hiệu — mỗi nơi dạy học một thẻ')}

<h3>1.3 · Khối và khung giờ</h3>
<p>Mỗi buổi học mấy tiết, khối nào tan sớm hơn. Ô kết luận dưới mỗi khối phải ghi <b>vừa đủ</b> —
còn <i>2 ô trống</i> nghĩa là học sinh khối ấy ngồi chơi 2 tiết mỗi tuần.</p>
${anh('b1-3-khung-gio', 'Số tiết mỗi buổi khai riêng cho từng khối')}

<h3>1.4 · Lớp học</h3>
<p>Bấm <b>Tạo lớp hàng loạt</b>: khai mỗi khối có mấy lớp là máy sinh đủ.</p>
<div class='luuy'><b>Trường không dùng chữ nào</b> — ví dụ bỏ chữ F — thì <b>xoá chữ ấy khỏi ô
“Chữ cái đặt tên lớp”</b>. Máy sẽ sinh 1A · 1B · 1C · 1D · 1E · <b>1G</b> · 1H · 1I.</div>
${anh('b1-4-tao-lop', 'Hộp Tạo lớp hàng loạt — xoá chữ cái nào trường không dùng')}
${anh('b1-5-lop-hoc', 'Bảng Lớp học — chọn chủ nhiệm ngay tại bảng')}

<h3>1.5 · Giáo viên</h3>
<p>Ghi <b>đủ họ tên</b> — trường 35 người đã có bốn cặp trùng tên gọi. Điền sẵn <b>Gmail</b> thì
thầy cô bấm <i>Đăng nhập bằng Google</i> là vào thẳng, không cần mã mời. Danh sách xếp
<b>chủ nhiệm trước, bộ môn sau</b>.</p>
${anh('b1-6-giao-vien', 'Bảng Giáo viên — cột Dạy do máy tự sinh, không gõ tay được')}

<h3>1.6 · Môn học và Phòng học</h3>
<p>Danh mục môn, màu trên lưới, môn nào ưu tiên sáng sớm, số tiết chuẩn từng khối. Trường thêm
môn tự chọn thì khai ở đây.</p>
<p>Phòng học chỉ khai phòng <b>dùng chung</b>: phòng máy, phòng nghệ thuật. Lớp học thường không
cần khai. Khai rồi thì máy không bao giờ xếp hai lớp vào một phòng cùng tiết.</p>
${anh('b1-7-mon-hoc', 'Mục Môn học — số tiết chuẩn từng khối')}

<h3>1.7 · Phân công chuyên môn</h3>
<p>Nguồn quan trọng nhất — sai ở đây thì xếp ra sai hết. Bảng dạng <b>ma trận</b>: hàng là giáo
viên, cột là môn, ô ghi lớp.</p>
${anh('b1-8-phan-cong', 'Bảng Phân công dạng ma trận')}
<p>Giáo viên bộ môn dạy hàng chục lớp thì đừng bấm từng ô: dùng <b>Phân công nhanh cho một giáo
viên</b> — chọn người, chọn môn, tích các lớp, một lần là xong.</p>
${anh('b1-9-phan-cong-nhanh', 'Hộp Phân công nhanh — một giáo viên, một môn, nhiều lớp')}

<h3>1.8 · Buổi bận</h3>
<p>Buổi nào thầy cô <b>không lên lớp được đều đặn hằng tuần</b> thì đánh dấu. Máy sẽ không xếp
tiết nào vào đó. Nghỉ một ngày cụ thể thì dùng mục <i>Báo nghỉ</i>, không phải ở đây.</p>
${anh('b1-10-buoi-ban', 'Buổi bận lặp lại hằng tuần, khác với báo nghỉ một ngày')}

<div class='luuy'><b>Khai xong nhớ bấm <i>Lưu</i></b> ở từng màn hình. Dải đỏ
<i>“● Có thay đổi chưa lưu”</i> cạnh nút Lưu là lời nhắc — còn dải ấy mà tải lại trang là mất
công vừa làm.</div>

<h2>Bước 2 · Kiểm tra khả thi trước khi xếp</h2>
<p>Vào mục <b>Kiểm tra khả thi</b>. Máy soát mười ba quy tắc và chỉ ra vướng mắc <i>trước</i> khi
xếp — lúc còn kịp điều chỉnh nhân sự, chứ không phải đến lúc xếp xong mới biết thiếu người.</p>
${anh('b2-kiem-tra-kha-thi', 'Mỗi vướng mắc kèm dòng Hướng xử lý')}
<ul>
<li><b>Mục đỏ</b> — phải xử lý, không thì chắc chắn có tiết không xếp được.</li>
<li><b>Mục cam</b> — nên xem lại, vẫn xếp được.</li>
<li><b>Mục xanh</b> — chỉ để biết, ví dụ trùng tên gọi giáo viên.</li>
</ul>
<p>Đây là chỗ đáng đọc kỹ nhất của cả phần mềm: nó cho biết vấn đề nhân sự từ tháng 8.</p>

<h2>Bước 3 · Cố định môn vào giờ (nếu cần)</h2>
<p>Có môn buộc phải học đúng một giờ nhất định — Tiếng Anh tăng cường do trung tâm về dạy chiều
thứ Năm chẳng hạn. Vào <b>Xếp thời khoá biểu</b> → <b>Cố định môn vào giờ</b> <i>trước khi</i>
bấm xếp.</p>
${anh('b3-1-man-xep', 'Nút Cố định môn vào giờ nằm cạnh hai nút xếp')}
<p>Chọn môn, chọn thứ · buổi · tiết, rồi tích những lớp áp dụng. Có nút chọn nhanh theo từng
<b>khối</b>.</p>
${anh('b3-2-co-dinh-mon', 'Hộp nói ngay lớp nào không đặt được và vì sao')}
<p>Hộp <b>nói trước</b> lớp nào không đặt được và vì sao — <i>lớp không học môn này</i>,
<i>khối ấy không có giờ đó</i>, hay <i>thầy cô đang dạy lớp khác cùng giờ</i>.</p>
<p>Tiết cố định mang dấu <b>📌</b>; khi xếp tự động máy xếp mọi môn khác quanh chúng,
<b>không bao giờ đè lên</b>. Chào cờ sáng thứ Hai và sinh hoạt lớp cuối sáng thứ Sáu thì máy tự
ghim sẵn, không phải khai.</p>

<h2>Bước 4 · Xếp tự động</h2>
<p>Vẫn ở mục <b>Xếp thời khoá biểu</b>, có hai nút:</p>
<ul>
<li><b>Xếp nhanh</b> — một phương án dùng được, trong khoảng một giây. Dùng để xem thử.</li>
<li><b>Xếp kỹ</b> — chạy vài phút, thử hàng chục cách rồi giữ lại vài phương án đẹp nhất để thầy
cô tự chọn. Bấm <i>Dừng lại</i> lúc nào cũng được, phương án tốt nhất tới lúc đó vẫn giữ.</li>
</ul>
${anh('b4-ket-qua-xep', 'Kết quả xếp — số tiết đã xếp và tiết nào chưa xếp được')}
<p>Máy làm hai việc liền nhau: xếp cái khó trước (giáo viên bộ môn dạy nhiều phân hiệu), rồi tinh
chỉnh hàng trăm lần để kéo Toán và Tiếng Việt về buổi sáng, bớt tiết trống kẹp giữa buổi, giảm số
lần thầy cô phải chạy sang phân hiệu khác.</p>
<p><b>Còn tiết chưa xếp được?</b> Máy liệt kê rõ từng trường hợp, gom theo <b>cách gỡ</b> — vướng
ai, gỡ thế nào, gỡ ra được mấy ô.</p>

<h2>Bước 5 · Tinh chỉnh bằng tay</h2>
<p>Máy xếp đúng ràng buộc, nhưng nhà trường còn ý riêng. Vào mục <b>Theo lớp</b> để chỉnh.</p>
${anh('b5-1-theo-lop', 'Màn hình Theo lớp — danh sách lớp bên trái, lưới bên phải')}
<ul>
<li><b>Chạm</b> (dùng được trên điện thoại) — chạm vào tiết cần chuyển, rồi chạm ô muốn đặt.
Chạm lại chính nó để bỏ chọn.</li>
<li><b>Kéo thả</b> (trên máy tính) — kéo tiết thả sang ô khác như quen.</li>
</ul>
<p>Khi đang cầm một tiết, lưới hiện <b>ba mức tín hiệu</b>:</p>
${anh('b5-2-ba-muc-tin-hieu', 'Ba mức tín hiệu — xanh, vàng và ô mờ')}
<ul>
<li><b>Ô xanh</b> — đổi tự do, không ảnh hưởng ai.</li>
<li><b>Ô vàng</b> — đổi được, <i>nhưng</i> chạm vào tiết của một giáo viên dạy nhiều lớp. Đây là
<b>lời nhắc, không phải cấm</b>: vẫn bấm được nếu nhà trường muốn.</li>
<li><b>Ô mờ</b> — vướng ràng buộc cứng, máy không cho đặt và nói rõ vì sao.</li>
</ul>
<div class='hop'><b>Cách làm quen thuộc:</b> cố định vài môn → <b>Xếp</b> → tiết nào ưng thì
<b>ghim</b> lại → <b>Xếp</b> lại cho máy tối ưu phần còn lại. Mỗi tiết chỉnh tay được đánh dấu 📌
và lần xếp sau máy giữ nguyên.</div>
<p>Lỡ tay thì bấm <b>Hoàn tác</b> hoặc <b>Ctrl + Z</b> — máy nhớ 20 bước gần nhất.</p>

<h2>Bước 6 · Lưu, phiên bản và công bố</h2>
<p>Bấm <b>Lưu lên máy chủ</b>. Mỗi lần lưu là một phiên bản mới, <b>không đè lên bản cũ</b>.</p>
${anh('b6-phien-ban', 'Mục Phiên bản và công bố')}
<ul>
<li>Hai người lưu cùng lúc thì máy gộp theo phạm vi của từng người — ba phó hiệu trưởng ba phân
hiệu cùng sửa một buổi tối cũng không ai mất công.</li>
<li><b>Khôi phục</b> bản cũ chỉ nạp lên màn hình; muốn chốt thì lưu lại thành bản mới.</li>
<li><b>Nhật ký thao tác</b> ghi ai lưu, ai công bố, ai nhập dữ liệu, lúc nào.</li>
</ul>
<p><b>Công bố cho giáo viên</b> là bước cuối. Thời khoá biểu chỉ hiện với thầy cô sau khi công bố.
Đây là <b>ban hành một văn bản</b>: máy hỏi <i>số hiệu</i>, <i>ngày thực hiện</i> và <i>học kỳ</i>,
rồi khoá ngày ký lại — in lại tháng sau vẫn ra đúng ngày ấy.</p>

<h2>Bước 7 · Xuất và in</h2>
<p>Mục <b>Toàn trường</b> để xem và dán bảng tin; mục <b>Xuất và in</b> để lấy tệp.</p>
${anh('b7-1-toan-truong', 'Thời khoá biểu toàn trường — mỗi lớp một cột')}
${anh('b7-2-xuat-in', 'Bốn loại bản in và tệp Excel nhiều trang')}
<ul>
<li><b>Bản in giấy</b> — một lớp và một giáo viên khổ A4 dọc; theo khối A4 ngang; toàn trường A3
ngang. Đủ thể thức: tên đơn vị, số hiệu, ngày thực hiện, hai chỗ ký.</li>
<li><b>Tệp Word</b> — tải về sửa lại được, thứ tệp PDF không cho.</li>
<li><b>Tệp Excel</b> — nhiều trang tính: toàn trường, theo lớp, theo giáo viên, từng khối, bảng
phân công.</li>
</ul>

<h2>Dùng trên điện thoại</h2>
<p>Mọi bước trên đều làm được trên điện thoại. Bấm dấu <b>☰</b> góc trái để mở thanh điều hướng.</p>
${anh('dt-1-ngan-keo', 'Bấm dấu ☰ để mở thanh điều hướng')}
${anh('dt-2-theo-lop', 'Chỉnh tay trên điện thoại — chạm chọn tiết rồi chạm ô muốn đặt')}

<div class='hop' style='margin-top:16pt'><b>Cần giúp?</b> Trong phần mềm có sẵn mục
<b>Hướng dẫn sử dụng</b> với đúng nội dung này, đọc theo vai trò của mình. Thầy cô chỉ xem lịch
thì đọc phần <i>Giáo viên</i>.</div>

</body></html>`;

fs.mkdirSync(path.dirname(RA), { recursive: true });
fs.writeFileSync(RA, HTML, 'utf8');
const mb = (fs.statSync(RA).size / 1048576).toFixed(1);
console.log('Đã ghi:', RA);
console.log('Kích thước:', mb, 'MB');
if (thieu.length) {
  console.log('⚠️ Thiếu ảnh:', thieu.join(', '));
  process.exit(1);
}
console.log('Đủ ảnh, không thiếu tấm nào.');
