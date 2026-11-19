"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { PageControls } from "@/components/PageControls";
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal";
import { CatalogUnavailable } from "@/components/home/CatalogUnavailable";
import { ClinicInfoCard } from "@/components/home/ClinicInfoCard";
import { HomeCatalog } from "@/components/home/HomeCatalog";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";
import { MemberStrip } from "@/components/home/MemberStrip";
import { MemberVouchers } from "@/components/home/MemberVouchers";
import { OnboardingView } from "@/components/home/OnboardingView";
import { PointsCard } from "@/components/home/PointsCard";
import { CATALOG_SHORTCUTS, ServiceGrid } from "@/components/home/ServiceGrid";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useProductSelection } from "@/hooks/useProductSelection";
import { loadCatalog } from "@/lib/catalog";
import { tierOf } from "@/lib/membership";

export default function CustomerPortalPage() {
  const router = useRouter();
  const { customer, loading: customerLoading, error: customerError } = useCustomer();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const selection = useProductSelection(customer, { loginToAdd: true });
  const changePage = (next: number) => {
    setPage(next);
    document
      .getElementById("katalog-beranda")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const debouncedSearch = useDebounce(searchQuery, 400);

  const {
    data,
    isLoading: loading,
    isValidating,
    error: catalogError,
    mutate,
  } = useSWR(
    ["/api/catalog", debouncedSearch, page],
    ([, search, page]) => loadCatalog({ search, category: search ? "semua" : "promo", page }),
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  const products = data?.products || [];
  const allVouchers = data?.allVouchers || [];

  useEffect(() => {
    [...CATALOG_SHORTCUTS, "/promo", "/cart", "/orders", "/profile", "/membership"].forEach(
      (path) => router.prefetch(path),
    );
  }, [router]);

  if ((loading && customer) || customerLoading) return <HomeSkeleton />;

  if (customerError)
    return (
      <p role="alert" className="p-6 text-center">
        {customerError.message}
      </p>
    );

  if (!customer) return <OnboardingView />;

  if (catalogError) return <CatalogUnavailable onRetry={() => mutate()} />;

  const searching = !!searchQuery;

  return (
    <div className="min-h-screen animate-in fade-in duration-500">
      <HomeHero
        customer={customer}
        searchQuery={searchQuery}
        onSearch={(value) => {
          setPage(1);
          setSearchQuery(value);
        }}
      />

      <div className="px-4 sm:px-8 lg:px-12 space-y-7 lg:space-y-9">
        {!searching && (
          <>
            <PointsCard
              points={customer.points}
              voucherCount={allVouchers.length}
              cartCount={totalItems}
            />
            <ServiceGrid voucherCount={allVouchers.length} cartCount={totalItems} />
            <MemberStrip isMember={customer.is_member} tierName={tierOf(customer).name} />
            <MemberVouchers vouchers={allVouchers} />
          </>
        )}

        <HomeCatalog
          products={products}
          page={page}
          loading={loading}
          searching={searching}
          onOpen={selection.open}
        />

        {(page > 1 || data?.hasMore) && (
          <PageControls
            page={page}
            hasMore={!!data?.hasMore}
            loading={isValidating}
            onChange={changePage}
          />
        )}

        {!searching && <ClinicInfoCard />}
      </div>

      <ProductDetailModal selection={selection} />
    </div>
  );
}
