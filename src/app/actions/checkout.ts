"use server";

import { getCustomerSession } from "@/lib/customer-auth";
import { serverDatabase } from "@/lib/supabase-server";
import { consumeLimit } from "@/lib/rate-limit";

export async function checkoutOnline(input: {
  items: { product_id: number; variant_id?: number; qty: number }[];
  voucherCode: string | null;
  bookingDate: string;
  bookingTime: string;
  method: string;
  expectedTotal: number;
  requestKey: string;
}) {
  const session = await getCustomerSession();
  if (!session) return { error: "Sesi berakhir. Silakan masuk kembali." };
  if (
    !Array.isArray(input.items) ||
    !input.items.length ||
    input.items.length > 100 ||
    !input.items.every(
      (item) =>
        Number.isSafeInteger(item.product_id) &&
        item.product_id > 0 &&
        (item.variant_id == null ||
          (Number.isSafeInteger(item.variant_id) && item.variant_id > 0)) &&
        Number.isInteger(item.qty) &&
        item.qty > 0 &&
        item.qty <= 100,
    ) ||
    (input.voucherCode !== null &&
      (typeof input.voucherCode !== "string" || input.voucherCode.length > 50)) ||
    (input.bookingDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.bookingDate)) ||
    (input.bookingTime && !/^\d{2}:\d{2}(:\d{2})?$/.test(input.bookingTime)) ||
    !Number.isFinite(input.expectedTotal) ||
    !["bank", "qris"].includes(input.method) ||
    !/^[\da-f-]{36}$/i.test(input.requestKey)
  )
    return { error: "Data checkout tidak valid." };
  try {
    if (!(await consumeLimit("checkout", session.id, 300)))
      return { error: "Terlalu banyak percobaan checkout. Coba kembali dalam beberapa menit." };
    const { data, error } = await serverDatabase().rpc("create_online_order", {
      p_customer_id: session.id,
      p_items: input.items,
      p_voucher_code: input.voucherCode,
      p_booking_date: input.bookingDate || null,
      p_booking_time: input.bookingTime || null,
      p_method: input.method,
      p_expected_total: input.expectedTotal,
      p_request_key: input.requestKey,
    });
    if (error)
      return {
        error:
          error.code === "P0001" ? error.message : "Pesanan gagal disimpan. Silakan coba kembali.",
      };
    return {
      data: data as {
        orders: {
          id: number;
          product_name: string;
          qty: number;
          price: number;
          total_price: number;
        }[];
        total: number;
      },
    };
  } catch {
    return {
      error: "Database belum dapat dihubungi. Keranjang tetap tersimpan; silakan coba kembali.",
    };
  }
}
