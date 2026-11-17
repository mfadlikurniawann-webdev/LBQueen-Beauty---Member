"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Loader2, Ticket, AlertTriangle, ChevronLeft, Copy, Check, Calendar, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";

const WA_NUMBER = "6282176171448";

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { cart, removeFromCart, updateQty, clearCart, totalItems } = useCart();
  const [customer, setCustomer] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const checkoutKey = useRef<string | null>(null);
  const checkoutInFlight = useRef(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [isVoucherFormOpen, setIsVoucherFormOpen] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"bank" | "qris">("bank");
  const [copiedBank, setCopiedBank] = useState<"bni" | null>(null);

  const hasTreatment = cart.some((item: any) =>
    item.type === "Treatment Care & Beauty" ||
    (!item.type && (item.name.toLowerCase().includes("treatment") || item.name.toLowerCase().includes("facial")))
  );

  useEffect(() => {
    const stored = localStorage.getItem("lbqueen_customer");
    if (stored) { try { setCustomer(JSON.parse(stored)); } catch {} }
  }, []);

  const cartTotal = cart.reduce((a: number, i: any) => a + Math.max(0, i.price - (i.voucher_discount || 0)) * i.qty, 0);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherError("");
    setIsValidatingVoucher(true);
    try {
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("code", voucherCode.trim().toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        setVoucherError("Voucher tidak valid atau tidak aktif");
        return;
      }

      if (cartTotal < data.min_transaction) {
        setVoucherError(`Min. belanja Rp ${data.min_transaction.toLocaleString("id-ID")}`);
        return;
      }

      if (data.product_id) {
        const hasProduct = cart.some((item: any) => item.id === data.product_id);
        if (!hasProduct) {
          setVoucherError("Voucher hanya berlaku untuk produk tertentu");
          return;
        }
      }

      setAppliedVoucher(data);
      setIsVoucherFormOpen(false);
      setVoucherError("");
    } catch (err) {
      setVoucherError("Gagal memeriksa voucher");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
  };

  const discount = appliedVoucher
    ? (appliedVoucher.product_id 
        ? 0 
        : (appliedVoucher.type === "percent" 
            ? Math.floor((cartTotal * appliedVoucher.discount_amount) / 100)
            : appliedVoucher.discount_amount))
    : 0;

  const finalTotal = Math.max(0, cartTotal - discount);

  const handleCopy = (num: string, type: "bni") => {
    navigator.clipboard.writeText(num);
    setCopiedBank(type);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleWAOrder = async () => {
    if (!customer || cart.length === 0 || checkoutInFlight.current) return;
    if (hasTreatment && (!bookingDate || !bookingTime || new Date(`${bookingDate}T${bookingTime}`) <= new Date())) { toast("Pilih tanggal dan jam treatment di waktu mendatang.", "error"); return; }
    checkoutInFlight.current = true;
    setProcessing(true);
    try {
      checkoutKey.current ||= crypto.randomUUID();
      const { checkoutOnline } = await import("@/app/actions/checkout");
      const result = await checkoutOnline({ items: cart.map(item => ({ product_id: item.id, variant_id: item.variant_id, qty: item.qty })), voucherCode: appliedVoucher?.code || null, bookingDate, bookingTime, method: paymentMethod, expectedTotal: finalTotal, requestKey: checkoutKey.current });
      if (result.error || !result.data) throw new Error(result.error || "Pesanan gagal disimpan.");

      let msg = `Halo LBQueen! Saya *${customer.name}*${customer.is_member ? " (Member)" : ""}.\n\nPesanan saya:\n\n`;
      result.data.orders.forEach((item, i) => {
        msg += `${i + 1}. *${item.product_name}*\n   Rp ${item.total_price.toLocaleString("id-ID")}\n`;
      });
      
      if (hasTreatment) {
        msg += `\n*Jadwal Booking Treatment:*\n`;
        msg += `Tanggal: ${bookingDate}\nJam: ${bookingTime}\n`;
      }
      
      if (appliedVoucher) {
        if (appliedVoucher.product_id) {
          msg += `\nVoucher digunakan: *${appliedVoucher.code}*\n`;
        } else {
          msg += `\nVoucher digunakan: *${appliedVoucher.code}*\n`;
          msg += `Diskon voucher: *- Rp ${discount.toLocaleString("id-ID")}*\n`;
        }
      }
      
      msg += `\n*Total Akhir: Rp ${result.data.total.toLocaleString("id-ID")}*\n`;
      msg += `Metode Pembayaran: *${paymentMethod === "bank" ? "Transfer Bank" : "QRIS / E-Wallet"}*\n\n`;
      msg += `Saya akan melampirkan screenshot bukti transfer pembayaran setelah pesan ini. Mohon segera dikonfirmasi. Terima kasih!`;
      clearCart();
      checkoutKey.current = null;
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
      router.push("/orders");
    } catch (e: any) {
      toast("Gagal: " + (e.message || "Terjadi kesalahan"), "error");
    } finally { setProcessing(false); checkoutInFlight.current = false; }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFBFB]">
        <div className="relative overflow-hidden px-6 pt-10 pb-12" 
          style={{ background: 'linear-gradient(160deg,#C94F78 0%,#9B3055 55%,#7A2240 100%)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <button aria-label="Kembali" onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-[22px] font-bold text-white tracking-tight">Keranjang</h1>
              <p className="text-white/60 text-[11px] font-medium">Lengkapi pesanan Anda</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6" style={{ background: 'rgba(201,79,120,0.06)' }}>
            <ShoppingBag className="w-8 h-8" style={{ color: '#C94F78' }} />
          </div>
          <h2 className="text-[20px] font-bold text-[#2D2926] mb-2 tracking-tight">Keranjang Kosong</h2>
          <p className="text-[13px] text-slate-400 font-medium mb-10 max-w-[260px]">Sepertinya Anda belum memilih treatment atau produk kami.</p>
          <button onClick={() => router.push("/")} className="h-14 px-10 rounded-2xl text-white text-[14px] font-bold flex items-center gap-3 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)', boxShadow: '0 12px 30px rgba(201,79,120,0.25)' }}>
            Mulai Belanja Sekarang <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBFB] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden px-6 pt-10 pb-12 rounded-b-[48px] shadow-lg shadow-rose-100/20" 
          style={{ background: 'linear-gradient(160deg,#C94F78 0%,#9B3055 55%,#7A2240 100%)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -ml-32 -mt-32"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <button aria-label="Kembali" onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-[22px] font-bold text-white tracking-tight">Keranjang</h1>
            <p className="text-white/60 text-[11px] font-medium">{totalItems} item siap dipesan</p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pt-5 pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item: any, idx: number) => (
              <div key={`${item.id}-${item.variant_id || idx}`}
                className="bg-white rounded-2xl p-4 border border-[#f0eded] flex gap-4"
                style={{ boxShadow: '0 4px 16px rgba(201,79,120,0.05)' }}>
                <div className="w-16 h-16 rounded-xl bg-[#faf9f9] border border-[#f0eded] overflow-hidden shrink-0 relative">
                  {item.image_url
                    ? <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center p-3 opacity-20"><Image src="/lbqueen_logo.png" alt="LB" width={40} height={40} className="object-contain" style={{ width:'auto', height:'auto' }} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-normal text-[#2D2926] leading-tight truncate mb-1">{item.name}</h3>
                  {item.variant_name && (
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full inline-block mb-2"
                      style={{ color: '#C94F78', background: 'rgba(201,79,120,0.08)' }}>{item.variant_name}</span>
                  )}
                  <p className="text-[14px] font-medium" style={{ color: '#C94F78' }}>
                    Rp {((item.price - (item.voucher_discount || 0)) * item.qty).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button aria-label="Hapus Item" onClick={() => removeFromCart(item.id, item.variant_id)} className="p-1.5 text-[#2D2926]/15 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-2 rounded-xl px-2 py-1.5 border border-[#f0eded]" style={{ background: '#FDFAF8' }}>
                    <button aria-label="Kurangi Jumlah" onClick={() => item.qty === 1 ? removeFromCart(item.id, item.variant_id) : updateQty(item.id, item.qty - 1, item.variant_id)}
                      className="w-6 h-6 flex items-center justify-center text-[#2D2926]/25 hover:text-[#C94F78] transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[12px] font-medium text-[#2D2926] w-4 text-center">{item.qty}</span>
                    <button aria-label="Tambah Jumlah" onClick={() => updateQty(item.id, item.qty + 1, item.variant_id)}
                      className="w-6 h-6 flex items-center justify-center text-[#C94F78] transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-[#f0eded] flex flex-col gap-3"
              style={{ boxShadow: '0 4px 16px rgba(201,79,120,0.05)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,79,120,0.08)' }}>
                    <Ticket className="w-4 h-4" style={{ color: '#C94F78' }} />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#2D2926]">Voucher LBQueen</p>
                    {appliedVoucher ? (
                      <p className="text-[10px] text-emerald-600 font-semibold leading-tight">
                        Kode: {appliedVoucher.code} ({appliedVoucher.type === "percent" ? `${appliedVoucher.discount_amount}%` : `Rp ${appliedVoucher.discount_amount.toLocaleString("id-ID")}`})
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#2D2926]/30 font-normal">Gunakan promo spesial member</p>
                    )}
                  </div>
                </div>
                {appliedVoucher ? (
                  <button onClick={handleRemoveVoucher} className="text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-colors bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100">
                    Hapus
                  </button>
                ) : (
                  !isVoucherFormOpen && (
                    <button onClick={() => setIsVoucherFormOpen(true)} className="text-[11px] font-medium px-3 py-1.5 rounded-xl border transition-colors"
                      style={{ color: '#C94F78', background: 'rgba(201,79,120,0.06)', borderColor: 'rgba(201,79,120,0.15)' }}>
                      Gunakan
                    </button>
                  )
                )}
              </div>

              {isVoucherFormOpen && (
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode voucher"
                      value={voucherCode}
                      onChange={e => {
                        setVoucherCode(e.target.value.toUpperCase());
                        setVoucherError("");
                      }}
                      className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-[12px] outline-none focus:border-[#C94F78] uppercase"
                    />
                    <button
                      onClick={handleApplyVoucher}
                      disabled={isValidatingVoucher}
                      className="h-9 px-4 rounded-xl text-white text-[11px] font-bold flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)' }}
                    >
                      {isValidatingVoucher ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Gunakan"}
                    </button>
                    <button
                      onClick={() => {
                        setIsVoucherFormOpen(false);
                        setVoucherError("");
                      }}
                      className="h-9 px-3 rounded-xl border border-slate-200 text-slate-400 text-[11px] hover:bg-slate-50"
                    >
                      Batal
                    </button>
                  </div>
                  {voucherError && (
                    <p className="text-[10px] text-rose-500 font-semibold">{voucherError}</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#f0eded]" style={{ boxShadow: '0 4px 16px rgba(201,79,120,0.05)' }}>
              <h3 className="text-[13px] font-medium text-[#2D2926] mb-5">Ringkasan Pesanan</h3>
              <div className="space-y-3 text-[12px]">
                <div className="flex justify-between"><span className="text-[#2D2926]/35">Subtotal</span><span className="text-[#2D2926] font-medium">Rp {cartTotal.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between">
                  <span className="text-[#2D2926]/35">Diskon</span>
                  <span className={discount > 0 ? "text-emerald-500 font-semibold" : "text-[#2D2926]/30"}>
                    - Rp {discount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="h-px my-4" style={{ background: 'rgba(201,79,120,0.07)' }} />
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-medium text-[#2D2926]">Total</span>
                <span className="text-[20px] font-semibold tracking-tight" style={{ color: '#C94F78' }}>Rp {finalTotal.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#f0eded] flex flex-col gap-4"
              style={{ boxShadow: '0 4px 16px rgba(201,79,120,0.05)' }}>
              <h3 className="text-[13px] font-bold text-[#2D2926]">Metode Pembayaran</h3>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  className="flex-1 h-10 rounded-2xl text-[11px] font-bold transition-all active:scale-[0.97] px-4"
                  style={paymentMethod === "bank" 
                    ? { background: 'linear-gradient(135deg,#C94F78,#9B3055)', color: 'white' } 
                    : { background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }}
                >
                  Transfer Bank
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("qris")}
                  className="flex-1 h-10 rounded-2xl text-[11px] font-bold transition-all active:scale-[0.97] px-4"
                  style={paymentMethod === "qris" 
                    ? { background: 'linear-gradient(135deg,#C94F78,#9B3055)', color: 'white' } 
                    : { background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }}
                >
                  QRIS / E-Wallet
                </button>
              </div>

              {paymentMethod === "bank" && (
                <div className="flex flex-col gap-3 pt-2 border-t border-slate-50">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold">BANK BNI</p>
                      <p className="text-[13px] font-bold text-[#2D2926] tracking-wide">1447575021</p>
                      <p className="text-[9px] text-slate-400 font-medium">a.n. Meilinda Juwita Sari</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("1447575021", "bni")}
                      className="h-8 px-4 rounded-2xl text-[10px] font-bold flex items-center gap-1.5 transition-all border"
                      style={copiedBank === "bni"
                        ? { background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }
                        : { background: 'rgba(201,79,120,0.06)', color: '#C94F78', borderColor: 'rgba(201,79,120,0.15)' }}
                    >
                      {copiedBank === "bni" ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Salin
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === "qris" && (
                <div className="flex flex-col gap-3 pt-2 border-t border-slate-50 items-center">
                  <div className="relative w-44 h-44 rounded-xl border border-slate-100 p-2 bg-white shadow-sm overflow-hidden flex items-center justify-center">
                    <Image
                      src="/qris_customer.png"
                      alt="QRIS LBQueen"
                      width={160}
                      height={160}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed max-w-[200px]">
                    Pindai barcode QRIS di atas menggunakan aplikasi m-banking atau e-wallet pilihan Anda.
                  </p>
                </div>
              )}
            </div>

            {hasTreatment && (
              <div className="bg-white rounded-2xl p-5 border border-[#f0eded] flex flex-col gap-4" style={{ boxShadow: '0 4px 16px rgba(201,79,120,0.05)' }}>
                <h3 className="text-[13px] font-bold text-[#2D2926]">Jadwal Booking Treatment</h3>
                <p className="text-[11px] text-slate-400 font-medium">Silakan pilih jadwal untuk perawatan Anda.</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Tanggal</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-[#C94F78]" />
                      </div>
                      <input 
                        type="date" 
                        value={bookingDate}
                        onChange={e => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="block w-full pl-9 pr-3 py-2.5 text-[12px] bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#C94F78]"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Jam</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-4 w-4 text-[#C94F78]" />
                      </div>
                      <input 
                        type="time" 
                        value={bookingTime}
                        onChange={e => setBookingTime(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2.5 text-[12px] bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#C94F78]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasTreatment && (
              <div className="rounded-2xl p-4 border space-y-3"
                style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.18)' }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    <span className="font-medium block mb-1">Perhatian Sebelum Treatment</span>
                    H-7 & H+7 dilarang konsumsi alkohol. Jujur pada kondisi tubuh ke therapist.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer border-t pt-3" style={{ borderColor: 'rgba(245,158,11,0.15)' }}>
                  <input type="checkbox" checked={isAgreed} onChange={e => setIsAgreed(e.target.checked)}
                    className="w-4 h-4 rounded" style={{ accentColor: '#C94F78' }} />
                  <span className="text-[11px] font-medium text-amber-900">Saya mengerti & menyetujui</span>
                </label>
              </div>
            )}

            <button onClick={handleWAOrder} disabled={processing || (hasTreatment && (!isAgreed || !bookingDate || !bookingTime))}
              className="w-full h-12 rounded-2xl text-white font-bold text-[13px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-30 px-6"
              style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)', boxShadow: '0 8px 24px rgba(201,79,120,0.28)' }}>
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
              Konfirmasi & Buat Pesanan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
