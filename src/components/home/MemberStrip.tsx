import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";
import { waLink } from "@/lib/constants";
import { cn } from "@/lib/utils";

const WA_TEXT = "Halo, saya ingin menanyakan peningkatan status member akun LBQueen saya.";

const STRIP = cn(
  "relative overflow-hidden rounded-[22px] px-4 py-4 sm:px-6 flex items-center gap-4",
  "bg-[linear-gradient(110deg,#FFE3EE_0%,#FFF1F6_45%,#FCEFC9_100%)] border border-[#F6D9E4]",
);
const CTA = cn(
  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-white",
  "bg-gradient-to-r from-[#C94F78] to-[#9B3055] shadow-[0_6px_16px_-6px_rgba(168,57,96,0.6)]",
  "active:scale-95 transition-transform",
);

function Medal() {
  return (
    <span
      className="hidden min-[380px]:flex w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-[#F7D774] to-[#C9961E] items-center justify-center shadow-[0_6px_16px_-6px_rgba(184,134,26,0.7)]"
      aria-hidden="true"
    >
      <Crown className="w-7 h-7 text-white" fill="rgba(255,255,255,0.35)" />
    </span>
  );
}

export function MemberStrip({ isMember, tierName }: { isMember: boolean; tierName: string }) {
  if (!isMember)
    return (
      <div className={STRIP}>
        <Medal />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#A83960]">
            Akun Reguler
          </p>
          <h3 className="text-[16px] font-bold! text-[#2D2926] leading-snug">
            Akun Anda sudah aktif
          </h3>
          <p className="text-[12px] text-[#5F5552] mt-0.5 mb-2.5">
            Status member dikelola admin LBQueen. Tanyakan peluang upgrade lewat WhatsApp.
          </p>
          <a href={waLink(WA_TEXT)} target="_blank" rel="noopener noreferrer" className={CTA}>
            Tanya upgrade ke admin
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    );

  return (
    <div className={STRIP}>
      <Medal />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8A6414]">
          Membership
        </p>
        <h3 className="text-[16px] font-bold! text-[#2D2926] leading-snug">
          Nikmati benefit member Anda
        </h3>
        <p className="text-[12px] text-[#5F5552] mt-0.5 mb-2.5">
          Lihat poin, status tier, dan keuntungan akun {tierName.toLowerCase()} Anda.
        </p>
        <Link href="/membership" className={CTA}>
          Lihat benefit
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
