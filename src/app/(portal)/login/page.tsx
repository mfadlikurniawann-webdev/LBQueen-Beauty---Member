"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, ArrowRight, Loader2, Ticket, Star, Heart, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const LeftBg = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="cl1" cx="75%" cy="10%" r="55%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.13)" /><stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <radialGradient id="cl2" cx="15%" cy="90%" r="50%">
        <stop offset="0%" stopColor="rgba(212,175,55,0.16)" /><stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#cl1)" />
    <rect width="100%" height="100%" fill="url(#cl2)" />
    <circle cx="85%" cy="12%" r="85" fill="rgba(255,255,255,0.06)" />
    <circle cx="85%" cy="12%" r="50" fill="rgba(255,255,255,0.07)" />
    <circle cx="15%" cy="88%" r="100" fill="rgba(212,175,55,0.07)" />
    <circle cx="15%" cy="88%" r="60" fill="rgba(212,175,55,0.08)" />
    <ellipse cx="50%" cy="50%" rx="230" ry="75" fill="rgba(255,255,255,0.025)" transform="rotate(-15 50% 50%)" />
  </svg>
);

const BENEFITS = [
  { icon: Star, text: "Akses Katalog Treatment Eksklusif" },
  { icon: Heart, text: "Program Loyalty & Reward Poin" },
  { icon: Ticket, text: "Promo & Diskon Khusus Member" },
  { icon: ShieldCheck, text: "Riwayat Perawatan Tersimpan" },
];

export default function CustomerLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const stored = localStorage.getItem("lbqueen_customer");
    if (stored) {
      fetch("/api/session", { cache: "no-store" }).then(response => response.json()).then(session => {
        if (session.customer) router.replace("/"); else localStorage.removeItem("lbqueen_customer");
      }).catch(() => localStorage.removeItem("lbqueen_customer"));
      return;
    }

    // Load saved credential from Remember Me
    const saved = localStorage.getItem("lbqueen_remember_customer");
    if (saved) {
      setForm(prev => ({ ...prev, phone: saved }));
      setRememberMe(true);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const identifier = form.phone.trim();
      const password = form.password;

      const { loginCustomer } = await import("@/app/actions/auth");
      const res = await loginCustomer(identifier, password);

      if (res.error) {
        throw new Error(res.error);
      }

      // Save Remember Me preference
      if (rememberMe) {
        localStorage.setItem("lbqueen_remember_customer", identifier);
      } else {
        localStorage.removeItem("lbqueen_remember_customer");
      }

      localStorage.setItem("lbqueen_customer", JSON.stringify(res.data));
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F2F0' }}>

      {/* ══════════════════════════════
          LEFT PANEL — Gradient + Logo
          ══════════════════════════════ */}
      <div className="hidden lg:flex flex-col items-center justify-center w-[42%] relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #D4608A 0%, #C94F78 35%, #9B3055 70%, #7A2240 100%)' }}>
        <LeftBg />

        <div className="relative z-10 flex flex-col items-center text-center px-10 max-w-[380px]">
          {/* Logo card */}
          <div className="w-[88px] h-[88px] rounded-[22px] bg-white flex items-center justify-center overflow-hidden mb-6 shadow-xl"
            style={{ boxShadow: '0 12px 40px rgba(45,41,38,0.20)' }}>
            <Image src="/lbqueen_logo.png" alt="LBQueen" width={72} height={72} className="object-contain" style={{ width: 'auto', height: 'auto' }} />
          </div>

          <h1 className="text-[24px] font-medium text-white mb-1.5 tracking-tight">LBQueen Member</h1>
          <p className="text-white/50 text-[13px] font-normal mb-10">Care & Beauty Clinic</p>

          {/* Benefit bullets */}
          <div className="w-full space-y-2.5">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ background: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white/70" />
                </div>
                <span className="text-[12px] font-normal text-white/80">+ {text}</span>
              </div>
            ))}
          </div>

          <p className="text-white/25 text-[10px] mt-10 uppercase tracking-[0.25em]">PT. LBQueen Care Beauty</p>
        </div>
      </div>

      {/* ══════════════════════════════
          RIGHT PANEL — Clean Form
          ══════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#f0eded] flex items-center justify-center overflow-hidden mb-3 shadow-md">
              <Image src="/lbqueen_logo.png" alt="LBQueen" width={48} height={48} className="object-contain" style={{ width: 'auto', height: 'auto' }} />
            </div>
            <p className="font-medium text-[16px]" style={{ color: '#C94F78' }}>LBQueen</p>
            <p className="text-[11px] text-[#2D2926]/30">Care & Beauty</p>
          </div>

          {/* Welcome label */}
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: '#D4AF37' }}>Selamat Datang</span>
          </div>
          <h2 className="text-[28px] font-medium text-[#2D2926] tracking-tight mb-1.5">Masuk ke Akun</h2>
          <p className="text-[13px] mb-8" style={{ color: 'rgba(45,41,38,0.40)' }}>
            Masukkan <span style={{ color: '#C94F78' }}>Username</span> dan <span style={{ color: '#C94F78' }}>Password</span> Anda
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#2D2926]/35 mb-1.5 uppercase tracking-[0.12em]">Nomor HP / Username</label>
              <input type="text" placeholder="Masukkan Username / Nomor HP" required value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl text-[13px] outline-none transition-all"
                style={{ background: '#F7F5F4', border: '1.5px solid transparent', color: '#2D2926' }}
                onFocus={e => e.currentTarget.style.borderColor = '#C94F78'}
                onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#2D2926]/35 mb-1.5 uppercase tracking-[0.12em]">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Masukkan Password" required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-[13px] outline-none transition-all"
                  style={{ background: '#F7F5F4', border: '1.5px solid transparent', color: '#2D2926' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#C94F78'}
                  onBlur={e => e.currentTarget.style.borderColor = 'transparent'} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(45,41,38,0.2)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#C94F78'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'rgba(45,41,38,0.2)'}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pb-2">
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)} 
                  className="w-4 h-4 rounded border-gray-300 accent-[#C94F78] cursor-pointer" 
                />
                <span className="text-[12px] font-medium text-[#2D2926]/60 group-hover:text-[#C94F78] transition-colors">
                  Ingatkan Saya
                </span>
              </label>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-[12px]"
                style={{ background: 'rgba(201,79,120,0.06)', color: '#C94F78', border: '1px solid rgba(201,79,120,0.15)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-[52px] rounded-xl text-white font-medium text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #D4608A 0%, #C94F78 50%, #9B3055 100%)', boxShadow: '0 8px 24px rgba(201,79,120,0.30)' }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Masuk Sekarang <ArrowRight className="w-4 h-4" /></>}
            </button>

            <Link href="/register" 
              className="w-full h-[52px] rounded-xl font-medium text-[13px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] border border-[#f0eded] text-[#2D2926]/60 hover:bg-[#FDFBFB] hover:text-[#C94F78] hover:border-[#C94F78]/20">
               Belum ada akun? Daftar dulu
            </Link>
          </form>

          {/* Member info */}
          <div className="mt-8 p-4 rounded-xl flex items-start gap-2.5"
            style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.18)' }}>
            <p className="text-[11px] font-normal leading-relaxed" style={{ color: '#B8941F' }}>
              Silakan mendaftar secara online melalui link pendaftaran di atas, atau minta dibuatkan akun oleh kasir/admin di klinik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
