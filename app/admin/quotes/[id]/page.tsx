import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuoteById, ensureConsulting } from "@/lib/queries/quote.queries";
import {
  updateQuoteInfoAction,
  createQuoteRoomAction,
  updateQuoteRoomAction,
  deleteQuoteRoomAction,
  createQuoteOptionAction,
  updateQuoteOptionAction,
  deleteQuoteOptionAction,
  addQuoteOptionItemAction,
  updateQuoteOptionItemAction,
  deleteQuoteOptionItemAction,
  addQuoteOptionImageAction,
  deleteQuoteOptionImageAction,
  setQuoteOptionItemImageAction,
  removeQuoteOptionItemImageAction,
  createQuoteOptionItemVariantAction,
  updateQuoteOptionItemVariantAction,
  deleteQuoteOptionItemVariantAction,
} from "@/actions/quote.actions";
import { OptionCard } from "@/components/option-card";
import { ActionForm } from "@/components/action-form";
import { CreateRoomForm } from "@/components/create-room-form";
import { CopyLinkButton } from "@/components/copy-link-button";
import { COLORS, STATUS_LABEL, statusColors, trieu } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function QuoteEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ room?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  await ensureConsulting(id);
  const quote = await getQuoteById(id);
  if (!quote) notFound();

  const activeRoomId = sp.room ?? quote.rooms[0]?.id;
  const activeRoom =
    quote.rooms.find((r) => r.id === activeRoomId) ?? quote.rooms[0] ?? null;
  const isLocked = quote.status === "FINALIZED";

  const roomBudgets = quote.rooms.map((r) => {
    const selected = r.options.find((o) => o.id === r.selectedOptionId);
    const from = selected ? selected.priceFrom : Math.min(...r.options.map((o) => o.priceFrom), Infinity);
    const to = selected ? selected.priceTo : Math.max(...r.options.map((o) => o.priceTo), 0);
    return { room: r, from: Number.isFinite(from) ? from : 0, to };
  });
  const totalFrom = roomBudgets.reduce((a, b) => a + b.from, 0);
  const totalTo = roomBudgets.reduce((a, b) => a + b.to, 0);

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/q/${quote.publicToken}`;
  const c = statusColors(quote.status);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", minHeight: "calc(100vh - 60px)" }}>
      <div className="iq-editor-col" style={{ flex: "0 1 280px", minWidth: 240, background: "#fff", borderRight: `1px solid ${COLORS.border}`, padding: "26px 22px" }}>
        <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 8 }}>
          {quote.code}
        </div>
        <div style={{ fontSize: 19, fontWeight: 600, marginBottom: 4 }}>{quote.customer.name}</div>
        <div style={{ fontSize: 13, color: COLORS.muted }}>
          {[quote.projectType, quote.areaM2 ? `${quote.areaM2}m²` : null].filter(Boolean).join(" • ")}
        </div>
        <div style={{ display: "inline-block", whiteSpace: "nowrap", marginTop: 14, padding: "5px 10px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", background: c.bg, color: c.fg, border: `1px solid ${c.bd}` }}>
          {STATUS_LABEL[quote.status]}
        </div>

        <details style={{ marginTop: 18 }}>
          <summary style={{ cursor: "pointer", fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>Sửa thông tin công trình</summary>
          <ActionForm
            action={updateQuoteInfoAction.bind(null, quote.id)}
            successMessage="Đã lưu thông tin công trình"
            style={{ display: "grid", gap: 10, marginTop: 12 }}
          >
            <input name="projectType" defaultValue={quote.projectType ?? ""} placeholder="Loại công trình" style={{ height: 34, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 12.5 }} />
            <input type="number" name="areaM2" defaultValue={quote.areaM2 ?? ""} placeholder="Diện tích (m²)" style={{ height: 34, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 12.5 }} />
            <input name="note" defaultValue={quote.note ?? ""} placeholder="Ghi chú" style={{ height: 34, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 12.5 }} />
            <button type="submit" style={{ minHeight: 32, background: COLORS.navy, color: "#fff", border: 0, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              Lưu
            </button>
          </ActionForm>
        </details>

        <div style={{ height: 2, background: COLORS.text, margin: "24px 0 18px" }} />
        <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 12 }}>
          Khu vực
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 16 }}>
          {quote.rooms.map((r) => (
            <Link
              key={r.id}
              href={`/admin/quotes/${quote.id}?room=${r.id}`}
              style={{
                display: "flex", alignItems: "baseline", gap: 11, padding: "11px 12px",
                borderLeft: `2px solid ${r.id === activeRoomId ? COLORS.navy : "transparent"}`,
                background: r.id === activeRoomId ? COLORS.navyTint : "transparent", color: COLORS.text,
              }}
            >
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{r.name}</span>
                <span style={{ display: "block", fontSize: 11.5, opacity: 0.65, marginTop: 2 }}>
                  {r.selectedOptionId ? "Khách đã chọn" : `${r.options.length} phương án`}
                </span>
              </span>
            </Link>
          ))}
        </div>
        {!isLocked && (
          <CreateRoomForm
            action={createQuoteRoomAction.bind(null, quote.id)}
            basePath={`/admin/quotes/${quote.id}`}
          />
        )}
      </div>

      <div className="iq-editor-col" style={{ flex: "1 1 460px", minWidth: 320, padding: "clamp(22px,3vw,40px)" }}>
        {!activeRoom ? (
          <div style={{ fontSize: 14, color: COLORS.muted }}>Chưa có khu vực nào trong báo giá này.</div>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
              {isLocked ? (
                <div style={{ fontSize: "clamp(22px,2.6vw,30px)", fontWeight: 600 }}>{activeRoom.name}</div>
              ) : (
                <ActionForm
                  action={updateQuoteRoomAction.bind(null, quote.id, activeRoom.id)}
                  successMessage="Đã lưu tên khu vực"
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <input name="name" defaultValue={activeRoom.name} style={{ fontSize: "clamp(20px,2.4vw,28px)", fontWeight: 600, border: 0, borderBottom: `2px solid ${COLORS.border}`, background: "transparent", minWidth: 200 }} />
                  <button type="submit" style={{ minHeight: 32, padding: "6px 10px", background: "#fff", border: `1px solid ${COLORS.border}`, cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>
                    Lưu
                  </button>
                </ActionForm>
              )}
              {!isLocked && (
                <ActionForm action={deleteQuoteRoomAction.bind(null, quote.id, activeRoom.id)} successMessage="Đã xóa khu vực">
                  <button type="submit" style={{ minHeight: 32, padding: "6px 10px", background: "#fff", color: "#B42318", border: "1px solid #E4E9EE", cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>
                    Xóa khu vực
                  </button>
                </ActionForm>
              )}
            </div>

            {activeRoom.options.map((option) =>
              isLocked ? (
                <ReadOnlyOptionCard key={option.id} option={option} badge={option.id === activeRoom.selectedOptionId ? "✓ Khách đã chọn" : undefined} />
              ) : (
                <OptionCard
                  key={option.id}
                  option={option}
                  imageFolder="quotes"
                  badge={option.id === activeRoom.selectedOptionId ? "✓ Khách đã chọn" : undefined}
                  actions={{
                    updateOption: updateQuoteOptionAction.bind(null, quote.id, option.id),
                    deleteOption: deleteQuoteOptionAction.bind(null, quote.id, option.id),
                    addItem: addQuoteOptionItemAction.bind(null, quote.id, option.id),
                    updateItem: updateQuoteOptionItemAction.bind(null, quote.id),
                    deleteItem: deleteQuoteOptionItemAction.bind(null, quote.id),
                    addImage: addQuoteOptionImageAction.bind(null, quote.id, option.id),
                    deleteImage: deleteQuoteOptionImageAction.bind(null, quote.id),
                    setItemImage: setQuoteOptionItemImageAction.bind(null, quote.id),
                    removeItemImage: removeQuoteOptionItemImageAction.bind(null, quote.id),
                    addItemVariant: createQuoteOptionItemVariantAction.bind(null, quote.id),
                    updateItemVariant: updateQuoteOptionItemVariantAction.bind(null, quote.id),
                    deleteItemVariant: deleteQuoteOptionItemVariantAction.bind(null, quote.id),
                  }}
                />
              )
            )}

            {!isLocked && (
              <div style={{ border: `1px dashed ${COLORS.border}`, padding: 18, marginTop: 8 }}>
                <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 12 }}>
                  Thêm phương án mới
                </div>
                <ActionForm
                  action={createQuoteOptionAction.bind(null, quote.id, activeRoom.id)}
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
            )}
          </>
        )}
      </div>

      <div className="iq-editor-col" style={{ flex: "0 1 300px", minWidth: 260, background: "#fff", borderLeft: `1px solid ${COLORS.border}` }}>
        <div className="iq-editor-sticky" style={{ position: "sticky", top: 60, padding: "26px 22px" }}>
          <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 18 }}>
            Ngân sách dự kiến
          </div>
          {roomBudgets.map(({ room, from, to }) => (
            <div key={room.id} style={{ padding: "13px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{room.name}</span>
                <span style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                  {from || to ? `${trieu(from)} – ${trieu(to)}` : "—"}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 5 }}>
                {room.selectedOptionId ? "Khách đã chọn" : "Chưa chọn"}
              </div>
            </div>
          ))}
          <div style={{ height: 2, background: COLORS.text, margin: "18px 0 14px" }} />
          <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 6 }}>
            Tổng dự kiến
          </div>
          <div style={{ fontSize: 23, fontWeight: 700, color: COLORS.navy, lineHeight: 1.15 }}>
            {trieu(totalFrom)} – {trieu(totalTo)}
          </div>

          {!isLocked && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 24 }}>
              <Link
                href={`/q/${quote.publicToken}`}
                target="_blank"
                style={{ display: "block", minHeight: 42, padding: "11px 14px", background: COLORS.navy, color: "#fff", fontSize: 13, fontWeight: 600, lineHeight: "20px" }}
              >
                Xem trang khách →
              </Link>
              <CopyLinkButton url={publicUrl} />
              {(quote.status === "CONSULTING" || quote.status === "CUSTOMER_SUBMITTED") && (
                <Link
                  href={`/admin/quotes/${quote.id}/finalize`}
                  style={{ display: "block", minHeight: 42, padding: "11px 14px", background: "#fff", color: COLORS.navy, border: `1px solid ${COLORS.navy}`, fontSize: 13, fontWeight: 600, lineHeight: "20px" }}
                >
                  Chốt báo giá &amp; xuất PDF
                </Link>
              )}
              <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 4, wordBreak: "break-all" }}>
                {publicUrl}
              </div>
            </div>
          )}
          {isLocked && (
            <div style={{ marginTop: 24 }}>
              <Link
                href={`/admin/quotes/${quote.id}/pdf`}
                target="_blank"
                style={{ display: "block", minHeight: 42, padding: "11px 14px", background: COLORS.navy, color: "#fff", fontSize: 13, fontWeight: 600, lineHeight: "20px" }}
              >
                Xuất PDF →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReadOnlyOptionCard({
  option,
  badge,
}: {
  option: { id: string; name: string; priceFrom: number; priceTo: number; description: string | null; images: { id: string; imageUrl: string }[]; items: { id: string; name: string; spec: string | null; price: number | null }[] };
  badge?: string;
}) {
  return (
    <div style={{ border: `1px solid ${badge ? COLORS.navy : COLORS.border}`, background: "#fff", marginBottom: 18 }}>
      {badge && (
        <div style={{ padding: "8px 18px", background: COLORS.navyTint, color: COLORS.navy, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
          {badge}
        </div>
      )}
      <div style={{ padding: 18, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{option.name}</div>
        <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
          {trieu(option.priceFrom)} – {trieu(option.priceTo)}
        </div>
        {option.description && <div style={{ fontSize: 13, marginTop: 8 }}>{option.description}</div>}
      </div>
      {option.images.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 18, borderBottom: `1px solid ${COLORS.border}` }}>
          {option.images.map((img) => (
            <div key={img.id} style={{ width: 100, height: 76, backgroundImage: `url(${img.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          ))}
        </div>
      )}
      <div style={{ padding: 18 }}>
        {option.items.map((it) => (
          <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13 }}>
            <span>{it.name}{it.spec ? ` — ${it.spec}` : ""}</span>
            <span>{it.price != null ? trieu(it.price) : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
