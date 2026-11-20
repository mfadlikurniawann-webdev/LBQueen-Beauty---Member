import Link from "next/link";
import useSWR from "swr";
import { ChevronRight, Clock3, Package, Wallet } from "lucide-react";
import { IconChip } from "@/components/IconChip";
import { describeOrder, getOrderStatus, type Order } from "@/components/orders/order-utils";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const ACTIVE = ["pending", "dp", "processing"];
const STEPS = ["Dipesan", "Diproses", "Selesai"];
const ICONS = { pending: Clock3, dp: Wallet, processing: Package } as const;

export function ActiveOrderCard({ customerId }: { customerId: number }) {
  const { data: order } = useSWR(
    ["active-order", customerId],
    async () => {
      const { data, error } = await supabase
        .from("customer_orders")
        .select("id,product_name,status,ordered_at,qty,total_price,customer_id")
        .eq("customer_id", customerId)
        .in("status", ACTIVE)
        .order("ordered_at", { ascending: false })
        .limit(1);
      if (error) return null;
      return (data?.[0] as Order | undefined) ?? null;
    },
    { revalidateOnFocus: true, refreshInterval: 60000 },
  );

  if (!order || !ACTIVE.includes(order.status)) return null;
  const step = order.status === "pending" ? 0 : 1;
  const { parsed, invoiceNum } = describeOrder(order);
  const status = getOrderStatus(order.status);
  const Icon = ICONS[order.status as keyof typeof ICONS] ?? Clock3;

  return (
    <Link
      href="/orders"
      data-reveal
      className="glass spotlight lift block rounded-[24px] p-4"
    >
      <div className="flex items-center gap-3">
        <IconChip icon={Icon} tone="rose" size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-[#A83960]">Pesanan aktif · #{invoiceNum}</p>
          <p className="text-[15px] font-bold text-[#2D2926] truncate">{parsed.mainName}</p>
        </div>
        <ChevronRight className="w-5 h-5 shrink-0 text-[#8C8280]" aria-hidden="true" />
      </div>
      <div className="mt-3.5 grid grid-cols-3 gap-1.5" aria-label={`Status: ${status.label}`}>
        {STEPS.map((label, i) => (
          <div key={label}>
            <span
              className={cn(
                "block h-1.5 rounded-full",
                i <= step
                  ? "bg-gradient-to-r from-[#D4608A] to-[#B8416B] shadow-[0_2px_8px_-2px_rgba(168,57,96,0.6)]"
                  : "bg-white/70 shadow-[inset_0_1px_2px_rgba(122,34,64,0.12)]",
              )}
            />
            <span
              className={cn(
                "block mt-1.5 text-[12px] font-semibold",
                i === step ? "text-[#A83960]" : "text-[#8C8280]",
              )}
            >
              {i === step ? status.label : label}
            </span>
          </div>
        ))}
      </div>
    </Link>
  );
}
