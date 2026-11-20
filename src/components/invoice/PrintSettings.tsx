import { ChevronLeft, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaperSize = "58mm" | "80mm";

export function PrintSettings({
  size,
  onSize,
}: {
  size: PaperSize;
  onSize: (size: PaperSize) => void;
}) {
  return (
    <div
      className={cn(
        "glass-lit no-print print:hidden p-5 rounded-[32px] mb-8",
        "w-full max-w-md flex flex-col gap-4 font-sans",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#C94F78]/10 pb-4">
        <button
          type="button"
          onClick={() => window.close()}
          className={cn(
            "chip-glass h-10 pl-2.5 pr-3.5 rounded-full flex items-center gap-1.5 text-[#5F5552] hover:text-[#A83960]",
            "hover:bg-white/90 transition-colors text-[14px] font-bold",
          )}
        >
          <ChevronLeft className="w-4 h-4" /> Kembali
        </button>
        <h1 className="text-[16px] font-bold! text-[#2D2926]">Pengaturan Cetak</h1>
      </div>

      <div>
        <p className="text-[13px] font-bold text-[#5F5552] mb-2">
          Ukuran Kertas
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(["58mm", "80mm"] as const).map((option) => {
            const active = size === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => onSize(option)}
                className={cn(
                  "h-12 rounded-full text-[14px] font-bold transition-all duration-300",
                  active ? "chip-active" : "chip-glass text-[#5F5552] hover:bg-white/90",
                )}
              >
                {option.replace("mm", " mm")}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className="btn-primary w-full h-13 text-[15px]"
      >
        <Printer className="w-5 h-5" /> Cetak Biasa (Browser)
      </button>
    </div>
  );
}
