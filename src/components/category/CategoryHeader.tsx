import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Section } from "./sections";

export function CategoryHeader({ section, page }: { section: Section; page: number }) {
  const router = useRouter();
  const SectionIcon = section.icon;
  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#EEDFE3] px-5 pt-12 pb-4",
        "flex items-center gap-3.5",
      )}
    >
      <button
        type="button"
        aria-label="Kembali ke beranda"
        onClick={() => router.push("/", { scroll: true })}
        className={cn(
          "w-11 h-11 shrink-0 rounded-2xl bg-[#FDF2F5] border border-[#EEDFE3] flex items-center",
          "justify-center text-[#A83960] hover:bg-[#C94F78] hover:text-white transition-all",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20",
        )}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div
        className={cn(
          "w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-[#C94F78] to-[#9B3055] flex",
          "items-center justify-center text-white shadow-md shadow-rose-200/60",
        )}
        aria-hidden="true"
      >
        <SectionIcon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <h1 className="text-[18px] font-bold text-[#2D2926] leading-tight tracking-tight line-clamp-2">
          {section.title}
        </h1>
        <p className="mt-0.5 text-[12px] font-medium text-[#766B68] line-clamp-1">
          {section.subtitle} · Halaman {page}
        </p>
      </div>
    </header>
  );
}
