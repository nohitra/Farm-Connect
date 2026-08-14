import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (!token) return null;

  if (socket) {
    socket.disconnect();
  }

  const serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socket = io(serverUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected successfully:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('⚠️ Socket connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
