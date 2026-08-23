/* ==================================================================
   MỤC 21 — MẪU EXCEL TRỌN GÓI VÀ ĐƯỜNG NHẬP MỘT CỬA  (23/8/2026)
   ------------------------------------------------------------------
   Nạp từ test/kiem-thu.mjs. Không dùng ExcelJS: bộ khai mẫu là DỮ LIỆU
   thuần (`bangMauTronGoi()`), nên kiểm được nó mà không cần trình duyệt
   hay thư viện ngoài — đúng cách vùng LOGIC và XUAT vẫn làm.

   Phép thử đắt nhất ở đây là VÒNG TRÒN: đổ chính các hàng của mẫu tải
   về qua `duLieuTuTronGoi()` phải ra 0 lỗi. Mẫu mà không tự nhập lại
   được thì mọi thứ khác đều vô nghĩa.
   ================================================================== */

export default function muc21({ kt, S, bangMauTronGoi, bangKiemMau,
                                duLieuTuTronGoi, docTrang, CHUAN_KHOI, chuanMon }) {
  console.log('\n\x1b[1m21. Mẫu Excel trọn gói và đường nhập một cửa\x1b[0m');

  /* Đổi bộ khai mẫu thành hàm `doc(tên)` giống hệt thứ XLSX trả về:
     mảng các object khoá theo tên cột. Nhờ vậy phép thử đi đúng con
     đường tệp thật đi, không có lối tắt nào. */
  const nhuXLSX = m => {
    const kho = {};
    m.trang.forEach(t => {
      kho[t.ten] = t.hang.map(h => {
        const o = {};
        t.cot.forEach((c, i) => { if (h[i] !== '' && h[i] != null) o[c.ten] = h[i]; });
        return o;
      });
    });
    return n => kho[n] || null;
  };

  /* ---------- a) Bộ khai mẫu ---------- */
  {
    const m = bangMauTronGoi();
    const ten = m.trang.map(t => t.ten);

    kt('Mẫu trọn gói có đủ tám trang dữ liệu', m.trang.length === 8, ten.join(' · '));
    kt('Tên trang tính đánh số nên tab Excel tự xếp đúng trình tự làm việc',
       ten.every((t, i) => t.startsWith(`${i + 1}_`)));

    /* Đây là toàn bộ lý do dựng mẫu mới: bốn thứ hai mẫu cũ không có */
    ['1_TRUONG', '2_DIEM_TRUONG', '3_KHUNG_GIO', '7_PHONG', '8_BUOI_BAN']
      .forEach(t => kt(`Có trang ${t} — thứ hai mẫu cũ thiếu hẳn`, ten.includes(t)));

    const cot = t => m.trang.find(x => x.ten === t).cot;
    kt('Khung giờ khai số tiết RIÊNG từng khối, không phải một con số chung',
       [1, 2, 3, 4, 5].every(k => cot('3_KHUNG_GIO').some(c => c.ten === 'K' + k)));

    /* Mọi cột đều phải có khoá — cột nào quên là một cửa gõ sai bỏ ngỏ */
    const khongKhoa = m.trang.flatMap(t => t.cot.filter(c => !c.khoa).map(c => `${t.ten}.${c.ten}`));
    kt('Mọi cột đều khai khoá kiểm tra', khongKhoa.length === 0, khongKhoa.join(', '));

    /* Dropdown phải trỏ vào danh mục CÓ THẬT, và danh mục không được rỗng —
       ô xổ xuống trống trơn làm người điền tưởng tệp hỏng. */
    const hong = m.trang.flatMap(t => t.cot
      .filter(c => c.khoa?.kieu === 'chon')
      .filter(c => !(m.danhMuc[c.khoa.nguon] || []).length)
      .map(c => `${t.ten}.${c.ten}→${c.khoa.nguon}`));
    kt('Mọi ô xổ xuống trỏ vào một danh mục có thật và không rỗng',
       hong.length === 0, hong.join(', '));

    kt('Ma_lop và Ma_GV ở trang Phân công đều là ô xổ xuống — hết đường gõ sai mã',
       ['Ma_GV', 'Ma_lop'].every(x =>
         cot('6_PHAN_CONG').find(c => c.ten === x)?.khoa?.kieu === 'chon'));
    kt('Khoi khoá số nguyên 1–5',
       JSON.stringify(cot('4_LOP').find(c => c.ten === 'Khoi').khoa) ===
       JSON.stringify({ kieu: 'so', tu: 1, den: 5, batBuoc: true }));
    kt('So_tiet KHÔNG bắt buộc — trường chỉ có bảng phân công vẫn nhập được',
       cot('6_PHAN_CONG').find(c => c.ten === 'So_tiet').khoa.batBuoc !== true);

    kt('Bảng kiểm ở trang 0_BAT_DAU dựng từ chính bộ khai, đủ tám dòng',
       bangKiemMau(m).length === 9);

    /* Ràng buộc mạnh nhất của cả bộ: MỌI ô nằm dưới một cột xổ xuống phải là
       giá trị CÓ THẬT trong danh mục của nó. Chính phép này bắt được lỗi trang
       7_PHONG bày dòng ví dụ "Điểm trường chính" cho một trường thật không hề
       có điểm trường tên ấy — tệp mẫu tải về là nhập lại không được. */
    const lac = [];
    m.trang.forEach(t => t.cot.forEach((c, i) => {
      if (c.khoa?.kieu !== 'chon') return;
      const hop = new Set((m.danhMuc[c.khoa.nguon] || []).map(String));
      t.hang.forEach((h, d) => {
        const v = h[i];
        if (v === '' || v == null) return;
        if (!hop.has(String(v))) lac.push(`${t.ten} dòng ${d + 2} · ${c.ten}="${v}"`);
      });
    }));
    kt('Mọi giá trị mẫu điền sẵn vào ô xổ xuống đều có trong danh mục của nó',
       lac.length === 0, lac.slice(0, 3).join(' | '));
  }

  /* ---------- b) VÒNG TRÒN: mẫu tải về phải nhập lại được ---------- */
  {
    const m = bangMauTronGoi();
    const dl = duLieuTuTronGoi(nhuXLSX(m));
    kt('Mẫu tải về nhập lại được, không một lỗi nào',
       dl.soLoi === 0, dl.soLoi ? dl.loi.join(' | ') : `${dl.lop.length} lớp · ${dl.giaoVien.length} GV`);
    kt('Vòng tròn giữ đúng số lớp', dl.lop.length === S.lop.length);
    kt('Vòng tròn giữ đúng số giáo viên', dl.giaoVien.length === S.giaoVien.length);
    kt('Vòng tròn giữ đúng số dòng phân công', dl.phanCong.length === S.phanCong.length);
    kt('Vòng tròn giữ đúng tổng số tiết mỗi tuần',
       dl.tongTiet === S.phanCong.reduce((s, p) => s + p.soTiet, 0), `${dl.tongTiet} tiết`);
    kt('Vòng tròn giữ đúng khung giờ — 8 buổi dạy mỗi tuần',
       dl.khungGio.filter(k => k.bat !== false).length === 8);
    kt('Vòng tròn giữ nguyên chủ nhiệm của từng lớp',
       dl.giaoVien.filter(g => g.cn).length === S.giaoVien.filter(g => g.cn).length);
  }

  /* ---------- c) Khung giờ cộng ra đúng chuẩn CT GDPT 2018 ----------
     Trang này quyết định có bao nhiêu Ô để xếp. Sai một ô là cả trường
     thiếu chỗ mà không ai hiểu vì sao — nên kiểm bằng phép cộng thật. */
  {
    const m = bangMauTronGoi();
    const t = m.trang.find(x => x.ten === '3_KHUNG_GIO');
    const iK = k => t.cot.findIndex(c => c.ten === 'K' + k);
    const iBat = t.cot.findIndex(c => c.ten === 'Day_hoc');
    [1, 2, 3, 4, 5].forEach(k => {
      const tong = t.hang.filter(h => h[iBat] === 'Có').reduce((s, h) => s + (+h[iK(k)] || 0), 0);
      kt(`Khung giờ mẫu cộng ra đúng ${CHUAN_KHOI[k]} tiết cho khối ${k}`,
         tong === CHUAN_KHOI[k], `${tong} tiết`);
    });
  }

  /* ---------- d) Soát lỗi: chặn đúng thứ đáng chặn ---------- */
  {
    const hong = (sua, ten, khop) => {
      const m = bangMauTronGoi();
      sua(m);
      const dl = duLieuTuTronGoi(nhuXLSX(m));
      const co = dl.loi.some(x => khop.test(x));
      kt(ten, dl.soLoi > 0 && co, co ? dl.loi.find(x => khop.test(x)) : dl.loi.join(' | ') || 'không lỗi nào');
    };
    const trang = (m, t) => m.trang.find(x => x.ten === t);
    const iCot = (m, t, c) => trang(m, t).cot.findIndex(x => x.ten === c);

    hong(m => { trang(m, '4_LOP').hang[0][iCot(m, '4_LOP', 'Diem_truong')] = 'Điểm trường Ma'; },
         'Lớp trỏ tới điểm trường không có trong trang 2 thì BỊ CHẶN', /không có điểm trường/);
    hong(m => { trang(m, '4_LOP').hang[0][iCot(m, '4_LOP', 'Khoi')] = 7; },
         'Khối ngoài 1–5 thì BỊ CHẶN', /Khoi phải từ 1 đến 5/);
    hong(m => { trang(m, '3_KHUNG_GIO').hang[0][0] = 8; },
         'Thứ 8 trong khung giờ thì BỊ CHẶN', /Thu phải là 2, 3, 4, 5 hoặc 6/);
    hong(m => { trang(m, '3_KHUNG_GIO').hang.forEach(h => { h[3] = 1; }); },
         'Khung giờ không đủ chỗ cho khối 1 thì BỊ CHẶN ngay lúc nhập', /thiếu \d+ chỗ/);
    hong(m => { trang(m, '8_BUOI_BAN').hang = [['KHONG_CO_AI', 5, 'C']]; },
         'Buổi bận của một mã giáo viên không tồn tại thì BỊ CHẶN', /không có giáo viên mã/);
    hong(m => { trang(m, '7_PHONG').hang = [['Phòng máy', 'Tin học', 'Nơi lạ']]; },
         'Phòng đặt ở điểm trường không có thì BỊ CHẶN', /không có điểm trường/);
    hong(m => { const t = trang(m, '2_DIEM_TRUONG'); t.hang = [...t.hang, [...t.hang[0]]]; },
         'Điểm trường trùng tên thì BỊ CHẶN', /xuất hiện 2 lần/);
  }

  /* ---------- e) Cảnh báo thì CHO QUA ----------
     Bản cũ chặn mọi thứ, kể cả "3 lớp chưa có chủ nhiệm" — thứ không đáng
     chặn ai. Đây là phép thử canh đúng ranh giới ấy. */
  {
    const m = bangMauTronGoi();
    const tGV = m.trang.find(x => x.ten === '5_GIAO_VIEN');
    const iCN = tGV.cot.findIndex(c => c.ten === 'Chu_nhiem');
    tGV.hang.forEach(h => { h[iCN] = ''; });                 /* bỏ hết chủ nhiệm */
    const dl = duLieuTuTronGoi(nhuXLSX(m));
    kt('Lớp chưa có chủ nhiệm là CẢNH BÁO, không phải lỗi — vẫn nhập được',
       dl.soLoi === 0 && dl.soCanh > 0, `${dl.soLoi} lỗi · ${dl.soCanh} cảnh báo`);
    kt('Cảnh báo nói rõ bao nhiêu lớp thiếu chủ nhiệm',
       dl.canh.some(x => /lớp chưa có chủ nhiệm/.test(x)),
       dl.canh.find(x => /chủ nhiệm/.test(x)));
  }
  {
    const m = bangMauTronGoi();
    const t = m.trang.find(x => x.ten === '6_PHAN_CONG');
    const iSt = t.cot.findIndex(c => c.ten === 'So_tiet');
    t.hang[0][iSt] = 40;                                      /* dồn tiết cho một người */
    const dl = duLieuTuTronGoi(nhuXLSX(m));
    kt('Giáo viên vượt định mức là CẢNH BÁO, không chặn việc nhập',
       dl.soLoi === 0 && dl.canh.some(x => /vượt định mức/.test(x)),
       dl.canh.find(x => /vượt định mức/.test(x)));
  }

  /* ---------- f) So_tiet bỏ trống thì lấy tiết chuẩn theo khối ----------
     Đây là lý do trường "chỉ có bảng phân công, không biết số tiết" vẫn
     nhập được — đúng cái đã làm cho mẫu ma trận. */
  {
    /* ⚠️ Bản đầu của phép thử này chỉ đòi `soTiet > 0` — mà số trong mẫu và
       số chuẩn TÌNH CỜ BẰNG NHAU ở dòng nó chọn, nên nó xanh dù hàm có điền
       đúng hay không. Đúng khuôn cái bẫy đã ghi ở mục 3 của CLAUDE.md. Nay
       ép hai nhánh phải ra HAI SỐ KHÁC NHAU, rồi soi từng nhánh. */
    const m0 = bangMauTronGoi();
    const t0 = m0.trang.find(x => x.ten === '6_PHAN_CONG');
    const iSt = t0.cot.findIndex(c => c.ten === 'So_tiet');
    const iMon = t0.cot.findIndex(c => c.ten === 'Mon');
    const iLop = t0.cot.findIndex(c => c.ten === 'Ma_lop');
    const iKhoi = m0.trang.find(x => x.ten === '4_LOP').cot.findIndex(c => c.ten === 'Khoi');
    const iMaLop = m0.trang.find(x => x.ten === '4_LOP').cot.findIndex(c => c.ten === 'Ma_lop');
    const goc = t0.hang.find(h => h[iMon] === 'Toán');
    const khoi = +m0.trang.find(x => x.ten === '4_LOP')
      .hang.find(h => h[iMaLop] === goc[iLop])[iKhoi];
    const chuan = chuanMon('Toán', khoi);
    const rieng = chuan + 2;                 /* số CỐ Ý khác chuẩn */

    const chay = giaTri => {
      const m = bangMauTronGoi();
      const t = m.trang.find(x => x.ten === '6_PHAN_CONG');
      t.hang.find(h => h[iMon] === 'Toán' && h[iLop] === goc[iLop])[iSt] = giaTri;
      const dl = duLieuTuTronGoi(nhuXLSX(m));
      return { dl, p: dl.phanCong.find(p => p.lopId === goc[iLop] && p.mon === 'Toán') };
    };

    kt('Hai nhánh ra hai số KHÁC nhau — phép thử dưới đây không xanh nhờ trùng hợp',
       chuan > 0 && rieng !== chuan, `chuẩn ${chuan} · ghi riêng ${rieng}`);

    const a = chay('');
    kt('Bỏ trống So_tiet thì máy điền đúng tiết chuẩn CT GDPT 2018 của khối ấy',
       a.dl.soLoi === 0 && a.p?.soTiet === chuan,
       `Toán ${goc[iLop]} (khối ${khoi}): ${a.p?.soTiet} tiết, chuẩn ${chuan}`);

    const b = chay(rieng);
    kt('Ghi số tiết riêng thì máy TÔN TRỌNG số ấy, không đè bằng chuẩn',
       b.dl.soLoi === 0 && b.p?.soTiet === rieng, `${b.p?.soTiet} tiết`);
  }
  {
    const m = bangMauTronGoi();
    const t = m.trang.find(x => x.ten === '6_PHAN_CONG');
    const iSt = t.cot.findIndex(c => c.ten === 'So_tiet');
    const iMon = t.cot.findIndex(c => c.ten === 'Mon');
    t.hang[0][iMon] = 'Môn tự chọn lạ';
    t.hang[0][iSt] = '';
    const dl = duLieuTuTronGoi(nhuXLSX(m));
    kt('Môn không có tiết chuẩn mà bỏ trống So_tiet thì BỊ CHẶN, nói rõ phải ghi số',
       dl.loi.some(x => /ghi rõ số tiết/.test(x)), dl.loi.find(x => /ghi rõ số tiết/.test(x)));
  }

  /* ---------- g) Đường lui: tên trang tính CŨ vẫn đọc được ----------
     Trường đã điền tệp theo mẫu 3 trang thì không được bỗng hỏng. */
  {
    const m = bangMauTronGoi();
    const doc = nhuXLSX(m);
    const cu = {
      DANH_SACH_GV: doc('5_GIAO_VIEN'), DANH_SACH_LOP: doc('4_LOP'),
      PCGD: doc('6_PHAN_CONG'), '1_TRUONG': doc('1_TRUONG'),
      DIEM_TRUONG: doc('2_DIEM_TRUONG'), KHUNG_GIO: doc('3_KHUNG_GIO')
    };
    const docCu = n => cu[n] || null;
    kt('docTrang() lùi được về tên trang tính cũ',
       docTrang(docCu, '5_GIAO_VIEN') === cu.DANH_SACH_GV &&
       docTrang(docCu, '6_PHAN_CONG') === cu.PCGD);
    const dl = duLieuTuTronGoi(docCu);
    kt('Tệp mang tên trang tính cũ vẫn nhập trọn vẹn, không lỗi nào',
       dl.soLoi === 0 && dl.lop.length === S.lop.length, `${dl.soLoi} lỗi`);
  }

  /* ---------- h) Trang tuỳ chọn bỏ trống vẫn nhập được ---------- */
  {
    const m = bangMauTronGoi();
    const doc = nhuXLSX(m);
    const bo = new Set(['7_PHONG', '8_BUOI_BAN']);
    const dl = duLieuTuTronGoi(n => (bo.has(n) ? null : doc(n)));
    kt('Bỏ trống hai trang tuỳ chọn thì vẫn nhập được',
       dl.soLoi === 0 && dl.phong.length === 0 && Object.keys(dl.gvNghi).length === 0);
  }
  {
    const m = bangMauTronGoi();
    const doc = nhuXLSX(m);
    const dl = duLieuTuTronGoi(n => (n === '6_PHAN_CONG' ? null : doc(n)));
    kt('Thiếu trang BẮT BUỘC thì nói rõ tên trang ấy',
       dl.loi.some(x => /Trang 6_PHAN_CONG không có dòng nào/.test(x)),
       dl.loi[0]);
  }

  /* ---------- i) Một điểm trường: cột Diem_truong bỏ trống được ---------- */
  {
    const m = bangMauTronGoi();
    const tD = m.trang.find(x => x.ten === '2_DIEM_TRUONG');
    tD.hang = [['Điểm trường chính', 'Có']];
    const tL = m.trang.find(x => x.ten === '4_LOP');
    const iDT = tL.cot.findIndex(c => c.ten === 'Diem_truong');
    tL.hang.forEach(h => { h[iDT] = ''; });
    const dl = duLieuTuTronGoi(nhuXLSX(m));
    kt('Trường một điểm bỏ trống cột Diem_truong thì máy tự điền tên duy nhất',
       dl.soLoi === 0 && dl.diemTruong.length === 1 &&
       Object.keys(dl.lopDT).length === dl.lop.length,
       `${dl.diemTruong.length} điểm trường`);
  }

  /* ---------- k) Cờ phòng Tin của trang 2 đi vào dữ liệu ---------- */
  {
    const m = bangMauTronGoi();
    const tD = m.trang.find(x => x.ten === '2_DIEM_TRUONG');
    tD.hang = tD.hang.map(h => [h[0], 'Không']);
    const dl = duLieuTuTronGoi(nhuXLSX(m));
    kt('Co_phong_tin = Không đi đúng vào điểm trường, không bị nuốt mất',
       dl.soLoi === 0 && dl.diemTruong.every(d => d.phongTin === false));
  }
}
