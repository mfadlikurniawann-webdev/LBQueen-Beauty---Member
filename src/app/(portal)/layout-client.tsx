"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { BottomNav } from "@/components/portal/BottomNav";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { CartProvider, useCart } from "@/context/CartContext";
import { CustomerProvider, useCustomer } from "@/context/CustomerContext";

const SUB_PAGES = ["/cart", "/orders", "/profile"];

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { customer, loading, error } = useCustomer();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 8);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!loading && !error && !customer && SUB_PAGES.includes(pathname)) router.replace("/login");
  }, [customer, loading, error, pathname, router]);

  const isAuthPage = ["/login", "/register"].includes(pathname);
  if (isAuthPage)
    return (
      <main id="main-content" className="min-h-dvh">
        {children}
      </main>
    );

  const isSubPage = SUB_PAGES.includes(pathname);

  return (
    <div className="min-h-screen bg-[#FDFBFB] flex flex-col items-center">
      <div className="w-full max-w-7xl min-h-dvh relative flex flex-col lg:border-x lg:border-[#EEDFE3]">
        {!isSubPage && customer && <PortalHeader scrolled={scrolled} totalItems={totalItems} />}

        <main
          id="main-content"
          className="flex-1 min-w-0"
          style={{
            paddingBottom: customer ? "calc(env(safe-area-inset-bottom, 0px) + 128px)" : undefined,
          }}
        >
          <Reveal>{children}</Reveal>
        </main>

        {customer && <BottomNav pathname={pathname} totalItems={totalItems} />}
      </div>
    </div>
  );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProvider>
      <CartProvider>
        <Layout>{children}</Layout>
      </CartProvider>
    </CustomerProvider>
  );
}
