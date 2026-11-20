import { Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { parseProductName } from "./order-utils";
import type { OrderReview } from "./useOrderReview";

const FOOTER_BUTTON = "flex-1 h-12 rounded-full text-[14px] font-bold transition-colors";

export function ReviewModal({ review }: { review: OrderReview }) {
  const dialogRef = useDialogFocus<HTMLDivElement>(review.open && !!review.order, review.close);
  if (!review.open || !review.order) return null;
  const parsed = parseProductName(review.order.product_name);
  return (
    <div
      className={cn(
        "fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-[#2A1520]/50 md:bg-[#2A1520]/45 md:backdrop-blur-[6px]",
        "p-0 sm:p-4 animate-in fade-in duration-300",
      )}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        className={cn(
          "glass-strong w-full sm:max-w-[400px] rounded-t-[32px] sm:rounded-[32px] p-6 flex flex-col",
          "items-center text-center animate-in slide-in-from-bottom duration-300",
        )}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
      >
        <div
          className={cn(
            "glass-lit w-16 h-16 rounded-full flex items-center justify-center",
            "text-amber-500 mb-4",
          )}
        >
          <Star className="w-8 h-8" fill="currentColor" aria-hidden="true" />
        </div>
        <h2 id="review-title" className="text-[18px] font-bold! text-[#2D2926] mb-1.5">
          Bagaimana pesanan Anda?
        </h2>
        <p className="text-[13px] text-[#766B68] mb-5 px-2 leading-relaxed">
          {"Berikan ulasan untuk pesanan "}
          <span className="font-bold text-[#A83960]">{parsed.mainName}</span>
          {" dan bagikan pengalaman Anda."}
        </p>

        <div className="flex gap-1.5 mb-5" role="group" aria-label="Penilaian">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} bintang`}
              aria-pressed={review.rating >= star}
              onClick={() => review.setRating(star)}
              className={cn(
                "p-1 rounded-xl transition-transform hover:scale-110 active:scale-95",
                review.rating >= star ? "text-amber-400" : "text-slate-300",
              )}
            >
              <Star className="w-9 h-9" fill={review.rating >= star ? "currentColor" : "none"} />
            </button>
          ))}
        </div>

        <label htmlFor="review-text" className="sr-only">
          Ulasan
        </label>
        <textarea
          id="review-text"
          value={review.text}
          onChange={(e) => review.setText(e.target.value)}
          placeholder="Ceritakan pengalaman Anda di sini (opsional)..."
          className={cn(
            "input-glass h-24 p-3.5 mb-5 rounded-[20px] text-[16px] resize-none",
          )}
        />

        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={review.close}
            className={`${FOOTER_BUTTON} btn-glass text-[#5F5552]`}
          >
            Nanti Saja
          </button>
          <button
            type="button"
            onClick={review.submit}
            disabled={review.submitting}
            className={cn(
              "flex-1 h-12 rounded-full text-[14px] font-bold text-white transition-all flex items-center",
              "justify-center gap-2 bg-gradient-to-b from-amber-500 to-amber-600 hover:brightness-105",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_22px_-10px_rgba(184,134,26,0.7)]",
              "active:scale-[0.97] disabled:opacity-70 disabled:cursor-wait",
            )}
          >
            {review.submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Kirim Ulasan
          </button>
        </div>
      </div>
    </div>
  );
}
