import { Clock3, MapPin, MessageCircle, Navigation } from "lucide-react";
import { CLINIC_HOURS, clinicStatus } from "@/lib/clinic";
import { CLINIC_ADDRESS, CLINIC_MAPS_URL, waLink } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

const BUTTON = cn(
  "flex-1 min-h-11 rounded-2xl flex items-center justify-center gap-2 text-[13px] font-bold",
  "transition-colors active:scale-[0.98]",
);

export function ClinicInfoCard() {
  const status = clinicStatus();
  return (
    <section id="info-klinik" className="scroll-mt-6" aria-labelledby="info-klinik-title">
      <SectionHeading title="Info Klinik" />
      <div className="rounded-[22px] bg-white border border-[#F0E4E8] p-4 sm:p-5 shadow-[0_10px_30px_-18px_rgba(122,34,64,0.35)]">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 shrink-0 rounded-2xl bg-[#FFF4D1] flex items-center justify-center">
            <Clock3 className="w-5 h-5 text-[#B8861A]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 id="info-klinik-title" className="text-[15px] font-bold! text-[#2D2926]">
                Jam Buka
              </h3>
              {status !== "info" && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-bold",
                    status === "buka"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700",
                  )}
                >
                  {status === "buka" ? "Sedang buka" : "Sedang tutup"}
                </span>
              )}
            </div>
            <dl className="mt-1.5 space-y-1">
              {CLINIC_HOURS.map((h) => (
                <div key={h.days} className="flex justify-between gap-3 text-[13px]">
                  <dt className="text-[#766B68] font-medium">{h.days}</dt>
                  <dd className="text-[#2D2926] font-semibold tabular-nums">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="flex items-start gap-3 mt-4 pt-4 border-t border-dashed border-[#EEDFE3]">
          <span className="w-10 h-10 shrink-0 rounded-2xl bg-[#E3F5EA] flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#2F8F5B]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-[#2D2926]">LBQueen Care & Beauty Clinic</p>
            <p className="text-[13px] text-[#766B68] leading-relaxed mt-0.5">{CLINIC_ADDRESS}</p>
          </div>
        </div>
        <div className="flex gap-2.5 mt-4">
          <a
            href={CLINIC_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(BUTTON, "bg-[#FFE3EE] text-[#A83960] hover:bg-[#FFD3E3]")}
          >
            <Navigation className="w-4 h-4" aria-hidden="true" /> Petunjuk arah
          </a>
          <a
            href={waLink("Halo admin LBQueen, saya ingin bertanya.")}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(BUTTON, "text-white bg-gradient-to-r from-[#C94F78] to-[#9B3055]")}
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" /> Chat admin
          </a>
        </div>
      </div>
    </section>
  );
}
