import { LayoutDashboardIcon, PackagePlusIcon, UsersIcon, WalletIcon, UserIcon } from "lucide-react";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const icon = [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboardIcon /> },
        { id: "kelola-keuangan", label: "Kelola Keuangan", icon: <WalletIcon /> },
        { id: "kelola-user", label: "Kelola User", icon: <UsersIcon /> },
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
                    className={active === data.id ? "text-[#F0C633] scale-105" : ""}
                    onClick={() => navigate(`/admin/${data.id}`)}
                >
                    {data.icon}
                </div>
            ))}
        </div>
    );
};

export default Navbar;
