import { useState } from "react";
import type { CartItem } from "@/context/CartContext";
import { formatRupiah } from "@/lib/format";
import { supabase } from "@/lib/supabase";

export type Voucher = {
  code: string;
  type: string;
  discount_amount: number;
  min_transaction: number;
  product_id: number | null;
};

export function useCartVoucher(cart: CartItem[], cartTotal: number) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<Voucher | null>(null);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [validating, setValidating] = useState(false);

  const apply = async () => {
    if (!code.trim()) return;
    setError("");
    setValidating(true);
    try {
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("code", code.trim().toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        setError("Voucher tidak valid atau tidak aktif");
        return;
      }

      if (cartTotal < data.min_transaction) {
        setError(`Min. belanja ${formatRupiah(data.min_transaction)}`);
        return;
      }

      if (data.product_id) {
        const hasProduct = cart.some((item) => item.id === data.product_id);
        if (!hasProduct) {
          setError("Voucher hanya berlaku untuk produk tertentu");
          return;
        }
      }

      setApplied(data);
      setFormOpen(false);
      setError("");
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

  const discount = applied
    ? applied.product_id
      ? 0
      : applied.type === "percent"
        ? Math.floor((cartTotal * applied.discount_amount) / 100)
        : applied.discount_amount
    : 0;

  return {
    code,
    setCode,
    applied,
    error,
    setError,
    formOpen,
    setFormOpen,
    validating,
    apply,
    remove,
    discount,
  };
}

export type CartVoucher = ReturnType<typeof useCartVoucher>;
