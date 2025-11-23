import moment, { type Moment, type MomentInput } from 'moment';
import 'moment/locale/id';

/**
 * Menghasilkan array tanggal harian (UTC) dari start s/d end (inklusif).
 */
export const genDates = (startDate: MomentInput, endDate: MomentInput): Moment[] => {
  const start = moment.utc(startDate).startOf('day');
  const end = moment.utc(endDate).startOf('day');

  const dates: Moment[] = [];
  while (start.isSameOrBefore(end)) {
    dates.push(start.clone());
    start.add(1, 'day');
  }
  return dates;
};

type FormatTimeOptions = {
  fb?: string;   // fallback bila time falsy
  locale?: string;
};

/**
 * Memformat waktu dengan locale (default 'id').
 */
export const formatTime = (
  time: MomentInput | null | undefined,
  format: string,
  opts: FormatTimeOptions = { fb: '', locale: 'id' }
): string => {
  if (!time) return opts.fb ?? '';
  const locale = opts.locale ?? 'id';
  return moment(time).locale(locale).format(format);
};
