export function AuthError({ message, id }: { message: string; id?: string }) {
  if (!message) return null;
  return (
    <div
      id={id}
      role="alert"
      className="px-4 py-3 rounded-[18px] text-[13px] font-medium bg-danger-soft/85 text-danger border border-edge shadow-[0_0_0_1px_rgba(225,29,72,0.2)]"
    >
      {message}
    </div>
  );
}
