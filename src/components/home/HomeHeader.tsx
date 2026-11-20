import Link from "next/link";
import { Crown, Search } from "lucide-react";
import { useScrolled } from "@/hooks/useScrolled";
import type { Customer } from "@/lib/customer";
import { tierOf } from "@/lib/membership";
import { cn } from "@/lib/utils";


const initials = (name?: string) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

/** Bar atas beranda: pencarian, lencana tier membership, dan avatar profil pelanggan. */
export function HomeHeader({
  customer,
  searchQuery,
  onSearch,
}: {
  customer: Customer;
  searchQuery: string;
  onSearch: (value: string) => void;
}) {
  const tier = tierOf(customer);
  const scrolled = useScrolled();
  return (
    <header
      className="sticky top-0 z-40 md:static px-3 sm:px-8 lg:px-12 pb-2 md:pb-4"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 10px)" }}
    >
      {/* Di HP bar menyatu dengan latar; saat digulir menjadi pil kaca melayang. */}
      <div
        className={cn(
          "morph-bar mx-auto flex items-center gap-2 md:gap-3 rounded-full border",
          scrolled
            ? "glass p-1.5 max-w-[640px] md:max-w-none md:p-0 md:bg-transparent md:border-transparent md:shadow-none md:backdrop-blur-none"
            : "p-0 border-transparent",
        )}
      >
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Cari treatment atau produk</span>
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#A83960]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Cari facial, skinbooster..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className={cn(
              "chip-glass w-full h-11 rounded-full pl-11 pr-4 text-[15px] text-[#2D2926] outline-none",
              "placeholder:text-[#8C8280] focus:bg-white/90 focus:ring-4 focus:ring-[#C94F78]/15 transition-[box-shadow,background-color]",
            )}
          />
        </label>
        <Link
          href="/membership"
          aria-label={`Membership ${tier.name}`}
          className={cn(
            "md:hidden shrink-0 h-11 pl-2 pr-3 rounded-full flex items-center gap-1.5",
            "bg-gradient-to-b from-[#FFE9A8] to-[#F6C94E] border-2 border-[#FFF4CF]",
            "shadow-[0_6px_14px_-8px_rgba(90,24,52,0.6)] active:scale-95 transition-transform",
          )}
        >
          <span className="w-7 h-7 rounded-full bg-[#7A5410] flex items-center justify-center">
            <Crown className="w-4 h-4 text-[#FFE38A]" aria-hidden="true" />
          </span>
          <span className="leading-[1.05] text-[#5A3B06]">
            <span className="block text-[13px] font-extrabold">{tier.name}</span>
            <span className="block text-[11px] font-bold">Member</span>
          </span>
        </Link>
        <Link
          href="/profile"
          aria-label="Profil saya"
          className={cn(
            "md:hidden shrink-0 w-11 h-11 rounded-full p-[2px] bg-gradient-to-b from-[#FFE9A8] to-[#F6C94E]",
            "active:scale-95 transition-transform",
          )}
        >
          <span className="w-full h-full rounded-full bg-gradient-to-br from-[#D9648C] to-[#7E2449] text-white text-[14px] font-bold flex items-center justify-center ring-2 ring-white">
            {initials(customer.name)}
          </span>
        </Link>
      </div>
    </header>
  );
}
