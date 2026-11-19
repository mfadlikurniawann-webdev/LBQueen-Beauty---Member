import { BANNER_BG } from "@/lib/constants";

const PULSE = "bg-[#F3E7EA] animate-pulse";

export function HomeSkeleton() {
  return (
    <div className="min-h-screen" aria-busy="true">
      <span className="sr-only">Memuat beranda</span>
      <div style={{ background: BANNER_BG }} className="pb-4">
        <div className="flex gap-2.5 px-4 sm:px-8 pt-4 pb-2">
          <div className="h-12 flex-1 rounded-full bg-white/80 animate-pulse" />
          <div className="h-12 w-24 rounded-full bg-white/80 animate-pulse" />
          <div className="h-12 w-12 rounded-full bg-white/80 animate-pulse" />
        </div>
        <div className="aspect-[1440/956] lg:aspect-auto lg:h-[400px] bg-[#F9D9E6] animate-pulse" />
        <div className="flex gap-3 px-4 sm:px-8 -mt-7">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[112px] h-[112px] shrink-0 rounded-[20px] bg-white animate-pulse"
            />
          ))}
        </div>
      </div>
      <div className="px-4 sm:px-8 space-y-7 mt-4">
        <div className={`h-[76px] rounded-[22px] ${PULSE}`} />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={`mx-auto w-[60px] h-[60px] rounded-[20px] ${PULSE}`} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className={`h-[220px] rounded-[24px] ${PULSE}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
