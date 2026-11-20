"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { usePathname } from "next/navigation";

const STAGGER_MS = 70;
const MAX_STAGGER = 6;

/**
 * Elemen bertanda `data-reveal` di dalam root naik dari blur saat masuk layar
 * (gaya Reveal portfolio, tanpa framer-motion). Elemen yang masuk bersamaan
 * dibuat bertahap; konten yang dimuat belakangan ikut terpantau lewat MutationObserver.
 */
export function Reveal({ children, ...props }: ComponentProps<"div">) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("lbq-reveal");
    // Perangkat dengan sedikit inti CPU: tanpa animasi filter blur (mahal bila banyak kartu muncul bersamaan).
    if ((navigator.hardwareConcurrency || 8) <= 4)
      document.documentElement.classList.add("lbq-reveal-lite");

    const io = new IntersectionObserver(
      (entries) => {
        let order = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          target.style.setProperty("--reveal-delay", `${Math.min(order++, MAX_STAGGER) * STAGGER_MS}ms`);
          target.classList.add("is-revealed");
          io.unobserve(target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.04 },
    );
    const scan = () =>
      el
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed):not([data-reveal-watch])")
        .forEach((target) => {
          target.setAttribute("data-reveal-watch", "");
          io.observe(target);
        });
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(el, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mutations.disconnect();
      // Elemen yang belum sempat tampil harus bisa dipantau ulang oleh effect berikutnya.
      el.querySelectorAll("[data-reveal-watch]:not(.is-revealed)").forEach((t) =>
        t.removeAttribute("data-reveal-watch"),
      );
    };
  }, [pathname]);

  return (
    <div ref={root} {...props}>
      {children}
    </div>
  );
}
