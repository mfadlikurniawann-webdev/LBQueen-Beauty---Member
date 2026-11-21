import type { Customer } from "@/lib/customer";
import { cn } from "@/lib/utils";
import { BannerCarousel } from "./BannerCarousel";

export function HomeHero({
  customer,
  children,
}: {
  customer: Customer;
  children: React.ReactNode;
}) {
  const firstName = customer.name?.trim().split(/\s+/)[0] || "Kak";

  return (
    <section aria-label="Beranda LBQueen" className="relative">
      <div className="relative px-4 sm:px-8 lg:px-12">
        {/* Sapaan visual dihapus atas permintaan pemilik; judul tetap ada untuk pembaca layar. */}
        <h1 className="sr-only">Beranda {firstName}</h1>

        <div className="md:pt-4 grid gap-4 md:grid-cols-2 md:items-start xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div
            data-reveal
            className={cn(
              // Layar lebar: banner dibingkai kaca; di HP tiap slide sudah berupa kartu kaca sendiri.
              "md:p-1.5 md:rounded-[28px] md:bg-fill/55 md:border md:border-edge/85 md:backdrop-blur-xl",
              "md:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_16px_40px_-18px_rgba(122,34,64,0.3)]",
            )}
          >
            <div className="md:rounded-[22px] md:overflow-hidden">
              <BannerCarousel peek dots={false} />
            </div>
          </div>
          <div data-reveal>{children}</div>
        </div>
      </div>
    </section>
  );
}
