export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="px-4 py-3 rounded-[18px] text-[13px] font-medium bg-rose-50/85 text-rose-700 border border-white shadow-[0_0_0_1px_rgba(225,29,72,0.2)]"
    >
      {message}
    </div>
  );
}
