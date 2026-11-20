import Image from "next/image";
import { format } from "date-fns";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PaperSize } from "./PrintSettings";

export type OnlineOrder = {
  id: number;
  customer_id: number;
  customer_name: string;
  product_id: number;
  product_name: string;
  status: string;
  ordered_at: string;
  completed_at?: string;
};

const EDGE = "absolute left-0 right-0 h-2 bg-repeat-x no-print print:hidden z-10";
const ZIGZAG_TOP =
  "top-0 -mt-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]";
const ZIGZAG_BOTTOM =
  "bottom-0 -mb-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDgsMCA0LDgiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]";
const DIVIDER = "border-t border-dashed border-black/50 my-2";

function parseOrderLine(productName: string, fallbackPrice: number) {
  const priceMatch = productName.match(/Rp\s*([\d.]+)/);
  const parsedPrice = priceMatch ? parseInt(priceMatch[1].replace(/\./g, "")) : 0;
  const match = productName.match(/\(x(\d+)\)$/);
  const qty = match ? parseInt(match[1]) : 1;
  let name = productName.replace(/\s*\(x\d+\)$/, "");
  if (priceMatch) {
    name = name.replace(/\s*Rp\s*[\d.]+/, "");
  }
  const price = parsedPrice > 0 ? parsedPrice : fallbackPrice;
  return { name, qty, price, subtotal: price * qty };
}

export function InvoiceReceipt({
  order,
  fallbackPrice,
  cashierName,
  size,
}: {
  order: OnlineOrder;
  fallbackPrice: number;
  cashierName: string;
  size: PaperSize;
}) {
  const is58 = size === "58mm";
  const printWidth = is58 ? "w-[58mm] max-w-[200px]" : "w-[80mm] max-w-[280px]";
  const { name, qty, price, subtotal } = parseOrderLine(order.product_name, fallbackPrice);

  return (
    <div
      className={cn(
        `bg-white shadow-[0_12px_40px_rgba(45,41,38,0.10)] ${printWidth} relative p-4`,
        "print:shadow-none print:p-0 print:m-0 mx-auto text-black",
      )}
      style={{ fontFamily: "monospace" }}
    >
      <div className={`${EDGE} ${ZIGZAG_TOP}`} />

      <div className="flex flex-col items-center mb-4">
        <div className={`relative mb-2 ${is58 ? "w-12 h-12" : "w-16 h-16"}`}>
          <Image src="/lbqueen_logo.png" alt="Logo" fill sizes="64px" className="object-contain" />
        </div>
        <h2 className={`${is58 ? "text-[11px]" : "text-sm"} font-bold text-center leading-tight`}>
          LBQueen.id Care & Beauty
          <br />
          CLINIC
        </h2>
        <p className="text-[11px] text-center mt-1 leading-tight px-2">
          Jl. Hos Cokroaminoto no.17 Tanjungkarang Timur Bandar Lampung
          <br />
          PT. LBQueen Care Beauty
          <br />
          Cp : 082176171448
        </p>
      </div>

      <div className={DIVIDER} />

      <div className="text-[11px] space-y-0.5">
        <div className="flex justify-between">
          <span className="w-20">No Order</span>
          <span>: ONL-{order.id}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="w-20 shrink-0">Pelanggan</span>
          <span className="min-w-0 text-right break-words">: {order.customer_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="w-20">Tgl Order</span>
          <span>: {format(new Date(order.ordered_at), "dd/MM/yyyy HH:mm")}</span>
        </div>
        <div className="flex justify-between">
          <span className="w-20">Kasir</span>
          <span>: {cashierName}</span>
        </div>
      </div>

      <div className={DIVIDER} />

      <h3 className={`${is58 ? "text-[11px]" : "text-xs"} font-bold text-center mb-2`}>
        LAYANAN ONLINE
      </h3>

      <div className="text-[11px] space-y-2">
        <div className="flex flex-col">
          <span className="font-bold capitalize break-words leading-tight">{name}</span>

          {price > 0 && (
            <div className="flex justify-between mt-0.5">
              <span>
                {qty} x {formatNumber(price)}
              </span>
              <span>{formatNumber(subtotal)}</span>
            </div>
          )}
          {price === 0 && (
            <div className="flex justify-between mt-0.5">
              <span>{qty}x</span>
              <span>-</span>
            </div>
          )}
        </div>
      </div>

      <div className={DIVIDER} />

      <div className="text-[11px]">
        {price > 0 && (
          <div className="flex justify-between font-bold mt-1 text-[11px]">
            <span>Total Estimasi</span>
            <span>{formatNumber(subtotal)}</span>
          </div>
        )}
        {price === 0 && (
          <div className="flex justify-between font-bold mt-1 text-[11px]">
            <span>Total</span>
            <span>TBD (Konfirmasi WA)</span>
          </div>
        )}
      </div>

      <div className={DIVIDER} />

      <div className="text-[11px] space-y-0.5">
        <div className="flex justify-between">
          <span>Status Order</span>
          <span className="uppercase text-emerald-600 font-bold">
            {order.status === "completed" ? "Selesai" : order.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Metode Bayar</span>
          <span>Transfer/WA</span>
        </div>
      </div>

      <div className={DIVIDER} />

      <div className="text-[11px] text-center mt-3 font-bold mb-4">
        LBQueen.id Care & Beauty Clinic
        <br />
        PT. LBQueen Care Beauty
      </div>

      <div className={`${EDGE} ${ZIGZAG_BOTTOM}`} />
    </div>
  );
}
