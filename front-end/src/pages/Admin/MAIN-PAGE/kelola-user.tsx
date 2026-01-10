import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/general/header";
import Navbar from "../../../components/admin/general-admin/navbar";

import CardUser from "../../../components/admin/kelola-user/carduser";
import { userService, type UserWithStatus } from "../../../services/user.service";
import { Loader2, Users } from "lucide-react";

const KelolaUser: React.FC = () => {
    const navigate = useNavigate();
    const dropdown = ([
        {value: "alfabet", Menu: "Alfabet"},
        {value: "jumlah-ambil", Menu: "Jumlah Ambil (Tinggi ke Rendah)"},
        {value: "sudah-setor", Menu: "Sudah Setor"},
        {value: "belum-ambil", Menu: "Belum Ambil"},
        {value: "belum-setor", Menu: "Belum Setor"},
    ]);

    const [users, setUsers] = useState<UserWithStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("alfabet");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getUsersWithTodayStatus();
            if (response.success && response.data) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (id: number) => {
        navigate(`/admin/kelola-user/${id}`);
    };

    const processedUsers = users.filter(user => 
        user.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        switch (sortBy) {
            case "alfabet":
                return a.nama_lengkap.localeCompare(b.nama_lengkap);
            case "jumlah-ambil":
                return b.totalAmbil - a.totalAmbil;
            case "sudah-setor":
                return (a.status === 'SUDAH_SETOR' ? -1 : 1);
            case "belum-ambil":
                    return (a.status === 'BELUM_AMBIL' ? -1 : 1);
            case "belum-setor":
                return (a.status === 'BELUM_SETOR' ? -1 : 1);
            default:
                return 0;
        }
    });

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
            <main className="flex flex-col mt-[3.5rem] gap-3 p-3 mb-[5rem]">
                <div className="flex items-center gap-2 mb-2">
                    <Users className="w-6 h-6 text-[#B09331]" />
                    <h1 className="text-white text-xl font-bold">Kelola User</h1>
                </div>

                <div className="flex gap-2">
                    <input 
                        className="w-full bg-[#1e1e1e] border border-[#333] rounded-xl px-4 py-2 text-white placeholder-[#666] focus:border-[#B09331] focus:outline-none"
                        placeholder="Cari user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>


                {loading ? (
                    <div className="flex items-center justify-center h-[20rem]">
                        <Loader2 className="w-8 h-8 animate-spin text-[#888]" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {processedUsers.map((user) => (
                            <div key={user.id} onClick={() => handleCardClick(user.id)}>
                                <CardUser 
                                    user={user} 
                                />
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Navbar />
        </div>
    );
};

export default KelolaUser;