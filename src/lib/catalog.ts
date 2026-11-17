import type { Promotion } from "@/lib/promotions";

export type CatalogProduct = {
  id: number; name: string; type: string; selling_price: number; image_url: string | null;
  product_code: string; is_set: boolean; sub_category?: string; voucher_discount: number;
  variants: { id: number; product_id: number; variant_name: string; price: number; stock: number }[];
  promotions: Promotion[];
};

export async function loadCatalog(options: { page: number; category: string; search?: string; mode?: string; subcategory?: string | null }) {
  const query = new URLSearchParams({ page: String(options.page), category: options.category });
  if (options.search) query.set("search", options.search);
  if (options.mode) query.set("mode", options.mode);
  if (options.subcategory) query.set("subcategory", options.subcategory);
  const response = await fetch(`/api/catalog?${query}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Katalog belum dapat dimuat. Silakan coba kembali.");
  return response.json() as Promise<{ products: CatalogProduct[]; hasMore: boolean; allVouchers: any[] }>;
}
