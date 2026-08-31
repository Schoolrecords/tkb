/* ==================================================================
   MỤC 22 — NHẬP TỪNG MỤC, mỗi màn hình một trang tính  (28/8/2026)
   ------------------------------------------------------------------
   Chủ dự án: *"ta nhập từng mục chứ 10 trang làm cho giáo viên rối quá!"*
   Ông đã điền hết mười trang, nhập lên, nhận về **"199 chỗ chưa đúng"** mà
   *"khó biết sai như thế nào"*.

   Bộ này canh ba lời hứa của đường nhập mới. Phép thử đáng giá nhất vẫn là
   **vòng tròn**: đổ chính những dòng mẫu sinh ra ngược qua trình soát và
   đòi 0 lỗi — cùng khuôn mục 21b, thứ đã bắt lỗi ngay lần chạy đầu.
   ================================================================== */

export default function muc22({ kt, S, MUC_NHAP, cotCua, duLieuTuMuc, napMucVaoS,
                                chepKhoNguon, thieuMucTruoc, locDongDaDien,
                                dienGiaiLoiNhap, taoUngDung, documentGia }) {

  /* Đổi mảng hai chiều của `hang()` thành dạng sheet_to_json trả về: mỗi dòng
     một object, ô trống bị bỏ qua — đúng như đọc tệp .xlsx thật. */
  const nhuXLSX = (ma, hang) => {
    const cot = cotCua(MUC_NHAP[ma]).map(c => c.ten);
    return hang.map(h => {
      const o = {};
      cot.forEach((c, i) => { const v = h[i]; if (v !== '' && v != null) o[c] = v; });
      return o;
    });
  };
  /* Hai mục TUỲ CHỌN (`PHONG` · `BUOI_BAN`) trường Diễn Liên chưa khai, nên
     `hang()` rỗng và vòng tròn không kiểm được gì. Gieo sẵn một dòng dựng từ
     chính dữ liệu thật — KHÔNG dùng dòng ví dụ "Phân hiệu chính", cái tên
     ấy không tồn tại ở trường này và đó đúng là cái bẫy đã ghi ở mục 21. */
  const gieo = () => {
    const k = chepKhoNguon();
    k.phong = [{id: 'ph1', ten: 'Phòng máy 1', mon: 'Tin học', dtId: S.diemTruong[0].id}];
    k.gvNghi = {[S.giaoVien[0].id]: ['5-C']};
    return k;
  };
  const HANG_THEM = {
    phonghoc: [['Phòng máy 1', 'Tin học', S.diemTruong[0].ten]],
    buoiban:  [[S.giaoVien[0].maGV, 5, 'C']]
  };
  const vong = ma => duLieuTuMuc(ma,
    nhuXLSX(ma, HANG_THEM[ma] || MUC_NHAP[ma].hang()),
    HANG_THEM[ma] ? gieo() : undefined);

  /* ---------- a) Vòng tròn: mẫu sinh ra phải nhập ngược lại được ---------- */
  const MUC = Object.keys(MUC_NHAP);
  kt('Khai đủ tám mục, khoá của mục nào cũng là khoá tự nhiên đọc được',
     MUC.length === 8 && MUC.every(m => MUC_NHAP[m].trang && MUC_NHAP[m].khoaDong?.length),
     MUC.join(' · '));

  MUC.forEach(ma => {
    const r = vong(ma);
    kt(`Vòng tròn ${MUC_NHAP[ma].trang}: mẫu điền sẵn nhập ngược lại 0 lỗi`,
       r.soLoi === 0, r.soLoi ? r.loi[0] : `${r.doc} dòng`);
  });

  /* ---------- b) Nhập lại đúng tệp ấy KHÔNG nhân đôi ---------- */
  MUC.forEach(ma => {
    const r = vong(ma);
    kt(`Nhập lại ${MUC_NHAP[ma].trang} lần hai không thêm dòng nào — chỉ cập nhật`,
       r.doc > 0 && r.them === 0 && r.capNhat === r.doc,
       `thêm ${r.them} · cập nhật ${r.capNhat}/${r.doc}`);
  });

  /* ---------- c) Dòng chưa điền: bỏ qua, KHÔNG phải lỗi ----------
     Đây là gốc của con số 199. Mẫu đặt khoá dư ra vài trăm dòng để người dùng
     gõ thêm; chạm vào một ô rồi xoá là Excel giữ lại một dòng rỗng. */
  {
    const hang = [...nhuXLSX('lop', MUC_NHAP.lop.hang()),
                  {}, {Khoi: ''}, {Diem_truong: ''}, {Chu_nhiem: ''}];
    const r = duLieuTuMuc('lop', hang);
    kt('Bốn dòng trống lẫn trong tệp thì KHÔNG sinh một lỗi nào',
       r.soLoi === 0, r.soLoi ? r.loi.join(' | ') : 'sạch');
    kt('Nhưng vẫn NÓI RA đã bỏ mấy dòng — im lặng là thiếu dữ liệu mà không hay',
       r.canh.some(x => /bỏ qua 4 dòng chưa điền/.test(x)), r.canh[0]);
    kt('Số dòng trong câu cảnh báo đúng như Excel hiển thị',
       r.canh.some(x => /dòng 27, 28, 29, 30/.test(x)), r.canh[0]);
  }

  /* ---------- d) Lỗi GOM lại, không bày N câu y hệt nhau ---------- */
  {
    /* Năm dòng CÓ điền tên lớp mà quên mã lớp — dòng thật, lỗi thật, và cùng
       một lỗi. Bản cũ bày ra năm câu y hệt nhau chỉ khác con số dòng. */
    const r = duLieuTuMuc('lop',
      [1, 2, 3, 4, 5].map(i => ({Ten_lop: '6' + i, Khoi: 5})));
    kt('Năm dòng cùng một lỗi gom thành MỘT câu, không phải năm',
       r.soLoi === 1 && /5 dòng thiếu Ma_lop/.test(r.loi[0]), r.loi.join(' | '));
    kt('Câu gom vẫn liệt kê đủ số dòng để người dùng tìm đúng chỗ',
       /dòng 2, 3, 4, 5, 6/.test(r.loi[0]), r.loi[0]);
  }
  {
    /* Mục mà cột thiếu CHÍNH LÀ khoá dòng thì dòng ấy là dòng chưa điền, không
       phải dòng sai — bỏ qua im lặng mới đúng. */
    const r = duLieuTuMuc('diemtruong', [{Co_phong_tin: 'Có'}, {Co_phong_tin: 'Có'}]);
    kt('Dòng chỉ chọn Co_phong_tin mà chưa gõ tên thì là dòng CHƯA ĐIỀN, không phải lỗi',
       r.canh.some(x => /bỏ qua 2 dòng chưa điền/.test(x)), r.canh[0] || r.loi[0]);
  }
  kt('dienGiaiLoiNhap gom theo (trang · nội dung), giữ nguyên lỗi mức trang', (() => {
    const ra = dienGiaiLoiNhap([
      {t: 'LOP', d: 2, v: 'thiếu Ma_lop'}, {t: 'LOP', d: 5, v: 'thiếu Ma_lop'},
      {t: 'LOP', d: 9, v: 'thiếu Ten_lop'}, 'LOP: câu mức trang']);
    return ra.length === 3 && /2 dòng thiếu Ma_lop — dòng 2, 5/.test(ra[0])
      && /dòng 9: thiếu Ten_lop/.test(ra[1]) && ra[2] === 'LOP: câu mức trang';
  })());
  kt('Quá 8 dòng thì cắt bớt số dòng chứ không bày cả trăm con số', (() => {
    const ra = dienGiaiLoiNhap([...Array(30)].map((_, i) => ({t: 'X', d: i + 2, v: 'sai'})));
    return ra.length === 1 && /30 dòng sai/.test(ra[0]) && /…và 22 dòng nữa/.test(ra[0]);
  })());

  /* ---------- e) THÊM và CẬP NHẬT, không bao giờ XOÁ ----------
     Khác biệt lớn nhất với mẫu trọn gói cũ, thứ thay sạch bảng phân công. */
  {
    const truoc = S.lop.length;
    const r = duLieuTuMuc('lop',
      [{Ma_lop: 'LOP_MOI_1', Ten_lop: '6A', Khoi: 5, Diem_truong: S.diemTruong[0].ten}]);
    kt('Tệp chỉ có MỘT dòng thì 25 lớp đang có vẫn còn nguyên',
       r.soLoi === 0 && r.kho.lop.length === truoc + 1 && r.them === 1,
       `${truoc} → ${r.kho.lop.length} lớp`);
    kt('duLieuTuMuc KHÔNG đụng vào S trước khi người dùng bấm xác nhận',
       S.lop.length === truoc, `S vẫn ${S.lop.length} lớp`);
  }

  /* ---------- f) Mục phụ thuộc: chặn sớm, nói rõ phải làm gì ---------- */
  {
    const r = duLieuTuMuc('phancong',
      [{Ma_GV: S.giaoVien[0].maGV, Ma_lop: 'KHONG_CO_LOP_NAY', Mon: 'Toán', So_tiet: 3}]);
    kt('Phân công trỏ vào lớp chưa khai thì BỊ CHẶN, kèm việc phải làm trước',
       r.soLoi === 1 && /vào mục Lớp học thêm lớp này trước/.test(r.loi[0]), r.loi[0]);
  }
  {
    const u = taoUngDung(documentGia);
    u.S.lop = []; u.S.giaoVien = [];
    kt('thieuMucTruoc() chặn NGAY từ hộp thoại, trước khi người dùng điền gì',
       /Khai xong .*Lớp học.*Giáo viên.* trước/.test(u.thieuMucTruoc('phancong')),
       u.thieuMucTruoc('phancong'));
    kt('Khai đủ rồi thì không chặn nữa', thieuMucTruoc('phancong') === '');
  }

  /* ---------- g) So_tiet bỏ trống thì lấy tiết chuẩn CT GDPT 2018 ----------
     ⚠️ Ép hai nhánh ra HAI SỐ KHÁC NHAU rồi soi từng nhánh — bài học mục 21:
     phép thử so hai thứ tình cờ bằng nhau thì không kiểm được gì. */
  {
    const l = S.lop.find(x => x.khoi === 4);
    const g = S.giaoVien[0];
    const chuan = 5;                       /* Toán khối 4 theo CT GDPT 2018 */
    const chay = st => duLieuTuMuc('phancong',
      [{Ma_GV: g.maGV, Ma_lop: l.maLop, Mon: 'Toán', ...(st === '' ? {} : {So_tiet: st})}]);
    const a = chay('');
    /* Phải dò theo CẢ gvId: lớp này vốn đã có một dòng Toán của người khác,
       `find` không kèm gvId thì trả về dòng cũ và phép thử xanh nhờ trùng hợp. */
    const tim = r => r.kho.phanCong.find(
      p => p.lopId === l.id && p.mon === 'Toán' && p.gvId === g.id);
    kt('Bỏ trống So_tiet thì máy điền đúng tiết chuẩn theo khối của lớp',
       a.soLoi === 0 && tim(a)?.soTiet === chuan, `${tim(a)?.soTiet} tiết, chuẩn ${chuan}`);
    const b = chay(chuan + 2);
    kt('Ghi số tiết riêng thì máy TÔN TRỌNG số ấy, không đè bằng chuẩn',
       b.soLoi === 0 && tim(b)?.soTiet === chuan + 2, `${tim(b)?.soTiet} tiết`);
    const c = duLieuTuMuc('phancong',
      [{Ma_GV: g.maGV, Ma_lop: l.maLop, Mon: 'Môn tự chọn lạ'}]);
    kt('Môn không có tiết chuẩn mà bỏ trống So_tiet thì BỊ CHẶN, nói rõ phải ghi số',
       c.soLoi === 1 && /ghi rõ số tiết vào ô đó/.test(c.loi[0]), c.loi[0]);
  }

  /* ---------- h) Cột Gmail (đề xuất của chủ dự án 28/8/2026) ---------- */
  {
    const g = S.giaoVien[0];
    const dong = (mail, ma) => ({Ma_GV: ma || g.maGV, Ho_ten: g.hoTen, Gmail: mail});
    const r = duLieuTuMuc('giaovien', [dong('Co.Trinh@Gmail.COM ')]);
    kt('Gmail nhập vào được chuẩn hoá về chữ thường, bỏ khoảng trắng thừa',
       r.soLoi === 0 && r.kho.giaoVien.find(x => x.maGV === g.maGV)?.email === 'co.trinh@gmail.com',
       r.kho.giaoVien.find(x => x.maGV === g.maGV)?.email);
    kt('Địa chỉ không hợp lệ thì BỊ CHẶN ngay, không ghi vào hồ sơ ai',
       duLieuTuMuc('giaovien', [dong('khong-phai-email')]).soLoi === 1);

    const hai = duLieuTuMuc('giaovien',
      [dong('chung@gmail.com'), dong('chung@gmail.com', S.giaoVien[1].maGV)]);
    kt('Một Gmail khai cho HAI người thì BỊ CHẶN — không thì đăng nhập vào mở lịch của ai?',
       hai.soLoi === 1 && /khai cho 2 người/.test(hai.loi[0]), hai.loi[0]);

    /* Bỏ trống ô Gmail là "tôi không khai", KHÔNG phải "hãy thu quyền của
       thầy cô này" — mà xoá email ở đây chính là thu quyền đăng nhập. */
    const co = duLieuTuMuc('giaovien', [dong('giu@gmail.com')]);
    const sau = duLieuTuMuc('giaovien',
      [{Ma_GV: g.maGV, Ho_ten: g.hoTen}], co.kho);
    kt('Ô Gmail để trống thì GIỮ NGUYÊN địa chỉ cũ, không xoá mất quyền đăng nhập',
       sau.kho.giaoVien.find(x => x.maGV === g.maGV)?.email === 'giu@gmail.com');
    kt('Chưa ai có Gmail thì nhắc, nhưng KHÔNG chặn việc nhập',
       co.soLoi === 0 && co.canh.some(x => /chưa có Gmail/.test(x)),
       co.canh.find(x => /chưa có Gmail/.test(x)));
  }

  /* ---------- i) Chủ nhiệm gỡ ràng buộc ở CẢ HAI đầu ---------- */
  {
    const l = S.lop[0], g = S.giaoVien.find(x => x.cn !== l.id);
    const r = duLieuTuMuc('lop',
      [{Ma_lop: l.maLop, Ten_lop: l.ten, Khoi: l.khoi,
        Diem_truong: S.diemTruong.find(d => d.id === S.lopDT[l.id]).ten,
        Chu_nhiem: g.maGV}]);
    kt('Đổi chủ nhiệm qua Excel: không ai chủ nhiệm hai lớp, không lớp nào hai chủ nhiệm',
       r.soLoi === 0 &&
       r.kho.giaoVien.filter(x => x.cn === l.id).length === 1 &&
       r.kho.giaoVien.find(x => x.maGV === g.maGV).cn === l.id);
  }

  /* ---------- k) Khung giờ thiếu chỗ thì chặn NGAY lúc nhập ---------- */
  {
    /* Mẫu nay có mỗi LỚP một cột (31/8/2026), nên hạ hết mọi cột lớp xuống 1 */
    const hang = MUC_NHAP.khunggio.hang().map(h => [h[0], h[1], h[2], ...h.slice(3).map(() => 1)]);
    const r = duLieuTuMuc('khunggio', nhuXLSX('khunggio', hang));
    kt('Khung giờ không đủ ô cho lớp thì BỊ CHẶN, nói rõ thiếu bao nhiêu chỗ',
       r.soLoi > 0 && r.loi.some(x => /lớp .*chỉ có \d+ ô mỗi tuần/.test(x) && /thiếu \d+ chỗ/.test(x)),
       r.loi[0]);
    /* Gom các lớp cùng tình trạng — 25 lớp cùng thiếu là MỘT dòng, không 25 */
    kt('Các lớp cùng thiếu một số chỗ gom chung một dòng lỗi',
       [r.soLoi <= 5, `${r.soLoi} dòng lỗi cho ${S.lop.length} lớp`]);
  }

  /* ---------- k2) Mẫu Khung giờ học có mỗi LỚP một cột (31/8/2026) ----------
     Chủ dự án tải mẫu về và nói ngay: *"mẫu tải về còn là mẫu cũ chưa phải
     theo mới cập nhật này"*. Màn hình đã khai theo lớp mà mẫu vẫn K1…K5 thì
     người dùng phải dịch qua lại trong đầu — đúng bài học mẫu Phân công 29/8. */
  {
    const cot = cotCua(MUC_NHAP.khunggio).map(c => c.ten);
    kt('Mẫu Khung giờ học: ba cột khoá rồi mỗi lớp một cột, không còn K1…K5',
       [cot.slice(0, 3).join(',') === 'Thu,Buoi,Day_hoc'
        && cot.length === 3 + S.lop.length && !cot.includes('K1'),
        `${cot.length} cột · ${cot.slice(3, 5).join(', ')}…`]);
    kt('Tên cột là MÃ lớp, không phải tên gọi — sau sáp nhập tên trùng nhau',
       [S.lop.every(l => cot.includes(l.maLop || l.id)),
        `ví dụ ${S.lop[0].maLop || S.lop[0].id}`]);

    /* Một lớp học khác cả khối → chỉ mình nó vào `lopTiet`, phần còn lại là nền */
    const hang = MUC_NHAP.khunggio.hang();
    const iCot = cot.indexOf(S.lop[0].maLop || S.lop[0].id);
    const i2S = hang.findIndex(h => +h[0] === 2 && h[1] === 'S');
    hang[i2S] = hang[i2S].slice();
    hang[i2S][iCot] = hang[i2S][iCot] + 1;
    const r = duLieuTuMuc('khunggio', nhuXLSX('khunggio', hang));
    kt('Một lớp lệch thì chỉ mình nó được ghi riêng, cả khối vẫn là nền chung',
       [r.soLoi === 0
        && r.kho.lopTiet[S.lop[0].id]?.['2-S'] === hang[i2S][iCot]
        && Object.keys(r.kho.lopTiet).length === 1,
        r.soLoi ? r.loi[0] : `${Object.keys(r.kho.lopTiet).length} lớp khai riêng`]);
    kt('Và nền của khối KHÔNG bị kéo theo con số của một lớp',
       [r.kho.khungGio.find(k => +k.thu === 2 && k.buoi === 'S').tietKhoi[S.lop[0].khoi]
          === hang[i2S][iCot] - 1, 'nền giữ nguyên']);

    /* Cả khối cùng đổi → vào NỀN, không đẻ ra ghi đè cho từng lớp */
    const hang2 = MUC_NHAP.khunggio.hang();
    hang2[i2S] = hang2[i2S].map((v, i) => i >= 3 && +S.lop[i - 3].khoi === 1 ? +v + 1 : v);
    const r2 = duLieuTuMuc('khunggio', nhuXLSX('khunggio', hang2));
    kt('Cả khối cùng đổi thì chỉ nền đổi, không lớp nào bị ghi riêng',
       [r2.soLoi === 0 && Object.keys(r2.kho.lopTiet).length === 0
        && r2.kho.khungGio.find(k => +k.thu === 2 && k.buoi === 'S').tietKhoi[1]
           === hang2[i2S][3],
        `${Object.keys(r2.kho.lopTiet).length} lớp khai riêng · nền ${r2.kho.khungGio.find(k => +k.thu === 2 && k.buoi === 'S').tietKhoi[1]}`]);

    /* Cột không ứng với lớp nào thì nói rõ, kèm câu chỉ đường của timLopNhap */
    const hang3 = MUC_NHAP.khunggio.hang();
    const r3 = duLieuTuMuc('khunggio',
      nhuXLSX('khunggio', hang3).map(h => ({...h, '9Z_KHONG_CO': 4})));
    kt('Cột không khớp lớp nào thì báo đúng cột ấy, kèm cách chữa',
       [r3.soLoi > 0 && r3.loi.some(x => /9Z_KHONG_CO/.test(x)), r3.loi[0]]);
  }

  /* ⚠️ Bản sao phải CHÉP SÂU. `{...k}` để `tietKhoi` dùng chung một vật với
     `S.khungGio`, nên trình soát sửa vào bản sao là sửa thẳng dữ liệu đang
     hiển thị. Hai phép thử ngay trên đây nhiễm nhau vì đúng chuyện này. */
  kt('Soát tệp Khung giờ học KHÔNG đụng một chữ nào vào S', (() => {
    const truoc = JSON.stringify(S.khungGio) + '##' + JSON.stringify(S.lopTiet || {});
    const h = MUC_NHAP.khunggio.hang();
    h[0] = h[0].map((v, i) => i >= 3 ? +v + 2 : v);
    duLieuTuMuc('khunggio', nhuXLSX('khunggio', h));
    return [JSON.stringify(S.khungGio) + '##' + JSON.stringify(S.lopTiet || {}) === truoc,
            'S nguyên vẹn'];
  })());

  /* ---------- l) napMucVaoS() là đường DUY NHẤT ghi vào S ---------- */
  {
    const u = taoUngDung(documentGia);
    const r = u.duLieuTuMuc('diemtruong', [{Ten_diem_truong: 'Phân hiệu Mới Toanh'}]);
    const truoc = u.S.diemTruong.length;
    u.napMucVaoS(r);
    kt('napMucVaoS() nạp trọn bản sao vào S, không sót bảng nào',
       u.S.diemTruong.length === truoc + 1 &&
       u.S.diemTruong.some(d => d.ten === 'Phân hiệu Mới Toanh') &&
       u.S.lop === r.kho.lop && u.S.phanCong === r.kho.phanCong &&
       u.S.giaoVien === r.kho.giaoVien && u.S.gvNghi === r.kho.gvNghi);
  }
}
