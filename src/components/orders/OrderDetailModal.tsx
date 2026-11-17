import { ChevronLeft, ChevronRight, MessageCircle, ShoppingBag } from "lucide-react";
import { ItemThumb } from "@/components/portal/ItemThumb";
import { PRIMARY_GRADIENT } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  describeOrder,
  isTreatmentOrder,
  openWhatsApp,
  orderQuestion,
  type Order,
  type OrderProduct,
} from "./order-utils";
import { HEADING, MUTED, ROW } from "./order-styles";
import { OrderInfo } from "./OrderInfo";
import { StatusBadge } from "./StatusBadge";

export function OrderDetailModal({
  order: o,
  product,
  onClose,
}: {
  order: Order;
  product?: OrderProduct;
  onClose: () => void;
}) {
  const { parsed, qty, total, invoiceNum } = describeOrder(o);
  const unitPrice = parsed.itemPrice > 0 ? formatRupiah(parsed.itemPrice) : "TBD";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm",
        "p-0 sm:p-4 animate-in fade-in duration-300",
      )}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        className={cn(
          "bg-white w-full sm:max-w-[480px] max-h-[92vh] sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px]",
          "flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300",
        )}
      >
        <div
          className={cn(
            "px-5 py-4 border-b border-[#F4E8EC] flex items-center justify-between gap-3",
            "shrink-0 bg-[#FDFAFB]",
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Tutup rincian"
              onClick={onClose}
              className={cn(
                "w-10 h-10 shrink-0 rounded-2xl bg-white shadow-sm border border-[#EEDFE3] flex items-center",
                "justify-center text-[#766B68] hover:text-[#A83960] transition-colors",
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 id="order-detail-title" className="text-[17px] font-bold! text-[#2D2926] truncate">
              Rincian Pesanan
            </h3>
          </div>
          <StatusBadge status={o.status} />
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#F4E8EC]">
            <div
              className={cn(
                "w-8 h-8 rounded-xl bg-[#FDF2F5] border border-[#F6DDE6] flex items-center",
                "justify-center text-[#C94F78]",
              )}
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            </div>
            <span className="text-[13px] font-bold text-[#2D2926]">LBQueen Clinic & Beauty</span>
          </div>

          <div className="flex gap-4">
            <ItemThumb
              src={product?.image_url}
              alt={parsed.mainName}
              treatment={isTreatmentOrder(product, parsed.mainName)}
              size="lg"
              sizes="80px"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h4 className="text-[15px] font-semibold! text-[#2D2926] leading-snug mb-1 line-clamp-2">
                  {parsed.mainName}
                </h4>
                {parsed.variantName && (
                  <span
                    className={cn(
                      "text-[12px] font-semibold px-2.5 py-0.5 rounded-full inline-block bg-[#FDF2F5]",
                      "text-[#A83960] max-w-full truncate",
                    )}
                  >
                    {parsed.variantName}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between gap-2 mt-2">
                <span className="text-[13px] text-[#766B68] font-medium tabular-nums">x{qty}</span>
                <span className="text-[14px] font-bold text-[#A83960] tabular-nums">
                  {unitPrice}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF7F5] rounded-2xl p-4 border border-[#EEDFE3] space-y-3">
            <div className={ROW}>
              <span className={MUTED}>Harga Satuan</span>
              <span className="text-[#2D2926] font-semibold tabular-nums">{unitPrice}</span>
            </div>
            <div className={ROW}>
              <span className={MUTED}>Jumlah Pesanan</span>
              <span className="text-[#2D2926] font-semibold tabular-nums">{qty} produk</span>
            </div>
            <div className="h-px bg-[#EEDFE3]" />
            <div className="flex justify-between items-center gap-3">
              <span className="text-[14px] text-[#2D2926] font-bold">Total Pesanan</span>
              <span className="text-[18px] font-bold text-[#A83960] tabular-nums">
                {total > 0 ? formatRupiah(total) : "TBD"}
              </span>
            </div>
          </div>

          <div>
            <h5 className={`${HEADING} mb-2.5`}>Butuh Bantuan?</h5>
            <button
              type="button"
              onClick={() =>
                openWhatsApp(`Halo, saya butuh bantuan terkait pesanan #${invoiceNum}`)
              }
              className={cn(
                "w-full h-14 rounded-2xl border border-[#EEDFE3] bg-white hover:bg-[#FDF2F5]",
                "hover:border-[#F0CBD8] transition-colors flex items-center justify-between px-4 group",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FDF2F5] flex items-center justify-center text-[#C94F78]">
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="text-[14px] font-bold text-[#2D2926] group-hover:text-[#A83960] transition-colors">
                  Hubungi Penjual
                </span>
              </div>
              <ChevronRight
                className="w-5 h-5 text-[#766B68] group-hover:text-[#A83960] transition-colors"
                aria-hidden="true"
              />
            </button>
          </div>

          <OrderInfo order={o} invoiceNum={invoiceNum} />
        </div>

        <div
          className="px-5 pt-4 border-t border-[#F4E8EC] bg-white grid grid-cols-2 gap-3 shrink-0"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "h-12 rounded-2xl text-[14px] font-bold text-[#766B68] bg-white hover:bg-[#FAF7F5]",
              "transition-colors border border-[#E8D5DB]",
            )}
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => openWhatsApp(orderQuestion(o, invoiceNum))}
            className={cn(
              "h-12 rounded-2xl text-[14px] font-bold text-white shadow-lg shadow-rose-100",
              "hover:brightness-105 transition-all flex items-center justify-center gap-2",
            )}
            style={{ background: PRIMARY_GRADIENT }}
          >
            <MessageCircle className="w-4 h-4" /> Chat Admin
          </button>
        </div>
      </div>
    </div>
  );
}
