import React, { useState, useEffect } from "react";
import { 
    X, 
    Package, 
    Calendar, 
    User, 
    Edit3, 
    Trash2, 
    Loader2, 
    AlertCircle,
    Check,
    Clock,
    CheckCircle,
    Minus,
    Plus
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { detailSetorService, type DetailSetorFull } from "../../../services/detailSetor.service";

interface TransactionDetailModalProps {
    detailSetorId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    detailSetorId,
    isOpen,
    onClose,
    onSuccess
}) => {
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<DetailSetorFull | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [editQty, setEditQty] = useState(0);
    const [saving, setSaving] = useState(false);
    
    // Delete confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Fetch detail when modal opens
    useEffect(() => {
        if (isOpen && detailSetorId) {
            fetchDetail();
        }
    }, [isOpen, detailSetorId]);

    const fetchDetail = async () => {
        if (!detailSetorId) return;
        
        setLoading(true);
        setError(null);
        try {
            const response = await detailSetorService.getDetailSetorById(detailSetorId);
            if (response.success && response.data) {
                setDetail(response.data);
                setEditQty(response.data.qty);
            } else {
                setError(response.message || 'Gagal memuat data');
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

    // Check if transaction can be edited/deleted
    const canModify = detail && !detail.tanggalSetor;

    // Handle edit
    const handleSaveEdit = async () => {
        if (!detail || editQty <= 0) return;
        
        setSaving(true);
        setError(null);
        try {
            const response = await detailSetorService.updateDetailSetorQty(detail.id, editQty);
            if (response.success && response.data) {
                setDetail(response.data);
                setIsEditing(false);
                if (onSuccess) onSuccess();
            } else {
                setError(response.message || 'Gagal mengupdate');
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
            const response = await detailSetorService.deleteDetailSetor(detail.id);
            if (response.success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                setError(response.message || 'Gagal menghapus');
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

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <div 
                className="bg-[#1e1e1e] w-full max-w-md max-h-[90vh] rounded-2xl overflow-hidden shadow-xl border border-[#333] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#333]">
                    <h2 className="text-white font-bold text-lg">Detail Transaksi</h2>
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

                            {/* Status Badge */}
                            <div className="flex items-center gap-2">
                                {detail.tanggalSetor ? (
                                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                        <CheckCircle className="w-4 h-4" />
                                        Sudah Disetor
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                        <Clock className="w-4 h-4" />
                                        Belum Disetor
                                    </span>
                                )}
                            </div>

                            {/* Item Info */}
                            <div className="bg-[#252525] rounded-xl p-4">
                                <div className="flex gap-3">
                                    {detail.stokHarian.barang.gambar ? (
                                        <img 
                                            src={detail.stokHarian.barang.gambar}
                                            alt={detail.stokHarian.barang.nama}
                                            className="w-16 h-16 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-[#333] flex items-center justify-center">
                                            <Package className="w-8 h-8 text-[#666]" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-white font-bold">{detail.stokHarian.barang.nama}</h3>
                                        <p className="text-[#B09331] font-semibold">
                                            Rp {formatRupiah(detail.stokHarian.harga)} / pcs
                                        </p>
                                        <div className="flex items-center gap-1 text-[#888] text-xs mt-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatTanggal(detail.stokHarian.tanggalEdar)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Qty & Total */}
                            {isEditing ? (
                                <div className="bg-[#252525] rounded-xl p-4 space-y-3">
                                    <label className="text-[#888] text-sm">Edit Quantity</label>
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => setEditQty(Math.max(1, editQty - 1))}
                                            className="w-10 h-10 rounded-xl bg-[#333] text-white flex items-center justify-center hover:bg-[#444] transition-colors"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <input
                                            type="number"
                                            value={editQty}
                                            onChange={(e) => setEditQty(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-20 text-center text-2xl font-bold text-white bg-transparent border-b-2 border-[#B09331] outline-none"
                                            min={1}
                                        />
                                        <button
                                            onClick={() => setEditQty(editQty + 1)}
                                            className="w-10 h-10 rounded-xl bg-[#333] text-white flex items-center justify-center hover:bg-[#444] transition-colors"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[#888] text-sm">Total Baru</p>
                                        <p className="text-[#B09331] text-xl font-bold">
                                            Rp {formatRupiah(detail.stokHarian.harga * editQty)}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#252525] rounded-xl p-3 text-center">
                                        <p className="text-[#888] text-xs mb-1">Quantity</p>
                                        <p className="text-white text-2xl font-bold">{detail.qty}</p>
                                    </div>
                                    <div className="bg-[#252525] rounded-xl p-3 text-center">
                                        <p className="text-[#888] text-xs mb-1">Total Harga</p>
                                        <p className="text-[#B09331] text-lg font-bold">
                                            Rp {formatRupiah(detail.totalHarga)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* User Info */}
                            <div className="bg-[#252525] rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <User className="w-4 h-4 text-[#B09331]" />
                                    <span className="text-white text-sm font-medium">Informasi User</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[#888]">Nama</span>
                                        <span className="text-white font-medium">{detail.ambilBarang.user?.nama_lengkap || '-'}</span>
                                    </div>
                                    {detail.ambilBarang.setorKepada && (
                                        <div className="flex justify-between">
                                            <span className="text-[#888]">Setor Kepada</span>
                                            <span className="text-white">{detail.ambilBarang.setorKepada.nama_lengkap}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-[#888]">Tanggal Ambil</span>
                                        <span className="text-white">{formatTanggal(detail.ambilBarang.tanggalAmbil)} {formatTime(detail.ambilBarang.tanggalAmbil)}</span>
                                    </div>
                                    {detail.tanggalSetor && (
                                        <div className="flex justify-between">
                                            <span className="text-[#888]">Tanggal Setor</span>
                                            <span className="text-green-400">{formatTanggal(detail.tanggalSetor)} {formatTime(detail.tanggalSetor)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Delete Confirmation */}
                            {showDeleteConfirm && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
                                    <p className="text-red-400 font-semibold text-center">Hapus Transaksi Ini?</p>
                                    <p className="text-[#888] text-sm text-center">
                                        Stok akan dikembalikan ke jumlah semula
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
                            {/* WhatsApp */}
                            {detail.ambilBarang.user.nomor_telepon && (
                                <a
                                    href={`https://wa.me/${formatWhatsAppNumber(detail.ambilBarang.user.nomor_telepon)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors"
                                    title={`Chat WhatsApp: ${detail.ambilBarang.user.nomor_telepon}`}
                                >
                                    <FaWhatsapp className="w-5 h-5" />
                                </a>
                            )}

                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditQty(detail.qty);
                                        }}
                                        disabled={saving}
                                        className="flex-1 bg-[#333] text-white font-medium py-3 rounded-xl hover:bg-[#444] transition-colors disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={saving || editQty === detail.qty || editQty <= 0}
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
                                                Edit Qty
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

export default TransactionDetailModal;
