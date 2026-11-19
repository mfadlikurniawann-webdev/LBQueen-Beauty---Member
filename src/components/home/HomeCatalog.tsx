import { BadgePercent, Search } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { CatalogProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

export function HomeCatalog({
  products,
  page,
  loading,
  searching,
  onOpen,
}: {
  products: CatalogProduct[];
  page: number;
  loading: boolean;
  searching: boolean;
  onOpen: (product: CatalogProduct) => void;
}) {
  const EmptyIcon = searching ? Search : BadgePercent;
  return (
    <div id="katalog-beranda" className="scroll-mt-6 pb-6">
      <div className="flex items-center gap-3">
        <SectionHeading
          title={searching ? "Hasil Pencarian" : "Promo Spesial"}
          className="flex-1 min-w-0"
        />
        {products.length > 0 && (
          <span
            className={cn(
              "mb-3.5 shrink-0 rounded-full bg-[#FFE3EE] px-3 py-1 text-[12px] font-semibold text-[#A83960]",
              "tabular-nums",
            )}
          >
            Halaman {page}
          </span>
        )}
      </div>
      {loading ? (
        <div className="portal-catalog-grid" aria-busy="true">
          <span className="sr-only">Memuat katalog</span>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[240px] rounded-[24px] bg-[#F3E7EA] animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="portal-catalog-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} layout="home" onOpen={() => onOpen(p)} />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "py-12 px-6 flex flex-col items-center justify-center text-center bg-white",
            "border border-[#EEDFE3] rounded-[32px]",
          )}
        >
          <div className="w-16 h-16 rounded-full bg-[#FDF2F5] flex items-center justify-center mb-4">
            <EmptyIcon className="w-7 h-7 text-[#A83960]" aria-hidden="true" />
          </div>
          <p className="text-[15px] font-bold text-[#2D2926]">
            {searching ? "Tidak ada hasil ditemukan" : "Belum ada promo aktif"}
          </p>
          <p className="text-[13px] text-[#766B68] mt-1.5 max-w-[260px] leading-relaxed">
            {searching
              ? "Coba kata kunci lain."
              : "Lihat Layanan atau Produk untuk menjelajahi katalog lengkap."}
          </p>
        </div>
      )}
    </div>
  );
}
