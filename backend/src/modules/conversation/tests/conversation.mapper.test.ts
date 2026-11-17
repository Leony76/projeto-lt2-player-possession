
import { describe, expect, it } from 'vitest';
import { ConversationMapper } from '../conversation.mapper.js';
import type { ConversationQueryRow } from '@backend/types/conversationRowQuery.type.js';

describe('ConversationMapper', () => {
  describe('toConversationListResponse', () => {
    it('should map a conversation with a last message', () => {
      const createdAt = new Date('2026-11-17T10:00:00.000Z');
      const updatedAt = new Date('2026-11-17T10:30:00.000Z');

      const rows = [
        {
          id: 1,
          contactId: 2,
          contactName: 'Player',
          contactProfileImageURL: 'https://example.com/profile.png',

          lastMessageId: 15,
          lastMessageContent: 'Hello!',
          lastMessageSenderId: 2,
          lastMessageCreatedAt: createdAt,

          updatedAt,
          unreadMessagesCount: 3n,
        },
      ] as ConversationQueryRow[];

      const result = ConversationMapper.toConversationListResponse(rows);

      expect(result).toEqual([
        {
          id: 1,
          contact: {
            id: 2,
            username: 'Player',
            profileImageURL: 'https://example.com/profile.png',
          },
          lastMessage: {
            id: 15,
            content: 'Hello!',
            senderId: 2,
            createdAt: createdAt.toISOString(),
          },
          updatedAt: updatedAt.toISOString(),
          unreadMessagesCount: 3,
        },
      ]);
    });

    it('should return null as lastMessage when the conversation has no messages', () => {
      const updatedAt = new Date('2026-11-17T10:30:00.000Z');

      const rows = [
        {
          id: 1,
          contactId: 2,
          contactName: 'Player',
          contactProfileImageURL: null,

          lastMessageId: null,
          lastMessageContent: null,
          lastMessageSenderId: null,
          lastMessageCreatedAt: null,

          updatedAt,
          unreadMessagesCount: 0n,
        },
      ] as ConversationQueryRow[];

      const result = ConversationMapper.toConversationListResponse(rows);

      expect(result[0]).toEqual({
        id: 1,
        contact: {
          id: 2,
          username: 'Player',
          profileImageURL: null,
        },
        lastMessage: null,
        updatedAt: updatedAt.toISOString(),
        unreadMessagesCount: 0,
      });
    });

    it('should convert unreadMessagesCount to number', () => {
      const rows = [
        {
          id: 1,
          contactId: 2,
          contactName: 'Player',
          contactProfileImageURL: null,

          lastMessageId: null,
          lastMessageContent: null,
          lastMessageSenderId: null,
          lastMessageCreatedAt: null,

          updatedAt: new Date(),
          unreadMessagesCount: 10n,
        },
      ] as ConversationQueryRow[];

      const result = ConversationMapper.toConversationListResponse(rows);

      expect(result[0]?.unreadMessagesCount).toBe(10);
      expect(typeof result[0]?.unreadMessagesCount).toBe('number');
    });

    it('should return an empty array when there are no rows', () => {
      const result = ConversationMapper.toConversationListResponse([]);

      expect(result).toEqual([]);
    });
  });
});
