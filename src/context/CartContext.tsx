"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { productDiscount } from "@/lib/promotions";

export type CartItem = {
  id: number;
  variant_id?: number;
  variant_name?: string;
  name: string;
  price: number;
  qty: number;
  image_url: string | null;
  is_consultation: boolean;
  voucher_discount: number;
  is_set: boolean;
  type?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any, qty: number, variant?: any) => void;
  removeFromCart: (id: number, variant_id?: number) => void;
  updateQty: (id: number, qty: number, variant_id?: number) => void;
  clearCart: () => void;
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lbqueen_cart");
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) setCart(parsed.filter(item => item && Number.isInteger(item.id) && typeof item.price === "number" && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= 10));
    } catch { localStorage.removeItem("lbqueen_cart"); }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("lbqueen_cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  const addToCart = (product: any, qty: number, variant?: any) => {
    setCart(prev => {
      const variant_id = variant?.id;
      const existing = prev.find(i => i.id === product.id && i.variant_id === variant_id);
      if (existing) {
        const newQty = Math.min(10, existing.qty + qty);
        return prev.map(i => (i.id === product.id && i.variant_id === variant_id) ? { ...i, qty: newQty } : i);
      }
      return [...prev, {
        id: product.id,
        variant_id: variant_id,
        variant_name: variant?.variant_name,
        name: product.name,
        price: variant ? variant.price : product.selling_price,
        qty: Math.min(10, qty),
        image_url: product.image_url,
        is_consultation: false,
        voucher_discount: product.promotions ? productDiscount(variant ? variant.price : product.selling_price, product.promotions) : product.voucher_discount || 0,
        is_set: product.is_set || false,
        type: product.type
      }];
    });
  };

  const removeFromCart = (id: number, variant_id?: number) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.variant_id === variant_id)));
  };

  const updateQty = (id: number, qty: number, variant_id?: number) => {
    const cappedQty = Math.max(1, Math.min(10, qty));
    setCart(prev => prev.map(i => (i.id === id && i.variant_id === variant_id) ? { ...i, qty: cappedQty, is_consultation: false } : i));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
