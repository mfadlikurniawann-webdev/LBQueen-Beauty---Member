import { productDiscount, type Promotion } from "@/lib/promotions";

export type CatalogVariant = {
  id: number;
  product_id: number;
  variant_name: string;
  price: number;
  stock: number;
  image_url?: string | null;
  sort_order?: number;
};

export type CatalogProduct = {
  id: number;
  name: string;
  type: string;
  selling_price: number;
  image_url: string | null;
  product_code: string;
  is_set: boolean;
  sub_category?: string;
  description?: string | null;
  images?: string[] | null;
  variant_label?: string | null;
  voucher_discount: number;
  variants: CatalogVariant[];
  promotions: Promotion[];
};

/** Foto galeri produk (foto utama lebih dulu), tanpa duplikat. */
export function productImages(product: Pick<CatalogProduct, "image_url" | "images">) {
  const list = [...(product.images || []), product.image_url].filter(
    (url): url is string => typeof url === "string" && url.trim() !== "",
  );
  return [...new Set(list)];
}

/** Diskon promo otomatis untuk harga tertentu (harga variasi berbeda dari harga dasar). */
export function discountFor(product: CatalogProduct, price: number) {
  return product.promotions
    ? productDiscount(price, product.promotions)
    : product.voucher_discount || 0;
}

/** Rentang harga setelah promo, seperti "Rp 50.000 - Rp 80.000" pada marketplace. */
export function priceRange(product: CatalogProduct) {
  const prices = product.variants?.length
    ? product.variants.map((v) => Number(v.price))
    : [Number(product.selling_price)];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return {
    min,
    max,
    finalMin: Math.max(0, min - discountFor(product, min)),
    finalMax: Math.max(0, max - discountFor(product, max)),
    discountMin: discountFor(product, min),
  };
}

export async function loadCatalog(options: {
  page: number;
  category: string;
  search?: string;
  mode?: string;
  subcategory?: string | null;
}) {
  const query = new URLSearchParams({ page: String(options.page), category: options.category });
  if (options.search) query.set("search", options.search);
  if (options.mode) query.set("mode", options.mode);
  if (options.subcategory) query.set("subcategory", options.subcategory);
  const response = await fetch(`/api/catalog?${query}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Katalog belum dapat dimuat. Silakan coba kembali.");
  return response.json() as Promise<{
    products: CatalogProduct[];
    hasMore: boolean;
  }>;
}
