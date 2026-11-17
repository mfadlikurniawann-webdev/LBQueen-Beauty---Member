"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Loader2, Clock, CheckCircle2, Package, MessageCircle, Wallet, XCircle, ChevronLeft, ChevronRight, Star, Scissors } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/Toast";
import { watchWhileVisible } from "@/lib/watch-visible";
import { PageControls } from "@/components/PageControls";

const WA_NUMBER = "6282176171448";
type Order = { 
  id: number; 
  product_name: string; 
  status: string; 
  ordered_at: string; 
  completed_at?: string; 
  customer_id: number;
  // Optional fields if they exist in DB
  price?: number;
  qty?: number;
  total_price?: number;
  product_id?: number;
};

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsMap, setProductsMap] = useState<Record<number, any>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, updateTab] = useState("semua");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const requestId = useRef(0);
  const setActiveTab = (value: string) => { setPage(1); updateTab(value); };

  // Review states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<Order | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const [submittingReview, setSubmittingReview] = useState(false);
  const submitReview = async () => {
    if (!selectedReviewOrder || submittingReview) return;
    setSubmittingReview(true);
    const { submitOrderReview } = await import("@/app/actions/reviews");
    const result = await submitOrderReview(selectedReviewOrder.id, reviewRating, reviewText);
    setSubmittingReview(false);
    if (result.error) { toast(result.error, "error"); return; }
    toast("Terima kasih! Ulasan Anda berhasil dikirim.", "success");
    setReviewModalOpen(false);
    setSelectedReviewOrder(null);
    setReviewText("");
    setReviewRating(5);
  };

  const fetchOrders = useCallback(async (custId: number) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setLoadError("");
    let query = supabase
      .from("customer_orders")
      .select("*")
      .eq("customer_id", custId)
      .order("ordered_at", { ascending: false }).order("id", { ascending: false })
      .range((page - 1) * 24, page * 24);
    const status = ({ menunggu: "pending", diproses: "processing", dp: "dp", selesai: "completed", batal: "cancelled" } as Record<string, string>)[activeTab];
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (currentRequest !== requestId.current) return;
    if (error) { setLoadError("Pesanan belum dapat dimuat. Coba muat ulang halaman."); setLoading(false); return; }
    const ordersData = (data || []).slice(0, 24);
    setHasMore((data?.length || 0) > 24);

    if (ordersData) {
      setOrders(ordersData);
      
      const productIds = Array.from(
        new Set(ordersData.map((o) => o.product_id).filter(Boolean))
      );

      if (productIds.length > 0) {
        const { data: productsData } = await supabase
          .from("products")
          .select("id, name, image_url, type, sub_category")
          .in("id", productIds);

        if (productsData) {
          if (currentRequest !== requestId.current) return;
          const map: Record<number, any> = {};
          productsData.forEach((p) => {
            map[p.id] = p;
          });
          setProductsMap(map);
        }
      }
    }
    setLoading(false);
  }, [page, activeTab]);

  useEffect(() => {
    const stored = localStorage.getItem("lbqueen_customer");
    if (stored) {
      const c = JSON.parse(stored);
      fetchOrders(c.id);

      return watchWhileVisible(() => fetchOrders(c.id), 60000);
    } else {
      router.push("/login");
    }
  }, [fetchOrders, router, toast]);

  const filtered = orders.filter(o =>
    activeTab === "semua" ||
    (activeTab === "menunggu" && o.status === "pending") ||
    (activeTab === "diproses" && o.status === "processing") ||
    (activeTab === "dp" && o.status === "dp") ||
    (activeTab === "selesai" && o.status === "completed") ||
    (activeTab === "batal" && o.status === "cancelled")
  );

  const getStatus = (s: string) => {
    if (s === "pending")    return { label: "Menunggu",   icon: Clock,        cls: "bg-amber-50 text-amber-700 border-amber-200" };
    if (s === "processing") return { label: "Diproses",   icon: Package,      cls: "bg-sky-50 text-sky-700 border-sky-200" };
    if (s === "dp")         return { label: "Sudah DP",   icon: Wallet,       cls: "bg-violet-50 text-violet-700 border-violet-200" };
    if (s === "cancelled")  return { label: "Dibatalkan", icon: XCircle,      cls: "bg-rose-50 text-rose-700 border-rose-200" };
    return                         { label: "Selesai",    icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  const TABS = [
    { id: "semua",    label: "Semua" },
    { id: "menunggu", label: "Menunggu" },
    { id: "diproses", label: "Diproses" },
    { id: "dp",       label: "Sudah DP" },
    { id: "selesai",  label: "Selesai" },
    { id: "batal",    label: "Batal" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen bg-[#FDFBFB]">
      <div className="relative overflow-hidden px-5 sm:px-8 pt-10 pb-12 rounded-b-[40px] shadow-lg shadow-rose-100/30"
        style={{ background: 'linear-gradient(160deg,#C94F78 0%,#9B3055 55%,#7A2240 100%)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -ml-32 -mt-32"></div>

        <div className="relative z-10 flex items-center gap-4">
          <button type="button" aria-label="Kembali" onClick={() => router.back()}
            className="w-11 h-11 shrink-0 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/25 hover:bg-white/25 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold! text-white tracking-tight leading-tight">Pesanan Saya</h1>
            <p className="text-white/85 text-[13px] font-medium mt-0.5">Riwayat dan status pesanan</p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pt-5 pb-4">
        <div className="flex gap-2 mb-5 -mx-4 px-4 md:mx-0 md:px-0 pb-1 overflow-x-auto no-scrollbar" aria-label="Filter status pesanan">
          {TABS.map(t => {
            const active = activeTab === t.id;
            return (
              <button key={t.id} type="button" aria-pressed={active} onClick={() => setActiveTab(t.id)}
                className={`h-10 px-4 rounded-2xl text-[13px] whitespace-nowrap transition-all shrink-0 border ${active
                  ? "font-bold text-white border-transparent shadow-[0_6px_16px_rgba(201,79,120,0.25)]"
                  : "font-semibold bg-white text-[#766B68] border-[#EEDFE3] hover:text-[#A83960] hover:border-[#E3C3CE]"}`}
                style={active ? { background: 'linear-gradient(135deg,#C94F78,#9B3055)' } : undefined}>
                {t.label}
              </button>
            );
          })}
        </div>

        {loadError && (
          <p role="alert" className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-[13px] font-medium text-rose-700 text-center">{loadError}</p>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3" role="status">
            <Loader2 className="w-8 h-8 animate-spin text-[#C94F78]" />
            <p className="text-[13px] font-medium text-[#766B68]">Memuat pesanan...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 px-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 bg-[#FDF2F5] border border-[#F6DDE6]">
              <ShoppingBag className="w-8 h-8 text-[#C94F78]" aria-hidden="true" />
            </div>
            <h2 className="text-[18px] font-bold! text-[#2D2926] tracking-tight">Belum Ada Pesanan</h2>
            <p className="text-[14px] text-[#766B68] leading-relaxed mt-1.5 max-w-[280px]">Pesanan yang Anda buat akan tampil di sini beserta statusnya.</p>
            <Link href="/" className="mt-6 h-12 px-6 rounded-2xl text-white text-[14px] font-bold flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)', boxShadow: '0 10px 24px rgba(201,79,120,0.25)' }}>
              Eksplor Katalog
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filtered.map(o => {
              const s = getStatus(o.status);
              const Icon = s.icon;

              const parsed = parseProductName(o.product_name);
              const match = o.product_name.match(/\(x(\d+)\)$/);
              const qty = o.qty || (match ? parseInt(match[1]) : 1);
              const invoiceNum = `ONL-${o.id.toString().padStart(5, '0')}`;
              const product = o.product_id ? productsMap[o.product_id] : undefined;
              const totalVal = o.total_price || (parsed.itemPrice * qty);

              return (
                <div key={o.id} className="bg-white rounded-[24px] p-5 border border-[#EEDFE3] transition-shadow hover:shadow-xl hover:shadow-rose-100/30"
                  style={{ boxShadow: '0 4px 18px rgba(201,79,120,0.06)' }}>

                  <div className="flex justify-between items-start gap-3 pb-4 border-b border-[#F4E8EC]">
                    <div className="min-w-0 space-y-1">
                      <p className="text-[11px] font-bold text-[#766B68] uppercase tracking-[0.1em]">No. Pesanan</p>
                      <p className="text-[14px] font-bold text-[#2D2926] tabular-nums">#{invoiceNum}</p>
                      <p className="flex items-center gap-1.5 text-[12px] text-[#766B68] font-medium">
                        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        {formatDate(o.ordered_at)}
                      </p>
                    </div>
                    <StatusBadge cls={s.cls} icon={Icon} label={s.label} />
                  </div>

                  <div className="flex gap-3.5 py-4">
                    <OrderThumb src={product?.image_url} alt={parsed.mainName} type={product?.type} size="md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold! text-[#2D2926] leading-snug line-clamp-2">{parsed.mainName}</h3>
                      {parsed.variantName && (
                        <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full inline-block bg-[#FDF2F5] text-[#A83960] mt-1 max-w-full truncate">
                          {parsed.variantName}
                        </span>
                      )}
                      <p className="text-[13px] text-[#766B68] font-medium mt-1">Kuantitas: {qty}x</p>
                    </div>
                  </div>

                  {o.status === 'completed' && o.completed_at && (
                    <div className="mb-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
                      <div className="w-8 h-8 shrink-0 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-emerald-800 font-bold uppercase tracking-[0.1em] leading-none mb-1">Pesanan Selesai</p>
                        <p className="text-[12px] text-emerald-700 font-medium">{formatDate(o.completed_at)}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#F4E8EC] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-baseline justify-between gap-3 sm:block">
                      <p className="text-[11px] font-bold text-[#766B68] uppercase tracking-[0.1em] sm:mb-1">Total Pembayaran</p>
                      <p className="text-[17px] font-bold text-[#A83960] tabular-nums">
                        {totalVal > 0 ? `Rp ${totalVal.toLocaleString("id-ID")}` : "TBD (Cek WA)"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <button type="button"
                        onClick={() => setSelectedOrder(o)}
                        className="h-11 px-4 rounded-2xl bg-white text-[#A83960] text-[13px] font-bold hover:bg-[#FDF2F5] transition-colors border border-[#F0CBD8] flex items-center justify-center gap-2">
                        Rincian
                      </button>
                      <button type="button"
                        onClick={() => window.location.href = `https://wa.me/${WA_NUMBER}?text=Halo, saya tanya pesanan: ${o.product_name} (#${invoiceNum})`}
                        className="h-11 px-4 rounded-2xl text-white text-[13px] font-bold shadow-lg shadow-rose-100 hover:brightness-105 transition-all flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)' }}>
                        <MessageCircle className="w-4 h-4" /> Chat
                      </button>
                    </div>
                  </div>

                  {o.status === "completed" && (
                    <div className="pt-3 mt-3">
                      <button type="button"
                        onClick={() => {
                           setSelectedReviewOrder(o);
                           setReviewModalOpen(true);
                        }}
                        className="w-full h-11 rounded-2xl bg-amber-50 text-amber-800 text-[13px] font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 border border-amber-200"
                      >
                        <Star className="w-4 h-4 text-amber-500" fill="currentColor" /> Beri Ulasan & Dapat Poin
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PageControls page={page} hasMore={hasMore} loading={loading} onChange={setPage} />

      {selectedOrder && (() => {
        const o = selectedOrder;
        const s = getStatus(o.status);
        const Icon = s.icon;
        const parsed = parseProductName(o.product_name);
        const match = o.product_name.match(/\(x(\d+)\)$/);
        const qty = o.qty || (match ? parseInt(match[1]) : 1);
        const totalVal = o.total_price || (parsed.itemPrice * qty);
        const product = o.product_id ? productsMap[o.product_id] : undefined;
        const invoiceNum = `ONL-${o.id.toString().padStart(5, '0')}`;

        return (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300">
            <div role="dialog" aria-modal="true" aria-labelledby="order-detail-title"
              className="bg-white w-full sm:max-w-[480px] max-h-[92vh] sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">

              <div className="px-5 py-4 border-b border-[#F4E8EC] flex items-center justify-between gap-3 shrink-0 bg-[#FDFAFB]">
                <div className="flex items-center gap-3 min-w-0">
                  <button type="button" aria-label="Tutup rincian"
                    onClick={() => setSelectedOrder(null)}
                    className="w-10 h-10 shrink-0 rounded-2xl bg-white shadow-sm border border-[#EEDFE3] flex items-center justify-center text-[#766B68] hover:text-[#A83960] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 id="order-detail-title" className="text-[17px] font-bold! text-[#2D2926] truncate">Rincian Pesanan</h3>
                </div>
                <StatusBadge cls={s.cls} icon={Icon} label={s.label} />
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">

                <div className="flex items-center gap-2.5 pb-4 border-b border-[#F4E8EC]">
                  <div className="w-8 h-8 rounded-xl bg-[#FDF2F5] border border-[#F6DDE6] flex items-center justify-center text-[#C94F78]">
                    <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-[13px] font-bold text-[#2D2926]">LBQueen Clinic & Beauty</span>
                </div>

                <div className="flex gap-4">
                  <OrderThumb src={product?.image_url} alt={parsed.mainName} type={product?.type} size="lg" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[15px] font-semibold! text-[#2D2926] leading-snug mb-1 line-clamp-2">{parsed.mainName}</h4>
                      {parsed.variantName && (
                        <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full inline-block bg-[#FDF2F5] text-[#A83960] max-w-full truncate">
                          {parsed.variantName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between gap-2 mt-2">
                      <span className="text-[13px] text-[#766B68] font-medium tabular-nums">x{qty}</span>
                      <span className="text-[14px] font-bold text-[#A83960] tabular-nums">
                        {parsed.itemPrice > 0 ? `Rp ${parsed.itemPrice.toLocaleString("id-ID")}` : "TBD"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAF7F5] rounded-2xl p-4 border border-[#EEDFE3] space-y-3">
                  <div className="flex justify-between gap-3 text-[13px]">
                    <span className="text-[#766B68] font-medium">Harga Satuan</span>
                    <span className="text-[#2D2926] font-semibold tabular-nums">
                      {parsed.itemPrice > 0 ? `Rp ${parsed.itemPrice.toLocaleString("id-ID")}` : "TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-[13px]">
                    <span className="text-[#766B68] font-medium">Jumlah Pesanan</span>
                    <span className="text-[#2D2926] font-semibold tabular-nums">{qty} produk</span>
                  </div>
                  <div className="h-px bg-[#EEDFE3]" />
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[14px] text-[#2D2926] font-bold">Total Pesanan</span>
                    <span className="text-[18px] font-bold text-[#A83960] tabular-nums">
                      {totalVal > 0 ? `Rp ${totalVal.toLocaleString("id-ID")}` : "TBD"}
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="text-[11px] font-bold! text-[#766B68] uppercase tracking-[0.1em] mb-2.5">Butuh Bantuan?</h5>
                  <button type="button"
                    onClick={() => window.location.href = `https://wa.me/${WA_NUMBER}?text=Halo, saya butuh bantuan terkait pesanan #${invoiceNum}`}
                    className="w-full h-14 rounded-2xl border border-[#EEDFE3] bg-white hover:bg-[#FDF2F5] hover:border-[#F0CBD8] transition-colors flex items-center justify-between px-4 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FDF2F5] flex items-center justify-center text-[#C94F78]">
                        <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <span className="text-[14px] font-bold text-[#2D2926] group-hover:text-[#A83960] transition-colors">Hubungi Penjual</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#766B68] group-hover:text-[#A83960] transition-colors" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#F4E8EC]">
                  <h5 className="text-[11px] font-bold! text-[#766B68] uppercase tracking-[0.1em] mb-1">Info Pesanan</h5>

                  <div className="flex justify-between items-center gap-3 text-[13px]">
                    <span className="text-[#766B68] font-medium">No. Pesanan</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[#2D2926] font-bold tabular-nums">#{invoiceNum}</span>
                      <button type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(invoiceNum);
                          toast("Nomor pesanan disalin!", "success");
                        }}
                        className="h-8 px-3 rounded-xl bg-[#FDF2F5] hover:bg-[#FBE7EE] border border-[#F0CBD8] text-[12px] font-bold text-[#A83960] transition-colors"
                      >
                        Salin
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between gap-3 text-[13px]">
                    <span className="text-[#766B68] font-medium">Metode Pembayaran</span>
                    <span className="text-[#2D2926] font-semibold text-right">Transfer Bank / QRIS</span>
                  </div>

                  <div className="flex justify-between gap-3 text-[13px]">
                    <span className="text-[#766B68] font-medium">Waktu Pemesanan</span>
                    <span className="text-[#2D2926] font-semibold text-right">{formatDate(o.ordered_at)}</span>
                  </div>

                  {o.completed_at && (
                    <div className="flex justify-between gap-3 text-[13px]">
                      <span className="text-[#766B68] font-medium">Waktu Pesanan Selesai</span>
                      <span className="text-[#2D2926] font-semibold text-right">{formatDate(o.completed_at)}</span>
                    </div>
                  )}
                </div>

              </div>

              <div className="px-5 pt-4 border-t border-[#F4E8EC] bg-white grid grid-cols-2 gap-3 shrink-0"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
                <button type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="h-12 rounded-2xl text-[14px] font-bold text-[#766B68] bg-white hover:bg-[#FAF7F5] transition-colors border border-[#E8D5DB]"
                >
                  Tutup
                </button>
                <button type="button"
                  onClick={() => window.location.href = `https://wa.me/${WA_NUMBER}?text=Halo, saya tanya pesanan: ${o.product_name} (#${invoiceNum})`}
                  className="h-12 rounded-2xl text-[14px] font-bold text-white shadow-lg shadow-rose-100 hover:brightness-105 transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)' }}
                >
                  <MessageCircle className="w-4 h-4" /> Chat Admin
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {reviewModalOpen && selectedReviewOrder && (() => {
        const parsed = parseProductName(selectedReviewOrder.product_name);
        return (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300">
            <div role="dialog" aria-modal="true" aria-labelledby="review-title"
              className="bg-white w-full sm:max-w-[400px] rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl flex flex-col items-center text-center animate-in slide-in-from-bottom duration-300"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-4 border border-amber-200">
                <Star className="w-8 h-8" fill="currentColor" aria-hidden="true" />
              </div>
              <h3 id="review-title" className="text-[18px] font-bold! text-[#2D2926] mb-1.5">Bagaimana pesanan Anda?</h3>
              <p className="text-[13px] text-[#766B68] mb-5 px-2 leading-relaxed">
                Berikan ulasan untuk pesanan <span className="font-bold text-[#A83960]">{parsed.mainName}</span> dan dapatkan poin tambahan!
              </p>

              <div className="flex gap-1.5 mb-5" role="group" aria-label="Penilaian">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`${star} bintang`}
                    aria-pressed={reviewRating >= star}
                    onClick={() => setReviewRating(star)}
                    className={`p-1 rounded-xl transition-transform hover:scale-110 active:scale-95 ${reviewRating >= star ? 'text-amber-400' : 'text-slate-300'}`}
                  >
                    <Star className="w-9 h-9" fill={reviewRating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>

              <label htmlFor="review-text" className="sr-only">Ulasan</label>
              <textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Ceritakan pengalaman Anda di sini (opsional)..."
                className="w-full h-24 p-3.5 mb-5 bg-[#FDFAFB] border border-[#E8D5DB] rounded-2xl text-[14px] text-[#2D2926] placeholder:text-[#8C8280] outline-none focus:bg-white focus:border-[#C94F78] focus:ring-4 focus:ring-[#C94F78]/10 resize-none transition-all"
              />

              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-[#766B68] bg-white hover:bg-[#FAF7F5] transition-colors border border-[#E8D5DB]"
                >
                  Nanti Saja
                </button>
                <button
                  type="button"
                  onClick={submitReview}
                  disabled={submittingReview}
                  className="flex-1 h-12 rounded-2xl text-[14px] font-bold text-white shadow-lg shadow-amber-100 hover:brightness-105 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 disabled:opacity-70 disabled:cursor-wait"
                >
                  {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                  Kirim Ulasan
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function StatusBadge({ cls, icon: Icon, label }: { cls: string; icon: React.ElementType; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full border text-[12px] font-semibold whitespace-nowrap ${cls}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden="true" /> {label}
    </span>
  );
}

function OrderThumb({ src, alt, type, size }: { src?: string | null; alt: string; type?: string; size: "md" | "lg" }) {
  const box = size === "lg" ? "w-20 h-20" : "w-[72px] h-[72px]";
  const isTreatment = type === "Treatment Care & Beauty" || /treatment|facial/i.test(alt);
  const Icon = isTreatment ? Scissors : Package;
  return (
    <div className={`${box} rounded-2xl border border-[#EEDFE3] overflow-hidden shrink-0 relative`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes="80px" className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F8DCE6] via-[#FBEFF3] to-[#FDFBFB]">
          <Icon className={size === "lg" ? "w-7 h-7 text-[#C94F78]" : "w-6 h-6 text-[#C94F78]"} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

function parseProductName(fullName: string) {
  let clean = fullName.replace(/\s*\(x\d+\)$/, "").trim();
  const priceMatch = clean.match(/Rp\s*([\d.]+)/);
  const itemPrice = priceMatch ? parseInt(priceMatch[1].replace(/\./g, "")) : 0;
  if (priceMatch) {
    clean = clean.replace(/\s*Rp\s*[\d.]+/, "").trim();
  }
  let mainName = clean;
  let variantName = "";
  const parenMatch = clean.match(/\(([^)]+)\)$/);
  if (parenMatch) {
    variantName = parenMatch[1];
    mainName = clean.replace(/\s*\([^)]+\)$/, "").trim();
  }
  return { mainName, variantName, itemPrice };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
