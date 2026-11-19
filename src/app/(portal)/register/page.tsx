"use client";

import { registerCustomer } from "@/app/actions/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthActions } from "@/components/auth/AuthActions";
import { AuthError } from "@/components/auth/AuthError";
import { AuthShell } from "@/components/auth/AuthShell";
import { INPUT_CLASS, LABEL_CLASS } from "@/components/auth/auth-styles";
import { useCustomer } from "@/context/CustomerContext";
import { PasswordToggle } from "@/components/PasswordToggle";
import { nikError, passwordError, phoneError, usernameError } from "@/lib/validation";
import { errorMessage } from "@/lib/stale-deploy";

const REQUIRED = <span className="text-[#A83960]">*</span>;
const OPTIONAL = <span className="normal-case tracking-normal font-medium">(Opsional)</span>;

function FieldHint({ id, error, hint }: { id: string; error?: string | null; hint?: string }) {
  if (error)
    return (
      <p
        id={id}
        role="alert"
        className="mt-1.5 text-[12px] font-semibold text-red-600 leading-snug"
      >
        {error}
      </p>
    );
  return hint ? <p className="mt-1.5 text-[12px] text-[#766B68] leading-snug">{hint}</p> : null;
}

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
    const username = form.username.trim();
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
      setError(errorMessage(err, "Pendaftaran gagal. Coba lagi."));
    } finally {
      setLoading(false);
    }
  };

  const errors = {
    username: form.username ? usernameError(form.username) : null,
    phone: form.phone ? phoneError(form.phone) : null,
    nik: form.nik ? nikError(form.nik) : null,
    password: form.password ? passwordError(form.password, true) : null,
  };
  const invalid = (message: string | null, id: string) =>
    message ? { "aria-invalid": true, "aria-describedby": id } : {};

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
      <h1 className="text-[28px] font-extrabold! text-[#2D2926] tracking-tight leading-tight">
        Daftar akun
      </h1>
      <p className="text-[15px] text-[#766B68] mt-1.5 mb-7">Isi data di bawah untuk mulai pesan.</p>

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
              placeholder="cth: sitiaminah"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={50}
              required
              {...field("username")}
              {...invalid(errors.username, "reg-username-error")}
              className={INPUT_CLASS}
            />
            <FieldHint
              id="reg-username-error"
              error={errors.username}
              hint="Huruf kecil, angka, atau _ tanpa spasi."
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
              {...invalid(errors.phone, "reg-phone-error")}
              className={INPUT_CLASS}
            />
            <FieldHint id="reg-phone-error" error={errors.phone} />
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
              placeholder="16 digit sesuai KTP"
              maxLength={16}
              {...field("nik")}
              {...invalid(errors.nik, "reg-nik-error")}
              className={INPUT_CLASS}
            />
            <FieldHint id="reg-nik-error" error={errors.nik} />
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
                maxLength={128}
                required
                {...field("password")}
                {...invalid(errors.password, "reg-password-error")}
                className={`${INPUT_CLASS} pr-14`}
              />
              <PasswordToggle
                shown={showPass}
                onToggle={() => setShowPass(!showPass)}
                label="password"
              />
            </div>
            <FieldHint id="reg-password-error" error={errors.password} />
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
