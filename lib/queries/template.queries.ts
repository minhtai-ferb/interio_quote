import { sql } from "@/lib/db";
import type {
  Template,
  TemplateRoom,
  TemplateOption,
  TemplateOptionImage,
  TemplateOptionItem,
  TemplateWithRooms,
  TemplateSummary,
} from "@/types/template";

export async function getTemplates(): Promise<TemplateSummary[]> {
  const rows = await sql`
    SELECT
      t.id, t.name, t.description,
      t.created_at AS "createdAt", t.updated_at AS "updatedAt",
      COUNT(DISTINCT tr.id)::int AS "roomCount",
      COUNT(DISTINCT tomd.id)::int AS "optionCount",
      COALESCE(MIN(tomd.price_from), 0) AS "priceFrom",
      COALESCE(MAX(tomd.price_to), 0) AS "priceTo",
      (SELECT COUNT(*)::int FROM quotes q WHERE q.source_template_id = t.id) AS "quoteCount",
      (
        SELECT toi.image_url FROM template_option_images toi
        JOIN template_options too ON too.id = toi.template_option_id
        JOIN template_rooms tr2 ON tr2.id = too.template_room_id
        WHERE tr2.template_id = t.id
        ORDER BY tr2.sort_order, too.sort_order, toi.sort_order
        LIMIT 1
      ) AS "thumbnailUrl"
    FROM templates t
    LEFT JOIN template_rooms tr ON tr.template_id = t.id
    LEFT JOIN template_options tomd ON tomd.template_room_id = tr.id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `;
  return rows as unknown as TemplateSummary[];
}

export async function getTemplateById(
  id: string
): Promise<TemplateWithRooms | null> {
  const templateRows = await sql`
    SELECT id, name, description,
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM templates WHERE id = ${id}
  `;
  const template = templateRows[0] as Template | undefined;
  if (!template) return null;

  const rooms = (await sql`
    SELECT id, template_id AS "templateId", name, sort_order AS "sortOrder",
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM template_rooms WHERE template_id = ${id} ORDER BY sort_order, created_at
  `) as unknown as TemplateRoom[];

  const options = (await sql`
    SELECT o.id, o.template_room_id AS "templateRoomId", o.name,
      o.price_from AS "priceFrom", o.price_to AS "priceTo", o.description,
      o.sort_order AS "sortOrder",
      o.created_at AS "createdAt", o.updated_at AS "updatedAt"
    FROM template_options o
    JOIN template_rooms r ON r.id = o.template_room_id
    WHERE r.template_id = ${id}
    ORDER BY o.sort_order, o.created_at
  `) as unknown as TemplateOption[];

  const optionIds = options.map((o) => o.id);

  const images = optionIds.length
    ? ((await sql`
        SELECT id, template_option_id AS "templateOptionId", image_url AS "imageUrl",
          cloudinary_public_id AS "cloudinaryPublicId", sort_order AS "sortOrder",
          created_at AS "createdAt"
        FROM template_option_images
        WHERE template_option_id = ANY(${optionIds})
        ORDER BY sort_order, created_at
      `) as unknown as TemplateOptionImage[])
    : [];

  const items = optionIds.length
    ? ((await sql`
        SELECT id, template_option_id AS "templateOptionId", name, spec, price,
          sort_order AS "sortOrder", created_at AS "createdAt"
        FROM template_option_items
        WHERE template_option_id = ANY(${optionIds})
        ORDER BY sort_order, created_at
      `) as unknown as TemplateOptionItem[])
    : [];

  return {
    ...template,
    rooms: rooms.map((room) => ({
      ...room,
      options: options
        .filter((o) => o.templateRoomId === room.id)
        .map((option) => ({
          ...option,
          images: images.filter((i) => i.templateOptionId === option.id),
          items: items.filter((i) => i.templateOptionId === option.id),
        })),
    })),
  };
}

export async function createTemplate(input: {
  name: string;
  description?: string | null;
}): Promise<Template> {
  const rows = await sql`
    INSERT INTO templates (name, description)
    VALUES (${input.name}, ${input.description ?? null})
    RETURNING id, name, description,
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return rows[0] as unknown as Template;
}

export async function updateTemplate(
  id: string,
  input: { name?: string; description?: string | null }
): Promise<Template | null> {
  const rows = await sql`
    UPDATE templates SET
      name = COALESCE(${input.name ?? null}, name),
      description = CASE WHEN ${input.description !== undefined} THEN ${input.description ?? null} ELSE description END
    WHERE id = ${id}
    RETURNING id, name, description,
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return (rows[0] as unknown as Template) ?? null;
}

export async function deleteTemplate(id: string): Promise<void> {
  await sql`DELETE FROM templates WHERE id = ${id}`;
}

// ── Rooms ──

export async function createTemplateRoom(
  templateId: string,
  name: string
): Promise<TemplateRoom> {
  const rows = await sql`
    INSERT INTO template_rooms (template_id, name, sort_order)
    VALUES (
      ${templateId}, ${name},
      COALESCE((SELECT MAX(sort_order) + 1 FROM template_rooms WHERE template_id = ${templateId}), 0)
    )
    RETURNING id, template_id AS "templateId", name, sort_order AS "sortOrder",
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return rows[0] as unknown as TemplateRoom;
}

export async function updateTemplateRoom(
  id: string,
  input: { name: string }
): Promise<TemplateRoom | null> {
  const rows = await sql`
    UPDATE template_rooms SET name = ${input.name}
    WHERE id = ${id}
    RETURNING id, template_id AS "templateId", name, sort_order AS "sortOrder",
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return (rows[0] as unknown as TemplateRoom) ?? null;
}

