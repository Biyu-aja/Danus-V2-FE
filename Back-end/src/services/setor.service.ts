import { setorRepository } from '../repositories/setor.repository';
import { stokRepository } from '../repositories/stok.repository';
import { keuanganRepository } from '../repositories/keuangan.repository';
import { ambilBarangRepository } from '../repositories/ambilBarang.repository';
import { withTransaction } from '../utils/transaction';
import { NotFoundError, ValidationError, ConflictError } from '../utils/error';
import { ProsesSetorRequest } from '../types';

export class SetorService {
    /**
     * Proses setor barang
     * CRITICAL: Harus atomic dalam satu transaction
     * 
     * Langkah:
     * 1. Validasi qty & stok
     * 2. Tandai detail setor sebagai disetor
     * 3. Catat pemasukan ke histori keuangan
     * 4. Update saldo kas
     * 5. Kurangi stok harian
     * 6. Jika semua detail sudah disetor → update status ambil barang
     */
    async prosesSetor(data: ProsesSetorRequest) {
        // Validasi input
        if (!data.detailSetorIds || data.detailSetorIds.length === 0) {
            throw new ValidationError('Detail setor IDs tidak boleh kosong');
        }

        // Get detail setor yang akan diproses
        const detailSetorList = await setorRepository.findDetailSetorByIds(data.detailSetorIds);

        // Validasi semua ID ditemukan
        if (detailSetorList.length !== data.detailSetorIds.length) {
            const foundIds = detailSetorList.map((d) => d.id);
            const notFoundIds = data.detailSetorIds.filter((id) => !foundIds.includes(id));
            throw new NotFoundError(`Detail setor dengan ID ${notFoundIds.join(', ')} tidak ditemukan`);
        }

        // Validasi belum pernah setor
        const alreadySetor = detailSetorList.filter((d) => d.tanggalSetor !== null);
        if (alreadySetor.length > 0) {
            throw new ConflictError(
                `Detail setor dengan ID ${alreadySetor.map((d) => d.id).join(', ')} sudah disetor sebelumnya`
            );
        }

        // Ensure saldo record exists
        await keuanganRepository.initializeSaldo();

        // Proses dalam transaction
        return withTransaction(async (tx) => {
            const results: {
                detailSetorId: number;
                barangNama: string;
                qty: number;
                totalHarga: number;
            }[] = [];

            let totalPemasukan = 0;

            for (const detail of detailSetorList) {
                // 1. Tandai sebagai disetor
                await setorRepository.markAsSetor(tx, detail.id);

                // 2. Kurangi stok harian
                await stokRepository.decrementStok(tx, detail.stokHarianId, detail.qty);

                // 3. Catat ke histori keuangan
                await keuanganRepository.createDetailKeuangan(tx, {
                    detailSetorId: detail.id,
                    title: `Setor: ${detail.stokHarian.barang.nama}`,
                    tipe: 'PEMASUKAN',
                    nominal: detail.totalHarga,
                    keterangan: `Qty: ${detail.qty} x Rp${detail.stokHarian.harga}`,
                });

                totalPemasukan += detail.totalHarga;

                results.push({
                    detailSetorId: detail.id,
                    barangNama: detail.stokHarian.barang.nama,
                    qty: detail.qty,
                    totalHarga: detail.totalHarga,
                });

                // 4. Check dan update status ambil barang
                const allSetor = await setorRepository.isAllDetailSetor(tx, detail.ambilBarangId);
                const hasAnySetor = await setorRepository.hasAnySetor(tx, detail.ambilBarangId);

                let newStatus: string;
                if (allSetor) {
                    newStatus = 'SUDAH_SETOR';
                } else if (hasAnySetor) {
                    newStatus = 'SEBAGIAN_SETOR';
                } else {
                    newStatus = 'BELUM_SETOR';
                }

                await ambilBarangRepository.updateStatus(tx, detail.ambilBarangId, newStatus);
            }

            // 5. Update saldo (increment dengan total pemasukan)
            const updatedSaldo = await keuanganRepository.updateSaldo(tx, totalPemasukan);

            return {
                message: 'Setor berhasil diproses',
                totalPemasukan,
                saldoTerbaru: updatedSaldo.totalSaldo,
                details: results,
            };
        });
    }
}

export const setorService = new SetorService();
