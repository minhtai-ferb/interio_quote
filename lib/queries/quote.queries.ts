import crypto from "crypto";
import { sql, withTransaction } from "@/lib/db";
import { assertValidStatusTransition } from "@/lib/quote-status";
import type {
  Quote,
  QuoteRoom,
  QuoteOption,
  QuoteOptionImage,
  QuoteOptionItem,
  QuoteSelection,
  QuoteWithDetails,
  QuoteListItem,
  QuoteStatus,
  CreateQuoteInput,
} from "@/types/quote";

function generatePublicToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

// ── Reads ──

export async function getQuotes(filters?: {
  status?: QuoteStatus;
  search?: string;
}): Promise<QuoteListItem[]> {
  const status = filters?.status ?? null;
  const search = filters?.search?.trim() ? `%${filters.search.trim()}%` : null;
  const rows = await sql`
    SELECT
      q.id, q.code, c.name AS "customerName", q.project_type AS "projectType",
      q.area_m2 AS "areaM2", q.status, q.created_at AS "createdAt",
      COALESCE(SUM(ranges.min_price), 0) AS "priceFrom",
      COALESCE(SUM(ranges.max_price), 0) AS "priceTo"
    FROM quotes q
    JOIN customers c ON c.id = q.customer_id
    LEFT JOIN (
      SELECT qr.quote_id, qr.id AS room_id,
        MIN(qo.price_from) AS min_price, MAX(qo.price_to) AS max_price
      FROM quote_rooms qr
      JOIN quote_options qo ON qo.quote_room_id = qr.id
      GROUP BY qr.quote_id, qr.id
    ) ranges ON ranges.quote_id = q.id
    WHERE (${status}::quote_status IS NULL OR q.status = ${status})
      AND (${search}::text IS NULL OR c.name ILIKE ${search})
    GROUP BY q.id, c.name
    ORDER BY q.created_at DESC
  `;
  return rows as unknown as QuoteListItem[];
}

async function assembleQuoteDetails(
  quote: Quote & { customerName: string; customerPhone: string | null; customerEmail: string | null; customerNote: string | null }
): Promise<QuoteWithDetails> {
  const rooms = (await sql`
    SELECT id, quote_id AS "quoteId", name, sort_order AS "sortOrder",
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM quote_rooms WHERE quote_id = ${quote.id} ORDER BY sort_order, created_at
  `) as unknown as QuoteRoom[];

  const options = (await sql`
    SELECT o.id, o.quote_room_id AS "quoteRoomId", o.name,
      o.price_from AS "priceFrom", o.price_to AS "priceTo", o.description,
      o.sort_order AS "sortOrder", o.created_at AS "createdAt", o.updated_at AS "updatedAt"
    FROM quote_options o
    JOIN quote_rooms r ON r.id = o.quote_room_id
    WHERE r.quote_id = ${quote.id}
    ORDER BY o.sort_order, o.created_at
  `) as unknown as QuoteOption[];

  const optionIds = options.map((o) => o.id);

  const images = optionIds.length
    ? ((await sql`
        SELECT id, quote_option_id AS "quoteOptionId", image_url AS "imageUrl",
          cloudinary_public_id AS "cloudinaryPublicId", sort_order AS "sortOrder", created_at AS "createdAt"
        FROM quote_option_images
        WHERE quote_option_id = ANY(${optionIds})
        ORDER BY sort_order, created_at
      `) as unknown as QuoteOptionImage[])
    : [];

  const items = optionIds.length
    ? ((await sql`
        SELECT id, quote_option_id AS "quoteOptionId", name, spec, price,
          sort_order AS "sortOrder", created_at AS "createdAt"
        FROM quote_option_items
        WHERE quote_option_id = ANY(${optionIds})
        ORDER BY sort_order, created_at
      `) as unknown as QuoteOptionItem[])
    : [];

  const selections = (await sql`
    SELECT id, quote_id AS "quoteId", quote_room_id AS "quoteRoomId",
      quote_option_id AS "quoteOptionId", final_price AS "finalPrice",
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM quote_selections WHERE quote_id = ${quote.id}
  `) as unknown as QuoteSelection[];

  return {
    id: quote.id,
    code: quote.code,
    customerId: quote.customerId,
    sourceTemplateId: quote.sourceTemplateId,
    projectType: quote.projectType,
    areaM2: quote.areaM2,
    note: quote.note,
    status: quote.status,
    publicToken: quote.publicToken,
    discountAmount: quote.discountAmount,
    staffNote: quote.staffNote,
    finalTotal: quote.finalTotal,
    finalizedAt: quote.finalizedAt,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
    customer: {
      id: quote.customerId,
      name: quote.customerName,
      phone: quote.customerPhone,
      email: quote.customerEmail,
      note: quote.customerNote,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    },
    rooms: rooms.map((room) => {
      const selection = selections.find((s) => s.quoteRoomId === room.id);
      return {
        ...room,
        selectedOptionId: selection?.quoteOptionId ?? null,
        selectedFinalPrice: selection?.finalPrice ?? null,
        options: options
          .filter((o) => o.quoteRoomId === room.id)
          .map((option) => ({
            ...option,
            images: images.filter((i) => i.quoteOptionId === option.id),
            items: items.filter((i) => i.quoteOptionId === option.id),
          })),
      };
    }),
  };
}

