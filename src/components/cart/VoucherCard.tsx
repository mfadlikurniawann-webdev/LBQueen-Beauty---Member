import { Check, Loader2, Ticket, X } from "lucide-react";
import { PRIMARY_GRADIENT } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { membershipLabel } from "@/lib/vouchers";
import { CARD } from "./ui";
import type { CartVoucher } from "./useCartVoucher";

const valueLabel = (v: { type: string; discount_amount: number }) =>
  v.type === "percent"
    ? `${Number(v.discount_amount)}%`
    : v.type === "free_service"
      ? "Gratis layanan"
      : formatRupiah(Number(v.discount_amount));

/** Voucher di keranjang: ketik kode, atau pilih dari voucher milik membership pelanggan. */
export function VoucherCard({ voucher }: { voucher: CartVoucher }) {
  const { applied, myVouchers } = voucher;
  return (
    <div className={`${CARD} p-4 flex flex-col gap-3`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center bg-[#FDF2F5]">
          <Ticket className="w-5 h-5 text-[#C94F78]" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-[#2D2926] leading-tight">Voucher LBQueen</p>
          {applied ? (
            <p className="text-[12px] text-emerald-700 font-semibold leading-snug mt-0.5 truncate">
              {applied.code} dipakai · hemat {formatRupiah(voucher.discount)}
            </p>
          ) : (
            <p className="text-[12px] text-[#766B68] leading-snug mt-0.5">
              Ketik kode atau pilih voucher Anda
            </p>
          )}
        </div>
        {applied && (
          <button
            type="button"
            onClick={voucher.remove}
            className="shrink-0 h-9 px-4 rounded-2xl border text-[12px] font-bold bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 transition-colors"
          >
            Hapus
          </button>
        )}
      </div>

      {!applied && (
        <div className="flex flex-col gap-3 pt-3 border-t border-[#F4E8EC] animate-in fade-in duration-300">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void voucher.apply();
            }}
          >
            <label htmlFor="voucher-code" className="sr-only">
              Kode voucher
            </label>
            <input
              id="voucher-code"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={50}
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
              type="submit"
              disabled={voucher.validating || !voucher.code.trim()}
              className="shrink-0 h-11 px-4 rounded-2xl text-white text-[12px] font-bold flex items-center justify-center disabled:opacity-60 transition-opacity"
              style={{ background: PRIMARY_GRADIENT }}
            >
              {voucher.validating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pakai"}
            </button>
          </form>
          {voucher.error && (
            <p
              role="alert"
              className="flex items-center gap-1.5 text-[12px] text-rose-700 font-semibold"
            >
              <X className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {voucher.error}
            </p>
          )}

          {(voucher.loadingMine || myVouchers.length > 0) && (
            <div>
              <p className="text-[12px] font-bold text-[#5F5552] mb-2">Voucher Saya</p>
              {voucher.loadingMine ? (
                <div className="h-16 rounded-2xl bg-[#F3E7EA] animate-pulse" />
              ) : (
                <ul className="flex flex-col gap-2 max-h-[260px] overflow-y-auto no-scrollbar">
                  {myVouchers.map((v) => {
                    const problem = voucher.problemFor(v);
                    const scope = membershipLabel(v.membership_types);
                    return (
                      <li key={v.id}>
                        <button
                          type="button"
                          disabled={!!problem}
                          onClick={() => voucher.choose(v)}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all",
                            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C94F78]/15",
                            problem
                              ? "border-[#EFE6E8] bg-[#FAF7F8] opacity-70 cursor-not-allowed"
                              : "border-[#F0CBD8] bg-white hover:border-[#C94F78] hover:bg-[#FFF7FA] active:scale-[0.99]",
                          )}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] font-bold text-[#2D2926] truncate">
                              {valueLabel(v)} · {v.name}
                            </span>
                            <span className="block text-[11px] font-semibold text-[#A83960] truncate">
                              {v.code}
                              {scope ? ` · Khusus ${scope}` : ""}
                            </span>
                            <span className="block text-[11px] text-[#766B68] truncate">
                              {problem ||
                                (Number(v.min_transaction) > 0
                                  ? `Min. belanja ${formatRupiah(Number(v.min_transaction))}`
                                  : "Tanpa minimal belanja")}
                            </span>
                          </span>
                          {!problem && (
                            <span className="shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-full bg-[#FFE3EE] text-[12px] font-bold text-[#A83960]">
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              Pakai
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
