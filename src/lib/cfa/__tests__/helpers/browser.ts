/**
 * Installs a minimal `window` so the local-first store can run outside a browser.
 * Import this before any code that reads `localStorage`.
 */
const memory = new Map<string, string>();

export const browserStorage = {
  read(key: string) {
    return memory.get(key) ?? null;
  },
  write(key: string, value: string) {
    memory.set(key, value);
  },
  clear() {
    memory.clear();
  },
};

(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  },
  addEventListener: () => {},
  removeEventListener: () => {},
};

export {};
