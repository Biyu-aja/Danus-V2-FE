import { createBrowserRouter, Route } from "react-router-dom";
import Auth from "../pages/General/Auth";

const Routes = createBrowserRouter([
    {
        path : "/login",
        element  : <Auth />
    }
])

export default Routes