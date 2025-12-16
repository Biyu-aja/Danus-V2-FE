import { prisma } from '../utils/transaction';

export class BarangRepository {
    /**
     * Get all barang
     */
    async findAll() {
        return prisma.barang.findMany({
            include: {
                stokHarian: {
                    orderBy: { tanggalEdar: 'desc' },
                    take: 1,
                },
            },
        });
    }

    /**
     * Get barang by ID
     */
    async findById(id: number) {
        return prisma.barang.findUnique({
            where: { id },
            include: {
                stokHarian: {
                    orderBy: { tanggalEdar: 'desc' },
                    take: 5,
                },
            },
        });
    }
}

export const barangRepository = new BarangRepository();
