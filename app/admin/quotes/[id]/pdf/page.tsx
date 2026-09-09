import { notFound } from "next/navigation";
import { getQuoteById } from "@/lib/queries/quote.queries";
import { COLORS, trieu, vnd } from "@/lib/theme";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";

export default async function QuotePdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuoteById(id);
  if (!quote) notFound();

  const isFinal = quote.status === "FINALIZED";
  const rows = quote.rooms.map((room) => {
    const selected = room.options.find((o) => o.id === room.selectedOptionId) ?? room.options[0] ?? null;
    const price = isFinal ? room.selectedFinalPrice ?? 0 : null;
    return { room, option: selected, price };
  });
  const grandTotal =
    quote.finalTotal ??
    rows.reduce((a, r) => a + (r.price ?? Math.round(((r.option?.priceFrom ?? 0) + (r.option?.priceTo ?? 0)) / 2)), 0) -
      (isFinal ? 0 : quote.discountAmount);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 100px", background: "#fff" }}>
      <style>{`@media print { .no-print { display: none !important; } body { background: #fff; } }`}</style>
      <div className="no-print" style={{ marginBottom: 24 }}>
        <PrintButton />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2px solid ${COLORS.text}`, paddingBottom: 20, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.navy }}>
            Nội Thất Studio
          </div>
          <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 6 }}>Tư vấn &amp; báo giá nội thất</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>BÁO GIÁ</div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{quote.code}</div>
          <div style={{ fontSize: 12, color: COLORS.muted }}>
            {isFinal && quote.finalizedAt
              ? new Date(quote.finalizedAt).toLocaleDateString("vi-VN")
              : new Date(quote.createdAt).toLocaleDateString("vi-VN")}
          </div>
        </div>
      </div>

      <div className="iq-grid-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 30 }}>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 8 }}>
            Khách hàng
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{quote.customer.name}</div>
          {quote.customer.phone && <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{quote.customer.phone}</div>}
          {quote.customer.email && <div style={{ fontSize: 13, color: COLORS.muted }}>{quote.customer.email}</div>}
        </div>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 8 }}>
            Công trình
          </div>
          <div style={{ fontSize: 13.5 }}>
            {[quote.projectType, quote.areaM2 ? `${quote.areaM2}m²` : null].filter(Boolean).join(" • ") || "—"}
          </div>
          {quote.note && <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 4 }}>{quote.note}</div>}
        </div>
      </div>

      {rows.map(({ room, option }) => (
        <div key={room.id} style={{ marginBottom: 26, breakInside: "avoid" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `2px solid ${COLORS.navy}`, paddingBottom: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{room.name}</div>
            {option && <div style={{ fontSize: 12, color: COLORS.muted }}>{option.name}</div>}
          </div>
          {!option ? (
            <div style={{ fontSize: 13, color: COLORS.muted }}>Chưa có phương án.</div>
          ) : (
            <>
              {option.images.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {option.images.slice(0, 4).map((img) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={img.id} src={img.imageUrl} alt="" style={{ width: 120, height: 88, objectFit: "cover" }} />
                  ))}
                </div>
              )}
              {option.description && <div style={{ fontSize: 12.5, marginBottom: 10 }}>{option.description}</div>}
              {option.items.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <tbody>
                    {option.items.map((it) => (
                      <tr key={it.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <td style={{ padding: "6px 0" }}>{it.name}</td>
                        <td style={{ padding: "6px 0", color: COLORS.muted }}>{it.spec ?? ""}</td>
                        <td style={{ padding: "6px 0", textAlign: "right", whiteSpace: "nowrap" }}>
                          {it.price != null ? vnd(it.price) : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, fontWeight: 600 }}>
                <span>Tạm tính {room.name}</span>
                <span>
                  {isFinal && room.selectedFinalPrice != null
                    ? vnd(room.selectedFinalPrice)
                    : `${trieu(option.priceFrom)} – ${trieu(option.priceTo)}`}
                </span>
              </div>
            </>
          )}
        </div>
      ))}

      <div style={{ borderTop: `2px solid ${COLORS.text}`, paddingTop: 16, marginTop: 20 }}>
        {quote.discountAmount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
            <span>Chiết khấu</span>
            <span>− {vnd(quote.discountAmount)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 700, color: COLORS.navy }}>
          <span>Tổng cộng</span>
          <span>{isFinal ? vnd(grandTotal) : `Dự kiến ${vnd(grandTotal)}`}</span>
        </div>
        {quote.staffNote && (
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 14 }}>
            <strong>Ghi chú:</strong> {quote.staffNote}
          </div>
        )}
        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 16, lineHeight: 1.6 }}>
          Mức giá trên mang tính chất tham khảo và có thể thay đổi tùy theo kích thước thực tế, vật liệu và yêu cầu cụ thể.
        </div>
      </div>
    </div>
  );
}
