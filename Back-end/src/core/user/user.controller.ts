import BaseController from '../../base/controller.base';
import userService from './user.service';
import type { Request, Response } from 'express';

class userController extends BaseController {
  #service: userService;

  constructor() {
    super();
    this.#service = new userService();
  }

  findAll = this.wrapper(async (req: Request, res: Response) => {
    const data = await this.#service.findAll((req as any).vquery);
    return this.success(res, data, 'Banyak user berhasil didapatkan');
  });

  findById = this.wrapper(async (req: Request, res: Response) => {
    const data = await this.#service.findById(req.params.id);
    return this.success(res, data, 'user berhasil didapatkan');
  });

  create = this.wrapper(async (req: Request, res: Response) => {
    const data = await this.#service.create((req as any).vbody);
    return this.created(res, data, 'user berhasil dibuat');
  });

  update = this.wrapper(async (req: Request, res: Response) => {
    const data = await this.#service.update(req.params.id, (req as any).vbody);
    return this.success(res, data, 'user berhasil diperbarui');
  });

  delete = this.wrapper(async (req: Request, res: Response) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, 'user berhasil dihapus');
  });
}

export default userController;
