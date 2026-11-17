import { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const customer = await verifySession(request.cookies.get("lbqueen_customer")?.value, "customer");
  return Response.json({ customer: Boolean(customer) }, { headers: { "Cache-Control": "no-store" } });
}
