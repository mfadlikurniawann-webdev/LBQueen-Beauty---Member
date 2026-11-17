import { createClient } from "@supabase/supabase-js";
import { normalizeEnvValue } from "./env";

// Variabel ini harus disetting di file .env.local nantinya oleh user
const supabaseUrl = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Export supabase instance untuk dipakai di pages/components
export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (input, init) => {
      const url = new URL(
        typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
      );
      if (typeof window !== "undefined" && url.pathname.startsWith("/rest/v1/")) {
        return fetch(`/api/database/${url.pathname.slice("/rest/v1/".length)}${url.search}`, {
          ...init,
          credentials: "same-origin",
        });
      }
      return fetch(input, init);
    },
  },
});
