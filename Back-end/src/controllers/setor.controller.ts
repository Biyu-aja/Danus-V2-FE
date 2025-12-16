import { Request, Response } from 'express';
import { setorService } from '../services/setor.service';
import { successResponse } from '../utils/response';
import { asyncHandler, ValidationError } from '../utils/error';
import { ProsesSetorRequest } from '../types';

/**
 * POST /api/setor
 * Proses setor barang
 * 
 * CRITICAL ENDPOINT - Atomic transaction
 */
export const prosesSetor = asyncHandler(async (req: Request, res: Response) => {
    const data: ProsesSetorRequest = req.body;

    // Basic validation
    if (!data.detailSetorIds || !Array.isArray(data.detailSetorIds) || data.detailSetorIds.length === 0) {
        throw new ValidationError('detailSetorIds wajib diisi dan tidak boleh kosong');
    }

    const result = await setorService.prosesSetor(data);
    return successResponse(res, result, 'Berhasil memproses setor');
});
