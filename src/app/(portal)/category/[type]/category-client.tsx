"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { notFound, useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageControls } from "@/components/PageControls";
import dynamic from "next/dynamic";
import { CatalogLoadError } from "@/components/category/CatalogLoadError";
import { CategoryFilters } from "@/components/category/CategoryFilters";
import { CategoryGrid } from "@/components/category/CategoryGrid";
import { CategoryHeader } from "@/components/category/CategoryHeader";
import {
  LEGACY_SECTIONS,
  SECTIONS,
  type CatalogTab,
  type SectionSlug,
} from "@/components/category/sections";
import { useDebounce } from "@/hooks/useDebounce";
import { useProductSelection } from "@/hooks/useProductSelection";
import { loadCatalog } from "@/lib/catalog";
import { useCustomer } from "@/context/CustomerContext";

// Lembar detail baru dipakai saat produk diketuk; pisahkan dari bundel awal halaman.
const ProductDetailSheet = dynamic(
  () => import("@/components/catalog/ProductDetailSheet").then((m) => m.ProductDetailSheet),
  { ssr: false },
);

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
  const slug = (rawType in SECTIONS ? rawType : LEGACY_SECTIONS[rawType]) as
    SectionSlug | undefined;
  if (!slug) notFound();
  const section = SECTIONS[slug];

  const page = Math.min(100000, Math.max(1, Number(searchParams.get("page")) || 1));
  const setPage = (next: number) => {
    const query = new URLSearchParams(searchParams.toString());
    if (next > 1) query.set("page", String(next));
    else query.delete("page");
    const qs = query.toString();
    if (next !== page) router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const resetPage = () => {
    if (page > 1) router.replace(pathname, { scroll: false });
  };
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);
  const { customer } = useCustomer();
  const [searchQuery, setSearchQuery] = useState("");

  const [activeSubCat, updateSubCat] = useState<string | null>(null);
  const setActiveSubCat = (value: string | null) => {
    resetPage();
    updateSubCat(value);
  };
  const [activeTab, updateTab] = useState<CatalogTab>("semua");
  const setActiveTab = (value: CatalogTab) => {
    resetPage();
    updateTab(value);
  };

  const selection = useProductSelection(customer);

  const debouncedSearch = useDebounce(searchQuery, 400);
  const {
    data,
    isLoading: loading,
    isValidating,
    error,
    mutate,
  } = useSWR(
    ["catalog-category", section.category, debouncedSearch, activeTab, activeSubCat, page],
    ([, category, search, mode, subcategory, page]) =>
      loadCatalog({ category, search, mode, subcategory, page }),
    { keepPreviousData: true },
  );
  const products = useMemo(() => data?.products ?? [], [data?.products]);

  const subCats = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.sub_category) cats.add(p.sub_category);
    });
    return Array.from(cats);
  }, [products]);

  return (
    <div className="min-h-screen bg-transparent font-sans pb-6 max-w-7xl mx-auto md:px-8">
      <CategoryHeader section={section} page={page} />

      <div className="px-5 mt-6">
        <CategoryFilters
          section={section}
          searchQuery={searchQuery}
          onSearch={(value) => {
            resetPage();
            setSearchQuery(value);
          }}
          subCats={subCats}
          activeSubCat={activeSubCat}
          onSubCat={setActiveSubCat}
          activeTab={activeTab}
          onTab={setActiveTab}
        />
        <CategoryGrid products={products} loading={loading} onOpen={selection.open} />
      </div>

      {error && <CatalogLoadError onRetry={() => mutate()} />}
      <PageControls
        page={page}
        hasMore={!!data?.hasMore}
        loading={isValidating}
        onChange={setPage}
      />
      <ProductDetailSheet selection={selection} />
    </div>
  );
}
