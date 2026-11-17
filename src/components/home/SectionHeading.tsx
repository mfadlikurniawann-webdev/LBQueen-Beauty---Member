export function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h3 className="flex items-center gap-2.5 text-[18px] font-bold text-[#2D2926] tracking-tight">
        <span
          className="h-5 w-1 rounded-full bg-gradient-to-b from-[#C94F78] to-[#D4AF37]"
          aria-hidden="true"
        />
        {title}
      </h3>
    </div>
  );
}
