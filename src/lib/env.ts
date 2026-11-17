// Dashboard imports can retain surrounding quotes as part of an env value.
// Normalize formatting only; never substitute credentials or project addresses.
export function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim() || "";
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  )
    return trimmed.slice(1, -1).trim();
  return trimmed;
}
