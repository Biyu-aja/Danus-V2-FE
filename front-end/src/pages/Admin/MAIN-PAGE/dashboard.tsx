import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/general/header";
import Navbar from "../../../components/admin/general-admin/navbar";
import Total_Saldo from "../../../components/admin/general-admin/totalsaldo";
import CardItem from "../../../components/admin/general-admin/carditem";
import { Loader2, Boxes, Users } from "lucide-react";
import StokCard from "../../../components/general/stokcard";
import TitleAdd from "../../../components/general/title-add";
import DetailStokModal from "../../../components/admin/kelola-barang/detail-stok-modal";
import { useSaldo, useLaporanHarian } from "../../../hooks/useKeuangan";
import { stokService } from "../../../services/barang.service";
import type { StokHarian } from "../../../types/barang.types";

const Dashboard:React.FC = () => {
    const navigate = useNavigate();
    
    // Fetch saldo dari backend
    const { saldo, isLoading: loadingSaldo } = useSaldo();
    
    // Fetch laporan harian dari backend
    const { laporan, isLoading: loadingLaporan } = useLaporanHarian();
    
    // Stok hari ini
    const [stokHariIni, setStokHariIni] = useState<StokHarian[]>([]);
    const [loadingStok, setLoadingStok] = useState(true);
    
    // Modal state
    const [selectedStok, setSelectedStok] = useState<StokHarian | null>(null);
    const [showStokModal, setShowStokModal] = useState(false);

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

    const handleStokClick = (item: StokHarian) => {
        setSelectedStok(item);
        setShowStokModal(true);
    };

    const handleCloseStokModal = () => {
        setShowStokModal(false);
        setSelectedStok(null);
    };
    
    // Format number ke Rupiah
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Calculate total jumlah ambil dan setor dari semua stok hari ini
    const totalJumlahAmbil = stokHariIni.reduce((acc, item) => acc + (item.jumlah_ambil || 0), 0);
    const totalJumlahSetor = stokHariIni.reduce((acc, item) => acc + (item.jumlah_setor || 0), 0);
    
    return(
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
                <main className="flex flex-col mt-[3.5rem] gap-3 p-3 mb-[4rem]">
                    {/* Total Saldo - gunakan data dari backend */}
                    <Total_Saldo saldo={saldo?.totalSaldo} isLoading={loadingSaldo} />
                    
                    <section className="flex flex-row gap-2">
                        {/* Pemasukan & Pengeluaran dari laporan harian */}
                        <CardItem 
                            label="Pemasukan" 
                            value={loadingLaporan ? "..." : formatRupiah(laporan?.pemasukan.total || 0)}
                        />
                        <CardItem 
                            label="Pengeluaran" 
                            value={loadingLaporan ? "..." : formatRupiah(laporan?.pengeluaran.total || 0)}
                        />
                    </section>
                    
                    {/* Clickable cards that navigate to status-user */}
                    <section 
                        className="flex flex-row gap-2 cursor-pointer" 
                        onClick={() => navigate('/admin/status-user')}
                    >
                        <CardItem label="Jumlah Ambil" value={loadingStok ? "..." : totalJumlahAmbil.toString()}/>
                        <CardItem label="Jumlah Setor" value={loadingStok ? "..." : totalJumlahSetor.toString()}/>
                    </section>

                    {/* Quick link to Status User */}
                    <button
                        onClick={() => navigate('/admin/status-user')}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#B09331]/20 to-[#D4AF37]/20 border border-[#B09331]/30 rounded-xl p-3 hover:bg-[#B09331]/30 transition-all"
                    >
                        <Users className="w-5 h-5 text-[#B09331]" />
                        <span className="text-[#B09331] font-semibold">Lihat Status User Hari Ini</span>
                    </button>
                    
                    <TitleAdd title="Stok Hari Ini" navigateTo="/admin/kelola-barang/tambah-stok"/>
                    
                    {loadingStok ? (
                        <div className="flex items-center justify-center h-[10rem] bg-[#1e1e1e] rounded-xl">
                            <div className="flex flex-col items-center gap-2 text-[#888]">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p className="text-sm">Memuat stok...</p>
                            </div>
                        </div>
                    ) : stokHariIni.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[10rem] bg-[#1e1e1e] rounded-xl border border-dashed border-[#444]">
                            <Boxes className="w-12 h-12 text-[#444] mb-2" />
                            <p className="text-[#888] text-sm">Belum ada stok hari ini</p>
                            <p className="text-[#666] text-xs">Klik + untuk menambah stok baru</p>
                        </div>
                    ) : (
                        <div className="flex flex-row flex-wrap justify-around gap-2">
                            {stokHariIni.map((item) => (
                                <StokCard 
                                    key={item.id}
                                    id={item.id}
                                    nama_item={item.barang?.nama || "Unknown"}
                                    harga_item={item.harga}
                                    jumlah_stok={item.stok}
                                    jumlah_ambil={item.jumlah_ambil}
                                    jumlah_setor={item.jumlah_setor}
                                    modal={item.modal}
                                    tanggalEdar={item.tanggalEdar}
                                    keterangan={item.keterangan}
                                    gambar={item.barang?.gambar}
                                    onClick={() => handleStokClick(item)}
                                />
                            ))}
                        </div>
                    )}
                </main>

                {/* Stok Detail Modal */}
                <DetailStokModal
                    stok={selectedStok}
                    isOpen={showStokModal}
                    onClose={handleCloseStokModal}
                />

            <Navbar />
        </div>
    )
}

export default Dashboard