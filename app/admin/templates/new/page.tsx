import { createTemplateAction } from "@/actions/template.actions";
import { COLORS } from "@/lib/theme";

export default function NewTemplatePage() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "clamp(28px,4vw,56px) clamp(16px,3vw,36px) 90px" }}>
      <div style={{ fontSize: "clamp(26px,3.2vw,38px)", fontWeight: 600, marginBottom: 30 }}>
        Tạo Template mới
      </div>
      <form action={createTemplateAction} style={{ background: "#fff", border: `1px solid ${COLORS.border}`, padding: "26px clamp(18px,3vw,32px)" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
          <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
            Tên template
          </span>
          <input
            name="name"
            required
            placeholder="Căn hộ 2PN – Modern"
            style={{ height: 42, padding: "0 12px", border: `1px solid ${COLORS.border}`, fontSize: 14 }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 24 }}>
          <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
            Mô tả (tùy chọn)
          </span>
          <textarea
            name="description"
            rows={3}
            style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, fontSize: 14, fontFamily: "inherit" }}
          />
        </label>
        <button
          type="submit"
          style={{
            minHeight: 46,
            padding: "13px 20px",
            background: COLORS.navy,
            color: "#fff",
            border: 0,
            cursor: "pointer",
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          Tạo Template
        </button>
      </form>
    </div>
  );
}
