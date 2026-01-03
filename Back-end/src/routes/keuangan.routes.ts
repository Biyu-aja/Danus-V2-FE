import { Router } from 'express';
import {
    getSaldo,
    getHistoriTransaksi,
    createPengeluaran,
    createPemasukan,
    getLaporanHarian,
    getLaporanBulanan,
} from '../controllers/keuangan.controller';

const router = Router();

/**
 * @route GET /api/keuangan/saldo
 * @desc Get saldo terkini
 */
router.get('/saldo', getSaldo);

/**
 * @route GET /api/keuangan/histori
 * @desc Get histori transaksi
 */
router.get('/histori', getHistoriTransaksi);

/**
 * @route POST /api/keuangan/pengeluaran
 * @desc Catat pengeluaran manual
 */
router.post('/pengeluaran', createPengeluaran);

/**
 * @route POST /api/keuangan/pemasukan
 * @desc Catat pemasukan manual
 */
router.post('/pemasukan', createPemasukan);

/**
 * @route GET /api/keuangan/laporan/harian
 * @desc Get laporan harian
 */
router.get('/laporan/harian', getLaporanHarian);

/**
 * @route GET /api/keuangan/laporan/bulanan
 * @desc Get laporan bulanan
 */
router.get('/laporan/bulanan', getLaporanBulanan);

export default router;
