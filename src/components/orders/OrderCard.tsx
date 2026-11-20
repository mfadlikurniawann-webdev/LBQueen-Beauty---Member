import { ChevronRight, MessageCircle, Star } from "lucide-react";
import { ItemThumb } from "@/components/portal/ItemThumb";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  describeOrder,
  formatOrderDate,
  getOrderStatus,
  isTreatmentOrder,
  openWhatsApp,
  orderQuestion,
  type Order,
  type OrderProduct,
} from "./order-utils";

const PILL = cn(
  "h-9 px-3.5 rounded-full text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors",
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20",
);

export function OrderCard({
  order: o,
  product,
  onDetail,
  onReview,
}: {
  order: Order;
  product?: OrderProduct;
  onDetail: () => void;
  onReview: () => void;
}) {
  const { parsed, qty, total, invoiceNum } = describeOrder(o);
  const status = getOrderStatus(o.status);
  const StatusIcon = status.icon;
  const tone = status.cls.split(" ").find((c) => c.startsWith("text-"));
  const muted = o.status === "cancelled";

  return (
    <article data-reveal className="glass-soft spotlight rounded-[26px] p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[13px] font-medium text-[#5F5552] tabular-nums">
          {formatOrderDate(o.ordered_at)}
        </p>
        <p className="text-[12px] font-semibold text-[#766B68] tabular-nums">#{invoiceNum}</p>
      </div>

      <button
        type="button"
        onClick={onDetail}
        aria-label={`Rincian pesanan ${parsed.mainName}`}
        className="w-full flex gap-3.5 text-left rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20"
      >
        <div className={cn(muted && "grayscale opacity-70")}>
          <ItemThumb
            src={product?.image_url}
            alt={parsed.mainName}
            treatment={isTreatmentOrder(product, parsed.mainName)}
            sizes="72px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3
              className={cn(
                "flex-1 min-w-0 text-[15px] font-semibold! leading-snug line-clamp-2",
                muted ? "text-[#8C8280]" : "text-[#2D2926]",
              )}
            >
              {parsed.mainName}
            </h3>
            <p
              className={cn(
                "shrink-0 text-[14px] font-semibold tabular-nums",
                muted ? "text-[#8C8280]" : "text-[#2D2926]",
              )}
            >
              {total > 0 ? formatRupiah(total) : "Cek WA"}
            </p>
          </div>
          <p className="text-[12px] text-[#766B68] font-medium mt-0.5 truncate">
            {parsed.variantName ? `${parsed.variantName} · ` : ""}
            {qty}x
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-[#2D2926]">
            <StatusIcon className={cn("w-[18px] h-[18px] shrink-0", tone)} aria-hidden="true" />
            {status.label}
            {o.status === "completed" && o.completed_at && (
              <span className="font-medium text-[#766B68] truncate">
                · {formatOrderDate(o.completed_at)}
              </span>
            )}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 shrink-0 self-center text-[#B9ADA9]" aria-hidden="true" />
      </button>

      <div className="flex flex-wrap justify-end gap-2 mt-3.5 pt-3.5 border-t border-[#C94F78]/10">
        {o.status === "completed" && (
          <button
            type="button"
            onClick={onReview}
            className={cn(
              PILL,
              "bg-amber-50/85 text-amber-800 border border-white shadow-[0_0_0_1px_rgba(184,134,26,0.25)] hover:bg-amber-50",
            )}
          >
            <Star className="w-4 h-4 text-amber-500" fill="currentColor" aria-hidden="true" /> Beri
            Ulasan
          </button>
        )}
        <button
          type="button"
          onClick={() => openWhatsApp(orderQuestion(o, invoiceNum))}
          className={cn(PILL, "chip-glass text-[#A83960] hover:bg-white/90")}
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" /> Chat admin
        </button>
      </div>
    </article>
  );
}
