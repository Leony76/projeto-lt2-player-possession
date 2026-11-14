import { prisma } from "@backend/lib/prisma.js";
import { APIError } from "@backend/middlewares/error.middleware.js";
import { MessageRepository } from "./message.repository.js";
import { ConversationRepository } from "../conversation/conversation.repository.js";

export class MessageService {

  public static async send(
    userId         : number,
    conversationId : number,
    content        : string,
  ) {
    const participant = await ConversationRepository
      .findParticipantByConversationAndUserId(
        conversationId,
        userId,
    );

    if (!participant) {
      throw new APIError(403, 'Not a conversation participant');
    } if (!content.trim()) {
      throw new APIError(400, 'Message cannot be empty');
    }

    return MessageRepository.create(
      content.trim(),
      conversationId,
      userId,
    );
  }
}