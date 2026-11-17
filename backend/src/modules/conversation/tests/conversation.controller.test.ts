
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

import { ConversationController } from '../conversation.controller.js';
import { ConversationService } from '../conversation.service.js';
import type { GetConversationsQuery } from '@shared/schemas/conversation.schema.js';

vi.mock('../conversation.service.js', () => ({
  ConversationService: {
    getConversations: vi.fn(),
  },
}));

describe('ConversationController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should return conversations with status 200', async () => {
      const query: GetConversationsQuery = {
        search: 'axe',
        advancedFilter: 'MOST_RECENTS_MESSAGES',
        page: 1,
        limit: 10,
      };

      const result = {
        items: [
          { id: 1 },
        ],
        pagination: {
          page: 1,
          limit: 10,
          hasMore: false,
        },
      };

      const req = {
        authUserId: 5,
      } as Request;

      const res = {
        locals: {
          validatedData: query,
        },
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      vi.mocked(ConversationService.getConversations)
        .mockResolvedValue(result as never);

      await ConversationController.get(req, res);

      expect(ConversationService.getConversations)
        .toHaveBeenCalledWith(5, query);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('should convert authUserId to number', async () => {
      const req = {
        authUserId: '15',
      } as unknown as Request;

      const query = {
        page: 1,
        limit: 10,
      } as GetConversationsQuery;

      const res = {
        locals: {
          validatedData: query,
        },
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      vi.mocked(ConversationService.getConversations)
        .mockResolvedValue({
          items: [],
          pagination: {
            page: 1,
            limit: 10,
            hasMore: false,
          },
        });

      await ConversationController.get(req, res);

      expect(ConversationService.getConversations)
        .toHaveBeenCalledWith(15, query);
    });

    it('should propagate service errors', async () => {
      const req = {
        authUserId: 5,
      } as Request;

      const query = {
        page: 1,
        limit: 10,
      } as GetConversationsQuery;

      const res = {
        locals: {
          validatedData: query,
        },
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      vi.mocked(ConversationService.getConversations)
        .mockRejectedValue(new Error('Service error'));

      await expect(
        ConversationController.get(req, res),
      ).rejects.toThrow('Service error');

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
