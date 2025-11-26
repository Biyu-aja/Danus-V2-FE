import moment from 'moment';

import { isBoolean, isDateAble, isInteger } from '../utils/type.js';
import type { PrismaClient } from '@prisma/client';

export type FindAllQueryEncoded = {
  where?: string;
  starts?: string;  
  search?: string;   
  in_?: string;      
  not_?: string;     
  isnull?: string;   
  gte?: string;     
  lte?: string;      
  order?: string;   
  paginate?: boolean | string; 
  limit?: number;
  page?: number;
} & Record<string, unknown>;

export type PrismaLikeArgs = {
  where: Record<string, unknown>;
  take?: number;
  skip?: number;
  orderBy?: Record<string, 'asc' | 'desc' | string>;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

class BaseService {
  protected db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  /**
   * Mengubah query encoded (string) menjadi objek args mirip Prisma.
   */
  transformFindAllQuery = (query: FindAllQueryEncoded = {}): PrismaLikeArgs => {
    // where
    const wheres: Record<string, any> = {};
    if (query?.where) {
      query.where.split('+').forEach((q) => {
        let [col, val] = q.split(':');

        if (val === '') return;

        let parsedVal: string | number | boolean = val;
        if (isInteger(val)) {
          parsedVal = parseInt(val, 10);
        } else if (isBoolean(val)) {
          parsedVal = val === 'true';
        }

        const keys = col.split('.');
        let current = wheres;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            current[key] = parsedVal;
          } else {
            current[key] = current[key] || {};
            current = current[key];
          }
        });
      });
    }

    // starts
    const starts: Record<string, any> = {};
    if (query?.starts) {
      const ors: Record<string, any>[] = [];
      query.starts.split('+').forEach((q) => {
        const [col, val] = q.split(':');
        const keys = col.split('.');
        const current: Record<string, any> = {};
        let temp = current;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            temp[key] = { startsWith: val };
          } else {
            temp[key] = {};
            temp = temp[key];
          }
        });

        ors.push(current);
      });

      if (ors.length) starts.OR = ors;
    }

    // search
    const search: Record<string, any> = {};
    if (query?.search) {
      const ors: Record<string, any>[] = [];
      query.search.split('+').forEach((q) => {
        const [col, val] = q.split(':');
        const keys = col.split('.');
        const current: Record<string, any> = {};
        let temp = current;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            temp[key] = {
              contains: val,
              // mode: 'insensitive', // aktifkan bila butuh
            };
          } else {
            temp[key] = {};
            temp = temp[key];
          }
        });

        ors.push(current);
      });

      if (ors.length) search.OR = ors;
    }

    // in
    const in_: Record<string, any> = {};
    if (query?.in_) {
      query.in_.split('+').forEach((q) => {
        const [col, rawVal] = q.split(':');
        const keys = col.split('.');
        let current = in_;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            const vals = (rawVal ?? '')
              .split(',')
              .filter(Boolean)
              .map((v) => {
                if (isInteger(v)) return parseInt(v, 10);
                if (isBoolean(v)) return v === 'true';
                return v;
              });

            // Heuristic untuk relasi many (…s). Sesuaikan dengan skema jika perlu.
            if (keys[keys.length - 2]?.endsWith('s')) {
              current.some = { [key]: { in: vals } };
            } else {
              current[key] = { in: vals };
            }
          } else {
            current[key] = current[key] || {};
            current = current[key];
          }
        });
      });
    }

    // not
    const not_: Record<string, any> = {};
    if (query?.not_) {
      const ors: Record<string, any>[] = [];
      query.not_.split('+').forEach((q) => {
        const [col, val] = q.split(':');
        const keys = col.split('.');
        const current: Record<string, any> = {};
        let temp = current;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            temp[key] = { not: val };
          } else {
            temp[key] = {};
            temp = temp[key];
          }
        });

        ors.push(current);
      });

      if (ors.length) not_.OR = ors;
    }

    // is null
    const isnull: Record<string, any> = {};
    if (query?.isnull) {
      query.isnull.split('+').forEach((col) => {
        if (col) isnull[col] = null;
      });
    }

    // gte
    const gte: Record<string, any> = {};
    if (query?.gte) {
      query.gte.split('+').forEach((q) => {
        const [col, val] = q.split(':');
        gte[col] = {
          gte: isDateAble(val) ? moment(val).toDate() : val,
        };
      });
    }

    // lte
    const lte: Record<string, any> = {};
    if (query?.lte) {
      query.lte.split('+').forEach((q) => {
        const [col, val] = q.split(':');
        lte[col] = {
          lte: isDateAble(val) ? moment(val).endOf('day').toDate() : val,
        };
      });
    }

    // order by
    const orderBy: Record<string, 'asc' | 'desc' | string> = {};
    if (query?.order) {
      query.order.split('+').forEach((q) => {
        const [col, val] = q.split(':');
        orderBy[col] = (val as 'asc' | 'desc') ?? 'asc';
      });
    }

    // pagination
    const pagination: Record<string, number> = {};
    const usePaginate =
      typeof query?.paginate === 'string'
        ? query.paginate === 'true'
        : Boolean(query?.paginate);

    const limit = typeof query?.limit === 'number' ? query.limit : undefined;
    const page =
      typeof query?.page === 'number' && query.page > 0 ? query.page : 1;

    if (usePaginate && limit && limit > 0) {
      pagination.take = limit;
      pagination.skip = (page - 1) * limit;
    }

    return {
      where: {
        AND: [wheres, search, starts, in_, not_, isnull, gte, lte],
      },
      take: pagination.take,
      skip: pagination.skip,
      orderBy,
    };
  };

  /**
   * Mengembalikan bentuk paginate standar.
   */
  paginate = <T>(
    data: T[],
    count: number,
    query: { take?: number; skip?: number }
  ): PaginatedResult<T> => {
    const take = query.take ?? count;
    const safeLimit = take > 0 ? take : count || 1; // hindari div/0

    const page =
      query.take && query.take > 0
        ? Math.floor((query.skip ?? 0) / query.take) + 1
        : 1;

    return {
      items: data,
      page,
      limit: safeLimit,
      totalItems: count,
      totalPages: Math.ceil(count / safeLimit) || 1,
    };
  };

  /**
   * Non-paginate (hanya bungkus items).
   */
  noPaginate = <T>(data: T[]) => {
    return { items: data };
  };

  /**
   * Menyatukan host dari ENV dengan path relatif.
   */
  appendHost = (str: string): string => {
    const host = (process.env.HOST ?? '').replace(/\/+$/, '');
    const path = String(str ?? '').replace(/^\/+/, '');
    return [host, path].filter(Boolean).join('/');
  };

  /**
   * Transform sebagian field pada objek data.
   */
  transformFields = <T extends Record<string, any>>(
    data: T,
    transform: Partial<Record<keyof T, (val: T[keyof T]) => any>>
  ): T => {
    return Object.fromEntries(
      Object.entries(data).map(([key, val]) => {
        const fn = transform?.[key as keyof T];
        return [key, typeof fn === 'function' ? fn(val as any) : val];
      })
    ) as T;
  };
}

export default BaseService;
