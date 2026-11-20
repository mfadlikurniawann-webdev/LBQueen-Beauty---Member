import { useEffect } from "react";

/**
 * Satu listener di dokumen mengirim posisi pointer ke elemen `.spotlight` yang sedang
 * di bawah kursor, sehingga kartu tidak butuh handler sendiri. Hanya untuk perangkat ber-hover.
 */
export function useSpotlight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;

    const update = () => {
      frame = 0;
      const target = last?.target;
      const el = target instanceof Element ? target.closest<HTMLElement>(".spotlight") : null;
      if (!el || !last) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${last.clientX - rect.left}px`);
      el.style.setProperty("--my", `${last.clientY - rect.top}px`);
    };
    const onMove = (event: PointerEvent) => {
      last = event;
      if (!frame) frame = requestAnimationFrame(update);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
