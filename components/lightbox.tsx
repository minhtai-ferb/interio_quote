"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Manages a fullscreen image viewer over a fixed list of image URLs.
 * `open(index)` from any thumbnail in that list; renders `overlay` once,
 * anywhere in the tree, to mount the viewer (with prev/next + Escape/arrow-key nav).
 */
export function useImageLightbox(images: string[]) {
  const [index, setIndex] = useState<number | null>(null);

  const open = useCallback((i: number) => setIndex(i), []);
  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % images.length)), [images.length]);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (index === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, next, prev]);

  const overlay =
    index !== null && images[index] ? (
      <div
        onClick={close}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 300,
          background: "rgba(15,20,25,.94)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(16px,4vw,48px)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt=""
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          aria-label="Đóng"
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            width: 44,
            height: 44,
            border: 0,
            background: "rgba(255,255,255,.14)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ✕
        </button>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Ảnh trước"
              style={{
                position: "fixed",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                width: 44,
                height: 44,
                border: 0,
                background: "rgba(255,255,255,.14)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 20,
              }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Ảnh sau"
              style={{
                position: "fixed",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                width: 44,
                height: 44,
                border: 0,
                background: "rgba(255,255,255,.14)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 20,
              }}
            >
              ›
            </button>
            <div
              style={{
                position: "fixed",
                bottom: 16,
                left: 0,
                right: 0,
                textAlign: "center",
                color: "#fff",
                fontSize: 12.5,
                opacity: 0.8,
              }}
            >
              {index + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    ) : null;

  return { open, close, overlay };
}
