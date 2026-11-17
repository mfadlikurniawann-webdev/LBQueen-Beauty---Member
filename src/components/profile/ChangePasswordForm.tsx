import { useState } from "react";
import { CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";
import { updateCustomerPassword } from "@/app/actions/auth";
import { PasswordToggle } from "@/components/PasswordToggle";
import { PRIMARY_GRADIENT } from "@/lib/constants";
import { cn } from "@/lib/utils";

const INPUT_CLASS = cn(
  "w-full min-h-12 px-4 py-3 bg-[#FDFAFB] border border-[#E8D5DB] rounded-2xl text-base sm:text-[14px]",
  "text-[#2D2926] outline-none focus:border-[#C94F78] focus:bg-white focus:ring-4 focus:ring-[#C94F78]/10",
  "transition-all",
);
const LABEL_CLASS =
  "block text-[12px] font-bold text-[#766B68] uppercase tracking-[0.08em] mb-2 ml-1";
const NOTICE = "mb-5 px-4 py-3 text-[13px] font-semibold rounded-2xl border";

export function ChangePasswordForm({ customerId }: { customerId?: number }) {
  const [loading, setLoading] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passForm, setPassForm] = useState({ old: "", new: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!customerId) return;
    if (!passForm.new) {
      setError("Password baru wajib diisi.");
      return;
    }
    if (passForm.new !== passForm.confirm) {
      setError("Konfirmasi tidak cocok.");
      return;
    }
    setLoading(true);
    try {
      const result = await updateCustomerPassword(passForm.old, passForm.new);
      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess("Password berhasil diperbarui!");
      setPassForm({ old: "", new: "", confirm: "" });
    } catch (err) {
      console.error(err);
      setError("Gagal memperbarui password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-5 sm:p-8 shadow-xl shadow-rose-100/30 border border-[#EEDFE3]">
      <div className="flex items-center gap-4 mb-6">
        <div
          className={cn(
            "w-12 h-12 shrink-0 rounded-2xl bg-[#FDF2F5] flex items-center justify-center",
            "text-[#C94F78] border border-[#F6DDE6]",
          )}
        >
          <Lock className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[16px] font-bold! text-[#2D2926]">Keamanan Akun</h3>
          <p className="text-[13px] text-[#766B68]">Perbarui password Anda secara berkala</p>
        </div>
      </div>

      {error && (
        <div role="alert" className={`${NOTICE} bg-rose-50 text-rose-700 border-rose-200`}>
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          className={`${NOTICE} bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-2`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          {success}
        </div>
      )}

      <form onSubmit={handleUpdatePassword} className="space-y-5">
        <div>
          <label htmlFor="old-password" className={LABEL_CLASS}>
            Password Lama
          </label>
          <div className="relative">
            <input
              id="old-password"
              autoComplete="current-password"
              type={showOldPass ? "text" : "password"}
              required
              value={passForm.old}
              onChange={(e) => setPassForm((p) => ({ ...p, old: e.target.value }))}
              className={`${INPUT_CLASS} pr-14`}
            />
            <PasswordToggle
              shown={showOldPass}
              onToggle={() => setShowOldPass(!showOldPass)}
              label="password lama"
            />
          </div>
        </div>

        <div>
          <label htmlFor="new-password" className={LABEL_CLASS}>
            Password Baru
          </label>
          <div className="relative">
            <input
              id="new-password"
              autoComplete="new-password"
              aria-describedby="new-password-hint"
              type={showNewPass ? "text" : "password"}
              required
              value={passForm.new}
              onChange={(e) => setPassForm((p) => ({ ...p, new: e.target.value }))}
              className={`${INPUT_CLASS} pr-14`}
            />
            <PasswordToggle
              shown={showNewPass}
              onToggle={() => setShowNewPass(!showNewPass)}
              label="password baru"
            />
          </div>
          <p id="new-password-hint" className="text-[12px] text-[#766B68] mt-2 ml-1">
            Gunakan minimal 6 karakter kombinasi huruf & angka.
          </p>
        </div>

        <div>
          <label htmlFor="confirm-password" className={LABEL_CLASS}>
            Konfirmasi Password Baru
          </label>
          <input
            id="confirm-password"
            autoComplete="new-password"
            type="password"
            required
            value={passForm.confirm}
            onChange={(e) => setPassForm((p) => ({ ...p, confirm: e.target.value }))}
            className={INPUT_CLASS}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full h-14 text-white rounded-2xl font-bold text-[15px] flex items-center justify-center gap-3",
            "hover:brightness-105 transition-all disabled:opacity-70 disabled:cursor-wait shadow-xl",
            "shadow-rose-100 active:scale-[0.98]",
          )}
          style={{ background: PRIMARY_GRADIENT }}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
          {loading ? "Memproses..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
