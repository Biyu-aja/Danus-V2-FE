import React, { useState, useEffect } from "react";
import { 
    X, 
    Loader2, 
    CheckCircle,
    AlertCircle,
    Package
} from "lucide-react";
import { stokService } from "../../../services/barang.service";
import type { StokHarian } from "../../../types/barang.types";

interface EditStokModalProps {
    stok: StokHarian | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedStok: StokHarian) => void;
}

const EditStokModal: React.FC<EditStokModalProps> = ({ 
    stok,
    isOpen, 
    onClose, 
    onSuccess 
}) => {
    const [harga, setHarga] = useState('');
    const [jumlahStok, setJumlahStok] = useState('');
    const [modal, setModal] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Initialize form when stok changes
    useEffect(() => {
        if (stok) {
            setHarga(String(stok.harga));
            setJumlahStok(String(stok.stok));
            setModal(String(stok.modal));
            setKeterangan(stok.keterangan || '');
            setError(null);
            setSuccess(false);
        }
    }, [stok]);

    const handleClose = () => {
        setError(null);
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async () => {
        if (!stok) return;

        // Validation
        const hargaNum = parseInt(harga, 10);
        const stokNum = parseInt(jumlahStok, 10);
        const modalNum = parseInt(modal, 10);

        if (!hargaNum || hargaNum <= 0) {
            setError('Harga harus lebih dari 0');
            return;
        }
        if (stokNum < 0) {
            setError('Stok tidak boleh negatif');
            return;
        }
        if (modalNum < 0) {
            setError('Modal tidak boleh negatif');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await stokService.updateStok(stok.id, {
                harga: hargaNum,
                stok: stokNum,
                modal: modalNum,
                keterangan: keterangan.trim() || undefined,
            });

            if (response.success && response.data) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess(response.data!);
                    handleClose();
                }, 1000);
            } else {
                setError(response.message || 'Gagal mengupdate stok');
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (value: string) => {
        const num = value.replace(/\D/g, '');
        return num ? new Intl.NumberFormat('id-ID').format(parseInt(num)) : '';
    };

    if (!isOpen || !stok) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <div 
                className="bg-[#1e1e1e] w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-[#333]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#333]">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#B09331]" />
                        <h2 className="text-white font-bold text-lg">Edit Stok</h2>
                    </div>
                    <button 
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[#888] hover:text-white hover:bg-[#444] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 text-green-400">
                            <CheckCircle className="w-16 h-16 mb-2" />
                            <p className="font-semibold">Stok berhasil diupdate!</p>
                        </div>
                    ) : (
                        <>
                            {/* Item Name */}
                            <div className="bg-[#252525] rounded-xl p-3">
                                <p className="text-[#888] text-xs mb-1">Nama Barang</p>
                                <p className="text-white font-semibold">{stok.barang?.nama || 'Unknown'}</p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Harga */}
                            <div>
                                <label className="text-[#888] text-sm block mb-2">Harga Jual *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]">Rp</span>
                                    <input
                                        type="text"
                                        value={formatRupiah(harga)}
                                        onChange={(e) => setHarga(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-[#252525] text-white border border-[#444] rounded-xl p-3 pl-10 focus:border-[#B09331] focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Stok */}
                            <div>
                                <label className="text-[#888] text-sm block mb-2">Jumlah Stok *</label>
                                <input
                                    type="number"
                                    value={jumlahStok}
                                    onChange={(e) => setJumlahStok(e.target.value)}
                                    min="0"
                                    className="w-full bg-[#252525] text-white border border-[#444] rounded-xl p-3 focus:border-[#B09331] focus:outline-none"
                                />
                            </div>

                            {/* Modal */}
                            <div>
                                <label className="text-[#888] text-sm block mb-2">Modal *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]">Rp</span>
                                    <input
                                        type="text"
                                        value={formatRupiah(modal)}
                                        onChange={(e) => setModal(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-[#252525] text-white border border-[#444] rounded-xl p-3 pl-10 focus:border-[#B09331] focus:outline-none"
                                    />
                                </div>
                                <p className="text-[#666] text-xs mt-1">
                                    Perubahan modal akan menyesuaikan saldo otomatis
                                </p>
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label className="text-[#888] text-sm block mb-2">Keterangan</label>
                                <textarea
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    placeholder="Tambahkan catatan..."
                                    rows={2}
                                    className="w-full bg-[#252525] text-white border border-[#444] rounded-xl p-3 focus:border-[#B09331] focus:outline-none resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-[#B09331] text-white font-semibold py-3 rounded-xl hover:bg-[#C4A73B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Perubahan'
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditStokModal;
