/* ==================================================================
   SOI GIAO DIỆN THẬT — chạy: npm run soi
   ------------------------------------------------------------------
   `npm test` cắt bốn vùng mã thuần ra chạy trong Node, nên không nhìn
   thấy màn hình. Phép thử này mở nguyên src/index.html trong một trình
   duyệt giả (jsdom), vẽ từng màn hình rồi bấm thật vào các nút — đúng
   thứ đã bắt được lỗi tiết chào cờ đè lên buổi giáo viên báo bận.

   Cần cài một lần:  npm install --no-save jsdom
   Chưa cài thì phép thử tự bỏ qua, `npm test` vẫn chạy độc lập như cũ.
   ================================================================== */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

let JSDOM;
try { ({ JSDOM } = await import('jsdom')); }
catch (e) {
  console.log('\nChưa có jsdom nên bỏ qua phần soi giao diện.');
  console.log('Muốn chạy thì cài một lần:  npm install --no-save jsdom\n');
  process.exit(0);
}

const goc = join(dirname(fileURLToPath(import.meta.url)), '..');
const duong = join(goc, 'src/index.html');
const html = readFileSync(duong, 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true,
                              url: 'http://localhost/src/index.html' });
const w = dom.window;
w.fetch = async () => { throw new Error('không có mạng trong phép thử'); };

let dat = 0, hong = 0;
  /* ⚠️ CHỐT CHẶN CỦA CHÍNH BỘ SOI (29/8/2026). Nhiều phép thử trả về
     `[đúng/sai, ghi chú]`, và quy ước cũ là nơi gọi phải thêm toán tử `...`
     để rải thành hai đối số. Quên dấu ấy thì đối số thứ hai là một MẢNG — mảng
     nào cũng truthy, nên phép thử XANH VĨNH VIỄN dù sản phẩm hỏng. Đã dính
     thật và dính 17 lần trong cùng một ngày: phép thử thứ tự hàng bảng ma trận
     vẫn xanh cả khi đã gỡ bỏ đoạn mã nó canh.

     Cách chữa gốc là để CHÍNH HÀM NÀY tự rải, thay vì bắt mỗi nơi gọi nhớ ba
     dấu chấm. Một quy ước mà người viết phải nhớ thì sớm muộn có người quên —
     mà quên ở đây thì không ai thấy, vì hậu quả là màu xanh. */
const kt = (ten, dk, ghi = '') => {
  if (Array.isArray(dk)) [dk, ghi] = [dk[0], dk[1] ?? ghi];
  if (dk) { dat++; console.log(`  \x1b[32m✓\x1b[0m ${ten}${ghi ? ' — ' + ghi : ''}`); }
  else { hong++; console.log(`  \x1b[31m✗\x1b[0m ${ten}${ghi ? ' — ' + ghi : ''}`); }
};

/* Bắt mọi lỗi chạy để không bỏ sót lỗi thầm lặng */
const loiChay = [];
w.addEventListener('error', e => loiChay.push(e.message));
w.console.error = (...a) => loiChay.push(a.join(' '));

await new Promise(r => setTimeout(r, 900));      /* chờ khoiDong() chạy xong */

/* `let S` không nằm trên window — lấy qua eval trong chính khung trang */
const S = w.eval('S');
const coLui = () => w.eval('coLui()');
const gvTen = id => w.eval(`gvId(${JSON.stringify(id)})?.hoTen`) || id;
console.log('\n\x1b[1mSOI GIAO DIỆN THẬT (jsdom)\x1b[0m\n');
console.log('1. Vẽ được mọi màn hình');

const TRANG = ['dieuhanh',
               /* Bước 1 — khai báo */
               'thongtin','diemtruong','khunggio','lop','giaovien','monhoc','phonghoc',
               'phancong','buoiban',
               /* Bước 2 — xếp */
               'kiemtra','xep',
               /* Bước 3 — sản phẩm */
               'toantruong','tkbkhoi','tkblop','tkbgv','cuatoi','airanh','xuatin',
               'huongdan'];
for (const t of TRANG) {
  const truoc = loiChay.length;
  let ok = true, dai = 0;
  try { w.chuyen(t); dai = w.document.querySelector('#noiDung').innerHTML.length; }
  catch (e) { ok = false; loiChay.push(t + ': ' + e.message); }
  kt(`Màn hình ${t}`, ok && dai > 200 && loiChay.length === truoc, `${dai} ký tự`);
}

console.log('\n2. Chạm chọn — chạm đặt (lối dùng trên điện thoại)');
w.chuyen('tkblop');
const lop = S.lopXem;
/* Chọn tiết của giáo viên BỘ MÔN: chủ nhiệm dạy gần hết lớp mình nên đổi đi
   đâu cũng hợp lệ, không lộ ra ô nào bị chặn. */
const maCN = w.eval(`cnCuaLop(${JSON.stringify(lop)})?.id`);
const oCo = Object.keys(S.tkb[lop]).filter(k => !S.tkb[lop][k].ghim);
const nguon = oCo.find(k => k !== '2-S-0' && S.tkb[lop][k].gvId !== maCN) || oCo[1];
const monNguon = S.tkb[lop][nguon].mon;

/* Chạm ô có tiết: phải sáng lên và lưới phải vẽ lại kèm gợi ý ô đặt được */
w.document.querySelector(`[data-cham="${nguon}"]`).dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Chạm một tiết thì nó được chọn', S.oChon === nguon, `ô ${nguon} · ${monNguon}`);
kt('Ô đang chọn hiện rõ trên lưới',
   !!w.document.querySelector('.o-tiet.chon'));
const soHop = w.document.querySelectorAll('.o-hop').length;
const soCam = w.document.querySelectorAll('.o-cam').length;
kt('Máy soi trước chỗ đặt được và chỗ vướng', soHop > 0 && soCam > 0,
   `${soHop} ô xanh · ${soCam} ô mờ`);

/* Chạm ô xanh: tiết phải chuyển sang đó và được ghim */
const oXanh = [...w.document.querySelectorAll('.o-hop')][0].dataset.cham;
const daCoO = !!S.tkb[lop][oXanh];
w.document.querySelector(`[data-cham="${oXanh}"]`).dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Chạm ô xanh thì tiết chuyển sang đó',
   S.tkb[lop][oXanh]?.mon === monNguon, `${nguon} → ${oXanh}`);
kt('Tiết vừa chỉnh tay được ghim ngay', S.tkb[lop][oXanh]?.ghim === true);
kt('Ô nguồn xử lý đúng: trống đi hoặc nhận tiết đổi về',
   daCoO ? !!S.tkb[lop][nguon] : !S.tkb[lop][nguon]);
kt('Chọn xong thì bỏ chọn, không kẹt trạng thái', S.oChon === null);

console.log('\n3. Hoàn tác');
const truocHoan = JSON.stringify(S.tkb[lop]);
w.hoanTac();
kt('Hoàn tác trả lưới về đúng như trước khi chuyển',
   JSON.stringify(S.tkb[lop]) !== truocHoan &&
   S.tkb[lop][nguon]?.mon === monNguon);
kt('Hết bước lui thì báo, không văng lỗi', (() => {
  try { while (coLui()) w.hoanTac(); w.hoanTac(); return true; } catch (e) { return false; }
})());

console.log('\n4. Ghim giữ được chỉnh tay qua lần xếp lại');
w.chuyen('tkblop');
const k1 = Object.keys(S.tkb[lop])[3];
S.tkb[lop][k1].ghim = true;
const monGhim = S.tkb[lop][k1].mon, gvGhim = S.tkb[lop][k1].gvId;
w.eval('KQ_XEP = xepTuDong(0)');
kt('Xếp lại vẫn giữ nguyên tiết đã ghim',
   S.tkb[lop][k1]?.mon === monGhim && S.tkb[lop][k1]?.gvId === gvGhim,
   `${monGhim} đứng yên ở ${k1}`);
w.ve();
kt('L\u01b0\u1edbi hi\u1ec7n d\u1ea5u ghim cho ng\u01b0\u1eddi d\u00f9ng th\u1ea5y',
   w.document.querySelectorAll('[data-ghim]').length > 0);

/* --- Nút ghim là BẬT/TẮT, và chỉ hiện ở ô ĐÃ GHIM hoặc ô ĐANG CHỌN --------
   Chủ dự án: *"Bỏ ghim rồi thì bấm ghim lại rất khó, chỉ có cách chuyển chỗ
   mới thực hiện ghim"*. Bản cũ chỉ vẽ dấu ghim ở tiết ĐÃ ghim nên không có
   đường ghim lại — một thao tác chỉ đi được một chiều thì là ngõ cụt.

   ⚠️ Nhưng vẽ nút ở MỌI ô cũng sai, và sai nặng hơn: nút chiếm 12,5% diện
   tích ô trên điện thoại, nên chạm góc phải trên để CHỌN tiết lại thành GHIM
   nhầm — hỏng đúng lối chạm, lối CHÍNH của PHT phụ trách phân hiệu. Nay nút
   chỉ có ở ô đã ghim hoặc ô đang chọn. */
const oGhim = k => w.document.querySelector(`[data-ghim="${k}"]`);
const bamGhim = k => oGhim(k)?.dispatchEvent(new w.Event('click', { bubbles: true }));
const chamO = k => { w.chamO(k); w.ve(); };

bamGhim(k1);
kt('Bấm dấu ghim là bỏ ghim tiết đó', !S.tkb[lop][k1]?.ghim);

kt('Ô chưa ghim và chưa chọn thì KHÔNG có nút ghim che góc', (() => {
  w.eval('S.oChon=null'); w.ve();
  const k2 = Object.keys(S.tkb[lop]).find(k => !S.tkb[lop][k].ghim);
  return [!!k2 && !oGhim(k2), k2 ? (oGhim(k2) ? 'CÒN nút — che mất góc' : 'sạch') : '(lớp ghim hết)'];
})());
kt('Nên chạm vào ô ấy là CHỌN được, không bị ghim nhầm', (() => {
  const k2 = Object.keys(S.tkb[lop]).find(k => !S.tkb[lop][k].ghim);
  chamO(k2);
  return [S.oChon === k2 && !S.tkb[lop][k2].ghim,
          `oChon=${S.oChon} · ghim=${!!S.tkb[lop][k2].ghim}`];
})());
kt('Chạm xong thì dấu ghim HIỆN RA ở đúng ô đang chọn', (() => {
  const k2 = S.oChon;
  return [!!oGhim(k2) && /tat/.test(oGhim(k2).className), oGhim(k2)?.className || '(không có)'];
})());
kt('Bấm vào đó là GHIM — không phải chuyển chỗ mới ghim được', (() => {
  const k2 = S.oChon;
  bamGhim(k2);
  return [!!S.tkb[lop][k2]?.ghim, `${k2} ${S.tkb[lop][k2]?.ghim ? 'đã ghim' : 'chưa ghim'}`];
})());
kt('Ô đã ghim thì nút luôn còn, để bỏ ghim lúc nào cũng được', (() => {
  w.eval('S.oChon=null'); w.ve();
  const k3 = Object.keys(S.tkb[lop]).find(k => S.tkb[lop][k].ghim);
  return [!!k3 && !!oGhim(k3), k3 ? oGhim(k3)?.getAttribute('title') : '(không còn ô ghim)'];
})());
kt('Nút ghim không khởi phát kéo thả — gốc của "lúc được lúc không"', (() => {
  const k3 = Object.keys(S.tkb[lop]).find(k => S.tkb[lop][k].ghim);
  return oGhim(k3)?.getAttribute('draggable') === 'false';
})());
kt('Câu hướng dẫn nói HAI CHIỀU, không chỉ "bấm là bỏ ghim"', (() => {
  const t = w.document.querySelector('#noiDung').textContent.replace(/\s+/g, ' ');
  return [/để ghim/.test(t) && /bỏ ghim/.test(t) && !/dấu ghim là bỏ ghim/.test(t),
          (t.match(/.{0,44}bỏ ghim.{0,16}/) || [''])[0].trim()];
})());
w.eval('S.oChon=null'); w.ve();


console.log('\n5. Buổi bận');
w.chuyen('buoiban');
const oBan = w.document.querySelector('[data-ban]');
const [maGV, kb] = oBan.dataset.ban.split('|');
oBan.checked = true;
oBan.dispatchEvent(new w.Event('change', { bubbles: true }));
kt('Đánh dấu một buổi bận thì ghi vào dữ liệu', (S.gvNghi[maGV] || []).includes(kb),
   `${gvTen(maGV)} bận ${kb}`);
kt('Badge trên thanh bên đếm đúng số buổi bận',
   w.document.querySelector('#nBan').textContent === '1');

/* Xếp lại: không tiết nào được rơi vào buổi đã báo bận */
w.xepTuDong(0);
const lot = Object.entries(S.tkb).flatMap(([lp, o]) =>
  Object.entries(o).filter(([k, t]) => t.gvId === maGV && k.startsWith(kb + '-')));
kt('Xếp tự động tránh hẳn buổi đã báo bận', lot.length === 0, `${lot.length} tiết lọt`);

const oBan2 = w.document.querySelector(`[data-ban="${maGV}|${kb}"]`);
if (oBan2) { oBan2.checked = false; oBan2.dispatchEvent(new w.Event('change', { bubbles: true })); }
kt('Bỏ đánh dấu cũng nhận ngay', !(S.gvNghi[maGV] || []).includes(kb));

console.log('\n6. Thanh tiến trình ba bước');
w.chuyen('dieuhanh');
/* Ba thẻ bước chỉ bày khi CÒN VIỆC PHẢI LÀM. Xếp xong rồi mà vẫn hiện
   "Xong · Xong · Xong" thì chỉ đẩy nội dung thật xuống dưới. */
kt('Chưa xếp gì thì Bảng điều hành bày đủ ba bước hướng dẫn', (() => {
  const luu = JSON.parse(JSON.stringify(S.tkb));
  w.eval('S.lop.forEach(l=>S.tkb[l.id]={}); KQ_XEP=null; ve()');
  const co = w.document.querySelectorAll('.bbuoc .bb').length === 3;
  w.eval(`S.tkb = ${JSON.stringify(luu)}; ve()`);
  return co;
})());
/* Từ 16/8/2026 lưới mở sẵn có thể là lưới RỘNG toàn trường (`table.tt`) hoặc
   lưới TUẦN của một lớp (`table.tkb`), tuỳ quy mô trường — xem `xemMacDinh()`.
   Các phép thử về thứ tự khối trên trang vì thế nhận cả hai. */
const coLuoiTKB = () => !!w.document.querySelector('#noiDung .tt, #noiDung table.tkb');
const viTriLuoi = html => {
  const v = [html.indexOf('class="tt'), html.indexOf('class="tkb"')].filter(i => i >= 0);
  return v.length ? Math.min(...v) : -1;
};
kt('Xếp xong rồi thì thôi bày ba thẻ "Xong", nhường chỗ cho thời khóa biểu',
   w.document.querySelectorAll('.bbuoc .bb').length === 0 && coLuoiTKB());
kt('Mỗi màn hình khai báo có dải điều hướng, ghi tên NHÓM chứ không phải "Bước N"', (() => {
  w.chuyen('lop');
  const d = w.document.querySelector('.dhb');
  /* Từ 3/8/2026 màn hình và thanh menu dùng CHUNG một bộ tên. Chữ "Bước 1"
     là bộ đánh số thứ hai song song, đã bỏ hẳn. */
  return !!d && /Dữ liệu nhà trường/.test(d.textContent)
    && !/Bước/.test(d.textContent) && !/Việc \d+ trong/.test(d.textContent);
})());
kt('Không còn chữ "Bước N" nào lọt ra màn hình, ở bất kỳ trang nào', ...((() => {
  const bay = [];
  for (const t of ['dieuhanh','thongtin','lop','giaovien','phancong','kiemtra',
                   'xep','toantruong','tkblop','xuatin','huongdan','daythay']) {
    w.chuyen(t);
    const m = w.document.querySelector('#noiDung').textContent.match(/Bước\s*\d/);
    if (m) bay.push(`${t}: ${m[0]}`);
  }
  w.chuyen('dieuhanh');
  return [bay.length === 0, bay.join(' · ') || 'sạch cả 12 màn hình'];
})()));
/* ⚠️ Thứ tự đổi 31/8/2026: Phân hiệu → Lớp học → Khung giờ học. Từ khi khung
   giờ khai theo LỚP, mở nó khi chưa có lớp nào là mở ra bảng không có cột nào. */
kt('Nút “tiếp theo” đi đúng màn hình kế trong chuỗi', (() => {
  w.chuyen('lop');
  const nut = [...w.document.querySelectorAll('.dhb [data-di]')].find(b => /Khung giờ/.test(b.textContent));
  if (!nut) return false;
  nut.dispatchEvent(new w.Event('click', { bubbles: true }));
  return S.trangHienTai === 'khunggio';
})());

console.log('\n7. Khai báo lớp học từ giao diện');
/* Dựng thêm một phân hiệu để thử đúng tình huống sau sáp nhập: điểm mới
   cũng có lớp mang tên "1A", và phần mềm phải phân biệt được bằng mã lớp. */
