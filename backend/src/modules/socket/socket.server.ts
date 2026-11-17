import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { MessageService } from '../message/message.service.js';
import { ConversationRepository } from '../conversation/conversation.repository.js';
import { SendMessagePayload } from '@shared/dtos/message.dto.js';
import { checkSocketRateLimit } from '@backend/middlewares/socketRateLimit.middleware.js';

let io: Server;

export const initializeSocket = (
  server : HTTPServer
) => {
  io = new Server(server, {
    cors: {
      origin      : process.env.FRONTEND_URL,
      credentials : true,
    },

    maxHttpBufferSize: 64 * 1024,
  });

  io.on('connection', (socket) => {

    const userId: number = socket.data.userId;

    socket.join(`user:${userId}`);

    socket.on('conversation:leave', (
      conversationId : number
    ) => {
      const rateLimit = checkSocketRateLimit(
        socket.data.userId,
        "conversation:leave",
        20,
        10000,
      );

      if (!rateLimit.allowed) return;

      socket.leave(`conversation:${conversationId}`);
    });



    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });



    socket.on('conversation:read', async( conversationId ) => {

      const rateLimit = checkSocketRateLimit(
        socket.data.userId,
        "conversation:read",
        20,
        10000,
      );

      if (!rateLimit.allowed) return;

      try {
        await ConversationRepository.markAsRead(
          conversationId,
          socket.data.userId,
        );

        getIO()
          .to(`user:${socket.data.userId}`)
          .emit('conversation:read', conversationId );

      } catch (error: unknown) {
        console.error(error);
      }
    });



    socket.on('message:send', async (
      data : SendMessagePayload, 
      callback
    ) => {     

      const rateLimit = checkSocketRateLimit(
        socket.data.userId,
        "message:send",
        5,
        10000,
      );

      if (!rateLimit.allowed) {
        callback?.({
          success : false,
          error   : "Too many messages sent at once. Please await a while",
        });

        return;
      }

      try {
        const result = await MessageService.send(
          socket.data.userId,
          data,
        );

        const {
          message,
          conversation,
          recipientUnreadMessagesCount,
        } = result;

        getIO()
          .to(`conversation:${conversation.id}`)
          .emit('message:new', message)
        ;

        getIO()
          .to(`user:${socket.data.userId}`)
          .emit('conversation:updated', conversation)
        ;

        getIO()
        .to(`user:${data.recipientId ?? conversation.contact.id}`)
        .emit('conversation:updated', {
          ...conversation,
          unreadMessagesCount: recipientUnreadMessagesCount,
        });

        callback?.({
          success: true,
          data: {
            message,
            conversation,
          },
        });

      } catch (error: unknown) {
        console.error(error);

        callback?.({
          success: false,
          error: error instanceof Error
            ? error.message
            : 'Unable to send message',
        });
      }
    });



    socket.on('conversation:join', async (
      conversationId : number
    ) => {
      const rateLimit = checkSocketRateLimit(
        socket.data.userId,
        "conversation:join",
        10,
        10000,
      );

      if (!rateLimit.allowed) return;

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
  if (!io) throw new Error('Socket.IO not initialized');
  
  return io;
};