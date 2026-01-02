import React, { useState, useEffect } from "react";
import Header from "../../components/general/header";
import UserNavbar from "../../components/user/navbar";
import { Loader2, Package, FileText, CheckCircle, Clock } from "lucide-react";
import { ambilBarangService, type AmbilBarang } from "../../services/ambilBarang.service";
import { authService } from "../../services/auth.service";

const RiwayatPage: React.FC = () => {
    const [riwayat, setRiwayat] = useState<AmbilBarang[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'semua' | 'belum_setor' | 'sudah_setor'>('semua');

    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        const fetchRiwayat = async () => {
            if (!currentUser) return;

            setLoading(true);
            try {
                const response = await ambilBarangService.getAmbilBarangByUserId(currentUser.id);
                if (response.success && response.data) {
                    setRiwayat(response.data);
                }
            } catch (err) {
                console.error('Error fetching riwayat:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRiwayat();
    }, [currentUser?.id]);

    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const formatTanggal = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter data
    const filteredRiwayat = riwayat.filter(item => {
        if (filter === 'semua') return true;
        if (filter === 'belum_setor') return item.status === 'BELUM_SETOR';
        if (filter === 'sudah_setor') return item.status === 'SUDAH_SETOR';
        return true;
    });

    // Calculate totals
    const totalBelumSetor = riwayat
        .filter(item => item.status === 'BELUM_SETOR')
        .reduce((acc, item) => {
            return acc + item.detailSetor.reduce((sum, detail) => sum + detail.totalHarga, 0);
        }, 0);

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
            
            <main className="flex flex-col mt-[3.5rem] gap-4 p-4 mb-[5rem]">
                {/* Title */}
                <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-[#B09331]" />
                    <h1 className="text-white text-xl font-bold">Riwayat Pengambilan</h1>
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-br from-[#B09331]/20 to-[#8B7328]/20 rounded-xl p-4 border border-[#B09331]/30">
                    <p className="text-[#888] text-xs mb-1">Total belum disetor</p>
                    <p className="text-[#B09331] text-2xl font-bold">Rp {formatRupiah(totalBelumSetor)}</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {[
                        { key: 'semua', label: 'Semua' },
                        { key: 'belum_setor', label: 'Belum Setor' },
                        { key: 'sudah_setor', label: 'Sudah Setor' },
                    ].map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setFilter(item.key as typeof filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                filter === item.key
                                    ? 'bg-[#B09331] text-white'
                                    : 'bg-[#1e1e1e] text-[#888] hover:text-white'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Riwayat List */}
                {loading ? (
                    <div className="flex items-center justify-center h-[15rem] bg-[#1e1e1e] rounded-xl">
                        <div className="flex flex-col items-center gap-2 text-[#888]">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-sm">Memuat riwayat...</p>
                        </div>
                    </div>
                ) : filteredRiwayat.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[15rem] bg-[#1e1e1e] rounded-xl border border-dashed border-[#444]">
                        <FileText className="w-12 h-12 text-[#444] mb-2" />
                        <p className="text-[#888] text-sm">Belum ada riwayat</p>
                        <p className="text-[#666] text-xs">Ambil stok untuk mulai jualan</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredRiwayat.map((ambil) => {
                            const totalHarga = ambil.detailSetor.reduce((sum, d) => sum + d.totalHarga, 0);
                            const totalQty = ambil.detailSetor.reduce((sum, d) => sum + d.qty, 0);

                            return (
                                <div 
                                    key={ambil.id} 
                                    className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between p-3 bg-[#252525] border-b border-[#333]">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-[#888]" />
                                            <span className="text-[#888] text-xs">
                                                {formatTanggal(ambil.tanggalAmbil)}
                                            </span>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                            ambil.status === 'BELUM_SETOR' 
                                                ? 'bg-yellow-500/20 text-yellow-400' 
                                                : 'bg-green-500/20 text-green-400'
                                        }`}>
                                            {ambil.status === 'SUDAH_SETOR' && <CheckCircle className="w-3 h-3" />}
                                            {ambil.status === 'BELUM_SETOR' ? 'Belum Setor' : 'Sudah Setor'}
                                        </span>
                                    </div>

                                    {/* Items */}
                                    <div className="p-3">
                                        {ambil.detailSetor.map((detail) => (
                                            <div key={detail.id} className="flex items-center gap-3 py-2">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#333] flex-shrink-0">
                                                    {detail.stokHarian.barang.gambar ? (
                                                        <img 
                                                            src={detail.stokHarian.barang.gambar} 
                                                            alt={detail.stokHarian.barang.nama}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center">
                                                            <Package className="w-4 h-4 text-white/50" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-medium truncate">
                                                        {detail.stokHarian.barang.nama}
                                                    </p>
                                                    <p className="text-[#888] text-xs">
                                                        {detail.qty} x Rp {formatRupiah(detail.stokHarian.harga)}
                                                    </p>
                                                </div>
                                                <p className="text-white font-medium text-sm">
                                                    Rp {formatRupiah(detail.totalHarga)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between p-3 bg-[#1a1a1a] border-t border-[#333]">
                                        <span className="text-[#888] text-xs">{totalQty} item</span>
                                        <span className="text-[#B09331] font-bold">Rp {formatRupiah(totalHarga)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <UserNavbar />
        </div>
    );
};

export default RiwayatPage;
