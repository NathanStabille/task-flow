import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { apiRouter } from './routes/index.js';

export const app = express();

app.disable('x-powered-by');
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  }),
);
app.use(express.json());

app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);

