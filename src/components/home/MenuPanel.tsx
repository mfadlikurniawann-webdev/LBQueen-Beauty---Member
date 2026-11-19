import type { Customer } from "@/lib/customer";
import { tierOf } from "@/lib/membership";
import { PointsCard } from "./PointsCard";
import { ServiceGrid } from "./ServiceGrid";

export function MenuPanel({
  customer,
  voucherCount,
  cartCount,
}: {
  customer: Customer;
  voucherCount: number;
  cartCount: number;
}) {
  return (
    <div className="rounded-[24px] bg-white border border-[#F0E4E8] shadow-[0_16px_40px_-24px_rgba(90,24,52,0.5)]">
      <div className="px-4 py-3.5">
        <PointsCard
          bare
          points={customer.points}
          tierName={tierOf(customer).name}
          voucherCount={voucherCount}
          cartCount={cartCount}
        />
      </div>
      <div className="border-t border-dashed border-[#F0DDE5] px-3 pt-4 pb-3.5">
        <ServiceGrid voucherCount={voucherCount} cartCount={cartCount} />
      </div>
    </div>
  );
}
