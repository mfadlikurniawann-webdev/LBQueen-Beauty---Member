"use client";

import { useEffect, useRef } from "react";

/** Event saat item baru masuk keranjang; elemen `[data-cart-target]` membalas dengan animasi bump. */
export const CART_BUMP_EVENT = "lbqueen:cart-bump";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Jalankan ulang animasi bump pada elemen (aman dipanggil berulang). */
export function bump(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  el.classList.remove("lbq-bump");
  void el.offsetWidth;
  el.classList.add("lbq-bump");
}

function visibleTarget() {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]"));
  return targets.find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
  });
}

/**
 * Animasi foto produk "terbang" ke ikon/bar keranjang, lalu memicu bump.
 * `source` sebaiknya punya `data-active-src` (foto yang sedang tampil).
 */
export function flyToCart(source: HTMLElement | null) {
  const done = () => window.dispatchEvent(new Event(CART_BUMP_EVENT));
  const src = source?.dataset.activeSrc;
  if (!source || !src || prefersReducedMotion() || typeof document.body.animate !== "function") {
    window.setTimeout(done, 60);
    return;
  }
  const from = source.getBoundingClientRect();
  const size = Math.min(120, from.width, from.height);
  const target = visibleTarget()?.getBoundingClientRect();
  const toX = target ? target.left + target.width / 2 : window.innerWidth / 2;
  const toY = target ? target.top + target.height / 2 : window.innerHeight - 96;
  const startX = from.left + from.width / 2;
  const startY = from.top + from.height / 2;

  const ghost = document.createElement("img");
  ghost.src = src;
  ghost.alt = "";
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${startX - size / 2}px`,
    top: `${startY - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "cover",
    borderRadius: "18px",
    zIndex: "300",
    pointerEvents: "none",
    boxShadow: "0 12px 28px -10px rgba(90,24,52,0.55)",
  });
  document.body.appendChild(ghost);
  const dx = toX - startX;
  const dy = toY - startY;
  const animation = ghost.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      {
        transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 60}px) scale(0.6)`,
        opacity: 1,
        offset: 0.55,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.18)`, opacity: 0.4 },
    ],
    { duration: 650, easing: "cubic-bezier(0.45, 0, 0.25, 1)" },
  );
  animation.onfinish = animation.oncancel = () => {
    ghost.remove();
    done();
  };
}

/** Pasang pada elemen target keranjang agar ikut "bump" ketika item ditambahkan. */
export function useCartBump<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const onBump = () => bump(ref.current);
    window.addEventListener(CART_BUMP_EVENT, onBump);
    return () => window.removeEventListener(CART_BUMP_EVENT, onBump);
  }, []);
  return ref;
}
