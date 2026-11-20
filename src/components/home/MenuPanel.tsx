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
    <div className="glass-lit spotlight rounded-[28px]">
      <div className="px-4 py-2.5">
        <PointsCard
          bare
          points={customer.points}
          tierName={tierOf(customer).name}
        />
      </div>
      <div className="border-t border-edge/80 shadow-[0_-1px_0_rgba(122,34,64,0.06)] px-3 pt-4 pb-3.5">
        <ServiceGrid voucherCount={voucherCount} cartCount={cartCount} />
      </div>
    </div>
  );
}
