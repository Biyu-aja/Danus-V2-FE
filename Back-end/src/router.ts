import { Router } from 'express';
import userRouter from './core/user/user.router';

const r = Router();

r.use('/user', userRouter)

const router = r;
export default router;
