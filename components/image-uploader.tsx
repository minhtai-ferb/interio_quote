"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PictureOutlined, LoadingOutlined } from "@ant-design/icons";
import { COLORS } from "@/lib/theme";
import { useToast } from "@/components/toast-provider";

export function ImageUploader({
  folder,
  onUploaded,
  compact,
}: {
  folder: "templates" | "quotes";
  onUploaded: (imageUrl: string, cloudinaryPublicId: string) => Promise<void>;
  /** Fixed 90×90 icon button instead of the wide text label — for slots too narrow for "+ Thêm hình ảnh". */
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

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
      showToast("Đã thêm hình ảnh", "success");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tải hình ảnh thất bại";
      setError(message);
      showToast(message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (compact) {
    return (
      <div>
        <label
          title="Thêm hình ảnh"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            width: 90,
            height: 90,
            background: "#fff",
            border: `1px dashed ${COLORS.navy}`,
            color: COLORS.navy,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? <LoadingOutlined style={{ fontSize: 18 }} spin /> : <PictureOutlined style={{ fontSize: 18 }} />}
          <span style={{ fontSize: 9.5, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>
            {busy ? "Đang tải..." : "Thêm ảnh"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            disabled={busy}
            style={{ display: "none" }}
          />
        </label>
        {error && (
          <div style={{ fontSize: 10.5, color: "#B42318", marginTop: 4, width: 90 }}>{error}</div>
        )}
      </div>
    );
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
