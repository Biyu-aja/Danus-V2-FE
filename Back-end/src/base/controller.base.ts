import httpStatus from 'http-status';
import type { Request, Response, NextFunction } from 'express';
import { exception } from '../middlewares/exception.middleware.js';
// Jika ingin refer ke tipe-nya:
import type { AuthUser } from '../middlewares/auth.middleware.js';

type ControllerMethod<R = any> = (
  req: Request,         // sudah punya req.user via augmentation
  res: Response,
  ...args: any[]
) => Promise<R> | R;

type JsonPayload<T = unknown> = {
  status: boolean;
  message: string;
  data?: T | null;
};

class BaseController {
  constructor() {}

  isUser(req: Request): boolean {
    // req.user bertipe AuthUser | undefined dari augmentation
    return (req.user as AuthUser | undefined)?.roleCode === 'USR';
  }

  /**
   * Membungkus method controller agar otomatis try/catch dan lewat ke handler `exception`.
   * Contoh: router.get('/', base.wrapper(this.index));
   */
  wrapper<T = any>(method: ControllerMethod<T>) {
    return async (
      req: Request,
      res: Response,
      next?: NextFunction,
      ...args: any[]
    ) => {
      try {
        return await method.apply(this, [req, res, ...(args ?? [])]);
      } catch (err) {
        exception(err as Error, req, res);
        if (next) next(err);
        return;
      }
    };
  }

  success<T = unknown>(
    res: Response,
    data: T | null = null,
    message = ''
  ): Response<JsonPayload<T>> {
    return res.status(httpStatus.OK).json({
      status: true,
      message: message || 'Success',
      data,
    });
  }

  created<T = unknown>(
    res: Response,
    data: T | null = null,
    message = ''
  ): Response<JsonPayload<T>> {
    return res.status(httpStatus.CREATED).json({
      status: true,
      message: message || 'Data created',
      data,
    });
  }

  /**
   * Catatan: 204 idealnya tanpa body. Jika ingin strict:
   *   return res.status(httpStatus.NO_CONTENT).end();
   * Di bawah tetap kirim JSON bila client mengharapkan payload.
   */
  noContent(res: Response, message = ''): Response<JsonPayload<null>> {
    return res.status(httpStatus.NO_CONTENT).json({
      status: true,
      message: message || 'Data deleted',
      data: null,
    });
  }

  /**
   * Menggabungkan nilai query untuk pencarian join (e.g. `field=a+b`).
   */
  joinFindAllQuery<Q extends Record<string, string | undefined>>(
    query: Q,
    field: keyof Q & string,
    colval: string
  ): Q {
    const current = query[field];
    query[field] = (current ? `${current}+${colval}` : colval) as Q[typeof field];
    return query;
  }
}

export default BaseController;
