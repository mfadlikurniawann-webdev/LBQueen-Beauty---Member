import Image from "next/image";
import { X } from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";
import { Rupiah } from "@/components/Rupiah";
import { cn } from "@/lib/utils";
import { ProductPlaceholder } from "./ProductPlaceholder";

export function ProductModalHero({
  product,
  price,
  discount,
  onClose,
}: {
  product: CatalogProduct;
  price: number;
  discount: number;
  onClose: () => void;
}) {
  return (
    <div className="relative w-full h-[210px] shrink-0">
      {product.image_url ? (
        <Image src={product.image_url} alt={product.name} fill className="object-cover" />
      ) : (
        <ProductPlaceholder type={product.type} size="xl" tone="deep" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-transparent h-20" />

      <button
        type="button"
        aria-label="Tutup detail"
        onClick={onClose}
        className={cn(
          "absolute top-4 right-4 w-10 h-10 rounded-full bg-black/25 backdrop-blur-md",
          "flex items-center justify-center text-white hover:bg-black/40 transition-all z-20",
          "border border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        )}
      >
        <X className="w-5 h-5" />
      </button>

      <div className="absolute bottom-9 left-5 right-5 z-10">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={cn(
              "px-2.5 py-1 rounded-full bg-[#C94F78] text-white text-[11px] font-bold uppercase",
              "tracking-[0.08em] shadow-lg shadow-[#C94F78]/20",
            )}
          >
            {product.type.split(" ")[0]}
          </span>
          {product.sub_category && (
            <span
              className={cn(
                "max-w-[60%] truncate px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white",
                "text-[11px] font-bold uppercase tracking-[0.08em] border border-white/30",
              )}
            >
              {product.sub_category}
            </span>
          )}
        </div>
        <h3
          id="product-detail-title"
          className="text-[20px] font-bold text-white leading-snug mb-1.5 drop-shadow-md line-clamp-2"
        >
          {product.name}
        </h3>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums">
          <span className="text-[22px] font-bold text-white drop-shadow-sm">
            <Rupiah value={Math.max(0, price - discount)} />
          </span>
          {discount > 0 && (
            <span className="text-[13px] font-medium text-white/80 line-through">
              <Rupiah value={price} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
