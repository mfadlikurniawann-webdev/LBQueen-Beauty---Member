"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, CircleHelp, Loader2, ShoppingBag, ShoppingCart } from "lucide-react";
import { PageControls } from "@/components/PageControls";
import { OrderCard } from "@/components/orders/OrderCard";
import dynamic from "next/dynamic";
import { OrderTabs } from "@/components/orders/OrderTabs";
import { TAB_STATUS, type Order, type OrderProduct } from "@/components/orders/order-utils";
import { useOrderReview } from "@/components/orders/useOrderReview";
import { PageHero } from "@/components/portal/PageHero";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { IconChip } from "@/components/IconChip";
import { waLink } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { watchWhileVisible } from "@/lib/watch-visible";
import { cn } from "@/lib/utils";

const OrderDetailModal = dynamic(
  () => import("@/components/orders/OrderDetailModal").then((m) => m.OrderDetailModal),
  { ssr: false },
);
const ReviewModal = dynamic(
  () => import("@/components/orders/ReviewModal").then((m) => m.ReviewModal),
  { ssr: false },
);

export default function OrdersPage() {
  const { customer } = useCustomer();
  const { totalItems } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsMap, setProductsMap] = useState<Record<number, OrderProduct>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, updateTab] = useState("semua");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const requestId = useRef(0);
  const setActiveTab = (value: string) => {
    setPage(1);
    updateTab(value);
  };
  const review = useOrderReview();

  const fetchOrders = useCallback(
    async (custId: number) => {
      const currentRequest = ++requestId.current;
      setLoading(true);
      setLoadError("");
      let query = supabase
        .from("customer_orders")
        .select("id,product_name,status,ordered_at,completed_at,customer_id,price,qty,total_price,product_id")
        .eq("customer_id", custId)
        .order("ordered_at", { ascending: false })
        .order("id", { ascending: false })
        .range((page - 1) * 24, page * 24);
      const status = TAB_STATUS[activeTab];
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      if (currentRequest !== requestId.current) return;
      if (error) {
        setLoadError("Pesanan belum dapat dimuat. Coba muat ulang halaman.");
        setLoading(false);
        return;
      }
      const ordersData = (data || []).slice(0, 24);
      setHasMore((data?.length || 0) > 24);

      if (ordersData) {
        setOrders(ordersData);

        const productIds = Array.from(new Set(ordersData.map((o) => o.product_id).filter(Boolean)));

        if (productIds.length > 0) {
          const { data: productsData } = await supabase
            .from("products")
            .select("id, name, image_url, type, sub_category")
            .in("id", productIds);

          if (productsData) {
            if (currentRequest !== requestId.current) return;
            const map: Record<number, OrderProduct> = {};
            productsData.forEach((p) => {
              map[p.id] = p;
            });
            setProductsMap(map);
          }
        }
      }
      setLoading(false);
    },
    [page, activeTab],
  );

  useEffect(() => {
    if (!customer) return;
    const refresh = () => {
      void fetchOrders(customer.id);
    };
    const initial = window.setTimeout(refresh, 0);
    const stop = watchWhileVisible(refresh, 60000);
    return () => {
      window.clearTimeout(initial);
      stop();
    };
  }, [customer, fetchOrders]);

  const filtered = orders.filter(
    (o) => activeTab === "semua" || o.status === TAB_STATUS[activeTab],
  );
  const productOf = (o: Order) => (o.product_id ? productsMap[o.product_id] : undefined);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen bg-[#FDFBFB]">
      <PageHero
        title="Pesanan"
        subtitle="Riwayat dan status pesanan"
        actions={
          <a
            href={waLink("Halo admin LBQueen, saya butuh bantuan terkait pesanan.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Bantuan pesanan"
            className="w-11 h-11 rounded-full bg-[#2D2926] text-white flex items-center justify-center"
          >
            <CircleHelp className="w-5 h-5" aria-hidden="true" />
          </a>
        }
      />

      <div className="px-4 sm:px-8 pb-4 max-w-3xl mx-auto">
        <OrderTabs active={activeTab} onChange={setActiveTab} />

        <Link
          href="/cart"
          className="mb-4 flex items-center gap-3 rounded-[18px] border border-[#E6D3DA] bg-white px-4 h-14"
        >
          <IconChip icon={ShoppingCart} tone="berry" size="sm" bare />
          <span className="flex-1 text-[15px] text-[#3F3734]">Keranjang belanja</span>
          {totalItems > 0 && (
            <span className="rounded-full bg-[#C94F78] px-2.5 py-0.5 text-[12px] font-bold text-white tabular-nums">
              {totalItems} item
            </span>
          )}
          <ChevronRight className="w-5 h-5 text-[#5F5552]" aria-hidden="true" />
        </Link>

        {loadError && (
          <p
            role="alert"
            className={cn(
              "mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-[13px] font-medium",
              "text-rose-700 text-center",
            )}
          >
            {loadError}
          </p>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3" role="status">
            <Loader2 className="w-8 h-8 animate-spin text-[#C94F78]" />
            <p className="text-[13px] font-medium text-[#766B68]">Memuat pesanan...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 px-6 flex flex-col items-center text-center">
            <div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mb-5 bg-[#FDF2F5] border",
                "border-[#F6DDE6]",
              )}
            >
              <ShoppingBag className="w-8 h-8 text-[#C94F78]" aria-hidden="true" />
            </div>
            <h2 className="text-[18px] font-bold! text-[#2D2926] tracking-tight">
              Belum Ada Pesanan
            </h2>
            <p className="text-[14px] text-[#766B68] leading-relaxed mt-1.5 max-w-[280px]">
              Pesanan Anda akan tampil di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                product={productOf(o)}
                onDetail={() => setSelectedOrder(o)}
                onReview={() => review.start(o)}
              />
            ))}
          </div>
        )}
        <div className="mt-4">
          <PageControls page={page} hasMore={hasMore} loading={loading} onChange={setPage} />
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          product={productOf(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      <ReviewModal review={review} />
    </div>
  );
}
