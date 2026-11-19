import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  action,
  as: Tag = "h2",
  className,
}: {
  title: string;
  action?: { label: string; href: string };
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 mb-3.5", className)}>
      <Tag className="shrink-0 text-[18px] font-bold! text-[#2D2926] tracking-tight leading-tight">
        {title}
      </Tag>
      <span className="flex-1 border-t border-dashed border-[#E6D3DA]" aria-hidden="true" />
      {action && (
        <Link
          href={action.href}
          className={cn(
            "shrink-0 rounded-full bg-[#FFE3EE] px-4 py-1.5 text-[13px] font-bold text-[#A83960]",
            "hover:bg-[#FFD3E3] transition-colors",
          )}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
