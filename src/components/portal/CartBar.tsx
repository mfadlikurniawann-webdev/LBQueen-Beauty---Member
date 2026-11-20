import Link from "next/link";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/lib/format";
import { useCartBump } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function CartBar() {
  const { cart, totalItems } = useCart();
  const ref = useCartBump<HTMLAnchorElement>();
  if (totalItems === 0) return null;
  const total = cart.reduce(
    (sum, i) => sum + Math.max(0, i.price - (i.voucher_discount || 0)) * i.qty,
    0,
  );
  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-40 flex justify-center pointer-events-none px-3 sm:px-4",
        "bottom-[calc(max(env(safe-area-inset-bottom,0px),12px)+80px)] md:bottom-6",
      )}
    >
      <Link
        ref={ref}
        data-cart-target
        href="/cart"
        className={cn(
          "panel-rose spotlight pointer-events-auto w-full max-w-lg flex items-center gap-3 rounded-[26px] pl-2 pr-4 py-2",
          "animate-in fade-in slide-in-from-bottom-2 duration-300 active:scale-[0.99] transition-transform",
        )}
      >
        <span className="glass w-11 h-11 shrink-0 rounded-full flex items-center justify-center">
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
        <span className="flex items-center gap-1 text-[14px] font-bold text-[#FFC4D8]">
          Lihat
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
