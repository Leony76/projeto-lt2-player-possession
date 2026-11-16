import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUpdateParams } from "../useUpdateParams.hook";
import type { ItemResponse } from "@shared/dtos/item.dto";
import type { PaginatedResponse } from "@shared/dtos/pagination.dto";
import type { ItemsAdvancedFilter } from "@shared/maps/filters/items/items.filter";
import type { ItemsCategory } from "@shared/maps/filters/items/itemCategory.map";
import type { ItemsState } from "@shared/maps/filters/items/itemState.map";
import { ItemService } from "@/services/item.service";
import { normalizeFilter } from "@/utils/normalizaFilter.util";
import { ITEMS_PER_PAGE } from "@/consts/itemsPerPage.const";
import { handleAxiosError } from "@/utils/handleAxiosError.util";

export const useItems = () => {

  const [items, setItems] = useState<ItemResponse[]>([]);

  const [pagination, setPagination] = useState<
    PaginatedResponse<ItemResponse>["pagination"] | null>(null)
  ;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const { updateParams } = useUpdateParams(setSearchParams);

  const search = searchParams.get('search') ?? '';
  const page = Number(searchParams.get('page') ?? 1);

  const itemsAdvancedFilter = (searchParams.get('advancedFilter') ?? null) as ItemsAdvancedFilter | null;
  const itemsCategoryFilter =  (searchParams.get('category') ?? null) as ItemsCategory | null;
  const itemsStateFilter = (searchParams.get('state') ?? null) as ItemsState | null;

  

  const handleSearch = useCallback((value: string): void => {
    updateParams({
      search : value || null,
      page   : '1',
    });
  }, [updateParams]);



  const handleCategoryFilter = (filter: ItemsCategory): void => {
    updateParams({
      category : filter === '_' ? null : filter,
      page     : '1',
    });
  };



  const handleStateFilter = (filter: ItemsState): void => {
    updateParams({
      state : filter === '_' ? null : filter,
      page  : '1',
    });
  };



  const handleAdvancedFilter = (filter: ItemsAdvancedFilter): void => {
    updateParams({
      advancedFilter : filter === '_' ? null : filter,
      page           : '1',
    });
  };



  const handlePage = (newPage: number): void => {
    updateParams({
      page: String(newPage),
    });
  };



  useEffect(() => {

    const controller = new AbortController();

    const loadItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await ItemService.get({
          page,
          limit          : ITEMS_PER_PAGE,
          search         : search || undefined,
          category       : normalizeFilter(itemsCategoryFilter),
          state          : normalizeFilter(itemsStateFilter),
          advancedFilter : normalizeFilter(itemsAdvancedFilter),
        }, controller.signal);

        setItems(result.items);
        setPagination(result.pagination);

      } catch (error:unknown) {
        if (!controller.signal.aborted) setError(handleAxiosError(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadItems();

    return () => controller.abort();

  }, [
    page,
    search,
    itemsCategoryFilter,
    itemsStateFilter,
    itemsAdvancedFilter,
  ]);



  return {
    states: {
      items,
      loading,
      pagination,
      error,
      itemsAdvancedFilter,
      itemsCategoryFilter,
      itemsStateFilter,
      page,
      search,
    },

    handlers: {
      handleSearch,
      handleCategoryFilter,
      handleStateFilter,
      handleAdvancedFilter,
      handlePage,
    },
  }
}