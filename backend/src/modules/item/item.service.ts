import { ItemRepository } from "./item.repository.js";
import type { GetItemsFilters } from "@shared/filters/items/getItems.type.js";

export class ItemService {
  
  public static async get(
    page    : number,
    limit   : number,
    filters : GetItemsFilters,
  ) {

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
}