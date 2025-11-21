import { createBrowserRouter, Route } from "react-router-dom";
import Auth from "../pages/General/Auth";
import Dashboard from "../pages/Admin/dashboard";

const Routes = createBrowserRouter([
    {
        path : "/login",
        element  : <Auth />
    },
    {
        path: "/admin/",
        element : <Dashboard />
    }
])

export default Routes