import { Calendar, Clock, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD, SectionTitle } from "./ui";

function BookingField({
  id,
  label,
  type,
  icon: Icon,
  value,
  onChange,
  min,
}: {
  id: string;
  label: string;
  type: "date" | "time";
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  min?: string;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="block text-[11px] font-bold text-[#766B68] mb-1.5 uppercase tracking-[0.1em]"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-[#C94F78]" aria-hidden="true" />
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          className={cn(
            "block w-full min-w-0 h-12 pl-9 pr-2 text-[14px] text-[#2D2926] bg-[#FDFAFB] border",
            "border-[#E8D5DB] rounded-2xl outline-none focus:bg-white focus:border-[#C94F78] focus:ring-4",
            "focus:ring-[#C94F78]/10 transition-all",
          )}
        />
      </div>
    </div>
  );
}

export function BookingScheduleCard({
  date,
  time,
  onDate,
  onTime,
}: {
  date: string;
  time: string;
  onDate: (value: string) => void;
  onTime: (value: string) => void;
}) {
  return (
    <div className={`${CARD} p-5 flex flex-col gap-4`}>
      <div>
        <SectionTitle>Jadwal Booking Treatment</SectionTitle>
        <p className="text-[13px] text-[#766B68] mt-1">
          Silakan pilih jadwal untuk perawatan Anda.
        </p>
      </div>
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
        <BookingField
          id="booking-date"
          label="Tanggal"
          type="date"
          icon={Calendar}
          value={date}
          onChange={onDate}
          min={new Date().toISOString().split("T")[0]}
        />
        <BookingField
          id="booking-time"
          label="Jam"
          type="time"
          icon={Clock}
          value={time}
          onChange={onTime}
        />
      </div>
    </div>
  );
}
