import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import type { Customer } from "@/lib/customer";
import { useScrolled } from "@/hooks/useScrolled";
import { useCartBump } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isNavActive } from "./BottomNav";

export function TopNav({
  pathname,
  customer,
  totalItems,
}: {
  pathname: string;
  customer: Customer;
  totalItems: number;
}) {
  const cartRef = useCartBump<HTMLAnchorElement>();
  const scrolled = useScrolled();
  return (
    <header className="hidden md:block sticky top-0 z-50 px-4 lg:px-6 pt-3">
      {/* Di puncak halaman bar membentang lebar; saat digulir menyusut jadi pil kaca melayang. */}
      <div
        className={cn(
          "morph-bar mx-auto h-[64px] flex items-center gap-4 lg:gap-8 rounded-full border",
          scrolled
            ? "glass max-w-5xl px-3 lg:px-4"
            : "max-w-7xl px-3 lg:px-6 bg-white/40 border-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0"
          aria-label="LBQueen, ke beranda"
        >
          <BrandMark size={44} />
        </Link>
        <nav aria-label="Navigasi utama" className="flex items-center gap-1">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const active = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "h-10 px-3 lg:px-4 rounded-full flex items-center gap-2 text-[14px] transition-colors duration-300",
                  active
                    ? "chip-active font-bold"
                    : "text-[#5F5552] font-semibold hover:bg-white/70",
                )}
              >
                <Icon
                  className="w-[18px] h-[18px]"
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden="true"
                />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            ref={cartRef}
            data-cart-target
            href="/cart"
            aria-label={totalItems > 0 ? `Keranjang, ${totalItems} item` : "Keranjang"}
            className="chip-glass relative w-11 h-11 rounded-full flex items-center justify-center text-[#A83960] transition-transform active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#E0263F] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white tabular-nums">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>
          <Link
            href="/profile"
            className="chip-glass flex items-center gap-2.5 h-11 pl-1 pr-4 rounded-full hover:bg-white/80 transition-colors"
          >
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D9648C] to-[#9B3055] text-white text-[14px] font-bold flex items-center justify-center">
              {customer.name?.charAt(0).toUpperCase()}
            </span>
            <span className="text-[14px] font-semibold text-[#2D2926] max-w-[160px] truncate">
              {customer.name?.split(" ")[0]}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
