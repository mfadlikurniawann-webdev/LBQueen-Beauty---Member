"use client";

import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div
        role="alert"
        className={cn(
          "w-full max-w-lg rounded-[32px] border border-[#EEDFE3] bg-white p-8 text-center",
          "shadow-[0_8px_30px_rgba(201,79,120,0.08)]",
        )}
      >
        <div
          className={cn(
            "mx-auto mb-5 w-16 h-16 rounded-full bg-[#FDF2F5] border border-[#F6DDE6] flex",
            "items-center justify-center",
          )}
        >
          <AlertCircle className="w-8 h-8 text-[#C94F78]" aria-hidden="true" />
        </div>
        <h1 className="text-[22px] font-bold! text-[#2D2926] tracking-tight">
          Halaman belum dapat dimuat
        </h1>
        <p className="mt-2 mb-7 text-[14px] leading-relaxed text-[#766B68]">
          Silakan coba kembali. Jika masalah berlanjut, hubungi pengelola LBQueen.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button type="button" className="btn-pink" onClick={reset}>
            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Coba lagi
          </button>
          <Link href="/" className="btn-outline">
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
