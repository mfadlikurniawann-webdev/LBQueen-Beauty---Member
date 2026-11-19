import { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";
import { serverDatabase } from "@/lib/supabase-server";
import { TIER_LABELS, customerTier, voucherAllowsTier } from "@/lib/vouchers";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

/**
 * "Voucher Saya": voucher kode aktif yang boleh dipakai tier pelanggan yang sedang masuk.
 * Voucher khusus membership lain tidak pernah dikirim ke browser.
 */
export async function GET(request: NextRequest) {
  const session = await verifySession(request.cookies.get("lbqueen_customer")?.value, "customer");
  if (!session) return Response.json({ message: "Silakan masuk." }, { status: 401, headers });
  try {
    const db = serverDatabase();
    const { data: customer, error: customerError } = await db
      .from("customers")
      .select("is_member,membership_type")
      .eq("id", session.id)
      .maybeSingle();
    if (customerError || !customer)
      return Response.json({ message: "Akun tidak ditemukan." }, { status: 401, headers });
    const tier = customerTier(customer);
    // Hanya tier yang dikenal yang dimasukkan ke filter (nilai lain tidak mungkin ada di membership_types).
    const scope = TIER_LABELS[tier]
      ? `membership_types.eq.{},membership_types.cs.{${tier}}`
      : "membership_types.eq.{}";
    const { data, error } = await db
      .from("vouchers")
      .select(
        "id,code,name,type,discount_amount,min_transaction,product_id,membership_types,products(name)",
      )
      .eq("is_active", true)
      .or(scope)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(50);
    if (error) throw error;
    const vouchers = (data || []).filter(
      // Promo produk otomatis (tanpa batasan membership & tanpa minimal) sudah masuk harga katalog.
      (v) =>
        voucherAllowsTier(v.membership_types, tier) &&
        !(v.product_id && !v.membership_types?.length && Number(v.min_transaction) === 0),
    );
    return Response.json({ tier, vouchers }, { headers });
  } catch {
    return Response.json({ message: "Voucher belum dapat dimuat." }, { status: 503, headers });
  }
}
