import { BoxIcon, Calendar, TrendingUp } from "lucide-react";
import React from "react";

interface props {
    id: number;
    nama_item: string;
    harga_item: number;
    jumlah_stok: number;
    jumlah_ambil?: number;
    jumlah_setor?: number;
    modal: number;
    tanggalEdar?: string;
    keterangan?: string;
    gambar?: string;
    onClick?: () => void;
}

const StokCard: React.FC<props> = ({ 
    id, 
    nama_item, 
    harga_item, 
    jumlah_stok, 
    jumlah_ambil,
    jumlah_setor,
    modal, 
    tanggalEdar, 
    keterangan,
    gambar,
    onClick 
}) => {
    // Format tanggal
    const formatTanggal = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    // Format harga
    const formatHarga = (harga: number) => {
        return harga.toLocaleString('id-ID');
    };

    // Calculate potential profit
    const potentialProfit = (jumlah_stok * harga_item) - modal;
    const isProfitable = potentialProfit >= 0;

    return (
        <div 
            onClick={onClick}
            className="relative w-[11rem] h-[15rem] rounded-xl hover:scale-[102%] cursor-pointer transition-all overflow-hidden shadow-lg"
        >
            {/* Background */}
            {gambar ? (
                <img 
                    src={gambar} 
                    alt={nama_item} 
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF]">
                    {/* Decorative circles */}
                    <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-4 border-white/10" />
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full border-4 border-white/10" />
                </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            {/* Top Section - Date Badge */}
            {tanggalEdar && (
                <div className="absolute top-2 left-2">
                    <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1">
                        <Calendar className="w-3 h-3 text-white" />
                        <span className="text-white text-xs font-medium">{formatTanggal(tanggalEdar)}</span>
                    </div>
                </div>
            )}
            
            {/* Stock Badge */}
            <div className="absolute top-2 right-2">
                <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1">
                    <BoxIcon className="w-3 h-3 text-white" />
                    <span className="text-white text-xs font-bold">{jumlah_stok}</span>
                </div>
            </div>
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2">
                {/* Name & Price */}
                <div>
                    <p className="font-bold text-lg text-white leading-tight line-clamp-1">{nama_item}</p>
                    <p className="text-white/90 text-sm font-semibold">Rp {formatHarga(harga_item)}</p>
                </div>
                
                {/* Stats */}
                <div className="flex flex-col gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-2">
                    <div className="flex justify-between items-center">
                        <span className="text-white/70 text-xs">Jumlah Ambil: </span>
                        <span className="text-white text-xs font-medium">{jumlah_ambil ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-white/70 text-xs">Jumlah Setor: </span>
                        <span className="text-white text-xs font-medium">{jumlah_setor ?? 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StokCard;