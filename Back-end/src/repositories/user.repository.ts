import { prisma } from '../utils/transaction';
import { TransactionClient } from '../utils/transaction';

export class UserRepository {
    /**
     * Get all users
     */
    async findAll() {
        return prisma.user.findMany({
            select: {
                id: true,
                nama_lengkap: true,
                username: true,
                nomor_telepon: true,
                role: true,
                catatan: true,
            },
        });
    }

    /**
     * Get user by ID
     */
    async findById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                nama_lengkap: true,
                username: true,
                nomor_telepon: true,
                role: true,
                catatan: true,
            },
        });
    }

    /**
     * Get user by ID with relations (for detailed view)
     */
    async findByIdWithRelations(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                nama_lengkap: true,
                username: true,
                nomor_telepon: true,
                role: true,
                catatan: true,
                ambilBarang: {
                    select: {
                        id: true,
                        status: true,
                        tanggalAmbil: true,
                    },
                    orderBy: { tanggalAmbil: 'desc' },
                    take: 10,
                },
            },
        });
    }

    /**
     * Get user transaction within date range
     */
    async findUserTransactionsInRange(userId: number, startDate: Date, endDate: Date) {
        return prisma.ambilBarang.findMany({
            where: {
                userId,
                tanggalAmbil: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            include: {
                detailSetor: true,
            },
            orderBy: { tanggalAmbil: 'asc' },
        });
    }

    /**
     * Get all users with today's ambil barang status
     */
    async findAllWithTodayStatus() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return prisma.user.findMany({
            // Removed role filter to include admins
            select: {
                id: true,
                nama_lengkap: true,
                username: true,
                nomor_telepon: true,
                role: true,
                catatan: true,
                ambilBarang: {
                    where: {
                        tanggalAmbil: {
                            gte: today,
                            lt: tomorrow,
                        },
                    },
                    select: {
                        id: true,
                        status: true,
                        tanggalAmbil: true,
                        detailSetor: {
                            select: {
                                qty: true,
                                totalHarga: true,
                                tanggalSetor: true,
                                stokHarian: {
                                    select: {
                                        id: true,
                                        barang: {
                                            select: {
                                                id: true,
                                                nama: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { tanggalAmbil: 'desc' },
                },
            },
            orderBy: { nama_lengkap: 'asc' },
        });
    }
}

export const userRepository = new UserRepository();
