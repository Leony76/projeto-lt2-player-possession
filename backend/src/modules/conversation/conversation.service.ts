import { APIError } from '@backend/middlewares/error.middleware.js';
import { ConversationRepository } from './conversation.repository.js';
import { ConversationMapper } from './conversation.mapper.js';
import { MessageRepository } from '../message/message.repository.js';

export class ConversationService {

  public static async getConversations(
    userId : number
  ) {
    const conversations = await ConversationRepository.getUserConversations(userId);

    const conversationsWithUnread = await Promise.all(
      conversations.map(async conversation => {
        const unreadMessagesCount =
          await MessageRepository.countUnreadMessages(
            conversation.id,
            userId,
          );

        return {
          ...conversation,
          unreadMessagesCount,
        };
      }),
    );

     return ConversationMapper.toConversationListResponse(conversationsWithUnread);
  }



  public static async getMessages(
    userId         : number,
    conversationId : number,
  ) {

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      throw new APIError(400, 'Invalid conversation ID');
    }

    const conversation = await ConversationRepository.findByIdAndUserId(
      conversationId,
      userId,
    );

    if (!conversation) {
      throw new APIError(404, 'Conversation not found');
    }

    return conversation.messages;
  }
}