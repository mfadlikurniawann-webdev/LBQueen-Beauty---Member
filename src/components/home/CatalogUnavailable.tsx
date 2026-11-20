import { ShoppingBag } from "lucide-react";

export function CatalogUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="glass-lit mx-5 my-24 rounded-[32px] p-8 text-center"
    >
      <ShoppingBag className="mx-auto mb-4 h-8 w-8 text-brand-ink" />
      <h1 className="text-xl font-semibold">Katalog belum tersedia</h1>
      <p className="mt-3 mb-6 text-sm text-ink-muted">
        Katalog belum dapat dimuat. Silakan coba lagi.
      </p>
      <button onClick={onRetry} className="btn-primary">
        Coba lagi
      </button>
    </div>
  );
}
