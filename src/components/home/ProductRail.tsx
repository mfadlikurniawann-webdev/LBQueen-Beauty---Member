import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { priceRange, type CatalogProduct } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductPlaceholder } from "@/components/catalog/ProductPlaceholder";

function RailCard({ product, onOpen }: { product: CatalogProduct; onOpen: () => void }) {
  const range = priceRange(product);
  const base = range.min;
  const discount = range.discountMin;
  const price = range.finalMin;
  const hasRange = range.finalMin !== range.finalMax;
  const percent = discount > 0 && base > 0 ? Math.max(1, Math.round((discount / base) * 100)) : 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "glass-soft spotlight lift group snap-start shrink-0 w-[152px] sm:w-[168px] text-left rounded-[22px] p-1.5",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/25",
      )}
    >
      <span className="relative block aspect-square rounded-[17px] overflow-hidden bg-[#FBEFF3]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="168px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ProductPlaceholder type={product.type} size="sm" />
        )}
        {percent > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-[#D3264A] px-2 py-0.5 text-[12px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            -{percent}%
          </span>
        )}
        <span
          className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-white/95 border border-white/90 text-[#A83960] shadow-[0_6px_14px_-6px_rgba(122,34,64,0.45)] flex items-center justify-center group-hover:bg-[#C94F78] group-hover:text-white transition-colors duration-300"
          aria-hidden="true"
        >
          <Plus className="w-4 h-4" strokeWidth={2.6} />
        </span>
      </span>
      <span className="block px-2 pt-2.5 pb-1.5">
        <span className="block text-[13px] font-semibold text-[#2D2926] leading-snug line-clamp-2 min-h-[2.6em]">
          {product.name}
        </span>
        <span className="block mt-1.5 text-[15px] font-bold text-[#2D2926] tabular-nums">
          {hasRange && <span className="text-[12px] font-semibold text-[#766B68]">Mulai </span>}
          {formatRupiah(price)}
        </span>
        {discount > 0 ? (
          <span className="flex items-center gap-1.5 mt-0.5 text-[12px] tabular-nums">
            <span className="text-[#8C8280] line-through">{formatRupiah(base)}</span>
          </span>
        ) : (
          <span className="block mt-0.5 text-[12px] font-semibold text-[#A83960] truncate">
            {product.sub_category || "LBQueen"}
          </span>
        )}
      </span>
    </button>
  );
}

function RailSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="skeleton-glass shrink-0 w-[152px] sm:w-[168px] h-[250px] rounded-[22px]"
        />
      ))}
    </>
  );
}

export function ProductRail({
  title,
  subtitle,
  href,
  products,
  loading,
  onOpen,
  band = false,
}: {
  title: string;
  subtitle?: string;
  href: string;
  products: CatalogProduct[];
  loading?: boolean;
  onOpen: (product: CatalogProduct) => void;
  band?: boolean;
}) {
  if (!loading && products.length === 0) return null;
  return (
    <section
      data-reveal
      className={cn(band && "panel-rose -mx-4 sm:mx-0 rounded-none sm:rounded-[30px] px-4 sm:px-5 pt-4 pb-5")}
    >
      <div className="relative flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2
            className={cn(
              "text-[18px] font-bold! tracking-tight leading-tight",
              band ? "text-white" : "text-[#2D2926]",
            )}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={cn(
                "text-[13px] mt-0.5 truncate",
                band ? "text-white/80" : "text-[#766B68]",
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        <Link
          href={href}
          className={cn(
            "chip-glass shrink-0 inline-flex items-center gap-0.5 h-11 rounded-full pl-3.5 pr-2.5 text-[13px] font-semibold transition-colors",
            band ? "text-white hover:bg-white/20" : "text-[#A83960] hover:bg-white/85",
          )}
        >
          Lihat semua
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="relative flex gap-3 overflow-x-auto no-scrollbar snap-x -mx-4 px-4 sm:-mx-5 sm:px-5 pt-1 pb-3">
        {loading ? (
          <RailSkeleton />
        ) : (
          products
            .slice(0, 12)
            .map((p) => <RailCard key={p.id} product={p} onOpen={() => onOpen(p)} />)
        )}
      </div>
    </section>
  );
}
