import { Router } from 'express';
import { getAllBarang, getBarangById, createBarang, updateBarang, deleteBarang } from '../controllers/barang.controller';

const router = Router();

/**
 * @route GET /api/barang
 * @desc Get all barang
 */
router.get('/', getAllBarang);

/**
 * @route POST /api/barang
 * @desc Create barang baru
 */
router.post('/', createBarang);

/**
 * @route GET /api/barang/:id
 * @desc Get barang by ID
 */
router.get('/:id', getBarangById);

/**
 * @route PUT /api/barang/:id
 * @desc Update barang
 */
router.put('/:id', updateBarang);

/**
 * @route DELETE /api/barang/:id
 * @desc Delete barang
 */
router.delete('/:id', deleteBarang);

export default router;
