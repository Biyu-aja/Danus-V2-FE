import { Request, Response } from 'express';
import { barangService } from '../services/barang.service';
import { successResponse } from '../utils/response';
import { asyncHandler } from '../utils/error';

/**
 * GET /api/barang
 * Get all barang
 */
export const getAllBarang = asyncHandler(async (req: Request, res: Response) => {
    const barang = await barangService.getAllBarang();
    return successResponse(res, barang, 'Berhasil mendapatkan data barang');
});

/**
 * GET /api/barang/:id
 * Get barang by ID
 */
export const getBarangById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const barang = await barangService.getBarangById(id);
    return successResponse(res, barang, 'Berhasil mendapatkan data barang');
});
