"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as templateQueries from "@/lib/queries/template.queries";

function requireText(value: FormDataEntryValue | null, field: string): string {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) throw new Error(`${field} là bắt buộc`);
  return s;
}

function optionalText(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  return s ? s : null;
}

function requireInt(value: FormDataEntryValue | null, field: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${field} không hợp lệ`);
  return Math.round(n);
}

function optionalInt(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export async function createTemplateAction(formData: FormData) {
  const name = requireText(formData.get("name"), "Tên template");
  const description = optionalText(formData.get("description"));
  const template = await templateQueries.createTemplate({ name, description });
  revalidatePath("/admin/templates");
  redirect(`/admin/templates/${template.id}`);
}

export async function updateTemplateAction(
  templateId: string,
  formData: FormData
) {
  const name = optionalText(formData.get("name")) ?? undefined;
  const description = formData.has("description")
    ? optionalText(formData.get("description"))
    : undefined;
  await templateQueries.updateTemplate(templateId, { name, description });
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function deleteTemplateAction(templateId: string) {
  await templateQueries.deleteTemplate(templateId);
  revalidatePath("/admin/templates");
  redirect("/admin/templates");
}

export async function createTemplateRoomAction(
  templateId: string,
  formData: FormData
) {
  const name = requireText(formData.get("name"), "Tên khu vực");
  await templateQueries.createTemplateRoom(templateId, name);
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function updateTemplateRoomAction(
  templateId: string,
  roomId: string,
  formData: FormData
) {
  const name = requireText(formData.get("name"), "Tên khu vực");
  await templateQueries.updateTemplateRoom(roomId, { name });
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function deleteTemplateRoomAction(
  templateId: string,
  roomId: string
) {
  await templateQueries.deleteTemplateRoom(roomId);
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function reorderTemplateRoomsAction(
  templateId: string,
  orderedIds: string[]
) {
  await templateQueries.reorderTemplateRooms(templateId, orderedIds);
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function createTemplateOptionAction(
  templateId: string,
  roomId: string,
  formData: FormData
) {
  const name = requireText(formData.get("name"), "Tên phương án");
  const priceFrom = requireInt(formData.get("priceFrom"), "Giá từ");
  const priceTo = requireInt(formData.get("priceTo"), "Giá đến");
  if (priceTo < priceFrom) throw new Error("Giá đến phải lớn hơn hoặc bằng giá từ");
  const description = optionalText(formData.get("description"));
  await templateQueries.createTemplateOption(roomId, {
    name,
    priceFrom,
    priceTo,
    description,
  });
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function updateTemplateOptionAction(
  templateId: string,
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
  await templateQueries.updateTemplateOption(optionId, {
    name,
    priceFrom,
    priceTo,
    description,
  });
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function deleteTemplateOptionAction(
  templateId: string,
  optionId: string
) {
  await templateQueries.deleteTemplateOption(optionId);
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function addTemplateOptionItemAction(
  templateId: string,
  optionId: string,
  formData: FormData
) {
  const name = requireText(formData.get("name"), "Tên hạng mục");
  const spec = optionalText(formData.get("spec"));
  const price = optionalInt(formData.get("price"));
  await templateQueries.addTemplateOptionItem(optionId, { name, spec, price });
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function updateTemplateOptionItemAction(
  templateId: string,
  itemId: string,
  formData: FormData
) {
  const name = optionalText(formData.get("name")) ?? undefined;
  const spec = formData.has("spec") ? optionalText(formData.get("spec")) : undefined;
  const price = formData.has("price") ? optionalInt(formData.get("price")) : undefined;
  await templateQueries.updateTemplateOptionItem(itemId, { name, spec, price });
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function deleteTemplateOptionItemAction(
  templateId: string,
  itemId: string
) {
  await templateQueries.deleteTemplateOptionItem(itemId);
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function addTemplateOptionImageAction(
  templateId: string,
  optionId: string,
  imageUrl: string,
  cloudinaryPublicId: string
) {
  await templateQueries.addTemplateOptionImage(optionId, {
    imageUrl,
    cloudinaryPublicId,
  });
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function deleteTemplateOptionImageAction(
  templateId: string,
  imageId: string
) {
  const { deleteImage } = await import("@/lib/cloudinary");
  const deleted = await templateQueries.deleteTemplateOptionImage(imageId);
  if (deleted) {
    await deleteImage(deleted.cloudinaryPublicId).catch(() => {});
  }
  revalidatePath(`/admin/templates/${templateId}`);
}
