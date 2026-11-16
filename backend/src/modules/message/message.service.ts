
import { prisma } from "@backend/lib/prisma.js";
import { APIError } from "@backend/middlewares/error.middleware.js";
import { SendMessagePayload } from "@shared/dtos/message.dto.js";
import { MessageRepository } from "./message.repository.js";
import { ConversationRepository } from "../conversation/conversation.repository.js";
import { ContactRepository } from "../contact/contact.repository.js";
import { MessageMapper } from "./message.mapper.js";

export class MessageService {


  public static async get(
    userId         : number,
    conversationId : number,
  ) {

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      throw new APIError(400, 'Invalid conversation ID');
    }

    const conversation = await MessageRepository.findByIdAndUserId(
      conversationId,
      userId,
    );

    if (!conversation) {
      throw new APIError(404, 'Conversation not found');
    }

    return conversation.messages;
  }



  public static async send(
    userId  : number,
    payload : SendMessagePayload,
  ) {
    const content = payload.content.trim();

    if (!content) {
      throw new APIError(400, "Message cannot be empty");
    }

    if (content.length > 1000) {
      throw new APIError(400, "Message length cap is 1000 characters");
    }

    const hasConversationId = payload.conversationId !== undefined;
    const hasRecipientId = payload.recipientId !== undefined;

    if (hasConversationId === hasRecipientId) {
      throw new APIError(400, "Provide exactly one conversation identifier");
    }

    return prisma.$transaction(async tx => {

      if (hasConversationId) {
        const conversationId = payload.conversationId!;

        const conversation = await ConversationRepository.findConversationForUser(
          tx,
          conversationId,
          userId,
        );

        if (!conversation) {
          throw new APIError(403, "Not a conversation participant");
        }

        const contact = conversation.participants[0]?.user;

        if (!contact) {
          throw new APIError(404, "Conversation contact not found");
        }

        const message = await MessageRepository.create(
          tx,
          content,
          conversationId,
          userId,
        );

        const recipientUnreadMessagesCount =
          await MessageRepository.countRecipientUnreadMessages(
            tx,
            conversationId,
            contact.id,
          );

        const updatedConversation = await ConversationRepository.update(
          tx, 
          conversationId
        );

        return {
          message,
          recipientUnreadMessagesCount,
          conversation: {
            id                  : updatedConversation.id,
            contact             : MessageMapper.toContactFormat(contact),
            updatedAt           : updatedConversation.updatedAt,
            lastMessage         : message,
            unreadMessagesCount : 0,
          },
        };
      }


      const recipientId = payload.recipientId!;

      if (recipientId === userId) {
        throw new APIError(400, "Cannot message yourself");
      }

      const contactRelation = await ContactRepository.findAcceptedContactRelation(
        tx,
        userId,
        recipientId,
      );

      if (!contactRelation) {
        throw new APIError(403, "You can only message your contacts");
      }

      const existingConversation = await ConversationRepository
        .findConversationBetweenUsers(
          tx,
          userId,
          recipientId,
      );

      const conversation = existingConversation ??
        await ConversationRepository.create(
          tx,
          userId,
          recipientId,
        );

      const message = await MessageRepository.create(
        tx,
        content,
        conversation.id,
        userId,
      );

      const recipientUnreadMessagesCount =
        await MessageRepository.countRecipientUnreadMessages(
          tx,
          conversation.id,
          recipientId,
        );

      const updatedConversation =
        await ConversationRepository.update(tx, conversation.id);

      const contact = await ContactRepository.findContactById(
        tx,
        recipientId,
      );

      if (!contact) {
        throw new APIError(404, "Recipient not found");
      }

      return {
        message,
        recipientUnreadMessagesCount,
        conversation: {
          id                  : updatedConversation.id,
          contact             : MessageMapper.toContactFormat(contact),
          updatedAt           : updatedConversation.updatedAt,
          lastMessage         : message,
          unreadMessagesCount : 0,
        },
      };
    });
  }
}
