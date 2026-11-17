import { Rupiah } from "@/components/Rupiah";

export function PriceStack({
  price,
  discount,
  className = "min-w-0 tabular-nums",
}: {
  price: number;
  discount: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {discount > 0 && (
        <p className="text-[12px] font-medium text-[#766B68] line-through leading-none mb-1">
          <Rupiah value={price} />
        </p>
      )}
      <p className="text-[15px] font-bold text-[#A83960] leading-tight">
        <Rupiah value={Math.max(0, price - discount)} />
      </p>
    </div>
  );
}
