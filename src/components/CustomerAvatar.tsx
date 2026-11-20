import Image from "next/image";
import { cn } from "@/lib/utils";

export const initials = (name?: string) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

/** Foto profil pelanggan, atau inisial bila belum ada foto. */
export function CustomerAvatar({
  name,
  src,
  size,
  className,
}: {
  name?: string;
  src?: string | null;
  /** Ukuran tampil (px) untuk atribut sizes next/image. */
  size: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative block w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#D9648C] to-[#7E2449]",
        "text-white font-semibold flex items-center justify-center",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
