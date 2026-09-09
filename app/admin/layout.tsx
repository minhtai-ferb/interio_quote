import Link from "next/link";
import { COLORS } from "@/lib/theme";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 26,
          height: 60,
          padding: "0 clamp(16px,3vw,36px)",
          background: "#fff",
          borderBottom: `1px solid ${COLORS.border}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
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
        <nav style={{ display: "flex", gap: 2 }}>
          <Link
            href="/admin/quotes"
            style={{
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.text,
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
            }}
          >
            Templates
          </Link>
        </nav>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            NV
          </div>
          <span style={{ fontSize: 12.5, color: COLORS.muted, whiteSpace: "nowrap" }}>
            Nhân viên tư vấn
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
