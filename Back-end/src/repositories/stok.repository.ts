import { prisma } from '../utils/transaction';
import { TransactionClient } from '../utils/transaction';

export class StokRepository {
    /**
     * Create stok harian baru
     */
    async create(data: {
        barangId: number;
        harga: number;
        stok: number;
        modal: number;
        keterangan?: string;
        tanggalEdar: Date;
    }) {
        return prisma.stokHarian.create({
            data,
            include: {
                barang: true,
            },
        });
    }

    /**
     * Get stok hari ini
     */
    async findToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return prisma.stokHarian.findMany({
            where: {
                tanggalEdar: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: {
                barang: true,
            },
            orderBy: { tanggalEdar: 'desc' },
        });
    }

    /**
     * Get stok hari ini dengan detail setor untuk perhitungan jumlah_ambil & jumlah_setor
     */
    async findTodayWithDetails() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return prisma.stokHarian.findMany({
            where: {
                tanggalEdar: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: {
                barang: true,
                detailSetor: {
                    select: {
                        qty: true,
                        tanggalSetor: true,
                        ambilBarang: {
                            select: {
                                userId: true
                            }
                        }
                    },
                },
            },
            orderBy: { tanggalEdar: 'desc' },
        });
    }

    /**
     * Get histori stok dengan pagination
     */
    async findHistori(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.stokHarian.findMany({
                skip,
                take: limit,
                include: {
                    barang: true,
                },
                orderBy: { tanggalEdar: 'desc' },
            }),
            prisma.stokHarian.count(),
        ]);

        return { data, total };
    }

    /**
     * Get stok by ID
     */
    async findById(id: number) {
        return prisma.stokHarian.findUnique({
            where: { id },
            include: {
                barang: true,
            },
        });
    }

    /**
     * Update stok (kurangi qty) - dalam transaction
     */
    async decrementStok(tx: TransactionClient, id: number, qty: number) {
        return tx.stokHarian.update({
            where: { id },
            data: {
                stok: {
                    decrement: qty,
                },
            },
        });
    }
}

export const stokRepository = new StokRepository();
