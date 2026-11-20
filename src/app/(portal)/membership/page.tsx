"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarHeart, Coins, Crown, Gift, History, ShoppingBag, Star, Ticket, type LucideIcon } from "lucide-react";
import { IconChip } from "@/components/IconChip";
import { PageHero } from "@/components/portal/PageHero";
import { useCustomer } from "@/context/CustomerContext";
import { waLink } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { MEMBER_BENEFITS, REGULAR_BENEFITS, TIERS, tierOf } from "@/lib/membership";
import type { Tone } from "@/lib/theme";
import { cn } from "@/lib/utils";

// Ikon mengikuti arti benefit, bukan urutan.
const BENEFIT_ICONS: Record<string, LucideIcon> = {
  "Poin di setiap transaksi": Coins,
  "Voucher khusus member": Ticket,
  "Treatment eksklusif": Star,
  "Riwayat perawatan tersimpan": History,
  "Voucher sesuai membership": Ticket,
  "Pesan treatment & produk online": ShoppingBag,
  "Riwayat pesanan tersimpan": History,
};
const BENEFIT_TONES: Tone[] = ["gold", "rose", "berry", "gold"];

export default function MembershipPage() {
  const router = useRouter();
  const { customer } = useCustomer();
  const track = useRef<HTMLDivElement>(null);
  const current = customer ? tierOf(customer) : TIERS[0];
  const currentIndex = Math.max(
    0,
    TIERS.findIndex((t) => t.id === current.id),
  );
  const [viewed, setViewed] = useState(currentIndex);
  const ready = !!customer;

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const card = el.children[currentIndex] as HTMLElement | undefined;
    if (card) el.scrollLeft = card.offsetLeft - (el.clientWidth - card.clientWidth) / 2;
    const onScroll = () => {
      const center = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDistance = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const c = child as HTMLElement;
        const distance = Math.abs(c.offsetLeft + c.clientWidth / 2 - center);
        if (distance < bestDistance) {
          best = i;
          bestDistance = distance;
        }
      });
      setViewed(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [currentIndex, ready]);

  if (!customer) return null;

  const goTo = (index: number) => {
    const el = track.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (el && card)
      el.scrollTo({
        left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2,
        behavior: "smooth",
      });
  };

  const tier = TIERS[viewed];
  const isCurrent = viewed === currentIndex;
  const benefits = tier.id === "regular" ? REGULAR_BENEFITS : MEMBER_BENEFITS;

  return (
    <div className="min-h-screen">
      <div
        className="transition-[background] duration-500 pb-6 dark:bg-none!"
        style={{
          // Cahaya lembut berwarna tier di belakang kartu, memudar tanpa tepi.
          background: `radial-gradient(75% 65% at 50% 40%, ${tier.stage} 0%, transparent 72%)`,
        }}
      >
        <PageHero
          title="Membership"
          onBack={() => router.back()}
          transparent
        />

        <div
          ref={track}
          role="region"
          aria-label="Kartu tier membership"
          tabIndex={0}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/70 rounded-[28px] px-[12%] sm:px-[calc(50%-170px)] pt-2 pb-10 -mb-6"
        >
          {TIERS.map((t, i) => {
            const mine = i === currentIndex;
            return (
              <div
                key={t.id}
                className={cn(
                  "snap-center shrink-0 w-[76%] sm:w-[340px] transition-transform duration-300",
                  viewed !== i && "scale-[0.94] opacity-80",
                )}
                aria-hidden={viewed !== i}
              >
                <div
                  className="spotlight relative aspect-[1.45/1] rounded-[28px] p-5 flex flex-col justify-between overflow-hidden border border-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_22px_44px_-22px_rgba(90,24,52,0.65)]"
                  style={{ background: t.card, color: t.ink }}
                >
                  {/* Kilau kaca diagonal di atas kartu tier. */}
                  <span
                    className="absolute inset-0 pointer-events-none bg-[linear-gradient(122deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_44%)]"
                    aria-hidden="true"
                  />
                  <span
                    className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15"
                    aria-hidden="true"
                  />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-[12px] font-semibold opacity-80">LBQueen Member</p>
                      <p className="text-[24px] font-bold leading-tight">{t.label}</p>
                    </div>
                    <span className="w-11 h-11 rounded-full bg-white/25 border border-white/40 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] flex items-center justify-center">
                      <Crown className="w-6 h-6" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="relative flex items-end justify-between gap-3">
                    {mine ? (
                      <>
                        <div>
                          <p className="text-[26px] font-bold leading-none tabular-nums">
                            {formatNumber(customer.points || 0)}
                          </p>
                          <p className="text-[12px] font-semibold opacity-80 mt-1">Poin</p>
                        </div>
                        <span className="rounded-full bg-white/80 backdrop-blur-md border border-white px-3 py-1 text-[12px] font-semibold text-[#2D2926]">
                          Tier Anda
                        </span>
                      </>
                    ) : (
                      <p className="text-[13px] font-semibold opacity-90">
                        Ditetapkan admin
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center" role="group" aria-label="Pilih tier">
          {TIERS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              aria-label={`Lihat tier ${t.label}`}
              aria-pressed={viewed === i}
              onClick={() => goTo(i)}
              className="h-11 min-w-11 px-1 flex items-center justify-center"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all",
                  viewed === i ? "w-6 bg-[#C94F78]" : "w-1.5 bg-[#C94F78]/30",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div data-reveal className="px-4 sm:px-8 max-w-2xl mx-auto pb-6">
        <h2 className="text-[20px] font-semibold! text-ink mb-3.5">
          Nikmati {benefits.length} benefit{isCurrent ? "" : ` ${tier.label}`}
        </h2>
        <ul className="glass rounded-[26px] divide-y divide-brand/10">
          {benefits.map((b, i) => (
            <li key={b.title} className="flex items-center gap-3.5 px-4 py-3.5">
              <IconChip
                icon={BENEFIT_ICONS[b.title] ?? Gift}
                tone={BENEFIT_TONES[i % BENEFIT_TONES.length]}
                size="md"
              />
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-ink">{b.title}</span>
              </span>
            </li>
          ))}
        </ul>
        <a
          href={waLink(
            current.id === "regular"
              ? "Halo, saya ingin menanyakan peningkatan status member akun LBQueen saya."
              : "Halo admin LBQueen, saya ingin bertanya tentang membership.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-5 w-full h-[52px] text-[15px]"
        >
          <CalendarHeart className="w-5 h-5" aria-hidden="true" />
          {current.id === "regular" ? "Ajukan upgrade membership" : "Hubungi admin"}
        </a>
      </div>
    </div>
  );
}
