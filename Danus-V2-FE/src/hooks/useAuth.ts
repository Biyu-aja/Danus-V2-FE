import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { User } from '../types/auth.types';

interface UseAuthReturn {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

/**
 * Custom hook untuk authentication logic
 * Memisahkan logic dari component
 */
export const useAuth = (): UseAuthReturn => {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(authService.getCurrentUser());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Handle login
     */
    const login = useCallback(async (username: string, password: string) => {
        // Validasi input
        if (!username.trim()) {
            setError('Username tidak boleh kosong');
            return;
        }
        if (!password.trim()) {
            setError('Password tidak boleh kosong');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.login({ username, password });

            if (!response.success) {
                setError(response.message);
                setIsLoading(false);
                return;
            }

            const loggedInUser = response.data?.user as User;
            setUser(loggedInUser);
            setIsLoading(false);

            // Redirect berdasarkan role
            if (loggedInUser.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/user');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
            setIsLoading(false);
        }
    }, [navigate]);

    /**
     * Handle logout
     */
    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        setError(null);
        navigate('/');
    }, [navigate]);

    /**
     * Clear error message
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        user,
        isLoading,
        error,
        login,
        logout,
        clearError,
    };
};

export default useAuth;
