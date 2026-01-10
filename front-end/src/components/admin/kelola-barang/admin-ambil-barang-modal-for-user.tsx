import React, { useState, useEffect, useMemo } from "react";
import { 
    X, 
    UserPlus, 
    Package, 
    Plus, 
    Minus, 
    Loader2,
    Check,
    AlertCircle,
    User
} from "lucide-react";
import { stokService } from "../../../services/barang.service";
import { ambilBarangService } from "../../../services/ambilBarang.service";
import { userService, type User as UserType } from "../../../services/user.service";
import type { StokHarian } from "../../../types/barang.types";

interface AdminAmbilBarangModalForUserProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: number; // Pre-selected user ID
    userName: string; // User name for display
}

interface SelectedItem {
    stokHarianId: number;
    nama: string;
    harga: number;
    maxQty: number;
    qty: number;
}

const AdminAmbilBarangModalForUser: React.FC<AdminAmbilBarangModalForUserProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess,
    userId,
    userName
}) => {
    const [stokHariIni, setStokHariIni] = useState<StokHarian[]>([]);
    const [admins, setAdmins] = useState<UserType[]>([]);
    const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [keterangan, setKeterangan] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Fetch stok when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchData();
            // Reset state
            setSelectedItems([]);
            setKeterangan("");
            setError(null);
            setSuccess(false);
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch stok hari ini
            const stokResponse = await stokService.getStokHariIni();
            if (stokResponse.success && stokResponse.data) {
                setStokHariIni(stokResponse.data);
            }

            // Fetch admins for dropdown
            const usersResponse = await userService.getAllUsers();
            if (usersResponse.success && usersResponse.data) {
                const adminList = usersResponse.data.filter(u => u.role === 'admin');
                setAdmins(adminList);
                // Set default admin (first admin)
                if (adminList.length > 0) {
                    setSelectedAdminId(adminList[0].id);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    // Format rupiah
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Available stok (dengan stok > 0)
    const availableStok = useMemo(() => {
        return stokHariIni.filter(stok => stok.stok > 0);
    }, [stokHariIni]);

    // Add item to selection
    const addItem = (stok: StokHarian) => {
        // Check if already added
        if (selectedItems.some(item => item.stokHarianId === stok.id)) {
            return;
        }

        setSelectedItems(prev => [...prev, {
            stokHarianId: stok.id,
            nama: stok.barang?.nama || 'Unknown',
            harga: stok.harga,
            maxQty: stok.stok,
            qty: 1,
        }]);
    };

    // Remove item from selection
    const removeItem = (stokHarianId: number) => {
        setSelectedItems(prev => prev.filter(item => item.stokHarianId !== stokHarianId));
    };

    // Update item quantity
    const updateItemQty = (stokHarianId: number, delta: number) => {
        setSelectedItems(prev => prev.map(item => {
            if (item.stokHarianId === stokHarianId) {
                const newQty = Math.max(1, Math.min(item.maxQty, item.qty + delta));
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    // Calculate total
    const totalHarga = useMemo(() => {
        return selectedItems.reduce((sum, item) => sum + (item.harga * item.qty), 0);
    }, [selectedItems]);

    const totalQty = useMemo(() => {
        return selectedItems.reduce((sum, item) => sum + item.qty, 0);
    }, [selectedItems]);

    // Handle submit
    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            setError('Pilih minimal 1 barang');
            return;
        }

        if (!selectedAdminId) {
            setError('Pilih admin penerima setor');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await ambilBarangService.createAmbilBarang({
                userId: userId,
                setorKepadaId: selectedAdminId,
                keterangan: keterangan || `Diinput oleh admin`,
                items: selectedItems.map(item => ({
                    stokHarianId: item.stokHarianId,
                    qty: item.qty,
                })),
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            } else {
                setError(response.message || 'Gagal menyimpan data');
            }
        } catch (err) {
            console.error('Error submitting:', err);
            setError('Terjadi kesalahan jaringan');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-[#1e1e1e] w-full max-w-lg max-h-[90vh] rounded-2xl overflow-hidden shadow-xl border border-[#333] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#333]">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-[#B09331]" />
                        <h2 className="text-white font-bold text-lg">Tambah Pengambilan</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[#888] hover:text-white hover:bg-[#444] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-[#B09331]" />
                        </div>
                    ) : success ? (
                        <div className="flex flex-col items-center justify-center h-40 text-green-400">
                            <Check className="w-16 h-16 mb-2" />
                            <p className="font-semibold">Berhasil disimpan!</p>
                        </div>
                    ) : (
                        <>
                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* User Info (Fixed) */}
                            <div className="bg-[#252525] border border-[#444] rounded-xl p-3">
                                <label className="block text-[#888] text-xs mb-1">Pengambilan untuk:</label>
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-[#B09331]" />
                                    <span className="text-white font-medium">{userName}</span>
                                </div>
                            </div>

                            {/* Available Items */}
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">
                                    Pilih Barang
                                </label>
                                {availableStok.length === 0 ? (
                                    <div className="text-center py-4 text-[#888]">
                                        Tidak ada stok tersedia hari ini
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {availableStok.map(stok => {
                                            const isSelected = selectedItems.some(
                                                item => item.stokHarianId === stok.id
                                            );
                                            return (
                                                <button
                                                    key={stok.id}
                                                    onClick={() => !isSelected && addItem(stok)}
                                                    disabled={isSelected}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                                        isSelected
                                                            ? 'bg-[#B09331]/20 text-[#B09331] border border-[#B09331]/50 cursor-not-allowed'
                                                            : 'bg-[#252525] text-[#aaa] hover:text-white hover:bg-[#333] border border-[#444]'
                                                    }`}
                                                >
                                                    <Package className="w-4 h-4" />
                                                    <span>{stok.barang?.nama}</span>
                                                    <span className="text-xs opacity-70">({stok.stok})</span>
                                                    {!isSelected && <Plus className="w-3 h-3" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Selected Items */}
                            {selectedItems.length > 0 && (
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">
                                        Barang Dipilih ({totalQty} item)
                                    </label>
                                    <div className="space-y-2">
                                        {selectedItems.map(item => (
                                            <div 
                                                key={item.stokHarianId}
                                                className="flex items-center justify-between bg-[#252525] border border-[#444] rounded-xl p-3"
                                            >
                                                <div className="flex-1">
                                                    <p className="text-white font-medium">{item.nama}</p>
                                                    <p className="text-[#B09331] text-sm">
                                                        Rp {formatRupiah(item.harga)} × {item.qty} = Rp {formatRupiah(item.harga * item.qty)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateItemQty(item.stokHarianId, -1)}
                                                        disabled={item.qty <= 1}
                                                        className="w-8 h-8 bg-[#333] rounded-lg flex items-center justify-center text-white disabled:opacity-50"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-white font-bold w-8 text-center">
                                                        {item.qty}
                                                    </span>
                                                    <button
                                                        onClick={() => updateItemQty(item.stokHarianId, 1)}
                                                        disabled={item.qty >= item.maxQty}
                                                        className="w-8 h-8 bg-[#333] rounded-lg flex items-center justify-center text-white disabled:opacity-50"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeItem(item.stokHarianId)}
                                                        className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/30"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin Selection */}
                            {selectedItems.length > 0 && (
                                <div>
                                    <label className="block text-white text-sm font-medium mb-2">
                                        Setor Kepada (Admin)
                                    </label>
                                    <select
                                        value={selectedAdminId || ''}
                                        onChange={(e) => setSelectedAdminId(Number(e.target.value) || null)}
                                        className="w-full bg-[#252525] border border-[#444] rounded-xl px-4 py-3 text-white focus:border-[#B09331] focus:outline-none"
                                    >
                                        <option value="">-- Pilih Admin --</option>
                                        {admins.map(admin => (
                                            <option key={admin.id} value={admin.id}>
                                                {admin.nama_lengkap}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Keterangan */}
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">
                                    Keterangan (opsional)
                                </label>
                                <textarea
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    placeholder="Catatan tambahan..."
                                    rows={2}
                                    className="w-full bg-[#252525] border border-[#444] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:border-[#B09331] focus:outline-none resize-none"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!loading && !success && (
                    <div className="p-4 border-t border-[#333] bg-[#1a1a1a]">
                        {selectedItems.length > 0 && (
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[#888]">Total Harga:</span>
                                <span className="text-[#B09331] font-bold text-xl">
                                    Rp {formatRupiah(totalHarga)}
                                </span>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="flex-1 bg-[#333] text-white font-semibold py-3 rounded-xl hover:bg-[#444] transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || selectedItems.length === 0}
                                className="flex-1 bg-[#B09331] text-white font-semibold py-3 rounded-xl hover:bg-[#C4A73B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Simpan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAmbilBarangModalForUser;