export async function getQuoteById(id: string): Promise<QuoteWithDetails | null> {
  const rows = await sql`
    SELECT q.id, q.code, q.customer_id AS "customerId", q.source_template_id AS "sourceTemplateId",
      q.project_type AS "projectType", q.area_m2 AS "areaM2", q.note, q.status,
      q.public_token AS "publicToken", q.discount_amount AS "discountAmount",
      q.staff_note AS "staffNote", q.final_total AS "finalTotal", q.finalized_at AS "finalizedAt",
      q.created_at AS "createdAt", q.updated_at AS "updatedAt",
      c.name AS "customerName", c.phone AS "customerPhone", c.email AS "customerEmail", c.note AS "customerNote"
    FROM quotes q JOIN customers c ON c.id = q.customer_id
    WHERE q.id = ${id}
  `;
  const quote = rows[0] as unknown as (Quote & { customerName: string; customerPhone: string | null; customerEmail: string | null; customerNote: string | null }) | undefined;
  if (!quote) return null;
  return assembleQuoteDetails(quote);
}

export async function getQuoteByPublicToken(
  token: string
): Promise<QuoteWithDetails | null> {
  const rows = await sql`
    SELECT q.id, q.code, q.customer_id AS "customerId", q.source_template_id AS "sourceTemplateId",
      q.project_type AS "projectType", q.area_m2 AS "areaM2", q.note, q.status,
      q.public_token AS "publicToken", q.discount_amount AS "discountAmount",
      q.staff_note AS "staffNote", q.final_total AS "finalTotal", q.finalized_at AS "finalizedAt",
      q.created_at AS "createdAt", q.updated_at AS "updatedAt",
      c.name AS "customerName", c.phone AS "customerPhone", c.email AS "customerEmail", c.note AS "customerNote"
    FROM quotes q JOIN customers c ON c.id = q.customer_id
    WHERE q.public_token = ${token}
  `;
  const quote = rows[0] as unknown as (Quote & { customerName: string; customerPhone: string | null; customerEmail: string | null; customerNote: string | null }) | undefined;
  if (!quote) return null;
  return assembleQuoteDetails(quote);
}

// ── Create from template (transactional copy) ──

