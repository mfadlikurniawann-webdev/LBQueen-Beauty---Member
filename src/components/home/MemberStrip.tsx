import { ChevronRight, Crown } from "lucide-react";
import { IconChip } from "@/components/IconChip";
import { waLink } from "@/lib/constants";

const WA_TEXT = "Halo, saya ingin menanyakan peningkatan status member akun LBQueen saya.";

export function MemberStrip() {
  return (
    <div className="flex items-center gap-3.5 rounded-[22px] bg-white border border-[#F0E4E8] p-4 shadow-[0_10px_30px_-20px_rgba(122,34,64,0.4)]">
      <IconChip icon={Crown} tone="gold" size="md" />
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-bold! text-[#2D2926] leading-snug">
          Akun Anda sudah aktif
        </h3>
        <a
          href={waLink(WA_TEXT)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-flex items-center gap-0.5 text-[13px] font-semibold text-[#A83960]"
        >
          Tanya upgrade ke admin
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
