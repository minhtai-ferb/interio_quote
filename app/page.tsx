import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COLORS } from "@/lib/theme";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { loginAction } from "@/actions/auth.actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/") ? sp.next : "/admin/quotes";

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token && (await verifySessionToken(token))) {
    redirect(next);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", minHeight: "100vh" }}>
      <div
        style={{
          flex: "1 1 420px",
          background: COLORS.navy,
          color: "#fff",
          padding: "clamp(40px,6vw,88px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 40,
          minHeight: 340,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" }}>
          Nội Thất<span style={{ opacity: 0.55 }}>&nbsp;/ Studio</span>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", opacity: 0.6, marginBottom: 18 }}>
            Consultation &amp; Quotation
          </div>
          <div style={{ fontSize: "clamp(30px,3.6vw,48px)", lineHeight: 1.08, fontWeight: 600, maxWidth: "16em" }}>
            Xây dựng báo giá nội thất riêng cho từng khách hàng.
          </div>
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.7, opacity: 0.6, maxWidth: "30em" }}>
          Template → Báo giá riêng → Khách chọn từng hạng mục → Chốt &amp; xuất PDF.
        </div>
      </div>
      <div style={{ flex: "1 1 420px", background: "#fff", padding: "clamp(40px,6vw,88px)", display: "flex", alignItems: "center" }}>
        <form action={loginAction} style={{ width: "100%", maxWidth: 360 }}>
          <input type="hidden" name="next" value={next} />
          <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 6 }}>Welcome back</div>
          <div style={{ fontSize: 13.5, color: COLORS.muted, marginBottom: 34 }}>
            Đăng nhập để quản lý báo giá.
          </div>
          {sp.error && (
            <div style={{ padding: "10px 13px", marginBottom: 18, background: "#FEF1F0", border: "1px solid #F3B4AE", color: "#B42318", fontSize: 13 }}>
              Email hoặc mật khẩu không đúng.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <span style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
                Email
              </span>
              <input
                type="email" name="email" required autoComplete="username" placeholder="ban@studio.vn"
                style={{ height: 44, padding: "0 13px", border: `1px solid ${COLORS.border}`, background: "#fff", fontSize: 14, color: COLORS.text }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <span style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
                Password
              </span>
              <input
                type="password" name="password" required autoComplete="current-password"
                style={{ height: 44, padding: "0 13px", border: `1px solid ${COLORS.border}`, background: "#fff", fontSize: 14, color: COLORS.text }}
              />
            </label>
            <button
              type="submit"
              style={{ minHeight: 46, marginTop: 6, background: COLORS.navy, color: "#fff", border: 0, cursor: "pointer", fontSize: 13.5, fontWeight: 600, textAlign: "left", padding: "13px 16px" }}
            >
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
