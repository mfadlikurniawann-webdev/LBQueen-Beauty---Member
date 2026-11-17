"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import { loadCatalog } from "@/lib/catalog";
import { useDebounce } from "@/hooks/useDebounce";
import { PageControls } from "@/components/PageControls";
import {
  ChevronLeft, Plus, Minus, ShoppingBag, ArrowRight, Search as SearchIcon, AlertTriangle, Scissors, BadgePercent
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

type ProductVariant = {
  id: number; product_id: number; variant_name: string; price: number; stock: number;
};

type Product = {
  id: number; name: string; type: string; selling_price: number;
  image_url: string | null; product_code: string; is_set: boolean;
  sub_category?: string; voucher_discount?: number; variants?: ProductVariant[];
};

const WA_NUMBER = "6282176171448";

const SECTIONS = {
  promo: { category: "promo", title: "Promo Spesial", subtitle: "Potongan harga pilihan", icon: BadgePercent, tabs: ["semua", "set"] },
  layanan: { category: "Treatment Care & Beauty", title: "Layanan", subtitle: "Treatment di klinik", icon: Scissors, tabs: ["semua", "promo", "set"] },
  produk: { category: "Product Care & Beauty", title: "Produk", subtitle: "Skincare & perawatan", icon: ShoppingBag, tabs: ["semua", "promo", "set"] },
} as const;
const LEGACY: Record<string, keyof typeof SECTIONS> = { "Treatment Care & Beauty": "layanan", "Product Care & Beauty": "produk" };
const TAB_LABEL: Record<string, string> = { semua: "Semua", promo: "Promo", set: "Paket" };

function ItemPlaceholder({ type, compact = false }: { type: string; compact?: boolean }) {
  const Icon = type === "Treatment Care & Beauty" ? Scissors : ShoppingBag;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#F9E1E9] via-[#FCEFF3] to-[#FAF7F5]" aria-hidden="true">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#C94F78]/10 blur-xl" />
      <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-[#D4AF37]/15 blur-xl" />
      <div className={`relative ${compact ? "w-12 h-12" : "w-14 h-14"} rounded-full bg-white/90 border border-[#EEDFE3] shadow-sm flex items-center justify-center`}>
        <Icon className={`${compact ? "w-5 h-5" : "w-6 h-6"} text-[#A83960]`} strokeWidth={1.75} />
      </div>
      {!compact && <span className="relative text-[11px] font-bold uppercase tracking-[0.12em] text-[#A83960]/80">LBQueen</span>}
    </div>
  );
}

export default function CategoryClient() {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
      <CategoryContent />
    </Suspense>
  );
}

