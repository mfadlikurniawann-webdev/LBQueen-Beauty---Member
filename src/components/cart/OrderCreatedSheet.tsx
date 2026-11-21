import { CheckCircle2, MessageCircle } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { BankPanel, QrisPanel, type PaymentMethod } from "./PaymentMethodCard";

export type CreatedOrder = { total: number; method: PaymentMethod; waHref: string };

/**
 * Tampil setelah pesanan tersimpan: cara bayar dan tombol konfirmasi WhatsApp.
 * WhatsApp dibuka dari tautan yang diketuk pengguna; window.open setelah menunggu server diblokir Safari iOS.
 */
export function OrderCreatedSheet({ order, onClose }: { order: CreatedOrder; onClose: () => void }) {
  const dialogRef = useDialogFocus<HTMLDivElement>(true, onClose);
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
        aria-labelledby="order-created-title"
        className={cn(
          "glass-strong w-full sm:max-w-[440px] max-h-[92vh] sm:max-h-[88vh] rounded-t-[32px] sm:rounded-[32px]",
          "flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300",
        )}
      >
        <div className="scroll-thin flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 shrink-0 rounded-full bg-success-soft text-success flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="order-created-title" className="text-[17px] font-semibold text-ink">
                Pesanan dibuat
              </h2>
              <p className="text-[13px] text-ink-muted">Bayar, lalu kirim buktinya ke admin.</p>
            </div>
          </div>

          <div className="glass-soft rounded-[20px] px-4 py-3 flex justify-between items-center gap-3">
            <span className="text-[14px] font-semibold text-ink">Total bayar</span>
            <span className="text-[20px] font-semibold text-brand-ink tabular-nums">{formatRupiah(order.total)}</span>
          </div>

          {order.method === "qris" ? <QrisPanel /> : <BankPanel />}
        </div>

        <div
          className="px-5 pt-3 border-t border-brand/10 flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
        >
          <button type="button" onClick={onClose} className="btn-glass h-12 px-4 text-[14px] text-ink-3 order-last sm:order-first">
            Lihat pesanan
          </button>
          <a href={order.waHref} target="_blank" rel="noopener noreferrer" className="btn-primary h-12 text-[14px] sm:flex-1">
            <MessageCircle className="w-4 h-4" aria-hidden="true" /> Kirim bukti di WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
