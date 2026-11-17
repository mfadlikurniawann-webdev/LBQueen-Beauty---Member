"use client";

import { useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, Plus, Minus, X, ArrowRight, Star, Gem, Loader2, Scissors, AlertTriangle, ShoppingCart, Heart, Grip, BadgePercent, ShoppingBag, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { type Promotion } from "@/lib/promotions";
import { loadCatalog } from "@/lib/catalog";
import { PageControls } from "@/components/PageControls";

type ProductVariant = { id: number; product_id: number; variant_name: string; price: number; stock: number; };
type Product = { id: number; name: string; type: string; selling_price: number; image_url: string | null; product_code: string; is_set: boolean; sub_category?: string; voucher_discount?: number; variants?: ProductVariant[]; promotions?: Promotion[]; };

const WA_NUMBER = "6282176171448";


const CATEGORIES = [
  { id: 'semua', label: 'Lihat Semua', icon: Grip, color: '#C94F78' }, 
  { id: 'promo', label: 'Promo', icon: BadgePercent, color: '#F43F5E' }, 
  { id: 'Treatment Care & Beauty', label: 'Layanan', icon: Scissors, color: '#C94F78' }, 
  { id: 'Product Care & Beauty', label: 'Produk', icon: ShoppingBag, color: '#F59E0B' }, 
];

import { useRouter } from "next/navigation";

export default function CustomerPortalPage() {
  const router = useRouter();
  const { addToCart, cart, totalItems } = useCart();
  const [customer, setCustomer] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, updateActiveTab] = useState("semua");
  const [page, setPage] = useState(1);
  const setActiveTab = (value: string) => { setPage(1); updateActiveTab(value); };
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectionQty, setSelectionQty] = useState(1);
  const [isAgreed, setIsAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    { title: "Kecantikan Alami,\nHanya Untuk Anda", subtitle: "Pesan layanan kecantikan favorit Anda sekarang.", bg: "linear-gradient(135deg, #C94F78 0%, #9B3055 100%)", image: "/beauty_carousel_1_1778829705862.png" },
    { title: "Treatment Premium,\nHarga Terjangkau", subtitle: "Nikmati perawatan kelas dunia di LBQueen.", bg: "linear-gradient(135deg, #9B3055 0%, #7A2240 100%)", image: "/beauty_carousel_2_1778829728230.png" },
    { title: "Kulit Sehat Berkilau,\nImpian Jadi Nyata", subtitle: "Konsultasikan kecantikan Anda dengan ahli kami.", bg: "linear-gradient(135deg, #7A2240 0%, #C94F78 100%)", image: "/beauty_carousel_3_1778829748066.png" },
  ];

  const debouncedSearch = useDebounce(searchQuery, 400);

  const { data, isLoading: loading, isValidating, error: catalogError, mutate } = useSWR(
    ['/api/catalog', debouncedSearch, activeTab, page],
    ([, search, category, page]) => loadCatalog({ search, category, page }),
    {
      revalidateOnFocus: false,
      keepPreviousData: false
    }
  );

  const products = data?.products || [];
  const allVouchers = data?.allVouchers || [];

  useEffect(() => {
    const stored = localStorage.getItem("lbqueen_customer");
    if (stored) { 
      try { 
        setCustomer(JSON.parse(stored)); 
      } catch {} 
    }
    setAuthChecked(true);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const openModal = (p: Product) => {
    setSelectedProduct(p);
    setSelectedVariant(p.variants && p.variants.length > 0 ? p.variants[0] : null);
    setSelectionQty(1); setIsAgreed(false);
  };

  const handleAddToCart = () => {
    if (!customer) {
      router.push("/login");
      return;
    }
    if (!selectedProduct) return;
    addToCart(selectedProduct, selectionQty, selectedVariant);
    setSelectedProduct(null);
  };

  const handleBuyNow = async () => {
    if (!customer) {
      router.push("/login");
      return;
    }
    if (!selectedProduct) return;
    
    addToCart(selectedProduct, selectionQty, selectedVariant);
    setSelectedProduct(null);
    router.push("/cart");
  };

  const isTreatment = selectedProduct?.type === "Treatment Care & Beauty";
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Selamat Pagi";
    if (h < 15) return "Selamat Siang";
    if (h < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const popularTreatments = products.filter(p => p.type === "Treatment Care & Beauty").slice(0, 6);
  const bestSelling = products.filter(p => p.type === "Product Care & Beauty").slice(0, 10);

  if ((loading && customer) || !authChecked) {
    return (
      <div className="min-h-screen bg-[#FDFBFB] animate-in fade-in duration-500">
        <div className="h-[180px] w-full bg-slate-200 animate-pulse rounded-b-[48px] mb-6"></div>
        <div className="px-5 mb-8 flex gap-3 overflow-x-hidden">
           {[1,2,3,4].map(i => <div key={i} className="min-w-[64px] h-[64px] rounded-[24px] bg-slate-200 animate-pulse"></div>)}
        </div>
        <div className="px-5 grid grid-cols-2 gap-4">
           {[1,2,3,4].map(i => <div key={i} className="h-[180px] rounded-[24px] bg-slate-200 animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (!customer) {
    return <OnboardingView />;
  }

  if (catalogError) return <div role="alert" className="mx-5 my-24 rounded-[32px] border border-[#EEDFE3] bg-white p-8 text-center"><ShoppingBag className="mx-auto mb-4 h-8 w-8 text-[#A83960]" /><h1 className="text-xl font-semibold">Katalog belum tersedia</h1><p className="mt-3 mb-6 text-sm text-[#766B68]">Kami belum dapat menghubungi database. Silakan coba kembali beberapa saat lagi.</p><button onClick={() => mutate()} className="btn-pink">Coba lagi</button></div>;

  const memberTier = customer.membership_type || "Member";
  const nextTierPoints = customer.points > 1000 ? 5000 : customer.points > 500 ? 1000 : 500;
  const progressPercent = Math.min(100, (customer.points / nextTierPoints) * 100);

  return (
    <div className="portal-home min-h-screen bg-[#FDFBFB] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── TOP GREETING & SEARCH ── */}
      <div data-reveal className="relative overflow-hidden px-5 sm:px-8 lg:px-12 pt-24 lg:pt-28 pb-8 lg:pb-12 mb-8 rounded-b-[32px] shadow-sm"
        style={{ background: 'linear-gradient(160deg,#C94F78 0%,#9B3055 55%,#7A2240 100%)' }}>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -ml-32 -mt-32"></div>

        <div className="relative z-10">
          <div className="mb-6">
            <h2 className="text-2xl lg:text-4xl font-semibold text-white tracking-tight leading-tight">
              {getGreeting()},<br/>
              <span className="text-[#F5E3C0]">{customer?.name ? customer.name.split(' ')[0] : 'Guest'}!</span>
            </h2>
            <p className="text-white/85 text-sm mt-3">Waktu untuk merawat diri. Temukan perawatan pilihan Anda.</p>
          </div>

          <div className="relative w-full max-w-2xl shadow-sm rounded-2xl overflow-hidden bg-white">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#C94F78]" />
            </div>
            <input 
              type="search" aria-label="Cari treatment atau produk"
              placeholder="Cari treatment atau produk..." 
              value={searchQuery} 
              onChange={e => { setPage(1); setSearchQuery(e.target.value); }}
              className="block w-full pl-11 pr-4 py-4 text-base bg-transparent outline-none text-[#2D2926]"
            />
          </div>
        </div>
      </div>

      <div data-reveal className="portal-section">
        <div className="relative w-full h-[200px] sm:h-[240px] lg:h-[300px] rounded-[32px] overflow-hidden shadow-sm transition-all duration-500"
             style={{ background: slides[activeSlide].bg }}>
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl"></div>
          <div className="absolute right-12 bottom-0 w-24 h-24 rounded-full bg-[#D4AF37] opacity-20 blur-xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full border-[20px] border-white/5"></div>
          
          <div className="relative z-10 w-[85%] sm:w-[70%] h-full flex flex-col justify-center px-6 sm:px-8 lg:px-12">
            <h3 className="text-white text-2xl lg:text-4xl font-semibold leading-tight mb-3 whitespace-pre-line transition-all duration-700">
              {slides[activeSlide].title}
            </h3>
            <p className="text-white/90 text-sm mb-4 transition-all duration-700">
              {slides[activeSlide].subtitle}
            </p>
          </div>
          <div className="absolute right-0 bottom-0 h-full w-[100%] flex items-end justify-end pointer-events-none">
             <Image src={slides[activeSlide].image} alt="Promotion" fill className="object-cover opacity-60 mix-blend-overlay" />
          </div>

          <div className="absolute bottom-4 right-6 flex gap-1.5">
            {slides.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${activeSlide === i ? "w-4 bg-white" : "w-1.5 bg-white/40"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="portal-section">
        <div className="grid grid-cols-4 sm:flex sm:justify-start sm:gap-8 gap-3 py-3" aria-label="Kategori katalog">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = activeTab === cat.id;
            return (
              <button 
                key={cat.id}
                aria-pressed={active}
                onClick={() => setActiveTab(cat.id)}
                className="flex min-w-0 flex-col items-center transition-all duration-300 active:scale-95"
              >
                <div 
                  className={`w-[64px] h-[64px] rounded-[24px] flex items-center justify-center mb-2.5 transition-all duration-500 relative overflow-hidden group
                    ${active ? "shadow-sm" : "bg-white border border-[#EEDFE3] hover:border-rose-200"}`}
                  style={active ? { 
                    background: `linear-gradient(135deg, ${cat.color}, #C94F78)`,
                  } : {}}
                >
                  <Icon 
                    className={`w-7 h-7 transition-all duration-500 ${active ? "text-white scale-110" : ""}`} 
                    style={{ color: active ? '#ffffff' : cat.color }}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>
                <span className={`text-xs transition-all duration-300
                  ${active ? "text-[#A83960] font-bold" : "text-[#766B68] font-medium"}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── EXCLUSIVE MEMBER CARD ── */}
      <div className="portal-section">
        {!customer || !customer.is_member ? (
          <Link href="/login" className="block group">
            <div className="relative overflow-hidden rounded-[32px] p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-rose-100 hover:-translate-y-1 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #fff 0%, #FFF5F8 100%)', border: '1px solid rgba(201,79,120,0.08)' }}>
              
              {/* Background Decorative Elements */}
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#C94F78]/5 rounded-full blur-3xl group-hover:bg-[#C94F78]/10 transition-colors duration-500" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl" />
              
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C94F78]/10 text-[#C94F78] text-[9px] font-bold uppercase tracking-widest mb-3">
                    <Star className="w-3 h-3 fill-current" />
                    Exclusive Member
                  </div>
                  <h3 className="text-[18px] font-bold text-[#2D2926] leading-tight mb-2 tracking-tight">
                    Daftar member, dapatkan <span className="text-[#C94F78]">Keuntungan Extra!</span>
                  </h3>
                  <p className="text-[11px] text-[#2D2926]/50 font-medium max-w-[200px] leading-relaxed">
                    Nikmati promo khusus, poin belanja, dan layanan prioritas setiap kunjungan.
                  </p>
                </div>
                
                {/* Visual Element: 3D-ish Card Icon */}
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C94F78] to-[#9B3055] rounded-[24px] rotate-12 opacity-10 group-hover:rotate-6 transition-transform duration-500" />
                  <div className="w-16 h-22 bg-gradient-to-br from-[#C94F78] to-[#9B3055] rounded-2xl shadow-2xl shadow-[#C94F78]/30 flex flex-col justify-between p-3 transform -rotate-12 group-hover:-rotate-6 transition-transform duration-500 border border-white/20">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Gem className="w-4 h-4 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="w-10 h-1 bg-white/40 rounded-full" />
                      <div className="w-12 h-1 bg-white/20 rounded-full" />
                      <div className="flex justify-end pt-1">
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Action Circle */}
                  <div className="absolute -right-2 -bottom-2 w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center text-[#C94F78] transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[15px] font-semibold text-[#2D2926]">Status Membership</h3>
              </div>
              <div className="bg-white rounded-[32px] p-5 shadow-sm border border-rose-100/50 mb-6 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center border border-amber-200/50 shadow-sm">
                      <Gem className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Tier Saat Ini</p>
                      <p className="text-[15px] font-bold text-[#2D2926] leading-none">{memberTier} Member</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[18px] font-extrabold text-[#C94F78] leading-none">{customer.points}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Poin</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative z-10 mt-2">
                  <div className="flex justify-between text-[10px] font-bold mb-2">
                    <span className="text-[#C94F78]">{customer.points} Pts</span>
                    <span className="text-slate-400">{nextTierPoints} Pts</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#C94F78] to-[#D4AF37] rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-3 text-center">
                    Kumpulkan {nextTierPoints - customer.points} poin lagi untuk target berikutnya.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <h3 className="text-[15px] font-semibold text-[#2D2926]">Promo Member</h3>
              </div>
            {allVouchers.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {allVouchers.map(v => (
                  <div key={v.id} className="shrink-0 w-[260px] h-[100px] rounded-2xl overflow-hidden p-4 flex items-center justify-between shadow-sm border border-rose-100 bg-white relative">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FDFBFB]" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FDFBFB]" />
                    <div className="relative z-10 flex-1">
                      <p className="text-[#C94F78] text-[10px] font-bold uppercase tracking-wider mb-0.5">{v.name}</p>
                      <h4 className="text-[#2D2926] text-[15px] font-bold mb-2">Potongan {v.type === "nominal" ? `Rp ${v.discount_amount.toLocaleString('id-ID')}` : `${v.discount_amount}%`}</h4>
                      <div className="inline-block bg-[#FDF2F5] text-[#C94F78] px-2 py-0.5 rounded-md text-[9px] font-bold border border-rose-100">
                        Kode: {v.code}
                      </div>
                    </div>
                    <div className="relative z-10 w-[60px] h-[60px] bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                      <Ticket className="w-8 h-8 text-[#C94F78] opacity-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-[80px] rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center bg-white">
                <p className="text-[12px] text-slate-300 font-medium italic">Promo segera hadir</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SEARCH RESULTS OR DEFAULT SECTIONS ── */}
      {searchQuery || activeTab !== "semua" ? (
        <div className="px-5 pb-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[15px] font-bold text-[#2D2926] tracking-tight">Hasil Pencarian</h3>
            <span className="text-[11px] text-slate-400 font-medium">{products.length} ditemukan</span>
          </div>
          {products.length > 0 ? (
            <div className="portal-catalog-grid">
              {products.map(p => (
                <div key={p.id} onClick={() => openModal(p)}
                     className="bg-white rounded-[24px] shadow-sm border border-[#f0eded] overflow-hidden cursor-pointer active:scale-[0.98] transition-all">
                  <div className="relative w-full aspect-[4/3] bg-rose-50/30">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-10">
                        <Image src="/lbqueen_logo.png" alt="logo" width={40} height={40} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-sm text-[#C94F78]">
                      <Plus className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{p.sub_category || (p.type === "Treatment Care & Beauty" ? "Layanan" : "Produk")}</p>
                    <h4 className="text-[12px] font-bold text-[#2D2926] truncate leading-tight mb-1">{p.name}</h4>
                    <span className="text-[13px] font-bold text-[#C94F78]">Rp {p.selling_price.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-100 rounded-[32px]">
              <Search className="w-8 h-8 text-slate-200 mb-3" />
              <p className="text-[13px] font-bold text-slate-400">Tidak ada hasil ditemukan</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ── BEST SELLING PRODUCTS ── */}
          {bestSelling.length > 0 && (
            <div className="px-0 pb-12">
              <div className="px-5 flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-bold text-[#2D2926] tracking-tight">Produk Terlaris</h3>
                <button onClick={() => setActiveTab("Product Care & Beauty")} className="text-xs font-semibold text-[#A83960] min-h-11">Lihat semua</button>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-5 pb-4">
                {bestSelling.map(p => (
                  <div key={p.id} onClick={() => openModal(p)}
                       className="snap-center shrink-0 w-[190px] bg-white rounded-[28px] shadow-sm border border-[#f0eded] overflow-hidden cursor-pointer group active:scale-[0.98] transition-all">
                    <div className="relative w-full aspect-[4/3] bg-rose-50/30">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-10">
                          <Image src="/lbqueen_logo.png" alt="logo" width={50} height={50} />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm text-[#C94F78]">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{p.sub_category || "Produk"}</p>
                      <h4 className="text-[13px] font-bold text-[#2D2926] truncate leading-tight mb-2">{p.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-bold text-[#C94F78]">Rp {p.selling_price.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── POPULAR TREATMENTS ── */}
          {popularTreatments.length > 0 && (
            <div className="px-0 pb-12">
              <div className="px-5 flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-bold text-[#2D2926] tracking-tight">Layanan Terpopuler</h3>
                <button onClick={() => setActiveTab("Treatment Care & Beauty")} className="text-xs font-semibold text-[#A83960] min-h-11">Lihat semua</button>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-5 pb-4">
                {popularTreatments.map(p => (
                  <div key={p.id} onClick={() => openModal(p)}
                       className="snap-center shrink-0 w-[260px] bg-white rounded-[28px] shadow-sm border border-[#f0eded] overflow-hidden cursor-pointer group active:scale-[0.98] transition-all">
                    <div className="relative w-full h-[150px] bg-rose-50/30">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-10">
                          <Image src="/lbqueen_logo.png" alt="logo" width={50} height={50} />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[15px] font-bold text-[#2D2926] truncate pr-2 leading-tight">{p.name}</h4>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[16px] font-bold text-[#C94F78]">Rp {p.selling_price.toLocaleString('id-ID')}</span>
                        <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Layanan</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {(searchQuery || activeTab !== "semua") && <PageControls page={page} hasMore={!!data?.hasMore} loading={isValidating} onChange={setPage} />}

      {selectedProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pb-32 md:pb-6">
          <div className="bg-white w-full max-w-[440px] max-h-[82vh] rounded-[40px] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header Image & Info */}
            <div className="relative w-full h-[200px] bg-slate-100 shrink-0">
              {selectedProduct.image_url ? (
                <Image src={selectedProduct.image_url} alt={selectedProduct.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FDF2F5] to-[#FCE8ED]">
                  <Image src="/lbqueen_logo.png" alt="logo" width={100} height={100} className="object-contain opacity-20" />
                </div>
              )}
              
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent h-20" />

              {/* Close Button */}
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all z-20 border border-white/30"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Text Overlay */}
              <div className="absolute bottom-6 left-6 right-6 z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#C94F78] text-white text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-[#C94F78]/20">
                    {selectedProduct.type.split(' ')[0]}
                  </span>
                  {selectedProduct.sub_category && (
                    <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest border border-white/30">
                      {selectedProduct.sub_category}
                    </span>
                  )}
                </div>
                <h3 className="text-[20px] font-bold text-white leading-tight mb-2 drop-shadow-md">
                  {selectedProduct.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[22px] font-bold text-white">
                      Rp {(selectedVariant ? selectedVariant.price : selectedProduct.selling_price).toLocaleString("id-ID")}
                    </span>
                    {selectedProduct.voucher_discount && selectedProduct.voucher_discount > 0 && (
                      <span className="text-[12px] text-white/60 line-through">
                        Rp {((selectedVariant ? selectedVariant.price : selectedProduct.selling_price) + selectedProduct.voucher_discount).toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white rounded-t-[32px] -mt-6 relative z-20 p-6 space-y-8">
              {/* Variants Section */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[13px] font-bold text-[#2D2926] uppercase tracking-wider">Pilih Varian</h4>
                    <span className="text-[11px] text-slate-400 font-medium">Wajib dipilih</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedProduct.variants.map(v => (
                      <button 
                        key={v.id} 
                        onClick={() => setSelectedVariant(v)}
                        className={`px-5 py-3 rounded-2xl text-[12px] font-bold transition-all duration-300 border-2 ${
                          selectedVariant?.id === v.id
                          ? 'bg-[#C94F78] border-[#C94F78] text-white shadow-lg shadow-[#C94F78]/20'
                          : 'bg-white border-slate-100 text-[#2D2926]/60 hover:border-[#C94F78]/30'
                        }`}
                      >
                        {v.variant_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <h4 className="text-[13px] font-bold text-[#2D2926] uppercase tracking-wider mb-4">Jumlah Pesanan</h4>
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-[24px] border border-slate-100">
                  <button 
                    onClick={() => setSelectionQty(Math.max(1, selectionQty - 1))} 
                    className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#C94F78] hover:scale-105 active:scale-95 transition-all"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-[20px] font-bold text-[#2D2926]">{selectionQty}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Qty</span>
                  </div>
                  <button 
                    onClick={() => setSelectionQty(selectionQty + 1)} 
                    className="w-12 h-12 rounded-full bg-[#C94F78] shadow-lg shadow-[#C94F78]/20 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Treatment Advisory */}
              {isTreatment && (
                <div className="p-5 rounded-[24px] space-y-4 bg-[#FBF7ED] border border-[#D4AF37]/20 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#D4AF37]/5 rounded-full" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-[#B8941F]" />
                    </div>
                    <div>
                      <h5 className="text-[14px] font-bold text-[#B8941F] mb-1">Informasi Penting</h5>
                      <p className="text-[12px] text-[#2D2926]/70 leading-relaxed font-medium">
                        H-7 & H+7 treatment dilarang konsumsi alkohol atau obat terlarang. Mohon jujur mengenai kondisi tubuh Anda kepada therapist kami demi keamanan Anda.
                      </p>
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-white/50 border border-[#D4AF37]/10 hover:bg-white transition-colors group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={isAgreed} 
                        onChange={e => setIsAgreed(e.target.checked)}
                        className="peer appearance-none w-6 h-6 border-2 border-[#D4AF37]/30 rounded-lg checked:bg-[#D4AF37] checked:border-[#D4AF37] transition-all cursor-pointer" 
                      />
                      <CheckIcon className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-all scale-50 peer-checked:scale-100" />
                    </div>
                    <span className="text-[13px] font-bold text-[#B8941F] group-hover:text-[#8D6E12]">Saya mengerti & menyetujui persyaratan di atas</span>
                  </label>
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="shrink-0 p-5 pb-8 border-t border-slate-100 bg-white grid grid-cols-[1fr_2.5fr] gap-3">
              <button 
                onClick={handleAddToCart}
                className="h-[60px] rounded-[20px] text-[13px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all bg-slate-50 text-[#C94F78] border border-slate-100 hover:bg-slate-100 active:scale-95"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-wider">+ Cart</span>
              </button>
              
              <button 
                onClick={handleBuyNow} 
                disabled={(isTreatment && !isAgreed) || processing}
                className="h-[60px] rounded-[20px] text-[15px] font-bold text-white flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-[#C94F78]/30 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)' }}
              >
                {processing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" />
                    <span>Order Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  return <span className="text-[18px] font-bold text-slate-400">{initial}</span>;
}

function CheckIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function OnboardingView() {
  const router = useRouter();
  const [onboardSlide, setOnboardSlide] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const onboardingImages = ["/onboarding_1.jpg", "/onboarding_2.jpg"];

  const onboardSlides = [
    { title: "Kecantikan Alami Impian Anda", desc: "Temukan keindahan alami Anda bersama perawatan premium terbaik dari terapis ahli kami." },
    { title: "Layanan Estetika Kelas Dunia", desc: "Nikmati perawatan klinis premium yang aman, higienis, dan terpercaya untuk hasil maksimal." },
    { title: "Kulit Sehat Berkilau Bersinar", desc: "Konsultasikan kecantikan Anda sekarang dan rasakan transformasi kulit sehat impian Anda." }
  ];

  // Loop images every 2 seconds
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % onboardingImages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Loop slides every 4 seconds
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      setOnboardSlide(prev => (prev + 1) % onboardSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [onboardSlides.length]);

  return (
    <div className="min-h-screen bg-[#FDFBFB] flex flex-col lg:flex-row w-full">
      
      {/* Left Side: Looping Images (Desktop Only - Layout Horizontal, not 1:1) */}
      <div className="hidden lg:flex flex-col items-center justify-center lg:w-[58%] relative p-12 bg-gradient-to-br from-[#FFF5F8] to-[#FFF0F4] border-r border-rose-100/20">
        <div className="absolute top-12 left-12 w-72 h-72 bg-[#C94F78]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-12 right-12 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        
        <div className="relative w-full max-w-[640px] aspect-[16/10] rounded-[36px] overflow-hidden shadow-2xl shadow-rose-200/20 bg-white p-3 border border-rose-100/30">
          <div className="relative w-full h-full rounded-[28px] overflow-hidden">
            {onboardingImages.map((src, idx) => (
              <Image 
                key={src}
                src={src} 
                alt={`LBQueen Care ${idx + 1}`} 
                fill 
                className={`object-cover transition-all duration-[1200ms] ease-in-out ${
                  currentImageIndex === idx ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-105 rotate-1"
                }`}
                priority={idx === 0}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent pointer-events-none" />
            
            {/* Premium Brand Tag Floating */}
            <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider">Care & Beauty Clinic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Onboarding Form/Menu (Responsive) */}
      <div className="flex-1 flex flex-col justify-between px-6 py-12 lg:py-16 max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[42%] bg-white lg:shadow-2xl lg:shadow-black/5">
        
        {/* Brand logo at the top */}
        <div className="flex flex-col items-center pt-2 lg:pt-6">
          <div className="w-[72px] h-[72px] rounded-[22px] bg-white border border-[#f0eded] flex items-center justify-center overflow-hidden mb-3 shadow-md transition-transform hover:scale-105 duration-300">
            <Image src="/lbqueen_logo.png" alt="LBQueen Logo" width={56} height={56} className="object-contain" style={{ width: 'auto', height: 'auto' }} />
          </div>
          <p className="font-bold text-[16px] tracking-wide" style={{ color: '#C94F78' }}>LBQueen</p>
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: 'rgba(45,41,38,0.4)' }}>Care & Beauty</p>
        </div>

        {/* Mobile Only: Looping Images (Horizontal Layout, rounded, 2s interval) */}
        <div className="lg:hidden flex items-center justify-center my-6 w-full">
          <div className="relative w-full aspect-[16/10] rounded-[28px] overflow-hidden shadow-lg shadow-rose-100/50 bg-rose-50/20 p-1 border border-rose-100/35">
            <div className="relative w-full h-full rounded-[24px] overflow-hidden">
              {onboardingImages.map((src, idx) => (
                <Image 
                  key={src}
                  src={src} 
                  alt={`LBQueen Care ${idx + 1}`} 
                  fill 
                  className={`object-cover transition-all duration-1000 ${
                    currentImageIndex === idx ? "opacity-100 scale-100" : "opacity-0 scale-105"
                  }`}
                  priority={idx === 0}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Dynamic Slide Text */}
        <div className="text-center px-4 my-6 lg:my-8 min-h-[110px] flex flex-col justify-center">
          <h2 className="text-[22px] font-bold text-[#2D2926] tracking-tight leading-snug mb-3 transition-all duration-500 lg:text-[24px]">
            {onboardSlides[onboardSlide].title}
          </h2>
          <p className="text-[13px] leading-relaxed text-[#2D2926]/55 font-medium transition-all duration-500 max-w-[320px] mx-auto lg:max-w-[360px] lg:text-[14px]">
            {onboardSlides[onboardSlide].desc}
          </p>
          
          {/* Bullet Indicators */}
          <div className="flex justify-center gap-1.5 mt-6">
            {onboardSlides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  onboardSlide === i ? "w-5 bg-[#C94F78]" : "w-1.5 bg-slate-200"
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4 w-full px-2 lg:px-8 max-w-[380px] mx-auto">
          <button 
            onClick={() => router.push("/login")}
            className="w-full h-[56px] rounded-[20px] text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-rose-100/60 shadow-lg shadow-rose-100 cursor-pointer animate-in fade-in duration-300"
            style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)' }}
          >
            Masuk
          </button>

          <button 
            onClick={() => router.push("/register")}
            className="w-full h-[56px] rounded-[20px] font-bold text-[14px] flex items-center justify-center transition-all active:scale-[0.98] border border-slate-200 text-[#2D2926]/70 hover:bg-slate-50 hover:text-[#C94F78] hover:border-[#C94F78]/20 cursor-pointer animate-in fade-in duration-350"
          >
            Belum ada akun? Daftar dulu
          </button>
        </div>
      </div>
    </div>
  );
}
