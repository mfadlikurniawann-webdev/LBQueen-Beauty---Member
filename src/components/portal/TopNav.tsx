import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Customer } from "@/lib/customer";
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
  return (
    <header className="hidden lg:block sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#F0E4E8]">
      <div className="h-[68px] px-12 flex items-center gap-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0"
          aria-label="LBQueen, ke beranda"
        >
          <span className="w-10 h-10 rounded-2xl bg-white border border-[#F0E4E8] overflow-hidden flex items-center justify-center">
            <Image
              src="/lbqueen_logo.png"
              alt=""
              width={40}
              height={40}
              className="object-contain"
            />
          </span>
          <span className="leading-none">
            <span className="block text-[16px] font-bold text-[#A83960]">LBQueen</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766B68] mt-1">
              Care & Beauty
            </span>
          </span>
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
                  "h-10 px-4 rounded-full flex items-center gap-2 text-[14px] transition-colors",
                  active
                    ? "bg-[#FFE3EE] text-[#A83960] font-bold"
                    : "text-[#5F5552] font-semibold hover:bg-[#FBF3F6]",
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
            href="/cart"
            aria-label={totalItems > 0 ? `Keranjang, ${totalItems} item` : "Keranjang"}
            className="relative w-11 h-11 rounded-full bg-[#FFF3F7] border border-[#F6D9E4] flex items-center justify-center text-[#A83960]"
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
            className="flex items-center gap-2.5 h-11 pl-1 pr-4 rounded-full border border-[#F0E4E8] hover:bg-[#FBF3F6]"
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
