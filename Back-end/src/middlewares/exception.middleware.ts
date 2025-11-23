import httpStatus from 'http-status';
import type { Request, Response } from 'express';
import { env } from 'process';
import { logger } from '../lib/logger/index.js';

// ---------------- Types ----------------
export interface HttpErrorShape extends Error {
  http_code: number;
}

type PrismaKnownRequestErrorLike = {
  name: 'PrismaClientKnownRequestError';
  code: string;
  meta?: Record<string, any>;
  message: string;
};

type PrismaValidationErrorLike = {
  name: 'PrismaClientValidationError';
  message: string;
};


type JoiValidationErrorLike = {
  name: 'ValidationError';
  details?: Array<{ message: string }>;
};

// ---------------- Classes ----------------
class HttpError extends Error implements HttpErrorShape {
  http_code: number;

  constructor(message = 'Terjadi kesalahan') {
    super(message);
    this.name = this.constructor.name;
    this.http_code = httpStatus.INTERNAL_SERVER_ERROR;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class NotFound extends HttpError {
  constructor(message = 'Data tidak ditemukan') {
    super(message);
    this.http_code = httpStatus.NOT_FOUND;
  }
}

class Unauthenticated extends HttpError {
  constructor(message = 'Autentikasi diperlukan') {
    super(message);
    this.http_code = httpStatus.UNAUTHORIZED;
  }
}

class BadRequest extends HttpError {
  constructor(message = 'Data tidak valid') {
    super(message);
    this.http_code = httpStatus.BAD_REQUEST;
  }
}

class Forbidden extends HttpError {
  constructor(message = 'Akses ditolak') {
    super(message);
    this.http_code = httpStatus.FORBIDDEN;
  }
}

class ServerError extends HttpError {
  constructor(message = 'Terjadi kesalahan') {
    super(message);
    this.http_code = httpStatus.INTERNAL_SERVER_ERROR;
  }
}

// ---------------- Handler ----------------
const exception = (err: unknown, req: Request, res: Response) => {
  // default values
  let httpCode: number = httpStatus.INTERNAL_SERVER_ERROR as number;
  let message: string = 'Terjadi kesalahan';
  let data: unknown = undefined;
  const nodeEnv = env.NODE_ENV;
  const asAny = err as any;

  const stack =
    nodeEnv === 'development'
      ? (asAny?.stack as string | undefined)?.split('\n')
      : undefined;

  if (nodeEnv === 'development') {
    // tetap log penuh saat dev
    // eslint-disable-next-line no-console
    console.error(err);
  }

  // Prisma foreign key error
  if (asAny?.code === 'P2003') {
    httpCode = httpStatus.UNPROCESSABLE_ENTITY;
    message = 'Tidak dapat mengubah data ini karena terkait dengan data lain.';
  }
  // Prisma validation error
  else if (
    (asAny as PrismaValidationErrorLike)?.name === 'PrismaClientValidationError'
  ) {
    httpCode = httpStatus.BAD_REQUEST;
    const msg = (asAny as PrismaValidationErrorLike).message as string;
    if (msg.includes('Unknown argument')) {
      const part = msg.match(/Unknown argument `[^`]+`/);
      message = part ? part[0] : 'Unknown argument on request';
    } else if (msg.includes('Unknown field')) {
      const part = msg.match(/Unknown field `[^`]+` for select statement`/);
      message = part ? part[0] : 'Unknown field name on request';
    } else {
      message = 'Permintaan tidak valid';
    }
  }
  // Prisma known request error: not found
  else if (
    (asAny as PrismaKnownRequestErrorLike)?.name ===
      'PrismaClientKnownRequestError' &&
    (asAny as PrismaKnownRequestErrorLike).code === 'P2025'
  ) {
    httpCode = httpStatus.NOT_FOUND;
    const modelName =
      (asAny as PrismaKnownRequestErrorLike).meta?.modelName ?? 'Data';
    message = `${modelName} tidak ditemukan`;
  }
  // Prisma known request error: unique violation
  else if (
    (asAny as PrismaKnownRequestErrorLike)?.name ===
      'PrismaClientKnownRequestError' &&
    (asAny as PrismaKnownRequestErrorLike).code === 'P2002'
  ) {
    httpCode = httpStatus.CONFLICT;
    const target = (asAny as PrismaKnownRequestErrorLike).meta?.target;
    message = target
      ? `Entri dengan nilai yang sama untuk ${target} sudah ada.`
      : 'Terdapat nilai yang duplikat';
  }
  // Joi validation error
  else if (
    (asAny as JoiValidationErrorLike)?.name === 'ValidationError' &&
    (asAny as JoiValidationErrorLike).details
  ) {
    httpCode = httpStatus.UNPROCESSABLE_ENTITY;
    message = 'Data tidak dapat diproses';
    data = (asAny as JoiValidationErrorLike).details!.map((det) => det.message);
  }
  // Our HttpError family
  else if (asAny instanceof HttpError) {
    httpCode =
      (asAny as HttpErrorShape).http_code ?? httpStatus.INTERNAL_SERVER_ERROR;
    message = asAny.message ?? message;
  }
  // Unknown error → log dan gunakan default
  else {
    logger.error(err);
  }

  res.status(httpCode).json({
    status: httpCode >= 200 && httpCode < 300,
    message,
    data,
    stack,
  });
};

export {
  exception,
  ServerError,
  NotFound,
  Unauthenticated,
  Forbidden,
  BadRequest,
  HttpError, // ekspor juga jika ingin turunan custom
};
