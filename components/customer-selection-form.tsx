"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { COLORS, trieu, vnd } from "@/lib/theme";
import { submitCustomerSelectionsAction } from "@/actions/quote.actions";
import { useToast } from "@/components/toast-provider";

export interface SelectionOption {
  id: string;
  name: string;
  priceFrom: number;
  priceTo: number;
  description: string | null;
  images: { id: string; imageUrl: string }[];
  items: { id: string; name: string; spec: string | null; price: number | null }[];
}

export interface SelectionRoom {
  id: string;
  name: string;
  options: SelectionOption[];
}

function midpoint(o: SelectionOption): number {
  return Math.round((o.priceFrom + o.priceTo) / 2 / 100000) * 100000;
}

export function CustomerSelectionForm({
  token,
  rooms,
  initialSelections,
  alreadySubmitted,
}: {
  token: string;
  rooms: SelectionRoom[];
  initialSelections: Record<string, string | null>;
  alreadySubmitted: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selections, setSelections] = useState<Record<string, string | null>>(initialSelections);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(alreadySubmitted);

  const budget = useMemo(() => {
    return rooms.map((room) => {
      const optionId = selections[room.id] ?? room.options[0]?.id ?? null;
      const option = room.options.find((o) => o.id === optionId) ?? null;
      return { room, option, amount: option ? midpoint(option) : 0 };
    });
  }, [rooms, selections]);

  const total = budget.reduce((a, b) => a + b.amount, 0);
  const missing = rooms.filter((r) => !(selections[r.id] ?? r.options[0]?.id) && r.options.length > 0);

  function handleSubmit() {
    setError(null);
    const payload = rooms
      .map((room) => ({ roomId: room.id, optionId: selections[room.id] ?? room.options[0]?.id ?? null }))
      .filter((s): s is { roomId: string; optionId: string } => !!s.optionId);

    startTransition(async () => {
      try {
        await submitCustomerSelectionsAction(token, payload);
        setSubmitted(true);
        showToast("Đã ghi nhận lựa chọn của bạn", "success");
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Gửi lựa chọn thất bại, vui lòng thử lại";
        setError(message);
        showToast(message, "error");
      }
    });
  }

  return (
    <div>
      {submitted && (
        <div style={{ background: COLORS.navyTint, color: COLORS.navy, padding: "16px clamp(18px,5vw,64px)", fontSize: 13.5, fontWeight: 600 }}>
          ✓ Đã ghi nhận lựa chọn của bạn. Bạn có thể tiếp tục thay đổi bên dưới nếu cần — nhân viên tư vấn sẽ liên hệ để hoàn thiện báo giá.
        </div>
      )}

      {rooms.map((room, ri) => (
        <div key={room.id} style={{ borderTop: `2px solid ${COLORS.text}`, padding: "clamp(28px,4vw,56px) clamp(18px,5vw,64px)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 12, letterSpacing: ".2em", color: COLORS.muted }}>{"0" + (ri + 1)}</span>
            <span style={{ fontSize: "clamp(22px,2.6vw,30px)", fontWeight: 600 }}>{room.name}</span>
          </div>

          <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, margin: "0 0 12px" }}>
            Chọn mức đầu tư
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {room.options.map((option) => {
              const active = (selections[room.id] ?? room.options[0]?.id) === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelections((s) => ({ ...s, [room.id]: option.id }))}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12, width: "100%", textAlign: "left",
                    padding: "14px 16px", border: `1px solid ${active ? COLORS.navy : COLORS.border}`,
                    background: active ? COLORS.navyTint : "#fff", color: COLORS.text, cursor: "pointer",
                  }}
                >
                  <span style={{ width: 18, height: 18, flex: "none", marginTop: 2, border: `1px solid ${active ? COLORS.navy : COLORS.border}`, background: active ? COLORS.navy : "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                    {active ? "✓" : ""}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>{option.name}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>{trieu(option.priceFrom)} – {trieu(option.priceTo)}</span>
                    </span>
                    {option.description && (
                      <span style={{ display: "block", fontSize: 12.5, color: COLORS.muted, lineHeight: 1.5, marginTop: 6 }}>{option.description}</span>
                    )}
                    <span style={{ display: "block", fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{option.items.length} hạng mục</span>
                  </span>
                </button>
              );
            })}
          </div>

          {(() => {
            const active = room.options.find((o) => o.id === (selections[room.id] ?? room.options[0]?.id));
            if (!active) return null;
            return (
              <>
                {active.images.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8, marginBottom: 20 }}>
                    {active.images.map((img) => (
                      <div key={img.id} style={{ width: "100%", height: 160, backgroundImage: `url(${img.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 10 }}>
                  Hạng mục bao gồm
                </div>
                <div style={{ borderTop: `2px solid ${COLORS.text}` }}>
                  {active.items.map((it) => (
                    <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "13px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                      <span>
                        <span style={{ display: "block", fontSize: 14, fontWeight: 500 }}>{it.name}</span>
                        {it.spec && <span style={{ display: "block", fontSize: 12.5, color: COLORS.muted, marginTop: 2 }}>{it.spec}</span>}
                      </span>
                      {it.price != null && <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>{vnd(it.price)}</span>}
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      ))}

      <div style={{ borderTop: `2px solid ${COLORS.text}`, padding: "clamp(28px,4vw,56px) clamp(18px,5vw,64px)" }}>
        <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 10 }}>
          Tổng ngân sách dự kiến
        </div>
        <div style={{ fontSize: "clamp(30px,4vw,48px)", fontWeight: 700, color: COLORS.navy, marginBottom: 20 }}>
          {vnd(total)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginBottom: 28 }}>
          {budget.map(({ room, option, amount }) => (
            <div key={room.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}>
              <span>{room.name} <span style={{ color: COLORS.muted }}>— {option?.name ?? "—"}</span></span>
              <span style={{ whiteSpace: "nowrap" }}>{vnd(amount)}</span>
            </div>
          ))}
        </div>
        {error && <div style={{ fontSize: 13, color: "#B42318", marginBottom: 14 }}>{error}</div>}
        {missing.length > 0 && (
          <div style={{ fontSize: 12.5, color: COLORS.muted, marginBottom: 14 }}>
            Vui lòng chọn phương án cho: {missing.map((r) => r.name).join(", ")}
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || missing.length > 0}
          style={{
            minHeight: 54, padding: "16px 26px", background: COLORS.navy, color: "#fff", border: 0,
            cursor: isPending || missing.length > 0 ? "default" : "pointer",
            opacity: isPending || missing.length > 0 ? 0.6 : 1,
            fontSize: 15, fontWeight: 600,
          }}
        >
          {isPending ? "Đang gửi…" : submitted ? "Cập nhật lựa chọn" : "Xác nhận phương án"}
        </button>
      </div>
    </div>
  );
}
