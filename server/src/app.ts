import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { apiRoutes } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

export function createApp(): Express {
  const app = express();

  // Security & standard middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow mobile/curl (no origin) or any LAN / localhost origins
        if (
          !origin ||
          env.NODE_ENV !== 'production' ||
          origin.includes('localhost') ||
          origin.includes('10.') ||
          origin.includes('192.168.') ||
          origin.includes('172.') ||
          origin === env.CLIENT_URL
        ) {
          return callback(null, true);
        }
        callback(null, true);
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Mount API router
  app.use('/api/v1', apiRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

