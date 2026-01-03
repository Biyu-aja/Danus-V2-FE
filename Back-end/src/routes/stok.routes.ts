import { Router } from 'express';
import {
    createStokHarian,
    getStokHariIni,
    getHistoriStok,
    updateStokHarian,
    deleteStokHarian
} from '../controllers/stok.controller';

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

/**
 * @route PUT /api/stok/:id
 * @desc Update stok harian
 */
router.put('/:id', updateStokHarian);

/**
 * @route DELETE /api/stok/:id
 * @desc Delete stok harian
 */
router.delete('/:id', deleteStokHarian);

export default router;
