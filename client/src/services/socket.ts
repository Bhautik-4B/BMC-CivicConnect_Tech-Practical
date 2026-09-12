import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl =
      process.env.NODE_ENV === 'production'
        ? window.location.origin
        : `${window.location.protocol}//${window.location.hostname}:5000`;

    socket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('📡 Connected to Socket.io server:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('📡 Disconnected from Socket.io server');
    });
  }

  return socket;
};

export const joinUserRoom = (userId: string) => {
  const s = getSocket();
  if (s && userId) {
    s.emit('join:user', userId);
  }
};

export const joinDeptRoom = (deptId: string) => {
  const s = getSocket();
  if (s && deptId) {
    s.emit('join:dept', deptId);
  }
};

export const joinTicketRoom = (ticketId: string) => {
  const s = getSocket();
  if (s && ticketId) {
    s.emit('join:ticket', ticketId);
  }
};
