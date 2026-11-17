"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { PageHero } from "@/components/portal/PageHero";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import { useCustomer } from "@/context/CustomerContext";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { customer } = useCustomer();

  if (!customer) return null;

  const logout = async () => {
    localStorage.removeItem("lbqueen_customer");
    const { logoutCustomer } = await import("@/app/actions/auth");
    await logoutCustomer();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FDFBFB]">
      <PageHero
        title="Profil Saya"
        subtitle="Kelola informasi akun Anda"
        onBack={() => router.back()}
        tall
      />

      <div className="px-4 sm:px-5 -mt-7 relative z-20 space-y-5 pb-6 max-w-2xl mx-auto">
        <ProfileSummary customer={customer} />
        <ChangePasswordForm customerId={customer.id} />

        <button
          type="button"
          onClick={logout}
          className={cn(
            "w-full h-14 bg-white border border-[#F0CBD8] text-[#A83960] rounded-2xl font-bold text-[15px]",
            "flex items-center justify-center gap-3 hover:bg-[#FDF2F5] transition-all active:scale-[0.98]",
          )}
        >
          <LogOut className="w-5 h-5" /> Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
