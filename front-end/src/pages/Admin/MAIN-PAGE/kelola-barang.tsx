import React, { useState, useEffect } from "react";
import Navbar from "../../../components/admin/general-admin/navbar";
import Header from "../../../components/general/header";
import SearchBar from "../../../components/general/searchbar";
import StokCard from "../../../components/general/stokcard";
import TitleAdd from "../../../components/general/title-add";
import CardBarang from "../../../components/admin/kelola-barang/cardbarang";
import DetailBarang from "../../../components/admin/kelola-barang/detail-barang";
import DetailStokModal from "../../../components/admin/kelola-barang/detail-stok-modal";
import { barangService, stokService } from "../../../services/barang.service";
import type { Barang, StokHarian } from "../../../types/barang.types";
import { Loader2, Package, Boxes } from "lucide-react";

const KelolaBarang: React.FC = () => {
    // State untuk data
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [stokHariIni, setStokHariIni] = useState<StokHarian[]>([]);
    
    // State untuk UI
    const [isLoadingBarang, setIsLoadingBarang] = useState(true);
    const [isLoadingStok, setIsLoadingStok] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // State untuk detail modal barang
    const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
    const [showDetailBarang, setShowDetailBarang] = useState(false);

    // State untuk detail modal stok
    const [selectedStok, setSelectedStok] = useState<StokHarian | null>(null);
    const [showDetailStok, setShowDetailStok] = useState(false);

    // Fetch data saat komponen mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Fetch barang
        setIsLoadingBarang(true);
        try {
            const barangResponse = await barangService.getAllBarang();
            if (barangResponse.success && barangResponse.data) {
                setBarangList(barangResponse.data);
            }
        } catch (err) {
            console.error('Error fetching barang:', err);
        } finally {
            setIsLoadingBarang(false);
        }

        // Fetch stok hari ini
        setIsLoadingStok(true);
        try {
            const stokResponse = await stokService.getStokHariIni();
            if (stokResponse.success && stokResponse.data) {
                setStokHariIni(stokResponse.data);
            }
        } catch (err) {
            console.error('Error fetching stok:', err);
        } finally {
            setIsLoadingStok(false);
        }
    };

    // Handle click pada card barang
    const handleCardClick = (barang: Barang) => {
        setSelectedBarang(barang);
        setShowDetailBarang(true);
    };

    // Handle update barang
    const handleUpdateBarang = (updatedBarang: Barang) => {
        setBarangList(prev => prev.map(b => b.id === updatedBarang.id ? updatedBarang : b));
        setSelectedBarang(updatedBarang);
    };

    // Handle delete barang
    const handleDeleteBarang = (id: number) => {
        setBarangList(prev => prev.filter(b => b.id !== id));
    };

    // Close detail modal barang
    const handleCloseDetail = () => {
        setShowDetailBarang(false);
        setSelectedBarang(null);
    };

    // Handle click pada stok card
    const handleStokClick = (stok: StokHarian) => {
        setSelectedStok(stok);
        setShowDetailStok(true);
    };

    // Close stok modal
    const handleCloseStokDetail = () => {
        setShowDetailStok(false);
        setSelectedStok(null);
    };

    // Filter berdasarkan search query
    const filteredBarang = barangList.filter(barang => 
        barang.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        barang.keterangan?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredStok = stokHariIni.filter(stok => 
        stok.barang?.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
            <main className="flex flex-col mt-[3.5rem] gap-4 p-3 mb-[4rem]">
                <SearchBar 
                    placeholder="Cari Barang/Stok" 
                    value={searchQuery}
                    onChange={setSearchQuery}
                />

                {/* Stok Hari Ini Section */}
                <div className="flex flex-col gap-2">
                    <TitleAdd title="Stok Hari Ini" navigateTo="tambah-stok" />
                    
                    {isLoadingStok ? (
                        <div className="flex items-center justify-center h-[16rem] bg-[#1e1e1e] rounded-xl">
                            <div className="flex flex-col items-center gap-2 text-[#888]">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p className="text-sm">Memuat stok...</p>
                            </div>
                        </div>
                    ) : filteredStok.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[16rem] bg-[#1e1e1e] rounded-xl border border-dashed border-[#444]">
                            <Boxes className="w-12 h-12 text-[#444] mb-2" />
                            <p className="text-[#888] text-sm">Belum ada stok hari ini</p>
                            <p className="text-[#666] text-xs">Klik + untuk menambah stok baru</p>
                        </div>
                    ) : (
                        <div className="flex flex-row overflow-x-auto gap-3 p-2 -mx-2">
                            {filteredStok.map((stok) => (
                                <StokCard 
                                    key={stok.id}
                                    id={stok.id}
                                    nama_item={stok.barang?.nama || "Unknown"}
                                    harga_item={stok.harga}
                                    jumlah_stok={stok.stok}
                                    jumlah_ambil={stok.jumlah_ambil}
                                    jumlah_setor={stok.jumlah_setor}
                                    modal={stok.modal}
                                    tanggalEdar={stok.tanggalEdar}
                                    keterangan={stok.keterangan}
                                    gambar={stok.barang?.gambar}
                                    onClick={() => handleStokClick(stok)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Jenis Barang Section */}
                <div className="flex flex-col gap-2">
                    <TitleAdd title="Jenis Barang" navigateTo="tambah-barang" />
                    
                    {isLoadingBarang ? (
                        <div className="flex items-center justify-center h-[16rem] bg-[#1e1e1e] rounded-xl">
                            <div className="flex flex-col items-center gap-2 text-[#888]">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p className="text-sm">Memuat barang...</p>
                            </div>
                        </div>
                    ) : filteredBarang.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[16rem] bg-[#1e1e1e] rounded-xl border border-dashed border-[#444]">
                            <Package className="w-12 h-12 text-[#444] mb-2" />
                            <p className="text-[#888] text-sm">
                                {searchQuery ? "Tidak ada barang yang cocok" : "Belum ada jenis barang"}
                            </p>
                            <p className="text-[#666] text-xs">Klik + untuk menambah barang baru</p>
                        </div>
                    ) : (
                        <div className="flex flex-row overflow-x-auto gap-3 p-2 -mx-2">
                            {filteredBarang.map((barang) => (
                                <CardBarang 
                                    key={barang.id}
                                    id={barang.id}
                                    nama={barang.nama}
                                    keterangan={barang.keterangan}
                                    gambar={barang.gambar}
                                    onClick={() => handleCardClick(barang)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Info tambahan jika ada data */}
                {!isLoadingBarang && !isLoadingStok && (barangList.length > 0 || stokHariIni.length > 0) && (
                    <div className="flex flex-row gap-3 mt-2">
                        <div className="flex-1 bg-[#1e1e1e] rounded-xl p-3 border border-[#333]">
                            <p className="text-[#888] text-xs">Total Jenis Barang</p>
                            <p className="text-2xl font-bold text-[#B39135]">{barangList.length}</p>
                        </div>
                        <div className="flex-1 bg-[#1e1e1e] rounded-xl p-3 border border-[#333]">
                            <p className="text-[#888] text-xs">Stok Aktif</p>
                            <p className="text-2xl font-bold text-[#3B82F6]">{stokHariIni.length}</p>
                        </div>
                    </div>
                )}
            </main>
            <Navbar />

            {/* Detail Barang Modal */}
            {showDetailBarang && selectedBarang && (
                <DetailBarang 
                    barang={selectedBarang}
                    onClose={handleCloseDetail}
                    onUpdate={handleUpdateBarang}
                    onDelete={handleDeleteBarang}
                />
            )}

            {/* Detail Stok Modal */}
            <DetailStokModal
                stok={selectedStok}
                isOpen={showDetailStok}
                onClose={handleCloseStokDetail}
            />
        </div>
    );
};

export default KelolaBarang;