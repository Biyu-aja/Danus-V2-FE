import { Request, Response } from 'express';
import { stokService } from '../services/stok.service';
import { successResponse, paginatedResponse } from '../utils/response';
import { asyncHandler, ValidationError } from '../utils/error';
import { CreateStokHarianRequest, PaginationQuery } from '../types';

/**
 * POST /api/stok
 * Create stok harian baru
 */
export const createStokHarian = asyncHandler(async (req: Request, res: Response) => {
    const data: CreateStokHarianRequest = req.body;

    // Basic validation
    if (!data.barangId || !data.harga || !data.stok || data.modal === undefined || !data.tanggalEdar) {
        throw new ValidationError('barangId, harga, stok, modal, dan tanggalEdar wajib diisi');
    }

    const stok = await stokService.createStokHarian(data);
    return successResponse(res, stok, 'Berhasil membuat stok harian', 201);
});

/**
 * GET /api/stok/hari-ini
 * Get stok hari ini
 */
export const getStokHariIni = asyncHandler(async (req: Request, res: Response) => {
    const stok = await stokService.getStokHariIni();
    return successResponse(res, stok, 'Berhasil mendapatkan stok hari ini');
});

/**
 * GET /api/stok/histori
 * Get histori stok
 */
export const getHistoriStok = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as PaginationQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);

    const result = await stokService.getHistoriStok(page, limit);
    return paginatedResponse(res, result.data, { page, limit, total: result.total }, 'Berhasil mendapatkan histori stok');
});
