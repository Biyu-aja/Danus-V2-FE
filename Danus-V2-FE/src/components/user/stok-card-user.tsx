import React from "react";
import { BoxIcon } from "lucide-react";

interface StokCardUserProps {
    id: number;
    nama_item: string;
    harga_item: number;
    stok_tersedia: number;
    gambar?: string;
    onAmbil?: () => void;
}

const StokCardUser: React.FC<StokCardUserProps> = ({
    nama_item,
    harga_item,
    stok_tersedia,
    gambar,
    onAmbil,
}) => {
    // Format harga
    const formatHarga = (harga: number) => {
        return harga.toLocaleString('id-ID');
    };

    const isAvailable = stok_tersedia > 0;

    return (
        <div className="relative w-full bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-[#333]">
            <div className="flex flex-row">
                {/* Image Section */}
                <div className="relative w-24 h-24 flex-shrink-0">
                    {gambar ? (
                        <img 
                            src={gambar} 
                            alt={nama_item} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center">
                            <BoxIcon className="w-8 h-8 text-white/50" />
                        </div>
                    )}
                    {/* Stock Badge */}
                    <div className="absolute top-1 right-1">
                        <div className={`flex items-center gap-1 backdrop-blur-sm rounded-full px-2 py-0.5 ${
                            isAvailable ? 'bg-green-500/80' : 'bg-red-500/80'
                        }`}>
                            <span className="text-white text-xs font-bold">{stok_tersedia}</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-white text-sm line-clamp-1">{nama_item}</h3>
                        <p className="text-[#B09331] text-sm font-semibold mt-0.5">
                            Rp {formatHarga(harga_item)}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                            {isAvailable ? 'Tersedia' : 'Habis'}
                        </span>
                        {isAvailable && onAmbil && (
                            <button
                                onClick={onAmbil}
                                className="bg-[#B09331] hover:bg-[#C4A73B] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                Ambil
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StokCardUser;
