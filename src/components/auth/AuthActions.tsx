import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthActions({
  loading,
  submitLabel,
  href,
  prompt,
  linkLabel,
}: {
  loading: boolean;
  submitLabel: string;
  href: string;
  prompt: string;
  linkLabel: string;
}) {
  return (
    <div className="space-y-3 pt-1">
      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full h-[52px] rounded-2xl text-white font-bold text-[15px] flex items-center justify-center",
          "gap-2 transition-all active:scale-[0.98] hover:brightness-105 disabled:opacity-80",
          "disabled:cursor-wait cursor-pointer",
        )}
        style={{
          background: "linear-gradient(135deg, #D4608A 0%, #C94F78 50%, #9B3055 100%)",
          boxShadow: "0 8px 24px rgba(201,79,120,0.30)",
        }}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {`${submitLabel} `}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <Link
        href={href}
        className={cn(
          "w-full h-[52px] rounded-2xl font-bold text-[14px] flex items-center justify-center gap-1.5",
          "transition-all active:scale-[0.98] border border-[#EEDFE3] bg-white text-[#766B68]",
          "hover:bg-[#FDF2F5] hover:border-[#F0CBD8]",
        )}
      >
        {`${prompt} `}
        <span className="text-[#A83960]">{linkLabel}</span>
      </Link>
    </div>
  );
}
