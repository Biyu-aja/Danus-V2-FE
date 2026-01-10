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
    ChevronDown,
    CalendarIcon,
    PhoneIcon,
    NotebookIcon,
    Save,
    ExternalLink,
    UserPlus
} from "lucide-react";
import { ambilBarangService, type AmbilBarang, type DetailSetor } from "../../../services/ambilBarang.service";
import { userService, type User as UserType } from "../../../services/user.service";
import { FaWhatsapp } from "react-icons/fa6";
import TransactionDetailModal from "./transaction-detail-modal";
import AdminAmbilBarangModalForUser from "./admin-ambil-barang-modal-for-user";

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
    const [userData, setUserData] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    
    // Track selected items for setor
    const [selectedItems, setSelectedItems] = useState<SelectedItemSetor[]>([]);
    const [selectedAdminId, setSelectedAdminId] = useState<number>(1); // Default 1 (will be updated)
    
    // Note state
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [note, setNote] = useState<string>("");
    const [originalNote, setOriginalNote] = useState<string>("");
    const [savingNote, setSavingNote] = useState(false);
    
    // Transaction detail modal state
    const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    
    // Admin ambil barang modal state
    const [showAdminAmbilModal, setShowAdminAmbilModal] = useState(false);

    // Check if viewing today's data
    const isToday = useMemo(() => {
        if (!date) return true; // No date means today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return today.getTime() === checkDate.getTime();
    }, [date]);

    // Fetch data when modal opens
    useEffect(() => {
        if (isOpen && userId) {
            fetchData();
            setSelectedItems([]);
            setError(null);
            setSuccess(false);
            setShowNoteInput(false);
            setNote("");
            setOriginalNote("");
        }
    }, [isOpen, userId, date]); // Add date to dependency

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch user data
            const userResponse = await userService.getUserById(userId);
            if (userResponse.success && userResponse.data) {
                setUserData(userResponse.data);
            }

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
                
                // Load existing keterangan from first AmbilBarang
                if (filteredData.length > 0 && filteredData[0].keterangan) {
                    setNote(filteredData[0].keterangan);
                    setOriginalNote(filteredData[0].keterangan);
                    setShowNoteInput(true);
                }
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

    // Handle add note toggle
    const handleAddNote = () => {
        setShowNoteInput(prev => !prev);
    };

    // Handle save note
    const handleSaveNote = async () => {
        if (ambilBarangList.length === 0) return;
        
        setSavingNote(true);
        try {
            // Save note to all AmbilBarang for this user on this date
            const promises = ambilBarangList.map(ab => 
                ambilBarangService.updateKeterangan(ab.id, note)
            );
            
            await Promise.all(promises);
            setOriginalNote(note);
            setError(null);
        } catch (err) {
            console.error('Error saving note:', err);
            setError('Gagal menyimpan catatan');
        } finally {
            setSavingNote(false);
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
                <div className="flex flex-col gap-2 p-4 border-b border-[#333]">
                    <div className="flex flex-row items-center gap-2 w-full justify-between">
                        <div className="flex items-center gap-2">
                            <NotebookIcon className="w-5 h-5 text-[#B09331]"/>
                            <p className="text-white font-bold text-lg">Detail Absen Danus</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-[#888]" />
                        <h2 className="text-white text-md">{userData?.nama_lengkap}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-[#888]" />
                        <p className="text-[#888] text-md">{date ? date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Hari Ini'}</p> 
                    </div>
                    {userData?.nomor_telepon && (
                        <div className="flex items-center gap-2">
                            <PhoneIcon className="w-4 h-4 text-[#888]" />
                            <p className="text-[#888] text-md">{userData.nomor_telepon}</p>
                        </div>
                    )}
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
                                                        <div className="text-right flex items-center gap-2">
                                                            <p className="text-[#B09331] font-bold">
                                                                Rp {formatRupiah(isSelected ? (selectedItem!.qty * selectedItem!.hargaSatuan) : item.totalHarga)}
                                                            </p>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedDetailId(item.id);
                                                                    setShowDetailModal(true);
                                                                }}
                                                                className="w-7 h-7 rounded-lg bg-[#333] hover:bg-[#444] flex items-center justify-center text-[#888] hover:text-white transition-colors"
                                                                title="Lihat Detail"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </button>
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
                                        <span className="text-[#888] text-xs">(klik untuk detail)</span>
                                    </div>
                                    <div className="space-y-2">
                                        {depositedItems.map(item => (
                                            <div 
                                                key={item.id}
                                                onClick={() => {
                                                    setSelectedDetailId(item.id);
                                                    setShowDetailModal(true);
                                                }}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20 cursor-pointer hover:bg-green-500/10 transition-colors"
                                            >
                                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-green-400 font-medium">{item.stokHarian.barang.nama}</p>
                                                    <p className="text-green-400/70 text-sm">
                                                        {item.qty} × Rp {formatRupiah(item.stokHarian.harga)}
                                                    </p>
                                                </div>
                                                <div className="text-right flex items-center gap-2">
                                                    <p className="text-green-400 font-bold">
                                                        Rp {formatRupiah(item.totalHarga)}
                                                    </p>
                                                    <ExternalLink className="w-4 h-4 text-green-400/50" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Note Input Section */}
                            {showNoteInput && (
                                <div className="bg-[#252525] p-3 rounded-xl border border-yellow-500/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-yellow-400 text-sm">Catatan</label>
                                        {note !== originalNote && (
                                            <span className="text-xs text-yellow-400/70">Belum disimpan</span>
                                        )}
                                    </div>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Tulis catatan di sini..."
                                        rows={3}
                                        className="w-full bg-[#1e1e1e] text-white border border-[#333] rounded-lg p-3 resize-none focus:border-yellow-500 focus:outline-none placeholder-[#666]"
                                    />
                                    <button
                                        onClick={handleSaveNote}
                                        disabled={savingNote || note === originalNote}
                                        className="mt-2 w-full bg-yellow-600 text-white font-semibold py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {savingNote ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Simpan Catatan
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}


                        </>
                    )}
                </div>

                {/* Footer */}
                {!loading && !success && (
                    <div className="p-4 border-t border-[#333] bg-[#1a1a1a] space-y-3">
                        {/* Selected Summary - only when pending items exist */}
                        {pendingItems.length > 0 && selectedItems.length > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-[#888]">
                                    {selectedItems.length} item terpilih
                                </span>
                                <span className="text-[#B09331] font-bold text-xl">
                                    Rp {formatRupiah(selectedTotal)}
                                </span>
                            </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <a 
                                href={userData?.nomor_telepon 
                                    ? `https://wa.me/${userData.nomor_telepon.replace(/^0/, '62').replace(/[^0-9]/g, '')}`
                                    : '#'
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                    userData?.nomor_telepon 
                                        ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer' 
                                        : 'bg-[#333] text-[#666] cursor-not-allowed'
                                }`}
                                onClick={(e) => {
                                    if (!userData?.nomor_telepon) {
                                        e.preventDefault();
                                    }
                                }}
                                title={userData?.nomor_telepon ? `Chat WhatsApp: ${userData.nomor_telepon}` : 'Nomor telepon tidak tersedia'}
                            >
                                <FaWhatsapp className="w-5 h-5" />
                            </a>
                            
                            {/* Admin Tambah Absen - Only show for today */}
                            {isToday && (
                                <button
                                    onClick={() => setShowAdminAmbilModal(true)}
                                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors bg-[#B09331] hover:bg-[#C4A73B] text-white"
                                    title="Tambah Pengambilan Barang"
                                >
                                    <UserPlus className="w-5 h-5" />
                                </button>
                            )}
                            
                            {/* Show these buttons only when there are pending items */}
                            {pendingItems.length > 0 ? (
                                <>
                                    <button 
                                        className={`flex-1 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm ${
                                            showNoteInput 
                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                                                : 'bg-[#333] text-white hover:bg-[#444] border border-[#444]'
                                        }`}
                                        onClick={handleAddNote}
                                    >
                                        <NotebookIcon className="w-4 h-4" />
                                        {showNoteInput ? 'Sembunyikan' : 'Lihat Catatan'}
                                    </button>
                                    <button
                                        onClick={handleSetor}
                                        disabled={submitting || selectedItems.length === 0}
                                        className="flex-1 bg-[#B09331] text-white font-semibold py-3 rounded-xl hover:bg-[#C4A73B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Konfirmasi Setor
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                /* When all items deposited, show close button */
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-[#333] text-white font-semibold py-3 rounded-xl hover:bg-[#444] transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    Tutup
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Transaction Detail Modal */}
            <TransactionDetailModal
                detailSetorId={selectedDetailId}
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedDetailId(null);
                }}
                onSuccess={() => {
                    fetchData();
                }}
            />

            {/* Admin Ambil Barang Modal for This User */}
            <AdminAmbilBarangModalForUser
                isOpen={showAdminAmbilModal}
                onClose={() => setShowAdminAmbilModal(false)}
                onSuccess={() => {
                    setShowAdminAmbilModal(false);
                    fetchData();
                    onSuccess();
                }}
                userId={userId}
                userName={userName}
            />
        </div>
    );
};

export default UserDetailSetorModal;