export async function createQuoteFromTemplate(
  input: CreateQuoteInput
): Promise<QuoteWithDetails> {
  const quoteId = await withTransaction(async (client) => {
    const codeRes = await client.query<{ code: string }>(
      `SELECT code FROM quotes ORDER BY created_at DESC LIMIT 1`
    );
    let next = 1;
    const last = codeRes.rows[0]?.code;
    if (last) {
      const m = /Q-(\d+)/.exec(last);
      if (m) next = parseInt(m[1], 10) + 1;
    }
    const code = "Q-" + String(next).padStart(4, "0");
    const publicToken = generatePublicToken();

    const quoteRes = await client.query<{ id: string }>(
      `INSERT INTO quotes (code, customer_id, source_template_id, project_type, area_m2, note, status, public_token)
       VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT', $7)
       RETURNING id`,
      [
        code,
        input.customerId,
        input.templateId,
        input.projectType ?? null,
        input.areaM2 ?? null,
        input.note ?? null,
        publicToken,
      ]
    );
    const newQuoteId = quoteRes.rows[0].id;

    const roomsRes = await client.query<{
      id: string;
      name: string;
      sort_order: number;
    }>(
      `SELECT id, name, sort_order FROM template_rooms WHERE template_id = $1 ORDER BY sort_order, created_at`,
      [input.templateId]
    );

    for (const room of roomsRes.rows) {
      const newRoomRes = await client.query<{ id: string }>(
        `INSERT INTO quote_rooms (quote_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id`,
        [newQuoteId, room.name, room.sort_order]
      );
      const newRoomId = newRoomRes.rows[0].id;

      const optionsRes = await client.query<{
        id: string;
        name: string;
        price_from: number;
        price_to: number;
        description: string | null;
        sort_order: number;
      }>(
        `SELECT id, name, price_from, price_to, description, sort_order
         FROM template_options WHERE template_room_id = $1 ORDER BY sort_order, created_at`,
        [room.id]
      );

      for (const option of optionsRes.rows) {
        const newOptionRes = await client.query<{ id: string }>(
          `INSERT INTO quote_options (quote_room_id, name, price_from, price_to, description, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            newRoomId,
            option.name,
            option.price_from,
            option.price_to,
            option.description,
            option.sort_order,
          ]
        );
        const newOptionId = newOptionRes.rows[0].id;

        const imagesRes = await client.query<{
          image_url: string;
          cloudinary_public_id: string;
          sort_order: number;
        }>(
          `SELECT image_url, cloudinary_public_id, sort_order
           FROM template_option_images WHERE template_option_id = $1 ORDER BY sort_order, created_at`,
          [option.id]
        );
        for (const img of imagesRes.rows) {
          await client.query(
            `INSERT INTO quote_option_images (quote_option_id, image_url, cloudinary_public_id, sort_order)
             VALUES ($1, $2, $3, $4)`,
            [newOptionId, img.image_url, img.cloudinary_public_id, img.sort_order]
          );
        }

        const itemsRes = await client.query<{
          name: string;
          spec: string | null;
          price: number | null;
          sort_order: number;
        }>(
          `SELECT name, spec, price, sort_order
           FROM template_option_items WHERE template_option_id = $1 ORDER BY sort_order, created_at`,
          [option.id]
        );
        for (const item of itemsRes.rows) {
          await client.query(
            `INSERT INTO quote_option_items (quote_option_id, name, spec, price, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [newOptionId, item.name, item.spec, item.price, item.sort_order]
          );
        }
      }
    }

    return newQuoteId;
  });

  const quote = await getQuoteById(quoteId);
  if (!quote) throw new Error("Tạo báo giá thất bại");
  return quote;
}

// ── Updates ──

export async function updateQuoteInfo(
  id: string,
  input: {
    projectType?: string | null;
    areaM2?: number | null;
    note?: string | null;
  }
): Promise<Quote | null> {
  const rows = await sql`
    UPDATE quotes SET
      project_type = CASE WHEN ${input.projectType !== undefined} THEN ${input.projectType ?? null} ELSE project_type END,
      area_m2 = CASE WHEN ${input.areaM2 !== undefined} THEN ${input.areaM2 ?? null} ELSE area_m2 END,
      note = CASE WHEN ${input.note !== undefined} THEN ${input.note ?? null} ELSE note END
    WHERE id = ${id}
    RETURNING id, code, customer_id AS "customerId", source_template_id AS "sourceTemplateId",
      project_type AS "projectType", area_m2 AS "areaM2", note, status,
      public_token AS "publicToken", discount_amount AS "discountAmount",
      staff_note AS "staffNote", final_total AS "finalTotal", finalized_at AS "finalizedAt",
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return (rows[0] as unknown as Quote) ?? null;
}

export async function updateQuoteStaffFields(
  id: string,
  input: { staffNote?: string | null; discountAmount?: number }
): Promise<Quote | null> {
  const rows = await sql`
    UPDATE quotes SET
      staff_note = CASE WHEN ${input.staffNote !== undefined} THEN ${input.staffNote ?? null} ELSE staff_note END,
      discount_amount = COALESCE(${input.discountAmount ?? null}, discount_amount)
    WHERE id = ${id}
    RETURNING id, code, customer_id AS "customerId", source_template_id AS "sourceTemplateId",
      project_type AS "projectType", area_m2 AS "areaM2", note, status,
      public_token AS "publicToken", discount_amount AS "discountAmount",
      staff_note AS "staffNote", final_total AS "finalTotal", finalized_at AS "finalizedAt",
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return (rows[0] as unknown as Quote) ?? null;
}

