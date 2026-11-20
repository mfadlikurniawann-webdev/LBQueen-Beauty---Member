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
      className="flex gap-2 -mx-4 px-4 sm:-mx-8 sm:px-8 overflow-x-auto no-scrollbar py-1 mb-4"
      role="group"
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
              "shrink-0 h-11 px-4 rounded-full text-[14px] whitespace-nowrap transition-all duration-300",
              isActive
                ? "chip-active font-bold"
                : "chip-glass font-semibold text-[#5F5552] hover:bg-white/85",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
