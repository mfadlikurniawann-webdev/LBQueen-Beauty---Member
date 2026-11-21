import { useEffect, useMemo } from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { BOOKING_DAYS, addDays, jakartaNow, slotKey, slotPassed, slotTimes } from "@/lib/clinic";
import { CARD } from "./ui";

const LABEL = "block text-[12px] font-semibold text-ink-muted mb-1.5";
const CHIP =
  "border transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/70 " +
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through";

async function loadTaken(): Promise<string[]> {
  const response = await fetch("/api/slots", { cache: "no-store" });
  if (!response.ok) throw new Error("Jadwal belum dapat dimuat.");
  return ((await response.json()) as { taken: string[] }).taken;
}

const weekdayLabel = (date: string) =>
  new Date(`${date}T12:00:00+07:00`).toLocaleDateString("id-ID", { weekday: "short", timeZone: "Asia/Jakarta" });
const monthLabel = (date: string) =>
  new Date(`${date}T12:00:00+07:00`).toLocaleDateString("id-ID", { month: "short", timeZone: "Asia/Jakarta" });

/**
 * Jadwal treatment: pilih tanggal lalu jam dari slot jam buka klinik. Slot yang sudah dipakai pelanggan lain
 * atau sudah lewat tidak bisa dipilih; tanggal yang semua slotnya terpakai ikut nonaktif. Server memeriksa ulang.
 */
export function BookingScheduleCard({
  date,
  time,
  onDate,
  onTime,
  invalid,
}: {
  date: string;
  time: string;
  onDate: (value: string) => void;
  onTime: (value: string) => void;
  invalid?: string | null;
}) {
  const { data: takenList, isLoading } = useSWR("booking-slots", loadTaken, { refreshInterval: 60000 });
  const taken = useMemo(() => new Set(takenList ?? []), [takenList]);
  const now = jakartaNow();
  const open = (day: string, slot: string) => !taken.has(slotKey(day, slot)) && !slotPassed(day, slot, now);

  const days = Array.from({ length: BOOKING_DAYS }, (_, i) => addDays(now.date, i))
    .filter((day) => slotTimes(day).length > 0)
    .map((day) => ({ day, full: !slotTimes(day).some((slot) => open(day, slot)) }));
  const slots = date ? slotTimes(date) : [];
  const timeStillOpen = !time || !date || open(date, time);

  // Slot yang dipilih bisa terpakai orang lain saat data diperbarui: kosongkan agar dipilih ulang.
  useEffect(() => {
    if (!timeStillOpen) onTime("");
  }, [timeStillOpen, onTime]);

  return (
    <fieldset className={`${CARD} p-4 min-w-0 overflow-hidden`} aria-describedby={invalid ? "booking-error" : undefined}>
      <legend className="sr-only">Jadwal treatment</legend>
      <p className="text-[15px] font-semibold text-ink mb-3">Jadwal treatment</p>

      <span id="booking-date-label" className={LABEL}>
        Tanggal
      </span>
      <div
        role="radiogroup"
        aria-labelledby="booking-date-label"
        aria-busy={isLoading}
        className="-mx-4 px-4 flex gap-2 overflow-x-auto no-scrollbar pb-1"
      >
        {days.map(({ day, full }) => {
          const active = day === date;
          return (
            <button
              key={day}
              data-date={day}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${weekdayLabel(day)} ${Number(day.slice(8))} ${monthLabel(day)}${full ? ", penuh" : ""}`}
              disabled={full || isLoading}
              onClick={() => {
                onDate(day);
                if (time && !open(day, time)) onTime("");
              }}
              className={cn(
                CHIP,
                "shrink-0 w-[60px] h-[68px] rounded-[18px] flex flex-col items-center justify-center leading-tight",
                active ? "chip-active border-transparent" : "chip-glass text-ink-3",
              )}
            >
              <span className="text-[12px] font-medium capitalize">{weekdayLabel(day)}</span>
              <span className="text-[18px] font-semibold tabular-nums">{Number(day.slice(8))}</span>
              <span className="text-[11px]">{monthLabel(day)}</span>
            </button>
          );
        })}
      </div>

      {date && (
        <>
          <span id="booking-time-label" className={cn(LABEL, "mt-3")}>
            Jam
          </span>
          <div role="radiogroup" aria-labelledby="booking-time-label" className="grid grid-cols-4 gap-2">
            {slots.map((slot) => {
              const available = open(date, slot);
              const active = slot === time;
              return (
                <button
                  key={slot}
                  data-slot={slot}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`${slot}${available ? "" : ", tidak tersedia"}`}
                  disabled={!available}
                  onClick={() => onTime(slot)}
                  className={cn(
                    CHIP,
                    "h-11 rounded-full text-[14px] font-semibold tabular-nums",
                    active ? "chip-active border-transparent" : "chip-glass text-ink-3",
                  )}
                >
                  {slot.replace(":", ".")}
                </button>
              );
            })}
          </div>
        </>
      )}

      {invalid && (
        <p id="booking-error" role="alert" className="mt-3 text-[13px] font-semibold text-danger">
          {invalid}
        </p>
      )}
    </fieldset>
  );
}
