"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCustomerPassword } from "@/app/actions/auth";
import { Lock, LogOut, Eye, EyeOff, Loader2, Crown, Phone, ShieldCheck, CheckCircle2, ChevronLeft } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passForm, setPassForm] = useState({ old: "", new: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("lbqueen_customer");
    if (stored) setCustomer(JSON.parse(stored));
    else router.push("/");
  }, [router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!customer?.id) return;
    if (!passForm.new) { setError("Password baru wajib diisi."); return; }
    if (passForm.new !== passForm.confirm) { setError("Konfirmasi tidak cocok."); return; }
    setLoading(true);
    try {
      const result = await updateCustomerPassword(passForm.old, passForm.new);
      if (result.error) { setError(result.error); return; }
      
      setSuccess("Password berhasil diperbarui!"); 
      setPassForm({ old: "", new: "", confirm: "" });
    } catch (err) { 
      console.error(err);
      setError("Gagal memperbarui password."); 
    }
    finally { setLoading(false); }
  };

  if (!customer) return null;

  const inputClass = "w-full min-h-12 px-4 py-3 bg-[#FDFAFB] border border-[#E8D5DB] rounded-2xl text-base sm:text-[14px] text-[#2D2926] outline-none focus:border-[#C94F78] focus:bg-white focus:ring-4 focus:ring-[#C94F78]/10 transition-all";
  const labelClass = "block text-[12px] font-bold text-[#766B68] uppercase tracking-[0.08em] mb-2 ml-1";
  const eyeClass = "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-[#766B68] hover:text-[#C94F78] hover:bg-[#FDF2F5] transition-colors";

  return (
    <div className="min-h-screen bg-[#FDFBFB]">
      <div className="relative overflow-hidden px-5 sm:px-8 pt-10 pb-14 rounded-b-[40px] shadow-lg shadow-rose-100/30"
        style={{ background: 'linear-gradient(160deg,#C94F78 0%,#9B3055 55%,#7A2240 100%)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -ml-32 -mt-32"></div>

        <div className="relative z-10 flex items-center gap-4">
          <button type="button" aria-label="Kembali" onClick={() => router.back()}
            className="w-11 h-11 shrink-0 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/25 hover:bg-white/25 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold! text-white tracking-tight leading-tight">Profil Saya</h1>
            <p className="text-white/85 text-[13px] font-medium mt-0.5">Kelola informasi akun Anda</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 -mt-7 relative z-20 space-y-5 pb-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-[32px] p-5 sm:p-6 shadow-xl shadow-rose-100/30 border border-[#EEDFE3]">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-[72px] h-[72px] shrink-0 rounded-[24px] flex items-center justify-center text-white text-[26px] font-bold shadow-lg ${customer.is_member ? "bg-gradient-to-br from-[#D4AF37] to-[#B8941F] shadow-[#D4AF37]/30" : "bg-gradient-to-br from-[#C94F78] to-[#9B3055] shadow-rose-200"}`}
              aria-hidden="true">
              {customer.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-bold! text-[#2D2926] leading-snug line-clamp-2 break-words">{customer.name}</h2>
              {customer.is_member ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full w-fit mt-1.5 border border-amber-200">
                  <Crown className="w-3.5 h-3.5 text-[#B8941F] fill-[#D4AF37]" aria-hidden="true" />
                  <span className="text-[12px] font-bold text-[#7C6416] capitalize">{customer.membership_type || "Member"}</span>
                </div>
              ) : (
                <span className="inline-block mt-1.5 px-3 py-1 rounded-full bg-[#FDF2F5] border border-[#F6DDE6] text-[12px] font-semibold text-[#A83960]">Reguler Member</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-[#F4E8EC]">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#FAF7F5] border border-[#EEDFE3]">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center text-[#C94F78] shadow-sm">
                <Phone className="w-[18px] h-[18px]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#766B68] font-bold uppercase tracking-[0.1em] mb-0.5">Nomor Telepon</p>
                <p className="text-[15px] text-[#2D2926] font-bold tabular-nums break-all">{customer.phone || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#FAF7F5] border border-[#EEDFE3]">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#766B68] font-bold uppercase tracking-[0.1em] mb-0.5">Status Akun</p>
                <p className="text-[15px] text-emerald-700 font-bold">Terverifikasi</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-5 sm:p-8 shadow-xl shadow-rose-100/30 border border-[#EEDFE3]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#FDF2F5] flex items-center justify-center text-[#C94F78] border border-[#F6DDE6]">
              <Lock className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[16px] font-bold! text-[#2D2926]">Keamanan Akun</h3>
              <p className="text-[13px] text-[#766B68]">Perbarui password Anda secara berkala</p>
            </div>
          </div>

          {error && <div role="alert" className="mb-5 px-4 py-3 bg-rose-50 text-rose-700 text-[13px] font-semibold rounded-2xl border border-rose-200">{error}</div>}
          {success && <div role="status" className="mb-5 px-4 py-3 bg-emerald-50 text-emerald-700 text-[13px] font-semibold rounded-2xl border border-emerald-200 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />{success}</div>}

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label htmlFor="old-password" className={labelClass}>Password Lama</label>
              <div className="relative">
                <input id="old-password" autoComplete="current-password" type={showOldPass?"text":"password"} required value={passForm.old} onChange={e=>setPassForm(p=>({...p,old:e.target.value}))} className={`${inputClass} pr-14`}/>
                <button type="button" aria-label={showOldPass ? "Sembunyikan password lama" : "Tampilkan password lama"} onClick={()=>setShowOldPass(!showOldPass)} className={eyeClass}>{showOldPass?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}</button>
              </div>
            </div>

            <div>
              <label htmlFor="new-password" className={labelClass}>Password Baru</label>
              <div className="relative">
                <input id="new-password" autoComplete="new-password" aria-describedby="new-password-hint" type={showNewPass?"text":"password"} required value={passForm.new} onChange={e=>setPassForm(p=>({...p,new:e.target.value}))} className={`${inputClass} pr-14`}/>
                <button type="button" aria-label={showNewPass ? "Sembunyikan password baru" : "Tampilkan password baru"} onClick={()=>setShowNewPass(!showNewPass)} className={eyeClass}>{showNewPass?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}</button>
              </div>
              <p id="new-password-hint" className="text-[12px] text-[#766B68] mt-2 ml-1">Gunakan minimal 6 karakter kombinasi huruf & angka.</p>
            </div>

            <div>
              <label htmlFor="confirm-password" className={labelClass}>Konfirmasi Password Baru</label>
              <input id="confirm-password" autoComplete="new-password" type="password" required value={passForm.confirm} onChange={e=>setPassForm(p=>({...p,confirm:e.target.value}))} className={inputClass}/>
            </div>

            <button type="submit" disabled={loading} className="w-full h-14 text-white rounded-2xl font-bold text-[15px] flex items-center justify-center gap-3 hover:brightness-105 transition-all disabled:opacity-70 disabled:cursor-wait shadow-xl shadow-rose-100 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#C94F78,#9B3055)' }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <ShieldCheck className="w-5 h-5"/>}
              {loading ? "Memproses..." : "Update Password"}
            </button>
          </form>
        </div>

        <button type="button" onClick={async ()=>{
            localStorage.removeItem("lbqueen_customer");
            const { logoutCustomer } = await import("@/app/actions/auth");
            await logoutCustomer();
            router.push("/");
          }}
          className="w-full h-14 bg-white border border-[#F0CBD8] text-[#A83960] rounded-2xl font-bold text-[15px] flex items-center justify-center gap-3 hover:bg-[#FDF2F5] transition-all active:scale-[0.98]">
          <LogOut className="w-5 h-5"/> Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
