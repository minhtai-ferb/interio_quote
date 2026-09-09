import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getQuoteById } from "@/lib/queries/quote.queries";
import { finalizeQuoteFormAction } from "@/actions/quote.actions";
import { MoneyInput } from "@/components/money-input";
import { COLORS, trieu } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function FinalizeQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuoteById(id);
  if (!quote) notFound();
  if (quote.status === "FINALIZED") redirect(`/admin/quotes/${id}/pdf`);
  if (quote.status === "DRAFT") redirect(`/admin/quotes/${id}`);

  const roomIds = quote.rooms.map((r) => r.id);
  const action = finalizeQuoteFormAction.bind(null, quote.id, roomIds);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "clamp(28px,4vw,56px) clamp(16px,3vw,36px) 100px" }}>
      <Link href={`/admin/quotes/${quote.id}`} style={{ display: "inline-block", marginBottom: 20, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
        ← {quote.code}
      </Link>
      <div style={{ fontSize: "clamp(26px,3.2vw,38px)", fontWeight: 600, marginBottom: 8 }}>
        Chốt báo giá — {quote.customer.name}
      </div>
      <div style={{ fontSize: 13.5, color: COLORS.muted, marginBottom: 36 }}>
        Xác nhận phương án cuối cùng cho từng khu vực, nhập giá chính xác, áp dụng chiết khấu nếu có, sau đó chốt báo giá.
        {quote.status === "CUSTOMER_SUBMITTED"
          ? " Lựa chọn của khách hàng đã được đánh dấu bên dưới."
          : " Khách hàng chưa gửi lựa chọn — vui lòng chọn phương án cho từng khu vực."}
      </div>

      <form action={action}>
        {quote.rooms.map((room) => (
          <div key={room.id} style={{ marginBottom: 34 }}>
            <div style={{ fontSize: "clamp(19px,2.2vw,24px)", fontWeight: 600, borderBottom: `2px solid ${COLORS.text}`, paddingBottom: 10, marginBottom: 14 }}>
              {room.name}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {room.options.map((option) => {
                const isCustomerPick = option.id === room.selectedOptionId;
                const midpoint = Math.round((option.priceFrom + option.priceTo) / 2 / 100000) * 100000;
                return (
                  <label
                    key={option.id}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
                      border: `1px solid ${isCustomerPick ? COLORS.navy : COLORS.border}`,
                      background: isCustomerPick ? COLORS.navyTint : "#fff", cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio" name={`option_${room.id}`} value={option.id}
                      defaultChecked={isCustomerPick || (!room.selectedOptionId && option.sortOrder === 0)}
                      required style={{ marginTop: 3, width: 16, height: 16 }}
                    />
                    <span style={{ flex: 1 }}>
                      <span style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>
                          {option.name} {isCustomerPick && <span style={{ color: COLORS.navy }}>— khách đã chọn</span>}
                        </span>
                        <span style={{ fontSize: 13, whiteSpace: "nowrap" }}>{trieu(option.priceFrom)} – {trieu(option.priceTo)}</span>
                      </span>
                      {option.description && (
                        <span style={{ display: "block", fontSize: 12.5, color: COLORS.muted, marginTop: 4 }}>{option.description}</span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                        <span style={{ fontSize: 11.5, color: COLORS.muted }}>Giá chốt cho khu vực này (đ)</span>
                        <MoneyInput
                          name={`price_${room.id}`}
                          defaultValue={isCustomerPick ? room.selectedFinalPrice ?? midpoint : midpoint}
                          style={{ width: 160, height: 32, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 12.5, textAlign: "right" }}
                        />
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18, background: "#fff", border: `1px solid ${COLORS.border}`, padding: "22px clamp(18px,3vw,32px)", marginTop: 20 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
              Chiết khấu (đ)
            </span>
            <MoneyInput name="discountAmount" defaultValue={quote.discountAmount || 0} style={{ height: 42, padding: "0 12px", border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 7, gridColumn: "1/-1" }}>
            <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
              Ghi chú nội bộ
            </span>
            <textarea name="staffNote" defaultValue={quote.staffNote ?? ""} rows={3} style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, fontSize: 14, fontFamily: "inherit" }} />
          </label>
        </div>

        <button
          type="submit"
          style={{ marginTop: 26, minHeight: 50, padding: "14px 22px", background: COLORS.navy, color: "#fff", border: 0, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
        >
          Chốt báo giá &amp; xuất PDF
        </button>
      </form>
    </div>
  );
}
