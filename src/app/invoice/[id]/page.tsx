"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Printer, ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";

type OnlineOrder = {
  id: number;
  customer_id: number;
  customer_name: string;
  product_id: number;
  product_name: string;
  status: string;
  ordered_at: string;
  completed_at?: string;
};

export default function OnlineInvoicePage() {
  const params = useParams();
  const [order, setOrder] = useState<OnlineOrder | null>(null);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [size, setSize] = useState<"58mm" | "80mm">("80mm");
  
  const [cashierName, setCashierName] = useState("Admin / Owner");

  useEffect(() => {
    const userStr = localStorage.getItem("lbqueen_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCashierName(u.name || "Admin / Owner");
      } catch (e) {}
    }

    const fetchOrder = async () => {
      if (!params.id) return;
      setLoading(true);
      
      try {
        const { data: ord, error: ordError } = await supabase
          .from("customer_orders")
          .select("*")
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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div role="status" className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#FAF7F5]">
        <Loader2 className="w-8 h-8 text-[#C94F78] animate-spin" />
        <p className="text-[13px] font-medium text-[#766B68]">Memuat invoice...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <main id="main-content" className="min-h-screen flex items-center justify-center bg-[#FAF7F5] px-4">
        <div role="alert" className="w-full max-w-sm bg-white rounded-[32px] border border-[#EEDFE3] p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(201,79,120,0.08)]">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-rose-600" aria-hidden="true" />
          </div>
          <p className="text-[16px] font-bold text-[#2D2926]">{error || "Pesanan online tidak ditemukan"}</p>
          <button type="button" onClick={() => window.close()} className="mt-6 h-12 px-8 rounded-2xl bg-white border border-[#E8D5DB] text-[14px] font-bold text-[#766B68] hover:bg-[#FAF7F5] transition-colors">
            Tutup
          </button>
        </div>
      </main>
    );
  }

  const printWidth = size === "58mm" ? "w-[58mm] max-w-[200px]" : "w-[80mm] max-w-[280px]";
  const is58 = size === "58mm";

  const priceMatch = order.product_name.match(/Rp\s*([\d.]+)/);
  const parsedPrice = priceMatch ? parseInt(priceMatch[1].replace(/\./g, "")) : 0;
  const match = order.product_name.match(/\(x(\d+)\)$/);
  const qty = match ? parseInt(match[1]) : 1;
  let nameWithoutQty = order.product_name.replace(/\s*\(x\d+\)$/, "");
  if (priceMatch) {
    nameWithoutQty = nameWithoutQty.replace(/\s*Rp\s*[\d.]+/, "");
  }
  const finalPrice = parsedPrice > 0 ? parsedPrice : price;
  const subtotal = finalPrice * qty;

  return (
    <main id="main-content" className="min-h-screen bg-[#F5EFF1] font-mono flex flex-col items-center px-4 py-6 sm:py-8 print:bg-white print:p-0 print:min-h-0 print:block">
      <div className="no-print print:hidden bg-white p-5 rounded-[32px] shadow-[0_8px_30px_rgba(201,79,120,0.08)] mb-8 w-full max-w-md flex flex-col gap-4 border border-[#EEDFE3] font-sans">
        <div className="flex items-center justify-between gap-3 border-b border-[#F4E8EC] pb-4">
           <button type="button" onClick={() => window.close()} className="h-10 px-3 -ml-1 rounded-2xl flex items-center gap-1.5 text-[#766B68] hover:text-[#A83960] hover:bg-[#FDF2F5] transition-colors text-[14px] font-bold">
             <ChevronLeft className="w-4 h-4" /> Kembali
           </button>
           <h1 className="text-[16px] font-bold! text-[#2D2926]">Pengaturan Cetak</h1>
        </div>

        <div>
          <p className="text-[12px] font-bold text-[#766B68] uppercase tracking-[0.08em] mb-2">Ukuran Kertas</p>
          <div className="grid grid-cols-2 gap-3">
            {(["58mm", "80mm"] as const).map(option => {
              const active = size === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSize(option)}
                  className={`h-12 rounded-2xl text-[14px] font-bold border-2 transition-all ${active ? "border-[#C94F78] bg-[#FDF2F5] text-[#A83960]" : "border-[#EEDFE3] bg-white text-[#766B68] hover:border-[#E3C3CE]"}`}
                >
                  {option.replace("mm", " mm")}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full h-13 text-white rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-200 hover:brightness-105 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)' }}
        >
          <Printer className="w-5 h-5" /> Cetak Biasa (Browser)
        </button>
      </div>

            <div className={`bg-white shadow-[0_12px_40px_rgba(45,41,38,0.10)] ${printWidth} relative p-4 print:shadow-none print:p-0 print:m-0 mx-auto text-black`} style={{ fontFamily: "monospace" }}>
         <div className="absolute top-0 left-0 right-0 h-2 -mt-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] bg-repeat-x no-print print:hidden z-10" />
         
         <div className="flex flex-col items-center mb-4">
            <div className={`relative mb-2 ${is58 ? "w-12 h-12" : "w-16 h-16"}`}>
               <Image src="/lbqueen_logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <h2 className={`${is58 ? "text-[11px]" : "text-sm"} font-bold text-center leading-tight`}>LBQueen.id Care & Beauty<br/>CLINIC</h2>
            <p className={`${is58 ? "text-[11px]" : "text-[11px]"} text-center mt-1 leading-tight px-2`}>
              Jl. Hos Cokroaminoto no.17 Tanjungkarang Timur Bandar Lampung<br/>
              PT. LBQueen Care Beauty<br/>
              Cp : 082176171448
            </p>
         </div>

         <div className="border-t border-dashed border-black/50 my-2" />

         <div className={`${is58 ? "text-[11px]" : "text-[11px]"} space-y-0.5`}>
            <div className="flex justify-between"><span className="w-20">No Order</span><span>: ONL-{order.id}</span></div>
            <div className="flex justify-between gap-2"><span className="w-20 shrink-0">Pelanggan</span><span className="min-w-0 text-right break-words">: {order.customer_name}</span></div>
            <div className="flex justify-between"><span className="w-20">Tgl Order</span><span>: {format(new Date(order.ordered_at), "dd/MM/yyyy HH:mm")}</span></div>
            <div className="flex justify-between"><span className="w-20">Kasir</span><span>: {cashierName}</span></div>
         </div>

         <div className="border-t border-dashed border-black/50 my-2" />
         
         <h3 className={`${is58 ? "text-[11px]" : "text-xs"} font-bold text-center mb-2`}>LAYANAN ONLINE</h3>

         <div className={`${is58 ? "text-[11px]" : "text-[11px]"} space-y-2`}>
             <div className="flex flex-col">
               <span className="font-bold capitalize break-words leading-tight">{nameWithoutQty}</span>
               
               {finalPrice > 0 && (
                 <div className="flex justify-between mt-0.5">
                   <span>{qty} x {finalPrice.toLocaleString("id-ID")}</span>
                   <span>{subtotal.toLocaleString("id-ID")}</span>
                 </div>
               )}
               {finalPrice === 0 && (
                 <div className="flex justify-between mt-0.5">
                   <span>{qty}x</span>
                   <span>-</span>
                 </div>
               )}
             </div>
         </div>

         <div className="border-t border-dashed border-black/50 my-2" />

         <div className={`${is58 ? "text-[11px]" : "text-[11px]"}`}>
           {finalPrice > 0 && (
             <div className="flex justify-between font-bold mt-1 text-[11px]">
               <span>Total Estimasi</span>
               <span>{subtotal.toLocaleString("id-ID")}</span>
             </div>
           )}
           {finalPrice === 0 && (
             <div className="flex justify-between font-bold mt-1 text-[11px]">
               <span>Total</span>
               <span>TBD (Konfirmasi WA)</span>
             </div>
           )}
         </div>

         <div className="border-t border-dashed border-black/50 my-2" />

         <div className={`${is58 ? "text-[11px]" : "text-[11px]"} space-y-0.5`}>
           <div className="flex justify-between"><span>Status Order</span><span className="uppercase text-emerald-600 font-bold">{order.status === "completed" ? "Selesai" : order.status}</span></div>
           <div className="flex justify-between"><span>Metode Bayar</span><span>Transfer/WA</span></div>
         </div>

         <div className="border-t border-dashed border-black/50 my-2" />

         <div className={`${is58 ? "text-[11px]" : "text-[11px]"} text-center mt-3 font-bold mb-4`}>
            LBQueen.id Care & Beauty Clinic<br/>
            PT. LBQueen Care Beauty
         </div>

         <div className="absolute bottom-0 left-0 right-0 h-2 -mb-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDgsMCA0LDgiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] bg-repeat-x no-print print:hidden z-10" />
      </div>
    </main>
  );
}
