import { WA_NUMBER } from "@/lib/constants";
import { ArrowRight, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

const WA_TEXT = "Halo, saya ingin menanyakan peningkatan status member akun LBQueen saya.";

// Kartu status untuk akun reguler. Strukturnya sengaja sama dengan
// MembershipStatus (judul bagian + kartu putih + mb-8) agar beranda rapi
// dan jarak ke bagian "Promo Tersedia" konsisten.
export function JoinMemberCard() {
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
            "absolute -right-8 -top-8 w-36 h-36 bg-gradient-to-br from-[#C94F78]/10 to-transparent",
            "rounded-full blur-2xl pointer-events-none",
          )}
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center gap-3 mb-4">
          <div
            className={cn(
              "w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C94F78] to-[#9B3055] flex items-center",
              "justify-center shrink-0 shadow-[0_6px_14px_-6px_rgba(168,57,96,0.6)]",
            )}
            aria-hidden="true"
          >
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-[#766B68] font-bold uppercase tracking-[0.1em] leading-none mb-1.5">
              Akun Reguler
            </p>
            <p className="text-[16px] font-bold text-[#2D2926] leading-tight">
              Akun Anda sudah aktif
            </p>
          </div>
        </div>

        <p className="relative z-10 text-[13px] text-[#766B68] font-medium leading-relaxed mb-4">
          Status membership dikelola oleh admin LBQueen. Hubungi admin untuk informasi peningkatan
          status akun.
        </p>

        <a
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "relative z-10 group flex w-full items-center justify-center gap-2 min-h-[44px] px-4",
            "rounded-2xl bg-[#FFF0F5] border border-[#F4D9E2] text-[13px] font-bold text-[#A83960]",
            "hover:bg-[#FBE7EE] active:scale-[0.99] transition-colors",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/25",
          )}
        >
          Tanya upgrade ke admin
          <ArrowRight
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>
      </div>
    </>
  );
}
