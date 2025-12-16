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
}

export const userRepository = new UserRepository();
