import { neon, Pool, type PoolClient } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

/** Tagged-template SQL for single-statement, parameterized queries. */
export const sql = neon(DATABASE_URL);

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: DATABASE_URL });
  }
  return pool;
}

/**
 * Runs `fn` inside a BEGIN/COMMIT block on a single pooled connection,
 * rolling back on any thrown error. Use for multi-statement writes that
 * must succeed or fail together (e.g. copying a template into a quote).
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
