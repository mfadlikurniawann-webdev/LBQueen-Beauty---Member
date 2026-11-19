import { useEffect } from "react";
import Image from "next/image";
import { AlertTriangle, Minus, Plus, ShoppingCart, X } from "lucide-react";
import type { ProductSelection } from "@/hooks/useProductSelection";
import { TREATMENT_TYPE } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { VariantOptions } from "./VariantOptions";

const MAX_QTY = 10;
const STEP = cn(
  "w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all",
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/25",
  "disabled:opacity-40 disabled:active:scale-100",
);

function TreatmentReminder({
  agreed,
  onChange,
}: {
  agreed: boolean;
  onChange: (agreed: boolean) => void;
}) {
  return (
    <div className="rounded-[20px] bg-[#FFF8E6] border border-[#F1DFA6] p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#8A6A0F]" aria-hidden="true" />
        <p className="text-[13px] text-[#4A4340] leading-relaxed">
          <strong className="block mb-0.5 text-[14px] text-[#7A5C0B]">
            Perhatian sebelum treatment
          </strong>
          H-7 sebelum dan H+7 setelah treatment dilarang mengonsumsi alkohol dan obat-obatan
          terlarang. Pasien harus jujur akan kondisi tubuh ke therapist. Jika berbohong, risiko
          ditanggung sendiri.
        </p>
      </div>
      <label className="flex items-center gap-3 rounded-2xl bg-white border border-[#F1DFA6] px-3 min-h-12 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 shrink-0 accent-[#C94F78]"
        />
        <span className="text-[13px] font-semibold text-[#5E4708]">Saya mengerti & setuju</span>
      </label>
    </div>
  );
}

export function ProductDetailSheet({ selection }: { selection: ProductSelection }) {
  const { product, variant, setVariant, qty, setQty, agreed, setAgreed, close } = selection;

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [product, close]);

  if (!product) return null;
  const basePrice = variant ? variant.price : product.selling_price;
  const discount = product.voucher_discount || 0;
  const unit = Math.max(0, basePrice - discount);
  const isTreatment = product.type === TREATMENT_TYPE;
  const blocked = isTreatment && !agreed;

  return (
    <div className="fixed inset-0 z-[110] flex flex-col justify-end sm:justify-center sm:p-6">
      <div
        className="absolute inset-0 bg-[#1B1416]/60 backdrop-blur-[2px]"
        onClick={close}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-sheet-title"
        className={cn(
          "relative w-full sm:max-w-[480px] sm:mx-auto bg-white rounded-t-[28px] sm:rounded-[28px]",
          "max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl",
          "animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300",
        )}
      >
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="relative p-3 pb-0">
            <div className="relative aspect-[16/10] rounded-[22px] overflow-hidden bg-[#FBEFF3]">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="480px"
                  className="object-cover"
                />
              ) : (
                <ProductPlaceholder type={product.type} />
              )}
              {discount > 0 && (
                <span className="absolute left-3 bottom-3 rounded-full bg-[#E0263F] px-3 py-1 text-[12px] font-bold text-white">
                  Hemat {formatRupiah(discount)}
                </span>
              )}
            </div>
            <button
              type="button"
              aria-label="Tutup"
              onClick={close}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center text-[#2D2926] shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 pt-4 pb-5 space-y-5">
            <div>
              <p className="text-[12px] font-semibold text-[#A83960]">
                {product.sub_category || (isTreatment ? "Layanan" : "Produk")}
              </p>
              <h3
                id="product-sheet-title"
                className="text-[20px] font-bold! text-[#2D2926] leading-snug mt-0.5"
              >
                {product.name}
              </h3>
              <div className="flex flex-wrap items-baseline gap-x-2 mt-1.5 tabular-nums">
                <span className="text-[20px] font-bold text-[#2D2926]">{formatRupiah(unit)}</span>
                {discount > 0 && (
                  <span className="text-[14px] text-[#8C8280] line-through">
                    {formatRupiah(basePrice)}
                  </span>
                )}
              </div>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="pt-4 border-t border-dashed border-[#EEDFE3]">
                <h4 className="text-[15px] font-bold text-[#2D2926] mb-3">Pilih varian</h4>
                <VariantOptions
                  variants={product.variants}
                  selected={variant}
                  onSelect={setVariant}
                  tone="sheet"
                />
              </div>
            )}

            {isTreatment && <TreatmentReminder agreed={agreed} onChange={setAgreed} />}
          </div>
        </div>

        <div
          className="border-t border-[#F0E4E8] bg-white px-4 pt-3 space-y-3"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[14px] font-semibold text-[#5F5552]">Jumlah</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Kurangi jumlah"
                disabled={qty <= 1}
                onClick={() => setQty(Math.max(1, qty - 1))}
                className={cn(STEP, "border-2 border-[#E6D3DA] text-[#A83960]")}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span
                className="w-6 text-center text-[17px] font-bold tabular-nums"
                aria-live="polite"
              >
                {qty}
              </span>
              <button
                type="button"
                aria-label="Tambah jumlah"
                disabled={qty >= MAX_QTY}
                onClick={() => setQty(Math.min(MAX_QTY, qty + 1))}
                className={cn(STEP, "border-2 border-[#C94F78] text-[#A83960]")}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-2.5">
            <button
              type="button"
              onClick={selection.add}
              aria-label="Tambah ke keranjang"
              className={cn(
                "h-[52px] px-4 rounded-full border-2 border-[#C94F78] text-[#A83960] bg-white",
                "flex items-center justify-center gap-2 text-[14px] font-bold hover:bg-[#FFF3F7] active:scale-[0.98]",
              )}
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              <span className="hidden min-[420px]:inline">Keranjang</span>
            </button>
            <button
              type="button"
              onClick={selection.buyNow}
              disabled={blocked}
              className={cn(
                "h-[52px] px-5 rounded-full text-[15px] font-bold flex items-center justify-between gap-2 whitespace-nowrap",
                "active:scale-[0.98] transition-all",
                blocked
                  ? "bg-[#F1EBED] text-[#8C8280] cursor-not-allowed"
                  : "text-white bg-gradient-to-r from-[#C94F78] to-[#9B3055] shadow-[0_10px_24px_-10px_rgba(168,57,96,0.7)]",
              )}
            >
              <span>
                Pesan<span className="hidden min-[400px]:inline"> sekarang</span>
              </span>
              <span className="tabular-nums">{formatRupiah(unit * qty)}</span>
            </button>
          </div>
          {blocked && (
            <p className="text-center text-[12px] text-[#766B68]">
              Centang persetujuan treatment untuk memesan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
