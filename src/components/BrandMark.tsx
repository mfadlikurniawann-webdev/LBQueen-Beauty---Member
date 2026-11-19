import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/lbqueen-mark.png"
      alt="LBQueen"
      width={size}
      height={size}
      priority
      className={cn(
        "rounded-full shrink-0 shadow-[0_4px_12px_-4px_rgba(122,34,64,0.35)]",
        className,
      )}
    />
  );
}
