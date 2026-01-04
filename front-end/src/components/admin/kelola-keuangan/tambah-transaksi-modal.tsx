import React, { useState } from "react";
import { 
    X, 
    Loader2, 
    TrendingUp, 
    TrendingDown,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import { keuanganService } from "../../../services/keuangan.service";
import { formatNominal } from "../../../helper/formatnominal";

interface TambahTransaksiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type TipeTransaksi = 'PEMASUKAN' | 'PENGELUARAN';

const TambahTransaksiModal: React.FC<TambahTransaksiModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess 
}) => {
    const [tipe, setTipe] = useState<TipeTransaksi>('PEMASUKAN');
    const [title, setTitle] = useState('');
    const [nominal, setNominal] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const resetForm = () => {
        setTipe('PEMASUKAN');
        setTitle('');
        setNominal('');
        setKeterangan('');
        setError(null);
        setSuccess(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        // Validation
        if (!title.trim()) {
            setError('Judul transaksi wajib diisi');
            return;
        }
        const nominalNum = parseInt(nominal.replace(/\D/g, ''), 10);
        if (!nominalNum || nominalNum <= 0) {
            setError('Nominal harus lebih dari 0');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                title: title.trim(),
                nominal: nominalNum,
                keterangan: keterangan.trim() || undefined,
            };

            if (tipe === 'PEMASUKAN') {
                await keuanganService.createPemasukan(payload);
            } else {
                await keuanganService.createPengeluaran(payload);
            }

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan transaksi');
        } finally {
            setLoading(false);
        }
    };



    if (!isOpen) return null;

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
                    <h2 className="text-white font-bold text-lg">Tambah Transaksi</h2>
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
                            <p className="font-semibold">Transaksi berhasil dicatat!</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Tipe Selector */}
                            <div>
                                <label className="text-[#888] text-sm block mb-2">Tipe Transaksi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setTipe('PEMASUKAN')}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                            tipe === 'PEMASUKAN'
                                                ? 'bg-green-500/10 border-green-500 text-green-400'
                                                : 'bg-[#252525] border-[#444] text-[#888] hover:border-[#666]'
                                        }`}
                                    >
                                        <TrendingUp className="w-5 h-5" />
                                        <span className="font-medium">Pemasukan</span>
                                    </button>
                                    <button
                                        onClick={() => setTipe('PENGELUARAN')}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                            tipe === 'PENGELUARAN'
                                                ? 'bg-red-500/10 border-red-500 text-red-400'
                                                : 'bg-[#252525] border-[#444] text-[#888] hover:border-[#666]'
                                        }`}
                                    >
                                        <TrendingDown className="w-5 h-5" />
                                        <span className="font-medium">Pengeluaran</span>
                                    </button>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="text-[#888] text-sm gap-1 flex items-center mb-2">Judul Transaksi <p className="text-red-500">*</p></label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Contoh: Beli bahan baku"
                                    className="w-full bg-[#252525] text-white border border-[#444] rounded-xl p-3 focus:border-[#B09331] focus:outline-none"
                                />
                            </div>

                            {/* Nominal */}
                            <div>
                                <label className="text-[#888] text-sm gap-1 flex items-center mb-2">Nominal <p className="text-red-500">*</p></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]">Rp</span>
                                    <input
                                        type="text"
                                        value={formatNominal(nominal)}
                                        onChange={(e) => setNominal(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-[#252525] text-white border border-[#444] rounded-xl p-3 pl-10 focus:border-[#B09331] focus:outline-none text-right text-xl font-bold"
                                    />
                                </div>
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label className="text-[#888] text-sm block mb-2">Keterangan (opsional)</label>
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
                                className={`w-full font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                                    tipe === 'PEMASUKAN'
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        {tipe === 'PEMASUKAN' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                        Simpan {tipe === 'PEMASUKAN' ? 'Pemasukan' : 'Pengeluaran'}
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TambahTransaksiModal;
