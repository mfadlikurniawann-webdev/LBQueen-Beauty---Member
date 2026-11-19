import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BANNER_BG, BRAND_BANNERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BannerCarousel({
  className,
  intervalMs = 6000,
  dots = true,
  onIndexChange,
}: {
  className?: string;
  intervalMs?: number;
  dots?: boolean;
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
    const onScroll = () => {
      const index = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
      setActive(index);
      notify.current?.(index);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return () => el.removeEventListener("scroll", onScroll);
    const timer = window.setInterval(() => {
      if (paused.current || document.hidden) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % BRAND_BANNERS.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, intervalMs);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  const goTo = (index: number) =>
    track.current?.scrollTo({ left: index * track.current.clientWidth, behavior: "smooth" });

  return (
    <div
      className={cn("relative", className)}
      style={{ background: BANNER_BG }}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onTouchStart={() => (paused.current = true)}
      onTouchEnd={() => (paused.current = false)}
    >
      <div
        ref={track}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        aria-roledescription="carousel"
        aria-label="Banner LBQueen"
      >
        {BRAND_BANNERS.map((banner, i) => (
          <div
            key={banner.src}
            className="relative w-full shrink-0 snap-center aspect-[1440/956]"
            aria-roledescription="slide"
            aria-label={`${i + 1} dari ${BRAND_BANNERS.length}`}
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 760px, 100vw"
              className="object-contain"
            />
          </div>
        ))}
      </div>
      {dots && (
        <div className="absolute bottom-2 right-3 flex gap-1.5">
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
