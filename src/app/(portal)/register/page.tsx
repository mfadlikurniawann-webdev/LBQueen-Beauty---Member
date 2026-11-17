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

const INPUT_CLASS = "w-full min-h-12 px-4 py-3 rounded-2xl text-base sm:text-[14px] text-[#2D2926] bg-[#FAF7F5] border border-[#E8D5DB] placeholder:text-[#8C8280] outline-none transition-all focus:bg-white focus:border-[#C94F78] focus:ring-4 focus:ring-[#C94F78]/10";
const LABEL_CLASS = "block text-[12px] font-bold text-[#766B68] mb-2 uppercase tracking-[0.08em]";

const BENEFITS = [
  { icon: Star, text: "Akses Katalog Treatment Eksklusif" },
  { icon: Heart, text: "Program Loyalty & Reward Poin" },
  { icon: Ticket, text: "Promo & Diskon Khusus Member" },
  { icon: ShieldCheck, text: "Riwayat Perawatan Tersimpan" },
];

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    nik: "",
    address: "",
    password: "",
    website: "",
  });
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
    }
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    const name = form.name.trim();
    const username = form.username.trim().toLowerCase().replace(/\s+/g, "");
    const phone = form.phone.trim();
    const nik = form.nik.trim();
    const address = form.address.trim();
    const passwordPlain = form.password;

    if (!name || !username || !phone || !passwordPlain) {
      setError("Nama Lengkap, Username, Nomor HP, dan Password wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const { registerCustomer } = await import("@/app/actions/auth");
      const res = await registerCustomer({
        name, username, phone, nik, address, passwordPlain, website: form.website
      });

      if (res.error) {
        throw new Error(res.error);
      }

      // Auto login customer
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

      <div className="hidden lg:flex flex-col items-center justify-center w-[42%] relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #D4608A 0%, #C94F78 35%, #9B3055 70%, #7A2240 100%)' }}>
        <LeftBg />

        <div className="relative z-10 flex flex-col items-center text-center px-10 max-w-[400px]">
          <div className="w-[88px] h-[88px] rounded-[24px] bg-white flex items-center justify-center overflow-hidden mb-6 shadow-xl"
            style={{ boxShadow: '0 12px 40px rgba(45,41,38,0.20)' }}>
            <Image src="/lbqueen_logo.png" alt="LBQueen" width={72} height={72} className="object-contain" style={{ width: 'auto', height: 'auto' }} />
          </div>

          <h1 className="text-[26px] font-bold! text-white mb-1.5 tracking-tight">Daftar Akun</h1>
          <p className="text-white/80 text-[14px] font-medium mb-10">PT. LBQueen Care Beauty</p>

          <ul className="w-full space-y-2.5">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 px-4 py-3 rounded-2xl border text-left"
                style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <span className="text-[13px] font-medium text-white">{text}</span>
              </li>
            ))}
          </ul>

          <p className="text-white/65 text-[11px] font-semibold mt-10 uppercase tracking-[0.12em]">Care & Beauty Clinic</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:p-8 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-[440px] my-auto">

          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#EEDFE3] flex items-center justify-center overflow-hidden mb-3 shadow-md">
              <Image src="/lbqueen_logo.png" alt="LBQueen" width={48} height={48} className="object-contain" style={{ width: 'auto', height: 'auto' }} />
            </div>
            <p className="font-bold text-[17px] text-[#A83960]">LBQueen</p>
            <p className="text-[12px] font-medium text-[#766B68]">Care & Beauty</p>
          </div>

          <p className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3 text-[#9A7B22]">Pendaftaran Online</p>
          <h2 className="text-[28px] font-bold! text-[#2D2926] tracking-tight leading-tight mb-2">Buat Akun Baru</h2>
          <p className="text-[14px] text-[#766B68] mb-8 leading-relaxed">
            Lengkapi data di bawah untuk bergabung sebagai <span className="font-semibold text-[#A83960]">Pelanggan</span>
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <p className="text-[12px] text-[#766B68]">Kolom bertanda <span className="font-bold text-[#A83960]">*</span> wajib diisi.</p>
            <div>
              <label htmlFor="reg-name" className={LABEL_CLASS}>Nama Lengkap <span className="text-[#A83960]">*</span></label>
              <input id="reg-name" type="text" autoComplete="name" placeholder="Masukkan nama lengkap Anda" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={INPUT_CLASS} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
              <div>
                <label htmlFor="reg-username" className={LABEL_CLASS}>Username <span className="text-[#A83960]">*</span></label>
                <input id="reg-username" type="text" autoComplete="username" placeholder="Username" required value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className={INPUT_CLASS} />
              </div>
              <div>
                <label htmlFor="reg-phone" className={LABEL_CLASS}>Nomor HP / WhatsApp <span className="text-[#A83960]">*</span></label>
                <input id="reg-phone" type="tel" autoComplete="tel" placeholder="Contoh: 08123456789" required value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className={INPUT_CLASS} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
              <div>
                <label htmlFor="reg-nik" className={LABEL_CLASS}>NIK <span className="normal-case tracking-normal font-medium">(Opsional)</span></label>
                <input id="reg-nik" type="text" inputMode="numeric" placeholder="Nomor Induk Kependudukan" value={form.nik}
                  onChange={e => setForm({ ...form, nik: e.target.value })}
                  className={INPUT_CLASS} />
              </div>
              <div>
                <label htmlFor="reg-password" className={LABEL_CLASS}>Password <span className="text-[#A83960]">*</span></label>
                <div className="relative">
                  <input id="reg-password" autoComplete="new-password" minLength={8} type={showPass ? "text" : "password"} placeholder="Minimal 8 karakter" required value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className={`${INPUT_CLASS} pr-14`} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-[#766B68] hover:text-[#C94F78] hover:bg-[#FDF2F5] transition-colors">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="reg-address" className={LABEL_CLASS}>Alamat Lengkap <span className="normal-case tracking-normal font-medium">(Opsional)</span></label>
              <textarea id="reg-address" autoComplete="street-address" placeholder="Masukkan alamat lengkap Anda..." value={form.address} rows={2}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className={`${INPUT_CLASS} resize-none`} />
            </div>

            {error && (
              <div role="alert" className="px-4 py-3 rounded-2xl text-[13px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            <div className="space-y-3 pt-1">
              <button type="submit" disabled={loading}
                className="w-full h-[52px] rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:brightness-105 disabled:opacity-80 disabled:cursor-wait cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #D4608A 0%, #C94F78 50%, #9B3055 100%)', boxShadow: '0 8px 24px rgba(201,79,120,0.30)' }}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Daftar Sekarang <ArrowRight className="w-4 h-4" /></>}
              </button>

              <Link href="/login"
                className="w-full h-[52px] rounded-2xl font-bold text-[14px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] border border-[#EEDFE3] bg-white text-[#766B68] hover:bg-[#FDF2F5] hover:border-[#F0CBD8]">
                Sudah punya akun? <span className="text-[#A83960]">Masuk</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
