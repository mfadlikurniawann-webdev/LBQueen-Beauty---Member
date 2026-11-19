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
              "relative flex items-center gap-2 min-h-11 max-w-full rounded-xl border-[1.5px] text-[13px] font-semibold transition-all",
              v.image_url ? "pl-1.5 pr-3 py-1.5" : "px-4 py-2",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20",
              active
                ? "border-[#C94F78] bg-[#FFF3F7] text-[#A83960]"
                : "border-[#EEDFE3] bg-white text-[#2D2926] hover:border-[#C94F78]/50 hover:text-[#A83960]",
              soldOut &&
                "opacity-45 cursor-not-allowed hover:border-[#EEDFE3] hover:text-[#2D2926]",
            )}
          >
            {v.image_url && (
              <span className="relative w-8 h-8 shrink-0 overflow-hidden rounded-lg bg-[#FBEFF3]">
                <Image src={v.image_url} alt="" fill sizes="32px" className="object-cover" />
              </span>
            )}
            <span className="truncate">{v.variant_name}</span>
            {soldOut && <span className="text-[11px] font-medium text-[#766B68]">Habis</span>}
            {active && (
              <span
                aria-hidden="true"
                className="absolute -right-px -bottom-px w-3.5 h-3.5 rounded-tl-lg rounded-br-[10px] bg-[#C94F78]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
