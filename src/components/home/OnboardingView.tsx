import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PRIMARY_GRADIENT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ONBOARDING_IMAGES, OnboardingImages } from "./OnboardingImages";

const ONBOARDING_SLIDES = [
  {
    title: "Kecantikan Alami Impian Anda",
    desc: "Temukan keindahan alami Anda bersama perawatan premium terbaik dari terapis ahli kami.",
  },
  {
    title: "Layanan Estetika Kelas Dunia",
    desc: "Nikmati perawatan klinis premium yang aman, higienis, dan terpercaya untuk hasil maksimal.",
  },
  {
    title: "Kulit Sehat Berkilau Bersinar",
    desc: "Konsultasikan kecantikan Anda sekarang dan rasakan transformasi kulit sehat impian Anda.",
  },
];

function useRotation(length: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % length);
    }, 7000);
    return () => clearInterval(timer);
  }, [length]);
  return index;
}

export function OnboardingView() {
  const router = useRouter();
  const currentImageIndex = useRotation(ONBOARDING_IMAGES.length);
  const onboardSlide = useRotation(ONBOARDING_SLIDES.length);
  const slide = ONBOARDING_SLIDES[onboardSlide];

  return (
    <div className="min-h-screen bg-[#FDFBFB] flex flex-col lg:flex-row w-full">
      <div
        className={cn(
          "hidden lg:flex flex-col items-center justify-center lg:w-[58%] relative p-12",
          "bg-gradient-to-br from-[#FFF5F8] to-[#FFF0F4] border-r border-rose-100/20",
        )}
      >
        <div
          className="absolute top-12 left-12 w-72 h-72 bg-[#C94F78]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute bottom-12 right-12 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s" }}
        />

        <div
          className={cn(
            "relative w-full max-w-[640px] aspect-[16/10] rounded-[36px] overflow-hidden shadow-2xl",
            "shadow-rose-200/20 bg-white p-3 border border-rose-100/30",
          )}
        >
          <div className="relative w-full h-full rounded-[28px] overflow-hidden">
            <OnboardingImages active={currentImageIndex} desktop />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent",
                "pointer-events-none",
              )}
            />

            <div
              className={cn(
                "absolute bottom-6 left-6 z-10 flex items-center gap-2 bg-white/20 backdrop-blur-md",
                "px-4 py-2 rounded-2xl border border-white/30 text-white",
              )}
            >
              <span className="text-[12px] font-bold uppercase tracking-[0.08em]">
                Care & Beauty Clinic
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex-1 flex flex-col justify-between px-6 py-12 lg:py-16 max-w-md mx-auto lg:max-w-none",
          "lg:mx-0 lg:w-[42%] bg-white lg:shadow-2xl lg:shadow-black/5",
        )}
      >
        <div className="flex flex-col items-center pt-2 lg:pt-6">
          <div
            className={cn(
              "w-[76px] h-[76px] rounded-[24px] bg-white border border-[#EEDFE3] flex items-center",
              "justify-center overflow-hidden mb-3 shadow-lg shadow-rose-100/70 transition-transform",
              "hover:scale-105 duration-300",
            )}
          >
            <Image
              src="/lbqueen_logo.png"
              alt="LBQueen Logo"
              width={56}
              height={56}
              className="object-contain"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <p className="font-bold text-[18px] tracking-tight text-[#A83960]">LBQueen</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-[#766B68]">
            Care & Beauty
          </p>
        </div>

        <div className="lg:hidden flex items-center justify-center my-6 w-full">
          <div
            className={cn(
              "relative w-full aspect-[16/10] rounded-[32px] overflow-hidden shadow-xl",
              "shadow-rose-200/40 bg-white p-1.5 border border-[#EEDFE3]",
            )}
          >
            <div className="relative w-full h-full rounded-[24px] overflow-hidden">
              <OnboardingImages active={currentImageIndex} desktop={false} />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent",
                  "pointer-events-none",
                )}
              />
            </div>
          </div>
        </div>

        <div
          className="text-center px-2 sm:px-4 my-6 lg:my-8 min-h-[132px] flex flex-col justify-center"
          aria-live="polite"
        >
          <h2
            className={cn(
              "text-[24px] font-bold text-[#2D2926] tracking-tight leading-snug mb-3 transition-all",
              "duration-500 lg:text-[28px]",
            )}
          >
            {slide.title}
          </h2>
          <p
            className={cn(
              "text-[14px] leading-relaxed text-[#5F5552] transition-all duration-500 max-w-[320px]",
              "mx-auto lg:max-w-[380px] lg:text-[15px]",
            )}
          >
            {slide.desc}
          </p>

          <div className="flex justify-center gap-1.5 mt-6" aria-hidden="true">
            {ONBOARDING_SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  onboardSlide === i ? "w-6 bg-[#C94F78]" : "w-1.5 bg-[#E6CFD7]"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 w-full px-0 sm:px-2 lg:px-8 max-w-[380px] mx-auto">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className={cn(
              "group w-full h-[56px] rounded-2xl text-white text-[16px] font-bold flex items-center",
              "justify-center gap-2 transition-all active:scale-[0.98] hover:shadow-xl",
              "hover:shadow-rose-200/70 shadow-lg shadow-rose-200/60 cursor-pointer animate-in fade-in",
              "duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/30",
            )}
            style={{ background: PRIMARY_GRADIENT }}
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
              "w-full min-h-[56px] px-4 rounded-2xl text-[14px] flex flex-wrap items-center",
              "justify-center gap-x-1 transition-all active:scale-[0.98] border border-[#EEDFE3] bg-white",
              "hover:bg-[#FDF2F5] hover:border-[#C94F78]/30 cursor-pointer animate-in fade-in duration-350",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20",
            )}
          >
            <span className="font-medium text-[#766B68]">Belum ada akun?</span>
            <span className="font-bold text-[#A83960]">Daftar dulu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
