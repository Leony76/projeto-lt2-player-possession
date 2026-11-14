import type { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

export const configureSocketAuth = (
  io : Server
) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Unauthorized'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as { id: number };

      socket.data.userId = decoded.id;

      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });
};