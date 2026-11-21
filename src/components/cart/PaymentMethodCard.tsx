import { useState } from "react";
import Image from "next/image";
import { Check, Copy, Download, Landmark, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD } from "./ui";

export type PaymentMethod = "bank" | "qris";

const METHODS = [
  { id: "bank", label: "Transfer Bank", icon: Landmark },
  { id: "qris", label: "QRIS", icon: QrCode },
] as const;
const BANK_ACCOUNT = "1447575021";
const QRIS_SRC = "/qris_customer.png";

const SECONDARY =
  "h-11 px-4 rounded-full text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 shrink-0 " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/70";

/** Rekening tujuan dengan tombol salin. */
export function BankPanel() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(BANK_ACCOUNT);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[13px] text-ink-muted">BNI a.n. Meilinda Juwita Sari</p>
        <p className="text-[17px] font-semibold text-ink tabular-nums tracking-wide">{BANK_ACCOUNT}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className={cn(SECONDARY, copied ? "bg-success-soft text-success" : "chip-glass text-brand-ink")}
      >
        {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
        {copied ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}

/** QRIS besar yang bisa dipindai dari layar lain, dibuka penuh, atau diunduh untuk dibayar dari galeri. */
export function QrisPanel() {
  return (
    <div className="flex flex-col items-center gap-3">
      <a
        href={QRIS_SRC}
        target="_blank"
        rel="noopener"
        aria-label="Buka QRIS ukuran penuh"
        className="block w-full max-w-[300px] rounded-[18px] bg-white p-2 border border-edge/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/70"
      >
        <Image src={QRIS_SRC} alt="QRIS LBQueen" width={727} height={1024} sizes="300px" className="w-full h-auto rounded-[12px]" />
      </a>
      <a href={QRIS_SRC} download="QRIS-LBQueen.png" className={cn(SECONDARY, "chip-glass text-brand-ink w-full max-w-[300px]")}>
        <Download className="w-4 h-4" aria-hidden="true" /> Unduh QRIS
      </a>
    </div>
  );
}

/** Langkah pembayaran singkat: pengguna tahu konfirmasi dilakukan di WhatsApp setelah pesanan dibuat. */
export function PaymentSteps({ className = "" }: { className?: string }) {
  return (
    <ol className={cn("space-y-1 text-[13px] text-ink-muted list-decimal pl-5", className)}>
      <li>Tekan Buat pesanan</li>
      <li>Bayar sesuai total</li>
      <li>Kirim bukti bayar lewat WhatsApp</li>
    </ol>
  );
}

/** Metode pembayaran: dua pilihan, detail tampil di bawah pilihan aktif. */
export function PaymentMethodCard({
  method,
  onChange,
}: {
  method: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <div className={`${CARD} p-4`}>
      <p id="payment-label" className="text-[15px] font-semibold text-ink mb-2.5">
        Pembayaran
      </p>
      <div role="radiogroup" aria-labelledby="payment-label" className="grid grid-cols-2 gap-2">
        {METHODS.map(({ id, label, icon: Icon }) => {
          const active = method === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(id)}
              className={cn(
                "h-12 rounded-full flex items-center justify-center gap-2 text-[14px] font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/70",
                active ? "chip-active" : "chip-glass text-ink-3",
              )}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">{method === "bank" ? <BankPanel /> : <QrisPanel />}</div>
      <PaymentSteps className="mt-4 pt-3 border-t border-brand/10" />
    </div>
  );
}
