/** Persetujuan singkat sebelum treatment (wajib dicentang). */
export function TreatmentNotice({
  agreed,
  onChange,
}: {
  agreed: boolean;
  onChange: (agreed: boolean) => void;
}) {
  return (
    <label className="glass-soft rounded-[24px] flex items-start gap-3 p-4 cursor-pointer">
      <input
        type="checkbox"
        checked={agreed}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-5 h-5 shrink-0 cursor-pointer"
        style={{ accentColor: "#C94F78" }}
      />
      <span className="text-[14px] text-ink leading-snug">
        Saya tidak mengonsumsi alkohol dan obat terlarang H-7 s/d H+7 treatment, dan akan
        menyampaikan kondisi kesehatan ke therapist.
      </span>
    </label>
  );
}
