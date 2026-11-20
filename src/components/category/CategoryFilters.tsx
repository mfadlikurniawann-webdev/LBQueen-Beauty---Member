import { Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TAB_LABEL, type CatalogTab, type Section } from "./sections";

const chipClass = (active: boolean) =>
  cn(
    "whitespace-nowrap px-4 min-h-11 rounded-full text-[13px] font-semibold capitalize transition-all",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/70",
    active ? "chip-active font-semibold" : "chip-glass text-ink-2 hover:text-brand-ink hover:bg-fill/85",
  );

export function CategoryFilters({
  section,
  searchQuery,
  onSearch,
  subCats,
  activeSubCat,
  onSubCat,
  activeTab,
  onTab,
}: {
  section: Section;
  searchQuery: string;
  onSearch: (value: string) => void;
  subCats: string[];
  activeSubCat: string | null;
  onSubCat: (value: string | null) => void;
  activeTab: CatalogTab;
  onTab: (value: CatalogTab) => void;
}) {
  // Satu ritme vertikal: 12px antar kontrol, 16px sebelum konten (diatur pemanggil).
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <SearchIcon
          aria-hidden="true"
          className="w-5 h-5 text-brand-ink absolute left-4 top-1/2 -translate-y-1/2"
        />
        <input
          type="text"
          aria-label={`Cari di ${section.title}`}
          placeholder={`Cari di ${section.title}`}
          className={cn(
            "input-glass rounded-full! h-12 pl-12 pr-4 font-medium",
          )}
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {subCats.length > 0 && (
        <div
          className="-mx-5 px-5 flex gap-2 overflow-x-auto no-scrollbar"
          aria-label="Sub kategori"
        >
          <button
            type="button"
            aria-pressed={!activeSubCat}
            onClick={() => onSubCat(null)}
            className={chipClass(!activeSubCat)}
          >
            Semua
          </button>
          {subCats.map((sub) => (
            <button
              type="button"
              key={sub}
              aria-pressed={activeSubCat === sub}
              onClick={() => onSubCat(activeSubCat === sub ? null : sub)}
              className={chipClass(activeSubCat === sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      <div className="sticky top-[78px] md:top-[154px] z-30 -mx-5 px-5">
        <div
          className={cn(
            `glass grid ${section.tabs.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-1 rounded-full`,
            "p-1 max-w-sm",
          )}
          role="group"
          aria-label="Filter katalog"
        >
          {section.tabs.map((tab) => (
            <button
              type="button"
              key={tab}
              aria-pressed={activeTab === tab}
              onClick={() => onTab(tab)}
              className={cn(
                "min-h-11 rounded-full text-[13px] font-semibold capitalize transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
                activeTab === tab ? "chip-active" : "text-ink-3 hover:text-brand-ink",
              )}
            >
              {TAB_LABEL[tab]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
