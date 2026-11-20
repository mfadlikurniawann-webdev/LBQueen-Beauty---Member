import { AlertTriangle } from "lucide-react";

export function CatalogLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="glass mx-5 mt-6 rounded-[32px] p-6 text-center"
    >
      <div className="chip-glass mx-auto mb-3 w-14 h-14 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-[#A83960]" aria-hidden="true" />
      </div>
      <p className="text-[15px] font-semibold text-[#2D2926]">Katalog belum dapat dimuat.</p>
      <button type="button" className="btn-primary mt-4" onClick={onRetry}>
        Coba lagi
      </button>
    </div>
  );
}
