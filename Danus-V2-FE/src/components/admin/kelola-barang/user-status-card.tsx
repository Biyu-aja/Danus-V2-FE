import React, { useState } from "react";
import { 
    Phone,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";
import UserDetailSetorModal from "./user-detail-setor-modal";
import type { UserWithStatus } from "../../../services/user.service";
import { formatWhatsAppNumber } from "../../../helper/formatwhatsapp";

interface UserStatusCardProps {
    user: UserWithStatus;
    selectedBarangIds?: number[];
    onSuccess?: () => void;
    date?: Date;
    viewMode?: 'daily' | 'pending'; // Add viewMode prop
}

// Status Badge Component
const StatusBadge: React.FC<{ status: UserWithStatus['status'] }> = ({ status }) => {
    const config = {
        'SUDAH_SETOR': {
            icon: CheckCircle,
            label: 'Sudah Setor',
            className: 'bg-green-500/20 text-green-400 border-green-500/30',
        },
        'BELUM_SETOR': {
            icon: Clock,
            label: 'Belum Setor',
            className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        },
        'BELUM_AMBIL': {
            icon: XCircle,
            label: 'Belum Ambil',
            className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        },
    }[status];

    const Icon = config.icon;

    return (
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
};

const UserStatusCard: React.FC<UserStatusCardProps> = ({ 
    user, 
    selectedBarangIds = [],
    onSuccess,
    date,
    viewMode // Destructure viewMode
}) => {
    const [showModal, setShowModal] = useState(false);

    // Format rupiah
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Handle WhatsApp link click - prevent card click propagation
    const handleWhatsAppClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <>
            <div 
                onClick={() => setShowModal(true)}
                className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden hover:border-[#B09331]/50 transition-all cursor-pointer group"
            >
                <div className="p-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 justify-between">
                                <h3 className="text-white font-semibold truncate">
                                    {user.nama_lengkap}
                                </h3>
                                <StatusBadge status={user.status} />
                            </div>
                        </div>

                        {user.status !== 'BELUM_AMBIL' && (
                            <div className="flex flex-row justify-between items-center">
                                <div className="flex flex-row items-center gap-1">
                                    <p className="text-[#ffffff] text-sm">Item diambil: {user.totalAmbil}</p>
                                </div>
                                <p className="text-[#B09331] text-sm font-semibold mt-1">
                                    Total Setor: Rp{formatRupiah(user.totalHarusSetor)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {user.status === 'BELUM_SETOR' && user.totalAmbil > 0 && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-[#888]">Progress Setor</span>
                                <span className="text-yellow-400">
                                    {user.totalSetor}/{user.totalAmbil} item
                                </span>
                            </div>
                            <div className="h-1.5 bg-[#333] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-yellow-500 rounded-full transition-all"
                                    style={{ 
                                        width: `${(user.totalSetor / user.totalAmbil) * 100}%` 
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Barang List */}
                    {user.barangList && user.barangList.length > 0 && (
                        <div className="mt-3">
                            <p className="text-[#888] text-xs mb-1.5">Barang diambil:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {user.barangList.map((barang) => (
                                    <span 
                                        key={barang.barangId}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${
                                            selectedBarangIds.includes(barang.barangId)
                                                ? 'bg-[#B09331]/30 text-[#B09331] border border-[#B09331]/50'
                                                : 'bg-[#252525] text-[#aaa]'
                                        }`}
                                    >
                                        {barang.nama}
                                        <span className="font-semibold">×{barang.qty}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Catatan */}
                    {user.catatan && (
                        <div className="mt-2 p-2 bg-[#252525] rounded-lg">
                            <p className="text-[#888] text-xs">{user.catatan}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <UserDetailSetorModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => {
                    setShowModal(false);
                    if (onSuccess) onSuccess();
                }}
                userId={user.id}
                userName={user.nama_lengkap}
                date={date}
                viewMode={viewMode} // Pass viewMode
            />
        </>
    );
};

export default UserStatusCard;
