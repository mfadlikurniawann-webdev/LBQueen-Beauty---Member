import Link from "next/link";
import { BadgePercent, ClipboardList, Home, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
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
      className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none px-3 sm:px-4"
      style={{ bottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}
    >
      <div
        className={cn(
          "pointer-events-auto w-full max-w-lg grid grid-cols-4 gap-1 p-1.5 rounded-[30px]",
          "bg-white/95 backdrop-blur-2xl border border-[#F0E4E8]",
        )}
        style={{ boxShadow: "0 10px 36px rgba(45,41,38,0.14)" }}
      >
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-0.5 h-[58px] rounded-[24px]",
                "transition-colors duration-200 active:scale-95",
                active ? "bg-[#FFE3EE] text-[#A83960]" : "text-[#6F6461] hover:bg-[#FBF3F6]",
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
                  active ? "font-bold" : "font-semibold",
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
