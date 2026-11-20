import { BadgePercent, Scissors, ShoppingBag } from "lucide-react";

export const SECTIONS = {
  promo: {
    category: "promo",
    title: "Promo Spesial",
    icon: BadgePercent,
    tabs: ["semua", "set"],
  },
  layanan: {
    category: "Treatment Care & Beauty",
    title: "Layanan",
    icon: Scissors,
    tabs: ["semua", "promo", "set"],
  },
  produk: {
    category: "Product Care & Beauty",
    title: "Produk",
    icon: ShoppingBag,
    tabs: ["semua", "promo", "set"],
  },
} as const;

export type SectionSlug = keyof typeof SECTIONS;
export type Section = (typeof SECTIONS)[SectionSlug];
export type CatalogTab = "semua" | "promo" | "set";

export const LEGACY_SECTIONS: Record<string, SectionSlug> = {
  "Treatment Care & Beauty": "layanan",
  "Product Care & Beauty": "produk",
};
export const TAB_LABEL: Record<string, string> = { semua: "Semua", promo: "Promo", set: "Paket" };
