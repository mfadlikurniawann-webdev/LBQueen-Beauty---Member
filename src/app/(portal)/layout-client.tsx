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
  if (isAuthPage) return <main id="main-content" className="min-h-dvh">{children}</main>;

  const isSubPage = ["/cart", "/orders", "/profile"].includes(pathname);

  return (
    <div className="min-h-screen bg-[#FDFBFB] flex flex-col items-center">
      <div className="w-full max-w-7xl min-h-dvh relative flex flex-col lg:border-x lg:border-[#EEDFE3]">

      {!isSubPage && customer && (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex justify-center">
        <div className="w-full max-w-7xl relative overflow-hidden transition-all duration-300"
          style={{
            background: scrolled
              ? 'rgba(255,255,255,0.96)'
              : 'transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: scrolled ? '1px solid #EEDFE3' : 'none',
            boxShadow: scrolled ? '0 4px 20px rgba(201,79,120,0.08)' : 'none',
          }}>
          <div className="relative z-10 flex items-center justify-between gap-3 px-5 sm:px-8 lg:px-12 h-[72px]">
            <Link href="/" aria-label="LBQueen Care & Beauty, ke beranda" className="flex items-center gap-2.5 min-w-0 rounded-2xl">
              <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center overflow-hidden bg-white"
                style={{
                  border: scrolled ? '1px solid #EEDFE3' : '1px solid rgba(255,255,255,0.35)',
                  boxShadow: scrolled ? '0 2px 8px rgba(201,79,120,0.10)' : '0 4px 14px rgba(45,41,38,0.12)'
                }}>
                <Image src="/lbqueen_logo.png" alt="" width={80} height={32} className="h-full w-auto object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-[16px] font-bold leading-none tracking-tight"
                  style={{ color: scrolled ? '#A83960' : 'white' }}>LBQueen</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mt-1 leading-none"
                  style={{ color: scrolled ? '#766B68' : 'rgba(255,255,255,0.85)' }}>
                  Care & Beauty
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {customer ? (
                <>
                  <Link href="/cart"
                    aria-label={totalItems > 0 ? `Keranjang, ${totalItems} item` : "Keranjang"}
                    className="relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
                    style={{
                      background: scrolled ? '#FDF2F5' : 'rgba(255,255,255,0.18)',
                      border: scrolled ? '1px solid #F6DDE6' : '1px solid rgba(255,255,255,0.28)',
                    }}>
                    <ShoppingCart className="w-5 h-5" style={{ color: scrolled ? '#A83960' : 'white' }} aria-hidden="true" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-white text-[11px] font-bold tabular-nums flex items-center justify-center ring-2 ring-white"
                        style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)' }}>
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </Link>
                </>
              ) : (
                <Link href="/login"
                  className="h-10 inline-flex items-center text-[13px] font-bold px-5 rounded-2xl transition-all"
                  style={{
                    background: scrolled ? 'linear-gradient(135deg,#C94F78,#9B3055)' : 'rgba(255,255,255,0.20)',
                    color: 'white',
                    border: scrolled ? 'none' : '1px solid rgba(255,255,255,0.3)',
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

      <main id="main-content" className="flex-1 min-w-0" style={{ paddingBottom: customer ? 'calc(env(safe-area-inset-bottom, 0px) + 128px)' : undefined }}>
        <Reveal>{children}</Reveal>
      </main>

      {customer && (
        <nav aria-label="Navigasi pelanggan" className="fixed bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-3 sm:px-4">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[32px] border border-[#EEDFE3] flex items-center justify-around px-1.5 pt-2 pointer-events-auto"
            style={{
              paddingBottom: 'max(env(safe-area-inset-bottom, 10px), 10px)',
              boxShadow: '0 10px 40px rgba(201,79,120,0.16)',
            }}>
            {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
              const active = href === "/"
                ? pathname === href
                : pathname.startsWith(href);
              const showBadge = href === "/cart" && totalItems > 0;
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined}
                  aria-label={showBadge ? `${label}, ${totalItems} item` : undefined}
                  className="flex-1 flex flex-col items-center gap-1 min-w-0 py-1 rounded-2xl transition-all duration-300 active:scale-90">
                  <div className={`relative w-12 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ${active ? "shadow-[0_6px_14px_rgba(201,79,120,0.30)]" : ""}`}
                    style={active ? { background: 'linear-gradient(135deg,#C94F78,#9B3055)' } : undefined}>
                    <Icon className="w-5 h-5 transition-all duration-300"
                      style={{ color: active ? '#FFFFFF' : '#766B68' }}
                      strokeWidth={active ? 2.4 : 2}
                      aria-hidden="true"
                    />
                    {showBadge && (
                      <span className="absolute -top-1 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] leading-none font-bold tabular-nums flex items-center justify-center ring-2 ring-white"
                        style={active ? { background: '#FFFFFF', color: '#A83960' } : { background: 'linear-gradient(135deg,#C94F78,#9B3055)', color: '#FFFFFF' }}
                        aria-hidden="true">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </div>
                  <span className={`text-[12px] leading-tight transition-all duration-300 truncate max-w-full ${active ? "font-bold" : "font-semibold"}`}
                    style={{ color: active ? '#A83960' : '#5F5552' }}>
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
