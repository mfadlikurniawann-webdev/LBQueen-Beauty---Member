export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="px-4 py-3 rounded-2xl text-[13px] font-medium bg-rose-50 text-rose-700 border border-rose-200"
    >
      {message}
    </div>
  );
}
