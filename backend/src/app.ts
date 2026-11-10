import cors from 'cors';
import express, { Express } from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { apiRouter } from './routes';

/**
 * Configures and returns the Express application instance.
 */
export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use('/api/v1', apiRouter);
  app.use(errorHandler);

  return app;
}
