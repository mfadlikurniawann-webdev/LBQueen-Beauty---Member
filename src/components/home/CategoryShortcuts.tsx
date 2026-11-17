import { BadgePercent, Scissors, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const HOME_CATEGORIES = [
  { id: "promo", label: "Promo", icon: BadgePercent, color: "#F43F5E" },
  { id: "layanan", label: "Layanan", icon: Scissors, color: "#C94F78" },
  { id: "produk", label: "Produk", icon: ShoppingBag, color: "#F59E0B" },
];

export function CategoryShortcuts() {
  const router = useRouter();
  return (
    <div className="portal-section">
      <nav
        className="grid grid-cols-3 sm:flex sm:justify-start sm:gap-8 gap-3 py-3"
        aria-label="Kategori katalog"
      >
        {HOME_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => router.push(`/category/${cat.id}`)}
              className="flex min-w-0 flex-col items-center transition-all duration-300 active:scale-95"
            >
              <div
                className={cn(
                  "w-[64px] h-[64px] rounded-[24px] flex items-center justify-center mb-2.5",
                  "transition-all duration-500 relative overflow-hidden group bg-white",
                  "border border-[#EEDFE3] hover:border-rose-200",
                )}
              >
                <Icon
                  className="w-7 h-7 transition-all duration-500"
                  style={{ color: cat.color }}
                  strokeWidth={2}
                />
              </div>
              <span className="text-xs transition-all duration-300 text-[#766B68] font-medium">
                {cat.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