function CategoryContent() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawType = decodeURIComponent(params.type as string);
  const slug = (rawType in SECTIONS ? rawType : LEGACY[rawType]) as keyof typeof SECTIONS | undefined;
  if (!slug) notFound();
  const section = SECTIONS[slug];
  const decodedType = section.category;
  const SectionIcon = section.icon;

  const { cart, addToCart } = useCart();
  const page = Math.min(100000, Math.max(1, Number(searchParams.get("page")) || 1));
  const setPage = (next: number) => {
    const query = new URLSearchParams(searchParams.toString());
    if (next > 1) query.set("page", String(next)); else query.delete("page");
    const qs = query.toString();
    if (next !== page) router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const resetPage = () => {
    if (page > 1) router.replace(pathname, { scroll: false });
  };
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);
  const [customer,       setCustomer]       = useState<any>(null);
  const [searchQuery,    setSearchQuery]    = useState("");

  const [activeSubCat, updateSubCat] = useState<string | null>(null);
  const setActiveSubCat = (value: string | null) => { resetPage(); updateSubCat(value); };
  const [activeTab, updateTab] = useState<"semua" | "promo" | "set">("semua");
  const setActiveTab = (value: "semua" | "promo" | "set") => { resetPage(); updateTab(value); };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectionQty,    setSelectionQty]    = useState(1);
  const [isAgreed,        setIsAgreed]        = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 400);
  const { data, isLoading: loading, isValidating, error, mutate } = useSWR(
    ["catalog-category", decodedType, debouncedSearch, activeTab, activeSubCat, page],
    ([, category, search, mode, subcategory, page]) => loadCatalog({ category, search, mode, subcategory, page }),
    { keepPreviousData: true },
  );
  const products = data?.products || [];
  useEffect(() => {
    const stored = localStorage.getItem("lbqueen_customer");
    if (stored) { try { setCustomer(JSON.parse(stored)); } catch {} }
  }, []);

  const filtered = products;

  const subCats = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => { if (p.sub_category) cats.add(p.sub_category); });
    return Array.from(cats);
  }, [products]);

  const handleOpenSelection = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : null);
    setSelectionQty(1);
    setIsAgreed(false);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, selectionQty, selectedVariant);
    setSelectedProduct(null);
  };

  const handleBuyNow = () => {
    if (!selectedProduct) return;
    if (!customer) { router.push("/login"); return; }
    addToCart(selectedProduct, selectionQty, selectedVariant);
    setSelectedProduct(null);
    router.push("/cart");
  };

  const chipClass = (active: boolean) =>
    `whitespace-nowrap px-4 min-h-10 rounded-full text-[13px] font-semibold capitalize transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20 ${
      active
        ? "bg-gradient-to-br from-[#C94F78] to-[#A83960] text-white shadow-md shadow-rose-200/60"
        : "bg-white text-[#5F5552] border border-[#EEDFE3] hover:border-[#C94F78]/40 hover:text-[#A83960]"
    }`;

  return (
    <div className="min-h-screen bg-transparent font-sans pb-6 max-w-7xl mx-auto md:px-8">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#EEDFE3] px-5 pt-12 pb-4 flex items-center gap-3.5">
        <button type="button" aria-label="Kembali ke beranda" onClick={() => router.push("/", { scroll: true })} className="w-11 h-11 shrink-0 rounded-2xl bg-[#FDF2F5] border border-[#EEDFE3] flex items-center justify-center text-[#A83960] hover:bg-[#C94F78] hover:text-white transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-[#C94F78] to-[#9B3055] flex items-center justify-center text-white shadow-md shadow-rose-200/60" aria-hidden="true">
          <SectionIcon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-[18px] font-bold text-[#2D2926] leading-tight tracking-tight line-clamp-2">{section.title}</h1>
          <p className="mt-0.5 text-[12px] font-medium text-[#766B68] line-clamp-1">{section.subtitle} · Halaman {page}</p>
        </div>
      </header>

      <div className="px-5 mt-6">
        {/* Search */}
        <div className="relative mb-5">
           <SearchIcon aria-hidden="true" className="w-5 h-5 text-[#A83960] absolute left-4 top-1/2 -translate-y-1/2" />
           <input
             type="text"
             aria-label={`Cari di ${section.title}`}
             placeholder={`Cari di ${section.title}...`}
             className="w-full bg-white border border-[#EEDFE3] rounded-2xl py-4 pl-12 pr-4 text-[15px] font-medium text-[#2D2926] placeholder:text-[#8C8280] shadow-sm focus:outline-none focus:border-[#C94F78] focus:ring-4 focus:ring-rose-100 transition-all"
             value={searchQuery}
             onChange={(e) => { resetPage(); setSearchQuery(e.target.value); }}
           />
        </div>

        {/* Sub Categories Chips */}
        {subCats.length > 0 && (
          <div className="mb-4 -mx-5 px-5 flex gap-2 overflow-x-auto no-scrollbar py-1" aria-label="Sub kategori">
             <button
                type="button"
                aria-pressed={!activeSubCat}
                onClick={() => setActiveSubCat(null)}
                className={chipClass(!activeSubCat)}
             >
                Semua
             </button>
             {subCats.map(sub => (
               <button
                 type="button"
                 key={sub}
                 aria-pressed={activeSubCat === sub}
                 onClick={() => setActiveSubCat(activeSubCat === sub ? null : sub)}
                 className={chipClass(activeSubCat === sub)}
               >
                 {sub}
               </button>
             ))}
          </div>
        )}

        {/* STICKY TAB FILTER */}
        <div className="sticky top-[88px] z-40 bg-[#FDFBFB]/90 backdrop-blur-md -mx-5 px-5 py-3 mb-5">
          <div className={`grid ${section.tabs.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-1 rounded-2xl border border-[#EEDFE3] bg-white p-1 shadow-sm max-w-sm`} role="group" aria-label="Filter katalog">
           {section.tabs.map((tab) => (
             <button
               type="button"
               key={tab}
               aria-pressed={activeTab === tab}
               onClick={() => setActiveTab(tab as any)}
               className={`min-h-10 rounded-xl text-[13px] font-bold capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94F78]/30 ${
                 activeTab === tab
                   ? "bg-[#FDF2F5] text-[#A83960] shadow-[inset_0_0_0_1px_rgba(201,79,120,0.25)]"
                   : "text-[#5F5552] hover:text-[#A83960]"
               }`}
             >
               {TAB_LABEL[tab]}
             </button>
           ))}
          </div>
        </div>

        {/* PRODUCT GRID */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4" aria-busy="true">
             <span className="sr-only">Memuat...</span>
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="rounded-[24px] border border-[#EEDFE3] bg-white p-2.5">
                 <div className="aspect-square rounded-[18px] bg-[#F3E7EA] animate-pulse" />
                 <div className="mt-3 h-3 w-1/2 rounded-full bg-[#F3E7EA] animate-pulse" />
                 <div className="mt-2 h-4 w-4/5 rounded-full bg-[#F3E7EA] animate-pulse" />
                 <div className="mt-3 mb-1 h-4 w-2/3 rounded-full bg-[#F3E7EA] animate-pulse" />
               </div>
             ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 px-6 text-center flex flex-col items-center bg-white border border-[#EEDFE3] rounded-[32px]">
             <div className="w-16 h-16 bg-[#FDF2F5] rounded-full flex items-center justify-center mb-4">
                <SearchIcon className="w-7 h-7 text-[#A83960]" aria-hidden="true" />
             </div>
             <p className="text-[15px] font-bold text-[#2D2926]">Produk tidak ditemukan</p>
             <p className="mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-[#766B68]">Coba kata kunci lain atau ubah filter yang dipilih.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
             {filtered.map(product => {
               const hasPromo = (product.voucher_discount || 0) > 0;
               const displayPrice = product.selling_price - (product.voucher_discount || 0);
               return (
                 <button type="button" key={product.id} onClick={() => handleOpenSelection(product)}
                   className="text-left bg-white rounded-[24px] border border-[#EEDFE3] p-2.5 flex flex-col group active:scale-[0.98] transition-all shadow-[0_6px_18px_-10px_rgba(168,57,96,0.28)] hover:shadow-lg hover:shadow-rose-100 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/25">
                    <div className="aspect-square rounded-[18px] overflow-hidden relative mb-3">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <ItemPlaceholder type={product.type} />
                      )}
                      {hasPromo && (
                         <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 shadow-sm">
                           <BadgePercent className="w-3 h-3" aria-hidden="true" />
                           Promo
                         </span>
                      )}
                      <span aria-hidden="true" className="absolute bottom-2 right-2 w-8 h-8 rounded-xl bg-white/95 flex items-center justify-center text-[#A83960] group-hover:bg-[#C94F78] group-hover:text-white transition-all shadow-sm">
                         <Plus className="w-4 h-4" />
                      </span>
                    </div>

                    <div className="px-1 pb-1 flex-1 flex flex-col">
                       <p className="text-[11px] font-semibold text-[#A83960] uppercase tracking-[0.06em] truncate">{product.sub_category || "Umum"}</p>
                       <p className="mt-1 text-[14px] font-semibold text-[#2D2926] line-clamp-2 leading-snug min-h-[2.75em]">{product.name}</p>
                       <div className="mt-auto pt-2 tabular-nums">
                          {hasPromo && <p className="text-[12px] font-medium text-[#766B68] line-through leading-none mb-1">Rp {product.selling_price.toLocaleString("id-ID")}</p>}
                          <p className="text-[15px] font-bold text-[#A83960] leading-tight">Rp {displayPrice.toLocaleString("id-ID")}</p>
                       </div>
                    </div>
                 </button>
               );
             })}
          </div>
        )}
      </div>

      {/* ── VARIANT SELECTION SHEET ── */}
      {error && (
        <div role="alert" className="mx-5 mt-6 rounded-[32px] border border-[#EEDFE3] bg-white p-6 text-center">
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-[#FDF2F5] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-[#A83960]" aria-hidden="true" />
          </div>
          <p className="text-[15px] font-semibold text-[#2D2926]">Katalog belum dapat dimuat.</p>
          <button type="button" className="btn-pink mt-4" onClick={() => mutate()}>Coba lagi</button>
        </div>
      )}
      <PageControls page={page} hasMore={!!data?.hasMore} loading={isValidating} onChange={setPage} />
      {selectedProduct && (() => {
        const basePrice = selectedVariant ? selectedVariant.price : selectedProduct.selling_price;
        const discount = selectedProduct.voucher_discount || 0;
        const blocked = selectedProduct.type === "Treatment Care & Beauty" && !isAgreed;
        return (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div role="dialog" aria-modal="true" aria-labelledby="category-sheet-title" className="relative w-full sm:max-w-xl sm:mx-auto bg-white rounded-t-[32px] shadow-2xl max-h-[90vh] flex flex-col px-5 pt-4 pb-6 sm:px-8 sm:pb-8 animate-in slide-in-from-bottom-20 duration-300">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-1.5 bg-[#EEDFE3] rounded-full" />
            </div>

            <div className="flex gap-4 sm:gap-5 mb-6 pb-6 border-b border-[#F3E4E9]">
               <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[24px] overflow-hidden border border-[#EEDFE3] shrink-0 relative">
                  {selectedProduct.image_url ? (
                    <Image src={selectedProduct.image_url} alt={selectedProduct.name} fill className="object-cover" />
                  ) : <ItemPlaceholder type={selectedProduct.type} compact />}
               </div>
               <div className="flex-1 min-w-0 pt-1">
                  <span className="inline-block max-w-full truncate rounded-full bg-[#FDF2F5] px-2.5 py-0.5 text-[11px] font-semibold text-[#A83960] mb-2">{selectedProduct.type}</span>
                  <h3 id="category-sheet-title" className="text-[17px] sm:text-lg font-bold text-[#2D2926] leading-snug mb-2 line-clamp-3">{selectedProduct.name}</h3>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums">
                     <span className="text-[20px] font-bold text-[#A83960]">
                        Rp {(basePrice - discount).toLocaleString("id-ID")}
                     </span>
                     {discount > 0 && (
                       <span className="text-[13px] font-medium text-[#766B68] line-through">Rp {basePrice.toLocaleString("id-ID")}</span>
                     )}
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
               {/* Variants */}
               {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                 <div>
                    <h4 className="text-[13px] font-bold text-[#2D2926] uppercase tracking-[0.08em] mb-3">Pilih Varian</h4>
                    <div className="flex flex-wrap gap-2.5">
                       {selectedProduct.variants.map((v) => (
                         <button
                           type="button"
                           key={v.id}
                           aria-pressed={selectedVariant?.id === v.id}
                           onClick={() => setSelectedVariant(v)}
                           className={`px-4 min-h-11 rounded-2xl text-[13px] font-bold transition-all border-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20 ${
                             selectedVariant?.id === v.id
                               ? "bg-[#C94F78] text-white border-[#C94F78] shadow-lg shadow-rose-100"
                               : "bg-white text-[#2D2926] border-[#EEDFE3] hover:border-[#C94F78]/40 hover:text-[#A83960]"
                           }`}
                         >
                           {v.variant_name}
                         </button>
                       ))}
                    </div>
                 </div>
               )}

                {/* Quantity */}
               <div className="flex items-center justify-between gap-4">
                  <h4 className="text-[13px] font-bold text-[#2D2926] uppercase tracking-[0.08em]">Jumlah</h4>
                  <div className="flex items-center gap-2 bg-[#FDF7F9] rounded-2xl p-1.5 border border-[#EEDFE3]">
                     <button type="button" aria-label="Kurangi jumlah" onClick={() => setSelectionQty(Math.max(1, selectionQty - 1))} className="w-10 h-10 rounded-xl bg-white border border-[#EEDFE3] flex items-center justify-center text-[#A83960] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94F78]/30"><Minus className="w-4 h-4" /></button>
                     <span className="text-[17px] font-bold text-[#2D2926] w-8 text-center tabular-nums" aria-live="polite">{selectionQty}</span>
                     <button type="button" aria-label="Tambah jumlah" onClick={() => setSelectionQty(Math.min(10, selectionQty + 1))} className="w-10 h-10 rounded-xl bg-[#C94F78] flex items-center justify-center text-white shadow-sm active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94F78]/30"><Plus className="w-4 h-4" /></button>
                  </div>
               </div>

               {/* Treatment Reminder */}
               {selectedProduct.type === "Treatment Care & Beauty" && (
                 <div className="bg-[#FBF7ED] rounded-[24px] p-4 border border-[#D4AF37]/30 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                       <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
                         <AlertTriangle className="w-5 h-5 text-[#8A6A0F]" aria-hidden="true" />
                       </div>
                       <p className="text-[13px] text-[#4A4340] leading-relaxed">
                         <strong className="block mb-1 text-[14px] text-[#7A5C0B]">Perhatian Sebelum Treatment!</strong>
                         H-7 sebelum dan juga H+7 setelah treatment dilarang mengkonsumsi alkohol dan obat-obatan terlarang. Pasien harus jujur akan kondisi tubuh ke therapist. Jika berbohong risiko ditanggung sendiri.
                       </p>
                    </div>
                    <label className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#D4AF37]/25 cursor-pointer">
                       <input
                         type="checkbox"
                         checked={isAgreed}
                         onChange={(e) => setIsAgreed(e.target.checked)}
                         className="w-5 h-5 shrink-0 rounded border-[#C9A43A] accent-[#C94F78] focus:ring-[#C94F78] bg-white"
                       />
                       <span className="text-[13px] font-semibold text-[#5E4708]">Saya mengerti & setuju</span>
                    </label>
                 </div>
               )}
            </div>

            {/* Bottom Buttons */}
            <div className="pt-5 mt-4 border-t border-[#F3E4E9] grid grid-cols-[1fr_2.2fr] gap-3">
               <button type="button" onClick={handleAddToCart} className="h-[56px] border-2 border-[#C94F78] text-[#A83960] bg-white hover:bg-[#FDF2F5] rounded-2xl font-bold text-[13px] tracking-[0.06em] flex items-center justify-center gap-2 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20">
                  <ShoppingBag className="w-5 h-5" aria-hidden="true" /> CART
               </button>
               <button
                 type="button"
                 onClick={handleBuyNow}
                 disabled={blocked}
                 className={`h-[56px] rounded-2xl font-bold text-[13px] tracking-[0.06em] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/25 ${
                   blocked
                     ? "bg-[#F3ECEE] text-[#8C8280] border border-[#EEDFE3] cursor-not-allowed shadow-none"
                     : "text-white bg-gradient-to-br from-[#C94F78] to-[#9B3055] shadow-xl shadow-rose-200/70"
                 }`}
               >
                  BELI SEKARANG <ArrowRight className="w-5 h-5" aria-hidden="true" />
               </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
