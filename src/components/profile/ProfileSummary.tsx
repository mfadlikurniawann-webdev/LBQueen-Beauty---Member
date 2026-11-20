import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Camera, Crown, Loader2 } from "lucide-react";
import { removeCustomerAvatar, uploadCustomerAvatar } from "@/app/actions/profile";
import { CustomerAvatar } from "@/components/CustomerAvatar";
import { useToast } from "@/components/Toast";
import { compressAvatar } from "@/lib/compress-avatar";
import type { Customer } from "@/lib/customer";
import { formatNumber } from "@/lib/format";
import { tierOf } from "@/lib/membership";
import { errorMessage } from "@/lib/stale-deploy";

export function ProfileSummary({
  customer,
  onChanged,
}: {
  customer: Customer;
  onChanged: () => Promise<unknown>;
}) {
  const tier = tierOf(customer);
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const blob = await compressAvatar(file);
      const form = new FormData();
      form.append("file", blob, "avatar.webp");
      const result = await uploadCustomerAvatar(form);
      if (result.error) throw new Error(result.error);
      await onChanged();
      toast("Foto profil diperbarui.", "success");
    } catch (error) {
      toast(errorMessage(error, "Foto belum bisa diunggah."), "error");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const result = await removeCustomerAvatar();
      if (result.error) throw new Error(result.error);
      await onChanged();
      toast("Foto profil dihapus.", "success");
    } catch (error) {
      toast(errorMessage(error, "Foto belum bisa dihapus."), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass-lit rounded-[28px] overflow-hidden">
      <div className="p-4 flex items-center gap-4">
        <div className="relative w-[76px] h-[76px] shrink-0">
          <div className="w-full h-full rounded-full p-[3px]" style={{ background: tier.card }}>
            <CustomerAvatar name={customer.name} src={customer.avatar_url} size={70} className="text-[26px]" />
          </div>
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            aria-label={customer.avatar_url ? "Ganti foto profil" : "Tambah foto profil"}
            className="absolute -right-2 -bottom-2 w-11 h-11 rounded-full flex items-center justify-center"
          >
            <span className="w-8 h-8 rounded-full chip-active flex items-center justify-center ring-2 ring-white">
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Camera className="w-4 h-4" aria-hidden="true" />
              )}
            </span>
          </button>
          <input
            ref={input}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[20px] font-semibold text-[#2D2926] leading-snug line-clamp-2 break-words">
            {customer.name}
          </h2>
          {customer.username && <p className="text-[14px] text-[#5F5552] truncate">@{customer.username}</p>}
          <p className="text-[14px] text-[#5F5552] tabular-nums truncate">{customer.phone || "-"}</p>
          {customer.avatar_url && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="-ml-1 mt-0.5 min-h-11 px-1 text-[13px] font-semibold text-[#A83960]"
            >
              Hapus foto
            </button>
          )}
        </div>
      </div>
      <Link
        href="/membership"
        className="mx-2 mb-2 rounded-[22px] min-h-12 py-2.5 px-3.5 flex items-center gap-2.5 border border-white/80"
        style={{ background: tier.chip }}
      >
        <Crown className="w-5 h-5 shrink-0 text-[#B8861A]" fill="#F5D57A" aria-hidden="true" />
        <span className="text-[14px] font-semibold text-[#2D2926] flex-1 min-w-0 truncate">
          {tier.id === "regular" ? "Akun Reguler" : `${tier.name} Member`}
        </span>
        <span className="text-[13px] font-semibold text-[#2D2926] tabular-nums">
          {formatNumber(customer.points || 0)} Poin
        </span>
        <ArrowRight className="w-4 h-4 text-[#A83960] shrink-0" aria-hidden="true" />
      </Link>
    </div>
  );
}
