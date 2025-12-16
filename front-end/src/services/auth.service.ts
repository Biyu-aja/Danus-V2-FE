import type { LoginRequest, LoginResponse, User } from '../types/auth.types';
import API_BASE_URL from '../config/api.config';

const AUTH_STORAGE_KEY = 'danus_user';

/**
 * Auth Service - Handle semua operasi authentication
 * Terpisah dari component untuk clean architecture
 */
export const authService = {
    /**
     * Login user
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Login gagal',
                };
            }

            // Simpan user ke localStorage
            if (data.data?.user) {
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.data.user));
            }

            return {
                success: true,
                message: data.message || 'Login berhasil',
                data: data.data,
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan jaringan',
            };
        }
    },

    /**
     * Logout user
     */
    logout(): void {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    },

    /**
     * Get current user dari localStorage
     */
    getCurrentUser(): User | null {
        try {
            const userStr = localStorage.getItem(AUTH_STORAGE_KEY);
            if (!userStr) return null;
            return JSON.parse(userStr) as User;
        } catch {
            return null;
        }
    },

    /**
     * Check apakah user sudah login
     */
    isAuthenticated(): boolean {
        return this.getCurrentUser() !== null;
    },

    /**
     * Check apakah user adalah admin
     */
    isAdmin(): boolean {
        const user = this.getCurrentUser();
        return user?.role === 'admin';
    },
};

export default authService;
