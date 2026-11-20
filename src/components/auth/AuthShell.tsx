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
    <div className="min-h-dvh flex">
      <div className="hidden lg:flex w-[48%] items-center justify-center p-10 xl:p-12">
        <div data-reveal className="glass-lit w-full max-w-[580px] rounded-[36px] p-2">
          <div className="rounded-[28px] overflow-hidden" style={{ background: BANNER_BG }}>
            <BannerCarousel intervalMs={4000} />
          </div>
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
            className="chip-glass w-11 h-11 rounded-full flex items-center justify-center text-ink hover:bg-fill/90 active:scale-95 transition-[background-color,transform]"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
          </Link>
          <BrandMark size={40} />
        </div>
        <div className="flex-1 flex justify-center px-4 pt-5 pb-10 sm:px-8 lg:items-center">
          <div
            data-reveal
            className={cn("surface h-fit rounded-[32px] px-5 py-7 sm:px-8 sm:py-9", contentClassName)}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
