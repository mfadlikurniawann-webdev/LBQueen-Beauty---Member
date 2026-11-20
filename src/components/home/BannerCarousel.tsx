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
          "flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-[22px]",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/30",
          peek && "gap-3 md:gap-0 scroll-px-0",
        )}
        aria-roledescription="carousel"
        aria-label="Banner LBQueen"
        role="region"
        tabIndex={0}
      >
        {BRAND_BANNERS.map((banner, i) => (
          <div
            key={banner.src}
            className={cn(
              "relative shrink-0 aspect-[1440/956]",
              peek
                ? "w-[80%] sm:w-[56%] md:w-full snap-start overflow-hidden rounded-[22px] md:rounded-none border border-white/90 md:border-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_30px_-18px_rgba(122,34,64,0.45)] md:shadow-none"
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
            "flex",
            peek
              ? "justify-center md:absolute md:bottom-0 md:right-1"
              : "absolute bottom-0 right-1",
          )}
        >
          {BRAND_BANNERS.map((banner, i) => (
            <button
              key={banner.src}
              type="button"
              aria-label={`Tampilkan banner ${i + 1}`}
              aria-current={active === i ? "true" : undefined}
              onClick={() => goTo(i)}
              className="h-11 min-w-11 px-1 flex items-center justify-center"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  active === i ? "w-6 bg-[#C94F78]" : "w-1.5 bg-[#C94F78]/30",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
