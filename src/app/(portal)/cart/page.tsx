"use client";

import { checkoutOnline } from "@/app/actions/checkout";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag } from "lucide-react";
import { BookingScheduleCard } from "@/components/cart/BookingScheduleCard";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { buildOrderMessage, isTreatmentItem } from "@/components/cart/cart-utils";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { PaymentMethodCard, type PaymentMethod } from "@/components/cart/PaymentMethodCard";
import { TreatmentNotice } from "@/components/cart/TreatmentNotice";
import { useCartVoucher } from "@/components/cart/useCartVoucher";
import { VoucherCard } from "@/components/cart/VoucherCard";
import { PageHero } from "@/components/portal/PageHero";
import { useToast } from "@/components/Toast";
import { useCart } from "@/context/CartContext";
import { WA_NUMBER } from "@/lib/constants";
import { useCustomer } from "@/context/CustomerContext";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/stale-deploy";

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { cart, removeFromCart, updateQty, clearCart, totalItems } = useCart();
  const { customer, refresh } = useCustomer();
  const [processing, setProcessing] = useState(false);
  const checkoutKey = useRef<string | null>(null);
  const checkoutInFlight = useRef(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");

  const hasTreatment = cart.some(isTreatmentItem);

  const cartTotal = cart.reduce(
    (a, i) => a + Math.max(0, i.price - (i.voucher_discount || 0)) * i.qty,
    0,
  );
  const voucher = useCartVoucher(cart, cartTotal, customer ?? null);
  const appliedVoucher = voucher.applied;
  const discount = voucher.discount;
  const finalTotal = Math.max(0, cartTotal - discount);

  const handleWAOrder = async () => {
    if (!customer || cart.length === 0 || checkoutInFlight.current) return;
    if (
      hasTreatment &&
      (!bookingDate || !bookingTime || new Date(`${bookingDate}T${bookingTime}`) <= new Date())
    ) {
      toast("Pilih tanggal dan jam treatment di waktu mendatang.", "error");
      return;
    }
    checkoutInFlight.current = true;
    setProcessing(true);
    try {
      checkoutKey.current ||= crypto.randomUUID();
      const result = await checkoutOnline({
        items: cart.map((item) => ({
          product_id: item.id,
          variant_id: item.variant_id,
          qty: item.qty,
        })),
        voucherCode: appliedVoucher?.code || null,
        bookingDate,
        bookingTime,
        method: paymentMethod,
        expectedTotal: finalTotal,
        requestKey: checkoutKey.current,
      });
      if (result.error || !result.data) throw new Error(result.error || "Pesanan gagal disimpan.");

      const msg = buildOrderMessage({
        customer,
        orders: result.data.orders,
        total: result.data.total,
        booking: hasTreatment ? { date: bookingDate, time: bookingTime } : null,
        voucher: appliedVoucher,
        discount,
        paymentMethod,
      });
      clearCart();
      checkoutKey.current = null;
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
      void refresh();
      router.push("/orders");
    } catch (e) {
      toast("Gagal: " + errorMessage(e, "Terjadi kesalahan"), "error");
    } finally {
      setProcessing(false);
      checkoutInFlight.current = false;
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen">
        <PageHero title="Keranjang" subtitle="Lengkapi pesanan Anda" onBack={() => router.back()} />
        <EmptyCart onShop={() => router.push("/")} />
      </div>
    );
  }

  const confirmBlocked = hasTreatment && (!isAgreed || !bookingDate || !bookingTime);

  return (
    <div className="min-h-screen animate-in fade-in duration-500">
      <PageHero
        title="Keranjang"
        subtitle={`${totalItems} item siap dipesan`}
        onBack={() => router.back()}
      />

      <div className="px-4 md:px-8 pt-2 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_340px] lg:grid-cols-[minmax(0,1fr)_400px] gap-6">
          <div className="space-y-3">
            {cart.map((item, idx) => (
              <CartItemCard
                key={`${item.id}-${item.variant_id || idx}`}
                item={item}
                onRemove={() => removeFromCart(item.id, item.variant_id)}
                onQty={(qty) => updateQty(item.id, qty, item.variant_id)}
              />
            ))}
          </div>

          <div className="space-y-4 md:sticky md:top-[88px] md:self-start">
            <VoucherCard voucher={voucher} />
            <OrderSummary subtotal={cartTotal} discount={discount} total={finalTotal} />
            <PaymentMethodCard method={paymentMethod} onChange={setPaymentMethod} />

            {hasTreatment && (
              <BookingScheduleCard
                date={bookingDate}
                time={bookingTime}
                onDate={setBookingDate}
                onTime={setBookingTime}
              />
            )}

            {hasTreatment && <TreatmentNotice agreed={isAgreed} onChange={setIsAgreed} />}

            <div
              className={cn(
                "fixed inset-x-0 bottom-0 z-40 px-3 pt-0 md:static md:z-auto md:p-0",
              )}
              style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}
            >
              {/* HP: bar checkout kaca melayang; layar lebar: menyatu di kolom ringkasan. */}
              <div className="glass mx-auto max-w-lg rounded-[28px] px-4 pt-3 pb-3 md:max-w-none md:rounded-none md:p-0 md:bg-transparent md:border-0 md:shadow-none md:backdrop-blur-none">
                <div className="flex items-baseline justify-between gap-3 mb-2.5 md:hidden">
                  <span className="text-[13px] font-semibold text-[#5F5552]">Total pembayaran</span>
                  <span className="text-[19px] font-bold text-[#2D2926] tabular-nums">
                    {formatRupiah(finalTotal)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleWAOrder}
                  disabled={processing || confirmBlocked}
                  aria-describedby={confirmBlocked ? "confirm-hint" : undefined}
                  className={cn(
                    "w-full h-[52px] rounded-full font-bold text-[15px] flex items-center justify-center",
                    "gap-2.5 px-6 transition-all duration-300",
                    confirmBlocked
                      ? "chip-glass text-[#8C8280]"
                      : "btn-primary disabled:cursor-wait disabled:opacity-90",
                  )}
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ShoppingBag className="w-5 h-5" />
                  )}
                  Konfirmasi & Buat Pesanan
                </button>
                {confirmBlocked && (
                  <p
                    id="confirm-hint"
                    className="text-[12px] text-[#766B68] text-center mt-2 leading-snug"
                  >
                    Pilih tanggal & jam treatment, lalu centang persetujuan.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
