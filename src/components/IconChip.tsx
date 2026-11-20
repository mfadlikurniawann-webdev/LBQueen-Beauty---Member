import type { LucideIcon } from "lucide-react";
import { TONES, chipStyle, type Tone } from "@/lib/theme";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { tile: "w-10 h-10 rounded-[14px]", chip: "w-7 h-7 rounded-[10px]", icon: "w-4 h-4" },
  md: {
    tile: "w-12 h-12 rounded-[16px]",
    chip: "w-8 h-8 rounded-[11px]",
    icon: "w-[18px] h-[18px]",
  },
  lg: {
    tile: "w-[60px] h-[60px] rounded-[20px]",
    chip: "w-10 h-10 rounded-[14px]",
    icon: "w-[22px] h-[22px]",
  },
};

export function IconChip({
  icon: Icon,
  tone = "rose",
  size = "md",
  bare = false,
  className,
  children,
}: {
  icon: LucideIcon;
  tone?: Tone;
  size?: keyof typeof SIZES;
  bare?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const s = SIZES[size];
  const chip = (
    <span
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        bare ? s.tile : s.chip,
      )}
      style={chipStyle(tone)}
    >
      <span
        className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-white/30"
        aria-hidden="true"
      />
      <Icon className={cn("relative text-white", s.icon)} strokeWidth={2.3} aria-hidden="true" />
    </span>
  );
  if (bare)
    return (
      <span className={cn("relative shrink-0", className)}>
        {chip}
        {children}
      </span>
    );
  return (
    <span
      className={cn(
        "icon-tile relative shrink-0 flex items-center justify-center",
        s.tile,
        className,
      )}
      // Ubin kaca bertint (.icon-tile di globals.css): tint per nada, lebih redup di mode gelap.
      style={{ "--tint": TONES[tone].tint } as React.CSSProperties}
    >
      {chip}
      {children}
    </span>
  );
}
