import { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";
import { serverDatabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const customer = await verifySession(request.cookies.get("lbqueen_customer")?.value, "customer");
  const headers = { "Cache-Control": "private, no-store" };
  if (!customer) return Response.json({ customer: false, profile: null }, { headers });
  try {
    const { data, error } = await serverDatabase()
      .from("customers")
      .select("id,name,phone,points,is_member,membership_type,username")
      .eq("id", customer.id)
      .maybeSingle();
    if (error) throw error;
    return Response.json({ customer: Boolean(data), profile: data }, { headers });
  } catch {
    return Response.json({ error: "Informasi akun belum dapat dimuat." }, { status: 503, headers });
  }
}
