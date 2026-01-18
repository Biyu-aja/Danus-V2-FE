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
    User,
    Search,
    ChevronDown
} from "lucide-react";
import { ambilBarangService } from "../../../services/ambilBarang.service";
import { userService, type User as UserType } from "../../../services/user.service";
import type { StokHarian } from "../../../types/barang.types";

interface AdminAbsenStokModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    stok: StokHarian; // The specific stok to add absen for
}

const AdminAbsenStokModal: React.FC<AdminAbsenStokModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess,
    stok
}) => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [qty, setQty] = useState(1);
    const [keterangan, setKeterangan] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Fetch users when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchData();
            setSelectedUser(null);
            setQty(1);
            setKeterangan("");
            setSearchQuery("");
            setError(null);
            setSuccess(false);
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await userService.getAllUsers();
            if (response.success && response.data) {
                // Filter only regular users (not admins)
                setUsers(response.data.filter(u => u.role === 'user'));
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Gagal memuat data user');
        } finally {
            setLoading(false);
        }
    };

    // Format rupiah
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Filter users based on search
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        const query = searchQuery.toLowerCase();
        return users.filter(user => 
            user.nama_lengkap.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query)
        );
    }, [users, searchQuery]);

    // Max qty based on stok
    const maxQty = stok.stok;

    // Total harga
    const totalHarga = stok.harga * qty;

    // Handle submit
    const handleSubmit = async () => {
        if (!selectedUser) {
            setError('Pilih user terlebih dahulu');
            return;
        }
        if (qty < 1 || qty > maxQty) {
            setError(`Jumlah harus antara 1 - ${maxQty}`);
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await ambilBarangService.createAmbilBarang({
                userId: selectedUser.id,
                setorKepadaId: null,
                keterangan: keterangan || `Diinput oleh admin untuk ${stok.barang?.nama}`,
                items: [{
                    stokHarianId: stok.id,
                    qty: qty,
                }],
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
                        <h2 className="text-white font-bold text-lg">Tambah Absen</h2>
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

                            {/* Stok Info (Fixed) */}
                            <div className="bg-[#252525] border border-[#444] rounded-xl p-3">
                                <label className="block text-[#888] text-xs mb-2">Barang:</label>
                                <div className="flex items-center gap-3">
                                    {stok.barang?.gambar ? (
                                        <img 
                                            src={stok.barang.gambar} 
                                            alt={stok.barang?.nama} 
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-[#333] flex items-center justify-center">
                                            <Package className="w-6 h-6 text-[#666]" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{stok.barang?.nama || 'Unknown'}</p>
                                        <p className="text-[#B09331] text-sm">Rp {formatRupiah(stok.harga)} / item</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#888] text-xs">Stok tersedia</p>
                                        <p className="text-white font-bold">{maxQty}</p>
                                    </div>
                                </div>
                            </div>

                            {/* User Selection */}
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">
                                    Pilih User <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                                        className="w-full bg-[#252525] border border-[#444] rounded-xl px-4 py-3 text-left flex items-center justify-between focus:border-[#B09331] focus:outline-none"
                                    >
                                        {selectedUser ? (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-[#B09331]" />
                                                <span className="text-white">{selectedUser.nama_lengkap}</span>
                                                <span className="text-[#888] text-sm">@{selectedUser.username}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[#666]">Pilih user...</span>
                                        )}
                                        <ChevronDown className={`w-4 h-4 text-[#888] transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showUserDropdown && (
                                        <div className="absolute z-10 w-full mt-2 bg-[#252525] border border-[#444] rounded-xl overflow-hidden shadow-xl">
                                            {/* Search */}
                                            <div className="p-2 border-b border-[#333]">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666]" />
                                                    <input
                                                        type="text"
                                                        placeholder="Cari user..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-[#666] focus:border-[#B09331] focus:outline-none"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            {/* User List */}
                                            <div className="max-h-48 overflow-y-auto">
                                                {filteredUsers.length === 0 ? (
                                                    <div className="p-4 text-center text-[#888] text-sm">
                                                        User tidak ditemukan
                                                    </div>
                                                ) : (
                                                    filteredUsers.map(user => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowUserDropdown(false);
                                                                setSearchQuery("");
                                                            }}
                                                            className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#333] transition-colors ${
                                                                selectedUser?.id === user.id ? 'bg-[#B09331]/20' : ''
                                                            }`}
                                                        >
                                                            <User className="w-4 h-4 text-[#888]" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white text-sm truncate">{user.nama_lengkap}</p>
                                                                <p className="text-[#888] text-xs">@{user.username}</p>
                                                            </div>
                                                            {selectedUser?.id === user.id && (
                                                                <Check className="w-4 h-4 text-[#B09331]" />
                                                            )}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">
                                    Jumlah
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQty(Math.max(1, qty - 1))}
                                        disabled={qty <= 1}
                                        className="w-12 h-12 bg-[#333] rounded-xl flex items-center justify-center text-white disabled:opacity-50 hover:bg-[#444] transition-colors"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <div className="flex-1 text-center">
                                        <input
                                            type="number"
                                            value={qty}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 1;
                                                setQty(Math.max(1, Math.min(maxQty, val)));
                                            }}
                                            min={1}
                                            max={maxQty}
                                            className="w-20 bg-[#252525] border border-[#444] rounded-xl px-3 py-2 text-white text-center text-xl font-bold focus:border-[#B09331] focus:outline-none"
                                        />
                                        <p className="text-[#888] text-xs mt-1">Max: {maxQty}</p>
                                    </div>
                                    <button
                                        onClick={() => setQty(Math.min(maxQty, qty + 1))}
                                        disabled={qty >= maxQty}
                                        className="w-12 h-12 bg-[#333] rounded-xl flex items-center justify-center text-white disabled:opacity-50 hover:bg-[#444] transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

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
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[#888]">Total Harga:</span>
                            <span className="text-[#B09331] font-bold text-xl">
                                Rp {formatRupiah(totalHarga)}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="flex-1 bg-[#333] text-white font-semibold py-3 rounded-xl hover:bg-[#444] transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !selectedUser}
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
                                        Simpan Absen
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

export default AdminAbsenStokModal;
