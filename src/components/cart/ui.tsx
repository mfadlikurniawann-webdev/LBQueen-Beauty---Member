export const CARD =
  "bg-white rounded-[24px] border border-[#EEDFE3] shadow-[0_4px_18px_rgba(201,79,120,0.06)]";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[15px] font-semibold! text-[#2D2926] tracking-tight">{children}</h2>;
}
