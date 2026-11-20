export default function Loading() {
  return (
    <div role="status" aria-label="Memuat halaman" className="min-h-screen">
      <div className="px-4 sm:px-6 pt-8">
        <div className="flex items-center gap-4">
          <div className="skeleton-glass w-11 h-11 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton-glass h-5 w-36 rounded-full" />
            <div className="skeleton-glass h-3 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 pt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass-soft rounded-[24px] p-2.5 space-y-3">
            <div className="skeleton-glass aspect-square rounded-[18px]" />
            <div className="skeleton-glass h-3.5 w-4/5 rounded-full" />
            <div className="skeleton-glass h-3.5 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-[13px] font-medium text-ink-muted">Memuat halaman</p>
    </div>
  );
}
