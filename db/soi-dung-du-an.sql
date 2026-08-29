-- Kiểm nhanh: đang đứng ở cơ sở dữ liệu nào, và nó có bảng của phần mềm không.
select current_database()                                  as csdl,
       current_schema()                                    as luoc_do,
       (select count(*) from information_schema.tables
         where table_schema = 'public')                    as so_bang_public,
       to_regclass('public.tkb_phien_ban') is not null     as co_bang_tkb,
       to_regclass('public.truong')        is not null     as co_bang_truong;

-- Danh sách bảng đang có (đúng dự án thì phải thấy: truong, lop, giao_vien,
-- phan_cong, tkb_phien_ban, nhat_ky, day_thay, bao_nghi, …)
select table_name
from information_schema.tables
where table_schema = 'public' and table_type = 'BASE TABLE'
order by table_name;
