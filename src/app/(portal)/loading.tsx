export default function Loading() {
  return <div role="status" aria-label="Memuat halaman" className="p-6 space-y-6 animate-pulse"><div className="h-48 rounded-[32px] bg-[#F2E6E9]" /><div className="grid grid-cols-2 gap-4">{[0, 1, 2, 3].map(i => <div key={i} className="h-40 rounded-[24px] bg-white border border-[#EEDFE3]" />)}</div><span className="sr-only">Memuat halaman</span></div>;
}
