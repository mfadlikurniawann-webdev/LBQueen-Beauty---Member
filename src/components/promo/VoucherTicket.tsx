import { useState } from "react";
import { Check, Copy, Ticket } from "lucide-react";
import { IconChip } from "@/components/IconChip";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { membershipLabel, type MyVoucher } from "@/lib/vouchers";

export function VoucherTicket({ voucher, className }: { voucher: MyVoucher; className?: string }) {
  const [copied, setCopied] = useState(false);
  const scope = membershipLabel(voucher.membership_types);
  const amount =
    voucher.type === "nominal"
      ? formatRupiah(voucher.discount_amount)
      : `${voucher.discount_amount}%`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div
      className={cn(
        "glass-soft spotlight lift flex items-center gap-3.5 rounded-[24px] p-3.5",
        className,
      )}
    >
      <IconChip icon={Ticket} tone="gold" size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-gold-ink truncate">{voucher.name}</p>
        <p className="text-[15px] font-semibold text-ink leading-tight tabular-nums truncate">
          Potongan {amount}
        </p>
        <p className="text-[12px] font-semibold text-brand-ink mt-0.5 truncate">{voucher.code}</p>
        {(scope || voucher.products?.name) && (
          <p className="text-[12px] text-ink-muted truncate">
            {[
              scope && `Khusus ${scope}`,
              voucher.products?.name && `Untuk ${voucher.products.name}`,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
        {voucher.min_transaction > 0 && (
          <p className="text-[12px] text-ink-muted truncate tabular-nums">
            Min. belanja {formatRupiah(voucher.min_transaction)}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Salin kode ${voucher.code}`}
        className={cn(
          "shrink-0 inline-flex items-center gap-1 rounded-full px-3.5 h-11 text-[13px] font-semibold transition-all duration-300 active:scale-95",
          copied ? "chip-active" : "chip-glass text-brand-ink hover:bg-fill/90",
        )}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
        ) : (
          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
        )}
        {copied ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}

export function EmptyVouchers() {
  return (
    <div className="surface w-full rounded-[24px] p-4 flex items-center gap-3.5">
      <IconChip icon={Ticket} tone="gold" size="md" />
      <div>
        <p className="text-[14px] text-ink font-semibold">Belum ada voucher</p>
        <p className="text-[12px] text-ink-muted mt-0.5">
          Voucher untuk membership Anda akan tampil di sini.
        </p>
      </div>
    </div>
  );
}
