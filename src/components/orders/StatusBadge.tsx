import { cn } from "@/lib/utils";
import { getOrderStatus } from "./order-utils";

export function StatusBadge({ status }: { status: string }) {
  const { cls, icon: Icon, label } = getOrderStatus(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full border text-[12px]",
        "font-semibold whitespace-nowrap",
        cls,
      )}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {label}
    </span>
  );
}
