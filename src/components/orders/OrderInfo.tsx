import { useToast } from "@/components/Toast";
import { formatOrderDate, type Order } from "./order-utils";
import { MUTED, ROW, VALUE } from "./order-styles";

export function OrderInfo({ order: o, invoiceNum }: { order: Order; invoiceNum: string }) {
  const { toast } = useToast();
  return (
    <div className="space-y-2.5">
      <div className={`${ROW} items-center`}>
        <span className={MUTED}>No. pesanan</span>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-ink font-semibold tabular-nums">#{invoiceNum}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(invoiceNum);
              toast("Nomor pesanan disalin.", "success");
            }}
            className="chip-glass h-11 px-4 rounded-full hover:bg-fill/90 text-[13px] font-semibold text-brand-ink transition-colors"
          >
            Salin
          </button>
        </div>
      </div>
      <div className={ROW}>
        <span className={MUTED}>Dipesan</span>
        <span className={VALUE}>{formatOrderDate(o.ordered_at)}</span>
      </div>
      {o.completed_at && (
        <div className={ROW}>
          <span className={MUTED}>Selesai</span>
          <span className={VALUE}>{formatOrderDate(o.completed_at)}</span>
        </div>
      )}
    </div>
  );
}
