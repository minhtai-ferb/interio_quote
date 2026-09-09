"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { COLORS } from "@/lib/theme";
import { useToast } from "@/components/toast-provider";

/**
 * Adding a room used to leave the editor showing whatever room was already
 * active — the newly created room appeared in the sidebar list, but its name
 * never showed up in the main panel, which looked like the wrong room got
 * created. This submits the action directly (bypassing native form
 * navigation) so it can read back the new room's id and route straight to it.
 */
export function CreateRoomForm({
  action,
  basePath,
}: {
  action: (formData: FormData) => Promise<string>;
  basePath: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const newRoomId = await action(formData);
        showToast("Đã thêm khu vực", "success");
        router.push(`${basePath}?room=${newRoomId}`);
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Có lỗi xảy ra", "error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 6 }}>
      <input
        name="name" placeholder="Tên khu vực mới" required disabled={isPending}
        style={{ flex: 1, minWidth: 0, height: 36, padding: "0 10px", border: `1px solid ${COLORS.border}`, fontSize: 13 }}
      />
      <button
        type="submit" disabled={isPending}
        style={{ flex: "none", minHeight: 36, padding: "8px 12px", background: COLORS.navyTint, border: `1px solid ${COLORS.navy}`, color: COLORS.navy, cursor: "pointer", fontSize: 12, fontWeight: 600, opacity: isPending ? 0.6 : 1 }}
      >
        {isPending ? "Đang thêm…" : "+ Thêm"}
      </button>
    </form>
  );
}
