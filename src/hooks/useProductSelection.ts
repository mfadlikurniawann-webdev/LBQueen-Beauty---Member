import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog";

export function useProductSelection(customer: unknown, { loginToAdd = false } = {}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [variant, setVariant] = useState<CatalogVariant | null>(null);
  const [qty, setQty] = useState(1);
  const [agreed, setAgreed] = useState(false);

  const open = (next: CatalogProduct) => {
    setProduct(next);
    setVariant(next.variants && next.variants.length > 0 ? next.variants[0] : null);
    setQty(1);
    setAgreed(false);
  };
  const close = () => setProduct(null);

  const add = () => {
    if (loginToAdd && !customer) {
      router.push("/login");
      return;
    }
    if (!product) return;
    addToCart(product, qty, variant);
    setProduct(null);
  };

  const buyNow = () => {
    if (!customer) {
      router.push("/login");
      return;
    }
    if (!product) return;
    addToCart(product, qty, variant);
    setProduct(null);
    router.push("/cart");
  };

  return { product, variant, setVariant, qty, setQty, agreed, setAgreed, open, close, add, buyNow };
}

export type ProductSelection = ReturnType<typeof useProductSelection>;
