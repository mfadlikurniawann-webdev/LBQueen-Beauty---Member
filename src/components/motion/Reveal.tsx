"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { usePathname } from "next/navigation";

const STAGGER_MS = 70;
const MAX_STAGGER = 6;

/**
 * Elemen bertanda `data-reveal` naik dari blur saat masuk layar (hanya di layar lebar dengan
 * mouse). Di HP/tablet sentuh animasi dimatikan: konten langsung tampil tanpa harus digulir.
 * Konten yang sudah ada di layar saat dimuat langsung ditampilkan; gulir cepat juga dicek
 * per frame agar tidak ada kartu yang tertinggal kosong.
 */
export function Reveal({ children, ...props }: ComponentProps<"div">) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = root.current;
    const html = document.documentElement;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Layar sentuh atau sempit: tidak ada keadaan tersembunyi sama sekali.
    if (!window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)").matches) {
      html.classList.remove("lbq-reveal");
      return;
    }
    html.classList.add("lbq-reveal");
    if ((navigator.hardwareConcurrency || 8) <= 4) html.classList.add("lbq-reveal-lite");

    let order = 0;
    const show = (target: HTMLElement) => {
      if (target.classList.contains("is-revealed")) return;
      target.style.setProperty("--reveal-delay", `${Math.min(order++, MAX_STAGGER) * STAGGER_MS}ms`);
      target.classList.add("is-revealed");
      io.unobserve(target);
    };
    const inView = (target: HTMLElement) => {
      const rect = target.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };
    const io = new IntersectionObserver(
      (entries) => {
        order = 0;
        for (const entry of entries) if (entry.isIntersecting) show(entry.target as HTMLElement);
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.01 },
    );
    const pending = () =>
      el.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)");
    const scan = () => {
      order = 0;
      pending().forEach((target) => {
        if (inView(target)) show(target);
        else if (!target.hasAttribute("data-reveal-watch")) {
          target.setAttribute("data-reveal-watch", "");
          io.observe(target);
        }
      });
    };
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(el, { childList: true, subtree: true });

    // Gulir cepat bisa melewati elemen di antara dua laporan observer: cek sekali per frame.
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        pending().forEach((target) => {
          if (target.getBoundingClientRect().top < window.innerHeight) show(target);
        });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      mutations.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
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
