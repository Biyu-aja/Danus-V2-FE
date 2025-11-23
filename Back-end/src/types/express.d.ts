// types/express.d.ts
import 'express-serve-static-core';
declare module 'express-serve-static-core' {
  interface Request {
    user?: import('../src/middlewares/auth.middleware.js').AuthUser;
  }
}
