import { notFound } from "next/navigation";
import { getQuoteByPublicToken } from "@/lib/queries/quote.queries";
import { CustomerSelectionForm } from "@/components/customer-selection-form";
import { COLORS, vnd } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function CustomerQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quote = await getQuoteByPublicToken(token);
  if (!quote) notFound();

  if (quote.status === "DRAFT") {
    return (
      <CenteredMessage
        title="Báo giá chưa sẵn sàng"
        body="Nhân viên tư vấn đang chuẩn bị báo giá của bạn. Vui lòng quay lại sau hoặc liên hệ trực tiếp."
      />
    );
  }

  if (quote.status === "FINALIZED") {
    const total = quote.finalTotal ?? 0;
    return (
      <div style={{ background: "#fff" }}>
        <Header customerName={quote.customer.name} projectType={quote.projectType} areaM2={quote.areaM2} />
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "clamp(40px,6vw,80px) clamp(18px,5vw,40px) 100px" }}>
          <div style={{ fontSize: "clamp(30px,4.4vw,56px)", fontWeight: 600, lineHeight: 1, marginBottom: 20 }}>
            Báo giá đã được chốt
          </div>
          <div style={{ fontSize: 15.5, color: COLORS.muted, marginBottom: 40, maxWidth: "38em" }}>
            Cảm ơn bạn đã lựa chọn Nội Thất Studio. Dưới đây là phương án cuối cùng đã được xác nhận.
          </div>
          {quote.rooms.map((room) => {
            const option = room.options.find((o) => o.id === room.selectedOptionId);
            return (
              <div key={room.id} style={{ borderTop: `2px solid ${COLORS.text}`, padding: "24px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 19, fontWeight: 600 }}>{room.name}</div>
                    <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{option?.name ?? "—"}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, whiteSpace: "nowrap" }}>
                    {room.selectedFinalPrice != null ? vnd(room.selectedFinalPrice) : "—"}
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ borderTop: `2px solid ${COLORS.text}`, borderBottom: `2px solid ${COLORS.text}`, padding: "20px 0", marginTop: 10, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em" }}>Tổng cộng</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: COLORS.navy }}>{vnd(total)}</span>
          </div>
        </div>
      </div>
    );
  }

  const initialSelections: Record<string, string | null> = {};
  for (const room of quote.rooms) initialSelections[room.id] = room.selectedOptionId;

  return (
    <div style={{ background: "#fff" }}>
      <Header customerName={quote.customer.name} projectType={quote.projectType} areaM2={quote.areaM2} />
      <div style={{ padding: "clamp(34px,5vw,66px) clamp(18px,5vw,64px)" }}>
        <div style={{ fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 22 }}>
          Phương án nội thất dành cho bạn
        </div>
        <div style={{ fontSize: 15.5, lineHeight: 1.7, maxWidth: "42em" }}>
          Mỗi khu vực có nhiều mức đầu tư khác nhau. Chọn mức phù hợp cho từng khu vực — ngân sách cập nhật ngay theo lựa chọn của bạn.
        </div>
      </div>
      <CustomerSelectionForm
        token={quote.publicToken}
        rooms={quote.rooms.map((r) => ({ id: r.id, name: r.name, options: r.options }))}
        initialSelections={initialSelections}
        alreadySubmitted={quote.status === "CUSTOMER_SUBMITTED"}
      />
    </div>
  );
}

function Header({
  customerName,
  projectType,
  areaM2,
}: {
  customerName: string;
  projectType: string | null;
  areaM2: number | null;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "20px clamp(18px,5vw,64px)", borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".24em", textTransform: "uppercase", color: COLORS.navy }}>
        Nội Thất Studio
      </div>
      <div style={{ fontSize: 13.5, color: COLORS.muted }}>
        {customerName}
        {(projectType || areaM2) && (
          <span> · {[projectType, areaM2 ? `${areaM2}m²` : null].filter(Boolean).join(" • ")}</span>
        )}
      </div>
    </div>
  );
}

function CenteredMessage({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 12 }}>{title}</div>
        <div style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6 }}>{body}</div>
      </div>
    </div>
  );
}
