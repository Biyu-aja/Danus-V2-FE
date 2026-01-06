import React, { useState, useEffect } from "react";
import { 
    X, 
    BoxIcon, 
    Wallet, 
    HandHelping, 
    HandCoins, 
    Calendar, 
    FileText,
    Trash2,
    Loader2,
    AlertCircle,
    Edit3,
    User,
    CheckCircle,
    Clock,
    Users,
    Calendar1Icon,
    ArrowRight
} from "lucide-react";
import type { StokHarian } from "../../../types/barang.types";
import { stokService } from "../../../services/barang.service";
import EditStokModal from "./edit-stok-modal";
import { useNavigate } from "react-router-dom";

interface UserTransaction {
    user: { id: number; nama_lengkap: string; username: string; role: string };
    items: {
        id: number;
        qty: number;
        totalHarga: number;
        status: 'ambil' | 'setor';
        tanggalAmbil: string;
        tanggalSetor: string | null;
    }[];
    totalAmbil: number;
    totalSetor: number;
}

interface DetailStokModalProps {
    stok: StokHarian | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (updatedStok: StokHarian) => void;
    onDelete?: (id: number) => void;
}

const DetailStokModal: React.FC<DetailStokModalProps> = ({ 
    stok, 
    isOpen, 
    onClose,
    onUpdate,
    onDelete
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const navigate = useNavigate();


    if (!isOpen || !stok) return null;

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

    // Calculate estimated profit
    const initialStok = stok.stok + (stok.jumlah_ambil || 0);
    const estimatedRevenue = initialStok * stok.harga;
    const estimatedProfit = estimatedRevenue - stok.modal;
    const isProfitable = estimatedProfit >= 0;

    const handleDelete = async () => {
        setDeleting(true);
        setDeleteError(null);

        try {
            const response = await stokService.deleteStok(stok.id);
            if (response.success) {
                if (onDelete) onDelete(stok.id);
                onClose();
            } else {
                setDeleteError(response.message || 'Gagal menghapus stok');
            }
        } catch (err: any) {
            setDeleteError(err.message || 'Terjadi kesalahan');
        } finally {
            setDeleting(false);
        }
    };

    const handleEditSuccess = (updatedStok: StokHarian) => {
        if (onUpdate) onUpdate(updatedStok);
        setShowEditModal(false);
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <div 
                    className="bg-[#1e1e1e] w-full max-w-md max-h-[90vh] rounded-2xl overflow-hidden shadow-xl border border-[#333] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header with Image */}
                    <div className="relative h-32 flex-shrink-0">
                        {stok.barang?.gambar ? (
                            <img 
                                src={stok.barang.gambar} 
                                alt={stok.barang?.nama} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center">
                                <BoxIcon className="w-12 h-12 text-white/30" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        
                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Title */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h2 className="text-white text-lg font-bold">{stok.barang?.nama || 'Unknown'}</h2>
                            <p className="text-[#B09331] font-semibold text-sm">Rp {formatRupiah(stok.harga)}</p>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-4 space-y-4 overflow-y-auto flex-1">
                        {/* Delete Confirmation */}
                        {showDeleteConfirm ? (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
                                <p className="text-red-400 font-semibold text-center">Hapus Stok Ini?</p>
                                <p className="text-[#888] text-sm text-center">
                                    Modal Rp {formatRupiah(stok.modal)} akan dikembalikan ke saldo
                                </p>
                                
                                {deleteError && (
                                    <div className="flex items-center gap-2 p-2 bg-red-500/20 rounded-lg text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        {deleteError}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setDeleteError(null);
                                        }}
                                        disabled={deleting}
                                        className="flex-1 bg-[#333] text-white font-semibold py-2 rounded-xl hover:bg-[#444] transition-colors disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                        ) : (
                            <>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-[#252525] rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <BoxIcon className="w-4 h-4 text-blue-400" />
                                            <span className="text-[#888] text-xs">Stok Tersisa</span>
                                        </div>
                                        <p className="text-white text-lg font-bold">{stok.stok}</p>
                                    </div>
                                    <div className="bg-[#252525] rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Wallet className="w-4 h-4 text-green-400" />
                                            <span className="text-[#888] text-xs">Modal</span>
                                        </div>
                                        <p className="text-white text-lg font-bold">Rp {formatRupiah(stok.modal)}</p>
                                    </div>
                                    <div className="bg-[#252525] rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <HandHelping className="w-4 h-4 text-yellow-400" />
                                            <span className="text-[#888] text-xs">Jumlah Ambil</span>
                                        </div>
                                        <p className="text-white text-lg font-bold">{stok.jumlah_ambil || 0}</p>
                                    </div>
                                    <div className="bg-[#252525] rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <HandCoins className="w-4 h-4 text-purple-400" />
                                            <span className="text-[#888] text-xs">User Setor</span>
                                        </div>
                                        <p className="text-white text-lg font-bold">{stok.jumlah_setor || 0}</p>
                                    </div>
                                </div>

                                {/* Tanggal Edar */}
                                <div className="flex items-center gap-2 text-[#888] text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>Tanggal Edar: {formatTanggal(stok.tanggalEdar)}</span>
                                </div>

                                {/* Estimated Profit */}
                                <div className={`rounded-xl p-3 ${isProfitable ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                                            Estimasi {isProfitable ? 'Keuntungan' : 'Kerugian'}
                                        </span>
                                        <span className={`text-lg font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                                            {isProfitable ? '+' : '-'}Rp {formatRupiah(Math.abs(estimatedProfit))}
                                        </span>
                                    </div>
                                </div>

                                {/* Keterangan */}
                                {stok.keterangan && (
                                    <div className="bg-[#252525] rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-4 h-4 text-[#888]" />
                                            <span className="text-[#888] text-xs">Keterangan</span>
                                        </div>
                                        <p className="text-white text-sm">{stok.keterangan}</p>
                                    </div>
                                )}

                                {/* Users Section */}
                                <div className="bg-[#B09331] rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => navigate(`/admin/detail-stok/${stok.id}`)}
                                        className="w-full flex items-center justify-between p-3 hover:bg-[#e2bd41] transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Calendar1Icon className="w-4 h-4" />
                                            <span className="text-white font-medium text-sm">Lihat Absensi</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <button 
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-12 bg-red-600/20 text-red-400 font-semibold py-3 rounded-xl hover:bg-red-600/30 transition-colors flex items-center justify-center"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={onClose}
                                        className="flex-1 bg-[#333] text-white font-semibold py-3 rounded-xl hover:bg-[#444] transition-colors"
                                    >
                                        Tutup
                                    </button>
                                    <button 
                                        onClick={() => setShowEditModal(true)}
                                        className="flex-1 bg-[#B09331] text-white font-semibold py-3 rounded-xl hover:bg-[#C4A73B] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditStokModal
                stok={stok}
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={handleEditSuccess}
            />
        </>
    );
};

export default DetailStokModal;
