import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BANNER_BG, BRAND_BANNERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BannerCarousel({
  className,
  intervalMs = 6000,
  dots = true,
  peek = false,
  onIndexChange,
}: {
  className?: string;
  intervalMs?: number;
  dots?: boolean;
  /** Slide lebih kecil dengan slide berikutnya mengintip (gaya marketplace) di ponsel. */
  peek?: boolean;
  onIndexChange?: (index: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const notify = useRef(onIndexChange);

  useEffect(() => {
    notify.current = onIndexChange;
  }, [onIndexChange]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const step = () => {
      const slide = el.firstElementChild as HTMLElement | null;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      return Math.max(1, (slide?.offsetWidth || el.clientWidth) + gap);
    };
    const onScroll = () => {
      const index = Math.min(BRAND_BANNERS.length - 1, Math.round(el.scrollLeft / step()));
      setActive(index);
      notify.current?.(index);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return () => el.removeEventListener("scroll", onScroll);
    const timer = window.setInterval(() => {
      if (paused.current || document.hidden) return;
      const next = (Math.round(el.scrollLeft / step()) + 1) % BRAND_BANNERS.length;
      el.scrollTo({ left: next * step(), behavior: "smooth" });
    }, intervalMs);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  const goTo = (index: number) => {
    const el = track.current;
    const slide = el?.firstElementChild as HTMLElement | null;
    if (!el || !slide) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollTo({ left: index * (slide.offsetWidth + gap), behavior: "smooth" });
  };

  return (
    <div
      className={cn("relative", className)}
      style={peek ? undefined : { background: BANNER_BG }}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onTouchStart={() => (paused.current = true)}
      onTouchEnd={() => (paused.current = false)}
    >
      <div
        ref={track}
        className={cn(
          "flex overflow-x-auto snap-x snap-mandatory no-scrollbar",
          peek && "gap-3 md:gap-0 scroll-px-0",
        )}
        aria-roledescription="carousel"
        aria-label="Banner LBQueen"
      >
        {BRAND_BANNERS.map((banner, i) => (
          <div
            key={banner.src}
            className={cn(
              "relative shrink-0 aspect-[1440/956]",
              peek
                ? "w-[78%] sm:w-[56%] md:w-full snap-start overflow-hidden rounded-[20px] md:rounded-none border-[3px] border-white md:border-0 shadow-[0_12px_26px_-16px_rgba(90,24,52,0.55)] md:shadow-none"
                : "w-full snap-center",
            )}
            style={peek ? { background: BANNER_BG } : undefined}
            aria-roledescription="slide"
            aria-label={`${i + 1} dari ${BRAND_BANNERS.length}`}
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              priority={i === 0}
              sizes={peek ? "(min-width: 768px) 760px, 80vw" : "(min-width: 1024px) 760px, 100vw"}
              className="object-contain"
            />
          </div>
        ))}
      </div>
      {dots && (
        <div
          className={cn(
            "flex gap-1.5",
            peek
              ? "justify-center mt-1 md:absolute md:mt-0 md:bottom-2 md:right-3"
              : "absolute bottom-2 right-3",
          )}
        >
          {BRAND_BANNERS.map((banner, i) => (
            <button
              key={banner.src}
              type="button"
              aria-label={`Tampilkan banner ${i + 1}`}
              aria-current={active === i ? "true" : undefined}
              onClick={() => goTo(i)}
              className="h-6 flex items-center"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  active === i ? "w-5 bg-[#C94F78]" : "w-1.5 bg-[#C94F78]/30",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
