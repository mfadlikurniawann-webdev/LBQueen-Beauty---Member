"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { BottomNav } from "@/components/portal/BottomNav";
import { CartBar } from "@/components/portal/CartBar";
import { TopNav } from "@/components/portal/TopNav";
import { CartProvider, useCart } from "@/context/CartContext";
import { CustomerProvider, useCustomer } from "@/context/CustomerContext";
import { useSpotlight } from "@/hooks/useSpotlight";

const SUB_PAGES = ["/cart", "/orders", "/profile", "/membership"];

const showsCartBar = (pathname: string) =>
  pathname === "/" || pathname === "/promo" || pathname.startsWith("/category/");

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { customer, loading, error } = useCustomer();
  useSpotlight();

  useEffect(() => {
    if (!loading && !error && !customer && SUB_PAGES.includes(pathname)) router.replace("/login");
  }, [customer, loading, error, pathname, router]);

  const isAuthPage = ["/login", "/register"].includes(pathname);
  // Lapisan cahaya tetap di belakang semua halaman; permukaan glass membiaskannya.
  const ambient = <div className="ambient fixed inset-0 -z-10 pointer-events-none" aria-hidden="true" />;
  if (isAuthPage)
    return (
      <main id="main-content" className="relative isolate min-h-dvh">
        {ambient}
        {children}
      </main>
    );

  const cartBar = !!customer && totalItems > 0 && showsCartBar(pathname);
  const checkout = pathname === "/cart";
  const mobilePad = !customer ? 0 : checkout ? 168 : cartBar ? 196 : 112;

  return (
    <div className="relative isolate min-h-screen flex flex-col items-center">
      {ambient}
      <div className="w-full max-w-7xl min-h-dvh relative flex flex-col">
        {customer && <TopNav pathname={pathname} customer={customer} totalItems={totalItems} />}
        <main
          id="main-content"
          className="flex-1 min-w-0 pb-[var(--main-pad)] md:pb-[var(--main-pad-lg)]"
          style={
            {
              "--main-pad": `calc(env(safe-area-inset-bottom, 0px) + ${mobilePad}px)`,
              "--main-pad-lg": cartBar ? "112px" : "48px",
            } as React.CSSProperties
          }
        >
          <Reveal>{children}</Reveal>
        </main>

        {cartBar && <CartBar />}
        {customer && !checkout && <BottomNav pathname={pathname} />}
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
