"use server";

import { serverDatabase } from "@/lib/supabase-server";
import { createSession, verifySession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { clientIp, consumeLimit } from "@/lib/rate-limit";

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
      ([key]) => !["password", "password_hash", "password_plain"].includes(key),
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

export async function loginCustomer(identifier: string, passwordPlain: string) {
  const value = identifier.trim();
  if (!value || !passwordPlain) return { error: "Username/nomor HP dan password harus diisi." };
  if (value.length > 100 || passwordPlain.length > 128)
    return { error: "Akun tidak ditemukan atau password salah." };
  if (!/^[\p{L}\p{N}_+@.\-]+$/u.test(value))
    return { error: "Format username atau nomor HP tidak valid." };
  try {
    if (
      !(await consumeLimit("customer-ip", await clientIp(), 60)) ||
      !(await consumeLimit("customer", value))
    )
      return { error: tooMany };
    const db = serverDatabase();
    const { data, error } = await db
      .from("customers")
      .select("*")
      .or(`phone.eq.${value},username.eq.${value}`)
      .limit(1);
    if (error) return { error: unavailable };
    const customer = data?.[0];
    if (!customer || !(await matchesPassword(passwordPlain, customer)))
      return { error: "Akun tidak ditemukan atau password salah." };
    if (!customer.password_hash || !/^\$2[aby]\$/.test(customer.password_hash)) {
      const { error: migrationError } = await db
        .from("customers")
        .update({ password_hash: await bcrypt.hash(passwordPlain, 12), password_plain: null })
        .eq("id", customer.id);
      if (migrationError) return { error: unavailable };
    }
    await setSession(customer.id);
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
  if (
    input.name.length > 100 ||
    (input.nik?.length || 0) > 20 ||
    (input.address?.length || 0) > 500 ||
    input.passwordPlain.length > 128
  )
    return { error: "Data pendaftaran terlalu panjang." };
  const name = input.name.trim();
  const username = input.username.trim();
  const phone = input.phone.trim();
  if (
    !name ||
    !/^[a-zA-Z0-9_]{3,50}$/.test(username) ||
    !/^\+?[0-9]{8,16}$/.test(phone) ||
    input.passwordPlain.length < 8
  )
    return {
      error:
        "Isi nama, username (3–50 huruf/angka/underscore), nomor HP, dan password minimal 8 karakter.",
    };
  try {
    if (
      !(await consumeLimit("register-ip", await clientIp(), 300)) ||
      !(await consumeLimit("register", phone))
    )
      return { error: tooMany };
    const db = serverDatabase();
    const { data, error } = await db
      .from("customers")
      .insert({
        name,
        phone,
        username,
        nik: input.nik?.trim() || null,
        address: input.address?.trim() || null,
        password_hash: await bcrypt.hash(input.passwordPlain, 12),
      })
      .select()
      .single();
    if (error)
      return {
        error: error.code === "23505" ? "Username atau nomor HP sudah terdaftar." : unavailable,
      };
    await setSession(data.id);
    return { data: publicProfile(data) };
  } catch {
    return { error: unavailable };
  }
}

export async function updateCustomerPassword(oldPassword: string, newPassword: string) {
  const session = await verifySession((await cookies()).get("lbqueen_customer")?.value, "customer");
  if (!session) return { error: "Sesi berakhir. Silakan masuk kembali." };
  if (newPassword.length < 8 || newPassword.length > 128)
    return { error: "Password minimal 8 dan maksimal 128 karakter." };
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
      .update({ password_hash: await bcrypt.hash(newPassword, 12), password_plain: null })
      .eq("id", session.id);
    return updateError ? { error: "Password gagal diperbarui." } : { success: true };
  } catch {
    return { error: unavailable };
  }
}

export async function logoutCustomer() {
  (await cookies()).delete("lbqueen_customer");
}
