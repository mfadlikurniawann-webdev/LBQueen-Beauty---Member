export type MyVoucher = {
  id: number;
  code: string;
  name: string;
  type: string;
  discount_amount: number;
  min_transaction: number;
  product_id: number | null;
  membership_types: string[] | null;
  products?: { name: string } | null;
};

export const TIER_LABELS: Record<string, string> = {
  regular: "Regular",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

/** Sama dengan `voucher_allows_tier` di database: bukan member = regular. */
export function customerTier(customer: {
  is_member?: boolean | null;
  membership_type?: string | null;
}) {
  if (!customer.is_member) return "regular";
  return (customer.membership_type || "").trim().toLowerCase() || "regular";
}

export function voucherAllowsTier(types: string[] | null | undefined, tier: string) {
  return !types?.length || types.includes(tier);
}

export function membershipLabel(types: string[] | null | undefined) {
  if (!types?.length) return null;
  return types.map((t) => TIER_LABELS[t] || t).join(", ");
}

export async function loadMyVouchers() {
  const response = await fetch("/api/vouchers", { cache: "no-store" });
  if (response.status === 401) return [] as MyVoucher[];
  if (!response.ok) throw new Error("Voucher belum dapat dimuat.");
  const data = (await response.json()) as { vouchers: MyVoucher[] };
  return data.vouchers;
}
