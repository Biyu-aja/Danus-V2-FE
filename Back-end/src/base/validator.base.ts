import Joi, { type CustomHelpers } from 'joi';
import prisma from '../db/prisma.js';

// ---------- Custom Joi validators ----------

const containColon = (value: string, helpers: CustomHelpers) => {
  let errMsg: string | null = null;

  // Format: "field:value+other.field:value2"
  value.split('+').some((el) => {
    if (!el.includes(':')) {
      errMsg = 'Query must contain ":" to separate field and value';
      return true;
    }
    return false;
  });

  return errMsg ? helpers.message({ custom: errMsg }) : value;
};

const orderPattern = (value: string, helpers: CustomHelpers) => {
  let errMsg: string | null = null;

  // Format: "field:asc+other.field:desc"
  value.split('+').forEach((el) => {
    if (!el.includes(':')) {
      errMsg = 'Query must contain ":" to separate field and value';
      return;
    }
    const [, val] = el.split(':');
    if (val !== 'desc' && val !== 'asc') {
      errMsg = 'Order query value must be "desc" or "asc"';
    }
  });

  return errMsg ? helpers.message(errMsg) : value;
};

export const isTimeString = (value: string, helpers: CustomHelpers) => {
  // Konsisten dengan pesan: HH:mm:ss
  const pattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  if (!pattern.test(value)) {
    return helpers.message({ custom: 'Time string must be in the format HH:mm:ss' });
  }
  return value;
};

// ---------- DB existence validator ----------

/**
 * Membuat validator async untuk memastikan value (ID) ada di tabel tertentu.
 * Pemakaian di Joi: `Joi.string().custom(existInDatabase('user'))`
 */
export const existInDatabase = (table: keyof typeof prisma & string) => {
  return async (value: unknown, helpers: CustomHelpers) => {
    if (value === undefined || value === null) return value;

    try {
      // PrismaClient model delegate diakses dinamis
      const delegate = (prisma as any)[table];
      if (!delegate?.count) {
        return helpers.message({ custom: `Tabel "${table}" tidak valid pada Prisma Client` });
      }

      const found: number = await delegate.count({ where: { id: value } });
      if (found === 0) {
        const fieldName = Array.isArray(helpers.state.path) ? helpers.state.path.join('.') : '';
        return helpers.message({
          custom: `Data ${fieldName} dengan ID ${String(value)} tidak ditemukan`
        });
      }

      return value;
    } catch (err: any) {
      return helpers.message({ custom: err?.message ?? 'Database validation error' });
    }
  };
};

// ---------- Base query validator ----------

export const baseValidator = {
  findAllQuery: Joi.object({
    search: Joi.string().optional().custom(containColon),
    starts: Joi.string().optional().custom(containColon),
    where: Joi.string().optional().custom(containColon),
    in_: Joi.string().optional().custom(containColon),
    not_: Joi.string().optional().custom(containColon),
    isnull: Joi.string().optional(),
    gte: Joi.string().optional().custom(containColon),
    lte: Joi.string().optional().custom(containColon),
    paginate: Joi.boolean().optional().default(true),
    limit: Joi.number().optional().default(10),
    page: Joi.number().optional().default(1),
    order: Joi.string().optional().custom(orderPattern),
  }),
};

// ---------- (Opsional) Tipe util untuk query yang tervalidasi ----------

export type FindAllQueryInput = {
  search?: string;
  starts?: string;
  where?: string;
  in_?: string;
  not_?: string;
  isnull?: string;
  gte?: string;
  lte?: string;
  paginate?: boolean;
  limit?: number;
  page?: number;
  order?: string;
};
