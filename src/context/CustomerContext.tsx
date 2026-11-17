"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import type { Customer } from "@/lib/customer";

const CustomerContext = createContext<{
  customer: Customer | null;
  loading: boolean;
  error: Error | undefined;
} | null>(null);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, isLoading, error } = useSWR(
    ["customer-profile", pathname],
    async () => {
      const response = await fetch("/api/session", { cache: "no-store" });
      if (!response.ok)
        throw new Error("Informasi akun belum dapat dimuat. Coba muat ulang halaman.");
      const result: { profile: Customer | null } = await response.json();
      return result.profile;
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: true,
      dedupingInterval: 0,
      refreshInterval: 60000,
    },
  );

  return (
    <CustomerContext.Provider value={{ customer: data ?? null, loading: isLoading, error }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) throw new Error("useCustomer requires CustomerProvider");
  return context;
}
