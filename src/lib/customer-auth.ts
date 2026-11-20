import "server-only";
import { cookies } from "next/headers";
import { CUSTOMER_COOKIE, customerCookieOptions, readCustomerSession } from "./customer-session";

/** Sesi pelanggan untuk server action / route handler, sekaligus memperpanjang cookie bila perlu. */
export async function getCustomerSession() {
  const store = await cookies();
  const result = await readCustomerSession(store.get(CUSTOMER_COOKIE)?.value);
  if (!result) return null;
  if (result.renewed) {
    try {
      store.set(CUSTOMER_COOKIE, result.renewed.value, customerCookieOptions(result.renewed.maxAge));
    } catch {
      // Server Component tidak boleh menulis cookie; perpanjangan dilakukan di permintaan berikutnya.
    }
  }
  return result.session;
}
