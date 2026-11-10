import type { PaginatedResponse } from "@shared/dtos/pagination.dto.js";
import { ItemRepository } from "./item.repository.js";
import type { GetItemsFilters } from "@shared/maps/filters/items/getItems.type.js";
import type { ItemDetailsResponse, ItemResponse, UpdateUserItemUnitsResponse, UserItemFromHomeResponse, UserItemResponse } from "@shared/dtos/item.dto.js";
import { APIError } from "@backend/middlewares/error.middleware.js";
import { ItemMapper } from "./item.mappers.js";

export class ItemService {
  
  public static async get(
    page    : number,
    limit   : number,
    filters : GetItemsFilters,
  ): Promise<PaginatedResponse<ItemResponse>> {

    const currentPage = Math.max(1, Math.floor(page));
    const pageSize = Math.min(100, Math.max(1, Math.floor(limit)));

    const normalizedFilters: GetItemsFilters = {
      ...filters,
      search: filters.search?.trim() || undefined,
    };

    const { items, totalItems } = await ItemRepository.get(
      currentPage,
      pageSize,
      normalizedFilters,
    );

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items: items.map(item => ({
        ...item,
        originalPrice: item.originalPrice ?? -1,
      })),

      pagination: {
        totalItems,
        totalPages,
        page            : currentPage,
        limit           : pageSize,
        hasNextPage     : currentPage < totalPages,
        hasPreviousPage : currentPage > 1,
      },
    };
  }



  public static async getContactItems(
    contactId : number,
    page      : number,
    limit     : number,
    filters   : GetItemsFilters,
  ): Promise<PaginatedResponse<UserItemResponse>> {

    const currentPage = Math.max(1, Math.floor(page));
    const pageSize = Math.min(100, Math.max(1, Math.floor(limit)));

    const normalizedFilters: GetItemsFilters = {
      ...filters,
      search: filters.search?.trim() || undefined,
    };

    const { items, totalItems } = await ItemRepository.get(
      currentPage,
      pageSize,
      normalizedFilters,
      contactId,
    );

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items,
      pagination: {
        totalItems,
        totalPages,
        page            : currentPage,
        limit           : pageSize,
        hasNextPage     : currentPage < totalPages,
        hasPreviousPage : currentPage > 1,
      },
    };
  }



  public static async getItemDetails(
    itemId : number,
    userId : number,
  ): Promise<ItemDetailsResponse> {
    if (!userId) {
      throw new APIError(401, "User not authenticated");
    }  if (!itemId) {
      throw new APIError(400, "Unable to find item details");
    }

    const result = await ItemRepository.getItemDetails(itemId, userId);

    if (!result) {
      throw new APIError(404, 'Item not found.');
    }

    return ItemMapper.toItemDetailsResponse(result);
  }



  public static async updateUserItemUnits(
    itemId : number,
    units  : number,
    userId : number,
  ): Promise<UpdateUserItemUnitsResponse> {
     if (!userId) {
      throw new APIError(401, "User not authenticated");
    } if (!itemId) {
      throw new APIError(400, "Unable to find item details");
    } if (units === null) {
      throw new APIError(400, "No units was provided.");
    }

    const result = await ItemRepository.updateUserItemUnits(itemId, units, userId);

    if (!result) {
      throw new APIError(404, 'Unable to update units due item not be founded.');
    }

    return { 
      units : result.units,
      name  : result.item.name, 
    };
  }



  public static async getUserItemsFromHome(
    userId : number,
  ): Promise<UserItemFromHomeResponse> {
     if (!userId) {
      throw new APIError(401, "User not authenticated");
    } 

    const result = await ItemRepository.getUserItemsFromHome(userId);

    if (!result) {
      throw new APIError(404, 'Unable to update units due item not be founded.');
    }

    return ItemMapper.toUserItemsFromHomeResponse(result);
  }



  public static async getUserItems(
    userId  : number,
    page    : number,
    limit   : number,
    filters : GetItemsFilters,
  ): Promise<PaginatedResponse<UserItemResponse>> {

    if (!userId) {
      throw new APIError(401, "User not authenticated");
    }

    const currentPage = Math.max(1, Math.floor(page));
    const pageSize = Math.min(100, Math.max(1, Math.floor(limit)));

    const normalizedFilters: GetItemsFilters = {
      ...filters,
      search: filters.search?.trim() || undefined,
    };

    const { items, totalItems } = await ItemRepository.getUserItems(
      userId,
      currentPage,
      pageSize,
      normalizedFilters,
    );

    const totalPages = Math.ceil(totalItems / pageSize);
    const normalizedItems = ItemMapper.toUserItemsResponse(items);

    return {
      items: normalizedItems,

      pagination: {
        totalItems,
        totalPages,
        page            : currentPage,
        limit           : pageSize,
        hasNextPage     : currentPage < totalPages,
        hasPreviousPage : currentPage > 1,
      },
    };
  }
}