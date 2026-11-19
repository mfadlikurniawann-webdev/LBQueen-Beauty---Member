import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarHeart, Gem, ShieldCheck, Ticket } from "lucide-react";
import { BannerCarousel } from "@/components/home/BannerCarousel";
import { BANNER_BG } from "@/lib/constants";
import { cn } from "@/lib/utils";

const BENEFITS = [
  { icon: CalendarHeart, text: "Booking treatment online" },
  { icon: Gem, text: "Program loyalty & poin" },
  { icon: Ticket, text: "Promo & voucher pilihan" },
  { icon: ShieldCheck, text: "Riwayat perawatan tersimpan" },
];

function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="w-10 h-10 rounded-2xl bg-white overflow-hidden flex items-center justify-center shadow-sm">
        <Image src="/lbqueen_logo.png" alt="" width={40} height={40} className="object-contain" />
      </span>
      <span className="leading-none">
        <span className="block text-[17px] font-bold text-[#A83960]">LBQueen</span>
        <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#766B68] mt-1">
          Care & Beauty Clinic
        </span>
      </span>
    </span>
  );
}

function BrandPanel({
  title,
  subtitle,
  footer,
}: {
  title: string;
  subtitle: string;
  footer: string;
}) {
  return (
    <div
      className="hidden lg:flex flex-col w-[46%] relative overflow-hidden px-10 py-10"
      style={{ background: BANNER_BG }}
    >
      <Brand />
      <div className="flex-1 flex flex-col justify-center -mx-10">
        <BannerCarousel />
      </div>
      <div>
        <h1 className="text-[24px] font-bold! text-[#2D2926] tracking-tight">{title}</h1>
        <p className="text-[14px] text-[#5F5552] mt-1">{subtitle}</p>
        <ul className="grid grid-cols-2 gap-2.5 mt-5">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-2.5 rounded-2xl bg-white/80 px-3 py-2.5"
            >
              <Icon className="w-5 h-5 shrink-0 text-[#C94F78]" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-[#2D2926]">{text}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8C8280] mt-6">
          {footer}
        </p>
      </div>
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  footer,
  bodyClassName,
  contentClassName,
  children,
}: {
  title: string;
  subtitle: string;
  footer: string;
  bodyClassName?: string;
  contentClassName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex bg-white">
      <BrandPanel title={title} subtitle={subtitle} footer={footer} />

      <div className={cn("flex-1 flex flex-col lg:items-center lg:justify-center", bodyClassName)}>
        <div
          className="lg:hidden flex items-center gap-2 px-4 pb-6 rounded-b-[28px]"
          style={{
            paddingTop: "max(env(safe-area-inset-top, 0px), 16px)",
            background: `linear-gradient(180deg, #FFD3E3 0%, ${BANNER_BG} 100%)`,
          }}
        >
          <Link
            href="/"
            aria-label="Kembali ke beranda"
            className="w-11 h-11 -ml-1 rounded-full flex items-center justify-center text-[#2D2926] hover:bg-white/60"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2.4} />
          </Link>
          <Brand />
        </div>
        <div className="flex-1 flex justify-center px-5 pt-7 pb-10 sm:px-8 lg:flex-none lg:p-16 w-full">
          <div className={contentClassName}>{children}</div>
        </div>
      </div>
    </div>
  );
}
