import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { initSocketIO } from './sockets/socket.js';
import { SlaService } from './services/sla.service.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  // Initialize WebSockets
  initSocketIO(server);

  // Start background SLA monitor
  SlaService.startSlaMonitor();

  server.listen(env.PORT, () => {
    logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`📡 API Base URL: http://localhost:${env.PORT}/api/v1`);
    logger.info(`🏥 Health check: http://localhost:${env.PORT}/api/v1/health`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
