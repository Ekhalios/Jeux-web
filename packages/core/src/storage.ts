/**
 * Accès localStorage protégé : tout échec (mode privé, quota, sandbox) est absorbé
 * et la valeur vit alors en mémoire pour la durée de la session.
 */
export class SafeStorage {
  private readonly memory = new Map<string, string>();

  constructor(private readonly prefix: string) {}

  getNumber(key: string, fallback = 0): number {
    const raw = this.getRaw(key);
    if (raw === null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }

  setNumber(key: string, value: number): void {
    this.setRaw(key, String(value));
  }

  getBoolean(key: string, fallback = false): boolean {
    const raw = this.getRaw(key);
    if (raw === null) return fallback;
    return raw === '1';
  }

  setBoolean(key: string, value: boolean): void {
    this.setRaw(key, value ? '1' : '0');
  }

  private fullKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  private getRaw(key: string): string | null {
    const k = this.fullKey(key);
    try {
      const v = globalThis.localStorage?.getItem(k);
      if (v !== null && v !== undefined) return v;
    } catch {
      /* ignoré */
    }
    return this.memory.get(k) ?? null;
  }

  private setRaw(key: string, value: string): void {
    const k = this.fullKey(key);
    this.memory.set(k, value);
    try {
      globalThis.localStorage?.setItem(k, value);
    } catch {
      /* ignoré */
    }
  }
}
