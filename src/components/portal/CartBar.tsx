import Link from "next/link";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PRIMARY_GRADIENT } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CartBar() {
  const { cart, totalItems } = useCart();
  if (totalItems === 0) return null;
  const total = cart.reduce(
    (sum, i) => sum + Math.max(0, i.price - (i.voucher_discount || 0)) * i.qty,
    0,
  );
  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-40 flex justify-center pointer-events-none px-3 sm:px-4",
        "bottom-[calc(max(env(safe-area-inset-bottom,0px),12px)+80px)] lg:bottom-6",
      )}
    >
      <Link
        href="/cart"
        aria-label={`Lihat keranjang, ${totalItems} item, ${formatRupiah(total)}`}
        className={cn(
          "pointer-events-auto w-full max-w-lg flex items-center gap-3 rounded-[20px] px-4 py-3 text-white",
          "animate-in fade-in slide-in-from-bottom-2 duration-300 active:scale-[0.99]",
        )}
        style={{ background: PRIMARY_GRADIENT, boxShadow: "0 10px 28px rgba(168,57,96,0.35)" }}
      >
        <span className="w-10 h-10 shrink-0 rounded-2xl bg-white/20 flex items-center justify-center">
          <ShoppingCart className="w-5 h-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-semibold text-white/85 tabular-nums">
            {totalItems} item di keranjang
          </span>
          <span className="block text-[16px] font-bold leading-tight tabular-nums">
            {formatRupiah(total)}
          </span>
        </span>
        <span className="flex items-center gap-1 text-[14px] font-bold">
          Lihat
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
