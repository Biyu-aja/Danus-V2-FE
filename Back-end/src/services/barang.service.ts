import { barangRepository } from '../repositories/barang.repository';
import { NotFoundError } from '../utils/error';

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
}

export const barangService = new BarangService();
