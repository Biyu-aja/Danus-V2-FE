import { prisma } from '../utils/transaction';
import { CreateBarangRequest } from '../types';

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

    /**
     * Create barang baru
     */
    async create(data: CreateBarangRequest) {
        return prisma.barang.create({
            data: {
                nama: data.nama,
                keterangan: data.keterangan,
                gambar: data.gambar,
            },
        });
    }

    /**
     * Find barang by nama
     */
    async findByNama(nama: string) {
        return prisma.barang.findFirst({
            where: { nama },
        });
    }

    /**
     * Update barang
     */
    async update(id: number, data: Partial<CreateBarangRequest>) {
        return prisma.barang.update({
            where: { id },
            data: {
                nama: data.nama,
                keterangan: data.keterangan,
                gambar: data.gambar,
            },
        });
    }

    /**
     * Delete barang
     */
    async delete(id: number) {
        return prisma.barang.delete({
            where: { id },
        });
    }
}

export const barangRepository = new BarangRepository();


