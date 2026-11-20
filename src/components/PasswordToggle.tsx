import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordToggle({
  shown,
  onToggle,
  label,
}: {
  shown: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center",
        "text-[#766B68] hover:text-[#C94F78] hover:bg-white/70 transition-colors",
      )}
    >
      {shown ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  );
}
