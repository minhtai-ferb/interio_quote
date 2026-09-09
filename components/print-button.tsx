"use client";

import { COLORS } from "@/lib/theme";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{
        minHeight: 42,
        padding: "11px 18px",
        background: COLORS.navy,
        color: "#fff",
        border: 0,
        cursor: "pointer",
        fontSize: 13.5,
        fontWeight: 600,
      }}
    >
      In / Lưu thành PDF
    </button>
  );
}
