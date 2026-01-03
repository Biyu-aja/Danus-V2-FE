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
    const { page, limit, startDate, endDate, barangId } = req.query;

    const result = await stokService.getHistoriStok({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        barangId: barangId ? parseInt(barangId as string, 10) : undefined,
    });

    return paginatedResponse(res, result.data, {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
        total: result.total
    }, 'Berhasil mendapatkan histori stok');
});
