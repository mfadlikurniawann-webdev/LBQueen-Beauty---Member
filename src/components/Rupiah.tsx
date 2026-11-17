import { formatNumber } from "@/lib/format";

export function Rupiah({ value, prefix = "" }: { value: number; prefix?: string }) {
  return (
    <>
      {`${prefix}Rp `}
      {formatNumber(value)}
    </>
  );
}
