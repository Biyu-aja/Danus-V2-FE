import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, Check, X, Clock, User, Package, Calendar } from "lucide-react";
import Navbar from "../../../components/admin/general-admin/navbar";
import { requestSetorService } from "../../../services/request.service";
import { authService } from "../../../services/auth.service";

interface RequestDetail {
    detailSetorId: number;
    qty: number;
    detailSetor: {
        stokHarian: {
            harga: number;
            barang: {
                nama: string;
                gambar: string | null;
            };
        };
        totalHarga: number;
        qty: number;
    };
}

interface RequestSetor {
    id: number;
    userId: number;
    adminId: number;
    status: string;
    createdAt: string;
    user: {
        id: number;
        nama_lengkap: string;
    };
    details: RequestDetail[];
}

const KelolaRequest: React.FC = () => {
    const [requests, setRequests] = useState<RequestSetor[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const response = await requestSetorService.getAdminRequests(currentUser.id);
            if (response.success) {
                setRequests(response.data);
            }
        } catch (err) {
            console.error("Error fetching requests:", err);
            setError("Gagal memuat permintaan setor.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        setProcessingId(id);
        setError(null);
        try {
            await requestSetorService.approveRequest(id);
            setSuccessMessage("Permintaan berhasil disetujui!");
            // Remove from list
            setRequests(prev => prev.filter(req => req.id !== id));
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            console.error("Error approving request:", err);
            setError(err.response?.data?.message || "Gagal menyetujui permintaan.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("Yakin ingin menolak permintaan ini?")) return;
        
        setProcessingId(id);
        setError(null);
        try {
            await requestSetorService.rejectRequest(id);
            setSuccessMessage("Permintaan berhasil ditolak.");
            // Remove from list
            setRequests(prev => prev.filter(req => req.id !== id));
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            console.error("Error rejecting request:", err);
            setError(err.response?.data?.message || "Gagal menolak permintaan.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#121212] pb-[5rem]">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-[#1e1e1e] border-b border-[#333] flex items-center px-4 z-50">
                <h1 className="text-white font-bold text-lg">Permintaan Setor</h1>
            </header>

            <main className="flex-1 p-4 mt-16">
                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 mb-4 text-red-400 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 flex items-center gap-2 mb-4 text-green-400 text-sm">
                        <Check className="w-5 h-5 flex-shrink-0" />
                        {successMessage}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-[#888]">
                        <Loader2 className="w-10 h-10 animate-spin mb-3" />
                        <p>Memuat permintaan...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-[#888]">
                        <Check className="w-12 h-12 mb-3 opacity-20" />
                        <p>Tidak ada permintaan setor tertunda</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((req) => {
                            const totalAmount = req.details.reduce((sum, d) => sum + (d.qty * d.detailSetor.stokHarian.harga), 0);

                            return (
                                <div key={req.id} className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden">
                                    {/* Request Header */}
                                    <div className="p-3 bg-[#252525] flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-[#B09331]">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{req.user.nama_lengkap}</p>
                                                <div className="flex items-center gap-2 text-[#888] text-xs mt-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(req.createdAt).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full border border-yellow-500/20">
                                            Pending
                                        </span>
                                    </div>

                                    {/* Items List */}
                                    <div className="p-3 space-y-3">
                                        {req.details.map((detail, idx) => (
                                            <div key={idx} className="flex gap-3 text-sm">
                                                <div className="w-10 h-10 rounded bg-[#333] flex-shrink-0 overflow-hidden">
                                                    {detail.detailSetor.stokHarian.barang.gambar ? (
                                                        <img 
                                                            src={detail.detailSetor.stokHarian.barang.gambar} 
                                                            alt="" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-blue-500/20">
                                                            <Package className="w-4 h-4 text-blue-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white text-xs">{detail.detailSetor.stokHarian.barang.nama}</p>
                                                    <p className="text-[#888] text-[10px]">
                                                        {detail.qty} x Rp {detail.detailSetor.stokHarian.harga.toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white font-medium text-xs">
                                                        Rp {(detail.qty * detail.detailSetor.stokHarian.harga).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="p-3 border-t border-[#333] bg-[#252525]/50">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[#888] text-sm">Total Setor</span>
                                            <span className="text-[#B09331] font-bold text-lg">
                                                Rp {totalAmount.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleReject(req.id)}
                                                disabled={processingId === req.id}
                                                className="py-2 rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium disabled:opacity-50"
                                            >
                                                Tolak
                                            </button>
                                            <button
                                                onClick={() => handleApprove(req.id)}
                                                disabled={processingId === req.id}
                                                className="py-2 rounded-lg bg-[#B09331] text-white hover:bg-[#C4A73B] transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {processingId === req.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                Terima
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Navbar />
        </div>
    );
};

export default KelolaRequest;
