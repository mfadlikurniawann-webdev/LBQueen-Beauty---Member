import { HEADER_GRADIENT } from "./HomeHeader";

const PULSE = "bg-[#F3E7EA] animate-pulse";

export function HomeSkeleton() {
  return (
    <div className="min-h-screen" aria-busy="true">
      <span className="sr-only">Memuat beranda</span>
      <div
        style={{ background: HEADER_GRADIENT }}
        className="px-4 sm:px-8 pt-3 pb-24 rounded-b-[32px]"
      >
        <div className="flex gap-2">
          <div className="h-10 w-10 rounded-full bg-white/40" />
          <div className="h-11 flex-1 rounded-full bg-white/50" />
          <div className="h-11 w-11 rounded-full bg-white/25" />
        </div>
      </div>
      <div className="px-4 sm:px-8 -mt-20 space-y-4">
        <div className="aspect-[1440/956] lg:h-[300px] lg:aspect-auto rounded-[22px] bg-[#F9D9E6] animate-pulse border-[3px] border-white" />
        <div className="rounded-[24px] bg-white border border-[#F0E4E8] p-4 space-y-4">
          <div className={`h-12 rounded-2xl ${PULSE}`} />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={`mx-auto w-[60px] h-[60px] rounded-[20px] ${PULSE}`} />
            ))}
          </div>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`shrink-0 w-[152px] h-[250px] rounded-[18px] ${PULSE}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
