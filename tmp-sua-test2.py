import io
p = 'test/soi-giao-dien.mjs'
d = io.open(p, encoding='utf-8').read().split('\n')

# doi 135 (chi so 134) .. dong truoc "console.log('\n5. Bu..."
dau = next(i for i, x in enumerate(d) if 'NÚT GHIM' in x or 'NÚT GHIM' in x or 'BẬT/TẮT' in x)
cuoi = next(i for i, x in enumerate(d) if x.startswith("console.log('\\n5."))
assert 130 < dau < cuoi < 170, (dau, cuoi)

moi = r"""/* --- Nút ghim là BẬT/TẮT, và chỉ hiện ở ô ĐÃ GHIM hoặc ô ĐANG CHỌN --------
   Chủ dự án: *"Bỏ ghim rồi thì bấm ghim lại rất khó, chỉ có cách chuyển chỗ
   mới thực hiện ghim"*. Bản cũ chỉ vẽ dấu ghim ở tiết ĐÃ ghim nên không có
   đường ghim lại — một thao tác chỉ đi được một chiều thì là ngõ cụt.

   ⚠️ Nhưng vẽ nút ở MỌI ô cũng sai, và sai nặng hơn: nút chiếm 12,5% diện
   tích ô trên điện thoại, nên chạm góc phải trên để CHỌN tiết lại thành GHIM
   nhầm — hỏng đúng lối chạm, lối CHÍNH của PHT phụ trách phân hiệu. Nay nút
   chỉ có ở ô đã ghim hoặc ô đang chọn. */
const oGhim = k => w.document.querySelector(`[data-ghim="${k}"]`);
const bamGhim = k => oGhim(k)?.dispatchEvent(new w.Event('click', { bubbles: true }));
const cham = k => { w.chamO(k); w.ve(); };

bamGhim(k1);
kt('Bấm dấu ghim là bỏ ghim tiết đó', !S.tkb[lop][k1]?.ghim);

/* Ô thường, không chọn: KHÔNG có nút — để chạm đâu trong ô cũng là chọn */
kt('Ô chưa ghim và chưa chọn thì KHÔNG có nút ghim che góc', (() => {
  w.eval('S.oChon=null'); w.ve();
  const k2 = Object.keys(S.tkb[lop]).find(k => !S.tkb[lop][k].ghim);
  return [!!k2 && !oGhim(k2), k2 ? (oGhim(k2) ? 'CÒN nút — che mất góc' : 'sạch') : '(lớp ghim hết)'];
})());
kt('Nên chạm vào ô ấy là CHỌN được, không bị ghim nhầm', (() => {
  const k2 = Object.keys(S.tkb[lop]).find(k => !S.tkb[lop][k].ghim);
  cham(k2);
  return [S.oChon === k2 && !S.tkb[lop][k2].ghim, `oChon=${S.oChon} · ghim=${!!S.tkb[lop][k2].ghim}`];
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
          (t.match(/.{0,40}bỏ ghim.{0,20}/) || [''])[0].trim()];
})());
w.eval('S.oChon=null'); w.ve();
"""

d[dau:cuoi] = moi.split('\n')
io.open(p, 'w', encoding='utf-8', newline='').write('\n'.join(d))
print('da thay cum phep thu ghim')
