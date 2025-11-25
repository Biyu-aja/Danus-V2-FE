import { createBrowserRouter, Route } from "react-router-dom";
import Auth from "../pages/General/Auth";
import Dashboard from "../pages/Admin/MAIN-PAGE/dashboard";
import KelolaKeuangan from "../pages/Admin/kelolakeuangan";
import KelolaUser from "../pages/Admin/MAIN-PAGE/kelola-user";
import KelolaBarang from "../pages/Admin/MAIN-PAGE/kelola-barang";
import TambahBarangPage from "../pages/Admin/Kelola-Barang-Page/tambah-barang";
import DetailUser from "../components/admin/kelola-user/detailuser";
import TambahStokPage from "../pages/Admin/Kelola-Barang-Page/tambah-stok";

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
        path: "/admin/kelola-user",
        element : <KelolaUser />
    }
])

export default Routes