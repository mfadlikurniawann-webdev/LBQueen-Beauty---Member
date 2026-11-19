"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { BadgePercent, ChevronRight, Crown, Ticket } from "lucide-react";
import { PageControls } from "@/components/PageControls";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal";
import { CatalogLoadError } from "@/components/category/CatalogLoadError";
import { EmptyVouchers, VoucherTicket } from "@/components/home/MemberVouchers";
import { SectionHeading } from "@/components/home/SectionHeading";
import { PageHero } from "@/components/portal/PageHero";
import { useCustomer } from "@/context/CustomerContext";
import { useProductSelection } from "@/hooks/useProductSelection";
import { loadCatalog } from "@/lib/catalog";
import { TREATMENT_TYPE } from "@/lib/constants";
import { tierOf } from "@/lib/membership";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "semua", label: "Semua", category: "promo", mode: undefined },
  { id: "layanan", label: "Layanan", category: TREATMENT_TYPE, mode: "promo" },
  { id: "produk", label: "Produk", category: "Product Care & Beauty", mode: "promo" },
] as const;

export default function PromoPage() {
  const { customer } = useCustomer();
  const selection = useProductSelection(customer, { loginToAdd: true });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("semua");
  const [page, setPage] = useState(1);
  const active = FILTERS.find((f) => f.id === filter)!;

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    ["promo-page", active.category, active.mode, page],
    ([, category, mode, page]) => loadCatalog({ category, mode, page }),
    { keepPreviousData: true, revalidateOnFocus: false },
  );
  const products = data?.products ?? [];
  const vouchers = data?.allVouchers ?? [];

  const changePage = (next: number) => {
    setPage(next);
    document
      .getElementById("katalog-promo")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen">
      <PageHero title="Promo" subtitle="Voucher dan potongan harga pilihan" />

      <div className="px-4 sm:px-8 lg:px-12 space-y-7 pb-6">
        <div className="rounded-[22px] bg-white border border-[#F0E4E8] p-4 shadow-[0_10px_30px_-18px_rgba(122,34,64,0.4)]">
          <div className="grid grid-cols-2 divide-x divide-[#F0E4E8]">
            <a href="#voucher-tersedia" className="flex items-center gap-3 pr-3 min-w-0">
              <span className="w-11 h-11 shrink-0 rounded-full bg-[#FFE7DE] flex items-center justify-center">
                <Ticket className="w-5 h-5 text-[#E0663A]" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-bold text-[#2D2926] leading-tight truncate tabular-nums">
                  {vouchers.length} voucher
                </span>
                <span className="block text-[13px] font-semibold text-[#2F8F5B]">Pakai, yuk!</span>
              </span>
            </a>
            <Link
              href={customer ? "/membership" : "/login"}
              className="flex items-center gap-3 pl-3 min-w-0"
            >
              <span className="w-11 h-11 shrink-0 rounded-full bg-[#FFF4D1] flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#B8861A]" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-bold text-[#2D2926] leading-tight truncate">
                  Membership
                </span>
                <span className="block text-[13px] font-semibold text-[#2F8F5B] truncate">
                  {customer ? tierOf(customer).name : "Masuk dulu"}
                </span>
              </span>
            </Link>
          </div>
          <Link
            href="/cart"
            className="mt-4 flex items-center gap-3 rounded-full border border-[#E6D3DA] bg-[#FBF7F8] px-4 h-12 text-[15px] text-[#766B68]"
          >
            <BadgePercent className="w-5 h-5 text-[#5F5552]" aria-hidden="true" />
            <span className="flex-1 truncate">Masukkan kode promo di keranjang</span>
            <ChevronRight className="w-5 h-5 text-[#5F5552]" aria-hidden="true" />
          </Link>
        </div>

        <section id="voucher-tersedia" className="scroll-mt-6">
          <SectionHeading title="Voucher Tersedia" />
          {isLoading && !data ? (
            <div className="h-[118px] rounded-[20px] bg-[#F3E7EA] animate-pulse" />
          ) : vouchers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vouchers.map((v) => (
                <VoucherTicket key={v.id} voucher={v} />
              ))}
            </div>
          ) : (
            <EmptyVouchers />
          )}
        </section>

        <section id="katalog-promo" className="scroll-mt-6">
          <SectionHeading title="Potongan Harga" />
          <div
            className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4"
            role="group"
            aria-label="Filter promo"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => {
                  setPage(1);
                  setFilter(f.id);
                }}
                className={cn(
                  "shrink-0 h-11 px-5 rounded-full border text-[14px] font-semibold transition-colors",
                  filter === f.id
                    ? "bg-[#FFE3EE] border-[#E9A9C0] text-[#A83960] font-bold"
                    : "bg-white border-[#E6D3DA] text-[#3F3734] hover:border-[#C94F78]/40",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {error ? (
            <CatalogLoadError onRetry={() => mutate()} />
          ) : isLoading ? (
            <div className="portal-catalog-grid" aria-busy="true">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[240px] rounded-[24px] bg-[#F3E7EA] animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="portal-catalog-grid">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  layout="home"
                  onOpen={() => selection.open(p)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 px-6 text-center bg-white border border-[#EEDFE3] rounded-[24px]">
              <p className="text-[15px] font-bold text-[#2D2926]">
                Belum ada promo di kategori ini
              </p>
              <p className="text-[13px] text-[#766B68] mt-1.5">
                Coba kategori lain atau cek kembali nanti.
              </p>
            </div>
          )}
        </section>

        <PageControls
          page={page}
          hasMore={!!data?.hasMore}
          loading={isValidating}
          onChange={changePage}
        />
      </div>

      <ProductDetailModal selection={selection} />
    </div>
  );
}
