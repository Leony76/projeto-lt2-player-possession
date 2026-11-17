
import { describe, expect, it } from 'vitest';

import { ItemMapper } from '../item.mappers.js';

import type { ItemCategory, ItemState } from '@backend/generated/prisma/enums.js';

describe('ItemMapper', () => {
  describe('toPaginatedItemsResponse', () => {
    it('should map items and pagination correctly', () => {
      const data = {
        items: [
          {
            id: 1,
            name: 'Fire Axe',
            originalPrice: 500,
          },
          {
            id: 2,
            name: 'Blue Wood',
            originalPrice: null,
          },
        ],
        totalItems: 25,
      } as never;

      const result = ItemMapper.toPaginatedItemsResponse(2, 10, data);

      expect(result).toEqual({
        items: [
          {
            id: 1,
            name: 'Fire Axe',
            originalPrice: 500,
          },
          {
            id: 2,
            name: 'Blue Wood',
            originalPrice: -1,
          },
        ],
        pagination: {
          totalItems: 25,
          totalPages: 3,
          page: 2,
          limit: 10,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      });
    });

    it('should set hasNextPage to false on the last page', () => {
      const data = {
        items: [],
        totalItems: 20,
      } as never;

      const result = ItemMapper.toPaginatedItemsResponse(2, 10, data);

      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });

    it('should return zero totalPages when there are no items', () => {
      const data = {
        items: [],
        totalItems: 0,
      } as never;

      const result = ItemMapper.toPaginatedItemsResponse(1, 10, data);

      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });
  });

  describe('toItemDetailsResponse', () => {
    it('should map item details correctly', () => {
      const data = {
        id: 1,
        category: 'AXE' as ItemCategory,
        state: 'LOOSE' as ItemState,
        description: 'An axe',
        name: 'Fire Axe',
        originalPrice: 500,
        averageMarketPrice: 600,
        averageTruckloadPrice: 700,
        averageTruckloadPrice1x1: 800,
        releaseYear: 2020,
        imageURL: 'https://example.com/axe.png',
        users: [
          { units: 5 },
        ],
      };

      const result = ItemMapper.toItemDetailsResponse(data);

      expect(result).toEqual({
        id: 1,
        category: data.category,
        state: data.state,
        description: 'An axe',
        name: 'Fire Axe',
        originalPrice: 500,
        averageMarketPrice: 600,
        averageTruckloadPrice: 700,
        averageTruckloadPrice1x1: 800,
        releaseYear: 2020,
        imageURL: 'https://example.com/axe.png',
        unitsLoggedUserHas: 5,
      });
    });

    it('should replace null prices with -1', () => {
      const data = {
        id: 1,
        category: 'AXE' as ItemCategory,
        state: 'LOOSE' as ItemState,
        description: null,
        name: 'Fire Axe',
        originalPrice: null,
        averageMarketPrice: null,
        averageTruckloadPrice: null,
        averageTruckloadPrice1x1: null,
        releaseYear: null,
        imageURL: 'https://example.com/axe.png',
        users: [],
      };

      const result = ItemMapper.toItemDetailsResponse(data);

      expect(result.originalPrice).toBe(-1);
      expect(result.averageTruckloadPrice).toBe(-1);
      expect(result.unitsLoggedUserHas).toBe(0);
    });

    it('should use the first user units value', () => {
      const data = {
        id: 1,
        category: 'AXE' as ItemCategory,
        state: 'LOOSE' as ItemState,
        description: null,
        name: 'Fire Axe',
        originalPrice: 500,
        averageMarketPrice: 600,
        averageTruckloadPrice: 700,
        averageTruckloadPrice1x1: 800,
        releaseYear: 2020,
        imageURL: 'https://example.com/axe.png',
        users: [
          { units: 8 },
          { units: 15 },
        ],
      };

      const result = ItemMapper.toItemDetailsResponse(data);

      expect(result.unitsLoggedUserHas).toBe(8);
    });
  });

  describe('toUserItemsFromHomeResponse', () => {
    it('should map home items correctly', () => {
      const data = {
        items: [
          {
            units: 5,
            item: {
              id: 1,
              category: 'AXE' as ItemCategory,
              state: 'LOOSE' as ItemState,
              description: 'An axe',
              name: 'Fire Axe',
              originalPrice: 500,
              averageMarketPrice: 600,
              imageURL: 'https://example.com/axe.png',
            },
          },
          {
            units: 2,
            item: {
              id: 2,
              category: 'AXE' as ItemCategory,
              state: 'LOOSE' as ItemState,
              description: null,
              name: 'Blue Axe',
              originalPrice: null,
              averageMarketPrice: null,
              imageURL: 'https://example.com/blue-axe.png',
            },
          },
        ],
        totalItems: 2,
      };

      const result = ItemMapper.toUserItemsFromHomeResponse(data);

      expect(result).toEqual({
        items: [
          {
            id: 1,
            category: data.items[0]!.item.category,
            state: data.items[0]!.item.state,
            description: 'An axe',
            name: 'Fire Axe',
            originalPrice: 500,
            averageMarketPrice: 600,
            imageURL: 'https://example.com/axe.png',
            units: 5,
          },
          {
            id: 2,
            category: data.items[1]!.item.category,
            state: data.items[1]!.item.state,
            description: null,
            name: 'Blue Axe',
            originalPrice: -1,
            averageMarketPrice: null,
            imageURL: 'https://example.com/blue-axe.png',
            units: 2,
          },
        ],
        totalItems: 2,
      });
    });

    it('should return an empty list when there are no items', () => {
      const result = ItemMapper.toUserItemsFromHomeResponse({
        items: [],
        totalItems: 0,
      });

      expect(result).toEqual({
        items: [],
        totalItems: 0,
      });
    });
  });

  describe('toUserItemsResponse', () => {
    it('should map user items and units correctly', () => {
      const data = [
        {
          id: 1,
          category: 'AXE' as ItemCategory,
          state: 'LOOSE' as ItemState,
          description: 'An axe',
          name: 'Fire Axe',
          originalPrice: 500,
          averageMarketPrice: 600,
          imageURL: 'https://example.com/axe.png',
          users: [{ units: 10 }],
        },
        {
          id: 2,
          category: 'AXE' as ItemCategory,
          state: 'LOOSE' as ItemState,
          description: null,
          name: 'Blue Axe',
          originalPrice: null,
          averageMarketPrice: null,
          imageURL: 'https://example.com/blue-axe.png',
          users: [],
        },
      ];

      const result = ItemMapper.toUserItemsResponse(data);

      expect(result).toEqual([
        {
          id: 1,
          category: data[0]!.category,
          state: data[0]!.state,
          description: 'An axe',
          name: 'Fire Axe',
          originalPrice: 500,
          averageMarketPrice: 600,
          imageURL: 'https://example.com/axe.png',
          units: 10,
        },
        {
          id: 2,
          category: data[1]!.category,
          state: data[1]!.state,
          description: null,
          name: 'Blue Axe',
          originalPrice: -1,
          averageMarketPrice: null,
          imageURL: 'https://example.com/blue-axe.png',
          units: 0,
        },
      ]);
    });

    it('should return an empty array when there are no items', () => {
      const result = ItemMapper.toUserItemsResponse([]);

      expect(result).toEqual([]);
    });
  });
});
