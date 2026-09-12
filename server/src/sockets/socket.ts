import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    // Join room for specific ticket
    socket.on('join:ticket', (ticketId: string) => {
      socket.join(`ticket:${ticketId}`);
      logger.debug(`Socket ${socket.id} joined room: ticket:${ticketId}`);
    });

    // Join room for department
    socket.on('join:dept', (deptId: string) => {
      socket.join(`dept:${deptId}`);
      logger.debug(`Socket ${socket.id} joined room: dept:${deptId}`);
    });

    // Join room for private user
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
      logger.debug(`Socket ${socket.id} joined room: user:${userId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}
