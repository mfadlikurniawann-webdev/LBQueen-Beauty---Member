import Link from "next/link";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { PRIMARY_GRADIENT } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Home, label: "Beranda", href: "/" },
  { icon: ShoppingCart, label: "Keranjang", href: "/cart" },
  { icon: ShoppingBag, label: "Pesanan", href: "/orders" },
  { icon: User, label: "Profil", href: "/profile" },
];

export function BottomNav({ pathname, totalItems }: { pathname: string; totalItems: number }) {
  return (
    <nav
      aria-label="Navigasi pelanggan"
      className="fixed bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-3 sm:px-4"
    >
      <div
        className={cn(
          "w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[32px] border border-[#EEDFE3] flex",
          "items-center justify-around px-1.5 pt-2 pointer-events-auto",
        )}
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom, 10px), 10px)",
          boxShadow: "0 10px 40px rgba(201,79,120,0.16)",
        }}
      >
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          const showBadge = href === "/cart" && totalItems > 0;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={showBadge ? `${label}, ${totalItems} item` : undefined}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 min-w-0 py-1 rounded-2xl transition-all",
                "duration-300 active:scale-90",
              )}
            >
              <div
                className={cn(
                  "relative w-12 h-9 rounded-2xl flex items-center justify-center transition-all duration-300",
                  active && "shadow-[0_6px_14px_rgba(201,79,120,0.30)]",
                )}
                style={active ? { background: PRIMARY_GRADIENT } : undefined}
              >
                <Icon
                  className="w-5 h-5 transition-all duration-300"
                  style={{ color: active ? "#FFFFFF" : "#766B68" }}
                  strokeWidth={active ? 2.4 : 2}
                  aria-hidden="true"
                />
                {showBadge && (
                  <span
                    className={cn(
                      "absolute -top-1 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[11px]",
                      "leading-none font-bold tabular-nums flex items-center justify-center ring-2 ring-white",
                    )}
                    style={
                      active
                        ? { background: "#FFFFFF", color: "#A83960" }
                        : { background: PRIMARY_GRADIENT, color: "#FFFFFF" }
                    }
                    aria-hidden="true"
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[12px] leading-tight transition-all duration-300 truncate max-w-full",
                  active ? "font-bold" : "font-semibold",
                )}
                style={{ color: active ? "#A83960" : "#5F5552" }}
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
