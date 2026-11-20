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
import { IconChip } from "@/components/IconChip";
import { waLink } from "@/lib/constants";
import type { Tone } from "@/lib/theme";

type Service = {
  label: string;
  href: string;
  icon: LucideIcon;
  tone: Tone;
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
    { label: "Layanan", href: "/category/layanan", icon: Scissors, tone: "rose" },
    { label: "Produk", href: "/category/produk", icon: ShoppingBag, tone: "berry" },
    { label: "Promo", href: "/category/promo", icon: BadgePercent, tone: "rose" },
    {
      label: "Voucher",
      href: "/promo",
      icon: Ticket,
      tone: "gold",
      badge: voucherCount > 0 ? `${voucherCount} kode` : undefined,
    },
    {
      label: "Keranjang",
      href: "/cart",
      icon: ShoppingCart,
      tone: "berry",
      badge: cartCount > 0 ? `${cartCount} item` : undefined,
    },
    { label: "Pesanan", href: "/orders", icon: ClipboardList, tone: "rose" },
    { label: "Membership", href: "/membership", icon: Crown, tone: "gold" },
    {
      label: "Bantuan",
      href: waLink("Halo admin LBQueen, saya butuh bantuan."),
      icon: CircleHelp,
      tone: "mauve",
      external: true,
    },
  ];

  return (
    <nav aria-label="Menu layanan" className="grid grid-cols-4 gap-x-2 gap-y-4">
      {services.map((s) => {
        const content = (
          <>
            <IconChip
              icon={s.icon}
              tone={s.tone}
              size="lg"
              className="transition-transform group-hover:-translate-y-0.5"
            >
              {s.badge && (
                <span className="absolute -top-2 -left-2 rounded-full bg-[#2D2926] px-1.5 py-0.5 text-[12px] font-bold text-white whitespace-nowrap tabular-nums ring-2 ring-white">
                  {s.badge}
                </span>
              )}
            </IconChip>
            <span className="text-[13px] font-medium text-[#3F3734] text-center leading-tight truncate max-w-full">
              {s.label}
            </span>
          </>
        );
        const cls =
          "group flex min-w-0 flex-col items-center gap-2 rounded-2xl active:scale-95 transition-transform";
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
