export type ThemeMode = "light" | "dark" | "system";

/** Hanya preferensi tampilan yang disimpan di perangkat (bukan data akun). */
export const THEME_KEY = "lbq-theme";
const BAR_COLOR = { light: "#C94F78", dark: "#120C10" };
const QUERY = "(prefers-color-scheme: dark)";

/**
 * Dijalankan inline di <head> sebelum halaman digambar agar tidak ada kilatan tema terang.
 * CSP mengizinkan skrip inline; kegagalan localStorage (mode privat) jatuh ke tema sistem.
 */
export const THEME_SCRIPT = `(function(){try{var d=document.documentElement,m=localStorage.getItem("${THEME_KEY}"),k=m==="dark"||(m!=="light"&&window.matchMedia("${QUERY}").matches);d.classList.toggle("dark",k);var t=document.querySelector('meta[name="theme-color"]');if(!t){t=document.createElement("meta");t.name="theme-color";document.head.appendChild(t)}t.content=k?"${BAR_COLOR.dark}":"${BAR_COLOR.light}"}catch(e){}})()`;

export function readThemeMode(): ThemeMode {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(mode: ThemeMode = readThemeMode()) {
  const root = document.documentElement;
  const dark = mode === "dark" || (mode === "system" && window.matchMedia(QUERY).matches);
  // Matikan transisi sesaat agar seluruh permukaan berganti serentak, tanpa efek memudar bertahap.
  root.classList.add("lbq-theme-switch");
  root.classList.toggle("dark", dark);
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => (meta.content = dark ? BAR_COLOR.dark : BAR_COLOR.light));
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.classList.remove("lbq-theme-switch")),
  );
}

const listeners = new Set<() => void>();

export function setThemeMode(mode: ThemeMode) {
  try {
    if (mode === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, mode);
  } catch {}
  applyTheme(mode);
  listeners.forEach((listener) => listener());
}

/** Berlangganan perubahan preferensi: pilihan di tab lain dan perubahan tema sistem. */
export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  const media = window.matchMedia(QUERY);
  const onSystem = () => {
    if (readThemeMode() === "system") applyTheme("system");
    listener();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY && event.key !== null) return;
    applyTheme();
    listener();
  };
  media.addEventListener("change", onSystem);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onStorage);
  };
}
