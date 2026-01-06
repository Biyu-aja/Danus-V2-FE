import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../components/general/header";
import Navbar from "../../../components/admin/general-admin/navbar";
import UserDetailSetorModal from "../../../components/admin/kelola-barang/user-detail-setor-modal";
import { 
    Loader2, 
    Search, 
    Users, 
    CheckCircle, 
    Clock, 
    ArrowLeft,
    Package,
    Calendar,
    BoxIcon
} from "lucide-react";
import { stokService } from "../../../services/barang.service";
import type { StokHarian } from "../../../types/barang.types";

interface UserTransaction {
    user: { id: number; nama_lengkap: string; username: string; role: string };
    items: {
        id: number;
        qty: number;
        totalHarga: number;
        status: 'ambil' | 'setor';
        tanggalAmbil: string;
        tanggalSetor: string | null;
    }[];
    totalAmbil: number;
    totalSetor: number;
}

type StatusFilter = 'SEMUA' | 'SUDAH_SETOR' | 'BELUM_SETOR';

const HistoriStokDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [stok, setStok] = useState<(StokHarian & { users?: UserTransaction[] }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('SEMUA');
    
    // Modal state
    const [selectedUser, setSelectedUser] = useState<UserTransaction | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Fetch stok detail with users
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await stokService.getStokDetail(parseInt(id, 10));
                if (response.success && response.data) {
                    setStok(response.data);
                }
            } catch (err) {
                console.error('Error fetching stok detail:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Format functions
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const formatTanggal = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // Calculate user status
    const getUserStatus = (user: UserTransaction): 'SUDAH_SETOR' | 'BELUM_SETOR' => {
        if (user.totalSetor >= user.totalAmbil) {
            return 'SUDAH_SETOR';
        }
        return 'BELUM_SETOR';
    };

    // Filter users
    const filteredUsers = useMemo(() => {
        if (!stok?.users) return [];
        
        let result = [...stok.users];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(user => 
                user.user.nama_lengkap.toLowerCase().includes(query) ||
                user.user.username.toLowerCase().includes(query)
            );
        }

        // Apply status filter
        if (statusFilter !== 'SEMUA') {
            result = result.filter(user => getUserStatus(user) === statusFilter);
        }

        // Sort by status: SUDAH_SETOR > BELUM_SETOR
        result.sort((a, b) => {
            const statusOrder = { 'SUDAH_SETOR': 0, 'BELUM_SETOR': 1 };
            return statusOrder[getUserStatus(a)] - statusOrder[getUserStatus(b)];
        });

        return result;
    }, [stok?.users, searchQuery, statusFilter]);

    // Count by status
    const statusCounts = useMemo(() => {
        if (!stok?.users) return { SUDAH_SETOR: 0, BELUM_SETOR: 0 };
        return {
            SUDAH_SETOR: stok.users.filter(u => getUserStatus(u) === 'SUDAH_SETOR').length,
            BELUM_SETOR: stok.users.filter(u => getUserStatus(u) === 'BELUM_SETOR').length,
        };
    }, [stok?.users]);

    // Status badge component
    const StatusBadge: React.FC<{ status: 'SUDAH_SETOR' | 'BELUM_SETOR' }> = ({ status }) => {
        const config = {
            'SUDAH_SETOR': {
                icon: CheckCircle,
                label: 'Sudah Setor',
                className: 'bg-green-500/20 text-green-400 border-green-500/30',
            },
            'BELUM_SETOR': {
                icon: Clock,
                label: 'Belum Setor',
                className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            },
        }[status];

        const Icon = config.icon;

        return (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    // Filter tabs
    const filterTabs: { key: StatusFilter; label: string; count?: number }[] = [
        { key: 'SEMUA', label: 'Semua', count: stok?.users?.length || 0 },
        { key: 'SUDAH_SETOR', label: 'Sudah Setor', count: statusCounts.SUDAH_SETOR },
        { key: 'BELUM_SETOR', label: 'Belum Setor', count: statusCounts.BELUM_SETOR },
    ];

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-[#121212]">
                <Header />
                <main className="flex-1 flex items-center justify-center mt-[3.5rem]">
                    <div className="flex flex-col items-center gap-2 text-[#888]">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="text-sm">Memuat data...</p>
                    </div>
                </main>
                <Navbar />
            </div>
        );
    }

    if (!stok) {
        return (
            <div className="flex flex-col min-h-screen bg-[#121212]">
                <Header />
                <main className="flex-1 flex items-center justify-center mt-[3.5rem]">
                    <div className="flex flex-col items-center gap-2 text-[#888]">
                        <Package className="w-12 h-12" />
                        <p className="text-sm">Stok tidak ditemukan</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-2 text-[#B09331] text-sm hover:underline"
                        >
                            Kembali
                        </button>
                    </div>
                </main>
                <Navbar />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
            
            <main className="flex flex-col mt-[3.5rem] gap-4 p-4 mb-[5rem]">
                {/* Back Button & Title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-xl bg-[#1e1e1e] flex items-center justify-center text-[#888] hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-white text-lg font-bold">Status User</h1>
                        <p className="text-[#888] text-sm">Histori stok</p>
                    </div>
                </div>

                {/* Stok Info Card */}
                <div className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden">
                    <div className="flex gap-3 p-4">
                        {stok.barang?.gambar ? (
                            <img 
                                src={stok.barang.gambar} 
                                alt={stok.barang?.nama} 
                                className="w-16 h-16 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-[#333] flex items-center justify-center">
                                <BoxIcon className="w-8 h-8 text-[#666]" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h2 className="text-white font-bold">{stok.barang?.nama || 'Unknown'}</h2>
                            <p className="text-[#B09331] font-semibold">Rp {formatRupiah(stok.harga)}</p>
                            <div className="flex items-center gap-2 mt-1 text-[#888] text-xs">
                                <Calendar className="w-3 h-3" />
                                {formatTanggal(stok.tanggalEdar)}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 border-t border-[#333]">
                        <div className="p-3 text-center border-r border-[#333]">
                            <p className="text-[#888] text-xs">Stok</p>
                            <p className="text-white font-bold">{stok.stok}</p>
                        </div>
                        <div className="p-3 text-center border-r border-[#333]">
                            <p className="text-[#888] text-xs">Diambil</p>
                            <p className="text-yellow-400 font-bold">{stok.jumlah_ambil || 0}</p>
                        </div>
                        <div className="p-3 text-center">
                            <p className="text-[#888] text-xs">User Setor</p>
                            <p className="text-green-400 font-bold">{stok.jumlah_setor || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                        <p className="text-green-400 text-2xl font-bold">{statusCounts.SUDAH_SETOR}</p>
                        <p className="text-green-400/70 text-xs">Sudah Setor</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
                        <p className="text-yellow-400 text-2xl font-bold">{statusCounts.BELUM_SETOR}</p>
                        <p className="text-yellow-400/70 text-xs">Belum Setor</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666]" />
                    <input
                        type="text"
                        placeholder="Cari nama atau username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1e1e1e] border border-[#333] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#666] focus:border-[#B09331] focus:outline-none transition-colors"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                statusFilter === tab.key
                                    ? 'bg-[#B09331] text-white'
                                    : 'bg-[#1e1e1e] text-[#888] hover:text-white border border-[#333]'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                    statusFilter === tab.key
                                        ? 'bg-white/20'
                                        : 'bg-[#333]'
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* User List */}
                {!stok.users || stok.users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[15rem] bg-[#1e1e1e] rounded-xl border border-dashed border-[#444]">
                        <Users className="w-12 h-12 text-[#444] mb-2" />
                        <p className="text-[#888] text-sm">Belum ada user yang mengambil</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[15rem] bg-[#1e1e1e] rounded-xl border border-dashed border-[#444]">
                        <Users className="w-12 h-12 text-[#444] mb-2" />
                        <p className="text-[#888] text-sm">Tidak ada user yang cocok</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredUsers.map((userTx) => {
                            const status = getUserStatus(userTx);
                            const totalHarga = userTx.items.reduce((sum, item) => sum + item.totalHarga, 0);
                            
                            return (
                                <div 
                                    key={userTx.user.id}
                                    onClick={() => {
                                        setSelectedUser(userTx);
                                        setShowModal(true);
                                    }}
                                    className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden hover:border-[#B09331]/50 transition-all cursor-pointer"
                                >
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-white font-semibold truncate">
                                                        {userTx.user.nama_lengkap}
                                                    </h3>
                                                    <StatusBadge status={status} />
                                                </div>
                                                <p className="text-[#888] text-xs">@{userTx.user.username}</p>
                                            </div>

                                            {/* Stats */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-[#ffffff] text-xs">Item: {userTx.totalAmbil}</p>
                                                <p className="text-[#B09331] text-sm font-semibold mt-1">
                                                    Rp {formatRupiah(totalHarga)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        {status === 'BELUM_SETOR' && userTx.totalAmbil > 0 && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-[#888]">Progress Setor</span>
                                                    <span className="text-yellow-400">
                                                        {userTx.totalSetor}/{userTx.totalAmbil} item
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-[#333] rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-yellow-500 rounded-full transition-all"
                                                        style={{ 
                                                            width: `${(userTx.totalSetor / userTx.totalAmbil) * 100}%` 
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Items detail */}
                                        <div className="mt-3 space-y-1">
                                            {userTx.items.map((item) => (
                                                <div 
                                                    key={item.id}
                                                    className={`text-xs px-2 py-1.5 rounded-lg flex justify-between ${
                                                        item.status === 'setor' 
                                                            ? 'bg-green-500/10 text-green-400' 
                                                            : 'bg-yellow-500/10 text-yellow-400'
                                                    }`}
                                                >
                                                    <span>{item.qty}x @ Rp {formatRupiah(item.totalHarga / item.qty)}</span>
                                                    <span className="font-medium">
                                                        {item.status === 'setor' ? '✓ Setor' : '⏳ Pending'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Navbar />

            {/* User Detail Modal */}
            {selectedUser && stok && (
                <UserDetailSetorModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedUser(null);
                    }}
                    onSuccess={() => {
                        setShowModal(false);
                        setSelectedUser(null);
                        // Refresh data
                        const fetchData = async () => {
                            const response = await stokService.getStokDetail(parseInt(id!, 10));
                            if (response.success && response.data) {
                                setStok(response.data);
                            }
                        };
                        fetchData();
                    }}
                    userId={selectedUser.user.id}
                    userName={selectedUser.user.nama_lengkap}
                    date={new Date(stok.tanggalEdar)}
                />
            )}
        </div>
    );
};

export default HistoriStokDetailPage;
