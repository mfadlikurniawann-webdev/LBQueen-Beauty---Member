import { useState } from "react";
import { CalendarClock, Minus, Plus, Trash2 } from "lucide-react";
import { ItemThumb } from "@/components/portal/ItemThumb";
import type { CartItem } from "@/context/CartContext";
import { Rupiah } from "@/components/Rupiah";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { isTreatmentItem } from "./cart-utils";
import { CARD } from "./ui";

const STEP = "w-11 h-11 rounded-full flex items-center justify-center transition-colors";

export function CartItemCard({
  item,
  schedule,
  onRemove,
  onQty,
}: {
  item: CartItem;
  /** Jadwal treatment terpilih ("Sab, 21 Nov, 19.00") atau null bila belum dipilih. */
  schedule?: string | null;
  onRemove: () => void;
  onQty: (qty: number) => void;
}) {
  const [leaving, setLeaving] = useState(false);
  // Baris memudar & bergeser dulu, baru dihapus dari keranjang.
  const remove = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onRemove, prefersReducedMotion() ? 0 : 220);
  };
  const treatment = isTreatmentItem(item);
  const unit = Math.max(0, item.price - (item.voucher_discount || 0));
  const hasItemDiscount = (item.voucher_discount || 0) > 0;
  return (
    <div className={cn(`${CARD} p-3.5 flex gap-3 transition-all duration-200`, leaving && "lbq-leave")}>
      <ItemThumb src={item.image_url} alt="" treatment={treatment} sizes="72px" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1">
          <p className="flex-1 min-w-0 text-[15px] font-semibold text-ink leading-snug line-clamp-2 break-words">
            {item.name}
          </p>
          <button
            type="button"
            aria-label={`Hapus ${item.name}`}
            onClick={remove}
            className="w-11 h-11 -mt-2.5 -mr-2 shrink-0 rounded-full flex items-center justify-center text-ink-muted hover:text-danger hover:bg-danger-soft transition-colors"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        {item.variant_name && (
          <p className="text-[13px] text-ink-muted truncate">{item.variant_name}</p>
        )}
        {treatment && (
          <p
            className={cn(
              "mt-0.5 flex items-center gap-1 text-[13px] truncate",
              schedule ? "text-ink-3" : "text-brand-ink font-semibold",
            )}
          >
            <CalendarClock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {schedule || "Pilih jadwal di bawah"}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="min-w-0 tabular-nums leading-tight">
            <span className="block text-[15px] font-semibold text-brand-ink">
              <Rupiah value={unit} />
            </span>
            {hasItemDiscount && (
              <span className="block text-[12px] text-ink-muted line-through">
                <Rupiah value={item.price} />
              </span>
            )}
          </p>
          <div className="chip-glass flex items-center rounded-full shrink-0">
            <button
              type="button"
              aria-label="Kurangi jumlah"
              onClick={() => (item.qty === 1 ? remove() : onQty(item.qty - 1))}
              className={`${STEP} text-ink-muted hover:text-brand`}
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="text-[15px] font-semibold text-ink min-w-6 text-center tabular-nums" aria-live="polite">
              {item.qty}
            </span>
            <button
              type="button"
              aria-label="Tambah jumlah"
              onClick={() => onQty(item.qty + 1)}
              className={`${STEP} text-brand`}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
