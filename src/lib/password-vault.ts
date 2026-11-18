import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { normalizeEnvValue } from "./env";

// Salinan password pelanggan yang bisa dibuka khusus superadmin, terpisah dari hash bcrypt
// yang dipakai login. AES-256-GCM dengan kunci PASSWORD_VIEW_KEY (32 byte, base64) yang
// hanya ada di environment server POS dan member; database saja tidak cukup untuk membukanya.
// Isi file ini wajib sama dengan POS LBQueen/src/lib/password-vault.ts.

const VERSION = "v1";

function vaultKey() {
  const raw = normalizeEnvValue(process.env.PASSWORD_VIEW_KEY);
  if (!raw) return null;
  const key = Buffer.from(raw, "base64");
  return key.length === 32 ? key : null;
}

export const vaultReady = () => vaultKey() !== null;

export function sealPassword(plain: string): string | null {
  const key = vaultKey();
  if (!key) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [VERSION, iv, cipher.getAuthTag(), data]
    .map((part) => (typeof part === "string" ? part : part.toString("base64url")))
    .join(".");
}

export function openPassword(sealed: string): string | null {
  const key = vaultKey();
  const [version, iv, tag, data] = sealed.split(".");
  if (!key || version !== VERSION || !iv || !tag || !data) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(data, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}
