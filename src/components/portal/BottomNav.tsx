import Link from "next/link";
import { BadgePercent, ClipboardList, Home, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { icon: Home, label: "Beranda", href: "/" },
  { icon: BadgePercent, label: "Promo", href: "/promo" },
  { icon: ClipboardList, label: "Pesanan", href: "/orders" },
  { icon: UserRound, label: "Profil", href: "/profile" },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/profile") return pathname === "/profile" || pathname === "/membership";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Navigasi pelanggan"
      className="md:hidden fixed left-0 right-0 z-50 flex justify-center pointer-events-none px-3 sm:px-4"
      style={{ bottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}
    >
      <div className="glass pointer-events-auto w-full max-w-lg grid grid-cols-4 gap-1 p-1.5 rounded-[30px]">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-0.5 h-[58px] rounded-[24px]",
                "transition-[background-color,color,transform,box-shadow] duration-300 active:scale-95",
                active
                  ? "chip-active text-white"
                  : "text-ink-3 hover:bg-fill/60",
              )}
            >
              <Icon
                className="w-[22px] h-[22px]"
                strokeWidth={active ? 2.5 : 2}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-[12px] leading-tight truncate",
                  active ? "font-semibold" : "font-semibold",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
