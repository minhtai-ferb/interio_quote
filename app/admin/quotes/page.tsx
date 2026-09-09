import Link from "next/link";
import { getQuotes } from "@/lib/queries/quote.queries";
import { COLORS, STATUS_LABEL, statusColors, trieu } from "@/lib/theme";
import type { QuoteStatus } from "@/types/quote";

export const dynamic = "force-dynamic";

const FILTERS: { label: string; value: QuoteStatus | "" }[] = [
  { label: "Tất cả", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Đang tư vấn", value: "CONSULTING" },
  { label: "Khách đã gửi", value: "CUSTOMER_SUBMITTED" },
  { label: "Đã chốt", value: "FINALIZED" },
];

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const status = (sp.status as QuoteStatus | undefined) || undefined;
  const quotes = await getQuotes({ status, search: sp.q });

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(28px,4vw,56px) clamp(16px,3vw,36px) 90px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-end", justifyContent: "space-between", marginBottom: 30 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 10 }}>
            Dashboard
          </div>
          <div style={{ fontSize: "clamp(28px,3.4vw,40px)", fontWeight: 600, lineHeight: 1.05 }}>Báo giá</div>
          <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 8 }}>
            Quản lý và theo dõi các báo giá khách hàng.
          </div>
        </div>
        <Link
          href="/admin/quotes/new"
          style={{ flex: "none", whiteSpace: "nowrap", display: "inline-block", minHeight: 44, padding: "12px 18px", background: COLORS.navy, color: "#fff", fontSize: 13.5, fontWeight: 600, lineHeight: "20px" }}
        >
          + Tạo báo giá mới
        </Link>
      </div>

      <form style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", paddingBottom: 16, borderBottom: `2px solid ${COLORS.text}` }}>
        <input
          type="text" name="q" defaultValue={sp.q ?? ""} placeholder="Tìm theo tên khách hàng…"
          style={{ flex: "1 1 240px", height: 38, padding: "0 12px", border: `1px solid ${COLORS.border}`, background: "#fff", fontSize: 13 }}
        />
        <div style={{ display: "flex", maxWidth: "100%", overflowX: "auto" }}>
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value ? `/admin/quotes?status=${f.value}` : "/admin/quotes"}
              style={{
                minHeight: 38, whiteSpace: "nowrap", display: "flex", alignItems: "center", padding: "0 14px",
                border: `1px solid ${COLORS.border}`, borderRight: 0,
                background: (status ?? "") === f.value ? COLORS.navy : "#fff",
                color: (status ?? "") === f.value ? "#fff" : COLORS.muted,
                fontSize: 11.5, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase",
              }}
            >
              {f.label}
            </Link>
          ))}
          <div style={{ width: 1, background: COLORS.border }} />
        </div>
        <button type="submit" style={{ minHeight: 38, padding: "0 14px", background: "#fff", border: `1px solid ${COLORS.border}`, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
          Tìm
        </button>
      </form>

      {quotes.length === 0 ? (
        <div style={{ padding: "60px 0", fontSize: 14, color: COLORS.muted }}>
          Không có báo giá nào khớp với bộ lọc hiện tại.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", background: "#fff" }}>
          {quotes.map((q) => {
            const c = statusColors(q.status);
            return (
              <Link
                key={q.id}
                href={`/admin/quotes/${q.id}`}
                className="iq-grid-stack"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(170px,1.5fr) minmax(130px,1.1fr) minmax(140px,1fr) minmax(170px,auto)",
                  gap: 18, alignItems: "center", textAlign: "left", padding: "20px 22px",
                  borderBottom: `1px solid ${COLORS.border}`, background: "#fff", color: COLORS.text,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, letterSpacing: ".14em", color: COLORS.muted, marginBottom: 5 }}>{q.code}</div>
                  <div style={{ fontSize: 16.5, fontWeight: 600 }}>{q.customerName}</div>
                </div>
                <div style={{ fontSize: 13.5, color: COLORS.muted }}>
                  {[q.projectType, q.areaM2 ? `${q.areaM2}m²` : null].filter(Boolean).join(" • ")}
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {q.priceFrom || q.priceTo ? `${trieu(q.priceFrom)} – ${trieu(q.priceTo)}` : "—"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 12, color: COLORS.muted, whiteSpace: "nowrap" }}>
                    {new Date(q.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", flex: "none", whiteSpace: "nowrap",
                      padding: "5px 10px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
                      background: c.bg, color: c.fg, border: `1px solid ${c.bd}`,
                    }}
                  >
                    {STATUS_LABEL[q.status]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
