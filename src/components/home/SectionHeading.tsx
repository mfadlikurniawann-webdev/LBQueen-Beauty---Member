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
      <Tag className="shrink-0 text-[18px] font-bold! text-ink tracking-tight leading-tight">
        {title}
      </Tag>
      <span className="flex-1" aria-hidden="true" />
      {action && (
        <Link
          href={action.href}
          className={cn(
            "chip-glass shrink-0 inline-flex items-center h-11 rounded-full px-3.5 text-[13px] font-semibold text-brand-ink hover:bg-fill/85 transition-colors",
          )}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
