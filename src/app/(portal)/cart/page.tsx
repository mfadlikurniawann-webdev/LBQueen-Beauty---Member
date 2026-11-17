"use client";

import { useCart, type CartItem } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Loader2, Ticket, AlertTriangle, ChevronLeft, Copy, Check, Calendar, Clock, Scissors, Package, Landmark, QrCode, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";

const WA_NUMBER = "6282176171448";

const CARD = "bg-white rounded-[24px] border border-[#EEDFE3] shadow-[0_4px_18px_rgba(201,79,120,0.06)]";
const PRIMARY_GRADIENT = "linear-gradient(135deg,#C94F78,#9B3055)";

function isTreatmentItem(item: Pick<CartItem, "type" | "name">) {
  return item.type === "Treatment Care & Beauty" ||
    (!item.type && (item.name.toLowerCase().includes("treatment") || item.name.toLowerCase().includes("facial")));
}

function ItemThumb({ item }: { item: CartItem }) {
  const Icon = isTreatmentItem(item) ? Scissors : Package;
  return (
    <div className="w-[72px] h-[72px] rounded-2xl border border-[#EEDFE3] overflow-hidden shrink-0 relative">
      {item.image_url
        ? <Image src={item.image_url} alt={item.name} fill sizes="72px" className="object-cover" />
        : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F8DCE6] via-[#FBEFF3] to-[#FDFBFB]">
            <Icon className="w-6 h-6 text-[#C94F78]" aria-hidden="true" />
          </div>
        )}
    </div>
  );
}

