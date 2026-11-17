import { Crown, Phone, ShieldCheck, type LucideIcon } from "lucide-react";
import type { Customer } from "@/lib/customer";
import { cn } from "@/lib/utils";

function InfoTile({
  icon: Icon,
  tone,
  iconSize,
  label,
  children,
}: {
  icon: LucideIcon;
  tone: string;
  iconSize: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#FAF7F5] border border-[#EEDFE3]">
      <div
        className={`w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center ${tone} shadow-sm`}
      >
        <Icon className={iconSize} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[#766B68] font-bold uppercase tracking-[0.1em] mb-0.5">
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

export function ProfileSummary({ customer }: { customer: Customer }) {
  return (
    <div className="bg-white rounded-[32px] p-5 sm:p-6 shadow-xl shadow-rose-100/30 border border-[#EEDFE3]">
      <div className="flex items-center gap-4 mb-6">
        <div
          className={cn(
            "w-[72px] h-[72px] shrink-0 rounded-[24px] flex items-center justify-center text-white",
            "text-[26px] font-bold shadow-lg",
            customer.is_member
              ? "bg-gradient-to-br from-[#D4AF37] to-[#B8941F] shadow-[#D4AF37]/30"
              : "bg-gradient-to-br from-[#C94F78] to-[#9B3055] shadow-rose-200",
          )}
          aria-hidden="true"
        >
          {customer.name?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-bold! text-[#2D2926] leading-snug line-clamp-2 break-words">
            {customer.name}
          </h2>
          {customer.is_member ? (
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full w-fit mt-1.5 border",
                "border-amber-200",
              )}
            >
              <Crown className="w-3.5 h-3.5 text-[#B8941F] fill-[#D4AF37]" aria-hidden="true" />
              <span className="text-[12px] font-bold text-[#7C6416] capitalize">
                {customer.membership_type || "Member"}
              </span>
            </div>
          ) : (
            <span
              className={cn(
                "inline-block mt-1.5 px-3 py-1 rounded-full bg-[#FDF2F5] border border-[#F6DDE6]",
                "text-[12px] font-semibold text-[#A83960]",
              )}
            >
              Akun Reguler
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-[#F4E8EC]">
        <InfoTile
          icon={Phone}
          tone="text-[#C94F78]"
          iconSize="w-[18px] h-[18px]"
          label="Nomor Telepon"
        >
          <p className="text-[15px] text-[#2D2926] font-bold tabular-nums break-all">
            {customer.phone || "—"}
          </p>
        </InfoTile>
        <InfoTile icon={ShieldCheck} tone="text-emerald-600" iconSize="w-5 h-5" label="Status Akun">
          <p className="text-[15px] text-emerald-700 font-bold">Aktif</p>
        </InfoTile>
      </div>
    </div>
  );
}
