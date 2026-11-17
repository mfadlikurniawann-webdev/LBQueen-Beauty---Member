"use client";

import { useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, Plus, Minus, X, ArrowRight, Star, Gem, Loader2, Scissors, AlertTriangle, ShoppingCart, Heart, BadgePercent, ShoppingBag, Ticket, ChevronRight } from "lucide-react";
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
  { id: 'promo', label: 'Promo', icon: BadgePercent, color: '#F43F5E' }, 
  { id: 'layanan', label: 'Layanan', icon: Scissors, color: '#C94F78' }, 
  { id: 'produk', label: 'Produk', icon: ShoppingBag, color: '#F59E0B' }, 
];

import { useRouter } from "next/navigation";

export default function CustomerPortalPage() {
  const router = useRouter();
  const { addToCart, cart, totalItems } = useCart();
  const [customer, setCustomer] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const changePage = (next: number) => {
    setPage(next);
    document.getElementById("katalog-beranda")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
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
    ['/api/catalog', debouncedSearch, page],
    ([, search, page]) => loadCatalog({ search, category: search ? "semua" : "promo", page }),
    {
      revalidateOnFocus: false,
      keepPreviousData: true
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


  if ((loading && customer) || !authChecked) {
    return (
      <div className="min-h-screen bg-[#FDFBFB] animate-in fade-in duration-500">
        <div className="h-[220px] w-full bg-gradient-to-br from-[#E9C3D0] to-[#D79BB0] animate-pulse rounded-b-[32px] mb-8"></div>
        <div className="mx-5 mb-8 h-[200px] rounded-[32px] bg-[#F3E7EA] animate-pulse"></div>
        <div className="px-5 mb-8 grid grid-cols-3 gap-3">
           {[1,2,3].map(i => <div key={i} className="mx-auto w-[64px] h-[64px] rounded-[24px] bg-[#F3E7EA] animate-pulse"></div>)}
        </div>
        <div className="px-5 grid grid-cols-2 gap-4">
           {[1,2,3,4].map(i => <div key={i} className="h-[220px] rounded-[24px] bg-[#F3E7EA] animate-pulse"></div>)}
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
            <h2 className="text-[26px] lg:text-4xl font-semibold text-white tracking-tight leading-tight drop-shadow-sm">
              {getGreeting()},<br/>
              <span className="text-[#F5E3C0]">{customer?.name ? customer.name.split(' ')[0] : 'Guest'}!</span>
            </h2>
            <p className="text-white/90 text-[14px] leading-relaxed mt-3 max-w-md">Waktu untuk merawat diri. Temukan perawatan pilihan Anda.</p>
          </div>

          <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-white shadow-lg shadow-[#7A2240]/20 ring-1 ring-white/60 transition-shadow focus-within:ring-4 focus-within:ring-white/40">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search aria-hidden="true" className="h-[18px] w-[18px] text-[#A83960]" />
            </div>
            <input
              type="search" aria-label="Cari treatment atau produk"
              placeholder="Cari treatment atau produk..."
              value={searchQuery}
              onChange={e => { setPage(1); setSearchQuery(e.target.value); }}
              className="block w-full pl-12 pr-4 py-4 text-base bg-transparent outline-none text-[#2D2926] placeholder:text-[#8C8280]"
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
        <nav className="grid grid-cols-3 sm:flex sm:justify-start sm:gap-8 gap-3 py-3" aria-label="Kategori katalog">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button 
                key={cat.id}
                type="button"
                onClick={() => router.push(`/category/${cat.id}`)}
                className="flex min-w-0 flex-col items-center transition-all duration-300 active:scale-95"
              >
                <div className="w-[64px] h-[64px] rounded-[24px] flex items-center justify-center mb-2.5 transition-all duration-500 relative overflow-hidden group bg-white border border-[#EEDFE3] hover:border-rose-200">
                  <Icon className="w-7 h-7 transition-all duration-500" style={{ color: cat.color }} strokeWidth={2} />
                </div>
                <span className="text-xs transition-all duration-300 text-[#766B68] font-medium">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── EXCLUSIVE MEMBER CARD ── */}
      <div className="portal-section">
        {!customer || !customer.is_member ? (
          <Link href="/login" className="block group rounded-[32px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/25">
            <div className="relative overflow-hidden rounded-[32px] p-5 sm:p-6 border border-[#EEDFE3] shadow-[0_8px_24px_-12px_rgba(168,57,96,0.25)] transition-all duration-500 hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-1 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #fff 0%, #FFF5F8 100%)' }}>

              <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#C94F78]/5 rounded-full blur-3xl group-hover:bg-[#C94F78]/10 transition-colors duration-500" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl" />

              <div className="relative z-10 flex items-center justify-between gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C94F78]/10 text-[#A83960] text-[11px] font-bold uppercase tracking-[0.1em] mb-3">
                    <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                    Exclusive Member
                  </div>
                  <h3 className="text-[18px] font-bold text-[#2D2926] leading-snug mb-2 tracking-tight">
                    Daftar member, dapatkan <span className="text-[#A83960]">Keuntungan Extra!</span>
                  </h3>
                  <p className="text-[13px] text-[#766B68] font-medium max-w-[260px] leading-relaxed">
                    Nikmati promo khusus, poin belanja, dan layanan prioritas setiap kunjungan.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#A83960] group-hover:text-[#7A2240] transition-colors">
                    Daftar sekarang <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>

                <div className="relative hidden min-[360px]:flex w-20 h-20 sm:w-24 sm:h-24 items-center justify-center shrink-0" aria-hidden="true">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C94F78] to-[#9B3055] rounded-[24px] rotate-12 opacity-10 group-hover:rotate-6 transition-transform duration-500" />
                  <div className="w-14 h-20 sm:w-16 sm:h-22 bg-gradient-to-br from-[#C94F78] to-[#9B3055] rounded-2xl shadow-2xl shadow-[#C94F78]/30 flex flex-col justify-between p-3 transform -rotate-12 group-hover:-rotate-6 transition-transform duration-500 border border-white/20">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Gem className="w-4 h-4 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="w-8 sm:w-10 h-1 bg-white/50 rounded-full" />
                      <div className="w-6 sm:w-8 h-1 bg-white/30 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ) : (
            <div>
              <SectionHeading title="Status Membership" />
              <div className="bg-white rounded-[28px] p-5 border border-[#EEDFE3] shadow-[0_8px_24px_-12px_rgba(168,57,96,0.22)] mb-8 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-36 h-36 bg-gradient-to-br from-[#D4AF37]/15 to-transparent rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between gap-3 mb-5 relative z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F7E7B4] to-[#FBF3DC] flex items-center justify-center border border-[#D4AF37]/30 shrink-0">
                      <Gem className="w-5 h-5 text-[#9A7614]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#766B68] font-bold uppercase tracking-[0.1em] leading-none mb-1.5">Tier Saat Ini</p>
                      <p className="text-[16px] font-bold text-[#2D2926] leading-tight line-clamp-2">{memberTier} Member</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[24px] font-extrabold text-[#A83960] leading-none tabular-nums">{customer.points}</p>
                    <p className="text-[11px] font-bold text-[#766B68] uppercase tracking-[0.1em] mt-1.5">Total Poin</p>
                  </div>
                </div>

                <div className="relative z-10 rounded-2xl bg-[#FDF7F9] border border-[#F3E4E9] p-4">
                  <div className="flex justify-between text-[12px] font-bold mb-2 tabular-nums">
                    <span className="text-[#A83960]">{customer.points} Pts</span>
                    <span className="text-[#766B68]">{nextTierPoints} Pts</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#F1DDE4] rounded-full overflow-hidden" role="progressbar" aria-label="Progres poin menuju target berikutnya" aria-valuemin={0} aria-valuemax={nextTierPoints} aria-valuenow={customer.points}>
                    <div
                      className="h-full bg-gradient-to-r from-[#C94F78] to-[#D4AF37] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[12px] text-[#766B68] font-medium mt-3 text-center leading-relaxed">
                    Kumpulkan <span className="font-bold text-[#2D2926] tabular-nums">{nextTierPoints - customer.points}</span> poin lagi untuk target berikutnya.
                  </p>
                </div>
              </div>

              <SectionHeading title="Promo Member" />
            {allVouchers.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x -mx-[var(--portal-gutter)] px-[var(--portal-gutter)] pb-3">
                {allVouchers.map(v => (
                  <div key={v.id} className="snap-start shrink-0 w-[272px] min-h-[112px] rounded-[24px] overflow-hidden flex items-stretch border border-[#EEDFE3] bg-white shadow-[0_6px_18px_-10px_rgba(168,57,96,0.3)] relative">
                    <div className="relative z-10 flex-1 min-w-0 p-4 pr-3 flex flex-col justify-center">
                      <p className="text-[#A83960] text-[11px] font-bold uppercase tracking-[0.08em] mb-1 line-clamp-1">{v.name}</p>
                      <h4 className="text-[#2D2926] text-[16px] font-bold leading-tight mb-2.5 tabular-nums">Potongan {v.type === "nominal" ? `Rp ${v.discount_amount.toLocaleString('id-ID')}` : `${v.discount_amount}%`}</h4>
                      <div className="self-start max-w-full truncate bg-[#FDF2F5] text-[#A83960] px-2.5 py-1 rounded-lg text-[12px] font-bold border border-dashed border-[#E3B5C5]">
                        Kode: {v.code}
                      </div>
                    </div>
                    <div className="relative w-[76px] shrink-0 flex items-center justify-center border-l-2 border-dashed border-[#EEDFE3] bg-gradient-to-br from-[#C94F78] to-[#9B3055]">
                      <div className="absolute -left-[9px] -top-2 w-4 h-4 rounded-full bg-[#FDFBFB] border border-[#EEDFE3]" />
                      <div className="absolute -left-[9px] -bottom-2 w-4 h-4 rounded-full bg-[#FDFBFB] border border-[#EEDFE3]" />
                      <Ticket className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full rounded-[24px] border-2 border-dashed border-[#EEDFE3] bg-white px-5 py-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#FDF2F5] flex items-center justify-center shrink-0">
                  <Ticket className="w-5 h-5 text-[#A83960]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[14px] text-[#2D2926] font-semibold">Promo segera hadir</p>
                  <p className="text-[12px] text-[#766B68] mt-0.5">Promo khusus member akan tampil di sini.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PROMO CATALOG OR SEARCH RESULTS ── */}
      <div id="katalog-beranda" className="scroll-mt-24 px-[var(--portal-gutter)] pb-6">
        <div className="flex justify-between items-center gap-3 mb-4">
          {searchQuery ? (
            <h3 className="text-[18px] font-bold text-[#2D2926] tracking-tight">Hasil Pencarian</h3>
          ) : (
            <SectionHeading title="Promo Spesial" />
          )}
          {products.length > 0 && <span className="shrink-0 rounded-full bg-[#FDF2F5] px-3 py-1 text-[12px] font-semibold text-[#A83960] tabular-nums">Halaman {page}</span>}
        </div>
        {loading ? (
          <div className="portal-catalog-grid" aria-busy="true">
            <span className="sr-only">Memuat katalog</span>
            {[1, 2, 3, 4].map(i => <div key={i} className="h-[240px] rounded-[24px] bg-[#F3E7EA] animate-pulse" />)}
          </div>
        ) : products.length > 0 ? (
          <div className="portal-catalog-grid">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onOpen={() => openModal(p)} />
            ))}
          </div>
        ) : (
          <div className="py-12 px-6 flex flex-col items-center justify-center text-center bg-white border border-[#EEDFE3] rounded-[32px]">
            <div className="w-16 h-16 rounded-full bg-[#FDF2F5] flex items-center justify-center mb-4">
              {searchQuery ? <Search className="w-7 h-7 text-[#A83960]" aria-hidden="true" /> : <BadgePercent className="w-7 h-7 text-[#A83960]" aria-hidden="true" />}
            </div>
            <p className="text-[15px] font-bold text-[#2D2926]">{searchQuery ? "Tidak ada hasil ditemukan" : "Belum ada promo aktif"}</p>
            <p className="text-[13px] text-[#766B68] mt-1.5 max-w-[260px] leading-relaxed">{searchQuery ? "Coba kata kunci lain." : "Lihat Layanan atau Produk untuk menjelajahi katalog lengkap."}</p>
          </div>
        )}
      </div>

      {(page > 1 || data?.hasMore) && <PageControls page={page} hasMore={!!data?.hasMore} loading={isValidating} onChange={changePage} />}

      {selectedProduct && (() => {
        const basePrice = selectedVariant ? selectedVariant.price : selectedProduct.selling_price;
        const discount = selectedProduct.voucher_discount || 0;
        return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pb-32 md:pb-6">
          <div role="dialog" aria-modal="true" aria-labelledby="product-detail-title" className="bg-white w-full max-w-[440px] max-h-[82vh] rounded-[32px] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="relative w-full h-[210px] shrink-0">
              {selectedProduct.image_url ? (
                <Image src={selectedProduct.image_url} alt={selectedProduct.name} fill className="object-cover" />
              ) : (
                <ProductPlaceholder type={selectedProduct.type} size="xl" tone="deep" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-transparent h-20" />

              <button
                type="button"
                aria-label="Tutup detail"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-all z-20 border border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-9 left-5 right-5 z-10">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#C94F78] text-white text-[11px] font-bold uppercase tracking-[0.08em] shadow-lg shadow-[#C94F78]/20">
                    {selectedProduct.type.split(' ')[0]}
                  </span>
                  {selectedProduct.sub_category && (
                    <span className="max-w-[60%] truncate px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-[0.08em] border border-white/30">
                      {selectedProduct.sub_category}
                    </span>
                  )}
                </div>
                <h3 id="product-detail-title" className="text-[20px] font-bold text-white leading-snug mb-1.5 drop-shadow-md line-clamp-2">
                  {selectedProduct.name}
                </h3>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums">
                  <span className="text-[22px] font-bold text-white drop-shadow-sm">
                    Rp {Math.max(0, basePrice - discount).toLocaleString("id-ID")}
                  </span>
                  {discount > 0 && (
                    <span className="text-[13px] font-medium text-white/80 line-through">
                      Rp {basePrice.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white rounded-t-[28px] -mt-6 relative z-20 p-5 sm:p-6 space-y-7">
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="text-[13px] font-bold text-[#2D2926] uppercase tracking-[0.08em]">Pilih Varian</h4>
                    <span className="rounded-full bg-[#FDF2F5] px-2.5 py-0.5 text-[11px] text-[#A83960] font-semibold">Wajib dipilih</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedProduct.variants.map(v => (
                      <button
                        type="button"
                        key={v.id}
                        aria-pressed={selectedVariant?.id === v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 min-h-11 rounded-2xl text-[13px] font-bold transition-all duration-300 border-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20 ${
                          selectedVariant?.id === v.id
                          ? 'bg-[#C94F78] border-[#C94F78] text-white shadow-lg shadow-[#C94F78]/20'
                          : 'bg-white border-[#EEDFE3] text-[#2D2926] hover:border-[#C94F78]/40 hover:text-[#A83960]'
                        }`}
                      >
                        {v.variant_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-[13px] font-bold text-[#2D2926] uppercase tracking-[0.08em] mb-3">Jumlah Pesanan</h4>
                <div className="flex items-center justify-between bg-[#FDF7F9] p-2 rounded-[24px] border border-[#EEDFE3]">
                  <button
                    type="button"
                    aria-label="Kurangi jumlah"
                    onClick={() => setSelectionQty(Math.max(1, selectionQty - 1))}
                    className="w-12 h-12 rounded-full bg-white border border-[#EEDFE3] shadow-sm flex items-center justify-center text-[#A83960] hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-[22px] font-bold text-[#2D2926] tabular-nums leading-none" aria-live="polite">{selectionQty}</span>
                    <span className="text-[11px] text-[#766B68] font-semibold uppercase tracking-[0.1em] mt-1">Qty</span>
                  </div>
                  <button
                    type="button"
                    aria-label="Tambah jumlah"
                    onClick={() => setSelectionQty(selectionQty + 1)}
                    className="w-12 h-12 rounded-full bg-[#C94F78] shadow-lg shadow-[#C94F78]/20 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/25"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {isTreatment && (
                <div className="p-4 sm:p-5 rounded-[24px] space-y-4 bg-[#FBF7ED] border border-[#D4AF37]/30 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#D4AF37]/10 rounded-full" />
                  <div className="relative flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-[#8A6A0F]" aria-hidden="true" />
                    </div>
                    <div>
                      <h5 className="text-[14px] font-bold text-[#7A5C0B] mb-1">Informasi Penting</h5>
                      <p className="text-[13px] text-[#4A4340] leading-relaxed">
                        H-7 & H+7 treatment dilarang konsumsi alkohol atau obat terlarang. Mohon jujur mengenai kondisi tubuh Anda kepada therapist kami demi keamanan Anda.
                      </p>
                    </div>
                  </div>

                  <label className="relative flex items-center gap-3 cursor-pointer p-3.5 rounded-2xl bg-white border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-colors group">
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        checked={isAgreed}
                        onChange={e => setIsAgreed(e.target.checked)}
                        className="peer appearance-none w-6 h-6 border-2 border-[#C9A43A] rounded-lg bg-white checked:bg-[#B8941F] checked:border-[#B8941F] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30"
                      />
                      <CheckIcon className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-all scale-50 peer-checked:scale-100" />
                    </div>
                    <span className="text-[13px] font-semibold text-[#5E4708] leading-snug">Saya mengerti & menyetujui persyaratan di atas</span>
                  </label>
                </div>
              )}
            </div>

            <div className="shrink-0 p-4 sm:p-5 pb-6 border-t border-[#F3E4E9] bg-white grid grid-cols-[1fr_2.5fr] gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="h-[56px] rounded-2xl font-bold flex flex-col items-center justify-center gap-0.5 transition-all bg-[#FDF2F5] text-[#A83960] border border-[#EEDFE3] hover:bg-[#FBE7EE] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20"
              >
                <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                <span className="text-[11px] uppercase tracking-[0.08em]">+ Cart</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={(isTreatment && !isAgreed) || processing}
                className="h-[56px] rounded-2xl text-[15px] font-bold text-white flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 disabled:saturate-50 disabled:shadow-none disabled:cursor-not-allowed shadow-xl shadow-[#C94F78]/30 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/30"
                style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)' }}
              >
                {processing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                    <span>Order Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}

function ProductPlaceholder({ type, size = "md", tone = "soft" }: { type: string; size?: "md" | "lg" | "xl"; tone?: "soft" | "deep" }) {
  const isTreatmentItem = type === "Treatment Care & Beauty";
  const Icon = isTreatmentItem ? Scissors : ShoppingBag;
  const circle = size === "xl" ? "w-20 h-20" : size === "lg" ? "w-16 h-16" : "w-14 h-14";
  const icon = size === "xl" ? "w-9 h-9" : size === "lg" ? "w-7 h-7" : "w-6 h-6";
  if (tone === "deep") {
    return (
      <div className="absolute inset-0 flex items-start justify-center pt-8 bg-gradient-to-br from-[#C94F78] via-[#A83960] to-[#7A2240]" aria-hidden="true">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-6 bottom-0 w-32 h-32 rounded-full bg-[#D4AF37]/20 blur-2xl" />
        <div className={`relative ${circle} rounded-full bg-white/15 border border-white/30 flex items-center justify-center`}>
          <Icon className={`${icon} text-white`} strokeWidth={1.75} />
        </div>
      </div>
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#F9E1E9] via-[#FCEFF3] to-[#FAF7F5]" aria-hidden="true">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#C94F78]/10 blur-xl" />
      <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-[#D4AF37]/15 blur-xl" />
      <div className={`relative ${circle} rounded-full bg-white/90 border border-[#EEDFE3] shadow-sm flex items-center justify-center`}>
        <Icon className={`${icon} text-[#A83960]`} strokeWidth={1.75} />
      </div>
      <span className="relative text-[11px] font-bold uppercase tracking-[0.12em] text-[#A83960]/80">LBQueen</span>
    </div>
  );
}

function PromoBadge() {
  return (
    <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 shadow-sm">
      <BadgePercent className="w-3 h-3" aria-hidden="true" />
      Promo
    </span>
  );
}

function PriceStack({ price, discount, size = "md" }: { price: number; discount: number; size?: "md" | "lg" }) {
  return (
    <div className="min-w-0 tabular-nums">
      {discount > 0 && (
        <p className="text-[12px] font-medium text-[#766B68] line-through leading-none mb-1">Rp {price.toLocaleString("id-ID")}</p>
      )}
      <p className={`${size === "lg" ? "text-[17px]" : "text-[15px]"} font-bold text-[#A83960] leading-tight`}>
        Rp {Math.max(0, price - discount).toLocaleString("id-ID")}
      </p>
    </div>
  );
}

function SectionHeading({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h3 className="flex items-center gap-2.5 text-[18px] font-bold text-[#2D2926] tracking-tight">
        <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[#C94F78] to-[#D4AF37]" aria-hidden="true" />
        {title}
      </h3>
      {onSeeAll && (
        <button type="button" onClick={onSeeAll} className="-mr-2 inline-flex min-h-11 items-center gap-0.5 rounded-2xl px-2 text-[13px] font-bold text-[#A83960] hover:text-[#7A2240] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94F78]/30">
          Lihat semua <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function ProductCard({ product, onOpen, className = "" }: { product: Product; onOpen: () => void; className?: string }) {
  const discount = product.voucher_discount || 0;
  const fallbackLabel = product.type === "Treatment Care & Beauty" ? "Layanan" : "Produk";
  return (
    <button type="button" onClick={onOpen}
      className={`flex flex-col text-left bg-white rounded-[24px] border border-[#EEDFE3] shadow-[0_6px_18px_-10px_rgba(168,57,96,0.28)] overflow-hidden cursor-pointer group active:scale-[0.98] transition-all hover:shadow-lg hover:shadow-rose-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/25 ${className}`}>
      <div className="relative w-full aspect-[4/3] shrink-0">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <ProductPlaceholder type={product.type} />
        )}
        {discount > 0 && <PromoBadge />}
        <span className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/95 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm text-[#A83960] group-hover:bg-[#C94F78] group-hover:text-white transition-colors" aria-hidden="true">
          <Plus className="w-4 h-4" />
        </span>
      </div>
      <div className="p-3.5 flex flex-1 flex-col">
        <p className="text-[11px] font-semibold text-[#A83960] uppercase tracking-[0.06em] truncate">{product.sub_category || fallbackLabel}</p>
        <h4 className="mt-1 text-[14px] font-semibold text-[#2D2926] line-clamp-2 leading-snug min-h-[2.75em]">{product.name}</h4>
        <div className="mt-auto pt-2.5">
          <PriceStack price={product.selling_price} discount={discount} />
        </div>
      </div>
    </button>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  return <span className="text-[18px] font-bold text-slate-500">{initial}</span>;
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
              <span className="text-[12px] font-bold uppercase tracking-[0.08em]">Care & Beauty Clinic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Onboarding Form/Menu (Responsive) */}
      <div className="flex-1 flex flex-col justify-between px-6 py-12 lg:py-16 max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[42%] bg-white lg:shadow-2xl lg:shadow-black/5">
        
        {/* Brand logo at the top */}
        <div className="flex flex-col items-center pt-2 lg:pt-6">
          <div className="w-[76px] h-[76px] rounded-[24px] bg-white border border-[#EEDFE3] flex items-center justify-center overflow-hidden mb-3 shadow-lg shadow-rose-100/70 transition-transform hover:scale-105 duration-300">
            <Image src="/lbqueen_logo.png" alt="LBQueen Logo" width={56} height={56} className="object-contain" style={{ width: 'auto', height: 'auto' }} />
          </div>
          <p className="font-bold text-[18px] tracking-tight text-[#A83960]">LBQueen</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] font-semibold text-[#766B68]">Care & Beauty</p>
        </div>

        {/* Mobile Only: Looping Images (Horizontal Layout, rounded, 2s interval) */}
        <div className="lg:hidden flex items-center justify-center my-6 w-full">
          <div className="relative w-full aspect-[16/10] rounded-[32px] overflow-hidden shadow-xl shadow-rose-200/40 bg-white p-1.5 border border-[#EEDFE3]">
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
        <div className="text-center px-2 sm:px-4 my-6 lg:my-8 min-h-[132px] flex flex-col justify-center" aria-live="polite">
          <h2 className="text-[24px] font-bold text-[#2D2926] tracking-tight leading-snug mb-3 transition-all duration-500 lg:text-[28px]">
            {onboardSlides[onboardSlide].title}
          </h2>
          <p className="text-[14px] leading-relaxed text-[#5F5552] transition-all duration-500 max-w-[320px] mx-auto lg:max-w-[380px] lg:text-[15px]">
            {onboardSlides[onboardSlide].desc}
          </p>
          
          {/* Bullet Indicators */}
          <div className="flex justify-center gap-1.5 mt-6" aria-hidden="true">
            {onboardSlides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  onboardSlide === i ? "w-6 bg-[#C94F78]" : "w-1.5 bg-[#E6CFD7]"
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 w-full px-0 sm:px-2 lg:px-8 max-w-[380px] mx-auto">
          <button 
            type="button"
            onClick={() => router.push("/login")}
            className="group w-full h-[56px] rounded-2xl text-white text-[16px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:shadow-xl hover:shadow-rose-200/70 shadow-lg shadow-rose-200/60 cursor-pointer animate-in fade-in duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/30"
            style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)' }}
          >
            Masuk
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>

          <button 
            type="button"
            onClick={() => router.push("/register")}
            className="w-full min-h-[56px] px-4 rounded-2xl text-[14px] flex flex-wrap items-center justify-center gap-x-1 transition-all active:scale-[0.98] border border-[#EEDFE3] bg-white hover:bg-[#FDF2F5] hover:border-[#C94F78]/30 cursor-pointer animate-in fade-in duration-350 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20"
          >
            <span className="font-medium text-[#766B68]">Belum ada akun?</span>
            <span className="font-bold text-[#A83960]">Daftar dulu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
