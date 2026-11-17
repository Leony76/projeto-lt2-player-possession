import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConversationService } from '../conversation.service.js';
import { ConversationRepository } from '../conversation.repository.js';
import { ConversationMapper } from '../conversation.mapper.js';
import type { GetConversationsQuery } from '@shared/schemas/conversation.schema.js';
import type { ConversationQueryRow } from '@backend/types/conversationRowQuery.type.js';

vi.mock('../conversation.repository.js', () => ({
  ConversationRepository: {
    getUserConversations: vi.fn(),
  },
}));

vi.mock('../conversation.mapper.js', () => ({
  ConversationMapper: {
    toConversationListResponse: vi.fn(),
  },
}));

describe('ConversationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConversations', () => {
    const query: GetConversationsQuery = {
      search: 'axe',
      advancedFilter: 'MOST_RECENTS_MESSAGES',
      page: 1,
      limit: 2,
    };

    it('should return conversations with pagination', async () => {
      const rows = [
        { id: 1 },
        { id: 2 },
      ] as never;

      const mappedConversations = [
        { id: 1 },
        { id: 2 },
      ] as never;

      vi.mocked(ConversationRepository.getUserConversations)
        .mockResolvedValue(rows);

      vi.mocked(ConversationMapper.toConversationListResponse)
        .mockReturnValue(mappedConversations);

      const result = await ConversationService.getConversations(10, query);

      expect(ConversationRepository.getUserConversations).toHaveBeenCalledWith(
        10,
        'axe',
        'MOST_RECENTS_MESSAGES',
        1,
        2,
      );

      expect(ConversationMapper.toConversationListResponse)
        .toHaveBeenCalledWith(rows);

      expect(result).toEqual({
        items: mappedConversations,
        pagination: {
          page: 1,
          limit: 2,
          hasMore: false,
        },
      });
    });

    it('should set hasMore to true when repository returns more rows than the limit', async () => {
      const rows = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ] as unknown as ConversationQueryRow[];

      const mappedConversations = [
        { id: 1 },
        { id: 2 },
      ] as never;

      vi.mocked(ConversationRepository.getUserConversations)
        .mockResolvedValue(rows);

      vi.mocked(ConversationMapper.toConversationListResponse)
        .mockReturnValue(mappedConversations);

      const result = await ConversationService.getConversations(10, query);

      expect(ConversationMapper.toConversationListResponse)
        .toHaveBeenCalledWith(rows.slice(0, 2));

      expect(result.pagination.hasMore).toBe(true);
      expect(result.items).toEqual(mappedConversations);
    });

    it('should set hasMore to false when repository returns exactly the limit', async () => {
      const rows = [
        { id: 1 },
        { id: 2 },
      ] as never;

      vi.mocked(ConversationRepository.getUserConversations)
        .mockResolvedValue(rows);

      vi.mocked(ConversationMapper.toConversationListResponse)
        .mockReturnValue([] as never);

      const result = await ConversationService.getConversations(10, query);

      expect(result.pagination.hasMore).toBe(false);
    });

    it('should return an empty list when there are no conversations', async () => {
      vi.mocked(ConversationRepository.getUserConversations)
        .mockResolvedValue([]);

      vi.mocked(ConversationMapper.toConversationListResponse)
        .mockReturnValue([]);

      const result = await ConversationService.getConversations(10, query);

      expect(result).toEqual({
        items: [],
        pagination: {
          page: 1,
          limit: 2,
          hasMore: false,
        },
      });
    });

    it('should use an empty string when search is not provided', async () => {
      const queryWithoutSearch: GetConversationsQuery = {
        advancedFilter: 'MOST_RECENTS_MESSAGES',
        page: 1,
        limit: 10,
      };

      vi.mocked(ConversationRepository.getUserConversations)
        .mockResolvedValue([]);

      vi.mocked(ConversationMapper.toConversationListResponse)
        .mockReturnValue([]);

      await ConversationService.getConversations(10, queryWithoutSearch);

      expect(ConversationRepository.getUserConversations)
        .toHaveBeenCalledWith(10, '', 'MOST_RECENTS_MESSAGES', 1, 10);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');

      vi.mocked(ConversationRepository.getUserConversations)
        .mockRejectedValue(error);

      await expect(
        ConversationService.getConversations(10, query),
      ).rejects.toThrow('Database error');

      expect(ConversationMapper.toConversationListResponse)
        .not.toHaveBeenCalled();
    });
  });
});
