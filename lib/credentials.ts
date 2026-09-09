import "server-only";
import { createHash, timingSafeEqual } from "crypto";

// Node-only (uses `crypto`) — import this only from Server Actions/Route
// Handlers, never from middleware.ts (Edge runtime). Session verification
// lives in lib/session.ts instead, which middleware can safely import.

/** Constant-time string comparison (via digest) — avoids leaking password length/content through timing. */
function timingSafeStringEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a).digest();
  const bh = createHash("sha256").update(b).digest();
  return timingSafeEqual(ah, bh);
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const validEmail = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;
  if (!validEmail || !validPassword) return false;
  const emailOk = timingSafeStringEqual(email.trim().toLowerCase(), validEmail.trim().toLowerCase());
  const passwordOk = timingSafeStringEqual(password, validPassword);
  return emailOk && passwordOk;
}
