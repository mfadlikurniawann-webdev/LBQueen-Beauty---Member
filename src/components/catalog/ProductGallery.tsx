import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductPlaceholder } from "./ProductPlaceholder";

const ARROW = cn(
  "glass absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full",
  "hidden md:flex items-center justify-center text-[#2D2926] transition-opacity",
  "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:!opacity-0",
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/25",
);

/**
 * Carousel foto produk seperti marketplace: geser (swipe) di ponsel, panah di layar lebar,
 * penghitung "1/5", dan deretan thumbnail. `focusUrl` menggeser ke foto tertentu (mis. foto variasi).
 */
export function ProductGallery({
  images,
  alt,
  type,
  focusUrl,
  badge,
}: {
  images: string[];
  alt: string;
  type: string;
  focusUrl?: string | null;
  badge?: React.ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const go = useCallback(
    (next: number, smooth = true) => {
      const el = track.current;
      if (!el || count === 0) return;
      const target = Math.max(0, Math.min(count - 1, next));
      el.scrollTo({ left: target * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
      setIndex(target);
    },
    [count],
  );

  // Jaga foto aktif tetap di tempat saat ukuran layar berubah (rotasi iPad, resize jendela).
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  useEffect(() => {
    const el = track.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let width = el.clientWidth;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      el.scrollTo({ left: indexRef.current * width, behavior: "auto" });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [count]);

  useEffect(() => {
    if (!focusUrl) return;
    const target = images.indexOf(focusUrl);
    if (target >= 0) go(target);
  }, [focusUrl, images, go]);

  const onScroll = () => {
    const el = track.current;
    if (!el || !el.clientWidth) return;
    const current = Math.round(el.scrollLeft / el.clientWidth);
    if (current !== index) setIndex(current);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  };

  return (
    <div className="space-y-2.5">
      <div
        className="group relative aspect-square w-full overflow-hidden bg-[#FBEFF3] md:rounded-[24px] md:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)]"
        data-fly-source
        data-active-src={images[index] || undefined}
        role="region"
        aria-roledescription="carousel"
        aria-label={`Foto ${alt}`}
      >
        {count === 0 ? (
          <ProductPlaceholder type={type} />
        ) : (
          <div
            ref={track}
            onScroll={onScroll}
            onKeyDown={onKey}
            tabIndex={count > 1 ? 0 : -1}
            className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar overscroll-x-contain focus-visible:outline-none"
          >
            {images.map((src, i) => (
              <div
                key={`${src.slice(0, 80)}-${i}`}
                className="relative h-full w-full shrink-0 snap-center"
                role="group"
                aria-roledescription="slide"
                aria-label={`Foto ${i + 1} dari ${count}`}
              >
                <Image
                  src={src}
                  alt={i === 0 ? alt : `${alt}, foto ${i + 1}`}
                  fill
                  sizes="(min-width: 768px) 460px, 100vw"
                  priority={i === 0}
                  className="object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto sebelumnya"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className={cn(ARROW, "left-3")}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Foto berikutnya"
              onClick={() => go(index + 1)}
              disabled={index === count - 1}
              className={cn(ARROW, "right-3")}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span
              className="absolute right-3 bottom-3 rounded-full bg-[#2A1520]/80 border border-white/25 px-2.5 py-1 text-[12px] font-semibold text-white tabular-nums"
              aria-live="polite"
            >
              {index + 1}/{count}
            </span>
          </>
        )}
        {badge}
      </div>

      {count > 1 && (
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar px-3 md:px-0"
          aria-label="Pilih foto"
          role="tablist"
        >
          {images.map((src, i) => (
            <button
              type="button"
              key={`thumb-${src.slice(0, 80)}-${i}`}
              role="tab"
              aria-selected={i === index}
              aria-label={`Lihat foto ${i + 1}`}
              onClick={() => go(i)}
              onMouseEnter={() => go(i, false)}
              className={cn(
                "relative w-14 h-14 md:w-16 md:h-16 shrink-0 overflow-hidden rounded-[14px] border-2 transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/25",
                i === index
                  ? "border-[#C94F78] shadow-[0_6px_14px_-6px_rgba(168,57,96,0.6)]"
                  : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
