const PULSE = "skeleton-glass";

export function HomeSkeleton() {
  return (
    <div className="min-h-screen" aria-busy="true">
      <span className="sr-only">Memuat beranda</span>
      <div className="px-3 sm:px-8 pt-3 flex gap-2">
        <div className={`h-11 flex-1 rounded-full ${PULSE}`} />
        <div className={`h-11 w-24 rounded-full ${PULSE}`} />
        <div className={`h-11 w-11 rounded-full ${PULSE}`} />
      </div>
      <div className="px-4 sm:px-8 pt-6 space-y-4">
        <div className={`h-3 w-28 rounded-full ${PULSE}`} />
        <div className={`h-9 w-44 rounded-2xl ${PULSE}`} />
        <div className={`aspect-[1440/956] md:h-[260px] lg:h-[300px] md:aspect-auto rounded-[24px] ${PULSE}`} />
        <div className="glass-soft rounded-[28px] p-4 space-y-4">
          <div className={`h-12 rounded-2xl ${PULSE}`} />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={`mx-auto w-[60px] h-[60px] rounded-[20px] ${PULSE}`} />
            ))}
          </div>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`shrink-0 w-[152px] h-[250px] rounded-[22px] ${PULSE}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
