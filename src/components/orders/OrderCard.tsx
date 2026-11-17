import { CheckCircle2, Clock, MessageCircle, Star } from "lucide-react";
import { ItemThumb } from "@/components/portal/ItemThumb";
import { PRIMARY_GRADIENT } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  describeOrder,
  formatOrderDate,
  isTreatmentOrder,
  openWhatsApp,
  orderQuestion,
  type Order,
  type OrderProduct,
} from "./order-utils";
import { StatusBadge } from "./StatusBadge";

const LABEL = "text-[11px] font-bold text-[#766B68] uppercase tracking-[0.1em]";

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
  return (
    <div
      className={cn(
        "bg-white rounded-[24px] p-5 border border-[#EEDFE3] transition-shadow hover:shadow-xl",
        "hover:shadow-rose-100/30",
      )}
      style={{ boxShadow: "0 4px 18px rgba(201,79,120,0.06)" }}
    >
      <div className="flex justify-between items-start gap-3 pb-4 border-b border-[#F4E8EC]">
        <div className="min-w-0 space-y-1">
          <p className={LABEL}>No. Pesanan</p>
          <p className="text-[14px] font-bold text-[#2D2926] tabular-nums">#{invoiceNum}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-[#766B68] font-medium">
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {formatOrderDate(o.ordered_at)}
          </p>
        </div>
        <StatusBadge status={o.status} />
      </div>

      <div className="flex gap-3.5 py-4">
        <ItemThumb
          src={product?.image_url}
          alt={parsed.mainName}
          treatment={isTreatmentOrder(product, parsed.mainName)}
          sizes="80px"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold! text-[#2D2926] leading-snug line-clamp-2">
            {parsed.mainName}
          </h3>
          {parsed.variantName && (
            <span
              className={cn(
                "text-[12px] font-semibold px-2.5 py-0.5 rounded-full inline-block bg-[#FDF2F5]",
                "text-[#A83960] mt-1 max-w-full truncate",
              )}
            >
              {parsed.variantName}
            </span>
          )}
          <p className="text-[13px] text-[#766B68] font-medium mt-1">Kuantitas: {qty}x</p>
        </div>
      </div>

      {o.status === "completed" && o.completed_at && (
        <div className="mb-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
          <div
            className={cn(
              "w-8 h-8 shrink-0 rounded-xl bg-white flex items-center justify-center",
              "text-emerald-600 shadow-sm",
            )}
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-emerald-800 font-bold uppercase tracking-[0.1em] leading-none mb-1">
              Pesanan Selesai
            </p>
            <p className="text-[12px] text-emerald-700 font-medium">
              {formatOrderDate(o.completed_at)}
            </p>
          </div>
        </div>
      )}

      <div
        className={cn(
          "pt-4 border-t border-[#F4E8EC] flex flex-col gap-3 sm:flex-row sm:items-center",
          "sm:justify-between",
        )}
      >
        <div className="flex items-baseline justify-between gap-3 sm:block">
          <p className={`${LABEL} sm:mb-1`}>Total Pembayaran</p>
          <p className="text-[17px] font-bold text-[#A83960] tabular-nums">
            {total > 0 ? formatRupiah(total) : "TBD (Cek WA)"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={onDetail}
            className={cn(
              "h-11 px-4 rounded-2xl bg-white text-[#A83960] text-[13px] font-bold hover:bg-[#FDF2F5]",
              "transition-colors border border-[#F0CBD8] flex items-center justify-center gap-2",
            )}
          >
            Rincian
          </button>
          <button
            type="button"
            onClick={() => openWhatsApp(orderQuestion(o, invoiceNum))}
            className={cn(
              "h-11 px-4 rounded-2xl text-white text-[13px] font-bold shadow-lg shadow-rose-100",
              "hover:brightness-105 transition-all flex items-center justify-center gap-2",
            )}
            style={{ background: PRIMARY_GRADIENT }}
          >
            <MessageCircle className="w-4 h-4" /> Chat
          </button>
        </div>
      </div>

      {o.status === "completed" && (
        <div className="pt-3 mt-3">
          <button
            type="button"
            onClick={onReview}
            className={cn(
              "w-full h-11 rounded-2xl bg-amber-50 text-amber-800 text-[13px] font-bold hover:bg-amber-100",
              "transition-colors flex items-center justify-center gap-2 border border-amber-200",
            )}
          >
            <Star className="w-4 h-4 text-amber-500" fill="currentColor" /> Beri Ulasan
          </button>
        </div>
      )}
    </div>
  );
}
