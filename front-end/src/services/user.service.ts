import API_BASE_URL from '../config/api.config';
import type { ApiResponse } from '../types/barang.types';

// Types untuk User
export interface User {
    id: number;
    nama_lengkap: string;
    username: string;
    nomor_telepon: string;
    role: string;
    catatan?: string;
}

export interface BarangItem {
    barangId: number;
    nama: string;
    qty: number;
    totalHarga: number;
}

export interface UserWithStatus extends User {
    status: 'SUDAH_SETOR' | 'BELUM_SETOR' | 'BELUM_AMBIL';
    totalAmbil: number;
    totalSetor: number;
    totalHarusSetor: number;
    ambilBarangCount: number;
    barangList: BarangItem[];
}

export interface CalendarDay {
    date: string;
    status: 'HIJAU' | 'KUNING' | 'MERAH' | 'ABU' | 'HITAM';
    detail?: {
        count: number;
        totalAmbil: number;
        totalSetor: number;
    };
}

export interface UserStats {
    user: User;
    calendar: CalendarDay[];
}

/**
 * User Service
 */
export const userService = {
    /**
     * Get all users
     */
    async getAllUsers(): Promise<ApiResponse<User[]>> {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mendapatkan data users',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mendapatkan data users',
                data: data.data,
            };
        } catch (error) {
            console.error('Get users error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Get users with today's status
     */
    async getUsersWithTodayStatus(): Promise<ApiResponse<UserWithStatus[]>> {
        try {
            const response = await fetch(`${API_BASE_URL}/users/status-hari-ini`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mendapatkan status users',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mendapatkan status users',
                data: data.data,
            };
        } catch (error) {
            console.error('Get users status error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Get user by ID
     */
    async getUserById(id: number): Promise<ApiResponse<User>> {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mendapatkan data user',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mendapatkan data user',
                data: data.data,
            };
        } catch (error) {
            console.error('Get user error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Get user monthly stats
     */
    async getUserMonthlyStats(id: number, year: number, month: number): Promise<ApiResponse<UserStats>> {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}/stats?year=${year}&month=${month}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Gagal mendapatkan data statistik user',
                };
            }

            return {
                success: true,
                message: data.message || 'Berhasil mendapatkan data statistik user',
                data: data.data,
            };
        } catch (error) {
            console.error('Get user stats error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    }
};

export default userService;
