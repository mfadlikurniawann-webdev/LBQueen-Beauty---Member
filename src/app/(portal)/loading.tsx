export default function Loading() {
  return (
    <div role="status" aria-label="Memuat halaman" className="min-h-screen bg-[#FDFBFB]">
      <div className="animate-pulse">
        <div className="h-40 rounded-b-[40px] bg-gradient-to-br from-[#EFCFDB] via-[#F4DEE6] to-[#F8EBEF] px-5 pt-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-white/50" />
            <div className="space-y-2">
              <div className="h-5 w-36 rounded-full bg-white/60" />
              <div className="h-3 w-24 rounded-full bg-white/45" />
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 pt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="rounded-[24px] bg-white border border-[#EEDFE3] p-3 space-y-3">
              <div className="aspect-square rounded-2xl bg-[#F6EAEE]" />
              <div className="h-3.5 w-4/5 rounded-full bg-[#F2E6E9]" />
              <div className="h-3.5 w-1/2 rounded-full bg-[#F6DDE6]" />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-6 text-center text-[13px] font-medium text-[#766B68]">Memuat halaman...</p>
    </div>
  );
}