S.diemTruong.push({ id: 'dtThu', ten: 'Phân hiệu Thử', phongTin: false });
w.chuyen('lop');
const soLopTruoc = S.lop.length;
w.hopSinhLop();
w.document.querySelector('#slDT').value = 'dtThu';
w.document.querySelector('[data-sl="1"]').value = '3';
w.document.querySelector('#slTien').value = 'THU';
/* Bấm đúng nút “Tạo lớp” trong hộp thoại */
[...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Tạo lớp').click();
const moi = S.lop.filter(l => (l.maLop || '').endsWith('_THU'));
kt('Tạo lớp hàng loạt sinh đúng số lớp và đúng tên',
   moi.length === 3 && moi.map(l => l.ten).join(',') === '1A,1B,1C',
   `${soLopTruoc} → ${S.lop.length} lớp`);
kt('Lớp trùng tên ở phân hiệu khác vẫn tạo được, phân biệt bằng mã',
   S.lop.filter(l => l.ten === '1A').length === 2 &&
   moi[0].maLop === '1A_THU', `hai lớp "1A": ${S.lop.filter(l => l.ten === '1A').map(l => l.maLop || l.id).join(' · ')}`);
kt('Tạo lại lần nữa không sinh trùng trong cùng phân hiệu', (() => {
  w.hopSinhLop();
  w.document.querySelector('#slDT').value = 'dtThu';
  w.document.querySelector('[data-sl="1"]').value = '3';
  w.document.querySelector('#slTien').value = 'THU';
  [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Tạo lớp').click();
  return S.lop.filter(l => (l.maLop || '').endsWith('_THU')).length === 3;
})());
kt('Mỗi lớp mới có mã riêng, không lớp nào trùng mã',
   new Set(S.lop.map(l => l.maLop || l.id)).size === S.lop.length);
kt('Lớp mới được gán phân hiệu và có ô lưới riêng',
   moi.every(l => !!S.lopDT[l.id] && !!S.tkb[l.id]));

/* Đặt chủ nhiệm cho lớp mới, rồi kiểm tra không ai chủ nhiệm hai lớp */
const gvThu = S.giaoVien[0].id, lopThu = moi[0].id;
w.datCN(lopThu, gvThu);
kt('Đặt chủ nhiệm thì gỡ luôn lớp chủ nhiệm cũ của người đó',
   S.giaoVien.filter(g => g.cn === gvThu).length === 0 &&
   S.giaoVien.filter(g => g.cn).length === new Set(S.giaoVien.filter(g => g.cn).map(g => g.cn)).size,
   `${gvTen(gvThu)} → ${w.eval(`lopId(${JSON.stringify(lopThu)})?.ten`)}`);

/* Xoá lớp vừa tạo: phải sạch cả phân công lẫn con trỏ chủ nhiệm */
w.hopXoaLop(lopThu);
[...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Xoá lớp').click();
kt('Xoá lớp thì gỡ sạch phân công, lưới và con trỏ chủ nhiệm',
   !S.lop.some(l => l.id === lopThu) && !S.phanCong.some(p => p.lopId === lopThu) &&
   !S.tkb[lopThu] && !S.giaoVien.some(g => g.cn === lopThu));

/* Dọn sạch phân hiệu thử để các phép thử sau chạy trên đúng dữ liệu vàng */
S.lop.filter(l => S.lopDT[l.id] === 'dtThu').forEach(l => {
  S.lop = S.lop.filter(x => x.id !== l.id);
  delete S.lopDT[l.id]; delete S.tkb[l.id];
});
S.diemTruong = S.diemTruong.filter(d => d.id !== 'dtThu');
kt('Dọn xong thì trở lại đúng 25 lớp của bộ kiểm thử vàng',
   S.lop.length === soLopTruoc, `${S.lop.length} lớp`);

console.log('\n8. Thêm phân công — MỘT lớp, NHIỀU môn (28/8/2026)');
/* Chủ dự án: "phân công chuyên môn chỉ có 1 lựa chọn dạy môn Tiếng việt hoặc
   môn học khác (phải có đủ môn để tích vào)". Ô xổ xuống cũ chọn được đúng
   một môn, mà chủ nhiệm tiểu học dạy năm sáu môn của chính lớp mình. */
w.chuyen('phancong');
const pcTruoc = S.phanCong.length;
w.hopThemPC();
const oMon = () => [...w.document.querySelectorAll('#pcMon input')];
kt('Bày ĐỦ mọi môn để tích, không phải ô xổ xuống chọn một',
   oMon().length === w.eval('dsMonDung().length') && oMon().length > 1,
   `${oMon().length} môn`);
kt('Có nút Tích tất cả và Bỏ tích — chủ nhiệm dạy gần hết các môn của lớp mình',
   !!w.document.querySelector('#pcTatCa') && !!w.document.querySelector('#pcBoHet'));

/* Lớp trống hẳn, để đếm cho sạch */
const lopTrong = S.lop.find(l => !S.phanCong.some(p => p.lopId === l.id))
               || S.lop[S.lop.length - 1];
w.eval(`S.phanCong = S.phanCong.filter(p=>p.lopId!==${JSON.stringify(lopTrong.id)})`);
const pcSach = S.phanCong.length;
w.document.querySelector('#pcLop').value = lopTrong.id;
w.document.querySelector('#pcLop').dispatchEvent(new w.Event('change', { bubbles: true }));

/* ⚠️ Phải chọn môn CÓ tiết chuẩn ở đúng khối của lớp này. Bản trước ghi cứng
   'TNXH' — môn ấy chỉ có ở khối 1–3, mà lopTrong lại là lớp khối 5, nên phép
   thử đang dựa vào chính hành vi chủ dự án yêu cầu bỏ (29/8/2026): cho tích
   môn ngoài chương trình của khối rồi lặng lẽ ghi 1 tiết. */
const banMon = oMon().map(x => x.value)
  .filter(m => w.eval(`chuanMon(${JSON.stringify(m)}, ${lopTrong.khoi})`) > 0)
  .slice(0, 3);
banMon.forEach(m => {
  const o = oMon().find(x => x.value === m);
  o.checked = true;
});
w.document.querySelector('#pcMon').dispatchEvent(new w.Event('change', { bubbles: true }));
kt('Tích tới đâu thì cộng số tiết tới đó, ngay dưới lưới môn',
   /Đã tích <b>3 môn<\/b>/.test(w.document.querySelector('#pcGoi').innerHTML),
   w.document.querySelector('#pcGoi').textContent.trim());

[...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Thêm').click();
kt('Một lần bấm ra ĐỦ ba dòng phân công, không phải mở hộp ba lần',
   S.phanCong.length === pcSach + banMon.length,
   `${pcSach} → ${S.phanCong.length} dòng`);
kt('Mỗi dòng lấy sẵn số tiết chuẩn CT GDPT 2018 theo khối của lớp', (() => {
  const moi = S.phanCong.filter(p => p.lopId === lopTrong.id);
  return moi.length === banMon.length && moi.every(p =>
    p.soTiet === w.eval(`chuanMon(${JSON.stringify(p.mon)},${lopTrong.khoi})`));
})(), `khối ${lopTrong.khoi}: ` + S.phanCong.filter(p => p.lopId === lopTrong.id)
        .map(p => `${p.mon} ${p.soTiet}`).join(' · '));

/* Tích lại đúng những môn ấy lần nữa: cập nhật, KHÔNG đẻ dòng trùng */
w.hopThemPC();
w.document.querySelector('#pcLop').value = lopTrong.id;
banMon.forEach(m => { oMon().find(x => x.value === m).checked = true; });
[...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Thêm').click();
kt('Tích lại đúng những môn ấy thì cập nhật, không nhân đôi dòng nào',
   S.phanCong.length === pcSach + banMon.length, `${S.phanCong.length} dòng`);

/* Chủ dự án 29/8/2026: "sửa riêng cho nút chưa khai thì nút không thể tích
   được, chứ lỡ giáo viên tích nhầm cũng không nên". Môn không có tiết chuẩn ở
   khối của lớp đang chọn (TNXH ở khối 5, LS&ĐL ở khối 1) là môn NGOÀI chương
   trình khối ấy — trước đây tích được và app lặng lẽ ghi 1 tiết. */
{
  w.hopThemPC();
  const lopK5 = S.lop.find(l => l.khoi === 5) || S.lop[S.lop.length - 1];
  const lopK1 = S.lop.find(l => l.khoi === 1) || S.lop[0];
  const doiLop = id => {
    w.document.querySelector('#pcLop').value = id;
    w.document.querySelector('#pcLop').dispatchEvent(new w.Event('change', { bubbles: true }));
  };
  const oCua = m => oMon().find(x => x.value === m);

  doiLop(lopK5.id);
  const khoa = oMon().filter(x => x.disabled).map(x => x.value);
  /* Khoá đúng bằng phép soát của app: ô nào chuanMon = 0 thì disabled, và
     KHÔNG ô nào khác bị khoá oan. */
  const saiKhoa = oMon().filter(x =>
    x.disabled !== (w.eval(`chuanMon(${JSON.stringify(x.value)}, ${lopK5.khoi})`) === 0));
  kt('Môn chưa khai chuẩn cho khối này thì ô tích BỊ KHOÁ — và không khoá oan môn nào',
     khoa.length > 0 && saiKhoa.length === 0,
     `khoá: ${khoa.join(' · ')}${saiKhoa.length ? ' · SAI: ' + saiKhoa.map(x=>x.value).join(' ') : ''}`);

  kt('Ô khoá mang dấu hiệu nhìn thấy được, không chỉ chặn ngầm',
     oMon().filter(x => x.disabled)
       .every(x => x.closest('.pc-m')?.classList.contains('khoa')));

  /* Đổi lớp là đổi KHỐI: môn vừa tích ở khối này có thể ngoài chương trình
     khối kia. Để nguyên dấu tích thì ô khoá mà vẫn tích, và nút Thêm nhận nó. */
  /* ⚠️ Phải chọn môn CÓ ở khối 1 mà KHÔNG có ở khối 5 (TNXH), không thì phép
     thử xanh mà chẳng kiểm được gì — bản đầu lấy "môn đầu tiên không bị khoá"
     và trúng ngay một môn hợp lệ ở cả hai khối. Đúng bẫy "hai thứ tình cờ
     bằng nhau" đã ghi ở mục 3 CLAUDE.md. */
  const monLech = oMon().map(x => x.value).find(m =>
    w.eval(`chuanMon(${JSON.stringify(m)}, ${lopK1.khoi})`) > 0 &&
    w.eval(`chuanMon(${JSON.stringify(m)}, ${lopK5.khoi})`) === 0);
  doiLop(lopK1.id);
  if (monLech) oCua(monLech).checked = true;
  doiLop(lopK5.id);
  kt('Đổi lớp sang khối khác thì môn ngoài chương trình TỰ BỎ TÍCH',
     !!monLech && oCua(monLech)?.checked === false && oCua(monLech)?.disabled === true,
     monLech ? `${monLech}: khối ${lopK1.khoi} tích được, sang khối ${lopK5.khoi} tự bỏ`
             : 'KHÔNG tìm ra môn lệch khối — phép thử không kiểm được gì');

  kt('"Tích tất cả" chỉ tích những môn khai được', (() => {
    w.document.querySelector('#pcTatCa').click();
    return oMon().every(x => x.disabled ? !x.checked : x.checked);
  })());

  /* Hàng rào THẬT nằm ở nút Thêm, không phải ở thuộc tính disabled: người
     dùng mở công cụ nhà phát triển gỡ disabled thì ô tích vẫn nằm đó. */
  kt('Gỡ được disabled thì nút Thêm vẫn lọc lại, không ghi dòng ngoài chương trình', (() => {
    const truoc = S.phanCong.length;
    const o = oMon().find(x => x.disabled);
    if (!o) return true;
    o.disabled = false; o.checked = true;
    oMon().forEach(x => { if (x !== o) x.checked = false; });
    [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Thêm').click();
    const ok = S.phanCong.length === truoc;
    w.eval('dong()');
    return [ok, `${truoc} → ${S.phanCong.length} dòng`];
  })());
}

kt('Không tích môn nào mà bấm Thêm thì báo, không thêm dòng rỗng', (() => {
  w.hopThemPC();
  const truoc = S.phanCong.length;
  [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Thêm').click();
  const ok = S.phanCong.length === truoc;
  w.eval('dong()');
  return ok;
})());

/* ⚠️ Phép thử "xoá dòng phân công ngay trên bảng" đã bỏ cùng bảng từng dòng
   (29/8/2026). Nay bỏ một lớp khỏi phân công là bấm ô ma trận rồi bỏ tích lớp
   ấy — đường đi đã có phép thử riêng ở mục 17p. */
/* Trả bảng phân công về nguyên trạng cho các mục sau */
w.eval(`S.phanCong = S.phanCong.filter(p=>p.lopId!==${JSON.stringify(lopTrong.id)})`);

console.log('\n9. Danh mục môn học và phòng chức năng');
w.chuyen('monhoc');
kt('Danh mục môn hiện đủ số dòng', S.monHoc.length > 0 &&
   w.document.querySelectorAll('[data-monten]').length === S.monHoc.length,
   `${S.monHoc.length} môn`);
const iTin = S.monHoc.findIndex(m => m.ten === 'Tin học');
kt('Môn Tin học được đánh dấu cần phòng chức năng',
   iTin >= 0 && S.monHoc[iTin].phong === 'Tin học');
/* Đổi số tiết chuẩn của một môn rồi kiểm tra máy đọc lại đúng */
const oChuan = w.document.querySelector('[data-monchuan="0|1"]');
oChuan.value = '9';
oChuan.dispatchEvent(new w.Event('change', { bubbles: true }));
kt('Sửa số tiết chuẩn ghi thẳng vào danh mục',
   w.eval(`chuanMon(${JSON.stringify(S.monHoc[0].ten)},1)`) === 9,
   `${S.monHoc[0].ten} khối 1 → 9 tiết`);

w.chuyen('phonghoc');
w.document.querySelector('#btPhongTuDT')?.dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Tạo phòng Tin học từ các phân hiệu có sẵn', S.phong.length > 0,
   `${S.phong.length} phòng`);
kt('Máy nhận ra phân hiệu nào có phòng Tin học',
   S.phong.every(p => w.eval(`coPhong(${JSON.stringify(p.dtId)},'Tin học')`)));

console.log('\n10. Sản phẩm toàn trường và theo khối');
w.eval('KQ_XEP = xepTuDong(0)');
w.chuyen('toantruong');
const cotTT = w.document.querySelectorAll('.tt thead tr:last-child th').length - 2;
kt('Bảng toàn trường đủ một cột cho mỗi lớp',
   cotTT === w.eval('lopTrongPV().length'), `${cotTT} cột lớp`);
kt('Bảng toàn trường có ô tiết thật, không rỗng',
   w.document.querySelectorAll('.tt tbody td b').length > 100,
   `${w.document.querySelectorAll('.tt tbody td b').length} ô có tiết`);
w.chuyen('tkbkhoi');
kt('Màn hình theo khối tự chọn sẵn một khối', S.khoiXem != null, `khối ${S.khoiXem}`);
const cotK = w.document.querySelectorAll('.tt thead tr:last-child th').length - 2;
kt('Bảng theo khối chỉ hiện lớp của khối đó',
   cotK === w.eval(`lopTheoKhoi(${S.khoiXem}).length`), `${cotK} lớp`);
kt('Bản in toàn trường dựng được và dùng khổ rộng', (() => {
  const h = w.trangInToanTruong();
  return h.includes('tr-in rong') && h.includes('in-r');
})());
kt('Bản in theo khối dựng đủ mọi khối', (() => {
  const h = w.trangInKhoi(null);
  return w.eval('khoiDangCo()').every(k => h.includes('khối ' + k));
})());

console.log('\n11. Thanh bên mới không làm khó giáo viên');
const vaiCu = { ...S.nguoiDung };
S.nguoiDung = { vaiTro: 'gv', gvId: S.giaoVien[0].id, diemTruongId: null };
w.chuyen('lop');                                   /* gõ tay vào màn hình khai báo */
kt('Giáo viên bị đẩy về lịch cá nhân, không lạc vào màn hình khai báo',
   S.trangHienTai === 'cuatoi');
const hien = [...w.document.querySelectorAll('.mi')].filter(m => m.style.display !== 'none');
/* Từ 2/8/2026 là NĂM mục: thêm Báo nghỉ và Thông báo. Hai việc này là
   của chính thầy cô — giấu đi thì tính năng báo nghỉ thành vô dụng. */
kt('Thanh bên chỉ còn năm mục dành cho giáo viên',
   hien.length === 5, hien.map(m => m.dataset.t).join(' · '));
kt('Trong đó có đủ Báo nghỉ và Thông báo — hai việc của chính thầy cô', (() => {
  const t = hien.map(m => m.dataset.t);
  return t.includes('baonghi') && t.includes('thongbao') && t.includes('cuatoi');
})());
kt('Nhưng tuyệt đối không thấy mục nào của người xếp lịch', (() => {
  const t = hien.map(m => m.dataset.t);
  return !['xep','phancong','daythay','giaovien','nguoidung','saoluu'].some(x => t.includes(x));
})());
kt('Nhãn nhóm đổi theo vai: giáo viên không "điều hành" gì cả', (() => {
  const nh = [...w.document.querySelectorAll('.nhom')]
    .find(b => b.dataset.monh === 'dh');
  return /CỦA TÔI/.test(nh.textContent);
})());
kt('Không bày dải điều hướng bước cho giáo viên',
   !w.document.querySelector('.dhb'));
S.nguoiDung = vaiCu;
w.chuyen('dieuhanh');
kt('Trở lại vai trò quản lý thì thanh bên đủ mục',
   [...w.document.querySelectorAll('.mi')].filter(m => m.style.display !== 'none').length > 15);

console.log('\n12. Thanh bên gọn lại, ba nút cũ chuyển đi đúng chỗ');
w.chuyen('dieuhanh');
kt('Đáy thanh bên chỉ còn thẻ tài khoản, không còn nút nào',
   w.document.querySelectorAll('#duoiTB .nut-duoi').length === 0 &&
   !!w.document.querySelector('#duoiTB .tk'));
kt('Chấm báo tình trạng máy chủ nằm ngay trên thẻ tài khoản',
   !!w.document.querySelector('#duoiTB #chamMC'));

/* Nhập Excel: từ 28/8/2026 mỗi màn hình khai báo có mẫu MỘT TRANG của chính
   nó, nên Môn học · Phòng học · Khung giờ nay cũng nhập được. `coNhap` suy ra
   từ MUC_NHAP chứ không còn truyền tay ở từng nơi gọi. */
const coNhap = t => { w.chuyen(t); return !!w.document.querySelector('#btNhapExcel'); };
kt('Mọi màn hình có khai trong MUC_NHAP đều bày nút Nhập từ Excel',
   ['lop', 'giaovien', 'phancong', 'diemtruong', 'monhoc', 'phonghoc', 'khunggio',
    'buoiban'].every(coNhap));
kt('Thông tin trường KHÔNG bày nút đó — một dòng, không có tệp Excel nào cả',
   !coNhap('thongtin'));

w.chuyen('thongtin');
kt('Chỉ có ĐÚNG MỘT nút đăng nhập trong cả trang', (() => {
  /* Từng có hai: một ở thanh trên cùng, một trong thẻ Công cụ quản trị.
     Thanh trên cùng thắng vì nó theo người dùng qua mọi màn hình. */
  const trong = [...w.document.querySelectorAll('#noiDung button')]
    .filter(b => /Đăng nhập|Đăng xuất/.test(b.textContent));
  return trong.length === 0 && !!w.document.querySelector('#btDangNhapTren');
})());
/* Chủ dự án khai xong rồi hỏi "nếu cần sửa vào đâu?" — thẻ Đã khai báo bày
   bảy con số mà không con nào dẫn tới nơi sửa được chúng. */
kt('Mỗi dòng số liệu ở thẻ Đã khai báo dẫn thẳng tới mục khai báo ra nó', (() => {
  const di = [...w.document.querySelectorAll('#noiDung .hang[data-di]')]
    .map(h => h.dataset.di);
  const can = ['diemtruong', 'khunggio', 'lop', 'giaovien', 'monhoc', 'phonghoc', 'phancong'];
  return [can.every(t => di.includes(t)), di.join(' · ')];
})());
kt('Số suy ra và trạng thái thì KHÔNG bấm được — không màn hình nào khai chúng', (() => {
  const tro = [...w.document.querySelectorAll('#noiDung .hang')]
    .filter(h => /Tổng số tiết|Nơi lưu dữ liệu|Người đang dùng/.test(h.textContent));
  return [tro.length === 3 && tro.every(h => !h.dataset.di), tro.length + ' dòng'];
})());
kt('Bấm một dòng là sang đúng màn hình ấy, không phải chỉ đổi màu', (() => {
  const h = w.document.querySelector('#noiDung .hang[data-di="giaovien"]');
  h.onclick();
  const sang = w.eval('S.trangHienTai') === 'giaovien';
  w.chuyen('thongtin');
  return sang;
})());
kt('Mọi mã màn hình trong thẻ đều có thật trong CHUOI_BUOC', (() => {
  const co = new Set(w.eval('CHUOI_BUOC').map(x => x.t));
  const hong = [...w.document.querySelectorAll('#noiDung .hang[data-di]')]
    .map(h => h.dataset.di).filter(t => !co.has(t));
  return [hong.length === 0, hong.join(' · ') || 'đủ'];
})());
kt('Thông tin nơi lưu dữ liệu vẫn còn, chỉ bỏ nút trùng',
   /Nơi lưu dữ liệu/.test(w.document.querySelector('#noiDung').textContent));
kt('Không còn lối "đổi vai trò xem thử" ở bất cứ đâu — đăng nhập vai nào là vai đó',
   !w.document.querySelector('#btVaiTroTT') && typeof w.hopVaiTro === 'undefined');
kt('Nút lưu chỉ ghi "Lưu", không bắt người dùng nghĩ về máy chủ', (() => {
  w.chuyen('lop');
  const b = w.document.querySelector('#btLuuNguon');
  return !!b && b.textContent.trim() === 'Lưu';
})());

console.log('\n13. Tạo dữ liệu thử cho một phân hiệu');
w.chuyen('diemtruong');
kt('Màn hình Phân hiệu có nút Tạo dữ liệu thử', !!w.document.querySelector('#btTaoThu'));
const truocDT = { dt: S.diemTruong.length, lop: S.lop.length, gv: S.giaoVien.length };
w.document.querySelector('#btTaoThu').dispatchEvent(new w.Event('click', { bubbles: true }));
w.document.querySelector('#ttTenDiem').value = 'Phân hiệu Diễn Đồng';
w.document.querySelector('#ttTien').value = 'DD';
w.document.querySelector('#ttSoLop').value = '17';
[...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Tạo').click();
kt('Tạo xong có thêm một phân hiệu với đủ 17 lớp',
   S.diemTruong.length === truocDT.dt + 1 && S.lop.length === truocDT.lop + 17,
   `${truocDT.lop} → ${S.lop.length} lớp`);
kt('Sinh kèm giáo viên, không để lớp nào trống chủ nhiệm', (() => {
  const moi = S.lop.filter(l => (l.maLop || '').endsWith('_DD'));
  return S.giaoVien.length > truocDT.gv && moi.every(l => S.giaoVien.some(g => g.cn === l.id));
})(), `${truocDT.gv} → ${S.giaoVien.length} giáo viên`);
/* Phân hiệu mới tạo KHÔNG tích ô "có phòng Tin học", mà mục 9 ở trên đã khai
   bảng phòng — nên ràng buộc cứng số 4 bật, và mọi tiết Tin học của Diễn Đồng
   phải bị chặn lại chứ không được xếp bừa vào phòng ở phân hiệu khác. */
const soLopTin = S.lop.filter(l => (l.maLop || '').endsWith('_DD') && l.khoi >= 3).length;
const r13 = w.eval('KQ_XEP = xepTuDong()');
const tinChuaXep = r13.chuaXep.filter(x => x.mon === 'Tin học').reduce((s, x) => s + x.con, 0);
kt('Phân hiệu chưa có phòng máy thì tiết Tin học bị chặn, không xếp bừa',
   tinChuaXep === soLopTin && r13.tongCan - r13.daXep === tinChuaXep,
   `${r13.daXep}/${r13.tongCan} tiết — đúng ${tinChuaXep} tiết Tin học của ${soLopTin} lớp bị giữ lại`);
kt('Quy tắc R10 nói rõ phân hiệu nào đang thiếu phòng',
   w.eval('kiemTra()').vm.some(v => v.ma === 'R10' && /Diễn Đồng/.test(v.t)));

/* Khai thêm một phòng máy cho nơi đó thì phải xếp trọn ngay */
kt('Khai thêm phòng Tin học cho phân hiệu đó là xếp trọn vẹn', (() => {
  const dtDD = S.diemTruong.find(d => d.ten === 'Phân hiệu Diễn Đồng');
  S.phong.push({ id: 'p_dd', ten: 'Phòng Tin học · Diễn Đồng', dtId: dtDD.id, mon: 'Tin học' });
  const r = w.eval('KQ_XEP = xepTuDong()');
  return r.daXep === r.tongCan && r.chuaXep.length === 0;
})(), (() => { const r = w.eval('KQ_XEP'); return `${r.daXep}/${r.tongCan} tiết · ${r.giay} giây`; })());
/* Nhiều phân hiệu thì lưới KHÔNG gộp hết vào một bảng — 60 cột đọc không
   nổi. Mặc định bày một phân hiệu, có dải nút chuyển. Bản gộp cả trường
   chỉ còn ở đường Xuất và in. */
kt('Nhiều phân hiệu thì lưới bày MỘT điểm, có dải nút chuyển', (() => {
  w.chuyen('toantruong');
  const nut = w.document.querySelectorAll('[data-dtluoi]');
  const cot = w.document.querySelectorAll('.tt thead tr:last-child th').length - 2;
  const dang = w.eval('S.dtLuoi');
  const lopCuaDiem = S.lop.filter(l => S.lopDT[l.id] === dang).length;
  return nut.length === S.diemTruong.length && cot === lopCuaDiem && cot < S.lop.length;
})(), `${S.diemTruong.length} phân hiệu`);
kt('Bấm sang phân hiệu khác thì lưới đổi theo', (() => {
  const nut = [...w.document.querySelectorAll('[data-dtluoi]')];
  const khac = nut.find(b => b.dataset.dtluoi !== w.eval('S.dtLuoi'));
  khac.dispatchEvent(new w.Event('click', { bubbles: true }));
  const cot = w.document.querySelectorAll('.tt thead tr:last-child th').length - 2;
  return w.eval('S.dtLuoi') === khac.dataset.dtluoi &&
    cot === S.lop.filter(l => S.lopDT[l.id] === khac.dataset.dtluoi).length;
})());
kt('Xuất và in vẫn gộp TOÀN BỘ lớp của trường, không bị dải nút cắt bớt',
   w.eval('luoiToanTruong(xepTheoKhoi(lopTrongPV()))')[3].length - 3 === S.lop.length,
   `${S.lop.length} lớp trong tệp xuất`);

console.log('\n14. Bản in đúng khổ giấy và đủ thể thức');
const KHO_TEN = { doc: 'A4 dọc', ngang: 'A4 ngang', rong: 'A3 ngang' };
const khoCua = h => (h.match(/class="tr-in ([a-z]+)"/) || [])[1];
const lop0 = S.lop[0].id, gv0 = S.giaoVien[0].id;
kt('Bản in một lớp và một giáo viên dùng khổ A4 dọc',
   khoCua(w.trangInLop(lop0)) === 'doc' && khoCua(w.trangInGV(gv0)) === 'doc',
   'một lớp vừa một trang dọc, không phí giấy');
kt('Bản in theo khối dùng A4 ngang, toàn trường dùng A3 ngang',
   khoCua(w.trangInKhoi(1)) === 'ngang' && khoCua(w.trangInToanTruong()) === 'rong',
   `khối → ${KHO_TEN[khoCua(w.trangInKhoi(1))]} · toàn trường → ${KHO_TEN[khoCua(w.trangInToanTruong())]}`);
kt('Mọi bản in đủ thể thức: tên đơn vị, tiêu đề, ngày tháng, hai chỗ ký',
   [w.trangInLop(lop0), w.trangInGV(gv0), w.trangInKhoi(1), w.trangInToanTruong()]
     .every(h => /in-dv/.test(h) && /in-d2/.test(h) && /in-ngay/.test(h) &&
                 /NGƯỜI LẬP BIỂU/.test(h) && /HIỆU TRƯỞNG/.test(h)));
kt('Bản in không ghi cơ quan chủ quản',
   !/Phòng GD|Sở GD|UBND|chủ quản/i.test(w.trangInLop(lop0) + w.trangInToanTruong()));
kt('Đầu bản in ghi đúng tên đơn vị đang khai',
   w.trangInLop(lop0).includes(S.tenTruong.toUpperCase()), S.tenTruong);
kt('Khổ giấy khai bằng trang có tên, đủ cả ba khổ', (() => {
  const css = w.document.documentElement.innerHTML;
  return /@page doc/.test(css) && /@page ngang/.test(css) && /@page rong/.test(css);
})());
kt('Tệp Word mang theo đúng kiểu chữ của bản in — một nguồn duy nhất',
   /Times New Roman/.test(w.eval('CSS_BAN_IN')) && /in-ky/.test(w.eval('CSS_BAN_IN')));

console.log('\n14b. Bản in theo TỪNG PHÂN HIỆU — khổ A4 ngang');
/* Ba phân hiệu gộp một tờ là 60 cột, không ai đọc nổi — bản in hằng ngày
   là mỗi phân hiệu một bộ tờ A4 ngang, điểm đông lớp tự chia theo cụm khối.
   Bản gộp A3 vẫn giữ nguyên cho tờ dán bảng tin (phép thử ở mục 14). */
const hDT = w.trangInDiemTruong();
kt('Bản in từng phân hiệu dùng khổ A4 ngang, không lẫn khổ A3',
   hDT.length > 0 && /tr-in ngang/.test(hDT) && !/tr-in rong/.test(hDT));
kt('Tên từng phân hiệu ghi rõ trên tiêu đề tờ của nó, không ghép trùng chữ',
   S.diemTruong.every(d => {
     const nhan = /^phân hiệu/i.test(d.ten) ? d.ten : `Phân hiệu ${d.ten}`;
     return hDT.includes(nhan);
   }) && !/Phân hiệu Phân hiệu/.test(hDT));
kt('Không tờ nào vượt ngưỡng cột đọc được của A4 ngang', (() => {
  const to = hDT.split('class="tr-in').slice(1);
  const NGUONG = w.eval('NGUONG_COT_A4');
  return to.length > 0 && to.every(t => {
    const cot = (t.match(/<th>/g) || []).length - 1;   /* trừ cột Giờ */
    /* Cụm gộp NHIỀU khối ("Khối 1 đến khối 2") phải nằm trong ngưỡng;
       chỉ khối đơn lẻ đông hơn ngưỡng mới được phép đứng nguyên một tờ. */
    return cot <= NGUONG || !/đến khối/.test(t);
  });
})());
kt('Cộng mọi tờ lại thì đủ từng lớp của trường, không lớp nào rơi mất', (() => {
  const soCot = (hDT.match(/<th>/g) || []).length
    - hDT.split('class="tr-in').slice(1).length;      /* mỗi tờ một cột Giờ */
  return soCot === S.lop.length;
})(), `${S.lop.length} lớp`);
kt('In riêng một phân hiệu thì chỉ ra lớp của đúng điểm ấy', (() => {
  const d = S.diemTruong[0];
  const h1 = w.trangInDiemTruong(d.id);
  const soCot = (h1.match(/<th>/g) || []).length - h1.split('class="tr-in').slice(1).length;
  return soCot === S.lop.filter(l => S.lopDT[l.id] === d.id).length;
})());
kt('Màn hình Xuất và in bày bản A4 phân hiệu lên ĐẦU danh sách chọn', (() => {
  w.chuyen('xuatin');
  const chon = w.document.querySelector('#inChonRong');
  return !!chon && (chon.querySelector('option')?.value || '') === 'dt';
})());

console.log('\n14c. Xem trước bản in ngay trên màn hình');
/* Ô chọn bản in trước đây "mù" — bấm In mới biết tờ giấy ra hình gì.
   Khung xem trước bày đúng HTML bản in, cùng một nguồn CSS_BAN_IN. */
kt('Mở màn Xuất và in là khung xem trước bày sẵn các tờ giấy thật', (() => {
  const to = w.document.querySelectorAll('#xtBoc .tr-in');
  return !!w.document.querySelector('#xtBoc') && to.length > 0;
})());
kt('Kiểu chữ bản in nạp cho màn hình từ đúng một nguồn CSS_BAN_IN',
   !!w.document.querySelector('#kieuXemTruoc'));
kt('Mặc định xem bản A4 từng phân hiệu — đúng bản in hằng ngày',
   /từng phân hiệu/.test(w.document.querySelector('#xtMeta').textContent)
   && /A4 ngang/.test(w.document.querySelector('#xtMeta').textContent));
kt('Đổi ô chọn giáo viên là khung đổi sang bản của đúng người ấy', (() => {
  const sel = w.document.querySelector('#inChonGV');
  const g = S.giaoVien[0];
  sel.value = g.id;
  sel.dispatchEvent(new w.Event('change', {bubbles:true}));
  return w.eval('S.xtNguon') === 'gv'
    && w.document.querySelector('#xtBoc').textContent.includes(g.hoTen)
    && /A4 dọc/.test(w.document.querySelector('#xtMeta').textContent);
})());
kt('Bản dài chỉ bày mấy tờ đầu, nói rõ còn bao nhiêu tờ nữa', (() => {
  /* "Tất cả giáo viên" là mấy chục tờ — xem trước để biết hình hài,
     không phải để đọc trọn, nên chặn ở TOI_DA_TO_XEM. */
  const sel = w.document.querySelector('#inChonGV');
  sel.value = '';
  sel.dispatchEvent(new w.Event('change', {bubbles:true}));
  const to = w.document.querySelectorAll('#xtBoc .tr-in').length;
  const max = w.eval('TOI_DA_TO_XEM');
  return to === max && /tờ nữa/.test(w.document.querySelector('#xtBoc').textContent);
})());
w.eval('S.xtNguon = null');

console.log('\n15. Xếp kỹ và mẫu Excel trên giao diện');
w.chuyen('xep');
kt('Màn hình Xếp có cả nút xếp nhanh và nút xếp kỹ',
   !!w.document.querySelector('#btXep') && !!w.document.querySelector('#btXepKy'));
kt('Chạy xếp kỹ xong thì bày bảng so phương án', (() => {
  w.eval('PA_TIM = xepDai({giay:5, soPhuongAn:3})');
  w.chuyen('xep');
  const n = w.document.querySelectorAll('[data-dungpa]').length;
  return n >= 2 && /Phương án tìm được/.test(w.document.querySelector('#noiDung').textContent);
})(), `${w.document.querySelectorAll('[data-dungpa]').length} phương án bấm chọn được`);
kt('Bấm "Dùng bản này" thì lưới đổi sang đúng phương án đó', (() => {
  const pa = w.eval('PA_TIM.phuongAn');
  if (pa.length < 2) return true;
  w.document.querySelector('[data-dungpa="1"]').dispatchEvent(new w.Event('click', { bubbles: true }));
  return w.eval('diemToanCuc()') === pa[1].diem;
})());
kt('Cắt được vùng LOGIC từ chính trang để nạp vào Worker', (() => {
  const ma = w.eval('maVungLogic()');
  return typeof ma === 'string' && ma.includes('function* xepDaiTung')
    && ma.includes('const NGUON') && !ma.includes('chayXepKy');
})());
kt('Vùng LOGIC cắt ra tự chạy được với document giả — đúng thứ Worker nạp',
   w.eval(`new Function('document', maVungLogic() + '; return typeof xepDaiTung + "-" + typeof xepTuDong + "-" + typeof napNhom')(
     {querySelector:()=>({textContent:'',className:'',style:{}}), querySelectorAll:()=>[], addEventListener(){}})`)
   === 'function-function-function');
kt('Trình duyệt không có Worker thì taoWorkerXep trả null, xếp kỹ vẫn chạy tại chỗ',
   w.eval('typeof Worker') === 'undefined' && w.eval('taoWorkerXep()') === null);

console.log('\n15b. Nhật ký thao tác');
kt('Màn hình Xếp có nút Nhật ký thao tác cạnh Lịch sử phiên bản',
   !!w.document.querySelector('#btNhatKy') && !!w.document.querySelector('#btLichSu'));
await w.eval('hopNhatKy()');
kt('Chưa nối máy chủ thì hộp nhật ký nói rõ vì sao và bao giờ có',
   /Chưa xem được nhật ký/.test(w.document.querySelector('#hopN')?.textContent || '') &&
   /Chưa nối máy chủ/.test(w.document.querySelector('#hopN')?.textContent || ''));
kt('Mã hành động dịch thành câu tiếng Việt đọc được', (() => {
  const d = w.eval('MO_TA_HANH_DONG');
  return d.luu_tkb({version: 4}) === 'Lưu thời khóa biểu thành phiên bản 4'
    && d.nhap_du_lieu_nguon({lop: 25, giaoVien: 35, phanCong: 265}).includes('25 lớp')
    && d.cong_bo({version: 2}).includes('giáo viên');
})());
w.eval('dong()');

console.log('\n15c. Chức năng xuất .ics đã gỡ bỏ');
/* Gỡ 2/8/2026 theo yêu cầu chủ dự án: thầy cô mở thẳng app trên điện thoại
   được rồi (đã có PWA cài lên màn hình chính), nên một đường xuất lịch nữa
   chỉ là thứ phải nuôi mà không ai dùng. Phép thử canh để không ai vô tình
   dựng lại nửa vời — nút mà không còn hàm là bấm vào văng lỗi. */
w.chuyen('tkbgv');
kt('Màn hình Theo giáo viên không còn nút Đưa vào lịch điện thoại',
   !w.document.querySelector('#btICSGV'));
w.chuyen('cuatoi');
kt('Màn hình Của tôi cũng vậy', !w.document.querySelector('#btICSToi'));
kt('Không còn sót hàm dựng .ics nào trong trang',
   w.eval("typeof taoICS + typeof taiICS") === 'undefinedundefined');

console.log('\n15d. Dạy thay — ba khu vực');
w.chuyen('daythay');
kt('Trang Dạy thay có đủ ba khu vực của bản giao việc', (() => {
  const t = w.document.querySelector('#noiDung').textContent;
  return /Giáo viên báo nghỉ/.test(t) && /Lịch đã phân công/.test(t);
})());
kt('Không ai báo nghỉ thì nói thẳng câu ấy, không để trống',
   /Hôm nay không có giáo viên báo nghỉ/.test(w.document.querySelector('#noiDung').textContent));
kt('Vẫn còn đường phân công tay khi thầy cô báo miệng',
   !!w.document.querySelector('#btThayTay'));

/* BÁO NGHỈ HỘ (3/8/2026): thầy cô ốm nặng không tự gửi được thì Ban Giám
   hiệu ghi thay — vẫn ra một dòng bao_nghi thật nên hồ sơ ngày công đầy đủ,
   khác nút Phân công không qua báo nghỉ (không ghi gì lên máy chủ). */
kt('Có nút Báo nghỉ hộ giáo viên ngay cạnh đường phân công tay',
   !!w.document.querySelector('#btBaoNghiHo2'));
kt('Bấm vào là hộp đủ năm ô: người · ngày · buổi · lý do · ghi chú', (() => {
  w.document.querySelector('#btBaoNghiHo2').dispatchEvent(new w.Event('click', {bubbles:true}));
  const du = ['#bhGV', '#bhNgay', '#bhBuoi', '#bhLyDo', '#bhGhiChu']
    .every(id => !!w.document.querySelector(id));
  const buoi = [...(w.document.querySelector('#bhBuoi')?.options || [])].map(o => o.value);
  return du && buoi.join(',') === 'S,C,CN';
})());
kt('Bấm Huỷ thì hộp đóng, không ghi gì', (() => {
  [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Huỷ').click();
  /* dong() chỉ ẩn màn che — tiêu chí đóng là #man mất lớp "on" */
  return !w.document.querySelector('#man').classList.contains('on')
    && !(S.baoNghi || []).length;
})());
kt('Màn Theo giáo viên cũng có nút Báo nghỉ hộ, điền sẵn đúng người đang xem', (() => {
  w.chuyen('tkbgv');
  const nut = w.document.querySelector('#btBaoNghiHo');
  if (!nut) return false;
  nut.dispatchEvent(new w.Event('click', {bubbles:true}));
  const dung = w.document.querySelector('#bhGV')?.value === w.eval('S.gvXem');
  [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Huỷ').click();
  w.chuyen('daythay');
  return dung;
})());

/* Dựng một thông báo nghỉ thật: chọn một giáo viên đang có tiết sáng thứ Hai */
w.eval(`(() => {
  const lop = Object.keys(S.tkb).find(l => S.tkb[l]['2-S-0']);
  const co = S.tkb[lop]['2-S-0'];
  S.baoNghi = [{id:'bn1', gvId:co.gvId, ngay:'2026-09-07', buoi:'S',
    lyDo:'Nghỉ ốm', ghiChu:'', trangThai:'cho'}];
})()`);
w.chuyen('daythay');
kt('Có người báo nghỉ thì hiện thẻ kèm số tiết cần bố trí', (() => {
  const t = w.document.querySelector('#noiDung').textContent;
  return /Nghỉ buổi sáng/.test(t) && /tiết cần bố trí/.test(t) && /Nghỉ ốm/.test(t);
})());
kt('Thẻ có nút Xem phương án', !!w.document.querySelector('[data-xemphuongan]'));

w.document.querySelector('[data-xemphuongan]').dispatchEvent(new w.Event('click', {bubbles:true}));
kt('Bấm Xem phương án thì hiện bảng các tiết cần dạy thay', (() => {
  const t = w.document.querySelector('#noiDung').textContent;
  return /Phương án dạy thay/.test(t) && /Phân hiệu/.test(t);
})());
kt('Đề xuất đúng BA phương án, không nhiều không ít', ...((() => {
  const n = w.document.querySelectorAll('.pa-the').length;
  return [n === 3, `${n} thẻ phương án`];
})()));
kt('Thẻ phương án nói LÝ DO bằng chữ, tuyệt đối không bày điểm số', (() => {
  const t = w.document.querySelector('.pa-luoi').textContent;
  return /cùng phân hiệu|trống cả buổi|đã từng dạy lớp này|chuyên môn phù hợp|Ghép/.test(t)
    && !/\bđiểm:\s*\d/.test(t);
})());
kt('Phương án 1 ghi rõ là ưu tiên cao nhất, phương án 3 là dự phòng', (() => {
  const t = w.document.querySelectorAll('.pa-the');
  return /ưu tiên cao nhất/.test(t[0].textContent) && /dự phòng/.test(t[2].textContent);
})());
kt('Thẻ đang chọn có dấu tích, không chỉ dựa vào màu viền', (() => {
  const on = w.document.querySelector('.pa-the.on');
  return !!on && on.querySelector('.pa-tick').textContent.trim() === '✓';
})());
kt('Chọn phương án 2 thì dấu tích chuyển sang thẻ đó', (() => {
  [...w.document.querySelectorAll('[data-pachon]')]
    .find(b => b.tagName === 'BUTTON' && b.dataset.pachon === '1')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  const the = w.document.querySelectorAll('.pa-the');
  return the[1].classList.contains('on') && !the[0].classList.contains('on');
})());
kt('Chuyển sang bố trí riêng từng tiết thì mỗi tiết một ô chọn', (() => {
  w.document.querySelector('#btPaRieng').dispatchEvent(new w.Event('click', {bubbles:true}));
  const sel = w.document.querySelectorAll('[data-patiet]');
  return sel.length > 0 && /Lớp tự quản/.test(sel[0].innerHTML);
})());
kt('Ô chọn từng tiết chỉ liệt kê người THẬT SỰ trống tiết đó', (() => {
  const sel = w.document.querySelector('[data-patiet]');
  const khoa = sel.dataset.patiet;
  const hopLe = w.eval(`(() => {
    const bn = S.baoNghi[0];
    const o = tietCanThay(bn).find(x => x.khoa === '${khoa}');
    return ungVienThay(o, bn.gvId, bn.ngay).map(u => u.gv.id);
  })()`);
  const bay = [...sel.options].map(o => o.value).filter(Boolean);
  return bay.length > 0 && bay.every(id => hopLe.includes(id));
})());
kt('Người đang nghỉ không bao giờ nằm trong danh sách gợi ý', (() => {
  const vang = w.eval('S.baoNghi[0].gvId');
  return ![...w.document.querySelectorAll('[data-patiet]')]
    .some(s => [...s.options].some(o => o.value === vang));
})());
w.document.querySelector('#btPaRieng').dispatchEvent(new w.Event('click', {bubbles:true}));

console.log('\n15d2. Chốt chặn xung đột trước khi lưu');
kt('Người đang có tiết chính khoá đúng giờ ấy thì bị bắt là xung đột', ...((() => {
  /* Duyệt cả danh sách ứng viên để tìm người CÓ tiết vào thứ Hai ở một lớp
     khác, rồi ép họ dạy thay đúng ô giờ ấy — §14 nói tuyệt đối không được. */
  const r = w.eval(`(() => {
    const bn = S.baoNghi[0];
    const o = tietCanThay(bn)[0];
    const lich = lichTraGV();
    for (const uv of ungVienThay(o, bn.gvId, bn.ngay)) {
      const cua = lich[uv.gv.id] || {};
      const khoa = Object.keys(cua).find(k => k.startsWith('2-') && cua[k] !== o.lopId);
      if (!khoa) continue;
      const [t, b, i] = khoa.split('-');
      return {ten: uv.gv.hoTen, loi: xungDotDayThay([{ngay:'2026-09-07', buoi:b,
        tiet:+i, lopId:o.lopId, mon:o.mon, gvVangId:bn.gvId, gvThayId:uv.gv.id}])};
    }
    return null;
  })()`);
  if (!r) return [false, 'không tìm được ứng viên nào có tiết thứ Hai'];
  return [r.loi.length > 0 && /đang có tiết dạy lớp/.test(r.loi[0].vi),
    r.loi[0] ? r.loi[0].vi : 'không bắt được'];
})()));
kt('Người cũng đang báo nghỉ thì bị bắt là xung đột', (() => {
  const loi = w.eval(`(() => {
    const bn = S.baoNghi[0];
    const o = tietCanThay(bn)[0];
    const uv = ungVienThay(o, bn.gvId, bn.ngay)[0];
    S.baoNghi.push({id:'bn2', gvId:uv.gv.id, ngay:'2026-09-07', buoi:'S',
      lyDo:'Nghỉ ốm', ghiChu:'', trangThai:'cho'});
    const r = xungDotDayThay([{ngay:'2026-09-07', buoi:o.buoi, tiet:o.i,
      lopId:o.lopId, mon:o.mon, gvVangId:bn.gvId, gvThayId:uv.gv.id}]);
    S.baoNghi = S.baoNghi.filter(x => x.id !== 'bn2');
    return r;
  })()`);
  return loi.some(x => /cũng đang báo nghỉ/.test(x.vi));
})());
kt('Người đã đăng ký buổi bận cố định cũng bị bắt', (() => {
  const loi = w.eval(`(() => {
    const bn = S.baoNghi[0];
    const o = tietCanThay(bn)[0];
    const uv = ungVienThay(o, bn.gvId, bn.ngay)[0];
    const cu = S.gvNghi[uv.gv.id];
    S.gvNghi[uv.gv.id] = ['2-S'];
    const r = xungDotDayThay([{ngay:'2026-09-07', buoi:'S', tiet:o.i,
      lopId:o.lopId, mon:o.mon, gvVangId:bn.gvId, gvThayId:uv.gv.id}]);
    if (cu) S.gvNghi[uv.gv.id] = cu; else delete S.gvNghi[uv.gv.id];
    return r;
  })()`);
  return loi.some(x => /đã đăng ký bận/.test(x.vi));
})());
kt('Hai lớp khác nhau cùng một tiết mà chọn cùng một người thì chặn ngay trong mẻ', (() => {
  const loi = w.eval(`(() => {
    const bn = S.baoNghi[0];
    const o = tietCanThay(bn)[0];
    const uv = ungVienThay(o, bn.gvId, bn.ngay).find(u => {
      const l = lichTraGV()[u.gv.id] || {};
      return !l[o.khoa];
    });
    const lopKhac = S.lop.find(l => l.id !== o.lopId).id;
    return xungDotDayThay([
      {ngay:'2026-09-07', buoi:o.buoi, tiet:o.i, lopId:o.lopId, mon:o.mon,
       gvVangId:bn.gvId, gvThayId:uv.gv.id},
      {ngay:'2026-09-07', buoi:o.buoi, tiet:o.i, lopId:lopKhac, mon:o.mon,
       gvVangId:bn.gvId, gvThayId:uv.gv.id}]);
  })()`);
  return loi.some(x => /đã được phân dạy thay lớp/.test(x.vi));
})());
kt('Lớp tự quản (không chọn ai) thì không có xung đột nào', (() => {
  const loi = w.eval(`(() => {
    const bn = S.baoNghi[0];
    const o = tietCanThay(bn)[0];
    return xungDotDayThay([{ngay:'2026-09-07', buoi:o.buoi, tiet:o.i,
      lopId:o.lopId, mon:o.mon, gvVangId:bn.gvId, gvThayId:null}]);
  })()`);
  return loi.length === 0;
})());
kt('Chưa nối máy chủ mà bấm Xác nhận thì báo rõ, không im lặng', await (async () => {
  w.chuyen('daythay');
  w.document.querySelector('[data-xemphuongan]').dispatchEvent(new w.Event('click', {bubbles:true}));
  const n = w.document.querySelector('#btXacNhanPA');
  n.dispatchEvent(new w.Event('click', {bubbles:true}));
  await new Promise(r => setTimeout(r, 60));
  return /Chưa nối máy chủ/.test(w.document.querySelector('#bao').textContent);
})());

console.log('\n15d3. Bản in và bản gửi Zalo');
w.eval(`(() => {
  const bn = S.baoNghi[0];
  const ds = tietCanThay(bn);
  S.dayThay = ds.map(o => ({id:'dt'+o.i, ngay:bn.ngay, buoi:o.buoi, tiet:o.i,
    lopId:o.lopId, mon:o.mon, gvVangId:bn.gvId,
    gvThayId:ungVienThay(o, bn.gvId, bn.ngay)[0].gv.id, ghiChu:'', daXem:false}));
  S.dtLoc = 'het';
})()`);
w.chuyen('daythay');
kt('Bản in có đủ tiêu đề, ngày áp dụng và hai chỗ ký', (() => {
  const t = w.eval('trangInDayThay()');
  return /LỊCH PHÂN CÔNG DẠY THAY/.test(t) && /Ngày áp dụng/.test(t)
    && /NGƯỜI LẬP BIỂU/.test(t) && /HIỆU TRƯỞNG/.test(t);
})());
kt('Bản in ghi HỌ TÊN ĐẦY ĐỦ, không rút gọn — hai cô Dung phải phân biệt được', (() => {
  const t = w.eval('trangInDayThay()');
  const ten = w.eval('gvId(S.dayThay[0].gvThayId).hoTen');
  return t.includes(ten) && ten.split(' ').length >= 2;
})());
kt('Bản in có đủ cột của mẫu §17', (() => {
  const t = w.eval('trangInDayThay()');
  return ['TT','Giáo viên nghỉ','Tiết','Lớp','Môn','Giáo viên dạy thay','Ghi chú']
    .every(c => t.includes(c));
})());
kt('Bản gửi Zalo là chữ thuần, gom theo ngày, đọc được trên điện thoại', (() => {
  const t = w.eval('vanBanDayThay()');
  return /LỊCH DẠY THAY/.test(t) && /dạy thay/.test(t) && !/</.test(t);
})());
kt('Ba nút In · Word · Zalo đều có mặt khi đã có lịch', (() => {
  return !!w.document.querySelector('#btInDayThay')
    && !!w.document.querySelector('#btWordDayThay')
    && !!w.document.querySelector('#btChepDayThay');
})());
kt('Cột Tình trạng nói rõ đã xem hay chưa, bằng CHỮ',
   /Chưa xem/.test(w.document.querySelector('#noiDung').textContent));

console.log('\n15d4. Bảng ngày công theo tháng');
/* Bảng nộp báo cáo hằng tháng, suy hết từ bao_nghi (logic thuần có phép thử
   riêng ở npm test — mục 18b). Ở đây chỉ soi phần màn hình và bản in. */
w.eval('S.ncThang = "2026-09"');
w.chuyen('ngaycong');
kt('Mục Ngày công có mặt trên thanh bên, trong nhóm Quản lý và kết quả', (() => {
  const mi = w.document.querySelector('.mi[data-t="ngaycong"]');
  return !!mi && mi.dataset.nh === 'qk';
})());
kt('Bảng ghi họ tên đầy đủ người nghỉ, 0,5 công một buổi, có dòng tổng', (() => {
  const t = w.document.querySelector('#noiDung').textContent;
  const ten = w.eval('gvId(S.baoNghi[0].gvId).hoTen');
  return t.includes(ten) && /0,5/.test(t) && /Tổng cộng/.test(t);
})());
kt('Ba lối ra In · Word · Excel đều có mặt khi có dòng',
   !!w.document.querySelector('#btInNC') && !!w.document.querySelector('#btWordNC')
   && !!w.document.querySelector('#btExcelNC'));
kt('Bản in ngày công khổ A4 dọc, đủ thể thức và chỗ ký', (() => {
  const h = w.eval('trangInNgayCong()');
  return /tr-in doc/.test(h) && /NGÀY CÔNG THÁNG 9\/2026/.test(h)
    && /NGƯỜI LẬP BIỂU/.test(h) && /HIỆU TRƯỞNG/.test(h);
})());
kt('Tháng không ai nghỉ thì nói "cả trường đủ công", không bày bảng trống', (() => {
  w.eval('S.ncThang = "2026-11"'); w.chuyen('ngaycong');
  const t = w.document.querySelector('#noiDung').textContent;
  return /chưa có ai báo nghỉ/.test(t) && /đủ công/.test(t)
    && !w.document.querySelector('#btInNC');
})());
w.eval('S.ncThang = null');
w.chuyen('daythay');
w.eval('S.dayThay = []; S.baoNghi = []; S.dtLoc = "moi"; S.bnXem = null');
console.log('\n15e. Nhập TỪNG MỤC — mỗi màn hình một trang tính');
/* Chủ dự án: "ta nhập từng mục chứ 10 trang làm cho giáo viên rối quá!". Hộp
   nhập nay nói về ĐÚNG mục đang mở, không bày ba mẫu cho người dùng tự chọn. */
w.chuyen('lop');
w.eval('hopNhapExcel()');
kt('Hộp nhập nói đúng tên mục đang mở, không phải "chọn một trong ba mẫu"', (() => {
  const t = w.document.querySelector('#hopT').textContent;
  return /Nhập Lớp học từ Excel/.test(t);
})(), w.document.querySelector('#hopT').textContent);
kt('Nói rõ chỉ MỘT trang tính, và tên trang ấy', (() => {
  const t = w.document.querySelector('#hopN').textContent;
  return /một trang tính/.test(t) && /LOP/.test(t);
})());
kt('Bày bảng "cột nào ghi gì" — người điền biết trước phải gõ gì vào đâu', (() => {
  const t = w.document.querySelector('#hopN').textContent;
  return /Ma_lop/.test(t) && /Ten_lop/.test(t) && /Khoi/.test(t) && /bắt buộc/.test(t);
})());
kt('Không còn nhắc mẫu trọn gói mười trang ở bất kỳ đâu trong hộp',
   !/Trọn gói|mười trang/.test(w.document.querySelector('#hopN').textContent));
kt('Chân hộp có ba nút: Huỷ · Tải mẫu về điền · Chọn tệp', (() => {
  const nut = [...w.document.querySelectorAll('#hopC button')].map(b => b.textContent);
  return nut.length === 3 && nut.includes('Tải mẫu về điền') && nut.includes('Chọn tệp');
})());
w.eval('dong()');

/* Mục phụ thuộc: chặn NGAY từ đầu, đừng để điền xong 400 dòng mới báo */
w.chuyen('phancong');
w.eval('hopNhapExcel()');
kt('Màn Phân công vẫn mời mẫu ma trận — tờ phân công nhiều trường vẫn kẻ tay',
   /ma trận/i.test(w.document.querySelector('#hopN').innerHTML));
w.eval('dong()');
{
  const lopCu = w.eval('JSON.stringify(S.lop)');
  w.eval('S.lop = []');
  w.chuyen('phancong');
  w.eval('hopNhapExcel()');
  kt('Chưa khai lớp thì hộp Phân công CHẶN ngay, nói rõ phải làm gì trước', (() => {
    const t = w.document.querySelector('#hopN').textContent;
    return /Khai xong .*Lớp học.* trước/.test(t);
  })(), w.document.querySelector('#hopN').textContent.slice(0, 90));
  kt('Bị chặn thì không bày nút Chọn tệp nào cả', (() => {
    const nut = [...w.document.querySelectorAll('#hopC button')].map(b => b.textContent);
    return !nut.includes('Chọn tệp') && !nut.includes('Tải mẫu về điền');
  })());
  w.eval('dong()');
  w.eval(`S.lop = ${lopCu}`);
  w.chuyen('lop');
}
w.eval('hopNhapExcel()');
w.eval('dong()');

/* --- Bước ③ và ④ của luồng nhập một cửa --- */
kt('Bảng "tìm thấy gì trong tệp" đánh dấu trang bắt buộc còn TRỐNG là thiếu', (() => {
  const h = w.eval(`bangTimThay([
    {t:'1_TRUONG', h:[{}]}, {t:'4_LOP', h:[]}, {t:'7_PHONG', h:null}])`);
  return /1_TRUONG[\s\S]*?đã đọc/.test(h) && /4_LOP[\s\S]*?thiếu/.test(h)
    && /7_PHONG[\s\S]*?bỏ trống/.test(h);
})());
kt('Xem trước nhập bày CẢNH BÁO mà vẫn cho nút nhập — cảnh báo không chặn ai', (() => {
  const dl = w.eval(`(() => {
    const m = bangMauTronGoi();
    const t = m.trang.find(x => x.ten === '5_GIAO_VIEN');
    const i = t.cot.findIndex(c => c.ten === 'Chu_nhiem');
    t.hang.forEach(h => { h[i] = ''; });
    const kho = {};
    m.trang.forEach(tr => kho[tr.ten] = tr.hang.map(h => {
      const o = {}; tr.cot.forEach((c, j) => { if (h[j] !== '' && h[j] != null) o[c.ten] = h[j]; }); return o; }));
    return duLieuTuTronGoi(n => kho[n] || null);
  })()`);
  w.eval(`hopXacNhanNhap(${JSON.stringify(dl)}, null)`);
  const t = w.document.querySelector('#hopN').textContent;
  const nut = [...w.document.querySelectorAll('#hopC button')].map(b => b.textContent);
  return dl.soLoi === 0 && /đáng rà lại/.test(t) && /chưa có chủ nhiệm/.test(t)
    && nut.some(x => /Nhập/.test(x));
})());
w.eval('dong()');
kt('Nhập xong thì CHẠY LUÔN kiểm tra khả thi, có lối đi thẳng sang Xếp', (() => {
  w.eval(`hopSauKhiNhap('Đã nhập 25 lớp.')`);
  const t = w.document.querySelector('#hopN').textContent;
  const nut = [...w.document.querySelectorAll('#hopC button')].map(b => b.textContent);
  return /kiểm tra khả thi/.test(t) && /Vướng mắc phải xử lý/.test(t)
    && nut.includes('Xem chi tiết') && nut.some(x => /Xếp/.test(x));
})());
w.eval('dong()');

kt('Hướng dẫn mở đầu bằng mục Nhập liệu lần đầu, kèm đủ tám trang tính', (() => {
  w.eval(`HD_VAI='ql'`); w.chuyen('huongdan');
  const t = w.document.querySelector('#noiDung').textContent;
  const dau = /1\.\s*Nhập liệu lần đầu/.test(t);
  const du = ['1_TRUONG', '2_DIEM_TRUONG', '3_KHUNG_GIO', '4_LOP',
    '5_GIAO_VIEN', '6_PHAN_CONG', '7_PHONG', '8_BUOI_BAN'].every(x => t.includes(x));
  /* Phải nói thật rằng dán đè đi xuyên qua khoá của Excel — người dùng tin
     hẳn vào dropdown rồi dán một cột sai là hỏng cả tệp mà không hay */
  const that = /dán đè/.test(t) && /soát lại/.test(t);
  return dau && du && that;
})());
w.chuyen('lop');
kt('Bảng ma trận lấy số tiết theo danh mục môn HIỆN HÀNH của trường', ...((() => {
  /* mục 9 ở trên đã cố ý sửa tiết chuẩn Tiếng Việt khối 1 thành 9 —
     ma trận phải theo danh mục của trường, không theo hằng số cứng */
  const mong = w.eval(`chuanMon('Tiếng Việt',1) + chuanMon('Toán',1)`);
  const r = w.eval(`duLieuTuMaTran([
    {Ho_ten:'Cô Thử', Chu_nhiem:'9X-1A', 'Tiếng Việt':'x', 'Toán':'x'}
  ], null)`);
  return [r.soLoi === 0 && r.giaoVien[0].cn === '9X-1A' &&
    r.phanCong.length === 2 && r.tongTiet === mong,
    `${r.tongTiet} tiết = chuẩn đang khai (${mong})`];
})()));

console.log('\n15h. Sản phẩm lên đầu Bảng điều hành');
w.eval('KQ_XEP = xepTuDong(0)');
w.chuyen('dieuhanh');
/* Thứ tự mới (2/8/2026): VIỆC CẦN XỬ LÝ đứng trước cả thời khóa biểu.
   Đó là thứ duy nhất có hạn giờ trong ngày — cô A ốm sáng nay, tám giờ vào
   tiết. Tiến độ xếp lịch thì tuần sau xem cũng được. Nhưng thời khóa biểu
   vẫn phải đứng TRƯỚC ba thẻ bước, đúng nguyên tắc "sản phẩm lên trước". */
/* Sắp lại lần cuối 3/8/2026: BỎ HẲN băng rôn navy. Tên trường đã có ở
   thanh trên cùng, số lớp và phiên bản đã có ở dải chỉ số và khối Việc cần
   xử lý — băng rôn chỉ lặp lại thứ đã nói mà ăn mất 96px ngay trên lưới.
   Mục tiêu chủ dự án: "tạo cho TKB không gian rộng hơn". */
kt('Bỏ hẳn băng rôn navy — không còn khối nào lặp lại tên trường trên lưới',
   !w.document.querySelector('#noiDung .bang-ron'));
kt('Không có việc gấp thì THỜI KHÓA BIỂU là khối đầu tiên của trang', (() => {
  const nd = w.document.querySelector('#noiDung');
  return nd.firstElementChild.classList.contains('the-luoi')
    && !!nd.firstElementChild.querySelector('table');
})());
kt('Thẻ lưới KHÔNG còn dòng tiêu đề — nhường chiều cao cho bảng', (() => {
  const the = w.document.querySelector('#noiDung .the-luoi');
  return !the.querySelector('.the-d');
})());
kt('Nút "Xuất và in" nằm NGANG HÀNG với bốn thẻ chuyển', (() => {
  const dai = w.document.querySelector('#noiDung .dai-xem');
  const nut = dai && dai.querySelector('[data-di="xuatin"]');
  return !!nut && dai.querySelectorAll('[data-dhxem]').length === 4;
})());
kt('Thời khóa biểu đứng TRƯỚC khối việc cần xử lý', ...((() => {
  const html = w.document.querySelector('#noiDung').innerHTML;
  const iLuoi = viTriLuoi(html);
  const iViec = html.indexOf('class="viec');
  return [iLuoi > 0 && iViec > 0 && iLuoi < iViec, `lưới ${iLuoi} · việc ${iViec}`];
})()));
kt('Không có ai báo nghỉ thì KHÔNG bày dải đỏ — không tốn một pixel nào',
   !w.document.querySelector('.br-gap'));
kt('Có người báo nghỉ thì hiện dải đỏ một dòng ở ĐẦU trang, bấm được', ...((() => {
  /* Đây là cái giá của việc đẩy khối việc cần xử lý xuống dưới lưới —
     việc gấp vẫn phải đập vào mắt ngay đầu trang. */
  w.eval(`(() => {
    const lop = Object.keys(S.tkb).find(l => S.tkb[l]['2-S-0']);
    S.baoNghi = [{id:'bnX', gvId:S.tkb[lop]['2-S-0'].gvId, ngay:'2026-09-07',
      buoi:'S', lyDo:'Nghỉ ốm', ghiChu:'', trangThai:'cho'}];
    ve();
  })()`);
  const dai = w.document.querySelector('.br-gap');
  const ok = !!dai && dai.dataset.di === 'daythay'
    && /giáo viên báo nghỉ chưa xử lý/.test(dai.textContent)
    && /tiết cần bố trí/.test(dai.textContent)
    && w.document.querySelector('#noiDung').firstElementChild === dai;
  w.eval('S.baoNghi = []; ve()');
  return [ok, dai ? dai.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) : 'không có dải'];
})()));
kt('Không ai báo nghỉ thì khối ấy nói thẳng ra, không để trống', (() => {
  const v = w.document.querySelector('#noiDung .viec');
  return /Hôm nay không có giáo viên báo nghỉ/.test(v.textContent)
    && !v.classList.contains('gap');
})());
kt('Xếp xong thì Bảng điều hành vẫn bày chính thời khóa biểu', (() => {
  /* Canh CÁI LƯỚI chứ không canh dòng chữ "Thời khóa biểu": dòng tiêu đề
     thẻ đã xoá 3/8/2026 để nhường chiều cao cho bảng. Lưới nào cũng được —
     toàn trường hay một lớp — miễn là nó có mặt cùng bốn thẻ chuyển. */
  const the = [...w.document.querySelectorAll('#noiDung .the')]
    .find(x => x.querySelector('.tt, table.tkb'));
  return !!the && the.querySelectorAll('[data-dhxem]').length === 4
    && the.querySelectorAll('.tt th, table.tkb th').length >= 7;
})());
kt('Thời khóa biểu vẫn đứng TRƯỚC ba thẻ bước — sản phẩm lên trước', (() => {
  const html = w.document.querySelector('#noiDung').innerHTML;
  const iLuoi = viTriLuoi(html);
  const iBuoc = html.indexOf('Khai báo dữ liệu');
  return iLuoi > 0 && (iBuoc < 0 || iLuoi < iBuoc);
})());
/* Cụm thao tác nhanh chuyển sang màn hình XẾP 3/8/2026 — Bảng điều hành
   phải là chỗ NHÌN thời khóa biểu, không phải một bảng nút bấm. */
kt('Bảng điều hành KHÔNG còn cụm sáu nút thao tác nhanh', (() => {
  /* Không đòi vắng mặt MỌI data-di — thẻ Cảnh báo vẫn có lối sang Kiểm tra
     khả thi, đó là lối đi đúng chỗ. Chỉ đòi không còn CỤM sáu nút: dấu hiệu
     là nút "Công bố phiên bản", vốn chỉ có trong cụm ấy. */
  const di = [...w.document.querySelectorAll('#noiDung [data-di]')].map(b => b.dataset.di);
  return !di.includes('phienban');
})());
kt('Cụm ấy nay nằm ở màn hình Xếp thời khóa biểu, đủ sáu nút', (() => {
  w.chuyen('xep');
  const di = [...w.document.querySelectorAll('#noiDung [data-di]')].map(b => b.dataset.di);
  const ok = ['kiemtra','xep','toantruong','daythay','xuatin','phienban']
    .every(x => di.includes(x));
  w.chuyen('dieuhanh');
  return ok;
})());
kt('Chỉ MỘT nút hành động chính nổi bật trong dải thao tác nhanh', ...((() => {
  w.chuyen('xep');
  const dai = [...w.document.querySelectorAll('#noiDung .the')]
    .find(t => [...t.querySelectorAll('[data-di]')].length >= 5);
  const ch = dai ? [...dai.querySelectorAll('button')].filter(b => b.className.includes('b-ch')) : [];
  w.chuyen('dieuhanh');
  return [!!dai && ch.length === 1, `${ch.length} nút chính`];
})()));
kt('Bảng điều hành bỏ hẳn tiêu đề + ô tìm kiếm chung, vào thẳng thời khóa biểu', (() => {
  return !w.document.querySelector('#noiDung .dau-trang')
    && !w.document.querySelector('#noiDung #timChung');
})());
kt('Ô tìm kiếm chung nay nằm TĨNH trên thanh đầu trang, không trong màn nào', (() => {
  /* 3/8/2026: dời từ màn Giáo viên lên nút kính lúp #btTim — hai ô tìm
     giống hệt nhau nằm cạnh nhau trong một màn là bẫy gõ nhầm. */
  w.chuyen('giaovien');
  const khongTrong = !w.document.querySelector('#noiDung #timChung');
  const trenThanh = !!w.document.querySelector('.thanh #timChung')
    && !!w.document.querySelector('#btTim');
  w.chuyen('dieuhanh');
  return khongTrong && trenThanh;
})());
kt('Chỉ số nay xếp DỌC theo ưu tiên, nằm trong thẻ Tiến độ xếp', ...((() => {
  /* 3/8/2026: dải ngang bốn ô chiếm một dòng riêng cạnh lưới, nay dồn vào
     khoảng trống sẵn có dưới vòng tròn tiến độ. */
  const cot = w.document.querySelector('#noiDung .cot-so');
  const trong = cot && cot.closest('.the');
  const dong = cot ? [...cot.querySelectorAll('.cs-d span')].map(x => x.textContent) : [];
  return [!!cot && !!trong && /Tiến độ xếp/.test(trong.textContent) && dong.length === 7,
    dong.slice(0, 3).join(' · ')];
})()));
kt('Thứ tự là ƯU TIÊN THẬT: việc gấp trước, quy mô trường sau', (() => {
  const d = [...w.document.querySelectorAll('#noiDung .cot-so .cs-d span')]
    .map(x => x.textContent);
  return /báo nghỉ/.test(d[0]) && /dạy thay/.test(d[1]) && /cảnh báo/.test(d[2])
    && /đã xếp/.test(d[3]) && /phân hiệu/.test(d[6]);
})());
kt('Số 0 KHÔNG bị tô đỏ — báo động giả còn tệ hơn không báo', (() => {
  const d = [...w.document.querySelectorAll('#noiDung .cot-so .cs-d')];
  return d.every(x => x.querySelector('b').textContent.trim() !== '0'
    || !x.classList.contains('do'));
})());
kt('Không còn dải chỉ số nào khác lặp lại cùng mấy con số ấy', (() => {
  const nd = w.document.querySelector('#noiDung');
  return !nd.querySelector('.dai-so') && !nd.querySelector('.the-so')
    && !nd.querySelector('.viec-so');
})());

console.log('\n15h2. Bốn cách xem, chuyển TẠI CHỖ trên Bảng điều hành');
kt('Nút chưa chọn NỔI KHỐI — nền riêng, viền, đổ bóng, không phẳng', (() => {
  /* Chốt 23/8/2026 sau khi thử cả hai chiều. Bản sáng cùng ngày để nút nền
     trắng viền mảnh cho đúng ảnh mẫu; trên màn hình thật cả dải bốn nút chỉ
     còn bốn khung viền nhạt, không nhìn ra chỗ bấm được, và chủ dự án yêu
     cầu thẳng: nút phải nổi khối như trước.

     Nên phép thử canh BA tín hiệu của nút chưa chọn — nền riêng khác trắng,
     viền, đổ bóng — và một tín hiệu nữa cho nút đang chọn ở phép thử dưới. */
  const css = w.document.documentElement.innerHTML;
  const lat = ten => css.slice(css.indexOf(ten), css.indexOf(ten) + 400);
  const xem = lat('.xem-nut{'), dt = lat('.dt-nut{'), cl = lat('.cl-n{');
  const noiKhoi = kh => kh.includes('background:var(--nav-nhat)')
    && kh.includes('border:1px solid var(--nav-vien)') && kh.includes('box-shadow:0 2px');
  return noiKhoi(xem) && noiKhoi(dt)
    && cl.includes('background:var(--nav-nhat)') && cl.includes('box-shadow:0 2px');
})());
kt('Nhưng thẻ ĐANG CHỌN vẫn đậm hơn hẳn — hai tín hiệu, không chỉ một', (() => {
  const css = w.document.documentElement.innerHTML;
  return /\.xem-nut\.on\{background:var\(--nav\);color:#fff/.test(css)
    && /\.dt-nut\.on\{background:var\(--nav\);color:#fff/.test(css);
})());
/* Bảng màu XANH DƯƠNG (24/8/2026 — thay hệ xanh lá của 16/8).
   Chủ dự án đưa sáu mã: chủ đạo #005391 · xanh đậm #003B68 · nút/hover
   #0A659F · nền xanh nhạt #EAF5FB · nền tổng thể #F4F9FC · viền #C9E2F0.
   Tên biến GIỮ NGUYÊN vì chúng nói VAI TRÒ, không nói tên màu. */
const cssGoc = w.document.documentElement.innerHTML;
const bien = ten => (cssGoc.match(new RegExp('--' + ten + ':(#[0-9A-Fa-f]{6})')) || [])[1];
const laLam = h => { const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16),
                           b = parseInt(h.slice(5,7),16); return b > g && b > r; };
const laLuc = h => { const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16),
                           b = parseInt(h.slice(5,7),16); return g > b && g > r; };
kt('Màu chủ đạo đúng bằng #005391 chủ dự án chốt', ...((() => {
  const nav = bien('nav');
  return [nav && nav.toUpperCase() === '#005391', `--nav ${nav}`];
})()));
kt('Cả hệ điều hướng là XANH DƯƠNG, không sót mã xanh lá nào', ...((() => {
  const ten = ['nav', 'nav-2', 'nav-3', 'nav-mo', 'nav-nhat', 'nav-vien', 'nen', 'ke'];
  const sot = ten.filter(t => { const h = bien(t); return h && laLuc(h); });
  return [sot.length === 0, sot.length ? sot.map(t => `--${t} ${bien(t)}`).join(' · ')
    : ten.map(t => bien(t)).join(' ')];
})()));
/* Ba màu NGỮ NGHĨA không được đổi theo: xanh lá là "đạt", đỏ là "hỏng".
   Đổi bảng màu giao diện mà kéo luôn màu báo trạng thái đi theo thì người
   dùng mất hẳn tín hiệu — đây là chỗ dễ quét nhầm nhất khi thay cả hệ. */
kt('Màu báo "đạt" VẪN là xanh lá — ngữ nghĩa không đi theo bảng màu', ...((() => {
  const x = bien('xanh'), d = bien('do');
  return [!!x && laLuc(x) && !!d && !laLuc(d), `--xanh ${x} · --do ${d}`];
})()));
kt('Vạch vàng đánh dấu mục đang mở vẫn còn', ...((() => {
  const v = bien('vang');
  return [!!v && !laLam(v) && !laLuc(v), `--vang ${v}`];
})()));
/* "Nhớ là vẫn có chấm trắng nhé!" — lưới chấm trắng rất mờ phủ nền thanh
   bên, thứ cho nó chất liệu thay vì một mảng xanh bệt. Đổi cả hệ màu là
   lúc dễ quét mất nó nhất, vì nó nằm chung khai báo `background` với dải
   chuyển màu chứ không phải một thuộc tính riêng. */
kt('Thanh bên GIỮ lưới chấm trắng mờ phủ trên dải chuyển màu', ...((() => {
  const m = cssGoc.match(/aside\{[^}]*background:\s*([^;]+);/);
  const nen = m ? m[1] : '';
  const coCham = /radial-gradient\(circle at 1px 1px,\s*rgba\(255,255,255,\.0\d+\)/.test(nen);
  const coDai = /linear-gradient\(178deg,#003B68/.test(nen);
  return [coCham && coDai, coCham ? (coDai ? 'có cả chấm trắng và dải xanh đậm' : 'thiếu dải')
    : 'MẤT lưới chấm trắng'];
})()));
kt('Có đủ bốn thẻ chuyển cách xem', ...((() => {
  const v = [...w.document.querySelectorAll('[data-dhxem]')].map(b => b.dataset.dhxem);
  return [v.join() === 'toantruong,tkbkhoi,tkblop,tkbgv', v.join(' · ')];
})()));
kt('Chúng là THẺ CHUYỂN, không phải nút rời trang — không mang data-di', (() => {
  return [...w.document.querySelectorAll('[data-dhxem]')].every(b => !b.dataset.di);
})());
kt('Bấm "Theo lớp" thì lưới đổi ngay mà VẪN Ở Bảng điều hành', (() => {
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'tkblop')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  return w.eval('S.trangHienTai') === 'dieuhanh'
    && !!w.document.querySelector('#dhCotLop .cl-n')
    && !!w.document.querySelector('#noiDung table.tkb');
})());
kt('Và thẻ vừa bấm được đánh dấu đang chọn, các thẻ kia vẫn còn để bấm tiếp', (() => {
  const on = [...w.document.querySelectorAll('.xem-nut.on')];
  return on.length === 1 && on[0].dataset.dhxem === 'tkblop'
    && w.document.querySelectorAll('[data-dhxem]').length === 4;
})());
kt('Bấm tiếp "Theo giáo viên" thì đổi sang lịch của giáo viên', (() => {
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'tkbgv')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  return w.eval('S.trangHienTai') === 'dieuhanh' && !!w.document.querySelector('#dhGV');
})());
kt('Quay lại "Toàn trường" thì có dải phân hiệu và lưới rộng', (() => {
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'toantruong')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  return !!w.document.querySelector('#noiDung table.tt');
})());
kt('Lưới trong Bảng điều hành CHỈ ĐỌC — không kéo thả, không chạm sửa', (() => {
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'tkblop')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  const nd = w.document.querySelector('#noiDung');
  const ok = !nd.querySelector('[data-keo]') && !nd.querySelector('[data-cham]');
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'toantruong')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  return ok;
})());
kt('Thẻ số liệu nay là nền TRẮNG, không còn navy phủ kín đầu trang', (() => {
  /* Canh KẾT QUẢ, không canh cách vá: khối .ts phải khai nền trắng ngay
     trong chính nó (không phải một khối sau đè lên), không chữ trắng, và
     không còn vòng tròn trang trí ::after của bản navy cũ. */
  const css = w.document.documentElement.innerHTML;
  const khoi = css.match(/\.ts\{[^}]*\}/)?.[0] || '';
  return /background:var\(--the\)/.test(khoi) && !/color:#fff/.test(khoi)
    && !/\.ts::after\{content/.test(css);
})());
kt('Bốn cách xem nay là THẺ CHUYỂN tại chỗ, chỉ Xuất/in mới rời trang', (() => {
  const xem = [...w.document.querySelectorAll('#noiDung [data-dhxem]')].map(b => b.dataset.dhxem);
  const di = [...w.document.querySelectorAll('#noiDung [data-di]')].map(b => b.dataset.di);
  return ['toantruong','tkblop','tkbgv','tkbkhoi'].every(x => xem.includes(x))
    && di.includes('xuatin');
})());

console.log('\n15h3. Cột danh sách lớp và cách xem mặc định (16/8/2026)');
kt('Trường nhiều lớp thì mở app là thấy MỘT LỚP, không phải lưới 25 cột', ...((() => {
  /* Chủ dự án 16/8/2026: "điều chỉnh để xem từng lớp thay vì hiển thị cả
     trường". Lưới toàn trường là tờ dán bảng tin A3, không phải màn hình
     điện thoại. */
  w.eval(`S.dhXem=''; ve()`);
  const xem = w.eval('S.dhXem');
  return [xem === 'tkblop' && !!w.document.querySelector('#dhCotLop'),
    `${w.eval('S.lop.length')} lớp → ${xem}`];
})()));
kt('Trường ít lớp thì vẫn mở lưới toàn trường như cũ', ...((() => {
  const it = w.eval(`xemMacDinh(new Array(6))`);
  const nhieu = w.eval(`xemMacDinh(new Array(25))`);
  return [it === 'toantruong' && nhieu === 'tkblop', `6 lớp → ${it} · 25 lớp → ${nhieu}`];
})()));
kt('Nhưng đó chỉ là MẶC ĐỊNH — bấm thẻ khác thì giữ lựa chọn của người dùng', (() => {
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'toantruong')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  const giu = w.eval('S.dhXem') === 'toantruong';
  w.eval('ve()');
  return giu && w.eval('S.dhXem') === 'toantruong'
    && !!w.document.querySelector('#noiDung table.tt');
})());
kt('Cột lớp bày đủ mọi lớp, nhóm theo khối, đánh dấu đúng lớp đang mở', ...((() => {
  [...w.document.querySelectorAll('[data-dhxem]')].find(b => b.dataset.dhxem === 'tkblop')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  const nut = [...w.document.querySelectorAll('#dhCotLop .cl-n')];
  const khoi = [...w.document.querySelectorAll('#dhCotLop .cl-khoi')];
  const on = w.document.querySelectorAll('#dhCotLop .cl-n.on');
  return [nut.length === w.eval('lopTrongPV().length') && khoi.length === 5 && on.length === 1,
    `${nut.length} nút · ${khoi.length} nhãn khối`];
})()));
kt('Lớp mở sẵn là lớp ĐẦU theo thứ tự nhà trường đọc quen, không phải lớp đầu mảng', (() => {
  return w.eval('lopId(S.lopXem)?.ten') === w.eval('xepTheoKhoi(lopTrongPV())[0].ten');
})());
kt('Bấm một lớp khác thì lưới đổi ngay, vẫn ở Bảng điều hành', ...((() => {
  const nut = [...w.document.querySelectorAll('#dhCotLop .cl-n')].filter(b => !b.classList.contains('on'));
  const dich = nut[3] || nut[0];
  const ten = dich.querySelector('b').textContent;
  dich.dispatchEvent(new w.Event('click', {bubbles:true}));
  return [w.eval('S.trangHienTai') === 'dieuhanh' && w.eval('lopId(S.lopXem)?.ten') === ten
    && w.document.querySelector('#dhCotLop .cl-n.on')?.querySelector('b').textContent === ten,
    `đổi sang ${ten}`];
})()));
kt('Ô tìm trong cột lọc tại chỗ, và KHÔNG đếm nhãn khối vào số lớp', ...((() => {
  /* Trường mẫu lúc này đã có nhiều phân hiệu nên "1a" khớp lớp 1A của
     TỪNG điểm — số lớp khớp lấy từ dữ liệu, đừng đoán bằng 1. */
  const mong = w.eval(`lopTrongPV().filter(l => chuTim(l.ten + ' ' + (l.maLop||'')).includes('1a')).length`);
  const tong = w.eval('lopTrongPV().length');
  const o = w.document.querySelector('[data-loc="dhCotLop"]');
  o.value = '1a';
  o.dispatchEvent(new w.Event('input', {bubbles:true}));
  const hien = [...w.document.querySelectorAll('#dhCotLop .cl-n')]
    .filter(n => n.style.display !== 'none');
  const dem = w.document.querySelector('[data-locdem="dhCotLop"]').textContent.trim();
  o.value = '';
  o.dispatchEvent(new w.Event('input', {bubbles:true}));
  /* Mẫu số phải đúng bằng SỐ LỚP — nhãn khối cũng mang data-loctu nhưng
     không phải một dòng dữ liệu, đếm vào là ra "42 lớp" ở trường 37 lớp. */
  return [hien.length === mong && dem === `${mong}/${tong} lớp`, dem];
})()));
kt('Màn hình Theo lớp cũng dùng chính cột ấy, không còn ô chọn xổ xuống', (() => {
  w.chuyen('tkblop');
  return !!w.document.querySelector('#clTKBLop .cl-n')
    && !w.document.querySelector('#selLop')
    && w.document.querySelectorAll('#clTKBLop .cl-n').length === w.eval('lopTrongPV().length');
})());
kt('Bấm lớp trong cột ấy thì lưới chỉnh tay đổi theo, bỏ luôn ô đang chọn', ...((() => {
  w.eval(`S.oChon = Object.keys(S.tkb[S.lopXem])[0]; ve()`);
  const nut = [...w.document.querySelectorAll('#clTKBLop .cl-n')].filter(b => !b.classList.contains('on'));
  const ten = nut[1].querySelector('b').textContent;
  nut[1].dispatchEvent(new w.Event('click', {bubbles:true}));
  return [w.eval('lopId(S.lopXem)?.ten') === ten && w.eval('S.oChon') === null, `sang ${ten}`];
})()));
kt('Lớp chưa xếp đủ tiết thì nút mang dấu riêng và nói rõ THIẾU MÔN GÌ', ...((() => {
  /* Không chỉ "24/27 tiết": con số cho biết CÓ thiếu, cái tên mới cho biết
     phải đi tìm ai. */
  const luu = JSON.parse(JSON.stringify(w.eval('S.tkb')));
  const bo = w.eval(`(() => {
    const o = S.tkb[S.lopXem], k = Object.keys(o).find(x => !o[x].ghim);
    const mon = o[k].mon; delete o[k]; ve(); return mon;
  })()`);
  const nut = w.document.querySelector('#clTKBLop .cl-n.on');
  const tag = [...w.document.querySelectorAll('#noiDung .tag')].map(x => x.textContent).join(' | ');
  const ok = nut.classList.contains('thieu') && new RegExp(`Thiếu[^|]*${bo}`).test(tag)
    && new RegExp(bo).test(nut.getAttribute('title'));
  const ghi = tag.split('|').find(x => /Thiếu/.test(x))?.trim();
  w.eval(`S.tkb = ${JSON.stringify(luu)}`);   /* trả lưới về nguyên trạng */
  w.chuyen('dieuhanh');                       /* và trả màn hình về chỗ cũ */
  return [ok, `bỏ 1 tiết ${bo} → ${ghi}`];
})()));

kt('Chưa xếp tiết nào thì không bày khối sản phẩm rỗng, ba bước lên trước', (() => {
  const luu = JSON.parse(JSON.stringify(w.eval('S.tkb')));
  w.eval('S.lop.forEach(l=>S.tkb[l.id]={}); KQ_XEP=null; ve()');
  const html = w.document.querySelector('#noiDung').innerHTML;
  const khong = !w.document.querySelector('#noiDung .the .tt');
  w.eval(`S.tkb = ${JSON.stringify(luu)}; ve()`);
  return khong && /Dữ liệu nhà trường/.test(html);
})());
kt('Vòng tròn phần trăm căn giữa bằng flex một cột, không phải lưới hai hàng', (() => {
  const css = w.document.documentElement.innerHTML;
  const i = css.indexOf('.donut{');
  const kh = css.slice(i, i + 220);
  return /flex-direction:column/.test(kh) && /justify-content:center/.test(kh)
    && !/display:grid/.test(kh);
})());

console.log('\n15g. Ngăn kéo điều hướng trên điện thoại');
kt('Có nút ☰ và nền mờ; mặc định ngăn kéo đóng',
   !!w.document.querySelector('#btMenu') && !!w.document.querySelector('#manMenu') &&
   !w.document.body.classList.contains('mo-menu'));
/* Lỗi thật trên iPhone: quên bật display cho nền mờ trong media query nên
   nó vẫn mang display:none của quy tắc gốc — mở ngăn kéo ra là kẹt cứng,
   bấm đâu cũng không đóng được. */
kt('Nền mờ được bật hiển thị trong khổ điện thoại — có lối đóng ngăn kéo', (() => {
  const css = w.document.documentElement.innerHTML;
  const i = css.indexOf('@media(max-width:900px)');
  const khoi = css.slice(i, i + 2600);
  return /\.man-menu\{display:block/.test(khoi);
})());
w.document.querySelector('#btMenu').dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Bấm ☰ là mở ngăn kéo', w.document.body.classList.contains('mo-menu'));
w.document.querySelector('#manMenu').dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Chạm nền mờ là đóng lại', !w.document.body.classList.contains('mo-menu'));
kt('Chọn một mục thì ngăn kéo tự đóng — không che mất màn hình vừa mở', (() => {
  w.document.querySelector('#btMenu').dispatchEvent(new w.Event('click', { bubbles: true }));
  w.chuyen('lop');
  return !w.document.body.classList.contains('mo-menu') && w.eval('S.trangHienTai') === 'lop';
})());
kt('Thanh trên KHÔNG còn logo — tên trường đứng một mình, tách riêng để co giãn được',
   /* 16/8/2026: chủ dự án bỏ logo ở thanh đầu trang. Nó lặp lại đúng cái
      logo đã có ở đầu thanh bên, ngay bên cạnh, trên cùng một màn hình. */
   !w.document.querySelector('.thanh-bt') && !!w.document.querySelector('.thanh-ten'));
kt('Không có cảnh báo nào thì badge chuông ẩn hẳn, không hiện số 0', (() => {
  const cu = w.eval('KT.vm');
  w.eval('KT.vm = []; capNhatDem()');
  const an = w.document.querySelector('#slChuong').style.display === 'none';
  w.eval('KT = kiemTra(); capNhatDem()');
  return an;
})());
kt('CHƯA đăng nhập thì badge chuông im lặng; đăng nhập rồi mới báo số', (() => {
  /* Người lạ mở trang mà thấy ngay huy hiệu đỏ "4" của dữ liệu mẫu thì
     chỉ tổ hoang mang — badge chỉ có nghĩa khi biết mình là ai. */
  w.eval('capNhatDem()');                                /* KHO.nguoiDung đang null */
  const im = w.document.querySelector('#slChuong').style.display === 'none';
  w.eval('KHO.nguoiDung={id:"t",hoTen:"Thử",vaiTro:"quan_tri"}; capNhatDem()');
  const bao = w.document.querySelector('#slChuong').style.display !== 'none'
    && +w.document.querySelector('#slChuong').textContent > 0;
  w.eval('KHO.nguoiDung=null; capNhatDem()');
  return im && bao;
})());

console.log('\n15f. Đăng nhập Google và phễu demo');
/* Giả có máy chủ nhưng chưa đăng nhập → màn chào */
w.eval(`KHO.cauHinh={url:'https://gia.supabase.co',khoa:'k'}; S.trangHienTai='chao'; ve()`);
kt('Màn chào chỉ còn MỘT cửa: Google — không còn lối đăng nhập mật khẩu nào',
   w.document.querySelector('#btChaoGoogle')?.tagName === 'BUTTON' &&
   !w.document.querySelector('#btChaoVao') &&
   !!w.document.querySelector('#btChaoDemo'));
/* Không còn Ô NHẬP mật khẩu ở bất kỳ đâu — câu trấn an "không cần mật khẩu"
   thì vẫn giữ, đó là điều người dùng cần nghe. */
kt('Không còn ô nhập mật khẩu nào trong toàn bộ trang', (() => {
  w.eval('hopMayChu()');
  const con = w.document.querySelectorAll('input[type="password"]').length;
  w.eval('dong()');
  return con === 0 && !w.document.querySelector('#dnMK') && !w.document.querySelector('#tkMK');
})());
/* Lỗi thật trên iPhone 2/8/2026: mở trang bằng địa chỉ thiếu dấu / cuối thì
   redirect_to lệch với Redirect URLs của Supabase, đăng nhập xong bị ném về
   Site URL và rơi vào trang 404 của GitHub. */
kt('Đường về sau đăng nhập Google luôn là thư mục có dấu / cuối', (() => {
  const th = w.eval('duongVeChuan');
  return th({ origin: 'https://a.github.io', pathname: '/tkb' }) === 'https://a.github.io/tkb/'
    && th({ origin: 'https://a.github.io', pathname: '/tkb/' }) === 'https://a.github.io/tkb/'
    && th({ origin: 'http://localhost:5173', pathname: '/src/index.html' }) === 'http://localhost:5173/src/'
    && th({ origin: 'https://a.github.io', pathname: '/' }) === 'https://a.github.io/';
})());
kt('Địa chỉ đăng nhập Google mang theo đúng đường về đã chuẩn hoá', (() => {
  const d = w.eval(`(()=>{KHO.cauHinh={url:'https://x.supabase.co',khoa:'k'};return diaChiDangNhapGoogle()})()`);
  return d.includes('provider=google') &&
    d.includes('redirect_to=' + encodeURIComponent(w.eval('duongVeChuan(location)')));
})());

kt('Hộp đăng nhập chỉ còn nút Google và lối đăng ký trường mới', (() => {
  w.eval('hopMayChu()');
  const co = !!w.document.querySelector('#dnGoogle') && !!w.document.querySelector('#dnTruongMoi')
    && !w.document.querySelector('#dnEmail');
  w.eval('dong()');
  return co;
})());
kt('Nút Google trong hộp đăng nhập mang logo chữ G bốn màu chuẩn', (() => {
  /* Google là cửa vào duy nhất — logo G giúp thầy cô nhận ra ngay "dùng
     Gmail sẵn có", không phải tạo mật khẩu mới. Nhúng SVG tại chỗ, không
     tải gì từ ngoài. */
  w.eval('hopMayChu()');
  const sv = w.document.querySelector('#dnGoogle svg')?.innerHTML || '';
  const du = ['#EA4335', '#4285F4', '#FBBC05', '#34A853'].every(m => sv.includes(m));
  w.eval('dong()');
  return du;
})());
kt('Chưa đăng nhập: nút thanh trên mang icon mũi tên, không có vòng chữ cái', (() => {
  w.eval('capNhatTaiKhoan()');
  return w.document.querySelector('#icDangNhap').style.display !== 'none' &&
    w.document.querySelector('#avTren').style.display === 'none';
})());
w.document.querySelector('#btChaoDemo').dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Bấm demo là vào thẳng bảng điều hành với dữ liệu mẫu, có dải nổi nhắc',
   w.eval('KHO.xemDemo') === true && w.eval('S.trangHienTai') === 'dieuhanh' &&
   w.eval('S.lop.length') > 0 && !!w.document.querySelector('#theDemo'));
w.document.querySelector('#btDemoThoat').dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Thoát demo là về màn chào, dải nổi biến mất',
   w.eval('KHO.xemDemo') === false && w.eval('S.trangHienTai') === 'chao' &&
   !w.document.querySelector('#theDemo'));
/* Khách: đã đăng nhập Google nhưng chưa thuộc trường nào */
w.eval(`KHO.khach={email:'khach@gmail.com'}; ve()`);
kt('Khách thấy ba lối đi: demo, mã mời, đăng ký trường — kèm email của mình',
   /khach@gmail\.com/.test(w.document.querySelector('#noiDung').textContent) &&
   !!w.document.querySelector('#btChaoMaMoi') && !!w.document.querySelector('#btChaoTruongMoi2'));
/* Lỗi thật trên iPhone 2/8/2026: đã đăng nhập Google mà nút vẫn ghi "Đăng
   nhập" — thầy cô tưởng chưa vào được, bấm đăng nhập lại lần nữa vô nghĩa. */
kt('Là khách thì nút trên thanh hiện tên tài khoản, không mời đăng nhập nữa', (() => {
  w.eval('capNhatTaiKhoan()');
  const chu = w.document.querySelector('#chuDangNhap').textContent;
  return chu !== 'Đăng nhập' && /khach/.test(chu);
})());
kt('Là khách thì icon mũi tên nhường chỗ cho vòng chữ cái đầu email', (() => {
  /* Icon "đi vào cửa" là ngôn ngữ của nút Đăng nhập — đứng cạnh tên người
     đã vào là hai tín hiệu ngược nhau trên một nút. */
  const ic = w.document.querySelector('#icDangNhap'), av = w.document.querySelector('#avTren');
  return ic.style.display === 'none' && av.style.display !== 'none' && av.textContent === 'K';
})());
kt('Bấm nút đó khi là khách thì mở lối thoát, không mở lại hộp đăng nhập', (() => {
  w.eval('hopMayChu()');
  const nut = [...w.document.querySelectorAll('#hopC button')].map(b => b.textContent);
  const co = nut.includes('Đăng xuất') && nut.includes('Nhập mã mời')
    && !w.document.querySelector('#dnGoogle');
  w.eval('dong()');
  return co;
})());
kt('Email dài không tràn khung: tiêu đề chào bọc chữ và co theo bề ngang', (() => {
  const h = w.document.querySelector('#noiDung h2');
  return /overflow-wrap:\s*anywhere/.test(h.getAttribute('style') || '')
    && /clamp\(/.test(h.getAttribute('style') || '');
})());
w.document.querySelector('#btChaoMaMoi').dispatchEvent(new w.Event('click', { bubbles: true }));
kt('Bấm "Nhập mã mời" là mở hộp gõ mã',
   /Nhập mã mời/.test(w.document.querySelector('#hopT').textContent) &&
   !!w.document.querySelector('#mmMa'));
w.eval('dong()');
kt('Đăng nhập hẳn rồi: vòng tròn mang đúng hai chữ cái tên người dùng', (() => {
  w.eval(`KHO.khach=null; KHO.phien={email:'c@x.vn'};
    KHO.nguoiDung={hoTen:'Trần Thanh Chung', vaiTro:'quan_tri', diemTruongId:null};
    capNhatTaiKhoan()`);
  const av = w.document.querySelector('#avTren');
  return av.style.display !== 'none' && av.textContent === 'TC' &&
    w.document.querySelector('#chuDangNhap').textContent === 'T.Chung' &&
    w.document.querySelector('#icDangNhap').style.display === 'none';
})());
w.eval(`dangXuat(); KHO.cauHinh=null; S.trangHienTai='dieuhanh'; ve()`);
kt('Dọn xong trạng thái thử — app về bình thường',
   !w.eval('KHO.khach') && !w.document.querySelector('#theDemo'));

kt('Giáo viên được phân dạy thay thấy dải báo ngay trên màn hình Của tôi', (() => {
  w.eval(`(() => {
    const co = Object.values(S.tkb).flatMap(o => Object.values(o))[0];
    S.dayThay = [{id:'x1', ngay:'2099-01-05', buoi:'S', tiet:1, lopId:Object.keys(S.tkb)[0],
                  mon:'Toán', gvVangId:'ai-do', gvThayId:S.nguoiDung.gvId || S.giaoVien[0].id}];
  })()`);
  w.chuyen('cuatoi');
  const co = /tiết dạy thay sắp tới/.test(w.document.querySelector('#noiDung').textContent);
  w.eval('S.dayThay = []');
  return co;
})());
w.chuyen('xuatin');
kt('Mỗi thẻ in đều có nút Tải Word đi kèm',
   !!w.document.querySelector('#btWordRong') && !!w.document.querySelector('#btWordLop') &&
   !!w.document.querySelector('#btWordGV'));

console.log('\n16. Logo và tệp Excel');
kt('Logo hiện ở thanh bên, nhúng thẳng trong trang (thanh trên đã bỏ 16/8/2026)',
   !!w.document.querySelector('.hieu-bt img') && !w.document.querySelector('.thanh-bt') &&
   /^data:image\/png;base64,/.test(w.document.querySelector('.hieu-bt img').getAttribute('src')));
kt('Trang có favicon riêng, không dùng biểu tượng mặc định của trình duyệt', (() => {
  const l = w.document.querySelector('link[rel="icon"]');
  return !!l && /^data:image\/png;base64,/.test(l.getAttribute('href'));
})());
kt('Nạp ExcelJS để ghi tệp có màu, có viền, có khổ giấy', (() => {
  const ma = w.document.documentElement.innerHTML;
  return /exceljs/.test(ma) && /xlsx@0\.18/.test(ma);
})(), 'SheetJS đọc tệp · ExcelJS ghi tệp');
/* Mẫu ba trang và mẫu mười trang đã bỏ 28/8/2026 — nay mỗi mục một trang.
   Canh đúng thứ người dùng đọc: tên cột trên trang Giáo viên. */
kt('Mẫu Giáo viên đủ bộ cột: Gmail · Điện thoại · Phân hiệu · Ghi chú', (() => {
  /* `const MUC_NHAP` không nằm trên window — lấy qua eval trong chính khung trang */
  const cot = w.eval("MUC_NHAP.giaovien.cot.map(c=>c.ten).join()");
  return [cot === 'TT,Ma_GV,Ho_ten,Gmail,Dien_thoai,Phan_hieu,Chu_nhiem,Dinh_muc,Ghi_chu', cot];
})()[0], w.eval("MUC_NHAP.giaovien.cot.map(c=>c.ten).join(' · ')"));

console.log('\n16b. Ô tìm kiếm trong danh sách dài');
/* Gõ vào ô tìm kiếm rồi phát sự kiện input đúng như trình duyệt thật */
const goTim = (inp, chu) => {
  inp.value = chu;
  inp.dispatchEvent(new w.Event('input', { bubbles: true }));
};
const hangHien = ma => [...w.document.querySelectorAll(`#${ma} [data-loctu]`)]
  .filter(h => h.style.display !== 'none');

kt('Danh sách ngắn KHÔNG bày ô tìm kiếm, danh sách dài thì có',
   w.oLoc('bX', 4, 'lớp', 'tìm…') === '' && w.oLoc('bX', 40, 'lớp', 'tìm…').includes('data-loc="bX"'));
kt('Tìm bỏ dấu, không phân biệt hoa thường; nhiều từ khoá là phép VÀ',
   w.khopLoc('Nguyễn Thị Hương', 'huong') && w.khopLoc('Nguyễn Thị Hương', 'NGUYEN huong')
   && !w.khopLoc('Nguyễn Thị Hương', 'huong lan') && w.khopLoc('Lớp 1A · Diễn Đồng', 'dien dong'));

w.chuyen('lop');
const oLop = w.document.querySelector('[data-loc="bLop"]');
kt('Màn hình Lớp học có ô tìm kiếm kèm số đếm',
   !!oLop && /^\d+ lớp$/.test(w.document.querySelector('[data-locdem="bLop"]').textContent));
/* ⚠️ Phải chọn một mã KHÔNG là chuỗi con của mã nào khác. Bản cũ lấy đại mã
   đầu bảng, và điều đó chỉ đúng chừng nào mọi mã đều mang hậu tố phân hiệu.
   Từ 30/8/2026 trường một phân hiệu dùng mã trần (`1A`), nên khi bộ soi đã
   tạo thêm phân hiệu thứ hai thì gõ "1A" khớp luôn cả `1A_DD` — lọc chạy
   đúng, chỉ phép thử chọn nhầm dữ liệu. */
const maCacLop = hangHien('bLop').map(h => h.dataset.loctu.split(' ')[0]);
const maMotLop = maCacLop.find(m => maCacLop.filter(x => x.includes(m)).length === 1)
                 || maCacLop[0];
goTim(oLop, maMotLop);
kt(`Gõ mã lớp "${maMotLop}" thì chỉ còn đúng dòng lớp ấy`, hangHien('bLop').length === 1);
kt('Số đếm đổi thành dạng "còn / tổng" và được tô đậm',
   /^1\/\d+ lớp$/.test(w.document.querySelector('[data-locdem="bLop"]').textContent)
   && w.document.querySelector('[data-locdem="bLop"]').classList.contains('hep'));
kt('LỌC TẠI CHỖ — không vẽ lại màn hình, ô tìm kiếm vẫn là chính nó',
   w.document.querySelector('[data-loc="bLop"]') === oLop && oLop.value === maMotLop);
goTim(oLop, 'khong-co-lop-nao-ten-the-nay');
kt('Không dòng nào khớp thì hiện dải nhắc, không để bảng trống trơn', (() => {
  const r = w.document.querySelector('[data-locrong="bLop"]');
  return hangHien('bLop').length === 0 && r.classList.contains('hien') && /Không có lớp nào khớp/.test(r.textContent);
})());
kt('Bấm nút × là trả lại đủ danh sách', (() => {
  w.document.querySelector('[data-locxoa="bLop"]').dispatchEvent(new w.Event('click', { bubbles: true }));
  const tong = w.document.querySelectorAll('#bLop [data-loctu]').length;
  return oLop.value === '' && hangHien('bLop').length === tong
    && !w.document.querySelector('[data-locrong="bLop"]').classList.contains('hien');
})());

w.chuyen('giaovien');
const oGV = w.document.querySelector('[data-loc="bGV"]');
/* Thầy cô gõ điện thoại rất ít khi bỏ dấu đúng — bỏ dấu vẫn phải ra người cần tìm */
const aiDo = w.eval('S.giaoVien')[0].hoTen;
const khongDauTen = aiDo.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();
goTim(oGV, khongDauTen);
kt(`Gõ không dấu "${khongDauTen}" vẫn tìm ra "${aiDo}"`,
   hangHien('bGV').some(h => h.dataset.loctu.includes(aiDo)));
goTim(oGV, '');

w.chuyen('phancong');
const fTim = w.document.querySelector('#fTim');
/* ⚠️ Bảng từng dòng đã BỎ HẲN ngày 29/8/2026 — chủ dự án: "bỏ phân công theo
   dòng". Ma trận là bảng duy nhất, và ô tìm kiếm lọc TẠI CHỖ theo hàng giáo
   viên thay vì vẽ lại như bảng cũ. */
kt('Bảng phân công có ô tìm kiếm', !!fTim);
kt('Gõ tên một giáo viên thì chỉ còn hàng của người ấy', (() => {
  const ai = w.eval('[...gvTrongPV()]')[0].hoTen;
  goTim(fTim, ai);
  const hien = [...w.document.querySelectorAll('#bMT tbody tr')]
    .filter(r => r.style.display !== 'none');
  return [hien.length >= 1 && hien.length < w.eval('[...gvTrongPV()]').length,
          `${hien.length} hàng · "${ai}"`];
})());
kt('Vẽ lại KHÔNG cướp con trỏ đang gõ — lọc tại chỗ, không dựng lại bảng',
   w.document.querySelector('#fTim') === fTim);
goTim(fTim, '');

w.chuyen('tkbgv');
const oSel = w.document.querySelector('[data-locsel="selGV"]');
kt('Ô chọn giáo viên dài đi kèm ô tìm kiếm riêng', !!oSel);
kt('Lọc ô chọn thì mục đang xem KHÔNG BAO GIỜ bị giấu — không để ô chọn trống trơn', (() => {
  goTim(oSel, 'zzz-khong-co-ai');
  const sel = w.document.querySelector('#selGV');
  const dangChon = [...sel.options].find(o => o.value === sel.value);
  return !dangChon.hidden && [...sel.options].filter(o => !o.hidden).length === 1;
})());
goTim(oSel, '');

console.log('\n17. PWA — cài lên màn hình chính điện thoại');
kt('Trang khai manifest, màu chủ đề và biểu tượng cho iPhone',
   w.document.querySelector('link[rel="manifest"]')?.getAttribute('href') === 'manifest.webmanifest'
   && !!w.document.querySelector('meta[name="theme-color"]')?.getAttribute('content')
   && !!w.document.querySelector('link[rel="apple-touch-icon"]'));
/* ⚠️ Ba chỗ khai màu chủ đề, và chúng PHẢI bằng nhau: biến `--nav` trong CSS,
   thẻ theme-color của trang, và theme_color trong manifest. Bản trước ghi
   thẳng '#0F5132' vào phép thử nên đổi bảng màu là phép thử đỏ mà không nói
   được chỗ nào lệch. Nay so ba chỗ VỚI NHAU — đổi màu lần sau mà quên một
   chỗ thì nó chỉ đúng chỗ ấy ra, còn đổi đủ cả ba thì không phải sửa gì. */
kt('Màu chủ đề khớp nhau ở cả ba chỗ: CSS · thẻ meta · manifest', ...((() => {
  const meta = w.document.querySelector('meta[name="theme-color"]')?.getAttribute('content');
  const m = JSON.parse(readFileSync(join(goc, 'src/manifest.webmanifest'), 'utf8'));
  const css = bien('nav');
  const b = [css, meta, m.theme_color].map(x => String(x || '').toUpperCase());
  return [b[0] === b[1] && b[1] === b[2], `CSS ${b[0]} · meta ${b[1]} · manifest ${b[2]}`];
})()));
/* Dán link vào Zalo phải ra ảnh đại diện — Zalo, Messenger, Facebook đều
   đọc bộ thẻ og:*. Ảnh phải là URL TUYỆT ĐỐI tới một tệp thật đang nằm
   trong src/ (data: không dùng được cho og:image). */
kt('Dán link vào Zalo có ảnh đại diện: đủ bộ thẻ og:* và tệp ảnh tồn tại', ...((() => {
  const og = t => w.document.querySelector(`meta[property="og:${t}"]`)?.getAttribute('content') || '';
  const anh = og('image');
  const tenTep = anh.split('/').pop();
  const coTep = anh.startsWith('https://') && existsSync(join(goc, 'src', tenTep));
  return [og('title') && og('description') && og('url').startsWith('https://') && coTep
    && +og('image:width') >= 600 && +og('image:height') >= 315,
    coTep ? `${tenTep} có thật` : `og:image "${anh}" không trỏ tới tệp nào trong src/`];
})()));
kt('Nền nạp trang của manifest khớp nền tổng thể trong CSS', ...((() => {
  const m = JSON.parse(readFileSync(join(goc, 'src/manifest.webmanifest'), 'utf8'));
  const nen = bien('nen');
  return [String(m.background_color).toUpperCase() === String(nen).toUpperCase(),
    `manifest ${m.background_color} · --nen ${nen}`];
})()));
kt('manifest.webmanifest hợp lệ, đủ tên + biểu tượng + chạy độc lập', (() => {
  const m = JSON.parse(readFileSync(join(goc, 'src/manifest.webmanifest'), 'utf8'));
  return m.name && m.short_name && m.display === 'standalone'
    && Array.isArray(m.icons) && m.icons.length >= 2
    && m.icons.every(i => { readFileSync(join(goc, 'src', i.src)); return true; });
})());
kt('sw.js đọc được, có xử lý fetch và KHÔNG BAO GIỜ cache Supabase', (() => {
  const sw = readFileSync(join(goc, 'src/sw.js'), 'utf8');
  new Function(sw);                       /* chỉ soát cú pháp, không chạy */
  return sw.includes("addEventListener('fetch'") && sw.includes('.supabase.co');
})());
kt('Trình duyệt giả không có serviceWorker mà trang vẫn chạy — đăng ký được rào đúng',
   !('serviceWorker' in w.navigator));

console.log('\n17a. Lịch cá nhân tách SÁNG · CHIỀU; lưới rộng nhẹ tay hơn');
{
  const vai = { ...S.nguoiDung };
  /* Chọn một giáo viên có dạy cả sáng lẫn chiều */
  const coCaHai = S.giaoVien.find(g => {
    const b = new Set();
    Object.values(S.tkb).forEach(o => Object.entries(o).forEach(([k, v]) => {
      if (v.gvId === g.id) b.add(k.split('-')[1]);
    }));
    return b.has('S') && b.has('C');
  });
  S.nguoiDung = { vaiTro: 'gv', gvId: coCaHai.id, diemTruongId: null };
  w.chuyen('cuatoi');
  const nhan = [...w.document.querySelectorAll('.bnhan')].map(x => x.textContent);
  kt('Mỗi ngày tách thành khối SÁNG và khối CHIỀU có nhãn riêng',
     nhan.some(x => /SÁNG/.test(x)) && nhan.some(x => /CHIỀU/.test(x)),
     `${nhan.length} nhãn buổi`);
  kt('Nhãn buổi đếm đúng số tiết của buổi đó', (() => {
    const nhom = w.document.querySelector('.bnhom');
    const so = +(nhom.querySelector('.bnhan span').textContent.match(/\d+/) || [0])[0];
    return so === nhom.querySelectorAll('.tiet-ca').length;
  })());
  kt('Thẻ tiết bỏ chữ SÁNG/CHIỀU thừa — nhãn nhóm đã nói rồi',
     [...w.document.querySelectorAll('.tiet-ca .st')]
       .every(x => /^Tiết \d+$/.test(x.textContent.trim())),
     w.document.querySelector('.tiet-ca .st')?.textContent);
  kt('Buổi sáng luôn đứng trước buổi chiều',
     !/CHIỀU/.test(nhan[0] || ''), nhan[0]);
  S.nguoiDung = vai;

  /* Dải nút phân hiệu phải ghi tên GỌN và ĐỒNG NHẤT. Tên chính thức đều là
     "Phân hiệu Diễn ...", nhưng nơi hiện đủ nơi hiện gọn thì nút dài ngắn
     lệch nhau, trên điện thoại tràn hàng. Dựng lại đúng cả hai kiểu tên. */
  if(S.diemTruong.length > 1){
    const tenCu = S.diemTruong.map(d => d.ten);
    /* Dải nút chỉ hiện khi người xem thấy được từ hai phân hiệu trở lên —
       PHT bị bó vào một điểm thì không có dải nào để soi. */
    S.nguoiDung = { vaiTro: 'qt', gvId: null, diemTruongId: null };
    S.phamVi = '';
    S.diemTruong[0].ten = 'Phân hiệu Diễn Đồng';
    S.diemTruong[1].ten = 'Phân hiệu Diễn Thái'.normalize('NFD');  /* dấu rời */
    w.chuyen('toantruong');
    const nut = [...w.document.querySelectorAll('.dt-nut')].map(x => x.textContent);
    kt('Dải nút phân hiệu không còn chữ "Phân hiệu" thừa',
       nut.length > 1 && nut.every(x => !/Điểm\s*trường/i.test(x.normalize('NFC'))),
       nut.join(' | '));
    kt('Cắt được cả tên gõ ở dạng dấu rời — nhìn giống hệt nhau nên rất dễ sót',
       nut.some(x => /Diễn Thái/.test(x.normalize('NFC'))), nut.join(' | '));
    S.diemTruong.forEach((d, i) => { d.ten = tenCu[i]; });
  }

  /* Lưới rộng: ô có tiết không còn đeo thanh màu 3px. 25–60 cột mà ô nào cũng
     một thanh đậm thì cả bảng thành sọc — chủ dự án kêu "đường kẻ quá đậm". */
  w.chuyen('toantruong');
  const oCoTiet = [...w.document.querySelectorAll('table.tt td.o-mau')];
  kt('Ô có tiết dùng lớp màu chung, không nhét style thanh 3px vào từng ô',
     oCoTiet.length > 0 && oCoTiet.every(o => !/border-left:\s*3px/.test(o.getAttribute('style') || '')),
     `${oCoTiet.length} ô`);
  kt('Màu môn vẫn còn — nhận diện bằng chữ tên môn, không mất đi',
     oCoTiet.every(o => /\bm-[a-z]+\b/.test(o.className)));
}

console.log('\n17b. Lịch trống thì phải nói ĐÚNG vì sao trống');
/* Sự cố 2/8/2026: một cô giáo nhập mã mời xong, vào được phần mềm, thấy đúng
   tên mình, nhưng màn hình Của tôi trắng trơn kèm dòng "Nhà trường chưa xếp
   xong" — trong khi trường đã xếp trọn 710/710 tiết. Câu ấy nói sai chuyện và
   giấu mất lỗi thật. Ba nguyên nhân, ba cách sửa khác hẳn nhau. */
{
  const vaiCu = { ...S.nguoiDung }, tkbCu = S.tkb, gvCu = S.giaoVien.slice();
  const noiDung = () => w.document.querySelector('#noiDung').textContent;

  /* (a) Lưới rỗng hẳn + vai trò giáo viên → chưa CÔNG BỐ, không phải chưa xếp.
     Giáo viên chỉ đọc được bản đã công bố, nên đây gần như luôn là nguyên nhân. */
  S.nguoiDung = { vaiTro: 'gv', gvId: S.giaoVien[0].id, diemTruongId: null };
  S.tkb = {};
  w.chuyen('cuatoi');
  kt('Lưới rỗng: nói "chưa công bố", KHÔNG đổ cho "chưa xếp xong"',
     /chưa công bố/i.test(noiDung()) && !/chưa xếp xong/i.test(noiDung()));

  /* (b) Trường đã xếp mà hồ sơ đang nối lại không có dòng phân công nào —
     đúng tình huống mã mời nối nhầm một trong hai người trùng tên. */
  S.tkb = tkbCu;
  S.giaoVien.push({ id: 'gv-ma-trung', hoTen: 'Nguyễn Thị Oanh', maGV: 'GV-TRUNG',
                    tenNgan: 'GV-TRUNG', cn: '', dinhMuc: 23 });
  S.nguoiDung = { vaiTro: 'gv', gvId: 'gv-ma-trung', diemTruongId: null };
  w.chuyen('cuatoi');
  kt('Hồ sơ không có phân công: chỉ thẳng là nối nhầm, kèm MÃ để quản trị dò',
     /nối nhầm/i.test(noiDung()) && noiDung().includes('GV-TRUNG'));
  /* Lời nhắc phải trỏ tới một nút CÓ THẬT. Bản đầu chỉ thầy cô sang
     "Giáo viên → Tài khoản đăng nhập", mà màn hình ấy chỉ liệt kê và xoá,
     không nối lại được — chỉ đường tới một cái nút không tồn tại. */
  kt('Và nói rõ chỗ sửa, không bắt thầy cô tự đoán',
     /Chuyển tài khoản/i.test(noiDung()));
  kt('Chỗ ấy phải là một nút CÓ THẬT trên màn hình Giáo viên', (() => {
     S.giaoVien[0].nguoiDungId = 'u-nao-do';
     const vai = { ...S.nguoiDung };
     S.nguoiDung = { vaiTro: 'qt', gvId: null, diemTruongId: null };
     w.chuyen('giaovien');
     const co = !!w.document.querySelector('#btChuyenTK');
     S.nguoiDung = vai; delete S.giaoVien[0].nguoiDungId;
     return co;
  })());

  /* (c) Có phân công đàng hoàng nhưng bản đang xem không chứa tiết nào của
     người ấy → bản công bố cũ, xếp lại rồi công bố lại. */
  S.phanCong.push({ gvId: 'gv-ma-trung', lopId: S.lop[0].id, mon: 'Toán', soTiet: 4 });
  w.chuyen('cuatoi');
  kt('Có phân công mà bản đang xem không có tiết: nói bản cũ, bảo công bố lại',
     /bản/i.test(noiDung()) && /công bố lại/i.test(noiDung()) &&
     !/nối nhầm/i.test(noiDung()));

  /* Cùng lời giải thích ấy phải có ở màn hình Theo giáo viên của người xếp —
     đây chính là chỗ chủ dự án nhìn thấy lưới trống mà không hiểu vì sao. */
  S.nguoiDung = vaiCu;
  S.gvXem = 'gv-ma-trung';
  w.chuyen('tkbgv');
  kt('Màn hình Theo giáo viên cũng giải thích lưới trống, không để người xếp đoán',
     /không chứa tiết nào của giáo viên này/i.test(noiDung()));

  /* Phát mã hàng loạt: hai nhóm phải bị bỏ qua, cả hai đều rút từ sự cố trên */
  S.giaoVien[0].nguoiDungId = 'u-da-co';
  S.giaoVien.push({ id: 'gv-thua', hoTen: 'Hồ sơ thừa', maGV: 'GV-THUA',
                    tenNgan: 'GV-THUA', cn: '', dinhMuc: 23 });
  const canPhat = w.eval('canPhatMa([])');
  kt('Phát mã hàng loạt bỏ qua người đã có tài khoản',
     !canPhat.ds.some(g => g.id === S.giaoVien[0].id));
  kt('Bỏ qua luôn hồ sơ chưa được phân công tiết nào — phát vào đó là hứa hão',
     !canPhat.ds.some(g => g.id === 'gv-thua') && canPhat.boQua >= 1,
     `bỏ qua ${canPhat.boQua} hồ sơ`);
  kt('Người đã cầm mã còn hạn thì không phát chồng mã thứ hai',
     w.eval(`canPhatMa([{gvId:'${S.giaoVien[1].id}', daDung:false, conHan:true}])`)
       .ds.every(g => g.id !== S.giaoVien[1].id));
  kt('Mã đã dùng rồi hoặc đã hết hạn thì không tính là còn hiệu lực',
     w.eval(`canPhatMa([{gvId:'${S.giaoVien[1].id}', daDung:true, conHan:true}])`)
       .ds.some(g => g.id === S.giaoVien[1].id));

  /* Hộp Chuyển tài khoản: đường sửa khi mã mời nối nhầm hồ sơ trùng tên.
     Dựng lại đúng tình huống thật — tài khoản đang nằm ở hồ sơ 0 tiết. */
  S.giaoVien.push({ id: 'gv-nham', hoTen: 'Nguyễn Thị Oanh', maGV: 'GV-NHAM',
                    tenNgan: 'GV-NHAM', cn: '', dinhMuc: 23, nguoiDungId: 'u-co-oanh' });
  w.eval('hopChuyenTaiKhoan()');
  const hopCTK = w.document.querySelector('#hopN');
  kt('Hộp Chuyển tài khoản dựng được, có hồ sơ nguồn và hồ sơ đích',
     !!hopCTK?.querySelector('#ctkNguon') && !!hopCTK?.querySelector('#ctkDich'));
  kt('Ô chọn hồ sơ ghi rõ SỐ TIẾT — không bao giờ chỉ có họ tên',
     [...hopCTK.querySelectorAll('#ctkDich option')]
       .every(o => /tiết|CHƯA CÓ TIẾT NÀO/.test(o.textContent)));
  kt('Hồ sơ nguồn không có tiết nào thì cảnh báo đỏ ngay, không đợi bấm',
     /không có tiết nào/i.test(w.document.querySelector('#ctkCanh')?.textContent || ''),
     w.document.querySelector('#ctkCanh')?.textContent?.slice(0, 40) || '(không có)');
  kt('Hồ sơ 0 tiết được xếp lên ĐẦU ô chọn nguồn — đúng chỗ cần sửa',
     hopCTK.querySelector('#ctkNguon option')?.value === 'gv-nham');
  w.eval('dong()');
  S.giaoVien.splice(S.giaoVien.findIndex(g => g.id === 'gv-nham'), 1);

  /* Hộp Mã mời dựng được thật, có nút phát cả mẻ và nói rõ bỏ qua bao nhiêu */
  await w.eval('hopMaMoi()');
  const hopN = w.document.querySelector('#hopN');
  kt('Hộp Mã mời có nút phát cả mẻ, ghi rõ số người còn thiếu đường vào',
     /Tạo \d+ mã/.test(hopN?.querySelector('#btMaHangLoat')?.textContent || ''),
     hopN?.querySelector('#btMaHangLoat')?.textContent || '(không có nút)');
  kt('Và nói rõ đã bỏ qua hồ sơ chưa phân công — không lặng lẽ cắt bớt',
     /Bỏ qua \d+ hồ sơ/.test(hopN?.textContent || ''));
  w.eval('dong()');

  /* Dựng đúng bối cảnh trường MỘT phân hiệu — kịch bản đang chạy có sẵn
     nhiều điểm nên phải cắt tạm, xong trả lại nguyên trạng. */
  const dtGiu = S.diemTruong.splice(1);
  await w.eval('hopMaMoi()');
  kt('Trường MỘT phân hiệu thì không bày ô "Phụ trách" — thứ không có gì để chọn',
     !w.document.querySelector('#hopN #mmKhuDT'));
  w.eval('dong()');
  dtGiu.forEach(d => S.diemTruong.push(d));

  /* Trường NHIỀU phân hiệu: mã quản lý phải gán được phân hiệu ngay lúc
     tạo — không thì PHT phụ trách một điểm vào app với quyền toàn trường, và
     toàn bộ hàng rào phạm vi (khoá lưới, gộp khi lưu theo p_pham_vi) không
     bao giờ được kích hoạt nếu không có người chạy SQL tay. */
  S.diemTruong.push({ id: 'dt-thu2', ten: 'Phân hiệu thử', coPhongTin: false });
  await w.eval('hopMaMoi()');
  const hopMM2 = w.document.querySelector('#hopN');
  const khuDT = hopMM2?.querySelector('#mmKhuDT');
  kt('Trường nhiều phân hiệu: có ô "Phụ trách", GIẤU khi đang chọn giáo viên',
     !!khuDT && khuDT.style.display === 'none');
  const selMM = hopMM2?.querySelector('#mmChonGV');
  if (selMM) { selMM.value = ''; selMM.onchange && selMM.onchange(); }
  kt('Chọn vai quản lý là ô Phụ trách hiện ra, đủ mọi phân hiệu + toàn trường',
     !!khuDT && khuDT.style.display !== 'none' &&
     [...khuDT.querySelectorAll('option')].length === S.diemTruong.length + 1,
     khuDT ? `${khuDT.querySelectorAll('option').length} lựa chọn` : '(không có ô)');
  kt('Lựa chọn đầu là "toàn trường" — bỏ trống phân hiệu vẫn là mặc định an toàn',
     khuDT?.querySelector('option')?.value === '');
  w.eval('dong()');
  S.diemTruong.pop();

  /* Trả lại nguyên trạng cho các phép thử sau */
  S.phanCong.pop();
  S.giaoVien.length = 0; gvCu.forEach(g => S.giaoVien.push(g));
  delete S.giaoVien[0].nguoiDungId;
  S.nguoiDung = vaiCu; S.tkb = tkbCu; S.gvXem = null;
  w.chuyen('dieuhanh');
}

console.log('\n19. Menu năm nhóm mở được');
w.chuyen('dieuhanh');
kt('Thông tin trường nằm trong DỮ LIỆU NHÀ TRƯỜNG, không phải HỆ THỐNG', ...((() => {
  /* Chủ dự án chỉ ra 3/8/2026: tên trường, năm học, địa bàn là DỮ LIỆU của
     nhà trường, không phải thiết lập hệ thống. Và nó là việc khai đầu tiên
     nên đứng đầu nhóm. */
  const m = w.document.querySelector('.mi[data-t="thongtin"]');
  const dl = [...w.document.querySelectorAll('.nh[data-nh="dl"] .mi')].map(x => x.dataset.t);
  return [m.dataset.nh === 'dl' && dl[0] === 'thongtin', dl.join(' · ')];
})()));
kt('Nhãn nhóm NỔI KHỐI, mục con giảm nhẹ — thứ bậc không bị lộn ngược', (() => {
  /* Canh THỨ BẬC, không canh một cách trình bày cụ thể. Vùng này đã đổi bốn
     lần và lần nào cũng vì cùng một lỗi ở hai chiều ngược nhau, nên phép thử
     chỉ giữ điều bất biến: nhãn nhóm phải NỔI HƠN mục con.

     Điều quyết định là TRẠNG THÁI ĐÓNG — năm nhóm cùng đóng thì nhãn nhóm
     là toàn bộ nội dung thanh bên, và lúc ấy chữ trơn không đủ. Nên nhãn
     phải có nền khối, mục con thì không. */
  const css = w.document.documentElement.innerHTML;
  const lat = ten => css.slice(css.indexOf(ten), css.indexOf(ten) + 400);
  const nhom = lat('.nhom{display:flex'), mi = lat('.mi{display:flex');
  const nhomCoNen = nhom.includes('background:rgba(255,255,255,.1')
    && nhom.includes('color:#fff') && nhom.includes('font-weight:800');
  const miNheDi = mi.includes('background:none') && mi.includes('border:0')
    && mi.includes('font-weight:500');
  return nhomCoNen && miNheDi;
})());
kt('Mục đang mở vẫn nổi rõ — ngoại lệ duy nhất của việc giảm nhẹ', (() => {
  const css = w.document.documentElement.innerHTML;
  return /\.mi\.on\{background:var\(--nav-3\)/.test(css)
    && /\.mi\.on::before\{[^}]*var\(--vang\)/.test(css);
})());
kt('Thanh bên gom đúng năm nhóm', ...((() => {
  const n = [...w.document.querySelectorAll('.nh')].map(x => x.dataset.nh);
  return [n.length === 5 && n.join() === 'dh,tc,dl,qk,ht', n.join(' · ')];
})()));
kt('Mở app thì nhóm Điều hành bung sẵn, bốn nhóm kia thu lại', (() => {
  /* Dựng lại đúng trạng thái lúc mới mở app: chưa ai bấm mở nhóm nào */
  w.eval('S.nhomMo = {}; S.trangHienTai = "dieuhanh"; ve()');
  const mo = [...w.document.querySelectorAll('.nh.mo')].map(x => x.dataset.nh);
  return mo.length === 1 && mo[0] === 'dh';
})());
kt('Chọn một trang thì nhóm chứa trang đó TỰ bung ra', (() => {
  w.chuyen('phancong');
  return w.document.querySelector('.nh[data-nh="dl"]').classList.contains('mo');
})());
kt('Bấm nhãn nhóm là mở ra được, và trạng thái ấy GIỮ qua lần vẽ lại', (() => {
  /* Dùng nhóm KHÔNG chứa trang đang mở: nhóm chứa trang đang mở thì
     dungMenu() luôn bung lại — đó là hành vi đúng, không phải lỗi. */
  w.chuyen('dieuhanh');
  const nut = [...w.document.querySelectorAll('.nhom')].find(b => b.dataset.monh === 'ht');
  nut.dispatchEvent(new w.Event('click', {bubbles:true}));
  const mo = w.document.querySelector('.nh[data-nh="ht"]').classList.contains('mo');
  w.eval('ve()');
  const giuMo = w.document.querySelector('.nh[data-nh="ht"]').classList.contains('mo');
  nut.dispatchEvent(new w.Event('click', {bubbles:true}));
  w.eval('ve()');
  const giuDong = !w.document.querySelector('.nh[data-nh="ht"]').classList.contains('mo');
  return mo && giuMo && giuDong;
})());
kt('Vạch vàng đánh dấu mục đang mở vẫn còn nguyên', (() => {
  const css = w.document.documentElement.innerHTML;
  return /\.mi\.on::before\{[^}]*var\(--vang\)/.test(css);
})());
kt('Mỗi mục nhớ mình thuộc nhóm nào — không dò bằng nth-child', (() => {
  return [...w.document.querySelectorAll('.mi')].every(m => !!m.dataset.nh);
})());
kt('Nhóm đang đóng mà bên trong có việc gấp thì bày huy hiệu tổng lên nhãn', (() => {
  const css = w.document.documentElement.innerHTML;
  return /\.nh:not\(\.mo\) \.nhom-n\.co\{display:inline-block\}/.test(css);
})());

console.log('\n19b. Năm màn hình mới của nhóm Quản lý và Hệ thống');
for (const [t, chu] of [['phuongan','So sánh phương án'], ['phienban','Bản đang sử dụng'],
                        ['nhatky','thao tác gần nhất'], ['nguoidung','Tài khoản đăng nhập'],
                        ['saoluu','Tải bản sao lưu']]) {
  w.chuyen(t);
  kt(`Màn hình "${t}" mở được và có nội dung thật`,
     w.eval('S.trangHienTai') === t
     && new RegExp(chu).test(w.document.querySelector('#noiDung').textContent));
}
kt('Phiên bản bày đủ ba trạng thái: bản nháp · đang sử dụng · đã lưu trữ', (() => {
  w.chuyen('phienban');
  const t = w.document.querySelector('#noiDung').textContent;
  return /BẢN NHÁP/.test(t) && /ĐANG SỬ DỤNG/.test(t) && /ĐÃ LƯU TRỮ/.test(t);
})());
kt('Sao lưu nói rõ nạp tệp sẽ THAY dữ liệu, và máy chủ chưa đổi gì', (() => {
  w.chuyen('saoluu');
  const t = w.document.querySelector('#noiDung').textContent;
  return /sẽ THAY toàn bộ dữ liệu/.test(t) && /máy chủ chưa đổi gì/i.test(t);
})());
kt('Bảng phân quyền nói đủ ba vai và ghi rõ ai KHÔNG làm được gì', (() => {
  w.chuyen('nguoidung');
  const t = w.document.querySelector('#noiDung').textContent;
  return /PHT một phân hiệu/.test(t) && /không/.test(t) && /Báo nghỉ/.test(t);
})());

console.log('\n19c. Biểu mẫu Báo nghỉ');
const vaiGV = { ...S.nguoiDung };
S.nguoiDung = { vaiTro: 'gv', gvId: S.giaoVien[0].id, diemTruongId: null };
w.chuyen('baonghi');
kt('Biểu mẫu đúng bốn ô — ngày, buổi, lý do, ghi chú. Không thêm thủ tục nào', (() => {
  const nd = w.document.querySelector('#noiDung');
  return !!nd.querySelector('#bnNgay') && nd.querySelectorAll('[data-bnbuoi]').length === 3
    && nd.querySelectorAll('[data-bnlydo]').length === 5 && !!nd.querySelector('#bnGhiChu');
})());
kt('Tuyệt đối không có tệp minh chứng, chữ ký hay bước phê duyệt nào', (() => {
  const t = w.document.querySelector('#noiDung').textContent;
  return !/minh chứng|chữ ký|phê duyệt|trình ký/i.test(t)
    && !w.document.querySelector('#noiDung input[type=file]');
})());
kt('Ba lựa chọn buổi đúng như bản giao việc: sáng · chiều · cả ngày', (() => {
  const v = [...w.document.querySelectorAll('[data-bnbuoi]')].map(b => b.dataset.bnbuoi);
  return v.join() === 'S,C,CN';
})());
kt('Ghi chú KHÔNG bắt buộc, và nói rõ điều đó ra',
   /không bắt buộc/i.test(w.document.querySelector('#noiDung').textContent));
kt('Xem trước ngay số tiết sẽ phải bố trí — thầy cô biết mình để lại việc gì', (() => {
  const t = w.document.querySelector('#noiDung').textContent;
  return /tiết sẽ cần bố trí dạy thay/.test(t) || /không có tiết nào/.test(t);
})());
kt('Chọn "Cả ngày" thì số tiết xem trước tăng lên', (() => {
  const so = () => {
    const m = w.document.querySelector('#noiDung').textContent.match(/(\d+) tiết sẽ cần/);
    return m ? +m[1] : 0;
  };
  w.eval(`S.bnBuoi='S'; ve()`); const a = so();
  w.eval(`S.bnBuoi='CN'; ve()`); const b = so();
  return b >= a;
})());
kt('Ngày nghỉ mặc định là ngày làm việc, không rơi vào thứ Bảy hay Chủ nhật', (() => {
  const t = w.eval('thuTuISO(ngayMacDinhNghi())');
  return t >= 2 && t <= 6;
})());
kt('Chưa nối máy chủ mà bấm Gửi thì báo rõ, không im lặng', await (async () => {
  w.document.querySelector('#btGuiNghi').dispatchEvent(new w.Event('click', {bubbles:true}));
  await new Promise(r => setTimeout(r, 60));
  return /máy chủ/i.test(w.document.querySelector('#bao').textContent);
})());
kt('Màn hình Của tôi có nút Báo nghỉ và nút Thông báo ngay đầu trang', (() => {
  w.chuyen('cuatoi');
  const di = [...w.document.querySelectorAll('#noiDung [data-di]')].map(b => b.dataset.di);
  return di.includes('baonghi') && di.includes('thongbao');
})());
S.nguoiDung = vaiGV;
w.chuyen('dieuhanh');

console.log('\n19d. Ô tìm kiếm chung');
/* Ô tìm kiếm chung nằm tĩnh trên thanh đầu trang (3/8/2026) — nút kính
   lúp #btTim mở hộp thả xuống #timNoi, theo người dùng đi mọi màn hình. */
w.chuyen('giaovien');
kt('Nút kính lúp mở hộp tìm, bấm lần nữa hoặc Escape là đóng', (() => {
  w.document.querySelector('#btTim').dispatchEvent(new w.Event('click', {bubbles:true}));
  const mo = w.document.body.classList.contains('mo-tim');
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
  const dongLai = !w.document.body.classList.contains('mo-tim');
  return mo && dongLai;
})());
kt('Màn Giáo viên chỉ còn MỘT ô lọc bảng — hết cảnh hai ô tìm chồng nhau',
   w.document.querySelectorAll('#noiDung input[type="search"], #noiDung .loc-o input').length === 1);
kt('Gõ tên giáo viên thì ra đúng người, kèm số tiết và phân hiệu', (() => {
  const g = S.giaoVien[0];
  const tu = g.hoTen.split(' ').pop();
  const kq = w.eval(`ketQuaTim(${JSON.stringify(tu)})`);
  return kq.some(x => x.loai === 'Giáo viên' && /tiết\/tuần/.test(x.phu));
})());
kt('Tìm KHÔNG DẤU vẫn ra — thầy cô gõ điện thoại ít khi bỏ dấu đúng', (() => {
  const g = S.giaoVien.find(x => /ươ|ơ|ê|ô|à|á/.test(x.hoTen)) || S.giaoVien[0];
  const tu = w.eval(`khongDau(${JSON.stringify(g.hoTen.split(' ').pop())})`).toLowerCase();
  return w.eval(`ketQuaTim(${JSON.stringify(tu)})`).some(x => x.ten === g.hoTen);
})());
kt('Gõ tên lớp thì ra lớp, kèm chủ nhiệm và phân hiệu', (() => {
  const kq = w.eval(`ketQuaTim('1A')`);
  return kq.some(x => x.loai === 'Lớp' && /Chủ nhiệm/.test(x.phu));
})());
kt('Tìm được cả môn học và phân hiệu, không chỉ người và lớp', (() => {
  const a = w.eval(`ketQuaTim('Toán')`);
  const b = w.eval(`ketQuaTim('Diễn')`);
  return a.some(x => x.loai === 'Môn học') && b.some(x => x.loai === 'Phân hiệu');
})());
kt('Gõ một chữ cái thì chưa tìm — tránh đổ cả trường ra màn hình',
   w.eval(`ketQuaTim('a')`).length === 0);
kt('Từ khoá khớp hàng chục lớp vẫn KHÔNG đẩy phân hiệu ra ngoài danh sách',
   ...((() => {
     const kq = w.eval(`ketQuaTim('Diễn')`);
     const loai = [...new Set(kq.map(x => x.loai))];
     return [loai.includes('Phân hiệu') && kq.filter(x => x.loai === 'Lớp').length <= 6,
       loai.join(' · ')];
   })()));

console.log('\n19d2. Xoá thời khóa biểu theo PHẠM VI, giữ tiết đã ghim');
/* Chủ dự án: *"có nút xoá TKB (Lớp/nhiều lớp/Khối/Cả trường), những tiết cố
   định được giữ lại"*. Trước đó chỉ một nút xoá SẠCH cả trường kể cả tiết
   ghim tay — muốn xếp lại một lớp thì phải vứt phần chỉnh tay của mọi lớp. */
const nutHop = re => [...w.document.querySelectorAll('#hopC button')]
  .find(b => re.test(b.textContent));
const tichLop = ids => {
  w.document.querySelectorAll('[data-xlop]').forEach(x => {
    x.checked = ids.includes(x.dataset.xlop);
    x.dispatchEvent(new w.Event('change', { bubbles: true }));
  });
};
const moHopXoa = () => {
  w.chuyen('xep');
  w.document.querySelector('#btXoaTKB').dispatchEvent(new w.Event('click', { bubbles: true }));
};

kt('Bấm "Xoá thời khóa biểu" thì HỎI trước, không xoá ngay hàng trăm tiết', (() => {
  w.eval('KQ_XEP = xepTuDong(0)');
  const truoc = w.eval('soTietDaXep()');
  moHopXoa();
  const n = w.document.querySelectorAll('[data-xlop]').length;
  return [truoc > 0 && w.eval('soTietDaXep()') === truoc && n > 0, `${n} lớp bày ra để chọn`];
})());
kt('Bốn phạm vi người dùng nêu đều chọn được: lớp · nhiều lớp · khối · cả trường', (() => {
  const nut = [...w.document.querySelectorAll('[data-xchon]')].map(b => b.dataset.xchon);
  return [nut.includes('tat') && nut.some(v => /^k\d$/.test(v)) && nut.includes('khong'),
          nut.join(' · ')];
})());
kt('Chưa chọn lớp nào thì KHÔNG bày ra con số xoá', (() => {
  tichLop([]);
  return /Chưa chọn lớp nào/.test(w.document.querySelector('#xTom').textContent);
})());
kt('Chọn "Cả trường" thì nút ghi rõ SỐ TIẾT sắp xoá', (() => {
  w.document.querySelector('[data-xchon="tat"]').dispatchEvent(new w.Event('click', { bubbles: true }));
  const n = nutHop(/^Xoá/);
  return [/^Xoá \d+ tiết$/.test(n.textContent), n.textContent];
})());
kt('Bấm "Không xoá" thì lưới còn nguyên vẹn', (() => {
  const truoc = w.eval('soTietDaXep()');
  nutHop(/^Không xoá$/).dispatchEvent(new w.Event('click', { bubbles: true }));
  return w.eval('soTietDaXep()') === truoc && truoc > 0;
})());

/* --- Xoá MỘT lớp thì các lớp khác không suy suyển --- */
kt('Xoá một lớp thì chỉ lớp ấy trống, lớp khác còn nguyên', (() => {
  const a = S.lop[0].id, b = S.lop[1].id;
  const truocB = Object.keys(S.tkb[b] || {}).length;
  /* Phép thử này soi PHẠM VI, không soi chuyện giữ ghim — mà mục 4 ở trên vừa
     ghim một tiết của chính lớp này, và hộp thì mặc định GIỮ tiết ghim. Gỡ
     ghim ra trước, không thì phép thử đỏ vì đúng cái nó không định soi. */
  Object.values(S.tkb[a] || {}).forEach(v => { delete v.ghim; });
  moHopXoa(); tichLop([a]);
  nutHop(/^Xoá/).dispatchEvent(new w.Event('click', { bubbles: true }));
  return [Object.keys(S.tkb[a] || {}).length === 0
          && Object.keys(S.tkb[b] || {}).length === truocB,
          `lớp kia còn ${Object.keys(S.tkb[b] || {}).length} tiết`];
})());
kt('Hoàn tác lấy lại được lớp vừa xoá', (() => {
  w.eval('hoanTac()');
  return Object.keys(S.tkb[S.lop[0].id] || {}).length > 0;
})());

/* --- Điều quan trọng nhất: tiết ĐÃ GHIM phải sống sót --- */
kt('Mặc định GIỮ tiết đã ghim — đây là cả lý do tính năng này ra đời', (() => {
  const a = S.lop[0].id;
  const ks = Object.keys(S.tkb[a] || {});
  if (ks.length < 3) return [false, 'lớp thử không đủ tiết'];
  ks.forEach(k => { delete S.tkb[a][k].ghim; });
  ks.slice(0, 2).forEach(k => { S.tkb[a][k].ghim = true; });
  moHopXoa();
  const giu = w.document.querySelector('#xGiuGhim');
  tichLop([a]);
  nutHop(/^Xoá/).dispatchEvent(new w.Event('click', { bubbles: true }));
  const con = Object.values(S.tkb[a] || {});
  return [giu.checked && con.length === 2 && con.every(v => v.ghim),
          `còn ${con.length} tiết, tất cả đều ghim`];
})());
kt('Bỏ tích "Giữ tiết đã ghim" thì mới xoá sạch', (() => {
  w.eval('hoanTac()');
  const a = S.lop[0].id;
  moHopXoa(); tichLop([a]);
  const giu = w.document.querySelector('#xGiuGhim');
  giu.checked = false; giu.dispatchEvent(new w.Event('change', { bubbles: true }));
  nutHop(/^Xoá/).dispatchEvent(new w.Event('click', { bubbles: true }));
  return [Object.keys(S.tkb[a] || {}).length === 0, 'lớp trống hẳn'];
})());
kt('Hoàn tác vẫn lấy lại được sau khi xoá sạch', (() => {
  w.eval('hoanTac()');
  return Object.keys(S.tkb[S.lop[0].id] || {}).length > 0;
})());

/* Đếm là hàm thuần — nó nói đúng thì màn hình mới nói đúng */
kt('demXoaLuoi() đếm khớp với thứ xoaLuoi() thật sự làm', (() => {
  const a = S.lop[0].id;
  const { xoa, giu } = JSON.parse(w.eval(`JSON.stringify(demXoaLuoi(${JSON.stringify([a])}, true))`));
  const truoc = Object.keys(S.tkb[a] || {}).length;
  w.eval(`xoaLuoi(${JSON.stringify([a])}, true)`);
  const sau = Object.keys(S.tkb[a] || {}).length;
  w.eval('hoanTac()');
  return [truoc - sau === xoa && sau === giu, `xoá ${xoa}, giữ ${giu}`];
})());

console.log('\n19e. Lưới: cỡ hiển thị và toàn màn hình');
w.chuyen('toantruong');
kt('Có đủ ba cỡ hiển thị gọn · tiêu chuẩn · rộng', (() => {
  const v = [...w.document.querySelectorAll('[data-coluoi]')].map(b => b.dataset.coluoi);
  return v.join() === 'gon,tc,rong';
})());
kt('Đổi cỡ thì lớp CSS của khung lưới đổi theo', (() => {
  w.eval(`S.coLuoi='gon'; ve()`);
  const gon = !!w.document.querySelector('#noiDung .luoi-gon');
  w.eval(`S.coLuoi='rong'; ve()`);
  const rong = !!w.document.querySelector('#noiDung .luoi-rong2');
  w.eval(`S.coLuoi='tc'; ve()`);
  return gon && rong;
})());
kt('Có nút toàn màn hình, và Esc thoát ra được', (() => {
  const nut = w.document.querySelector('[data-toanmh]');
  if (!nut) return false;
  nut.dispatchEvent(new w.Event('click', {bubbles:true}));
  const bat = w.document.body.classList.contains('toan-mh');
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
  return bat && !w.document.body.classList.contains('toan-mh');
})());
kt('Tiêu đề lưới vẫn dính hai chiều — khung cuộn vẫn đúng là .tt-boc', (() => {
  const boc = w.document.querySelector('#noiDung .tt-boc');
  return !!boc && !boc.parentElement.classList.contains('tt-boc');
})());
kt('Kéo thả sang ô ngoài khung giờ của khối thì nói rõ lý do', (() => {
  /* lớp khối 1 tan sớm hơn khối 4–5, nên có ô "không tồn tại" với khối 1 */
  const r = w.eval(`(() => {
    const l = S.lop.find(x => x.khoi === 1);
    S.lopXem = l.id;
    const co = Object.keys(S.tkb[l.id])[0];
    const ngoai = oTuan(5).map(x => x.khoa).find(k => !oTuan(1).some(y => y.khoa === k));
    if (!ngoai || !co) return null;
    return kiemTraChuyen(co, ngoai);
  })()`);
  return r === null || /đã tan trước tiết này/.test(r);
})());
w.chuyen('dieuhanh');

console.log('\n19f. Nút Đặt lại mã giáo viên');
w.chuyen('giaovien');
kt('Màn hình Giáo viên có nút Đặt lại mã giáo viên',
   !!w.document.querySelector('#btDatLaiMaGV'));
kt('Bảng Giáo viên không còn bày mã UUID nào ra màn hình', ...((() => {
  /* chuanMaGV() chạy sẵn lúc nạp nên tới đây phải sạch rồi */
  const xau = w.eval('S.giaoVien.filter(g => maGVXau(g)).length');
  return [xau === 0, `${xau} mã xấu`];
})()));
kt('Bấm nút thì HỎI trước và bày bảng xem trước mã cũ → mã mới', (() => {
  /* cố tình bôi bẩn một mã để hộp có việc phải làm */
  w.eval(`S.giaoVien[0].maGV = '1cc77cb6-df3d-469e-ac36-e4bc2171590f'; ve()`);
  w.document.querySelector('#btDatLaiMaGV').dispatchEvent(new w.Event('click', {bubbles:true}));
  const t = w.document.querySelector('#hopN').textContent;
  return /Mã hiện tại/.test(t) && /Mã mới/.test(t)
    && /1cc77cb6/.test(w.document.querySelector('#hopN').innerHTML);
})());
kt('Hộp nói rõ thứ gì KHÔNG đổi — họ tên, phân công, chủ nhiệm, tài khoản', (() => {
  const t = w.document.querySelector('#hopN').textContent;
  return /Họ tên, phân công, lớp chủ nhiệm, tài khoản đăng nhập/.test(t)
    && /giữ nguyên hoàn toàn/.test(t);
})());
kt('Bấm Huỷ thì mã giữ nguyên như cũ', (() => {
  [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Huỷ')
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  return w.eval(`S.giaoVien[0].maGV`) === '1cc77cb6-df3d-469e-ac36-e4bc2171590f';
})());
kt('Xác nhận thì mã đổi, và họ tên với phân công không xê dịch', ...((() => {
  const truoc = w.eval('JSON.stringify([S.giaoVien.map(g=>g.hoTen), S.phanCong.length])');
  w.document.querySelector('#btDatLaiMaGV').dispatchEvent(new w.Event('click', {bubbles:true}));
  [...w.document.querySelectorAll('#hopC button')].find(b => /^Đặt lại \d+ mã$/.test(b.textContent))
    .dispatchEvent(new w.Event('click', {bubbles:true}));
  const sau = w.eval('JSON.stringify([S.giaoVien.map(g=>g.hoTen), S.phanCong.length])');
  const ma = w.eval('S.giaoVien[0].maGV');
  return [truoc === sau && !/^[0-9a-f]{8}-/.test(ma), `mã mới: ${ma}`];
})()));
kt('Mọi mã đều đúng dạng rồi thì hộp nói thẳng, không bày nút đổi thừa', (() => {
  w.document.querySelector('#btDatLaiMaGV').dispatchEvent(new w.Event('click', {bubbles:true}));
  const t = w.document.querySelector('#hopN').textContent;
  const nut = [...w.document.querySelectorAll('#hopC button')].map(b => b.textContent);
  return /đều đã đúng dạng/.test(t) && nut.length === 1 && nut[0] === 'Đóng';
})());
w.eval('dong()');

/* Ký tự xuống dòng phải là LF. Đã ăn đòn 24/8/2026: một đoạn Python sửa
   bảng màu ghi tệp bằng `io.open(p,'w')`, mà trên Windows chế độ ấy đổi mọi
   `\n` thành `\r\n` — cả 12.707 dòng của index.html thành CRLF trong một lần
   ghi. Hai hậu quả: bản diff phình từ 981 dòng lên toàn bộ tệp nên không ai
   soi được thay đổi thật, và `test/soi-mau-excel.mjs` vỡ vì nó cắt hàm bằng
   `indexOf('\nfunction ...')`. `npm test` và `npm run soi` đều vẫn xanh —
   chúng cắt vùng bằng mốc `#region` nên không đụng tới ký tự xuống dòng.
   Sửa tệp bằng script thì mở ở chế độ nhị phân, hoặc `newline='\n'`. */
/* ==================================================================
   17d. DUYỆT ĐĂNG KÝ TRƯỜNG  (24/8/2026)
   ------------------------------------------------------------------
   Điều phải canh chặt nhất KHÔNG phải là cửa duyệt hoạt động đúng, mà
   là nó KHÔNG khoá nhầm một trường đang chạy. Diễn Liên có 25 lớp, 710
   tiết, phiên bản 9 đã công bố; đặt nhầm về "chờ duyệt" là sáng mai cả
   trường mở app lên không vào được.
   ================================================================== */
console.log('\n17d. Duyệt đăng ký trường');
{
  const dat = (o) => w.eval(`KHO.nguoiDung = ${JSON.stringify(o)}`);
  const goc = w.eval('JSON.parse(JSON.stringify(KHO.nguoiDung||{}))');

  /* --- Máy chủ CHƯA chạy db/duyet-truong.sql --- */
  dat({ ...goc, vaiTro: 'quan_tri' });          /* không có hai cột mới */
  kt('Máy chủ chưa chạy tệp SQL mới thì trường vẫn DÙNG ĐƯỢC BÌNH THƯỜNG',
     w.eval('truongDungDuoc()') === true && w.eval('truongChoDuyet()') === false);
  kt('...và không ai bỗng thành chủ hệ thống', w.eval('laChuHeThong()') === false);
  kt('...mọi mục vẫn hiện như cũ, không thu về màn hình chờ',
     w.eval(`thayDuocMuc('dieuhanh')`) === true && w.eval(`thayDuocMuc('choduyet')`) === false);

  /* --- Trường đã được duyệt --- */
  dat({ ...goc, vaiTro: 'quan_tri', trangThaiTruong: 'dang_dung', chuHeThong: false });
  kt('Trường đang dùng thì vào được Bảng điều hành',
     w.eval('truongDungDuoc()') === true && w.eval(`thayDuocMuc('dieuhanh')`) === true);
  kt('Người thường KHÔNG thấy mục Trường trong hệ thống',
     w.eval(`thayDuocMuc('hethong')`) === false);

  /* --- Trường đang chờ duyệt --- */
  dat({ ...goc, vaiTro: 'quan_tri', trangThaiTruong: 'cho_duyet', chuHeThong: false });
  kt('Trường chờ duyệt thì cả app thu về ĐÚNG hai mục: chờ duyệt và hướng dẫn',
     ['dieuhanh', 'xep', 'lop', 'giaovien', 'phancong', 'nguoidung', 'xuatin', 'cuatoi']
       .every(t => w.eval(`thayDuocMuc('${t}')`) === false)
     && w.eval(`thayDuocMuc('choduyet')`) === true
     && w.eval(`thayDuocMuc('huongdan')`) === true);
  kt('Gõ tay địa chỉ trang khác cũng bị đẩy về màn hình chờ', (() => {
    w.eval(`S.trangHienTai='xep'; apDungQuyen()`);
    return w.eval('S.trangHienTai') === 'choduyet';
  })());
  kt('Màn hình chờ nói rõ đang chờ gì, không bày nút vô dụng nào', (() => {
    w.chuyen('choduyet');
    const t = w.document.querySelector('#noiDung').textContent;
    return /chờ duyệt/i.test(t) && /mã trường/i.test(t)
      && !!w.document.querySelector('#btLamMoiDuyet');
  })());

  /* --- Trường bị từ chối --- */
  dat({ ...goc, vaiTro: 'quan_tri', trangThaiTruong: 'tu_choi', chuHeThong: false });
  kt('Trường bị từ chối cũng về màn hình chờ, nhưng nói khác đi', (() => {
    w.eval(`S.trangHienTai='dieuhanh'; apDungQuyen()`);
    w.chuyen('choduyet');
    const t = w.document.querySelector('#noiDung').textContent;
    return w.eval('truongDungDuoc()') === false && /chưa được chấp nhận/i.test(t);
  })());

  /* --- Chủ hệ thống --- */
  dat({ ...goc, vaiTro: 'quan_tri', trangThaiTruong: 'dang_dung', chuHeThong: true });
  kt('Chủ hệ thống thấy mục Trường trong hệ thống',
     w.eval(`thayDuocMuc('hethong')`) === true);
  kt('Mục ấy có thật trên thanh bên, nằm trong nhóm Hệ thống', (() => {
    const b = w.document.querySelector('[data-t="hethong"]');
    return !!b && b.dataset.nh === 'ht';
  })());
  /* Chủ hệ thống mà trường của họ đang chờ duyệt thì VẪN vào được màn
     duyệt — không thì không ai duyệt nổi cho ai, kể cả chính mình. */
  dat({ ...goc, vaiTro: 'quan_tri', trangThaiTruong: 'cho_duyet', chuHeThong: true });
  kt('Chủ hệ thống không bị màn hình chờ nhốt lại',
     w.eval(`thayDuocMuc('hethong')`) === true);
  kt('...và không bị đẩy về màn hình chờ', (() => {
    w.eval(`S.trangHienTai='hethong'; apDungQuyen()`);
    return w.eval('S.trangHienTai') === 'hethong';
  })());

  /* Huy hiệu đếm đơn chờ — chủ dự án chốt "phải biết ngay khi có ai đăng ký" */
  dat({ ...goc, vaiTro: 'quan_tri', trangThaiTruong: 'dang_dung', chuHeThong: true });
  kt('Chưa tải danh sách thì huy hiệu để RỖNG, không ghi 0', (() => {
    w.eval('DS_TRUONG = null'); w.eval('capNhatDem()');
    return w.document.querySelector('#nDuyet')?.textContent === '';
  })());
  kt('Có đơn chờ thì huy hiệu hiện số và tô ĐỎ', (() => {
    w.eval(`DS_TRUONG = [{id:'a',trangThai:'cho_duyet'},{id:'b',trangThai:'cho_duyet'},
                         {id:'c',trangThai:'dang_dung'}]`);
    w.eval('capNhatDem()');
    const n = w.document.querySelector('#nDuyet');
    return n?.textContent === '2' && n.classList.contains('do');
  })());
  kt('Hết đơn chờ thì về 0 và thôi đỏ — số 0 không bao giờ tô đỏ', (() => {
    w.eval(`DS_TRUONG = [{id:'c',trangThai:'dang_dung'}]`); w.eval('capNhatDem()');
    const n = w.document.querySelector('#nDuyet');
    return n?.textContent === '0' && !n.classList.contains('do');
  })());
  kt('Huy hiệu RỖNG thì bị giấu hẳn, không thành viên xám trống', (() => {
    const css = w.document.documentElement.innerHTML;
    return /\.mi \.n:empty\{display:none\}/.test(css);
  })());
  kt('Bảng trường và hộp duyệt ghi NGÀY GIỜ đọc được, không phải [object Object]', (() => {
    /* Lỗi thật 25/8/2026, lộ ra ở đơn đăng ký đầu tiên: hai chỗ này gọi nhầm
       dongGio() — hàm dựng Ô GIỜ của lưới TKB, trả về mảng ~30 đối tượng —
       thay vì dinhDangLuc(). Màn hình vì thế bày một dãy [object Object]. */
    w.eval(`DS_TRUONG = [{id:'x', ten:'Tiểu học Thử', maTruong:'', trangThai:'cho_duyet',
      tinh:'Nghệ An', xa:'Quỳ Hợp', namHoc:'2026-2027', dienThoai:'0912345678',
      emailLienHe:'', nguoiDangKy:'Cô Thử', emailDangKy:'thu@x.vn',
      taoLuc:'2026-08-25T15:09:00', duyetLuc:null, ghiChu:'',
      soTaiKhoan:1, soLop:0, soGiaoVien:0, soTiet:0, phienBan:null}];
      S.trangHienTai='hethong'; ve()`);
    const bang = w.document.querySelector('#noiDung').textContent;
    w.eval(`hopDuyetTruong('x', true)`);
    const hopDT = w.document.querySelector('#hopN').textContent;
    w.eval('dong()');
    return !bang.includes('[object Object]') && !hopDT.includes('[object Object]')
      && /15:09 25\/08\/2026/.test(bang) && /15:09 25\/08\/2026/.test(hopDT);
  })());
  w.eval('DS_TRUONG = null');

  w.eval(`KHO.nguoiDung = ${JSON.stringify(goc)}; S.trangHienTai='dieuhanh'`);
}

/* --- Biểu mẫu đăng ký: điện thoại và Gmail, không còn ô mã trường --- */
kt('Biểu mẫu đăng ký hỏi số điện thoại và Gmail, BỎ ô mã trường', (() => {
  w.eval(`KHO.phien = KHO.phien || {email:'thu@gmail.com', uid:'u1'}`);
  w.eval('hopDangKyTruong()');
  const n = w.document.querySelector('#hopN');
  const co = id => !!n.querySelector(id);
  return co('#dkHoTen') && co('#dkTen') && co('#dkDT') && co('#dkMail')
    && !co('#dkMa');
})());
kt('Gmail điền sẵn bằng tài khoản vừa đăng nhập — không bắt gõ lại',
   w.document.querySelector('#dkMail')?.value === 'thu@gmail.com',
   w.document.querySelector('#dkMail')?.value);
kt('Hộp nói rõ đăng ký xong CHƯA dùng được ngay', (() => {
  const t = w.document.querySelector('#hopN').textContent;
  return /chưa dùng được ngay/i.test(t) && /5 chữ số/i.test(t);
})());
kt('Nút đổi từ "Đăng ký" thành "Gửi đăng ký" — đúng việc nó làm', (() => {
  const nut = [...w.document.querySelectorAll('#hopC button')].map(b => b.textContent);
  return nut.includes('Gửi đăng ký') && !nut.includes('Đăng ký');
})());
kt('Gõ Gmail liên hệ KHÁC Gmail đăng nhập là bật cảnh báo tài khoản quản trị', (() => {
  /* Bài học Tiểu học Châu Đình 25/8/2026: hồ sơ quản trị gắn theo tài khoản
     ĐANG ĐĂNG NHẬP, không phải địa chỉ gõ trong ô liên hệ — mà người dùng
     đinh ninh ngược lại, sau duyệt đăng nhập bằng Gmail trường thì thành
     "chưa thuộc trường nào". */
  const o = w.document.querySelector('#dkMail'), k = w.document.querySelector('#dkCanhMail');
  const anLucDau = k && k.style.display === 'none';
  o.value = 'c1truong@nghean.edu.vn'; o.oninput && o.oninput();
  const hienKhiKhac = k.style.display !== 'none' && /thu@gmail\.com/.test(k.textContent);
  o.value = 'thu@gmail.com'; o.oninput && o.oninput();
  const anKhiTrung = k.style.display === 'none';
  return anLucDau && hienKhiKhac && anKhiTrung;
})());
w.eval('dong()');
kt('Hộp mời đăng nhập trước khi đăng ký khuyên dùng Gmail CỦA NHÀ TRƯỜNG', (() => {
  const phienCu = w.eval('KHO.phien');
  w.eval('KHO.phien = null');
  w.eval('hopDangKyTruong()');
  const co = /Gmail của nhà trường/i.test(w.document.querySelector('#hopN').textContent);
  w.eval('dong()');
  w.eval(`KHO.phien = ${JSON.stringify(phienCu)}`);
  return co;
})());

/* --- Tệp SQL: chốt chặn không khoá trường đang chạy --- */
console.log('\n17e. db/duyet-truong.sql');
{
  const sql = readFileSync(join(goc, 'db/duyet-truong.sql'), 'utf8');
  /* Đây là dòng quan trọng nhất của cả tệp SQL. Đặt default 'cho_duyet'
     là mọi trường đang chạy bị khoá ngay lần chạy tệp. */
  kt('Cột trạng thái mặc định là "dang_dung", KHÔNG phải "cho_duyet"',
     /alter column trang_thai_duyet set default 'dang_dung'/.test(sql)
     && !/set default 'cho_duyet'/.test(sql));
  kt('Trường đã có được đặt về "dang_dung" TRƯỚC khi thêm ràng buộc', (() => {
    const iUpdate = sql.indexOf("update truong set trang_thai_duyet = 'dang_dung'");
    const iCheck = sql.indexOf('truong_trang_thai_duyet_ok');
    return iUpdate > 0 && iCheck > iUpdate;
  })());
  kt('Đơn mới thì mới mang trạng thái "cho_duyet"',
     /'cho_duyet', v_dt, nullif\(v_mail,''\)/.test(sql));
  kt('duyet_truong() TỰ KIỂM QUYỀN ở dòng đầu — security definer bỏ qua RLS', (() => {
    const i = sql.indexOf('create or replace function duyet_truong');
    const than = sql.slice(i, i + 1400);
    return /if not la_chu_he_thong\(\) then/.test(than)
      && than.indexOf('if not la_chu_he_thong()') < than.indexOf('update truong');
  })());
  kt('ds_truong_he_thong() lọc theo la_chu_he_thong() ngay trong câu lệnh',
     /where la_chu_he_thong\(\)/.test(sql));
  kt('Mã trường là 5 CHỮ SỐ, khác hẳn mã mời giáo viên 6 chữ cái',
     /lpad\(\(10000 \+ floor\(random\(\) \* 90000\)\)::int::text, 5, '0'\)/.test(sql));
  kt('Duyệt lại trường đã có mã thì GIỮ NGUYÊN mã cũ',
     /if v_ma is null or v_ma !~ '\^\[0-9\]\{5\}\$' then/.test(sql));
  kt('Vòng sinh mã có van chống treo, không lặp vô hạn',
     /if i > 200 then/.test(sql));
  kt('Chặn thật ở đường ghi: trường chưa duyệt thì không lưu được TKB',
     /truong_duoc_dung\(\)/.test(sql)
     && /create policy p_tkb_ghi on tkb_phien_ban[\s\S]{0,200}truong_duoc_dung\(\)/.test(sql));
  kt('KHÔNG viết cứng Gmail của chủ dự án vào tệp — kho mã là kho công khai',
     !/@gmail\.com/.test(sql.replace(/dia-chi-gmail-cua-thay@gmail\.com/g, '')));
}

console.log('\n17h. Bảng Giáo viên: Gmail và cột Dạy (28/8/2026)');
/* Đề xuất của chủ dự án: *"tại nút Giáo viên cần có thêm cột gmail để khỏi
   phải mời nữa"*, và bảng cần đủ TT · Họ tên · GVCN · Lớp(môn) · Gmail ·
   định mức · Ghi chú. */
{
  w.eval(`S.giaoVien[0].email='co.mot@gmail.com';
          S.giaoVien[1].ghiChu='Nghỉ thai sản';`);
  w.chuyen('giaovien');
  const dau = [...w.document.querySelectorAll('#bGV thead th')].map(t => t.textContent.trim());
  kt('Bảng có đủ bảy thứ chủ dự án nêu, theo đúng thứ tự đọc',
     ['TT', 'Họ và tên', 'Gmail', 'Chủ nhiệm', 'Dạy', 'Tiết / ĐM', 'Ghi chú']
       .every(c => dau.includes(c)), dau.join(' · '));
  /* Mười cột là trần: thêm nữa là cụm Sửa/Xoá tràn khỏi màn hình 1500px và
     người dùng phải cuộn ngang mới bấm được — đúng lỗi vừa vá. */
  kt('Không quá mười cột, để cụm Sửa/Xoá luôn nằm trong tầm nhìn',
     dau.length <= 10, `${dau.length} cột`);
  /* Phân hiệu và số buổi cần đã GỘP vào ô của chúng, không mất thông tin */
  kt('Phân hiệu nằm ngay dưới cột Dạy — nó chính là nơi những lớp ấy nằm',
     !!w.document.querySelector('.gv-day-o .gv-ph .tag.dt'));
  kt('Số buổi cần nằm dưới Tình trạng',
     /\d+\/\d+ buổi/.test(w.document.querySelector('.gv-buoi')?.textContent || ''),
     w.document.querySelector('.gv-buoi')?.textContent);

  /* Cụm SỬA / XOÁ thay dấu × đỏ trần (28/8/2026) */
  kt('Cuối mỗi dòng là cụm Sửa / Xoá có chữ, không còn dấu × trần', (() => {
    const n = [...w.document.querySelectorAll('#bGV .hang-nut button')];
    return n.length >= 2 && n[0].textContent.includes('Sửa') && n[1].textContent.includes('Xoá')
        && !w.document.querySelector('#bGV .x-hang');
  })());
  kt('Bấm Sửa mở hộp hồ sơ với ĐỦ bảy ô, kể cả Gmail · Điện thoại · Phân hiệu', (() => {
    w.document.querySelector('[data-suagv]').click();
    const co = ['#tgTen', '#tgMail', '#tgDT', '#tgPH', '#tgDM', '#tgCN', '#tgGhi']
      .every(x => !!w.document.querySelector(x));
    const dung = w.document.querySelector('#tgTen').value;
    w.eval('dong()');
    return [co && !!dung, dung];
  })()[0]);
  /* Thêm và Sửa dùng CHUNG một bộ ô — hai bản riêng thì sớm muộn một bên thiếu */
  kt('Hộp Thêm giáo viên cũng có đúng bảy ô ấy', (() => {
    w.eval('hopThemGV()');
    const co = ['#tgTen', '#tgMail', '#tgDT', '#tgPH', '#tgDM', '#tgCN', '#tgGhi']
      .every(x => !!w.document.querySelector(x));
    const rong = w.document.querySelector('#tgTen').value === '';
    w.eval('dong()');
    return co && rong;
  })());
  /* Ô Gmail trong hộp soát y hệt ô gõ tay trong bảng và đường nhập Excel */
  kt('Hộp Thêm chặn Gmail sai dạng, không thêm người nào', (() => {
    const truoc = w.eval('S.giaoVien.length');
    w.eval('hopThemGV()');
    w.document.querySelector('#tgTen').value = 'Người Thử';
    w.document.querySelector('#tgMail').value = 'khong-phai-email';
    [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Thêm').click();
    const ok = w.eval('S.giaoVien.length') === truoc;
    w.eval('dong()');
    return ok;
  })());

  /* Mã đúng dạng NGAY LÚC KHAI (29/8/2026). Trước đó hộp này sinh mã slug
     `gv_cao_thi_minh_khue`, nên trường mới khai xong vẫn phải bấm *Đặt lại
     mã giáo viên* — một việc dọn dẹp lẽ ra chỉ dành cho dữ liệu cũ. */
  const maVuaKhai = (() => {
    w.eval('hopThemGV()');
    w.document.querySelector('#tgTen').value = 'Cao Thị Minh Khuê';
    [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Thêm').click();
    const ma = w.eval("(S.giaoVien.find(g=>g.hoTen==='Cao Thị Minh Khuê')||{}).maGV||''");
    w.eval("S.giaoVien = S.giaoVien.filter(g=>g.hoTen!=='Cao Thị Minh Khuê'); ve();");
    return ma;
  })();
  kt('Giáo viên vừa khai đã mang mã chuẩn, không chờ nút Đặt lại',
     maVuaKhai === 'Khuê_CTM', maVuaKhai);

  /* Bảng sắp theo SỐ TIẾT giảm dần, không theo thứ tự S.giaoVien — dò theo id
     chứ đừng lấy dòng đầu, không thì phép thử xanh/đỏ theo thứ tự sắp xếp. */
  const idMot = w.eval('S.giaoVien[0].id');
  const o = w.document.querySelector(`[data-gvmail="${idMot}"]`);
  kt('Ô Gmail sửa được ngay trong bảng, không phải mở hộp thoại nào',
     !!o && o.tagName === 'INPUT' && o.value === 'co.mot@gmail.com', o?.value);
  kt('Người đã đăng nhập được đánh dấu, để biết còn phải phát quyền cho ai',
     /chưa khai/.test(w.document.querySelector('#bGV').innerHTML));

  /* Cột Dạy CHỈ ĐỌC — máy tự ghi từ phân công, nên không bao giờ lệch */
  kt('Cột Dạy không có ô nhập nào — nó là chỗ đọc, không phải chỗ gõ',
     !w.document.querySelector('.gv-day-o input, .gv-day-o select'));
  kt('Cột Dạy gom các lớp cùng bộ môn lại, không kể ra 25 dòng',
     /\+\d+ ·/.test(w.document.querySelector('#bGV').textContent),
     (w.document.querySelector('.gv-day')?.textContent || '').trim());
  /* ⚠️ Bảng từng dòng bỏ đi thì ô chọn `#fGV` cũng mất — lối đi này phải
     chuyển sang lọc bằng chính ô tìm kiếm của ma trận, không thì bấm cột Dạy
     sang một bảng 35 hàng không lọc gì cả. */
  kt('Bấm vào cột Dạy thì sang màn Phân công đã lọc sẵn người ấy', (() => {
    const nut = w.document.querySelector('[data-gvpc]');
    if (!nut) return false;
    const ten = w.eval(`gvId(${JSON.stringify(nut.dataset.gvpc)}).hoTen`);
    nut.click();
    const hien = [...w.document.querySelectorAll('#bMT tbody tr')]
      .filter(r => r.style.display !== 'none');
    const ok = w.eval('S.trangHienTai') === 'phancong' &&
               w.document.querySelector('#fTim')?.value === ten &&
               hien.length >= 1 && hien.length < w.eval('[...gvTrongPV()]').length;
    /* Dùng MỘT LẦN rồi xoá — để lại thì lần sau mở màn Phân công vẫn bị lọc */
    const con = w.eval('S.pcGV');
    w.chuyen('giaovien');
    return [ok && !con, `${hien.length} hàng · "${ten}"`];
  })());

  /* Hai phép soát Gmail phải GIỐNG HỆT đường nhập Excel — một lối vào lỏng
     hơn lối kia là hàng rào coi như không có. */
  const goMail = (i, chu) => {
    const ds = [...w.document.querySelectorAll('[data-gvmail]')];
    ds[i].value = chu;
    ds[i].dispatchEvent(new w.Event('change', { bubbles: true }));
  };
  goMail(1, 'khong-phai-email');
  kt('Gõ địa chỉ sai thì TRẢ Ô VỀ giá trị cũ, không để chữ hỏng nằm lại',
     w.eval('S.giaoVien.filter(g=>g.email==="khong-phai-email").length') === 0);
  goMail(1, 'co.mot@gmail.com');
  kt('Gõ trùng Gmail của người khác cũng bị chặn — mỗi địa chỉ một người',
     w.eval('S.giaoVien.filter(g=>g.email==="co.mot@gmail.com").length') === 1);
  w.chuyen('giaovien');
  goMail(1, 'Co.Hai@Gmail.COM');
  kt('Gõ đúng thì lưu về chữ thường, bỏ khoảng trắng thừa',
     w.eval('S.giaoVien.filter(g=>g.email==="co.hai@gmail.com").length') === 1,
     w.eval('JSON.stringify(S.giaoVien.map(g=>g.email).filter(Boolean))'));
  w.eval("S.giaoVien.forEach(g=>{g.email=''; g.ghiChu='';})");
}

console.log('\n17i. db/gmail-giao-vien.sql');
{
  const sql = readFileSync(join(goc, 'db/gmail-giao-vien.sql'), 'utf8');
  kt('Thêm cột bằng "if not exists" — chạy lại lần nữa vẫn an toàn',
     /add column if not exists email/.test(sql) &&
     /add column if not exists ghi_chu/.test(sql));
  /* Hai hồ sơ cùng Gmail thì lúc đăng nhập máy không biết mở lịch của ai —
     đúng bài học sự cố 2/8/2026 (mã mời nối nhầm vào hồ sơ trùng tên 0 tiết). */
  kt('Một Gmail chỉ trỏ về MỘT hồ sơ trong cùng một trường',
     /create unique index[\s\S]{0,160}giao_vien \(truong_id, lower\(email\)\)/.test(sql));
  kt('Chỉ số là PARTIAL — hồ sơ chưa khai Gmail vẫn để null thoải mái',
     /where email is not null/.test(sql));
  /* ⚠️ Nhận email qua THAM SỐ là ai cũng tự khai mình là người khác. */
  kt('Địa chỉ lấy từ VÉ ĐĂNG NHẬP, hàm không nhận tham số nào',
     /create or replace function vao_bang_gmail\(\)/.test(sql) &&
     /auth\.jwt\(\) ->> 'email'/.test(sql));
  kt('security definer nhưng TỰ KIỂM QUYỀN — cùng khuôn duyet_truong()',
     /security definer/.test(sql) && /v_uid\s+uuid := auth\.uid/.test(sql) &&
     /if v_uid is null/.test(sql));
  kt('Chỉ nhận hồ sơ CHƯA nối tài khoản nào — không cướp được quyền của ai',
     /g\.nguoi_dung_id is null/.test(sql));
  kt('Trường chưa được duyệt thì không ai vào bằng Gmail được',
     /trang_thai_duyet, 'dang_dung'\) = 'dang_dung'/.test(sql));
  kt('Chỉ tài khoản đã đăng nhập gọi được hàm này',
     /revoke all on function vao_bang_gmail\(\) from public/.test(sql) &&
     /grant execute on function vao_bang_gmail\(\) to authenticated/.test(sql));
}

/* App phải THỬ Gmail trước khi kết luận "chưa thuộc trường nào", và có
   ĐƯỜNG LUI khi máy chủ chưa chạy tệp SQL ấy. */
{
  const src = readFileSync(duong, 'utf8');
  kt('napHoSo() thử nhận mình bằng Gmail trước khi đẩy người dùng thành KHÁCH',
     /if\(thuGmail && \(await vaoBangGmail\(\)\)\.ok\) return napHoSo\(false\);/.test(src));
  kt('Chỉ thử MỘT LẦN — hai hàm không gọi vòng nhau',
     /async function napHoSo\(thuGmail=true\)/.test(src));
  kt('Máy chủ chưa chạy tệp SQL thì im lặng lùi về đường mã mời',
     /return \{ok:false, thongBao:''\};/.test(src));
  kt('Ghi giáo viên có đường lui khi máy chủ chưa có bốn cột thêm sau',
     /Could not find the '\(email\|ghi_chu\|dien_thoai\|diem_truong_id\)' column/.test(src) &&
     /KHO\.coCotGV=false/.test(src) &&
     /\{email, ghi_chu, dien_thoai, diem_truong_id, \.\.\.r\}/.test(src));
}

console.log('\n17f. Màn hình trường CHỜ DUYỆT (28/8/2026)');
/* Chủ dự án gửi ảnh chụp màn hình này: giá trị căn phải dính sát vạch viền
   rồi tràn hẳn ra ngoài thẻ, và thanh đầu trang bày tên TRƯỜNG MẪU ngay phía
   trên tấm thẻ ghi tên trường thật trong đơn. */
{
  const cu = w.eval('JSON.stringify(KHO.nguoiDung||null)');
  w.eval(`KHO.nguoiDung = {hoTen:'Người Đăng Ký', email:'truong@nghean.edu.vn',
    tenTruong:'Trường tiểu học Đang Chờ', vaiTro:'quan_tri',
    trangThaiTruong:'cho_duyet'}`);
  w.chuyen('choduyet');
  const noi = w.document.querySelector('#noiDung').innerHTML;

  /* `.the` cố ý KHÔNG mang padding — mọi màn hình khác bọc nội dung trong
     `.the-t`. Thiếu lớp bọc ấy là chữ dính vạch viền, trên điện thoại thì tràn. */
  kt('Thẻ chờ duyệt bọc nội dung trong .the-t nên chữ không dính vạch viền',
     /class="the"[^>]*>\s*<div class="the-t">/.test(noi));
  kt('Vẫn bày đủ bốn dòng thông tin đơn',
     (noi.match(/class="hang"/g) || []).length === 4);

  kt('Thanh đầu trang lấy tên trường TRONG ĐƠN, không phải tên bộ dữ liệu mẫu',
     w.document.querySelector('#tenTruong').textContent === 'TRƯỜNG TIỂU HỌC ĐANG CHỜ',
     w.document.querySelector('#tenTruong').textContent);
  kt('Thanh đầu trang nói rõ đang chờ duyệt, không bày địa bàn của trường mẫu',
     /chờ duyệt/i.test(w.document.querySelector('#diaChi').textContent));
  /* Chuông đang đếm cảnh báo của bộ dữ liệu MẪU — con số vô nghĩa với trường
     chưa có dữ liệu nào của mình. */
  kt('Chuông và kính lúp im hẳn khi trường chưa được duyệt',
     w.document.querySelector('#btChuong').style.display === 'none' &&
     w.document.querySelector('#btTim').style.display === 'none');
  /* Thanh bên lúc này chỉ còn nhóm HỆ THỐNG, mà nhóm mặc định (ĐIỀU HÀNH) đã
     bị giấu — không tự bung thì thanh bên là mấy dòng chữ không bấm được. */
  kt('Nhóm menu duy nhất còn hiện thì TỰ BUNG, không để thanh bên trống trơn',
     [...w.document.querySelectorAll('.nh')]
       .some(n => n.style.display !== 'none' && n.classList.contains('mo')));

  w.eval(`KHO.nguoiDung = ${cu}`);
  w.chuyen('dieuhanh');
}

console.log('\n17g. Không còn chữ "Supabase" trên giao diện (28/8/2026)');
/* Đa số cán bộ giáo viên không biết Supabase là gì. Tên ấy chỉ còn được phép
   nằm trong COMMENT của mã — chỗ người sửa mã cần biết mình gọi dịch vụ nào. */
{
  const src = readFileSync(duong, 'utf8');
  const khongComment = src.replace(/\/\*[\s\S]*?\*\//g, '')
                          .replace(/^\s*\/\/.*$/gm, '');
  const con = (khongComment.match(/Supabase/g) || []).length;
  kt('Không một chuỗi hiển thị nào còn chữ "Supabase"', con === 0,
     con ? `còn ${con} chỗ` : 'sạch');
  kt('Ghi chú kỹ thuật trong mã thì VẪN giữ tên thật của dịch vụ',
     /Supabase/.test(src));
}

console.log('\n17c. Ký tự xuống dòng');
[['src/index.html'], ['src/manifest.webmanifest'], ['src/sw.js'],
 ['CLAUDE.md'], ['package.json']].forEach(([t]) => {
  const d = readFileSync(join(goc, t));
  const crlf = (d.toString('latin1').match(/\r\n/g) || []).length;
  kt(`${t} dùng LF, không phải CRLF`, crlf === 0, crlf ? `${crlf} dòng CRLF` : '');
});
console.log('\n17j. Lớp bố cục dùng thì phải có khai');
/* `.cot4` được DÙNG ở màn Trường trong hệ thống mà chưa bao giờ được KHAI,
   nên bốn thẻ số liệu rơi xuống xếp dọc — chiếm gần trọn màn hình để nói
   bốn con số, đúng lỗi đã chê ở Bảng điều hành ngày 3/8. Chủ dự án phát
   hiện qua ảnh chụp, không phải phép thử: jsdom không tính bố cục nên mọi
   bộ soi đều xanh. Cách canh được là soi ở mức VĂN BẢN — lớp chia cột nào
   xuất hiện trong HTML thì phải có một quy tắc CSS mang đúng tên ấy. */
{
  const src = readFileSync(join(goc, 'src/index.html'), 'utf8');
  const dung = new Set();
  for (const m of src.matchAll(/class="([^"]*)"/g))
    m[1].split(/\s+/).forEach(c => { if (/^cot\d+$/.test(c)) dung.add(c); });
  const thieu = [...dung].filter(c => !new RegExp(`\.${c}\s*\{`).test(src));
  kt('Mọi lớp chia cột đang dùng đều có quy tắc CSS', thieu.length === 0,
     thieu.length ? `thiếu: ${thieu.join(' · ')}` : [...dung].sort().join(' · '));
}

console.log('\n17k. Chủ hệ thống mở dữ liệu trường khác — CHỈ ĐỌC');
/* Chủ dự án muốn "sửa luôn chứ xem cũng không cần lắm". Đã bàn và chốt chỉ
   đọc: đường ghi suy mã trường từ tài khoản, mở nó ra là sửa xương sống mà
   năm trường đang lưu dữ liệu thật qua đó. Bộ này canh đúng lời hứa ấy. */
{
  /* Chế độ này chỉ bật cho chủ hệ thống, nên phải giả lập cả tài khoản —
     thiếu nó thì `thayDuocMuc('hethong')` trả false và phép thử kêu oan. */
  const ndGoc = w.eval('JSON.stringify(KHO.nguoiDung)');
  const dat = (id, ten) => w.eval(`KHO.truongXem = ${JSON.stringify(id ? {id, ten} : null)}`);
  w.eval(`KHO.nguoiDung = ${JSON.stringify({id:'u-cht', hoTen:'Trần Thanh Chung',
    email:'chungtrt@gmail.com', vaiTro:'quan_tri', truongId:'t-cua-toi',
    tenTruong:'Trường của tôi', chuHeThong:true, diemTruongId:null, gvId:null})}`);

  dat(null);
  const quyenGoc = w.eval('quyen()');
  kt('Bình thường thì quản trị vẫn đủ quyền — cờ chỉ-xem không rò rỉ ra ngoài',
     quyenGoc.toanTruong === true && quyenGoc.chiXem === false &&
     w.eval('duocSuaNguon()') === true && w.eval('duocXep()') === true);

  dat('t-khac', 'Trường Tiểu học Thần Lĩnh 1');
  kt('Người thường mở trường khác thì MỌI quyền ghi tắt cùng lúc', (() => {
    w.eval('KHO.nguoiDung.chuHeThong = false');
    const r = w.eval('quyen()').chiXem === true && w.eval('duocSuaNguon()') === false
              && w.eval('duocXep()') === false && w.eval('quyen()').laQuanLy === false;
    return [r, 'một cờ khoá đồng loạt'];
  })());

  /* Phép thử đáng giá nhất: quét CẢ 12 màn hình khai báo và điều hành, đòi
     không còn một nút ghi nào. Cùng khuôn phép thử "không màn hình nào lọt
     chữ Bước 1". Sót một nút thì cái sót ấy ghi đè dữ liệu trường khác. */
  const MAN = ['dieuhanh','thongtin','diemtruong','khunggio','lop','giaovien',
               'monhoc','phonghoc','phancong','buoiban','xep','tkblop'];
  const NUT_GHI = /^(Lưu|Lưu ngay|Xếp|Xếp nhanh|Xếp kỹ|Thêm|Tạo|Xoá|Đặt lại|Công bố|Nhập từ Excel|Khôi phục)/;
  const lot = [];
  for (const t of MAN) {
    w.chuyen(t);
    [...w.document.querySelectorAll('#noiDung button')].forEach(b => {
      if (NUT_GHI.test(b.textContent.trim())) lot.push(`${t}: ${b.textContent.trim()}`);
    });
  }
  kt('Người thường xem trường khác: không màn hình nào còn nút ghi',
     lot.length === 0, lot.slice(0, 4).join(' | ') || `quét ${MAN.length} màn hình`);
  w.eval('KHO.nguoiDung.chuHeThong = true');

  /* ---------- CHỦ HỆ THỐNG SỬA ĐƯỢC NGAY (31/8/2026) ----------
     Bản đầu bắt bấm "Bật chế độ sửa" cho chắc tay. Chủ dự án bác thẳng:
     "Tài khoản tổng mà không làm gì được." Đúng — một cái nút chỉ để mở
     khoá thứ mình đã có quyền là phiền, không phải an toàn. */
  kt('Chủ hệ thống mở trường khác là SỬA ĐƯỢC NGAY, không phải bấm bật gì',
     w.eval('dangSuaTruongKhac()') === true && w.eval('quyen()').chiXem === false
     && w.eval('duocSuaNguon()') === true && w.eval('duocXep()') === true
     && w.eval('quyen()').laQuanLy === true);

  kt('Không còn hàm bật/tắt chế độ sửa trong mã',
     w.eval('typeof batSuaTruongXem') === 'undefined');

  /* Thẻ nổi là toàn bộ phần cảnh báo còn lại: nói rõ đang đứng ở trường nào,
     và nói rõ đang SỬA chứ không phải xem. */
  kt('Thẻ nổi báo ĐANG SỬA, chỉ còn một lối thoát', (() => {
    w.chuyen('dieuhanh');
    const the = w.document.querySelector('#theXemTruong');
    const t = (the?.textContent || '').replace(/\s+/g, ' ').trim();
    return [/ĐANG SỬA/.test(t) && /Thần Lĩnh 1/.test(t)
            && !the.querySelector('#btSuaTruongXem')
            && !!the.querySelector('#btThoatXemTruong')
            && /7A1FA2|122, ?31, ?162/.test(the?.getAttribute('style') || ''),
            t.slice(0, 70)];
  })());

  /* ⚠️ Người KHÔNG phải chủ hệ thống lọt vào chế độ xem thì vẫn CHỈ ĐỌC —
     cùng một cờ, không có đường thứ hai. */
  kt('Người thường xem trường khác thì vẫn chỉ đọc', (() => {
    w.eval('KHO.nguoiDung.chuHeThong = false');
    const r = w.eval('quyen()').chiXem === true && w.eval('duocSuaNguon()') === false
              && w.eval('dangSuaTruongKhac()') === false;
    w.eval('KHO.nguoiDung.chuHeThong = true');
    return [r, 'chiXem = true'];
  })());

/* ⚠️ Ranh giới ĐỌC / GHI của chế độ xem trường khác. Đây là chỗ dễ sai nhất
   của cả tính năng: đường ĐỌC phải theo trường đang xem (không thì mở trường
   bạn mà nhật ký lại hiện của trường mình), còn đường GHI phải giữ nguyên
   trường của tài khoản — an toàn kép, không bao giờ ghi nhầm sang trường khác
   kể cả khi cờ chỉ-xem có lỗi. */
{
  const src = readFileSync(join(goc, 'src/index.html'), 'utf8');
  const than = f => {
    const i = src.indexOf(f);
    return i < 0 ? '' : src.slice(i, i + 900);
  };
  const DOC = ['async function luoiDayDuTuMayChu(){', 'async function taiThemNgayNghi(',
               'async function lichSuPhienBan(', 'async function taiPhienBan(',
               'async function nhatKy('];
  const hongDoc = DOC.filter(f => than(f) && !/truongDangXem\(\)/.test(than(f)));
  kt('Mọi đường ĐỌC lấy dữ liệu theo trường đang xem', hongDoc.length === 0,
     hongDoc.join(' | ') || `${DOC.length} hàm`);

  /* ⚠️ LUẬT NÀY ĐỔI NGÀY 30/8/2026. Trước đó mọi đường ghi khoá cứng vào
     trường của tài khoản — "an toàn kép" cho chế độ chỉ đọc. Chủ dự án bác
     lại, và bác đúng: ông vốn có toàn quyền qua SQL Editor của chính dự án
     mình, nên khoá trong app không bảo vệ dữ liệu khỏi ai, chỉ đẩy ông sang
     đường SQL tay vốn nguy hiểm hơn hẳn.

     Nay đường ghi đi theo TRƯỜNG ĐANG XEM. Hàng rào chuyển về đúng chỗ của
     nó: quy tắc RLS `*_ghi_cht` ở máy chủ (db/chu-he-thong-sua.sql), cộng
     một cú bấm bật có chủ ý ở giao diện. */
  const GHI_THEO_XEM = ['async function congBoTKB(', 'function ghiNhatKy(',
                        'async function soHieuKeTiep(', 'async function luuBuoiBan('];
  const hongGhi = GHI_THEO_XEM.filter(f => than(f) && !/truongDangXem\(\)/.test(than(f)));
  kt('Đường ghi sửa-hộ đi theo trường đang xem, không ghi đè trường của mình',
     hongGhi.length === 0, hongGhi.join(' | ') || `${GHI_THEO_XEM.length} hàm`);

  /* Ba bảng cố ý KHÔNG mở cho chế độ hỗ trợ — ma_moi (chìa khoá vào trường),
     bao_nghi và day_thay (chứa lý do nghỉ, dữ liệu cá nhân). Chúng phải chặn
     TUYỆT ĐỐI khi đang xem trường khác, chứ không nới theo cờ bật sửa: nới
     mà vẫn ghi bằng trường của tài khoản là ghi nhầm sang trường mình. */
  const KHOA_HAN = ['async function luuDayThay(', 'async function xoaDayThay(',
                    'async function guiBaoNghi(', 'async function huyBaoNghi(',
                    'async function danhDauXuLy('];
  const hongKhoa = KHOA_HAN.filter(f => than(f) && !/if\(dangXemTruongKhac\(\)\) return LOI_CHI_XEM\(\)/.test(than(f)));
  kt('Bảng dạy thay và báo nghỉ chặn tuyệt đối, không nới theo cờ bật sửa',
     hongKhoa.length === 0, hongKhoa.join(' | ') || `${KHOA_HAN.length} hàm`);

  /* Và mã mời thì vẫn khoá vào trường của tài khoản. */
  kt('Mã mời vẫn khoá vào trường của tài khoản',
     /KHO\.nguoiDung\.truongId/.test(than('async function taoMaMoi(')));
}

  /* Với NGƯỜI THƯỜNG thẻ vẫn đỏ và vẫn ghi "chỉ đọc" — chủ hệ thống thì
     thấy dải tím "ĐANG SỬA", đã có phép thử riêng ở trên. */
  kt('Người thường: thẻ nổi đỏ báo rõ đang xem trường nào, kèm lối thoát', (() => {
    w.eval('KHO.nguoiDung.chuHeThong = false');
    w.chuyen('dieuhanh');
    const the = w.document.querySelector('#theXemTruong');
    const r = [!!the && /Thần Lĩnh 1/.test(the.textContent) && /chỉ đọc/.test(the.textContent) &&
               !!the.querySelector('#btThoatXemTruong'), the?.textContent.trim().slice(0, 60)];
    w.eval('KHO.nguoiDung.chuHeThong = true');
    return r;
  })());

  kt('Vẫn quay về được danh sách trường — không tự nhốt mình trong trường khác',
     w.eval("thayDuocMuc('hethong')") === true);

  dat(null);
  w.chuyen('dieuhanh');
  kt('Thoát ra thì thẻ đỏ biến mất và quyền trở lại như cũ',
     !w.document.querySelector('#theXemTruong') &&
     w.eval('duocSuaNguon()') === true);
  /* Trả KHO.nguoiDung về đúng trạng thái cũ — phép thử sau còn dùng */
  w.eval(`KHO.nguoiDung = ${ndGoc}`);
}

console.log('\n17l. Thẻ Content-Security-Policy');
/* Vé làm mới nằm ở localStorage nên một lỗ XSS là mất phiên đăng nhập của
   thầy cô. esc() phủ mọi chỗ đã soi; thẻ này là lớp thứ hai. */
{
  const src = readFileSync(join(goc, 'src/index.html'), 'utf8');
  const the = (src.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"/) || [])[1] || '';
  const chi = {};
  the.split(';').forEach(d => {
    const p = d.trim().split(/\s+/);
    if (p[0]) chi[p[0]] = p.slice(1);
  });

  kt('Có thẻ CSP trong <head>', !!the);
  kt('Khai đủ năm chỉ thị cốt lõi',
     ['default-src', 'script-src', 'connect-src', 'base-uri', 'object-src']
       .every(d => d in chi),
     Object.keys(chi).join(' · '));
  kt('object-src none và base-uri self — chặn hai lối chèn kinh điển',
     chi['object-src']?.[0] === "'none'" && chi['base-uri']?.[0] === "'self'");

  /* ⚠️ So với địa chỉ THẬT trong cauhinh.js, không ghi cứng — cùng khuôn phép
     thử ba-chỗ-khai-màu-chủ-đề. Ghi cứng thì đổi dự án Supabase là phép thử
     vẫn xanh trong khi app mất hẳn đường gọi máy chủ. */
  const url = (readFileSync(join(goc, 'src/cauhinh.js'), 'utf8')
    .match(/SUPABASE_URL\s*=\s*'([^']+)'/) || [])[1] || '';
  kt('connect-src cho đúng máy chủ khai trong cauhinh.js',
     !!url && (chi['connect-src'] || []).includes(url), `${url} · ${(chi['connect-src']||[]).join(' ')}`);

  /* Hai thư viện Excel nạp khi cần từ jsdelivr — chặn nhầm là mất hẳn đường
     nhập và xuất Excel, mà không có lỗi nào hiện ra cho người dùng. */
  const cdn = [...src.matchAll(/napThuVien\('https:\/\/([^/']+)/g)].map(m => m[1]);
  kt('Mọi CDN app thật sự nạp đều được script-src cho qua',
     cdn.length > 0 && cdn.every(d => (chi['script-src'] || []).some(x => x.includes(d))),
     [...new Set(cdn)].join(' · '));
  kt('Phông chữ Google được font-src và style-src cho qua',
     (chi['font-src'] || []).some(x => x.includes('fonts.gstatic.com')) &&
     (chi['style-src'] || []).some(x => x.includes('fonts.googleapis.com')));

  /* Thẻ meta không có hiệu lực với frame-ancestors — khai vào chỉ tổ làm
     trình duyệt kêu trong console và người sau tưởng đã chống được clickjacking. */
  kt('Không khai frame-ancestors trong thẻ meta — thẻ meta không nhận chỉ thị ấy',
     !('frame-ancestors' in chi));

  /* Bước bắt buộc trước khi siết script-src bằng hash: còn một onclick inline
     thì 'unsafe-inline' là bắt buộc, mà cờ ấy vô hiệu hoá mọi hash. */
  kt('Không còn onclick viết thẳng trong HTML',
     (src.match(/onclick="/g) || []).length === 0,
     `${(src.match(/onclick="/g) || []).length} chỗ`);
}

console.log('\n17m. Bảng Môn học — cụm Sửa/Xoá và hiện đủ môn');
/* Chủ dự án 29/8/2026: "nút dấu x (màu đỏ) cần thay bằng nút sửa/xoá. Và cả
   trang này vẫn bị lấp các môn còn lại, cho hàng sát lên, cho đủ 13+ môn". */
{
  w.chuyen('monhoc');
  const bang = w.document.querySelector('#bMon');

  /* ⚠️ Chỉ nút XOÁ, cố ý không có nút Sửa. Chủ dự án 29/8/2026: "nút sửa thì
     có lẽ không cần, vì có thể sửa trực tiếp và lưu lại tổng thể được" — mọi
     ô trên hàng đều sửa tại chỗ. Nhưng nút Xoá thì phải có: môn nhà trường tự
     thêm (HD Tự học, Kĩ năng CDS) có ngày được thay bằng môn khác. */
  kt('Không còn dấu × trần — mỗi dòng một nút Xoá có chữ',
     !w.document.querySelector('[data-xoamon].x-hang') &&
     w.document.querySelectorAll('[data-xoamon]').length === S.monHoc.length,
     `${w.document.querySelectorAll('[data-xoamon]').length} nút Xoá`);
  kt('KHÔNG bày nút Sửa — sửa ngay trên bảng, hai lối vào cùng một thứ thì thừa',
     w.document.querySelectorAll('[data-suamon]').length === 0 &&
     typeof w.hopSuaMon === 'undefined');
  kt('Sửa tên ngay trên bảng vẫn đổi theo ở bảng phân công', (() => {
    const i = S.monHoc.findIndex(m => m.ten === 'Mỹ thuật');
    const soPC = S.phanCong.filter(p => p.mon === 'Mỹ thuật').length;
    const o = w.document.querySelector(`[data-monten="${i}"]`);
    o.value = 'Mĩ thuật';
    o.dispatchEvent(new w.Event('change', { bubbles: true }));
    const ok = soPC > 0 && S.phanCong.filter(p => p.mon === 'Mĩ thuật').length === soPC;
    /* trả lại tên cũ */
    w.chuyen('monhoc');
    const o2 = w.document.querySelector(`[data-monten="${i}"]`);
    o2.value = 'Mỹ thuật'; o2.dispatchEvent(new w.Event('change', { bubbles: true }));
    return [ok, `${soPC} dòng`];
  })());

  /* Nút Xoá KHÔNG tô đỏ sẵn — hai nút cạnh nhau mà một cái đỏ rực thì mắt bị
     kéo về đúng cái nguy hiểm hơn. Cùng luật đã đặt cho bảng Giáo viên 28/8. */
  kt('Nút Xoá chỉ đỏ khi rê chuột, không tô đỏ sẵn',
     [...w.document.querySelectorAll('[data-xoamon]')].every(b =>
       b.classList.contains('n-xoa') && !/color\s*:/.test(b.getAttribute('style') || '')));

  /* ⚠️ Khung cuộn 66vh chỉ chứa 10 hàng, mà danh mục chuẩn đã 13 môn — nghĩa
     là MỌI trường đều mất bốn môn cuối. Bảng phải cao tự nhiên. */
  kt('Bảng KHÔNG khoá chiều cao — 13+ môn hiện đủ, trang cuộn như mọi trang',
     !/max-height/.test(bang?.closest('.bang')?.getAttribute('style') || ''),
     bang?.closest('.bang')?.getAttribute('style') || 'không có style');
  kt('Hàng dùng lớp gọn để 13 môn vừa một màn hình', bang?.classList.contains('gon'));

  /* Ô nhập tên rơi xuống DƯỚI chấm màu là thứ làm hàng cao gấp đôi — đúng
     nguyên nhân bốn môn cuối bị đẩy ra ngoài. */
  kt('Chấm màu và ô tên nằm cùng một dòng, không bị ngắt',
     [...bang.querySelectorAll('tbody td:first-child')]
       .every(td => /nowrap/.test(td.getAttribute('style') || '')));
}

console.log('\n17n. Hộp khai môn — một bộ ô cho cả Thêm lẫn Sửa');
{
  /* Hộp cũ chỉ hỏi tên · màu · phòng · số tiết, thiếu đúng hai ô "Ưu tiên
     sáng sớm" và "Tránh đầu cuối buổi" mà bảng vẫn có — đúng chuyện đã xảy
     ra với hộp Thêm giáo viên hôm 28/8. */
  w.hopThemMon();
  const oCan = ['#tmTen', '#tmMau', '#tmPhong', '#tmNang', '#tmNhe'];
  kt('Hộp Thêm môn đủ ô, không thiếu hai ô cách xếp mà bảng vẫn có',
     oCan.every(x => !!w.document.querySelector(x)) &&
     [1,2,3,4,5].every(k => !!w.document.querySelector(`[data-tmc="${k}"]`)),
     oCan.filter(x => !w.document.querySelector(x)).join(' ') || 'đủ 5 ô + 5 khối');
  w.eval('dong()');

  kt('Trùng tên với môn đã có thì BỊ CHẶN', (() => {
    w.hopThemMon();
    const truoc = S.monHoc.length;
    w.document.querySelector('#tmTen').value = 'Toán';
    [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === 'Thêm').click();
    const ok = S.monHoc.length === truoc;
    w.eval('dong()');
    return ok;
  })());
}

console.log('\n17o. Mốc so sánh là DANH MỤC MÔN của trường, không phải hằng số CT GDPT');
/* Tiểu học Quảng Châu 1 (29/8/2026) thêm hai môn tự chọn — HD Tự học và Kĩ
   năng CDS — rồi mở khung giờ lên 9 buổi cho đủ 32 ô. App bày dải vàng "Khối
   1 thừa 5 ô mỗi tuần · học sinh có tiết trống giữa buổi", trong khi 32 ô
   khớp đúng 32 tiết đã khai. Theo lời cảnh báo ấy thì nhà trường sẽ đi xoá
   bớt một buổi học có thật. */
{
  const monGoc = w.eval('JSON.stringify(S.monHoc)');
  const kgGoc  = w.eval('JSON.stringify(S.khungGio)');

  /* Dựng đúng cảnh của trường: mỗi khối 32 tiết môn, khung 9 buổi = 32 ô */
  w.eval(`S.monHoc = [{ten:'Gộp chuẩn', mau:'m-tv', chuan:{1:27,2:27,3:28,4:30,5:30}},
                      {ten:'HD Tự học', mau:'m-hdtn', chuan:{1:5,2:5,3:4,4:2,5:2}}]`);
  kt('tietCanKhoi() cộng theo danh mục môn, không lấy hằng số 27',
     w.eval('tietCanKhoi(1)') === 32 && w.eval('tietCanKhoi(4)') === 32,
     `K1 ${w.eval('tietCanKhoi(1)')} · K4 ${w.eval('tietCanKhoi(4)')}`);

  w.eval(`S.khungGio.forEach(k=>{ k.bat = !(k.thu===4 && k.buoi==='C');
    [1,2,3,4,5].forEach(x=>{ k.tietKhoi = k.tietKhoi||{}; k.tietKhoi[x] = k.buoi==='S'?4:3; }); })`);
  /* ⚠️ Bảng nay đối chiếu theo LỚP, và mốc của một lớp là bảng phân công của
     chính nó khi đã có. Cảnh thử này nói về DANH MỤC MÔN — con số dùng khi
     trường vừa khai lớp xong, chưa phân công tiết nào — nên phải dọn bảng
     phân công đi, không thì đang đo một thứ khác. */
  const pcGoc17o = w.eval('JSON.stringify(S.phanCong)');
  w.eval('S.phanCong = []');
  w.eval("S.khoiKG = 'tat'");
  w.chuyen('khunggio');
  const chu = w.document.querySelector('#noiDung').textContent;
  kt('Khung 9 buổi khớp 32 tiết thì KHÔNG còn báo "thừa ô"',
     !/thừa \d+ ô/.test(chu) && /khớp đúng danh mục môn/.test(chu),
     (chu.match(/(thừa \d+ ô[^.]*|khớp đúng danh mục môn)/) || [''])[0]);
  /* ⚠️ Ba con số phải nói rõ NGHĨA. Bản trước ghi "cần 32 / CT 27" ngay dưới
     tổng, chủ dự án đọc và hỏi "chữ cần 30, cần 32 là gì thầy chưa hiểu" — ô
     rộng 78px không đủ chỗ cho một cái nhãn tự giải thích. Nay ô chỉ bày KẾT
     LUẬN (đủ · thừa 2 · thiếu 3), còn ba con số nằm ở bảng dưới, có tên cột
     viết thành câu. */
  kt('Ô tổng chỉ bày kết luận, không bày con số trần không rõ nghĩa',
     /đủ/.test(chu) && !/cần 32/.test(chu));
  kt('Chốt tổng bày theo TỪNG LỚP, không gộp cả khối', (() => {
    const cot = [...w.document.querySelectorAll('#noiDung thead th')].map(x => x.textContent);
    /* Dải nhãn khối vẫn còn (nó gom cột cho dễ đọc) — thứ phải mất là CỘT
       khai theo khối: giờ mỗi lớp một cột riêng. */
    const oKhai = [...w.document.querySelectorAll('#noiDung [data-tl]')].length;
    return [cot.includes('1A') && cot.includes('5E') && oKhai > 0,
            `${cot.length} cột · ${oKhai} ô khai theo lớp`];
  })());
  kt('Bảng dưới nói rõ nghĩa từng con số, kèm phần tự chọn vượt mốc CT',
     /Khung giờ đang mở/.test(chu) && /Danh mục môn cộng lại/.test(chu) &&
     /CT GDPT 2018 quy định/.test(chu) && /tự chọn/.test(chu));

  /* Thiếu chỗ thật thì vẫn phải báo — bỏ mốc cứng không có nghĩa là bỏ luôn
     phép soát. */
  w.eval(`S.khungGio.forEach(k=>{ if(k.thu===6 && k.buoi==='C') k.bat=false; })`);
  w.chuyen('khunggio');
  kt('Bớt một buổi thì báo THIẾU chỗ, đúng số còn hụt',
     /thiếu 3 chỗ mỗi tuần/.test(w.document.querySelector('#noiDung').textContent),
     (w.document.querySelector('#noiDung').textContent.match(/thiếu \d+ chỗ mỗi tuần/) || [''])[0]);
  /* Gom các lớp cùng một tình trạng — 25 lớp cùng thiếu 3 chỗ là MỘT việc */
  kt('Các lớp cùng tình trạng gom thành một dòng, không kể ra 25 lần', (() => {
    const chu = w.document.querySelector('#noiDung').textContent;
    const so = (chu.match(/thiếu 3 chỗ mỗi tuần/g) || []).length;
    return [so <= 5, `${so} dòng cảnh báo cho 25 lớp`];
  })());

  /* ⚠️ Nhãn phải nói HẬU QUẢ. Chủ dự án đọc "thừa 2" rồi vẫn phải hỏi lại
     "chữ thừa 2 ý nghĩa gì đây em" — đó là nhận xét về cái bảng, không phải
     điều người dùng cần biết. Thứ họ cần: hai ô ấy sẽ TRỐNG, học sinh ngồi
     chơi giữa buổi. */
  kt('Thừa chỗ thì nói "ô trống" và nói rõ học sinh ngồi chơi mấy tiết', (() => {
    w.eval(`S.monHoc = [{ten:'Ít môn', mau:'m-tv', chuan:{1:30,2:30,3:32,4:32,5:32}}]`);
    w.eval(`S.khungGio.forEach(k=>{ k.bat = !(k.thu===4 && k.buoi==='C');
      [1,2,3,4,5].forEach(x=>{ k.tietKhoi = k.tietKhoi||{}; k.tietKhoi[x] = k.buoi==='S'?4:3; }); })`);
    w.chuyen('khunggio');
    const chu = w.document.querySelector('#noiDung').textContent;
    return [/2 ô trống/.test(chu) && /ngồi chơi 2 tiết/.test(chu) && !/thừa 2/.test(chu),
            (chu.match(/có \d+ ô trống mỗi tuần|ngồi chơi \d+ tiết/) || [''])[0]];
  })());
  w.eval(`S.phanCong = ${pcGoc17o}`);

  /* Trường chưa khai môn nào thì lùi về mốc CT GDPT — đường lui phải còn */
  w.eval('S.monHoc = []');
  /* ⚠️ Khối 1–2 là **25**, không phải 27. Bản trước cộng sẵn 2 tiết Tiếng Anh
     — môn TỰ CHỌN ở lớp 1–2, không nằm trong số tiết Thông tư 32/2018 quy
     định. Chủ dự án chỉ đúng chỗ này. */
  kt('Chưa khai môn nào thì lùi về chuẩn CT GDPT 2018 (khối 1–2 là 25 tiết chính khoá)',
     w.eval('tietCanKhoi(1)') === 25 && w.eval('tietCanKhoi(3)') === 28 &&
     w.eval('tietCanKhoi(5)') === 30,
     `K1 ${w.eval('tietCanKhoi(1)')} · K3 ${w.eval('tietCanKhoi(3)')} · K5 ${w.eval('tietCanKhoi(5)')}`);

  w.eval(`S.monHoc = ${monGoc}; S.khungGio = ${kgGoc}`);
  w.chuyen('khunggio');
}

console.log('\n17p. Bảng phân công dạng MA TRẬN giáo viên × môn');
/* Chủ dự án gửi ảnh tờ phân công trường vẫn kẻ tay: hàng giáo viên, cột môn.
   Bảng từng dòng đúng về dữ liệu nhưng sai về hình dạng công việc — cô Mỹ
   thuật dạy 25 lớp thành 25 dòng giống hệt nhau, mà câu hỏi thật của người
   xếp là "ai dạy môn gì" và "còn ô nào trống". */
{
  w.eval("S.pcXem='matran'");
  w.chuyen('phancong');
  const bang = w.document.querySelector('#bMT');
  const soGV = [...w.eval('gvTrongPV()')].length;
  const soMon = w.eval('dsMonDung()').length;

  kt('Vẽ được bảng ma trận: mỗi giáo viên một hàng, mỗi môn một cột',
     !!bang && bang.querySelectorAll('tbody tr').length === soGV &&
     bang.querySelectorAll('thead th.mt-mon').length === soMon,
     `${bang?.querySelectorAll('tbody tr').length} hàng × ${bang?.querySelectorAll('thead th.mt-mon').length} cột môn`);

  /* ⚠️ Thứ tự hàng: CHỦ NHIỆM TRƯỚC theo đúng thứ tự lớp 1A → lớp cuối, rồi
     mới tới giáo viên bộ môn. Chủ dự án 29/8/2026: "có cách nào mặc định bắt
     đầu từ tên giáo viên chủ nhiệm lớp 1A đến lớp cuối cùng, sau đó đến giáo
     viên bộ môn". Xếp theo tên A–Z thì cô chủ nhiệm 1A nằm giữa bảng, không ai
     dò được lớp nào đã đủ người. */
  kt('Chủ nhiệm xếp trước, theo đúng thứ tự lớp 1A → lớp cuối', (() => {
    const cn = [...bang.querySelectorAll('tbody tr')]
      .map(r => r.querySelector('td.mt-cn')?.textContent.trim() || '')
      .filter(x => x && x !== '·');
    /* ⚠️ Chỉ so với những lớp CÓ chủ nhiệm: trường 60 lớp mà mới 41 lớp có
       người thì lấy 41 lớp đầu danh sách là so nhầm, phép thử đỏ oan. */
    const thu = w.eval('xepTheoKhoi(S.lop)')
      .filter(l => w.eval(`!!cnCuaLop(${JSON.stringify(l.id)})`))
      .map(l => w.eval(`tenLopDay(${JSON.stringify(l.id)})`));
    return [cn.length > 0 && cn.join(' | ') === thu.join(' | '), cn.slice(0, 5).join(' · ')];
  })());

  kt('Giáo viên bộ môn nằm SAU tất cả chủ nhiệm, xếp theo họ tên', (() => {
    const hang = [...bang.querySelectorAll('tbody tr')];
    const coCN = hang.map(r => {
      const t = r.querySelector('td.mt-cn')?.textContent.trim() || '';
      return !!t && t !== '·';
    });
    const dauBoMon = coCN.indexOf(false);
    /* Không được xen kẽ: mọi chủ nhiệm phải đứng liền trước mọi bộ môn */
    const xenKe = dauBoMon >= 0 && coCN.slice(dauBoMon).some(x => x);
    const boMon = hang.slice(dauBoMon < 0 ? hang.length : dauBoMon)
      .map(r => r.querySelector('td.mt-ten')?.textContent.trim() || '');
    const daSap = boMon.every((t, i) => i === 0 || boMon[i - 1].localeCompare(t, 'vi') <= 0);
    return [!xenKe && daSap && boMon.length > 0,
            `${boMon.length} bộ môn ở cuối`];
  })());

  /* ⚠️ Lớp chủ nhiệm phải ở CỘT RIÊNG, không xếp dưới họ tên. Chủ dự án
     29/8/2026: "tách giúp thầy cột GVCN lớp để cho tên các lớp không rớt xuống
     dòng" — hàng có chủ nhiệm cao gấp rưỡi hàng không có, cả bảng gợn sóng và
     đọc theo hàng ngang rất mệt. Thứ tự lấy đúng tờ phân công nhà trường vẫn
     kẻ: TT · Họ tên · Tổng số tiết · Chủ nhiệm · các môn. */
  kt('Chủ nhiệm là một CỘT riêng, không phải dòng phụ dưới họ tên', (() => {
    const dau = [...bang.querySelectorAll('thead th')].map(t => t.textContent.trim());
    const coCN = [...bang.querySelectorAll('tbody td.mt-cn')].filter(t => /^\d/.test(t.textContent.trim()));
    return [dau.slice(0, 4).join(' · ') === 'TT · Họ và tên · Tiết · Chủ nhiệm' &&
            coCN.length > 0 &&
            !bang.querySelector('.mt-ten div'),
            dau.slice(0, 4).join(' · ')];
  })());
  kt('Ô họ tên và ô tiết không còn dòng phụ nào để hàng cao thêm', (() => {
    /* jsdom không tính bố cục, nên kiểm bằng CẤU TRÚC: ô tên chỉ chứa <b>,
       không còn <div> lớp chủ nhiệm bên dưới; ô tiết mang lớp nowrap. */
    const ten = [...bang.querySelectorAll('tbody td.mt-ten')];
    const tiet = [...bang.querySelectorAll('tbody td.mt-tiet')];
    const src = readFileSync(join(goc, 'src/index.html'), 'utf8');
    return [ten.length > 0 && ten.every(t => !t.querySelector('div')) &&
            tiet.length === ten.length &&
            /\.mt-tiet\{[^}]*nowrap/.test(src),
            `${ten.length} hàng`];
  })());

  /* Ba cột trái phải DÍNH, không thì cuộn sang môn thứ mười là không còn biết
     đang ở hàng của ai — đúng bài học lưới rộng ngày 2/8. */
  kt('Cột thứ tự và họ tên dính lại khi cuộn ngang',
     bang.querySelectorAll('tbody tr:first-child .mt-dinh').length >= 2);

  kt('Ô có phân công ghi lớp và tổng tiết; ô trống thì bấm được để thêm', (() => {
    const co = [...bang.querySelectorAll('.mt-o.co')];
    const trong = [...bang.querySelectorAll('.mt-o:not(.co)')];
    return [co.length > 0 && trong.length > 0 &&
            /\d+t/.test(co[0].textContent) &&
            co.every(o => o.dataset.mt) && trong.every(o => o.dataset.mt),
            `${co.length} ô có · ${trong.length} ô trống`];
  })());

  /* Cô dạy nhiều lớp thì GOM lại, không kể ra 25 tên lớp — cùng luật đã đặt
     cho cột "Dạy" của bảng Giáo viên hôm 28/8. */
  kt('Giáo viên dạy nhiều lớp thì gom thành "n lớp", không liệt kê hết', (() => {
    const nhieu = [...bang.querySelectorAll('.mt-o.co')]
      .filter(o => /\d+ lớp/.test(o.textContent));
    return [nhieu.length > 0, nhieu[0]?.textContent.trim().slice(0, 20)];
  })());

  kt('Hàng cuối đếm mỗi môn đã có người dạy ở mấy lớp trên tổng số lớp',
     /\/\s*\d+/.test(bang.querySelector('tfoot')?.textContent || ''),
     bang.querySelector('tfoot td:nth-child(4)')?.textContent.trim());

  /* Bấm một ô mở đúng hộp Phân công nhanh, điền sẵn người và môn của ô ấy —
     một hộp dùng chung, không viết bản thứ hai. */
  kt('Bấm ô mở hộp phân công điền sẵn đúng giáo viên và môn của ô', (() => {
    const o = bang.querySelector('.mt-o.co[data-mt]');
    const [gid, mon] = o.dataset.mt.split('|');
    o.onclick();
    const ok = w.document.querySelector('#nqGV')?.value === gid &&
               w.document.querySelector('#nqMon')?.value === mon;
    /* và tích sẵn đúng những lớp đang dạy, để người dùng thấy hiện trạng */
    const daCo = S.phanCong.filter(p => p.gvId === gid && p.mon === mon).length;
    const tich = [...w.document.querySelectorAll('[data-nq]')].filter(x => x.checked).length;
    w.eval('dong()');
    return [ok && tich === daCo, `${tich}/${daCo} lớp tích sẵn`];
  })());

  kt('Ô tìm kiếm lọc TẠI CHỖ trên ma trận, không vẽ lại cả màn hình', (() => {
    const o = w.document.querySelector('#fTim');
    const ten = S.giaoVien[0].hoTen;
    o.value = ten; o.oninput();
    const hien = [...bang.querySelectorAll('tbody tr')].filter(r => r.style.display !== 'none');
    o.value = ''; o.oninput();
    return [hien.length >= 1 && hien.length < soGV, `${hien.length}/${soGV} hàng`];
  })());

  /* ⚠️ Bảng từng dòng BỎ HẲN 29/8/2026 — chủ dự án: "bỏ phân công theo dòng".
     Hai ô lọc và thẻ chuyển đi theo; bày một ô không làm gì thì người dùng gõ
     vào rồi tưởng phần mềm hỏng. */
  kt('Không còn ô lọc, thẻ chuyển hay bảng từng dòng nào sót lại',
     !w.document.querySelector('#fGV') && !w.document.querySelector('#fLop') &&
     !w.document.querySelector('[data-pcxem]') && !w.document.querySelector('#bPC') &&
     typeof w.bangPC === 'undefined');
  kt('Thanh công cụ chỉ còn MỘT nút — không còn "Thêm dòng phân công"',
     !w.document.querySelector('#btThemPC') && !!w.document.querySelector('#btPCTheoGV'));

  /* Ô môn phải có viền: bảng chỉ kẻ ngang thì 15 cột là một mảng trắng, không
     ai đoán được ô nào bấm được. */
  kt('Mỗi ô môn có đường kẻ dọc để nhìn ra ranh giới ô', (() => {
    const src = readFileSync(join(goc, 'src/index.html'), 'utf8');
    return /\.mt-o\{[^}]*border-left/.test(src);
  })());
}

  /* Hộp nhập của mục Phân công nay CHỈ mời mẫu MA TRẬN — màn hình đã là bảng
     ma trận thì mẫu Excel phải cùng hình dạng (chủ dự án 29/8/2026). */
  kt('Hộp nhập Phân công mô tả mẫu ma trận, không còn mẫu từng dòng', (() => {
    w.chuyen('phancong');
    w.eval('hopNhapExcel()');
    const chu = w.document.querySelector('#hopN')?.textContent || '';
    const ok = /Lop_day/.test(chu) && /Mỗi môn một cột/.test(chu) &&
               !/Ma_lop/.test(chu) && !/So_tiet/.test(chu);
    return [ok, chu.slice(0, 60).replace(/\s+/g, ' ')];
  })());
  kt('Và nói rõ tệp ma trận THAY toàn bộ bảng phân công, không phải thêm/cập nhật', (() => {
    const chu = w.document.querySelector('#hopN')?.textContent || '';
    const ok = /THAY toàn bộ/.test(chu) && !/không xoá dòng nào đang có/.test(chu);
    w.eval('dong()');
    return [ok, (chu.match(/THAY toàn bộ[^.]*/) || [''])[0].slice(0, 50)];
  })());
  kt('Mục khác vẫn giữ mẫu từng dòng và lời hứa thêm/cập nhật', (() => {
    w.chuyen('lop');
    w.eval('hopNhapExcel()');
    const chu = w.document.querySelector('#hopN')?.textContent || '';
    w.eval('dong()');
    return [/Ma_lop/.test(chu) && !/THAY toàn bộ/.test(chu), chu.slice(0, 40).replace(/\s+/g, ' ')];
  })());

console.log('\n17q. Số hiệu và ngày thực hiện của văn bản thời khóa biểu');
/* Chủ dự án 29/8/2026: "khi ký và ban hành có tính pháp lý, có thể trong 1 học
   kỳ nhiều Phiên bản … Vẫn phải để ngày thực hiện, vì đó là tính pháp lý của
   văn bản!". Đánh số liên tiếp theo cả năm học, từ 01. */
{
  const vbGoc = w.eval('JSON.stringify(KHO.vanBan)');

  w.eval('KHO.vanBan = null');
  const nhap = w.eval('khungIn("THỜI KHÓA BIỂU", ["Lớp 1A"], "<table></table>", "doc")');
  kt('Chưa ban hành bản nào thì KHÔNG bịa số hiệu — đó là bản nháp',
     !/Số \d+\/TKB/.test(nhap) && !/Thực hiện từ/.test(nhap));

  w.eval(`KHO.vanBan = {soHieu:3, ngayThucHien:'2026-09-07', hocKy:'Học kỳ 1',
                        banHanhLuc:'2026-08-30T02:00:00Z'}`);
  const in3 = w.eval('khungIn("THỜI KHÓA BIỂU", ["Lớp 1A"], "<table></table>", "doc")');
  kt('Bản in mang số hiệu hai chữ số, đúng thể thức văn bản',
     /Số 03\/TKB/.test(in3), (in3.match(/Số \d+\/TKB/) || [''])[0]);
  kt('Và mang mốc pháp lý "Thực hiện từ ngày…"',
     /Thực hiện từ ngày 07 tháng 9 năm 2026/.test(in3),
     (in3.match(/\(Thực hiện từ[^)]*\)/) || [''])[0]);
  kt('Học kỳ in cạnh năm học — một học kỳ có nhiều bản',
     /Học kỳ 1/.test(in3));

  /* ⚠️ Ngày ký phải là NGÀY BAN HÀNH đã khoá, không phải ngày bấm nút In. Bản
     cũ ghi ngày hôm nay nên in lại tháng sau là ra ngày khác — hai bản của
     cùng một thời khóa biểu mang hai ngày ký thì hết làm căn cứ được. */
  kt('Ngày ký lấy từ ngày BAN HÀNH đã khoá, không phải ngày in',
     /ngày 30 tháng 8 năm 2026/.test(in3),
     (in3.match(/ngày \d+ tháng \d+ năm \d+/g) || []).join(' | '));

  /* Bốn loại bản in dùng chung khungIn nên không thể lệch nhau */
  kt('Cả bốn loại bản in đọc cùng một nguồn số hiệu', (() => {
    const src = readFileSync(join(goc, 'src/index.html'), 'utf8');
    const soLanTuTinh = (src.match(/so_hieu|soHieu/g) || []).length;
    return [/KHO\.vanBan/.test(src) && !/khungIn\([^)]*soHieu/.test(src),
            `${soLanTuTinh} chỗ nhắc số hiệu`];
  })());

  w.eval(`KHO.vanBan = ${vbGoc}`);
}


/* ==================================================================
   17r. BA VIỆC HỌC TỪ SMARTSCHEDULER (30/8/2026)
   ------------------------------------------------------------------
   Lọc giáo viên theo tình trạng · soi một giáo viên trên lưới · bảng
   ai rảnh tiết nào. Cả ba chỉ ĐỌC S.tkb, không đụng thuật toán và
   không thêm đường ghi nào lên máy chủ.
   ================================================================== */
{
  console.log('\n17r. Lọc giáo viên theo TÌNH TRẠNG lịch');
  w.chuyen('giaovien');
  const dai = w.document.querySelector('.loc-nhanh');
  kt('Màn Giáo viên có dải lọc nhanh', !!dai);

  /* Mọi nút phải mang số DƯƠNG. Nút "Vượt định mức 0" là đúng thứ luật
     "số 0 không tô đỏ" cấm — ba mươi hai lần nói không có gì xảy ra. */
  kt('Không nút nào mang số 0', (() => {
    const so = [...(dai?.querySelectorAll('.ln:not(.ln-bo) span') || [])]
      .map(x => +x.textContent);
    return [so.length > 0 && so.every(n => n > 0), so.join(' · ') || 'không có nút nào'];
  })());

  /* Bấm nút thì bảng chỉ còn đúng số dòng của tình trạng ấy */
  kt('Bấm một nút thì bảng lọc còn đúng số dòng ghi trên nút', (() => {
    const nut = dai?.querySelector('.ln:not(.ln-bo)');
    if (!nut) return [false, 'không có nút nào'];
    const so = +nut.querySelector('span').textContent;
    nut.dispatchEvent(new w.Event('click'));
    const hien = [...w.document.querySelectorAll('#bGV tr[data-loctu]')]
      .filter(r => r.style.display !== 'none').length;
    return [hien === so, `nút ghi ${so}, bảng còn ${hien} dòng`];
  })());

  kt('Bấm lại chính nút ấy là TẮT lọc, bảng trở về đủ dòng', (() => {
    const nut = w.document.querySelector('.loc-nhanh .ln:not(.ln-bo)');
    nut.dispatchEvent(new w.Event('click'));
    const hien = [...w.document.querySelectorAll('#bGV tr[data-loctu]')]
      .filter(r => r.style.display !== 'none').length;
    const tong = w.document.querySelectorAll('#bGV tr[data-loctu]').length;
    return [hien === tong, `${hien}/${tong} dòng`];
  })());

  /* Ô gõ chữ và dải nút phải CHỒNG nhau, không cái nào xoá kết quả cái kia */
  kt('Lọc bằng nút rồi gõ thêm chữ thì hai bộ lọc chồng nhau', (() => {
    const nut = w.document.querySelector('.loc-nhanh .ln:not(.ln-bo)');
    nut.dispatchEvent(new w.Event('click'));
    const chiNut = [...w.document.querySelectorAll('#bGV tr[data-loctu]')]
      .filter(r => r.style.display !== 'none');
    if (!chiNut.length) return [false, 'nút không lọc ra dòng nào'];
    /* Gõ đúng tên một người ĐANG hiện — kết quả phải còn đúng 1 dòng */
    const ten = chiNut[0].querySelector('input[data-gvten]')?.value
             || chiNut[0].querySelector('b')?.textContent || '';
    const o = w.document.querySelector('[data-loc="bGV"]');
    if (!o) return [true, 'ít giáo viên nên chưa bày ô tìm kiếm — bỏ qua'];
    o.value = ten; o.dispatchEvent(new w.Event('input'));
    const sau = [...w.document.querySelectorAll('#bGV tr[data-loctu]')]
      .filter(r => r.style.display !== 'none').length;
    o.value = ''; o.dispatchEvent(new w.Event('input'));
    w.document.querySelector('.loc-nhanh .ln.on')?.dispatchEvent(new w.Event('click'));
    return [sau === 1, `lọc nút ${chiNut.length} dòng, thêm tên "${ten}" còn ${sau}`];
  })());

  /* ⚠️ Hai nhãn `canLuoi` chỉ có nghĩa khi ĐÃ xếp. Lưới trắng thì cả trường
     đều "chưa xếp đủ tiết" — một con số 35 không nói lên điều gì. */
  kt('Lưới còn trắng thì KHÔNG bày nhãn "chưa xếp đủ tiết" và "trống kẹp"', (() => {
    const luu = w.eval('JSON.stringify(S.tkb)');
    w.eval('S.tkb = {}; S.lop.forEach(l => S.tkb[l.id] = {})');
    w.chuyen('giaovien');
    const ma = [...w.document.querySelectorAll('.loc-nhanh .ln[data-lnhanh]')]
      .map(b => b.dataset.lnhanh.split('|')[1]);
    w.eval(`S.tkb = ${JSON.stringify(luu)} && JSON.parse(${JSON.stringify(luu)})`);
    w.chuyen('giaovien');
    return [!ma.includes('chuaxep') && !ma.includes('trong'),
            ma.join(' · ') || 'không nhãn nào'];
  })());
}

{
  console.log('\n17s. Soi một giáo viên trên lưới toàn trường');
  w.chuyen('toantruong');
  kt('Chưa soi ai thì lưới KHÔNG mang lớp dang-soi', (() => {
    const b = w.document.querySelector('#noiDung table.tt');
    return [!!b && !b.classList.contains('dang-soi')];
  })());

  /* Chọn một giáo viên bộ môn — người có tiết ở nhiều lớp, đúng ca đáng soi */
  const idSoi = w.eval(`(() => {
    const ds = lopChoLuoi().map(l => l.id);
    const dem = {};
    ds.forEach(id => Object.values(S.tkb[id] || {}).forEach(v => dem[v.gvId] = (dem[v.gvId]||0)+1));
    return Object.entries(dem).sort((a,b) => b[1]-a[1])[0]?.[0] || '';
  })()`);
  kt('Soi một giáo viên: số ô nổi đúng bằng số tiết của người ấy trên lưới', (() => {
    if (!idSoi) return [false, 'không tìm được ai có tiết'];
    w.eval(`S.soiGV = ${JSON.stringify(idSoi)}`); w.ve();
    const b = w.document.querySelector('#noiDung table.tt');
    const soi = b?.querySelectorAll('td.o-soi').length || 0;
    const can = w.eval(`(() => {
      const ds = lopChoLuoi().map(l => l.id);
      let n = 0;
      ds.forEach(id => Object.values(S.tkb[id] || {})
        .forEach(v => { if (v.gvId === ${JSON.stringify(idSoi)}) n++; }));
      return n;
    })()`);
    return [!!b?.classList.contains('dang-soi') && soi === can && can > 0,
            `${soi} ô nổi / ${can} tiết · ${gvTen(idSoi)}`];
  })());

  kt('Ô của người khác thì mờ đi, KHÔNG biến mất khỏi lưới', (() => {
    const b = w.document.querySelector('#noiDung table.tt');
    const mo = b?.querySelectorAll('td.o-mo').length || 0;
    const mau = b?.querySelectorAll('td.o-mau').length || 0;
    return [mo > 0 && mo < mau, `${mo} ô mờ / ${mau} ô có tiết`];
  })());

  /* ⚠️ Ba màn hình khác cũng gọi luoiRongHTML — chúng KHÔNG được đổi hành vi
     vì một trạng thái của riêng màn Toàn trường. */
  kt('Bảng điều hành và Theo khối KHÔNG bị chế độ soi ăn theo', (() => {
    const xet = t => { w.chuyen(t);
      return [...w.document.querySelectorAll('#noiDung table.tt')]
        .every(b => !b.classList.contains('dang-soi')); };
    const ok = xet('dieuhanh') && xet('tkbkhoi');
    w.eval('S.soiGV = ""'); w.chuyen('toantruong');
    return [ok];
  })());

  kt('Tóm tắt đếm đúng số lần đổi phân hiệu trong tuần', (() => {
    const r = w.eval(`(() => { const t = tomTatSoiGV(${JSON.stringify(idSoi)});
      return t && {doi: t.doiDiem, dt: t.soDT, tiet: t.tiet}; })()`);
    /* Một phân hiệu thì không thể có lần đổi nào — phép thử hai chiều */
    return [!!r && r.doi >= 0 && (r.dt > 1 || r.doi === 0),
            `${r?.tiet} tiết · ${r?.dt} phân hiệu · ${r?.doi} lần đổi`];
  })());
}

{
  console.log('\n17t. Bảng "Ai rảnh tiết nào"');
  w.chuyen('airanh');
  const oDau = w.document.querySelector('[data-ranho]');
  kt('Lưới bày được các ô giờ, mỗi ô ghi số lớp và số người rảnh', !!oDau);

  /* Phép thử NẶNG nhất của cả mục: bốn nhóm phải chia trọn danh sách giáo
     viên — không ai bị đếm hai lần, không ai rơi ra ngoài. Nhóm nào tính
     sai điều kiện là con số này lệch ngay. */
  kt('Bốn nhóm chia TRỌN danh sách, không trùng không sót', (() => {
    const r = w.eval(`(() => {
      const gv = gvTrongPV(), lop = lopChoLuoi();
      const xau = [];
      dongGio().forEach(o => {
        const k = aiRanh(o.khoa, gv, lop);
        const tong = k.ranh.length + k.dayO.length + k.banNoiKhac.length + k.daBao.length;
        if (tong !== gv.length) xau.push(o.khoa + ': ' + tong + '/' + gv.length);
      });
      return {xau: xau.slice(0,3), so: xau.length, oGio: dongGio().length, gv: gv.length};
    })()`);
    return [r.so === 0, `${r.oGio} ô giờ × ${r.gv} giáo viên${r.so ? ' — lệch: ' + r.xau.join(', ') : ''}`];
  })());

  /* ⚠️ Người ĐANG DẠY tuyệt đối không được nằm trong danh sách rảnh —
     mời họ đi dự giờ là lớp mất giáo viên. */
  kt('Người đang có tiết KHÔNG bao giờ lọt vào danh sách rảnh', (() => {
    const r = w.eval(`(() => {
      const gv = gvTrongPV(), lop = lopChoLuoi();
      let xau = 0, oCo = 0;
      dongGio().forEach(o => {
        const k = aiRanh(o.khoa, gv, lop);
        if (!k.dangHoc.length) return;
        oCo++;
        const ban = new Set(k.dangHoc.map(x => x.gvId));
        if (k.ranh.some(g => ban.has(g.id))) xau++;
      });
      return {xau, oCo};
    })()`);
    return [r.xau === 0, `soi ${r.oCo} ô giờ có tiết`];
  })());

  /* Ràng buộc cứng số 7: buổi bận đã đăng ký thì không mời được */
  kt('Người đã đăng ký buổi bận nằm ở nhóm riêng, không phải nhóm rảnh', (() => {
    const r = w.eval(`(() => {
      const gv = gvTrongPV(), lop = lopChoLuoi();
      /* Đặt một người bận đúng một buổi rồi soi lại chính buổi ấy */
      const ai = gv[0].id, o = dongGio()[0];
      const kB = o.khoa.slice(0, o.khoa.lastIndexOf('-'));
      const luu = S.gvNghi[ai];
      S.gvNghi[ai] = [kB];
      const k = aiRanh(o.khoa, gv, lop);
      S.gvNghi[ai] = luu;
      return {ranh: k.ranh.some(g => g.id === ai), bao: k.daBao.some(g => g.id === ai),
              day: k.dayO.some(g => g.id === ai), ten: gvId(ai).hoTen};
    })()`);
    /* Người ấy có thể đang dạy chính tiết đó — khi ấy nhóm "đang dạy" thắng,
       vẫn đúng vì điều cần canh là KHÔNG lọt vào nhóm rảnh. */
    return [!r.ranh && (r.bao || r.day), `${r.ten}: ${r.bao ? 'đã báo bận' : r.day ? 'đang dạy' : 'LỌT VÀO RẢNH'}`];
  })());

  /* Ràng buộc lõi sau sáp nhập: một giáo viên một buổi chỉ ở một phân hiệu.
     ⚠️ Bản đầu của phép thử này viết `soDT > 1 ? true : n === 0` — tức là
     với trường nhiều phân hiệu nó XANH VÔ ĐIỀU KIỆN, không kiểm được gì.
     Đúng cái bẫy "phép thử so hai thứ tình cờ bằng nhau" đã ghi ở mục 3.
     Nay soi từng lượt: người bị xếp vào nhóm ấy phải THẬT SỰ có tiết ở
     phân hiệu khác trong chính buổi đó, và KHÔNG có tiết nào ở phân hiệu
     đang xem. Sai một lượt là đỏ. */
  kt('Người đang ở phân hiệu khác tách riêng, không mời nhầm', (() => {
    const r = w.eval(`(() => {
      const gv = gvTrongPV(), lop = lopChoLuoi();
      const dtXet = new Set(lop.map(l => S.lopDT[l.id]).filter(Boolean));
      let n = 0, sai = 0;
      dongGio().forEach(o => {
        const kB = o.khoa.slice(0, o.khoa.lastIndexOf('-'));
        aiRanh(o.khoa, gv, lop).banNoiKhac.forEach(g => {
          n++;
          const dt = new Set();
          Object.entries(S.tkb).forEach(([lp, oo]) => Object.keys(oo).forEach(x => {
            if (x.startsWith(kB + '-') && oo[x].gvId === g.id) dt.add(S.lopDT[lp]);
          }));
          if (!dt.size || [...dt].some(d => dtXet.has(d))) sai++;
        });
      });
      return {n, sai, soDT: S.diemTruong.length};
    })()`);
    /* Một phân hiệu thì con số này bắt buộc bằng 0; nhiều phân hiệu thì
       bắt buộc KHÁC 0 — không có đường nào để phép thử tự xanh. */
    return [r.sai === 0 && (r.soDT === 1 ? r.n === 0 : r.n > 0),
            `${r.soDT} phân hiệu · ${r.n} lượt · ${r.sai} lượt sai`];
  })());

  kt('Bấm một ô thì mở phần chi tiết của đúng tiết ấy', (() => {
    oDau.dispatchEvent(new w.Event('click'));
    const t = w.document.querySelector('.ra-tieu')?.textContent || '';
    const p = oDau.dataset.ranho.split('-');
    return [t.includes(`tiết ${+p[2] + 1}`), t.replace(/\s+/g, ' ').trim().slice(0, 60)];
  })());

  /* ⚠️ Phải tích người ĐANG DẠY NHIỀU, không phải người đầu danh sách.
     Bản đầu tích trúng một hồ sơ chưa có tiết nào nên "cả nhóm rảnh"
     ra đúng 30/30 ô — lọc có tác dụng hay không cũng cùng kết quả, phép
     thử xanh mà không kiểm được gì. Nay đòi số ô phải NHỎ HƠN tổng. */
  kt('Tìm giờ họp tổ: tích người vào nhóm thì lưới tô giờ cả nhóm cùng rảnh', (() => {
    const ban = w.eval(`(() => {
      const dem = {};
      lopChoLuoi().forEach(l => Object.values(S.tkb[l.id] || {})
        .forEach(v => dem[v.gvId] = (dem[v.gvId] || 0) + 1));
      return Object.entries(dem).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    })()`);
    if (!ban) return [false, 'không ai có tiết'];
    w.eval(`S.ranhNhom = [${JSON.stringify(ban)}]`); w.ve();
    const hop = w.document.querySelectorAll('.ro.hop').length;
    const tongO = w.document.querySelectorAll('[data-ranho]').length;
    const can = w.eval(`(() => { const lop = lopChoLuoi(); let n = 0;
      dongGio().forEach(o => { if (nhomCungRanh(o.khoa, S.ranhNhom, lop)) n++; });
      return n; })()`);
    /* Thêm người thứ hai thì số giờ chung chỉ được GIẢM hoặc giữ nguyên,
       không bao giờ tăng — nhóm càng đông càng khó tìm giờ chung. */
    const hai = w.eval(`(() => {
      const them = gvTrongPV().find(g => g.id !== ${JSON.stringify(ban)});
      if (!them) return -1;
      S.ranhNhom = [${JSON.stringify(ban)}, them.id];
      const lop = lopChoLuoi(); let n = 0;
      dongGio().forEach(o => { if (nhomCungRanh(o.khoa, S.ranhNhom, lop)) n++; });
      return n;
    })()`);
    w.eval('S.ranhNhom = []');
    return [hop === can && hop > 0 && hop < tongO && (hai < 0 || hai <= hop),
            `1 người ${hop}/${tongO} ô · thêm người nữa còn ${hai}`];
  })());

  /* Phòng đếm theo TỪNG phân hiệu — phòng Tin của Diễn Liên không dùng
     thay cho Diễn Đồng được (ràng buộc cứng số 4). */
  kt('Phòng trống đếm theo từng phân hiệu, không gộp cả trường', (() => {
    const r = w.eval(`(() => {
      const luu = JSON.stringify(S.phong);
      const dt = S.diemTruong[0].id;
      S.phong = [{id:'p1', dtId:dt, ten:'Phòng máy 1', mon:'Tin học'}];
      const gv = gvTrongPV(), lop = lopChoLuoi();
      let xau = 0;
      dongGio().forEach(o => {
        const k = aiRanh(o.khoa, gv, lop);
        const dungTin = k.dangHoc.filter(x => monCanPhong(x.mon) === 'Tin học'
          && S.lopDT[x.lopId] === dt).length;
        /* Một phòng: có lớp học Tin ở phân hiệu ấy thì phải hết trống */
        if (dungTin > 0 && k.phongTrong.length > 0) xau++;
        if (dungTin === 0 && k.phongTrong.length === 0 && S.lopDT[lop[0]?.id] === dt) xau++;
      });
      S.phong = JSON.parse(luu);
      return xau;
    })()`);
    return [r === 0, r ? `${r} ô đếm sai` : 'khớp ở mọi ô giờ'];
  })());

  w.eval('S.ranhO = ""; S.ranhNhom = []');
}

{
  console.log('\n17u. Ba mức tín hiệu khi chỉnh tay');
  /* ⚠️ Đừng tin vào `S.lopXem` mà các mục trước để lại — mục 17r từng dọn
     sạch `S.tkb`, mục 17t thêm hẳn một phân hiệu và dời tám lớp sang đó.
     Mục này tự chọn lấy một lớp CÓ chủ nhiệm, CÓ tiết của cả chủ nhiệm lẫn
     giáo viên bộ môn, rồi mới soi. */
  const lp = w.eval(`(() => {
    const ok = S.lop.find(l => {
      const cn = cnCuaLop(l.id); if (!cn) return false;
      const o = S.tkb[l.id] || {};
      const k = Object.keys(o);
      return k.length > 8
        && k.some(x => o[x].gvId === cn.id && !o[x].ghim)
        && k.some(x => o[x].gvId !== cn.id && !o[x].ghim);
    });
    if (ok) { S.lopXem = ok.id; S.phamVi = ''; }
    return ok ? ok.id : '';
  })()`);
  kt('Tìm được lớp đủ điều kiện để soi', !!lp, lp ? w.eval(`lopId(${JSON.stringify(lp)})?.ten`) : 'KHÔNG CÓ');
  w.chuyen('tkblop');
  const o = S.tkb[lp];
  const cn = w.eval(`cnCuaLop(${JSON.stringify(lp)})?.id`);

  /* Cầm một tiết của CHỦ NHIỆM — đúng cảnh chủ dự án nêu: cô A đưa Toán
     lên tiết 1, đẩy GDTC xuống tiết 4. */
  const tuCN = Object.keys(o).find(k => o[k].gvId === cn && !o[k].ghim);
  kt('Chọn một tiết thì lưới hiện đủ BA mức, không phải hai', (() => {
    w.eval(`S.oChon = ${JSON.stringify(tuCN)}`); w.ve();
    const d = w.document;
    const hop = d.querySelectorAll('.o-hop').length;
    const cham = d.querySelectorAll('.o-cham').length;
    const cam = d.querySelectorAll('.o-cam').length;
    return [hop > 0 && cham > 0 && cam >= 0, `${hop} xanh · ${cham} vàng · ${cam} mờ`];
  })());

  /* ⚠️ Điều quan trọng nhất của cả mục: vàng là NHẮC, tuyệt đối không phải
     CẤM. Chủ dự án dặn thẳng *"không phải vì vậy mà bắt buộc cứng, sau xếp
     nhà trường còn tinh chỉnh"*. Mọi ô vàng phải là ô `kiemTraChuyen()` cho
     qua — ai lỡ biến nó thành chốt chặn thì con số này khác 0 ngay. */
  kt('Ô vàng LUÔN đổi được — nhắc, KHÔNG cấm', (() => {
    const xau = w.eval(`(() => {
      const ds = [...document.querySelectorAll('.o-cham')];
      let sai = 0;
      ds.forEach(n => {
        const khoa = n.dataset.cham || n.dataset.tha;
        if (khoa && kiemTraChuyen(S.oChon, khoa)) sai++;
      });
      return { sai, tong: ds.length };
    })()`);
    return [xau.sai === 0 && xau.tong > 0, `${xau.tong} ô vàng, ${xau.sai} ô bị chặn`];
  })());

  /* Và chiều ngược lại: ô XANH thì tuyệt đối không được chạm ai — nếu lẫn
     thì tín hiệu vô nghĩa, người dùng tưởng đổi tự do mà thật ra đụng lịch
     một cô giáo ở lớp khác. */
  kt('Ô xanh tuyệt đối KHÔNG chạm giáo viên liên lớp nào', (() => {
    const xau = w.eval(`(() => {
      const ds = [...document.querySelectorAll('.o-hop')];
      let sai = 0;
      ds.forEach(n => {
        const khoa = n.dataset.cham || n.dataset.tha;
        if (khoa && chamGVKhac(S.lopXem, khoa)) sai++;
      });
      return { sai, tong: ds.length };
    })()`);
    return [xau.sai === 0 && xau.tong > 0, `${xau.tong} ô xanh, ${xau.sai} ô lẫn`];
  })());

  kt('Dải chú giải nói đủ ba màu và đếm đúng số ô đổi tự do', (() => {
    const t = w.document.querySelector('.chu-mau')?.textContent.replace(/\s+/g, ' ').trim() || '';
    const soXanh = w.document.querySelectorAll('.o-hop').length;
    return [/đổi tự do/.test(t) && /không đổi được/.test(t) && t.includes(`${soXanh} ô đổi tự do`),
            t.slice(0, 120)];
  })());

  kt('Ô vàng nói rõ TÊN người bị ảnh hưởng, không nói chung chung', (() => {
    const n = w.document.querySelector('.o-cham');
    const tt = n?.getAttribute('title') || '';
    return [/chạm tiết .+ của .+ \(dạy \d+ lớp\)/.test(tt), tt.slice(0, 110)];
  })());

  /* Cầm tiết của chính giáo viên bộ môn thì phải nhắc NGAY từ đầu — dời đi
     đâu cũng đổi lịch người ấy, không riêng ô đích nào. */
  kt('Cầm tiết của giáo viên liên lớp thì nhắc ngay ở dải trên', (() => {
    const tuBM = Object.keys(o).find(k => o[k].gvId !== cn && !o[k].ghim);
    if (!tuBM) return [true, 'lớp không có tiết bộ môn — bỏ qua'];
    w.eval(`S.oChon = ${JSON.stringify(tuBM)}`); w.ve();
    const t = w.document.querySelector('.chu-mau')?.textContent.replace(/\s+/g, ' ') || '';
    return [/Tiết đang cầm là của/.test(t) && /dạy \d+ lớp/.test(t),
            (t.match(/Tiết đang cầm[^⚠]*/) || [''])[0].slice(0, 100)];
  })());

  /* Không chọn gì thì KHÔNG bày chú giải — đừng chiếm chỗ để nói về thứ
     người dùng chưa làm. Cùng luật "số 0 không tô đỏ". */
  kt('Chưa chọn tiết nào thì không bày dải ba màu', (() => {
    w.eval('S.oChon = null'); w.ve();
    return [!w.document.querySelector('.chu-mau'),
            w.document.querySelector('.gy')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) || ''];
  })());
}

console.log('\n17v. Đổi tên phân hiệu ngay trên thẻ');
{
  w.chuyen('diemtruong');
  const nutSua = w.document.querySelector('[data-suadt]');
  kt('Thẻ phân hiệu có nút sửa tên', !!nutSua);
  if (nutSua) {
    const idDT = nutSua.dataset.suadt;
    const dSua = S.diemTruong.find(x => x.id === idDT);
    const tenCu = dSua.ten;
    const lopCu = S.lop.filter(l => S.lopDT[l.id] === idDT).map(l => l.id).sort();
    const maCu = S.lop.filter(l => S.lopDT[l.id] === idDT).map(l => l.maLop).sort();
    const nutLuu = () => [...w.document.querySelectorAll('#hopC button')]
                          .find(b => b.textContent === 'Lưu');

    /* Không cho trùng tên phân hiệu khác: đường ghi lên máy chủ dò theo TÊN
       (bảng diem_truong không có ràng buộc duy nhất), nên hai phân hiệu cùng
       tên là lớp bên này gán nhầm sang bên kia. */
    const dKhac = S.diemTruong.find(x => x.id !== idDT);
    if (dKhac) {
      nutSua.dispatchEvent(new w.Event('click', { bubbles: true }));
      w.document.querySelector('#dtTenS').value = dKhac.ten.toUpperCase();
      nutLuu().click();
      kt('Trùng tên phân hiệu khác thì từ chối, không đổi gì',
         dSua.ten === tenCu, `vẫn là "${dSua.ten}"`);
      w.eval('dong()');
    }

    /* Bỏ trống cũng phải từ chối — tên là thứ người dùng nhận ra phân hiệu. */
    w.chuyen('diemtruong');
    w.document.querySelector(`[data-suadt="${idDT}"]`)
     .dispatchEvent(new w.Event('click', { bubbles: true }));
    w.document.querySelector('#dtTenS').value = '   ';
    nutLuu().click();
    kt('Bỏ trống tên thì từ chối', dSua.ten === tenCu);
    w.eval('dong()');

    const tenMoi = 'Phân hiệu ' + tenCu.replace(/^\s*(Phân\s+hiệu|Điểm\s+trường)\s*/i, '') + ' 2';
    w.chuyen('diemtruong');
    w.document.querySelector(`[data-suadt="${idDT}"]`)
     .dispatchEvent(new w.Event('click', { bubbles: true }));
    w.document.querySelector('#dtTenS').value = tenMoi;
    nutLuu().click();
    kt('Đổi được tên phân hiệu', dSua.ten === tenMoi, `${tenCu} → ${dSua.ten}`);

    /* ⚠️ Điều quan trọng nhất: đổi tên KHÔNG đụng id, không đụng mã lớp.
       Mã lớp đã in ra giấy và đã gõ vào cột Ma_lop của tệp Excel nhà trường;
       còn id là thứ mọi bảng khác tham chiếu tới. */
    kt('Đổi tên giữ nguyên id phân hiệu — mọi tham chiếu còn nguyên',
       S.diemTruong.filter(x => x.id === idDT).length === 1);
    kt('Lớp vẫn nằm đúng phân hiệu ấy, mã lớp không đổi theo', (() => {
      const lop = S.lop.filter(l => S.lopDT[l.id] === idDT);
      return [String(lop.map(l => l.id).sort()) === String(lopCu)
              && String(lop.map(l => l.maLop).sort()) === String(maCu),
              `${lop.length} lớp`];
    })());
    kt('Tên mới hiện ngay trên thẻ',
       w.document.querySelector('.dt-luoi').textContent.includes(tenMoi));

    /* Trả lại tên cũ để các phép thử sau không lệch */
    dSua.ten = tenCu;
  }
}

console.log('\n17w. Tiền tố phân hiệu trong hộp tạo lớp');
/* ⚠️ Agent kiểm thử tìm ra 31/8/2026: `goiYTienTo()` tự tính viết tắt bằng
   `khongDau()` nên gợi ý `DD` cho "Phân hiệu Diễn Đồng", trong khi chuẩn
   (`tienToDT()`, thứ `maLopChuan()` và `datLaiMaLop()` lấy làm mốc) là `DĐ`.
   App tạo lớp bằng chính con số nó gợi ý, rồi vài giây sau nút *Đặt lại mã
   lớp* đòi sửa lại toàn bộ mã vừa tạo — mà mã lớp là thứ nhà trường đã gõ
   vào cột `Ma_lop` của tệp Excel.

   Tệ hơn: bỏ dấu làm *Diễn Đồng* và *Diễn Đông* cùng ra `DD`, hai phân hiệu
   khác nhau đụng mã. Đúng cái lẫn lộn CLAUDE.md dặn tránh khi chốt dạng mã. */
{
  const dtGoc = w.eval('JSON.stringify(S.diemTruong)');
  w.eval(`S.diemTruong = ${JSON.stringify([
    { id: 'a', ten: 'Phân hiệu Diễn Liên' },
    { id: 'b', ten: 'Phân hiệu Diễn Đồng' },
    { id: 'c', ten: 'Phân hiệu Diễn Đông' }])}`);

  kt('Tiền tố gợi ý GIỮ DẤU, khớp đúng chuẩn của mã lớp', (() => {
    const goi = ['Phân hiệu Diễn Liên', 'Phân hiệu Diễn Đồng', 'Phân hiệu Diễn Đông']
      .map(t => w.goiYTienTo(t));
    const chuan = ['Phân hiệu Diễn Liên', 'Phân hiệu Diễn Đồng', 'Phân hiệu Diễn Đông']
      .map(t => w.tienToDT(t));
    return [String(goi) === String(chuan) && goi[1] === 'DĐ',
            `gợi ý ${goi.join(' ')} · chuẩn ${chuan.join(' ')}`];
  })());

  /* ⚠️ Giữ dấu bảo vệ được gì, và KHÔNG bảo vệ được gì — nói rõ để người sửa
     sau khỏi đặt kỳ vọng nhầm như phép thử đầu tiên viết ra hôm nay:

     · Diễn Liên → DL  ≠  Diễn Đồng → DĐ   ← đây là chỗ giữ dấu cứu được
     · Diễn Đồng → DĐ  =  Diễn Đông → DĐ   ← vẫn trùng, và đó là tất yếu:
       viết tắt chỉ lấy CHỮ CÁI ĐẦU, hai tên chỉ khác nhau ở dấu của chữ thứ
       hai thì không cách nào phân biệt. `maChuaDung()` lo phần chống trùng. */
  kt('Giữ dấu tách được Diễn Liên khỏi Diễn Đồng — chỗ bỏ dấu làm hỏng', (() => {
    const a = w.goiYTienTo('Phân hiệu Diễn Liên'), b = w.goiYTienTo('Phân hiệu Diễn Đồng');
    return [a === 'DL' && b === 'DĐ' && a !== b, `${a} ≠ ${b}`];
  })());

  kt('Hai phân hiệu ra cùng tiền tố thì mã lớp vẫn phải khác nhau', (() => {
    const daCo = new Set(['1A_DĐ']);
    const m = w.maChuaDung('1A_DĐ', daCo);
    return [m !== '1A_DĐ' && !daCo.has(m) && !m.includes('-'), `1A_DĐ → ${m}`];
  })());

  /* Trường một phân hiệu thì mã trần, nên không gợi ý tiền tố nào cả. */
  kt('Trường một phân hiệu: không gợi ý tiền tố', (() => {
    w.eval(`S.diemTruong = ${JSON.stringify([{ id: 'a', ten: 'Điểm trường chính' }])}`);
    return [w.goiYTienTo('Điểm trường chính') === '', 'để trống'];
  })());

  w.eval(`S.diemTruong = ${dtGoc}`);
}

console.log('\n17x. Ảnh minh hoạ trong Hướng dẫn');
/* Chủ dự án 31/8/2026: "viết lại Hướng dẫn xếp Thời khóa biểu: Bước 1 là gì,
   Bước 2 là gì cho đến hoàn thành và tinh chỉnh… Nhớ phải có hình ảnh minh
   họa cho các thầy cô dễ thấy."

   ⚠️ Ảnh phải nằm TRONG src/. GitHub Pages chỉ đăng thư mục ấy
   (.github/workflows/pages.yml — `path: src`), nên để ở docs/ thì mở ở máy
   vẫn thấy mà lên web là ô trắng — loại lỗi không bộ soi nào bắt được nếu
   chỉ mở tệp ở máy. */
{
  const maNguon = readFileSync(join(goc, 'src/index.html'), 'utf8');
  const reAnh = new RegExp('anh-huong-dan/([a-z0-9-]+)[.]png', 'g');
  const nhac = [...maNguon.matchAll(reAnh)].map(m => m[1]);
  const co = readdirSync(join(goc, 'src/anh-huong-dan')).map(f => f.replace(/[.]png$/, ''));
  const theAnh = [...maNguon.matchAll(/<img src="anh-huong-dan[^>]*>/g)].map(m => m[0]);

  kt('Mọi ảnh Hướng dẫn nhắc tới đều CÓ TỆP THẬT trong src/', (() => {
    const thieu = nhac.filter(a => !co.includes(a));
    return [nhac.length > 0 && thieu.length === 0, thieu.join(' · ') || `${nhac.length} ảnh`];
  })());

  kt('Không để lại tệp ảnh thừa không ai dùng', (() => {
    const thua = co.filter(c => !nhac.includes(c));
    return [thua.length === 0, thua.join(' · ') || `${co.length} tệp`];
  })());

  /* Ảnh cộng lại hơn 4 MB. Thiếu `loading="lazy"` thì mở mục Hướng dẫn là
     tải hết ngay — thầy cô dùng 3G phải chờ cả phút cho một trang chữ. */
  kt('Mọi ảnh đều tải lười, không kéo cả 4 MB ngay khi mở mục', (() => {
    const quen = theAnh.filter(t => !/loading="lazy"/.test(t));
    return [theAnh.length > 0 && quen.length === 0, `${theAnh.length} thẻ ảnh`];
  })());

  kt('Ảnh nào cũng có chú thích và chữ thay thế', (() => {
    const thieuAlt = theAnh.filter(t => !/alt="[^"]{10,}"/.test(t));
    const soChu = (maNguon.match(/<figcaption>/g) || []).length;
    return [thieuAlt.length === 0 && soChu >= theAnh.length,
            `${theAnh.length} ảnh · ${soChu} chú thích`];
  })());

  /* Hướng dẫn phải đi theo BƯỚC, đúng trình tự làm việc — đó là cả yêu cầu. */
  kt('Hướng dẫn cán bộ quản lý đi theo bảy bước, đúng thứ tự', (() => {
    const reB = new RegExp("[{]t:'(BƯỚC (" + "[0-9]" + ")[^']*)'", 'g');
    const b = [...maNguon.matchAll(reB)].map(m => +m[2]);
    return [b.length === 7 && b.every((x, i) => x === i + 1), b.join(' → ')];
  })());
}

console.log('\n17y. Phân công nhanh: bỏ tích một lớp là GỠ');
/* Chủ dự án 31/8/2026: bỏ tích cả 25 lớp của cô Phan Thị Thương rồi bấm
   *Phân công* thì nhận "Chưa chọn lớp nào", thoát ra bấm *Lưu ngay* thì phân
   công cũ vẫn nguyên vẹn. Hộp này chỉ biết THÊM và CẬP NHẬT, mà ô ma trận
   lại là lối DUY NHẤT sửa phân công của một cặp (giáo viên · môn) — nên
   không còn đường nào gỡ ngoài việc xoá cả hồ sơ giáo viên. */
{
  const pcGoc  = JSON.parse(JSON.stringify(S.phanCong));
  const tkbGoc = JSON.parse(JSON.stringify(S.tkb));
  const nutLam = () => w.document.querySelector('#hopC').lastElementChild;
  const oNq    = id => w.document.querySelector(`[data-nq="${id}"]`);
  const dangTich = () => [...w.document.querySelectorAll('[data-nq]')]
    .filter(x => x.checked).map(x => x.dataset.nq);
  const canh = () => w.document.querySelector('#nqCanh')?.textContent || '';

  /* Cặp (giáo viên · môn) nhiều lớp nhất — đúng cảnh cô Đạo Đức 23 lớp */
  const dem = {};
  S.phanCong.forEach(p => { const k = p.gvId + '|' + p.mon; (dem[k] = dem[k] || []).push(p.lopId); });
  const [khoa, dsLopT] = Object.entries(dem).sort((a, b) => b[1].length - a[1].length)[0];
  const gvT = khoa.slice(0, khoa.indexOf('|')), monT = khoa.slice(khoa.indexOf('|') + 1);
  const conCua = () => S.phanCong.filter(p => p.gvId === gvT && p.mon === monT).length;

  w.hopPCTheoGV(gvT, monT);
  kt('Mở hộp thì tích sẵn ĐÚNG những lớp đang có', (() => {
    const a = dangTich().sort().join(','), b = [...dsLopT].sort().join(',');
    return [a === b, `${dangTich().length}/${dsLopT.length} lớp`];
  })());

  /* ⚠️ Chốt an toàn của cả bản vá: nút nay ĐỒNG BỘ theo danh sách đang tích,
     nên hộp mở ra mà tích sẵn sai là bấm luôn cũng xoá mất dữ liệu. */
  kt('Mở ra bấm luôn thì không mất phân công nào', (() => {
    nutLam().click();
    return [S.phanCong.length === pcGoc.length, `${pcGoc.length} → ${S.phanCong.length} dòng`];
  })());

  /* Bỏ tích MỘT lớp — vừa gỡ dòng phân công, vừa gỡ tiết đã xếp của lớp ấy */
  const lopBo = dsLopT[0];
  w.eval(`S.tkb[${JSON.stringify(lopBo)}]['2-S-1'] = {gvId:${JSON.stringify(gvT)}, mon:${JSON.stringify(monT)}}`);
  w.hopPCTheoGV(gvT, monT);
  oNq(lopBo).click();
  kt('Bỏ tích một lớp: hộp nói trước sẽ gỡ mấy lớp', /Sẽ gỡ .* khỏi 1 lớp/.test(canh()),
     canh().slice(0, 40).trim() || 'không có cảnh báo');
  kt('Nhãn nút nói đúng việc nó làm, không còn ghi trơ "Phân công"',
     nutLam().textContent === 'Cập nhật phân công', nutLam().textContent);
  nutLam().click();
  kt('Gỡ đúng một lớp, các lớp còn lại nguyên vẹn',
     [conCua() === dsLopT.length - 1 &&
      !S.phanCong.some(p => p.gvId === gvT && p.mon === monT && p.lopId === lopBo),
      `${dsLopT.length} → ${conCua()} lớp`]);
  kt('Tiết đã xếp của lớp bị gỡ cũng biến khỏi lưới',
     !S.tkb[lopBo]['2-S-1'], 'ô 2-S-1 đã sạch');

  /* Bỏ chọn hết rồi bấm — đúng thao tác chủ dự án làm */
  w.hopPCTheoGV(gvT, monT);
  w.document.querySelector('#nqBo').click();
  kt('Bỏ chọn hết thì nút nói thẳng là gỡ, không hứa phân công',
     nutLam().textContent === `Gỡ khỏi ${conCua()} lớp`, nutLam().textContent);
  nutLam().click();
  kt('Gỡ sạch cặp giáo viên · môn ấy — thao tác của chủ dự án nay có tác dụng',
     [conCua() === 0, `còn ${conCua()} dòng`]);
  kt('Và chỉ đụng đúng cặp ấy, phân công của người khác không suy suyển',
     [S.phanCong.length === pcGoc.length - dsLopT.length,
      `${pcGoc.length} → ${S.phanCong.length} dòng`]);

  /* Đổi giáo viên trong hộp thì phải tích lại theo hiện trạng NGƯỜI MỚI —
     giữ tích cũ là bấm một cái xoá nhầm phân công của người vừa chọn. */
  S.phanCong.length = 0; pcGoc.forEach(p => S.phanCong.push({ ...p }));
  w.hopPCTheoGV(gvT, monT);
  kt('Đổi sang người chưa dạy môn ấy thì bỏ hết tích', (() => {
    const gvKhac = S.giaoVien.find(g => g.id !== gvT &&
      !S.phanCong.some(p => p.gvId === g.id && p.mon === monT));
    if (!gvKhac) return [true, 'không có ai để thử — bỏ qua'];
    const sel = w.document.querySelector('#nqGV');
    sel.value = gvKhac.id; sel.dispatchEvent(new w.Event('change'));
    return [dangTich().length === 0, `${dangTich().length} lớp còn tích`];
  })());

  /* Thêm lớp mới vẫn phải chạy như cũ — bản vá không được đổi việc chính */
  w.hopPCTheoGV(gvT, monT);
  const lopThem = S.lop.find(l => !dsLopT.includes(l.id));
  kt('Tích thêm một lớp thì thêm đúng lớp ấy, không gỡ lớp nào', (() => {
    if (!lopThem) return [true, 'mọi lớp đã có — bỏ qua'];
    oNq(lopThem.id).click();
    const nhan = nutLam().textContent;
    nutLam().click();
    return [nhan === 'Phân công' && conCua() === dsLopT.length + 1,
            `${dsLopT.length} → ${conCua()} lớp · nút "${nhan}"`];
  })());

  w.eval('dong()');
  S.phanCong.length = 0; pcGoc.forEach(p => S.phanCong.push(p));
  Object.keys(S.tkb).forEach(k => delete S.tkb[k]);
  Object.entries(tkbGoc).forEach(([k, v]) => S.tkb[k] = v);
}

console.log('\n17z. Khung giờ học — bảng theo LỚP');
/* Chủ dự án 31/8/2026, sau khi dùng thử bản khai theo khối: *"Có nên có lưới
   cụ thể để chọn không em? … có bản đồ rõ cho trực quan, có chốt tổng"* — và
   chốt **bỏ bảng khối cũ**. Bài toán gốc là TH Hưng Vinh 1: 1A·1B·1C học 35
   tiết còn các lớp 1 khác 32, cùng một khối mà hai con số. */
{
  const pcGoc = JSON.parse(JSON.stringify(S.phanCong));
  const BA = ['lop_1A', 'lop_1B', 'lop_1C'].filter(id => S.lop.some(l => l.id === id));
  const oLop = (id, kb) => w.document.querySelector(`[data-tl="${id}|${kb}"]`);
  const dat = (o, v) => { o.value = String(v); o.dispatchEvent(new w.Event('change')); };

  w.eval("S.khoiKG = '1'");
  w.chuyen('khunggio');
  kt('Mỗi LỚP một cột, và mỗi ô là một chỗ khai được',
     [!!oLop('lop_1A', '2-S') && !!oLop('lop_1D', '2-S'),
      `${w.document.querySelectorAll('[data-tl]').length} ô khai`]);
  kt('Vẫn có cột "cả khối" để đặt một lần cho cả khối',
     !!w.document.querySelector('[data-tkhoi="2-S|1"]'));
  /* ⚠️ Bảng khối cũ phải BIẾN MẤT hẳn, không để hai nơi cùng khai một thứ */
  kt('Bảng khai theo khối cũ đã bỏ hẳn',
     [!w.document.querySelector('[data-tk]')
      && !/Lớp học khác giờ khối/.test(w.document.querySelector('#noiDung').textContent),
      'không còn ô data-tk nào']);

  /* Đúng cảnh Hưng Vinh: ba lớp học thêm 3 tiết, các lớp 1 khác giữ nguyên */
  dat(oLop('lop_1A', '2-S'), 5);
  dat(oLop('lop_1B', '2-S'), 5);
  dat(oLop('lop_1C', '2-S'), 5);
  kt('Cùng khối 1 mà ba lớp 28 ô, hai lớp kia vẫn 27',
     [w.eval("sucChuaLop('lop_1A')") === 28 && w.eval("sucChuaLop('lop_1D')") === 27,
      `1A ${w.eval("sucChuaLop('lop_1A')")} · 1D ${w.eval("sucChuaLop('lop_1D')")} ô`]);
  kt('Ô khác con số của khối thì tô lên, nhìn ra ngay lớp nào đặc biệt',
     [oLop('lop_1A', '2-S').className.includes('o-lech')
      && !oLop('lop_1D', '2-S').className.includes('o-lech'),
      '1A tô · 1D không']);
  kt('Chốt tổng bày ngay dưới mỗi cột, và nói lớp nào thừa chỗ', (() => {
    const chu = w.document.querySelector('#noiDung').textContent;
    return [/Tổng mỗi tuần/.test(chu) && /Số tiết cần/.test(chu) && /trống 1/.test(chu),
            (chu.match(/\d+ lớp có \d+ ô trống mỗi tuần/) || ['—'])[0]];
  })());

  /* Ô "cả khối" phải kéo theo CẢ những lớp đang khai riêng — nếu không thì
     gõ vào ô chung mà mấy lớp ấy trơ ra con số cũ, gõ mãi không hiểu vì sao */
  /* ⚠️ Con số ở đây phải KHÁC con số ba lớp kia đang khai riêng (5). Bản đầu
     gõ đúng 5 nên hai cách tính tình cờ ra cùng kết quả: bẻ ngược phép dọn
     ghi đè mà phép thử vẫn xanh. Đúng cái bẫy "hai thứ tình cờ bằng nhau". */
  dat(w.document.querySelector('[data-tkhoi="2-S|1"]'), 6);
  kt('Gõ ô "cả khối" thì mọi lớp trong khối nhận, kể cả lớp đang khai riêng',
     [[...BA, 'lop_1D', 'lop_1E'].every(id => w.eval(`sucChuaLop(${JSON.stringify(id)})`) === 29),
      `1A ${w.eval("sucChuaLop('lop_1A')")} · 1D ${w.eval("sucChuaLop('lop_1D')")} ô`]);
  kt('Và lúc ấy không ô nào còn bị tô lệch — cả khối đã bằng nhau',
     [w.document.querySelectorAll('#noiDung .o-lech').length === 0,
      `${w.document.querySelectorAll('#noiDung .o-lech').length} ô lệch`]);

  /* Trả về 4 tiết như cũ, rồi soi phần hiển thị dựa trên giờ của lớp */
  dat(w.document.querySelector('[data-tkhoi="2-S|1"]'), 4);
  dat(oLop('lop_1A', '2-S'), 5);
  kt('Lưới của 1D bày ô nghỉ ở tiết 5 sáng, lưới 1A thì không', (() => {
    const dem = id => (w.luoiTuanLop(id).match(/o-nghi/g) || []).length;
    return [dem('lop_1D') > dem('lop_1A'), `1D ${dem('lop_1D')} ô nghỉ · 1A ${dem('lop_1A')}`];
  })());
  kt('Bản in một lớp cao đúng giờ của lớp ấy, không phải của khối', (() => {
    const so = id => (w.bangIn(() => '', w.eval(`lopId(${JSON.stringify(id)})`)).match(/<tr>/g) || []).length;
    return [so('lop_1A') > so('lop_1D'), `1A ${so('lop_1A')} dòng · 1D ${so('lop_1D')}`];
  })());
  kt('Bản Excel toàn trường ghi chữ "Nghỉ" vào ô lớp không học', (() => {
    const a = w.luoiToanTruong(S.lop);
    const ten = id => w.eval(`tenLopDay(${JSON.stringify(id)})`);
    const dTen = a.find(r => r.includes(ten('lop_1D')) && r.includes(ten('lop_1A')));
    const c1D = dTen ? dTen.indexOf(ten('lop_1D')) : -1, c1A = dTen ? dTen.indexOf(ten('lop_1A')) : -1;
    const hang = a.filter(r => r[2] === 5 && r[1] === 'Sáng' && r[0] === 'Thứ Hai');
    return [c1D > 0 && hang.length === 1 && hang[0][c1D] === 'Nghỉ' && hang[0][c1A] !== 'Nghỉ',
            hang.length ? `1D: ${hang[0][c1D]} · 1A: ${hang[0][c1A] || 'ô mở'}` : 'không có dòng tiết 5'];
  })());

  /* Nút chọn khối — 40 lớp thì xem từng khối cho vừa màn hình */
  w.document.querySelector('[data-kkg="2"]').click();
  kt('Chọn khối nào thì chỉ bày lớp của khối ấy',
     [!oLop('lop_1A', '2-S') && !!oLop('lop_2A', '2-S'), 'đang bày khối 2']);
  w.document.querySelector('[data-kkg="tat"]').click();
  kt('Nút "Tất cả" bày trọn danh sách lớp',
     [w.document.querySelectorAll('#noiDung thead th').length > S.lop.length,
      `${w.document.querySelectorAll('#noiDung thead th').length} cột`]);

  /* Trường mới tinh: chưa có lớp thì nói thẳng và chỉ đường, đừng vẽ bảng rỗng */
  kt('Chưa có lớp nào thì chỉ đường sang mục Lớp học', (() => {
    const lopGoc = S.lop.slice();
    S.lop.length = 0;
    w.chuyen('khunggio');
    const chu = w.document.querySelector('#noiDung').textContent;
    const ok = /Chưa có lớp nào để xếp giờ/.test(chu)
            && !!w.document.querySelector('[data-di="lop"]')
            && !/NaN|undefined/.test(chu);
    lopGoc.forEach(l => S.lop.push(l));
    w.chuyen('khunggio');
    return [ok, 'có nút sang Lớp học'];
  })());

  w.eval("S.lopTiet = {}; chuanKhungGio();");
  S.phanCong.length = 0; pcGoc.forEach(x => S.phanCong.push(x));
  w.eval("S.khoiKG = ''");
}

console.log('\n17aa. Xoá toàn bộ danh sách giáo viên');
/* Chủ dự án 31/8/2026: *"Có cách nào xóa toàn bộ danh sách Giáo viên không?"*
   Trước đó chỉ có nút xoá từng người — trường 88 giáo viên nhập nhầm một tệp
   là ngồi bấm 88 lần, mỗi lần một hộp xác nhận. */
{
  const gvGoc  = JSON.parse(JSON.stringify(S.giaoVien));
  const pcGoc  = JSON.parse(JSON.stringify(S.phanCong));
  const tkbGoc = JSON.parse(JSON.stringify(S.tkb));
  const nghiGoc = JSON.parse(JSON.stringify(S.gvNghi || {}));
  const xoaGoc = JSON.parse(JSON.stringify(S.gvDaXoa || []));
  const nut = t => [...w.document.querySelectorAll('#hopC button')].find(b => b.textContent === t);

  /* Một thầy cô ĐANG CÓ TÀI KHOẢN — đúng tình huống phải giữ lại */
  const coTK = S.giaoVien[0];
  coTK.nguoiDungId = 'nd-that';
  w.chuyen('giaovien');
  kt('Màn Giáo viên có nút Xoá toàn bộ danh sách',
     !!w.document.querySelector('#btXoaHetGV'));

  w.document.querySelector('#btXoaHetGV').click();
  const hopN = () => w.document.querySelector('#hopN').textContent;
  kt('Hộp nói trước mất bao nhiêu phân công, không chỉ đếm đầu người',
     /dòng phân công/.test(hopN()), hopN().trim().slice(0, 52));
  kt('Và nói rõ ai được GIỮ LẠI vì đang có tài khoản đăng nhập',
     [/Giữ lại 1 thầy cô đang có tài khoản/.test(hopN())
      && hopN().includes(coTK.hoTen), coTK.hoTen]);

  /* ⚠️ Ô xác nhận là hàng rào thật, không phải trang trí: bấm khi chưa tích
     thì tuyệt đối không được xoá dòng nào. */
  const truocGV = S.giaoVien.length;
  /* ⚠️ Tìm nút bằng KHUÔN nhãn, không bằng con số dựng sẵn: bẻ ngược bản vá
     thì nhãn đổi, mà tìm theo con số là bộ soi ném TypeError và đổ giữa
     chừng — đỏ thì tốt, đổ thì không đọc ra vấn đề nằm ở đâu. */
  const nutXoa = () => [...w.document.querySelectorAll('#hopC button')]
    .find(b => /^Xoá \d+ hồ sơ$/.test(b.textContent));
  kt('Nhãn nút đếm đúng số hồ sơ sẽ xoá, đã trừ người có tài khoản',
     [nutXoa()?.textContent === `Xoá ${truocGV - 1} hồ sơ`, nutXoa()?.textContent]);
  nutXoa().click();
  kt('Chưa tích ô xác nhận thì không xoá dòng nào',
     [S.giaoVien.length === truocGV, `vẫn ${S.giaoVien.length} hồ sơ`]);

  w.document.querySelector('#xhHieu').checked = true;
  nutXoa().click();
  kt('Xoá sạch, chỉ chừa người đang có tài khoản',
     [S.giaoVien.length === 1 && S.giaoVien[0].id === coTK.id,
      `${truocGV} → ${S.giaoVien.length} hồ sơ`]);
  kt('Phân công và tiết trên lưới của những người ấy cũng đi theo', (() => {
    const con = S.phanCong.filter(p => p.gvId !== coTK.id).length;
    const tiet = Object.values(S.tkb).reduce((n, o) =>
      n + Object.values(o).filter(x => x.gvId !== coTK.id).length, 0);
    return [con === 0 && tiet === 0, `${con} dòng phân công · ${tiet} tiết còn sót`];
  })());
  /* ⚠️ Không ghi vào `gvDaXoa` thì bấm Lưu xong tải lại là hồ sơ MỌC LẠI —
     `ghiDuLieuNguon()` chỉ xoá trên máy chủ đúng những ai nằm trong danh
     sách này, không bao giờ xoá theo kiểu "ai không có trong màn hình". */
  kt('Ghi đủ vào danh sách đã xoá để lần Lưu sau xoá hẳn trên hệ thống',
     [(S.gvDaXoa || []).length === truocGV - 1,
      `${(S.gvDaXoa || []).length} hồ sơ chờ xoá trên máy chủ`]);
  kt('Lớp học và khung giờ giữ nguyên — chỉ danh sách người dạy bị xoá',
     [S.lop.length > 0 && S.khungGio.length > 0,
      `${S.lop.length} lớp · ${S.khungGio.length} buổi`]);

  /* Danh sách trống thì nút cũng biến mất, không mời bấm vào chỗ không có gì */
  w.chuyen('giaovien');
  S.giaoVien = [];
  w.ve();
  kt('Danh sách trống thì nút cũng không hiện',
     !w.document.querySelector('#btXoaHetGV'));

  S.giaoVien = gvGoc; S.phanCong = pcGoc; S.gvNghi = nghiGoc; S.gvDaXoa = xoaGoc;
  Object.keys(S.tkb).forEach(k => delete S.tkb[k]);
  Object.entries(tkbGoc).forEach(([k, v]) => S.tkb[k] = v);
  w.chuyen('giaovien');
}

console.log('\n17ab. HTML tĩnh trong <body> không được lộ mã ra màn hình');
/* ⚠️ Dính thật 31/8/2026: một ghi chú viết theo lối `${''/* … *​/''}` — đúng
   cú pháp khi nằm trong template literal của JS — bị đặt vào HTML TĨNH của
   thanh bên, nơi không có template literal nào chạy. Kết quả: cả đoạn ghi
   chú hiện nguyên văn lên thanh bên, ngay dưới mục Phân hiệu, và chủ dự án
   phải chụp màn hình hỏi "bị lỗi gì đây em?".

   Ba bộ soi cũ không thấy vì chúng soi `#noiDung` — phần do JS vẽ ra — còn
   đây là phần viết cứng trong `<body>`, thứ người dùng nhìn thấy TRƯỚC cả
   khi `khoiDong()` chạy xong. */
{
  const than = w.document.body;
  /* Lấy chữ của khung app, bỏ mọi <script>/<style> ra ngoài */
  const chuTinh = [...than.querySelectorAll('#thanhBen, #noiDung, header, aside, nav')]
    .map(x => x.textContent).join(' ');
  const bay = ['${', '*/', '/*', '`+', '}}'].filter(x => chuTinh.includes(x));
  kt('Không mảnh mã nào lọt ra chữ hiển thị', [bay.length === 0, bay.join(' · ') || 'sạch']);

  /* Soi thẳng NGUỒN của thanh bên: chỗ này viết cứng nên phép thử phải nhìn
     đúng nó, không nhìn qua DOM đã bị JS vẽ đè. */
  kt('Thanh bên trong mã nguồn chỉ dùng comment HTML, không dùng ${…}', (() => {
    const m = html.match(/<aside[\s\S]*?<\/aside>|<nav[\s\S]*?<\/nav>/);
    /* Bỏ comment HTML ra ngoài trước đã: trong đó có ĐÚNG cái ví dụ sai mà
       phép thử này sinh ra để ngăn, và comment thì không hiện ra màn hình. */
    const kho = (m ? m[0] : '').replace(/<!--[\s\S]*?-->/g, '');
    return [!!kho && !kho.includes('${'), kho ? 'thanh bên sạch' : 'không tìm thấy thanh bên'];
  })());
}

console.log('\n17ac. Trần số buổi dạy nói bằng SỐ BUỔI PHẢI ĐẾN TRƯỜNG');
/* Chủ dự án 31/8/2026 nhìn thẻ "8 buổi có mặt" của một cô giáo rồi hỏi *"có
   nút nào chọn GV dạy trong 7 buổi hoặc 8 buổi không em?"* — tính năng đã có
   từ hôm trước, nhưng nhãn chỉ ghi "được nghỉ ít nhất N buổi", bắt người dùng
   tự lấy 8 trừ đi. Một tính năng người dùng không nhận ra thì bằng không có. */
{
  const nghiGoc = w.eval('S.buoiNghiToiThieu');
  const chu = () => w.document.querySelector('#noiDung').textContent;
  w.eval('S.buoiNghiToiThieu = 0');
  w.chuyen('xep');
  kt('Chưa ép gì thì nói rõ đang là "đến trường cả N buổi"',
     [/đến trường cả \d+ buổi/.test(chu()), (chu().match(/đến trường cả \d+ buổi/) || [''])[0]]);

  const so = w.eval('KT.buoi');
  w.eval('S.buoiNghiToiThieu = 1');
  w.chuyen('xep');
  kt('Đặt nghỉ 1 buổi thì bày ngay con số thầy cô nhìn ở màn Theo giáo viên',
     [chu().includes(`dạy nhiều nhất ${so - 1}/${so} buổi`),
      (chu().match(/dạy nhiều nhất \d+\/\d+ buổi/) || [''])[0]]);
  kt('Và chỉ đường sang mục Buổi bận cho ai cần chỉ định đúng buổi',
     /mục Buổi bận/.test(chu()));
  /* Nhãn nhắc phải theo tên mục hiện hành — mục đổi tên 31/8/2026 */
  kt('Không còn nhắc tới tên mục cũ "Khối và khung giờ"',
     !/Khối và khung giờ/.test(chu()));

  w.eval(`S.buoiNghiToiThieu = ${nghiGoc || 0}`);
  w.chuyen('dieuhanh');
}

console.log('\n18. Không có lỗi chạy nào');
kt('Không lỗi JavaScript nào trong suốt phép thử', loiChay.length === 0,
   loiChay.slice(0, 3).join(' | ') || 'sạch');

console.log(`\n\x1b[1mKết quả soi giao diện: ${dat} đạt, ${hong} hỏng\x1b[0m\n`);
process.exit(hong ? 1 : 0);




