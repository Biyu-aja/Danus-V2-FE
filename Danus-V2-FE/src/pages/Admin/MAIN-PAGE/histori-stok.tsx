import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/general/header";
import Navbar from "../../../components/admin/general-admin/navbar";
import StokCard from "../../../components/general/stokcard";
import { 
    Loader2, 
    History,
    Calendar,
    ChevronDown,
    Filter,
    X,
    Package
} from "lucide-react";
import { stokService, barangService } from "../../../services/barang.service";
import { localDateToISO, getLocalDateString } from "../../../helper/dateHelper";
import type { StokHarian, Barang } from "../../../types/barang.types";

type FilterMode = 'custom' | 'minggu' | 'bulan' | 'semua';

const HistoriStokPage: React.FC = () => {
    const navigate = useNavigate();
    const [stokList, setStokList] = useState<StokHarian[]>([]);
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filter states
    const [filterMode, setFilterMode] = useState<FilterMode>('semua');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedBarangId, setSelectedBarangId] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Fetch barang list on mount (termasuk yang sudah dihapus untuk filter)
    useEffect(() => {
        const fetchBarang = async () => {
            const response = await barangService.getAllBarangWithDeleted();
            if (response.success && response.data) {
                // Sort: barang aktif dulu, lalu yang dihapus
                const sorted = [...response.data].sort((a, b) => {
                    if (a.deletedAt && !b.deletedAt) return 1;
                    if (!a.deletedAt && b.deletedAt) return -1;
                    return a.nama.localeCompare(b.nama);
                });
                setBarangList(sorted);
            }
        };
        fetchBarang();
    }, []);

    // Fetch histori stok
    const fetchHistori = async () => {
        setLoading(true);
        try {
            let filters: {
                startDate?: string;
                endDate?: string;
                barangId?: number;
            } = {};

            const today = new Date();
            const todayStr = getLocalDateString(today);
            
            if (filterMode === 'minggu') {
                // Last 7 days
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                filters.startDate = localDateToISO(getLocalDateString(weekAgo));
                filters.endDate = localDateToISO(todayStr);
            } else if (filterMode === 'bulan') {
                // Last 30 days
                const monthAgo = new Date(today);
                monthAgo.setDate(monthAgo.getDate() - 30);
                filters.startDate = localDateToISO(getLocalDateString(monthAgo));
                filters.endDate = localDateToISO(todayStr);
            } else if (filterMode === 'custom' && startDate) {
                filters.startDate = localDateToISO(startDate);
                if (endDate) {
                    // Set end date to end of day
                    const [year, month, day] = endDate.split('-').map(Number);
                    const end = new Date(year, month - 1, day, 23, 59, 59);
                    filters.endDate = end.toISOString();
                }
            }

            if (selectedBarangId) {
                filters.barangId = selectedBarangId;
            }

            const response = await stokService.getHistoriStok(filters);
            if (response.success && response.data) {
                setStokList(response.data);
            }
        } catch (err) {
            console.error('Error fetching histori:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistori();
    }, [filterMode, startDate, endDate, selectedBarangId]);

    // Format tanggal
    const formatTanggal = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Group stok by date
    const groupedByDate = useMemo(() => {
        const groups: { [key: string]: StokHarian[] } = {};
        stokList.forEach(stok => {
            const dateKey = new Date(stok.tanggalEdar).toDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(stok);
        });
        return groups;
    }, [stokList]);

    // Clear filters
    const clearFilters = () => {
        setFilterMode('semua');
        setStartDate('');
        setEndDate('');
        setSelectedBarangId(null);
    };

    // Check if any filter is active
    const hasActiveFilters = filterMode !== 'semua' || selectedBarangId !== null;

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
            
            <main className="flex flex-col mt-[3.5rem] gap-4 p-4 mb-[5rem]">
                {/* Title */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="w-6 h-6 text-[#B09331]" />
                        <h1 className="text-white text-xl font-bold">Histori Stok</h1>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                            hasActiveFilters 
                                ? 'bg-[#B09331] text-white' 
                                : 'bg-[#252525] text-[#888] hover:text-white'
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm">Filter</span>
                        {hasActiveFilters && (
                            <span className="w-2 h-2 rounded-full bg-white" />
                        )}
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-[#1e1e1e] rounded-xl border border-[#333] p-4 space-y-4">
                        {/* Quick Filters */}
                        <div>
                            <label className="text-[#888] text-xs block mb-2">Periode</label>
                            <div className="flex flex-wrap gap-2">
                                {(['semua', 'minggu', 'bulan', 'custom'] as FilterMode[]).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setFilterMode(mode)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            filterMode === mode
                                                ? 'bg-[#B09331] text-white'
                                                : 'bg-[#252525] text-[#888] hover:text-white'
                                        }`}
                                    >
                                        {mode === 'semua' && 'Semua'}
                                        {mode === 'minggu' && '7 Hari'}
                                        {mode === 'bulan' && '30 Hari'}
                                        {mode === 'custom' && 'Custom'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Date Range */}
                        {filterMode === 'custom' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[#888] text-xs block mb-1">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-[#252525] text-white border border-[#444] rounded-lg p-2 text-sm focus:border-[#B09331] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#888] text-xs block mb-1">Sampai Tanggal</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-[#252525] text-white border border-[#444] rounded-lg p-2 text-sm focus:border-[#B09331] focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Barang Filter */}
                        <div>
                            <label className="text-[#888] text-xs block mb-2">Jenis Barang</label>
                            <div className="relative">
                                <select
                                    value={selectedBarangId || ''}
                                    onChange={(e) => setSelectedBarangId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full bg-[#252525] text-white border border-[#444] rounded-lg p-2.5 pr-10 appearance-none focus:border-[#B09331] focus:outline-none"
                                >
                                    <option value="">Semua Barang</option>
                                    {barangList.map(barang => (
                                        <option 
                                            key={barang.id} 
                                            value={barang.id}
                                            className={barang.deletedAt ? 'text-[#888]' : ''}
                                        >
                                            {barang.nama}{barang.deletedAt ? ' (dihapus)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#888] pointer-events-none" />
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 text-red-400 text-sm hover:text-red-300"
                            >
                                <X className="w-4 h-4" />
                                Hapus Semua Filter
                            </button>
                        )}
                    </div>
                )}

                {/* Summary */}
                <div className="flex items-center gap-3">
                    <span className="text-[#888] text-sm">Total Record:</span>
                    <span className="text-white font-medium">{stokList.length}</span>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-[20rem] bg-[#1e1e1e] rounded-xl">
                        <div className="flex flex-col items-center gap-2 text-[#888]">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-sm">Memuat histori stok...</p>
                        </div>
                    </div>
                ) : stokList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[20rem] bg-[#1e1e1e] rounded-xl border border-dashed border-[#444]">
                        <Package className="w-12 h-12 text-[#444] mb-2" />
                        <p className="text-[#888] text-sm">Tidak ada histori stok</p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-2 text-[#B09331] text-sm hover:underline"
                            >
                                Hapus filter untuk melihat semua
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedByDate).map(([dateKey, items]) => (
                            <div key={dateKey}>
                                {/* Date Header */}
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="w-4 h-4 text-[#B09331]" />
                                    <span className="text-[#B09331] font-medium text-sm">
                                        {formatTanggal(items[0].tanggalEdar)}
                                    </span>
                                    <span className="text-[#666] text-xs">
                                        ({items.length} item)
                                    </span>
                                </div>
                                
                                {/* Grid Cards */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {items.map((stok) => (
                                        <div 
                                            key={stok.id} 
                                            onClick={() => navigate(`/admin/detail-stok/${stok.id}`)}
                                            className="cursor-pointer"
                                        >
                                            <StokCard
                                                id={stok.id}
                                                nama_item={stok.barang?.nama || 'Unknown'}
                                                harga_item={stok.harga}
                                                jumlah_stok={stok.stok}
                                                modal={stok.modal}
                                                tanggalEdar={stok.tanggalEdar}
                                                gambar={stok.barang?.gambar}
                                                jumlah_ambil={stok.jumlah_ambil}
                                                jumlah_setor={stok.jumlah_setor}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Navbar />
        </div>
    );
};

export default HistoriStokPage;
