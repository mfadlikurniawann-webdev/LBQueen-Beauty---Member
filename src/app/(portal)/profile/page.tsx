"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCustomerPassword } from "@/app/actions/auth";
import { User, Lock, LogOut, Eye, EyeOff, Loader2, Crown, Phone, ShieldCheck, CheckCircle2, ChevronLeft } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-[#FDFBFB]">
      {/* Gradient Header */}
      <div className="relative overflow-hidden px-6 pt-10 pb-12 rounded-b-[48px] shadow-lg shadow-rose-100/20" 
        style={{ background: 'linear-gradient(160deg,#C94F78 0%,#9B3055 55%,#7A2240 100%)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -ml-32 -mt-32"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-[22px] font-bold text-white tracking-tight">Profil Saya</h1>
            <p className="text-white/60 text-[11px] font-medium">Kelola informasi akun Anda</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20 space-y-6 pb-32">
        {/* Profile Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-rose-100/20 border border-[#f0eded]">
          <div className="flex items-center gap-5 mb-8">
            <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-white text-2xl font-bold shadow-lg ${customer.is_member ? "bg-gradient-to-br from-[#D4AF37] to-[#B8941F] shadow-[#D4AF37]/30" : "bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-200"}`}>
              {customer.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-bold text-[#2D2926] truncate">{customer.name}</h2>
              {customer.is_member ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full w-fit mt-1.5 border border-amber-100">
                  <Crown className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]"/>
                  <span className="text-xs font-semibold text-[#987431] capitalize">{customer.membership_type || "Member"}</span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 font-medium mt-1">Reguler Member</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 pt-6 border-t border-slate-50">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                <Phone className="w-4.5 h-4.5"/>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Nomor Telepon</p>
                <p className="text-[14px] text-[#2D2926] font-bold">{customer.phone || "—"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                <ShieldCheck className="w-5 h-5"/>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Status Akun</p>
                <p className="text-[14px] text-emerald-600 font-bold">Terverifikasi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-rose-100/20 border border-[#f0eded]">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-[#C94F78] border border-rose-100">
              <Lock className="w-6 h-6"/>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#2D2926]">Keamanan Akun</h3>
              <p className="text-[11px] text-slate-400 font-medium">Perbarui password Anda secara berkala</p>
            </div>
          </div>

          {error && <div className="mb-6 p-4 bg-rose-50 text-[#C94F78] text-[12px] font-bold rounded-2xl border border-rose-100">{error}</div>}
          {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 text-[12px] font-bold rounded-2xl border border-emerald-100 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/>{success}</div>}

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password Lama</label>
              <div className="relative">
                <input type={showOldPass?"text":"password"} required value={passForm.old} onChange={e=>setPassForm(p=>({...p,old:e.target.value}))} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] outline-none focus:border-[#C94F78] focus:bg-white transition-all"/>
                <button type="button" onClick={()=>setShowOldPass(!showOldPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#C94F78] transition-colors">{showOldPass?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}</button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password Baru</label>
              <div className="relative">
                <input type={showNewPass?"text":"password"} required value={passForm.new} onChange={e=>setPassForm(p=>({...p,new:e.target.value}))} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] outline-none focus:border-[#C94F78] focus:bg-white transition-all"/>
                <button type="button" onClick={()=>setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#C94F78] transition-colors">{showNewPass?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}</button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic mt-1.5 ml-1">Gunakan minimal 6 karakter kombinasi huruf & angka.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Password Baru</label>
              <input type="password" required value={passForm.confirm} onChange={e=>setPassForm(p=>({...p,confirm:e.target.value}))} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] outline-none focus:border-[#C94F78] focus:bg-white transition-all"/>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-[#C94F78] text-white rounded-2xl font-bold text-[14px] flex items-center justify-center gap-3 hover:bg-[#a03d5e] transition-all disabled:opacity-50 shadow-xl shadow-rose-100 active:scale-[0.98]">
              {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <ShieldCheck className="w-5 h-5"/>} 
              {loading ? "Memproses..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Logout Button */}
        <button onClick={async ()=>{
            localStorage.removeItem("lbqueen_customer");
            const { logoutCustomer } = await import("@/app/actions/auth");
            await logoutCustomer();
            router.push("/");
          }}
          className="w-full py-4 bg-white border border-rose-100 text-[#C94F78] rounded-[24px] font-bold text-[14px] flex items-center justify-center gap-3 hover:bg-rose-50 transition-all active:scale-[0.98]">
          <LogOut className="w-5 h-5"/> Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
