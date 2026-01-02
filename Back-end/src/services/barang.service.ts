import { barangRepository } from '../repositories/barang.repository';
import { NotFoundError, ValidationError } from '../utils/error';
import { CreateBarangRequest } from '../types';

export class BarangService {
    /**
     * Get all barang
     */
    async getAllBarang() {
        return barangRepository.findAll();
    }

    /**
     * Get barang by ID
     */
    async getBarangById(id: number) {
        const barang = await barangRepository.findById(id);

        if (!barang) {
            throw new NotFoundError(`Barang dengan ID ${id} tidak ditemukan`);
        }

        return barang;
    }

    /**
     * Create barang baru
     */
    async createBarang(data: CreateBarangRequest) {
        // Validasi nama tidak boleh kosong
        if (!data.nama || data.nama.trim() === '') {
            throw new ValidationError('Nama barang tidak boleh kosong');
        }

        // Cek apakah nama sudah ada
        const existingBarang = await barangRepository.findByNama(data.nama.trim());
        if (existingBarang) {
            throw new ValidationError(`Barang dengan nama "${data.nama}" sudah ada`);
        }

        return barangRepository.create({
            nama: data.nama.trim(),
            keterangan: data.keterangan?.trim(),
            gambar: data.gambar,
        });
    }

    /**
     * Update barang
     */
    async updateBarang(id: number, data: Partial<CreateBarangRequest>) {
        // Cek barang exists
        const barang = await barangRepository.findById(id);
        if (!barang) {
            throw new NotFoundError(`Barang dengan ID ${id} tidak ditemukan`);
        }

        // Validasi nama jika diupdate
        if (data.nama !== undefined) {
            if (!data.nama || data.nama.trim() === '') {
                throw new ValidationError('Nama barang tidak boleh kosong');
            }

            // Cek duplikasi nama (kecuali untuk barang ini sendiri)
            const existingBarang = await barangRepository.findByNama(data.nama.trim());
            if (existingBarang && existingBarang.id !== id) {
                throw new ValidationError(`Barang dengan nama "${data.nama}" sudah ada`);
            }
        }

        return barangRepository.update(id, {
            nama: data.nama?.trim(),
            keterangan: data.keterangan?.trim(),
            gambar: data.gambar,
        });
    }

    /**
     * Delete barang
     */
    async deleteBarang(id: number) {
        // Cek barang exists
        const barang = await barangRepository.findById(id);
        if (!barang) {
            throw new NotFoundError(`Barang dengan ID ${id} tidak ditemukan`);
        }

        // Cek apakah masih ada stok terkait
        if (barang.stokHarian && barang.stokHarian.length > 0) {
            throw new ValidationError('Tidak dapat menghapus barang yang masih memiliki stok');
        }

        return barangRepository.delete(id);
    }
}

export const barangService = new BarangService();
