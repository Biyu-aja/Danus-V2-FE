import { createBrowserRouter, Route } from "react-router-dom";
import Auth from "../pages/General/Auth";
import Dashboard from "../pages/Admin/dashboard";
import KelolaKeuangan from "../pages/Admin/kelolakeuangan";
import KelolaUser from "../pages/Admin/kelola-user";
import KelolaBarang from "../pages/Admin/kelola-barang";

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
        path: "/admin/kelola-user",
        element : <KelolaUser />
    }
])

export default Routes