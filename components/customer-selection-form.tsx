"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { COLORS, trieu, vnd } from "@/lib/theme";
import { submitCustomerSelectionsAction } from "@/actions/quote.actions";
import { useToast } from "@/components/toast-provider";
import { useImageLightbox } from "@/components/lightbox";

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

const ROOM_COLORS = ["#163A5F", "#33648C", "#6C93B4", "#8AA9C4", "#B9CEE0", "#D8E4EE"];

function midpoint(o: SelectionOption): number {
  return Math.round((o.priceFrom + o.priceTo) / 2 / 100000) * 100000;
}

export function CustomerSelectionForm({
  token,
  customerName,
  projectType,
  areaM2,
  rooms,
  initialSelections,
  alreadySubmitted,
}: {
  token: string;
  customerName: string;
  projectType: string | null;
  areaM2: number | null;
  rooms: SelectionRoom[];
  initialSelections: Record<string, string | null>;
  alreadySubmitted: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selections, setSelections] = useState<Record<string, string | null>>(initialSelections);
  const [activeRoomId, setActiveRoomId] = useState<string>(rooms[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(alreadySubmitted);
  const tabsRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const selectedOptionOf = (room: SelectionRoom) => {
    const id = selections[room.id] ?? room.options[0]?.id ?? null;
    return room.options.find((o) => o.id === id) ?? null;
  };

  const budget = useMemo(() => {
    return rooms.map((room) => {
      const option = selectedOptionOf(room);
      return { room, option, amount: option ? midpoint(option) : 0 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, selections]);

  const total = budget.reduce((a, b) => a + b.amount, 0);
  const missing = rooms.filter((r) => !(selections[r.id] ?? r.options[0]?.id) && r.options.length > 0);

  function goTab(roomId: string) {
    setActiveRoomId(roomId);
    tabsRef.current?.scrollIntoView({ block: "start" });
  }

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

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? rooms[0] ?? null;
  const activeRoomIndex = activeRoom ? rooms.indexOf(activeRoom) : -1;
  const activeOption = activeRoom ? selectedOptionOf(activeRoom) : null;
  const activeImages = activeOption?.images.map((i) => i.imageUrl) ?? [];
  const lightbox = useImageLightbox(activeImages);

  const heroImage = rooms.flatMap((r) => r.options).flatMap((o) => o.images)[0]?.imageUrl ?? null;
  const heroLightbox = useImageLightbox(heroImage ? [heroImage] : []);

  return (
    <div>
      {/* ── hero ── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
          minHeight: "min(56vh,470px)",
        }}
      >
        <div
          style={{
            padding: "clamp(34px,5vw,66px) clamp(18px,5vw,64px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 22,
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
            Phương án nội thất
          </div>
          <div>
            <div style={{ fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: COLORS.muted, marginBottom: 14 }}>
              Dành cho
            </div>
            <div style={{ fontSize: "clamp(34px,4.4vw,58px)", lineHeight: 1, fontWeight: 600, letterSpacing: "-.02em" }}>
              {customerName}
            </div>
            {(projectType || areaM2) && (
              <div style={{ fontSize: 15, color: COLORS.muted, marginTop: 20 }}>
                {[projectType, areaM2 ? `${areaM2}m²` : null].filter(Boolean).join(" • ")}
              </div>
            )}
          </div>
          <div style={{ height: 2, background: COLORS.text, maxWidth: 120 }} />
          <div style={{ fontSize: 15.5, lineHeight: 1.7, maxWidth: "31em" }}>
            Mỗi khu vực có nhiều mức đầu tư khác nhau. Chọn mức phù hợp cho từng khu vực — ngân sách cập nhật ngay theo lựa chọn của bạn.
          </div>
          <div style={{ maxWidth: 440 }}>
            {rooms.map((r, i) => {
              const option = selectedOptionOf(r);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => goTab(r.id)}
                  style={{
                    display: "flex", alignItems: "baseline", gap: 14, width: "100%", textAlign: "left",
                    padding: "13px 0", border: 0, borderBottom: `1px solid ${COLORS.border}`, background: "transparent", cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 11.5, color: COLORS.muted, fontVariantNumeric: "tabular-nums", letterSpacing: ".1em" }}>
                    {"0" + (i + 1)}
                  </span>
                  <span style={{ flex: 1, fontSize: 16.5, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: 12.5, color: COLORS.muted, whiteSpace: "nowrap" }}>{option?.name ?? "—"}</span>
                  <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                    {option ? trieu(midpoint(option)) : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div
          onClick={() => heroImage && heroLightbox.open(0)}
          style={{
            display: "block", width: "100%", height: "clamp(320px,40vw,470px)",
            background: heroImage ? undefined : COLORS.navyTint,
            backgroundImage: heroImage ? `url(${heroImage})` : undefined,
            backgroundSize: "cover", backgroundPosition: "center",
            cursor: heroImage ? "zoom-in" : "default",
          }}
        />
      </section>
      {heroLightbox.overlay}

      {submitted && (
        <div style={{ background: COLORS.navyTint, color: COLORS.navy, padding: "16px clamp(18px,5vw,64px)", fontSize: 13.5, fontWeight: 600 }}>
          ✓ Đã ghi nhận lựa chọn của bạn. Bạn có thể tiếp tục thay đổi bên dưới nếu cần — nhân viên tư vấn sẽ liên hệ để hoàn thiện báo giá.
        </div>
      )}

      {/* ── tab bar ── */}
      <nav
        ref={tabsRef}
        style={{
          position: "sticky", top: 0, zIndex: 40, display: "flex", flexWrap: "wrap",
          background: "#fff", borderTop: `2px solid ${COLORS.text}`, borderBottom: `2px solid ${COLORS.text}`,
        }}
      >
        {rooms.map((r, i) => {
          const on = r.id === activeRoomId;
          const option = selectedOptionOf(r);
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => goTab(r.id)}
              style={{
                flex: "1 1 200px", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                padding: "16px clamp(16px,2.6vw,28px)", border: 0, borderRight: `1px solid ${COLORS.border}`,
                borderBottom: `3px solid ${on ? COLORS.navy : "transparent"}`,
                background: on ? COLORS.navyTint : "#fff", color: COLORS.text, cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 11, opacity: 0.6, fontVariantNumeric: "tabular-nums", letterSpacing: ".1em" }}>
                {"0" + (i + 1)}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{r.name}</span>
                <span style={{ display: "block", fontSize: 11.5, opacity: 0.68, marginTop: 3, fontVariantNumeric: "tabular-nums" }}>
                  {option?.name ?? "Chưa chọn"}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* ── panel phòng đang chọn ── */}
        <div style={{ flex: "1 1 560px", minWidth: 320 }}>
          {activeRoom && (
            <div style={{ borderTop: `2px solid ${COLORS.text}`, padding: "clamp(36px,5vw,68px) clamp(18px,5vw,64px)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 16, marginBottom: 28 }}>
                <span style={{ fontSize: 12, letterSpacing: ".2em", color: COLORS.muted, fontVariantNumeric: "tabular-nums" }}>
                  {"0" + (activeRoomIndex + 1)} —
                </span>
                <span style={{ fontSize: "clamp(26px,3.4vw,42px)", fontWeight: 600, lineHeight: 1, letterSpacing: "-.01em" }}>
                  {activeRoom.name}
                </span>
              </div>

              {activeImages.length > 0 && (
                <div
                  onClick={() => lightbox.open(0)}
                  style={{
                    width: "100%", height: "clamp(230px,32vw,420px)", backgroundImage: `url(${activeImages[0]})`,
                    backgroundSize: "cover", backgroundPosition: "center", marginBottom: 32, cursor: "zoom-in",
                  }}
                />
              )}

              <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 12 }}>
                Bước 1 — Chọn phương án
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 14 }}>
                {activeRoom.options.map((option) => {
                  const on = (selections[activeRoom.id] ?? activeRoom.options[0]?.id) === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelections((s) => ({ ...s, [activeRoom.id]: option.id }))}
                      style={{
                        flex: "1 1 170px", padding: "16px 18px", textAlign: "left",
                        border: `1px solid ${on ? COLORS.navy : COLORS.border}`,
                        background: on ? COLORS.navy : "#fff", color: on ? "#fff" : COLORS.text,
                        cursor: "pointer", marginRight: -1,
                      }}
                    >
                      <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{option.name}</span>
                      <span style={{ display: "block", fontSize: 13, opacity: 0.78, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
                        {trieu(option.priceFrom)} – {trieu(option.priceTo)}
                      </span>
                      <span style={{ display: "block", fontSize: 11.5, opacity: 0.62, marginTop: 3 }}>
                        {option.items.length} hạng mục
                      </span>
                    </button>
                  );
                })}
              </div>
              {activeOption?.description && (
                <div style={{ fontSize: 13, color: COLORS.muted, textWrap: "pretty", marginBottom: 36 }}>
                  {activeOption.description}
                </div>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
                  Bước 2 — Hạng mục bao gồm
                </div>
                <div style={{ fontSize: 11.5, color: COLORS.muted, whiteSpace: "nowrap" }}>
                  {activeOption?.items.length ?? 0} hạng mục
                </div>
              </div>

              <div style={{ borderTop: `2px solid ${COLORS.text}` }}>
                {activeOption?.items.map((it, n) => {
                  const img = activeImages.length > 0 ? activeImages[n % activeImages.length] : null;
                  return (
                    <div
                      key={it.id}
                      style={{
                        display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
                        gap: "18px clamp(20px,3vw,40px)", padding: "22px 0", borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      {img && (
                        <div
                          onClick={() => lightbox.open(n % activeImages.length)}
                          style={{ width: "100%", height: 180, backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center", cursor: "zoom-in" }}
                        />
                      )}
                      <div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                          <span style={{ fontSize: 11, color: COLORS.navy, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                            {"0" + (n + 1)}
                          </span>
                          <span style={{ fontSize: 17.5, fontWeight: 600 }}>{it.name}</span>
                        </div>
                        {it.spec && (
                          <div style={{ fontSize: 13.5, marginTop: 8, color: COLORS.muted }}>{it.spec}</div>
                        )}
                        {it.price != null && (
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.navy, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
                            {vnd(it.price)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "baseline", justifyContent: "space-between", padding: "24px 0", borderBottom: `2px solid ${COLORS.text}` }}>
                  <span style={{ fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
                    Tạm tính {activeRoom.name}
                  </span>
                  <span style={{ fontSize: "clamp(24px,3vw,34px)", fontWeight: 700, color: COLORS.navy, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                    {activeOption ? `${trieu(activeOption.priceFrom)} – ${trieu(activeOption.priceTo)}` : "—"}
                  </span>
                </div>
              </div>
              {lightbox.overlay}

              {/* ── room nav ── */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", padding: "26px 0 0" }}>
                {activeRoomIndex > 0 ? (
                  <button
                    type="button"
                    onClick={() => goTab(rooms[activeRoomIndex - 1].id)}
                    style={{ flex: "none", whiteSpace: "nowrap", minHeight: 44, padding: "12px 16px", background: "#fff", border: `1px solid ${COLORS.border}`, color: COLORS.muted, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                  >
                    ← {rooms[activeRoomIndex - 1].name}
                  </button>
                ) : (
                  <div />
                )}
                {activeRoomIndex < rooms.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => goTab(rooms[activeRoomIndex + 1].id)}
                    style={{ flex: "none", whiteSpace: "nowrap", minHeight: 44, padding: "12px 18px", background: COLORS.navy, color: "#fff", border: 0, cursor: "pointer", fontSize: 13.5, fontWeight: 600 }}
                  >
                    {rooms[activeRoomIndex + 1].name} →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => railRef.current?.scrollIntoView({ block: "center" })}
                    style={{ flex: "none", whiteSpace: "nowrap", minHeight: 44, padding: "12px 18px", background: COLORS.navy, color: "#fff", border: 0, cursor: "pointer", fontSize: 13.5, fontWeight: 600 }}
                  >
                    Xem tổng kết →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── rail ngân sách ── */}
        <aside style={{ flex: "0 1 340px", minWidth: 280, borderLeft: `1px solid ${COLORS.border}`, borderTop: `2px solid ${COLORS.text}` }}>
          <div ref={railRef} style={{ position: "sticky", top: 96, padding: "clamp(20px,2.4vw,26px) clamp(20px,2.4vw,30px)" }}>
            <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 16 }}>
              Tổng ngân sách dự kiến
            </div>
            <div style={{ fontSize: "clamp(28px,3.2vw,38px)", fontWeight: 700, color: COLORS.navy, lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>
              {vnd(total)}
            </div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 8 }}>
              Khoảng dự kiến {Math.round((total * 0.94) / 1_000_000)} – {Math.round((total * 1.08) / 1_000_000)} triệu
            </div>
            <div style={{ display: "flex", height: 10, margin: "18px 0 12px" }}>
              {budget.map(({ room, amount }, i) => (
                <div key={room.id} style={{ flex: amount / (total || 1), minWidth: 2, background: ROOM_COLORS[i % ROOM_COLORS.length], marginRight: 2 }} />
              ))}
            </div>
            {budget.map(({ room, amount }, i) => (
              <div key={room.id} style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ width: 8, height: 8, flex: "none", background: ROOM_COLORS[i % ROOM_COLORS.length] }} />
                <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: COLORS.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {room.name}
                </span>
                <span style={{ fontSize: 12.5, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{vnd(amount)}</span>
              </div>
            ))}

            {error && <div style={{ fontSize: 13, color: "#B42318", marginTop: 14 }}>{error}</div>}
            {missing.length > 0 && (
              <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 14 }}>
                Vui lòng chọn phương án cho: {missing.map((r) => r.name).join(", ")}
              </div>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || missing.length > 0}
              style={{
                width: "100%", minHeight: 50, marginTop: 24, background: COLORS.navy, color: "#fff", border: 0,
                cursor: isPending || missing.length > 0 ? "default" : "pointer",
                opacity: isPending || missing.length > 0 ? 0.6 : 1,
                fontSize: 14, fontWeight: 600, textAlign: "left", padding: "14px 18px",
              }}
            >
              {isPending ? "Đang gửi…" : submitted ? "Cập nhật lựa chọn" : "Xác nhận phương án"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
