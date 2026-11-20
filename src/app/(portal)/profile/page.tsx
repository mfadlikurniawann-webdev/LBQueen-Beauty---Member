"use client";

import { logoutAllDevices, logoutCustomer } from "@/app/actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Crown,
  LogOut,
  MonitorSmartphone,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Ticket,
  UserRound,
} from "lucide-react";
import { PageHero } from "@/components/portal/PageHero";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { MenuList } from "@/components/profile/MenuList";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import { ThemeSwitcher } from "@/components/profile/ThemeSwitcher";
import { useToast } from "@/components/Toast";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { clinicStatus } from "@/lib/clinic";
import { CLINIC_MAPS_URL, waLink } from "@/lib/constants";
import { tierOf } from "@/lib/membership";

type Panel = "profile" | "password" | "devices" | null;

export default function ProfilePage() {
  const router = useRouter();
  const { customer, refresh } = useCustomer();
  const { totalItems } = useCart();
  const { toast } = useToast();
  const [openPanel, setOpenPanel] = useState<Panel>(null);
  const [revoking, setRevoking] = useState(false);

  if (!customer) return null;

  const logout = async () => {
    await logoutCustomer();
    await refresh();
    router.push("/");
  };

  const logoutEverywhere = async () => {
    setRevoking(true);
    try {
      const result = await logoutAllDevices();
      if (result.error) throw new Error(result.error);
      localStorage.removeItem("lbqueen_remember_customer");
      await refresh();
      router.push("/");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Gagal keluar dari semua perangkat.", "error");
      setRevoking(false);
    }
  };

  const status = clinicStatus();
  const toggle = (key: Panel) => setOpenPanel((current) => (current === key ? null : key));

  const logoutAllPanel = (
    <div className="px-4 pb-4 space-y-3">
      <p className="text-[14px] text-ink-3">
        Semua HP dan browser yang memakai akun ini harus masuk lagi, termasuk perangkat ini.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpenPanel(null)}
          disabled={revoking}
          className="btn-glass flex-1 h-12 text-[14px]"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={logoutEverywhere}
          disabled={revoking}
          className="btn-primary flex-1 h-12 text-[14px]"
        >
          {revoking ? "Memproses" : "Ya, keluarkan"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <PageHero title="Profil" onBack={() => router.back()} />

      <div className="px-4 sm:px-8 pt-1 space-y-5 pb-6 max-w-2xl mx-auto">
        <ProfileSummary customer={customer} onChanged={refresh} />

        <MenuList
          title="Profil"
          rows={[
            {
              label: "Ubah profil",
              icon: UserRound,
              value: "Nama, HP, alamat",
              onClick: () => toggle("profile"),
              expanded: openPanel === "profile",
              panel: <ProfileForm customer={customer} onSaved={refresh} />,
            },
          ]}
        />

        <MenuList
          title="Keamanan"
          rows={[
            {
              label: "Ganti password",
              icon: ShieldCheck,
              onClick: () => toggle("password"),
              expanded: openPanel === "password",
              panel: <ChangePasswordForm customerId={customer.id} embedded />,
            },
            {
              label: "Keluar dari semua perangkat",
              icon: MonitorSmartphone,
              tone: "berry",
              onClick: () => toggle("devices"),
              expanded: openPanel === "devices",
              panel: logoutAllPanel,
            },
          ]}
        />

        <ThemeSwitcher />

        <MenuList
          title="Membership & voucher"
          rows={[
            { label: "Membership", tone: "gold", icon: Crown, href: "/membership", value: tierOf(customer).name },
            { label: "Voucher & promo", tone: "gold", icon: Ticket, href: "/promo" },
          ]}
        />

        <MenuList
          title="Aktivitas"
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
              label: "Chat admin",
              icon: MessageCircle,
              href: waLink("Halo admin LBQueen, saya butuh bantuan."),
              external: true,
            },
            {
              label: "Lokasi & jam buka",
              tone: "berry",
              icon: MapPin,
              href: CLINIC_MAPS_URL,
              external: true,
              value: status === "buka" ? "Sedang buka" : status === "tutup" ? "Sedang tutup" : undefined,
            },
          ]}
        />

        <button type="button" onClick={logout} className="btn-glass w-full h-14 text-[15px] gap-3">
          <LogOut className="w-5 h-5" aria-hidden="true" /> Keluar
        </button>
      </div>
    </div>
  );
}