async function getQuoteStatus(id: string): Promise<QuoteStatus | null> {
  const rows = await sql`SELECT status FROM quotes WHERE id = ${id}`;
  return (rows[0]?.status as QuoteStatus | undefined) ?? null;
}

/** Moves a freshly-created DRAFT quote into CONSULTING the first time staff opens it. Idempotent. */
export async function ensureConsulting(id: string): Promise<void> {
  const status = await getQuoteStatus(id);
  if (!status || status !== "DRAFT") return;
  assertValidStatusTransition(status, "CONSULTING");
  await sql`UPDATE quotes SET status = 'CONSULTING' WHERE id = ${id}`;
}

export async function submitCustomerSelections(
  token: string,
  selections: { roomId: string; optionId: string }[]
): Promise<QuoteWithDetails> {
  return withTransaction(async (client) => {
    const quoteRes = await client.query<{ id: string; status: QuoteStatus }>(
      `SELECT id, status FROM quotes WHERE public_token = $1 FOR UPDATE`,
      [token]
    );
    const quote = quoteRes.rows[0];
    if (!quote) throw new Error("Không tìm thấy báo giá");
    if (quote.status === "FINALIZED") {
      throw new Error("Báo giá đã được chốt, không thể thay đổi lựa chọn");
    }
    if (quote.status === "DRAFT") {
      throw new Error("Báo giá chưa sẵn sàng để lựa chọn");
    }

    for (const sel of selections) {
      const roomRes = await client.query(
        `SELECT id FROM quote_rooms WHERE id = $1 AND quote_id = $2`,
        [sel.roomId, quote.id]
      );
      if (roomRes.rows.length === 0) {
        throw new Error("Khu vực không thuộc báo giá này");
      }
      const optionRes = await client.query(
        `SELECT id FROM quote_options WHERE id = $1 AND quote_room_id = $2`,
        [sel.optionId, sel.roomId]
      );
      if (optionRes.rows.length === 0) {
        throw new Error("Phương án không còn tồn tại cho khu vực này");
      }

      await client.query(
        `INSERT INTO quote_selections (quote_id, quote_room_id, quote_option_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (quote_id, quote_room_id)
         DO UPDATE SET quote_option_id = EXCLUDED.quote_option_id, updated_at = now()`,
        [quote.id, sel.roomId, sel.optionId]
      );
    }

    if (quote.status === "CONSULTING") {
      await client.query(
        `UPDATE quotes SET status = 'CUSTOMER_SUBMITTED' WHERE id = $1`,
        [quote.id]
      );
    }

    return quote.id as string;
  }).then((id) => getQuoteById(id).then((q) => {
    if (!q) throw new Error("Không tìm thấy báo giá");
    return q;
  }));
}

