import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHero({
  title,
  subtitle,
  onBack,
  tall = false,
  transparent = false,
  actions,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  tall?: boolean;
  transparent?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={cn("relative px-4 sm:px-8", tall ? "pb-16 rounded-b-[32px]" : "pb-4")}
      style={{
        paddingTop: "max(env(safe-area-inset-top, 0px), 20px)",
        background: transparent
          ? "transparent"
          : tall
            ? "linear-gradient(160deg,#FFC9DC 0%,#FFE3EE 55%,#FCEFC9 100%)"
            : "linear-gradient(180deg,#FFE3EE 0%,rgba(255,236,244,0) 100%)",
      }}
    >
      <div className="flex items-center gap-3 min-h-12">
        {onBack && (
          <button
            type="button"
            aria-label="Kembali"
            onClick={onBack}
            className={cn(
              "w-11 h-11 shrink-0 -ml-1 rounded-full flex items-center justify-center text-[#2D2926]",
              "hover:bg-white/70 active:scale-95 transition-all",
            )}
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2.4} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-[24px] font-bold! text-[#2D2926] tracking-tight leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] font-medium text-[#766B68] mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
