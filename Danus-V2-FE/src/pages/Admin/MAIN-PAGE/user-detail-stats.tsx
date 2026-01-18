import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../components/general/header";
import Navbar from "../../../components/admin/general-admin/navbar";
import UserDetailSetorModal from "../../../components/admin/kelola-barang/user-detail-setor-modal";
import EditUserModal from "../../../components/admin/kelola-barang/edit-user-modal";
import { 
    ArrowLeft, 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    User, 
    Loader2,
    Activity,
    CheckCircle,
    Package,
    Edit,
    FileText
} from "lucide-react";
import { userService, type UserStats, type CalendarDay } from "../../../services/user.service";
import { FaWhatsapp } from "react-icons/fa6";
import { formatWhatsAppNumber } from "../../../helper/formatwhatsapp";

const UserDetailStatsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal state
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetailDate, setSelectedDetailDate] = useState<Date | undefined>(undefined);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (id) {
            fetchStats();
        }
    }, [id, currentDate]);

    const fetchStats = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const response = await userService.getUserMonthlyStats(parseInt(id), year, month);
            
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const getMonthName = (date: Date) => {
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    // Helper to render calendar grid
    const renderCalendar = () => {
        if (!stats) return null;

        // Create empty slots for days before the 1st of the month to align grid
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        // Adjust for Sunday start (0) -> if we want to start from Sunday
        const emptySlots = Array(firstDayOfMonth).fill(null);
        
        const days = [...emptySlots, ...stats.calendar];
        
        return (
            <div className="grid grid-cols-7 gap-2 mb-4">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', ' Jum', 'Sab'].map(day => (
                    <div key={day} className="text-center text-[#888] text-xs font-medium py-2">
                        {day}
                    </div>
                ))}
                
                {days.map((day: CalendarDay | null, index) => {
                    if (!day) return <div key={`empty-${index}`} />;

                    const dateObj = new Date(day.date);
                    const dayNumber = dateObj.getDate();
                    
                    let bgClass = "bg-[#252525]";
                    let statusColor = "";
                    let cursorClass = "cursor-pointer hover:brightness-110";
                    
                    switch (day.status) {
                        case 'HIJAU':
                            bgClass = "bg-green-500/20 border-green-500/50";
                            statusColor = "text-green-500";
                            break;
                        case 'KUNING':
                            bgClass = "bg-yellow-500/20 border-yellow-500/50";
                            statusColor = "text-yellow-500";
                            break;
                        case 'MERAH':
                            bgClass = "bg-red-500/20 border-red-500/50";
                            statusColor = "text-red-500";
                            break;
                        case 'ABU':
                            bgClass = "bg-gray-500/20 border-gray-500/50";
                            statusColor = "text-gray-500";
                            cursorClass = "cursor-pointer hover:brightness-110";
                            break;
                        case 'HITAM':
                            bgClass = "bg-[#0a0a0a] border-[#222]";
                            statusColor = "text-[#444]";
                            cursorClass = "cursor-default";
                            break;
                    }

                    return (
                        <div 
                            key={day.date} 
                            onClick={() => {
                                if (day.status === 'HITAM') return; // No action for days without stock
                                setSelectedDetailDate(new Date(day.date));
                                setShowDetailModal(true);
                            }}
                            className={`
                                aspect-square rounded-xl border flex flex-col items-center justify-center relative
                                ${bgClass} ${cursorClass}
                            `}
                        >
                            <span className={`text-sm font-semibold ${statusColor}`}>{dayNumber}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
            
            <main className="flex flex-col mt-[3.5rem] gap-4 p-4 mb-[5rem]">
                {/* Header Navigation */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-xl bg-[#1e1e1e] flex items-center justify-center text-[#888] hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-white text-lg font-bold">Statistik User</h1>
                        <p className="text-[#888] text-sm">Detail aktivitas bulanan {stats?.user.nama_lengkap}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-[20rem]">
                        <div className="flex flex-col items-center gap-2 text-[#888]">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p>Memuat data...</p>
                        </div>
                    </div>
                ) : !stats ? (
                    <div className="text-center text-[#888] mt-10">User tidak ditemukan</div>
                ) : (
                    <>
                        {/* User Card */}
                        <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#333] flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-2 items-center">
                                <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center text-[#888]">
                                    <User className="w-6 h-6" />
                                </div>
                                <h2 className="text-white font-bold text-lg">{stats.user.nama_lengkap}</h2>
                            </div>
                            <div>
                                <button className="bg-green-500 p-2 rounded flex items-center justify-center gap-2"
                                    onClick={()=>window.open(
                                        `https://wa.me/${formatWhatsAppNumber(stats.user.nomor_telepon)}`,
                                        "_blank"
                                    )}
                                >
                                    <FaWhatsapp />
                                    Hubungi {stats.user.nama_lengkap}
                                </button>
                            </div>
                        </div>

                        {/* Catatan Admin (if exists) */}
                        {stats.user.catatan && (
                            <div className="bg-[#1e1e1e] rounded-xl p-4 border border-[#333]">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4 text-[#B09331]" />
                                    <span className="text-[#888] text-sm">Catatan Admin</span>
                                </div>
                                <p className="text-white text-sm whitespace-pre-wrap">{stats.user.catatan}</p>
                            </div>
                        )}

                        {/* Edit Button */}
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center justify-center gap-2 w-full bg-[#1e1e1e] border border-[#333] rounded-xl py-3 text-[#B09331] hover:bg-[#252525] transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Data User
                        </button>

                        {/* Summary Stats */}
                        {(() => {
                            let totalAmbil = 0;
                            let totalHadir = 0;
                            let totalHijau = 0;
                            let totalHariKerja = 0;

                            stats.calendar.forEach(day => {
                                // Exclude ABU (weekend) and HITAM (no danus) from work days
                                if (day.status !== 'ABU' && day.status !== 'HITAM') totalHariKerja++;
                                if (day.status === 'HIJAU' || day.status === 'KUNING') {
                                    totalHadir++;
                                    if (day.detail?.totalAmbil) totalAmbil += day.detail.totalAmbil;
                                }
                                if (day.status === 'HIJAU') totalHijau++;
                            });

                            const persentaseHadir = totalHariKerja > 0 ? Math.round((totalHadir / totalHariKerja) * 100) : 0;
                            const persentaseSetor = totalHadir > 0 ? Math.round((totalHijau / totalHadir) * 100) : 0;

                            return (
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-[#1e1e1e] border border-[#333] p-3 rounded-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-1.5 rounded-lg bg-[#B09331]/10">
                                                <Package size={14} className="text-[#B09331]" />
                                            </div>
                                            <p className="text-[#888] text-xs">Total Barang</p>
                                        </div>
                                        <p className="text-white text-xl font-bold">{totalAmbil} <span className="text-sm font-normal text-[#666]">pcs</span></p>
                                    </div>
                                    <div className="bg-[#1e1e1e] border border-[#333] p-3 rounded-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-1.5 rounded-lg bg-blue-500/10">
                                                <Activity size={14} className="text-blue-500" />
                                            </div>
                                            <p className="text-[#888] text-xs">Keaktifan</p>
                                        </div>
                                        <p className="text-white text-xl font-bold">{persentaseHadir}%</p>
                                    </div>
                                    <div className="bg-[#1e1e1e] border border-[#333] p-3 rounded-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-1.5 rounded-lg bg-green-500/10">
                                                <CheckCircle size={14} className="text-green-500" />
                                            </div>
                                            <p className="text-[#888] text-xs">Ketertiban</p>
                                        </div>
                                        <p className={`${persentaseSetor >= 80 ? 'text-green-500' : 'text-yellow-500'} text-xl font-bold`}>
                                            {persentaseSetor}%
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Calendar Section */}
                        <div className="bg-[#1e1e1e] rounded-xl border border-[#333] p-4">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#B09331]" />
                                    Statistik Absensi
                                </h3>
                                <div className="flex items-center gap-2 bg-[#252525] rounded-lg p-1">
                                    <button 
                                        onClick={prevMonth}
                                        className="p-1 hover:bg-[#333] rounded-md text-[#888] hover:text-white transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-white text-sm font-medium w-28 text-center">
                                        {getMonthName(currentDate)}
                                    </span>
                                    <button 
                                        onClick={nextMonth}
                                        className="p-1 hover:bg-[#333] rounded-md text-[#888] hover:text-white transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {renderCalendar()}

                            {/* Legend */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-[#888] text-xs">Ambil & Setor</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span className="text-[#888] text-xs">Ambil, Belum Setor</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-[#888] text-xs">Tidak Ambil</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                    <span className="text-[#888] text-xs">Libur / Weekend</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#1a1a1a] border border-[#333]"></div>
                                    <span className="text-[#888] text-xs">Tidak Ada Danus</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            <Navbar />

            {/* Modal Detail Setor - Only render if user exists */}
            {stats && (
                <UserDetailSetorModal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    onSuccess={() => {
                        setShowDetailModal(false);
                        fetchStats(); // Refresh stats after changes
                    }}
                    userId={stats.user.id}
                    userName={stats.user.nama_lengkap}
                    date={selectedDetailDate}
                />
            )}

            {/* Edit User Modal */}
            {stats && (
                <EditUserModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={(updatedUser) => {
                        setShowEditModal(false);
                        // Update local state with new user data
                        setStats(prev => prev ? { ...prev, user: { ...prev.user, ...updatedUser } } : null);
                    }}
                    user={stats.user}
                />
            )}
        </div>
    );
};

export default UserDetailStatsPage;
