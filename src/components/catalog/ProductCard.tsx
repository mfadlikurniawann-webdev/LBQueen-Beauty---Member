import Image from "next/image";
import { BadgePercent, Plus } from "lucide-react";
import { priceRange, productImages, type CatalogProduct } from "@/lib/catalog";
import { TREATMENT_TYPE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PriceStack } from "./PriceStack";
import { ProductPlaceholder } from "./ProductPlaceholder";

const LAYOUTS = {
  home: {
    card: "p-1.5",
    media: "relative w-full aspect-[4/3] shrink-0 rounded-[18px] overflow-hidden",
    badge: "top-2.5 left-2.5 z-10 px-2.5",
    plus: "top-2.5 right-2.5 transition-colors",
    body: "px-2 pt-3 pb-2 flex flex-1 flex-col",
  },
  category: {
    card: "p-1.5",
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
  const range = priceRange(product);
  const discount = range.discountMin;
  const hasRange = range.finalMin !== range.finalMax;
  const variantCount = product.variants?.length || 0;
  const photoCount = productImages(product).length;
  const isHome = layout === "home";
  const fallbackLabel = isHome ? (product.type === TREATMENT_TYPE ? "Layanan" : "Produk") : "Umum";
  const Name = isHome ? "h3" : "p";
  return (
    <button
      type="button"
      data-reveal
      onClick={onOpen}
      className={cn(
        "glass-soft spotlight lift flex flex-col text-left rounded-[24px] cursor-pointer group",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/70",
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
              "absolute inline-flex items-center gap-1 rounded-full bg-[#B8416B]",
              "py-0.5 text-[12px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
              styles.badge,
            )}
          >
            <BadgePercent className="w-3 h-3" aria-hidden="true" />
            Promo
          </span>
        )}
        <span
          className={cn(
            "absolute w-8 h-8 rounded-full bg-surface/95 border border-edge/90",
            "flex items-center justify-center shadow-[0_6px_14px_-6px_rgba(122,34,64,0.45)]",
            "text-brand-ink group-hover:bg-[#C94F78] group-hover:text-white duration-300",
            styles.plus,
          )}
          aria-hidden="true"
        >
          <Plus className="w-4 h-4" />
        </span>
      </div>
      <div className={styles.body}>
        <p className="text-[12px] font-semibold text-brand-ink truncate">
          {product.sub_category || fallbackLabel}
        </p>
        <Name className="mt-1 text-[14px] font-semibold text-ink line-clamp-2 leading-snug min-h-[2.75em]">
          {product.name}
        </Name>
        {(variantCount > 1 || photoCount > 1) && (
          <p className="mt-1 text-[12px] font-medium text-ink-muted truncate">
            {[variantCount > 1 && `${variantCount} variasi`, photoCount > 1 && `${photoCount} foto`]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
        {isHome ? (
          <div className="mt-auto pt-2.5">
            <PriceStack price={range.min} discount={discount} from={hasRange} />
          </div>
        ) : (
          <PriceStack
            price={range.min}
            discount={discount}
            from={hasRange}
            className="mt-auto pt-2 tabular-nums"
          />
        )}
      </div>
    </button>
  );
}
