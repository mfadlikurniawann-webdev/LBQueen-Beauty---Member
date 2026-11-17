import { Search as SearchIcon } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { CatalogProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const GRID = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4";
const BAR = "rounded-full bg-[#F3E7EA] animate-pulse";

export function CategoryGrid({
  products,
  loading,
  onOpen,
}: {
  products: CatalogProduct[];
  loading: boolean;
  onOpen: (product: CatalogProduct) => void;
}) {
  if (loading) {
    return (
      <div className={GRID} aria-busy="true">
        <span className="sr-only">Memuat...</span>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[24px] border border-[#EEDFE3] bg-white p-2.5">
            <div className="aspect-square rounded-[18px] bg-[#F3E7EA] animate-pulse" />
            <div className={`mt-3 h-3 w-1/2 ${BAR}`} />
            <div className={`mt-2 h-4 w-4/5 ${BAR}`} />
            <div className={`mt-3 mb-1 h-4 w-2/3 ${BAR}`} />
          </div>
        ))}
      </div>
    );
  }
  if (products.length === 0) {
    return (
      <div
        className={cn(
          "py-14 px-6 text-center flex flex-col items-center bg-white border border-[#EEDFE3]",
          "rounded-[32px]",
        )}
      >
        <div className="w-16 h-16 bg-[#FDF2F5] rounded-full flex items-center justify-center mb-4">
          <SearchIcon className="w-7 h-7 text-[#A83960]" aria-hidden="true" />
        </div>
        <p className="text-[15px] font-bold text-[#2D2926]">Produk tidak ditemukan</p>
        <p className="mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-[#766B68]">
          Coba kata kunci lain atau ubah filter yang dipilih.
        </p>
      </div>
    );
  }
  return (
    <div className={GRID}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          layout="category"
          onOpen={() => onOpen(product)}
        />
      ))}
    </div>
  );
}
