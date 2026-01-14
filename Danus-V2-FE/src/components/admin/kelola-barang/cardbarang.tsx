import React from "react";
import { Package } from "lucide-react";

interface props {
    id: number;
    nama: string;
    keterangan?: string;
    gambar?: string;
    onClick?: () => void;
}

const CardBarang: React.FC<props> = ({ id, nama, keterangan, gambar, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="relative min-w-[10rem] max-w-[11rem] h-[15rem] rounded-xl hover:scale-[102%] cursor-pointer transition-all overflow-hidden shadow-lg"
        >
            {/* Background Image or Placeholder */}
            {gambar ? (
                <img 
                    src={gambar} 
                    alt={nama} 
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-[#B39135]/20 flex items-center justify-center">
                            <Package className="w-8 h-8 text-[#B39135]" />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-bold text-lg text-white leading-tight line-clamp-1">{nama}</p>
                {keterangan && (
                    <p className="text-white/70 text-xs line-clamp-2 mt-1">{keterangan}</p>
                )}
            </div>
            
            {/* Top Badge */}
            <div className="absolute top-2 right-2">
                <div className="w-8 h-8 rounded-full bg-[#B39135] flex items-center justify-center shadow-md">
                    <Package className="w-4 h-4 text-white" />
                </div>
            </div>
        </div>
    );
};

export default CardBarang;