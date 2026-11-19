"use client";

import { loginCustomer } from "@/app/actions/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthActions } from "@/components/auth/AuthActions";
import { AuthError } from "@/components/auth/AuthError";
import { AuthShell } from "@/components/auth/AuthShell";
import { INPUT_CLASS, LABEL_CLASS } from "@/components/auth/auth-styles";
import { useCustomer } from "@/context/CustomerContext";
import { PasswordToggle } from "@/components/PasswordToggle";
import { errorMessage } from "@/lib/stale-deploy";

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
      setError(errorMessage(err, "Gagal masuk. Coba lagi."));
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
      <h1 className="text-[28px] font-extrabold! text-[#2D2926] tracking-tight leading-tight">
        Masuk
      </h1>
      <p className="text-[15px] text-[#766B68] mt-1.5 mb-7">Pakai username atau nomor HP Anda.</p>

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
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={100}
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
          submitLabel="Masuk"
          href="/register"
          prompt="Belum ada akun?"
          linkLabel="Daftar dulu"
        />
      </form>
    </AuthShell>
  );
}
