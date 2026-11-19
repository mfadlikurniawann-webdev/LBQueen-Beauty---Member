export const CLINIC_HOURS = [
  { days: "Senin – Kamis", time: "09.00 – 21.00 WIB" },
  { days: "Jumat – Sabtu", time: "10.00 – 21.00 WIB" },
];

const OPEN_HOUR: Record<number, number> = { 1: 9, 2: 9, 3: 9, 4: 9, 5: 10, 6: 10 };
const CLOSE_HOUR = 21;

export function clinicStatus(now = new Date()): "buka" | "tutup" | "info" {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    parts.find((p) => p.type === "weekday")?.value ?? "",
  );
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  const open = OPEN_HOUR[weekday];
  if (open === undefined) return "info";
  return hour >= open && hour < CLOSE_HOUR ? "buka" : "tutup";
}
