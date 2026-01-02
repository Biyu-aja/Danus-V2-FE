import React, { useState, useEffect } from "react";
import Header from "../../components/general/header";
import UserNavbar from "../../components/user/navbar";
import AmbilStokModal from "../../components/user/ambil-stok-modal";
import { Loader2, Package, ShoppingBag, BoxIcon, AlertCircle } from "lucide-react";
import { stokService } from "../../services/barang.service";
import { ambilBarangService } from "../../services/ambilBarang.service";
import { authService } from "../../services/auth.service";
import type { StokHarian } from "../../types/barang.types";

const AmbilStokPage: React.FC = () => {
    const [stokHariIni, setStokHariIni] = useState<StokHarian[]>([]);
    const [loadingStok, setLoadingStok] = useState(true);
    const [selectedStok, setSelectedStok] = useState<StokHarian | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const currentUser = authService.getCurrentUser();

    // Fetch stok hari ini
    useEffect(() => {
        fetchStok();
    }, []);

    const fetchStok = async () => {
        setLoadingStok(true);
        try {
            const response = await stokService.getStokHariIni();
            if (response.success && response.data) {
                setStokHariIni(response.data);
            }
        } catch (err) {
            console.error('Error fetching stok:', err);
        } finally {
            setLoadingStok(false);
        }
    };

    const formatHarga = (harga: number) => {
        return harga.toLocaleString('id-ID');
    };

    const handleAmbilClick = (stok: StokHarian) => {
        setSelectedStok(stok);
        setShowModal(true);
        setError(null);
    };

    const handleSubmitAmbil = async (stokHarianId: number, qty: number) => {
        if (!currentUser) {
            setError('User tidak ditemukan. Silakan login ulang.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await ambilBarangService.createAmbilBarang({
                userId: currentUser.id,
                setorKepadaId: 1, // Default admin ID
                items: [{ stokHarianId, qty }],
            });

            if (response.success) {
                setSuccessMessage(`Berhasil mengambil ${qty} item!`);
                setShowModal(false);
                fetchStok(); // Refresh stok
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
            
            <main className="flex flex-col mt-[3.5rem] gap-4 p-4 mb-[5rem]">
                {/* Title */}
                <div className="flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-[#B09331]" />
                    <h1 className="text-white text-xl font-bold">Ambil Stok</h1>
                </div>

                <p className="text-[#888] text-sm">
                    Pilih barang yang ingin kamu ambil untuk dijual hari ini
                </p>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 text-sm">{successMessage}</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 text-sm">{error}</span>
                    </div>
                )}

                {/* Stock List */}
                {loadingStok ? (
                    <div className="flex items-center justify-center h-[15rem] bg-[#1e1e1e] rounded-xl">
                        <div className="flex flex-col items-center gap-2 text-[#888]">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-sm">Memuat stok...</p>
                        </div>
                    </div>
                ) : stokHariIni.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[15rem] bg-[#1e1e1e] rounded-xl border border-dashed border-[#444]">
                        <Package className="w-12 h-12 text-[#444] mb-2" />
                        <p className="text-[#888] text-sm">Belum ada stok hari ini</p>
                        <p className="text-[#666] text-xs">Tunggu admin menambahkan stok</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {stokHariIni.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => item.stok > 0 && handleAmbilClick(item)}
                                className={`relative bg-[#1e1e1e] rounded-xl overflow-hidden border border-[#333] ${
                                    item.stok > 0 ? 'cursor-pointer hover:border-[#B09331] transition-all' : 'opacity-50'
                                }`}
                            >
                                {/* Image */}
                                <div className="w-full h-28">
                                    {item.barang?.gambar ? (
                                        <img 
                                            src={item.barang.gambar} 
                                            alt={item.barang?.nama} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center">
                                            <BoxIcon className="w-10 h-10 text-white/30" />
                                        </div>
                                    )}
                                </div>

                                {/* Stock Badge */}
                                <div className="absolute top-2 right-2">
                                    <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                        item.stok > 0 ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'
                                    }`}>
                                        {item.stok}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-3">
                                    <h3 className="text-white font-semibold text-sm line-clamp-1">
                                        {item.barang?.nama || "Unknown"}
                                    </h3>
                                    <p className="text-[#B09331] font-bold text-sm mt-1">
                                        Rp {formatHarga(item.harga)}
                                    </p>
                                    
                                    {item.stok > 0 ? (
                                        <button className="w-full mt-2 bg-[#B09331] hover:bg-[#C4A73B] text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                                            Ambil
                                        </button>
                                    ) : (
                                        <div className="w-full mt-2 bg-[#333] text-[#666] text-xs font-semibold py-2 rounded-lg text-center">
                                            Habis
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            <AmbilStokModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                stok={selectedStok}
                onSubmit={handleSubmitAmbil}
                isLoading={isSubmitting}
            />

            <UserNavbar />
        </div>
    );
};

export default AmbilStokPage;
