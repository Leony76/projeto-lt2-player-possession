import type { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const jwtSecret = process.env['JWT_SECRET']!;

export const configureSocketAuth = (io: Server) => {
  io.use((socket, next) => {
    try {
      const cookies = cookie.parseCookie(
        socket.handshake.headers.cookie ?? ''
      );

      const token = cookies['access_token'];

      if (!token) {
        return next(new Error('Unauthorized'));
      }

      const payload = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'],
      });

      if (
        typeof payload === 'string' ||
        typeof payload === 'number' ||
        typeof payload.sub !== 'number'
      ) {
        return next(new Error('Invalid token'));
      }

      socket.data.userId = payload.sub;

      return next();

    } catch {
      return next(new Error('Unauthorized'));
    }
  });
};
