/** Escape pola ILIKE agar username dicocokkan persis (tanpa wildcard). */
export const likeEscape = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

/** Nomor HP tersimpan dalam beberapa bentuk lama (0..., 62..., +62...). */
export function phoneCandidates(phone: string, raw: string) {
  const local = phone.slice(1);
  return [...new Set([phone, `62${local}`, `+62${local}`, raw])];
}

/** Kolom belum ada di database (migrasi POS belum jalan). */
export const isMissingColumn = (error: { code?: string; message?: string } | null | undefined, column: string) =>
  !!error && (error.code === "42703" || (error.message || "").includes(column));
