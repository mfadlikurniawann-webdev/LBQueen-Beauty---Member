const STALE_PATTERN =
  /Loading chunk|ChunkLoadError|Loading CSS chunk|Failed to fetch dynamically imported module|Importing a module script failed|Failed to find Server Action|Server Action .* was not found/i;
const RELOAD_KEY = "lbqueen_version_reload_at";

export function isStaleDeployError(error: unknown) {
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : String((error as { message?: string })?.message ?? error);
  return STALE_PATTERN.test(message);
}

export function reloadForNewVersion() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 30000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {}
  window.location.reload();
  return true;
}

export function errorMessage(error: unknown, fallback: string) {
  if (isStaleDeployError(error))
    return reloadForNewVersion()
      ? "Memuat versi terbaru aplikasi..."
      : "Aplikasi baru saja diperbarui. Muat ulang halaman, lalu coba lagi.";
  return error instanceof Error && error.message ? error.message : fallback;
}

export function watchStaleDeploy() {
  const handle = (reason: unknown) => {
    if (isStaleDeployError(reason)) reloadForNewVersion();
  };
  const onError = (event: ErrorEvent) => handle(event.error ?? event.message);
  const onRejection = (event: PromiseRejectionEvent) => handle(event.reason);
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}
