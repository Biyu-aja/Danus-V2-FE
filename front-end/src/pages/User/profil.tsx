import React from "react";
import Header from "../../components/general/header";
import UserNavbar from "../../components/user/navbar";
import { User, LogOut, Phone, ChevronRight } from "lucide-react";
import { authService } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";

const ProfilPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
            
            <main className="flex flex-col mt-[3.5rem] gap-4 p-4 mb-[5rem]">
                {/* Profile Card */}
                <div className="bg-gradient-to-br from-[#1e1e1e] to-[#252525] rounded-2xl p-6 border border-[#333]">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B09331] to-[#D4AF37] flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-white text-lg font-bold">
                                {currentUser?.nama_lengkap || 'User'}
                            </h2>
                            <p className="text-[#888] text-sm">@{currentUser?.username}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#B09331]/20 text-[#B09331] capitalize">
                                {currentUser?.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden">
                    <div className="p-4 border-b border-[#333]">
                        <h3 className="text-white font-semibold">Informasi Akun</h3>
                    </div>
                    
                    <div className="divide-y divide-[#333]">
                        <div className="flex items-center gap-3 p-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[#888] text-xs">Nama Lengkap</p>
                                <p className="text-white font-medium">{currentUser?.nama_lengkap}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Phone className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[#888] text-xs">Nomor Telepon</p>
                                <p className="text-white font-medium">{currentUser?.nomor_telepon}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Catatan */}
                {currentUser?.catatan && (
                    <div className="bg-[#1e1e1e] rounded-xl border border-[#333] p-4">
                        <h3 className="text-white font-semibold mb-2">Catatan dari Admin</h3>
                        <p className="text-[#888] text-sm">{currentUser.catatan}</p>
                    </div>
                )}

                {/* Menu Items */}
                <div className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 hover:bg-[#252525] transition-colors"
                    >
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <LogOut className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-red-400 font-medium">Keluar</p>
                            <p className="text-[#666] text-xs">Logout dari akun kamu</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#666]" />
                    </button>
                </div>

                {/* App Version */}
                <div className="text-center mt-4">
                    <p className="text-[#444] text-xs">DanusKu v1.0.0</p>
                </div>
            </main>

            <UserNavbar />
        </div>
    );
};

export default ProfilPage;
