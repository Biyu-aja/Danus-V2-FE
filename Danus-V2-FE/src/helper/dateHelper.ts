/**
 * Format tanggal untuk input date HTML (YYYY-MM-DD)
 * Menggunakan waktu lokal, bukan UTC
 */
export const getLocalDateString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Convert date string (YYYY-MM-DD) ke ISO string dengan timezone lokal
 * Menghindari shift timezone saat convert ke ISO
 */
export const localDateToISO = (dateString: string): string => {
    // Parse the date string and set to noon local time to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0); // Set to noon
    return date.toISOString();
};

/**
 * Get start of day in local timezone
 */
export const getStartOfLocalDay = (date: Date = new Date()): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

/**
 * Get end of day in local timezone
 */
export const getEndOfLocalDay = (date: Date = new Date()): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};
