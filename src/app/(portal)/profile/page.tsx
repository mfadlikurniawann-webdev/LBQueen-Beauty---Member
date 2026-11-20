"use client";

import { logoutCustomer } from "@/app/actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Clock3,
  Crown,
  LogOut,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Ticket,
} from "lucide-react";
import { PageHero } from "@/components/portal/PageHero";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { MenuList } from "@/components/profile/MenuList";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { clinicStatus } from "@/lib/clinic";
import { CLINIC_MAPS_URL, waLink } from "@/lib/constants";
import { tierOf } from "@/lib/membership";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { customer, refresh } = useCustomer();
  const { totalItems } = useCart();
  const [showPassword, setShowPassword] = useState(false);

  if (!customer) return null;

  const logout = async () => {
    localStorage.removeItem("lbqueen_customer");
    await logoutCustomer();
    await refresh();
    router.push("/");
  };

  const status = clinicStatus();

  return (
    <div className="min-h-screen">
      <PageHero title="Profil" onBack={() => router.back()} tall />

      <div className="px-4 sm:px-8 -mt-12 relative z-20 space-y-6 pb-6 max-w-2xl mx-auto">
        <ProfileSummary customer={customer} />

        <MenuList
          title="Akun"
          rows={[
            {
              label: "Keamanan akun",
              icon: ShieldCheck,
              value: "Ganti password",
              onClick: () => setShowPassword((v) => !v),
              expanded: showPassword,
              panel: <ChangePasswordForm customerId={customer.id} embedded />,
            },
            {
              label: "Membership",
              tone: "gold",
              icon: Crown,
              href: "/membership",
              value: tierOf(customer).name,
            },
            { label: "Voucher & promo", tone: "gold", icon: Ticket, href: "/promo" },
          ]}
        />

        <MenuList
          title="Aktivitas di LBQueen"
          rows={[
            { label: "Pesanan saya", icon: ClipboardList, href: "/orders" },
            {
              label: "Keranjang",
              tone: "berry",
              icon: ShoppingCart,
              href: "/cart",
              badge: totalItems > 0 ? `${totalItems} item` : undefined,
            },
          ]}
        />

        <MenuList
          title="Bantuan"
          rows={[
            {
              label: "Chat admin LBQueen",
              icon: MessageCircle,
              href: waLink("Halo admin LBQueen, saya butuh bantuan."),
              external: true,
            },
            {
              label: "Lokasi klinik",
              tone: "berry",
              icon: MapPin,
              href: CLINIC_MAPS_URL,
              external: true,
            },
            {
              label: "Jam buka",
              tone: "gold",
              icon: Clock3,
              href: "/#info-klinik",
              value:
                status === "buka"
                  ? "Sedang buka"
                  : status === "tutup"
                    ? "Sedang tutup"
                    : "Lihat jadwal",
            },
          ]}
        />

        <button
          type="button"
          onClick={logout}
          className={cn(
            "btn-glass w-full h-14 text-[15px] gap-3",
          )}
        >
          <LogOut className="w-5 h-5" /> Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
