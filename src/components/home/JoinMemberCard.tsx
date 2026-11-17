import { WA_NUMBER } from "@/lib/constants";
import { ArrowRight, Gem, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function JoinMemberCard() {
  return (
    <a
      href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo, saya ingin menanyakan peningkatan status member akun LBQueen saya.")}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block group rounded-[32px] focus-visible:outline-none focus-visible:ring-4",
        "focus-visible:ring-[#C94F78]/25",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[32px] p-5 sm:p-6 border border-[#EEDFE3]",
          "shadow-[0_8px_24px_-12px_rgba(168,57,96,0.25)] transition-all duration-500",
          "hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-1 active:scale-[0.98]",
        )}
        style={{ background: "linear-gradient(135deg, #fff 0%, #FFF5F8 100%)" }}
      >
        <div
          className={cn(
            "absolute -right-12 -top-12 w-48 h-48 bg-[#C94F78]/5 rounded-full blur-3xl",
            "group-hover:bg-[#C94F78]/10 transition-colors duration-500",
          )}
        />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl" />

        <div className="relative z-10 flex items-center justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C94F78]/10 text-[#A83960]",
                "text-[11px] font-bold uppercase tracking-[0.1em] mb-3",
              )}
            >
              <Star className="w-3 h-3 fill-current" aria-hidden="true" />
              Akun Reguler
            </div>
            <h3 className="text-[18px] font-bold text-[#2D2926] leading-snug mb-2 tracking-tight">
              Akun Anda sudah aktif
            </h3>
            <p className="text-[13px] text-[#766B68] font-medium max-w-[260px] leading-relaxed">
              Status membership dikelola oleh admin LBQueen. Hubungi admin untuk informasi
              peningkatan status akun.
            </p>
            <span
              className={cn(
                "mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#A83960]",
                "group-hover:text-[#7A2240] transition-colors",
              )}
            >
              {"Tanya upgrade ke admin "}
              <ArrowRight
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </div>

          <div
            className={cn(
              "relative hidden min-[360px]:flex w-20 h-20 sm:w-24 sm:h-24 items-center justify-center",
              "shrink-0",
            )}
            aria-hidden="true"
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br from-[#C94F78] to-[#9B3055] rounded-[24px] rotate-12",
                "opacity-10 group-hover:rotate-6 transition-transform duration-500",
              )}
            />
            <div
              className={cn(
                "w-14 h-20 sm:w-16 sm:h-22 bg-gradient-to-br from-[#C94F78] to-[#9B3055] rounded-2xl",
                "shadow-2xl shadow-[#C94F78]/30 flex flex-col justify-between p-3 transform -rotate-12",
                "group-hover:-rotate-6 transition-transform duration-500 border border-white/20",
              )}
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Gem className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-2">
                <div className="w-8 sm:w-10 h-1 bg-white/50 rounded-full" />
                <div className="w-6 sm:w-8 h-1 bg-white/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
