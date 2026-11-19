import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BannerCarousel } from "@/components/home/BannerCarousel";
import { BANNER_BG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/BrandMark";

export function AuthShell({
  bodyClassName,
  contentClassName,
  children,
}: {
  title?: string;
  subtitle?: string;
  footer?: string;
  bodyClassName?: string;
  contentClassName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex bg-white">
      <div
        className="hidden lg:flex w-[48%] items-center justify-center p-12"
        style={{ background: BANNER_BG }}
      >
        <div className="w-full max-w-[560px] rounded-[32px] overflow-hidden shadow-[0_24px_60px_-30px_rgba(90,24,52,0.5)]">
          <BannerCarousel intervalMs={4000} />
        </div>
      </div>

      <div className={cn("flex-1 flex flex-col", bodyClassName)}>
        <div
          className="flex items-center gap-2 px-4 sm:px-8 lg:px-12"
          style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 14px)" }}
        >
          <Link
            href="/"
            aria-label="Kembali"
            className="w-11 h-11 -ml-1 rounded-full flex items-center justify-center text-[#2D2926] hover:bg-[#FBF3F6]"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2.4} />
          </Link>
          <BrandMark size={40} />
        </div>
        <div className="flex-1 flex justify-center px-5 pt-6 pb-10 sm:px-8 lg:items-center">
          <div className={contentClassName}>{children}</div>
        </div>
      </div>
    </div>
  );
}
