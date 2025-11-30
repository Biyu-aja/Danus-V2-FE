import express from 'express';
import type { Application } from 'express';
import userRouter from './routes/user.route';

const app: Application = express();
app.use(express.json());

// register routes
app.use('/api/user', userRouter);

export default app;
