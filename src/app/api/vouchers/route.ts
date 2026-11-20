import { NextRequest } from "next/server";
import { unstable_cache } from "next/cache";
import { CUSTOMER_COOKIE, readCustomerSession } from "@/lib/customer-session";
import { serverDatabase } from "@/lib/supabase-server";
import { TIER_LABELS, customerTier, voucherAllowsTier } from "@/lib/vouchers";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

/**
 * "Voucher Saya": voucher kode aktif yang boleh dipakai tier pelanggan yang sedang masuk.
 * Voucher khusus membership lain tidak pernah dikirim ke browser.
 */
/**
 * Daftar voucher sama untuk semua pelanggan dalam satu tier; simpan 60 detik di cache data
 * server agar tidak menembak database setiap kali beranda/promo/keranjang dibuka.
 */
const vouchersForTier = unstable_cache(
  async (tier: string) => {
    const db = serverDatabase();
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
    return (data || []).filter(
      // Promo produk otomatis (tanpa batasan membership & tanpa minimal) sudah masuk harga katalog.
      (v) =>
        voucherAllowsTier(v.membership_types, tier) &&
        !(v.product_id && !v.membership_types?.length && Number(v.min_transaction) === 0),
    );
  },
  ["member-vouchers-by-tier"],
  { revalidate: 60 },
);

export async function GET(request: NextRequest) {
  const session = (await readCustomerSession(request.cookies.get(CUSTOMER_COOKIE)?.value))?.session;
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
    const vouchers = await vouchersForTier(tier);
    return Response.json({ tier, vouchers }, { headers });
  } catch {
    return Response.json({ message: "Voucher belum dapat dimuat." }, { status: 503, headers });
  }
}
