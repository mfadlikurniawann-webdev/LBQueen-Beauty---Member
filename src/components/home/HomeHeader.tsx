import Link from "next/link";
import { Search } from "lucide-react";
import { useScrolled } from "@/hooks/useScrolled";
import type { Customer } from "@/lib/customer";
import { cn } from "@/lib/utils";
import { CustomerAvatar } from "@/components/CustomerAvatar";

/** Bar atas beranda: pencarian selebar mungkin dan avatar profil (tier sudah ada di kartu poin). */
export function HomeHeader({
  customer,
  searchQuery,
  onSearch,
}: {
  customer: Customer;
  searchQuery: string;
  onSearch: (value: string) => void;
}) {
  const scrolled = useScrolled();
  return (
    <header
      className="sticky top-0 z-40 md:static px-4 sm:px-8 lg:px-12 pb-3 md:pb-4"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 10px)" }}
    >
      {/* Di HP bar menyatu dengan latar; saat digulir menjadi pil kaca melayang. */}
      <div
        className={cn(
          "morph-bar mx-auto flex items-center gap-3 rounded-full border",
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
            placeholder="Cari treatment, produk"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className={cn(
              "chip-glass w-full h-11 rounded-full pl-11 pr-4 text-[16px] text-[#2D2926] outline-none",
              "placeholder:text-[#8C8280] focus:bg-white/90 focus:ring-4 focus:ring-[#C94F78]/15 transition-[box-shadow,background-color]",
            )}
          />
        </label>
        <Link
          href="/profile"
          className={cn(
            "md:hidden shrink-0 w-11 h-11 rounded-full ring-2 ring-white shadow-[0_6px_14px_-8px_rgba(90,24,52,0.6)]",
            "active:scale-95 transition-transform",
          )}
        >
          <span className="sr-only">Profil</span>
          <CustomerAvatar name={customer.name} src={customer.avatar_url} size={44} className="text-[14px]" />
        </Link>
      </div>
    </header>
  );
}
