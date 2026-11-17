import "server-only";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { serverDatabase } from "./supabase-server";

export async function clientIp() {
  const list = await headers();
  return list.get("x-real-ip") || list.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// consume_login_attempt allows 8 hits per key per 15 minutes. Shorter windows rotate the key,
// giving 8 hits per window without a schema change.
export async function consumeLimit(scope: string, identifier: string | number, windowSeconds = 900) {
  const bucket = windowSeconds < 900 ? `:${Math.floor(Date.now() / (windowSeconds * 1000))}` : "";
  const key = createHash("sha256").update(`${scope}:${String(identifier).trim().toLowerCase()}${bucket}`).digest("hex");
  const db = serverDatabase();
  const { data, error } = await db.rpc("consume_login_attempt", { p_key: key });
  if (error) throw error;
  if (Math.random() < 0.02) await db.from("auth_attempts").delete().lt("started_at", new Date(Date.now() - 86400000).toISOString());
  return data === true;
}
