
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

import { ItemController } from '../item.controller.js';
import { ItemService } from '../item.service.js';

import type { GetItemsQuery } from '@shared/schemas/item.schema.js';

vi.mock('../item.service.js', () => ({
  ItemService: {
    get: vi.fn(),
    getContactItems: vi.fn(),
    getItemDetails: vi.fn(),
    updateUserItemUnits: vi.fn(),
    getUserItemsFromHome: vi.fn(),
    getUserItems: vi.fn(),
  },
}));

describe('ItemController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(data: {
    authUserId?: number | string;
    params?: Record<string, string>;
    body?: Record<string, unknown>;
  } = {}) {
    return {
      authUserId: data.authUserId,
      params: data.params ?? {},
      body: data.body ?? {},
    } as unknown as Request;
  }

  function createResponse(query?: GetItemsQuery) {
    return {
      locals: {
        validatedData: query,
      },
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
  }

  describe('get', () => {
    it('should return items with status 200', async () => {
      const query = {
        page: 1,
        limit: 10,
        search: 'axe',
      } as GetItemsQuery;

      const result = {
        items: [{ id: 1 }],
        pagination: {},
      };

      const req = createRequest();
      const res = createResponse(query);

      vi.mocked(ItemService.get).mockResolvedValue(result as never);

      await ItemController.get(req, res);

      expect(ItemService.get).toHaveBeenCalledWith(
        1,
        10,
        {
          search: 'axe',
          category: undefined,
          state: undefined,
          advancedFilter: undefined,
        },
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
  });

  describe('getContactItems', () => {
    it('should return contact items with status 200', async () => {
      const query = {
        page: 1,
        limit: 10,
        search: 'axe',
      } as GetItemsQuery;

      const result = {
        items: [{ id: 1 }],
        pagination: {},
      };

      const req = createRequest({
        params: { id: '20' },
      });

      const res = createResponse(query);

      vi.mocked(ItemService.getContactItems)
        .mockResolvedValue(result as never);

      await ItemController.getContactItems(req, res);

      expect(ItemService.getContactItems).toHaveBeenCalledWith(
        20,
        1,
        10,
        {
          search: 'axe',
          category: undefined,
          state: undefined,
          advancedFilter: undefined,
        },
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
  });

  describe('getItemDetails', () => {
    it('should return item details with status 200', async () => {
      const result = {
        id: 1,
        name: 'Fire Axe',
      };

      const req = createRequest({
        params: { id: '1' },
        authUserId: 10,
      });

      const res = createResponse();

      vi.mocked(ItemService.getItemDetails)
        .mockResolvedValue(result as never);

      await ItemController.getItemDetails(req, res);

      expect(ItemService.getItemDetails)
        .toHaveBeenCalledWith(1, 10);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
  });

  describe('updateUserItemUnits', () => {
    it('should update item units and return success response', async () => {
      const result = {
        units: 5,
        name: 'Fire Axe',
      };

      const req = createRequest({
        params: { id: '1' },
        authUserId: 10,
        body: { units: 5 },
      });

      const res = createResponse();

      vi.mocked(ItemService.updateUserItemUnits)
        .mockResolvedValue(result);

      await ItemController.updateUserItemUnits(req, res);

      expect(ItemService.updateUserItemUnits)
        .toHaveBeenCalledWith(1, 5, 10);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        body: result,
        message: 'Fire Axe units successfully updated',
        success: true,
      });
    });

    it('should convert units to number', async () => {
      const req = createRequest({
        params: { id: '1' },
        authUserId: '10',
        body: { units: '25' },
      });

      const res = createResponse();

      vi.mocked(ItemService.updateUserItemUnits)
        .mockResolvedValue({
          units: 25,
          name: 'Fire Axe',
        });

      await ItemController.updateUserItemUnits(req, res);

      expect(ItemService.updateUserItemUnits)
        .toHaveBeenCalledWith(1, 25, 10);
    });
  });

  describe('getUserItemsFromHome', () => {
    it('should return user home items with status 200', async () => {
      const result = {
        items: [{ id: 1, units: 5 }],
        totalItems: 1,
      };

      const req = createRequest({
        authUserId: 10,
      });

      const res = createResponse();

      vi.mocked(ItemService.getUserItemsFromHome)
        .mockResolvedValue(result as never);

      await ItemController.getUserItemsFromHome(req, res);

      expect(ItemService.getUserItemsFromHome)
        .toHaveBeenCalledWith(10);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
  });

  describe('getUserItems', () => {
    it('should return user items with status 200', async () => {
      const query = {
        page: 2,
        limit: 10,
        search: 'axe',
      } as GetItemsQuery;

      const result = {
        items: [{ id: 1 }],
        pagination: {},
      };

      const req = createRequest({
        authUserId: 10,
      });

      const res = createResponse(query);

      vi.mocked(ItemService.getUserItems)
        .mockResolvedValue(result as never);

      await ItemController.getUserItems(req, res);

      expect(ItemService.getUserItems).toHaveBeenCalledWith(
        10,
        2,
        10,
        {
          search: 'axe',
          category: undefined,
          state: undefined,
          advancedFilter: undefined,
        },
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const req = createRequest({
        authUserId: 10,
      });

      const res = createResponse({
        page: 1,
        limit: 10,
      } as GetItemsQuery);

      vi.mocked(ItemService.getUserItems)
        .mockRejectedValue(new Error('Service error'));

      await expect(
        ItemController.getUserItems(req, res),
      ).rejects.toThrow('Service error');

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
