import Link from "next/link";
import {
  CalendarHeart,
  Clock3,
  Crown,
  MapPin,
  MessageCircleHeart,
  Search,
  type LucideIcon,
} from "lucide-react";
import { clinicStatus } from "@/lib/clinic";
import { BANNER_BG, CLINIC_MAPS_URL, waLink } from "@/lib/constants";
import type { Customer } from "@/lib/customer";
import { tierOf } from "@/lib/membership";
import { cn } from "@/lib/utils";
import { BannerCarousel } from "./BannerCarousel";

type Tile = {
  label: string;
  badge: string;
  icon: LucideIcon;
  color: string;
  href: string;
  external?: boolean;
};

function QuickTile({ tile }: { tile: Tile }) {
  const Icon = tile.icon;
  const body = (
    <>
      <span
        className="absolute -top-2.5 left-2 rounded-full bg-[#2D2926] px-2 py-0.5 text-[11px] font-bold text-white"
        aria-hidden="true"
      >
        {tile.badge}
      </span>
      <Icon
        className="w-8 h-8 mt-1"
        style={{ color: tile.color }}
        strokeWidth={1.9}
        aria-hidden="true"
      />
      <span className="text-[13px] font-semibold leading-tight text-[#2D2926] text-center whitespace-pre-line">
        {tile.label}
      </span>
    </>
  );
  const cls = cn(
    "relative snap-start shrink-0 w-[112px] h-[112px] rounded-[20px] bg-white border-2 flex flex-col",
    "items-center justify-center gap-2 px-2 shadow-[0_8px_20px_-12px_rgba(122,34,64,0.45)] active:scale-95",
    "transition-transform",
  );
  const label = `${tile.label.replace("\n", " ")}, ${tile.badge}`;
  return tile.external ? (
    <a
      href={tile.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cls}
      style={{ borderColor: tile.color + "55" }}
    >
      {body}
    </a>
  ) : (
    <Link
      href={tile.href}
      aria-label={label}
      className={cls}
      style={{ borderColor: tile.color + "55" }}
    >
      {body}
    </Link>
  );
}

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

export function HomeHero({
  customer,
  searchQuery,
  onSearch,
}: {
  customer: Customer;
  searchQuery: string;
  onSearch: (value: string) => void;
}) {
  const tier = tierOf(customer);
  const status = clinicStatus();
  const tiles: Tile[] = [
    {
      label: "Booking\nTreatment",
      badge: "WA",
      icon: CalendarHeart,
      color: "#C94F78",
      href: waLink(`Halo LBQueen, saya ${customer.name} ingin booking treatment.`),
      external: true,
    },
    {
      label: "Konsultasi\nKulit",
      badge: "Chat",
      icon: MessageCircleHeart,
      color: "#9B3055",
      href: waLink(`Halo LBQueen, saya ${customer.name} ingin konsultasi perawatan kulit.`),
      external: true,
    },
    {
      label: "Jam\nBuka",
      badge: status === "buka" ? "Buka" : status === "tutup" ? "Tutup" : "Info",
      icon: Clock3,
      color: "#B8861A",
      href: "#info-klinik",
    },
    {
      label: "Lokasi\nKlinik",
      badge: "Maps",
      icon: MapPin,
      color: "#3F7A5E",
      href: CLINIC_MAPS_URL,
      external: true,
    },
  ];

  return (
    <section data-reveal aria-label="Beranda LBQueen" style={{ background: BANNER_BG }}>
      <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-6 lg:pl-12 lg:pt-6">
        <div className="lg:pb-10">
          <div className="hidden lg:block mb-6">
            <p className="text-[14px] font-semibold text-[#A83960]">{greeting()}</p>
            <h1 className="text-[34px] font-bold! text-[#2D2926] leading-tight tracking-tight mt-1">
              Halo, {customer.name?.split(" ")[0]}
            </h1>
            <p className="text-[15px] text-[#5F5552] mt-2 max-w-sm">
              Waktunya merawat diri. Pesan treatment dan produk favorit Anda di LBQueen.
            </p>
          </div>
          <div
            className="flex items-center gap-2.5 px-4 sm:px-8 lg:px-0 pt-4 pb-2"
            style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 16px)" }}
          >
            <label className="relative flex-1 min-w-0">
              <span className="sr-only">Cari treatment atau produk</span>
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5F5552]"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Cari treatment..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className={cn(
                  "w-full h-12 rounded-full bg-white pl-12 pr-4 text-base text-[#2D2926] outline-none",
                  "placeholder:text-[#8C8280] shadow-[0_4px_14px_rgba(122,34,64,0.10)] border border-white",
                  "focus:border-[#C94F78]/40 focus:ring-4 focus:ring-[#C94F78]/10",
                )}
              />
            </label>
            <Link
              href="/membership"
              aria-label={`Status membership ${tier.name}`}
              className="shrink-0 flex items-center gap-1.5 h-12 rounded-full pl-2.5 pr-3 border border-white/70 shadow-[0_4px_14px_rgba(122,34,64,0.10)]"
              style={{ background: tier.chip }}
            >
              <Crown className="w-5 h-5 text-[#7A4B0B]" fill="#F5C842" aria-hidden="true" />
              <span className="leading-none">
                <span className="block text-[13px] font-bold text-[#4A2A06]">{tier.name}</span>
                <span className="hidden min-[420px]:block text-[11px] font-semibold text-[#6B4A1A] mt-0.5">
                  {tier.id === "regular" ? "Akun" : "Member"}
                </span>
              </span>
            </Link>
            <Link
              href="/profile"
              aria-label="Profil saya"
              className="lg:hidden shrink-0 w-12 h-12 rounded-full p-[3px] bg-gradient-to-br from-[#F5C842] to-[#C94F78] shadow-[0_4px_14px_rgba(122,34,64,0.18)]"
            >
              <span className="w-full h-full rounded-full bg-white flex items-center justify-center text-[18px] font-bold text-[#A83960]">
                {customer.name?.charAt(0).toUpperCase()}
              </span>
            </Link>
          </div>
        </div>

        <BannerCarousel />
      </div>

      <div className="relative -mt-7 lg:-mt-6 pb-1">
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x px-4 sm:px-8 lg:px-12 pt-3 pb-4">
          {tiles.map((tile) => (
            <QuickTile key={tile.label} tile={tile} />
          ))}
        </div>
      </div>
    </section>
  );
}