export async function finalizeQuote(
  id: string,
  input: {
    discountAmount?: number;
    staffNote?: string | null;
    finalPrices: { roomId: string; optionId: string; finalPrice: number }[];
  }
): Promise<QuoteWithDetails> {
  await withTransaction(async (client) => {
    const quoteRes = await client.query<{ status: QuoteStatus }>(
      `SELECT status FROM quotes WHERE id = $1 FOR UPDATE`,
      [id]
    );
    const status = quoteRes.rows[0]?.status;
    if (!status) throw new Error("Không tìm thấy báo giá");
    assertValidStatusTransition(status, "FINALIZED");

    for (const fp of input.finalPrices) {
      const optionRes = await client.query(
        `SELECT id FROM quote_options WHERE id = $1 AND quote_room_id = $2`,
        [fp.optionId, fp.roomId]
      );
      if (optionRes.rows.length === 0) {
        throw new Error("Phương án không thuộc khu vực này");
      }
      await client.query(
        `INSERT INTO quote_selections (quote_id, quote_room_id, quote_option_id, final_price)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (quote_id, quote_room_id)
         DO UPDATE SET quote_option_id = EXCLUDED.quote_option_id, final_price = EXCLUDED.final_price, updated_at = now()`,
        [id, fp.roomId, fp.optionId, fp.finalPrice]
      );
    }

    const discountAmount = input.discountAmount ?? 0;
    const sumRes = await client.query<{ sum: string | null }>(
      `SELECT SUM(final_price)::int AS sum FROM quote_selections WHERE quote_id = $1`,
      [id]
    );
    const grand = (sumRes.rows[0]?.sum ? Number(sumRes.rows[0].sum) : 0) - discountAmount;

    await client.query(
      `UPDATE quotes SET
         status = 'FINALIZED', finalized_at = now(), final_total = $1,
         discount_amount = $2,
         staff_note = CASE WHEN $3 THEN $4 ELSE staff_note END
       WHERE id = $5`,
      [grand, discountAmount, input.staffNote !== undefined, input.staffNote ?? null, id]
    );
  });

  const quote = await getQuoteById(id);
  if (!quote) throw new Error("Không tìm thấy báo giá");
  return quote;
}

// ── Quote rooms (independent of template) ──

export async function createQuoteRoom(
  quoteId: string,
  name: string
): Promise<QuoteRoom> {
  const rows = await sql`
    INSERT INTO quote_rooms (quote_id, name, sort_order)
    VALUES (
      ${quoteId}, ${name},
      COALESCE((SELECT MAX(sort_order) + 1 FROM quote_rooms WHERE quote_id = ${quoteId}), 0)
    )
    RETURNING id, quote_id AS "quoteId", name, sort_order AS "sortOrder",
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return rows[0] as unknown as QuoteRoom;
}

export async function updateQuoteRoom(
  id: string,
  input: { name: string }
): Promise<QuoteRoom | null> {
  const rows = await sql`
    UPDATE quote_rooms SET name = ${input.name} WHERE id = ${id}
    RETURNING id, quote_id AS "quoteId", name, sort_order AS "sortOrder",
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return (rows[0] as unknown as QuoteRoom) ?? null;
}

export async function deleteQuoteRoom(id: string): Promise<void> {
  await sql`DELETE FROM quote_rooms WHERE id = ${id}`;
}

export async function reorderQuoteRooms(
  quoteId: string,
  orderedIds: string[]
): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await sql`UPDATE quote_rooms SET sort_order = ${i} WHERE id = ${orderedIds[i]} AND quote_id = ${quoteId}`;
  }
}

// ── Quote options ──

export async function createQuoteOption(
  quoteRoomId: string,
  input: {
    name: string;
    priceFrom: number;
    priceTo: number;
    description?: string | null;
  }
): Promise<QuoteOption> {
  const rows = await sql`
    INSERT INTO quote_options (quote_room_id, name, price_from, price_to, description, sort_order)
    VALUES (
      ${quoteRoomId}, ${input.name}, ${input.priceFrom}, ${input.priceTo}, ${input.description ?? null},
      COALESCE((SELECT MAX(sort_order) + 1 FROM quote_options WHERE quote_room_id = ${quoteRoomId}), 0)
    )
    RETURNING id, quote_room_id AS "quoteRoomId", name,
      price_from AS "priceFrom", price_to AS "priceTo", description,
      sort_order AS "sortOrder", created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return rows[0] as unknown as QuoteOption;
}

export async function updateQuoteOption(
  id: string,
  input: {
    name?: string;
    priceFrom?: number;
    priceTo?: number;
    description?: string | null;
  }
): Promise<QuoteOption | null> {
  const rows = await sql`
    UPDATE quote_options SET
      name = COALESCE(${input.name ?? null}, name),
      price_from = COALESCE(${input.priceFrom ?? null}, price_from),
      price_to = COALESCE(${input.priceTo ?? null}, price_to),
      description = CASE WHEN ${input.description !== undefined} THEN ${input.description ?? null} ELSE description END
    WHERE id = ${id}
    RETURNING id, quote_room_id AS "quoteRoomId", name,
      price_from AS "priceFrom", price_to AS "priceTo", description,
      sort_order AS "sortOrder", created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return (rows[0] as unknown as QuoteOption) ?? null;
}

