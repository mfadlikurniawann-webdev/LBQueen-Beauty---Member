import { Loader2, Star } from "lucide-react";
import { ItemThumb } from "@/components/portal/ItemThumb";
import { cn } from "@/lib/utils";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { isTreatmentOrder, parseProductName, type OrderProduct } from "./order-utils";
import type { OrderReview } from "./useOrderReview";

const RATING_LABEL = ["Pilih bintang", "Tidak puas", "Kurang puas", "Cukup", "Puas", "Sangat puas"];

export function ReviewModal({ review, product }: { review: OrderReview; product?: OrderProduct }) {
  const dialogRef = useDialogFocus<HTMLDivElement>(review.open && !!review.order, review.close);
  if (!review.open || !review.order) return null;
  const parsed = parseProductName(review.order.product_name);
  return (
    <div
      className={cn(
        "fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-scrim",
        "p-0 sm:p-4 animate-in fade-in duration-300",
      )}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        className="glass-strong w-full sm:max-w-[400px] rounded-t-[32px] sm:rounded-[32px] p-5 animate-in slide-in-from-bottom duration-300"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
      >
        <h2 id="review-title" className="text-[18px] font-semibold text-ink mb-4">
          Beri ulasan
        </h2>

        <div className="flex items-center gap-3 mb-5">
          <ItemThumb
            src={product?.image_url}
            alt=""
            treatment={isTreatmentOrder(product, parsed.name)}
            sizes="72px"
          />
          <p className="flex-1 min-w-0 text-[15px] font-semibold text-ink truncate">
            {parsed.name}
          </p>
        </div>

        <div className="flex flex-col items-center mb-5">
          <div className="flex gap-1" role="radiogroup" aria-label="Penilaian">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={review.rating === star}
                aria-label={`${star} bintang`}
                onClick={() => review.setRating(star)}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-transform",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/70",
                  review.rating >= star ? "text-[#B8861A]" : "text-star-empty",
                )}
              >
                <Star className="w-8 h-8" fill={review.rating >= star ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[13px] font-semibold text-ink-muted" aria-live="polite">
            {RATING_LABEL[review.rating] ?? RATING_LABEL[0]}
          </p>
        </div>

        <label htmlFor="review-text" className="sr-only">
          Ulasan
        </label>
        <textarea
          id="review-text"
          value={review.text}
          maxLength={2000}
          onChange={(e) => review.setText(e.target.value)}
          placeholder="Tulis ulasan (opsional)"
          className="input-glass h-24 p-3.5 mb-5 rounded-[20px] text-[16px] resize-none"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={review.close}
            className="btn-glass flex-1 h-12 text-[14px] text-ink-3"
          >
            Nanti
          </button>
          <button
            type="button"
            onClick={review.submit}
            disabled={review.submitting || review.rating < 1}
            className="btn-primary flex-1 h-12 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {review.submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
