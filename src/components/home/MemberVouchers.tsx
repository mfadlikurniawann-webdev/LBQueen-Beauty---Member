import { useState } from "react";
import { Check, Copy, Ticket } from "lucide-react";
import type { CatalogVoucher } from "@/lib/catalog";
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
        "relative flex items-stretch overflow-hidden rounded-[20px] bg-white border border-[#F0E4E8]",
        "shadow-[0_8px_22px_-14px_rgba(122,34,64,0.4)]",
        className,
      )}
    >
      <div className="w-[74px] shrink-0 flex items-center justify-center bg-gradient-to-br from-[#D9648C] to-[#9B3055]">
        <Ticket className="w-7 h-7 text-white" aria-hidden="true" />
      </div>
      <span
        className="absolute left-[66px] -top-2 w-4 h-4 rounded-full bg-[#FBF9F9] border border-[#F0E4E8]"
        aria-hidden="true"
      />
      <span
        className="absolute left-[66px] -bottom-2 w-4 h-4 rounded-full bg-[#FBF9F9] border border-[#F0E4E8]"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0 p-3.5 pl-4">
        <p className="text-[12px] font-semibold text-[#A83960] truncate">{voucher.name}</p>
        <p className="text-[16px] font-bold text-[#2D2926] leading-tight tabular-nums">
          Potongan {amount}
        </p>
        {voucher.min_transaction > 0 && (
          <p className="text-[12px] text-[#766B68] mt-0.5 tabular-nums">
            Min. belanja {formatRupiah(voucher.min_transaction)}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="min-w-0 truncate rounded-lg border border-dashed border-[#E3B5C5] bg-[#FFF3F7] px-2 py-1 text-[12px] font-bold text-[#A83960]">
            {voucher.code}
          </span>
          <button
            type="button"
            onClick={copy}
            aria-label={`Salin kode ${voucher.code}`}
            className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#FFE3EE] px-2.5 py-1 text-[12px] font-bold text-[#A83960] hover:bg-[#FFD3E3]"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {copied ? "Tersalin" : "Salin"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EmptyVouchers() {
  return (
    <div className="w-full rounded-[20px] border-2 border-dashed border-[#EEDFE3] bg-white px-5 py-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-[#FFE3EE] flex items-center justify-center shrink-0">
        <Ticket className="w-5 h-5 text-[#A83960]" aria-hidden="true" />
      </div>
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
            <VoucherTicket key={v.id} voucher={v} className="snap-start shrink-0 w-[290px]" />
          ))}
        </div>
      ) : (
        <EmptyVouchers />
      )}
    </section>
  );
}
