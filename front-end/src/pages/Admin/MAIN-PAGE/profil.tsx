import React, { useState, useEffect } from "react";
import Header from "../../../components/general/header";
import Navbar from "../../../components/admin/general-admin/navbar";
import { 
    User, 
    LogOut, 
    ChevronRight, 
    Shield,
    PhoneIcon,
    Settings,
    Users,
    Package as PackageIcon,
    Wallet,
    Activity,
    CheckCircle,
    Calendar,
    ChevronLeft,
    Loader2
} from "lucide-react";
import { authService } from "../../../services/auth.service";
import { userService, type UserStats, type CalendarDay } from "../../../services/user.service";
import { useNavigate } from "react-router-dom";

const AdminProfilPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    
    // Stats state
    const [loadingStats, setLoadingStats] = useState(true);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (currentUser?.id) {
            fetchStats();
        }
    }, [currentUser?.id, currentDate]);

    const fetchStats = async () => {
        if (!currentUser?.id) return;
        setLoadingStats(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const response = await userService.getUserMonthlyStats(currentUser.id, year, month);
            
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStats(false);
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

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    // Calculate stats summary
    const calculateStats = () => {
        if (!stats) return { totalAmbil: 0, persentaseHadir: 0, persentaseSetor: 0 };

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

        return { totalAmbil, persentaseHadir, persentaseSetor };
    };

    // Render mini calendar
    const renderMiniCalendar = () => {
        if (!stats) return null;

        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const emptySlots = Array(firstDayOfMonth).fill(null);
        const days = [...emptySlots, ...stats.calendar];

        return (
            <div className="grid grid-cols-7 gap-1">
                {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-[#666] text-xs py-1">
                        {day}
                    </div>
                ))}
                
                {days.map((day: CalendarDay | null, index) => {
                    if (!day) return <div key={`empty-${index}`} />;

                    const dateObj = new Date(day.date);
                    const dayNumber = dateObj.getDate();
                    
                    let bgClass = "bg-[#252525]";
                    let textColor = "text-[#666]";
                    
                    switch (day.status) {
                        case 'HIJAU':
                            bgClass = "bg-green-500/30";
                            textColor = "text-green-400";
                            break;
                        case 'KUNING':
                            bgClass = "bg-yellow-500/30";
                            textColor = "text-yellow-400";
                            break;
                        case 'MERAH':
                            bgClass = "bg-red-500/30";
                            textColor = "text-red-400";
                            break;
                        case 'ABU':
                            bgClass = "bg-[#1a1a1a]";
                            textColor = "text-[#444]";
                            break;
                        case 'HITAM':
                            bgClass = "bg-[#0a0a0a]";
                            textColor = "text-[#333]";
                            break;
                    }

                    return (
                        <div 
                            key={day.date} 
                            className={`aspect-square rounded-lg flex items-center justify-center ${bgClass}`}
                        >
                            <span className={`text-xs font-medium ${textColor}`}>{dayNumber}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const { totalAmbil, persentaseHadir, persentaseSetor } = calculateStats();

    // Quick access menu items untuk admin
    const quickMenuItems = [
        {
            id: 'kelola-user',
            label: 'Kelola User',
            description: 'Lihat dan kelola semua user',
            icon: Users,
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-400',
            path: '/admin/kelola-user'
        },
        {
            id: 'kelola-barang',
            label: 'Kelola Barang',
            description: 'Atur stok dan data barang',
            icon: PackageIcon,
            iconBg: 'bg-green-500/20',
            iconColor: 'text-green-400',
            path: '/admin/kelola-barang'
        },
        {
            id: 'kelola-keuangan',
            label: 'Kelola Keuangan',
            description: 'Lihat dan kelola transaksi',
            icon: Wallet,
            iconBg: 'bg-purple-500/20',
            iconColor: 'text-purple-400',
            path: '/admin/kelola-keuangan'
        },
        {
            id: 'status-user',
            label: 'Status User',
            description: 'Lihat status penyetoran hari ini',
            icon: Settings,
            iconBg: 'bg-orange-500/20',
            iconColor: 'text-orange-400',
            path: '/admin/status-user'
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#121212]">
            <Header />
            
            <main className="flex flex-col mt-[3.5rem] gap-4 p-4 mb-[5rem]">
                {/* Profile Card */}
                <div className="bg-gradient-to-br from-[#1e1e1e] to-[#252525] rounded-2xl p-6 border border-[#333]">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B09331] to-[#D4AF37] flex items-center justify-center relative">
                            <User className="w-8 h-8 text-white" />
                            {/* Admin badge */}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1e1e1e] flex items-center justify-center border-2 border-[#B09331]">
                                <Shield className="w-3 h-3 text-[#B09331]" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-white text-lg font-bold">
                                    {currentUser?.nama_lengkap || 'Admin'}
                                </h2>
                                <span className="text-xs bg-[#B09331]/20 text-[#B09331] px-2 py-0.5 rounded-full font-medium">
                                    Admin
                                </span>
                            </div>
                            <p className="text-[#888] text-sm">@{currentUser?.username}</p>
                            <span className="flex items-center gap-2 text-sm text-[#888]">
                                <PhoneIcon className="w-4 h-4 text-[#B09331]"/>
                                {currentUser?.nomor_telepon || '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Summary - Same as User Profile */}
                <div className="bg-[#1e1e1e] rounded-xl border border-[#333] p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#B09331]" />
                            Statistik Saya
                        </h3>
                        <div className="flex items-center gap-1 bg-[#252525] rounded-lg p-1">
                            <button 
                                onClick={prevMonth}
                                className="p-1 hover:bg-[#333] rounded text-[#888] hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-white text-xs font-medium w-24 text-center">
                                {getMonthName(currentDate)}
                            </span>
                            <button 
                                onClick={nextMonth}
                                className="p-1 hover:bg-[#333] rounded text-[#888] hover:text-white transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {loadingStats ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[#B09331]" />
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="bg-[#252525] p-3 rounded-xl text-center">
                                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-[#B09331]/20 flex items-center justify-center">
                                        <PackageIcon className="w-4 h-4 text-[#B09331]" />
                                    </div>
                                    <p className="text-white text-lg font-bold">{totalAmbil}</p>
                                    <p className="text-[#888] text-xs">Barang</p>
                                </div>
                                <div className="bg-[#252525] p-3 rounded-xl text-center">
                                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <Activity className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <p className="text-white text-lg font-bold">{persentaseHadir}%</p>
                                    <p className="text-[#888] text-xs">Keaktifan</p>
                                </div>
                                <div className="bg-[#252525] p-3 rounded-xl text-center">
                                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                    </div>
                                    <p className={`text-lg font-bold ${persentaseSetor >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {persentaseSetor}%
                                    </p>
                                    <p className="text-[#888] text-xs">Ketertiban</p>
                                </div>
                            </div>

                            {/* Mini Calendar */}
                            <div className="bg-[#252525] rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="w-4 h-4 text-[#B09331]" />
                                    <span className="text-white text-sm font-medium">Kalender Aktivitas</span>
                                </div>
                                {renderMiniCalendar()}
                                
                                {/* Legend */}
                                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-[#333]">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                        <span className="text-[#888] text-[10px]">Setor</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                        <span className="text-[#888] text-[10px]">Pending</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                        <span className="text-[#888] text-[10px]">Tidak Ambil</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-gray-500"></div>
                                        <span className="text-[#888] text-[10px]">Libur</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] border border-[#333]"></div>
                                        <span className="text-[#888] text-[10px]">Tidak Ada Danus</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Admin Info Card */}
                <div className="bg-[#1e1e1e] rounded-xl border border-[#333] p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#B09331]/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#B09331]" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Akses Administrator</h3>
                            <p className="text-[#888] text-xs">Anda memiliki akses penuh ke sistem</p>
                        </div>
                    </div>
                    <div className="bg-[#252525] rounded-lg p-3">
                        <p className="text-[#666] text-xs">
                            Sebagai administrator, Anda dapat mengelola user, barang, stok, dan keuangan dalam sistem DanusKu.
                        </p>
                    </div>
                </div>

                {/* Quick Access Menu */}
                <div className="bg-[#1e1e1e] rounded-xl border border-[#333] p-4">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-[#B09331]" />
                        Akses Cepat
                    </h3>
                    <div className="space-y-2">
                        {quickMenuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className="w-full flex items-center gap-3 p-3 bg-[#252525] hover:bg-[#2a2a2a] rounded-xl transition-colors"
                            >
                                <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                                    <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-white font-medium text-sm">{item.label}</p>
                                    <p className="text-[#666] text-xs">{item.description}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[#666]" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Logout Button */}
                <div className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 hover:bg-[#252525] transition-colors"
                    >
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <LogOut className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-red-400 font-medium">Keluar</p>
                            <p className="text-[#666] text-xs">Logout dari akun admin</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#666]" />
                    </button>
                </div>

                {/* App Version */}
                <div className="text-center mt-4">
                    <p className="text-[#444] text-xs">DanusKu v1.0.0</p>
                    <p className="text-[#333] text-[10px] mt-1">Admin Panel</p>
                </div>
            </main>

            <Navbar />
        </div>
    );
};

export default AdminProfilPage;
