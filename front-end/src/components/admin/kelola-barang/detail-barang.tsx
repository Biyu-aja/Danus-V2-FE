import React, { useState, useRef } from "react";
import { X, Edit2, Trash2, Save, ImagePlus, Package, Loader2, AlertCircle, CheckCircle } from "lucide-react";
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
                className="bg-[#1e1e1e] rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#333]">
                    <h2 className="text-lg font-bold text-white">
                        {isEditing ? "Edit Barang" : "Detail Barang"}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-[#333] hover:bg-[#444] flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>

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

                    {/* Image Section */}
                    <div className="flex justify-center mb-4">
                        {isEditing ? (
                            <label className="cursor-pointer">
                                <div className="relative">
                                    {gambarPreview ? (
                                        <div className="w-[9rem] h-[16rem] rounded-xl overflow-hidden border-2 border-[#B39135]">
                                            <img src={gambarPreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-[9rem] h-[16rem] bg-[#2a2a2a] rounded-xl border-2 border-dashed border-[#4f4f4f] hover:border-[#B39135] transition-colors flex flex-col items-center justify-center gap-3">
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
                        ) : (
                            <div className="w-[9rem] h-[16rem] rounded-xl overflow-hidden">
                                {barang.gambar ? (
                                    <img src={barang.gambar} alt={barang.nama} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center">
                                        <Package className="w-16 h-16 text-[#B39135]" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

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
                            <div>
                                <p className="text-[#888] text-xs">Nama Barang</p>
                                <p className="text-white font-bold text-lg">{barang.nama}</p>
                            </div>
                            {barang.keterangan && (
                                <div>
                                    <p className="text-[#888] text-xs">Keterangan</p>
                                    <p className="text-white">{barang.keterangan}</p>
                                </div>
                            )}
                            {barang.stokHarian && barang.stokHarian.length > 0 && (
                                <div>
                                    <p className="text-[#888] text-xs mb-2">Stok Terbaru</p>
                                    <div className="bg-[#2a2a2a] rounded-lg p-3">
                                        <div className="flex justify-between">
                                            <span className="text-[#aaa]">Jumlah:</span>
                                            <span className="text-white font-bold">{barang.stokHarian[0].stok} pcs</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#aaa]">Harga:</span>
                                            <span className="text-white font-bold">Rp {barang.stokHarian[0].harga.toLocaleString('id-ID')}</span>
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
