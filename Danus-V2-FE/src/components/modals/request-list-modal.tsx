import React, { useState, useEffect } from "react";
import { X, Clock, Check, XCircle, ChevronRight, Loader2, Package } from "lucide-react";
import { requestSetorService } from "../../services/request.service";

interface RequestListModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
}

import { Search, User } from "lucide-react";
// ... imports

const RequestListModal: React.FC<RequestListModalProps> = ({
    isOpen,
    onClose,
    userId,
}) => {
    const [requests, setRequests] = useState<any[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchRequests();
            setFilterDate("");
        }
    }, [isOpen, userId]);

    useEffect(() => {
        if (!filterDate) {
            setFilteredRequests(requests);
            return;
        }
        
        const filtered = requests.filter(req => {
            const reqDate = new Date(req.createdAt).toISOString().split('T')[0];
            return reqDate === filterDate;
        });
        setFilteredRequests(filtered);
    }, [filterDate, requests]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await requestSetorService.getMyRequests(userId);
            if (response.success && response.data) {
                setRequests(response.data);
                setFilteredRequests(response.data);
            }
        } catch (err) {
            console.error("Error fetching requests:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

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
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-white text-lg font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#B09331]" />
                        Riwayat Request
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-[#888] hover:text-white transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Date Filter */}
                <div className="mb-4 relative">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full bg-[#2a2a2a] border border-[#333] rounded-xl py-2 px-4 text-white text-sm focus:outline-none focus:border-[#B09331] appearance-none"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-[#B09331]" />
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-10 text-[#888]">
                            <p>Tidak ada request ditemukan</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredRequests.map((req) => {
                                const totalAmount = req.details.reduce((sum: number, d: any) => sum + (d.qty * d.detailSetor.stokHarian.harga), 0);
                                const itemCount = req.details.reduce((sum: number, d: any) => sum + d.qty, 0);

                                return (
                                <div key={req.id} className="bg-[#2a2a2a] rounded-xl border border-[#333] p-3 hover:border-[#444] transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5 text-xs text-[#888] mb-1">
                                                <span>{new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    <span>{req.admin?.nama_lengkap || 'Admin'}</span>
                                                </div>
                                            </div>
                                            <h4 className="text-white font-medium text-sm">
                                                Total Reward: <span className="text-[#B09331]">Rp {totalAmount.toLocaleString('id-ID')}</span>
                                            </h4>
                                            <p className="text-[#666] text-xs">{itemCount} items</p>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                                            req.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                                            req.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border-red-500/20' :
                                            'bg-yellow-500/20 text-yellow-500 border-yellow-500/20'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    
                                    {/* Collapsible or simple list? Let's keep it simple as requested "persimpel" */}
                                    <div className="mt-2 text-xs text-[#888] border-t border-[#333] pt-2">
                                        {req.details.map((d: any, idx: number) => (
                                            <span key={idx}>
                                                {d.detailSetor.stokHarian.barang.nama} ({d.qty}){idx < req.details.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
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

export default RequestListModal;
