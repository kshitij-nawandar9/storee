/** localStorage that never throws (private mode, blocked storage, etc.). */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage unavailable: the game still works, the best score just isn't kept.
    }
  },
};
