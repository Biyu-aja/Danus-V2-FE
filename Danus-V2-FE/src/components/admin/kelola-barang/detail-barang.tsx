import React, { useState, useRef, useEffect } from "react";
import { X, Edit2, Trash2, Save, ImagePlus, Package, Loader2, AlertCircle, CheckCircle, Boxes, TrendingUp } from "lucide-react";
import { barangService } from "../../../services/barang.service";
import type { Barang } from "../../../types/barang.types";
import InputText from "../../general/input";

interface DetailBarangProps {
    barang: Barang;
    onClose: () => void;
    onUpdate: (updatedBarang: Barang) => void;
    onDelete: (id: number) => void;
}

const DetailBarang: React.FC<DetailBarangProps> = ({ barang, onClose, onUpdate, onDelete }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Barang data with full statistics
    const [barangData, setBarangData] = useState<Barang>(barang);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Mode state
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Form state
    const [nama, setNama] = useState(barang.nama);
    const [keterangan, setKeterangan] = useState(barang.keterangan || "");
    const [gambar, setGambar] = useState<string | null>(barang.gambar || null);
    const [gambarPreview, setGambarPreview] = useState<string | null>(barang.gambar || null);
    
    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch fresh data with statistics
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const response = await barangService.getBarangById(barang.id);
                if (response.success && response.data) {
                    setBarangData(response.data);
                }
            } catch (err) {
                console.error('Error fetching barang detail:', err);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, [barang.id]);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError("Ukuran gambar maksimal 2MB");
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError("File harus berupa gambar");
                return;
            }
            setError("");
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setGambar(base64);
                setGambarPreview(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle save
    const handleSave = async () => {
        setError("");
        setSuccess("");

        if (!nama.trim()) {
            setError("Nama barang wajib diisi");
            return;
        }

        setIsLoading(true);
        try {
            const response = await barangService.updateBarang(barang.id, {
                nama: nama.trim(),
                keterangan: keterangan.trim() || undefined,
                gambar: gambar || undefined,
            });

            if (response.success && response.data) {
                setSuccess("Barang berhasil diupdate!");
                onUpdate(response.data);
                setTimeout(() => {
                    setIsEditing(false);
                    setSuccess("");
                }, 1000);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError("Terjadi kesalahan saat mengupdate barang");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        setError("");
        setIsLoading(true);
        try {
            const response = await barangService.deleteBarang(barang.id);
            if (response.success) {
                onDelete(barang.id);
                onClose();
            } else {
                setError(response.message);
                setIsDeleting(false);
            }
        } catch (err) {
            setError("Terjadi kesalahan saat menghapus barang");
            setIsDeleting(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Cancel edit
    const handleCancel = () => {
        setNama(barang.nama);
        setKeterangan(barang.keterangan || "");
        setGambar(barang.gambar || null);
        setGambarPreview(barang.gambar || null);
        setIsEditing(false);
        setError("");
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div 
                className="bg-[#1e1e1e] w-full max-w-md max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-[#333] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Image - When not editing */}
                {!isEditing && (
                    <div className="relative h-32 flex-shrink-0">
                        {barang.gambar ? (
                            <img 
                                src={barang.gambar} 
                                alt={barang.nama} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#B39135] to-[#8B7028] flex items-center justify-center">
                                <Package className="w-12 h-12 text-white/30" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        
                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Title */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h2 className="text-white text-lg font-bold">{barang.nama}</h2>
                            {barang.keterangan && (
                                <p className="text-[#aaa] text-sm truncate">{barang.keterangan}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Header - When editing */}
                {isEditing && (
                    <div className="flex items-center justify-between p-4 border-b border-[#333]">
                        <h2 className="text-lg font-bold text-white">Edit Barang</h2>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-[#333] hover:bg-[#444] flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Alert Messages */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg mb-4">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg mb-4">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <p className="text-green-400 text-sm">{success}</p>
                        </div>
                    )}

                    {/* Delete Confirmation */}
                    {isDeleting && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                            <p className="text-white font-bold mb-2">Hapus Barang?</p>
                            <p className="text-[#aaa] text-sm mb-4">
                                Yakin ingin menghapus "{barang.nama}"? Aksi ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsDeleting(false)}
                                    className="flex-1 py-2 px-4 bg-[#333] hover:bg-[#444] rounded-lg text-white text-sm transition-colors"
                                    disabled={isLoading}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Hapus
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Image Section - Only when editing */}
                    {isEditing && (
                        <div className="flex justify-center mb-4">
                            <label className="cursor-pointer">
                                <div className="relative">
                                    {gambarPreview ? (
                                        <div className="w-full h-32 rounded-xl overflow-hidden border-2 border-[#B39135]">
                                            <img src={gambarPreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-32 bg-[#2a2a2a] rounded-xl border-2 border-dashed border-[#4f4f4f] hover:border-[#B39135] transition-colors flex flex-col items-center justify-center gap-3">
                                            <ImagePlus className="w-8 h-8 text-[#888]" />
                                            <p className="text-[#888] text-sm">Pilih Gambar</p>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}

                    {/* Form Fields */}
                    {isEditing ? (
                        <div className="flex flex-col gap-4">
                            <InputText 
                                label="Nama Barang" 
                                placeholder="Nama barang" 
                                isImportant 
                                value={nama}
                                setValue={setNama}
                            />
                            <InputText 
                                label="Keterangan" 
                                placeholder="Deskripsi barang" 
                                isTextarea 
                                rows={3}
                                value={keterangan}
                                setValue={setKeterangan}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            
                            {/* Statistics */}
                            {isLoadingData ? (
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl animate-pulse">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20"></div>
                                            <div className="flex-1">
                                                <div className="h-3 bg-[#333] rounded w-16 mb-1"></div>
                                                <div className="h-5 bg-[#333] rounded w-12"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl animate-pulse">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-green-500/20"></div>
                                            <div className="flex-1">
                                                <div className="h-3 bg-[#333] rounded w-16 mb-1"></div>
                                                <div className="h-5 bg-[#333] rounded w-20"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : barangData.stokHarian && barangData.stokHarian.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                <Boxes className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-[#888] text-xs">Total Stok Edar</p>
                                                <p className="text-white font-bold">
                                                    {barangData.stokHarian.length} kali
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                <TrendingUp className="w-4 h-4 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-[#888] text-xs">Total Omzet</p>
                                                <p className="text-green-400 font-bold text-sm">
                                                    Rp {new Intl.NumberFormat('id-ID').format(
                                                        barangData.stokHarian.reduce((total, stok) => {
                                                            const stokOmzet = stok.detailSetor?.reduce((sum, ds) => sum + ds.totalHarga, 0) || 0;
                                                            return total + stokOmzet;
                                                        }, 0)
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Stok Terbaru */}
                            {barangData.stokHarian && barangData.stokHarian.length > 0 && !isLoadingData && (
                                <div>
                                    <p className="text-[#888] text-xs mb-2">Stok Terbaru</p>
                                    <div className="bg-[#2a2a2a] rounded-lg p-3">
                                        <div className="flex justify-between">
                                            <span className="text-[#aaa]">Jumlah:</span>
                                            <span className="text-white font-bold">{barangData.stokHarian[0].stok} pcs</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#aaa]">Harga:</span>
                                            <span className="text-white font-bold">Rp {barangData.stokHarian[0].harga.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#333] flex gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex-1 py-3 px-4 bg-[#333] hover:bg-[#444] rounded-xl text-white font-medium transition-colors"
                                disabled={isLoading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-[#B39135] to-[#8B7028] hover:from-[#C9A740] hover:to-[#9D7E30] rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Simpan
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsDeleting(true)}
                                className="py-3 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-400 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-[#B39135] to-[#8B7028] hover:from-[#C9A740] hover:to-[#9D7E30] rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Barang
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailBarang;
