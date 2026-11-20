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
        <p className="text-[12px] font-medium text-ink-muted line-through leading-none mb-1">
          <Rupiah value={price} />
        </p>
      )}
      <p className="text-[15px] font-semibold text-brand-ink leading-tight">
        {from && <span className="text-[12px] font-semibold text-ink-muted">Mulai </span>}
        <Rupiah value={Math.max(0, price - discount)} />
      </p>
    </div>
  );
}
