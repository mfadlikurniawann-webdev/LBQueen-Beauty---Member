import { useState } from "react";
import useSWR from "swr";
import type { CartItem } from "@/context/CartContext";
import type { Customer } from "@/lib/customer";
import { formatRupiah } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import {
  customerTier,
  loadMyVouchers,
  membershipLabel,
  voucherAllowsTier,
  type MyVoucher,
} from "@/lib/vouchers";

export type Voucher = Pick<
  MyVoucher,
  "code" | "type" | "discount_amount" | "min_transaction" | "product_id" | "membership_types"
>;

const lineTotal = (item: CartItem) =>
  Math.max(0, item.price - (item.voucher_discount || 0)) * item.qty;

/** Potongan voucher, mengikuti aturan `create_online_order` di database. */
export function voucherDiscount(voucher: Voucher | null, cart: CartItem[], cartTotal: number) {
  if (!voucher) return 0;
  const amount = Number(voucher.discount_amount);
  const cut = (base: number) =>
    Math.min(
      base,
      voucher.type === "percent"
        ? Math.floor((base * amount) / 100)
        : voucher.type === "free_service"
          ? base
          : amount,
    );
  if (!voucher.product_id) return cut(cartTotal);
  // Voucher produk tanpa batasan membership sudah menjadi promo otomatis di harga.
  if (!voucher.membership_types?.length) return 0;
  return cut(
    cart.filter((i) => i.id === voucher.product_id).reduce((sum, i) => sum + lineTotal(i), 0),
  );
}

/** Pesan bila voucher belum bisa dipakai untuk keranjang/pelanggan ini, atau null bila bisa. */
export function voucherProblem(
  voucher: Voucher,
  cart: CartItem[],
  cartTotal: number,
  tier: string,
) {
  if (!voucherAllowsTier(voucher.membership_types, tier))
    return `Voucher ini khusus membership ${membershipLabel(voucher.membership_types)}`;
  if (cartTotal < Number(voucher.min_transaction))
    return `Min. belanja ${formatRupiah(Number(voucher.min_transaction))}`;
  if (voucher.product_id) {
    const productTotal = cart
      .filter((i) => i.id === voucher.product_id)
      .reduce((sum, i) => sum + lineTotal(i), 0);
    if (!productTotal) return "Voucher hanya berlaku untuk produk tertentu";
    if (!voucher.membership_types?.length && Number(voucher.min_transaction) > 0)
      return "Voucher ini hanya dapat dipakai di kasir klinik";
  }
  return null;
}

export function useCartVoucher(cart: CartItem[], cartTotal: number, customer: Customer | null) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<Voucher | null>(null);
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);
  const tier = customer ? customerTier(customer) : "regular";
  const mine = useSWR(customer ? ["my-vouchers", customer.id] : null, loadMyVouchers, {
    revalidateOnFocus: false,
  });

  const choose = (voucher: Voucher) => {
    const problem = voucherProblem(voucher, cart, cartTotal, tier);
    if (problem) {
      setError(problem);
      return false;
    }
    setApplied(voucher);
    setCode(voucher.code);
    setError("");
    return true;
  };

  const apply = async () => {
    const typed = code.trim().toUpperCase();
    if (!typed) return;
    setError("");
    const own = mine.data?.find((v) => v.code === typed);
    if (own) {
      choose(own);
      return;
    }
    setValidating(true);
    try {
      const { data, error } = await supabase
        .from("vouchers")
        .select("code,type,discount_amount,min_transaction,product_id,membership_types")
        .eq("code", typed)
        .eq("is_active", true)
        .single();
      if (error || !data) {
        setError("Voucher tidak valid atau tidak aktif");
        return;
      }
      choose(data as Voucher);
    } catch {
      setError("Gagal memeriksa voucher");
    } finally {
      setValidating(false);
    }
  };

  const remove = () => {
    setApplied(null);
    setCode("");
    setError("");
  };

  // Keranjang berubah: voucher yang tidak lagi memenuhi syarat tidak dihitung.
  const stillValid = applied ? !voucherProblem(applied, cart, cartTotal, tier) : false;
  const discount = stillValid ? voucherDiscount(applied, cart, cartTotal) : 0;

  return {
    code,
    setCode,
    applied: stillValid ? applied : null,
    error,
    setError,
    validating,
    apply,
    choose,
    remove,
    discount,
    myVouchers: mine.data ?? [],
    loadingMine: mine.isLoading,
    problemFor: (voucher: Voucher) => voucherProblem(voucher, cart, cartTotal, tier),
  };
}

export type CartVoucher = ReturnType<typeof useCartVoucher>;
