import { Search } from "lucide-react";
import { HERO_GRADIENT } from "@/lib/constants";
import { cn } from "@/lib/utils";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Selamat Pagi";
  if (h < 15) return "Selamat Siang";
  if (h < 18) return "Selamat Sore";
  return "Selamat Malam";
}

export function HomeHero({
  name,
  searchQuery,
  onSearch,
}: {
  name?: string;
  searchQuery: string;
  onSearch: (value: string) => void;
}) {
  return (
    <div
      data-reveal
      className={cn(
        "relative overflow-hidden px-5 sm:px-8 lg:px-12 pt-24 lg:pt-28 pb-8 lg:pb-12 mb-8",
        "rounded-b-[32px] shadow-sm",
      )}
      style={{ background: HERO_GRADIENT }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -ml-32 -mt-32"></div>

      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="text-[26px] lg:text-4xl font-semibold text-white tracking-tight leading-tight drop-shadow-sm">
            {getGreeting()},<br />
            <span className="text-[#F5E3C0]">{name ? name.split(" ")[0] : "Guest"}!</span>
          </h2>
          <p className="text-white/90 text-[14px] leading-relaxed mt-3 max-w-md">
            Waktu untuk merawat diri. Temukan perawatan pilihan Anda.
          </p>
        </div>

        <div
          className={cn(
            "relative w-full max-w-2xl rounded-2xl overflow-hidden bg-white shadow-lg shadow-[#7A2240]/20",
            "ring-1 ring-white/60 transition-shadow focus-within:ring-4 focus-within:ring-white/40",
          )}
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search aria-hidden="true" className="h-[18px] w-[18px] text-[#A83960]" />
          </div>
          <input
            type="search"
            aria-label="Cari treatment atau produk"
            placeholder="Cari treatment atau produk..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className={cn(
              "block w-full pl-12 pr-4 py-4 text-base bg-transparent outline-none text-[#2D2926]",
              "placeholder:text-[#8C8280]",
            )}
          />
        </div>
      </div>
    </div>
  );
}
