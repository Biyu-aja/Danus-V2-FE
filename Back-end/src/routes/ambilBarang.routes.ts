import { Router } from 'express';
import {
    createAmbilBarang,
    getAmbilBarangByUserId,
    getAmbilBarangBelumSetor,
    getAmbilBarangById,
} from '../controllers/ambilBarang.controller';

const router = Router();

/**
 * @route POST /api/ambil-barang
 * @desc Create ambil barang baru
 */
router.post('/', createAmbilBarang);

/**
 * @route GET /api/ambil-barang/belum-setor
 * @desc Get ambil barang yang belum setor
 */
router.get('/belum-setor', getAmbilBarangBelumSetor);

/**
 * @route GET /api/ambil-barang/user/:userId
 * @desc Get ambil barang by user ID
 */
router.get('/user/:userId', getAmbilBarangByUserId);

/**
 * @route GET /api/ambil-barang/:id
 * @desc Get ambil barang by ID
 */
router.get('/:id', getAmbilBarangById);

export default router;
