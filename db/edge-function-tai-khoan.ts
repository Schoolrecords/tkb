// ============================================================
// Edge Function: tai-khoan
// Quản trị TẠO / ĐẶT LẠI MẬT KHẨU / XOÁ tài khoản trong trường mình.
// ------------------------------------------------------------
// VÌ SAO PHẢI LÀ EDGE FUNCTION
//   Tạo tài khoản đăng nhập cần khoá `service_role` — khoá bỏ qua mọi
//   hàng rào bảo mật. Khoá đó TUYỆT ĐỐI không được nằm trong trình duyệt.
//   Nên việc này chạy trên máy chủ của Supabase: trình duyệt gửi vé đăng
//   nhập của mình lên, hàm kiểm tra người gọi có phải quản trị không, rồi
//   mới dùng khoá bí mật để thao tác. Khoá không bao giờ rời máy chủ.
//
// CÁCH CÀI (làm một lần)
//   1. Supabase → Edge Functions → Deploy a new function
//   2. Đặt tên đúng là:  tai-khoan
//   3. Dán toàn bộ file này vào, bấm Deploy
//   Ba biến SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
//   được Supabase tự cấp sẵn — không phải khai báo gì thêm.
// ============================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const traLoi = (ma: number, than: unknown) =>
  new Response(JSON.stringify(than), { status: ma, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1. Xác thực người gọi bằng chính vé đăng nhập của họ
    const ve = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    if (!ve) return traLoi(401, { loi: "Thiếu vé đăng nhập." });
    const { data: u } = await createClient(URL, ANON).auth.getUser(ve);
    const uid = u?.user?.id;
    if (!uid) return traLoi(401, { loi: "Phiên đăng nhập đã hết hạn. Đăng nhập lại rồi thử tiếp." });

    // 2. Khoá bí mật chỉ dùng ở đây, sau khi đã biết người gọi là ai
    const quanTri = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: toi } = await quanTri.from("nguoi_dung")
      .select("truong_id, vai_tro, ho_ten").eq("id", uid).maybeSingle();
    if (!toi) return traLoi(403, { loi: "Tài khoản chưa gắn vào trường nào." });
    if (!["quan_tri", "hieu_truong"].includes(toi.vai_tro))
      return traLoi(403, { loi: "Chỉ quản trị và hiệu trưởng mới quản lý được tài khoản." });
    const truong = toi.truong_id;

    const than = await req.json().catch(() => ({} as any));
    const viec = than.viec;

    // Chốt chặn xuyên suốt: chỉ đụng được vào người CÙNG TRƯỜNG.
    // Đây là thứ giữ cho trường A không bao giờ chạm được tài khoản trường B.
    const cungTruong = async (id: string) => {
      if (!id) return false;
      const { data } = await quanTri.from("nguoi_dung")
        .select("truong_id").eq("id", id).maybeSingle();
      return data?.truong_id === truong;
    };

    // ---------- Liệt kê thành viên ----------
    if (viec === "liet_ke") {
      const { data: ds } = await quanTri.from("nguoi_dung")
        .select("id, ho_ten, email, vai_tro, diem_truong_id").eq("truong_id", truong);
      return traLoi(200, { data: ds || [] });
    }

    // ---------- Tạo tài khoản mới ----------
    if (viec === "tao") {
      const email = String(than.email || "").trim().toLowerCase();
      const matKhau = String(than.mat_khau || "");
      const hoTen = String(than.ho_ten || "").trim();
      const vaiTro = String(than.vai_tro || "giao_vien");
      if (!email || !matKhau || !hoTen) return traLoi(400, { loi: "Thiếu email, mật khẩu hoặc họ tên." });
      if (matKhau.length < 6) return traLoi(400, { loi: "Mật khẩu cần ít nhất 6 ký tự." });
      if (!["quan_tri", "hieu_truong", "pho_hieu_truong", "giao_vien"].includes(vaiTro))
        return traLoi(400, { loi: "Vai trò không hợp lệ." });

      // ------------------------------------------------------------
      // HAI CHẾ ĐỘ, CỐ Ý KHÁC NHAU
      //
      //   Giáo viên  — chỉ VÀO XEM lịch của mình, không sửa được gì.
      //                Bỏ qua xác minh email: quản trị đưa email và mật
      //                khẩu, thầy cô gõ vào là vào. Không phải mở hộp thư,
      //                không phải bấm liên kết. Nhiều thầy cô còn không
      //                nhớ mật khẩu gmail của mình.
      //
      //   Hiệu trưởng, phó hiệu trưởng, quản trị — DỰNG VÀ SỬA thời khóa
      //                biểu của cả trường. Bắt buộc xác minh email: phải
      //                mở đúng hộp thư đó, bấm liên kết, rồi mới đăng nhập
      //                được. Quyền càng lớn thì cửa vào càng phải chắc.
      // ------------------------------------------------------------
      const laGiaoVien = vaiTro === "giao_vien";
      let moi: any = null, lienKet: string | null = null;

      if (laGiaoVien) {
        const { data, error } = await quanTri.auth.admin.createUser({
          email, password: matKhau, email_confirm: true,
        });
        if (error || !data?.user)
          return traLoi(400, { loi: /already/i.test(error?.message || "")
            ? "Email này đã có tài khoản." : (error?.message || "Không tạo được tài khoản.") });
        moi = data;
      } else {
        // Tạo kèm liên kết xác minh. Trả liên kết về cho quản trị để gửi
        // qua Zalo hay đọc cho người ta — chạy được cả khi dự án chưa cấu
        // hình máy chủ gửi thư, nên không phụ thuộc chuyện thư có tới hay không.
        const { data, error } = await quanTri.auth.admin.generateLink({
          type: "signup", email, password: matKhau,
        });
        if (error || !data?.user)
          return traLoi(400, { loi: /already/i.test(error?.message || "")
            ? "Email này đã có tài khoản." : (error?.message || "Không tạo được tài khoản.") });
        moi = data;
        lienKet = data.properties?.action_link || null;
      }

      const { error: eHoSo } = await quanTri.from("nguoi_dung").insert({
        id: moi.user.id, truong_id: truong, ho_ten: hoTen, email,
        vai_tro: vaiTro, diem_truong_id: than.diem_truong_id || null,
      });
      if (eHoSo) {
        // Tạo được tài khoản nhưng không gắn được vào trường thì xoá đi,
        // đừng để lại tài khoản mồ côi không ai quản.
        await quanTri.auth.admin.deleteUser(moi.user.id);
        return traLoi(400, { loi: "Không gắn được vào trường: " + eHoSo.message });
      }

      // Nối vào bản ghi giáo viên nếu quản trị chỉ định
      if (than.giao_vien_id)
        await quanTri.from("giao_vien").update({ nguoi_dung_id: moi.user.id })
          .eq("id", than.giao_vien_id).eq("truong_id", truong);

      return traLoi(200, {
        ok: true, id: moi.user.id, can_xac_minh: !laGiaoVien, lien_ket: lienKet,
        thong_bao: laGiaoVien
          ? `Đã tạo tài khoản cho ${hoTen}. Đưa email và mật khẩu là thầy cô dùng được ngay.`
          : `Đã tạo tài khoản cho ${hoTen}. Người này phải xác minh email trước khi đăng nhập.`,
      });
    }

    // ---------- Đặt lại mật khẩu ----------
    if (viec === "doi_mat_khau") {
      const id = String(than.id || "");
      const matKhau = String(than.mat_khau || "");
      if (matKhau.length < 6) return traLoi(400, { loi: "Mật khẩu cần ít nhất 6 ký tự." });
      if (!(await cungTruong(id))) return traLoi(403, { loi: "Tài khoản này không thuộc trường của thầy cô." });
      const { error } = await quanTri.auth.admin.updateUserById(id, { password: matKhau });
      if (error) return traLoi(400, { loi: error.message });
      return traLoi(200, { ok: true, thong_bao: "Đã đặt lại mật khẩu." });
    }

    // ---------- Xoá tài khoản ----------
    if (viec === "xoa") {
      const id = String(than.id || "");
      if (id === uid) return traLoi(400, { loi: "Không tự xoá tài khoản của chính mình được." });
      if (!(await cungTruong(id))) return traLoi(403, { loi: "Tài khoản này không thuộc trường của thầy cô." });
      await quanTri.from("giao_vien").update({ nguoi_dung_id: null }).eq("nguoi_dung_id", id);
      await quanTri.from("nguoi_dung").delete().eq("id", id);
      const { error } = await quanTri.auth.admin.deleteUser(id);
      if (error) return traLoi(400, { loi: error.message });
      return traLoi(200, { ok: true, thong_bao: "Đã xoá tài khoản." });
    }

    return traLoi(400, { loi: "Không rõ yêu cầu: " + viec });
  } catch (e) {
    return traLoi(500, { loi: String((e as Error)?.message || e) });
  }
});
