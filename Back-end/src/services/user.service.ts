import { userRepository } from '../repositories/user.repository';
import { NotFoundError } from '../utils/error';

export class UserService {
    /**
     * Get all users
     */
    async getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get user by ID
     */
    async getUserById(id: number) {
        const user = await userRepository.findByIdWithRelations(id);

        if (!user) {
            throw new NotFoundError(`User dengan ID ${id} tidak ditemukan`);
        }

        return user;
    }

    /**
     * Get all users with today's status
     * Status: SUDAH_SETOR, BELUM_SETOR, BELUM_AMBIL
     */
    async getUsersWithTodayStatus() {
        const users = await userRepository.findAllWithTodayStatus();

        // Process each user to calculate their status
        return users.map(user => {
            let status: 'SUDAH_SETOR' | 'BELUM_SETOR' | 'BELUM_AMBIL' = 'BELUM_AMBIL';
            let totalAmbil = 0;
            let totalSetor = 0;
            let totalHarusSetor = 0;

            // Track barang taken by this user
            const barangMap = new Map<number, { barangId: number; nama: string; qty: number; totalHarga: number }>();

            if (user.ambilBarang && user.ambilBarang.length > 0) {
                // User has taken items today
                for (const ambil of user.ambilBarang) {
                    if (ambil.detailSetor) {
                        for (const detail of ambil.detailSetor) {
                            totalAmbil += detail.qty;
                            totalHarusSetor += detail.totalHarga;
                            if (detail.tanggalSetor) {
                                totalSetor += detail.qty;
                            }

                            // Track barang
                            const barangId = detail.stokHarian?.barang?.id;
                            const barangNama = detail.stokHarian?.barang?.nama;
                            if (barangId && barangNama) {
                                const existing = barangMap.get(barangId);
                                if (existing) {
                                    existing.qty += detail.qty;
                                    existing.totalHarga += detail.totalHarga;
                                } else {
                                    barangMap.set(barangId, {
                                        barangId,
                                        nama: barangNama,
                                        qty: detail.qty,
                                        totalHarga: detail.totalHarga,
                                    });
                                }
                            }
                        }
                    }
                }

                // Determine status based on setor
                if (totalSetor > 0 && totalSetor >= totalAmbil) {
                    status = 'SUDAH_SETOR';
                } else if (totalAmbil > 0) {
                    status = 'BELUM_SETOR';
                }
            }

            return {
                id: user.id,
                nama_lengkap: user.nama_lengkap,
                username: user.username,
                nomor_telepon: user.nomor_telepon,
                catatan: user.catatan,
                status,
                totalAmbil,
                totalSetor,
                totalHarusSetor,
                ambilBarangCount: user.ambilBarang?.length || 0,
                barangList: Array.from(barangMap.values()),
            };
        });
    }
}

export const userService = new UserService();
