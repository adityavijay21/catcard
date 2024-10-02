import { io, Socket } from 'socket.io-client';

let socket: Socket | undefined;

export const initializeWebSocket = (): Socket => {
  if (!socket) {
    socket = io('http://localhost:8080');

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });
  }

  return socket;
};

export const getSocket = (): Socket | undefined => socket;