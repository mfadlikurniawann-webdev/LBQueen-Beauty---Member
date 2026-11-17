"use server";

import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { serverDatabase } from "@/lib/supabase-server";
import { consumeLimit } from "@/lib/rate-limit";

export async function submitOrderReview(orderId: number, rating: number, text: string) {
  const session = await verifySession((await cookies()).get("lbqueen_customer")?.value, "customer");
  if (!session) return { error: "Silakan masuk kembali." };
  if (
    !Number.isSafeInteger(orderId) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    typeof text !== "string" ||
    text.length > 2000
  )
    return { error: "Rating atau ulasan tidak valid (maksimal 2.000 karakter)." };
  try {
    if (!(await consumeLimit("review", session.id, 300)))
      return { error: "Terlalu banyak percobaan. Coba kembali dalam beberapa menit." };
    const { data, error } = await serverDatabase()
      .from("customer_orders")
      .update({
        review_rating: rating,
        review_text: text.trim(),
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("customer_id", session.id)
      .eq("status", "completed")
      .is("reviewed_at", null)
      .select("id")
      .maybeSingle();
    if (error || !data)
      return { error: "Ulasan gagal disimpan. Pastikan pesanan selesai dan belum diulas." };
    return { success: true };
  } catch {
    return { error: "Ulasan belum dapat disimpan. Silakan coba kembali." };
  }
}