export async function deleteQuoteOption(id: string): Promise<void> {
  await sql`DELETE FROM quote_options WHERE id = ${id}`;
}

export async function reorderQuoteOptions(
  quoteRoomId: string,
  orderedIds: string[]
): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await sql`UPDATE quote_options SET sort_order = ${i} WHERE id = ${orderedIds[i]} AND quote_room_id = ${quoteRoomId}`;
  }
}

// ── Quote option images ──

export async function addQuoteOptionImage(
  quoteOptionId: string,
  input: { imageUrl: string; cloudinaryPublicId: string }
): Promise<QuoteOptionImage> {
  const rows = await sql`
    INSERT INTO quote_option_images (quote_option_id, image_url, cloudinary_public_id, sort_order)
    VALUES (
      ${quoteOptionId}, ${input.imageUrl}, ${input.cloudinaryPublicId},
      COALESCE((SELECT MAX(sort_order) + 1 FROM quote_option_images WHERE quote_option_id = ${quoteOptionId}), 0)
    )
    RETURNING id, quote_option_id AS "quoteOptionId", image_url AS "imageUrl",
      cloudinary_public_id AS "cloudinaryPublicId", sort_order AS "sortOrder", created_at AS "createdAt"
  `;
  return rows[0] as unknown as QuoteOptionImage;
}

export async function deleteQuoteOptionImage(id: string): Promise<QuoteOptionImage | null> {
  const rows = await sql`
    DELETE FROM quote_option_images WHERE id = ${id}
    RETURNING id, quote_option_id AS "quoteOptionId", image_url AS "imageUrl",
      cloudinary_public_id AS "cloudinaryPublicId", sort_order AS "sortOrder", created_at AS "createdAt"
  `;
  return (rows[0] as unknown as QuoteOptionImage) ?? null;
}

// ── Quote option items ──

export async function addQuoteOptionItem(
  quoteOptionId: string,
  input: { name: string; spec?: string | null; price?: number | null }
): Promise<QuoteOptionItem> {
  const rows = await sql`
    INSERT INTO quote_option_items (quote_option_id, name, spec, price, sort_order)
    VALUES (
      ${quoteOptionId}, ${input.name}, ${input.spec ?? null}, ${input.price ?? null},
      COALESCE((SELECT MAX(sort_order) + 1 FROM quote_option_items WHERE quote_option_id = ${quoteOptionId}), 0)
    )
    RETURNING id, quote_option_id AS "quoteOptionId", name, spec, price,
      sort_order AS "sortOrder", created_at AS "createdAt"
  `;
  return rows[0] as unknown as QuoteOptionItem;
}

export async function updateQuoteOptionItem(
  id: string,
  input: { name?: string; spec?: string | null; price?: number | null }
): Promise<QuoteOptionItem | null> {
  const rows = await sql`
    UPDATE quote_option_items SET
      name = COALESCE(${input.name ?? null}, name),
      spec = CASE WHEN ${input.spec !== undefined} THEN ${input.spec ?? null} ELSE spec END,
      price = CASE WHEN ${input.price !== undefined} THEN ${input.price ?? null} ELSE price END
    WHERE id = ${id}
    RETURNING id, quote_option_id AS "quoteOptionId", name, spec, price,
      sort_order AS "sortOrder", created_at AS "createdAt"
  `;
  return (rows[0] as unknown as QuoteOptionItem) ?? null;
}

export async function deleteQuoteOptionItem(id: string): Promise<void> {
  await sql`DELETE FROM quote_option_items WHERE id = ${id}`;
}
