import { ChevronLeft, MessageCircle } from "lucide-react";
import { ItemThumb } from "@/components/portal/ItemThumb";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import {
  describeOrder,
  isTreatmentOrder,
  openWhatsApp,
  orderDetailLine,
  orderQuestion,
  type Order,
  type OrderProduct,
} from "./order-utils";
import { MUTED, ROW } from "./order-styles";
import { OrderInfo } from "./OrderInfo";
import { StatusBadge } from "./StatusBadge";

export function OrderDetailModal({
  order: o,
  product,
  onClose,
}: {
  order: Order;
  product?: OrderProduct;
  onClose: () => void;
}) {
  const dialogRef = useDialogFocus<HTMLDivElement>(true, onClose);
  const { parsed, qty, unit, total, invoiceNum } = describeOrder(o);
  const detail = orderDetailLine(parsed);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-scrim",
        "p-0 sm:p-4 animate-in fade-in duration-300",
      )}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        className={cn(
          "glass-strong w-full sm:max-w-[480px] max-h-[92vh] sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px]",
          "flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300",
        )}
      >
        <div className="px-4 py-3 border-b border-brand/10 flex items-center gap-3 shrink-0">
          <button
            type="button"
            aria-label="Tutup rincian"
            onClick={onClose}
            className="chip-glass w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink-3 hover:text-brand-ink transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 id="order-detail-title" className="flex-1 min-w-0 text-[17px] font-semibold text-ink truncate">
            Rincian pesanan
          </h2>
          <StatusBadge status={o.status} />
        </div>

        <div className="scroll-thin flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          <div className="flex gap-3">
            <ItemThumb
              src={product?.image_url}
              alt=""
              treatment={isTreatmentOrder(product, parsed.name)}
              size="lg"
              sizes="80px"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-ink leading-snug line-clamp-2 break-words">
                {parsed.name}
              </h3>
              {detail && <p className="mt-0.5 text-[13px] text-ink-muted">{detail}</p>}
              <p className="mt-1 flex items-baseline justify-between gap-2 text-[13px] tabular-nums">
                <span className="text-ink-muted">x{qty}</span>
                <span className="font-semibold text-ink">{unit > 0 ? formatRupiah(unit) : "-"}</span>
              </p>
            </div>
          </div>

          <div className="glass-soft rounded-[20px] px-4 py-3 flex justify-between items-center gap-3">
            <span className="text-[14px] font-semibold text-ink">Total</span>
            <span className="text-[18px] font-semibold text-brand-ink tabular-nums">
              {total > 0 ? formatRupiah(total) : "Cek WA"}
            </span>
          </div>

          <OrderInfo order={o} invoiceNum={invoiceNum} />
          {o.reviewed_at && (
            <div className={ROW}>
              <span className={MUTED}>Ulasan</span>
              <span className="text-ink font-semibold">Sudah diulas</span>
            </div>
          )}
        </div>

        <div
          className="px-5 pt-3 border-t border-brand/10 grid grid-cols-2 gap-3 shrink-0"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
        >
          <button type="button" onClick={onClose} className="btn-glass h-12 text-[14px] text-ink-3">
            Tutup
          </button>
          <button
            type="button"
            onClick={() => openWhatsApp(orderQuestion(o, invoiceNum))}
            className="btn-primary h-12 text-[14px]"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" /> Chat admin
          </button>
        </div>
      </div>
    </div>
  );
}
