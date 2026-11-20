import Link from "next/link";
import { ChevronRight, Crown, Gem } from "lucide-react";
import { IconChip } from "@/components/IconChip";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Ringkasan poin + tier; pintasan Voucher/Pesanan/Keranjang sudah ada di grid layanan. */
export function PointsCard({
  points,
  tierName,
  bare = false,
}: {
  bare?: boolean;
  points: number;
  tierName: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center",
        !bare &&
          "glass-lit rounded-[24px] p-3.5 sm:p-4",
      )}
    >
      <Link
        href="/membership"
        className="flex items-center gap-3 min-w-0 flex-1 min-h-11 rounded-2xl"
      >
        <IconChip icon={Gem} tone="gold" size="md" />
        <span className="min-w-0 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="flex items-baseline gap-1">
            <span className="text-[20px] font-bold text-ink leading-none tabular-nums">
              {formatNumber(points || 0)}
            </span>
            <span className="text-[13px] font-semibold text-ink">poin</span>
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold bg-gold-soft text-gold-ink"
          >
            <Crown className="w-3 h-3" aria-hidden="true" />
            <span>{tierName}</span>
          </span>
        </span>
        <ChevronRight className="w-5 h-5 text-brand-ink shrink-0 ml-auto" aria-hidden="true" />
      </Link>
    </div>
  );
}
