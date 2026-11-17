import Image from "next/image";
import { AlertTriangle, ArrowRight, Minus, Plus, ShoppingBag } from "lucide-react";
import type { ProductSelection } from "@/hooks/useProductSelection";
import { TREATMENT_TYPE } from "@/lib/constants";
import { Rupiah } from "@/components/Rupiah";
import { cn } from "@/lib/utils";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { VariantOptions } from "./VariantOptions";

const SECTION_TITLE = "text-[13px] font-bold text-[#2D2926] uppercase tracking-[0.08em]";
const STEP_BUTTON = cn(
  "w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-all",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C94F78]/30",
);
const ACTION_BUTTON = cn(
  "h-[56px] rounded-2xl font-bold text-[13px] tracking-[0.06em] flex items-center justify-center",
  "gap-2 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-4",
);
const MAX_QTY = 10;

function TreatmentReminder({
  agreed,
  onChange,
}: {
  agreed: boolean;
  onChange: (agreed: boolean) => void;
}) {
  return (
    <div className="bg-[#FBF7ED] rounded-[24px] p-4 border border-[#D4AF37]/30 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-[#8A6A0F]" aria-hidden="true" />
        </div>
        <p className="text-[13px] text-[#4A4340] leading-relaxed">
          <strong className="block mb-1 text-[14px] text-[#7A5C0B]">
            Perhatian Sebelum Treatment!
          </strong>
          H-7 sebelum dan juga H+7 setelah treatment dilarang mengkonsumsi alkohol dan obat-obatan
          terlarang. Pasien harus jujur akan kondisi tubuh ke therapist. Jika berbohong risiko
          ditanggung sendiri.
        </p>
      </div>
      <label className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#D4AF37]/25 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 shrink-0 rounded border-[#C9A43A] accent-[#C94F78] focus:ring-[#C94F78] bg-white"
        />
        <span className="text-[13px] font-semibold text-[#5E4708]">Saya mengerti & setuju</span>
      </label>
    </div>
  );
}

export function ProductDetailSheet({ selection }: { selection: ProductSelection }) {
  const { product, variant, setVariant, qty, setQty, agreed, setAgreed, close } = selection;
  if (!product) return null;
  const basePrice = variant ? variant.price : product.selling_price;
  const discount = product.voucher_discount || 0;
  const isTreatment = product.type === TREATMENT_TYPE;
  const blocked = isTreatment && !agreed;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-sheet-title"
        className={cn(
          "relative w-full sm:max-w-xl sm:mx-auto bg-white rounded-t-[32px] shadow-2xl max-h-[90vh]",
          "flex flex-col px-5 pt-4 pb-6 sm:px-8 sm:pb-8 animate-in slide-in-from-bottom-20 duration-300",
        )}
      >
        <div className="flex justify-center mb-5">
          <div className="w-14 h-1.5 bg-[#EEDFE3] rounded-full" />
        </div>

        <div className="flex gap-4 sm:gap-5 mb-6 pb-6 border-b border-[#F3E4E9]">
          <div
            className={cn(
              "w-28 h-28 sm:w-32 sm:h-32 rounded-[24px] overflow-hidden border border-[#EEDFE3]",
              "shrink-0 relative",
            )}
          >
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" />
            ) : (
              <ProductPlaceholder type={product.type} size="sm" />
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <span
              className={cn(
                "inline-block max-w-full truncate rounded-full bg-[#FDF2F5] px-2.5 py-0.5",
                "text-[11px] font-semibold text-[#A83960] mb-2",
              )}
            >
              {product.type}
            </span>
            <h3
              id="category-sheet-title"
              className="text-[17px] sm:text-lg font-bold text-[#2D2926] leading-snug mb-2 line-clamp-3"
            >
              {product.name}
            </h3>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums">
              <span className="text-[20px] font-bold text-[#A83960]">
                <Rupiah value={basePrice - discount} />
              </span>
              {discount > 0 && (
                <span className="text-[13px] font-medium text-[#766B68] line-through">
                  <Rupiah value={basePrice} />
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
          {product.variants && product.variants.length > 0 && (
            <div>
              <h4 className={`${SECTION_TITLE} mb-3`}>Pilih Varian</h4>
              <VariantOptions
                variants={product.variants}
                selected={variant}
                onSelect={setVariant}
                tone="sheet"
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <h4 className={SECTION_TITLE}>Jumlah</h4>
            <div className="flex items-center gap-2 bg-[#FDF7F9] rounded-2xl p-1.5 border border-[#EEDFE3]">
              <button
                type="button"
                aria-label="Kurangi jumlah"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className={cn(STEP_BUTTON, "bg-white border border-[#EEDFE3] text-[#A83960]")}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span
                className="text-[17px] font-bold text-[#2D2926] w-8 text-center tabular-nums"
                aria-live="polite"
              >
                {qty}
              </span>
              <button
                type="button"
                aria-label="Tambah jumlah"
                onClick={() => setQty(Math.min(MAX_QTY, qty + 1))}
                className={cn(STEP_BUTTON, "bg-[#C94F78] text-white shadow-sm")}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isTreatment && <TreatmentReminder agreed={agreed} onChange={setAgreed} />}
        </div>

        <div className="pt-5 mt-4 border-t border-[#F3E4E9] grid grid-cols-[1fr_2.2fr] gap-3">
          <button
            type="button"
            onClick={selection.add}
            className={cn(
              ACTION_BUTTON,
              "border-2 border-[#C94F78] text-[#A83960] bg-white hover:bg-[#FDF2F5]",
              "focus-visible:ring-[#C94F78]/20",
            )}
          >
            <ShoppingBag className="w-5 h-5" aria-hidden="true" /> CART
          </button>
          <button
            type="button"
            onClick={selection.buyNow}
            disabled={blocked}
            className={cn(
              ACTION_BUTTON,
              "disabled:active:scale-100 focus-visible:ring-[#C94F78]/25",
              blocked
                ? "bg-[#F3ECEE] text-[#8C8280] border border-[#EEDFE3] cursor-not-allowed shadow-none"
                : "text-white bg-gradient-to-br from-[#C94F78] to-[#9B3055] shadow-xl shadow-rose-200/70",
            )}
          >
            BELI SEKARANG <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
