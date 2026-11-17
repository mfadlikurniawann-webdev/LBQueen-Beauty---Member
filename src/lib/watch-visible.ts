export function watchWhileVisible(callback: () => void | Promise<unknown>, interval = 60000) {
  let running = false;
  let disposed = false;
  let lastRefresh = Date.now();
  const refresh = async () => {
    if (document.hidden || running || disposed || Date.now() - lastRefresh < interval) return;
    lastRefresh = Date.now();
    running = true;
    try { await callback(); } catch {} finally { running = false; }
  };
  const timer = window.setInterval(refresh, interval);
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refresh);
  return () => { disposed = true; clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
}
