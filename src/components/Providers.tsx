"use client";

import { ToastProvider } from "./Toast";
import { PWAProvider } from "./PWAContext";

import { useEffect } from "react";
import { watchStaleDeploy } from "@/lib/stale-deploy";
import { SWRConfig } from "swr";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => watchStaleDeploy(), []);

  return (
    <SWRConfig value={{ dedupingInterval: 30000, revalidateOnFocus: false, errorRetryCount: 1 }}>
      <PWAProvider>
        <ToastProvider>{children}</ToastProvider>
      </PWAProvider>
    </SWRConfig>
  );
}
