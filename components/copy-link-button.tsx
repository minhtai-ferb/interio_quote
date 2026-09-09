"use client";

import { useState } from "react";
import { COLORS } from "@/lib/theme";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        minHeight: 42,
        padding: "11px 14px",
        background: "#fff",
        color: COLORS.navy,
        border: `1px solid ${COLORS.border}`,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        textAlign: "left",
        width: "100%",
      }}
    >
      {copied ? "✓ Đã sao chép link" : "Sao chép link"}
    </button>
  );
}
