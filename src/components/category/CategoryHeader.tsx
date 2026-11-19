import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Section } from "./sections";

export function CategoryHeader({ section, page }: { section: Section; page: number }) {
  const router = useRouter();
  const SectionIcon = section.icon;
  return (
    <header
      className={cn(
        "sticky top-0 lg:top-[68px] z-40 bg-white/95 backdrop-blur-md border-b border-[#F0E4E8] px-4 sm:px-5 pb-3",
        "flex items-center gap-3 h-[76px]",
      )}
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
    >
      <button
        type="button"
        aria-label="Kembali ke beranda"
        onClick={() => router.push("/", { scroll: true })}
        className={cn(
          "w-11 h-11 shrink-0 -ml-1 rounded-full flex items-center justify-center text-[#2D2926]",
          "hover:bg-[#FBF3F6] transition-colors focus-visible:outline-none focus-visible:ring-4",
          "focus-visible:ring-[#C94F78]/20",
        )}
      >
        <ArrowLeft className="w-6 h-6" strokeWidth={2.4} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="text-[20px] font-bold text-[#2D2926] leading-tight tracking-tight truncate">
          {section.title}
        </h1>
        <p className="mt-0.5 text-[12px] font-medium text-[#766B68] truncate">
          {section.subtitle} · Halaman {page}
        </p>
      </div>
      <span
        className="w-11 h-11 shrink-0 rounded-2xl bg-[#FFE3EE] flex items-center justify-center text-[#C94F78]"
        aria-hidden="true"
      >
        <SectionIcon className="w-5 h-5" />
      </span>
    </header>
  );
}
