"use client";

import { useRef, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { readThemeMode, setThemeMode, subscribeTheme, type ThemeMode } from "@/lib/theme-mode";
import { cn } from "@/lib/utils";

const OPTIONS: { mode: ThemeMode; label: string; icon: LucideIcon }[] = [
  { mode: "light", label: "Terang", icon: Sun },
  { mode: "dark", label: "Gelap", icon: Moon },
  { mode: "system", label: "Sistem", icon: Monitor },
];

/** Pilihan tema tiga opsi (radiogroup): panah kiri/kanan berpindah dan langsung memilih. */
export function ThemeSwitcher() {
  const mode = useSyncExternalStore(subscribeTheme, readThemeMode, () => "system" as ThemeMode);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = OPTIONS.findIndex((option) => option.mode === mode);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const next = (current + step + OPTIONS.length) % OPTIONS.length;
    setThemeMode(OPTIONS[next].mode);
    refs.current[next]?.focus();
  };

  return (
    <section data-reveal>
      <h2 id="theme-heading" className="eyebrow mb-2.5 ml-1">
        Tampilan
      </h2>
      <div
        role="radiogroup"
        aria-labelledby="theme-heading"
        onKeyDown={onKeyDown}
        className="glass rounded-[26px] p-1.5 grid grid-cols-3 gap-1.5"
      >
        {OPTIONS.map(({ mode: value, label, icon: Icon }, i) => {
          const active = value === mode;
          return (
            <button
              key={value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setThemeMode(value)}
              className={cn(
                "min-h-12 rounded-[20px] flex items-center justify-center gap-2 text-[14px] font-semibold",
                "transition-[background-color,color] focus-visible:outline-offset-2",
                active ? "chip-active" : "text-ink-3 hover:bg-fill/70",
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
