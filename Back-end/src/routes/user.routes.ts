import { Router } from 'express';
import { getAllUsers, getUserById } from '../controllers/user.controller';

const router = Router();

/**
 * @route GET /api/users
 * @desc Get all users
 */
router.get('/', getAllUsers);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 */
router.get('/:id', getUserById);

export default router;
