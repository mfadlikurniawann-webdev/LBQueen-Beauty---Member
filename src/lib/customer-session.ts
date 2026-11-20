import { createSession, verifySession, type Session } from "./session";
import { normalizeEnvValue } from "./env";

export const CUSTOMER_COOKIE = "lbqueen_customer";
/** Batas absolut sesi pelanggan. */
export const CUSTOMER_MAX_AGE_S = 60 * 60 * 24 * 30;
/** Sesi berakhir bila tidak ada aktivitas selama ini. */
export const CUSTOMER_IDLE_MS = 14 * 24 * 60 * 60 * 1000;
/** Cookie diperbarui (last diperbarui) paling sering sekali sehari. */
const RENEW_AFTER_MS = 24 * 60 * 60 * 1000;
const VERSION_TTL_MS = 30_000;

export const customerCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge,
  path: "/",
});

// Versi sesi dibaca dengan fetch biasa (bukan supabase-js) agar ringan dan bisa dipakai di proxy.
// Cache di globalThis: route handler dan server action dibundel terpisah, sehingga Map biasa
// tidak terbagi dan "keluar dari semua perangkat" tidak langsung terasa di route lain.
const globalCache = globalThis as typeof globalThis & {
  __lbqSessionVersions?: Map<number, { version: number; at: number }>;
};
const versionCache = (globalCache.__lbqSessionVersions ??= new Map());

export function forgetSessionVersion(id: number) {
  versionCache.delete(id);
}

/**
 * Versi sesi pelanggan dari database, cache 30 detik per instance.
 * Kolom belum ada (migrasi POS belum jalan) dianggap versi 0. Gangguan database
 * mengembalikan null sehingga pemanggil tidak mengeluarkan pengguna karena masalah sementara.
 */
export async function currentSessionVersion(id: number): Promise<number | null> {
  const cached = versionCache.get(id);
  if (cached && Date.now() - cached.at < VERSION_TTL_MS) return cached.version;
  const url =
    normalizeEnvValue(process.env.SUPABASE_URL) ||
    normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key =
    normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    normalizeEnvValue(process.env.SUPABASE_SECRET_KEY);
  if (!url || !key) return null;
  const headers: Record<string, string> = { apikey: key, Accept: "application/json" };
  if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;
  try {
    const response = await fetch(
      `${url}/rest/v1/customers?id=eq.${id}&select=session_version`,
      { headers, cache: "no-store", signal: AbortSignal.timeout(8000) },
    );
    let version: number;
    if (response.ok) {
      const rows = (await response.json()) as { session_version?: number | null }[];
      if (!rows.length) version = -1; // akun sudah dihapus: tidak ada versi yang cocok
      else version = Number(rows[0].session_version ?? 0);
    } else {
      const body = (await response.json().catch(() => ({}))) as { code?: string; message?: string };
      if (body.code === "42703" || /session_version/.test(body.message || "")) version = 0;
      else return null;
    }
    versionCache.set(id, { version, at: Date.now() });
    return version;
  } catch {
    return null;
  }
}

export type CustomerSessionResult = {
  session: Session;
  /** Nilai cookie baru bila sesi perlu diperpanjang (sliding renewal). */
  renewed?: { value: string; maxAge: number };
};

/**
 * Satu-satunya pemeriksa sesi pelanggan: tanda tangan + batas absolut, batas tidak aktif,
 * dan versi sesi (dicabut lewat "Keluar dari semua perangkat" atau ganti password).
 */
export async function readCustomerSession(
  value: string | undefined,
): Promise<CustomerSessionResult | null> {
  const session = await verifySession(value, "customer");
  if (!session) return null;
  const now = Date.now();
  // Cookie lama (sebelum fitur ini) belum punya last/v: diterima lalu langsung diperbarui.
  const legacy = session.last === undefined;
  const last = session.last ?? now;
  if (now - last > CUSTOMER_IDLE_MS) return null;
  const current = await currentSessionVersion(session.id);
  const version = session.v ?? 0;
  if (current !== null && current !== version) return null;
  if (!legacy && now - last < RENEW_AFTER_MS) return { session };
  const maxAge = Math.floor((session.expires - now) / 1000);
  if (maxAge <= 0) return { session };
  const renewedValue = await createSession(session.id, "customer", maxAge, undefined, {
    version: current ?? version,
    expires: session.expires,
  });
  return { session, renewed: { value: renewedValue, maxAge } };
}

/** Membuat cookie sesi baru untuk pelanggan dengan versi tertentu. */
export async function issueCustomerSession(id: number, version: number) {
  const value = await createSession(id, "customer", CUSTOMER_MAX_AGE_S, undefined, { version });
  return { value, options: customerCookieOptions(CUSTOMER_MAX_AGE_S) };
}
