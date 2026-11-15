import { APIError } from "@backend/middlewares/error.middleware.js";
import type { ConversationListItem } from "@shared/dtos/message.dto.js";

export class ConversationMapper {

  public static toConversationListResponse(
    conversations: {
      id: number;
      participants: {
        user: {
          id: number;
          name: string;
          profileImageURL: string | null;
        };
      }[];
      messages: {
        id: number;
        content: string;
        senderId: number;
        createdAt: Date;
      }[];
      updatedAt: Date;
      unreadMessagesCount: number;
    }[],
  ): ConversationListItem[] {
    return conversations.map((conversation) => {
      const contact = conversation.participants[0]?.user;
      const lastMessage = conversation.messages[0];

      if (!contact) {
        throw new APIError(400, `Contact not found for conversation ${conversation.id}`);
      }

      return {
        id: conversation.id,

        contact: {
          id              : contact.id,
          username        : contact.name,
          profileImageURL : contact.profileImageURL,
        },

        lastMessage: lastMessage
          ? {
              ...lastMessage,
              createdAt: lastMessage.createdAt.toISOString(),
            }
          : null,

        updatedAt: conversation.updatedAt.toISOString(),
        unreadMessagesCount: conversation.unreadMessagesCount,
      };
    });
  }
}