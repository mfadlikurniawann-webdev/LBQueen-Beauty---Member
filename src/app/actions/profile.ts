"use server";

import { getCustomerSession } from "@/lib/customer-auth";
import { isMissingColumn, likeEscape, phoneCandidates } from "@/lib/customer-lookup";
import { consumeLimit } from "@/lib/rate-limit";
import { serverDatabase } from "@/lib/supabase-server";
import {
  duplicateMessage,
  nameError,
  normalizePhone,
  normalizeUsername,
  phoneError,
  usernameError,
} from "@/lib/validation";

const BUCKET = "customer-avatars";
const MAX_BYTES = 300 * 1024;
const unavailable = "Data belum dapat disimpan. Coba lagi.";
const tooMany = "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
const sessionEnded = "Sesi berakhir. Silakan masuk kembali.";

type Field = "name" | "phone" | "username" | "address";
export type ProfileResult = { success?: true; error?: string; field?: Field };

/** Ubah nama, alamat, nomor HP, dan username pelanggan yang sedang masuk. */
export async function updateCustomerProfile(input: {
  name: string;
  address: string;
  phone: string;
  username: string;
}): Promise<ProfileResult> {
  const session = await getCustomerSession();
  if (!session) return { error: sessionEnded };
  const checks: [Field, string | null][] = [
    ["name", nameError(String(input.name ?? ""))],
    ["phone", phoneError(String(input.phone ?? ""))],
    ["username", usernameError(String(input.username ?? ""))],
    ["address", String(input.address ?? "").length > 500 ? "Alamat maksimal 500 karakter." : null],
  ];
  const invalid = checks.find(([, error]) => error);
  if (invalid) return { error: invalid[1]!, field: invalid[0] };
  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  const username = normalizeUsername(input.username);
  const address = input.address.trim() || null;
  try {
    if (!(await consumeLimit("customer-profile", session.id, 300))) return { error: tooMany };
    const db = serverDatabase();
    const [byUsername, byPhone] = await Promise.all([
      db.from("customers").select("id").ilike("username", likeEscape(username)).neq("id", session.id).limit(1),
      db
        .from("customers")
        .select("id")
        .in("phone", phoneCandidates(phone, input.phone.trim()))
        .neq("id", session.id)
        .limit(1),
    ]);
    if (byUsername.error || byPhone.error) return { error: unavailable };
    if (byUsername.data?.length)
      return { error: "Username sudah dipakai. Gunakan username lain.", field: "username" };
    if (byPhone.data?.length)
      return { error: "Nomor HP sudah dipakai akun lain.", field: "phone" };
    const { error } = await db
      .from("customers")
      .update({ name, phone, username, address })
      .eq("id", session.id);
    if (error) return { error: duplicateMessage(error) || unavailable };
    return { success: true };
  } catch {
    return { error: unavailable };
  }
}

const isWebp = (b: Uint8Array) =>
  String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP";

/** Path di bucket dari URL publik Supabase Storage milik pelanggan ini (untuk menghapus foto lama). */
function ownPath(url: string | null | undefined, customerId: number) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url?.indexOf(marker) ?? -1;
  if (!url || index < 0) return null;
  const path = decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
  return path.startsWith(`customers/${customerId}/`) ? path : null;
}

async function currentAvatar(db: ReturnType<typeof serverDatabase>, id: number) {
  const { data, error } = await db.from("customers").select("avatar_url").eq("id", id).maybeSingle();
  if (error) return { missing: isMissingColumn(error, "avatar_url"), url: null as string | null, error };
  return { missing: false, url: (data?.avatar_url as string | null) ?? null, error: null };
}

/** Unggah foto profil (WebP hasil kompres di perangkat) ke Storage lalu simpan URL-nya. */
export async function uploadCustomerAvatar(form: FormData): Promise<{ url?: string; error?: string }> {
  const session = await getCustomerSession();
  if (!session) return { error: sessionEnded };
  const file = form.get("file");
  if (!(file instanceof Blob) || !file.size) return { error: "Foto tidak ditemukan." };
  if (file.size > MAX_BYTES) return { error: "Ukuran foto maksimal 300 KB." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isWebp(bytes)) return { error: "Format foto tidak valid." };
  try {
    if (!(await consumeLimit("customer-avatar", session.id, 300))) return { error: tooMany };
    const db = serverDatabase();
    const previous = await currentAvatar(db, session.id);
    if (previous.missing) return { error: "Foto profil belum bisa dipakai. Coba lagi nanti." };
    if (previous.error) return { error: unavailable };
    const path = `customers/${session.id}/${crypto.randomUUID()}.webp`;
    const upload = () =>
      db.storage.from(BUCKET).upload(path, bytes, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });
    let { error } = await upload();
    if (error && /bucket not found|resource was not found/i.test(error.message)) {
      const created = await db.storage.createBucket(BUCKET, { public: true });
      if (created.error && !/already exists/i.test(created.error.message))
        return { error: "Penyimpanan foto belum siap." };
      ({ error } = await upload());
    }
    if (error) return { error: "Foto gagal diunggah. Coba lagi." };
    const url = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const { error: saveError } = await db.from("customers").update({ avatar_url: url }).eq("id", session.id);
    if (saveError) {
      await db.storage.from(BUCKET).remove([path]);
      return { error: unavailable };
    }
    const old = ownPath(previous.url, session.id);
    if (old) await db.storage.from(BUCKET).remove([old]);
    return { url };
  } catch {
    return { error: unavailable };
  }
}

/** Hapus foto profil (kembali ke inisial). */
export async function removeCustomerAvatar(): Promise<{ success?: true; error?: string }> {
  const session = await getCustomerSession();
  if (!session) return { error: sessionEnded };
  try {
    if (!(await consumeLimit("customer-avatar", session.id, 300))) return { error: tooMany };
    const db = serverDatabase();
    const previous = await currentAvatar(db, session.id);
    if (previous.missing) return { success: true };
    if (previous.error) return { error: unavailable };
    const { error } = await db.from("customers").update({ avatar_url: null }).eq("id", session.id);
    if (error) return { error: unavailable };
    const old = ownPath(previous.url, session.id);
    if (old) await db.storage.from(BUCKET).remove([old]);
    return { success: true };
  } catch {
    return { error: unavailable };
  }
}
