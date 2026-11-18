import { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";
import { normalizeEnvValue } from "@/lib/env";

export const dynamic = "force-dynamic";

const catalog = new Set(["products", "product_variants", "vouchers"]);
const owned = new Set(["customers", "customer_orders"]);
const maxRows = 100;

const fail = (message: string, status: number) =>
  Response.json({ message, code: "LBQUEEN_ACCESS" }, { status });

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const table = path[0];
  if (path.length !== 1 || !(catalog.has(table) || owned.has(table)))
    return fail("Akses tidak tersedia.", 404);
  if (request.method !== "GET" && request.method !== "HEAD")
    return fail("Perubahan data hanya tersedia melalui alur aplikasi.", 405);

  const query = new URLSearchParams(request.nextUrl.search);
  if (catalog.has(table)) {
    if (table === "products") {
      const type = query.get("type");
      if (
        type?.startsWith("eq.") &&
        !["eq.Treatment Care & Beauty", "eq.Product Care & Beauty"].includes(type)
      )
        return fail("Kategori tidak tersedia.", 400);
      query.set(
        "type",
        type?.startsWith("eq.") ? type : 'in.("Treatment Care & Beauty","Product Care & Beauty")',
      );
    } else query.set("is_active", "eq.true");
    if (table === "vouchers" && !/^eq\.[\w-]{1,50}$/.test(query.get("code") || ""))
      return fail("Masukkan kode voucher.", 400);
  } else {
    const customer = await verifySession(
      request.cookies.get("lbqueen_customer")?.value,
      "customer",
    );
    if (!customer) return fail("Silakan masuk untuk melanjutkan.", 401);
    query.set(table === "customers" ? "id" : "customer_id", `eq.${customer.id}`);
    if (table === "customers")
      query.set(
        "select",
        "id,name,phone,username,nik,address,points,is_member,membership_type,join_date,created_at",
      );
  }

  if (!/^[\w*,\s]+$/.test(query.get("select") || "*"))
    return fail("Pilihan data tidak valid.", 400);
  if (query.has("or") || query.has("and") || [...query.keys()].some((key) => key.includes(".")))
    return fail("Filter tidak valid.", 400);
  const limit = Number(query.get("limit") || maxRows);
  if (!Number.isSafeInteger(limit) || limit < 1 || Number(query.get("offset") || 0) > 100000)
    return fail("Batas data tidak valid.", 400);
  query.set("limit", String(Math.min(limit, maxRows)));

  const url =
    normalizeEnvValue(process.env.SUPABASE_URL) ||
    normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key =
    normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    normalizeEnvValue(process.env.SUPABASE_SECRET_KEY);
  if (!url || !key) return fail("Database belum dikonfigurasi oleh pengelola.", 503);
  const headers = new Headers({ apikey: key });
  if (!key.startsWith("sb_secret_")) headers.set("Authorization", `Bearer ${key}`);
  for (const name of ["prefer", "accept"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
      method: request.method,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const outgoing = new Headers({
      "Cache-Control":
        catalog.has(table) && response.ok
          ? "public, s-maxage=30, stale-while-revalidate=120"
          : "private, no-store",
    });
    for (const name of ["content-type", "content-range", "range-unit", "preference-applied"]) {
      const value = response.headers.get(name);
      if (value) outgoing.set(name, value);
    }
    if (
      response.ok &&
      response.headers.get("content-type")?.includes("application/json") &&
      request.method !== "HEAD" &&
      response.status !== 204
    ) {
      const data = await response.json();
      const clean = JSON.parse(
        JSON.stringify(data, (key, value) =>
          [
            "password",
            "password_hash",
            "password_plain",
            "password_encrypted",
            "purchase_price",
          ].includes(key)
            ? undefined
            : value,
        ),
      );
      return Response.json(clean, { status: response.status, headers: outgoing });
    }
    return new Response(
      request.method === "HEAD" || response.status === 204 ? null : response.body,
      { status: response.status, headers: outgoing },
    );
  } catch {
    return fail(
      "Database belum dapat dihubungi. Silakan coba kembali atau hubungi pengelola.",
      503,
    );
  }
}

export { handle as GET, handle as HEAD, handle as POST, handle as PATCH, handle as DELETE };
