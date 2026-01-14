import API_BASE_URL from '../config/api.config';
import type { ApiResponse } from '../types/barang.types';

// Types
export interface DetailSetorFull {
    id: number;
    ambilBarangId: number;
    stokHarianId: number;
    qty: number;
    totalHarga: number;
    tanggalSetor: string | null;
    stokHarian: {
        id: number;
        harga: number;
        stok: number;
        tanggalEdar: string;
        barang: {
            id: number;
            nama: string;
            gambar?: string;
        };
    };
    ambilBarang: {
        id: number;
        status: string;
        tanggalAmbil: string;
        keterangan?: string;
        user: {
            id: number;
            nama_lengkap: string;
            username: string;
            nomor_telepon?: string;
        };
        setorKepada: {
            id: number;
            nama_lengkap: string;
            username: string;
        };
    };
    detailKeuangan?: {
        id: number;
        title: string;
        nominal: number;
    } | null;
}

export const detailSetorService = {
    /**
     * Get detail setor by ID
     */
    async getDetailSetorById(id: number): Promise<ApiResponse<DetailSetorFull>> {
        try {
            const response = await fetch(`${API_BASE_URL}/detail-setor/${id}`);
            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mengambil detail transaksi',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil',
                data: data.data,
            };
        } catch (error) {
            console.error('Get detail setor error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Update qty of detail setor
     */
    async updateDetailSetorQty(id: number, qty: number): Promise<ApiResponse<DetailSetorFull>> {
        try {
            const response = await fetch(`${API_BASE_URL}/detail-setor/${id}/qty`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ qty }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mengupdate transaksi',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mengupdate transaksi',
                data: data.data,
            };
        } catch (error) {
            console.error('Update detail setor qty error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Delete detail setor
     */
    async deleteDetailSetor(id: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
        try {
            const response = await fetch(`${API_BASE_URL}/detail-setor/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal menghapus transaksi',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil menghapus transaksi',
                data: data.data,
            };
        } catch (error) {
            console.error('Delete detail setor error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },
};
