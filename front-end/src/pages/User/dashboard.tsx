import React, { useState, useEffect } from "react";
import Header from "../../components/general/header";
import UserNavbar from "../../components/user/navbar";
import StokCardUser from "../../components/user/stok-card-user";
import AmbilStokModal from "../../components/user/ambil-stok-modal";
import { Loader2, Package, ShoppingBag, Wallet, AlertCircle } from "lucide-react";
import { stokService } from "../../services/barang.service";
import { ambilBarangService, type AmbilBarang } from "../../services/ambilBarang.service";
import { authService } from "../../services/auth.service";
import type { StokHarian } from "../../types/barang.types";

const UserDashboard: React.FC = () => {
    const [stokHariIni, setStokHariIni] = useState<StokHarian[]>([]);
    const [myAmbilBarang, setMyAmbilBarang] = useState<AmbilBarang[]>([]);
    const [loadingStok, setLoadingStok] = useState(true);
    const [loadingAmbil, setLoadingAmbil] = useState(true);
    const [selectedStok, setSelectedStok] = useState<StokHarian | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const currentUser = authService.getCurrentUser();

    // Fetch stok hari ini
    useEffect(() => {
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
        fetchStok();
    }, []);

    // Fetch my ambil barang
    useEffect(() => {
        const fetchAmbilBarang = async () => {
            if (!currentUser) return;
            
            setLoadingAmbil(true);
            try {
                const response = await ambilBarangService.getAmbilBarangByUserId(currentUser.id);
                if (response.success && response.data) {
                    // Filter hanya yang belum setor
                    const belumSetor = response.data.filter(item => item.status === 'BELUM_SETOR');
                    setMyAmbilBarang(belumSetor);
                }
            } catch (err) {
                console.error('Error fetching ambil barang:', err);
            } finally {
                setLoadingAmbil(false);
            }
        };
        fetchAmbilBarang();
    }, [currentUser?.id]);

    // Calculate summary
    const totalItemDiambil = myAmbilBarang.reduce((acc, item) => {
        return acc + item.detailSetor.reduce((sum, detail) => sum + detail.qty, 0);
    }, 0);

    const totalHarusSetor = myAmbilBarang.reduce((acc, item) => {
        return acc + item.detailSetor.reduce((sum, detail) => sum + detail.totalHarga, 0);
    }, 0);

    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
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
            // For now, we'll use userId 1 as admin (setorKepadaId)
            // In a real app, this should be configurable or fetched
            const response = await ambilBarangService.createAmbilBarang({
                userId: currentUser.id,
                setorKepadaId: 1, // Default admin ID
                items: [{ stokHarianId, qty }],
            });

            if (response.success) {
                setSuccessMessage(`Berhasil mengambil ${qty} item!`);
                setShowModal(false);
                
                // Refresh data
                const stokResponse = await stokService.getStokHariIni();
                if (stokResponse.success && stokResponse.data) {
                    setStokHariIni(stokResponse.data);
                }
                
                const ambilResponse = await ambilBarangService.getAmbilBarangByUserId(currentUser.id);
                if (ambilResponse.success && ambilResponse.data) {
                    const belumSetor = ambilResponse.data.filter(item => item.status === 'BELUM_SETOR');
                    setMyAmbilBarang(belumSetor);
                }

                // Clear success message after 3 seconds
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
                {/* Welcome Section */}
                <div className="bg-gradient-to-br from-[#B09331] to-[#8B7328] rounded-2xl p-4 shadow-lg">
                    <h1 className="text-white text-lg font-bold">
                        Halo, {currentUser?.nama_lengkap || 'User'}! 👋
                    </h1>
                    <p className="text-white/80 text-sm mt-1">
                        Siap jualan hari ini?
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#333]">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Package className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-[#888] text-xs">Item Diambil</span>
                        </div>
                        <p className="text-white text-2xl font-bold">
                            {loadingAmbil ? '...' : totalItemDiambil}
                        </p>
                    </div>
                    
                    <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#333]">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Wallet className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-[#888] text-xs">Harus Setor</span>
                        </div>
                        <p className="text-white text-xl font-bold">
                            {loadingAmbil ? '...' : `Rp ${formatRupiah(totalHarusSetor)}`}
                        </p>
                    </div>
                </div>

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

                {/* Stok Hari Ini Section */}
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-white font-bold text-base flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-[#B09331]" />
                            Stok Hari Ini
                        </h2>
                        <span className="text-[#888] text-xs">{stokHariIni.length} item</span>
                    </div>

                    {loadingStok ? (
                        <div className="flex items-center justify-center h-[10rem] bg-[#1e1e1e] rounded-xl">
                            <div className="flex flex-col items-center gap-2 text-[#888]">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p className="text-sm">Memuat stok...</p>
                            </div>
                        </div>
                    ) : stokHariIni.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[10rem] bg-[#1e1e1e] rounded-xl border border-dashed border-[#444]">
                            <Package className="w-12 h-12 text-[#444] mb-2" />
                            <p className="text-[#888] text-sm">Belum ada stok hari ini</p>
                            <p className="text-[#666] text-xs">Tunggu admin menambahkan stok</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {stokHariIni.map((item) => (
                                <StokCardUser
                                    key={item.id}
                                    id={item.id}
                                    nama_item={item.barang?.nama || "Unknown"}
                                    harga_item={item.harga}
                                    stok_tersedia={item.stok}
                                    gambar={item.barang?.gambar}
                                    onAmbil={() => handleAmbilClick(item)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* My Current Holdings Section */}
                {!loadingAmbil && myAmbilBarang.length > 0 && (
                    <div className="mt-4">
                        <h2 className="text-white font-bold text-base flex items-center gap-2 mb-3">
                            <Package className="w-5 h-5 text-blue-400" />
                            Barang yang Kamu Bawa
                        </h2>
                        <div className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden">
                            {myAmbilBarang.map((ambil) => (
                                <div key={ambil.id} className="border-b border-[#333] last:border-b-0">
                                    <div className="p-3 bg-[#252525]">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#888] text-xs">
                                                {new Date(ambil.tanggalAmbil).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                                                Belum Setor
                                            </span>
                                        </div>
                                    </div>
                                    {ambil.detailSetor.map((detail) => (
                                        <div key={detail.id} className="flex items-center gap-3 p-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#333] flex-shrink-0">
                                                {detail.stokHarian.barang.gambar ? (
                                                    <img 
                                                        src={detail.stokHarian.barang.gambar} 
                                                        alt={detail.stokHarian.barang.nama}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-white/50" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white text-sm font-medium">
                                                    {detail.stokHarian.barang.nama}
                                                </p>
                                                <p className="text-[#888] text-xs">
                                                    {detail.qty} x Rp {formatRupiah(detail.stokHarian.harga)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[#B09331] font-bold text-sm">
                                                    Rp {formatRupiah(detail.totalHarga)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Ambil Modal */}
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

export default UserDashboard;
