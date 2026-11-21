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

/* ── Slot jadwal treatment ──
   Satu slot = satu jam mulai di jam buka, terakhir satu jam sebelum tutup. Hari tanpa jam buka (Minggu)
   tidak punya slot. Slot yang sudah dipakai pelanggan lain tidak bisa dipilih. */

/** Hari dari sekarang yang bisa dipesan. */
export const BOOKING_DAYS = 14;

/** Tanggal (YYYY-MM-DD) dan jam bulat sekarang di WIB. */
export function jakartaNow(now = new Date()) {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(now);
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", hour: "numeric", hourCycle: "h23" }).format(now),
  );
  return { date, hour };
}

/** Geser tanggal YYYY-MM-DD sejumlah hari (kalender, tanpa zona waktu). */
export function addDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function weekdayOf(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Jam mulai yang tersedia pada tanggal itu, format "HH:00". */
export function slotTimes(date: string) {
  const open = OPEN_HOUR[weekdayOf(date)];
  if (open === undefined) return [];
  return Array.from({ length: CLOSE_HOUR - open }, (_, i) => `${String(open + i).padStart(2, "0")}:00`);
}

/** Kunci slot "YYYY-MM-DD HH:00"; jam berapa pun dibulatkan ke bawah ke slot jamnya. */
export function slotKey(date: string, time: string) {
  return `${date} ${time.slice(0, 2)}:00`;
}

/** Slot sudah lewat (hari ini, jam yang sudah dimulai). */
export function slotPassed(date: string, time: string, now = jakartaNow()) {
  return date < now.date || (date === now.date && Number(time.slice(0, 2)) <= now.hour);
}
