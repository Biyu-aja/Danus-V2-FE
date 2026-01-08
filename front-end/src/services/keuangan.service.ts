import API_BASE_URL from '../config/api.config';
import type { Saldo, DetailKeuangan, LaporanHarian, LaporanBulanan } from '../types/keuangan.types';

/**
 * Keuangan Service - Handle semua operasi keuangan
 */
export const keuanganService = {
    /**
     * Get saldo terkini
     */
    async getSaldo(): Promise<Saldo> {
        try {
            const response = await fetch(`${API_BASE_URL}/keuangan/saldo`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            return data.data;
        } catch (error) {
            console.error('Error fetching saldo:', error);
            throw error;
        }
    },

    /**
     * Get histori transaksi
     */
    async getHistori(page = 1, limit = 20): Promise<{
        data: DetailKeuangan[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/keuangan/histori?page=${page}&limit=${limit}`
            );
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            return result;
        } catch (error) {
            console.error('Error fetching histori:', error);
            throw error;
        }
    },

    /**
     * Get histori transaksi berdasarkan bulan
     */
    async getHistoriByMonth(bulan?: string): Promise<DetailKeuangan[]> {
        try {
            const url = bulan
                ? `${API_BASE_URL}/keuangan/histori/bulanan?bulan=${bulan}`
                : `${API_BASE_URL}/keuangan/histori/bulanan`;

            const response = await fetch(url);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.data;
        } catch (error) {
            console.error('Error fetching histori bulanan:', error);
            throw error;
        }
    },

    /**
     * Create pengeluaran manual
     */
    async createPengeluaran(payload: {
        title: string;
        nominal: number;
        keterangan?: string;
    }): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/keuangan/pengeluaran`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            return data.data;
        } catch (error) {
            console.error('Error creating pengeluaran:', error);
            throw error;
        }
    },

    /**
     * Create pemasukan manual
     */
    async createPemasukan(payload: {
        title: string;
        nominal: number;
        keterangan?: string;
    }): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/keuangan/pemasukan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            return data.data;
        } catch (error) {
            console.error('Error creating pemasukan:', error);
            throw error;
        }
    },

    /**
     * Get laporan harian
     */
    async getLaporanHarian(tanggal?: string): Promise<LaporanHarian> {
        try {
            const url = tanggal
                ? `${API_BASE_URL}/keuangan/laporan/harian?tanggal=${tanggal}`
                : `${API_BASE_URL}/keuangan/laporan/harian`;

            const response = await fetch(url);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            return data.data;
        } catch (error) {
            console.error('Error fetching laporan harian:', error);
            throw error;
        }
    },

    /**
     * Get laporan bulanan
     */
    async getLaporanBulanan(bulan?: string): Promise<LaporanBulanan> {
        try {
            const url = bulan
                ? `${API_BASE_URL}/keuangan/laporan/bulanan?bulan=${bulan}`
                : `${API_BASE_URL}/keuangan/laporan/bulanan`;

            const response = await fetch(url);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            return data.data;
        } catch (error) {
            console.error('Error fetching laporan bulanan:', error);
            throw error;
        }
    },

    /**
     * Get detail keuangan by ID
     */
    async getDetailKeuanganById(id: number): Promise<DetailKeuangan | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/keuangan/${id}`);
            const data = await response.json();

            if (!data.success) {
                return null;
            }

            return data.data;
        } catch (error) {
            console.error('Error fetching detail keuangan:', error);
            return null;
        }
    },

    /**
     * Update detail keuangan
     */
    async updateDetailKeuangan(id: number, payload: {
        title?: string;
        nominal?: number;
        keterangan?: string;
    }): Promise<{ success: boolean; message: string; data?: DetailKeuangan }> {
        try {
            const response = await fetch(`${API_BASE_URL}/keuangan/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            return {
                success: data.success,
                message: data.message,
                data: data.data,
            };
        } catch (error) {
            console.error('Error updating detail keuangan:', error);
            return { success: false, message: 'Terjadi kesalahan jaringan' };
        }
    },

    /**
     * Delete detail keuangan
     */
    async deleteDetailKeuangan(id: number): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/keuangan/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            return {
                success: data.success,
                message: data.message,
            };
        } catch (error) {
            console.error('Error deleting detail keuangan:', error);
            return { success: false, message: 'Terjadi kesalahan jaringan' };
        }
    },
};

export default keuanganService;
