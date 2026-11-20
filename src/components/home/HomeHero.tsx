import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import type { Customer } from "@/lib/customer";
import { cn } from "@/lib/utils";
import { BannerCarousel } from "./BannerCarousel";

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
    <section aria-label="Beranda LBQueen" className="relative">
      <div className="relative px-4 sm:px-8 lg:px-12">
        <div data-reveal className="pt-2 md:pt-4">
          <p className="eyebrow">{greeting(hour)}</p>
          <h1 className="mt-2 text-[30px] md:text-[38px] font-bold! leading-[1.1] tracking-tight text-[#2D2926] truncate">
            {firstName}
            <span className="text-[#C94F78]">.</span>
          </h1>
          <p className="mt-1.5 text-[15px] text-[#5F5552]">{subtitle(hour)}</p>
          <p
            className={cn(
              "chip-glass mt-3.5 inline-flex items-center gap-1.5 h-8 rounded-full px-3",
              "text-[12px] font-semibold text-[#5F4A55] capitalize tabular-nums",
            )}
          >
            <Clock3 className="w-3.5 h-3.5 text-[#A83960]" aria-hidden="true" />
            {date} · {time} WIB
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 md:items-start xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div
            data-reveal
            className={cn(
              "-mr-4 sm:-mr-8 md:mr-0",
              // Layar lebar: banner dibingkai kaca; di HP tiap slide sudah berupa kartu kaca sendiri.
              "md:p-1.5 md:rounded-[28px] md:bg-white/55 md:border md:border-white/85 md:backdrop-blur-xl",
              "md:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_16px_40px_-18px_rgba(122,34,64,0.3)]",
            )}
          >
            <div className="md:rounded-[22px] md:overflow-hidden">
              <BannerCarousel peek />
            </div>
          </div>
          <div data-reveal>{children}</div>
        </div>
      </div>
    </section>
  );
}
