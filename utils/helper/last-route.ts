const KEY = "ims:last-route";

export const lastRoute = {
  save(path: string) {
    try {
      if (path.startsWith("/login")) return;
      localStorage.setItem(KEY, path);
    } catch {}
  },
  get(): string | null {
    try {
      const path = localStorage.getItem(KEY);
      // only allow internal paths (prevents open-redirect issues)
      if (path && path.startsWith("/") && !path.startsWith("//")) return path;
      return null;
    } catch {
      return null;
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {}
  },
};