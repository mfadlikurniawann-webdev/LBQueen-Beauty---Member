import { CheckCircle2, Clock, Package, Wallet, XCircle } from "lucide-react";
import { TREATMENT_TYPE, WA_NUMBER } from "@/lib/constants";

export type Order = {
  id: number;
  product_name: string;
  status: string;
  ordered_at: string;
  completed_at?: string;
  customer_id: number;
  price?: number;
  qty?: number;
  total_price?: number;
  product_id?: number;
  reviewed_at?: string | null;
};

export type OrderProduct = {
  id: number;
  name: string;
  image_url: string | null;
  type: string;
  sub_category?: string;
};

export const ORDER_TABS = [
  { id: "semua", label: "Semua" },
  { id: "menunggu", label: "Menunggu" },
  { id: "diproses", label: "Diproses" },
  { id: "dp", label: "Sudah DP" },
  { id: "selesai", label: "Selesai" },
  { id: "batal", label: "Batal" },
];

export const TAB_STATUS: Record<string, string> = {
  menunggu: "pending",
  diproses: "processing",
  dp: "dp",
  selesai: "completed",
  batal: "cancelled",
};

export function getOrderStatus(s: string) {
  if (s === "pending")
    return { label: "Menunggu", icon: Clock, cls: "bg-amber-50 text-amber-700 border-amber-200" };
  if (s === "processing")
    return { label: "Diproses", icon: Package, cls: "bg-sky-50 text-sky-700 border-sky-200" };
  if (s === "dp")
    return {
      label: "Sudah DP",
      icon: Wallet,
      cls: "bg-violet-50 text-violet-700 border-violet-200",
    };
  if (s === "cancelled")
    return { label: "Dibatalkan", icon: XCircle, cls: "bg-rose-50 text-rose-700 border-rose-200" };
  return {
    label: "Selesai",
    icon: CheckCircle2,
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

/**
 * Nama di customer_orders memakai format lama dari database:
 * "Nama (Varian) [Jadwal: 2026-11-21 19:00] Rp 19.250.000 (x7)". Format DB tidak diubah;
 * teks mentah (kurung siku, Rp, xN) tidak pernah ditampilkan ke pelanggan.
 */
export function parseProductName(fullName: string) {
  let rest = (fullName || "").trim();
  let qty = 0;
  const qtyMatch = rest.match(/\s*\(x(\d+)\)\s*$/);
  if (qtyMatch) {
    qty = parseInt(qtyMatch[1], 10);
    rest = rest.slice(0, qtyMatch.index).trim();
  }
  let price = 0;
  const priceMatch = rest.match(/\s*Rp\s*([\d.]+)\s*$/);
  if (priceMatch) {
    price = parseInt(priceMatch[1].replace(/\./g, ""), 10) || 0;
    rest = rest.slice(0, priceMatch.index).trim();
  }
  let schedule: Date | null = null;
  const scheduleMatch = rest.match(/\s*\[Jadwal:\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})[^\]]*\]/i);
  if (scheduleMatch) {
    // Jadwal disimpan dalam WIB.
    const parsed = new Date(`${scheduleMatch[1]}T${scheduleMatch[2]}:00+07:00`);
    schedule = Number.isNaN(parsed.getTime()) ? null : parsed;
    rest = (rest.slice(0, scheduleMatch.index) + rest.slice(scheduleMatch.index! + scheduleMatch[0].length)).trim();
  }
  rest = rest.replace(/\s*\[[^\]]*\]\s*/g, " ").trim();
  let name = rest;
  let variant = "";
  const variantMatch = rest.match(/^(.*?)\s*\(([^()]+)\)$/);
  if (variantMatch && variantMatch[1]) {
    name = variantMatch[1].trim();
    variant = variantMatch[2].trim();
  }
  return {
    name,
    variant,
    schedule,
    qty,
    price,
    // Nama lama tetap tersedia untuk pemanggil yang belum diperbarui.
    mainName: name,
    variantName: variant,
    itemPrice: price,
  };
}

/** "Sab, 21 Nov, 19.00" (WIB, tanpa detik). */
export function formatSchedule(date: Date) {
  const day = date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  });
  const time = date
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })
    .replace(":", ".");
  return `${day}, ${time}`;
}

/** Baris kecil di bawah nama: varian dan/atau jadwal. */
export function orderDetailLine(parsed: ReturnType<typeof parseProductName>) {
  return [parsed.variant, parsed.schedule ? formatSchedule(parsed.schedule) : ""]
    .filter(Boolean)
    .join(", ");
}

export function describeOrder(o: Order) {
  const parsed = parseProductName(o.product_name);
  const qty = o.qty || parsed.qty || 1;
  const unit = Number(o.price) || parsed.price;
  return {
    parsed,
    qty,
    unit,
    total: Number(o.total_price) || unit * qty,
    invoiceNum: `ONL-${o.id.toString().padStart(5, "0")}`,
  };
}

/** "19 Nov 2026" tanpa jam. */
export function formatOrderDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

export function formatOrderDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function openWhatsApp(text: string) {
  window.location.href = `https://wa.me/${WA_NUMBER}?text=${text}`;
}

export const orderQuestion = (o: Order, invoiceNum: string) =>
  `Halo, saya tanya pesanan: ${parseProductName(o.product_name).name} (#${invoiceNum})`;

export function isTreatmentOrder(product: OrderProduct | undefined, name: string) {
  return product?.type === TREATMENT_TYPE || /treatment|facial/i.test(name);
}
