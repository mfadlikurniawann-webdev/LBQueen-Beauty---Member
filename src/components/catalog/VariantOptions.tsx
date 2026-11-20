import Image from "next/image";
import type { CatalogVariant } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** Pilihan variasi bergaya marketplace: chip berfoto (bila ada), variasi stok habis dinonaktifkan. */
export function VariantOptions({
  variants,
  selected,
  onSelect,
  tracksStock,
}: {
  variants: CatalogVariant[];
  selected: CatalogVariant | null;
  onSelect: (variant: CatalogVariant) => void;
  tracksStock: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {variants.map((v) => {
        const active = selected?.id === v.id;
        const soldOut = tracksStock && v.stock <= 0;
        return (
          <button
            type="button"
            key={v.id}
            role="radio"
            aria-checked={active}
            disabled={soldOut}
            onClick={() => onSelect(v)}
            className={cn(
              "relative flex items-center gap-2 min-h-11 max-w-full rounded-full text-[13px] font-semibold transition-all duration-300",
              v.image_url ? "pl-1.5 pr-3 py-1.5" : "px-4 py-2",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/70",
              active
                ? "chip-active"
                : "chip-glass text-ink hover:bg-fill/90 hover:text-brand-ink",
              soldOut && "opacity-45 cursor-not-allowed hover:text-ink",
            )}
          >
            {v.image_url && (
              <span className="relative w-8 h-8 shrink-0 overflow-hidden rounded-full bg-blush">
                <Image src={v.image_url} alt="" fill sizes="32px" className="object-cover" />
              </span>
            )}
            <span className="truncate">{v.variant_name}</span>
            {soldOut && <span className="text-[12px] font-medium text-ink-muted">Habis</span>}
          </button>
        );
      })}
    </div>
  );
}
