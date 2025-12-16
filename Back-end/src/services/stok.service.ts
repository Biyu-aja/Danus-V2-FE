import { stokRepository } from '../repositories/stok.repository';
import { barangRepository } from '../repositories/barang.repository';
import { NotFoundError, ValidationError } from '../utils/error';
import { CreateStokHarianRequest } from '../types';

export class StokService {
    /**
     * Buat stok harian baru
     */
    async createStokHarian(data: CreateStokHarianRequest) {
        // Validasi barang exists
        const barang = await barangRepository.findById(data.barangId);
        if (!barang) {
            throw new NotFoundError(`Barang dengan ID ${data.barangId} tidak ditemukan`);
        }

        // Validasi harga dan stok
        if (data.harga <= 0) {
            throw new ValidationError('Harga harus lebih dari 0');
        }
        if (data.stok <= 0) {
            throw new ValidationError('Stok harus lebih dari 0');
        }
        if (data.modal < 0) {
            throw new ValidationError('Modal tidak boleh negatif');
        }

        const tanggalEdar = new Date(data.tanggalEdar);
        if (isNaN(tanggalEdar.getTime())) {
            throw new ValidationError('Format tanggal tidak valid');
        }

        return stokRepository.create({
            barangId: data.barangId,
            harga: data.harga,
            stok: data.stok,
            modal: data.modal,
            keterangan: data.keterangan,
            tanggalEdar,
        });
    }

    /**
     * Get stok hari ini
     */
    async getStokHariIni() {
        return stokRepository.findToday();
    }

    /**
     * Get histori stok
     */
    async getHistoriStok(page: number = 1, limit: number = 20) {
        return stokRepository.findHistori(page, limit);
    }

    /**
     * Get stok by ID
     */
    async getStokById(id: number) {
        const stok = await stokRepository.findById(id);

        if (!stok) {
            throw new NotFoundError(`Stok dengan ID ${id} tidak ditemukan`);
        }

        return stok;
    }
}

export const stokService = new StokService();
