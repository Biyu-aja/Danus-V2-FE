// src/utils/number.ts

export type FormatMoneyOptions = {
  locale?: string;         // default: 'id-ID'
  currency?: string;       // default: 'IDR'
  shorten?: boolean;       // default: false
};

export const formatMoney = (
  number: number | null | undefined,
  { locale = 'id-ID', currency = 'IDR', shorten = false }: FormatMoneyOptions = {}
): string => {
  if (!number) return 'Rp 0';

  let formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(number);

  // Hilangkan ,00 (umum di id-ID saat minimumFractionDigits=0 sebenarnya sudah tanpa ,00,
  // namun tetap jaga kalau locale lain dipakai)
  if (formatted.includes(',')) {
    formatted = formatted.replace(/,00$/, '');
  }

  if (shorten) {
    const abs = Math.abs(number);
    if (abs >= 1_000_000_000_000) {
      // Triliun
      const v = (number / 1_000_000_000_000).toFixed(2).replace(/\.0+$/, '');
      formatted = `Rp ${v}T`;
    } else if (abs >= 1_000_000_000) {
      // Miliar
      const v = (number / 1_000_000_000).toFixed(2).replace(/\.0+$/, '');
      formatted = `Rp ${v}M`;
    } else if (abs >= 1_000_000) {
      // Juta
      const v = (number / 1_000_000).toFixed(2).replace(/\.0+$/, '');
      formatted = `Rp ${v}jt`;
    } else if (abs >= 1_000) {
      // Ribu
      const v = (number / 1_000).toFixed(0);
      formatted = `Rp ${v}rb`;
    }
  }

  return formatted;
};

// ------------------------------------------------------------------

export const numberToWords = (n: number): string => {
  // Pastikan integer dan non-negatif (untuk negatif bisa tambahkan "minus ")
  if (!Number.isFinite(n)) return '';
  if (n === 0) return 'nol';

  const negative = n < 0;
  n = Math.abs(Math.trunc(n));

  const satuan = [
    '',
    'satu',
    'dua',
    'tiga',
    'empat',
    'lima',
    'enam',
    'tujuh',
    'delapan',
    'sembilan',
  ] as const;

  const belasan = [
    'sepuluh',
    'sebelas',
    'dua belas',
    'tiga belas',
    'empat belas',
    'lima belas',
    'enam belas',
    'tujuh belas',
    'delapan belas',
    'sembilan belas',
  ] as const;

  const puluhan = [
    '',
    '',
    'dua puluh',
    'tiga puluh',
    'empat puluh',
    'lima puluh',
    'enam puluh',
    'tujuh puluh',
    'delapan puluh',
    'sembilan puluh',
  ] as const;

  const ribuan = ['', 'ribu', 'juta', 'miliar', 'triliun'] as const;

  function convert(x: number): string {
    if (x === 0) return '';
    if (x < 10) return satuan[x];
    if (x < 20) return belasan[x - 10];
    if (x < 100) {
      return puluhan[Math.floor(x / 10)] + (x % 10 !== 0 ? ' ' + satuan[x % 10] : '');
    }
    if (x < 200) {
      return 'seratus' + (x % 100 !== 0 ? ' ' + convert(x % 100) : '');
    }
    if (x < 1000) {
      return (
        satuan[Math.floor(x / 100)] +
        ' ratus' +
        (x % 100 !== 0 ? ' ' + convert(x % 100) : '')
      );
    }
    // 1000 ke atas: kelompok per 1000
    for (let i = 1; i < ribuan.length; i++) {
      const unit = 1000 ** i;
      if (x < unit * 1000) {
        const head = Math.floor(x / unit);
        const tail = x % unit;

        const headStr =
          head === 1 && i === 1
            ? 'seribu'
            : convert(head) + (ribuan[i] ? ' ' + ribuan[i] : '');

        return headStr + (tail !== 0 ? ' ' + convert(tail) : '');
      }
    }
    // Di atas triliun: fallback sederhana (tambah satuan "triliun" berulang)
    // Bisa ditingkatkan dengan menambah satuan "kuadriliun" dst bila diperlukan.
    return String(x);
  }

  const words = convert(n).trim();
  return negative ? `minus ${words}` : words;
};

// ------------------------------------------------------------------

export const toSlug = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD') // pecah aksen
    .replace(/[\u0300-\u036f]/g, '') // buang diakritik
    .replace(/[^a-z0-9]+/g, '-') // non-alfanumerik → '-'
    .replace(/^-+|-+$/g, ''); // trim '-'
};
