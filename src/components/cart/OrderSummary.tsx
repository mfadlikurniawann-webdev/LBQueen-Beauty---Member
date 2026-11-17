import { Rupiah } from "@/components/Rupiah";
import { CARD, SectionTitle } from "./ui";

export function OrderSummary({
  subtotal,
  discount,
  total,
}: {
  subtotal: number;
  discount: number;
  total: number;
}) {
  return (
    <div className={`${CARD} p-5`}>
      <SectionTitle>Ringkasan Pesanan</SectionTitle>
      <div className="space-y-3 text-[13px] mt-4">
        <div className="flex justify-between gap-3">
          <span className="text-[#766B68]">Subtotal</span>
          <span className="text-[#2D2926] font-semibold tabular-nums">
            <Rupiah value={subtotal} />
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#766B68]">Diskon</span>
          <span
            className={`tabular-nums ${discount > 0 ? "text-emerald-700 font-semibold" : "text-[#766B68] font-medium"}`}
          >
            <Rupiah value={discount} prefix="- " />
          </span>
        </div>
      </div>
      <div className="h-px my-4 bg-[#F4E8EC]" />
      <div className="flex justify-between items-center gap-3">
        <span className="text-[14px] font-bold text-[#2D2926]">Total</span>
        <span className="text-[22px] font-bold tracking-tight tabular-nums text-[#A83960]">
          <Rupiah value={total} />
        </span>
      </div>
    </div>
  );
}
