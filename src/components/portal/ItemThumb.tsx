import Image from "next/image";
import { Package, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

export function ItemThumb({
  src,
  alt,
  treatment,
  size = "md",
  sizes,
}: {
  src?: string | null;
  alt: string;
  treatment: boolean;
  size?: "md" | "lg";
  sizes: string;
}) {
  const box = size === "lg" ? "w-20 h-20" : "w-[72px] h-[72px]";
  const Icon = treatment ? Scissors : Package;
  return (
    <div className={`${box} rounded-[18px] border border-white/90 shadow-[0_6px_14px_-8px_rgba(122,34,64,0.4)] overflow-hidden shrink-0 relative`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F8DCE6]",
            "via-[#FBEFF3] to-[#FDFBFB]",
          )}
        >
          <Icon
            className={size === "lg" ? "w-7 h-7 text-[#C94F78]" : "w-6 h-6 text-[#C94F78]"}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
