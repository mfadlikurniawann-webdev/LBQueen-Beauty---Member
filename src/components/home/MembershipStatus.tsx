import { Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

const LABEL = "text-[11px] text-[#766B68] font-bold uppercase tracking-[0.1em]";

export function MembershipStatus({ tier, points }: { tier: string; points: number }) {
  return (
    <>
      <SectionHeading title="Status Membership" />
      <div
        className={cn(
          "bg-white rounded-[28px] p-5 border border-[#EEDFE3] shadow-[0_8px_24px_-12px_rgba(168,57,96,0.22)]",
          "mb-8 relative overflow-hidden",
        )}
      >
        <div
          className={cn(
            "absolute -right-6 -top-6 w-36 h-36 bg-gradient-to-br from-[#D4AF37]/15 to-transparent",
            "rounded-full blur-2xl pointer-events-none",
          )}
        />
        <div className="flex items-center justify-between gap-3 mb-5 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F7E7B4] to-[#FBF3DC] flex items-center",
                "justify-center border border-[#D4AF37]/30 shrink-0",
              )}
            >
              <Gem className="w-5 h-5 text-[#9A7614]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className={`${LABEL} leading-none mb-1.5`}>Tier Saat Ini</p>
              <p className="text-[16px] font-bold text-[#2D2926] leading-tight line-clamp-2">
                {tier}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[24px] font-extrabold text-[#A83960] leading-none tabular-nums">
              {points}
            </p>
            <p className="text-[11px] font-bold text-[#766B68] uppercase tracking-[0.1em] mt-1.5">
              Total Poin
            </p>
          </div>
        </div>

        <div className="relative z-10 rounded-2xl bg-[#FDF7F9] border border-[#F3E4E9] p-4">
          <p className="text-[12px] text-[#766B68] font-medium leading-relaxed">
            Status membership dikelola oleh admin LBQueen. Jumlah poin tidak otomatis mengubah tier
            Anda.
          </p>
        </div>
      </div>
    </>
  );
}
