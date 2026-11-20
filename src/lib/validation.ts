// Aturan ini wajib sama dengan POS LBQueen/src/lib/validation.ts (pembuatan akun oleh kasir).

export const USERNAME_RULE =
  "3 sampai 50 karakter, hanya huruf kecil, angka, dan garis bawah (_), tanpa spasi.";
export const PHONE_RULE = "Nomor HP diawali 0, 8, 62, atau +62, berisi 9 sampai 15 digit.";
export const PASSWORD_MIN = 8;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function usernameError(value: string): string | null {
  const v = normalizeUsername(value);
  if (!v) return "Username wajib diisi.";
  if (/\s/.test(v)) return "Username tidak boleh mengandung spasi.";
  if (/[^a-z0-9_]/.test(v))
    return "Username hanya boleh huruf, angka, dan garis bawah (_). Tanda baca dan simbol tidak diizinkan.";
  if (v.length < 3) return "Username minimal 3 karakter.";
  if (v.length > 50) return "Username maksimal 50 karakter.";
  return null;
}

export function slugUsername(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 44);
}

export function normalizePhone(value: string) {
  const raw = value.trim().replace(/[\s.\-()]/g, "");
  if (raw.startsWith("+62")) return "0" + raw.slice(3);
  if (raw.startsWith("62")) return "0" + raw.slice(2);
  if (raw.startsWith("8")) return "0" + raw;
  return raw;
}

export function phoneError(value: string): string | null {
  if (!value.trim()) return "Nomor HP wajib diisi.";
  const v = normalizePhone(value);
  if (/[^0-9]/.test(v))
    return "Nomor HP hanya boleh berisi angka (spasi dan tanda - akan dihapus otomatis).";
  if (!/^0[0-9]{8,14}$/.test(v)) return PHONE_RULE;
  return null;
}

export function passwordError(value: string, required: boolean): string | null {
  if (!value) return required ? "Password wajib diisi." : null;
  if (value !== value.trim()) return "Password tidak boleh diawali atau diakhiri spasi.";
  if (value.length < PASSWORD_MIN) return `Password minimal ${PASSWORD_MIN} karakter.`;
  if (value.length > 128) return "Password maksimal 128 karakter.";
  return null;
}

export function nikError(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (!/^[0-9]{16}$/.test(v)) return "NIK harus 16 digit angka sesuai KTP.";
  return null;
}

export function nameError(value: string): string | null {
  const v = value.trim();
  if (!v) return "Nama wajib diisi.";
  if (v.length > 100) return "Nama maksimal 100 karakter.";
  return null;
}

export function voucherCodeError(value: string): string | null {
  const v = value.trim();
  if (!v) return "Kode voucher wajib diisi.";
  if (!/^[A-Za-z0-9_-]{3,30}$/.test(v))
    return "Kode voucher 3 sampai 30 karakter, hanya huruf, angka, - dan _, tanpa spasi.";
  return null;
}

export function duplicateMessage(
  error: { code?: string; message?: string; details?: string } | null | undefined,
) {
  if (error?.code !== "23505") return null;
  const text = `${error.message || ""} ${error.details || ""}`;
  if (text.includes("username"))
    return "Username sudah dipakai pelanggan lain. Gunakan username lain.";
  if (text.includes("phone")) return "Nomor HP sudah terdaftar untuk pelanggan lain.";
  if (text.includes("code")) return "Kode voucher sudah ada. Gunakan kode lain.";
  return "Data yang sama sudah terdaftar.";
}
