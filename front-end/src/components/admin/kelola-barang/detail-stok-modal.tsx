import React from "react";
import { X, BoxIcon, Wallet, HandHelping, HandCoins, Calendar, FileText } from "lucide-react";
import type { StokHarian } from "../../../types/barang.types";

interface DetailStokModalProps {
    stok: StokHarian | null;
    isOpen: boolean;
    onClose: () => void;
}

const DetailStokModal: React.FC<DetailStokModalProps> = ({ stok, isOpen, onClose }) => {
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

    // Calculate estimated profit
    // Initial Stock = Current Stock + Total Taken (Jumlah Ambil)
    const initialStok = stok.stok + (stok.jumlah_ambil || 0);
    const estimatedRevenue = initialStok * stok.harga;
    const estimatedProfit = estimatedRevenue - stok.modal;
    const isProfitable = estimatedProfit >= 0;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-[#1e1e1e] w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-[#333]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Image */}
                <div className="relative h-40">
                    {stok.barang?.gambar ? (
                        <img 
                            src={stok.barang.gambar} 
                            alt={stok.barang?.nama} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center">
                            <BoxIcon className="w-16 h-16 text-white/30" />
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
                        <h2 className="text-white text-xl font-bold">{stok.barang?.nama || 'Unknown'}</h2>
                        <p className="text-[#B09331] font-semibold">Rp {formatRupiah(stok.harga)}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#252525] rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <BoxIcon className="w-4 h-4 text-blue-400" />
                                <span className="text-[#888] text-xs">Stok Tersisa</span>
                            </div>
                            <p className="text-white text-xl font-bold">{stok.stok}</p>
                        </div>
                        <div className="bg-[#252525] rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Wallet className="w-4 h-4 text-green-400" />
                                <span className="text-[#888] text-xs">Modal</span>
                            </div>
                            <p className="text-white text-xl font-bold">Rp {formatRupiah(stok.modal)}</p>
                        </div>
                        <div className="bg-[#252525] rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <HandHelping className="w-4 h-4 text-yellow-400" />
                                <span className="text-[#888] text-xs">Jumlah Ambil</span>
                            </div>
                            <p className="text-white text-xl font-bold">{stok.jumlah_ambil || 0}</p>
                        </div>
                        <div className="bg-[#252525] rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <HandCoins className="w-4 h-4 text-purple-400" />
                                <span className="text-[#888] text-xs">Jumlah Setor</span>
                            </div>
                            <p className="text-white text-xl font-bold">{stok.jumlah_setor || 0}</p>
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

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <button 
                            onClick={onClose}
                            className="flex-1 bg-[#333] text-white font-semibold py-3 rounded-xl hover:bg-[#444] transition-colors"
                        >
                            Tutup
                        </button>
                        <button 
                            className="flex-1 bg-[#B09331] text-white font-semibold py-3 rounded-xl hover:bg-[#C4A73B] transition-colors"
                        >
                            Edit Stok
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailStokModal;
