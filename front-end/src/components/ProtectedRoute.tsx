import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/auth.service';

interface ProtectedRouteProps {
    allowedRoles: ('admin' | 'user')[];
}

/**
 * ProtectedRoute - Komponen untuk melindungi route berdasarkan role
 * 
 * Digunakan sebagai parent route untuk nested routes.
 * - Jika user belum login, redirect ke halaman login (/)
 * - Jika user sudah login tapi role tidak sesuai, redirect ke halaman yang sesuai
 * - Jika role sesuai, render Outlet (child routes)
 */
const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const user = authService.getCurrentUser();

    // Jika belum login, redirect ke halaman login
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Jika role tidak sesuai, redirect ke halaman yang sesuai dengan role user
    if (!allowedRoles.includes(user.role)) {
        // Admin yang mencoba akses halaman user -> redirect ke admin dashboard
        if (user.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        // User biasa yang mencoba akses halaman admin -> redirect ke user dashboard
        if (user.role === 'user') {
            return <Navigate to="/user/dashboard" replace />;
        }
    }

    // Role sesuai, render child routes melalui Outlet
    return <Outlet />;
};

export default ProtectedRoute;
