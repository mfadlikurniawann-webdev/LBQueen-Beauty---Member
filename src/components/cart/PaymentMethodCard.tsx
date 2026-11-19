import { useState } from "react";
import Image from "next/image";
import { Check, CheckCircle2, Copy, Landmark, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD, SectionTitle } from "./ui";

export type PaymentMethod = "bank" | "qris";

const METHODS = [
  { id: "bank", label: "Transfer Bank", icon: Landmark },
  { id: "qris", label: "QRIS / E-Wallet", icon: QrCode },
] as const;
const BANK_ACCOUNT = "1447575021";
const PANEL = "bg-[#FAF7F5] rounded-2xl border border-[#EEDFE3]";

function BankTransferInfo({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <div className={`p-4 ${PANEL} flex flex-wrap items-center justify-between gap-3`}>
      <div className="min-w-0">
        <p className="text-[11px] text-[#766B68] font-bold uppercase tracking-[0.1em]">Bank BNI</p>
        <p className="text-[18px] font-bold text-[#2D2926] tracking-wide tabular-nums leading-tight mt-0.5">
          {BANK_ACCOUNT}
        </p>
        <p className="text-[12px] text-[#766B68] font-medium mt-0.5">a.n. Meilinda Juwita Sari</p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className={cn(
          "h-10 px-4 rounded-2xl text-[12px] font-bold flex items-center gap-1.5 transition-all border",
          copied
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-white text-[#A83960] border-[#F0CBD8] hover:bg-[#FDF2F5]",
        )}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}

export function PaymentMethodCard({
  method,
  onChange,
}: {
  method: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  const [copiedBank, setCopiedBank] = useState<"bni" | null>(null);
  const handleCopy = (num: string, type: "bni") => {
    navigator.clipboard.writeText(num);
    setCopiedBank(type);
    setTimeout(() => setCopiedBank(null), 2000);
  };
  return (
    <div className={`${CARD} p-5 flex flex-col gap-4`}>
      <SectionTitle>Metode Pembayaran</SectionTitle>

      <div className="grid grid-cols-2 gap-2.5">
        {METHODS.map(({ id, label, icon: MethodIcon }) => {
          const active = method === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(id)}
              className={cn(
                "relative min-h-[76px] rounded-2xl border-2 px-3 py-3 flex flex-col items-start",
                "justify-between gap-2 text-left transition-all active:scale-[0.98]",
                active
                  ? "border-[#C94F78] bg-[#FDF2F5] shadow-[0_6px_16px_rgba(201,79,120,0.12)]"
                  : "border-[#EEDFE3] bg-white hover:border-[#E3C3CE]",
              )}
            >
              <span
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center",
                  active ? "bg-white text-[#C94F78]" : "bg-[#FAF7F5] text-[#766B68]",
                )}
              >
                <MethodIcon className="w-4 h-4" aria-hidden="true" />
              </span>
              <span
                className={`text-[13px] font-bold leading-tight ${active ? "text-[#A83960]" : "text-[#2D2926]"}`}
              >
                {label}
              </span>
              {active && (
                <CheckCircle2
                  className="absolute top-2.5 right-2.5 w-4 h-4 text-[#C94F78]"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {method === "bank" && (
        <BankTransferInfo
          copied={copiedBank === "bni"}
          onCopy={() => handleCopy(BANK_ACCOUNT, "bni")}
        />
      )}

      {method === "qris" && (
        <div className={`flex flex-col gap-3 items-center p-4 ${PANEL}`}>
          <div
            className={cn(
              "relative w-44 h-44 rounded-2xl border border-[#EEDFE3] p-2 bg-white shadow-sm",
              "overflow-hidden flex items-center justify-center",
            )}
          >
            <Image
              src="/qris_customer.png"
              alt="QRIS LBQueen"
              width={160}
              height={160}
              className="object-contain"
            />
          </div>
          <p className="text-[12px] text-[#766B68] font-medium text-center leading-relaxed max-w-[240px]">
            Pindai QRIS dengan m-banking atau e-wallet.
          </p>
        </div>
      )}
    </div>
  );
}
