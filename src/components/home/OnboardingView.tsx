import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { BRAND_BANNERS, waLink } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { BannerCarousel } from "./BannerCarousel";
import { BrandMark } from "@/components/BrandMark";

const SLIDES = [
  {
    title: "Selamat datang di LBQueen!",
    desc: "Klinik perawatan kulit dan kecantikan, kini dalam genggamanmu.",
  },
  {
    title: "Pesan treatment favoritmu",
    desc: "Pilih treatment, atur jadwal, lalu konfirmasi lewat WhatsApp.",
  },
  {
    title: "Buka Senin sampai Sabtu",
    desc: "Senin–Kamis 09.00–21.00, Jumat–Sabtu 10.00–21.00 WIB.",
  },
];

export function OnboardingView() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const text = SLIDES[slide % SLIDES.length];

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <div
        className="w-full max-w-md mx-auto flex-1 flex flex-col px-5"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px), 16px)",
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 20px)",
        }}
      >
        <div className="flex items-center justify-between h-12">
          <BrandMark size={48} />
          <a
            href={waLink("Halo admin LBQueen, saya ingin bertanya.")}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-4 rounded-full border border-[#E6D3DA] flex items-center gap-2 text-[14px] font-semibold text-[#3F3734]"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" /> Bantuan
          </a>
        </div>

        <div className="flex-1 flex flex-col justify-center py-6">
          <div className="rounded-[28px] overflow-hidden">
            <BannerCarousel intervalMs={4000} dots={false} onIndexChange={setSlide} />
          </div>
          <div className="mt-7 text-center min-h-[104px]" aria-live="polite">
            <h1
              key={text.title}
              className="text-[24px] font-extrabold! tracking-tight text-[#2D2926] animate-in fade-in duration-500"
            >
              {text.title}
            </h1>
            <p
              key={text.desc}
              className="mt-2 text-[16px] leading-relaxed text-[#5F5552] animate-in fade-in duration-500"
            >
              {text.desc}
            </p>
          </div>
          <div className="mt-4 flex justify-center gap-2" aria-hidden="true">
            {BRAND_BANNERS.map((banner, i) => (
              <span
                key={banner.src}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-300",
                  slide === i ? "bg-[#C94F78]" : "bg-[#E3D3D9]",
                )}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full h-[54px] rounded-full bg-[#C94F78] text-white text-[17px] font-bold active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/30"
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="w-full h-[54px] rounded-full border-2 border-[#C94F78] text-[#A83960] text-[17px] font-bold active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20"
          >
            Belum ada akun? Daftar dulu
          </button>
        </div>
      </div>
    </div>
  );
}
