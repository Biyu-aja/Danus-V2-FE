import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/general/header";
import Navbar from "../../../components/admin/general-admin/navbar";
import UserStatusCard from "../../../components/admin/kelola-barang/user-status-card";
import { 
    Loader2, 
    Search, 
    Users, 
    Package,
    X,
    History,
    Calendar,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { userService, type UserWithStatus } from "../../../services/user.service";
import { stokService } from "../../../services/barang.service";
import { useDebounce } from "../../../hooks/useDebounce";
import type { StokHarian } from "../../../types/barang.types";

type StatusFilter = 'SEMUA' | 'SUDAH_SETOR' | 'BELUM_SETOR' | 'BELUM_AMBIL';
type ViewMode = 'today' | 'history' | 'pending';

const KelolaUser: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>('today');
    
    // Today status state
    const [users, setUsers] = useState<UserWithStatus[]>([]);
    const [stokHariIni, setStokHariIni] = useState<StokHarian[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('SEMUA');
    const [selectedBarangIds, setSelectedBarangIds] = useState<number[]>([]);

    // Debounce search query (300ms delay)
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // History state
    const [historiStok, setHistoriStok] = useState<StokHarian[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Fetch users with status and stok hari ini - OPTIMIZED with Promise.all
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (viewMode === 'today') {
                    // Fetch both API calls in parallel
                    const [usersResponse, stokResponse] = await Promise.all([
                        userService.getUsersWithTodayStatus(),
                        stokService.getStokHariIni()
                    ]);
                    
                    if (usersResponse.success && usersResponse.data) {
                        setUsers(usersResponse.data);
                    }
                    if (stokResponse.success && stokResponse.data) {
                        setStokHariIni(stokResponse.data);
                    }
                } else if (viewMode === 'pending') {
                     const usersResponse = await userService.getUsersWithPendingDeposits();
                     if (usersResponse.success && usersResponse.data) {
                        setUsers(usersResponse.data);
                     } else {
                        setUsers([]);
                     }
                     // Reset stok data as it's not relevant for pending view in the same way
                     setStokHariIni([]);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [viewMode]);

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

    // Refresh data function - OPTIMIZED with Promise.all
    const refreshData = async () => {
        try {
            if (viewMode === 'today') {
                const [usersResponse, stokResponse] = await Promise.all([
                    userService.getUsersWithTodayStatus(),
                    stokService.getStokHariIni()
                ]);
                
                if (usersResponse.success && usersResponse.data) {
                    setUsers(usersResponse.data);
                }
                if (stokResponse.success && stokResponse.data) {
                    setStokHariIni(stokResponse.data);
                }
            } else if (viewMode === 'pending') {
                 const usersResponse = await userService.getUsersWithPendingDeposits();
                 if (usersResponse.success && usersResponse.data) {
                    setUsers(usersResponse.data);
                 }
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

    // Get barang list from stok hari ini OR from users in pending mode
    const availableBarangList = useMemo(() => {
        // Collect all barang from current user list (works for both today and pending)
        const allBarang = new Map<number, string>();
        
        if (viewMode === 'today') {
             stokHariIni.forEach(stok => {
                if (stok.barang) {
                    allBarang.set(stok.barang.id, stok.barang.nama);
                }
            });
        } else if (viewMode === 'pending') {
            users.forEach(user => {
                user.barangList?.forEach(b => {
                    allBarang.set(b.barangId, b.nama);
                });
            });
        }
       
       return Array.from(allBarang.entries())
            .map(([id, nama]) => ({ barangId: id, nama }))
            .sort((a, b) => a.nama.localeCompare(b.nama));
    }, [stokHariIni, users, viewMode]);

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

    // Filter and sort users (using debounced search for performance)
    const filteredUsers = useMemo(() => {
        let result = [...users];

        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase();
            result = result.filter(user => 
                user.nama_lengkap.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query) ||
                user.nomor_telepon.includes(query)
            );
        }

        if (statusFilter !== 'SEMUA' && viewMode !== 'pending') {
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
    }, [users, debouncedSearchQuery, statusFilter, selectedBarangIds, viewMode]);

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

    // Pagination calculations
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, statusFilter, selectedBarangIds]);

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
            
            <main className="flex flex-col mt-[3.5rem] gap-4 p-4 mb-[5rem]">
                {/* Title */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#B09331]" />
                        <h1 className="text-white text-xl font-bold">Kelola User</h1>
                    </div>
                </div>

                {/* View Mode Tabs */}
                <div className="flex bg-[#1e1e1e] rounded-xl p-1 gap-1 overflow-x-auto">
                    <button
                        onClick={() => setViewMode('today')}
                        className={`flex-1 min-w-fit flex items-center justify-center gap-2 px-2 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                            viewMode === 'today'
                                ? 'bg-[#B09331] text-white'
                                : 'text-[#888] hover:text-white'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">Hari Ini</span>
                    </button>
                    <button
                        onClick={() => setViewMode('pending')}
                        className={`flex-1 min-w-fit flex items-center justify-center gap-2 px-2 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                            viewMode === 'pending'
                                ? 'bg-red-500/80 text-white'
                                : 'text-[#888] hover:text-white'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">Belum Setor</span>
                    </button>
                     <button
                        onClick={() => setViewMode('history')}
                        className={`flex-1 min-w-fit flex items-center justify-center gap-2 px-2 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                            viewMode === 'history'
                                ? 'bg-[#B09331] text-white'
                                : 'text-[#888] hover:text-white'
                        }`}
                    >
                        <History className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">Histori</span>
                    </button>
                </div>

                {viewMode === 'today' || viewMode === 'pending' ? (
                    <>
                        {/* Summary Cards - Only show for 'today' view mode */}
                        {viewMode === 'today' && (
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
                        )}

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
                        {viewMode === 'today' && (
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
                        )}

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
                            <>
                                {/* User List */}
                                <div className="flex flex-col gap-2">
                                    {paginatedUsers.map((user) => (
                                        <UserStatusCard
                                            key={user.id}
                                            user={user}
                                            selectedBarangIds={selectedBarangIds}
                                            onSuccess={refreshData}
                                        />
                                    ))}
                                </div>

                                {/* Pagination Controls - Mobile Friendly */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col gap-3 mt-4 bg-[#1e1e1e] rounded-xl p-3 border border-[#333]">
                                        {/* Page Info */}
                                        <div className="flex items-center justify-center">
                                            <p className="text-[#888] text-xs text-center">
                                                {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} dari {filteredUsers.length} user
                                            </p>
                                        </div>
                                        
                                        {/* Page Controls */}
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="w-10 h-10 rounded-xl bg-[#333] flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed active:bg-[#444] transition-colors"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            
                                            {/* Current Page / Total */}
                                            <div className="flex items-center gap-1 px-4 py-2 bg-[#252525] rounded-xl">
                                                <span className="text-[#B09331] font-bold text-lg">{currentPage}</span>
                                                <span className="text-[#666]">/</span>
                                                <span className="text-[#888] text-sm">{totalPages}</span>
                                            </div>
                                            
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="w-10 h-10 rounded-xl bg-[#333] flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed active:bg-[#444] transition-colors"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
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
        </div>
    );
};

export default KelolaUser;