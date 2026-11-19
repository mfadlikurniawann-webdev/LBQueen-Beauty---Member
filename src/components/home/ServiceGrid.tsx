import Link from "next/link";
import {
  BadgePercent,
  CircleHelp,
  ClipboardList,
  Crown,
  Scissors,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { waLink } from "@/lib/constants";

type Service = {
  label: string;
  href: string;
  icon: LucideIcon;
  tint: string;
  color: string;
  badge?: string;
  external?: boolean;
};

export const CATALOG_SHORTCUTS = ["/category/layanan", "/category/produk", "/category/promo"];

export function ServiceGrid({
  voucherCount,
  cartCount,
}: {
  voucherCount: number;
  cartCount: number;
}) {
  const services: Service[] = [
    {
      label: "Layanan",
      href: "/category/layanan",
      icon: Scissors,
      tint: "#FFE3EE",
      color: "#C94F78",
    },
    {
      label: "Produk",
      href: "/category/produk",
      icon: ShoppingBag,
      tint: "#FFEFD9",
      color: "#D4823A",
    },
    {
      label: "Promo",
      href: "/category/promo",
      icon: BadgePercent,
      tint: "#FFE2E2",
      color: "#E0475B",
    },
    {
      label: "Voucher",
      href: "/promo",
      icon: Ticket,
      tint: "#E3F5EA",
      color: "#2F8F5B",
      badge: voucherCount > 0 ? `${voucherCount} kode` : undefined,
    },
    {
      label: "Keranjang",
      href: "/cart",
      icon: ShoppingCart,
      tint: "#E5EEFF",
      color: "#3B6FD8",
      badge: cartCount > 0 ? `${cartCount} item` : undefined,
    },
    { label: "Pesanan", href: "/orders", icon: ClipboardList, tint: "#EFEAFF", color: "#6C4FD1" },
    { label: "Membership", href: "/membership", icon: Crown, tint: "#FFF4D1", color: "#B8861A" },
    {
      label: "Bantuan",
      href: waLink("Halo admin LBQueen, saya butuh bantuan."),
      icon: CircleHelp,
      tint: "#EFEDEE",
      color: "#5F5552",
      external: true,
    },
  ];

  return (
    <nav aria-label="Menu layanan" className="grid grid-cols-4 lg:grid-cols-8 gap-x-2 gap-y-5">
      {services.map((s) => {
        const Icon = s.icon;
        const content = (
          <>
            <span
              className="relative w-[60px] h-[60px] rounded-[20px] flex items-center justify-center"
              style={{ background: s.tint }}
            >
              <Icon
                className="w-7 h-7"
                style={{ color: s.color }}
                strokeWidth={2}
                aria-hidden="true"
              />
              {s.badge && (
                <span className="absolute -top-2 -left-2 rounded-full bg-[#2D2926] px-1.5 py-0.5 text-[11px] font-bold text-white whitespace-nowrap tabular-nums ring-2 ring-[#FBF9F9]">
                  {s.badge}
                </span>
              )}
            </span>
            <span className="text-[13px] font-medium text-[#3F3734] text-center leading-tight truncate max-w-full">
              {s.label}
            </span>
          </>
        );
        const cls =
          "flex min-w-0 flex-col items-center gap-2 rounded-2xl active:scale-95 transition-transform";
        return s.external ? (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={cls}>
            {content}
          </a>
        ) : (
          <Link key={s.label} href={s.href} className={cls}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
