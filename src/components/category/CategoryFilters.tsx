import { Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TAB_LABEL, type CatalogTab, type Section } from "./sections";

const chipClass = (active: boolean) =>
  cn(
    "whitespace-nowrap px-4 min-h-10 rounded-full text-[13px] font-semibold capitalize transition-all",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20",
    active
      ? "bg-gradient-to-br from-[#C94F78] to-[#A83960] text-white shadow-md shadow-rose-200/60"
      : "bg-white text-[#5F5552] border border-[#EEDFE3] hover:border-[#C94F78]/40 hover:text-[#A83960]",
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
  return (
    <>
      <div className="relative mb-5">
        <SearchIcon
          aria-hidden="true"
          className="w-5 h-5 text-[#A83960] absolute left-4 top-1/2 -translate-y-1/2"
        />
        <input
          type="text"
          aria-label={`Cari di ${section.title}`}
          placeholder={`Cari di ${section.title}...`}
          className={cn(
            "w-full bg-white border border-[#EEDFE3] rounded-2xl py-4 pl-12 pr-4 text-[15px] font-medium",
            "text-[#2D2926] placeholder:text-[#8C8280] shadow-sm focus:outline-none focus:border-[#C94F78]",
            "focus:ring-4 focus:ring-rose-100 transition-all",
          )}
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {subCats.length > 0 && (
        <div
          className="mb-4 -mx-5 px-5 flex gap-2 overflow-x-auto no-scrollbar py-1"
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

      <div className="sticky top-[88px] z-40 bg-[#FDFBFB]/90 backdrop-blur-md -mx-5 px-5 py-3 mb-5">
        <div
          className={cn(
            `grid ${section.tabs.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-1 rounded-2xl`,
            "border border-[#EEDFE3] bg-white p-1 shadow-sm max-w-sm",
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
                "min-h-10 rounded-xl text-[13px] font-bold capitalize transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94F78]/30",
                activeTab === tab
                  ? "bg-[#FDF2F5] text-[#A83960] shadow-[inset_0_0_0_1px_rgba(201,79,120,0.25)]"
                  : "text-[#5F5552] hover:text-[#A83960]",
              )}
            >
              {TAB_LABEL[tab]}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
