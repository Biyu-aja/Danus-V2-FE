import { Router } from 'express';
import { getAllBarang, getBarangById } from '../controllers/barang.controller';

const router = Router();

/**
 * @route GET /api/barang
 * @desc Get all barang
 */
router.get('/', getAllBarang);

/**
 * @route GET /api/barang/:id
 * @desc Get barang by ID
 */
router.get('/:id', getBarangById);

export default router;
