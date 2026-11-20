import { cn } from "@/lib/utils";
import { CARD } from "./ui";

const INPUT = "input-glass block w-full min-w-0 h-12 px-3 text-[16px]";

/** Jadwal treatment ringkas: hanya tampil bila keranjang berisi treatment. */
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
  return (
    <fieldset className={`${CARD} p-4`} aria-describedby={invalid ? "booking-error" : undefined}>
      <legend className="sr-only">Jadwal treatment</legend>
      <p className="text-[15px] font-semibold text-[#2D2926] mb-2.5">Jadwal treatment</p>
      <div className="grid grid-cols-2 gap-2.5">
        <label className="min-w-0">
          <span className="block text-[12px] font-semibold text-[#766B68] mb-1">Tanggal</span>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => onDate(e.target.value)}
            aria-invalid={!!invalid && !date}
            className={INPUT}
          />
        </label>
        <label className="min-w-0">
          <span className="block text-[12px] font-semibold text-[#766B68] mb-1">Jam</span>
          <input
            type="time"
            value={time}
            onChange={(e) => onTime(e.target.value)}
            aria-invalid={!!invalid && !time}
            className={INPUT}
          />
        </label>
      </div>
      {invalid && (
        <p id="booking-error" role="alert" className={cn("mt-2 text-[13px] font-semibold text-rose-700")}>
          {invalid}
        </p>
      )}
    </fieldset>
  );
}
