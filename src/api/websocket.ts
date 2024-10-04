import { io, Socket } from 'socket.io-client';
import { API_URL } from '../config';

let socket: Socket | undefined;

export const initializeWebSocket = (): Socket => {
  if (!socket) {
    socket = io(API_URL);

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