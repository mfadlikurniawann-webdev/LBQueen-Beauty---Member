"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { AuthActions } from "@/components/auth/AuthActions";
import { AuthError } from "@/components/auth/AuthError";
import { AuthShell } from "@/components/auth/AuthShell";
import { INPUT_CLASS, LABEL_CLASS } from "@/components/auth/auth-styles";
import { useCustomer } from "@/context/CustomerContext";
import { PasswordToggle } from "@/components/PasswordToggle";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { customer } = useCustomer();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("lbqueen_remember_customer");
      if (saved) {
        setForm((prev) => ({ ...prev, phone: saved }));
        setRememberMe(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (customer) router.replace("/");
  }, [customer, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const identifier = form.phone.trim();
      const password = form.password;

      const { loginCustomer } = await import("@/app/actions/auth");
      const res = await loginCustomer(identifier, password);

      if (res.error) {
        throw new Error(res.error);
      }

      if (rememberMe) {
        localStorage.setItem("lbqueen_remember_customer", identifier);
      } else {
        localStorage.removeItem("lbqueen_remember_customer");
      }

      localStorage.setItem("lbqueen_customer", JSON.stringify(res.data));
      router.push("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="LBQueen Member"
      subtitle="Care & Beauty Clinic"
      footer="PT. LBQueen Care Beauty"
      contentClassName="w-full max-w-[400px]"
    >
      <p className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3 text-[#9A7B22]">
        Selamat Datang
      </p>
      <h2 className="text-[28px] font-bold! text-[#2D2926] tracking-tight leading-tight mb-2">
        Masuk ke Akun
      </h2>
      <p className="text-[14px] text-[#766B68] mb-8 leading-relaxed">
        Masukkan <span className="font-semibold text-[#A83960]">Username</span>
        {" dan "}
        <span className="font-semibold text-[#A83960]">Password</span> Anda
      </p>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="login-identifier" className={LABEL_CLASS}>
            Nomor HP / Username
          </label>
          <input
            id="login-identifier"
            type="text"
            autoComplete="username"
            placeholder="Masukkan Username / Nomor HP"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="login-password" className={LABEL_CLASS}>
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan Password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`${INPUT_CLASS} pr-14`}
            />
            <PasswordToggle
              shown={showPass}
              onToggle={() => setShowPass(!showPass)}
              label="password"
            />
          </div>
        </div>

        <label className="flex w-fit items-center gap-2.5 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 accent-[#C94F78] cursor-pointer"
          />
          <span className="text-[14px] font-medium text-[#2D2926] group-hover:text-[#A83960] transition-colors">
            Ingatkan Saya
          </span>
        </label>

        <AuthError message={error} />

        <AuthActions
          loading={loading}
          submitLabel="Masuk Sekarang"
          href="/register"
          prompt="Belum ada akun?"
          linkLabel="Daftar dulu"
        />
      </form>

      <div className="mt-8 p-4 rounded-2xl flex items-start gap-3 bg-[#FBF7ED] border border-[#EADFB8]">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#9A7B22]" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed text-[#6B5512]">
          Silakan mendaftar secara online melalui link pendaftaran di atas, atau minta dibuatkan
          akun oleh kasir/admin di klinik.
        </p>
      </div>
    </AuthShell>
  );
}
