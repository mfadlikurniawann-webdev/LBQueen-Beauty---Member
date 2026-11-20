"use client";

import { useEffect } from "react";
import { isStaleDeployError, reloadForNewVersion } from "@/lib/stale-deploy";

import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    if (isStaleDeployError(error)) reloadForNewVersion();
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div
        role="alert"
        className={cn(
          "glass-lit w-full max-w-lg rounded-[32px] p-8 text-center",
        )}
      >
        <div
          className={cn(
            "chip-glass mx-auto mb-5 w-16 h-16 rounded-full flex",
            "items-center justify-center",
          )}
        >
          <AlertCircle className="w-8 h-8 text-[#C94F78]" aria-hidden="true" />
        </div>
        <h1 className="text-[22px] font-semibold! text-[#2D2926] tracking-tight">
          Halaman belum dapat dimuat
        </h1>
        <p className="mt-2 mb-7 text-[14px] leading-relaxed text-[#766B68]">
          Silakan coba kembali. Jika masalah berlanjut, hubungi pengelola LBQueen.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button type="button" className="btn-primary" onClick={reset}>
            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Coba lagi
          </button>
          <Link href="/" className="btn-glass">
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
