/** Design tokens lifted from the Claude Design prototype (Quotation Platform.dc.html). */
export const COLORS = {
  navy: "#163A5F",
  navyHover: "#102E4D",
  navyTint: "#EAF1F7",
  bg: "#F7F7F5",
  white: "#fff",
  border: "#E4E9EE",
  muted: "#667085",
  text: "#1F2933",
} as const;

export function vnd(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
}

export function trieu(n: number): string {
  const v = n / 1_000_000;
  const s = (Math.round(v * 10) / 10).toFixed(1).replace(".", ",").replace(",0", "");
  return s + " triệu";
}

export const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  CONSULTING: "Đang tư vấn",
  CUSTOMER_SUBMITTED: "Khách đã gửi lựa chọn",
  FINALIZED: "Đã chốt",
};

export function statusColors(status: string): {
  bg: string;
  fg: string;
  bd: string;
} {
  if (status === "FINALIZED") return { bg: COLORS.navy, fg: "#fff", bd: COLORS.navy };
  if (status === "CUSTOMER_SUBMITTED")
    return { bg: COLORS.navyTint, fg: COLORS.navy, bd: COLORS.navy };
  if (status === "DRAFT") return { bg: COLORS.bg, fg: COLORS.muted, bd: COLORS.border };
  return { bg: "#fff", fg: COLORS.navy, bd: COLORS.navy };
}
