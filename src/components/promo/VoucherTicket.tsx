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
        <p className="text-[12px] font-semibold text-[#8A6414] truncate">{voucher.name}</p>
        <p className="text-[15px] font-semibold text-[#2D2926] leading-tight tabular-nums truncate">
          Potongan {amount}
        </p>
        <p className="text-[12px] font-semibold text-[#A83960] mt-0.5 truncate">{voucher.code}</p>
        {(scope || voucher.products?.name) && (
          <p className="text-[12px] text-[#766B68] truncate">
            {[
              scope && `Khusus ${scope}`,
              voucher.products?.name && `Untuk ${voucher.products.name}`,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
        {voucher.min_transaction > 0 && (
          <p className="text-[12px] text-[#766B68] truncate tabular-nums">
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
          copied ? "chip-active" : "chip-glass text-[#A83960] hover:bg-white/90",
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
    <div className="glass w-full rounded-[24px] p-4 flex items-center gap-3.5">
      <IconChip icon={Ticket} tone="gold" size="md" />
      <div>
        <p className="text-[14px] text-[#2D2926] font-semibold">Belum ada voucher</p>
        <p className="text-[12px] text-[#766B68] mt-0.5">
          Voucher untuk membership Anda akan tampil di sini.
        </p>
      </div>
    </div>
  );
}
