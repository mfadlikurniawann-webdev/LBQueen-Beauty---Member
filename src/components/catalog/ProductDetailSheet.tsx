import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Minus, Plus, ShoppingCart, X } from "lucide-react";
import type { ProductSelection } from "@/hooks/useProductSelection";
import { discountFor, priceRange, productImages, type CatalogProduct } from "@/lib/catalog";
import { TREATMENT_TYPE } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { ProductGallery } from "./ProductGallery";
import { VariantOptions } from "./VariantOptions";

const MAX_QTY = 10;
const DESCRIPTION_PREVIEW = 280;
const STEP = cn(
  "w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-all",
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
    <div className="rounded-[22px] bg-[#FFF8E6]/85 border border-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_0_0_1px_rgba(184,134,26,0.18)] p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#8A6A0F]" aria-hidden="true" />
        <p className="text-[13px] text-[#4A4340] leading-relaxed">
          <strong className="block mb-0.5 text-[14px] text-[#7A5C0B]">
            Perhatian sebelum treatment
          </strong>
          Hindari alkohol dan obat-obatan terlarang H-7 hingga H+7 treatment. Sampaikan kondisi
          kesehatan Anda kepada therapist.
        </p>
      </div>
      <label className="chip-glass flex items-center gap-3 rounded-2xl px-3 min-h-12 cursor-pointer">
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

function PriceBlock({
  product,
  selection,
}: {
  product: CatalogProduct;
  selection: ProductSelection;
}) {
  const { variant } = selection;
  const range = priceRange(product);
  const base = variant ? Number(variant.price) : range.min;
  const discount = variant ? discountFor(product, base) : range.discountMin;
  const finalPrice = Math.max(0, base - discount);
  const showRange = !variant && range.finalMin !== range.finalMax;
  const percent = base > 0 && discount > 0 ? Math.round((discount / base) * 100) : 0;
  return (
    <div className="glass-soft rounded-[22px] px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums">
      {discount > 0 && !showRange && (
        <span className="text-[14px] text-[#8C8280] line-through">{formatRupiah(base)}</span>
      )}
      <span className="text-[24px] md:text-[28px] font-semibold text-[#C2185B] leading-tight">
        {showRange
          ? `${formatRupiah(range.finalMin)} - ${formatRupiah(range.finalMax)}`
          : formatRupiah(finalPrice)}
      </span>
      {percent > 0 && !showRange && (
        <span className="rounded-full bg-[#D3264A] px-2 py-0.5 text-[12px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
          -{percent}%
        </span>
      )}
    </div>
  );
}

function Description({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > DESCRIPTION_PREVIEW;
  return (
    <section className="pt-4 border-t border-[#C94F78]/12">
      <h3 className="text-[15px] font-semibold text-[#2D2926] mb-2">Deskripsi</h3>
      <p className="text-[14px] text-[#4A4340] leading-relaxed whitespace-pre-line break-words">
        {long && !expanded ? `${text.slice(0, DESCRIPTION_PREVIEW).trimEnd()}…` : text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-[13px] font-semibold text-[#A83960] hover:underline"
        >
          {expanded ? "Tampilkan lebih sedikit" : "Lihat selengkapnya"}
        </button>
      )}
    </section>
  );
}

function Actions({
  selection,
  unit,
  maxQty,
  blocked,
  className,
}: {
  selection: ProductSelection;
  unit: number | null;
  maxQty: number;
  blocked: boolean;
  className?: string;
}) {
  const { qty, setQty, variant } = selection;
  const stockLabel =
    variant && selection.product?.type !== TREATMENT_TYPE ? `Stok ${variant.stock}` : null;
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] font-semibold text-[#5F5552]">
          Jumlah
          {stockLabel && (
            <span className="ml-2 text-[12px] font-medium text-[#766B68]">{stockLabel}</span>
          )}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Kurangi jumlah"
            disabled={qty <= 1}
            onClick={() => setQty(Math.max(1, qty - 1))}
            className={cn(STEP, "chip-glass text-[#A83960]")}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-6 text-center text-[17px] font-semibold tabular-nums" aria-live="polite">
            <span key={qty} className="inline-block animate-in zoom-in-75 fade-in duration-200">
              {qty}
            </span>
          </span>
          <button
            type="button"
            aria-label="Tambah jumlah"
            disabled={qty >= maxQty}
            onClick={() => setQty(Math.min(maxQty, qty + 1))}
            className={cn(STEP, "chip-active")}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-2.5">
        <button
          type="button"
          onClick={selection.add}
          aria-label="Masukkan keranjang"
          className={cn(
            "btn-glass h-[52px] px-4 text-[14px]",
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
            "h-[52px] px-5 rounded-full text-[15px] font-semibold flex items-center justify-between gap-2 whitespace-nowrap",
            "active:scale-[0.98] transition-all duration-300",
            blocked
              ? "chip-glass text-[#8C8280] cursor-not-allowed"
              : "btn-primary justify-between! px-5!",
          )}
        >
          <span>
            Pesan<span className="hidden min-[400px]:inline md:hidden lg:inline"> sekarang</span>
          </span>
          {unit !== null && <span className="tabular-nums">{formatRupiah(unit * qty)}</span>}
        </button>
      </div>
      {blocked && (
        <p className="text-center text-[12px] text-[#766B68]">
          Centang persetujuan treatment untuk memesan.
        </p>
      )}
    </div>
  );
}

export function ProductDetailSheet({ selection }: { selection: ProductSelection }) {
  const { product, variant, setVariant, agreed, setAgreed, close, needVariant, closing } =
    selection;
  const variantRef = useRef<HTMLDivElement>(null);
  const dialogRef = useDialogFocus<HTMLDivElement>(!!product, close);

  useEffect(() => {
    if (!product) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [product]);

  useEffect(() => {
    if (needVariant) variantRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [needVariant]);

  const images = useMemo(() => {
    if (!product) return [];
    const extra = (product.variants || []).map((v) => v.image_url).filter(Boolean) as string[];
    return [...new Set([...productImages(product), ...extra])];
  }, [product]);

  if (!product) return null;
  const isTreatment = product.type === TREATMENT_TYPE;
  const variants = product.variants || [];
  const blocked = isTreatment && !agreed;
  const basePrice = variant
    ? Number(variant.price)
    : variants.length
      ? null
      : Number(product.selling_price);
  const unit = basePrice === null ? null : Math.max(0, basePrice - discountFor(product, basePrice));
  const maxQty = variant && !isTreatment ? Math.max(1, Math.min(MAX_QTY, variant.stock)) : MAX_QTY;
  const range = priceRange(product);
  const savings = variant ? discountFor(product, Number(variant.price)) : range.discountMin;
  const actionProps = { selection, unit, maxQty, blocked };

  return (
    <div className="fixed inset-0 z-[110] flex flex-col justify-end md:justify-center md:p-6">
      <div
        className={cn(
          "absolute inset-0 bg-[#2A1520]/50 md:bg-[#2A1520]/45 md:backdrop-blur-[6px] duration-200",
          closing ? "animate-out fade-out fill-mode-forwards" : "animate-in fade-in",
        )}
        onClick={() => close()}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-sheet-title"
        className={cn(
          "glass-strong relative w-full md:max-w-[960px] md:mx-auto rounded-t-[32px] md:rounded-[32px]",
          "max-h-[94dvh] md:max-h-[88dvh] flex flex-col overflow-hidden",
          closing
            ? "animate-out fade-out slide-out-to-bottom-10 md:slide-out-to-bottom-0 md:zoom-out-95 duration-200 fill-mode-forwards"
            : "animate-in fade-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300 ease-out",
        )}
      >
        <button
          type="button"
          aria-label="Tutup"
          onClick={() => close()}
          className="glass absolute top-3 right-3 z-20 w-11 h-11 rounded-full flex items-center justify-center text-[#2D2926] hover:bg-white/90 active:scale-95 transition-transform"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="scroll-thin flex-1 min-h-0 overflow-y-auto md:grid md:grid-cols-2 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] md:gap-6 lg:gap-8 md:p-6">
          <div className="md:sticky md:top-0 md:self-start">
            <ProductGallery
              images={images}
              alt={product.name}
              type={product.type}
              focusUrl={variant?.image_url}
              badge={
                savings > 0 ? (
                  <span className="absolute left-3 bottom-3 rounded-full bg-[#D3264A] px-3 py-1 text-[12px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                    Hemat {formatRupiah(savings)}
                  </span>
                ) : null
              }
            />
          </div>

          <div className="px-5 pt-4 pb-5 md:p-0 space-y-4 min-w-0">
            <div className="md:pr-12">
              <p className="text-[12px] font-semibold text-[#A83960]">
                {product.sub_category || (isTreatment ? "Layanan" : "Produk")}
              </p>
              <h2
                id="product-sheet-title"
                className="text-[20px] md:text-[22px] font-semibold! text-[#2D2926] leading-snug mt-0.5"
              >
                {product.name}
              </h2>
            </div>

            <PriceBlock product={product} selection={selection} />

            {variants.length > 0 && (
              <div ref={variantRef} className="space-y-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[15px] font-semibold text-[#2D2926]">
                    {product.variant_label?.trim() || "Variasi"}
                  </h3>
                  {variant && (
                    <span className="text-[12px] text-[#766B68] truncate">
                      Dipilih: <strong className="text-[#2D2926]">{variant.variant_name}</strong>
                    </span>
                  )}
                </div>
                <VariantOptions
                  variants={variants}
                  selected={variant}
                  onSelect={setVariant}
                  tracksStock={!isTreatment}
                />
                {needVariant && (
                  <p role="alert" className="text-[13px] font-semibold text-[#E0263F]">
                    Silakan pilih {(product.variant_label?.trim() || "variasi").toLowerCase()}{" "}
                    terlebih dahulu.
                  </p>
                )}
              </div>
            )}

            {isTreatment && <TreatmentReminder agreed={agreed} onChange={setAgreed} />}

            <Actions
              {...actionProps}
              className="hidden md:block pt-4 border-t border-[#C94F78]/12"
            />

            {product.description?.trim() && <Description text={product.description.trim()} />}
          </div>
        </div>

        <div
          className="md:hidden border-t border-white/80 bg-white/95 shadow-[0_-10px_24px_-18px_rgba(122,34,64,0.35)] px-4 pt-3"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)" }}
        >
          <Actions {...actionProps} />
        </div>
      </div>
    </div>
  );
}
