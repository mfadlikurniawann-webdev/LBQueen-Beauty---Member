"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const arrow = cn(
  "chip-glass inline-flex h-11 w-11 items-center justify-center rounded-full",
  "text-[#A83960] transition-[background-color,transform] hover:bg-white/90 active:scale-95",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94F78]/40",
  "disabled:cursor-not-allowed disabled:text-[#B9ADA9] disabled:opacity-70",
);

export function PageControls({
  page,
  hasMore,
  loading,
  onChange,
}: {
  page: number;
  hasMore: boolean;
  loading: boolean;
  onChange: (page: number) => void;
}) {
  if (page <= 1 && !hasMore) return null;
  return (
    <nav
      aria-label="Navigasi halaman data"
      className="flex items-center justify-center gap-2 pt-1 pb-4"
    >
      <button
        type="button"
        aria-label="Sebelumnya"
        className={arrow}
        disabled={loading || page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        aria-label={`Halaman ${page}`}
        className={cn(
          "chip-active inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3",
          "text-[14px] font-bold tabular-nums",
        )}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : page}
      </span>
      <button
        type="button"
        aria-label="Berikutnya"
        className={arrow}
        disabled={loading || !hasMore}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </nav>
  );
}
