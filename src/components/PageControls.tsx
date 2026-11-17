"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const navButton = "min-w-0 gap-1.5 rounded-2xl border border-[#EEDFE3] bg-white px-3 text-[13px] font-bold text-[#A83960] shadow-sm hover:border-[#C94F78]/40 hover:bg-[#FDF2F5] disabled:opacity-100 disabled:border-transparent disabled:bg-[#F3ECEE] disabled:text-[#8C8280] disabled:shadow-none sm:px-5";

export function PageControls({ page, hasMore, loading, onChange }: {
  page: number; hasMore: boolean; loading: boolean; onChange: (page: number) => void;
}) {
  return <nav aria-label="Navigasi halaman data" className="flex flex-wrap items-center justify-center gap-2 px-2 py-5 sm:gap-3">
    <Button variant="outline" className={navButton} disabled={loading || page <= 1} onClick={() => onChange(page - 1)}>
      <ChevronLeft aria-hidden="true" />
      Sebelumnya
    </Button>
    <span aria-live="polite" className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-[#FDF2F5] px-3 text-[13px] font-semibold text-[#2D2926] tabular-nums">
      {loading && <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin text-[#C94F78]" />}
      Halaman <span className="font-bold text-[#A83960]">{page}</span>
    </span>
    <Button variant="outline" className={navButton} disabled={loading || !hasMore} onClick={() => onChange(page + 1)}>
      Berikutnya
      <ChevronRight aria-hidden="true" />
    </Button>
  </nav>;
}
