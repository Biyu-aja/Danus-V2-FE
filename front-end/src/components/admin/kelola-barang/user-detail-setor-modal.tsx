import React, { useState, useEffect, useMemo } from "react";
import { 
    X, 
    User, 
    Package, 
    Check,
    Loader2,
    AlertCircle,
    Phone,
    CheckCircle,
    Clock,
    XCircle,
    Minus,
    Plus,
    ChevronDown
} from "lucide-react";
import { ambilBarangService, type AmbilBarang, type DetailSetor } from "../../../services/ambilBarang.service";
import { userService, type User as UserType } from "../../../services/user.service";

interface UserDetailSetorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: number;
    userName: string;
    date?: Date; // Optional date property
}

interface SelectedItemSetor {
    detailId: number;
    qty: number;
    hargaSatuan: number;
}

const UserDetailSetorModal: React.FC<UserDetailSetorModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess,
    userId,
    userName,
    date
}) => {
    const [ambilBarangList, setAmbilBarangList] = useState<AmbilBarang[]>([]);
    const [admins, setAdmins] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    
    // Track selected items for setor
    const [selectedItems, setSelectedItems] = useState<SelectedItemSetor[]>([]);
    const [selectedAdminId, setSelectedAdminId] = useState<number>(1); // Default 1 (will be updated)

    // Fetch data when modal opens
    useEffect(() => {
        if (isOpen && userId) {
            fetchData();
            setSelectedItems([]);
            setError(null);
            setSuccess(false);
        }
    }, [isOpen, userId, date]); // Add date to dependency

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch user's ambil barang
            const response = await ambilBarangService.getAmbilBarangByUserId(userId);
            if (response.success && response.data) {
                // Use provided date or default to Today
                const targetDate = date ? new Date(date) : new Date();
                targetDate.setHours(0, 0, 0, 0);

                const filteredData = response.data.filter(ab => {
                    const ambilDate = new Date(ab.tanggalAmbil);
                    ambilDate.setHours(0, 0, 0, 0);
                    return ambilDate.getTime() === targetDate.getTime();
                });
                setAmbilBarangList(filteredData);
            }

            // Fetch admins for dropdown
            const usersResponse = await userService.getAllUsers();
            if (usersResponse.success && usersResponse.data) {
                const adminList = usersResponse.data.filter(u => u.role === 'admin');
                setAdmins(adminList);
                // Set default admin (logged in user ideally, but first admin for now)
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

    // Get all detail setor items that are NOT yet deposited
    const pendingItems = useMemo(() => {
        const items: (DetailSetor & { ambilBarangId: number })[] = [];
        ambilBarangList.forEach(ab => {
            ab.detailSetor.forEach(detail => {
                if (!detail.tanggalSetor) {
                    items.push({ ...detail, ambilBarangId: ab.id });
                }
            });
        });
        return items;
    }, [ambilBarangList]);

    // Get all deposited items
    const depositedItems = useMemo(() => {
        const items: (DetailSetor & { ambilBarangId: number })[] = [];
        ambilBarangList.forEach(ab => {
            ab.detailSetor.forEach(detail => {
                if (detail.tanggalSetor) {
                    items.push({ ...detail, ambilBarangId: ab.id });
                }
            });
        });
        return items;
    }, [ambilBarangList]);

    // Toggle item selection
    const toggleItem = (detailId: number, maxQty: number, totalHarga: number) => {
        setSelectedItems(prev => {
            const exists = prev.find(item => item.detailId === detailId);
            if (exists) {
                return prev.filter(item => item.detailId !== detailId);
            } else {
                return [...prev, {
                    detailId,
                    qty: maxQty, // Default to max qty
                    hargaSatuan: totalHarga / maxQty
                }];
            }
        });
    };

    // Update quantity for selected item
    const updateQty = (detailId: number, delta: number, maxQty: number) => {
        setSelectedItems(prev => prev.map(item => {
            if (item.detailId === detailId) {
                const newQty = Math.max(1, Math.min(maxQty, item.qty + delta));
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    // Select all pending items
    const selectAllPending = () => {
        setSelectedItems(pendingItems.map(item => ({
            detailId: item.id,
            qty: item.qty,
            hargaSatuan: item.totalHarga / item.qty
        })));
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedItems([]);
    };

    // Calculate selected total
    const selectedTotal = useMemo(() => {
        return selectedItems.reduce((sum, item) => sum + (item.qty * item.hargaSatuan), 0);
    }, [selectedItems]);

    // Handle setor
    const handleSetor = async () => {
        if (selectedItems.length === 0) {
            setError('Pilih minimal 1 item untuk disetor');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                items: selectedItems.map(item => ({
                    detailSetorId: item.detailId,
                    qty: item.qty
                })),
                adminId: selectedAdminId
            };

            const response = await ambilBarangService.prosesSetor(payload);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            } else {
                setError(response.message || 'Gagal memproses setor');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Terjadi kesalahan jaringan');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-[#1e1e1e] w-full max-w-lg max-h-[90vh] rounded-2xl overflow-hidden shadow-xl border border-[#333] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#333]">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-[#B09331]" />
                        <div>
                            <h2 className="text-white font-bold text-lg">{userName}</h2>
                            <p className="text-[#888] text-xs">{date ? date.toDateString() : 'Detail Pengambilan Hari Ini'}</p>
                        </div>
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
                            <CheckCircle className="w-16 h-16 mb-2" />
                            <p className="font-semibold">Setor berhasil!</p>
                        </div>
                    ) : ambilBarangList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-[#888]">
                            <Package className="w-12 h-12 mb-2 opacity-50" />
                            <p>Belum ada pengambilan hari ini</p>
                        </div>
                    ) : (
                        <>
                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Pending Items */}
                            {pendingItems.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-yellow-400" />
                                            <span className="text-white text-sm font-medium">Belum Disetor</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={clearSelection}
                                                className="text-xs text-[#888] hover:text-white"
                                            >
                                                Clear
                                            </button>
                                            <button
                                                onClick={selectAllPending}
                                                className="text-xs text-[#B09331] hover:text-[#C4A73B]"
                                            >
                                                Pilih Semua
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {pendingItems.map(item => {
                                            const selectedItem = selectedItems.find(s => s.detailId === item.id);
                                            const isSelected = !!selectedItem;
                                            
                                            return (
                                                <div 
                                                    key={item.id}
                                                    className={` rounded-xl border transition-all ${
                                                        isSelected
                                                            ? 'bg-[#B09331]/10 border-[#B09331]/50'
                                                            : 'bg-[#252525] border-[#444] hover:border-[#666]'
                                                    }`}
                                                >
                                                    {/* Main Row */}
                                                    <div 
                                                        className="flex items-center gap-3 p-3 cursor-pointer"
                                                        onClick={() => toggleItem(item.id, item.qty, item.totalHarga)}
                                                    >
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                                            isSelected 
                                                                ? 'bg-[#B09331] border-[#B09331]'
                                                                : 'border-[#666]'
                                                        }`}>
                                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <div className={`w-10 h-10 rounded-lg bg-[#333] flex items-center justify-center`}>
                                                            {item.stokHarian.barang.gambar ? (
                                                                <img 
                                                                    src={item.stokHarian.barang.gambar} 
                                                                    alt={item.stokHarian.barang.nama} 
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            ) : (
                                                                <Package className="w-5 h-5 text-[#888]" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white font-medium">{item.stokHarian.barang.nama}</p>
                                                            <p className="text-[#888] text-sm">
                                                                Max: {item.qty} item
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[#B09331] font-bold">
                                                                Rp {formatRupiah(isSelected ? (selectedItem!.qty * selectedItem!.hargaSatuan) : item.totalHarga)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Quantity Control (Show if selected and qty > 1) */}
                                                    {isSelected && item.qty > 1 && (
                                                        <div className="px-3 pb-3 pt-0 flex items-center justify-between border-t border-[#B09331]/20 mt-1">
                                                            <p className="text-[#B09331] text-xs pt-2">Atur jumlah setor:</p>
                                                            <div className="flex items-center gap-3 mt-2 bg-[#1a1a1a] rounded-lg p-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateQty(item.id, -1, item.qty);
                                                                    }}
                                                                    disabled={selectedItem.qty <= 1}
                                                                    className="w-7 h-7 flex items-center justify-center rounded bg-[#333] text-white disabled:opacity-30 hover:bg-[#444]"
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </button>
                                                                <span className="text-white font-bold w-6 text-center">
                                                                    {selectedItem.qty}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateQty(item.id, 1, item.qty);
                                                                    }}
                                                                    disabled={selectedItem.qty >= item.qty}
                                                                    className="w-7 h-7 flex items-center justify-center rounded bg-[#333] text-white disabled:opacity-30 hover:bg-[#444]"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Setor To Dropdown */}
                            {selectedItems.length > 0 && (
                                <div className="bg-[#252525] p-3 rounded-xl border border-[#444]">
                                    <label className="text-[#888] text-sm block mb-2">Setor Kepada (Admin)</label>
                                    <div className="relative">
                                        <select
                                            value={selectedAdminId}
                                            onChange={(e) => setSelectedAdminId(Number(e.target.value))}
                                            className="w-full bg-[#1e1e1e] text-white border border-[#333] rounded-lg p-3 appearance-none focus:border-[#B09331] focus:outline-none"
                                        >
                                            {admins.map(admin => (
                                                <option key={admin.id} value={admin.id}>
                                                    {admin.nama_lengkap}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#888] pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            {/* Deposited Items */}
                            {depositedItems.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-white text-sm font-medium">Sudah Disetor</span>
                                    </div>
                                    <div className="space-y-2">
                                        {depositedItems.map(item => (
                                            <div 
                                                key={item.id}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20"
                                            >
                                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-green-400 font-medium">{item.stokHarian.barang.nama}</p>
                                                    <p className="text-green-400/70 text-sm">
                                                        {item.qty} × Rp {formatRupiah(item.stokHarian.harga)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-green-400 font-bold">
                                                        Rp {formatRupiah(item.totalHarga)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!loading && !success && pendingItems.length > 0 && (
                    <div className="p-4 border-t border-[#333] bg-[#1a1a1a]">
                        {selectedItems.length > 0 && (
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[#888]">
                                    {selectedItems.length} item terpilih
                                </span>
                                <span className="text-[#B09331] font-bold text-xl">
                                    Rp {formatRupiah(selectedTotal)}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={handleSetor}
                            disabled={submitting || selectedItems.length === 0}
                            className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Konfirmasi Setor
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDetailSetorModal;
