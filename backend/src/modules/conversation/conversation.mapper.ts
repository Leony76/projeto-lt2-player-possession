import { ConversationQueryRow } from "@backend/types/conversationRowQuery.type.js";
import type { ConversationListItem } from "@shared/dtos/message.dto.js";

export class ConversationMapper {

  public static toConversationListResponse(
    rows: ConversationQueryRow[],
  ) : ConversationListItem[] {

    return rows.map(row => ({
      id: row.id,

      contact: {
        id              : row.contactId,
        username        : row.contactName,
        profileImageURL : row.contactProfileImageURL,
      },

      lastMessage: row.lastMessageId !== null
        ? {
            id        : row.lastMessageId,
            content   : row.lastMessageContent!,
            senderId  : row.lastMessageSenderId!,
            createdAt : row.lastMessageCreatedAt!.toISOString(),
          }
        : null,

      updatedAt : row.updatedAt.toISOString(),

      unreadMessagesCount : Number(row.unreadMessagesCount),
    }));
  }
}