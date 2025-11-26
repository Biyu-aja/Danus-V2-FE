// src/utils/type.ts
import moment, { type MomentInput } from 'moment';

export function isInteger(value: unknown): value is string {
  // mengikuti implementasi asli: hanya string berupa digit non-negatif
  return typeof value === 'string' && /^\d+$/.test(value);
}

export function isBoolean(value: unknown): value is 'true' | 'false' {
  return value === 'true' || value === 'false';
}

export function isDateAble(value: MomentInput): boolean {
  // sama seperti kode asli (longgar); gunakan parse ketat bila perlu
  return moment(value).isValid();
  // alternatif ketat ISO: moment(value, moment.ISO_8601, true).isValid()
}

export function isObject(
  variable: unknown
): variable is Record<string | number | symbol, unknown> {
  return typeof variable === 'object' && variable !== null;
}

export function parseString(
  val: string | null | undefined
): string | number | boolean | null {
  if (val === null) return null;
  if (val === undefined) return '';
  if (val === 'null') return null;
  if (val === 'true' || val === 'false') return val === 'true';
  if (!Number.isNaN(Number(val))) return Number(val);
  return String(val);
}

export function isUUID(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  // Pola UUID v1–v5 (versi= [1-5], varian= [89ab])
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}
