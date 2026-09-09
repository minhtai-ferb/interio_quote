import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplateById } from "@/lib/queries/template.queries";
import {
  updateTemplateAction,
  deleteTemplateAction,
  createTemplateRoomAction,
  updateTemplateRoomAction,
  deleteTemplateRoomAction,
  createTemplateOptionAction,
  updateTemplateOptionAction,
  deleteTemplateOptionAction,
  addTemplateOptionItemAction,
  updateTemplateOptionItemAction,
  deleteTemplateOptionItemAction,
  addTemplateOptionImageAction,
  deleteTemplateOptionImageAction,
} from "@/actions/template.actions";
import { OptionCard } from "@/components/option-card";
import { ActionForm } from "@/components/action-form";
import { COLORS, trieu } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function TemplateEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ room?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const template = await getTemplateById(id);
  if (!template) notFound();

  const activeRoomId = sp.room ?? template.rooms[0]?.id;
  const activeRoom =
    template.rooms.find((r) => r.id === activeRoomId) ?? template.rooms[0] ?? null;

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(28px,4vw,56px) clamp(16px,3vw,36px) 90px" }}>
      <Link href="/admin/templates" style={{ display: "inline-block", marginBottom: 26, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
        ← Templates
      </Link>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start", justifyContent: "space-between", marginBottom: 30 }}>
        <ActionForm
          action={updateTemplateAction.bind(null, template.id)}
          successMessage="Đã lưu tên template"
          style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}
        >
          <input
            name="name" defaultValue={template.name}
            style={{ fontSize: "clamp(22px,2.8vw,32px)", fontWeight: 600, border: 0, borderBottom: `2px solid ${COLORS.border}`, background: "transparent", padding: "2px 0", minWidth: 260 }}
          />
          <button type="submit" style={{ minHeight: 36, padding: "8px 14px", background: COLORS.navy, color: "#fff", border: 0, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
            Lưu tên
          </button>
        </ActionForm>
        <form action={deleteTemplateAction.bind(null, template.id)}>
          <button type="submit" style={{ minHeight: 36, padding: "8px 14px", background: "#fff", color: "#B42318", border: "1px solid #E4E9EE", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
            Xóa Template
          </button>
        </form>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        <div className="iq-editor-col" style={{ flex: "0 1 260px", minWidth: 220 }}>
          <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 12 }}>
            Khu vực
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 16 }}>
            {template.rooms.map((r) => (
              <Link
                key={r.id}
                href={`/admin/templates/${template.id}?room=${r.id}`}
                style={{
                  display: "block", padding: "11px 12px",
                  borderLeft: `2px solid ${r.id === activeRoomId ? COLORS.navy : "transparent"}`,
                  background: r.id === activeRoomId ? COLORS.navyTint : "transparent",
                  color: COLORS.text,
                }}
              >
                <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{r.name}</span>
                <span style={{ display: "block", fontSize: 11.5, opacity: 0.65, marginTop: 2 }}>
                  {r.options.length} phương án
                </span>
              </Link>
            ))}
          </div>
          <ActionForm
            action={createTemplateRoomAction.bind(null, template.id)}
            successMessage="Đã thêm khu vực"
            style={{ display: "flex", gap: 6 }}
          >
            <input name="name" placeholder="Tên khu vực mới" required style={{ flex: 1, minWidth: 0, height: 36, padding: "0 10px", border: `1px solid ${COLORS.border}`, fontSize: 13 }} />
            <button type="submit" style={{ flex: "none", minHeight: 36, padding: "8px 12px", background: COLORS.navyTint, border: `1px solid ${COLORS.navy}`, color: COLORS.navy, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              + Thêm
            </button>
          </ActionForm>
        </div>

        <div className="iq-editor-col" style={{ flex: "1 1 460px", minWidth: 320 }}>
          {!activeRoom ? (
            <div style={{ fontSize: 14, color: COLORS.muted, padding: "40px 0" }}>
              Chưa có khu vực nào. Thêm khu vực đầu tiên ở cột bên trái.
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <ActionForm
                  action={updateTemplateRoomAction.bind(null, template.id, activeRoom.id)}
                  successMessage="Đã lưu tên khu vực"
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <input
                    name="name" defaultValue={activeRoom.name}
                    style={{ fontSize: "clamp(20px,2.4vw,28px)", fontWeight: 600, border: 0, borderBottom: `2px solid ${COLORS.border}`, background: "transparent", minWidth: 220 }}
                  />
                  <button type="submit" style={{ minHeight: 32, padding: "6px 10px", background: "#fff", border: `1px solid ${COLORS.border}`, cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>
                    Lưu
                  </button>
                </ActionForm>
                <ActionForm action={deleteTemplateRoomAction.bind(null, template.id, activeRoom.id)} successMessage="Đã xóa khu vực">
                  <button type="submit" style={{ minHeight: 32, padding: "6px 10px", background: "#fff", color: "#B42318", border: "1px solid #E4E9EE", cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>
                    Xóa khu vực
                  </button>
                </ActionForm>
              </div>

              {activeRoom.options.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  imageFolder="templates"
                  actions={{
                    updateOption: updateTemplateOptionAction.bind(null, template.id, option.id),
                    deleteOption: deleteTemplateOptionAction.bind(null, template.id, option.id),
                    addItem: addTemplateOptionItemAction.bind(null, template.id, option.id),
                    updateItem: updateTemplateOptionItemAction.bind(null, template.id),
                    deleteItem: deleteTemplateOptionItemAction.bind(null, template.id),
                    addImage: addTemplateOptionImageAction.bind(null, template.id, option.id),
                    deleteImage: deleteTemplateOptionImageAction.bind(null, template.id),
                  }}
                />
              ))}

              <div style={{ border: `1px dashed ${COLORS.border}`, padding: 18, marginTop: 8 }}>
                <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 12 }}>
                  Thêm phương án mới (vd: Cơ bản / Tiêu chuẩn / Cao cấp)
                </div>
                <ActionForm
                  action={createTemplateOptionAction.bind(null, template.id, activeRoom.id)}
                  successMessage="Đã thêm phương án"
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}
                >
                  <input name="name" placeholder="Tên phương án" required style={{ height: 38, padding: "0 10px", border: `1px solid ${COLORS.border}`, fontSize: 13 }} />
                  <input type="number" name="priceFrom" placeholder="Giá từ" required min={0} step={100000} style={{ height: 38, padding: "0 10px", border: `1px solid ${COLORS.border}`, fontSize: 13, textAlign: "right" }} />
                  <input type="number" name="priceTo" placeholder="Giá đến" required min={0} step={100000} style={{ height: 38, padding: "0 10px", border: `1px solid ${COLORS.border}`, fontSize: 13, textAlign: "right" }} />
                  <input name="description" placeholder="Mô tả ngắn" style={{ height: 38, padding: "0 10px", border: `1px solid ${COLORS.border}`, fontSize: 13, gridColumn: "1/-1" }} />
                  <button type="submit" style={{ minHeight: 38, padding: "9px 14px", background: COLORS.navy, color: "#fff", border: 0, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
                    + Thêm phương án
                  </button>
                </ActionForm>
              </div>
            </>
          )}
        </div>

        <div className="iq-editor-col" style={{ flex: "0 1 260px", minWidth: 220 }}>
          <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 16 }}>
            Khoảng giá template
          </div>
          {template.rooms.map((r) => {
            const from = Math.min(...r.options.map((o) => o.priceFrom), Infinity);
            const to = Math.max(...r.options.map((o) => o.priceTo), 0);
            return (
              <div key={r.id} style={{ padding: "13px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 3 }}>
                  {r.options.length ? `${trieu(from)} – ${trieu(to)}` : "Chưa có phương án"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
