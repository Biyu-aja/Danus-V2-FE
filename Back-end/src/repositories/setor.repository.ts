import { prisma } from '../utils/transaction';
import { TransactionClient } from '../utils/transaction';

export class SetorRepository {
    /**
     * Get detail setor by IDs
     */
    async findDetailSetorByIds(ids: number[]) {
        return prisma.detailSetor.findMany({
            where: {
                id: { in: ids },
            },
            include: {
                ambilBarang: true,
                stokHarian: {
                    include: {
                        barang: true,
                    },
                },
            },
        });
    }

    /**
     * Update detail setor tanggal (tandai sudah setor)
     */
    async markAsSetor(tx: TransactionClient, id: number) {
        return tx.detailSetor.update({
            where: { id },
            data: {
                tanggalSetor: new Date(),
            },
        });
    }

    /**
     * Get semua detail setor dari satu ambil barang
     */
    async findDetailSetorByAmbilBarangId(ambilBarangId: number) {
        return prisma.detailSetor.findMany({
            where: { ambilBarangId },
        });
    }

    /**
     * Check apakah semua detail sudah setor
     */
    async isAllDetailSetor(tx: TransactionClient, ambilBarangId: number) {
        const details = await tx.detailSetor.findMany({
            where: { ambilBarangId },
        });

        return details.every((d) => d.tanggalSetor !== null);
    }

    /**
     * Check apakah ada detail yang sudah setor
     */
    async hasAnySetor(tx: TransactionClient, ambilBarangId: number) {
        const count = await tx.detailSetor.count({
            where: {
                ambilBarangId,
                tanggalSetor: { not: null },
            },
        });
        return count > 0;
    }
}

export const setorRepository = new SetorRepository();
