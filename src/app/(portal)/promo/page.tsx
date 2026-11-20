"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { BadgePercent, ChevronRight, Crown, Ticket } from "lucide-react";
import { PageControls } from "@/components/PageControls";
import { ProductCard } from "@/components/catalog/ProductCard";
import dynamic from "next/dynamic";
import { CatalogLoadError } from "@/components/category/CatalogLoadError";
import { IconChip } from "@/components/IconChip";
import { EmptyVouchers, VoucherTicket } from "@/components/promo/VoucherTicket";
import { SectionHeading } from "@/components/home/SectionHeading";
import { PageHero } from "@/components/portal/PageHero";
import { useCustomer } from "@/context/CustomerContext";
import { useProductSelection } from "@/hooks/useProductSelection";
import { loadCatalog } from "@/lib/catalog";
import { TREATMENT_TYPE } from "@/lib/constants";
import { tierOf } from "@/lib/membership";
import { loadMyVouchers } from "@/lib/vouchers";
import { cn } from "@/lib/utils";

// Lembar detail baru dipakai saat produk diketuk; pisahkan dari bundel awal halaman.
const ProductDetailSheet = dynamic(
  () => import("@/components/catalog/ProductDetailSheet").then((m) => m.ProductDetailSheet),
  { ssr: false },
);

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
  const myVouchers = useSWR(customer ? ["my-vouchers", customer.id] : null, loadMyVouchers, {
    revalidateOnFocus: false,
  });
  const vouchers = myVouchers.data ?? [];

  const changePage = (next: number) => {
    setPage(next);
    document
      .getElementById("katalog-promo")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen">
      <PageHero title="Promo" />

      <div className="px-4 sm:px-8 lg:px-12 pt-1 space-y-6 pb-6">
        <div data-reveal className="glass-lit spotlight rounded-[28px] p-4">
          <div className="grid grid-cols-2 divide-x divide-brand/12">
            <a href="#voucher-tersedia" className="flex items-center gap-3 pr-3 min-w-0">
              <IconChip icon={Ticket} tone="gold" size="md" />
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-ink leading-tight truncate tabular-nums">
                  {vouchers.length} voucher
                </span>
                <span className="block text-[13px] font-semibold text-brand-ink">
                  Lihat voucher
                </span>
              </span>
            </a>
            <Link
              href={customer ? "/membership" : "/login"}
              className="flex items-center gap-3 pl-3 min-w-0"
            >
              <IconChip icon={Crown} tone="rose" size="md" />
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-ink leading-tight truncate">
                  Membership
                </span>
                <span className="block text-[13px] font-semibold text-brand-ink truncate">
                  {customer ? tierOf(customer).name : "Masuk dulu"}
                </span>
              </span>
            </Link>
          </div>
          <Link
            href="/cart"
            className="chip-glass mt-4 flex items-center gap-3 rounded-full px-4 h-12 text-[15px] text-ink-3 hover:bg-fill/85 transition-colors"
          >
            <BadgePercent className="w-5 h-5 text-ink-3" aria-hidden="true" />
            <span className="flex-1 truncate">Masukkan kode promo di keranjang</span>
            <ChevronRight className="w-5 h-5 text-ink-3" aria-hidden="true" />
          </Link>
        </div>

        <section id="voucher-tersedia" data-reveal className="scroll-mt-6">
          <SectionHeading title="Voucher Saya" />
          {myVouchers.isLoading ? (
            <div className="skeleton-glass h-[118px] rounded-[22px]" />
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
                  "shrink-0 h-11 px-5 rounded-full text-[14px] font-semibold transition-all duration-300",
                  filter === f.id
                    ? "chip-active font-semibold"
                    : "chip-glass text-ink-2 hover:bg-fill/85",
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
                <div key={i} className="skeleton-glass h-[240px] rounded-[24px]" />
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
            <div className="glass py-12 px-6 text-center rounded-[28px]">
              <p className="text-[15px] font-semibold text-ink">
                Belum ada promo di kategori ini
              </p>
              <p className="text-[13px] text-ink-muted mt-1.5">
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

      <ProductDetailSheet selection={selection} />
    </div>
  );
}
