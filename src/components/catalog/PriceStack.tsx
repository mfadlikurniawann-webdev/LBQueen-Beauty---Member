import { Rupiah } from "@/components/Rupiah";

export function PriceStack({
  price,
  discount,
  from = false,
  className = "min-w-0 tabular-nums",
}: {
  price: number;
  discount: number;
  from?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {discount > 0 && (
        <p className="text-[12px] font-medium text-[#766B68] line-through leading-none mb-1">
          <Rupiah value={price} />
        </p>
      )}
      <p className="text-[15px] font-semibold text-[#A83960] leading-tight">
        {from && <span className="text-[12px] font-semibold text-[#766B68]">Mulai </span>}
        <Rupiah value={Math.max(0, price - discount)} />
      </p>
    </div>
  );
}
