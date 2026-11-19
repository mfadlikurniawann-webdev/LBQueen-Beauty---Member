import type { Customer } from "@/lib/customer";

export type TierId = "regular" | "silver" | "gold" | "platinum";

export const TIERS: {
  id: TierId;
  label: string;
  card: string;
  stage: string;
  ink: string;
  chip: string;
}[] = [
  {
    id: "regular",
    label: "Reguler",
    card: "linear-gradient(150deg,#F7B6CB 0%,#D9648C 55%,#A83960 100%)",
    stage: "linear-gradient(180deg,#4A1428 0%,#7A2240 45%,#F3C4D4 85%,#F7F4F5 100%)",
    ink: "#FFFFFF",
    chip: "linear-gradient(135deg,#FFE1EB,#FBC8D9)",
  },
  {
    id: "silver",
    label: "Silver",
    card: "linear-gradient(150deg,#F1F4F8 0%,#B9C2CF 55%,#7E8A9C 100%)",
    stage: "linear-gradient(180deg,#1B2230 0%,#3B4659 45%,#D5DBE4 85%,#F7F4F5 100%)",
    ink: "#1F2937",
    chip: "linear-gradient(135deg,#EEF1F5,#D6DCE5)",
  },
  {
    id: "gold",
    label: "Gold",
    card: "linear-gradient(150deg,#FBE7A1 0%,#E2B53E 50%,#B8861A 100%)",
    stage: "linear-gradient(180deg,#1E1A12 0%,#5A4520 40%,#F4D47A 82%,#F7F4F5 100%)",
    ink: "#3D2B05",
    chip: "linear-gradient(135deg,#FCE9A8,#F3C94F)",
  },
  {
    id: "platinum",
    label: "Platinum",
    card: "linear-gradient(150deg,#8E86E8 0%,#5B4FC4 55%,#352A8A 100%)",
    stage: "linear-gradient(180deg,#120B2E 0%,#2C1F6B 45%,#C7C0F2 85%,#F7F4F5 100%)",
    ink: "#FFFFFF",
    chip: "linear-gradient(135deg,#E3E0FB,#C9C2F5)",
  },
];

export function tierOf(customer: Pick<Customer, "is_member" | "membership_type">) {
  const id = (customer.membership_type || "").trim().toLowerCase();
  const known = TIERS.find((t) => t.id === id);
  if (!customer.is_member) return { ...TIERS[0], name: TIERS[0].label };
  if (known && known.id !== "regular") return { ...known, name: known.label };
  const raw = customer.membership_type?.trim();
  return { ...TIERS[2], name: raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Member" };
}

export const MEMBER_BENEFITS = [
  { title: "Kumpulkan poin di tiap transaksi", desc: "Poin tercatat otomatis di akun Anda." },
  { title: "Promo & diskon khusus member", desc: "Potongan harga pilihan untuk member." },
  { title: "Akses katalog treatment eksklusif", desc: "Treatment pilihan dari tim LBQueen." },
  { title: "Riwayat perawatan tersimpan", desc: "Pantau pesanan dan treatment Anda." },
];

export const REGULAR_BENEFITS = [
  { title: "Voucher untuk semua akun", desc: "Pakai kode promo saat checkout." },
  { title: "Pesan treatment & produk online", desc: "Jadwalkan treatment dari aplikasi." },
  { title: "Riwayat pesanan tersimpan", desc: "Pantau status pesanan kapan saja." },
];
