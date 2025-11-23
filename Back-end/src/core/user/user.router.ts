import { Router } from 'express';
import validatorMiddleware from '../../middlewares/validator.middleware';
import userController from './user.controller';
import userValidator from './user.validator';
import { baseValidator } from '../../base/validator.base';

const r = Router();
const validator = userValidator;
const controller = new userController();

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

const userRouter = r;
export default userRouter;
