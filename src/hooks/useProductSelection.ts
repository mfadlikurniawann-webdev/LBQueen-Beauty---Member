import { useState } from "react";
import { flyToCart, prefersReducedMotion } from "@/lib/motion";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog";
import { TREATMENT_TYPE } from "@/lib/constants";

const tracksStock = (product: CatalogProduct) => product.type !== TREATMENT_TYPE;

export function useProductSelection(customer: unknown, { loginToAdd = false } = {}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [variant, setVariantState] = useState<CatalogVariant | null>(null);
  const [qty, setQty] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [needVariant, setNeedVariant] = useState(false);

  const open = (next: CatalogProduct) => {
    const available = (next.variants || []).filter((v) => !tracksStock(next) || v.stock > 0);
    setProduct(next);
    // Seperti marketplace: pembeli memilih variasi sendiri, kecuali hanya ada satu pilihan.
    setVariantState(next.variants?.length === 1 && available.length === 1 ? available[0] : null);
    setQty(1);
    setAgreed(false);
    setNeedVariant(false);
    setClosing(false);
  };
  const [closing, setClosing] = useState(false);
  // Tutup dengan animasi keluar (lihat ProductDetailSheet) sebelum sheet dilepas dari DOM.
  const close = (after?: () => void) => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(
      () => {
        setProduct(null);
        setClosing(false);
        after?.();
      },
      prefersReducedMotion() ? 0 : 200,
    );
  };

  const setVariant = (next: CatalogVariant | null) => {
    setVariantState(next);
    setNeedVariant(false);
    if (next && product && tracksStock(product))
      setQty((q) => Math.max(1, Math.min(q, next.stock)));
  };

  const ready = () => {
    if (!product) return false;
    if (product.variants?.length && !variant) {
      setNeedVariant(true);
      return false;
    }
    return true;
  };

  const add = () => {
    if (loginToAdd && !customer) {
      router.push("/login");
      return;
    }
    if (!product || !ready()) return;
    flyToCart(document.querySelector<HTMLElement>("[data-fly-source]"));
    addToCart(product, qty, variant);
    close();
  };

  const buyNow = () => {
    if (!customer) {
      router.push("/login");
      return;
    }
    if (!product || !ready()) return;
    addToCart(product, qty, variant);
    close(() => router.push("/cart"));
  };

  return {
    product,
    variant,
    setVariant,
    qty,
    setQty,
    agreed,
    setAgreed,
    needVariant,
    closing,
    open,
    close,
    add,
    buyNow,
  };
}

export type ProductSelection = ReturnType<typeof useProductSelection>;
