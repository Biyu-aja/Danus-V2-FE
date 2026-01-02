import React from "react";
import { Home, Package, FileText, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const UserNavbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const menuItems = [
        { icon: Home, label: "Beranda", path: "/user" },
        { icon: Package, label: "Ambil Stok", path: "/user/ambil-stok" },
        { icon: FileText, label: "Riwayat", path: "/user/riwayat" },
        { icon: User, label: "Profil", path: "/user/profil" },
    ];

    const isActive = (path: string) => {
        if (path === "/user") {
            return location.pathname === "/user" || location.pathname === "/user/";
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#1C1C20] border-t border-[#333] z-50">
            <div className="flex justify-around items-center h-16 px-2">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 ${
                                active 
                                    ? "text-[#B09331]" 
                                    : "text-[#888] hover:text-white"
                            }`}
                        >
                            <Icon 
                                className={`w-5 h-5 mb-1 transition-transform ${
                                    active ? "scale-110" : ""
                                }`} 
                                strokeWidth={active ? 2.5 : 2}
                            />
                            <span className={`text-xs font-medium ${
                                active ? "font-semibold" : ""
                            }`}>
                                {item.label}
                            </span>
                            {active && (
                                <div className="absolute bottom-1 w-8 h-1 bg-[#B09331] rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default UserNavbar;
