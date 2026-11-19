import { ArrowRight, ShoppingBag } from "lucide-react";
import { PRIMARY_GRADIENT } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function EmptyCart({ onShop }: { onShop: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-[#FDF2F5] border",
          "border-[#F6DDE6]",
        )}
      >
        <ShoppingBag className="w-8 h-8 text-[#C94F78]" aria-hidden="true" />
      </div>
      <h2 className="text-[20px] font-bold! text-[#2D2926] mb-2 tracking-tight">
        Keranjang Kosong
      </h2>
      <p className="text-[14px] text-[#766B68] leading-relaxed mb-8 max-w-[280px]">
        Belum ada treatment atau produk di keranjang.
      </p>
      <button
        type="button"
        onClick={onShop}
        className={cn(
          "h-14 px-8 rounded-2xl text-white text-[14px] font-bold flex items-center gap-3",
          "active:scale-95 transition-all",
        )}
        style={{ background: PRIMARY_GRADIENT, boxShadow: "0 12px 30px rgba(201,79,120,0.25)" }}
      >
        Mulai Belanja Sekarang <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
