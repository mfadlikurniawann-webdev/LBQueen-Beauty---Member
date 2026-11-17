"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, User, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CartProvider, useCart } from "@/context/CartContext";
import { Reveal } from "@/components/motion/Reveal";

const NAV_ITEMS = [
  { icon: Home,        label: "Beranda",   href: "/" },
  { icon: ShoppingCart, label: "Keranjang", href: "/cart" },
  { icon: ShoppingBag, label: "Pesanan",   href: "/orders" },
  { icon: User,        label: "Profil",    href: "/profile" },
];


function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const [customer, setCustomer] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkCustomer = () => {
      const s = localStorage.getItem("lbqueen_customer");
      let loggedInCustomer = null;
      if (s) { 
        try { 
          const parsed = JSON.parse(s);
          if (parsed && parsed.id) loggedInCustomer = parsed;
        } catch {} 
      }
      setCustomer(loggedInCustomer);

      // Redirect unauthenticated users trying to access subpages to the member home page
      const isSubPage = ["/cart", "/orders", "/profile"].includes(pathname);
      if (!loggedInCustomer && isSubPage) {
        router.push("/");
      }
    };

    checkCustomer();
    
    // Refresh on focus or storage change
    window.addEventListener("focus", checkCustomer);
    window.addEventListener("storage", checkCustomer);

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { setScrolled(window.scrollY > 8); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("focus", checkCustomer);
      window.removeEventListener("storage", checkCustomer);
    };
  }, [pathname, router]);

  const isAuthPage = ["/login", "/register"].includes(pathname);
  if (isAuthPage) return <>{children}</>;

  const isSubPage = ["/cart", "/orders", "/profile"].includes(pathname);

  return (
    <div className="min-h-screen bg-[#FDFBFB] flex flex-col items-center">
      <div className="w-full max-w-7xl min-h-dvh relative flex flex-col lg:border-x lg:border-[#EEDFE3]">

      {/* STICKY HEADER */}
      {!isSubPage && customer && (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex justify-center">
        <div className="w-full max-w-7xl relative overflow-hidden transition-all duration-300"
          style={{
            background: scrolled
              ? 'rgba(255,255,255,0.96)'
              : 'transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(201,79,120,0.08)' : 'none',
            boxShadow: scrolled ? '0 4px 20px rgba(201,79,120,0.08)' : 'none',
          }}>
          <div className="relative z-10 flex items-center justify-between px-5 sm:px-8 lg:px-12 h-[72px]">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: scrolled ? 'white' : 'rgba(255,255,255,0.15)',
                  border: scrolled ? '1px solid rgba(201,79,120,0.1)' : '1px solid rgba(255,255,255,0.25)',
                  boxShadow: scrolled ? '0 2px 8px rgba(201,79,120,0.10)' : 'none'
                }}>
                <Image src="/lbqueen_logo.png" alt="LBQueen" width={80} height={32} className="h-full w-auto object-contain" />
              </div>
              <div>
                <p className="text-[13px] font-medium leading-none"
                  style={{ color: scrolled ? '#C94F78' : 'white' }}>LBQueen</p>
                <p className="text-[8px] font-normal uppercase tracking-[0.2em] mt-0.5"
                  style={{ color: scrolled ? 'rgba(45,41,38,0.35)' : 'rgba(255,255,255,0.45)' }}>
                  Care & Beauty
                </p>
              </div>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {customer ? (
                <>
                  <Link href="/cart"
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: scrolled ? 'rgba(201,79,120,0.08)' : 'rgba(255,255,255,0.15)' }}>
                    <ShoppingCart className="w-4.5 h-4.5" style={{ color: scrolled ? '#C94F78' : 'white' }} />
                    {totalItems > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full text-white text-[9px] font-medium flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)', width: 18, height: 18 }}>
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </Link>
                </>
              ) : (
                <Link href="/login"
                  className="text-[11px] font-medium px-4 py-2 rounded-xl transition-all"
                  style={{
                    background: scrolled ? 'linear-gradient(135deg,#C94F78,#9B3055)' : 'rgba(255,255,255,0.20)',
                    color: 'white',
                    border: scrolled ? 'none' : '1px solid rgba(255,255,255,0.25)',
                    boxShadow: scrolled ? '0 4px 12px rgba(201,79,120,0.25)' : 'none',
                  }}>
                  Masuk
                </Link>
              )}
            </div>
          </div>
        </div>
        </header>
      )}

      {/* ══════════════════════════════════════
          MAIN CONTENT
          ══════════════════════════════════════ */}
      <main id="main-content" className="flex-1 min-w-0" style={{ paddingBottom: customer ? 'calc(env(safe-area-inset-bottom, 0px) + 112px)' : undefined }}>
        <Reveal>{children}</Reveal>
      </main>

      {/* MOBILE BOTTOM TAB BAR */}
      {customer && (
        <nav aria-label="Navigasi pelanggan" className="fixed bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
          <div className="w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-[32px] border border-rose-100/50 shadow-2xl flex items-center justify-around px-2 pt-2 pointer-events-auto"
            style={{
              paddingBottom: 'max(env(safe-area-inset-bottom, 12px), 12px)',
              boxShadow: '0 10px 40px rgba(201,79,120,0.15)',
            }}>
            {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
              const active = href === "/"
                ? pathname === href
                : pathname.startsWith(href);
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined}
                  className="flex flex-col items-center gap-1 min-w-[56px] py-1 transition-all duration-300 active:scale-90">
                  <div className="w-12 h-9 rounded-2xl flex items-center justify-center transition-all duration-300"
                    style={active ? { 
                      background: 'rgba(201,79,120,0.12)',
                      boxShadow: 'inset 0 0 0 1px rgba(201,79,120,0.1)'
                    } : {}}>
                    <Icon className="w-5 h-5 transition-all duration-300"
                      style={{ color: active ? '#A83960' : '#766B68' }}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </div>
                  <span className="text-[11px] font-semibold transition-all duration-300"
                    style={{ color: active ? '#A83960' : '#766B68' }}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
      </div>
    </div>
  );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Layout>{children}</Layout>
    </CartProvider>
  );
}
