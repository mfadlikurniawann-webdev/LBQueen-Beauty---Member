"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthActions } from "@/components/auth/AuthActions";
import { AuthError } from "@/components/auth/AuthError";
import { AuthShell } from "@/components/auth/AuthShell";
import { INPUT_CLASS, LABEL_CLASS } from "@/components/auth/auth-styles";
import { useCustomer } from "@/context/CustomerContext";
import { PasswordToggle } from "@/components/PasswordToggle";

const REQUIRED = <span className="text-[#A83960]">*</span>;
const OPTIONAL = <span className="normal-case tracking-normal font-medium">(Opsional)</span>;

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { customer } = useCustomer();
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
    if (customer) router.replace("/");
  }, [customer, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
        name,
        username,
        phone,
        nik,
        address,
        passwordPlain,
        website: form.website,
      });

      if (res.error) {
        throw new Error(res.error);
      }

      localStorage.setItem("lbqueen_customer", JSON.stringify(res.data));
      router.push("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <AuthShell
      title="Daftar Akun"
      subtitle="PT. LBQueen Care Beauty"
      footer="Care & Beauty Clinic"
      bodyClassName="overflow-y-auto"
      contentClassName="w-full max-w-[440px] my-auto"
    >
      <p className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3 text-[#9A7B22]">
        Pendaftaran Online
      </p>
      <h2 className="text-[28px] font-bold! text-[#2D2926] tracking-tight leading-tight mb-2">
        Buat Akun Baru
      </h2>
      <p className="text-[14px] text-[#766B68] mb-8 leading-relaxed">
        {"Lengkapi data di bawah untuk bergabung sebagai "}
        <span className="font-semibold text-[#A83960]">Pelanggan</span>
      </p>

      <form onSubmit={handleRegister} className="space-y-5">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          {...field("website")}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
        <p className="text-[12px] text-[#766B68]">
          Kolom bertanda <span className="font-bold text-[#A83960]">*</span> wajib diisi.
        </p>
        <div>
          <label htmlFor="reg-name" className={LABEL_CLASS}>
            Nama Lengkap {REQUIRED}
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            placeholder="Masukkan nama lengkap Anda"
            required
            {...field("name")}
            className={INPUT_CLASS}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
          <div>
            <label htmlFor="reg-username" className={LABEL_CLASS}>
              Username {REQUIRED}
            </label>
            <input
              id="reg-username"
              type="text"
              autoComplete="username"
              placeholder="Username"
              required
              {...field("username")}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="reg-phone" className={LABEL_CLASS}>
              Nomor HP / WhatsApp {REQUIRED}
            </label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              placeholder="Contoh: 08123456789"
              required
              {...field("phone")}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
          <div>
            <label htmlFor="reg-nik" className={LABEL_CLASS}>
              NIK {OPTIONAL}
            </label>
            <input
              id="reg-nik"
              type="text"
              inputMode="numeric"
              placeholder="Nomor Induk Kependudukan"
              {...field("nik")}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="reg-password" className={LABEL_CLASS}>
              Password {REQUIRED}
            </label>
            <div className="relative">
              <input
                id="reg-password"
                autoComplete="new-password"
                minLength={8}
                type={showPass ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                required
                {...field("password")}
                className={`${INPUT_CLASS} pr-14`}
              />
              <PasswordToggle
                shown={showPass}
                onToggle={() => setShowPass(!showPass)}
                label="password"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="reg-address" className={LABEL_CLASS}>
            Alamat Lengkap {OPTIONAL}
          </label>
          <textarea
            id="reg-address"
            autoComplete="street-address"
            placeholder="Masukkan alamat lengkap Anda..."
            rows={2}
            {...field("address")}
            className={`${INPUT_CLASS} resize-none`}
          />
        </div>

        <AuthError message={error} />

        <AuthActions
          loading={loading}
          submitLabel="Daftar Sekarang"
          href="/login"
          prompt="Sudah punya akun?"
          linkLabel="Masuk"
        />
      </form>
    </AuthShell>
  );
}
