import React, { useState } from "react";
import { X, Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";
import type { StokHarian } from "../../types/barang.types";

interface AmbilStokModalProps {
    isOpen: boolean;
    onClose: () => void;
    stok: StokHarian | null;
    onSubmit: (stokHarianId: number, qty: number) => Promise<void>;
    isLoading?: boolean;
}

const AmbilStokModal: React.FC<AmbilStokModalProps> = ({
    isOpen,
    onClose,
    stok,
    onSubmit,
    isLoading = false,
}) => {
    const [qty, setQty] = useState(1);

    if (!isOpen || !stok) return null;

    const formatHarga = (harga: number) => {
        return harga.toLocaleString('id-ID');
    };

    const handleDecrease = () => {
        if (qty > 1) setQty(qty - 1);
    };

    const handleIncrease = () => {
        if (qty < stok.stok) setQty(qty + 1);
    };

    const totalHarga = stok.harga * qty;

    const handleSubmit = async () => {
        await onSubmit(stok.id, qty);
        setQty(1);
    };

    const handleClose = () => {
        setQty(1);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-end justify-center"
            onClick={handleClose}
        >
            <div 
                className="bg-[#1e1e1e] w-full max-w-md rounded-t-3xl p-6 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white text-lg font-bold flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[#B09331]" />
                        Ambil Barang
                    </h2>
                    <button 
                        onClick={handleClose}
                        className="text-[#888] hover:text-white transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Product Info */}
                <div className="flex gap-4 mb-6">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#333]">
                        {stok.barang?.gambar ? (
                            <img 
                                src={stok.barang.gambar} 
                                alt={stok.barang?.nama} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-white/50" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-semibold text-base">{stok.barang?.nama || 'Unknown'}</h3>
                        <p className="text-[#B09331] font-bold text-lg">Rp {formatHarga(stok.harga)}</p>
                        <p className="text-[#888] text-sm">Stok tersedia: {stok.stok}</p>
                    </div>
                </div>

                {/* Quantity Selector */}
                <div className="bg-[#2a2a2a] rounded-xl p-4 mb-6">
                    <p className="text-[#888] text-sm mb-3">Jumlah yang diambil</p>
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleDecrease}
                            disabled={qty <= 1}
                            className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#444] transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        
                        <div className="flex flex-col items-center">
                            <span className="text-white text-3xl font-bold">{qty}</span>
                            <span className="text-[#888] text-xs">item</span>
                        </div>

                        <button
                            onClick={handleIncrease}
                            disabled={qty >= stok.stok}
                            className="w-10 h-10 rounded-full bg-[#B09331] flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#C4A73B] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <span className="text-[#888]">Total yang harus disetor:</span>
                    <span className="text-[#B09331] text-xl font-bold">Rp {formatHarga(totalHarga)}</span>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || qty < 1}
                    className="w-full bg-gradient-to-r from-[#B09331] to-[#D4AF37] text-white font-semibold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#B09331]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        <>
                            <ShoppingBag className="w-5 h-5" />
                            Konfirmasi Pengambilan
                        </>
                    )}
                </button>
            </div>

            <style>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AmbilStokModal;
