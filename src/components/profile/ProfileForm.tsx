import { useState } from "react";
import { Loader2 } from "lucide-react";
import { updateCustomerProfile } from "@/app/actions/profile";
import { useToast } from "@/components/Toast";
import type { Customer } from "@/lib/customer";
import { errorMessage } from "@/lib/stale-deploy";
import { nameError, phoneError, usernameError } from "@/lib/validation";

type Field = "name" | "phone" | "username" | "address";
const LABEL = "block text-[13px] font-semibold text-ink-3 mb-1";
const INPUT = "input-glass w-full h-12 px-4 text-[16px]";

export function ProfileForm({ customer, onSaved }: { customer: Customer; onSaved: () => Promise<unknown> }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: customer.name || "",
    phone: customer.phone || "",
    username: customer.username || "",
    address: customer.address || "",
  });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [serverError, setServerError] = useState<{ field?: Field; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const local: Record<Field, string | null> = {
    name: nameError(form.name),
    phone: phoneError(form.phone),
    username: usernameError(form.username),
    address: form.address.length > 500 ? "Alamat maksimal 500 karakter." : null,
  };
  const errorFor = (field: Field) =>
    (touched[field] && local[field]) || (serverError?.field === field ? serverError.message : null);
  const set = (field: Field, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setTouched((t) => ({ ...t, [field]: true }));
    if (serverError?.field === field) setServerError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, username: true, address: true });
    if (Object.values(local).some(Boolean)) return;
    setSaving(true);
    setServerError(null);
    try {
      const result = await updateCustomerProfile(form);
      if (result.error) {
        setServerError({ field: result.field, message: result.error });
        return;
      }
      await onSaved();
      toast("Profil disimpan.", "success");
    } catch (err) {
      setServerError({ message: errorMessage(err, "Profil belum tersimpan. Coba lagi.") });
    } finally {
      setSaving(false);
    }
  };

  const field = (key: Field, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => {
    const error = errorFor(key);
    return (
      <div>
        <label htmlFor={`profile-${key}`} className={LABEL}>
          {label}
        </label>
        <input
          id={`profile-${key}`}
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `profile-${key}-error` : undefined}
          className={INPUT}
          {...props}
        />
        {error && (
          <p id={`profile-${key}-error`} className="mt-1 text-[13px] font-semibold text-danger">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={submit} noValidate className="px-4 pb-4 pt-1 space-y-3">
      {field("name", "Nama", { autoComplete: "name", maxLength: 100 })}
      {field("phone", "Nomor HP", { inputMode: "tel", autoComplete: "tel", maxLength: 20 })}
      {field("username", "Username", {
        autoCapitalize: "none",
        autoCorrect: "off",
        spellCheck: false,
        maxLength: 50,
      })}
      <p className="text-[13px] text-ink-muted">Nomor HP dan username dipakai untuk masuk.</p>
      <div>
        <label htmlFor="profile-address" className={LABEL}>
          Alamat
        </label>
        <textarea
          id="profile-address"
          value={form.address}
          maxLength={500}
          rows={2}
          onChange={(e) => set("address", e.target.value)}
          aria-invalid={!!errorFor("address")}
          className="input-glass w-full px-4 py-3 text-[16px] rounded-[20px] resize-none"
        />
      </div>
      {serverError && !serverError.field && (
        <p role="alert" className="text-[13px] font-semibold text-danger">
          {serverError.message}
        </p>
      )}
      <button type="submit" disabled={saving} className="btn-primary w-full h-12 text-[15px]">
        {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        Simpan
      </button>
    </form>
  );
}
