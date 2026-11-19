import { AlertTriangle } from "lucide-react";

export function TreatmentNotice({
  agreed,
  onChange,
}: {
  agreed: boolean;
  onChange: (agreed: boolean) => void;
}) {
  return (
    <div className="rounded-[24px] p-4 border border-amber-200 bg-amber-50 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 shrink-0 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-amber-700" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-amber-900">Perhatian Sebelum Treatment</p>
          <p className="text-[13px] text-amber-800 leading-relaxed mt-0.5">
            Hindari alkohol dan obat-obatan terlarang H-7 hingga H+7 treatment. Sampaikan kondisi
            kesehatan Anda kepada therapist.
          </p>
        </div>
      </div>
      <label className="flex items-center gap-3 cursor-pointer border-t border-amber-200 pt-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 shrink-0 rounded cursor-pointer"
          style={{ accentColor: "#C94F78" }}
        />
        <span className="text-[13px] font-semibold text-amber-900">Saya mengerti & menyetujui</span>
      </label>
    </div>
  );
}
