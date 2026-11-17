"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Loader2, Clock, CheckCircle2, Package, MessageCircle, Wallet, XCircle, ChevronLeft, ChevronRight, Star } from "lucide-react";
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
    if (s === "pending")    return { label: "Menunggu",  icon: Clock,         color: '#D97706', bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.18)' };
    if (s === "processing") return { label: "Diproses",  icon: Package,       color: '#2563EB', bg: 'rgba(37,99,235,0.07)',    border: 'rgba(37,99,235,0.15)' };
    if (s === "dp")         return { label: "Sudah DP",  icon: Wallet,        color: '#9333EA', bg: 'rgba(147,51,234,0.07)',   border: 'rgba(147,51,234,0.15)' };
    if (s === "cancelled")  return { label: "Dibatalkan",icon: XCircle,       color: '#DC2626', bg: 'rgba(220,38,38,0.07)',    border: 'rgba(220,38,38,0.15)' };
    return                         { label: "Selesai",   icon: CheckCircle2,  color: '#059669', bg: 'rgba(5,150,105,0.07)',    border: 'rgba(5,150,105,0.15)' };
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
      {/* Gradient header */}
      <div className="relative overflow-hidden px-6 pt-10 pb-12 rounded-b-[48px] shadow-lg shadow-rose-100/20" 
        style={{ background: 'linear-gradient(160deg,#C94F78 0%,#9B3055 55%,#7A2240 100%)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -ml-32 -mt-32"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-[22px] font-bold text-white tracking-tight">Pesanan Saya</h1>
            <p className="text-white/60 text-[11px] font-medium">Riwayat dan status pesanan</p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pt-5 pb-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="px-4 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all"
              style={activeTab === t.id
                ? { background: 'linear-gradient(135deg,#C94F78,#9B3055)', color: 'white', boxShadow: '0 6px 16px rgba(201,79,120,0.25)' }
                : { background: 'white', color: 'rgba(45,41,38,0.30)', border: '1px solid rgba(201,79,120,0.08)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C94F78' }} />
            <p className="text-[11px] text-[#2D2926]/20 uppercase tracking-widest">Memuat...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(201,79,120,0.07)' }}>
              <ShoppingBag className="w-7 h-7 text-[#C94F78]/30" />
            </div>
            <p className="text-[14px] font-medium text-[#2D2926]">Belum Ada Pesanan</p>
            <Link href="/" className="mt-2 h-10 px-6 rounded-xl text-white text-[12px] font-medium flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)' }}>
              Eksplor Katalog
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => {
              const s = getStatus(o.status);
              const Icon = s.icon;
              
              const parsed = parseProductName(o.product_name);
              const match = o.product_name.match(/\(x(\d+)\)$/);
              const qty = o.qty || (match ? parseInt(match[1]) : 1);
              const invoiceNum = `ONL-${o.id.toString().padStart(5, '0')}`;
              const prodImage = o.product_id ? productsMap[o.product_id]?.image_url : undefined;
              
              return (
                <div key={o.id} className="bg-white rounded-[24px] p-6 border border-[#f0eded] relative overflow-hidden group transition-all hover:shadow-xl hover:shadow-rose-100/20"
                  style={{ boxShadow: '0 4px 20px rgba(201,79,120,0.03)' }}>
                  
                  {/* Status & Invoice Header */}
                  <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No. Pesanan</span>
                        <span className="text-[11px] font-bold text-[#2D2926]">#{invoiceNum}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {formatDate(o.ordered_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-tight"
                      style={{ color: s.color, background: s.bg, borderColor: s.border }}>
                      <Icon className="w-3 h-3" /> {s.label}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#faf9f9] border border-[#f0eded] overflow-hidden shrink-0 relative flex items-center justify-center shadow-inner">
                      {prodImage ? (
                        <Image src={prodImage} alt={parsed.mainName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-3 opacity-20">
                          <Image src="/lbqueen_logo.png" alt="LB" width={40} height={40} className="object-contain" style={{ width:'auto', height:'auto' }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-bold text-[#2D2926] leading-snug mb-1 line-clamp-2">{parsed.mainName}</h3>
                      {parsed.variantName && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block bg-[#FDF2F5] text-[#C94F78] mb-1">
                          {parsed.variantName}
                        </span>
                      )}
                      <p className="text-[11px] text-slate-400 font-medium">Kuantitas: {qty}x</p>
                    </div>
                  </div>

                  {/* Status specific info */}
                  {o.status === 'completed' && o.completed_at && (
                    <div className="mb-6 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest leading-none mb-1">Pesanan Selesai</p>
                        <p className="text-[11px] text-emerald-600 font-medium">{formatDate(o.completed_at)}</p>
                      </div>
                    </div>
                  )}

                  {/* Pricing & Footer */}
                  <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
                      <p className="text-[16px] font-bold text-[#C94F78]">
                        {(() => {
                          const totalVal = o.total_price || (parsed.itemPrice * qty);
                          return totalVal > 0 ? `Rp ${totalVal.toLocaleString("id-ID")}` : "TBD (Cek WA)";
                        })()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                       <button
                        onClick={() => setSelectedOrder(o)}
                        className="h-10 px-4 rounded-xl bg-slate-50 text-slate-500 text-[11px] font-bold hover:bg-slate-100 transition-all border border-slate-100 flex items-center gap-2">
                        Rincian
                      </button>
                      <button
                        onClick={() => window.location.href = `https://wa.me/${WA_NUMBER}?text=Halo, saya tanya pesanan: ${o.product_name} (#${invoiceNum})`}
                        className="h-10 px-4 rounded-xl bg-[#C94F78] text-white text-[11px] font-bold shadow-lg shadow-rose-100 hover:scale-105 transition-all flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" /> Chat
                      </button>
                    </div>
                  </div>
                  
                  {o.status === "completed" && (
                    <div className="pt-4 mt-4 border-t border-slate-50">
                      <button 
                        onClick={() => {
                           setSelectedReviewOrder(o);
                           setReviewModalOpen(true);
                        }}
                        className="w-full h-10 rounded-xl bg-amber-50 text-amber-600 text-[11px] font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 border border-amber-100"
                      >
                        <Star className="w-4 h-4" fill="currentColor" /> Beri Ulasan & Dapat Poin
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {loadError && <p role="alert" className="p-5 text-center">{loadError}</p>}
      <PageControls page={page} hasMore={hasMore} loading={loading} onChange={setPage} />
      {/* Rincian Pesanan Modal */}
      {selectedOrder && (() => {
        const o = selectedOrder;
        const s = getStatus(o.status);
        const Icon = s.icon;
        const parsed = parseProductName(o.product_name);
        const match = o.product_name.match(/\(x(\d+)\)$/);
        const qty = o.qty || (match ? parseInt(match[1]) : 1);
        const totalVal = o.total_price || (parsed.itemPrice * qty);
        const prodImage = o.product_id ? productsMap[o.product_id]?.image_url : undefined;
        const invoiceNum = `ONL-${o.id.toString().padStart(5, '0')}`;
        
        return (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full sm:max-w-[480px] max-h-[92vh] sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/55">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedOrder(null)} 
                    className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-[16px] font-bold text-[#2D2926]">Rincian Pesanan</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-tight"
                  style={{ color: s.color, background: s.bg, borderColor: s.border }}>
                  <Icon className="w-3 h-3" /> {s.label}
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Shop Information */}
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-[#C94F78]">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[12px] font-bold text-[#2D2926]">LBQueen Clinic & Beauty</span>
                </div>

                {/* Product Info */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#faf9f9] border border-[#f0eded] overflow-hidden shrink-0 relative flex items-center justify-center shadow-inner">
                    {prodImage ? (
                      <Image src={prodImage} alt={parsed.mainName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4 opacity-20">
                        <Image src="/lbqueen_logo.png" alt="LB" width={48} height={48} className="object-contain" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[14px] font-bold text-[#2D2926] leading-snug mb-1 line-clamp-2">{parsed.mainName}</h4>
                      {parsed.variantName && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block bg-[#FDF2F5] text-[#C94F78]">
                          {parsed.variantName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-[11px] text-slate-400 font-medium">x{qty}</span>
                      <span className="text-[13px] font-bold text-[#C94F78]">
                        {parsed.itemPrice > 0 ? `Rp ${parsed.itemPrice.toLocaleString("id-ID")}` : "TBD"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 space-y-3">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-slate-400 font-medium">Harga Satuan</span>
                    <span className="text-[#2D2926] font-bold">
                      {parsed.itemPrice > 0 ? `Rp ${parsed.itemPrice.toLocaleString("id-ID")}` : "TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-slate-400 font-medium">Jumlah Pesanan</span>
                    <span className="text-[#2D2926] font-bold">{qty} produk</span>
                  </div>
                  <div className="h-px bg-slate-100 my-2" />
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-[#2D2926] font-bold">Total Pesanan</span>
                    <span className="text-[15px] font-extrabold text-[#C94F78]">
                      {totalVal > 0 ? `Rp ${totalVal.toLocaleString("id-ID")}` : "TBD"}
                    </span>
                  </div>
                </div>

                {/* Need Help Section */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Butuh Bantuan?</h5>
                  
                  <button 
                    onClick={() => window.location.href = `https://wa.me/${WA_NUMBER}?text=Halo, saya butuh bantuan terkait pesanan #${invoiceNum}`}
                    className="w-full h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between px-4 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#C94F78] group-hover:bg-[#C94F78]/5 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-[12px] font-bold text-[#2D2926] group-hover:text-[#C94F78] transition-colors">Hubungi Penjual</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#C94F78] transition-colors" />
                  </button>
                </div>

                {/* Order Details / Info */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Info Pesanan</h5>
                  
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-slate-400 font-medium">No. Pesanan</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#2D2926] font-bold">#{invoiceNum}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(invoiceNum);
                          toast("Nomor pesanan disalin!", "success");
                        }}
                        className="px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-100 text-[10px] font-bold text-[#C94F78] transition-all"
                      >
                        Salin
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between text-[12px]">
                    <span className="text-slate-400 font-medium">Metode Pembayaran</span>
                    <span className="text-[#2D2926] font-bold">Transfer Bank / QRIS</span>
                  </div>

                  <div className="flex justify-between text-[12px]">
                    <span className="text-slate-400 font-medium">Waktu Pemesanan</span>
                    <span className="text-[#2D2926] font-semibold">{formatDate(o.ordered_at)}</span>
                  </div>

                  {o.completed_at && (
                    <div className="flex justify-between text-[12px]">
                      <span className="text-slate-400 font-medium">Waktu Pesanan Selesai</span>
                      <span className="text-[#2D2926] font-semibold">{formatDate(o.completed_at)}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer Buttons */}
              <div className="p-5 pb-8 border-t border-slate-100 bg-white grid grid-cols-2 gap-3 shrink-0">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="h-12 rounded-xl text-[12px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                >
                  Tutup
                </button>
                <button 
                  onClick={() => window.location.href = `https://wa.me/${WA_NUMBER}?text=Halo, saya tanya pesanan: ${o.product_name} (#${invoiceNum})`}
                  className="h-12 rounded-xl text-[12px] font-bold text-white shadow-lg shadow-rose-100 hover:scale-105 transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)' }}
                >
                  <MessageCircle className="w-4 h-4" /> Chat Admin
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Review Modal */}
      {reviewModalOpen && selectedReviewOrder && (() => {
        const parsed = parseProductName(selectedReviewOrder.product_name);
        return (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full sm:max-w-[400px] rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl flex flex-col items-center text-center animate-in slide-in-from-bottom duration-300">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-4 border border-amber-100">
                <Star className="w-8 h-8" fill="currentColor" />
              </div>
              <h3 className="text-[18px] font-bold text-[#2D2926] mb-1">Bagaimana pesanan Anda?</h3>
              <p className="text-[12px] text-slate-500 mb-6 px-4 leading-relaxed">
                Berikan ulasan untuk pesanan <span className="font-bold text-[#C94F78]">{parsed.mainName}</span> dan dapatkan poin tambahan!
              </p>
              
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`p-1 transition-transform hover:scale-110 active:scale-95 ${reviewRating >= star ? 'text-amber-400' : 'text-slate-200'}`}
                  >
                    <Star className="w-10 h-10" fill={reviewRating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>

              <textarea 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Ceritakan pengalaman Anda di sini (opsional)..."
                className="w-full h-24 p-3 mb-6 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] outline-none focus:border-[#C94F78] resize-none"
              />

              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 h-12 rounded-xl text-[12px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                >
                  Nanti Saja
                </button>
                <button 
                  onClick={submitReview}
                  disabled={submittingReview}
                  className="flex-1 h-12 rounded-xl text-[12px] font-bold text-white shadow-lg shadow-amber-100 hover:scale-105 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500"
                >
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
