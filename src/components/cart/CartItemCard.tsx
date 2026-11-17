import { Minus, Plus, Trash2 } from "lucide-react";
import { ItemThumb } from "@/components/portal/ItemThumb";
import type { CartItem } from "@/context/CartContext";
import { Rupiah } from "@/components/Rupiah";
import { cn } from "@/lib/utils";
import { isTreatmentItem } from "./cart-utils";
import { CARD } from "./ui";

const STEP = "w-8 h-8 rounded-xl flex items-center justify-center transition-colors";

export function CartItemCard({
  item,
  onRemove,
  onQty,
}: {
  item: CartItem;
  onRemove: () => void;
  onQty: (qty: number) => void;
}) {
  const hasItemDiscount = (item.voucher_discount || 0) > 0;
  const lineTotal = (item.price - (item.voucher_discount || 0)) * item.qty;
  return (
    <div className={`${CARD} p-4 flex gap-3.5`}>
      <ItemThumb
        src={item.image_url}
        alt={item.name}
        treatment={isTreatmentItem(item)}
        sizes="72px"
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start gap-2">
          <h3 className="flex-1 min-w-0 text-[14px] font-semibold! text-[#2D2926] leading-snug line-clamp-2">
            {item.name}
          </h3>
          <button
            type="button"
            aria-label="Hapus Item"
            onClick={onRemove}
            className={cn(
              "w-8 h-8 -mt-1 -mr-1 shrink-0 rounded-xl flex items-center justify-center text-[#766B68]",
              "hover:text-rose-600 hover:bg-rose-50 transition-colors",
            )}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {item.variant_name && (
          <span
            className={cn(
              "self-start mt-1 text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FDF2F5]",
              "text-[#A83960] max-w-full truncate",
            )}
          >
            {item.variant_name}
          </span>
        )}
        <div className="mt-auto pt-2.5 flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
          <div className="min-w-0">
            {hasItemDiscount && (
              <p className="text-[12px] text-[#766B68] line-through tabular-nums leading-none mb-1">
                <Rupiah value={item.price * item.qty} />
              </p>
            )}
            <p className="text-[15px] font-bold text-[#A83960] tabular-nums leading-tight">
              <Rupiah value={lineTotal} />
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-2xl p-1 border border-[#EEDFE3] bg-[#FDFAFB]">
            <button
              type="button"
              aria-label="Kurangi Jumlah"
              onClick={() => (item.qty === 1 ? onRemove() : onQty(item.qty - 1))}
              className={`${STEP} text-[#766B68] hover:bg-white hover:text-[#C94F78]`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span
              className="text-[14px] font-bold text-[#2D2926] min-w-6 text-center tabular-nums"
              aria-live="polite"
            >
              {item.qty}
            </span>
            <button
              type="button"
              aria-label="Tambah Jumlah"
              onClick={() => onQty(item.qty + 1)}
              className={`${STEP} text-[#C94F78] hover:bg-white`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
