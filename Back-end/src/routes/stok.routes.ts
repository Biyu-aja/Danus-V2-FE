import { Router } from 'express';
import { createStokHarian, getStokHariIni, getHistoriStok } from '../controllers/stok.controller';

const router = Router();

/**
 * @route POST /api/stok
 * @desc Create stok harian baru
 */
router.post('/', createStokHarian);

/**
 * @route GET /api/stok/hari-ini
 * @desc Get stok hari ini
 */
router.get('/hari-ini', getStokHariIni);

/**
 * @route GET /api/stok/histori
 * @desc Get histori stok
 */
router.get('/histori', getHistoriStok);

export default router;
