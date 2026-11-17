import { NextRequest } from "next/server";
import { serverDatabase } from "@/lib/supabase-server";
import { productDiscount } from "@/lib/promotions";

export const dynamic = "force-dynamic";
const pageSize = 24;
const headers = { "Cache-Control": "private, no-store" };
const cached = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };
const categories = ["Treatment Care & Beauty", "Product Care & Beauty"];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get("page") || 1);
  const category = params.get("category") || "semua";
  const mode = params.get("mode") || "semua";
  const search = (params.get("search") || "").trim();
  const subcategory = params.get("subcategory");
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 100000 ||
    !["semua", "promo", ...categories].includes(category) ||
    !["semua", "promo", "set"].includes(mode) ||
    search.length > 100 ||
    (subcategory?.length || 0) > 100
  ) {
    return Response.json({ message: "Filter katalog tidak valid." }, { status: 400, headers });
  }
  try {
    const db = serverDatabase();
    const promo = category === "promo" || mode === "promo";
    // Projection and embedded filters are fixed here; clients cannot request private columns.
    let query = db
      .from("products")
      .select(
        `id,name,type,selling_price,image_url,product_code,is_set,sub_category,variants:product_variants(id,product_id,variant_name,price,stock),promotions:vouchers${promo ? "!inner" : ""}(product_id,type,discount_amount,min_transaction)`,
      )
      .in("type", categories)
      .eq("variants.is_active", true)
      .eq("promotions.is_active", true)
      .order("name")
      .order("id")
      .range((page - 1) * pageSize, page * pageSize);
    if (categories.includes(category)) query = query.eq("type", category);
    if (promo)
      query = query
        .eq("promotions.min_transaction", 0)
        .or("discount_amount.gt.0,type.eq.free_service", { referencedTable: "promotions" })
        .gt("selling_price", 0);
    if (mode === "set") query = query.eq("is_set", true);
    if (subcategory) query = query.eq("sub_category", subcategory);
    if (search) query = query.ilike("name", `%${search.replace(/[%_\\]/g, "\\$&")}%`);
    const [result, vouchers] = await Promise.all([
      query,
      db
        .from("vouchers")
        .select("id,name,code,type,discount_amount,min_transaction,product_id")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(10),
    ]);
    if (result.error || vouchers.error) throw new Error("catalog unavailable");
    const rows = result.data || [];
    return Response.json(
      {
        products: rows.slice(0, pageSize).map((p) => ({
          ...p,
          voucher_discount: productDiscount(p.selling_price, p.promotions || []),
        })),
        hasMore: rows.length > pageSize,
        allVouchers: vouchers.data || [],
      },
      { headers: cached },
    );
  } catch {
    return Response.json({ message: "Katalog belum dapat dimuat." }, { status: 503, headers });
  }
}
