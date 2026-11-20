import { ArrowRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyCart({ onShop }: { onShop: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div
        className={cn(
          "glass-lit w-20 h-20 rounded-full flex items-center justify-center mb-6",
        )}
      >
        <ShoppingBag className="w-8 h-8 text-brand" aria-hidden="true" />
      </div>
      <h2 className="text-[20px] font-semibold! text-ink mb-2 tracking-tight">
        Keranjang Kosong
      </h2>
      <p className="text-[14px] text-ink-muted leading-relaxed mb-8 max-w-[280px]">
        Belum ada treatment atau produk di keranjang.
      </p>
      <button
        type="button"
        onClick={onShop}
        className="btn-primary h-14 px-8 text-[14px] gap-3"
      >
        Mulai Belanja Sekarang <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
