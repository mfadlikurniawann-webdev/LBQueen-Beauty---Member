"use client";

import { checkoutOnline } from "@/app/actions/checkout";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BookingScheduleCard } from "@/components/cart/BookingScheduleCard";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { buildOrderMessage, isTreatmentItem } from "@/components/cart/cart-utils";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { OrderCreatedSheet, type CreatedOrder } from "@/components/cart/OrderCreatedSheet";
import { PaymentMethodCard, type PaymentMethod } from "@/components/cart/PaymentMethodCard";
import { TreatmentNotice } from "@/components/cart/TreatmentNotice";
import { useCartVoucher } from "@/components/cart/useCartVoucher";
import { formatSchedule } from "@/components/orders/order-utils";
import { VoucherCard } from "@/components/cart/VoucherCard";
import { PageHero } from "@/components/portal/PageHero";
import { useToast } from "@/components/Toast";
import { useCart } from "@/context/CartContext";
import { WA_NUMBER } from "@/lib/constants";
import { useCustomer } from "@/context/CustomerContext";
import { formatRupiah } from "@/lib/format";
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

  const [attempted, setAttempted] = useState(false);
  const [created, setCreated] = useState<CreatedOrder | null>(null);

  const hasTreatment = cart.some(isTreatmentItem);
  const scheduleDate =
    bookingDate && bookingTime ? new Date(`${bookingDate}T${bookingTime}:00+07:00`) : null;
  const scheduleLabel =
    scheduleDate && !Number.isNaN(scheduleDate.getTime()) ? formatSchedule(scheduleDate) : null;
  const scheduleError = !hasTreatment
    ? null
    : !bookingDate || !bookingTime
      ? "Pilih tanggal dan jam."
      : scheduleDate && scheduleDate <= new Date()
        ? "Pilih waktu yang belum lewat."
        : null;

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
    if (scheduleError || (hasTreatment && !isAgreed)) {
      setAttempted(true);
      document.getElementById("checkout-requirements")?.scrollIntoView({ behavior: "smooth", block: "center" });
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
      // Konfirmasi lewat lembar "Pesanan dibuat": tautan WhatsApp diketuk pengguna (window.open di sini diblokir Safari iOS).
      setCreated({
        total: result.data.total,
        method: paymentMethod,
        waHref: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
      });
      clearCart();
      checkoutKey.current = null;
      void refresh();
    } catch (e) {
      toast("Gagal: " + errorMessage(e, "Terjadi kesalahan"), "error");
    } finally {
      setProcessing(false);
      checkoutInFlight.current = false;
    }
  };

  const createdSheet = created && <OrderCreatedSheet order={created} onClose={() => router.push("/orders")} />;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen">
        <PageHero title="Keranjang" onBack={() => router.back()} />
        <EmptyCart onShop={() => router.push("/")} />
        {createdSheet}
      </div>
    );
  }

  const savings = discount + cart.reduce((a, i) => a + (i.voucher_discount || 0) * i.qty, 0);

  const payButton = (
    <button
      type="button"
      onClick={handleWAOrder}
      disabled={processing}
      className="btn-primary h-12 px-6 text-[15px] shrink-0 disabled:cursor-wait"
    >
      {processing && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      Buat pesanan
    </button>
  );

  return (
    <div className="min-h-screen">
      <PageHero title="Keranjang" subtitle={`${totalItems} item`} onBack={() => router.back()} />

      <div className="px-4 md:px-8 md:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_340px] lg:grid-cols-[minmax(0,1fr)_380px] gap-3 md:gap-6 md:items-start">
          <div className="space-y-3">
            {cart.map((item, idx) => (
              <CartItemCard
                key={`${item.id}-${item.variant_id || idx}`}
                item={item}
                schedule={scheduleLabel}
                onRemove={() => removeFromCart(item.id, item.variant_id)}
                onQty={(qty) => updateQty(item.id, qty, item.variant_id)}
              />
            ))}
            <VoucherCard voucher={voucher} />
            {hasTreatment && (
              <div id="checkout-requirements" className="space-y-3 scroll-mt-24">
                <BookingScheduleCard
                  date={bookingDate}
                  time={bookingTime}
                  onDate={setBookingDate}
                  onTime={setBookingTime}
                  invalid={attempted ? scheduleError : null}
                />
                <div>
                  <TreatmentNotice agreed={isAgreed} onChange={setIsAgreed} />
                  {attempted && !isAgreed && (
                    <p role="alert" className="mt-2 px-1 text-[13px] font-semibold text-danger">
                      Centang persetujuan dulu.
                    </p>
                  )}
                </div>
              </div>
            )}
            <PaymentMethodCard method={paymentMethod} onChange={setPaymentMethod} />
          </div>

          {/* Layar lebar: rincian dan tombol menempel di kolom kanan. */}
          <div className="hidden md:block surface rounded-[24px] p-5 md:sticky md:top-[96px]">
            <dl className="space-y-2 text-[14px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="font-semibold text-ink tabular-nums">{formatRupiah(cartTotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Voucher</dt>
                  <dd className="font-semibold text-success tabular-nums">-{formatRupiah(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between items-baseline gap-3 pt-2 border-t border-brand/10">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="text-[22px] font-semibold text-brand-ink tabular-nums">{formatRupiah(finalTotal)}</dd>
              </div>
            </dl>
            <div className="mt-4 [&>button]:w-full">{payButton}</div>
          </div>
        </div>
      </div>

      {/* HP: bar bawah menempel, total di kiri dan tombol Pesan di kanan. */}
      <div
        className="md:hidden fixed inset-x-0 bottom-0 z-40 px-3"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}
      >
        <div className="surface mx-auto max-w-lg rounded-[28px] pl-5 pr-2 py-2 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-ink-muted">Total</p>
            <p className="text-[18px] font-semibold text-ink tabular-nums leading-tight truncate">
              {formatRupiah(finalTotal)}
            </p>
            {savings > 0 && (
              <p className="text-[12px] font-semibold text-success tabular-nums truncate">
                Hemat {formatRupiah(savings)}
              </p>
            )}
          </div>
          {payButton}
        </div>
      </div>
    </div>
  );
}
