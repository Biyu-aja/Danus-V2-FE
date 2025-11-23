import { createBrowserRouter, Route } from "react-router-dom";
import Auth from "../pages/General/Auth";
import Dashboard from "../pages/Admin/dashboard";
import KelolaKeuangan from "../pages/Admin/kelolakeuangan";

const Routes = createBrowserRouter([
    {
        path : "/login",
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
        element : <Auth />
    },
    {
        path: "/admin/kelola-user",
        element : <Auth />
    }
])

export default Routes