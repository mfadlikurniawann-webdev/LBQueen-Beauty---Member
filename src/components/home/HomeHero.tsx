import { BannerCarousel } from "./BannerCarousel";
import { HEADER_GRADIENT } from "./HomeHeader";

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date()),
  );
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export function HomeHero({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <section data-reveal aria-label="Beranda LBQueen" className="relative">
      <div
        className="absolute inset-x-0 top-0 h-[150px] sm:h-[190px] lg:h-[240px] rounded-b-[32px] overflow-hidden"
        style={{ background: HEADER_GRADIENT }}
        aria-hidden="true"
      >
        <span className="absolute -right-16 -top-10 w-56 h-56 rounded-full bg-white/10" />
        <span className="absolute left-1/3 top-16 w-24 h-24 rounded-full bg-white/[0.06]" />
      </div>
      <div className="relative px-4 sm:px-8 lg:px-12">
        <p className="text-[13px] text-white/85 font-medium">
          {greeting()}, <span className="font-bold text-white">{name.split(" ")[0]}</span>
        </p>
        <div className="mt-2.5 grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
          <div className="rounded-[22px] overflow-hidden border-[3px] border-white shadow-[0_16px_34px_-18px_rgba(90,24,52,0.55)]">
            <BannerCarousel />
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
