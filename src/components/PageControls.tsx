"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const arrow = cn(
  "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E3C3CF] bg-white",
  "text-[#A83960] shadow-[0_1px_4px_rgba(201,79,120,0.08)] transition-colors hover:border-[#C94F78]",
  "hover:bg-[#FFF0F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94F78]/40",
  "disabled:cursor-not-allowed disabled:border-[#EEE6E3] disabled:bg-[#F7F3F1] disabled:text-[#B9ADA9]",
  "disabled:shadow-none",
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
          "inline-flex h-10 min-w-10 items-center justify-center rounded-2xl bg-[#FDF2F5] px-3",
          "text-[14px] font-bold text-[#A83960] tabular-nums",
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
