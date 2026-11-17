import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";
import { formatOrderDate, type Order } from "./order-utils";
import { HEADING, MUTED, ROW, VALUE } from "./order-styles";

export function OrderInfo({ order: o, invoiceNum }: { order: Order; invoiceNum: string }) {
  const { toast } = useToast();
  return (
    <div className="space-y-3 pt-4 border-t border-[#F4E8EC]">
      <h5 className={`${HEADING} mb-1`}>Info Pesanan</h5>

      <div className={`${ROW} items-center`}>
        <span className={MUTED}>No. Pesanan</span>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[#2D2926] font-bold tabular-nums">#{invoiceNum}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(invoiceNum);
              toast("Nomor pesanan disalin!", "success");
            }}
            className={cn(
              "h-8 px-3 rounded-xl bg-[#FDF2F5] hover:bg-[#FBE7EE] border border-[#F0CBD8] text-[12px]",
              "font-bold text-[#A83960] transition-colors",
            )}
          >
            Salin
          </button>
        </div>
      </div>

      <div className={ROW}>
        <span className={MUTED}>Metode Pembayaran</span>
        <span className={VALUE}>Transfer Bank / QRIS</span>
      </div>

      <div className={ROW}>
        <span className={MUTED}>Waktu Pemesanan</span>
        <span className={VALUE}>{formatOrderDate(o.ordered_at)}</span>
      </div>

      {o.completed_at && (
        <div className={ROW}>
          <span className={MUTED}>Waktu Pesanan Selesai</span>
          <span className={VALUE}>{formatOrderDate(o.completed_at)}</span>
        </div>
      )}
    </div>
  );
}
