import { ConversationRepository } from './conversation.repository.js';
import { ConversationMapper } from './conversation.mapper.js';
import { ScrollPaginatedResponse } from '@shared/dtos/pagination.dto.js';
import { ConversationListItem } from '@shared/dtos/message.dto.js';
import { GetConversationsQuery } from '@shared/schemas/conversation.schema.js';

export class ConversationService {

  public static async getConversations(
    userId : number,
    query  : GetConversationsQuery,
  ): Promise<ScrollPaginatedResponse<ConversationListItem>> {

    const rows = await ConversationRepository.getUserConversations(
      userId,
      query.search ?? "",
      query.advancedFilter,
      query.page,
      query.limit,
    );

    const hasMore = rows.length > query.limit;
    const conversations = rows.slice(0, query.limit);

    return {
      items : ConversationMapper.toConversationListResponse(conversations),
      pagination: {
        page  : query.page,
        limit : query.limit,
        hasMore,
      },
    };
  }
}