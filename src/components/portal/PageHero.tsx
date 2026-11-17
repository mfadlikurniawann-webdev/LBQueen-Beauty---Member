import { ChevronLeft } from "lucide-react";
import { HERO_GRADIENT } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PageHero({
  title,
  subtitle,
  onBack,
  tall = false,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  tall?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden px-5 sm:px-8 pt-10 rounded-b-[40px] shadow-lg shadow-rose-100/30",
        tall ? "pb-14" : "pb-12",
      )}
      style={{ background: HERO_GRADIENT }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl -ml-12 -mb-12" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -ml-32 -mt-32" />
      <div className="relative z-10 flex items-center gap-4">
        <button
          type="button"
          aria-label="Kembali"
          onClick={onBack}
          className={cn(
            "w-11 h-11 shrink-0 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center",
            "text-white border border-white/25 hover:bg-white/25 transition-colors",
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold! text-white tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-white/85 text-[13px] font-medium mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
