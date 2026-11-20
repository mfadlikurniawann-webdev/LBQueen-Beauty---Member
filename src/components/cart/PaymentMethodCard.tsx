import { useState } from "react";
import Image from "next/image";
import { Check, Copy, Landmark, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD } from "./ui";

export type PaymentMethod = "bank" | "qris";

const METHODS = [
  { id: "bank", label: "Transfer Bank", icon: Landmark },
  { id: "qris", label: "QRIS", icon: QrCode },
] as const;
const BANK_ACCOUNT = "1447575021";

/** Metode pembayaran ringkas: dua pilihan, detail tampil di bawah pilihan aktif. */
export function PaymentMethodCard({
  method,
  onChange,
}: {
  method: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(BANK_ACCOUNT);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
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

      {method === "bank" ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] text-ink-muted">BNI a.n. Meilinda Juwita Sari</p>
            <p className="text-[17px] font-semibold text-ink tabular-nums tracking-wide">
              {BANK_ACCOUNT}
            </p>
          </div>
          <button
            type="button"
            onClick={copy}
            className={cn(
              "h-11 px-4 rounded-full text-[13px] font-semibold inline-flex items-center gap-1.5 shrink-0",
              copied ? "bg-success-soft text-success" : "chip-glass text-brand-ink",
            )}
          >
            {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            {copied ? "Tersalin" : "Salin"}
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3">
          <div className="relative w-28 h-28 shrink-0 rounded-[16px] bg-white p-1.5 border border-white shadow-[0_8px_20px_-14px_rgba(122,34,64,0.4)]">
            <Image src="/qris_customer.png" alt="QRIS LBQueen" width={100} height={100} className="object-contain w-full h-full" />
          </div>
          <p className="text-[13px] text-ink-muted">Pindai dengan m-banking atau e-wallet.</p>
        </div>
      )}
    </div>
  );
}
