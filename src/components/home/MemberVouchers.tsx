import { useState } from "react";
import { Check, Copy, Ticket } from "lucide-react";
import type { CatalogVoucher } from "@/lib/catalog";
import { IconChip } from "@/components/IconChip";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

export function VoucherTicket({
  voucher,
  className,
}: {
  voucher: CatalogVoucher;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
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
        "flex items-center gap-3.5 rounded-[20px] bg-white border border-[#F0E4E8] p-3.5",
        "shadow-[0_8px_24px_-18px_rgba(122,34,64,0.4)]",
        className,
      )}
    >
      <IconChip icon={Ticket} tone="gold" size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-[#8A6414] truncate">{voucher.name}</p>
        <p className="text-[15px] font-bold text-[#2D2926] leading-tight tabular-nums truncate">
          Potongan {amount}
        </p>
        <p className="text-[12px] font-bold text-[#A83960] mt-0.5 truncate">{voucher.code}</p>
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
        className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[#E9C2D2] px-3 h-9 text-[12px] font-bold text-[#A83960] hover:bg-[#FFF3F7]"
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
    <div className="w-full rounded-[20px] border border-[#F0E4E8] bg-white p-4 flex items-center gap-3.5">
      <IconChip icon={Ticket} tone="gold" size="md" />
      <div>
        <p className="text-[14px] text-[#2D2926] font-semibold">Promo segera hadir</p>
        <p className="text-[12px] text-[#766B68] mt-0.5">
          Promo untuk pelanggan akan tampil di sini.
        </p>
      </div>
    </div>
  );
}

export function MemberVouchers({ vouchers }: { vouchers: CatalogVoucher[] }) {
  return (
    <section>
      <SectionHeading
        title="Promo Tersedia"
        action={vouchers.length > 0 ? { label: "Lihat semua", href: "/promo" } : undefined}
      />
      {vouchers.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 pb-2 pt-2">
          {vouchers.map((v) => (
            <VoucherTicket key={v.id} voucher={v} className="snap-start shrink-0 w-[300px]" />
          ))}
        </div>
      ) : (
        <EmptyVouchers />
      )}
    </section>
  );
}
