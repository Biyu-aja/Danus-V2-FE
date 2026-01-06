import API_BASE_URL from '../config/api.config';
import type { ApiResponse } from '../types/barang.types';

// Types untuk Ambil Barang
export interface AmbilBarangItem {
    stokHarianId: number;
    qty: number;
}

export interface CreateAmbilBarangRequest {
    userId: number;
    setorKepadaId: number;
    keterangan?: string;
    items: AmbilBarangItem[];
}

export interface DetailSetor {
    id: number;
    stokHarianId: number;
    qty: number;
    totalHarga: number;
    tanggalSetor?: string;
    stokHarian: {
        id: number;
        harga: number;
        stok: number;
        barang: {
            id: number;
            nama: string;
            gambar?: string;
        };
    };
}

export interface AmbilBarang {
    id: number;
    userId: number;
    setorKepadaId: number;
    status: 'BELUM_SETOR' | 'SUDAH_SETOR';
    keterangan?: string;
    tanggalAmbil: string;
    user: {
        id: number;
        nama_lengkap: string;
    };
    setorKepada: {
        id: number;
        nama_lengkap: string;
    };
    detailSetor: DetailSetor[];
}

/**
 * Ambil Barang Service
 */
export const ambilBarangService = {
    /**
     * Create ambil barang baru
     */
    async createAmbilBarang(request: CreateAmbilBarangRequest): Promise<ApiResponse<AmbilBarang>> {
        try {
            const response = await fetch(`${API_BASE_URL}/ambil-barang`, {
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
                    message: data.message || 'Gagal mengambil barang',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mengambil barang',
                data: data.data,
            };
        } catch (error) {
            console.error('Create ambil barang error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Get ambil barang by user ID
     */
    async getAmbilBarangByUserId(userId: number): Promise<ApiResponse<AmbilBarang[]>> {
        try {
            const response = await fetch(`${API_BASE_URL}/ambil-barang/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mendapatkan data ambil barang',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mendapatkan data ambil barang',
                data: data.data,
            };
        } catch (error) {
            console.error('Get ambil barang error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Get ambil barang belum setor
     */
    async getAmbilBarangBelumSetor(): Promise<ApiResponse<AmbilBarang[]>> {
        try {
            const response = await fetch(`${API_BASE_URL}/ambil-barang/belum-setor`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mendapatkan data',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mendapatkan data',
                data: data.data,
            };
        } catch (error) {
            console.error('Get ambil barang belum setor error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Get ambil barang by ID
     */
    async getAmbilBarangById(id: number): Promise<ApiResponse<AmbilBarang>> {
        try {
            const response = await fetch(`${API_BASE_URL}/ambil-barang/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mendapatkan data',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mendapatkan data',
                data: data.data,
            };
        } catch (error) {
            console.error('Get ambil barang by id error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Proses setor - mark items as deposited
     */
    async prosesSetor(data: {
        items: { detailSetorId: number; qty: number }[];
        adminId?: number;
    }): Promise<ApiResponse<{
        totalPemasukan: number;
        saldoTerbaru: number;
        details: { detailSetorId: number; barangNama: string; qty: number; totalHarga: number }[];
    }>> {
        try {
            const response = await fetch(`${API_BASE_URL}/setor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const dataRes = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: dataRes.message || 'Gagal memproses setor',
                };
            }

            return {
                success: true,
                message: dataRes.message || 'Berhasil memproses setor',
                data: dataRes.data,
            };
        } catch (error) {
            console.error('Proses setor error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Update keterangan ambil barang
     */
    async updateKeterangan(ambilBarangId: number, keterangan: string): Promise<ApiResponse<AmbilBarang>> {
        try {
            const response = await fetch(`${API_BASE_URL}/ambil-barang/${ambilBarangId}/keterangan`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ keterangan }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mengupdate keterangan',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mengupdate keterangan',
                data: data.data,
            };
        } catch (error) {
            console.error('Update keterangan error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },
};

export default ambilBarangService;
