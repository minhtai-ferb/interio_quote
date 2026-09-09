import type { QuoteStatus } from "@/types/quote";

/** Forward-only status flow: DRAFT -> CONSULTING -> CUSTOMER_SUBMITTED -> FINALIZED. */
const ALLOWED_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  DRAFT: ["CONSULTING"],
  CONSULTING: ["CUSTOMER_SUBMITTED", "FINALIZED"],
  CUSTOMER_SUBMITTED: ["CONSULTING", "FINALIZED"],
  FINALIZED: [],
};

export function isValidStatusTransition(
  from: QuoteStatus,
  to: QuoteStatus
): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertValidStatusTransition(
  from: QuoteStatus,
  to: QuoteStatus
): void {
  if (!isValidStatusTransition(from, to)) {
    throw new Error(`Không thể chuyển trạng thái báo giá từ ${from} sang ${to}`);
  }
}
