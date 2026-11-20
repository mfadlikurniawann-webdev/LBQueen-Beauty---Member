import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";
import type { Customer } from "@/lib/customer";
import { formatNumber } from "@/lib/format";
import { tierOf } from "@/lib/membership";

export function ProfileSummary({ customer }: { customer: Customer }) {
  const tier = tierOf(customer);
  return (
    <div data-reveal className="glass-lit spotlight rounded-[30px] overflow-hidden">
      <div className="p-4 sm:p-5 flex items-center gap-4 relative z-10">
        <div
          className="w-[72px] h-[72px] shrink-0 rounded-full p-[3px]"
          style={{ background: tier.card }}
          aria-hidden="true"
        >
          <div className="w-full h-full rounded-full bg-white/85 flex items-center justify-center text-[28px] font-bold text-[#A83960]">
            {customer.name?.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[20px] font-bold! text-[#2D2926] leading-snug line-clamp-2 break-words">
            {customer.name}
          </h2>
          {customer.username && (
            <p className="text-[14px] text-[#5F5552] truncate">@{customer.username}</p>
          )}
          <p className="text-[14px] text-[#5F5552] tabular-nums truncate">
            {customer.phone || "—"}
          </p>
        </div>
      </div>
      <Link
        href="/membership"
        className="mx-2 mb-2 rounded-[22px] py-3 px-3.5 sm:px-4 flex items-center gap-2.5 border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-transform active:scale-[0.99]"
        style={{ background: tier.chip }}
      >
        <Crown className="w-5 h-5 shrink-0 text-[#B8861A]" fill="#F5D57A" aria-hidden="true" />
        <span className="text-[14px] font-bold text-[#2D2926] flex-1 min-w-0 truncate">
          {tier.id === "regular" ? "Akun Reguler" : `${tier.name} Member`}
        </span>
        <span className="text-[13px] font-semibold text-[#2D2926] tabular-nums">
          {formatNumber(customer.points || 0)} Poin
        </span>
        <span className="chip-active w-7 h-7 shrink-0 rounded-full flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
