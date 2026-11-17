import Image from "next/image";
import { cn } from "@/lib/utils";

export const PROMO_SLIDES = [
  {
    title: "Kecantikan Alami,\nHanya Untuk Anda",
    subtitle: "Pesan layanan kecantikan favorit Anda sekarang.",
    bg: "linear-gradient(135deg, #C94F78 0%, #9B3055 100%)",
    image: "/beauty_carousel_1_1778829705862.png",
  },
  {
    title: "Treatment Premium,\nHarga Terjangkau",
    subtitle: "Nikmati perawatan kelas dunia di LBQueen.",
    bg: "linear-gradient(135deg, #9B3055 0%, #7A2240 100%)",
    image: "/beauty_carousel_2_1778829728230.png",
  },
  {
    title: "Kulit Sehat Berkilau,\nImpian Jadi Nyata",
    subtitle: "Konsultasikan kecantikan Anda dengan ahli kami.",
    bg: "linear-gradient(135deg, #7A2240 0%, #C94F78 100%)",
    image: "/beauty_carousel_3_1778829748066.png",
  },
];

export function PromoCarousel({ activeSlide }: { activeSlide: number }) {
  const slide = PROMO_SLIDES[activeSlide];
  return (
    <div data-reveal className="portal-section">
      <div
        className={cn(
          "relative w-full h-[200px] sm:h-[240px] lg:h-[300px] rounded-[32px] overflow-hidden",
          "shadow-sm transition-all duration-500",
        )}
        style={{ background: slide.bg }}
      >
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute right-12 bottom-0 w-24 h-24 rounded-full bg-[#D4AF37] opacity-20 blur-xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full border-[20px] border-white/5"></div>

        <div className="relative z-10 w-[85%] sm:w-[70%] h-full flex flex-col justify-center px-6 sm:px-8 lg:px-12">
          <h3
            className={cn(
              "text-white text-2xl lg:text-4xl font-semibold leading-tight mb-3",
              "whitespace-pre-line transition-all duration-700",
            )}
          >
            {slide.title}
          </h3>
          <p className="text-white/90 text-sm mb-4 transition-all duration-700">{slide.subtitle}</p>
        </div>
        <div className="absolute right-0 bottom-0 h-full w-[100%] flex items-end justify-end pointer-events-none">
          <Image
            src={slide.image}
            alt="Promotion"
            fill
            className="object-cover opacity-60 mix-blend-overlay"
          />
        </div>

        <div className="absolute bottom-4 right-6 flex gap-1.5">
          {PROMO_SLIDES.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                activeSlide === i ? "w-4 bg-white" : "w-1.5 bg-white/40",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