export async function deleteTemplateRoom(id: string): Promise<void> {
  await sql`DELETE FROM template_rooms WHERE id = ${id}`;
}

export async function reorderTemplateRooms(
  templateId: string,
  orderedIds: string[]
): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await sql`
      UPDATE template_rooms SET sort_order = ${i}
      WHERE id = ${orderedIds[i]} AND template_id = ${templateId}
    `;
  }
}

// ── Options ──

export async function createTemplateOption(
  templateRoomId: string,
  input: {
    name: string;
    priceFrom: number;
    priceTo: number;
    description?: string | null;
  }
): Promise<TemplateOption> {
  const rows = await sql`
    INSERT INTO template_options (template_room_id, name, price_from, price_to, description, sort_order)
    VALUES (
      ${templateRoomId}, ${input.name}, ${input.priceFrom}, ${input.priceTo}, ${input.description ?? null},
      COALESCE((SELECT MAX(sort_order) + 1 FROM template_options WHERE template_room_id = ${templateRoomId}), 0)
    )
    RETURNING id, template_room_id AS "templateRoomId", name,
      price_from AS "priceFrom", price_to AS "priceTo", description,
      sort_order AS "sortOrder", created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return rows[0] as unknown as TemplateOption;
}

export async function updateTemplateOption(
  id: string,
  input: {
    name?: string;
    priceFrom?: number;
    priceTo?: number;
    description?: string | null;
  }
): Promise<TemplateOption | null> {
  const rows = await sql`
    UPDATE template_options SET
      name = COALESCE(${input.name ?? null}, name),
      price_from = COALESCE(${input.priceFrom ?? null}, price_from),
      price_to = COALESCE(${input.priceTo ?? null}, price_to),
      description = CASE WHEN ${input.description !== undefined} THEN ${input.description ?? null} ELSE description END
    WHERE id = ${id}
    RETURNING id, template_room_id AS "templateRoomId", name,
      price_from AS "priceFrom", price_to AS "priceTo", description,
      sort_order AS "sortOrder", created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return (rows[0] as unknown as TemplateOption) ?? null;
}

export async function deleteTemplateOption(id: string): Promise<void> {
  await sql`DELETE FROM template_options WHERE id = ${id}`;
}

export async function reorderTemplateOptions(
  templateRoomId: string,
  orderedIds: string[]
): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await sql`
      UPDATE template_options SET sort_order = ${i}
      WHERE id = ${orderedIds[i]} AND template_room_id = ${templateRoomId}
    `;
  }
}

// ── Option images ──

export async function addTemplateOptionImage(
  templateOptionId: string,
  input: { imageUrl: string; cloudinaryPublicId: string }
): Promise<TemplateOptionImage> {
  const rows = await sql`
    INSERT INTO template_option_images (template_option_id, image_url, cloudinary_public_id, sort_order)
    VALUES (
      ${templateOptionId}, ${input.imageUrl}, ${input.cloudinaryPublicId},
      COALESCE((SELECT MAX(sort_order) + 1 FROM template_option_images WHERE template_option_id = ${templateOptionId}), 0)
    )
    RETURNING id, template_option_id AS "templateOptionId", image_url AS "imageUrl",
      cloudinary_public_id AS "cloudinaryPublicId", sort_order AS "sortOrder", created_at AS "createdAt"
  `;
  return rows[0] as unknown as TemplateOptionImage;
}

export async function deleteTemplateOptionImage(id: string): Promise<TemplateOptionImage | null> {
  const rows = await sql`
    DELETE FROM template_option_images WHERE id = ${id}
    RETURNING id, template_option_id AS "templateOptionId", image_url AS "imageUrl",
      cloudinary_public_id AS "cloudinaryPublicId", sort_order AS "sortOrder", created_at AS "createdAt"
  `;
  return (rows[0] as unknown as TemplateOptionImage) ?? null;
}

// ── Option items ──

export async function addTemplateOptionItem(
  templateOptionId: string,
  input: { name: string; spec?: string | null; price?: number | null }
): Promise<TemplateOptionItem> {
  const rows = await sql`
    INSERT INTO template_option_items (template_option_id, name, spec, price, sort_order)
    VALUES (
      ${templateOptionId}, ${input.name}, ${input.spec ?? null}, ${input.price ?? null},
      COALESCE((SELECT MAX(sort_order) + 1 FROM template_option_items WHERE template_option_id = ${templateOptionId}), 0)
    )
    RETURNING id, template_option_id AS "templateOptionId", name, spec, price,
      sort_order AS "sortOrder", created_at AS "createdAt"
  `;
  return rows[0] as unknown as TemplateOptionItem;
}

export async function updateTemplateOptionItem(
  id: string,
  input: { name?: string; spec?: string | null; price?: number | null }
): Promise<TemplateOptionItem | null> {
  const rows = await sql`
    UPDATE template_option_items SET
      name = COALESCE(${input.name ?? null}, name),
      spec = CASE WHEN ${input.spec !== undefined} THEN ${input.spec ?? null} ELSE spec END,
      price = CASE WHEN ${input.price !== undefined} THEN ${input.price ?? null} ELSE price END
    WHERE id = ${id}
    RETURNING id, template_option_id AS "templateOptionId", name, spec, price,
      sort_order AS "sortOrder", created_at AS "createdAt"
  `;
  return (rows[0] as unknown as TemplateOptionItem) ?? null;
}

export async function deleteTemplateOptionItem(id: string): Promise<void> {
  await sql`DELETE FROM template_option_items WHERE id = ${id}`;
}
