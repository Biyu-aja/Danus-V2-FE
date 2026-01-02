import { useState, useEffect, useCallback } from 'react';
import { keuanganService } from '../services/keuangan.service';
import type { Saldo, LaporanHarian } from '../types/keuangan.types';

/**
 * Custom hook untuk fetch saldo
 */
export const useSaldo = () => {
    const [saldo, setSaldo] = useState<Saldo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSaldo = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await keuanganService.getSaldo();
            setSaldo(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSaldo();
    }, [fetchSaldo]);

    return {
        saldo,
        isLoading,
        error,
        refetch: fetchSaldo,
    };
};

/**
 * Custom hook untuk fetch laporan harian
 */
export const useLaporanHarian = (tanggal?: string) => {
    const [laporan, setLaporan] = useState<LaporanHarian | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLaporan = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await keuanganService.getLaporanHarian(tanggal);
            setLaporan(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    }, [tanggal]);

    useEffect(() => {
        fetchLaporan();
    }, [fetchLaporan]);

    return {
        laporan,
        isLoading,
        error,
        refetch: fetchLaporan,
    };
};
