import React, { useState, useEffect } from "react";
import { 
    X, 
    TrendingUp, 
    TrendingDown,
    Calendar,
    User,
    Edit3, 
    Trash2, 
    Loader2, 
    AlertCircle,
    Check,
    Package
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

// Extended type to include detailSetor info from backend
interface DetailKeuanganFull extends DetailKeuangan {
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
    
    // Edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editNominal, setEditNominal] = useState(0);
    const [editKeterangan, setEditKeterangan] = useState("");
    const [saving, setSaving] = useState(false);
    
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
        try {
            const data = await keuanganService.getDetailKeuanganById(transaksi.id);
            if (data) {
                setDetail(data as DetailKeuanganFull);
                setEditTitle(data.title);
                setEditNominal(data.nominal);
                setEditKeterangan(data.keterangan || "");
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

    // Check if transaction can be edited/deleted (only manual entries)
    const canModify = detail && detail.detailSetorId === null;

    // Handle save edit
    const handleSaveEdit = async () => {
        if (!detail) return;
        
        setSaving(true);
        setError(null);
        try {
            const response = await keuanganService.updateDetailKeuangan(detail.id, {
                title: editTitle,
                nominal: editNominal,
                keterangan: editKeterangan || undefined,
            });
            if (response.success) {
                setIsEditing(false);
                fetchDetail();
                if (onSuccess) onSuccess();
            } else {
                setError(response.message);
            }
        } catch (err) {
            console.error('Error updating:', err);
            setError('Terjadi kesalahan');
        } finally {
            setSaving(false);
        }
    };

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
        setIsEditing(false);
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
                            <div className="flex items-center gap-2">
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
                                    {detail.tipe}
                                </span>
                                {!canModify && (
                                    <span className="text-[#888] text-xs">(Dari setor barang)</span>
                                )}
                            </div>

                            {/* Title & Nominal */}
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[#888] text-sm mb-1 block">Judul</label>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full bg-[#252525] text-white border border-[#444] rounded-xl p-3 focus:border-[#B09331] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[#888] text-sm mb-1 block">Nominal</label>
                                        <input
                                            type="number"
                                            value={editNominal}
                                            onChange={(e) => setEditNominal(parseInt(e.target.value) || 0)}
                                            className="w-full bg-[#252525] text-white border border-[#444] rounded-xl p-3 focus:border-[#B09331] focus:outline-none"
                                            min={1}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[#888] text-sm mb-1 block">Keterangan</label>
                                        <textarea
                                            value={editKeterangan}
                                            onChange={(e) => setEditKeterangan(e.target.value)}
                                            className="w-full bg-[#252525] text-white border border-[#444] rounded-xl p-3 focus:border-[#B09331] focus:outline-none resize-none h-20"
                                            placeholder="Opsional..."
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#252525] rounded-xl p-4">
                                    <h3 className="text-white font-bold text-lg mb-2">{detail.title}</h3>
                                    <p className={`text-2xl font-bold ${isPemasukan ? 'text-green-400' : 'text-red-400'}`}>
                                        {isPemasukan ? '+' : '-'}Rp {formatRupiah(detail.nominal)}
                                    </p>
                                </div>
                            )}

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
                            {!isEditing && detail.keterangan && (
                                <div className="bg-[#252525] rounded-xl p-4">
                                    <p className="text-[#888] text-sm mb-1">Keterangan</p>
                                    <p className="text-white">{detail.keterangan}</p>
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
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditTitle(detail.title);
                                            setEditNominal(detail.nominal);
                                            setEditKeterangan(detail.keterangan || "");
                                        }}
                                        disabled={saving}
                                        className="flex-1 bg-[#333] text-white font-medium py-3 rounded-xl hover:bg-[#444] transition-colors disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={saving || !editTitle || editNominal <= 0}
                                        className="flex-1 bg-[#B09331] text-white font-semibold py-3 rounded-xl hover:bg-[#C4A73B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Simpan
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    {canModify && !showDeleteConfirm && (
                                        <>
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="w-12 bg-red-600/20 text-red-400 font-medium py-3 rounded-xl hover:bg-red-600/30 transition-colors flex items-center justify-center"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex-1 bg-[#333] text-white font-medium py-3 rounded-xl hover:bg-[#444] transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                Edit
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 bg-[#B09331] text-white font-semibold py-3 rounded-xl hover:bg-[#C4A73B] transition-colors"
                                    >
                                        Tutup
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeuanganDetailModal;
