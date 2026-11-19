import Link from "next/link";
import { ClipboardList, Gem, ShoppingCart, Ticket, type LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/format";
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
      <span className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#D9648C] to-[#A83960] flex items-center justify-center shadow-[0_4px_10px_-4px_rgba(168,57,96,0.6)]">
        <Icon className="w-[18px] h-[18px] text-white" strokeWidth={2.3} aria-hidden="true" />
        {count > 0 && (
          <span
            className="absolute -top-2 -right-2.5 min-w-5 h-5 px-1 rounded-full bg-[#E0263F] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white tabular-nums"
            aria-hidden="true"
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </span>
      <span className="text-[12px] font-semibold text-[#2D2926]">{label}</span>
    </Link>
  );
}

export function PointsCard({
  points,
  voucherCount,
  cartCount,
}: {
  points: number;
  voucherCount: number;
  cartCount: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[22px] bg-white border border-[#F0E4E8] p-3.5 sm:p-4",
        "shadow-[0_10px_30px_-16px_rgba(122,34,64,0.35)]",
      )}
    >
      <Link href="/membership" className="flex items-center gap-3 min-w-0 flex-1 rounded-2xl">
        <span className="w-11 h-11 shrink-0 rounded-full bg-[#FFE3EE] flex items-center justify-center">
          <Gem className="w-5 h-5 text-[#C94F78]" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="flex items-baseline gap-1">
            <span className="text-[20px] font-extrabold text-[#2D2926] leading-none tabular-nums">
              {formatNumber(points || 0)}
            </span>
            <span className="text-[13px] font-bold text-[#2D2926]">poin</span>
          </span>
          <span className="block text-[12px] font-medium text-[#766B68] mt-1 truncate">
            Poin LBQueen
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
