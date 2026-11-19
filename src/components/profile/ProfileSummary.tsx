import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";
import type { Customer } from "@/lib/customer";
import { formatNumber } from "@/lib/format";
import { tierOf } from "@/lib/membership";

export function ProfileSummary({ customer }: { customer: Customer }) {
  const tier = tierOf(customer);
  return (
    <div className="rounded-[24px] overflow-hidden shadow-[0_14px_36px_-18px_rgba(122,34,64,0.45)]">
      <div className="bg-white border border-[#F0E4E8] rounded-[24px] p-4 sm:p-5 flex items-center gap-4 relative z-10">
        <div
          className="w-[72px] h-[72px] shrink-0 rounded-full p-[3px]"
          style={{ background: tier.card }}
          aria-hidden="true"
        >
          <div className="w-full h-full rounded-full bg-[#FFF3F7] flex items-center justify-center text-[28px] font-bold text-[#A83960]">
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
        className="-mt-5 pt-7 pb-3 px-4 sm:px-5 flex items-center gap-2.5"
        style={{ background: tier.chip }}
      >
        <Crown className="w-5 h-5 shrink-0 text-[#7A4B0B]" fill="#F5C842" aria-hidden="true" />
        <span className="text-[14px] font-bold text-[#4A2A06] flex-1 min-w-0 truncate">
          {tier.id === "regular" ? "Akun Reguler" : `${tier.name} Member`}
        </span>
        <span className="text-[13px] font-semibold text-[#4A2A06] tabular-nums">
          {formatNumber(customer.points || 0)} Poin
        </span>
        <span className="w-7 h-7 shrink-0 rounded-full bg-[#5A2A0C] flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}
