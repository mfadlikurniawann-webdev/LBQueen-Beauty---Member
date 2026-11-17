import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { PRIMARY_GRADIENT } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PortalHeader({ scrolled, totalItems }: { scrolled: boolean; totalItems: number }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex justify-center">
      <div
        className="w-full max-w-7xl relative overflow-hidden transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid #EEDFE3" : "none",
          boxShadow: scrolled ? "0 4px 20px rgba(201,79,120,0.08)" : "none",
        }}
      >
        <div className="relative z-10 flex items-center justify-between gap-3 px-5 sm:px-8 lg:px-12 h-[72px]">
          <Link
            href="/"
            aria-label="LBQueen Care & Beauty, ke beranda"
            className="flex items-center gap-2.5 min-w-0 rounded-2xl"
          >
            <div
              className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center overflow-hidden bg-white"
              style={{
                border: scrolled ? "1px solid #EEDFE3" : "1px solid rgba(255,255,255,0.35)",
                boxShadow: scrolled
                  ? "0 2px 8px rgba(201,79,120,0.10)"
                  : "0 4px 14px rgba(45,41,38,0.12)",
              }}
            >
              <Image
                src="/lbqueen_logo.png"
                alt=""
                width={80}
                height={32}
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <p
                className="text-[16px] font-bold leading-none tracking-tight"
                style={{ color: scrolled ? "#A83960" : "white" }}
              >
                LBQueen
              </p>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.12em] mt-1 leading-none"
                style={{ color: scrolled ? "#766B68" : "rgba(255,255,255,0.85)" }}
              >
                Care & Beauty
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              aria-label={totalItems > 0 ? `Keranjang, ${totalItems} item` : "Keranjang"}
              className="relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
              style={{
                background: scrolled ? "#FDF2F5" : "rgba(255,255,255,0.18)",
                border: scrolled ? "1px solid #F6DDE6" : "1px solid rgba(255,255,255,0.28)",
              }}
            >
              <ShoppingCart
                className="w-5 h-5"
                style={{ color: scrolled ? "#A83960" : "white" }}
                aria-hidden="true"
              />
              {totalItems > 0 && (
                <span
                  className={cn(
                    "absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-white text-[11px] font-bold",
                    "tabular-nums flex items-center justify-center ring-2 ring-white",
                  )}
                  style={{ background: PRIMARY_GRADIENT }}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
