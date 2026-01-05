import React, { useState, useEffect } from "react";
import Header from "../../../components/general/header";
import BackButton from "../../../components/general/back-button";
import InputText from "../../../components/general/input";
import { barangService, stokService } from "../../../services/barang.service";
import type { Barang } from "../../../types/barang.types";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle, Boxes, Calendar } from "lucide-react";
import { formatNominal } from "../../../helper/formatnominal";

const TambahStokPage: React.FC = () => {
    const navigate = useNavigate();
    
    // Data state
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [selectedBarangId, setSelectedBarangId] = useState<number>(0);
    
    // Form state
    const [jumlahStok, setJumlahStok] = useState("");
    const [hargaJual, setHargaJual] = useState("");
    const [modal, setModal] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [tanggalEdar, setTanggalEdar] = useState(new Date().toISOString().split('T')[0]);
    
    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingBarang, setIsLoadingBarang] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch daftar barang saat komponen mount
    useEffect(() => {
        const fetchBarang = async () => {
            setIsLoadingBarang(true);
            try {
                const response = await barangService.getAllBarang();
                if (response.success && response.data) {
                    setBarangList(response.data);
                    if (response.data.length > 0) {
                        setSelectedBarangId(response.data[0].id);
                    }
                }
            } catch (err) {
                console.error('Error fetching barang:', err);
            } finally {
                setIsLoadingBarang(false);
            }
        };
        fetchBarang();
    }, []);

    const handleSubmit = async () => {
        // Reset messages
        setError("");
        setSuccess("");

        // Validation
        if (!selectedBarangId) {
            setError("Pilih barang terlebih dahulu");
            return;
        }
        if (!jumlahStok || parseInt(jumlahStok) <= 0) {
            setError("Jumlah stok harus lebih dari 0");
            return;
        }
        if (!hargaJual || parseInt(hargaJual) <= 0) {
            setError("Harga jual harus lebih dari 0");
            return;
        }
        if (!modal || parseInt(modal) < 0) {
            setError("Modal tidak boleh negatif");
            return;
        }
        if (!tanggalEdar) {
            setError("Tanggal edar wajib diisi");
            return;
        }

        setIsLoading(true);

        try {
            const response = await stokService.createStok({
                barangId: selectedBarangId,
                stok: parseInt(jumlahStok),
                harga: parseInt(hargaJual),
                modal: parseInt(modal),
                keterangan: keterangan.trim() || undefined,
                tanggalEdar: new Date(tanggalEdar).toISOString(),
            });

            if (response.success) {
                setSuccess("Stok berhasil ditambahkan!");
                // Reset form
                setJumlahStok("");
                setHargaJual("");
                setModal("");
                setKeterangan("");
                setTanggalEdar(new Date().toISOString().split('T')[0]);
                // Redirect setelah 1.5 detik
                setTimeout(() => {
                    navigate(-1);
                }, 1500);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError("Terjadi kesalahan saat menambahkan stok");
        } finally {
            setIsLoading(false);
        }
    };

    // Format angka ke rupiah
    const formatRupiah = (value: string) => {
        const number = value.replace(/\D/g, '');
        return number;
    };

    const selectedBarang = barangList.find(b => b.id === selectedBarangId);

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <header>
                <Header />
                <main className="mt-[3.5rem] p-3 flex flex-col gap-4">
                    <BackButton />
                    
                    {/* Header Section */}
                    <div className="flex flex-col items-center gap-2 mb-2">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center">
                            <Boxes className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white">Tambah Stok Harian</h1>
                        <p className="text-[#888] text-sm text-center">
                            Tambahkan stok baru untuk barang yang sudah ada
                        </p>
                    </div>

                    {/* Alert Messages */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    
                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <p className="text-green-400 text-sm">{success}</p>
                        </div>
                    )}

                    {/* Form */}
                    <div className="flex flex-col gap-4 bg-[#1e1e1e] p-4 rounded-xl border border-[#333]">
                        {/* Pilih Barang */}
                        <div className="w-full flex flex-col gap-2">
                            <div className="flex flex-row gap-1 font-bold">
                                <p>Pilih Barang</p>
                                <p className="text-red-500">*</p>
                            </div>
                            <div className="flex flex-row items-center rounded-lg bg-[#1e1e1e] border border-[#4f4f4f] text-white">
                                <div className="w-full flex flex-row items-center px-2">
                                    {isLoadingBarang ? (
                                        <div className="w-full p-2 flex items-center gap-2 text-[#888]">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Memuat data barang...
                                        </div>
                                    ) : barangList.length === 0 ? (
                                        <div className="w-full p-2 text-[#888]">
                                            Belum ada barang. Tambahkan barang terlebih dahulu.
                                        </div>
                                    ) : (
                                        <select 
                                            value={selectedBarangId} 
                                            onChange={(e) => setSelectedBarangId(parseInt(e.target.value))}
                                            className="w-full p-2 bg-[#1e1e1e] rounded-lg outline-none"
                                        >
                                            {barangList.map((barang) => (
                                                <option key={barang.id} value={barang.id}>
                                                    {barang.nama}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                            {selectedBarang?.keterangan && (
                                <p className="text-[#888] text-sm italic">{selectedBarang.keterangan}</p>
                            )}
                        </div>

                        {/* Tanggal Edar */}
                        <div className="w-full flex flex-col gap-2">
                            <div className="flex flex-row gap-1 font-bold">
                                <p>Tanggal Edar</p>
                                <p className="text-red-500">*</p>
                            </div>
                            <div className="flex flex-row items-center rounded-lg bg-[#1e1e1e] border border-[#4f4f4f] text-white">
                                <div className="w-full flex flex-row items-center px-2 gap-2">
                                    <Calendar className="w-5 h-5 text-[#888]" />
                                    <input 
                                        type="date" 
                                        value={tanggalEdar}
                                        onChange={(e) => setTanggalEdar(e.target.value)}
                                        className="w-full p-2 bg-[#1e1e1e] rounded-lg outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Jumlah Stok */}
                        <InputText 
                            label="Jumlah Stok" 
                            placeholder="Contoh: 50" 
                            isImportant 
                            value={formatNominal(jumlahStok)}
                            setValue={(v) => setJumlahStok(formatNominal(v))}
                        />

                        {/* Harga Jual */}
                        <div className="w-full flex flex-col gap-2">
                            <div className="flex flex-row gap-1 font-bold">
                                <p>Harga Jual per Item</p>
                                <p className="text-red-500">*</p>
                            </div>
                            <div className="flex flex-row items-center rounded-lg bg-[#1e1e1e] border border-[#4f4f4f] text-white">
                                <div className="px-3 text-[#888] border-r border-[#4f4f4f]">Rp</div>
                                <input 
                                    type="text"
                                    value={formatRupiah(hargaJual)}
                                    onChange={(e) => setHargaJual(formatRupiah(e.target.value))}
                                    className="w-full p-2 bg-[#1e1e1e] rounded-r-lg outline-none"
                                    placeholder="5000"
                                />
                            </div>
                        </div>

                        {/* Modal */}
                        <div className="w-full flex flex-col gap-2">
                            <div className="flex flex-row gap-1 font-bold">
                                <p>Modal Stok</p>
                                <p className="text-red-500">*</p>
                            </div>
                            <div className="flex flex-row items-center rounded-lg bg-[#1e1e1e] border border-[#4f4f4f] text-white">
                                <div className="px-3 text-[#888] border-r border-[#4f4f4f]">Rp</div>
                                <input 
                                    type="text"
                                    value={formatRupiah(modal)}
                                    onChange={(e) => setModal(formatRupiah(e.target.value))}
                                    className="w-full p-2 bg-[#1e1e1e] rounded-r-lg outline-none"
                                    placeholder="150000"
                                />
                            </div>
                            <p className="text-[#888] text-xs">Total modal untuk semua stok</p>
                        </div>

                        {/* Keterangan */}
                        <InputText 
                            label="Keterangan" 
                            placeholder="Catatan tambahan (opsional)" 
                            isTextarea 
                            rows={3}
                            value={keterangan}
                            setValue={setKeterangan}
                        />

                        {/* Summary */}
                        {jumlahStok && hargaJual && modal && (
                            <div className="p-3 bg-[#2a2a2a] rounded-lg border border-[#444]">
                                <p className="text-[#888] text-sm mb-2">Ringkasan:</p>
                                <div className="flex flex-col gap-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[#aaa]">Potensi Pendapatan:</span>
                                        <span className="text-green-400 font-bold">
                                            Rp {(parseInt(jumlahStok) * parseInt(hargaJual)).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#aaa]">Modal:</span>
                                        <span className="text-yellow-400 font-bold">
                                            Rp {parseInt(modal).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-[#444] pt-1 mt-1">
                                        <span className="text-[#aaa]">Est. Keuntungan:</span>
                                        <span className={`font-bold ${(parseInt(jumlahStok) * parseInt(hargaJual)) - parseInt(modal) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            Rp {((parseInt(jumlahStok) * parseInt(hargaJual)) - parseInt(modal)).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading || isLoadingBarang || barangList.length === 0}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-white transition-all duration-200
                            ${(isLoading || isLoadingBarang || barangList.length === 0)
                                ? "bg-[#666] cursor-not-allowed" 
                                : "bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#60A5FA] hover:to-[#2563EB] active:scale-[0.98]"
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Boxes className="w-5 h-5" />
                                Tambah Stok
                            </>
                        )}
                    </button>
                </main>
            </header>
        </div>
    );
};

export default TambahStokPage;