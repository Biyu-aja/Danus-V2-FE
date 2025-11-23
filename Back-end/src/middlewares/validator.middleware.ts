// src/middlewares/validator.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import type Joi from 'joi';
import { exception } from './exception.middleware.js';

export type ValidatorSchemas<B = any, Q = any> = {
  body?: Joi.ObjectSchema<B> | Joi.Schema;
  query?: Joi.ObjectSchema<Q> | Joi.Schema;
};

export default function validatorMiddleware<B = any, Q = any>({
  body,
  query,
}: ValidatorSchemas<B, Q>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const options: Joi.AsyncValidationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    try {
      const bodyValue = body
        ? (await body.validateAsync((req.body ?? {}) as unknown, options)) as B
        : (req.body as B);

      const queryValue = query
        ? (await query.validateAsync((req.query ?? {}) as unknown, options)) as Q
        : (req.query as Q);

      // simpan hasil validasi pada request
      (req as any).vbody = bodyValue;
      (req as any).vquery = queryValue;

      next();
    } catch (err) {
      return exception(err, req, res);
    }
  };
}
