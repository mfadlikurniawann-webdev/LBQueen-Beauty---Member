"use client";

import { ToastProvider } from "./Toast";
import { PWAProvider } from "./PWAContext";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { watchStaleDeploy } from "@/lib/stale-deploy";
import { SWRConfig } from "swr";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => watchStaleDeploy(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <SWRConfig value={{ dedupingInterval: 30000, revalidateOnFocus: false, errorRetryCount: 1 }}>
        <PWAProvider>
          <ToastProvider>{children}</ToastProvider>
        </PWAProvider>
      </SWRConfig>
    </QueryClientProvider>
  );
}
