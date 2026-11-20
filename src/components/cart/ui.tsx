/** Kartu keranjang: kaca tanpa backdrop-filter (ringan untuk daftar item). */
export const CARD = "glass-soft rounded-[26px]";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[15px] font-semibold! text-[#2D2926] tracking-tight">{children}</h2>;
}
