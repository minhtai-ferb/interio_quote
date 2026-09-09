import type { Customer } from "./customer";

export type QuoteStatus =
  | "DRAFT"
  | "CONSULTING"
  | "CUSTOMER_SUBMITTED"
  | "FINALIZED";

export interface Quote {
  id: string;
  code: string;
  customerId: string;
  sourceTemplateId: string | null;
  projectType: string | null;
  areaM2: number | null;
  note: string | null;
  status: QuoteStatus;
  publicToken: string;
  discountAmount: number;
  staffNote: string | null;
  finalTotal: number | null;
  finalizedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteRoom {
  id: string;
  quoteId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteOption {
  id: string;
  quoteRoomId: string;
  name: string;
  priceFrom: number;
  priceTo: number;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteOptionImage {
  id: string;
  quoteOptionId: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  sortOrder: number;
  createdAt: string;
}

export interface QuoteOptionItem {
  id: string;
  quoteOptionId: string;
  name: string;
  spec: string | null;
  price: number | null;
  imageUrl: string | null;
  cloudinaryPublicId: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface QuoteOptionItemVariant {
  id: string;
  quoteOptionItemId: string;
  name: string;
  spec: string | null;
  price: number;
  sortOrder: number;
  createdAt: string;
}

export interface QuoteOptionItemWithVariants extends QuoteOptionItem {
  variants: QuoteOptionItemVariant[];
  selectedVariantId: string | null;
}

export interface QuoteSelection {
  id: string;
  quoteId: string;
  quoteRoomId: string;
  quoteOptionId: string;
  finalPrice: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteOptionWithDetails extends QuoteOption {
  images: QuoteOptionImage[];
  items: QuoteOptionItemWithVariants[];
}

export interface QuoteRoomWithOptions extends QuoteRoom {
  options: QuoteOptionWithDetails[];
  selectedOptionId: string | null;
  selectedFinalPrice: number | null;
}

export interface QuoteWithDetails extends Quote {
  customer: Customer;
  rooms: QuoteRoomWithOptions[];
}

export interface QuoteListItem {
  id: string;
  code: string;
  customerName: string;
  projectType: string | null;
  areaM2: number | null;
  status: QuoteStatus;
  priceFrom: number;
  priceTo: number;
  createdAt: string;
}

export interface CreateQuoteInput {
  customerId: string;
  templateId: string;
  projectType?: string | null;
  areaM2?: number | null;
  note?: string | null;
}
