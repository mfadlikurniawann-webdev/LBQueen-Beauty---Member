"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { usePathname } from "next/navigation";

export function Reveal({ children, ...props }: ComponentProps<"div">) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import("animejs").then(({ animate, createScope, stagger }) => {
      if (disposed || !root.current) return;
      const scope = createScope({ root: root.current }).add(() => {
        const targets = root.current?.querySelectorAll("[data-reveal]");
        if (targets?.length) animate(targets, { opacity: [0.65, 1], translateY: [8, 0], duration: 320, delay: stagger(35), ease: "outCubic" });
      });
      cleanup = () => scope.revert();
    }).catch(() => {});
    return () => { disposed = true; cleanup?.(); };
  }, [pathname]);

  return <div ref={root} {...props}>{children}</div>;
}
