import { createBrowserRouter } from "react-router-dom";
import Auth from "../pages/General/auth";
import Dashboard from "../pages/Admin/MAIN-PAGE/dashboard";
import KelolaKeuangan from "../pages/Admin/kelolakeuangan";
import KelolaUser from "../pages/Admin/MAIN-PAGE/kelola-user";
import KelolaBarang from "../pages/Admin/MAIN-PAGE/kelola-barang";
import TambahBarangPage from "../pages/Admin/Kelola-Barang-Page/tambah-barang";
import TambahStokPage from "../pages/Admin/Kelola-Barang-Page/tambah-stok";
import StatusUserPage from "../pages/Admin/MAIN-PAGE/status-user";
import HistoriStokPage from "../pages/Admin/MAIN-PAGE/histori-stok";
import HistoriStokDetailPage from "../pages/Admin/MAIN-PAGE/histori-stok-detail";
import UserDetailStatsPage from "../pages/Admin/MAIN-PAGE/user-detail-stats";
import UserDashboard from "../pages/User/dashboard";
import RiwayatPage from "../pages/User/riwayat";
import ProfilPage from "../pages/User/profil";
import ProtectedRoute from "../components/ProtectedRoute";
import { commonListed, adminListed, userListed } from "./listed";

// Admin child routes - menggunakan adminListed untuk path
const adminChildRoutes = [
    { index: true, element: <Dashboard /> },
    { path: adminListed.dashboard, element: <Dashboard /> },
    { path: adminListed.kelolaUser, element: <KelolaUser /> },
    { path: adminListed.kelolaUserDetail, element: <UserDetailStatsPage /> },
    { path: adminListed.kelolaBarang, element: <KelolaBarang /> },
    { path: adminListed.tambahBarang, element: <TambahBarangPage /> },
    { path: adminListed.tambahStok, element: <TambahStokPage /> },
    { path: adminListed.kelolaKeuangan, element: <KelolaKeuangan /> },
    { path: adminListed.historiStok, element: <HistoriStokPage /> },
    { path: adminListed.detailStok, element: <HistoriStokDetailPage /> },
    { path: adminListed.statusUser, element: <StatusUserPage /> },
];

// User child routes - menggunakan userListed untuk path
const userChildRoutes = [
    { index: true, element: <UserDashboard /> },
    { path: userListed.dashboard, element: <UserDashboard /> },
    { path: userListed.riwayat, element: <RiwayatPage /> },
    { path: userListed.profil, element: <ProfilPage /> },
];

const Routes = createBrowserRouter([
    // Auth route (tanpa login)
    {
        path: commonListed.auth,
        element: <Auth />
    },
    // Admin Routes - Hanya bisa diakses oleh admin
    {
        path: "/admin",
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: adminChildRoutes,
    },
    // User Routes - Hanya bisa diakses oleh user biasa
    {
        path: "/user",
        element: <ProtectedRoute allowedRoles={['user']} />,
        children: userChildRoutes,
    },
]);

export default Routes;