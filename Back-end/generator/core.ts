// scripts/core-generator.ts
import fs from 'fs';
import path from 'path';
import { program } from 'commander';

program
  .requiredOption('--name <name>', 'Name of the folder to create')
  .option('--model-name <modelName>', 'Prisma model name (camelCase). If omitted, derived from --name');

program.parse(process.argv);

const opts = program.opts<{ name: string; modelName?: string }>();

const Name = opts.name.trim();
const nameL = Name.toLowerCase();

// camelCase helper
const toCamel = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

// gunakan --model-name jika ada; fallback ke camelCase dari --name
const modelName = (opts.modelName?.trim()) || toCamel(Name);

const basePath = path.join('./src/core', nameL);

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

type GenFile = { name: string; content: string };

const files: GenFile[] = [
  {
    name: `${nameL}.validator.ts`,
    content: `import Joi from 'joi';

export const ${Name}Validator = {
  create: Joi.object({
    // no-data
  }),
  update: Joi.object({
    // no-data
  }),
};

export default ${Name}Validator;
`,
  },
  {
    name: `${nameL}.router.ts`,
    content: `import { Router } from 'express';
import validatorMiddleware from '../../middlewares/validator.middleware';
import ${Name}Controller from './${nameL}.controller';
import ${Name}Validator from './${nameL}.validator';
import { baseValidator } from '../../base/validator.base';

const r = Router();
const validator = ${Name}Validator;
const controller = new ${Name}Controller();

r.get(
  '/find-all',
  validatorMiddleware({ query: baseValidator.findAllQuery }),
  controller.findAll
);

r.get('/find-one/:id', controller.findById);

r.post(
  '/create',
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.patch(
  '/update/:id',
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete('/delete/:id', controller.delete);

const ${nameL}Router = r;
export default ${nameL}Router;
`,
  },
  {
    name: `${nameL}.controller.ts`,
    content: `import BaseController from '../../base/controller.base';
import ${Name}Service from './${nameL}.service';
import type { Request, Response } from 'express';

class ${Name}Controller extends BaseController {
  #service: ${Name}Service;

  constructor() {
    super();
    this.#service = new ${Name}Service();
  }

  findAll = this.wrapper(async (req: Request, res: Response) => {
    const data = await this.#service.findAll((req as any).vquery);
    return this.success(res, data, 'Banyak ${Name} berhasil didapatkan');
  });

  findById = this.wrapper(async (req: Request, res: Response) => {
    const data = await this.#service.findById(req.params.id);
    return this.success(res, data, '${Name} berhasil didapatkan');
  });

  create = this.wrapper(async (req: Request, res: Response) => {
    const data = await this.#service.create((req as any).vbody);
    return this.created(res, data, '${Name} berhasil dibuat');
  });

  update = this.wrapper(async (req: Request, res: Response) => {
    const data = await this.#service.update(req.params.id, (req as any).vbody);
    return this.success(res, data, '${Name} berhasil diperbarui');
  });

  delete = this.wrapper(async (req: Request, res: Response) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, '${Name} berhasil dihapus');
  });
}

export default ${Name}Controller;
`,
  },
  {
    name: `${nameL}.service.ts`,
    content: `import BaseService from '../../base/service.base';
import { prisma } from '../../db/prisma';

class ${Name}Service extends BaseService {
  constructor() {
    super(prisma);
  }

  findAll = async (query: any) => {
    const q = this.transformFindAllQuery(query);
    const data = await this.db.${modelName}.findMany({ ...q });

    if (query?.paginate) {
      const countData = await this.db.${modelName}.count({ where: (q as any).where });
      return this.paginate(data, countData, q as any);
    }
    return this.noPaginate(data);
  };

  findById = async (id: string) => {
    const data = await this.db.${modelName}.findUniqueOrThrow({ where: { id } });
    return data;
  };

  create = async (payload: any) => {
    const data = await this.db.${modelName}.create({ data: payload });
    return data;
  };

  update = async (id: string, payload: any) => {
    const data = await this.db.${modelName}.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id: string) => {
    const data = await this.db.${modelName}.delete({ where: { id } });
    return data;
  };
}

export default ${Name}Service;
`,
  },
];
console.log('=== Core Generator (TypeScript) ===');

files.forEach((file) => {
  const outPath = path.join(basePath, file.name);
  fs.writeFileSync(outPath, file.content, 'utf8');
  // Hindari emoji di sini
  console.log('Created file: ' + outPath);
});

// Boleh pakai template literal biasa (tanpa emoji)
console.log(`Generator completed for ${modelName}`);