function PageHero({ subtitle, onBack }: { subtitle: string; onBack: () => void }) {
  return (
    <div className="relative overflow-hidden px-5 sm:px-8 pt-10 pb-12 rounded-b-[40px] shadow-lg shadow-rose-100/30"
      style={{ background: 'linear-gradient(160deg,#C94F78 0%,#9B3055 55%,#7A2240 100%)' }}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl -ml-12 -mb-12" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -ml-32 -mt-32" />
      <div className="relative z-10 flex items-center gap-4">
        <button type="button" aria-label="Kembali" onClick={onBack}
          className="w-11 h-11 shrink-0 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/25 hover:bg-white/25 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold! text-white tracking-tight leading-tight">Keranjang</h1>
          <p className="text-white/85 text-[13px] font-medium mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[15px] font-semibold! text-[#2D2926] tracking-tight">{children}</h2>;
}

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
        <PageHero subtitle="Lengkapi pesanan Anda" onBack={() => router.back()} />

        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-[#FDF2F5] border border-[#F6DDE6]">
            <ShoppingBag className="w-8 h-8 text-[#C94F78]" aria-hidden="true" />
          </div>
          <h2 className="text-[20px] font-bold! text-[#2D2926] mb-2 tracking-tight">Keranjang Kosong</h2>
          <p className="text-[14px] text-[#766B68] leading-relaxed mb-8 max-w-[280px]">Sepertinya Anda belum memilih treatment atau produk kami.</p>
          <button type="button" onClick={() => router.push("/")} className="h-14 px-8 rounded-2xl text-white text-[14px] font-bold flex items-center gap-3 active:scale-95 transition-all"
            style={{ background: PRIMARY_GRADIENT, boxShadow: '0 12px 30px rgba(201,79,120,0.25)' }}>
            Mulai Belanja Sekarang <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const confirmBlocked = hasTreatment && (!isAgreed || !bookingDate || !bookingTime);

  return (
    <div className="min-h-screen bg-[#FDFBFB] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHero subtitle={`${totalItems} item siap dipesan`} onBack={() => router.back()} />

      <div className="px-4 md:px-8 pt-5 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item: any, idx: number) => {
              const hasItemDiscount = (item.voucher_discount || 0) > 0;
              const lineTotal = (item.price - (item.voucher_discount || 0)) * item.qty;
              return (
                <div key={`${item.id}-${item.variant_id || idx}`} className={`${CARD} p-4 flex gap-3.5`}>
                  <ItemThumb item={item} />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start gap-2">
                      <h3 className="flex-1 min-w-0 text-[14px] font-semibold! text-[#2D2926] leading-snug line-clamp-2">{item.name}</h3>
                      <button type="button" aria-label="Hapus Item" onClick={() => removeFromCart(item.id, item.variant_id)}
                        className="w-8 h-8 -mt-1 -mr-1 shrink-0 rounded-xl flex items-center justify-center text-[#766B68] hover:text-rose-600 hover:bg-rose-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.variant_name && (
                      <span className="self-start mt-1 text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FDF2F5] text-[#A83960] max-w-full truncate">
                        {item.variant_name}
                      </span>
                    )}
                    <div className="mt-auto pt-2.5 flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
                      <div className="min-w-0">
                        {hasItemDiscount && (
                          <p className="text-[12px] text-[#766B68] line-through tabular-nums leading-none mb-1">
                            Rp {(item.price * item.qty).toLocaleString("id-ID")}
                          </p>
                        )}
                        <p className="text-[15px] font-bold text-[#A83960] tabular-nums leading-tight">
                          Rp {lineTotal.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 rounded-2xl p-1 border border-[#EEDFE3] bg-[#FDFAFB]">
                        <button type="button" aria-label="Kurangi Jumlah" onClick={() => item.qty === 1 ? removeFromCart(item.id, item.variant_id) : updateQty(item.id, item.qty - 1, item.variant_id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#766B68] hover:bg-white hover:text-[#C94F78] transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[14px] font-bold text-[#2D2926] min-w-6 text-center tabular-nums" aria-live="polite">{item.qty}</span>
                        <button type="button" aria-label="Tambah Jumlah" onClick={() => updateQty(item.id, item.qty + 1, item.variant_id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#C94F78] hover:bg-white transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className={`${CARD} p-4 flex flex-col gap-3`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center bg-[#FDF2F5]">
                    <Ticket className="w-5 h-5 text-[#C94F78]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#2D2926] leading-tight">Voucher LBQueen</p>
                    {appliedVoucher ? (
                      <p className="text-[12px] text-emerald-700 font-semibold leading-snug mt-0.5">
                        Kode: {appliedVoucher.code} ({appliedVoucher.type === "percent" ? `${appliedVoucher.discount_amount}%` : `Rp ${appliedVoucher.discount_amount.toLocaleString("id-ID")}`})
                      </p>
                    ) : (
                      <p className="text-[12px] text-[#766B68] leading-snug mt-0.5">Gunakan promo spesial member</p>
                    )}
                  </div>
                </div>
                {appliedVoucher ? (
                  <button type="button" onClick={handleRemoveVoucher} className="shrink-0 h-9 text-[12px] font-bold px-4 rounded-2xl border transition-colors bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100">
                    Hapus
                  </button>
                ) : (
                  !isVoucherFormOpen && (
                    <button type="button" onClick={() => setIsVoucherFormOpen(true)} className="shrink-0 h-9 text-[12px] font-bold px-4 rounded-2xl border transition-colors bg-[#FDF2F5] text-[#A83960] border-[#F0CBD8] hover:bg-[#FBE7EE]">
                      Gunakan
                    </button>
                  )
                )}
              </div>

              {isVoucherFormOpen && (
                <div className="flex flex-col gap-2 pt-3 border-t border-[#F4E8EC]">
                  <label htmlFor="voucher-code" className="sr-only">Kode voucher</label>
                  <div className="flex gap-2">
                    <input
                      id="voucher-code"
                      type="text"
                      placeholder="Masukkan kode voucher"
                      value={voucherCode}
                      onChange={e => {
                        setVoucherCode(e.target.value.toUpperCase());
                        setVoucherError("");
                      }}
                      className="flex-1 min-w-0 h-11 px-3.5 rounded-2xl border border-[#E8D5DB] bg-[#FDFAFB] text-[14px] font-semibold text-[#2D2926] placeholder:font-normal placeholder:normal-case placeholder:text-[#8C8280] outline-none focus:bg-white focus:border-[#C94F78] focus:ring-4 focus:ring-[#C94F78]/10 uppercase transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={isValidatingVoucher}
                      className="shrink-0 h-11 px-4 rounded-2xl text-white text-[12px] font-bold flex items-center justify-center disabled:opacity-70"
                      style={{ background: PRIMARY_GRADIENT }}
                    >
                      {isValidatingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gunakan"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsVoucherFormOpen(false);
                        setVoucherError("");
                      }}
                      className="shrink-0 h-11 px-3.5 rounded-2xl border border-[#E8D5DB] bg-white text-[#766B68] text-[12px] font-bold hover:bg-[#FAF7F5]"
                    >
                      Batal
                    </button>
                  </div>
                  {voucherError && (
                    <p role="alert" className="text-[12px] text-rose-700 font-semibold">{voucherError}</p>
                  )}
                </div>
              )}
            </div>

            <div className={`${CARD} p-5`}>
              <SectionTitle>Ringkasan Pesanan</SectionTitle>
              <div className="space-y-3 text-[13px] mt-4">
                <div className="flex justify-between gap-3">
                  <span className="text-[#766B68]">Subtotal</span>
                  <span className="text-[#2D2926] font-semibold tabular-nums">Rp {cartTotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#766B68]">Diskon</span>
                  <span className={`tabular-nums ${discount > 0 ? "text-emerald-700 font-semibold" : "text-[#766B68] font-medium"}`}>
                    - Rp {discount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="h-px my-4 bg-[#F4E8EC]" />
              <div className="flex justify-between items-center gap-3">
                <span className="text-[14px] font-bold text-[#2D2926]">Total</span>
                <span className="text-[22px] font-bold tracking-tight tabular-nums text-[#A83960]">Rp {finalTotal.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className={`${CARD} p-5 flex flex-col gap-4`}>
              <SectionTitle>Metode Pembayaran</SectionTitle>

              <div className="grid grid-cols-2 gap-2.5">
                {([
                  { id: "bank", label: "Transfer Bank", icon: Landmark },
                  { id: "qris", label: "QRIS / E-Wallet", icon: QrCode },
                ] as const).map(({ id, label, icon: MethodIcon }) => {
                  const active = paymentMethod === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setPaymentMethod(id)}
                      className={`relative min-h-[76px] rounded-2xl border-2 px-3 py-3 flex flex-col items-start justify-between gap-2 text-left transition-all active:scale-[0.98] ${active
                        ? "border-[#C94F78] bg-[#FDF2F5] shadow-[0_6px_16px_rgba(201,79,120,0.12)]"
                        : "border-[#EEDFE3] bg-white hover:border-[#E3C3CE]"}`}
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${active ? "bg-white text-[#C94F78]" : "bg-[#FAF7F5] text-[#766B68]"}`}>
                        <MethodIcon className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <span className={`text-[13px] font-bold leading-tight ${active ? "text-[#A83960]" : "text-[#2D2926]"}`}>{label}</span>
                      {active && <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-[#C94F78]" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "bank" && (
                <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-[#EEDFE3] flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#766B68] font-bold uppercase tracking-[0.1em]">Bank BNI</p>
                    <p className="text-[18px] font-bold text-[#2D2926] tracking-wide tabular-nums leading-tight mt-0.5">1447575021</p>
                    <p className="text-[12px] text-[#766B68] font-medium mt-0.5">a.n. Meilinda Juwita Sari</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("1447575021", "bni")}
                    className={`h-10 px-4 rounded-2xl text-[12px] font-bold flex items-center gap-1.5 transition-all border ${copiedBank === "bni"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-white text-[#A83960] border-[#F0CBD8] hover:bg-[#FDF2F5]"}`}
                  >
                    {copiedBank === "bni" ? (
                      <>
                        <Check className="w-4 h-4" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Salin
                      </>
                    )}
                  </button>
                </div>
              )}

              {paymentMethod === "qris" && (
                <div className="flex flex-col gap-3 items-center p-4 bg-[#FAF7F5] rounded-2xl border border-[#EEDFE3]">
                  <div className="relative w-44 h-44 rounded-2xl border border-[#EEDFE3] p-2 bg-white shadow-sm overflow-hidden flex items-center justify-center">
                    <Image
                      src="/qris_customer.png"
                      alt="QRIS LBQueen"
                      width={160}
                      height={160}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-[12px] text-[#766B68] font-medium text-center leading-relaxed max-w-[240px]">
                    Pindai barcode QRIS di atas menggunakan aplikasi m-banking atau e-wallet pilihan Anda.
                  </p>
                </div>
              )}
            </div>

            {hasTreatment && (
              <div className={`${CARD} p-5 flex flex-col gap-4`}>
                <div>
                  <SectionTitle>Jadwal Booking Treatment</SectionTitle>
                  <p className="text-[13px] text-[#766B68] mt-1">Silakan pilih jadwal untuk perawatan Anda.</p>
                </div>
                <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label htmlFor="booking-date" className="block text-[11px] font-bold text-[#766B68] mb-1.5 uppercase tracking-[0.1em]">Tanggal</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-[#C94F78]" aria-hidden="true" />
                      </div>
                      <input
                        id="booking-date"
                        type="date"
                        value={bookingDate}
                        onChange={e => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="block w-full min-w-0 h-12 pl-9 pr-2 text-[14px] text-[#2D2926] bg-[#FDFAFB] border border-[#E8D5DB] rounded-2xl outline-none focus:bg-white focus:border-[#C94F78] focus:ring-4 focus:ring-[#C94F78]/10 transition-all"
                      />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="booking-time" className="block text-[11px] font-bold text-[#766B68] mb-1.5 uppercase tracking-[0.1em]">Jam</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-4 w-4 text-[#C94F78]" aria-hidden="true" />
                      </div>
                      <input
                        id="booking-time"
                        type="time"
                        value={bookingTime}
                        onChange={e => setBookingTime(e.target.value)}
                        className="block w-full min-w-0 h-12 pl-9 pr-2 text-[14px] text-[#2D2926] bg-[#FDFAFB] border border-[#E8D5DB] rounded-2xl outline-none focus:bg-white focus:border-[#C94F78] focus:ring-4 focus:ring-[#C94F78]/10 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasTreatment && (
              <div className="rounded-[24px] p-4 border border-amber-200 bg-amber-50 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-700" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-amber-900">Perhatian Sebelum Treatment</p>
                    <p className="text-[13px] text-amber-800 leading-relaxed mt-0.5">
                      H-7 & H+7 dilarang konsumsi alkohol. Jujur pada kondisi tubuh ke therapist.
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer border-t border-amber-200 pt-3">
                  <input type="checkbox" checked={isAgreed} onChange={e => setIsAgreed(e.target.checked)}
                    className="w-5 h-5 shrink-0 rounded cursor-pointer" style={{ accentColor: '#C94F78' }} />
                  <span className="text-[13px] font-semibold text-amber-900">Saya mengerti & menyetujui</span>
                </label>
              </div>
            )}

            <div className="pt-1">
              <button type="button" onClick={handleWAOrder} disabled={processing || confirmBlocked}
                aria-describedby={confirmBlocked ? "confirm-hint" : undefined}
                className={`w-full min-h-14 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-3 px-6 py-3 transition-all ${confirmBlocked
                  ? "bg-[#EDE4E6] text-[#766B68] border border-[#E0D2D6] shadow-none"
                  : "text-white active:scale-[0.98] disabled:cursor-wait disabled:opacity-90"}`}
                style={confirmBlocked ? undefined : { background: PRIMARY_GRADIENT, boxShadow: '0 10px 26px rgba(201,79,120,0.30)' }}>
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                Konfirmasi & Buat Pesanan
              </button>
              {confirmBlocked && (
                <p id="confirm-hint" className="text-[12px] text-[#766B68] text-center mt-2.5 leading-relaxed">
                  Pilih tanggal & jam treatment, lalu centang persetujuan untuk melanjutkan.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
