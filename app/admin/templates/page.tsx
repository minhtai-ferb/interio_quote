import Link from "next/link";
import { getTemplates } from "@/lib/queries/template.queries";
import { COLORS, trieu } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "clamp(28px,4vw,56px) clamp(16px,3vw,36px) 90px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 30,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: COLORS.muted,
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            Thư viện
          </div>
          <div style={{ fontSize: "clamp(28px,3.4vw,40px)", fontWeight: 600, lineHeight: 1.05 }}>
            Templates
          </div>
          <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 8 }}>
            Các bộ giải pháp nội thất mẫu — điểm bắt đầu cho mỗi báo giá.
          </div>
        </div>
        <Link
          href="/admin/templates/new"
          style={{
            flex: "none",
            whiteSpace: "nowrap",
            display: "inline-block",
            minHeight: 44,
            padding: "12px 18px",
            background: COLORS.navy,
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 600,
            lineHeight: "20px",
          }}
        >
          + Tạo Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div style={{ padding: "60px 0", fontSize: 14, color: COLORS.muted }}>
          Chưa có template nào. Tạo template đầu tiên để bắt đầu.
        </div>
      ) : (
        <div style={{ borderTop: `2px solid ${COLORS.text}`, background: "#fff" }}>
          {templates.map((t) => (
            <Link
              key={t.id}
              href={`/admin/templates/${t.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "110px minmax(190px,1.6fr) minmax(110px,1fr) minmax(140px,auto)",
                gap: 20,
                alignItems: "center",
                width: "100%",
                textAlign: "left",
                padding: "16px 18px",
                borderBottom: `1px solid ${COLORS.border}`,
                background: "#fff",
                color: COLORS.text,
              }}
            >
              <div
                style={{
                  width: 110,
                  height: 74,
                  background: t.thumbnailUrl ? undefined : COLORS.bg,
                  backgroundImage: t.thumbnailUrl ? `url(${t.thumbnailUrl})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <span>
                <span style={{ display: "block", fontSize: 16.5, fontWeight: 600 }}>
                  {t.name}
                </span>
                <span style={{ display: "block", fontSize: 12.5, color: COLORS.muted, marginTop: 4 }}>
                  {t.roomCount} phòng • {t.optionCount} phương án
                </span>
              </span>
              <span style={{ fontSize: 12.5, color: COLORS.muted }}>
                {t.quoteCount} báo giá
              </span>
              <span
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                {t.priceFrom || t.priceTo
                  ? `${trieu(t.priceFrom)} – ${trieu(t.priceTo)}`
                  : "Chưa có giá"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
