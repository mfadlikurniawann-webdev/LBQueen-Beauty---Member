"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Crown,
  Gift,
  MessageCircle,
  Sparkles,
  Star,
  Ticket,
} from "lucide-react";
import { useCustomer } from "@/context/CustomerContext";
import { waLink } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { MEMBER_BENEFITS, REGULAR_BENEFITS, TIERS, tierOf } from "@/lib/membership";
import { cn } from "@/lib/utils";

const BENEFIT_ICONS = [Star, Ticket, Sparkles, Gift];

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
      Array.from(el.children).forEach((child, i) => {
        const c = child as HTMLElement;
        const top = el.children[best] as HTMLElement;
        if (
          Math.abs(c.offsetLeft + c.clientWidth / 2 - center) <
          Math.abs(top.offsetLeft + top.clientWidth / 2 - center)
        )
          best = i;
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
        className="transition-[background] duration-500 pb-10"
        style={{ background: tier.stage }}
      >
        <div
          className="flex items-center justify-between px-4 sm:px-8"
          style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 20px)" }}
        >
          <button
            type="button"
            aria-label="Kembali"
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#2D2926] shadow-md active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2.4} />
          </button>
          <a
            href={waLink("Halo admin LBQueen, saya ingin bertanya tentang membership.")}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 rounded-full bg-white px-4 flex items-center gap-2 text-[15px] font-semibold text-[#2D2926] shadow-md"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" /> Info
          </a>
        </div>

        <h1 className="sr-only">Membership LBQueen</h1>
        <div
          className="flex items-center justify-center gap-2 px-4 mt-5 overflow-hidden"
          role="group"
          aria-label="Tingkat membership"
        >
          {TIERS.map((t, i) => (
            <div key={t.id} className="flex items-center gap-2 min-w-0">
              {i > 0 && (
                <span className="w-5 sm:w-12 h-[3px] rounded-full bg-white/35" aria-hidden="true" />
              )}
              <button
                type="button"
                aria-pressed={viewed === i}
                onClick={() => goTo(i)}
                className={cn(
                  "text-[14px] whitespace-nowrap transition-colors",
                  viewed === i ? "font-bold text-white" : "font-medium text-white/60",
                )}
              >
                {t.label}
              </button>
            </div>
          ))}
        </div>

        <div className="relative mt-6">
          <div
            ref={track}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-[11%] sm:px-[calc(50%-170px)]"
          >
            {TIERS.map((t, i) => {
              const mine = i === currentIndex;
              return (
                <div
                  key={t.id}
                  className="snap-center shrink-0 w-[78%] sm:w-[340px]"
                  aria-hidden={viewed !== i}
                >
                  <div
                    className="relative rounded-[28px] p-[6px] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)]"
                    style={{ background: t.card }}
                  >
                    <div className="rounded-[22px] border-2 border-white/35 px-5 pt-0 pb-5 flex flex-col items-center">
                      <span
                        className="-mt-px rounded-b-2xl px-6 py-2 text-[18px] font-bold bg-white/25 backdrop-blur-sm"
                        style={{ color: t.ink }}
                      >
                        {t.label}
                      </span>
                      <span
                        className="my-8 w-28 h-28 rounded-full flex items-center justify-center bg-white/25 border-4 border-white/40 shadow-inner"
                        aria-hidden="true"
                      >
                        <Crown
                          className="w-14 h-14"
                          style={{ color: t.ink }}
                          fill="rgba(255,255,255,0.35)"
                        />
                      </span>
                      {mine ? (
                        <div
                          className="w-full grid grid-cols-2 divide-x divide-white/40"
                          style={{ color: t.ink }}
                        >
                          <div className="text-center">
                            <p className="text-[24px] font-extrabold leading-none tabular-nums">
                              {formatNumber(customer.points || 0)}
                            </p>
                            <p className="text-[13px] font-medium mt-1.5 opacity-90">Poin</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[18px] font-extrabold leading-tight">Aktif</p>
                            <p className="text-[13px] font-medium mt-1.5 opacity-90">Tier Anda</p>
                          </div>
                        </div>
                      ) : (
                        <p
                          className="text-[14px] font-semibold text-center"
                          style={{ color: t.ink }}
                        >
                          Ditetapkan oleh admin LBQueen
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="-mt-5 pt-8 pb-4 px-5 rounded-b-[28px] bg-[#1B1416] text-white text-center">
                    <p className="text-[13px] leading-relaxed text-white/90">
                      {mine
                        ? "Status tier dikelola admin. Poin tidak otomatis mengubah tier."
                        : `Tanya admin untuk informasi tier ${t.label}.`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {viewed > 0 && (
            <button
              type="button"
              aria-label="Tier sebelumnya"
              onClick={() => goTo(viewed - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-[#2D2926] shadow"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {viewed < TIERS.length - 1 && (
            <button
              type="button"
              aria-label="Tier berikutnya"
              onClick={() => goTo(viewed + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-[#2D2926] shadow"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-8 max-w-2xl mx-auto -mt-2 pb-6">
        <h2 className="text-center text-[22px] font-bold! text-[#2D2926] mb-4">
          Nikmati {benefits.length} benefit{isCurrent ? "" : ` ${tier.label}`}
        </h2>
        <ul className="space-y-3">
          {benefits.map((b, i) => {
            const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
            return (
              <li
                key={b.title}
                className="flex items-center gap-4 rounded-[20px] bg-white border border-[#F0E4E8] px-4 py-4 shadow-[0_8px_24px_-18px_rgba(122,34,64,0.4)]"
              >
                <span
                  className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center"
                  style={{ background: tier.chip }}
                >
                  <Icon className="w-6 h-6 text-[#7A4B0B]" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold text-[#2D2926]">{b.title}</span>
                  <span className="block text-[13px] text-[#766B68] mt-0.5">{b.desc}</span>
                </span>
              </li>
            );
          })}
        </ul>
        {current.id === "regular" && (
          <a
            href={waLink(
              "Halo, saya ingin menanyakan peningkatan status member akun LBQueen saya.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pink w-full mt-5"
          >
            Tanya upgrade ke admin
          </a>
        )}
      </div>
    </div>
  );
}
