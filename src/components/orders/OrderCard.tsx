import { MessageCircle, Star } from "lucide-react";
import { ItemThumb } from "@/components/portal/ItemThumb";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import {
  describeOrder,
  formatOrderDay,
  isTreatmentOrder,
  openWhatsApp,
  orderDetailLine,
  orderQuestion,
  type Order,
  type OrderProduct,
} from "./order-utils";

const ACTION = "h-11 px-4 rounded-full text-[14px] font-semibold inline-flex items-center justify-center gap-1.5";

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
  const detail = orderDetailLine(parsed);
  const muted = o.status === "cancelled";
  const canReview = o.status === "completed" && !o.reviewed_at;
  const meta =
    o.status === "completed" && o.completed_at
      ? `Selesai ${formatOrderDay(o.completed_at)}`
      : `Dipesan ${formatOrderDay(o.ordered_at)}`;

  return (
    <article data-reveal className="glass-soft rounded-[24px] p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <StatusBadge status={o.status} />
        <span className="text-[12px] font-semibold text-[#766B68] tabular-nums">#{invoiceNum}</span>
      </div>

      <button
        type="button"
        onClick={onDetail}
        aria-label={`Detail pesanan ${parsed.name}`}
        className="w-full flex gap-3 text-left rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/20"
      >
        <div className={cn("shrink-0", muted && "grayscale opacity-70")}>
          <ItemThumb
            src={product?.image_url}
            alt=""
            treatment={isTreatmentOrder(product, parsed.name)}
            sizes="64px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-[15px] font-semibold leading-snug line-clamp-2 break-words",
              muted ? "text-[#766B68]" : "text-[#2D2926]",
            )}
          >
            {parsed.name}
          </p>
          {detail && <p className="mt-0.5 text-[13px] text-[#766B68] truncate">{detail}</p>}
          <p className="mt-0.5 text-[13px] text-[#766B68] tabular-nums">x{qty}</p>
        </div>
      </button>

      <p className="mt-2 flex items-baseline justify-end gap-2 tabular-nums">
        <span className="text-[13px] text-[#766B68]">Total</span>
        <span className={cn("text-[16px] font-semibold", muted ? "text-[#766B68]" : "text-[#2D2926]")}>
          {total > 0 ? formatRupiah(total) : "Cek WA"}
        </span>
      </p>

      <div className="mt-3 pt-3 border-t border-[#C94F78]/10 flex flex-wrap items-center justify-end gap-2">
        {/* Dua tombol tidak muat bersama teks di HP: teks pindah ke baris sendiri. */}
        <p className={cn("text-[13px] text-[#766B68]", canReview ? "basis-full sm:basis-auto sm:flex-1" : "flex-1")}>
          {meta}
        </p>
        <button
          type="button"
          onClick={() => openWhatsApp(orderQuestion(o, invoiceNum))}
          className={cn(ACTION, "btn-glass text-[#A83960]")}
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" /> Chat admin
        </button>
        {canReview && (
          <button type="button" onClick={onReview} className={cn(ACTION, "btn-primary")}>
            <Star className="w-4 h-4" aria-hidden="true" /> Beri Ulasan
          </button>
        )}
      </div>
    </article>
  );
}
