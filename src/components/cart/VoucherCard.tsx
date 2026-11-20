import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronRight, Loader2, Ticket, X } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { membershipLabel } from "@/lib/vouchers";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { CARD } from "./ui";
import type { CartVoucher } from "./useCartVoucher";

const valueLabel = (v: { type: string; discount_amount: number }) =>
  v.type === "percent"
    ? `${Number(v.discount_amount)}%`
    : v.type === "free_service"
      ? "Gratis layanan"
      : formatRupiah(Number(v.discount_amount));

/** Satu baris voucher; ketuk untuk membuka pemilih (ketik kode atau pilih Voucher Saya). */
export function VoucherCard({ voucher }: { voucher: CartVoucher }) {
  const [open, setOpen] = useState(false);
  const { applied } = voucher;
  return (
    <>
      <div className={`${CARD} flex items-center gap-3 pl-4 pr-2 min-h-14`}>
        <Ticket className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-1 min-w-0 min-h-12 flex items-center gap-2 text-left rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/70"
        >
          <span className="text-[15px] font-semibold text-ink">Voucher</span>
          <span
            className={cn(
              "flex-1 min-w-0 text-right text-[14px] truncate",
              applied ? "font-semibold text-success" : "text-ink-muted",
            )}
          >
            {applied ? `${applied.code}, hemat ${formatRupiah(voucher.discount)}` : "Pilih voucher"}
          </span>
          {!applied && <ChevronRight className="w-5 h-5 text-ink-muted shrink-0" aria-hidden="true" />}
        </button>
        {applied && (
          <button
            type="button"
            onClick={voucher.remove}
            aria-label="Hapus voucher"
            className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink-muted hover:text-danger hover:bg-danger-soft"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {/* Portal ke body: overlay fixed tidak boleh mewarisi margin/transform dari kolom keranjang. */}
      {open && createPortal(<VoucherSheet voucher={voucher} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function VoucherSheet({ voucher, onClose }: { voucher: CartVoucher; onClose: () => void }) {
  const dialogRef = useDialogFocus<HTMLDivElement>(true, onClose);
  const { myVouchers } = voucher;
  const choose = (v: (typeof myVouchers)[number]) => {
    if (voucher.choose(v)) onClose();
  };
  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-scrim sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="voucher-title"
        className="glass-strong relative w-full sm:max-w-[440px] max-h-[85dvh] rounded-t-[28px] sm:rounded-[28px] flex flex-col animate-in slide-in-from-bottom-6 duration-300"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)" }}
      >
        <div className="flex items-center justify-between gap-3 pl-5 pr-3 pt-3">
          <h2 id="voucher-title" className="text-[17px] font-semibold text-ink">
            Pilih voucher
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="chip-glass w-11 h-11 rounded-full flex items-center justify-center text-ink-3"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form
          className="flex gap-2 px-5 pt-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await voucher.apply();
          }}
        >
          <label htmlFor="voucher-code" className="sr-only">
            Kode voucher
          </label>
          <input
            id="voucher-code"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            maxLength={50}
            placeholder="Kode voucher"
            value={voucher.code}
            aria-invalid={!!voucher.error}
            aria-describedby={voucher.error ? "voucher-error" : undefined}
            onChange={(e) => {
              voucher.setCode(e.target.value.toUpperCase());
              voucher.setError("");
            }}
            className="input-glass flex-1 min-w-0 h-12 px-4 rounded-full text-[16px] font-semibold placeholder:font-normal uppercase placeholder:normal-case"
          />
          <button
            type="submit"
            disabled={voucher.validating || !voucher.code.trim()}
            className="btn-primary shrink-0 h-12 px-5 text-[14px]"
          >
            {voucher.validating ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : "Pakai"}
          </button>
        </form>
        {voucher.error && (
          <p id="voucher-error" role="alert" className="px-5 pt-2 text-[13px] text-danger font-semibold">
            {voucher.error}
          </p>
        )}
        {voucher.applied && !voucher.error && (
          <p className="px-5 pt-2 text-[13px] text-success font-semibold">
            {voucher.applied.code} dipakai
          </p>
        )}

        <div className="scroll-thin flex-1 min-h-0 overflow-y-auto px-5 pt-4">
          <p className="text-[13px] font-semibold text-ink-3 mb-2">Voucher Saya</p>
          {voucher.loadingMine ? (
            <div className="skeleton-glass h-16 rounded-[20px]" />
          ) : myVouchers.length === 0 ? (
            <p className="text-[14px] text-ink-muted py-2">Belum ada voucher.</p>
          ) : (
            <ul className="flex flex-col gap-2 pb-2">
              {myVouchers.map((v) => {
                const problem = voucher.problemFor(v);
                const scope = membershipLabel(v.membership_types);
                return (
                  <li key={v.id}>
                    <button
                      type="button"
                      disabled={!!problem}
                      onClick={() => choose(v)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-[20px] px-3 py-2.5 text-left",
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/70",
                        problem ? "bg-fill/50 opacity-70 cursor-not-allowed" : "chip-glass hover:bg-fill/90",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold text-ink truncate">
                          {valueLabel(v)}, {v.name}
                        </span>
                        <span className="block text-[12px] font-semibold text-brand-ink truncate">
                          {v.code}
                          {scope ? `, ${scope}` : ""}
                        </span>
                        <span className="block text-[12px] text-ink-muted truncate">
                          {problem ||
                            (Number(v.min_transaction) > 0
                              ? `Min. belanja ${formatRupiah(Number(v.min_transaction))}`
                              : "Tanpa minimal belanja")}
                        </span>
                      </span>
                      {!problem && <Check className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
