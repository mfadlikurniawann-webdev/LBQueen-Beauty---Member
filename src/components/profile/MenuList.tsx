import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { IconChip } from "@/components/IconChip";
import type { Tone } from "@/lib/theme";
import { cn } from "@/lib/utils";

export type MenuRow = {
  label: string;
  icon: LucideIcon;
  tone?: Tone;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  badge?: string;
  value?: string;
  expanded?: boolean;
  panel?: React.ReactNode;
};

const ROW = cn(
  "w-full flex items-center gap-3.5 px-4 min-h-[60px] text-left transition-colors hover:bg-[#FBF5F7]",
  "focus-visible:outline-none focus-visible:bg-[#FBF5F7]",
);

function RowBody({ row }: { row: MenuRow }) {
  return (
    <>
      <IconChip icon={row.icon} tone={row.tone ?? "rose"} size="sm" />
      <span className="flex-1 min-w-0 flex items-center gap-2 py-4 border-b border-[#F1E8EB] group-last:border-b-0">
        <span className="text-[15px] font-semibold text-[#2D2926] truncate">{row.label}</span>
        {row.badge && (
          <span className="shrink-0 rounded-full bg-[#C94F78] px-2.5 py-0.5 text-[12px] font-bold text-white">
            {row.badge}
          </span>
        )}
        <span className="flex-1" />
        {row.value && (
          <span className="shrink-0 text-[13px] font-medium text-[#766B68]">{row.value}</span>
        )}
        <ChevronRight
          className={cn(
            "w-5 h-5 shrink-0 text-[#5F5552] transition-transform",
            row.expanded && "rotate-90",
          )}
          aria-hidden="true"
        />
      </span>
    </>
  );
}

export function MenuList({ title, rows }: { title: string; rows: MenuRow[] }) {
  return (
    <section>
      <h2 className="px-1 mb-2 text-[14px] font-semibold! text-[#766B68]">{title}</h2>
      <ul className="rounded-[20px] bg-white border border-[#F0E4E8] overflow-hidden shadow-[0_8px_24px_-18px_rgba(122,34,64,0.35)]">
        {rows.map((row) => (
          <li key={row.label} className="group">
            {row.href && row.external ? (
              <a href={row.href} target="_blank" rel="noopener noreferrer" className={ROW}>
                <RowBody row={row} />
              </a>
            ) : row.href ? (
              <Link href={row.href} className={ROW}>
                <RowBody row={row} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={row.onClick}
                aria-expanded={row.panel ? !!row.expanded : undefined}
                className={ROW}
              >
                <RowBody row={row} />
              </button>
            )}
            {row.expanded && row.panel}
          </li>
        ))}
      </ul>
    </section>
  );
}
