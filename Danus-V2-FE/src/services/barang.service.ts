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
     * Get all barang termasuk yang sudah dihapus (untuk filter histori)
     */
    async getAllBarangWithDeleted(): Promise<ApiResponse<Barang[]>> {
        try {
            const response = await fetch(`${API_BASE_URL}/barang/with-deleted`, {
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
            console.error('Get barang with deleted error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Get barang by ID dengan statistik lengkap
     */
    async getBarangById(id: number): Promise<ApiResponse<Barang>> {
        try {
            const response = await fetch(`${API_BASE_URL}/barang/${id}`, {
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
            console.error('Get barang by id error:', error);
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

    /**
     * Restore barang yang sudah dihapus
     */
    async restoreBarang(id: number): Promise<ApiResponse<Barang>> {
        try {
            const response = await fetch(`${API_BASE_URL}/barang/${id}/restore`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mengembalikan barang',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mengembalikan barang',
                data: data.data,
            };
        } catch (error) {
            console.error('Restore barang error:', error);
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

    /**
     * Get histori stok dengan filter
     */
    async getHistoriStok(filters?: {
        startDate?: string;
        endDate?: string;
        barangId?: number;
        page?: number;
        limit?: number;
    }): Promise<ApiResponse<StokHarian[]> & { pagination?: { page: number; limit: number; total: number } }> {
        try {
            const params = new URLSearchParams();
            if (filters?.startDate) params.append('startDate', filters.startDate);
            if (filters?.endDate) params.append('endDate', filters.endDate);
            if (filters?.barangId) params.append('barangId', String(filters.barangId));
            if (filters?.page) params.append('page', String(filters.page));
            if (filters?.limit) params.append('limit', String(filters.limit));

            const url = `${API_BASE_URL}/stok/histori${params.toString() ? `?${params.toString()}` : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mendapatkan histori stok',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mendapatkan histori stok',
                data: data.data,
                pagination: data.pagination,
            };
        } catch (error) {
            console.error('Get histori stok error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Update stok harian
     */
    async updateStok(id: number, data: {
        harga?: number;
        stok?: number;
        modal?: number;
        keterangan?: string;
    }): Promise<ApiResponse<StokHarian>> {
        try {
            const response = await fetch(`${API_BASE_URL}/stok/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const resData = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: resData.message || 'Gagal mengupdate stok',
                };
            }

            return {
                success: true,
                message: resData.message || 'Berhasil mengupdate stok',
                data: resData.data,
            };
        } catch (error) {
            console.error('Update stok error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Delete stok harian
     */
    async deleteStok(id: number): Promise<ApiResponse<{ refundedModal: number }>> {
        try {
            const response = await fetch(`${API_BASE_URL}/stok/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const resData = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: resData.message || 'Gagal menghapus stok',
                };
            }

            return {
                success: true,
                message: resData.message || 'Berhasil menghapus stok',
                data: resData.data,
            };
        } catch (error) {
            console.error('Delete stok error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Get stok detail with users
     */
    async getStokDetail(id: number): Promise<ApiResponse<StokHarian & { users: any[] }>> {
        try {
            const response = await fetch(`${API_BASE_URL}/stok/${id}/detail`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const resData = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: resData.message || 'Gagal mendapatkan detail stok',
                };
            }

            return {
                success: true,
                message: resData.message || 'Berhasil mendapatkan detail stok',
                data: resData.data,
            };
        } catch (error) {
            console.error('Get stok detail error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },
};

export default { barangService, stokService };
