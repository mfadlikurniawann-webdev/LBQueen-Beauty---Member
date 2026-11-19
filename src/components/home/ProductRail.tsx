import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductPlaceholder } from "@/components/catalog/ProductPlaceholder";

function RailCard({ product, onOpen }: { product: CatalogProduct; onOpen: () => void }) {
  const discount = product.voucher_discount || 0;
  const price = Math.max(0, product.selling_price - discount);
  const percent =
    discount > 0 && product.selling_price > 0
      ? Math.max(1, Math.round((discount / product.selling_price) * 100))
      : 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group snap-start shrink-0 w-[152px] sm:w-[168px] text-left rounded-[18px] bg-white overflow-hidden",
        "border border-[#F0E4E8] shadow-[0_8px_20px_-16px_rgba(90,24,52,0.5)] active:scale-[0.98] transition-transform",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/25",
      )}
    >
      <span className="relative block aspect-square bg-[#FBEFF3]">
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
          <span className="absolute left-0 top-2.5 rounded-r-full bg-[#E0263F] pl-2 pr-2.5 py-0.5 text-[12px] font-extrabold text-white">
            -{percent}%
          </span>
        )}
        <span
          className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-white text-[#A83960] shadow-md flex items-center justify-center group-hover:bg-[#C94F78] group-hover:text-white transition-colors"
          aria-hidden="true"
        >
          <Plus className="w-4 h-4" strokeWidth={2.6} />
        </span>
      </span>
      <span className="block p-3">
        <span className="block text-[13px] font-semibold text-[#2D2926] leading-snug line-clamp-2 min-h-[2.6em]">
          {product.name}
        </span>
        <span className="block mt-1.5 text-[15px] font-extrabold text-[#2D2926] tabular-nums">
          {formatRupiah(price)}
        </span>
        {discount > 0 ? (
          <span className="flex items-center gap-1.5 mt-0.5 text-[11px] tabular-nums">
            <span className="text-[#8C8280] line-through">
              {formatRupiah(product.selling_price)}
            </span>
          </span>
        ) : (
          <span className="block mt-0.5 text-[11px] font-semibold text-[#A83960] truncate">
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
          className="shrink-0 w-[152px] sm:w-[168px] h-[250px] rounded-[18px] bg-white/70 animate-pulse"
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
      className={cn(
        band
          ? "-mx-4 sm:mx-0 sm:rounded-[28px] px-4 sm:px-5 pt-4 pb-5 overflow-hidden relative"
          : "",
      )}
      style={band ? { background: "linear-gradient(135deg,#C94F78 0%,#9B3055 100%)" } : undefined}
    >
      {band && (
        <span
          className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-white/10"
          aria-hidden="true"
        />
      )}
      <div className="relative flex items-end justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2
            className={cn(
              "text-[18px] font-extrabold! tracking-tight leading-tight",
              band ? "text-white" : "text-[#2D2926]",
            )}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={cn(
                "text-[13px] mt-0.5 truncate",
                band ? "text-white/85" : "text-[#766B68]",
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        <Link
          href={href}
          className={cn(
            "shrink-0 inline-flex items-center gap-0.5 text-[13px] font-bold",
            band ? "text-white" : "text-[#A83960]",
          )}
        >
          Lihat semua
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="relative flex gap-3 overflow-x-auto no-scrollbar snap-x -mx-4 px-4 sm:-mx-5 sm:px-5 pb-1">
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
