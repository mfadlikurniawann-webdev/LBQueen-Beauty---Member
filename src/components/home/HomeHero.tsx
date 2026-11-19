import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import type { Customer } from "@/lib/customer";
import { cn } from "@/lib/utils";
import { BannerCarousel } from "./BannerCarousel";
import { HEADER_GRADIENT } from "./HomeHeader";

const ZONE = "Asia/Jakarta";

function jakartaParts(now: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: ZONE, hour: "numeric", hourCycle: "h23" }).format(
      now,
    ),
  );
  const date = new Intl.DateTimeFormat("id-ID", {
    timeZone: ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
  const time = new Intl.DateTimeFormat("id-ID", {
    timeZone: ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  return { hour, date, time };
}

/** Jam berjalan (diperbarui tiap 30 detik) untuk sapaan dan pil tanggal. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function greeting(hour: number) {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function subtitle(hour: number) {
  if (hour < 11) return "Mulai hari dengan perawatan terbaik.";
  if (hour < 15) return "Jadwalkan perawatan Anda hari ini.";
  if (hour < 18) return "Saatnya merawat diri.";
  return "Rencanakan perawatan untuk esok hari.";
}

export function HomeHero({
  customer,
  children,
}: {
  customer: Customer;
  children: React.ReactNode;
}) {
  const { hour, date, time } = jakartaParts(useNow());
  const firstName = customer.name?.trim().split(/\s+/)[0] || "Kak";

  return (
    <section data-reveal aria-label="Beranda LBQueen" className="relative">
      <div
        className="absolute inset-x-0 top-0 h-[190px] sm:h-[200px] md:h-[220px] lg:h-[240px] rounded-b-[32px] overflow-hidden"
        style={{ background: HEADER_GRADIENT }}
        aria-hidden="true"
      >
        <span className="absolute -right-16 -top-10 w-56 h-56 rounded-full bg-white/10" />
        <span className="absolute left-1/3 top-16 w-24 h-24 rounded-full bg-white/[0.06]" />
      </div>
      <div className="relative px-4 sm:px-8 lg:px-12">
        <div className="pt-1 text-white">
          <p className="text-[14px] font-medium text-white/85">{greeting(hour)},</p>
          <h1 className="mt-0.5 text-[24px] md:text-[28px] font-bold! leading-tight tracking-tight text-white! truncate">
            {firstName}
          </h1>
          <p className="mt-1 text-[14px] text-white/90">{subtitle(hour)}</p>
          <p
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 h-7 rounded-full bg-white/20 px-2.5",
              "text-[12px] font-semibold text-white backdrop-blur-sm capitalize tabular-nums",
            )}
          >
            <Clock3 className="w-3.5 h-3.5" aria-hidden="true" />
            {date} · {time} WIB
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 md:items-start xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div
            className={cn(
              "-mr-4 sm:-mr-8 md:mr-0",
              "md:rounded-[22px] md:overflow-hidden md:border-[3px] md:border-white",
              "md:shadow-[0_16px_34px_-18px_rgba(90,24,52,0.55)]",
            )}
          >
            <BannerCarousel peek />
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
