import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Section } from "./sections";

export function CategoryHeader({ section, page }: { section: Section; page: number }) {
  const router = useRouter();
  const SectionIcon = section.icon;
  return (
    <header
      className="sticky top-0 md:top-[76px] z-40 px-3 sm:px-5 pb-2"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 10px)" }}
    >
      <div className="glass rounded-full h-[60px] pl-1.5 pr-1.5 flex items-center gap-3">
      <button
        type="button"
        aria-label="Kembali ke beranda"
        onClick={() => router.push("/", { scroll: true })}
        className={cn(
          "chip-glass w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-[#2D2926]",
          "hover:bg-white/90 active:scale-95 transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-4",
          "focus-visible:ring-[#C94F78]/20",
        )}
      >
        <ArrowLeft className="w-6 h-6" strokeWidth={2.4} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="text-[18px] font-bold text-[#2D2926] leading-tight tracking-tight truncate">
          {section.title}
        </h1>
        {page > 1 && (
          <p className="mt-0.5 text-[12px] font-medium text-[#766B68] truncate">Halaman {page}</p>
        )}
      </div>
      <span
        className="chip-active w-12 h-12 shrink-0 rounded-full flex items-center justify-center"
        aria-hidden="true"
      >
        <SectionIcon className="w-5 h-5" />
      </span>
      </div>
    </header>
  );
}
