import React, { useState, useRef } from "react";
import Header from "../../../components/general/header";
import BackButton from "../../../components/general/back-button";
import InputText from "../../../components/general/input";
import { barangService } from "../../../services/barang.service";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle, Package, ImagePlus, X } from "lucide-react";

const TambahBarangPage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Form state
    const [namaBarang, setNamaBarang] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [gambar, setGambar] = useState<string | null>(null);
    const [gambarPreview, setGambarPreview] = useState<string | null>(null);
    
    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validasi ukuran file (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError("Ukuran gambar maksimal 2MB");
                return;
            }

            // Validasi tipe file
            if (!file.type.startsWith('image/')) {
                setError("File harus berupa gambar");
                return;
            }

            setError("");
            
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setGambar(base64);
                setGambarPreview(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove selected image
    const handleRemoveImage = () => {
        setGambar(null);
        setGambarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        // Reset messages
        setError("");
        setSuccess("");

        // Validation
        if (!namaBarang.trim()) {
            setError("Nama barang wajib diisi");
            return;
        }

        setIsLoading(true);

        try {
            const response = await barangService.createBarang({
                nama: namaBarang.trim(),
                keterangan: keterangan.trim() || undefined,
                gambar: gambar || undefined,
            });

            if (response.success) {
                setSuccess("Barang berhasil ditambahkan!");
                // Reset form
                setNamaBarang("");
                setKeterangan("");
                setGambar(null);
                setGambarPreview(null);
                // Redirect setelah 1.5 detik
                setTimeout(() => {
                    navigate(-1);
                }, 1500);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError("Terjadi kesalahan saat menambahkan barang");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <header>
                <Header />
                <main className="mt-[3.5rem] p-3 flex flex-col gap-4">
                    <BackButton />
                    
                    {/* Header Section */}
                    <div className="flex flex-col items-center gap-2 mb-2">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B39135] to-[#8B7028] flex items-center justify-center">
                            <Package className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white">Tambah Barang Baru</h1>
                        <p className="text-[#888] text-sm text-center">
                            Tambahkan item baru ke dalam sistem inventaris
                        </p>
                    </div>

                    {/* Alert Messages */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    
                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <p className="text-green-400 text-sm">{success}</p>
                        </div>
                    )}

                    {/* Image Upload Section */}
                    <div className="flex flex-col gap-2">
                        <p className="font-bold text-white">Gambar Barang</p>
                        <div className="flex justify-center">
                            {gambarPreview ? (
                                <div className="relative">
                                    <div className="w-[9rem] h-[16rem] rounded-xl overflow-hidden border-2 border-[#B39135]">
                                        <img 
                                            src={gambarPreview} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer">
                                    <div className="w-[9rem] h-[16rem] bg-[#1e1e1e] rounded-xl border-2 border-dashed border-[#4f4f4f] hover:border-[#B39135] transition-colors flex flex-col items-center justify-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                                            <ImagePlus className="w-6 h-6 text-[#888]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[#888] text-sm">Pilih Gambar</p>
                                            <p className="text-[#666] text-xs">Format 9:16</p>
                                            <p className="text-[#666] text-xs">Max 2MB</p>
                                        </div>
                                    </div>
                                    <input 
                                        ref={fileInputRef}
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="flex flex-col gap-4 bg-[#1e1e1e] p-4 rounded-xl border border-[#333]">
                        <InputText 
                            label="Nama Barang" 
                            placeholder="Contoh: Dimsum, Klepon, dll" 
                            isImportant 
                            value={namaBarang}
                            setValue={setNamaBarang}
                        />
                        <InputText 
                            label="Deskripsi/Keterangan" 
                            placeholder="Deskripsi singkat tentang barang ini" 
                            isTextarea 
                            rows={4}
                            value={keterangan}
                            setValue={setKeterangan}
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-white transition-all duration-200
                            ${isLoading 
                                ? "bg-[#666] cursor-not-allowed" 
                                : "bg-gradient-to-r from-[#B39135] to-[#8B7028] hover:from-[#C9A740] hover:to-[#9D7E30] active:scale-[0.98]"
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Package className="w-5 h-5" />
                                Tambah Barang
                            </>
                        )}
                    </button>
                </main>
            </header>
        </div>
    );
};

export default TambahBarangPage;