"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCustomer } from "@/lib/queries/customer.queries";
import * as quoteQueries from "@/lib/queries/quote.queries";

function requireText(value: FormDataEntryValue | null, field: string): string {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) throw new Error(`${field} là bắt buộc`);
  return s;
}

function optionalText(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  return s ? s : null;
}

function optionalInt(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

function optionalFloat(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

// ── Create quote (customer + copy-from-template) ──

export type CreateQuoteState = { error: string } | undefined;

export async function createQuoteAction(
  _prevState: CreateQuoteState,
  formData: FormData
): Promise<CreateQuoteState> {
  let quoteId: string;
  try {
    const customerName = requireText(formData.get("customerName"), "Tên khách hàng");
    const customerPhone = optionalText(formData.get("customerPhone"));
    const customerEmail = optionalText(formData.get("customerEmail"));
    const templateId = requireText(formData.get("templateId"), "Template");
    const projectType = optionalText(formData.get("projectType"));
    const areaM2 = optionalFloat(formData.get("areaM2"));
    const note = optionalText(formData.get("note"));

    const customer = await createCustomer({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
    });

    const quote = await quoteQueries.createQuoteFromTemplate({
      customerId: customer.id,
      templateId,
      projectType,
      areaM2,
      note,
    });
    quoteId = quote.id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Tạo báo giá thất bại, vui lòng thử lại" };
  }

  revalidatePath("/admin/quotes");
  redirect(`/admin/quotes/${quoteId}`);
}

// ── Quote editor: info & staff fields ──

export async function updateQuoteInfoAction(quoteId: string, formData: FormData) {
  await quoteQueries.updateQuoteInfo(quoteId, {
    projectType: optionalText(formData.get("projectType")),
    areaM2: optionalFloat(formData.get("areaM2")),
    note: optionalText(formData.get("note")),
  });
  revalidatePath(`/admin/quotes/${quoteId}`);
}

export async function updateQuoteStaffFieldsAction(quoteId: string, formData: FormData) {
  await quoteQueries.updateQuoteStaffFields(quoteId, {
    staffNote: optionalText(formData.get("staffNote")),
    discountAmount: optionalInt(formData.get("discountAmount")) ?? undefined,
  });
  revalidatePath(`/admin/quotes/${quoteId}`);
}

export async function ensureConsultingAction(quoteId: string) {
  await quoteQueries.ensureConsulting(quoteId);
}

// ── Quote rooms ──

export async function createQuoteRoomAction(quoteId: string, formData: FormData): Promise<string> {
  const name = requireText(formData.get("name"), "Tên khu vực");
  const room = await quoteQueries.createQuoteRoom(quoteId, name);
  revalidatePath(`/admin/quotes/${quoteId}`);
  return room.id;
}

export async function updateQuoteRoomAction(
  quoteId: string,
  roomId: string,
  formData: FormData
) {
  const name = requireText(formData.get("name"), "Tên khu vực");
  await quoteQueries.updateQuoteRoom(roomId, { name });
  revalidatePath(`/admin/quotes/${quoteId}`);
}

export async function deleteQuoteRoomAction(quoteId: string, roomId: string) {
  await quoteQueries.deleteQuoteRoom(roomId);
  revalidatePath(`/admin/quotes/${quoteId}`);
}

// ── Quote options ──

export async function createQuoteOptionAction(
  quoteId: string,
  roomId: string,
  formData: FormData
) {
  const name = requireText(formData.get("name"), "Tên phương án");
  const priceFrom = optionalInt(formData.get("priceFrom")) ?? 0;
  const priceTo = optionalInt(formData.get("priceTo")) ?? 0;
  if (priceTo < priceFrom) throw new Error("Giá đến phải lớn hơn hoặc bằng giá từ");
  const description = optionalText(formData.get("description"));
  await quoteQueries.createQuoteOption(roomId, { name, priceFrom, priceTo, description });
  revalidatePath(`/admin/quotes/${quoteId}`);
}

export async function updateQuoteOptionAction(
  quoteId: string,
  optionId: string,
  formData: FormData
) {
  const name = optionalText(formData.get("name")) ?? undefined;
  const priceFrom = optionalInt(formData.get("priceFrom")) ?? undefined;
  const priceTo = optionalInt(formData.get("priceTo")) ?? undefined;
  if (priceFrom != null && priceTo != null && priceTo < priceFrom) {
    throw new Error("Giá đến phải lớn hơn hoặc bằng giá từ");
  }
  const description = formData.has("description")
    ? optionalText(formData.get("description"))
    : undefined;
  await quoteQueries.updateQuoteOption(optionId, { name, priceFrom, priceTo, description });
  revalidatePath(`/admin/quotes/${quoteId}`);
}

export async function deleteQuoteOptionAction(quoteId: string, optionId: string) {
  await quoteQueries.deleteQuoteOption(optionId);
  revalidatePath(`/admin/quotes/${quoteId}`);
}

// ── Quote option items ──

export async function addQuoteOptionItemAction(
  quoteId: string,
  optionId: string,
  formData: FormData
) {
  const name = requireText(formData.get("name"), "Tên hạng mục");
  const spec = optionalText(formData.get("spec"));
  const price = optionalInt(formData.get("price"));
  await quoteQueries.addQuoteOptionItem(optionId, { name, spec, price });
  revalidatePath(`/admin/quotes/${quoteId}`);
}

export async function updateQuoteOptionItemAction(
  quoteId: string,
  itemId: string,
  formData: FormData
) {
  const name = optionalText(formData.get("name")) ?? undefined;
  const spec = formData.has("spec") ? optionalText(formData.get("spec")) : undefined;
  const price = formData.has("price") ? optionalInt(formData.get("price")) : undefined;
  await quoteQueries.updateQuoteOptionItem(itemId, { name, spec, price });
  revalidatePath(`/admin/quotes/${quoteId}`);
}

export async function deleteQuoteOptionItemAction(quoteId: string, itemId: string) {
  await quoteQueries.deleteQuoteOptionItem(itemId);
  revalidatePath(`/admin/quotes/${quoteId}`);
}

// ── Quote option images ──

export async function addQuoteOptionImageAction(
  quoteId: string,
  optionId: string,
  imageUrl: string,
  cloudinaryPublicId: string
) {
  await quoteQueries.addQuoteOptionImage(optionId, { imageUrl, cloudinaryPublicId });
  revalidatePath(`/admin/quotes/${quoteId}`);
}

export async function deleteQuoteOptionImageAction(quoteId: string, imageId: string) {
  const { deleteImage } = await import("@/lib/cloudinary");
  const deleted = await quoteQueries.deleteQuoteOptionImage(imageId);
  if (deleted) {
    await deleteImage(deleted.cloudinaryPublicId).catch(() => {});
  }
  revalidatePath(`/admin/quotes/${quoteId}`);
}

// ── Item image ──

export async function setQuoteOptionItemImageAction(
  quoteId: string,
  itemId: string,
  imageUrl: string,
  cloudinaryPublicId: string
) {
  await quoteQueries.setQuoteOptionItemImage(itemId, { imageUrl, cloudinaryPublicId });
  revalidatePath(`/admin/quotes/${quoteId}`);
}

export async function removeQuoteOptionItemImageAction(quoteId: string, itemId: string) {
  const { deleteImage } = await import("@/lib/cloudinary");
  const removed = await quoteQueries.removeQuoteOptionItemImage(itemId);
  if (removed?.cloudinaryPublicId) {
    await deleteImage(removed.cloudinaryPublicId).catch(() => {});
  }
  revalidatePath(`/admin/quotes/${quoteId}`);
}

// ── Item variants (sub-options) ──

export async function createQuoteOptionItemVariantAction(
  quoteId: string,
  itemId: string,
  formData: FormData
) {
  const name = requireText(formData.get("name"), "Tên option phụ");
  const spec = optionalText(formData.get("spec"));
  const price = optionalInt(formData.get("price")) ?? 0;
  await quoteQueries.createQuoteOptionItemVariant(itemId, { name, spec, price });
  revalidatePath(`/admin/quotes/${quoteId}`);
}

export async function updateQuoteOptionItemVariantAction(
  quoteId: string,
  variantId: string,
  formData: FormData
) {
  const name = optionalText(formData.get("name")) ?? undefined;
  const spec = formData.has("spec") ? optionalText(formData.get("spec")) : undefined;
  const price = optionalInt(formData.get("price")) ?? undefined;
  await quoteQueries.updateQuoteOptionItemVariant(variantId, { name, spec, price });
  revalidatePath(`/admin/quotes/${quoteId}`);
}

export async function deleteQuoteOptionItemVariantAction(quoteId: string, variantId: string) {
  await quoteQueries.deleteQuoteOptionItemVariant(variantId);
  revalidatePath(`/admin/quotes/${quoteId}`);
}

// ── Customer public selection ──

export async function submitCustomerSelectionsAction(
  token: string,
  selections: { roomId: string; optionId: string }[],
  itemVariantSelections: { itemId: string; variantId: string }[] = []
) {
  await quoteQueries.submitCustomerSelections(token, selections, itemVariantSelections);
  revalidatePath(`/q/${token}`);
}

// ── Staff finalize ──

export async function finalizeQuoteAction(
  quoteId: string,
  input: {
    discountAmount: number;
    staffNote: string | null;
    finalPrices: { roomId: string; optionId: string; finalPrice: number }[];
  }
) {
  await quoteQueries.finalizeQuote(quoteId, input);
  revalidatePath(`/admin/quotes/${quoteId}`);
  revalidatePath(`/admin/quotes`);
}

/** Parses the finalize review form (one option-radio + one price field per room) and finalizes the quote. */
export async function finalizeQuoteFormAction(
  quoteId: string,
  roomIds: string[],
  formData: FormData
) {
  const discountAmount = optionalInt(formData.get("discountAmount")) ?? 0;
  const staffNote = optionalText(formData.get("staffNote"));
  const finalPrices = roomIds.map((roomId) => ({
    roomId,
    optionId: requireText(formData.get(`option_${roomId}`), "Phương án cuối cùng"),
    finalPrice: optionalInt(formData.get(`price_${roomId}`)) ?? 0,
  }));
  await quoteQueries.finalizeQuote(quoteId, { discountAmount, staffNote, finalPrices });
  revalidatePath(`/admin/quotes/${quoteId}`);
  revalidatePath("/admin/quotes");
  redirect(`/admin/quotes/${quoteId}/pdf`);
}
