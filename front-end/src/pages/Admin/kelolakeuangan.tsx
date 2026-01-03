import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/general/header";
import Navbar from "../../components/admin/general-admin/navbar";
import SearchBar from "../../components/general/searchbar";
import TambahTransaksiModal from "../../components/admin/kelola-keuangan/tambah-transaksi-modal";
import { keuanganService } from "../../services/keuangan.service";
import type { DetailKeuangan, Saldo } from "../../types/keuangan.types";
import { 
    Loader2, 
    Plus, 
    TrendingUp, 
    TrendingDown,
    Wallet,
    Calendar,
    Filter,
    Receipt
} from "lucide-react";

type FilterType = 'semua' | 'pemasukan' | 'pengeluaran';

const KelolaKeuangan: React.FC = () => {
    const [saldo, setSaldo] = useState<Saldo | null>(null);
    const [histori, setHistori] = useState<DetailKeuangan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<FilterType>('semua');
    const [showAddModal, setShowAddModal] = useState(false);

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [saldoRes, historiRes] = await Promise.all([
                keuanganService.getSaldo(),
                keuanganService.getHistori(1, 100)
            ]);
            setSaldo(saldoRes);
            setHistori(historiRes.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Format rupiah
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Format time
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Calculate totals
    const totals = useMemo(() => {
        const pemasukan = histori
            .filter(h => h.tipe === 'PEMASUKAN')
            .reduce((sum, h) => sum + h.nominal, 0);
        const pengeluaran = histori
            .filter(h => h.tipe === 'PENGELUARAN')
            .reduce((sum, h) => sum + h.nominal, 0);
        return { pemasukan, pengeluaran };
    }, [histori]);

    // Filtered histori
    const filteredHistori = useMemo(() => {
        let result = histori;
        
        // Filter by type
        if (filterType !== 'semua') {
            result = result.filter(h => h.tipe === filterType.toUpperCase());
        }
        
        // Filter by search
        if (searchQuery) {
            result = result.filter(h => 
                h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                h.keterangan?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        return result;
    }, [histori, filterType, searchQuery]);

    // Group by date
    const groupedByDate = useMemo(() => {
        const groups: { [key: string]: DetailKeuangan[] } = {};
        filteredHistori.forEach(item => {
            const dateKey = new Date(item.createdAt).toDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });
        return groups;
    }, [filteredHistori]);

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
            
            <main className="flex flex-col mt-[3.5rem] gap-4 p-4 mb-[6rem]">
                {/* Saldo Card */}
                <div className="bg-gradient-to-br from-[#B09331] to-[#8B7429] rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 text-white/80 mb-1">
                        <Wallet className="w-4 h-4" />
                        <span className="text-sm">Total Saldo</span>
                    </div>
                    <p className="text-white text-3xl font-bold">
                        {loading ? '...' : `Rp ${formatRupiah(saldo?.totalSaldo || 0)}`}
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1e1e1e] rounded-xl p-3 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-[#888] text-xs">Pemasukan</span>
                        </div>
                        <p className="text-green-400 text-lg font-bold">
                            Rp {formatRupiah(totals.pemasukan)}
                        </p>
                    </div>
                    <div className="bg-[#1e1e1e] rounded-xl p-3 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span className="text-[#888] text-xs">Pengeluaran</span>
                        </div>
                        <p className="text-red-400 text-lg font-bold">
                            Rp {formatRupiah(totals.pengeluaran)}
                        </p>
                    </div>
                </div>

                {/* Riwayat Section */}
                <div className="bg-[#1e1e1e] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-bold text-lg">Riwayat Transaksi</h2>
                        <span className="text-[#888] text-sm">{filteredHistori.length} transaksi</span>
                    </div>

                    {/* Search & Filter */}
                    <div className="space-y-3 mb-4">
                        <SearchBar 
                            placeholder="Cari transaksi..." 
                            value={searchQuery}
                            onChange={setSearchQuery}
                        />
                        
                        {/* Filter Tabs */}
                        <div className="flex gap-2">
                            {(['semua', 'pemasukan', 'pengeluaran'] as FilterType[]).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                        filterType === type
                                            ? type === 'pemasukan' 
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                : type === 'pengeluaran'
                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                                                    : 'bg-[#B09331] text-white'
                                            : 'bg-[#252525] text-[#888]'
                                    }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Transaction List */}
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-[#B09331]" />
                        </div>
                    ) : filteredHistori.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-[#888]">
                            <Receipt className="w-12 h-12 mb-2 opacity-50" />
                            <p className="text-sm">Tidak ada transaksi</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(groupedByDate).map(([dateKey, items]) => (
                                <div key={dateKey}>
                                    {/* Date Header */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-[#888]" />
                                        <span className="text-[#888] text-sm font-medium">
                                            {formatDate(items[0].createdAt)}
                                        </span>
                                    </div>
                                    
                                    {/* Items */}
                                    <div className="space-y-2">
                                        {items.map(item => (
                                            <div 
                                                key={item.id}
                                                className="flex items-center gap-3 p-3 bg-[#252525] rounded-xl hover:bg-[#2a2a2a] transition-colors"
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    item.tipe === 'PEMASUKAN' 
                                                        ? 'bg-green-500/20' 
                                                        : 'bg-red-500/20'
                                                }`}>
                                                    {item.tipe === 'PEMASUKAN' 
                                                        ? <TrendingUp className="w-5 h-5 text-green-400" />
                                                        : <TrendingDown className="w-5 h-5 text-red-400" />
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium truncate">{item.title}</p>
                                                    {item.keterangan && (
                                                        <p className="text-[#888] text-xs truncate">{item.keterangan}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold ${
                                                        item.tipe === 'PEMASUKAN' ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                        {item.tipe === 'PEMASUKAN' ? '+' : '-'}Rp {formatRupiah(item.nominal)}
                                                    </p>
                                                    <p className="text-[#666] text-xs">{formatTime(item.createdAt)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Add Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-20 right-4 w-14 h-14 bg-[#B09331] rounded-full shadow-lg flex items-center justify-center text-white hover:bg-[#C4A73B] transition-colors z-50"
            >
                <Plus className="w-7 h-7" />
            </button>

            <Navbar />

            {/* Add Transaction Modal */}
            <TambahTransaksiModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default KelolaKeuangan;