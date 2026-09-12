import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { env } from './config/env.js';
import { apiRoutes } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

export function createApp(): Express {
  const app = express();

  // Security & standard middlewares (configured to allow OSM map tiles and Unsplash images)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );

  const allowedOrigins = env.CLIENT_URL ? env.CLIENT_URL.split(',').map((u) => u.trim()) : [];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow mobile/curl (no origin) or any LAN / localhost / allowed production origins
        if (
          !origin ||
          env.NODE_ENV !== 'production' ||
          origin.includes('localhost') ||
          origin.includes('10.') ||
          origin.includes('192.168.') ||
          origin.includes('172.') ||
          allowedOrigins.includes(origin) ||
          allowedOrigins.some((o) => origin.startsWith(o))
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

  // Serve static client bundle if available (for single-node / container / Render fullstack deployments)
  const clientDistCandidates = [
    path.resolve(process.cwd(), 'client/dist'),
    path.resolve(process.cwd(), '../client/dist'),
    path.resolve(process.cwd(), 'dist/client')
  ];
  const clientDist = clientDistCandidates.find((p) => fs.existsSync(p));

  if (clientDist) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
        return next();
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  return app;
}


