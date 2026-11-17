import { Loader2, Ticket } from "lucide-react";
import { PRIMARY_GRADIENT } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CARD } from "./ui";
import type { CartVoucher } from "./useCartVoucher";

const PILL = "shrink-0 h-9 text-[12px] font-bold px-4 rounded-2xl border transition-colors";

export function VoucherCard({ voucher }: { voucher: CartVoucher }) {
  const { applied, formOpen } = voucher;
  return (
    <div className={`${CARD} p-4 flex flex-col gap-3`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center bg-[#FDF2F5]">
            <Ticket className="w-5 h-5 text-[#C94F78]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#2D2926] leading-tight">
              Voucher LBQueen
            </p>
            {applied ? (
              <p className="text-[12px] text-emerald-700 font-semibold leading-snug mt-0.5">
                Kode: {applied.code} (
                {applied.type === "percent"
                  ? `${applied.discount_amount}%`
                  : formatRupiah(applied.discount_amount)}
                )
              </p>
            ) : (
              <p className="text-[12px] text-[#766B68] leading-snug mt-0.5">
                Gunakan kode promo Anda
              </p>
            )}
          </div>
        </div>
        {applied ? (
          <button
            type="button"
            onClick={voucher.remove}
            className={`${PILL} bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100`}
          >
            Hapus
          </button>
        ) : (
          !formOpen && (
            <button
              type="button"
              onClick={() => voucher.setFormOpen(true)}
              className={`${PILL} bg-[#FDF2F5] text-[#A83960] border-[#F0CBD8] hover:bg-[#FBE7EE]`}
            >
              Gunakan
            </button>
          )
        )}
      </div>

      {formOpen && (
        <div className="flex flex-col gap-2 pt-3 border-t border-[#F4E8EC]">
          <label htmlFor="voucher-code" className="sr-only">
            Kode voucher
          </label>
          <div className="flex gap-2">
            <input
              id="voucher-code"
              type="text"
              placeholder="Masukkan kode voucher"
              value={voucher.code}
              onChange={(e) => {
                voucher.setCode(e.target.value.toUpperCase());
                voucher.setError("");
              }}
              className={cn(
                "flex-1 min-w-0 h-11 px-3.5 rounded-2xl border border-[#E8D5DB] bg-[#FDFAFB] text-[14px]",
                "font-semibold text-[#2D2926] placeholder:font-normal placeholder:normal-case",
                "placeholder:text-[#8C8280] outline-none focus:bg-white focus:border-[#C94F78] focus:ring-4",
                "focus:ring-[#C94F78]/10 uppercase transition-all",
              )}
            />
            <button
              type="button"
              onClick={voucher.apply}
              disabled={voucher.validating}
              className={cn(
                "shrink-0 h-11 px-4 rounded-2xl text-white text-[12px] font-bold flex items-center",
                "justify-center disabled:opacity-70",
              )}
              style={{ background: PRIMARY_GRADIENT }}
            >
              {voucher.validating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gunakan"}
            </button>
            <button
              type="button"
              onClick={() => {
                voucher.setFormOpen(false);
                voucher.setError("");
              }}
              className={cn(
                "shrink-0 h-11 px-3.5 rounded-2xl border border-[#E8D5DB] bg-white text-[#766B68]",
                "text-[12px] font-bold hover:bg-[#FAF7F5]",
              )}
            >
              Batal
            </button>
          </div>
          {voucher.error && (
            <p role="alert" className="text-[12px] text-rose-700 font-semibold">
              {voucher.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
