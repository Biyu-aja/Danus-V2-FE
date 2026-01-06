import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/general/header";
import Navbar from "../../components/admin/general-admin/navbar";
import TambahTransaksiModal from "../../components/admin/kelola-keuangan/tambah-transaksi-modal";
import ExportModal from "../../components/admin/kelola-keuangan/export-modal";
import { keuanganService } from "../../services/keuangan.service";
import type { DetailKeuangan, Saldo } from "../../types/keuangan.types";
import { 
    Loader2, 
    Plus, 
    TrendingUp, 
    TrendingDown,
    Wallet,
    Calendar,
    Receipt,
    ChevronLeft,
    ChevronRight,
    User,
    FileSpreadsheet,
    X,
    Menu
} from "lucide-react";

type FilterType = 'semua' | 'pemasukan' | 'pengeluaran';

const KelolaKeuangan: React.FC = () => {
    const [saldo, setSaldo] = useState<Saldo | null>(null);
    const [histori, setHistori] = useState<DetailKeuangan[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<FilterType>('semua');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showFabMenu, setShowFabMenu] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Format untuk API: YYYY-MM
    const getMonthString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    // Format untuk display: "Januari 2026"
    const getMonthName = (date: Date) => {
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const monthStr = getMonthString(currentDate);
            const [saldoRes, historiRes] = await Promise.all([
                keuanganService.getSaldo(),
                keuanganService.getHistoriByMonth(monthStr)
            ]);
            setSaldo(saldoRes);
            setHistori(historiRes || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    // Navigation
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

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
            month: 'short'
        });
    };

    // Calculate totals for current month
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
        if (filterType === 'semua') return histori;
        return histori.filter(h => h.tipe === filterType.toUpperCase());
    }, [histori, filterType]);

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
                {/* Header with Month Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-[#B09331]" />
                        <h1 className="text-white text-xl font-bold">Keuangan</h1>
                    </div>
                    <div className="flex items-center gap-2 bg-[#1e1e1e] rounded-lg p-1">
                        <button 
                            onClick={prevMonth}
                            className="p-1.5 hover:bg-[#333] rounded-md text-[#888] hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-white text-sm font-medium w-32 text-center">
                            {getMonthName(currentDate)}
                        </span>
                        <button 
                            onClick={nextMonth}
                            className="p-1.5 hover:bg-[#333] rounded-md text-[#888] hover:text-white transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Saldo Card */}
                <div className="bg-gradient-to-br from-[#B09331] to-[#8B7429] rounded-2xl p-4 shadow-lg">
                    <p className="text-white/70 text-sm mb-1">Total Saldo</p>
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
                            +Rp {formatRupiah(totals.pemasukan)}
                        </p>
                    </div>
                    <div className="bg-[#1e1e1e] rounded-xl p-3 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span className="text-[#888] text-xs">Pengeluaran</span>
                        </div>
                        <p className="text-red-400 text-lg font-bold">
                            -Rp {formatRupiah(totals.pengeluaran)}
                        </p>
                    </div>
                </div>

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
                                    : 'bg-[#1e1e1e] text-[#888]'
                            }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Transaction List */}
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-[#B09331]" />
                    </div>
                ) : filteredHistori.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-[#888]">
                        <Receipt className="w-12 h-12 mb-2 opacity-50" />
                        <p className="text-sm">Tidak ada transaksi di bulan ini</p>
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
                                            className="flex items-center gap-3 p-3 bg-[#1e1e1e] rounded-xl border border-[#333]"
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
                                                {/* Show penyetor name if available */}
                                                {item.penyetor ? (
                                                    <div className="flex items-center gap-1 text-[#888] text-xs">
                                                        <User className="w-3 h-3" />
                                                        <span>{item.penyetor.nama_lengkap}</span>
                                                    </div>
                                                ) : item.keterangan ? (
                                                    <p className="text-[#888] text-xs truncate">{item.keterangan}</p>
                                                ) : null}
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
            </main>

            {/* FAB with Popup Menu */}
            <div className="fixed bottom-20 right-4 z-50">
                {/* Popup Menu */}
                {showFabMenu && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 bg-black/30"
                            onClick={() => setShowFabMenu(false)}
                        />
                        {/* Menu Items */}
                        <div className="absolute bottom-16 right-0 flex flex-col gap-2 items-end mb-2">
                            <button
                                onClick={() => {
                                    setShowFabMenu(false);
                                    setShowExportModal(true);
                                }}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-green-700 transition-all animate-fade-in"
                            >
                                <FileSpreadsheet className="w-5 h-5" />
                                <span className="text-sm font-medium">Export Excel</span>
                            </button>
                            <button
                                onClick={() => {
                                    setShowFabMenu(false);
                                    setShowAddModal(true);
                                }}
                                className="flex items-center gap-2 bg-[#B09331] text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-[#C4A73B] transition-all animate-fade-in"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="text-sm font-medium">Tambah Transaksi</span>
                            </button>
                        </div>
                    </>
                )}
                
                {/* Main FAB */}
                <button
                    onClick={() => setShowFabMenu(!showFabMenu)}
                    className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 ${
                        showFabMenu 
                            ? 'bg-red-500 hover:bg-red-600 rotate-0' 
                            : 'bg-[#B09331] hover:bg-[#C4A73B]'
                    }`}
                >
                    {showFabMenu ? (
                        <X className="w-7 h-7" />
                    ) : (
                        <Menu className="w-7 h-7" />
                    )}
                </button>
            </div>

            <Navbar />

            {/* Add Transaction Modal */}
            <TambahTransaksiModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchData}
            />

            {/* Export Modal */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                histori={histori}
                bulan={getMonthName(currentDate)}
            />
        </div>
    );
};

export default KelolaKeuangan;