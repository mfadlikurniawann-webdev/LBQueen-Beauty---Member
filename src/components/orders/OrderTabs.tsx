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
      className="flex gap-5 -mx-4 px-4 sm:-mx-8 sm:px-8 overflow-x-auto no-scrollbar border-b border-[#F0E4E8] mb-4"
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
              "relative shrink-0 h-11 text-[15px] whitespace-nowrap transition-colors",
              isActive
                ? "font-bold text-[#2D2926]"
                : "font-medium text-[#8C8280] hover:text-[#5F5552]",
            )}
          >
            {t.label}
            <span
              className={cn(
                "absolute left-0 right-0 -bottom-px h-[3px] rounded-full transition-colors",
                isActive ? "bg-[#C94F78]" : "bg-transparent",
              )}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
