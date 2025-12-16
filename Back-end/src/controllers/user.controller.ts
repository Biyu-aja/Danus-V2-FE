import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { successResponse } from '../utils/response';
import { asyncHandler } from '../utils/error';

/**
 * GET /api/users
 * Get all users
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    return successResponse(res, users, 'Berhasil mendapatkan data users');
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const user = await userService.getUserById(id);
    return successResponse(res, user, 'Berhasil mendapatkan data user');
});
