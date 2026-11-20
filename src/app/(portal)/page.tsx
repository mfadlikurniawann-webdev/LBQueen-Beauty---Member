"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { PageControls } from "@/components/PageControls";
import dynamic from "next/dynamic";
import { ActiveOrderCard } from "@/components/home/ActiveOrderCard";
import { CatalogUnavailable } from "@/components/home/CatalogUnavailable";
import { HomeCatalog } from "@/components/home/HomeCatalog";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";
import { MemberStrip } from "@/components/home/MemberStrip";
import { MenuPanel } from "@/components/home/MenuPanel";
import { OnboardingView } from "@/components/home/OnboardingView";
import { ProductRail } from "@/components/home/ProductRail";
import { CATALOG_SHORTCUTS } from "@/components/home/ServiceGrid";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useProductSelection } from "@/hooks/useProductSelection";
import { loadCatalog, priceRange, type CatalogProduct } from "@/lib/catalog";
import { loadMyVouchers } from "@/lib/vouchers";
import { TREATMENT_TYPE } from "@/lib/constants";

// Lembar detail baru dipakai saat produk diketuk; pisahkan dari bundel awal halaman.
const ProductDetailSheet = dynamic(
  () => import("@/components/catalog/ProductDetailSheet").then((m) => m.ProductDetailSheet),
  { ssr: false },
);

const RAIL_OPTIONS = { revalidateOnFocus: false, keepPreviousData: true };

function bestSaving(products: CatalogProduct[]) {
  return products.reduce((max, p) => {
    const { min, discountMin } = priceRange(p);
    if (!discountMin || !min) return max;
    return Math.max(max, Math.round((discountMin / min) * 100));
  }, 0);
}

export default function CustomerPortalPage() {
  const router = useRouter();
  const { customer, loading: customerLoading, error: customerError } = useCustomer();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const selection = useProductSelection(customer, { loginToAdd: true });
  const debouncedSearch = useDebounce(searchQuery, 400);
  const searching = !!debouncedSearch;

  const {
    data,
    isLoading: loading,
    isValidating,
    error: catalogError,
    mutate,
  } = useSWR(
    // Pengunjung yang sudah pasti belum login hanya melihat layar sambutan.
    customer || customerLoading ? ["/api/catalog", debouncedSearch, searching ? page : 1] : null,
    ([, search, page]) => loadCatalog({ search, category: search ? "semua" : "promo", page }),
    RAIL_OPTIONS,
  );
  const enabled = !!customer && !searching;
  const treatments = useSWR(
    enabled ? ["home-rail", TREATMENT_TYPE] : null,
    () => loadCatalog({ category: TREATMENT_TYPE, page: 1 }),
    RAIL_OPTIONS,
  );
  const skincare = useSWR(
    enabled ? ["home-rail", "produk"] : null,
    () => loadCatalog({ category: "Product Care & Beauty", page: 1 }),
    RAIL_OPTIONS,
  );

  const myVouchers = useSWR(
    customer ? ["my-vouchers", customer.id] : null,
    loadMyVouchers,
    RAIL_OPTIONS,
  );
  const products = data?.products || [];

  useEffect(() => {
    [...CATALOG_SHORTCUTS, "/promo", "/cart", "/orders", "/profile", "/membership"].forEach(
      (path) => router.prefetch(path),
    );
  }, [router]);

  if ((loading && customer && !data) || customerLoading) return <HomeSkeleton />;

  if (customerError)
    return (
      <p role="alert" className="p-6 text-center">
        {customerError.message}
      </p>
    );

  if (!customer) return <OnboardingView />;

  if (catalogError) return <CatalogUnavailable onRetry={() => mutate()} />;

  const saving = bestSaving(products);
  const changePage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <HomeHeader
        customer={customer}
        searchQuery={searchQuery}
        onSearch={(value) => {
          setPage(1);
          setSearchQuery(value);
        }}
      />

      {searching ? (
        <div className="px-4 sm:px-8 lg:px-12 pt-3">
          <HomeCatalog
            products={products}
            page={page}
            loading={isValidating && !data}
            searching
            onOpen={selection.open}
          />
          <PageControls
            page={page}
            hasMore={!!data?.hasMore}
            loading={isValidating}
            onChange={changePage}
          />
        </div>
      ) : (
        <>
          <HomeHero customer={customer}>
            <MenuPanel
              customer={customer}
              voucherCount={myVouchers.data?.length ?? 0}
              cartCount={totalItems}
            />
          </HomeHero>

          <div className="px-4 sm:px-8 lg:px-12 pt-4 space-y-6 lg:space-y-8">
            {!customer.is_member && <MemberStrip />}
            <ActiveOrderCard customerId={customer.id} />
            <ProductRail
              band
              title="Promo Spesial"
              subtitle={saving > 0 ? `Hemat hingga ${saving}%` : undefined}
              href="/category/promo"
              products={products}
              onOpen={selection.open}
            />
            <ProductRail
              title="Treatment Klinik"
              href="/category/layanan"
              products={treatments.data?.products ?? []}
              loading={treatments.isLoading}
              onOpen={selection.open}
            />
            <ProductRail
              title="Produk Skincare"
              href="/category/produk"
              products={skincare.data?.products ?? []}
              loading={skincare.isLoading}
              onOpen={selection.open}
            />
          </div>
        </>
      )}

      <ProductDetailSheet selection={selection} />
    </div>
  );
}
