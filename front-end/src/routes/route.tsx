import { createBrowserRouter } from "react-router-dom";
import Auth from "../pages/General/Auth";
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
import AmbilStokPage from "../pages/User/ambil-stok";
import RiwayatPage from "../pages/User/riwayat";
import ProfilPage from "../pages/User/profil";

const Routes = createBrowserRouter([
    {
        path : "/",
        element  : <Auth />
    },
    {
        path: "/admin/",
        element : <Dashboard />
    },
    {
        path: "/admin/dashboard",
        element : <Dashboard />
    },
    {
        path: "/admin/kelola-keuangan",
        element : <KelolaKeuangan />
    },
    {
        path: "/admin/kelola-barang",
        element : <KelolaBarang />
    },
    {
        path: "/admin/kelola-barang/tambah-barang",
        element : <TambahBarangPage />
    },
    {
        path: "/admin/kelola-barang/tambah-stok",
        element : <TambahStokPage />
    },
    {
        path: "/admin/histori-stok",
        element: <HistoriStokPage />
    },
    {
        path: "/admin/detail-stok/:id",
        element: <HistoriStokDetailPage />
    },
    {
        path: "/admin/kelola-user",
        element : <KelolaUser />
    },
    {
        path: "/admin/kelola-user/:id",
        element: <UserDetailStatsPage />
    },
    {
        path: "/admin/status-user",
        element: <StatusUserPage />
    },
    // User Routes
    {
        path: "/user",
        element: <UserDashboard />
    },
    {
        path: "/user/dashboard",
        element: <UserDashboard />
    },
    {
        path: "/user/ambil-stok",
        element: <AmbilStokPage />
    },
    {
        path: "/user/riwayat",
        element: <RiwayatPage />
    },
    {
        path: "/user/profil",
        element: <ProfilPage />
    },
])

export default Routes