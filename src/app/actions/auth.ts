"use server";

import { serverDatabase } from "@/lib/supabase-server";
import { createSession, verifySession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { clientIp, consumeLimit } from "@/lib/rate-limit";
import { sealPassword, vaultReady } from "@/lib/password-vault";
import {
  duplicateMessage,
  nameError,
  nikError,
  normalizePhone,
  normalizeUsername,
  passwordError,
  phoneError,
  usernameError,
} from "@/lib/validation";

type Credentials = { password_hash?: string; password?: string; password_plain?: string };

async function matchesPassword(plain: string, user: Credentials) {
  if (user.password_hash && /^\$2[aby]\$/.test(user.password_hash))
    return bcrypt.compare(plain, user.password_hash);
  return (
    user.password === plain ||
    user.password_plain === plain ||
    user.password_hash === Buffer.from(plain).toString("base64")
  );
}

function publicProfile(user: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(user).filter(
      ([key]) =>
        !["password", "password_hash", "password_plain", "password_encrypted"].includes(key),
    ),
  );
}

async function setSession(id: number) {
  const maxAge = 60 * 60 * 24 * 30;
  const value = await createSession(id, "customer", maxAge);
  (await cookies()).set("lbqueen_customer", value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}

const unavailable =
  "Database belum dapat dihubungi atau belum dikonfigurasi. Hubungi pengelola LBQueen.";

const tooMany = "Terlalu banyak percobaan. Coba kembali dalam beberapa menit.";

const likeEscape = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

function phoneCandidates(phone: string, raw: string) {
  const local = phone.slice(1);
  return [...new Set([phone, `62${local}`, `+62${local}`, raw])];
}

export async function loginCustomer(identifier: string, passwordPlain: string) {
  const value = identifier.trim();
  if (!value || !passwordPlain) return { error: "Username/nomor HP dan password harus diisi." };
  if (value.length > 100 || passwordPlain.length > 128)
    return { error: "Akun tidak ditemukan atau password salah." };
  const isPhone = /^\+?[0-9\s().-]{8,}$/.test(value);
  const phone = isPhone ? normalizePhone(value) : "";
  const username = isPhone ? "" : normalizeUsername(value);
  if (isPhone && phoneError(phone))
    return { error: "Format nomor HP tidak valid. Contoh: 08123456789." };
  if (!isPhone && /\s/.test(username))
    return {
      error: `Username tidak boleh mengandung spasi. Coba "${username.replace(/\s+/g, "")}" atau masuk dengan nomor HP.`,
    };
  if (!isPhone && usernameError(username))
    return { error: `${usernameError(username)} Anda juga bisa masuk dengan nomor HP.` };
  try {
    if (
      !(await consumeLimit("customer-ip", await clientIp(), 60)) ||
      !(await consumeLimit("customer", phone || username))
    )
      return { error: tooMany };
    const db = serverDatabase();
    const query = () => db.from("customers").select("*").limit(5);
    const lookups = isPhone
      ? [query().in("phone", phoneCandidates(phone, value))]
      : [query().ilike("username", likeEscape(username))];
    if (isPhone && /^[0-9_]{3,50}$/.test(value)) lookups.push(query().eq("username", value));
    const results = await Promise.all(lookups);
    if (results.some((r) => r.error)) return { error: unavailable };
    let customer: Record<string, unknown> | undefined;
    for (const row of results.flatMap((r) => r.data || [])) {
      if (await matchesPassword(passwordPlain, row)) {
        customer = row;
        break;
      }
    }
    if (!customer) return { error: "Akun tidak ditemukan atau password salah." };
    const hash = customer.password_hash as string | undefined;
    const upgrade: Record<string, string | null> = {};
    if (!hash || !/^\$2[aby]\$/.test(hash)) {
      upgrade.password_hash = await bcrypt.hash(passwordPlain, 12);
      upgrade.password_plain = null;
    }
    // Akun lama belum punya salinan terenkripsi; lengkapi saat password terbukti benar.
    if (!customer.password_encrypted && vaultReady())
      upgrade.password_encrypted = sealPassword(passwordPlain);
    if (Object.keys(upgrade).length) {
      const { error: migrationError } = await db
        .from("customers")
        .update(upgrade)
        .eq("id", customer.id);
      if (migrationError && upgrade.password_hash) return { error: unavailable };
    }
    await setSession(customer.id as number);
    return { data: publicProfile(customer) };
  } catch {
    return { error: unavailable };
  }
}

export async function registerCustomer(input: {
  name: string;
  phone: string;
  username: string;
  passwordPlain: string;
  nik?: string;
  address?: string;
  website?: string;
}) {
  if (input.website) return { error: "Pendaftaran tidak dapat diproses." };
  if ((input.address?.length || 0) > 500) return { error: "Alamat maksimal 500 karakter." };
  const invalid =
    nameError(input.name) ||
    usernameError(input.username) ||
    phoneError(input.phone) ||
    nikError(input.nik || "") ||
    passwordError(input.passwordPlain, true);
  if (invalid) return { error: invalid };
  const name = input.name.trim();
  const username = normalizeUsername(input.username);
  const phone = normalizePhone(input.phone);
  try {
    if (
      !(await consumeLimit("register-ip", await clientIp(), 300)) ||
      !(await consumeLimit("register", phone))
    )
      return { error: tooMany };
    const db = serverDatabase();
    const [byUsername, byPhone] = await Promise.all([
      db.from("customers").select("id").ilike("username", likeEscape(username)).limit(1),
      db
        .from("customers")
        .select("id")
        .in("phone", phoneCandidates(phone, input.phone.trim()))
        .limit(1),
    ]);
    if (byUsername.error || byPhone.error) return { error: unavailable };
    if (byUsername.data?.length) return { error: "Username sudah dipakai. Gunakan username lain." };
    if (byPhone.data?.length)
      return { error: "Nomor HP sudah terdaftar. Silakan masuk atau hubungi kasir LBQueen." };
    const { data, error } = await db
      .from("customers")
      .insert({
        name,
        phone,
        username,
        nik: input.nik?.trim() || null,
        address: input.address?.trim() || null,
        password_hash: await bcrypt.hash(input.passwordPlain, 12),
        password_encrypted: sealPassword(input.passwordPlain),
      })
      .select()
      .single();
    if (error) return { error: duplicateMessage(error) || unavailable };
    await setSession(data.id);
    return { data: publicProfile(data) };
  } catch {
    return { error: unavailable };
  }
}

export async function updateCustomerPassword(oldPassword: string, newPassword: string) {
  const session = await verifySession((await cookies()).get("lbqueen_customer")?.value, "customer");
  if (!session) return { error: "Sesi berakhir. Silakan masuk kembali." };
  const invalidPassword = passwordError(newPassword, true);
  if (invalidPassword) return { error: invalidPassword };
  try {
    if (!(await consumeLimit("customer-password", session.id))) return { error: tooMany };
    const db = serverDatabase();
    const { data, error } = await db
      .from("customers")
      .select("password_hash,password_plain")
      .eq("id", session.id)
      .single();
    if (error || !data) return { error: unavailable };
    if (!(await matchesPassword(oldPassword, data))) return { error: "Password lama salah." };
    const { error: updateError } = await db
      .from("customers")
      .update({
        password_hash: await bcrypt.hash(newPassword, 12),
        password_plain: null,
        password_encrypted: sealPassword(newPassword),
      })
      .eq("id", session.id);
    return updateError ? { error: "Password gagal diperbarui." } : { success: true };
  } catch {
    return { error: unavailable };
  }
}

export async function logoutCustomer() {
  (await cookies()).delete("lbqueen_customer");
}
