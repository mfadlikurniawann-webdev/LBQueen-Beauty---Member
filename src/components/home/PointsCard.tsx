import Link from "next/link";
import { ClipboardList, Crown, Gem, ShoppingCart, Ticket, type LucideIcon } from "lucide-react";
import { IconChip } from "@/components/IconChip";
import { formatNumber } from "@/lib/format";
import { TONES } from "@/lib/theme";
import { cn } from "@/lib/utils";

function Action({
  href,
  label,
  icon: Icon,
  count = 0,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={count > 0 ? `${label}, ${count}` : label}
      className="flex flex-col items-center gap-1.5 min-w-[60px] rounded-2xl py-1 active:scale-95 transition-transform"
    >
      <IconChip icon={Icon} tone="rose" size="sm" bare>
        {count > 0 && (
          <span
            className="absolute -top-2 -right-2.5 min-w-5 h-5 px-1 rounded-full bg-[#E0263F] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white tabular-nums"
            aria-hidden="true"
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </IconChip>
      <span className="text-[12px] font-semibold text-[#2D2926]">{label}</span>
    </Link>
  );
}

export function PointsCard({
  points,
  tierName,
  voucherCount,
  cartCount,
  bare = false,
}: {
  bare?: boolean;
  points: number;
  tierName: string;
  voucherCount: number;
  cartCount: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        !bare &&
          "glass-lit rounded-[24px] p-3.5 sm:p-4",
      )}
    >
      <Link href="/membership" className="flex items-center gap-3 min-w-0 flex-1 rounded-2xl">
        <IconChip icon={Gem} tone="gold" size="md" />
        <span className="min-w-0">
          <span className="flex items-baseline gap-1">
            <span className="text-[20px] font-extrabold text-[#2D2926] leading-none tabular-nums">
              {formatNumber(points || 0)}
            </span>
            <span className="text-[13px] font-bold text-[#2D2926]">poin</span>
          </span>
          <span
            className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ background: TONES.gold.tint, color: TONES.gold.ink }}
          >
            <Crown className="w-3 h-3" aria-hidden="true" />
            <span>{tierName}</span>
          </span>
        </span>
      </Link>
      <div className="flex items-start gap-0.5 sm:gap-2 shrink-0">
        <Action href="/promo" label="Voucher" icon={Ticket} count={voucherCount} />
        <Action href="/orders" label="Pesanan" icon={ClipboardList} />
        <Action href="/cart" label="Keranjang" icon={ShoppingCart} count={cartCount} />
      </div>
    </div>
  );
}
