import { isObject } from './type.js';

// bantu TS mengenali type guard (karena sumber masih .js)
const isObj = isObject as (v: unknown) => v is Record<string | number | symbol, unknown>;

// --- Overloads ---
// 1) Array objek: perlu key
export function filterDuplicate<T extends object, K extends keyof T>(
  arr: T[],
  key: K
): T[];

// 2) Array primitif: tanpa key
export function filterDuplicate<T extends string | number | boolean | symbol>(
  arr: T[]
): T[];

// --- Implementasi ---
export function filterDuplicate(
  arr: unknown[] = [],
  key?: string | number | symbol
): unknown[] {
  if (arr.length === 0) return [];

  // Deteksi mode berdasarkan elemen pertama
  const first = arr[0];

  // Mode objek
  if (isObj(first)) {
    if (key === undefined) {
      throw new Error('`key` wajib diisi untuk array objek.');
    }

    const seen = new Set<unknown>();
    return arr.filter((item) => {
      if (!isObj(item)) return false; // jaga-jaga kalau array campur
      const val = (item as Record<string | number | symbol, unknown>)[key];
      const sig = val; // bisa diubah ke JSON.stringify jika perlu deep signature
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
  }

  // Mode primitif
  const seen = new Set<unknown>();
  return arr.filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

export default filterDuplicate;
