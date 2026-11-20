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
        className="btn-primary w-full h-[52px] text-[15px] disabled:opacity-80 disabled:cursor-wait cursor-pointer"
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
          "btn-glass w-full h-[52px] text-[14px] gap-1.5 text-ink-3",
        )}
      >
        {`${prompt} `}
        <span className="text-brand-ink">{linkLabel}</span>
      </Link>
    </div>
  );
}
