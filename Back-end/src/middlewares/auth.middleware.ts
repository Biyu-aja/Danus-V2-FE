// src/middlewares/auth.middleware.ts
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { exception, Forbidden, Unauthenticated } from './exception.middleware.js';
import prisma from '../db/prisma.js';

// ---- Types ----
export type RoleCode = 'SDM' | 'ADM' | 'USR' | 'KSK' | 'PSI';

export interface JwtAccessPayload extends jwt.JwtPayload {
  uid: string;        // user id
  // tambahkan field lain jika ada (e.g., exp, iat dari JwtPayload sudah ada)
}

export interface AuthUser {
  id: string;
  email: string;
  roleCode: RoleCode | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// ---- Middleware factory ----
const authMiddleware = (roleCodes: RoleCode[] | null = null) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) throw new Unauthenticated();

      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) {
        // Hindari verify dengan secret undefined
        throw new Error('JWT_ACCESS_SECRET is not set');
      }

      let data: JwtAccessPayload;
      try {
        data = jwt.verify(token, secret) as JwtAccessPayload;
      } catch {
        throw new Unauthenticated();
      }

      // TODO: ganti ke cache/redis bila diperlukan
      const user = await prisma.user.findUnique({
        where: { id: data.uid },
        select: {
          id: true,
          email: true,
          isActive: true,
          
        },
      });

      if (!user) throw new Unauthenticated();
      if (!user.isActive) throw new Unauthenticated('Account suspended');

      // const activeRole = user.roles.find((ur: any) => ur.isActive && ur.role.isActive);
      // if (!activeRole) throw new Unauthenticated('No active role');

      // if (roleCodes && !roleCodes.includes(activeRole.role.code as RoleCode)) {
      //   throw new Forbidden();
      // }

      // req.user = {
      //   id: user.id,
      //   email: user.email,
      //   roleCode: (activeRole.role.code as RoleCode) ?? null,
      // };

      next();
    } catch (error) {
      exception(error as Error, req, res);
    }
  };
};

export { authMiddleware };
