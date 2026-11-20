import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { BRAND_BANNERS, waLink } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { BannerCarousel } from "./BannerCarousel";
import { BrandMark } from "@/components/BrandMark";

// Satu teks per banner (urutan sama dengan BRAND_BANNERS).
const SLIDES = [
  {
    title: "Selamat datang di LBQueen!",
    desc: "Klinik perawatan kulit dan kecantikan dalam satu aplikasi.",
  },
  {
    title: "Pesan treatment favoritmu",
    desc: "Pilih treatment, atur jadwal, lalu konfirmasi lewat WhatsApp.",
  },
  {
    title: "Ditangani tenaga medis",
    desc: "Pelayanan ramah dan terstandar oleh tim profesional.",
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
    <div className="min-h-dvh flex flex-col">
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
            className="chip-glass h-10 px-4 rounded-full flex items-center gap-2 text-[14px] font-semibold text-[#3F3734] hover:bg-white/90 transition-colors"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" /> Bantuan
          </a>
        </div>

        <div className="flex-1 flex flex-col justify-center py-6">
          <div data-reveal className="glass-lit rounded-[32px] p-1.5">
            <div className="rounded-[26px] overflow-hidden">
              <BannerCarousel intervalMs={4000} dots={false} onIndexChange={setSlide} />
            </div>
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
                  "h-2 rounded-full transition-all duration-300",
                  slide === i ? "w-6 bg-[#C94F78]" : "w-2 bg-[#C94F78]/25",
                )}
              />
            ))}
          </div>
        </div>

        <div data-reveal className="space-y-3">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="btn-primary w-full h-[54px] text-[17px]"
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="btn-glass w-full h-[54px] text-[17px]"
          >
            Belum ada akun? Daftar dulu
          </button>
        </div>
      </div>
    </div>
  );
}
