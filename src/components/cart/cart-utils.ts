import type { CartItem } from "@/context/CartContext";
import { TREATMENT_TYPE } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import type { Voucher } from "./useCartVoucher";

export function isTreatmentItem(item: Pick<CartItem, "type" | "name">) {
  return (
    item.type === TREATMENT_TYPE ||
    (!item.type &&
      (item.name.toLowerCase().includes("treatment") || item.name.toLowerCase().includes("facial")))
  );
}

export function buildOrderMessage({
  customer,
  orders,
  total,
  booking,
  voucher,
  discount,
  paymentMethod,
}: {
  customer: { name: string; is_member: boolean };
  orders: { product_name: string; total_price: number }[];
  total: number;
  booking: { date: string; time: string } | null;
  voucher: Voucher | null;
  discount: number;
  paymentMethod: "bank" | "qris";
}) {
  let msg = `Halo LBQueen! Saya *${customer.name}*${customer.is_member ? " (Member)" : ""}.\n\nPesanan saya:\n\n`;
  orders.forEach((item, i) => {
    msg += `${i + 1}. *${item.product_name}*\n   ${formatRupiah(item.total_price)}\n`;
  });

  if (booking) {
    msg += `\n*Jadwal Booking Treatment:*\n`;
    msg += `Tanggal: ${booking.date}\nJam: ${booking.time}\n`;
  }

  if (voucher) {
    msg += `\nVoucher digunakan: *${voucher.code}*\n`;
    if (!voucher.product_id) msg += `Diskon voucher: *- ${formatRupiah(discount)}*\n`;
  }

  msg += `\n*Total Akhir: ${formatRupiah(total)}*\n`;
  msg += `Metode Pembayaran: *${paymentMethod === "bank" ? "Transfer Bank" : "QRIS / E-Wallet"}*\n\n`;
  msg +=
    "Saya akan melampirkan screenshot bukti transfer pembayaran setelah pesan ini. " +
    "Mohon segera dikonfirmasi. Terima kasih!";
  return msg;
}
