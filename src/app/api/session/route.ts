import { NextRequest, NextResponse } from "next/server";
import { CUSTOMER_COOKIE, customerCookieOptions, readCustomerSession } from "@/lib/customer-session";
import { serverDatabase } from "@/lib/supabase-server";
import { isMissingColumn } from "@/lib/customer-lookup";

const PROFILE_COLUMNS = "id,name,phone,points,is_member,membership_type,username,address";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(CUSTOMER_COOKIE)?.value;
  const result = await readCustomerSession(cookie);
  const headers = { "Cache-Control": "private, no-store" };
  if (!result) {
    const response = NextResponse.json({ customer: false, profile: null }, { headers });
    // Sesi kedaluwarsa, tidak aktif terlalu lama, atau dicabut: hapus cookie lama.
    if (cookie) response.cookies.delete(CUSTOMER_COOKIE);
    return response;
  }
  try {
    const db = serverDatabase();
    const read = (columns: string) =>
      db.from("customers").select(columns).eq("id", result.session.id).maybeSingle();
    let { data, error } = await read(`${PROFILE_COLUMNS},avatar_url`);
    // avatar_url ditambahkan migrasi POS; sebelum migrasi jalan, profil tetap dimuat tanpa foto.
    if (error && isMissingColumn(error, "avatar_url")) ({ data, error } = await read(PROFILE_COLUMNS));
    if (error) throw error;
    const response = NextResponse.json({ customer: Boolean(data), profile: data }, { headers });
    if (result.renewed)
      response.cookies.set(
        CUSTOMER_COOKIE,
        result.renewed.value,
        customerCookieOptions(result.renewed.maxAge),
      );
    return response;
  } catch {
    return NextResponse.json(
      { error: "Informasi akun belum dapat dimuat." },
      { status: 503, headers },
    );
  }
}
