/* ==================================================================
   SERVICE WORKER — cho giáo viên cài app lên màn hình chính và mở được
   trang khi mạng chập chờn.
   ------------------------------------------------------------------
   Vì sao tệp này đứng riêng: chuẩn web BẮT BUỘC service worker là một
   tệp cùng nguồn, không nhúng vào index.html hay dựng từ Blob được.
   Đây là ngoại lệ có chủ đích của quy ước "một tệp".

   Chiến lược: MẠNG TRƯỚC, kho sau — đơn giản nhất mà an toàn nhất.
   · Còn mạng: luôn lấy bản mới nhất, cất một bản vào kho. Không bao giờ
     có chuyện người dùng kẹt ở bản cũ.
   · Mất mạng: trả bản trong kho — trang vẫn mở, app tự hiện dải cảnh báo
     "đang chạy ngoại tuyến" theo đường lui sẵn có của nó.
   · KHÔNG BAO GIỜ đụng vào Supabase: dữ liệu nhà trường phải luôn tươi,
     trả dữ liệu cũ từ kho còn tệ hơn là báo mất mạng.
   ================================================================== */
const KHO = 'tkb-v1';

/* Những yêu cầu không bao giờ được cache */
function boQua(q) {
  if (q.method !== 'GET') return true;
  const u = new URL(q.url);
  if (u.hostname.endsWith('.supabase.co')) return true;   /* dữ liệu + đăng nhập */
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return true;
  return false;
}

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    /* dọn kho của các phiên bản trước */
    for (const ten of await caches.keys()) if (ten !== KHO) await caches.delete(ten);
    await self.clients.claim();
  })());
});

/* Tài nguyên GHIM PHIÊN BẢN trong địa chỉ thì lấy KHO TRƯỚC (16/8/2026).
   `xlsx@0.18.5` và `exceljs@4.4.0` là những địa chỉ không bao giờ đổi nội
   dung — đổi phiên bản là đổi địa chỉ. Với chúng, "mạng trước" nghĩa là
   tải lại 507 KB mỗi lần thầy cô bấm Xuất Excel, mà chẳng bao giờ nhận
   được thứ gì khác. Phông chữ Google cũng vậy.
   Trang chính (index.html, sw.js, manifest) thì KHÔNG được vào nhóm này:
   ở đó "mạng trước" chính là thứ bảo đảm không ai kẹt lại ở bản cũ. */
function khoTruoc(q) {
  const u = new URL(q.url);
  if (u.hostname === 'cdn.jsdelivr.net' && /@\d+\.\d+\.\d+/.test(u.pathname)) return true;
  if (u.hostname === 'fonts.gstatic.com') return true;
  return false;
}

/* ⚠️ "MẠNG TRƯỚC" CHƯA ĐỦ ĐỂ KHÔNG KẸT Ở BẢN CŨ (vá 31/8/2026).
   `fetch()` của service worker vẫn đi qua bộ nhớ đệm HTTP của trình duyệt,
   mà GitHub Pages trả `Cache-Control: max-age=600` cho trang chính — nên
   sau mỗi lần phát hành, thầy cô mở app trong mười phút kế tiếp vẫn nhận
   đúng bản cũ, không dấu hiệu gì. Chủ dự án đã gặp thật: đẩy bản mới lên
   lúc 14:17, mở trang lúc 14:20 vẫn không thấy tính năng vừa làm.

   Với TRANG CHÍNH và mấy tệp khung (sw.js, manifest) thì hỏi thẳng máy chủ,
   `cache: 'no-store'`. Ba tệp ấy nhỏ và mỗi lần mở app chỉ tải một lần, nên
   không đánh đổi gì đáng kể; mất mạng thì vẫn rơi về kho như cũ. Tài nguyên
   ghim phiên bản (CDN, phông chữ) không đi qua đây — chúng đã lấy kho trước. */
function dungBoNhoDem(q) {
  if (q.mode === 'navigate') return true;
  const u = new URL(q.url);
  if (u.origin !== self.location.origin) return false;
  return /\/(index\.html|sw\.js|manifest\.webmanifest)$|\/$/.test(u.pathname);
}

self.addEventListener('fetch', e => {
  if (boQua(e.request)) return;                            /* để trình duyệt tự lo */
  if (khoTruoc(e.request)) {
    e.respondWith((async () => {
      const cu = await caches.match(e.request);
      if (cu) return cu;
      const moi = await fetch(e.request);
      if (moi && moi.ok) (await caches.open(KHO)).put(e.request, moi.clone());
      return moi;
    })());
    return;
  }
  e.respondWith((async () => {
    try {
      const moi = await fetch(e.request, dungBoNhoDem(e.request) ? {cache: 'no-store'} : undefined);
      /* chỉ cất bản lành lặn; bản lỗi hay opaque của CDN vẫn trả về nhưng
         không đè lên bản tốt đang có trong kho */
      if (moi && moi.ok) {
        const kho = await caches.open(KHO);
        kho.put(e.request, moi.clone());
      }
      return moi;
    } catch (_) {
      const cu = await caches.match(e.request, { ignoreSearch: e.request.mode === 'navigate' });
      if (cu) return cu;
      /* điều hướng mà kho trống thì trả trang chính nếu có */
      if (e.request.mode === 'navigate') {
        const trang = await caches.match('./index.html') || await caches.match('./');
        if (trang) return trang;
      }
      throw _;
    }
  })());
});
