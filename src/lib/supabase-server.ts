import "server-only";
import { createClient } from "@supabase/supabase-js";
import { normalizeEnvValue } from "./env";

export function serverDatabase() {
  const url =
    normalizeEnvValue(process.env.SUPABASE_URL) ||
    normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key =
    normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    normalizeEnvValue(process.env.SUPABASE_SECRET_KEY);
  if (!url || !key)
    throw new Error("Konfigurasi database server belum lengkap. Hubungi pengelola LBQueen.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
          signal: init?.signal
            ? AbortSignal.any([init.signal, AbortSignal.timeout(10000)])
            : AbortSignal.timeout(10000),
        }),
    },
  });
}
