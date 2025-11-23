import BaseService from '../../base/service.base';
import prisma from '../../db/prisma';

class userService extends BaseService {
  constructor() {
    super(prisma);
  }

  findAll = async (query: any) => {
    const q = this.transformFindAllQuery(query);
    const data = await this.db.user.findMany({ ...q });

    if (query?.paginate) {
      const countData = await this.db.user.count({ where: (q as any).where });
      return this.paginate(data, countData, q as any);
    }
    return this.noPaginate(data);
  };

  findById = async (id: string) => {
    const data = await this.db.user.findUniqueOrThrow({ where: { id } });
    return data;
  };

  create = async (payload: any) => {
    const data = await this.db.user.create({ data: payload });
    return data;
  };

  update = async (id: string, payload: any) => {
    const data = await this.db.user.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id: string) => {
    const data = await this.db.user.delete({ where: { id } });
    return data;
  };
}

export default userService;
