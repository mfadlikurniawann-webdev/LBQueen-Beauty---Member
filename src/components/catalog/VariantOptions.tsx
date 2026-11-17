import type { CatalogVariant } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const TONES = {
  modal: { base: "duration-300", active: "shadow-[#C94F78]/20" },
  sheet: { base: "", active: "shadow-rose-100" },
};

export function VariantOptions({
  variants,
  selected,
  onSelect,
  tone,
}: {
  variants: CatalogVariant[];
  selected: CatalogVariant | null;
  onSelect: (variant: CatalogVariant) => void;
  tone: keyof typeof TONES;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {variants.map((v) => {
        const active = selected?.id === v.id;
        return (
          <button
            type="button"
            key={v.id}
            aria-pressed={active}
            onClick={() => onSelect(v)}
            className={cn(
              "px-4 min-h-11 rounded-2xl text-[13px] font-bold transition-all border-2",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20",
              TONES[tone].base,
              active
                ? `bg-[#C94F78] border-[#C94F78] text-white shadow-lg ${TONES[tone].active}`
                : "bg-white border-[#EEDFE3] text-[#2D2926] hover:border-[#C94F78]/40 hover:text-[#A83960]",
            )}
          >
            {v.variant_name}
          </button>
        );
      })}
    </div>
  );
}
