"use client";

import { ToastProvider } from "./Toast";
import { PWAProvider } from "./PWAContext";

import { useEffect } from "react";
import { watchStaleDeploy } from "@/lib/stale-deploy";
import { subscribeTheme } from "@/lib/theme-mode";
import { SWRConfig } from "swr";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Versi lama menyimpan profil (NIK, alamat, HP) di localStorage; hapus dari perangkat.
    localStorage.removeItem("lbqueen_customer");
    return watchStaleDeploy();
  }, []);
  // Tema mengikuti perubahan sistem dan pilihan dari tab lain di semua halaman.
  useEffect(() => subscribeTheme(() => {}), []);

  return (
    <SWRConfig value={{ dedupingInterval: 30000, revalidateOnFocus: false, errorRetryCount: 1 }}>
      <PWAProvider>
        <ToastProvider>{children}</ToastProvider>
      </PWAProvider>
    </SWRConfig>
  );
}
