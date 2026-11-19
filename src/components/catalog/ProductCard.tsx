import Image from "next/image";
import { BadgePercent, Plus } from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";
import { TREATMENT_TYPE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PriceStack } from "./PriceStack";
import { ProductPlaceholder } from "./ProductPlaceholder";

const LAYOUTS = {
  home: {
    card: "overflow-hidden",
    media: "relative w-full aspect-[4/3] shrink-0",
    badge: "top-2.5 left-2.5 z-10 px-2.5",
    plus: "top-2.5 right-2.5 backdrop-blur-md transition-colors",
    body: "p-3.5 flex flex-1 flex-col",
  },
  category: {
    card: "p-2.5",
    media: "aspect-square rounded-[18px] overflow-hidden relative mb-3",
    badge: "top-2 left-2 px-2",
    plus: "bottom-2 right-2 transition-all",
    body: "px-1 pb-1 flex-1 flex flex-col",
  },
};

export function ProductCard({
  product,
  onOpen,
  layout,
}: {
  product: CatalogProduct;
  onOpen: () => void;
  layout: keyof typeof LAYOUTS;
}) {
  const styles = LAYOUTS[layout];
  const discount = product.voucher_discount || 0;
  const isHome = layout === "home";
  const fallbackLabel = isHome ? (product.type === TREATMENT_TYPE ? "Layanan" : "Produk") : "Umum";
  const Name = isHome ? "h4" : "p";
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex flex-col text-left bg-white rounded-[20px] border border-[#F0E4E8]",
        "shadow-[0_8px_24px_-18px_rgba(122,34,64,0.4)] cursor-pointer group active:scale-[0.98]",
        "transition-all hover:shadow-lg hover:shadow-rose-100",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/25",
        styles.card,
      )}
    >
      <div className={styles.media}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <ProductPlaceholder type={product.type} />
        )}
        {discount > 0 && (
          <span
            className={cn(
              "absolute inline-flex items-center gap-1 rounded-full bg-[#C94F78]",
              "py-0.5 text-[11px] font-bold text-white shadow-sm",
              styles.badge,
            )}
          >
            <BadgePercent className="w-3 h-3" aria-hidden="true" />
            Promo
          </span>
        )}
        <span
          className={cn(
            "absolute w-8 h-8 rounded-xl bg-white/95 flex items-center justify-center shadow-sm",
            "text-[#A83960] group-hover:bg-[#C94F78] group-hover:text-white",
            styles.plus,
          )}
          aria-hidden="true"
        >
          <Plus className="w-4 h-4" />
        </span>
      </div>
      <div className={styles.body}>
        <p className="text-[11px] font-semibold text-[#A83960] uppercase tracking-[0.06em] truncate">
          {product.sub_category || fallbackLabel}
        </p>
        <Name className="mt-1 text-[14px] font-semibold text-[#2D2926] line-clamp-2 leading-snug min-h-[2.75em]">
          {product.name}
        </Name>
        {isHome ? (
          <div className="mt-auto pt-2.5">
            <PriceStack price={product.selling_price} discount={discount} />
          </div>
        ) : (
          <PriceStack
            price={product.selling_price}
            discount={discount}
            className="mt-auto pt-2 tabular-nums"
          />
        )}
      </div>
    </button>
  );
}
