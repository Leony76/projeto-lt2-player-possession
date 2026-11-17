import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemService } from '../item.service.js';
import { ItemRepository } from '../item.repository.js';
import { ItemMapper } from '../item.mappers.js';
import { APIError } from '@backend/middlewares/error.middleware.js';
import type { GetItemsFilters } from '@shared/maps/filters/items/getItems.type.js';

vi.mock('../item.repository.js', () => ({
  ItemRepository: {
    get: vi.fn(),
    getItemDetails: vi.fn(),
    updateUserItemUnits: vi.fn(),
    getUserItemsFromHome: vi.fn(),
    getUserItems: vi.fn(),
  },
}));

vi.mock('../item.mappers.js', () => ({
  ItemMapper: {
    toPaginatedItemsResponse: vi.fn(),
    toItemDetailsResponse: vi.fn(),
    toUserItemsFromHomeResponse: vi.fn(),
    toUserItemsResponse: vi.fn(),
  },
}));

describe('ItemService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const filters = {
    search: '  axe  ',
    category: undefined,
    state: undefined,
    advancedFilter: undefined,
  } as GetItemsFilters;

  describe('get', () => {
    it('should return paginated items', async () => {
      const data = {
        items: [{ id: 1 }, { id: 2 }],
        totalItems: 20,
      } as never;

      const mappedResult = {
        items: [{ id: 1 }, { id: 2 }],
        pagination: {
          totalItems: 20,
          totalPages: 10,
          page: 1,
          limit: 2,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      } as never;

      vi.mocked(ItemRepository.get).mockResolvedValue(data);

      vi.mocked(ItemMapper.toPaginatedItemsResponse)
        .mockReturnValue(mappedResult);

      const result = await ItemService.get(1, 2, filters);

      expect(ItemRepository.get).toHaveBeenCalledWith(
        1,
        2,
        {
          ...filters,
          search: 'axe',
        },
      );

      expect(ItemMapper.toPaginatedItemsResponse)
        .toHaveBeenCalledWith(1, 2, data);

      expect(result).toEqual(mappedResult);
    });

    it('should normalize page and limit', async () => {
      const data = {
        items: [],
        totalItems: 0,
      } as never;

      vi.mocked(ItemRepository.get).mockResolvedValue(data);
      vi.mocked(ItemMapper.toPaginatedItemsResponse)
        .mockReturnValue({} as never);

      await ItemService.get(0, 150, filters);

      expect(ItemRepository.get).toHaveBeenCalledWith(
        1,
        100,
        expect.any(Object),
      );
    });

    it('should use undefined when search is empty or contains only spaces', async () => {
      const emptySearchFilters = {
        search: '   ',
      } as GetItemsFilters;

      vi.mocked(ItemRepository.get)
        .mockResolvedValue({ items: [], totalItems: 0 } as never);

      vi.mocked(ItemMapper.toPaginatedItemsResponse)
        .mockReturnValue({} as never);

      await ItemService.get(1, 10, emptySearchFilters);

      expect(ItemRepository.get).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({
          search: undefined,
        }),
      );
    });

    it('should propagate repository errors', async () => {
      vi.mocked(ItemRepository.get)
        .mockRejectedValue(new Error('Database error'));

      await expect(
        ItemService.get(1, 10, filters),
      ).rejects.toThrow('Database error');

      expect(ItemMapper.toPaginatedItemsResponse)
        .not.toHaveBeenCalled();
    });
  });

  describe('getContactItems', () => {
    it('should return contact items with pagination', async () => {
      const data = {
        items: [{ id: 1 }],
        totalItems: 5,
      } as never;

      const mappedResult = {
        items: [{ id: 1 }],
        pagination: {},
      } as never;

      vi.mocked(ItemRepository.get).mockResolvedValue(data);

      vi.mocked(ItemMapper.toPaginatedItemsResponse)
        .mockReturnValue(mappedResult);

      const result = await ItemService.getContactItems(
        20,
        2,
        10,
        filters,
      );

      expect(ItemRepository.get).toHaveBeenCalledWith(
        2,
        10,
        expect.objectContaining({
          search: 'axe',
        }),
        20,
      );

      expect(ItemMapper.toPaginatedItemsResponse)
        .toHaveBeenCalledWith(2, 10, data);

      expect(result).toEqual(mappedResult);
    });

    it('should normalize page and limit', async () => {
      vi.mocked(ItemRepository.get)
        .mockResolvedValue({ items: [], totalItems: 0 } as never);

      vi.mocked(ItemMapper.toPaginatedItemsResponse)
        .mockReturnValue({} as never);

      await ItemService.getContactItems(20, 0, 150, filters);

      expect(ItemRepository.get).toHaveBeenCalledWith(
        1,
        100,
        expect.any(Object),
        20,
      );
    });

    it('should propagate repository errors', async () => {
      vi.mocked(ItemRepository.get)
        .mockRejectedValue(new Error('Database error'));

      await expect(
        ItemService.getContactItems(20, 1, 10, filters),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getItemDetails', () => {
    it('should throw 401 when user is not authenticated', async () => {
      await expect(
        ItemService.getItemDetails(1, 0),
      ).rejects.toThrow(APIError);

      expect(ItemRepository.getItemDetails).not.toHaveBeenCalled();
    });

    it('should throw 400 when item ID is invalid', async () => {
      await expect(
        ItemService.getItemDetails(0, 10),
      ).rejects.toThrow(APIError);

      expect(ItemRepository.getItemDetails).not.toHaveBeenCalled();
    });

    it('should throw 404 when item does not exist', async () => {
      vi.mocked(ItemRepository.getItemDetails)
        .mockResolvedValue(null);

      await expect(
        ItemService.getItemDetails(1, 10),
      ).rejects.toThrow(APIError);

      expect(ItemRepository.getItemDetails)
        .toHaveBeenCalledWith(1, 10);
    });

    it('should return mapped item details', async () => {
      const data = { id: 1 } as never;
      const mappedResult = { id: 1, name: 'Fire Axe' } as never;

      vi.mocked(ItemRepository.getItemDetails)
        .mockResolvedValue(data);

      vi.mocked(ItemMapper.toItemDetailsResponse)
        .mockReturnValue(mappedResult);

      const result = await ItemService.getItemDetails(1, 10);

      expect(ItemMapper.toItemDetailsResponse)
        .toHaveBeenCalledWith(data);

      expect(result).toEqual(mappedResult);
    });
  });

  describe('updateUserItemUnits', () => {
    it('should throw 401 when user is not authenticated', async () => {
      await expect(
        ItemService.updateUserItemUnits(1, 5, 0),
      ).rejects.toThrow(APIError);

      expect(ItemRepository.updateUserItemUnits).not.toHaveBeenCalled();
    });

    it('should throw 400 when item ID is invalid', async () => {
      await expect(
        ItemService.updateUserItemUnits(0, 5, 10),
      ).rejects.toThrow(APIError);
    });

    it('should throw 400 when units are null', async () => {
      await expect(
        ItemService.updateUserItemUnits(1, null as never, 10),
      ).rejects.toThrow(APIError);
    });

    it.each([
      [-1, 'negative units'],
      [1.5, 'fractional units'],
      [2147483648, 'units above the maximum'],
      [Number.MAX_SAFE_INTEGER + 1, 'unsafe integer'],
      [NaN, 'NaN'],
      [Infinity, 'Infinity'],
    ])('should reject invalid units: %s (%s)', async (units) => {
      await expect(
        ItemService.updateUserItemUnits(1, units, 10),
      ).rejects.toThrow(APIError);
    });

    it('should throw 404 when item does not exist', async () => {
      vi.mocked(ItemRepository.updateUserItemUnits)
        .mockResolvedValue(null as never);

      await expect(
        ItemService.updateUserItemUnits(1, 5, 10),
      ).rejects.toThrow(APIError);

      expect(ItemRepository.updateUserItemUnits)
        .toHaveBeenCalledWith(1, 5, 10);
    });

    it('should update units and return the item name', async () => {
      const repositoryResult = {
        units: 5,
        item: {
          name: 'Fire Axe',
        },
      } as never;

      vi.mocked(ItemRepository.updateUserItemUnits)
        .mockResolvedValue(repositoryResult);

      const result = await ItemService.updateUserItemUnits(1, 5, 10);

      expect(ItemRepository.updateUserItemUnits)
        .toHaveBeenCalledWith(1, 5, 10);

      expect(result).toEqual({
        units: 5,
        name: 'Fire Axe',
      });
    });

    it('should accept zero units', async () => {
      vi.mocked(ItemRepository.updateUserItemUnits)
        .mockResolvedValue({
          units: 0,
          item: { name: 'Fire Axe' },
        } as never);

      const result = await ItemService.updateUserItemUnits(1, 0, 10);

      expect(result.units).toBe(0);
    });

    it('should accept the maximum allowed units', async () => {
      vi.mocked(ItemRepository.updateUserItemUnits)
        .mockResolvedValue({
          units: 2147483647,
          item: { name: 'Fire Axe' },
        } as never);

      const result = await ItemService.updateUserItemUnits(
        1,
        2147483647,
        10,
      );

      expect(result.units).toBe(2147483647);
    });
  });

  describe('getUserItemsFromHome', () => {
    it('should throw 401 when user is not authenticated', async () => {
      await expect(
        ItemService.getUserItemsFromHome(0),
      ).rejects.toThrow(APIError);

      expect(ItemRepository.getUserItemsFromHome).not.toHaveBeenCalled();
    });

    it('should throw 404 when repository returns no result', async () => {
      vi.mocked(ItemRepository.getUserItemsFromHome)
        .mockResolvedValue(null as never);

      await expect(
        ItemService.getUserItemsFromHome(10),
      ).rejects.toThrow(APIError);
    });

    it('should return mapped home items', async () => {
      const data = { items: [], totalItems: 0 } as never;
      const mappedResult = { items: [], totalItems: 0 } as never;

      vi.mocked(ItemRepository.getUserItemsFromHome)
        .mockResolvedValue(data);

      vi.mocked(ItemMapper.toUserItemsFromHomeResponse)
        .mockReturnValue(mappedResult);

      const result = await ItemService.getUserItemsFromHome(10);

      expect(ItemRepository.getUserItemsFromHome)
        .toHaveBeenCalledWith(10);

      expect(ItemMapper.toUserItemsFromHomeResponse)
        .toHaveBeenCalledWith(data);

      expect(result).toEqual(mappedResult);
    });
  });

  describe('getUserItems', () => {
    it('should throw 401 when user is not authenticated', async () => {
      await expect(
        ItemService.getUserItems(0, 1, 10, filters),
      ).rejects.toThrow(APIError);

      expect(ItemRepository.getUserItems).not.toHaveBeenCalled();
    });

    it('should return user items with pagination', async () => {
      const items = [{ id: 1 }, { id: 2 }] as never;
      const normalizedItems = [{ id: 1 }, { id: 2 }] as never;

      vi.mocked(ItemRepository.getUserItems).mockResolvedValue({
        items,
        totalItems: 25,
      } as never);

      vi.mocked(ItemMapper.toUserItemsResponse)
        .mockReturnValue(normalizedItems);

      const result = await ItemService.getUserItems(
        10,
        2,
        10,
        filters,
      );

      expect(ItemRepository.getUserItems).toHaveBeenCalledWith(
        10,
        2,
        10,
        expect.objectContaining({
          search: 'axe',
        }),
      );

      expect(ItemMapper.toUserItemsResponse)
        .toHaveBeenCalledWith(items);

      expect(result).toEqual({
        items: normalizedItems,
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

    it('should normalize page and limit', async () => {
      vi.mocked(ItemRepository.getUserItems).mockResolvedValue({
        items: [],
        totalItems: 0,
      } as never);

      vi.mocked(ItemMapper.toUserItemsResponse)
        .mockReturnValue([]);

      await ItemService.getUserItems(10, 0, 150, filters);

      expect(ItemRepository.getUserItems).toHaveBeenCalledWith(
        10,
        1,
        100,
        expect.any(Object),
      );
    });

    it('should propagate repository errors', async () => {
      vi.mocked(ItemRepository.getUserItems)
        .mockRejectedValue(new Error('Database error'));

      await expect(
        ItemService.getUserItems(10, 1, 10, filters),
      ).rejects.toThrow('Database error');

      expect(ItemMapper.toUserItemsResponse).not.toHaveBeenCalled();
    });
  });
});
