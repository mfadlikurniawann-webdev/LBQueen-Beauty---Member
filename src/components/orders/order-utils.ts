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

export function parseProductName(fullName: string) {
  let clean = fullName.replace(/\s*\(x\d+\)$/, "").trim();
  const priceMatch = clean.match(/Rp\s*([\d.]+)/);
  const itemPrice = priceMatch ? parseInt(priceMatch[1].replace(/\./g, "")) : 0;
  if (priceMatch) {
    clean = clean.replace(/\s*Rp\s*[\d.]+/, "").trim();
  }
  let mainName = clean;
  let variantName = "";
  const parenMatch = clean.match(/\(([^)]+)\)$/);
  if (parenMatch) {
    variantName = parenMatch[1];
    mainName = clean.replace(/\s*\([^)]+\)$/, "").trim();
  }
  return { mainName, variantName, itemPrice };
}

export function describeOrder(o: Order) {
  const parsed = parseProductName(o.product_name);
  const match = o.product_name.match(/\(x(\d+)\)$/);
  const qty = o.qty || (match ? parseInt(match[1]) : 1);
  return {
    parsed,
    qty,
    total: o.total_price || parsed.itemPrice * qty,
    invoiceNum: `ONL-${o.id.toString().padStart(5, "0")}`,
  };
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
  `Halo, saya tanya pesanan: ${o.product_name} (#${invoiceNum})`;

export function isTreatmentOrder(product: OrderProduct | undefined, name: string) {
  return product?.type === TREATMENT_TYPE || /treatment|facial/i.test(name);
}
