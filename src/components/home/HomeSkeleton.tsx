import { cn } from "@/lib/utils";

export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFBFB] animate-in fade-in duration-500">
      <div
        className={cn(
          "h-[220px] w-full bg-gradient-to-br from-[#E9C3D0] to-[#D79BB0] animate-pulse",
          "rounded-b-[32px] mb-8",
        )}
      ></div>
      <div className="mx-5 mb-8 h-[200px] rounded-[32px] bg-[#F3E7EA] animate-pulse"></div>
      <div className="px-5 mb-8 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="mx-auto w-[64px] h-[64px] rounded-[24px] bg-[#F3E7EA] animate-pulse"
          ></div>
        ))}
      </div>
      <div className="px-5 grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[220px] rounded-[24px] bg-[#F3E7EA] animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}
