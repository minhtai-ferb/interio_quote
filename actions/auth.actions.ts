"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { verifyAdminCredentials } from "@/lib/credentials";

function safeNextPath(value: FormDataEntryValue | null): string {
  const s = typeof value === "string" ? value : "";
  // Only allow same-site relative paths — never redirect off-site.
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  return "/admin/quotes";
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!verifyAdminCredentials(email, password)) {
    redirect(`/?error=1&next=${encodeURIComponent(next)}`);
  }

  const token = await createSessionToken(email.toLowerCase());
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

  redirect(next);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/");
}
