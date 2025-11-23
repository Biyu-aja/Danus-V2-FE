// src/utils/parseJson.ts

export type ParseJsonOptions<K extends PropertyKey = string> = {
  keep?: K[];
};

// Overload 1: tanpa keep → kembalikan tipe penuh T (default unknown)
export function parseJson<T = unknown>(data: string): T;

// Overload 2: dengan keep → kembalikan Pick<T, K>
export function parseJson<T extends Record<PropertyKey, any>, K extends keyof T = keyof T>(
  data: string,
  options: ParseJsonOptions<K>
): Pick<T, K>;

// Implementasi
export function parseJson(
  data: string,
  { keep = [] }: ParseJsonOptions = {}
): unknown {
  const json: unknown = JSON.parse(data);

  if (!keep.length) return json;

  // Saat keep ada, asumsikan json adalah object (sesuai kontrak overload ke-2)
  const obj = json as Record<PropertyKey, unknown>;

  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => keep.includes(key))
  );
}
