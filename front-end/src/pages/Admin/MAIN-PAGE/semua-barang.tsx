import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/general/header";
import Navbar from "../../../components/admin/general-admin/navbar";
import { 
    Loader2, 
    Package, 
    ArrowLeft,
    RefreshCw,
    Trash2,
    Check,
    Search,
    Boxes,
    TrendingUp
} from "lucide-react";
import { barangService } from "../../../services/barang.service";
import type { Barang } from "../../../types/barang.types";

type FilterType = 'semua' | 'aktif' | 'dihapus';

const SemuaBarangPage: React.FC = () => {
    const navigate = useNavigate();
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('semua');
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch data
    const fetchBarang = async () => {
        setLoading(true);
        try {
            const response = await barangService.getAllBarangWithDeleted();
            if (response.success && response.data) {
                setBarangList(response.data);
            }
        } catch (err) {
            console.error('Error fetching barang:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBarang();
    }, []);

    // Filter barang
    const filteredBarang = barangList.filter(barang => {
        const matchSearch = barang.nama.toLowerCase().includes(searchQuery.toLowerCase());
        const matchFilter = filterType === 'semua' 
            || (filterType === 'aktif' && !barang.deletedAt)
            || (filterType === 'dihapus' && barang.deletedAt);
        return matchSearch && matchFilter;
    });

    // Sort: aktif dulu, lalu yang dihapus
    const sortedBarang = [...filteredBarang].sort((a, b) => {
        if (a.deletedAt && !b.deletedAt) return 1;
        if (!a.deletedAt && b.deletedAt) return -1;
        return a.nama.localeCompare(b.nama);
    });

    // Handle restore
    const handleRestore = async (id: number) => {
        setActionLoading(id);
        try {
            const response = await barangService.restoreBarang(id);
            if (response.success) {
                setSuccessMessage('Barang berhasil dikembalikan');
                fetchBarang();
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err) {
            console.error('Error restoring barang:', err);
        } finally {
            setActionLoading(null);
        }
    };

    // Handle delete
    const handleDelete = async (id: number) => {
        setActionLoading(id);
        try {
            const response = await barangService.deleteBarang(id);
            if (response.success) {
                setSuccessMessage('Barang berhasil dihapus');
                fetchBarang();
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err) {
            console.error('Error deleting barang:', err);
        } finally {
            setActionLoading(null);
        }
    };

    // Count stats
    const activeCount = barangList.filter(b => !b.deletedAt).length;
    const deletedCount = barangList.filter(b => b.deletedAt).length;

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
            
            <main className="flex flex-col mt-[3.5rem] gap-4 p-4 mb-[5rem]">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-xl bg-[#252525] flex items-center justify-center text-white hover:bg-[#333] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-white text-xl font-bold">Semua Barang</h1>
                        <p className="text-[#888] text-sm">{activeCount} aktif · {deletedCount} dihapus</p>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 text-sm">{successMessage}</span>
                    </div>
                )}

                {/* Search & Filter */}
                <div className="space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" />
                        <input
                            type="text"
                            placeholder="Cari barang..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1e1e1e] text-white pl-10 pr-4 py-3 rounded-xl border border-[#333] focus:border-[#B09331] focus:outline-none"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {(['semua', 'aktif', 'dihapus'] as FilterType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    filterType === type
                                        ? 'bg-[#B09331] text-white'
                                        : 'bg-[#252525] text-[#888] hover:text-white'
                                }`}
                            >
                                {type === 'semua' && `Semua (${barangList.length})`}
                                {type === 'aktif' && `Aktif (${activeCount})`}
                                {type === 'dihapus' && `Dihapus (${deletedCount})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-[20rem] bg-[#1e1e1e] rounded-xl">
                        <div className="flex flex-col items-center gap-2 text-[#888]">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-sm">Memuat data...</p>
                        </div>
                    </div>
                ) : sortedBarang.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[20rem] bg-[#1e1e1e] rounded-xl border border-dashed border-[#444]">
                        <Package className="w-12 h-12 text-[#444] mb-2" />
                        <p className="text-[#888] text-sm">Tidak ada barang ditemukan</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedBarang.map(barang => (
                            <div 
                                key={barang.id}
                                className={`bg-[#1e1e1e] rounded-xl border p-4 transition-all ${
                                    barang.deletedAt 
                                        ? 'border-red-500/30 opacity-70' 
                                        : 'border-[#333]'
                                }`}
                            >
                                <div className="flex gap-3">
                                    {/* Image */}
                                    {barang.gambar ? (
                                        <img 
                                            src={barang.gambar}
                                            alt={barang.nama}
                                            className="w-16 h-16 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-[#252525] flex items-center justify-center">
                                            <Package className="w-8 h-8 text-[#666]" />
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-semibold truncate">
                                                    {barang.nama}
                                                </h3>
                                                {barang.keterangan && (
                                                    <p className="text-[#888] text-sm truncate">
                                                        {barang.keterangan}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            {/* Status Badge */}
                                            {barang.deletedAt ? (
                                                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 whitespace-nowrap">
                                                    Dihapus
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 whitespace-nowrap">
                                                    Aktif
                                                </span>
                                            )}
                                        </div>


                                    </div>
                                    
                                </div>
                                
                                {/* statistik */}
                                {barang.stokHarian && barang.stokHarian.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                    <Boxes className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[#888] text-xs">Total Stok Edar</p>
                                                    <p className="text-white font-bold">
                                                        {barang.stokHarian.length} kali
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[#888] text-xs">Total Omzet</p>
                                                    <p className="text-green-400 font-bold text-sm">
                                                        Rp {new Intl.NumberFormat('id-ID').format(
                                                            barang.stokHarian.reduce((total, stok) => {
                                                                const stokOmzet = stok.detailSetor?.reduce((sum, ds) => sum + ds.totalHarga, 0) || 0;
                                                                return total + stokOmzet;
                                                            }, 0)
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-3">
                                    {barang.deletedAt ? (
                                        <button
                                            onClick={() => handleRestore(barang.id)}
                                            disabled={actionLoading === barang.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === barang.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                            <span>Kembalikan</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDelete(barang.id)}
                                            disabled={actionLoading === barang.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600/20 text-red-400 text-sm font-medium hover:bg-red-600/30 transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === barang.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            <span>Hapus</span>
                                        </button>
                                    )}
                                </div>

                                {/* Deleted Info */}
                                {barang.deletedAt && (
                                    <div className="mt-3 pt-3 border-t border-[#333]">
                                        <p className="text-[#888] text-xs">
                                            Dihapus pada: {new Date(barang.deletedAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                        ))}
                    </div>
                )}
            </main>

            <Navbar />
        </div>
    );
};

export default SemuaBarangPage;
