import React, { useState, useEffect } from "react";
import { 
    X, 
    TrendingUp, 
    TrendingDown,
    Calendar,
    User,
    Trash2, 
    Loader2, 
    AlertCircle,
    Package,
    Info
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { keuanganService } from "../../../services/keuangan.service";
import type { DetailKeuangan } from "../../../types/keuangan.types";

interface KeuanganDetailModalProps {
    transaksi: DetailKeuangan | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

// Extended type to include detailSetor info and isLastTransaction from backend
interface DetailKeuanganFull extends DetailKeuangan {
    isLastTransaction?: boolean;
    detailSetor?: {
        id: number;
        qty: number;
        totalHarga: number;
        ambilBarang: {
            user: {
                id: number;
                nama_lengkap: string;
                username: string;
                nomor_telepon?: string;
            };
        };
        stokHarian: {
            harga: number;
            barang: {
                nama: string;
                gambar?: string;
            };
        };
    } | null;
}

const KeuanganDetailModal: React.FC<KeuanganDetailModalProps> = ({
    transaksi,
    isOpen,
    onClose,
    onSuccess
}) => {
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<DetailKeuanganFull | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Delete confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Fetch full detail when modal opens
    useEffect(() => {
        if (isOpen && transaksi) {
            fetchDetail();
        }
    }, [isOpen, transaksi]);

    const fetchDetail = async () => {
        if (!transaksi) return;
        
        setLoading(true);
        setError(null);
        setShowDeleteConfirm(false);
        try {
            const data = await keuanganService.getDetailKeuanganById(transaksi.id);
            if (data) {
                setDetail(data as DetailKeuanganFull);
            } else {
                setError('Gagal memuat data');
            }
        } catch (err) {
            console.error('Error fetching detail:', err);
            setError('Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

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

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatWhatsAppNumber = (phone: string) => {
        return phone.replace(/^0/, '62').replace(/[^0-9]/g, '');
    };

    // Check if transaction can be deleted:
    // - Only manual entries (no detailSetorId)
    // - Only the last transaction
    const canDelete = detail && detail.detailSetorId === null && detail.isLastTransaction === true;

    // Handle delete
    const handleDelete = async () => {
        if (!detail) return;
        
        setDeleting(true);
        setError(null);
        try {
            const response = await keuanganService.deleteDetailKeuangan(detail.id);
            if (response.success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                setError(response.message);
            }
        } catch (err) {
            console.error('Error deleting:', err);
            setError('Terjadi kesalahan');
        } finally {
            setDeleting(false);
        }
    };

    const handleClose = () => {
        setShowDeleteConfirm(false);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    const isPemasukan = detail?.tipe === 'PEMASUKAN';
    const colorClass = isPemasukan ? 'green' : 'red';

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <div 
                className="bg-[#1e1e1e] w-full max-w-md max-h-[90vh] rounded-2xl overflow-hidden shadow-xl border border-[#333] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b border-[#333] bg-${colorClass}-500/10`}>
                    <div className="flex items-center gap-2">
                        {isPemasukan ? (
                            <TrendingUp className={`w-5 h-5 text-green-400`} />
                        ) : (
                            <TrendingDown className={`w-5 h-5 text-red-400`} />
                        )}
                        <h2 className="text-white font-bold text-lg">Detail Transaksi</h2>
                    </div>
                    <button 
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[#888] hover:text-white hover:bg-[#444] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[#B09331] mb-2" />
                            <p className="text-[#888] text-sm">Memuat data...</p>
                        </div>
                    ) : error && !detail ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="w-12 h-12 text-red-400 mb-2" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    ) : detail ? (
                        <>
                            {/* Error message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Type Badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                    isPemasukan 
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                    {isPemasukan ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    {isPemasukan ? 'OMZET' : 'PENGELUARAN'}
                                </span>
                                {detail.detailSetorId !== null && (
                                    <span className="text-[#888] text-xs">(Dari setor barang)</span>
                                )}
                                {detail.isLastTransaction && detail.detailSetorId === null && (
                                    <span className="text-[#B09331] text-xs">(Dapat dihapus)</span>
                                )}
                            </div>

                            {/* Title & Nominal */}
                            <div className="bg-[#252525] rounded-xl p-4">
                                <h3 className="text-white font-bold text-lg mb-2">{detail.title}</h3>
                                <p className={`text-2xl font-bold ${isPemasukan ? 'text-green-400' : 'text-red-400'}`}>
                                    {isPemasukan ? '+' : '-'}Rp {formatRupiah(detail.nominal)}
                                </p>
                            </div>

                            {/* Time Info */}
                            <div className="flex items-center gap-2 text-[#888] text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>{formatTanggal(detail.createdAt)}</span>
                                <span>•</span>
                                <span>{formatTime(detail.createdAt)}</span>
                            </div>

                            {/* Related Item Info (if from setor) */}
                            {detail.detailSetor && (
                                <div className="bg-[#252525] rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Package className="w-4 h-4 text-[#B09331]" />
                                        <span className="text-white text-sm font-medium">Detail Barang</span>
                                    </div>
                                    <div className="flex gap-3">
                                        {detail.detailSetor.stokHarian.barang.gambar ? (
                                            <img 
                                                src={detail.detailSetor.stokHarian.barang.gambar}
                                                alt={detail.detailSetor.stokHarian.barang.nama}
                                                className="w-14 h-14 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-xl bg-[#333] flex items-center justify-center">
                                                <Package className="w-7 h-7 text-[#666]" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-white font-medium">{detail.detailSetor.stokHarian.barang.nama}</p>
                                            <p className="text-[#888] text-sm">
                                                {detail.detailSetor.qty} × Rp {formatRupiah(detail.detailSetor.stokHarian.harga)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Penyetor Info */}
                            {detail.detailSetor?.ambilBarang?.user && (
                                <div className="bg-[#252525] rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <User className="w-4 h-4 text-[#B09331]" />
                                        <span className="text-white text-sm font-medium">Penyetor</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-medium">{detail.detailSetor.ambilBarang.user.nama_lengkap}</p>
                                            <p className="text-[#888] text-sm">@{detail.detailSetor.ambilBarang.user.username}</p>
                                        </div>
                                        {detail.detailSetor.ambilBarang.user.nomor_telepon && (
                                            <a
                                                href={`https://wa.me/${formatWhatsAppNumber(detail.detailSetor.ambilBarang.user.nomor_telepon)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors"
                                            >
                                                <FaWhatsapp className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Keterangan */}
                            {detail.keterangan && (
                                <div className="bg-[#252525] rounded-xl p-4">
                                    <p className="text-[#888] text-sm mb-1">Keterangan</p>
                                    <p className="text-white">{detail.keterangan}</p>
                                </div>
                            )}

                            {/* Info why can't delete */}
                            {detail.detailSetorId === null && !detail.isLastTransaction && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-2">
                                    <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-yellow-400 text-sm">
                                        Hanya transaksi terakhir yang dapat dihapus demi keamanan data
                                    </p>
                                </div>
                            )}

                            {/* Delete Confirmation */}
                            {showDeleteConfirm && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
                                    <p className="text-red-400 font-semibold text-center">Hapus Transaksi Ini?</p>
                                    <p className="text-[#888] text-sm text-center">
                                        Saldo akan dikembalikan ke kondisi sebelumnya
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={deleting}
                                            className="flex-1 bg-[#333] text-white font-medium py-2 rounded-xl hover:bg-[#444] transition-colors disabled:opacity-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            className="flex-1 bg-red-600 text-white font-medium py-2 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {deleting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Menghapus...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4" />
                                                    Ya, Hapus
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                {detail && !loading && (
                    <div className="p-4 border-t border-[#333] bg-[#1a1a1a]">
                        <div className="flex gap-2">
                            {canDelete && !showDeleteConfirm && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-12 bg-red-600/20 text-red-400 font-medium py-3 rounded-xl hover:bg-red-600/30 transition-colors flex items-center justify-center"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={handleClose}
                                className="flex-1 bg-[#B09331] text-white font-semibold py-3 rounded-xl hover:bg-[#C4A73B] transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeuanganDetailModal;
