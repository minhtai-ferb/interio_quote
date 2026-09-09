import { sql } from "@/lib/db";
import type { Customer, CreateCustomerInput } from "@/types/customer";

export async function getCustomers(): Promise<Customer[]> {
  const rows = await sql`
    SELECT id, name, phone, email, note,
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM customers
    ORDER BY created_at DESC
  `;
  return rows as unknown as Customer[];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const rows = await sql`
    SELECT id, name, phone, email, note,
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM customers WHERE id = ${id}
  `;
  return (rows[0] as unknown as Customer) ?? null;
}

export async function createCustomer(
  input: CreateCustomerInput
): Promise<Customer> {
  const rows = await sql`
    INSERT INTO customers (name, phone, email, note)
    VALUES (${input.name}, ${input.phone ?? null}, ${input.email ?? null}, ${input.note ?? null})
    RETURNING id, name, phone, email, note,
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return rows[0] as unknown as Customer;
}

export async function updateCustomer(
  id: string,
  input: Partial<CreateCustomerInput>
): Promise<Customer | null> {
  const rows = await sql`
    UPDATE customers SET
      name = COALESCE(${input.name ?? null}, name),
      phone = CASE WHEN ${input.phone !== undefined} THEN ${input.phone ?? null} ELSE phone END,
      email = CASE WHEN ${input.email !== undefined} THEN ${input.email ?? null} ELSE email END,
      note = CASE WHEN ${input.note !== undefined} THEN ${input.note ?? null} ELSE note END
    WHERE id = ${id}
    RETURNING id, name, phone, email, note,
      created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  return (rows[0] as unknown as Customer) ?? null;
}
