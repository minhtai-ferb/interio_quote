import { getTemplates } from "@/lib/queries/template.queries";
import { createQuoteAction } from "@/actions/quote.actions";
import { COLORS, trieu } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const templates = await getTemplates();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(28px,4vw,56px) clamp(16px,3vw,36px) 90px" }}>
      <div style={{ fontSize: "clamp(26px,3.2vw,38px)", fontWeight: 600, marginBottom: 38 }}>
        Tạo báo giá mới
      </div>
      <form action={createQuoteAction} style={{ background: "#fff", border: `1px solid ${COLORS.border}` }}>
        <div style={{ padding: "26px clamp(18px,3vw,32px)", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.navy, fontWeight: 700, marginBottom: 20 }}>
            Thông tin khách hàng
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 18 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
                Tên khách hàng
              </span>
              <input name="customerName" required placeholder="Nguyễn Văn A" style={{ height: 42, padding: "0 12px", border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
                Số điện thoại
              </span>
              <input name="customerPhone" placeholder="0912 345 678" style={{ height: 42, padding: "0 12px", border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
                Email
              </span>
              <input type="email" name="customerEmail" placeholder="vana@email.com" style={{ height: 42, padding: "0 12px", border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
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
              <select name="projectType" defaultValue="Căn hộ" style={{ height: 42, padding: "0 10px", border: `1px solid ${COLORS.border}`, fontSize: 14, background: "#fff" }}>
                <option>Căn hộ</option>
                <option>Nhà phố</option>
                <option>Biệt thự</option>
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
                Diện tích (m²)
              </span>
              <input type="number" name="areaM2" min={0} step={0.1} placeholder="75" style={{ height: 42, padding: "0 12px", border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 7, gridColumn: "1/-1" }}>
              <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
                Ghi chú
              </span>
              <input name="note" placeholder="Gia đình 3 người, ưu tiên phòng khách và bếp." style={{ height: 42, padding: "0 12px", border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
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
                  style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", padding: "18px 4px", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer" }}
                >
                  <input type="radio" name="templateId" value={t.id} defaultChecked={i === 0} required style={{ width: 16, height: 16 }} />
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
          <button
            type="submit"
            disabled={templates.length === 0}
            style={{ marginTop: 26, minHeight: 46, padding: "13px 20px", background: COLORS.navy, color: "#fff", border: 0, cursor: "pointer", fontSize: 13.5, fontWeight: 600, opacity: templates.length === 0 ? 0.5 : 1 }}
          >
            Tạo báo giá
          </button>
        </div>
      </form>
    </div>
  );
}
