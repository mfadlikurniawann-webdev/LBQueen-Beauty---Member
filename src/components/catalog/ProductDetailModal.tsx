import { Minus, Plus, ShoppingCart } from "lucide-react";
import type { ProductSelection } from "@/hooks/useProductSelection";
import { PRIMARY_GRADIENT, TREATMENT_TYPE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ProductModalHero } from "./ProductModalHero";
import { TreatmentAgreement } from "./TreatmentAgreement";
import { VariantOptions } from "./VariantOptions";

const SECTION_TITLE = "text-[13px] font-bold text-[#2D2926] uppercase tracking-[0.08em]";
const STEP_BUTTON = cn(
  "w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 active:scale-95",
  "transition-all focus-visible:outline-none focus-visible:ring-4",
);

export function ProductDetailModal({ selection }: { selection: ProductSelection }) {
  const { product, variant, setVariant, qty, setQty, agreed, setAgreed, close } = selection;
  if (!product) return null;
  const basePrice = variant ? variant.price : product.selling_price;
  const isTreatment = product.type === TREATMENT_TYPE;
  return (
    <div
      className={cn(
        "fixed inset-0 z-[110] flex items-center justify-center bg-black/60",
        "backdrop-blur-sm p-4 pb-32 md:pb-6",
      )}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        className={cn(
          "bg-white w-full max-w-[440px] max-h-[82vh] rounded-[32px] flex flex-col shadow-2xl",
          "overflow-hidden animate-in zoom-in-95 duration-300",
        )}
      >
        <ProductModalHero
          product={product}
          price={basePrice}
          discount={product.voucher_discount || 0}
          onClose={close}
        />

        <div className="flex-1 overflow-y-auto bg-white rounded-t-[28px] -mt-6 relative z-20 p-5 sm:p-6 space-y-7">
          {product.variants && product.variants.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h4 className={SECTION_TITLE}>Pilih Varian</h4>
                <span className="rounded-full bg-[#FDF2F5] px-2.5 py-0.5 text-[11px] text-[#A83960] font-semibold">
                  Wajib dipilih
                </span>
              </div>
              <VariantOptions
                variants={product.variants}
                selected={variant}
                onSelect={setVariant}
                tone="modal"
              />
            </div>
          )}

          <div>
            <h4 className={`${SECTION_TITLE} mb-3`}>Jumlah Pesanan</h4>
            <div className="flex items-center justify-between bg-[#FDF7F9] p-2 rounded-[24px] border border-[#EEDFE3]">
              <button
                type="button"
                aria-label="Kurangi jumlah"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className={cn(
                  STEP_BUTTON,
                  "bg-white border border-[#EEDFE3] shadow-sm text-[#A83960] focus-visible:ring-[#C94F78]/20",
                )}
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center">
                <span
                  className="text-[22px] font-bold text-[#2D2926] tabular-nums leading-none"
                  aria-live="polite"
                >
                  {qty}
                </span>
                <span className="text-[11px] text-[#766B68] font-semibold uppercase tracking-[0.1em] mt-1">
                  Qty
                </span>
              </div>
              <button
                type="button"
                aria-label="Tambah jumlah"
                onClick={() => setQty(qty + 1)}
                className={cn(
                  STEP_BUTTON,
                  "bg-[#C94F78] shadow-lg shadow-[#C94F78]/20 text-white focus-visible:ring-[#C94F78]/25",
                )}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isTreatment && <TreatmentAgreement agreed={agreed} onChange={setAgreed} />}
        </div>

        <div className="shrink-0 p-4 sm:p-5 pb-6 border-t border-[#F3E4E9] bg-white grid grid-cols-[1fr_2.5fr] gap-3">
          <button
            type="button"
            onClick={selection.add}
            className={cn(
              "h-[56px] rounded-2xl font-bold flex flex-col items-center justify-center gap-0.5",
              "transition-all bg-[#FDF2F5] text-[#A83960] border border-[#EEDFE3] hover:bg-[#FBE7EE]",
              "active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20",
            )}
          >
            <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            <span className="text-[11px] uppercase tracking-[0.08em]">+ Cart</span>
          </button>

          <button
            type="button"
            onClick={selection.buyNow}
            disabled={isTreatment && !agreed}
            className={cn(
              "h-[56px] rounded-2xl text-[15px] font-bold text-white flex items-center justify-center",
              "gap-2.5 transition-all disabled:opacity-60 disabled:saturate-50 disabled:shadow-none",
              "disabled:cursor-not-allowed shadow-xl shadow-[#C94F78]/30 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/30",
            )}
            style={{ background: PRIMARY_GRADIENT }}
          >
            <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            <span>Order Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
