import { ChevronRight, Crown } from "lucide-react";
import { IconChip } from "@/components/IconChip";
import { waLink } from "@/lib/constants";

const WA_TEXT = "Halo, saya ingin menanyakan peningkatan status member akun LBQueen saya.";

export function MemberStrip() {
  return (
    <div data-reveal className="panel-rose spotlight flex items-center gap-3.5 rounded-[24px] p-4">
      <IconChip icon={Crown} tone="gold" size="md" bare />
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-semibold! text-white leading-snug">Akun Anda sudah aktif</h3>
        <a
          href={waLink(WA_TEXT)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-flex items-center gap-0.5 text-[13px] font-semibold text-[#FFC4D8] hover:text-white transition-colors"
        >
          Ajukan upgrade membership
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
