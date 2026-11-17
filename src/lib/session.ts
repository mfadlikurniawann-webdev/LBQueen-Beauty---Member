import { normalizeEnvValue } from "./env.ts";

export type Session = { id: number; kind: "admin" | "customer"; expires: number; role?: "superadmin" | "admin" | "kasir" };

async function signingKey() {
  const secret = normalizeEnvValue(process.env.SESSION_SECRET);
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET minimal 32 karakter belum dikonfigurasi.");
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function encode(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(value: string) {
  return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
}

export async function createSession(id: number, kind: Session["kind"], maxAge: number, role: Session["role"] = "kasir") {
  const payload = encode(new TextEncoder().encode(JSON.stringify({ id, kind, expires: Date.now() + maxAge * 1000, ...(kind === "admin" ? { role } : {}) })));
  const signature = await crypto.subtle.sign("HMAC", await signingKey(), new TextEncoder().encode(payload));
  return `${payload}.${encode(new Uint8Array(signature))}`;
}

export async function verifySession(value: string | undefined, kind: Session["kind"]): Promise<Session | null> {
  if (!value) return null;
  try {
    const parts = value.split(".");
    if (parts.length !== 2) return null;
    const valid = await crypto.subtle.verify("HMAC", await signingKey(), decode(parts[1]), new TextEncoder().encode(parts[0]));
    if (!valid) return null;
    const session = JSON.parse(new TextDecoder().decode(decode(parts[0]))) as Session;
    return Number.isSafeInteger(session.id) && session.id > 0 && session.kind === kind && session.expires > Date.now() && (kind !== "admin" || ["superadmin", "admin", "kasir"].includes(session.role || "")) ? session : null;
  } catch { return null; }
}
