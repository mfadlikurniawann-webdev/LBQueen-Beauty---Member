"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { InvoiceReceipt, type OnlineOrder } from "@/components/invoice/InvoiceReceipt";
import { PrintSettings, type PaperSize } from "@/components/invoice/PrintSettings";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function OnlineInvoicePage() {
  const params = useParams();
  const [order, setOrder] = useState<OnlineOrder | null>(null);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [size, setSize] = useState<PaperSize>("80mm");

  const cashierName = "LBQueen";

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.id) return;
      setLoading(true);

      try {
        const { data: ord, error: ordError } = await supabase
          .from("customer_orders")
          .select("id,product_name,customer_name,customer_id,status,ordered_at,qty,price,total_price,product_id")
          .eq("id", params.id)
          .single();

        if (ordError || !ord) throw new Error("Pesanan online tidak ditemukan");
        setOrder(ord);

        if (ord.product_id) {
          const { data: prod } = await supabase
            .from("products")
            .select("selling_price")
            .eq("id", ord.product_id)
            .single();

          if (prod) {
            setPrice(prod.selling_price || 0);
          }
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div
        role="status"
        className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#FAF7F5]"
      >
        <Loader2 className="w-8 h-8 text-[#C94F78] animate-spin" />
        <p className="text-[13px] font-medium text-[#766B68]">Memuat invoice...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <main
        id="main-content"
        className="min-h-screen flex items-center justify-center bg-[#FAF7F5] px-4"
      >
        <div
          role="alert"
          className={cn(
            "w-full max-w-sm bg-white rounded-[32px] border border-[#EEDFE3] p-8 flex flex-col items-center",
            "text-center shadow-[0_8px_30px_rgba(201,79,120,0.08)]",
          )}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center",
              "justify-center mb-4",
            )}
          >
            <AlertCircle className="w-8 h-8 text-rose-600" aria-hidden="true" />
          </div>
          <p className="text-[16px] font-bold text-[#2D2926]">
            {error || "Pesanan online tidak ditemukan"}
          </p>
          <button
            type="button"
            onClick={() => window.close()}
            className={cn(
              "mt-6 h-12 px-8 rounded-2xl bg-white border border-[#E8D5DB] text-[14px] font-bold",
              "text-[#766B68] hover:bg-[#FAF7F5] transition-colors",
            )}
          >
            Tutup
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className={cn(
        "min-h-screen bg-[#F5EFF1] font-mono flex flex-col items-center px-4 py-6 sm:py-8",
        "print:bg-white print:p-0 print:min-h-0 print:block",
      )}
    >
      <PrintSettings size={size} onSize={setSize} />
      <InvoiceReceipt order={order} fallbackPrice={price} cashierName={cashierName} size={size} />
    </main>
  );
}
