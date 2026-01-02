import API_BASE_URL from '../config/api.config';
import type { Barang, StokHarian, CreateBarangRequest, CreateStokRequest, ApiResponse } from '../types/barang.types';

// Re-export types untuk kemudahan import
export type { Barang, StokHarian, CreateBarangRequest, CreateStokRequest, ApiResponse };

/**
 * Barang Service - Handle semua operasi CRUD Barang
 */
export const barangService = {
    /**
     * Get all barang
     */
    async getAllBarang(): Promise<ApiResponse<Barang[]>> {
        try {
            const response = await fetch(`${API_BASE_URL}/barang`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mendapatkan data barang',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mendapatkan data barang',
                data: data.data,
            };
        } catch (error) {
            console.error('Get barang error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Create barang baru
     */
    async createBarang(request: CreateBarangRequest): Promise<ApiResponse<Barang>> {
        try {
            const response = await fetch(`${API_BASE_URL}/barang`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal menambahkan barang',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil menambahkan barang',
                data: data.data,
            };
        } catch (error) {
            console.error('Create barang error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Update barang
     */
    async updateBarang(id: number, request: Partial<CreateBarangRequest>): Promise<ApiResponse<Barang>> {
        try {
            const response = await fetch(`${API_BASE_URL}/barang/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mengupdate barang',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mengupdate barang',
                data: data.data,
            };
        } catch (error) {
            console.error('Update barang error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Delete barang
     */
    async deleteBarang(id: number): Promise<ApiResponse<null>> {
        try {
            const response = await fetch(`${API_BASE_URL}/barang/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal menghapus barang',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil menghapus barang',
            };
        } catch (error) {
            console.error('Delete barang error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },
};

/**
 * Stok Service - Handle semua operasi CRUD Stok
 */
export const stokService = {
    /**
     * Create stok harian baru
     */
    async createStok(request: CreateStokRequest): Promise<ApiResponse<StokHarian>> {
        try {
            const response = await fetch(`${API_BASE_URL}/stok`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal menambahkan stok',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil menambahkan stok',
                data: data.data,
            };
        } catch (error) {
            console.error('Create stok error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Get stok hari ini
     */
    async getStokHariIni(): Promise<ApiResponse<StokHarian[]>> {
        try {
            const response = await fetch(`${API_BASE_URL}/stok/hari-ini`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mendapatkan stok hari ini',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mendapatkan stok hari ini',
                data: data.data,
            };
        } catch (error) {
            console.error('Get stok hari ini error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },
};

export default { barangService, stokService };
