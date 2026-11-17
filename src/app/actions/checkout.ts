"use server";

import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { serverDatabase } from "@/lib/supabase-server";

export async function checkoutOnline(input: { items: { product_id: number; variant_id?: number; qty: number }[]; voucherCode: string | null; bookingDate: string; bookingTime: string; method: string; expectedTotal: number; requestKey: string }) {
  const session = await verifySession((await cookies()).get("lbqueen_customer")?.value, "customer");
  if (!session) return { error: "Sesi berakhir. Silakan masuk kembali." };
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > 100 || !Number.isFinite(input.expectedTotal) || !["bank", "qris"].includes(input.method) || !/^[\da-f-]{36}$/i.test(input.requestKey)) return { error: "Data checkout tidak valid." };
  try {
    const { data, error } = await serverDatabase().rpc("create_online_order", { p_customer_id: session.id, p_items: input.items, p_voucher_code: input.voucherCode, p_booking_date: input.bookingDate || null, p_booking_time: input.bookingTime || null, p_method: input.method, p_expected_total: input.expectedTotal, p_request_key: input.requestKey });
    if (error) return { error: error.code === "P0001" ? error.message : "Pesanan gagal disimpan. Silakan coba kembali." };
    return { data: data as { orders: { id: number; product_name: string; qty: number; price: number; total_price: number }[]; total: number } };
  } catch { return { error: "Database belum dapat dihubungi. Keranjang tetap tersimpan; silakan coba kembali." }; }
}
