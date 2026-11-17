import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function TreatmentAgreement({
  agreed,
  onChange,
}: {
  agreed: boolean;
  onChange: (agreed: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "p-4 sm:p-5 rounded-[24px] space-y-4 bg-[#FBF7ED] border border-[#D4AF37]/30",
        "relative overflow-hidden",
      )}
    >
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#D4AF37]/10 rounded-full" />
      <div className="relative flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-[#8A6A0F]" aria-hidden="true" />
        </div>
        <div>
          <h5 className="text-[14px] font-bold text-[#7A5C0B] mb-1">Informasi Penting</h5>
          <p className="text-[13px] text-[#4A4340] leading-relaxed">
            H-7 & H+7 treatment dilarang konsumsi alkohol atau obat terlarang. Mohon jujur mengenai
            kondisi tubuh Anda kepada therapist kami demi keamanan Anda.
          </p>
        </div>
      </div>

      <label
        className={cn(
          "relative flex items-center gap-3 cursor-pointer p-3.5 rounded-2xl bg-white",
          "border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-colors group",
        )}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => onChange(e.target.checked)}
            className={cn(
              "peer appearance-none w-6 h-6 border-2 border-[#C9A43A] rounded-lg bg-white",
              "checked:bg-[#B8941F] checked:border-[#B8941F] transition-all cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/30",
            )}
          />
          <CheckIcon
            className={cn(
              "absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none",
              "transition-all scale-50 peer-checked:scale-100",
            )}
          />
        </div>
        <span className="text-[13px] font-semibold text-[#5E4708] leading-snug">
          Saya mengerti & menyetujui persyaratan di atas
        </span>
      </label>
    </div>
  );
}
