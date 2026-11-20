import { Scissors, ShoppingBag } from "lucide-react";
import { TREATMENT_TYPE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { circle: "w-12 h-12", icon: "w-5 h-5" },
  md: { circle: "w-14 h-14", icon: "w-6 h-6" },
  xl: { circle: "w-20 h-20", icon: "w-9 h-9" },
};

export function ProductPlaceholder({
  type,
  size = "md",
  tone = "soft",
}: {
  type: string;
  size?: keyof typeof SIZES;
  tone?: "soft" | "deep";
}) {
  const Icon = type === TREATMENT_TYPE ? Scissors : ShoppingBag;
  const { circle, icon } = SIZES[size];
  if (tone === "deep") {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-start justify-center pt-8",
          "bg-gradient-to-br from-[#C94F78] via-[#A83960] to-[#7A2240]",
        )}
        aria-hidden="true"
      >
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-6 bottom-0 w-32 h-32 rounded-full bg-[#D4AF37]/20 blur-2xl" />
        <div
          className={cn(
            `relative ${circle} rounded-full bg-white/15 border border-white/30`,
            "flex items-center justify-center",
          )}
        >
          <Icon className={`${icon} text-white`} strokeWidth={1.75} />
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-2",
        "bg-gradient-to-br from-[#F9E1E9] via-[#FCEFF3] to-[#FAF7F5]",
        "dark:from-blush-2 dark:via-blush dark:to-surface",
      )}
      aria-hidden="true"
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#C94F78]/10 blur-xl" />
      <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-[#D4AF37]/15 blur-xl" />
      <div
        className={cn(
          `relative ${circle} rounded-full bg-surface/90 border border-line shadow-sm`,
          "flex items-center justify-center",
        )}
      >
        <Icon className={`${icon} text-brand-ink`} strokeWidth={1.75} />
      </div>
      {size !== "sm" && (
        <span className="relative text-[12px] font-semibold tracking-[0.02em] text-brand-ink/85">
          LBQueen
        </span>
      )}
    </div>
  );
}
