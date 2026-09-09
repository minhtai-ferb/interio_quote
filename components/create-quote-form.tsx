"use client";

import { useActionState } from "react";
import { createQuoteAction, type CreateQuoteState } from "@/actions/quote.actions";
import { COLORS, trieu } from "@/lib/theme";
import type { TemplateSummary } from "@/types/template";

export function CreateQuoteForm({ templates }: { templates: TemplateSummary[] }) {
  const [state, formAction, isPending] = useActionState<CreateQuoteState, FormData>(
    createQuoteAction,
    undefined
  );

  return (
    <form action={formAction} style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
      <div style={{ padding: "26px clamp(18px,3vw,32px)", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.navy, fontWeight: 700, marginBottom: 20 }}>
          Thông tin khách hàng
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
              Tên khách hàng
            </span>
            <input name="customerName" required disabled={isPending} placeholder="Nguyễn Văn A" style={{ height: 42, padding: "0 12px", border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
              Số điện thoại
            </span>
            <input name="customerPhone" disabled={isPending} placeholder="0912 345 678" style={{ height: 42, padding: "0 12px", border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
              Email
            </span>
            <input type="email" name="customerEmail" disabled={isPending} placeholder="vana@email.com" style={{ height: 42, padding: "0 12px", border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
          </label>
        </div>
      </div>

      <div style={{ padding: "26px clamp(18px,3vw,32px)", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.navy, fontWeight: 700, marginBottom: 20 }}>
          Thông tin công trình
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
              Loại công trình
            </span>
            <select name="projectType" defaultValue="Căn hộ" disabled={isPending} style={{ height: 42, padding: "0 10px", border: `1px solid ${COLORS.border}`, fontSize: 14, background: "#fff" }}>
              <option>Căn hộ</option>
              <option>Nhà phố</option>
              <option>Biệt thự</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
              Diện tích (m²)
            </span>
            <input type="number" name="areaM2" min={0} step={0.1} disabled={isPending} placeholder="75" style={{ height: 42, padding: "0 12px", border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 7, gridColumn: "1/-1" }}>
            <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
              Ghi chú
            </span>
            <input name="note" disabled={isPending} placeholder="Gia đình 3 người, ưu tiên phòng khách và bếp." style={{ height: 42, padding: "0 12px", border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
          </label>
        </div>
      </div>

      <div style={{ padding: "26px clamp(18px,3vw,32px)" }}>
        <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.navy, fontWeight: 700, marginBottom: 20 }}>
          Chọn template
        </div>
        {templates.length === 0 ? (
          <div style={{ fontSize: 13.5, color: COLORS.muted }}>
            Chưa có template nào. Hãy tạo một template trước khi tạo báo giá.
          </div>
        ) : (
          <div style={{ borderTop: `1px solid ${COLORS.border}` }}>
            {templates.map((t, i) => (
              <label
                key={t.id}
                style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", padding: "18px 4px", borderBottom: `1px solid ${COLORS.border}`, cursor: isPending ? "default" : "pointer" }}
              >
                <input type="radio" name="templateId" value={t.id} defaultChecked={i === 0} required disabled={isPending} style={{ width: 16, height: 16 }} />
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 15.5, fontWeight: 600 }}>{t.name}</span>
                  <span style={{ display: "block", fontSize: 12.5, color: COLORS.muted, marginTop: 3 }}>
                    {t.roomCount} phòng • {t.optionCount} phương án
                  </span>
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {t.priceFrom || t.priceTo ? `${trieu(t.priceFrom)} – ${trieu(t.priceTo)}` : "—"}
                </span>
              </label>
            ))}
          </div>
        )}

        {state?.error && (
          <div style={{ marginTop: 20, padding: "12px 14px", background: "#FEF3F2", border: "1px solid #FDA29B", color: "#B42318", fontSize: 13, fontWeight: 500 }}>
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={templates.length === 0 || isPending}
          style={{
            marginTop: 26, minHeight: 46, padding: "13px 20px", background: COLORS.navy, color: "#fff", border: 0,
            cursor: templates.length === 0 || isPending ? "default" : "pointer", fontSize: 13.5, fontWeight: 600,
            opacity: templates.length === 0 || isPending ? 0.6 : 1,
            display: "inline-flex", alignItems: "center", gap: 10,
          }}
        >
          {isPending && (
            <span
              aria-hidden
              style={{
                width: 14, height: 14, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff",
                animation: "iq-spin .7s linear infinite",
              }}
            />
          )}
          {isPending ? "Đang tạo báo giá…" : "Tạo báo giá"}
        </button>
        <style>{`@keyframes iq-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </form>
  );
}
