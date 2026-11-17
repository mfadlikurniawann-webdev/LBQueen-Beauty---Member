import { Ticket } from "lucide-react";
import type { CatalogVoucher } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

const NOTCH = "absolute -left-[9px] w-4 h-4 rounded-full bg-[#FDFBFB] border border-[#EEDFE3]";

function VoucherTicket({ voucher }: { voucher: CatalogVoucher }) {
  const amount =
    voucher.type === "nominal"
      ? formatRupiah(voucher.discount_amount)
      : `${voucher.discount_amount}%`;
  return (
    <div
      className={cn(
        "snap-start shrink-0 w-[272px] min-h-[112px] rounded-[24px] overflow-hidden flex items-stretch",
        "border border-[#EEDFE3] bg-white shadow-[0_6px_18px_-10px_rgba(168,57,96,0.3)] relative",
      )}
    >
      <div className="relative z-10 flex-1 min-w-0 p-4 pr-3 flex flex-col justify-center">
        <p className="text-[#A83960] text-[11px] font-bold uppercase tracking-[0.08em] mb-1 line-clamp-1">
          {voucher.name}
        </p>
        <h4 className="text-[#2D2926] text-[16px] font-bold leading-tight mb-2.5 tabular-nums">
          Potongan {amount}
        </h4>
        <div
          className={cn(
            "self-start max-w-full truncate bg-[#FDF2F5] text-[#A83960] px-2.5 py-1 rounded-lg",
            "text-[12px] font-bold border border-dashed border-[#E3B5C5]",
          )}
        >
          Kode: {voucher.code}
        </div>
      </div>
      <div
        className={cn(
          "relative w-[76px] shrink-0 flex items-center justify-center border-l-2 border-dashed",
          "border-[#EEDFE3] bg-gradient-to-br from-[#C94F78] to-[#9B3055]",
        )}
      >
        <div className={`${NOTCH} -top-2`} />
        <div className={`${NOTCH} -bottom-2`} />
        <Ticket className="w-7 h-7 text-white" aria-hidden="true" />
      </div>
    </div>
  );
}

export function MemberVouchers({ vouchers }: { vouchers: CatalogVoucher[] }) {
  return (
    <>
      <SectionHeading title="Promo Tersedia" />
      {vouchers.length > 0 ? (
        <div
          className={cn(
            "flex gap-4 overflow-x-auto no-scrollbar snap-x -mx-[var(--portal-gutter)]",
            "px-[var(--portal-gutter)] pb-3",
          )}
        >
          {vouchers.map((v) => (
            <VoucherTicket key={v.id} voucher={v} />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "w-full rounded-[24px] border-2 border-dashed border-[#EEDFE3] bg-white px-5 py-5",
            "flex items-center gap-4",
          )}
        >
          <div className="w-11 h-11 rounded-full bg-[#FDF2F5] flex items-center justify-center shrink-0">
            <Ticket className="w-5 h-5 text-[#A83960]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[14px] text-[#2D2926] font-semibold">Promo segera hadir</p>
            <p className="text-[12px] text-[#766B68] mt-0.5">
              Promo untuk pelanggan akan tampil di sini.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
