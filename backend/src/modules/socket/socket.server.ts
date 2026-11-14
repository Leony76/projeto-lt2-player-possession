import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { MessageService } from '../message/message.service.js';
import { ConversationRepository } from '../conversation/conversation.repository.js';

let io: Server;

export const initializeSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    socket.on('conversation:join', (conversationId: number) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId: number) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });

    socket.on('message:send', async(
      data: {
        conversationId: number;
        content: string;
      },
      callback,
    ) => {
      try {
        const message = await MessageService.send(
          socket.data.userId,
          data.conversationId,
          data.content,
        );

        getIO()
          .to(`conversation:${data.conversationId}`)
          .emit('message:new', message)
        ;

        callback?.({
          success: true,
          data: message,
        });
      } catch (error : unknown) {
        callback?.({
          success : false,
          message : 'Unable to send message',
        });
      }},
    );

    socket.on('conversation:join', async (conversationId: number) => {
      try {
        const participant = await ConversationRepository
          .findParticipantByConversationAndUserId(
            conversationId,
            socket.data.userId
        );      

        if (!participant) return;

        socket.join(`conversation:${conversationId}`);
      } catch (error : unknown) {
        console.error(error);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }

  return io;
};