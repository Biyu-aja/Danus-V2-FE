import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/general/header";
import Navbar from "../../../components/admin/general-admin/navbar";
import AdminAmbilBarangModal from "../../../components/admin/kelola-barang/admin-ambil-barang-modal";
import UserStatusCard from "../../../components/admin/kelola-barang/user-status-card";
import { 
    Loader2, 
    Search, 
    Users, 
    Package,
    X,
    UserPlus,
    History,
    Calendar
} from "lucide-react";
import { userService, type UserWithStatus } from "../../../services/user.service";
import { stokService } from "../../../services/barang.service";
import type { StokHarian } from "../../../types/barang.types";

type StatusFilter = 'SEMUA' | 'SUDAH_SETOR' | 'BELUM_SETOR' | 'BELUM_AMBIL';
type ViewMode = 'today' | 'history';

const StatusUserPage: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>('today');
    
    // Today status state
    const [users, setUsers] = useState<UserWithStatus[]>([]);
    const [stokHariIni, setStokHariIni] = useState<StokHarian[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('SEMUA');
    const [selectedBarangIds, setSelectedBarangIds] = useState<number[]>([]);
    const [showAdminAmbilModal, setShowAdminAmbilModal] = useState(false);

    // History state
    const [historiStok, setHistoriStok] = useState<StokHarian[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Fetch users with status and stok hari ini
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
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
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch history when switching to history mode
    useEffect(() => {
        if (viewMode === 'history' && historiStok.length === 0) {
            fetchHistory();
        }
    }, [viewMode]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await stokService.getHistoriStok({ limit: 50 });
            if (response.success && response.data) {
                setHistoriStok(response.data);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Refresh data function
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

    // Format functions
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const formatTanggal = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Group histori by date
    const groupedHistori = useMemo(() => {
        const groups: { [key: string]: StokHarian[] } = {};
        historiStok.forEach(stok => {
            const dateKey = new Date(stok.tanggalEdar).toDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(stok);
        });
        return groups;
    }, [historiStok]);

    // Get barang list from stok hari ini
    const availableBarangList = useMemo(() => {
        return stokHariIni
            .filter(stok => stok.barang)
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

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(user => 
                user.nama_lengkap.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query) ||
                user.nomor_telepon.includes(query)
            );
        }

        if (statusFilter !== 'SEMUA') {
            result = result.filter(user => user.status === statusFilter);
        }

        if (selectedBarangIds.length > 0) {
            result = result.filter(user => 
                user.barangList?.some(barang => selectedBarangIds.includes(barang.barangId))
            );
        }

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
                        <h1 className="text-white text-xl font-bold">Status User</h1>
                    </div>
                    {viewMode === 'today' && (
                        <button
                            onClick={() => setShowAdminAmbilModal(true)}
                            className="flex items-center gap-1.5 bg-[#B09331] text-white px-3 py-2 rounded-xl font-medium text-sm hover:bg-[#C4A73B] transition-colors"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden sm:inline">Ambil Barang</span>
                        </button>
                    )}
                </div>

                {/* View Mode Tabs */}
                <div className="flex bg-[#1e1e1e] rounded-xl p-1 gap-1">
                    <button
                        onClick={() => setViewMode('today')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                            viewMode === 'today'
                                ? 'bg-[#B09331] text-white'
                                : 'text-[#888] hover:text-white'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        Hari Ini
                    </button>
                    <button
                        onClick={() => setViewMode('history')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
                            viewMode === 'history'
                                ? 'bg-[#B09331] text-white'
                                : 'text-[#888] hover:text-white'
                        }`}
                    >
                        <History className="w-4 h-4" />
                        Histori
                    </button>
                </div>

                {viewMode === 'today' ? (
                    <>
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
                                    <UserStatusCard
                                        key={user.id}
                                        user={user}
                                        selectedBarangIds={selectedBarangIds}
                                        onSuccess={refreshData}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* History View */}
                        <p className="text-[#888] text-sm">Pilih stok untuk melihat status user</p>

                        {loadingHistory ? (
                            <div className="flex items-center justify-center h-[20rem] bg-[#1e1e1e] rounded-xl">
                                <div className="flex flex-col items-center gap-2 text-[#888]">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <p className="text-sm">Memuat histori...</p>
                                </div>
                            </div>
                        ) : historiStok.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[20rem] bg-[#1e1e1e] rounded-xl border border-dashed border-[#444]">
                                <Package className="w-12 h-12 text-[#444] mb-2" />
                                <p className="text-[#888] text-sm">Tidak ada histori stok</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(groupedHistori).map(([dateKey, items]) => (
                                    <div key={dateKey}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-[#B09331]" />
                                            <span className="text-[#B09331] font-medium text-sm">
                                                {formatTanggal(items[0].tanggalEdar)}
                                            </span>
                                            <span className="text-[#666] text-xs">({items.length} item)</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            {items.map((stok) => (
                                                <div 
                                                    key={stok.id}
                                                    onClick={() => navigate(`/admin/detail-stok/${stok.id}`)}
                                                    className="bg-[#1e1e1e] rounded-xl border border-[#333] p-3 cursor-pointer hover:border-[#B09331]/50 transition-all"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {stok.barang?.gambar ? (
                                                            <img src={stok.barang.gambar} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-[#333] flex items-center justify-center">
                                                                <Package className="w-5 h-5 text-[#666]" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white font-medium text-sm truncate">{stok.barang?.nama}</p>
                                                            <p className="text-[#B09331] text-xs">Rp {formatRupiah(stok.harga)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[#888]">Ambil:</span>
                                                            <span className="text-yellow-400 font-medium">{stok.jumlah_ambil || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[#888]">Setor:</span>
                                                            <span className="text-green-400 font-medium">{stok.jumlah_setor || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            <Navbar />

            {/* Admin Ambil Barang Modal */}
            <AdminAmbilBarangModal
                isOpen={showAdminAmbilModal}
                onClose={() => setShowAdminAmbilModal(false)}
                onSuccess={refreshData}
                adminId={1}
            />
        </div>
    );
};

export default StatusUserPage;
