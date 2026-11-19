import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logo resmi LBQueen (monogram, mahkota, dan teks "QUEEN.ID Care & Beauty Clinic"). */
export function BrandMark({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <Image
      src={size > 96 ? "/lbqueen-logo-512.png" : "/lbqueen-logo-192.png"}
      alt="LBQueen Care & Beauty Clinic"
      width={size}
      height={size}
      priority
      className={cn(
        "rounded-[28%] shrink-0 bg-white object-cover shadow-[0_4px_12px_-4px_rgba(122,34,64,0.35)]",
        className,
      )}
    />
  );
}
