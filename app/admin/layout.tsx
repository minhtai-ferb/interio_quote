import Link from "next/link";
import { cookies } from "next/headers";
import { COLORS } from "@/lib/theme";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { logoutAction } from "@/actions/auth.actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const email = session?.email ?? "";
  const initials = email ? email.slice(0, 2).toUpperCase() : "NV";

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          height: 60,
          padding: "0 clamp(16px,3vw,36px)",
          background: "#fff",
          borderBottom: `1px solid ${COLORS.border}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            flex: "none",
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: COLORS.navy,
            whiteSpace: "nowrap",
          }}
        >
          Nội Thất
        </div>
        <nav style={{ display: "flex", flex: "none", gap: 2 }}>
          <Link
            href="/admin/quotes"
            style={{
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.text,
              whiteSpace: "nowrap",
            }}
          >
            Báo giá
          </Link>
          <Link
            href="/admin/templates"
            style={{
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.text,
              whiteSpace: "nowrap",
            }}
          >
            Templates
          </Link>
        </nav>
        <div style={{ flex: "1 0 auto", minWidth: 12 }} />
        <div style={{ display: "flex", flex: "none", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              flex: "none",
              background: COLORS.navyTint,
              color: COLORS.navy,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
          <span style={{ fontSize: 12.5, color: COLORS.muted, whiteSpace: "nowrap" }}>
            {email || "Nhân viên tư vấn"}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              style={{
                flex: "none",
                whiteSpace: "nowrap",
                minHeight: 30,
                padding: "0 10px",
                background: "#fff",
                border: `1px solid ${COLORS.border}`,
                color: COLORS.muted,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Đăng xuất
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
