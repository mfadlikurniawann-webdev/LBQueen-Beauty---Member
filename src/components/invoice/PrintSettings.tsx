import { ChevronLeft, Printer } from "lucide-react";
import { PRIMARY_GRADIENT } from "@/lib/constants";
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
        "no-print print:hidden bg-white p-5 rounded-[32px] shadow-[0_8px_30px_rgba(201,79,120,0.08)] mb-8",
        "w-full max-w-md flex flex-col gap-4 border border-[#EEDFE3] font-sans",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#F4E8EC] pb-4">
        <button
          type="button"
          onClick={() => window.close()}
          className={cn(
            "h-10 px-3 -ml-1 rounded-2xl flex items-center gap-1.5 text-[#766B68] hover:text-[#A83960]",
            "hover:bg-[#FDF2F5] transition-colors text-[14px] font-bold",
          )}
        >
          <ChevronLeft className="w-4 h-4" /> Kembali
        </button>
        <h1 className="text-[16px] font-bold! text-[#2D2926]">Pengaturan Cetak</h1>
      </div>

      <div>
        <p className="text-[12px] font-bold text-[#766B68] uppercase tracking-[0.08em] mb-2">
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
                  "h-12 rounded-2xl text-[14px] font-bold border-2 transition-all",
                  active
                    ? "border-[#C94F78] bg-[#FDF2F5] text-[#A83960]"
                    : "border-[#EEDFE3] bg-white text-[#766B68] hover:border-[#E3C3CE]",
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
        className={cn(
          "w-full h-13 text-white rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2",
          "shadow-lg shadow-rose-200 hover:brightness-105 transition-all active:scale-95",
        )}
        style={{ background: PRIMARY_GRADIENT }}
      >
        <Printer className="w-5 h-5" /> Cetak Biasa (Browser)
      </button>
    </div>
  );
}
