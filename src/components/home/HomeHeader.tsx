import { BrandMark } from "@/components/BrandMark";
import Link from "next/link";
import { MessageCircle, Search, ShoppingCart } from "lucide-react";
import { waLink } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICON_BUTTON =
  "relative w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors";

export const HEADER_GRADIENT = "linear-gradient(90deg,#D9668D 0%,#C94F78 50%,#A83960 100%)";

export function HomeHeader({
  searchQuery,
  onSearch,
  cartCount,
}: {
  searchQuery: string;
  onSearch: (value: string) => void;
  cartCount: number;
}) {
  return (
    <header
      className="sticky top-0 z-40 lg:static px-4 sm:px-8 lg:px-12 pb-3 lg:pb-4"
      style={{
        background: HEADER_GRADIENT,
        paddingTop: "max(env(safe-area-inset-top, 0px), 12px)",
      }}
    >
      <div className="flex items-center gap-1.5 lg:gap-3">
        <Link href="/" aria-label="LBQueen, ke beranda" className="lg:hidden shrink-0 mr-1">
          <BrandMark size={40} className="ring-2 ring-white/70" />
        </Link>
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Cari treatment atau produk</span>
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#A83960]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Cari facial, skinbooster..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className={cn(
              "w-full h-11 rounded-full bg-white pl-11 pr-4 text-[15px] text-[#2D2926] outline-none",
              "placeholder:text-[#8C8280] focus:ring-4 focus:ring-white/30",
            )}
          />
        </label>
        <Link
          href="/cart"
          aria-label={cartCount > 0 ? `Keranjang, ${cartCount} item` : "Keranjang"}
          className={cn(ICON_BUTTON, "lg:hidden")}
        >
          <ShoppingCart className="w-6 h-6" aria-hidden="true" />
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FFD84D] text-[#5A1834] text-[11px] font-extrabold flex items-center justify-center tabular-nums">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </Link>
        <a
          href={waLink("Halo admin LBQueen, saya ingin bertanya.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat admin LBQueen"
          className={cn(ICON_BUTTON, "lg:hidden")}
        >
          <MessageCircle className="w-6 h-6" aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
