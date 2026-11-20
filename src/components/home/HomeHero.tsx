import { useEffect, useState } from "react";
import type { Customer } from "@/lib/customer";
import { cn } from "@/lib/utils";
import { BannerCarousel } from "./BannerCarousel";

const ZONE = "Asia/Jakarta";

const jakartaHour = (now: Date) =>
  Number(
    new Intl.DateTimeFormat("en-US", { timeZone: ZONE, hour: "numeric", hourCycle: "h23" }).format(
      now,
    ),
  );

/** Jam berjalan (diperbarui tiap menit) agar sapaan berganti sesuai waktu. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
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

export function HomeHero({
  customer,
  children,
}: {
  customer: Customer;
  children: React.ReactNode;
}) {
  const hour = jakartaHour(useNow());
  const firstName = customer.name?.trim().split(/\s+/)[0] || "Kak";

  return (
    <section aria-label="Beranda LBQueen" className="relative">
      <div className="relative px-4 sm:px-8 lg:px-12">
        {/* Sapaan dua baris: teks kecil lalu nama, sejajar padding halaman. */}
        <div className="md:pt-4">
          <p className="text-[13px] font-semibold text-[#766B68]">{greeting(hour)}</p>
          <h1 className="mt-0.5 text-[26px] md:text-[36px] font-semibold! leading-tight tracking-tight text-[#2D2926] truncate">
            {firstName}
          </h1>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 md:items-start xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div
            data-reveal
            className={cn(
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
