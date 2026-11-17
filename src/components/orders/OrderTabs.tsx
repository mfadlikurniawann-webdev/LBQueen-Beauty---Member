import { PRIMARY_GRADIENT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ORDER_TABS } from "./order-utils";

export function OrderTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="flex gap-2 mb-5 -mx-4 px-4 md:mx-0 md:px-0 pb-1 overflow-x-auto no-scrollbar"
      aria-label="Filter status pesanan"
    >
      {ORDER_TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(t.id)}
            className={cn(
              "h-10 px-4 rounded-2xl text-[13px] whitespace-nowrap transition-all shrink-0 border",
              isActive
                ? "font-bold text-white border-transparent shadow-[0_6px_16px_rgba(201,79,120,0.25)]"
                : "font-semibold bg-white text-[#766B68] border-[#EEDFE3] hover:text-[#A83960] hover:border-[#E3C3CE]",
            )}
            style={isActive ? { background: PRIMARY_GRADIENT } : undefined}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
