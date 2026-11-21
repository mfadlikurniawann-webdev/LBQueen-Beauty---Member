import { NextRequest } from "next/server";
import { CUSTOMER_COOKIE, readCustomerSession } from "@/lib/customer-session";
import { serverDatabase } from "@/lib/supabase-server";
import { takenSlots } from "@/lib/booking-slots";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

/** Slot jadwal treatment yang sudah dipakai (hanya tanggal + jam, tanpa data pelanggan). */
export async function GET(request: NextRequest) {
  const session = (await readCustomerSession(request.cookies.get(CUSTOMER_COOKIE)?.value))?.session;
  if (!session) return Response.json({ message: "Silakan masuk." }, { status: 401, headers });
  try {
    return Response.json({ taken: await takenSlots(serverDatabase()) }, { headers });
  } catch {
    return Response.json({ message: "Jadwal belum dapat dimuat." }, { status: 503, headers });
  }
}
