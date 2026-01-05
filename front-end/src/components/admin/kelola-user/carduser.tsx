import React from "react";
import type { UserWithStatus } from "../../../services/user.service";
import { 
    CheckCircle, 
    Clock, 
    XCircle, 
    User, 
    Phone, 
    Package 
} from "lucide-react";

interface CardUserProps {
    user: UserWithStatus;
}

const CardUser: React.FC<CardUserProps> = ({ user }) => {
    // Format functions
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Status Badge Component
    const StatusBadge = ({ status }: { status: UserWithStatus['status'] }) => {
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

    return (
        <div className="bg-[#1e1e1e] rounded-xl border border-[#333] p-4 hover:border-[#B09331]/50 transition-all cursor-pointer group">
            <div className="flex items-start gap-4">
                {/* Avatar Placeholder */}
                <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center text-[#888] flex-shrink-0">
                    <User className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header: Name & Status */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-white font-bold truncate text-lg">
                            {user.nama_lengkap}
                        </h3>
                        <StatusBadge status={user.status} />
                    </div>

                    {/* Sub-header: Username & Phone */}
                    <div className="flex items-center gap-3 text-[#888] text-xs mb-3">
                        <span>@{user.username}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.nomor_telepon}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-[#252525] rounded-lg p-2 mb-3">
                        <div>
                            <p className="text-[#888] text-xs">Total Ambil</p>
                            <div className="flex items-center gap-1 text-white font-semibold">
                                <Package className="w-3 h-3 text-[#B09331]" />
                                {user.totalAmbil} item
                            </div>
                        </div>
                        <div>
                            <p className="text-[#888] text-xs">Harus Setor</p>
                            <p className="text-[#B09331] font-semibold">
                                Rp {formatRupiah(user.totalHarusSetor)}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar (if taking items) */}
                    {user.status === 'BELUM_SETOR' && user.totalAmbil > 0 && (
                        <div>
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
                </div>
            </div>
        </div>
    );
};

export default CardUser;