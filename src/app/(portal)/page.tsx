"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { PageControls } from "@/components/PageControls";
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal";
import { CatalogUnavailable } from "@/components/home/CatalogUnavailable";
import { CategoryShortcuts, HOME_CATEGORIES } from "@/components/home/CategoryShortcuts";
import { HomeCatalog } from "@/components/home/HomeCatalog";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";
import { JoinMemberCard } from "@/components/home/JoinMemberCard";
import { MembershipStatus } from "@/components/home/MembershipStatus";
import { MemberVouchers } from "@/components/home/MemberVouchers";
import { OnboardingView } from "@/components/home/OnboardingView";
import { PROMO_SLIDES, PromoCarousel } from "@/components/home/PromoCarousel";
import { useDebounce } from "@/hooks/useDebounce";
import { useProductSelection } from "@/hooks/useProductSelection";
import { loadCatalog } from "@/lib/catalog";
import { useCustomer } from "@/context/CustomerContext";

export default function CustomerPortalPage() {
  const router = useRouter();
  const { customer, loading: customerLoading, error: customerError } = useCustomer();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
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
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  const products = data?.products || [];
  const allVouchers = data?.allVouchers || [];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    HOME_CATEGORIES.forEach((cat) => router.prefetch(`/category/${cat.id}`));
    ["/cart", "/orders", "/profile"].forEach((path) => router.prefetch(path));
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

  return (
    <div className="portal-home min-h-screen bg-[#FDFBFB] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <HomeHero
        name={customer?.name}
        searchQuery={searchQuery}
        onSearch={(value) => {
          setPage(1);
          setSearchQuery(value);
        }}
      />

      <PromoCarousel activeSlide={activeSlide} />

      <CategoryShortcuts />

      <div className="portal-section">
        {!customer || !customer.is_member ? (
          <JoinMemberCard />
        ) : (
          <div>
            <MembershipStatus
              tier={customer.membership_type || "Member"}
              points={customer.points}
            />
          </div>
        )}
        <MemberVouchers vouchers={allVouchers} />
      </div>

      <HomeCatalog
        products={products}
        page={page}
        loading={loading}
        searching={!!searchQuery}
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

      <ProductDetailModal selection={selection} />
    </div>
  );
}
