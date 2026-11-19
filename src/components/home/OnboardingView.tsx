import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarHeart, Gem, Ticket } from "lucide-react";
import { BANNER_BG, PRIMARY_GRADIENT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { BannerCarousel } from "./BannerCarousel";

const HIGHLIGHTS = [
  { icon: CalendarHeart, label: "Booking treatment online", color: "#C94F78", tint: "#FFE3EE" },
  { icon: Ticket, label: "Voucher & promo pilihan", color: "#2F8F5B", tint: "#E3F5EA" },
  { icon: Gem, label: "Kumpulkan poin member", color: "#B8861A", tint: "#FFF4D1" },
];

export function OnboardingView() {
  const router = useRouter();
  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-white">
      <div
        className="relative lg:w-[56%] lg:min-h-dvh flex flex-col justify-center"
        style={{ background: BANNER_BG }}
      >
        <div
          className="flex items-center gap-2.5 px-5 sm:px-8 pb-1 lg:absolute lg:top-8 lg:left-10"
          style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 18px)" }}
        >
          <span className="w-10 h-10 rounded-2xl bg-white border border-white overflow-hidden flex items-center justify-center shadow-sm">
            <Image
              src="/lbqueen_logo.png"
              alt=""
              width={40}
              height={40}
              className="object-contain"
            />
          </span>
          <span className="leading-none">
            <span className="block text-[17px] font-bold text-[#A83960]">LBQueen</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766B68] mt-1">
              Care & Beauty Clinic
            </span>
          </span>
        </div>
        <BannerCarousel />
      </div>

      <div className="flex-1 flex flex-col px-5 sm:px-8 pt-6 pb-8 lg:justify-center lg:px-14 max-w-xl w-full mx-auto">
        <h1 className="text-[26px] lg:text-[34px] font-bold! text-[#2D2926] leading-tight tracking-tight">
          Rawat dirimu bareng LBQueen
        </h1>
        <p className="text-[15px] text-[#5F5552] leading-relaxed mt-2">
          Pesan treatment dan produk kecantikan, pantau pesanan, dan nikmati promo dalam satu
          aplikasi.
        </p>

        <ul className="mt-6 space-y-3">
          {HIGHLIGHTS.map(({ icon: Icon, label, color, tint }) => (
            <li key={label} className="flex items-center gap-3">
              <span
                className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center"
                style={{ background: tint }}
              >
                <Icon className="w-5 h-5" style={{ color }} aria-hidden="true" />
              </span>
              <span className="text-[15px] font-semibold text-[#2D2926]">{label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto lg:mt-10 pt-8 space-y-3">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className={cn(
              "group w-full h-[54px] rounded-full text-white text-[16px] font-bold flex items-center",
              "justify-center gap-2 active:scale-[0.98] transition-transform",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/30",
            )}
            style={{
              background: PRIMARY_GRADIENT,
              boxShadow: "0 12px 28px -12px rgba(168,57,96,0.7)",
            }}
          >
            Masuk
            <ArrowRight
              className="w-5 h-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className={cn(
              "w-full h-[54px] rounded-full border-2 border-[#E6D3DA] bg-white text-[15px]",
              "flex items-center justify-center gap-1 hover:bg-[#FFF3F7] active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20",
            )}
          >
            <span className="font-medium text-[#766B68]">Belum ada akun?</span>
            <span className="font-bold text-[#A83960]">Daftar dulu</span>
          </button>
          <p className="text-center text-[12px] text-[#8C8280] pt-1">
            PT. LBQueen Care Beauty · Bandar Lampung
          </p>
        </div>
      </div>
    </div>
  );
}
