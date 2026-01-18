import React, { useState, useEffect } from 'react';
import { X, Loader2, Check, AlertCircle, Phone, FileText, User } from 'lucide-react';
import { userService, type User as UserType } from '../../../services/user.service';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedUser: UserType) => void;
    user: UserType;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    user
}) => {
    const [nomorTelepon, setNomorTelepon] = useState('');
    const [catatan, setCatatan] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen && user) {
            setNomorTelepon(user.nomor_telepon || '');
            setCatatan(user.catatan || '');
            setError(null);
            setSuccess(false);
        }
    }, [isOpen, user]);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.updateUser(user.id, {
                nomor_telepon: nomorTelepon,
                catatan: catatan || undefined,
            });

            if (response.success && response.data) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess(response.data!);
                    onClose();
                }, 1000);
            } else {
                setError(response.message || 'Gagal mengupdate user');
            }
        } catch (err) {
            setError('Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center mb-[3rem]">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-lg bg-[#1e1e1e] rounded-t-3xl p-5 animate-slide-up max-h-[85vh] overflow-y-auto">
                {/* Handle bar */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-[#444] rounded-full" />

                {/* Close button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#333] text-[#888] hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mt-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[#B09331]/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-[#B09331]" />
                    </div>
                    <div>
                        <h2 className="text-white text-lg font-bold">Edit User</h2>
                        <p className="text-[#888] text-sm">{user.nama_lengkap}</p>
                    </div>
                </div>

                {/* Success State */}
                {success ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                            <Check className="w-8 h-8 text-green-400" />
                        </div>
                        <p className="text-white font-medium">Berhasil mengupdate user!</p>
                    </div>
                ) : (
                    <>
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <div className="space-y-4">
                            {/* Nomor Telepon */}
                            <div>
                                <label className="flex items-center gap-2 text-[#888] text-sm mb-2">
                                    <Phone className="w-4 h-4" />
                                    Nomor Telepon
                                </label>
                                <input
                                    type="tel"
                                    value={nomorTelepon}
                                    onChange={(e) => setNomorTelepon(e.target.value)}
                                    placeholder="Contoh: 08123456789"
                                    className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:border-[#B09331] focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Catatan */}
                            <div>
                                <label className="flex items-center gap-2 text-[#888] text-sm mb-2">
                                    <FileText className="w-4 h-4" />
                                    Catatan (hanya dilihat admin)
                                </label>
                                <textarea
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    placeholder="Tambahkan catatan untuk user ini..."
                                    rows={4}
                                    className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:border-[#B09331] focus:outline-none transition-colors resize-none"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full mt-6 bg-[#B09331] text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:bg-[#9A7F2A] transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default EditUserModal;
