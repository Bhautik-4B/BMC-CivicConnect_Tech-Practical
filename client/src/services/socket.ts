import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getClientSocket(): Socket {
  if (!socket) {
    socket = io('/', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
}
