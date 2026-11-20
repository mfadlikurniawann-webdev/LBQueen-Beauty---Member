"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import type { Customer } from "@/lib/customer";

const PROFILE_KEY = "customer-profile";
// Navigasi tetap memperbarui poin/tier, tetapi tidak lebih sering dari ini.
const NAVIGATION_REFRESH_MS = 15000;

const CustomerContext = createContext<{
  customer: Customer | null;
  loading: boolean;
  error: Error | undefined;
  refresh: () => Promise<unknown>;
} | null>(null);

async function loadProfile() {
  const response = await fetch("/api/session", { cache: "no-store" });
  if (!response.ok) throw new Error("Informasi akun belum dapat dimuat. Coba muat ulang halaman.");
  const result: { profile: Customer | null } = await response.json();
  return result.profile;
}

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lastFetch = useRef(0);
  const { data, isLoading, error, mutate } = useSWR(
    PROFILE_KEY,
    async () => {
      lastFetch.current = Date.now();
      return loadProfile();
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: true,
      focusThrottleInterval: NAVIGATION_REFRESH_MS,
      dedupingInterval: 5000,
      refreshInterval: 120000,
    },
  );

  useEffect(() => {
    if (lastFetch.current && Date.now() - lastFetch.current > NAVIGATION_REFRESH_MS) void mutate();
  }, [pathname, mutate]);

  return (
    <CustomerContext.Provider
      value={{ customer: data ?? null, loading: isLoading, error, refresh: () => mutate() }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) throw new Error("useCustomer requires CustomerProvider");
  return context;
}
