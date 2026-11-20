import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Judul halaman di atas lapisan ambient: tombol kembali berkaca, judul besar, aksi di kanan. */
export function PageHero({
  title,
  subtitle,
  onBack,
  tall = false,
  actions,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  tall?: boolean;
  /** Tidak lagi mengubah tampilan (hero selalu transparan di atas ambient); dipertahankan untuk kompatibilitas. */
  transparent?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative px-4 sm:px-8",
        tall ? "pb-14" : "pb-5",
      )}
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 20px)" }}
    >
      <div data-reveal className="flex items-center gap-3 min-h-12">
        {onBack && (
          <button
            type="button"
            aria-label="Kembali"
            onClick={onBack}
            className={cn(
              "chip-glass w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-[#2D2926]",
              "hover:bg-white/90 active:scale-95 transition-[background-color,transform]",
            )}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] md:text-[30px] font-bold! text-[#2D2926] tracking-tight leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] font-medium text-[#766B68] mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
