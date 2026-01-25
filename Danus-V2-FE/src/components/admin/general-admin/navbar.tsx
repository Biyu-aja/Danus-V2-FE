import { LayoutDashboardIcon, PackagePlusIcon, UsersIcon, WalletIcon, UserIcon, BellIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { requestSetorService } from "../../../services/request.service";
import { authService } from "../../../services/auth.service";

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [hasPendingRequest, setHasPendingRequest] = useState(false);

    useEffect(() => {
        const checkPendingRequests = async () => {
            const user = authService.getCurrentUser();
            if (user && user.role === 'admin') {
                try {
                    const response = await requestSetorService.getAdminRequests(user.id);
                    if (response.success && response.data && response.data.length > 0) {
                        setHasPendingRequest(true);
                    } else {
                        setHasPendingRequest(false);
                    }
                } catch (error) {
                    console.error("Failed to check pending requests", error);
                }
            }
        };

        checkPendingRequests();
        const interval = setInterval(checkPendingRequests, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const icon = [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboardIcon /> },
        { id: "kelola-keuangan", label: "Kelola Keuangan", icon: <WalletIcon /> },
        { id: "kelola-user", label: "Kelola User", icon: <UsersIcon /> },
        { 
            id: "kelola-request", 
            label: "Request", 
            icon: (
                <div className="relative">
                    <BellIcon />
                    {hasPendingRequest && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </div>
            ) 
        }, 
        { id: "kelola-barang", label: "Kelola Barang", icon: <PackagePlusIcon /> },
        { id: "profil", label: "Profil", icon: <UserIcon /> },
    ];

    // Ambil path terakhir → contoh: "/admin/kelola-user"
    const active = location.pathname.split("/").pop();

    return (
        <div className="fixed bottom-0 flex flex-row justify-around z-[60] text-[#B09331] items-center bg-[#1C1C20] rounded-t-xl w-full h-[3rem]">
            {icon.map((data) => (
                <div
                    key={data.id}
                    className={`cursor-pointer ${active === data.id ? "text-[#F0C633] scale-105" : ""}`}
                    onClick={() => navigate(`/admin/${data.id}`)}
                >
                    {data.icon}
                </div>
            ))}
        </div>
    );
};

export default Navbar;
