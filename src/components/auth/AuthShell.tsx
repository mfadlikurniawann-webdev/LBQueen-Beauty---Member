import Image from "next/image";
import { Heart, ShieldCheck, Star, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

const BENEFITS = [
  { icon: Star, text: "Akses Katalog Treatment Eksklusif" },
  { icon: Heart, text: "Program Loyalty & Reward Poin" },
  { icon: Ticket, text: "Promo & Diskon Khusus Member" },
  { icon: ShieldCheck, text: "Riwayat Perawatan Tersimpan" },
];

const LeftBg = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="cl1" cx="75%" cy="10%" r="55%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.13)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <radialGradient id="cl2" cx="15%" cy="90%" r="50%">
        <stop offset="0%" stopColor="rgba(212,175,55,0.16)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#cl1)" />
    <rect width="100%" height="100%" fill="url(#cl2)" />
    <circle cx="85%" cy="12%" r="85" fill="rgba(255,255,255,0.06)" />
    <circle cx="85%" cy="12%" r="50" fill="rgba(255,255,255,0.07)" />
    <circle cx="15%" cy="88%" r="100" fill="rgba(212,175,55,0.07)" />
    <circle cx="15%" cy="88%" r="60" fill="rgba(212,175,55,0.08)" />
    <ellipse
      cx="50%"
      cy="50%"
      rx="230"
      ry="75"
      fill="rgba(255,255,255,0.025)"
      transform="rotate(-15 50% 50%)"
    />
  </svg>
);

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
      className="hidden lg:flex flex-col items-center justify-center w-[42%] relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #D4608A 0%, #C94F78 35%, #9B3055 70%, #7A2240 100%)",
      }}
    >
      <LeftBg />

      <div className="relative z-10 flex flex-col items-center text-center px-10 max-w-[400px]">
        <div
          className={cn(
            "w-[88px] h-[88px] rounded-[24px] bg-white flex items-center justify-center overflow-hidden",
            "mb-6 shadow-xl",
          )}
          style={{ boxShadow: "0 12px 40px rgba(45,41,38,0.20)" }}
        >
          <Image
            src="/lbqueen_logo.png"
            alt="LBQueen"
            width={72}
            height={72}
            className="object-contain"
            style={{ width: "auto", height: "auto" }}
          />
        </div>

        <h1 className="text-[26px] font-bold! text-white mb-1.5 tracking-tight">{title}</h1>
        <p className="text-white/80 text-[14px] font-medium mb-10">{subtitle}</p>

        <ul className="w-full space-y-2.5">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border text-left"
              style={{
                background: "rgba(255,255,255,0.12)",
                borderColor: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-[13px] font-medium text-white">{text}</span>
            </li>
          ))}
        </ul>

        <p className="text-white/65 text-[11px] font-semibold mt-10 uppercase tracking-[0.12em]">
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
    <div className="min-h-screen flex" style={{ background: "#F7F2F0" }}>
      <BrandPanel title={title} subtitle={subtitle} footer={footer} />

      <div
        className={cn(
          "flex-1 flex items-center justify-center px-5 py-10 sm:p-8 lg:p-16 bg-white",
          bodyClassName,
        )}
      >
        <div className={contentClassName}>
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl bg-white border border-[#EEDFE3] flex items-center justify-center",
                "overflow-hidden mb-3 shadow-md",
              )}
            >
              <Image
                src="/lbqueen_logo.png"
                alt="LBQueen"
                width={48}
                height={48}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <p className="font-bold text-[17px] text-[#A83960]">LBQueen</p>
            <p className="text-[12px] font-medium text-[#766B68]">Care & Beauty</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
