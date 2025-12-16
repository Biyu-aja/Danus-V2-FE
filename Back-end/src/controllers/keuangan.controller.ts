import { Request, Response } from 'express';
import { keuanganService } from '../services/keuangan.service';
import { successResponse, paginatedResponse } from '../utils/response';
import { asyncHandler, ValidationError } from '../utils/error';
import { CreatePengeluaranRequest, PaginationQuery, LaporanHarianQuery, LaporanBulananQuery } from '../types';

/**
 * GET /api/keuangan/saldo
 * Get saldo terkini
 */
export const getSaldo = asyncHandler(async (req: Request, res: Response) => {
    const saldo = await keuanganService.getSaldo();
    return successResponse(res, saldo, 'Berhasil mendapatkan saldo');
});

/**
 * GET /api/keuangan/histori
 * Get histori transaksi
 */
export const getHistoriTransaksi = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as PaginationQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);

    const result = await keuanganService.getHistoriTransaksi(page, limit);
    return paginatedResponse(res, result.data, { page, limit, total: result.total }, 'Berhasil mendapatkan histori transaksi');
});

/**
 * POST /api/keuangan/pengeluaran
 * Catat pengeluaran manual
 */
export const createPengeluaran = asyncHandler(async (req: Request, res: Response) => {
    const data: CreatePengeluaranRequest = req.body;

    // Basic validation
    if (!data.title || data.nominal === undefined) {
        throw new ValidationError('title dan nominal wajib diisi');
    }

    const result = await keuanganService.createPengeluaran(data);
    return successResponse(res, result, 'Berhasil mencatat pengeluaran', 201);
});

/**
 * GET /api/keuangan/laporan/harian
 * Get laporan harian
 */
export const getLaporanHarian = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as LaporanHarianQuery;
    const laporan = await keuanganService.getLaporanHarian(query.tanggal);
    return successResponse(res, laporan, 'Berhasil mendapatkan laporan harian');
});

/**
 * GET /api/keuangan/laporan/bulanan
 * Get laporan bulanan
 */
export const getLaporanBulanan = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as LaporanBulananQuery;
    const laporan = await keuanganService.getLaporanBulanan(query.bulan);
    return successResponse(res, laporan, 'Berhasil mendapatkan laporan bulanan');
});
