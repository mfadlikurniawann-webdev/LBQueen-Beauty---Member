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
    card: "linear-gradient(150deg,#F6B3C9 0%,#DE7397 50%,#B84471 100%)",
    stage: "#FFE3EE",
    ink: "#FFFFFF",
    chip: "linear-gradient(135deg,#FFEAF1,#FBD3E1)",
  },
  {
    id: "silver",
    label: "Silver",
    card: "linear-gradient(150deg,#F7F3F5 0%,#D6CCD1 50%,#A3959C 100%)",
    stage: "#F1ECEF",
    ink: "#3F3438",
    chip: "linear-gradient(135deg,#F5F1F3,#E2DADE)",
  },
  {
    id: "gold",
    label: "Gold",
    card: "linear-gradient(150deg,#FBE7A6 0%,#E2BE5E 50%,#B8861A 100%)",
    stage: "#FBF2DC",
    ink: "#3D2B05",
    chip: "linear-gradient(135deg,#FCEFC8,#F4D98A)",
  },
  {
    id: "platinum",
    label: "Platinum",
    card: "linear-gradient(150deg,#C9789E 0%,#8E2F57 55%,#5A1834 100%)",
    stage: "#F4E3EB",
    ink: "#FFFFFF",
    chip: "linear-gradient(135deg,#F6E4EC,#E9C6D6)",
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
  { title: "Poin di setiap transaksi" },
  { title: "Voucher khusus member" },
  { title: "Treatment eksklusif" },
  { title: "Riwayat perawatan tersimpan" },
];

export const REGULAR_BENEFITS = [
  { title: "Voucher sesuai membership" },
  { title: "Pesan treatment & produk online" },
  { title: "Riwayat pesanan tersimpan" },
];
