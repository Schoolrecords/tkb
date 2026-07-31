-- ============================================================
-- CÔNG BỐ NGAY PHIÊN BẢN MỚI NHẤT
-- ------------------------------------------------------------
-- Dùng khi nút "Công bố cho giáo viên" trong phần mềm chưa dùng được.
-- Bật cong_bo cho bản mới nhất, tắt tất cả các bản còn lại.
--
-- Dán cả file vào SQL Editor, bấm Run. Chạy lại nhiều lần không sao.
-- ============================================================

update tkb_phien_ban p
set cong_bo = (p.version = m.moi_nhat)
from truong t,
     lateral (select max(version) as moi_nhat
              from tkb_phien_ban x where x.truong_id = t.id) m
where t.ma_truong = 'THDL'      -- >>> mã trường
  and p.truong_id = t.id;

-- ---------- Kiểm tra ----------
-- Phải có ĐÚNG MỘT dòng cong_bo = true, và đó là version cao nhất.
select version,
       cong_bo,
       to_char(tao_luc, 'HH24:MI DD/MM') as luu_luc,
       (select count(*) from jsonb_object_keys(du_lieu -> 'tkb')) as so_lop_trong_ban,
       ghi_chu
from tkb_phien_ban
where truong_id = (select id from truong where ma_truong = 'THDL')
order by version desc;

-- ============================================================
-- SAU KHI CHẠY
-- ------------------------------------------------------------
-- Giáo viên đăng nhập là thấy lịch ngay, không phải chờ gì.
-- Ai đang mở sẵn trang thì bấm F5 để tải lại.
-- ============================================================
