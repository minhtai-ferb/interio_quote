"use client";

import { useState } from "react";
import { COLORS } from "@/lib/theme";

export function ImageUploader({
  folder,
  onUploaded,
}: {
  folder: "templates" | "quotes";
  onUploaded: (imageUrl: string, cloudinaryPublicId: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tải hình ảnh thất bại");
      await onUploaded(data.imageUrl, data.cloudinaryPublicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải hình ảnh thất bại");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label
        style={{
          display: "inline-block",
          minHeight: 38,
          whiteSpace: "nowrap",
          padding: "10px 13px",
          background: "#fff",
          border: `1px dashed ${COLORS.navy}`,
          color: COLORS.navy,
          cursor: busy ? "default" : "pointer",
          fontSize: 12.5,
          fontWeight: 600,
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? "Đang tải..." : "+ Thêm hình ảnh"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          disabled={busy}
          style={{ display: "none" }}
        />
      </label>
      {error && (
        <div style={{ fontSize: 12, color: "#B42318", marginTop: 6 }}>{error}</div>
      )}
    </div>
  );
}
