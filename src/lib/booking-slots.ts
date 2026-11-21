import type { SupabaseClient } from "@supabase/supabase-js";
import { BOOKING_DAYS, addDays, jakartaNow, slotKey } from "./clinic";

// Jadwal pesanan online tersimpan di nama produk: "Nama [Jadwal: 2026-11-25 14:00] Rp ...".
const ORDER_SCHEDULE = /\[Jadwal: (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/;

/**
 * Slot yang sudah dipakai dalam rentang pemesanan: booking POS (selain yang dibatalkan) dan pesanan
 * online treatment yang belum dibatalkan. Hanya kunci "YYYY-MM-DD HH:00" yang dikembalikan, tanpa data pelanggan.
 */
export async function takenSlots(db: SupabaseClient, { exceptCustomer, now = jakartaNow() }: { exceptCustomer?: number; now?: ReturnType<typeof jakartaNow> } = {}) {
  const from = now.date;
  const to = addDays(from, BOOKING_DAYS);
  let orderQuery = db
    .from("customer_orders")
    .select("product_name")
    .like("product_name", "%[Jadwal: %")
    .neq("status", "cancelled")
    // Pesanan untuk jadwal ke depan dibuat paling lama BOOKING_DAYS hari lalu.
    .gte("ordered_at", new Date(Date.now() - (BOOKING_DAYS + 1) * 86400000).toISOString())
    .limit(2000);
  // Checkout mengecualikan pesanan pelanggan itu sendiri, supaya kirim ulang dengan kunci yang sama tidak ditolak.
  if (exceptCustomer) orderQuery = orderQuery.neq("customer_id", exceptCustomer);
  const [bookings, orders] = await Promise.all([
    db
      .from("bookings")
      .select("booking_date,booking_time")
      .gte("booking_date", from)
      .lte("booking_date", to)
      .neq("status", "cancelled")
      .limit(2000),
    orderQuery,
  ]);
  if (bookings.error) throw bookings.error;
  if (orders.error) throw orders.error;
  const taken = new Set<string>();
  for (const b of bookings.data || []) taken.add(slotKey(String(b.booking_date), String(b.booking_time)));
  for (const o of orders.data || []) {
    const match = ORDER_SCHEDULE.exec(String(o.product_name));
    if (match && match[1] >= from && match[1] <= to) taken.add(slotKey(match[1], match[2]));
  }
  return [...taken].sort();
}
