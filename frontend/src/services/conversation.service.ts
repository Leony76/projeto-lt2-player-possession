import { api } from "@/lib/api";
import type { ConversationListItem } from "@shared/dtos/message.dto";
import type { ScrollPaginatedResponse } from "@shared/dtos/pagination.dto";
import type { ConversationsQuery } from "@shared/maps/filters/conversations/getConversations.type";

export class ConversationService {

  static async get(
    params : ConversationsQuery,
  ): Promise<ScrollPaginatedResponse<ConversationListItem>> {

    const { data } = await api.get<
      ScrollPaginatedResponse<
        ConversationListItem>>(
          '/conversations',
      { params }
    );

    return data;
  }
}