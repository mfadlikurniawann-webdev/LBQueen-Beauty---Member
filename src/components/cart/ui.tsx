export const CARD =
  "bg-white rounded-[22px] border border-[#F0E4E8] shadow-[0_8px_24px_-18px_rgba(122,34,64,0.4)]";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[15px] font-semibold! text-[#2D2926] tracking-tight">{children}</h2>;
}
