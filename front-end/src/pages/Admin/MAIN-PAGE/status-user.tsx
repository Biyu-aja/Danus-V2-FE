import React, { useState, useEffect, useMemo } from "react";
import Header from "../../../components/general/header";
import Navbar from "../../../components/admin/general-admin/navbar";
import AdminAmbilBarangModal from "../../../components/admin/kelola-barang/admin-ambil-barang-modal";
import UserDetailSetorModal from "../../../components/admin/kelola-barang/user-detail-setor-modal";
import { 
    Loader2, 
    Search, 
    Users, 
    CheckCircle, 
    Clock, 
    XCircle,
    Phone,
    Package,
    X,
    UserPlus,
    ChevronRight
} from "lucide-react";
import { userService, type UserWithStatus } from "../../../services/user.service";
import { stokService } from "../../../services/barang.service";
import type { StokHarian } from "../../../types/barang.types";

type StatusFilter = 'SEMUA' | 'SUDAH_SETOR' | 'BELUM_SETOR' | 'BELUM_AMBIL';

const StatusUserPage: React.FC = () => {
    const [users, setUsers] = useState<UserWithStatus[]>([]);
    const [stokHariIni, setStokHariIni] = useState<StokHarian[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('SEMUA');
    const [selectedBarangIds, setSelectedBarangIds] = useState<number[]>([]);
    const [showAdminAmbilModal, setShowAdminAmbilModal] = useState(false);
    
    // User detail modal state
    const [selectedUser, setSelectedUser] = useState<UserWithStatus | null>(null);
    const [showUserDetailModal, setShowUserDetailModal] = useState(false);

    // Fetch users with status and stok hari ini
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch users
                const usersResponse = await userService.getUsersWithTodayStatus();
                if (usersResponse.success && usersResponse.data) {
                    setUsers(usersResponse.data);
                }
                
                // Fetch stok hari ini for barang list
                const stokResponse = await stokService.getStokHariIni();
                if (stokResponse.success && stokResponse.data) {
                    setStokHariIni(stokResponse.data);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Refresh data function (called after adding ambil barang)
    const refreshData = async () => {
        try {
            const usersResponse = await userService.getUsersWithTodayStatus();
            if (usersResponse.success && usersResponse.data) {
                setUsers(usersResponse.data);
            }
            
            const stokResponse = await stokService.getStokHariIni();
            if (stokResponse.success && stokResponse.data) {
                setStokHariIni(stokResponse.data);
            }
        } catch (err) {
            console.error('Error refreshing data:', err);
        }
    };

    // Format rupiah
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Get barang list from stok hari ini (all available items today)
    const availableBarangList = useMemo(() => {
        return stokHariIni
            .filter(stok => stok.barang) // Only items with barang data
            .map(stok => ({
                barangId: stok.barang!.id,
                nama: stok.barang!.nama,
            }))
            .sort((a, b) => a.nama.localeCompare(b.nama));
    }, [stokHariIni]);

    // Toggle barang filter
    const toggleBarangFilter = (barangId: number) => {
        setSelectedBarangIds(prev => 
            prev.includes(barangId) 
                ? prev.filter(id => id !== barangId)
                : [...prev, barangId]
        );
    };

    // Clear all barang filters
    const clearBarangFilters = () => {
        setSelectedBarangIds([]);
    };

    // Filter and sort users
    const filteredUsers = useMemo(() => {
        let result = [...users];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(user => 
                user.nama_lengkap.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query) ||
                user.nomor_telepon.includes(query)
            );
        }

        // Apply status filter
        if (statusFilter !== 'SEMUA') {
            result = result.filter(user => user.status === statusFilter);
        }

        // Apply barang filter
        if (selectedBarangIds.length > 0) {
            result = result.filter(user => 
                user.barangList?.some(barang => selectedBarangIds.includes(barang.barangId))
            );
        }

        // Sort by status: SUDAH_SETOR > BELUM_SETOR > BELUM_AMBIL
        const statusOrder = {
            'SUDAH_SETOR': 0,
            'BELUM_SETOR': 1,
            'BELUM_AMBIL': 2,
        };

        result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

        return result;
    }, [users, searchQuery, statusFilter, selectedBarangIds]);

    // Count by status
    const statusCounts = useMemo(() => {
        return {
            SUDAH_SETOR: users.filter(u => u.status === 'SUDAH_SETOR').length,
            BELUM_SETOR: users.filter(u => u.status === 'BELUM_SETOR').length,
            BELUM_AMBIL: users.filter(u => u.status === 'BELUM_AMBIL').length,
        };
    }, [users]);

    // Status badge component
    const StatusBadge: React.FC<{ status: UserWithStatus['status'] }> = ({ status }) => {
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
            'BELUM_AMBIL': {
                icon: XCircle,
                label: 'Belum Ambil',
                className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
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
        { key: 'SEMUA', label: 'Semua', count: users.length },
        { key: 'SUDAH_SETOR', label: 'Sudah Setor', count: statusCounts.SUDAH_SETOR },
        { key: 'BELUM_SETOR', label: 'Belum Setor', count: statusCounts.BELUM_SETOR },
        { key: 'BELUM_AMBIL', label: 'Belum Ambil', count: statusCounts.BELUM_AMBIL },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
            
            <main className="flex flex-col mt-[3.5rem] gap-4 p-4 mb-[5rem]">
                {/* Title */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#B09331]" />
                        <h1 className="text-white text-xl font-bold">Status User Hari Ini</h1>
                    </div>
                    <button
                        onClick={() => setShowAdminAmbilModal(true)}
                        className="flex items-center gap-1.5 bg-[#B09331] text-white px-3 py-2 rounded-xl font-medium text-sm hover:bg-[#C4A73B] transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Ambil Barang</span>
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                        <p className="text-green-400 text-2xl font-bold">{statusCounts.SUDAH_SETOR}</p>
                        <p className="text-green-400/70 text-xs">Setor</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
                        <p className="text-yellow-400 text-2xl font-bold">{statusCounts.BELUM_SETOR}</p>
                        <p className="text-yellow-400/70 text-xs">Ambil</p>
                    </div>
                    <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-3 text-center">
                        <p className="text-gray-400 text-2xl font-bold">{statusCounts.BELUM_AMBIL}</p>
                        <p className="text-gray-400/70 text-xs">Belum</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666]" />
                    <input
                        type="text"
                        placeholder="Cari nama, username, atau nomor telepon..."
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

                {/* Barang Filter */}
                {availableBarangList.length > 0 && (
                    <div className="bg-[#1e1e1e] rounded-xl p-3 border border-[#333]">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-[#B09331]" />
                                <span className="text-white text-sm font-medium">Filter Barang</span>
                            </div>
                            {selectedBarangIds.length > 0 && (
                                <button
                                    onClick={clearBarangFilters}
                                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                    Hapus Filter
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {availableBarangList.map((barang) => {
                                const isSelected = selectedBarangIds.includes(barang.barangId);
                                return (
                                    <button
                                        key={barang.barangId}
                                        onClick={() => toggleBarangFilter(barang.barangId)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            isSelected
                                                ? 'bg-[#B09331] text-white'
                                                : 'bg-[#252525] text-[#888] hover:text-white border border-[#444]'
                                        }`}
                                    >
                                        {barang.nama}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedBarangIds.length > 0 && (
                            <p className="text-[#666] text-xs mt-2">
                                Menampilkan user yang mengambil: {selectedBarangIds.length} barang terpilih
                            </p>
                        )}
                    </div>
                )}

                {/* User List */}
                {loading ? (
                    <div className="flex items-center justify-center h-[15rem] bg-[#1e1e1e] rounded-xl">
                        <div className="flex flex-col items-center gap-2 text-[#888]">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-sm">Memuat data user...</p>
                        </div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[15rem] bg-[#1e1e1e] rounded-xl border border-dashed border-[#444]">
                        <Users className="w-12 h-12 text-[#444] mb-2" />
                        <p className="text-[#888] text-sm">
                            {searchQuery ? 'Tidak ada user yang cocok' : 'Tidak ada user'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredUsers.map((user) => (
                            <div 
                                key={user.id}
                                onClick={() => {
                                    setSelectedUser(user);
                                    setShowUserDetailModal(true);
                                }}
                                className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden hover:border-[#B09331]/50 transition-all cursor-pointer group"
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-white font-semibold truncate">
                                                    {user.nama_lengkap}
                                                </h3>
                                                <StatusBadge status={user.status} />
                                            </div>
                                            <p className="text-[#888] text-sm">@{user.username}</p>
                                            <div className="flex items-center gap-1 mt-1 text-[#666] text-xs">
                                                <Phone className="w-3 h-3" />
                                                {user.nomor_telepon}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="text-right flex-shrink-0 flex items-center gap-3">
                                            {user.status !== 'BELUM_AMBIL' && (
                                                <div>
                                                    <p className="text-[#888] text-xs">Item diambil</p>
                                                    <p className="text-white font-bold">{user.totalAmbil}</p>
                                                    <p className="text-[#B09331] text-sm font-semibold mt-1">
                                                        Rp {formatRupiah(user.totalHarusSetor)}
                                                    </p>
                                                </div>
                                            )}
                                            <ChevronRight className="w-5 h-5 text-[#444] group-hover:text-[#B09331] transition-colors" />
                                        </div>
                                    </div>

                                    {/* Progress bar for setor */}
                                    {user.status === 'BELUM_SETOR' && user.totalAmbil > 0 && (
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-[#888]">Progress Setor</span>
                                                <span className="text-yellow-400">
                                                    {user.totalSetor}/{user.totalAmbil} item
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-[#333] rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-yellow-500 rounded-full transition-all"
                                                    style={{ 
                                                        width: `${(user.totalSetor / user.totalAmbil) * 100}%` 
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Barang List */}
                                    {user.barangList && user.barangList.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-[#888] text-xs mb-1.5">Barang diambil:</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.barangList.map((barang) => (
                                                    <span 
                                                        key={barang.barangId}
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${
                                                            selectedBarangIds.includes(barang.barangId)
                                                                ? 'bg-[#B09331]/30 text-[#B09331] border border-[#B09331]/50'
                                                                : 'bg-[#252525] text-[#aaa]'
                                                        }`}
                                                    >
                                                        {barang.nama}
                                                        <span className="font-semibold">×{barang.qty}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Catatan */}
                                    {user.catatan && (
                                        <div className="mt-2 p-2 bg-[#252525] rounded-lg">
                                            <p className="text-[#888] text-xs">{user.catatan}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Navbar />

            {/* Admin Ambil Barang Modal */}
            <AdminAmbilBarangModal
                isOpen={showAdminAmbilModal}
                onClose={() => setShowAdminAmbilModal(false)}
                onSuccess={refreshData}
                adminId={1} // TODO: Get from auth context
            />

            {/* User Detail & Setor Modal */}
            {selectedUser && (
                <UserDetailSetorModal
                    isOpen={showUserDetailModal}
                    onClose={() => {
                        setShowUserDetailModal(false);
                        setSelectedUser(null);
                    }}
                    onSuccess={refreshData}
                    userId={selectedUser.id}
                    userName={selectedUser.nama_lengkap}
                />
            )}
        </div>
    );
};

export default StatusUserPage;
