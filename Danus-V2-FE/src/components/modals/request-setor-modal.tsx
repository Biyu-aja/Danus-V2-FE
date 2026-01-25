import React, { useState, useEffect } from "react";
import { X, Minus, Plus, Wallet, Loader2, Check, User, ChevronDown } from "lucide-react";
import { type AmbilBarang } from "../../services/ambilBarang.service";
import { userService } from "../../services/user.service";
import { requestSetorService } from "../../services/request.service";

interface RequestSetorModalProps {
    isOpen: boolean;
    onClose: () => void;
    myAmbilBarang: AmbilBarang[];
    userId: number;
    onSuccess: () => void;
}

interface ItemRequest {
    detailSetorId: number;
    qty: number;
    maxQty: number;
    hargaSatuan: number;
    namaBarang: string;
    tanggalAmbil?: string; // Add tanggal ambil info
}

const RequestSetorModal: React.FC<RequestSetorModalProps> = ({
    isOpen,
    onClose,
    myAmbilBarang,
    userId,
    onSuccess,
}) => {
    const [items, setItems] = useState<ItemRequest[]>([]);
    const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
    const [admins, setAdmins] = useState<{ id: number; nama_lengkap: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRequestsAndCalculateMax = async () => {
        if (!isOpen) return;
        setLoading(true);
        try {
            // Fetch my pending requests to calculate correctly
            const activeRequestsResponse = await requestSetorService.getMyRequests(userId);
            let activeDetails: any[] = [];
            
            if (activeRequestsResponse.success && activeRequestsResponse.data) {
                // Filter only PENDING requests
                const pendingRequests = activeRequestsResponse.data.filter((r: any) => r.status === 'PENDING');
                
                // Collect all details from pending requests
                pendingRequests.forEach((req: any) => {
                    activeDetails = [...activeDetails, ...req.details];
                });
            }

            const initialItems: ItemRequest[] = [];
            myAmbilBarang.forEach(ab => {
                // Filter only details that are NOT yet deposited (tanggalSetor is null)
                ab.detailSetor.filter(ds => !ds.tanggalSetor).forEach(ds => {
                    // Calculate pending qty for this specific item
                    const pendingQty = activeDetails
                        .filter((d: any) => d.detailSetorId === ds.id)
                        .reduce((sum, d: any) => sum + d.qty, 0);

                    const remainingQty = Math.max(0, ds.qty - pendingQty);

                    if (remainingQty > 0) {
                        initialItems.push({
                            detailSetorId: ds.id,
                            qty: 0,
                            maxQty: remainingQty,
                            hargaSatuan: ds.totalHarga / ds.qty,
                            namaBarang: ds.stokHarian?.barang?.nama || 'Unknown',
                            tanggalAmbil: ab.tanggalAmbil // Pass tanggal ambil from parent AmbilBarang
                        });
                    }
                });
            });
            setItems(initialItems);
            fetchAdmins();
        } catch (err) {
            console.error("Error setting up modal", err);
            setError("Gagal memuat data");
        } finally {
            setLoading(false);
        }
    };

    // Initial load items from props
    useEffect(() => {
        if (isOpen) {
           fetchRequestsAndCalculateMax();
        }
    }, [isOpen, myAmbilBarang]);
    
    // fetchAdmins is called inside fetchRequestsAndCalculateMax now
    const fetchAdmins = async () => {
        try {
            const response = await userService.getAllUsers();
            if (response.success && response.data) {
                const adminUsers = response.data.filter(u => u.role === 'admin' || u.role === 'superadmin');
                setAdmins(adminUsers);
                if (adminUsers.length > 0) {
                    setSelectedAdminId(adminUsers[0].id);
                }
            }
        } catch (err) {
            console.error("Error fetching admins", err);
            setError("Gagal memuat data admin");
        }
    };

    const handleQtyChange = (detailSetorId: number, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.detailSetorId === detailSetorId) {
                const newQty = Math.max(0, Math.min(item.maxQty, item.qty + delta));
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const handleSubmit = async () => {
        if (!selectedAdminId) {
            setError("Pilih admin tujuan setor");
            return;
        }

        const selectedItems = items.filter(i => i.qty > 0);
        if (selectedItems.length === 0) {
            setError("Pilih minimal satu barang untuk disetor");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await requestSetorService.createRequest({
                userId,
                adminId: selectedAdminId,
                items: selectedItems.map(i => ({
                    detailSetorId: i.detailSetorId,
                    qty: i.qty
                }))
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error creating request", err);
            setError(err.response?.data?.message || "Gagal membuat permintaan setor");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const totalSetor = items.reduce((sum, item) => sum + (item.qty * item.hargaSatuan), 0);

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-end justify-center md:items-center"
            onClick={onClose}
        >
            <div 
                className="bg-[#1e1e1e] w-full max-w-lg md:rounded-2xl rounded-t-3xl p-6 animate-slide-up md:animate-scale-up max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6 flex-shrink-0">
                    <h2 className="text-white text-lg font-bold flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-[#B09331]" />
                        Request Setor
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-[#888] hover:text-white transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {/* Admin Selection */}
                    <div>
                        <label className="text-[#888] text-sm mb-2 block">Setor Kepada</label>
                        {loading ? (
                             <div className="h-12 bg-[#2a2a2a] rounded-xl animate-pulse" />
                        ) : (
                            <div className="relative">
                                <select 
                                    value={selectedAdminId || ''}
                                    onChange={(e) => setSelectedAdminId(Number(e.target.value))}
                                    className="w-full bg-[#2a2a2a] text-white border border-[#333] rounded-xl p-3 appearance-none focus:outline-none focus:border-[#B09331] transition-colors"
                                >
                                    <option value="" disabled>Pilih Admin</option>
                                    {admins.map(admin => (
                                        <option key={admin.id} value={admin.id}>
                                            {admin.nama_lengkap}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#888]">
                                    <ChevronDown className={`w-4 h-4 ${selectedAdminId ? 'text-[#B09331]' : 'opacity-0'}`} />
                                </div>
                            </div>
                        )}
                        {admins.length === 0 && !loading && (
                            <p className="text-red-400 text-sm mt-1">Tidak ada admin tersedia</p>
                        )}
                    </div>

                    {/* Items Selection */}
                    <div>
                        <label className="text-[#888] text-sm mb-2 block">Pilih Barang yang Disetor</label>
                        <div className="space-y-3">
                            {items.map(item => (
                                <div key={item.detailSetorId} className="bg-[#2a2a2a] p-3 rounded-xl border border-[#333]">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-white font-medium">{item.namaBarang}</h4>
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                <p className="text-[#888] text-xs">Sisa ambil: {item.maxQty}</p>
                                                {item.tanggalAmbil && (
                                                    <p className="text-[#666] text-[10px]">
                                                        {new Date(item.tanggalAmbil).toLocaleDateString('id-ID', {
                                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[#B09331]">Rp {item.hargaSatuan.toLocaleString('id-ID')}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between bg-[#1e1e1e] rounded-lg p-2">
                                        <button 
                                            onClick={() => handleQtyChange(item.detailSetorId, -1)}
                                            className="w-8 h-8 rounded-full bg-[#333] text-white flex items-center justify-center hover:bg-[#444] disabled:opacity-50"
                                            disabled={item.qty <= 0}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-white font-bold">{item.qty}</span>
                                        <button 
                                            onClick={() => handleQtyChange(item.detailSetorId, 1)}
                                            className="w-8 h-8 rounded-full bg-[#B09331] text-white flex items-center justify-center hover:bg-[#C4A73B] disabled:opacity-50"
                                            disabled={item.qty >= item.maxQty}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-[#333] flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[#888]">Total Setor</span>
                        <span className="text-xl font-bold text-white">Rp {totalSetor.toLocaleString('id-ID')}</span>
                    </div>

                    {error && (
                        <div className="mb-3 p-2 bg-red-500/20 text-red-400 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={submitting || totalSetor === 0 || !selectedAdminId}
                        className="w-full bg-gradient-to-r from-[#B09331] to-[#D4AF37] text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#B09331]/20 transition-all"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                <Wallet className="w-5 h-5" />
                                Ajukan Setor
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes scale-up {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out; }
                .md\\:animate-scale-up { animation: scale-up 0.2s ease-out; }
            `}</style>
        </div>
    );
};

export default RequestSetorModal;
